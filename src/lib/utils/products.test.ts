import { describe, it, expect } from 'vitest';
import { withPriceRange, countInStockByCategory } from './products';
import type { Product } from '../schema/product';

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
  it('adds min_price and max_price params and drops the page param', () => {
    expect(withPriceRange('category=5&page=2', { min: 400, max: 2000 })).toBe(
      '/shop?category=5&min_price=400&max_price=2000'
    );
  });

  it('removes price params when the range is cleared', () => {
    expect(withPriceRange('min_price=400&max_price=2000&search=omega', null)).toBe(
      '/shop?search=omega'
    );
  });

  it('returns the bare shop path when no params remain', () => {
    expect(withPriceRange('page=3', null)).toBe('/shop');
  });

  it('builds a full path from an empty query', () => {
    expect(withPriceRange('', { min: 0, max: 1000 })).toBe('/shop?min_price=0&max_price=1000');
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
