import { Effect } from 'effect';
import type { Product, ProductCategory } from '@/lib/schema/product';
import {
  getCategories,
  getProductBySlug,
  getProducts,
  getProductsPage,
} from '@/lib/services/woocommerce';
import { findBrandCategory } from '@/lib/utils/categories';

const RELATED_COUNT = 12;

export interface WatchDetailData {
  product: Product;
  relatedProducts: Product[];
  categories: ProductCategory[];
}

const loadRelatedProducts = async (
  product: Product,
  categories: ProductCategory[]
): Promise<Product[]> => {
  const primaryBrand = findBrandCategory(product, categories);
  if (!primaryBrand) return [];

  const result = await Effect.runPromiseExit(
    getProducts({
      category: primaryBrand.id,
      stock_status: 'instock',
      per_page: RELATED_COUNT + 1,
    })
  );

  if (result._tag === 'Failure') return [];

  return result.value
    .filter((relatedProduct) => relatedProduct.id !== product.id)
    .slice(0, RELATED_COUNT);
};

export const loadWatchDetail = async (slug: string): Promise<WatchDetailData | null> => {
  const [productResult, categoriesResult] = await Effect.runPromise(
    Effect.all([Effect.exit(getProductBySlug(slug)), Effect.exit(getCategories)], {
      concurrency: 'unbounded',
    })
  );

  if (productResult._tag === 'Failure') return null;

  const categories = categoriesResult._tag === 'Success' ? categoriesResult.value : [];
  const relatedProducts = await loadRelatedProducts(productResult.value, categories);

  return { product: productResult.value, relatedProducts, categories };
};

export const getInStockSlugs = async (): Promise<string[]> => {
  const firstPage = await Effect.runPromiseExit(
    getProductsPage({ page: 1, per_page: 100, stock_status: 'instock' })
  );

  if (firstPage._tag === 'Failure') return [];

  const slugs = firstPage.value.products
    .filter((product) => product.is_in_stock && Number(product.prices.price) > 0)
    .map((product) => product.slug);

  const remainingPages = Array.from(
    { length: Math.max(0, firstPage.value.totalPages - 1) },
    (_, offset) => offset + 2
  );

  const remainingResults = await Effect.runPromise(
    Effect.forEach(
      remainingPages,
      (pageNumber) =>
        Effect.exit(getProductsPage({ page: pageNumber, per_page: 100, stock_status: 'instock' })),
      { concurrency: 3 }
    )
  );

  for (const pageResult of remainingResults) {
    if (pageResult._tag === 'Failure') continue;
    slugs.push(
      ...pageResult.value.products
        .filter((product) => product.is_in_stock && Number(product.prices.price) > 0)
        .map((product) => product.slug)
    );
  }

  return slugs;
};
