import { describe, expect, it } from 'vitest';
import type { Product, ProductCategory } from '@/lib/schema/product';
import { filterCatalog, descendantCategoryIds } from '@/lib/utils/catalog';

const makeProduct = (
  id: number,
  slug: string,
  overrides: Partial<Product> & { categoryIds?: number[]; price?: string } = {}
): Product => ({
  id,
  name: overrides.name ?? slug,
  slug,
  permalink: `https://donghocodien.com/product/${slug}/`,
  description: '',
  short_description: '',
  on_sale: false,
  is_in_stock: overrides.is_in_stock ?? true,
  prices: {
    price: overrides.price ?? '100',
    regular_price: '100',
    currency_code: 'USD',
    currency_symbol: '$',
  },
  images: [],
  categories: (overrides.categoryIds ?? []).map((categoryId) => ({
    id: categoryId,
    name: `Category ${categoryId}`,
    slug: `category-${categoryId}`,
  })),
});

const categories: ProductCategory[] = [
  { id: 70, name: 'Brand', slug: 'brand', parent: 0 },
  { id: 1, name: 'Rolex', slug: 'rolex', parent: 70 },
  { id: 2, name: 'Omega', slug: 'omega', parent: 70 },
];

describe('catalog filtering seam', () => {
  it('keeps only in-stock products with a positive price', () => {
    const products = [
      makeProduct(1, 'in-stock', { categoryIds: [1] }),
      makeProduct(2, 'out-of-stock', { categoryIds: [1], is_in_stock: false }),
      makeProduct(3, 'unpriced', { categoryIds: [1], price: '0' }),
    ];

    const filtered = filterCatalog(products, categories, { page: 1, categories }, 20);

    expect(filtered.map((product) => product.slug)).toEqual(['in-stock']);
  });

  it('matches a brand group through its child categories', () => {
    const products = [
      makeProduct(1, 'rolex-datejust', { categoryIds: [1] }),
      makeProduct(2, 'omega-seamaster', { categoryIds: [2] }),
    ];

    const filtered = filterCatalog(
      products,
      categories,
      { page: 1, categories, activeCategoryId: 70 },
      20
    );

    expect(filtered).toHaveLength(2);
  });

  it('excludes siblings when a single child category is selected', () => {
    const products = [
      makeProduct(1, 'rolex-datejust', { categoryIds: [1] }),
      makeProduct(2, 'omega-seamaster', { categoryIds: [2] }),
    ];

    const filtered = filterCatalog(
      products,
      categories,
      { page: 1, categories, activeCategoryId: 1 },
      20
    );

    expect(filtered.map((product) => product.slug)).toEqual(['rolex-datejust']);
  });

  it('returns only the requested page slice', () => {
    const products = Array.from({ length: 25 }, (_, index) =>
      makeProduct(index + 1, `watch-${index + 1}`, { categoryIds: [1] })
    );

    const secondPage = filterCatalog(
      products,
      categories,
      { page: 2, categories, activeCategoryId: 1 },
      20
    );

    expect(secondPage).toHaveLength(5);
    expect(secondPage[0]?.slug).toBe('watch-21');
  });

  it('matches search against the product name ignoring case', () => {
    const products = [
      makeProduct(1, 'rolex-datejust', { name: 'Rolex Datejust 1601', categoryIds: [1] }),
      makeProduct(2, 'omega-seamaster', { name: 'Omega Seamaster', categoryIds: [2] }),
    ];

    const filtered = filterCatalog(
      products,
      categories,
      { page: 1, search: 'DATeJUST', categories },
      20
    );

    expect(filtered.map((product) => product.slug)).toEqual(['rolex-datejust']);
  });

  it('walks nested descendants without looping', () => {
    const nested: ProductCategory[] = [
      ...categories,
      { id: 9, name: 'Sub', slug: 'sub', parent: 70 },
    ];

    expect(descendantCategoryIds(nested, 70).sort()).toEqual([1, 2, 9]);
  });
});
