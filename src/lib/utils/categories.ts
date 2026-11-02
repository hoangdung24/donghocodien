import type { ProductCategory } from '../schema/product';

const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

export function decodeCategoryName(name: string): string {
  if (!name || typeof name !== 'string') return '';
  return name
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&(amp|lt|gt|quot|apos|nbsp);/g, (_, entity: string) => NAMED_ENTITIES[entity] ?? _);
}

export interface CategoryGroup {
  parent: ProductCategory & { displayName: string };
  children: Array<ProductCategory & { displayName: string }>;
}

export function buildCategoryTree(categories: ProductCategory[]): CategoryGroup[] {
  const roots = categories
    .filter((c) => !c.parent || c.parent === 0)
    .sort((a, b) => decodeCategoryName(a.name).localeCompare(decodeCategoryName(b.name)));

  return roots.flatMap((root) => {
    const children = categories
      .filter((c) => c.parent === root.id)
      .sort((a, b) => decodeCategoryName(a.name).localeCompare(decodeCategoryName(b.name)))
      .map((c) => ({ ...c, displayName: decodeCategoryName(c.name) }));

    if (children.length === 0) return [];
    return [{ parent: { ...root, displayName: decodeCategoryName(root.name) }, children }];
  });
}
