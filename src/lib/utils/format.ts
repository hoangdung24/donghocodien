export function formatUSD(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '$0';
  const rounded = Math.round(num);
  return `$${rounded.toLocaleString('en-US')}`;
}

export function formatPrice(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '$0';
  const rounded = Math.round(num);
  return `$${rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

export function calculateDiscountPercentage(
  regularPrice: number | string,
  salePrice: number | string
): number {
  const regular = typeof regularPrice === 'string' ? parseFloat(regularPrice) : regularPrice;
  const sale = typeof salePrice === 'string' ? parseFloat(salePrice) : salePrice;
  if (isNaN(regular) || isNaN(sale) || regular <= 0 || sale >= regular) {
    return 0;
  }
  const discount = ((regular - sale) / regular) * 100;
  return Math.round(discount);
}

const MONTH_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

export function formatHeaderClock(date: Date): string {
  const month = MONTH_NAMES[date.getMonth()];
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${month} ${day} ${hours}:${minutes}:${seconds}`;
}
