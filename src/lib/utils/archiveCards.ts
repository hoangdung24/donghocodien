export type ProductCardState = 'purchasable' | 'sold';

interface PurchasabilityInput {
  is_in_stock?: boolean | null;
  prices?: { price?: string | null } | null;
}

export function pageProductCardState(product: PurchasabilityInput): ProductCardState {
  if (product.is_in_stock !== true) return 'sold';
  const price = Number(product.prices?.price ?? 0);
  return Number.isFinite(price) && price > 0 ? 'purchasable' : 'sold';
}
