import type { ProductCategory } from '../schema/product';
import { descendantCategoryIds } from './catalog';

export const ARCHIVE_PATH = '/archives';

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

const SPECIAL_CATEGORY_SLUGS: Record<string, number> = {
  consignment: 1102,
  archive: 214,
  archives: 214,
  'out-of-stock': 214,
};

export function categoryIdFromParam(
  param: string | undefined,
  categories: readonly ProductCategory[]
): number | undefined {
  if (!param) return undefined;
  if (/^\d+$/.test(param)) return Number(param);
  const key = param.trim().toLowerCase();
  if (key in SPECIAL_CATEGORY_SLUGS) return SPECIAL_CATEGORY_SLUGS[key];
  return categories.find((category) => category.slug.toLowerCase() === key)?.id;
}

export function categoryHref(slug: string, search?: string, basePath = '/watches'): string {
  const params = new URLSearchParams({ category: slug });
  if (search) params.set('search', search);
  return `${basePath}?${params.toString()}`;
}

export interface ArchiveFilterParams {
  category?: string;
  search?: string;
  page?: number;
}

export function archiveHref({ category, search, page }: ArchiveFilterParams = {}): string {
  const params = new URLSearchParams();
  if (category) params.set('category', category);
  if (search) params.set('search', search);
  const queryString = params.toString();
  const path = page && page > 1 ? `${ARCHIVE_PATH}/p/${page}` : ARCHIVE_PATH;
  return `${path}${queryString ? `?${queryString}` : ''}`;
}

export const BRAND_ROOT_SLUG = 'brand';

export type BrandCategory = ProductCategory & { displayName: string };

const findBrandRoot = (categories: readonly ProductCategory[]): ProductCategory | undefined =>
  categories.find(
    (category) => category.slug.toLowerCase() === BRAND_ROOT_SLUG && !category.parent
  );

const brandCategoryIds = (categories: readonly ProductCategory[]): Set<number> => {
  const brandRoot = findBrandRoot(categories);
  if (!brandRoot) return new Set();
  return new Set(descendantCategoryIds(categories, brandRoot.id));
};

export function brandCategories(categories: readonly ProductCategory[]): BrandCategory[] {
  const brandIds = brandCategoryIds(categories);
  return categories
    .filter((category) => brandIds.has(category.id))
    .map((category) => ({ ...category, displayName: decodeCategoryName(category.name) }))
    .sort((categoryA, categoryB) => categoryA.displayName.localeCompare(categoryB.displayName));
}

export function findBrandCategory(
  product: { readonly categories: ReadonlyArray<Pick<ProductCategory, 'id'>> },
  categories: readonly ProductCategory[]
): ProductCategory | undefined {
  const brandIds = brandCategoryIds(categories);
  const brandCategoryId = product.categories.find((category) => brandIds.has(category.id))?.id;
  return categories.find((category) => category.id === brandCategoryId);
}

export const buildCategoryTree = (categories: readonly ProductCategory[]): CategoryGroup[] => {
  const roots = categories
    .filter((category) => !category.parent || category.parent === 0)
    .sort((categoryA, categoryB) =>
      decodeCategoryName(categoryA.name).localeCompare(decodeCategoryName(categoryB.name))
    );

  return roots.flatMap((root) => {
    const children = categories
      .filter((category) => category.parent === root.id)
      .sort((categoryA, categoryB) =>
        decodeCategoryName(categoryA.name).localeCompare(decodeCategoryName(categoryB.name))
      )
      .map((category) => ({ ...category, displayName: decodeCategoryName(category.name) }));

    if (children.length === 0) return [];
    return [{ parent: { ...root, displayName: decodeCategoryName(root.name) }, children }];
  });
};
