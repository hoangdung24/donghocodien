/**
 * Formats a numeric USD price with comma separators (e.g. $8,000)
 */
export function formatUSD(amount: number): string {
  const rounded = Math.round(amount);
  return `$${rounded.toLocaleString('en-US')}`;
}

/**
 * Calculates discount percentage rounded to the nearest integer
 */
export function calculateDiscountPercentage(regularPrice: number, salePrice: number): number {
  if (regularPrice <= 0 || salePrice >= regularPrice) {
    return 0;
  }
  const discount = ((regularPrice - salePrice) / regularPrice) * 100;
  return Math.round(discount);
}
