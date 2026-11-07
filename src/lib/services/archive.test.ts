import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { loadArchivePage, ARCHIVE_PAGE_SIZE } from '@/lib/services/archive';
import { clearServiceCache } from '@/lib/services/woocommerce';

const makeProduct = (id: number, slug: string, categoryIds: number[] = []) => ({
  id,
  name: slug,
  slug,
  permalink: `https://donghocodien.com/product/${slug}/`,
  description: '',
  short_description: '',
  sku: '',
  prices: { price: '100', regular_price: '100', currency_code: 'USD', currency_symbol: '$' },
  images: [],
  categories: categoryIds.map((categoryId) => ({
    id: categoryId,
    name: `Category ${categoryId}`,
    slug: `category-${categoryId}`,
  })),
  is_in_stock: false,
  on_sale: false,
});

const categories = [
  { id: 70, name: 'Brand', slug: 'brand', parent: 0, description: '', count: 0 },
  {
    id: 293,
    name: 'ALange &amp; Sohne',
    slug: 'alange-sohne',
    parent: 70,
    description: '',
    count: 6,
  },
];

describe('archive page loader seam', () => {
  const originalFetch = global.fetch;
  const requests: string[] = [];

  beforeEach(() => {
    clearServiceCache();
    requests.length = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = String(input);
        requests.push(url);

        if (url.includes('/products/categories')) {
          return {
            ok: true,
            headers: new Headers({ 'x-wp-totalpages': '1' }),
            json: async () => categories,
          } as unknown as Response;
        }

        return {
          ok: true,
          headers: new Headers({ 'x-wp-total': '45', 'x-wp-totalpages': '3' }),
          json: async () => [makeProduct(1, 'sold-watch', [293])],
        } as unknown as Response;
      })
    );
  });

  afterEach(() => {
    vi.stubGlobal('fetch', originalFetch);
  });

  it('requests a single archive page instead of the full catalog', async () => {
    await loadArchivePage({ page: 1 });

    const productRequests = requests.filter((url) => url.includes('/products?'));

    expect(productRequests).toHaveLength(1);
    expect(productRequests[0]).toContain(`per_page=${ARCHIVE_PAGE_SIZE}`);
    expect(productRequests[0]).toContain('page=1');
    expect(productRequests[0]).toContain('stock_status=outofstock');
  });

  it('asks for the requested page number', async () => {
    await loadArchivePage({ page: 3 });

    const productRequest = requests.find((url) => url.includes('/products?'));
    expect(productRequest).toContain('page=3');
  });

  it('scopes the request to the selected category and its descendants', async () => {
    await loadArchivePage({ page: 1, rawCategory: 'alange-sohne' });

    const productRequest = requests.find((url) => url.includes('/products?'));
    const categoryParam = new URL(productRequest ?? '').searchParams.get('category');

    expect(categoryParam).toBe('293');
  });

  it('reports whether a further page exists from the API total pages', async () => {
    const firstPage = await loadArchivePage({ page: 1 });
    const lastPage = await loadArchivePage({ page: 3 });

    expect(firstPage.hasNextPage).toBe(true);
    expect(lastPage.hasNextPage).toBe(false);
  });

  it('passes the search term through to the store API', async () => {
    await loadArchivePage({ page: 1, search: 'datograph' });

    const productRequest = requests.find((url) => url.includes('/products?'));
    expect(new URL(productRequest ?? '').searchParams.get('search')).toBe('datograph');
  });
});
