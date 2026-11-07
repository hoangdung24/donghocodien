import type { Product } from '../schema/product';

export interface PriceRange {
  min: number;
  max: number;
}

export const withPriceRange = (
  search: string,
  range: PriceRange | null,
  basePath = '/watches'
): string => {
  const params = new URLSearchParams(search);
  if (range) {
    params.set('min_price', String(range.min));
    params.set('max_price', String(range.max));
  } else {
    params.delete('min_price');
    params.delete('max_price');
  }
  params.delete('page');
  const qs = params.toString();
  return `${basePath}${qs ? `?${qs}` : ''}`;
};

export const countByCategory = (products: readonly Product[]): Map<number, number> => {
  const counts = new Map<number, number>();
  for (const product of products) {
    for (const category of product.categories) {
      counts.set(category.id, (counts.get(category.id) ?? 0) + 1);
    }
  }
  return counts;
};

export const countInStockByCategory = (products: readonly Product[]): Map<number, number> =>
  countByCategory(
    products.filter((product) => product.is_in_stock && Number(product.prices.price) > 0)
  );
