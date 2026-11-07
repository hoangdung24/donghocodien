import { Effect } from 'effect';
import type { Product, ProductCategory } from '@/lib/schema/product';
import { getCategories, getProductsPage } from '@/lib/services/woocommerce';
import { categoryIdFromParam } from '@/lib/utils/categories';
import { descendantCategoryIds } from '@/lib/utils/catalog';

export const ARCHIVE_PAGE_SIZE = 20;

export interface ArchivePageData {
  products: readonly Product[];
  categories: ProductCategory[];
  activeCategoryId?: number;
  hasNextPage: boolean;
}

export const loadArchivePage = async ({
  page,
  search,
  rawCategory,
}: {
  page: number;
  search?: string;
  rawCategory?: string;
}): Promise<ArchivePageData> => {
  const categoriesResult = await Effect.runPromiseExit(getCategories);
  const categories = categoriesResult._tag === 'Success' ? categoriesResult.value : [];
  const activeCategoryId = categoryIdFromParam(rawCategory, categories);

  const selectedCategoryIds = activeCategoryId
    ? [activeCategoryId, ...descendantCategoryIds(categories, activeCategoryId)]
    : undefined;

  const productsResult = await Effect.runPromiseExit(
    getProductsPage({
      page,
      per_page: ARCHIVE_PAGE_SIZE,
      search,
      category: selectedCategoryIds,
      stock_status: 'outofstock',
    })
  );

  const products = productsResult._tag === 'Success' ? productsResult.value.products : [];
  const totalPages = productsResult._tag === 'Success' ? productsResult.value.totalPages : 1;

  return { products, categories, activeCategoryId, hasNextPage: totalPages > page };
};
