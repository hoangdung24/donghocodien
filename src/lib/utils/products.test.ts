import { describe, it, expect } from 'vitest';
import {
  withPriceRange,
  countInStockByCategory,
  countByCategory,
  productHref,
} from '@/lib/utils/products';
import type { Product } from '@/lib/schema/product';

const makeProduct = (
  id: number,
  price: string,
  categories: Array<{ id: number; name: string; slug: string }>,
  inStock = true
): Product => ({
  id,
  name: `Watch ${id}`,
  slug: `watch-${id}`,
  permalink: `https://example.com/watch-${id}`,
  description: '',
  short_description: '',
  on_sale: false,
  is_in_stock: inStock,
  prices: {
    price,
    regular_price: price,
    currency_code: 'USD',
    currency_symbol: '$',
    currency_prefix: '$',
  },
  images: [],
  categories,
});

describe('withPriceRange', () => {
  it('adds min_price and max_price params to the current category', () => {
    expect(withPriceRange('category=5', { min: 400, max: 2000 })).toBe(
      '/watches?category=5&min_price=400&max_price=2000'
    );
  });

  it('removes price params when the range is cleared', () => {
    expect(withPriceRange('min_price=400&max_price=2000&search=omega', null)).toBe(
      '/watches?search=omega'
    );
  });

  it('returns the bare shop path when no params remain', () => {
    expect(withPriceRange('', null)).toBe('/watches');
  });

  it('builds a full path from an empty query', () => {
    expect(withPriceRange('', { min: 0, max: 1000 })).toBe('/watches?min_price=0&max_price=1000');
  });
});

describe('countInStockByCategory', () => {
  it('counts in-stock products with a positive price per category', () => {
    const products = [
      makeProduct(1, '450', [{ id: 10, name: 'Omega', slug: 'omega' }]),
      makeProduct(2, '500', [{ id: 10, name: 'Omega', slug: 'omega' }]),
      makeProduct(3, '900', [{ id: 20, name: 'Seiko', slug: 'seiko' }]),
    ];
    const counts = countInStockByCategory(products);
    expect(counts.get(10)).toBe(2);
    expect(counts.get(20)).toBe(1);
    expect(counts.size).toBe(2);
  });

  it('ignores out-of-stock and zero-priced products', () => {
    const products = [
      makeProduct(1, '450', [{ id: 10, name: 'Omega', slug: 'omega' }], false),
      makeProduct(2, '0', [{ id: 10, name: 'Omega', slug: 'omega' }]),
    ];
    const counts = countInStockByCategory(products);
    expect(counts.size).toBe(0);
  });

  it('counts one product under each of its categories', () => {
    const products = [
      makeProduct(1, '450', [
        { id: 10, name: 'Omega', slug: 'omega' },
        { id: 30, name: 'Vintage', slug: 'vintage' },
      ]),
    ];
    const counts = countInStockByCategory(products);
    expect(counts.get(10)).toBe(1);
    expect(counts.get(30)).toBe(1);
  });

  it('returns an empty map when there are no products', () => {
    expect(countInStockByCategory([]).size).toBe(0);
  });
});

describe('countByCategory', () => {
  it('counts sold products with zero prices per category', () => {
    const products = [
      makeProduct(1, '0', [{ id: 10, name: 'Omega', slug: 'omega' }], false),
      makeProduct(2, '0', [{ id: 10, name: 'Omega', slug: 'omega' }], false),
      makeProduct(3, '0', [{ id: 20, name: 'Seiko', slug: 'seiko' }], false),
    ];
    const counts = countByCategory(products);
    expect(counts.get(10)).toBe(2);
    expect(counts.get(20)).toBe(1);
    expect(counts.size).toBe(2);
  });

  it('counts one product under each of its categories', () => {
    const products = [
      makeProduct(1, '0', [
        { id: 10, name: 'Omega', slug: 'omega' },
        { id: 30, name: 'Automatic', slug: 'automatic' },
      ]),
    ];
    const counts = countByCategory(products);
    expect(counts.get(10)).toBe(1);
    expect(counts.get(30)).toBe(1);
  });

  it('returns an empty map when there are no products', () => {
    expect(countByCategory([]).size).toBe(0);
  });
});

describe('productHref', () => {
  it('builds a storefront path from a backend permalink', () => {
    expect(productHref('https://cms.donghocodien.com/product/edox-baignoire-ref-200246/')).toBe(
      '/watches/edox-baignoire-ref-200246'
    );
  });

  it('ignores the backend host so old and new origins agree', () => {
    expect(productHref('https://donghocodien.com/product/rolex-datejust-1601')).toBe(
      '/watches/rolex-datejust-1601'
    );
  });

  it('falls back to the watches index for an unusable permalink', () => {
    expect(productHref('')).toBe('/watches');
  });
});
