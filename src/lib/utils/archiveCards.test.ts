import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { pageProductCardState } from '@/lib/utils/archiveCards';

const sampleProduct = JSON.parse(
  readFileSync(
    fileURLToPath(new URL('../../tests/fixtures/sample-product.json', import.meta.url)),
    'utf8'
  )
);

describe('pageProductCardState', () => {
  it('keeps the add-to-cart action for an in-stock product with a positive price', () => {
    expect(pageProductCardState({ ...sampleProduct, is_in_stock: true })).toBe('purchasable');
  });

  it('marks an out-of-stock product as sold', () => {
    expect(pageProductCardState({ ...sampleProduct, is_in_stock: false })).toBe('sold');
  });

  it('marks a zero-priced product as sold instead of offering an empty cart line', () => {
    expect(
      pageProductCardState({
        ...sampleProduct,
        is_in_stock: true,
        prices: { ...sampleProduct.prices, price: '0' },
      })
    ).toBe('sold');
  });

  it('treats a product without an explicit stock flag as sold', () => {
    expect(pageProductCardState({ ...sampleProduct, is_in_stock: undefined })).toBe('sold');
  });

  it('treats a product without prices as sold', () => {
    expect(pageProductCardState({ ...sampleProduct, prices: undefined })).toBe('sold');
  });
});
