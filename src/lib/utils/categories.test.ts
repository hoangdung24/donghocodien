import { describe, it, expect } from 'vitest';
import {
  buildCategoryTree,
  decodeCategoryName,
  categoryIdFromParam,
  categoryHref,
  archiveHref,
  findBrandCategory,
  brandCategories,
} from '@/lib/utils/categories';

interface ApiCategory {
  id: number;
  name: string;
  slug: string;
  parent: number;
}

const apiCategories: ApiCategory[] = [
  { id: 70, name: 'Brand', slug: 'brand', parent: 0 },
  { id: 293, name: 'ALange & Sohne', slug: 'alange-sohne', parent: 70 },
  { id: 258, name: 'Rolex', slug: 'rolex', parent: 70 },
  { id: 231, name: 'Omega', slug: 'omega', parent: 70 },
  { id: 161, name: 'Gender', slug: 'gender', parent: 0 },
  { id: 162, name: 'Unisex', slug: 'unisex', parent: 161 },
  { id: 163, name: 'Male', slug: 'male', parent: 161 },
  { id: 300, name: 'Consignment', slug: 'consignment', parent: 0 },
  { id: 165, name: 'Size', slug: 'size', parent: 0 },
  { id: 166, name: '20 &#8211; 30 mm', slug: '20-30-mm', parent: 165 },
  { id: 167, name: '30 &#8211; 40 mm', slug: '30-40-mm', parent: 165 },
];

describe('buildCategoryTree', () => {
  it('groups children under their parent category', () => {
    const tree = buildCategoryTree(apiCategories);
    const brand = tree.find((group) => group.parent.id === 70);

    expect(brand).toBeDefined();
    expect(brand?.children.map((category) => category.name)).toEqual([
      'ALange & Sohne',
      'Omega',
      'Rolex',
    ]);
  });

  it('only returns root categories that have children', () => {
    const tree = buildCategoryTree(apiCategories);
    const rootIds = tree.map((group) => group.parent.id);

    expect(rootIds).toEqual([70, 161, 165]);
    expect(rootIds).not.toContain(300);
  });

  it('sorts children alphabetically by name', () => {
    const tree = buildCategoryTree(apiCategories);
    const gender = tree.find((group) => group.parent.id === 161);

    expect(gender?.children.map((category) => category.name)).toEqual(['Male', 'Unisex']);
  });

  it('decodes children names for display', () => {
    const tree = buildCategoryTree(apiCategories);
    const size = tree.find((group) => group.parent.id === 165);

    expect(size?.children.map((category) => category.displayName)).toEqual([
      '20 – 30 mm',
      '30 – 40 mm',
    ]);
  });
});

describe('decodeCategoryName', () => {
  it('decodes numeric HTML entities', () => {
    expect(decodeCategoryName('20 &' + '#8211; 30 mm')).toBe('20 – 30 mm');
  });

  it('decodes named HTML entities', () => {
    expect(decodeCategoryName('ALange &' + 'amp; Sohne')).toBe('ALange & Sohne');
  });

  it('leaves plain names unchanged', () => {
    expect(decodeCategoryName('Omega')).toBe('Omega');
  });
});

describe('categoryIdFromParam', () => {
  it('passes numeric params through unchanged', () => {
    expect(categoryIdFromParam('163', apiCategories)).toBe(163);
  });

  it('resolves a category slug to its id', () => {
    expect(categoryIdFromParam('male', apiCategories)).toBe(163);
  });

  it('resolves slugs case-insensitively', () => {
    expect(categoryIdFromParam('OMEGA', apiCategories)).toBe(231);
  });

  it('resolves hyphenated slugs', () => {
    expect(categoryIdFromParam('20-30-mm', apiCategories)).toBe(166);
  });

  it('maps special slugs that are not in the category list', () => {
    expect(categoryIdFromParam('archives', apiCategories)).toBe(214);
    expect(categoryIdFromParam('out-of-stock', apiCategories)).toBe(214);
    expect(categoryIdFromParam('consignment', apiCategories)).toBe(1102);
  });

  it('returns undefined for unknown slugs', () => {
    expect(categoryIdFromParam('does-not-exist', apiCategories)).toBeUndefined();
  });

  it('returns undefined when no param is present', () => {
    expect(categoryIdFromParam(undefined, apiCategories)).toBeUndefined();
    expect(categoryIdFromParam('', apiCategories)).toBeUndefined();
  });
});

