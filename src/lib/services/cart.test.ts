import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Effect } from 'effect';
import { getCart, addToCart, updateCartItem, removeCartItem, clearCart } from './cart';
import sampleCart from '../../tests/fixtures/sample-cart.json';

describe('Cart Service Seam (Effect v4)', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    global.fetch = originalFetch;
  });

  it('getCart decodes cart successfully', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => sampleCart,
    } as Response);

    const result = await Effect.runPromise(getCart as Effect.Effect<typeof sampleCart, never, never>);
    expect(result.items_count).toBe(1);
    expect(result.totals.total_price).toBe('315.00');
  });

  it('addToCart sends correct request body', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => sampleCart,
    } as Response);

    const request = { id: 22874, quantity: 1 };
    await Effect.runPromise(addToCart(request));

    expect(mockFetch).toHaveBeenCalledWith(
      'https://donghocodien.com/wp-json/wc/store/v1/cart/add-item',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(request),
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }),
      })
    );
  });

  it('updateCartItem sends correct request body', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => sampleCart,
    } as Response);

    const request = { key: 'abc123', quantity: 2 };
    await Effect.runPromise(updateCartItem(request));

    expect(mockFetch).toHaveBeenCalledWith(
      'https://donghocodien.com/wp-json/wc/store/v1/cart/update-item',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(request),
      })
    );
  });

  it('removeCartItem sends correct request body', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...sampleCart, items: [], items_count: 0, totals: { ...sampleCart.totals, total_price: '0' } }),
    } as Response);

    const request = { key: 'abc123' };
    await Effect.runPromise(removeCartItem(request));

    expect(mockFetch).toHaveBeenCalledWith(
      'https://donghocodien.com/wp-json/wc/store/v1/cart/remove-item',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(request),
      })
    );
  });

  it('clearCart sends DELETE request', async () => {
    const mockFetch = vi.mocked(fetch);
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ...sampleCart, items: [], items_count: 0, totals: { ...sampleCart.totals, total_price: '0' } }),
    } as Response);

    await Effect.runPromise(clearCart);

    expect(mockFetch).toHaveBeenCalledWith(
      'https://donghocodien.com/wp-json/wc/store/v1/cart/items',
      expect.objectContaining({
        method: 'DELETE',
      })
    );
  });
});