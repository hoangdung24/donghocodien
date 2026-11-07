import { describe, it, expect } from 'vitest';
import { Schema } from 'effect';
import { ProductSchema } from '@/lib/schema/product';
import sampleProduct from '@/tests/fixtures/sample-product.json';

describe('Product Schema Seam (Effect v4)', () => {
  it('successfully decodes a real WooCommerce Store API product fixture', () => {
    const decoded = Schema.decodeSync(ProductSchema)(sampleProduct);

    expect(decoded.id).toBe(22874);
    expect(decoded.slug).toBe('edox-baignoire-ref-200246');
    expect(decoded.prices.price).toBe('300');
    expect(decoded.prices.currency_code).toBe('USD');
    expect(decoded.images.length).toBeGreaterThan(0);
    expect(decoded.categories.length).toBeGreaterThan(0);
    expect(decoded.low_stock_remaining).toBe(1);
  });

  it('decodes low_stock_remaining as null for non-low-stock products', () => {
    const decoded = Schema.decodeSync(ProductSchema)({
      ...sampleProduct,
      low_stock_remaining: null,
    });

    expect(decoded.low_stock_remaining).toBeNull();
  });

  it('fails gracefully when required fields are missing', () => {
    const invalidProduct = { id: 123 };

    expect(() => Schema.decodeUnknownSync(ProductSchema)(invalidProduct)).toThrow();
  });
});