describe('findBrandCategory', () => {
  const rolexWatch = { categories: [{ id: 258 }] };
  const patekWatch = {
    categories: [
      { id: 342, name: 'Dress Watches', slug: 'dress-watches-water-resistant' },
      { id: 215, name: 'Patek Philippe', slug: 'patek-philippe' },
    ],
  };
  const unlistedWatch = {
    categories: [
      { id: 162, name: 'Unisex', slug: 'unisex' },
      { id: 255, name: 'Enicar', slug: 'enicar' },
    ],
  };
  const categoriesWithPatek = [
    ...apiCategories,
    { id: 342, name: 'Dress Watches', slug: 'dress-watches-water-resistant', parent: 339 },
    { id: 339, name: 'Water Resistant', slug: 'water-resistant', parent: 0 },
    { id: 215, name: 'Patek Philippe', slug: 'patek-philippe', parent: 70 },
    { id: 255, name: 'Enicar', slug: 'enicar', parent: 70 },
  ];

  it('picks the brand category from the brand subtree', () => {
    expect(findBrandCategory(rolexWatch, categoriesWithPatek)?.id).toBe(258);
    expect(findBrandCategory(patekWatch, categoriesWithPatek)?.id).toBe(215);
  });

  it('ignores categories outside the brand subtree', () => {
    expect(findBrandCategory(unlistedWatch, categoriesWithPatek)?.id).toBe(255);
  });

  it('returns undefined when the product has no brand category', () => {
    expect(findBrandCategory({ categories: [{ id: 162 }] }, categoriesWithPatek)).toBeUndefined();
  });

  it('returns undefined when the brand page has no products', () => {
    expect(findBrandCategory({ categories: [] }, categoriesWithPatek)).toBeUndefined();
  });
});

describe('brandCategories', () => {
  it('returns every brand subcategory sorted by display name', () => {
    const brands = brandCategories(apiCategories);

    expect(brands.map((brand) => brand.id)).toEqual([293, 231, 258]);
  });

  it('returns display-ready names with decoded entities', () => {
    const brands = brandCategories([
      ...apiCategories,
      { id: 401, name: 'Jaeger-LeCoultre &#8211; Vintage', slug: 'jaeger', parent: 70 },
    ]);

    expect(brands[0]?.displayName).toBe('ALange & Sohne');
    const jaeger = brands.find((brand) => brand.id === 401);
    expect(jaeger?.displayName).toBe('Jaeger-LeCoultre – Vintage');
    expect(jaeger?.slug).toBe('jaeger');
  });

  it('walks the whole brand subtree, not only direct children', () => {
    const nestedBrands = [
      ...apiCategories,
      { id: 500, name: 'Swiss', slug: 'swiss', parent: 70 },
      { id: 501, name: 'Longines', slug: 'longines', parent: 500 },
    ];

    expect(brandCategories(nestedBrands).map((brand) => brand.id)).toEqual([
      293, 501, 231, 258, 500,
    ]);
  });

  it('excludes the brand root and categories outside the bundle', () => {
    const brandIds = brandCategories(apiCategories).map((brand) => brand.id);

    expect(brandIds).not.toContain(70);
    expect(brandIds).not.toContain(161);
    expect(brandIds).not.toContain(162);
  });

  it('returns an empty list when the bundle has no brand root', () => {
    const withoutBrand = apiCategories.filter(
      (category) => category.parent !== 70 && category.id !== 70
    );

    expect(brandCategories(withoutBrand)).toEqual([]);
  });
});

describe('categoryHref', () => {
  it('builds a slug-based shop link', () => {
    expect(categoryHref('female')).toBe('/watches?category=female');
  });

  it('appends and encodes the search param', () => {
    expect(categoryHref('rolex', 'water resistant')).toBe(
      '/watches?category=rolex&search=water+resistant'
    );
  });

  it('omits the search param when absent', () => {
    expect(categoryHref('rare-collectible')).toBe('/watches?category=rare-collectible');
  });
});

describe('archiveHref', () => {
  it('returns the bare archive path with no filters', () => {
    expect(archiveHref()).toBe('/archives');
  });

  it('links a selected category', () => {
    expect(archiveHref({ category: 'rolex' })).toBe('/archives?category=rolex');
  });

  it('carries the search term alongside the category', () => {
    expect(archiveHref({ category: 'rolex', search: 'date just' })).toBe(
      '/archives?category=rolex&search=date+just'
    );
  });

  it('uses a path segment for pages beyond the first', () => {
    expect(archiveHref({ category: 'rolex', page: 1 })).toBe('/archives?category=rolex');
    expect(archiveHref({ category: 'rolex', page: 3 })).toBe('/archives/p/3?category=rolex');
    expect(archiveHref({ page: 2 })).toBe('/archives/p/2');
  });
});
