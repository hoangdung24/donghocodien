import { formatApproxPrice, resolveApproxDisplayCurrency } from '@/lib/utils/currency';

const WIDEST_USD_AMOUNT = '999999';
const FALLBACK_RATES: Record<string, number> = { VND: 30500, EUR: 0.95 };

export function approxPriceReserveText(usdPrice: string, country?: string | null): string | null {
  return approxPriceReserve(usdPrice, country);
}

export function approxPriceReserve(usdPrice: string, country?: string | null): string | null {
  const currency = resolveApproxDisplayCurrency(country);
  if (!currency) return null;
  const widestPrice = formatApproxPrice(WIDEST_USD_AMOUNT, currency, FALLBACK_RATES);
  return widestPrice || null;
}
