import { Effect, Schema } from 'effect';
import {
  ProductSchema,
  ProductsListSchema,
  ProductCategorySchema,
  type Product,
  type ProductCategory,
} from '../schema/product';

const API_BASE = 'https://donghocodien.com/wp-json/wc/store/v1';

// Typed Domain Errors
export class NetworkError extends Schema.TaggedError<NetworkError>()('NetworkError', {
  cause: Schema.Defect,
}) {}

export class HttpError extends Schema.TaggedError<HttpError>()('HttpError', {
  status: Schema.Finite,
  statusText: Schema.String,
  url: Schema.String,
}) {}

export class ProductNotFoundError extends Schema.TaggedError<ProductNotFoundError>()('ProductNotFoundError', {
  slug: Schema.String,
}) {}

// Fetch Products List
export interface GetProductsParams {
  page?: number;
  per_page?: number;
  category?: number;
  search?: string;
  order?: 'asc' | 'desc';
  orderby?: 'date' | 'price' | 'title';
}

export const getProducts = (params: GetProductsParams = {}) =>
  Effect.gen(function* () {
    const url = new URL(`${API_BASE}/products`);
    if (params.page) url.searchParams.set('page', String(params.page));
    if (params.per_page) url.searchParams.set('per_page', String(params.per_page));
    if (params.category) url.searchParams.set('category', String(params.category));
    if (params.search) url.searchParams.set('search', params.search);
    if (params.order) url.searchParams.set('order', params.order);
    if (params.orderby) url.searchParams.set('orderby', params.orderby);

    const cacheKey = `products:${url.search}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data as Product[];
    }

    const response = yield* Effect.tryPromise({
      try: () =>
        fetch(url.toString(), {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'DongHoCoDien-Headless/1.0',
          },
        }),
      catch: (cause) => new NetworkError({ cause }),
    });

    if (!response.ok) {
      return yield* new HttpError({
        status: response.status,
        statusText: response.statusText,
        url: url.toString(),
      });
    }

    const raw = yield* Effect.tryPromise({
      try: () => response.json(),
      catch: (cause) => new NetworkError({ cause }),
    });

    const products = yield* Schema.decodeUnknownEffect(ProductsListSchema)(raw);
    cache.set(cacheKey, { data: products, timestamp: Date.now() });
    return products;
  }).pipe(
    Effect.retry({ times: 2 }),
    Effect.timeout('30 seconds')
  );

// Fetch Single Product by Slug
// In-memory cache for fast subsequent page loads
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export const getProductBySlug = (slug: string) =>
  Effect.gen(function* () {
    const cacheKey = `product:${slug}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data as Product;
    }

    const url = `${API_BASE}/products?slug=${encodeURIComponent(slug)}`;

    const response = yield* Effect.tryPromise({
      try: () =>
        fetch(url, {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'DongHoCoDien-Headless/1.0',
          },
        }),
      catch: (cause) => new NetworkError({ cause }),
    });

    if (!response.ok) {
      return yield* new HttpError({
        status: response.status,
        statusText: response.statusText,
        url,
      });
    }

    const raw = yield* Effect.tryPromise({
      try: () => response.json(),
      catch: (cause) => new NetworkError({ cause }),
    });

    const products = yield* Schema.decodeUnknownEffect(ProductsListSchema)(raw);
    const product = products[0];

    if (!product) {
      return yield* new ProductNotFoundError({ slug });
    }

    cache.set(cacheKey, { data: product, timestamp: Date.now() });
    return product;
  }).pipe(
    Effect.retry({ times: 2 }),
    Effect.timeout('30 seconds')
  );

// Fetch Categories List (Effect is already lazy)
export const getCategories = Effect.gen(function* () {
  const url = `${API_BASE}/products/categories?per_page=100`;

  const response = yield* Effect.tryPromise({
    try: () =>
      fetch(url, {
        headers: {
          Accept: 'application/json',
        },
      }),
    catch: (cause) => new NetworkError({ cause }),
  });

  if (!response.ok) {
    return yield* new HttpError({
      status: response.status,
      statusText: response.statusText,
      url,
    });
  }

  const raw = yield* Effect.tryPromise({
    try: () => response.json(),
    catch: (cause) => new NetworkError({ cause }),
  });

  return yield* Schema.decodeUnknownEffect(Schema.Array(ProductCategorySchema))(raw);
}).pipe(
  Effect.retry({ times: 2 }),
  Effect.timeout('30 seconds')
);
