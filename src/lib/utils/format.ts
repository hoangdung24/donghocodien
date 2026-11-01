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

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

/**
 * Formats a Date object in the exact style of donghocodien.com live header ("Nov 01 16:21:34")
 */
export function formatHeaderClock(date: Date): string {
  const month = MONTH_NAMES[date.getMonth()];
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${month} ${day} ${hours}:${minutes}:${seconds}`;
}
