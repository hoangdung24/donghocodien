import { describe, expect, it } from 'vitest';
import { describeCartError, stripDescriptionTags } from '@/lib/utils/cartText';
import { readCartCache, writeCartCache, clearCartCache, CART_CACHE_TTL_MS } from '@/lib/cartStore';

describe('stripDescriptionTags', () => {
  it('removes the inline formatting tags WooCommerce ships in cart item names', () => {
    expect(stripDescriptionTags('EDOX &#8216;BAIGNOIRE&#8217; <em>ref 200246</em>')).toBe(
      'EDOX &#8216;BAIGNOIRE&#8217; ref 200246'
    );
  });

  it('keeps plain names identical without string surgery', () => {
    const plain = 'Seiko 5 Sports 7009-3040';
    expect(stripDescriptionTags(plain)).toBe(plain);
  });

  it('flattens block markup into single-spaced text', () => {
    expect(
      stripDescriptionTags('<p>Rolex<br><strong>Oyster</strong></p><ul><li>1601</li></ul>')
    ).toBe('Rolex Oyster 1601');
  });

  it('returns an empty string for empty input', () => {
    expect(stripDescriptionTags('')).toBe('');
  });
});

describe('describeCartError', () => {
  it('uses the message of an Error', () => {
    expect(describeCartError(new Error('Failed to fetch cart'), 'fallback')).toBe(
      'Failed to fetch cart'
    );
  });

  it('falls back for values that are not Errors', () => {
    expect(describeCartError('boom', 'fallback')).toBe('fallback');
    expect(describeCartError(undefined, 'fallback')).toBe('fallback');
  });
});

const snapshot = { items: [], items_count: 3 } as never;

describe('cart snapshot cache', () => {
  it('returns a snapshot inside the freshness window', () => {
    clearCartCache();
    writeCartCache('probe', snapshot, 1000);
    expect(readCartCache('probe', 1000 + CART_CACHE_TTL_MS - 1)).toBe(snapshot);
  });

  it('drops a snapshot once the freshness window has passed', () => {
    clearCartCache();
    writeCartCache('probe', snapshot, 1000);
    expect(readCartCache('probe', 1000 + CART_CACHE_TTL_MS)).toBeNull();
    expect(readCartCache('probe', 1001)).toBeNull();
  });

  it('returns nothing for a key that was never written', () => {
    clearCartCache();
    expect(readCartCache('missing')).toBeNull();
  });
});
