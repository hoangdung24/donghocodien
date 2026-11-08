import { Effect, Schema } from 'effect';
import {
  ProductsListSchema,
  ProductCategorySchema,
  type Product,
  type ProductCategory,
} from '@/lib/schema/product';
import { PagesListSchema, type WpPage } from '@/lib/schema/page';
import { fetchJsonWithTimeout } from '@/lib/services/httpClient';
import { brandCategories, type BrandCategory } from '@/lib/utils/categories';

const API_BASE = 'https://cms.donghocodien.com/wp-json/wc/store/v1';
const WP_API_BASE = 'https://cms.donghocodien.com/wp-json/wp/v2';

export class NetworkError extends Schema.TaggedError<
  NetworkError,
  { readonly brand: unique symbol }
>()('NetworkError', {
  message: Schema.String,
}) {}

export class HttpError extends Schema.TaggedError<HttpError, { readonly brand: unique symbol }>()(
  'HttpError',
  {
    status: Schema.Finite,
    statusText: Schema.String,
    url: Schema.String,
  }
) {}

export class ProductNotFoundError extends Schema.TaggedError<
  ProductNotFoundError,
  { readonly brand: unique symbol }
>()('ProductNotFoundError', {
  slug: Schema.String,
}) {}

export interface GetProductsParams {
  page?: number;
  per_page?: number;
  category?: number | number[];
  search?: string;
  min_price?: number;
  max_price?: number;
  stock_status?: 'instock' | 'outofstock' | 'onbackorder';
  order?: 'asc' | 'desc';
  orderby?: 'date' | 'price' | 'title';
}

const formatCategoryParam = (category: number | number[] | undefined): string | undefined => {
  if (category === undefined) return undefined;
  const categoryIds = Array.isArray(category) ? category : [category];
  const usableIds = categoryIds.filter((categoryId) => Number.isFinite(categoryId));
  return usableIds.length > 0 ? usableIds.join(',') : undefined;
};

export interface ProductPage {
  products: Product[];
  total: number;
  totalPages: number;
}

const buildProductsUrl = (params: GetProductsParams): URL => {
  const url = new URL(`${API_BASE}/products`);
  if (params.page) url.searchParams.set('page', String(params.page));
  if (params.per_page) url.searchParams.set('per_page', String(params.per_page));
  const categoryParam = formatCategoryParam(params.category);
  if (categoryParam) url.searchParams.set('category', categoryParam);
  if (params.search) url.searchParams.set('search', params.search);
  if (params.min_price !== undefined) url.searchParams.set('min_price', String(params.min_price));
  if (params.max_price !== undefined) url.searchParams.set('max_price', String(params.max_price));
  if (params.stock_status) url.searchParams.set('stock_status', params.stock_status);
  if (params.order) url.searchParams.set('order', params.order);
  if (params.orderby) url.searchParams.set('orderby', params.orderby);
  return url;
};

