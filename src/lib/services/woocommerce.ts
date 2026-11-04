import { Effect, Schema } from 'effect';
import {
  ProductsListSchema,
  ProductCategorySchema,
  type Product,
  type ProductCategory,
} from '../schema/product';
import { PagesListSchema, type WpPage } from '../schema/page';
import { PostSchema, type Post } from '../schema/post';

const PostsListSchema = Schema.Array(PostSchema);

const API_BASE = 'https://donghocodien.com/wp-json/wc/store/v1';
const WP_API_BASE = 'https://donghocodien.com/wp-json/wp/v2';

export class NetworkError extends Schema.TaggedError<NetworkError, { readonly brand: unique symbol }>()('NetworkError', {
  message: Schema.String,
}) {}

export class HttpError extends Schema.TaggedError<HttpError, { readonly brand: unique symbol }>()('HttpError', {
  status: Schema.Finite,
  statusText: Schema.String,
  url: Schema.String,
}) {}

export class ProductNotFoundError extends Schema.TaggedError<ProductNotFoundError, { readonly brand: unique symbol }>()('ProductNotFoundError', {
  slug: Schema.String,
}) {}

export interface GetProductsParams {
  page?: number;
  per_page?: number;
  category?: number;
  search?: string;
  min_price?: number;
  max_price?: number;
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
    if (params.min_price !== undefined) url.searchParams.set('min_price', String(params.min_price));
    if (params.max_price !== undefined) url.searchParams.set('max_price', String(params.max_price));
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
      catch: (cause) => new NetworkError({ message: String(cause) }),
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
      catch: (cause) => new NetworkError({ message: String(cause) }),
    });

    const products = yield* Schema.decodeUnknownEffect(ProductsListSchema)(raw);
    cache.set(cacheKey, { data: products, timestamp: Date.now() });
    return products;
  }).pipe(
    Effect.retry({ times: 2 }),
    Effect.timeout('30 seconds')
  );

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000;

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
      catch: (cause) => new NetworkError({ message: String(cause) }),
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
      catch: (cause) => new NetworkError({ message: String(cause) }),
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

const MAX_CATEGORY_PAGES = 5;

export const getCategories = Effect.gen(function* () {
  const cacheKey = 'categories:all';
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data as ProductCategory[];
  }

  const fetchCategoryPage = (page: number) =>
    Effect.tryPromise({
      try: () =>
        fetch(`${API_BASE}/products/categories?per_page=100&page=${page}`, {
          headers: {
            Accept: 'application/json',
          },
        }),
      catch: (cause) => new NetworkError({ message: String(cause) }),
    });

  const decodePage = (raw: unknown) =>
    Schema.decodeUnknownEffect(Schema.Array(ProductCategorySchema))(raw);

  const firstResponse = yield* fetchCategoryPage(1);
  if (!firstResponse.ok) {
    return yield* new HttpError({
      status: firstResponse.status,
      statusText: firstResponse.statusText,
      url: firstResponse.url,
    });
  }

  const totalPages = Number(firstResponse.headers.get('x-wp-totalpages') || '1');
  const firstRaw = yield* Effect.tryPromise({
    try: () => firstResponse.json(),
    catch: (cause) => new NetworkError({ message: String(cause) }),
  });
  const categories = [...(yield* decodePage(firstRaw))];

  for (let page = 2; page <= Math.min(totalPages, MAX_CATEGORY_PAGES); page++) {
    const response = yield* fetchCategoryPage(page);
    if (!response.ok) {
      return yield* new HttpError({
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      });
    }
    const raw = yield* Effect.tryPromise({
      try: () => response.json(),
      catch: (cause) => new NetworkError({ message: String(cause) }),
    });
    categories.push(...(yield* decodePage(raw)));
  }

  cache.set(cacheKey, { data: categories, timestamp: Date.now() });
  return categories;
}).pipe(
  Effect.retry({ times: 2 }),
  Effect.timeout('30 seconds')
);

export class PageNotFoundError extends Schema.TaggedError<PageNotFoundError, { readonly brand: unique symbol }>()('PageNotFoundError', {
  slug: Schema.String,
}) {}

export const getPageBySlug = (slug: string) =>
  Effect.gen(function* () {
    const cacheKey = `page:${slug}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data as WpPage;
    }

    const url = `${WP_API_BASE}/pages?slug=${encodeURIComponent(slug)}`;

    const response = yield* Effect.tryPromise({
      try: () =>
        fetch(url, {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'DongHoCoDien-Headless/1.0',
          },
        }),
      catch: (cause) => new NetworkError({ message: String(cause) }),
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
      catch: (cause) => new NetworkError({ message: String(cause) }),
    });

    const pages = yield* Schema.decodeUnknownEffect(PagesListSchema)(raw);
    const page = pages[0];

    if (!page) {
      return yield* new PageNotFoundError({ slug });
    }

    cache.set(cacheKey, { data: page, timestamp: Date.now() });
    return page;
  }).pipe(
    Effect.retry({ times: 2 }),
    Effect.timeout('30 seconds')
  );

export class PostNotFoundError extends Schema.TaggedError<PostNotFoundError, { readonly brand: unique symbol }>()('PostNotFoundError', {
  slug: Schema.String,
}) {}

export interface GetPostsParams {
  per_page?: number;
  page?: number;
}

export const getPosts = (params: GetPostsParams = {}) =>
  Effect.gen(function* () {
    const { per_page = 10, page = 1 } = params;
    const cacheKey = `posts:${page}:${per_page}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data as Post[];
    }

    const query = new URLSearchParams({
      per_page: String(per_page),
      page: String(page),
      _embed: '1',
    });

    const url = `${WP_API_BASE}/posts?${query.toString()}`;

    const response = yield* Effect.tryPromise({
      try: () =>
        fetch(url, {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'DongHoCoDien-Headless/1.0',
          },
        }),
      catch: (cause) => new NetworkError({ message: String(cause) }),
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
      catch: (cause) => new NetworkError({ message: String(cause) }),
    });

    const posts = yield* Schema.decodeUnknownEffect(PostsListSchema)(raw);
    cache.set(cacheKey, { data: posts, timestamp: Date.now() });
    return posts;
  }).pipe(
    Effect.retry({ times: 2 }),
    Effect.timeout('30 seconds')
  );

export const getPostBySlug = (slug: string) =>
  Effect.gen(function* () {
    const cacheKey = `post:${slug}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data as Post;
    }

    const url = `${WP_API_BASE}/posts?slug=${encodeURIComponent(slug)}&_embed=1`;

    const response = yield* Effect.tryPromise({
      try: () =>
        fetch(url, {
          headers: {
            Accept: 'application/json',
            'User-Agent': 'DongHoCoDien-Headless/1.0',
          },
        }),
      catch: (cause) => new NetworkError({ message: String(cause) }),
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
      catch: (cause) => new NetworkError({ message: String(cause) }),
    });

    const posts = yield* Schema.decodeUnknownEffect(PostsListSchema)(raw);
    const post = posts[0];

    if (!post) {
      return yield* new PostNotFoundError({ slug });
    }

    cache.set(cacheKey, { data: post, timestamp: Date.now() });
    return post;
  }).pipe(
    Effect.retry({ times: 2 }),
    Effect.timeout('30 seconds')
  );
