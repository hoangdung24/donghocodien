import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleStoreApiProxy } from './storeApiProxy';
import sampleCart from '../tests/fixtures/sample-cart.json';

const WORKER_ORIGIN = 'https://donghocodien.spacetime-watch.workers.dev';

describe('Store API Proxy Seam', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    global.fetch = originalFetch;
  });

  it('returns null for non store-api paths', async () => {
    const request = new Request(`${WORKER_ORIGIN}/product/edox-baignoire-ref-200246`);
    const result = await handleStoreApiProxy(request);
    expect(result).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
  });

  it('proxies cart reads to the WordPress backend', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify(sampleCart), {
        status: 200,
        headers: { 'content-type': 'application/json', 'x-wc-store-api-nonce': 'abc123' },
      })
    );

    const request = new Request(`${WORKER_ORIGIN}/wc/store/v1/cart`, {
      headers: { Accept: 'application/json' },
    });
    const response = await handleStoreApiProxy(request);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://donghocodien.com/wp-json/wc/store/v1/cart',
      expect.objectContaining({ method: 'GET' })
    );
    expect(response).not.toBeNull();
    expect(response?.status).toBe(200);
    expect(await response?.json()).toEqual(sampleCart);
    expect(response?.headers.get('x-wc-store-api-nonce')).toBe('abc123');
  });

  it('proxies add-item mutations with body and content type', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(
      new Response(JSON.stringify(sampleCart), {
        status: 201,
        headers: { 'content-type': 'application/json' },
      })
    );

    const request = new Request(`${WORKER_ORIGIN}/wc/store/v1/cart/add-item`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 22874, quantity: 1 }),
    });
    const response = await handleStoreApiProxy(request);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://donghocodien.com/wp-json/wc/store/v1/cart/add-item',
      expect.objectContaining({
        method: 'POST',
      })
    );
    const [, init] = mockFetch.mock.calls[0] as [URL, RequestInit];
    expect(new TextDecoder().decode(init.body as ArrayBuffer)).toBe(
      JSON.stringify({ id: 22874, quantity: 1 })
    );
    expect(response?.status).toBe(201);
  });

  it('preserves query strings', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(new Response('{}', { status: 200 }));

    const request = new Request(`${WORKER_ORIGIN}/wc/store/v1/products?per_page=20&page=2`);
    await handleStoreApiProxy(request);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://donghocodien.com/wp-json/wc/store/v1/products?per_page=20&page=2',
      expect.anything()
    );
  });

  it('forwards client headers except hop-by-hop ones', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce(new Response('{}', { status: 200 }));

    const request = new Request(`${WORKER_ORIGIN}/wc/store/v1/cart`, {
      headers: {
        Accept: 'application/json',
        Cookie: 'wp_woocommerce_session=test',
        Host: 'donghocodien.spacetime-watch.workers.dev',
        'Accept-Encoding': 'gzip, br',
        'X-WC-Store-API-Nonce': 'abc123',
      },
    });
    await handleStoreApiProxy(request);

    const [, init] = mockFetch.mock.calls[0] as [URL, RequestInit];
    const headers = new Headers(init.headers);
    expect(headers.get('cookie')).toBe('wp_woocommerce_session=test');
    expect(headers.get('x-wc-store-api-nonce')).toBe('abc123');
    expect(headers.get('host')).toBeNull();
    expect(headers.get('accept-encoding')).toBeNull();
  });
});
