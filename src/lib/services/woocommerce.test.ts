import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Effect } from 'effect';
import {
  getProducts,
  getProductsPage,
  getProductSlugs,
  getPublishedSlugs,
  getStorePageBySlug,
  getAllProducts,
  getBrandCategories,
  clearServiceCache,
} from './woocommerce';

const makeProduct = (id: number, slug: string) => ({
  id,
  name: slug,
  slug,
  permalink: `https://donghocodien.com/product/${slug}/`,
  description: '',
  short_description: '',
  sku: '',
  prices: {
    price: '100',
    regular_price: '100',
    currency_code: 'USD',
    currency_symbol: '$',
  },
  images: [],
  categories: [],
  is_in_stock: true,
  on_sale: false,
});

const PRODUCTS_URL = 'https://donghocodien.com/wp-json/wc/store/v1/products';

describe('WooCommerce Products Service Seam (Effect v4)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    clearServiceCache();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    global.fetch = originalFetch;
  });

  const mockProductsResponse = () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);
  };

  it('appends stock_status=instock when provided', async () => {
    mockProductsResponse();

    await Effect.runPromise(getProducts({ per_page: 20, stock_status: 'instock' }));

    const requestedUrl = vi.mocked(fetch).mock.calls[0]?.[0];
    expect(String(requestedUrl)).toContain('stock_status=instock');
  });

  it('omits stock_status when not provided', async () => {
    mockProductsResponse();

    await Effect.runPromise(getProducts({ per_page: 20 }));

    const requestedUrl = vi.mocked(fetch).mock.calls[0]?.[0];
    expect(String(requestedUrl)).toContain(PRODUCTS_URL);
    expect(String(requestedUrl)).not.toContain('stock_status');
  });

  it('keeps stock_status combined with search, category and price filters', async () => {
    mockProductsResponse();

    await Effect.runPromise(
      getProducts({
        page: 2,
        per_page: 20,
        search: 'omega',
        category: 342,
        min_price: 300,
        max_price: 3500,
        stock_status: 'instock',
      })
    );

    const requestedUrl = new URL(String(vi.mocked(fetch).mock.calls[0]?.[0]));
    expect(requestedUrl.searchParams.get('stock_status')).toBe('instock');
    expect(requestedUrl.searchParams.get('search')).toBe('omega');
    expect(requestedUrl.searchParams.get('category')).toBe('342');
    expect(requestedUrl.searchParams.get('page')).toBe('2');
  });

  it('reports the total product count from the x-wp-total header', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      headers: new Headers({ 'x-wp-total': '352', 'x-wp-totalpages': '4' }),
      json: async () => [],
    } as Response);

    const page = await Effect.runPromise(getProductsPage({ per_page: 100, category: 79 }));

    expect(page.total).toBe(352);
    expect(page.totalPages).toBe(4);
    expect(page.products).toEqual([]);
  });

  it('falls back to the page length when the total header is missing', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      headers: new Headers(),
      json: async () => [],
    } as Response);

    const page = await Effect.runPromise(getProductsPage({ per_page: 20 }));

    expect(page.total).toBe(0);
    expect(page.totalPages).toBe(1);
  });

  it('joins several category ids into one comma separated param', async () => {
    mockProductsResponse();

    await Effect.runPromise(getProducts({ per_page: 20, category: [70, 77, 118] }));

    const requestedUrl = new URL(String(vi.mocked(fetch).mock.calls[0]?.[0]));
    expect(requestedUrl.searchParams.get('category')).toBe('70,77,118');
  });

  it('keeps a single category id unchanged', async () => {
    mockProductsResponse();

    await Effect.runPromise(getProducts({ per_page: 20, category: [79] }));

    const requestedUrl = new URL(String(vi.mocked(fetch).mock.calls[0]?.[0]));
    expect(requestedUrl.searchParams.get('category')).toBe('79');
  });

  it('omits the category param when the list is empty', async () => {
    mockProductsResponse();

    await Effect.runPromise(getProducts({ per_page: 20, category: [], max_price: 999999 }));

    const requestedUrl = new URL(String(vi.mocked(fetch).mock.calls[0]?.[0]));
    expect(requestedUrl.searchParams.has('category')).toBe(false);
  });

  it('serves a repeated paged request from cache instead of refetching', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      headers: new Headers({ 'x-wp-total': '0' }),
      json: async () => [],
    } as unknown as Response);

    await Effect.runPromise(getProductsPage({ per_page: 17, category: 9001 }));
    await Effect.runPromise(getProductsPage({ per_page: 17, category: 9001 }));

    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
  });

  it('lists every product slug across all reported pages', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'x-wp-totalpages': '2' }),
        json: async () => [{ slug: 'first-watch' }],
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers({ 'x-wp-totalpages': '2' }),
        json: async () => [{ slug: 'second-watch' }],
      } as unknown as Response);

    const slugs = await Effect.runPromise(getProductSlugs);

    expect(slugs).toEqual(['first-watch', 'second-watch']);
    const firstUrl = new URL(String(vi.mocked(fetch).mock.calls[0]?.[0]));
    expect(firstUrl.searchParams.get('per_page')).toBe('100');
    expect(firstUrl.searchParams.get('page')).toBe('1');
    const secondUrl = new URL(String(vi.mocked(fetch).mock.calls[1]?.[0]));
    expect(secondUrl.searchParams.get('page')).toBe('2');
  });

  it('returns no product slugs when the listing request fails', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    } as Response);

    const slugs = await Effect.runPromise(getProductSlugs);

    expect(slugs).toEqual([]);
  });

  it('lists published page and post slugs as one combined list', async () => {
    vi.mocked(fetch)
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => [{ slug: 'about-us' }, { slug: 'contact-us' }],
      } as unknown as Response)
      .mockResolvedValueOnce({
        ok: true,
        headers: new Headers(),
        json: async () => [{ slug: 'an-article' }],
      } as unknown as Response);

    const slugs = await Effect.runPromise(getPublishedSlugs);

    expect(slugs).toEqual(['about-us', 'contact-us', 'an-article']);
    expect(String(vi.mocked(fetch).mock.calls[0]?.[0])).toContain('/wp/v2/pages');
    expect(String(vi.mocked(fetch).mock.calls[1]?.[0])).toContain('/wp/v2/posts');
  });

  it('prefers the post when it shares its slug with a page', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => [
        {
          id: 7,
          slug: 'spacetime-dong-ho-co-dien',
          date: '2026-01-01T00:00:00',
          title: { rendered: 'Article' },
          content: { rendered: '<p>Post body</p>' },
          excerpt: { rendered: '<p>Excerpt</p>' },
        },
      ],
    } as unknown as Response);

    const result = await Effect.runPromise(getStorePageBySlug('spacetime-dong-ho-co-dien'));

    expect(result.content.rendered).toBe('<p>Post body</p>');
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
  });

  it('downloads the full catalog page by page for prerendering', async () => {
    vi.mocked(fetch).mockImplementation(async (input) => {
      const page = new URL(String(input)).searchParams.get('page');
      const products =
        page === '1' ? [makeProduct(1, 'first-watch')] : [makeProduct(2, 'second-watch')];

      return {
        ok: true,
        headers: new Headers({ 'x-wp-totalpages': '2' }),
        json: async () => products,
      } as unknown as Response;
    });

    const products = await Effect.runPromise(getAllProducts);

    expect(products.map((product) => product.slug)).toEqual(['first-watch', 'second-watch']);
  });

  it('falls back to the page when no post matches the slug', async () => {
    vi.mocked(fetch).mockImplementation(async (input) => {
      const url = String(input);
      const body = url.includes('/wp/v2/posts')
        ? []
        : [
            {
              id: 42,
              slug: 'spacetime-dong-ho-co-dien',
              title: { rendered: 'About Spacetime' },
              content: { rendered: '<p>Story</p>' },
              date: '2026-01-01T00:00:00',
            },
          ];

      return { ok: true, json: async () => body } as Response;
    });

    const result = await Effect.runPromise(getStorePageBySlug('spacetime-dong-ho-co-dien'));

    expect(result.content.rendered).toBe('<p>Story</p>');
    const requestedUrls = vi.mocked(fetch).mock.calls.map((call) => String(call[0]));
    expect(requestedUrls.some((url) => url.includes('/wp/v2/pages'))).toBe(true);
  });

  const mockCategoriesResponse = (categories: unknown[]) => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      headers: new Headers({ 'x-wp-totalpages': '1' }),
      json: async () => categories,
    } as unknown as Response);
  };

  it('extracts the brand subcategories from the categories listing', async () => {
    mockCategoriesResponse([
      { id: 70, name: 'Brand', slug: 'brand', parent: 0 },
      { id: 258, name: 'Rolex', slug: 'rolex', parent: 70 },
      { id: 231, name: 'Omega', slug: 'omega', parent: 70 },
      { id: 161, name: 'Gender', slug: 'gender', parent: 0 },
      { id: 162, name: 'Unisex', slug: 'unisex', parent: 161 },
    ]);

    const brands = await Effect.runPromise(getBrandCategories);

    expect(brands.map((brand) => brand.slug)).toEqual(['omega', 'rolex']);
    expect(brands.map((brand) => brand.displayName)).toEqual(['Omega', 'Rolex']);
  });

  it('requests the categories endpoint once for repeated brand lookups', async () => {
    mockCategoriesResponse([
      { id: 70, name: 'Brand', slug: 'brand', parent: 0 },
      { id: 258, name: 'Rolex', slug: 'rolex', parent: 70 },
    ]);

    await Effect.runPromise(getBrandCategories);
    await Effect.runPromise(getBrandCategories);

    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
  });

  it('returns no brands when the categories listing fails', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      url: 'https://donghocodien.com/wp-json/wc/store/v1/products/categories?per_page=100&page=1',
    } as Response);

    const brands = await Effect.runPromise(getBrandCategories);

    expect(brands).toEqual([]);
  });
});
