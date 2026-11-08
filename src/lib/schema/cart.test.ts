import { describe, it, expect } from 'vitest';
import { Schema } from 'effect';
import {
  CartSchema,
  CartItemSchema,
  CartTotalsSchema,
  AddToCartRequestSchema,
} from '@/lib/schema/cart';
import sampleCart from '@/tests/fixtures/sample-cart.json';

describe('Cart Schema Seam (Effect v4)', () => {
  it('decodes empty cart from API', () => {
    const raw = {
      coupons: [],
      shipping_rates: [],
      shipping_address: {
        first_name: '',
        last_name: '',
        company: '',
        address_1: '',
        address_2: '',
        city: '',
        state: '',
        postcode: '',
        country: '',
        phone: '',
      },
      billing_address: {
        first_name: '',
        last_name: '',
        company: '',
        address_1: '',
        address_2: '',
        city: '',
        state: '',
        postcode: '',
        country: '',
        email: '',
        phone: '',
      },
      items: [],
      items_count: 0,
      items_weight: 0,
      cross_sells: [],
      needs_payment: false,
      needs_shipping: false,
      has_calculated_shipping: false,
      fees: [],
      totals: {
        total_items: '0',
        total_items_tax: '0',
        total_fees: '0',
        total_fees_tax: '0',
        total_discount: '0',
        total_discount_tax: '0',
        total_shipping: '',
        total_shipping_tax: '',
        total_price: '0',
        total_tax: '0',
        tax_lines: [],
        currency_code: 'USD',
        currency_symbol: '$',
        currency_minor_unit: 0,
        currency_decimal_separator: '.',
        currency_thousand_separator: ',',
        currency_prefix: '',
        currency_suffix: ' $',
      },
      errors: [],
      payment_methods: ['bacs'],
      payment_requirements: ['products'],
      extensions: {},
    };

    const result = Schema.decodeSync(CartSchema)(raw);
    expect(result.items_count).toBe(0);
    expect(result.totals.total_price).toBe('0');
    expect(result.totals.currency_code).toBe('USD');
  });

  it('decodes cart with items from API', () => {
    const result = Schema.decodeSync(CartSchema)(sampleCart);
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items_count).toBe(result.items.length);
    expect(result.items_weight).toBe(500);
    expect(Number(result.totals.total_price)).toBeGreaterThan(0);
  });

  it('decodes cart item with prices and images', () => {
    const raw = {
      key: 'abc123',
      id: 22874,
      name: 'Test Watch',
      short_description: 'A test watch',
      sku: 'TEST-001',
      permalink: 'https://example.com/product/test-watch/',
      quantity: 1,
      price: '300',
      regular_price: '380',
      sale_price: '300',
      on_sale: true,
      totals: {
        line_total: '300',
        line_subtotal: '380',
        line_tax: '0',
        line_subtotal_tax: '0',
        line_total_tax: '0',
      },
      images: [
        {
          id: 1,
          src: 'https://example.com/image.jpg',
          thumbnail: 'https://example.com/image-300x375.jpg',
          alt: 'Test watch',
        },
      ],
    };

    const result = Schema.decodeSync(CartItemSchema)(raw);
    expect(result.id).toBe(22874);
    expect(result.quantity).toBe(1);
    expect(result.on_sale).toBe(true);
    expect(result.price).toBe('300');
  });

  it('encodes add to cart request', () => {
    const request = { id: 22874, quantity: 1 };
    const encoded = Schema.encodeSync(AddToCartRequestSchema)(request);
    expect(encoded.id).toBe(22874);
    expect(encoded.quantity).toBe(1);
  });

  it('decodes cart totals with currency info', () => {
    const raw = {
      total_items: '1',
      total_items_tax: '0',
      total_fees: '0',
      total_fees_tax: '0',
      total_discount: '80',
      total_discount_tax: '0',
      total_shipping: '0',
      total_shipping_tax: '0',
      total_price: '300',
      total_tax: '0',
      tax_lines: [],
      currency_code: 'USD',
      currency_symbol: '$',
      currency_minor_unit: 0,
      currency_decimal_separator: '.',
      currency_thousand_separator: ',',
      currency_prefix: '',
      currency_suffix: ' $',
    };

    const result = Schema.decodeSync(CartTotalsSchema)(raw);
    expect(result.total_price).toBe('300');
    expect(result.currency_code).toBe('USD');
    expect(result.currency_symbol).toBe('$');
  });
});
