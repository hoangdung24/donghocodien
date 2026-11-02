import { describe, it, expect } from 'vitest';
import { buildCategoryTree, decodeCategoryName } from './categories';

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
    const brand = tree.find((g) => g.parent.id === 70);

    expect(brand).toBeDefined();
    expect(brand?.children.map((c) => c.name)).toEqual(['ALange & Sohne', 'Omega', 'Rolex']);
  });

  it('only returns root categories that have children', () => {
    const tree = buildCategoryTree(apiCategories);
    const rootIds = tree.map((g) => g.parent.id);

    expect(rootIds).toEqual([70, 161, 165]);
    expect(rootIds).not.toContain(300);
  });

  it('sorts children alphabetically by name', () => {
    const tree = buildCategoryTree(apiCategories);
    const gender = tree.find((g) => g.parent.id === 161);

    expect(gender?.children.map((c) => c.name)).toEqual(['Male', 'Unisex']);
  });

  it('decodes children names for display', () => {
    const tree = buildCategoryTree(apiCategories);
    const size = tree.find((g) => g.parent.id === 165);

    expect(size?.children.map((c) => c.displayName)).toEqual(['20 – 30 mm', '30 – 40 mm']);
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
