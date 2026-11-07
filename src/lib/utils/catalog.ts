import type { Product, ProductCategory } from '@/lib/schema/product';

export interface CatalogSource {
  page: number;
  search?: string;
  categories?: ProductCategory[];
  activeCategoryId?: number;
}

export function filterCatalog(
  products: readonly Product[],
  categories: readonly ProductCategory[],
  { page, search, activeCategoryId }: CatalogSource,
  pageSize: number
): { products: Product[]; total: number } {
  return filterByStock(
    products,
    categories,
    { page, search, activeCategoryId },
    pageSize,
    (product) => product.is_in_stock && Number(product.prices.price) > 0
  );
}

export function filterArchive(
  products: readonly Product[],
  categories: readonly ProductCategory[],
  { page, search, activeCategoryId }: CatalogSource,
  pageSize: number
): { products: Product[]; total: number } {
  return filterByStock(
    products,
    categories,
    { page, search, activeCategoryId },
    pageSize,
    (product) => !product.is_in_stock
  );
}

function filterByStock(
  products: readonly Product[],
  categories: readonly ProductCategory[],
  { page, search, activeCategoryId }: CatalogSource,
  pageSize: number,
  matchesStock: (product: Product) => boolean
): { products: Product[]; total: number } {
  const categoryIds = activeCategoryId
    ? [activeCategoryId, ...descendantCategoryIds(categories, activeCategoryId)]
    : null;
  const needle = search?.trim().toLowerCase();

  const matching = products.filter((product) => {
    const inCategory = categoryIds
      ? product.categories.some((category) => categoryIds.includes(category.id))
      : true;
    const matchesSearch = needle
      ? `${product.name} ${product.sku ?? ''}`.toLowerCase().includes(needle)
      : true;
    return matchesStock(product) && inCategory && matchesSearch;
  });

  const start = Math.max(0, (page - 1) * pageSize);
  return { products: matching.slice(start, start + pageSize), total: matching.length };
}

export function descendantCategoryIds(
  categories: readonly ProductCategory[],
  rootId: number
): number[] {
  return categories
    .filter((category) => category.parent === rootId)
    .flatMap((category) => [category.id, ...descendantCategoryIds(categories, category.id)]);
}
