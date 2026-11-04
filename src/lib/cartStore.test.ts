import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CartStore } from './cartStore';

const CART_BODY = {
  items: [],
  items_count: 0,
  totals: { total_price: '0', currency_code: 'USD', currency_symbol: '$' },
};

const jsonResponse = (body: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status: 200, headers });

const cartResponse = (headers: Record<string, string> = {}, itemsCount = 0) =>
  jsonResponse({ ...CART_BODY, items_count: itemsCount }, {
    'x-wc-store-api-nonce': 'nonce-1',
    'cart-token': 'token-1',
    ...headers,
  });

describe('CartStore session handling', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('primes the session before the first mutation', async () => {
    const store = new CartStore();
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce(cartResponse())
      .mockResolvedValueOnce(cartResponse({ 'x-wc-store-api-nonce': 'nonce-2', 'cart-token': 'token-2' }, 1));

    await store.addItem(22874, 1);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[0][0]).toBe('/wc/store/v1/cart');
    const [addUrl, addOptions] = fetchMock.mock.calls[1];
    expect(addUrl).toBe('/wc/store/v1/cart/add-item');
    expect(addOptions?.method).toBe('POST');
    const headers = new Headers(addOptions?.headers);
    expect(headers.get('x-wc-store-api-nonce')).toBe('nonce-1');
    expect(headers.get('cart-token')).toBe('token-1');
  });

  it('replays the latest nonce and cart token on subsequent requests', async () => {
    const store = new CartStore();
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce(cartResponse())
      .mockResolvedValueOnce(cartResponse({ 'x-wc-store-api-nonce': 'nonce-2', 'cart-token': 'token-2' }, 1))
      .mockResolvedValueOnce(cartResponse({ 'x-wc-store-api-nonce': 'nonce-3', 'cart-token': 'token-3' }, 1));

    await store.addItem(22874, 1);
    await store.updateQuantity('item-key', 2);

    const [, updateOptions] = fetchMock.mock.calls[2];
    expect(updateOptions?.method).toBe('POST');
    const headers = new Headers(updateOptions?.headers);
    expect(headers.get('x-wc-store-api-nonce')).toBe('nonce-2');
    expect(headers.get('cart-token')).toBe('token-2');
  });

  it('does not re-prime when the session is already established', async () => {
    const store = new CartStore();
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce(cartResponse())
      .mockResolvedValueOnce(cartResponse({}, 1));

    await store.loadCart();
    await store.addItem(22874, 1);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('persists the cart token for later page loads', async () => {
    const setItem = vi.fn();
    const getItem = vi.fn(() => 'stored-token');
    vi.stubGlobal('localStorage', { getItem, setItem, removeItem: vi.fn() });

    const store = new CartStore();
    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce(cartResponse({ 'x-wc-store-api-nonce': 'nonce-1', 'cart-token': 'stored-token' }))
      .mockResolvedValueOnce(cartResponse({ 'x-wc-store-api-nonce': 'nonce-2', 'cart-token': 'token-9' }, 1));

    await store.addItem(22874, 1);

    expect(getItem).toHaveBeenCalledWith('wc-cart-token');
    expect(setItem).toHaveBeenCalledWith('wc-cart-token', 'token-9');
  });
});