export const getProductsPage = (params: GetProductsParams = {}) =>
  Effect.gen(function* () {
    const url = buildProductsUrl(params);
    const cacheKey = `product-page:${url.search}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data as ProductPage;
    }

    const response = yield* Effect.tryPromise({
      try: () => fetchJsonWithTimeout(url.toString()),
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
    const reportedTotal = Number(response.headers.get('x-wp-total'));
    const reportedPages = Number(response.headers.get('x-wp-totalpages'));
    const page = {
      products,
      total: Number.isFinite(reportedTotal) ? reportedTotal : products.length,
      totalPages: Number.isFinite(reportedPages) && reportedPages > 0 ? reportedPages : 1,
    };

    cache.set(cacheKey, { data: page, timestamp: Date.now() });
    return page;
  }).pipe(
    Effect.retry({ times: 2, while: (error) => error._tag === 'NetworkError' }),
    Effect.timeout('90 seconds')
  );

export const getProducts = (params: GetProductsParams = {}) =>
  Effect.gen(function* () {
    const url = buildProductsUrl(params);
    const cacheKey = `products:${url.search}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data as Product[];
    }

    const response = yield* Effect.tryPromise({
      try: () => fetchJsonWithTimeout(url.toString()),
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
    Effect.retry({ times: 2, while: (error) => error._tag === 'NetworkError' }),
    Effect.timeout('90 seconds')
  );

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL_MS = 15 * 60 * 1000;
let allProductsCache: Product[] | null = null;

export const clearServiceCache = () => {
  cache.clear();
  allProductsCache = null;
};

const SLUGS_PER_PAGE = 100;
const MAX_SLUG_PAGES = 60;
const PRODUCT_FETCH_CONCURRENCY = 3;

export const getProductBySlug = (slug: string) =>
  Effect.gen(function* () {
    const cacheKey = `product:${slug}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data as Product;
    }

    const url = `${API_BASE}/products?slug=${encodeURIComponent(slug)}`;

    const response = yield* Effect.tryPromise({
      try: () => fetchJsonWithTimeout(url),
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
  }).pipe(Effect.retry({ times: 2 }), Effect.timeout('30 seconds'));

export const getAllProducts = Effect.gen(function* () {
  if (allProductsCache) {
    return allProductsCache;
  }

  const fetchPage = (page: number) =>
    Effect.gen(function* () {
      const url = new URL(`${API_BASE}/products`);
      url.searchParams.set('per_page', String(SLUGS_PER_PAGE));
      url.searchParams.set('page', String(page));

      const response = yield* Effect.tryPromise({
        try: () => fetchJsonWithTimeout(url.toString()),
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
      return {
        products,
        totalPages: Number(response.headers.get('x-wp-totalpages') || '1'),
      };
    }).pipe(
      Effect.retry({ times: 5, while: (error) => error._tag === 'NetworkError' }),
      Effect.timeout('120 seconds')
    );

  const firstPage = yield* fetchPage(1);
  const totalPages = Math.min(firstPage.totalPages, MAX_SLUG_PAGES);
  const remainingPages = Array.from({ length: totalPages - 1 }, (_, offset) => offset + 2);

  const remaining = yield* Effect.forEach(remainingPages, fetchPage, {
    concurrency: PRODUCT_FETCH_CONCURRENCY,
  });

  const products = [firstPage.products, ...remaining.map((page) => page.products)].flat();
  allProductsCache = products;
  return products;
}).pipe(Effect.timeout('300 seconds'));

const MAX_CATEGORY_PAGES = 5;

export interface CatalogSummary {
  total: number;
  minPrice: number;
  maxPrice: number;
  countsByCategory: Map<number, number>;
}

const CatalogSummaryEntrySchema = Schema.Array(
  Schema.Struct({
    id: Schema.Finite,
    is_in_stock: Schema.Boolean,
    prices: Schema.Struct({ price: Schema.String }),
    categories: Schema.Array(Schema.Struct({ id: Schema.Finite })),
  })
);

const SUMMARY_FIELDS = 'id,is_in_stock,prices,categories';

export const getCatalogSummary = Effect.gen(function* () {
  const cacheKey = 'catalog-summary';
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data as CatalogSummary;
  }

  const fetchSummaryPage = (page: number) =>
    Effect.gen(function* () {
      const url = new URL(`${API_BASE}/products`);
      url.searchParams.set('per_page', String(SLUGS_PER_PAGE));
      url.searchParams.set('page', String(page));
      url.searchParams.set('stock_status', 'instock');
      url.searchParams.set('_fields', SUMMARY_FIELDS);

      const response = yield* Effect.tryPromise({
        try: () => fetchJsonWithTimeout(url.toString()),
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

      const entries = yield* Schema.decodeUnknownEffect(CatalogSummaryEntrySchema)(raw);
      return {
        entries,
        totalPages: Number(response.headers.get('x-wp-totalpages') || '1'),
      };
    }).pipe(
      Effect.retry({ times: 2, while: (error) => error._tag === 'NetworkError' }),
      Effect.timeout('90 seconds')
    );

  const firstPage = yield* fetchSummaryPage(1);
  const totalPages = Math.min(firstPage.totalPages, MAX_SLUG_PAGES);
  const remainingPages = Array.from({ length: totalPages - 1 }, (_, offset) => offset + 2);

  const remaining = yield* Effect.forEach(remainingPages, fetchSummaryPage, {
    concurrency: PRODUCT_FETCH_CONCURRENCY,
  });

  const entries = [firstPage.entries, ...remaining.map((page) => page.entries)].flat();
  const available = entries.filter((entry) => entry.is_in_stock && Number(entry.prices.price) > 0);

  const countsByCategory = new Map<number, number>();
  for (const entry of available) {
    for (const category of entry.categories) {
      countsByCategory.set(category.id, (countsByCategory.get(category.id) ?? 0) + 1);
    }
  }

  const prices = available.map((entry) => Number(entry.prices.price));
  const summary: CatalogSummary = {
    total: available.length,
    minPrice: prices.length > 0 ? Math.min(...prices) : 0,
    maxPrice: prices.length > 0 ? Math.max(...prices) : 0,
    countsByCategory,
  };

  cache.set(cacheKey, { data: summary, timestamp: Date.now() });
  return summary;
}).pipe(Effect.timeout('300 seconds'));

export const getCategories = Effect.gen(function* () {
  const cacheKey = 'categories:all';
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data as ProductCategory[];
  }

  const fetchCategoryPage = (page: number) =>
    Effect.tryPromise({
      try: () => fetchJsonWithTimeout(`${API_BASE}/products/categories?per_page=100&page=${page}`),
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
  Effect.retry({ times: 2, while: (error) => error._tag === 'NetworkError' }),
  Effect.timeout('120 seconds')
);

export const getBrandCategories = getCategories.pipe(
  Effect.map((categories) => brandCategories(categories)),
  Effect.orElseSucceed(() => [] as BrandCategory[])
);

export class PageNotFoundError extends Schema.TaggedError<
  PageNotFoundError,
  { readonly brand: unique symbol }
>()('PageNotFoundError', {
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
      try: () => fetchJsonWithTimeout(url),
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
    Effect.retry({ times: 4, while: (error) => error._tag === 'NetworkError' }),
    Effect.timeout('120 seconds')
  );
