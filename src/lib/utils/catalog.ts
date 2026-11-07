import type { Product, ProductCategory } from '@/lib/schema/product';

export interface CatalogSource {
  page: number;
  search?: string;
  categories: ProductCategory[];
  activeCategoryId?: number;
}

export function filterCatalog(
  products: readonly Product[],
  categories: readonly ProductCategory[],
  { page, search, activeCategoryId }: CatalogSource,
  pageSize: number
): Product[] {
  const categoryIds = activeCategoryId
    ? [activeCategoryId, ...descendantCategoryIds(categories, activeCategoryId)]
    : null;
  const needle = search?.trim().toLowerCase();

  const matching = products.filter((product) => {
    const inStock = product.is_in_stock && Number(product.prices.price) > 0;
    const inCategory = categoryIds
      ? product.categories.some((category) => categoryIds.includes(category.id))
      : true;
    const matchesSearch = needle
      ? `${product.name} ${product.sku ?? ''}`.toLowerCase().includes(needle)
      : true;
    return inStock && inCategory && matchesSearch;
  });

  const start = Math.max(0, (page - 1) * pageSize);
  return matching.slice(start, start + pageSize);
}

export function descendantCategoryIds(
  categories: readonly ProductCategory[],
  rootId: number
): number[] {
  return categories
    .filter((category) => category.parent === rootId)
    .flatMap((category) => [category.id, ...descendantCategoryIds(categories, category.id)]);
}
