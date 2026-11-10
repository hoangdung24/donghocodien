import { COUNTRY_TO_CURRENCY } from '@/lib/data/countryCurrency';
import { formatApproxPrice, resolveApproxDisplayCurrency } from '@/lib/utils/currency';

const WIDEST_USD_AMOUNT = '999999';
const KNOWN_RATES: Record<string, number> = { VND: 30500, EUR: 0.95 };
const GENERIC_RATE = 1;

const FALLBACK_RATES: Record<string, number> = Object.values(COUNTRY_TO_CURRENCY).reduce<
  Record<string, number>
>((rates, code) => {
  rates[code] = KNOWN_RATES[code] ?? GENERIC_RATE;
  return rates;
}, {});

export function approxPriceReserveText(usdPrice: string, country?: string | null): string | null {
  return approxPriceReserve(usdPrice, country);
}

export function approxPriceReserve(usdPrice: string, country?: string | null): string | null {
  const currency = resolveApproxDisplayCurrency(country);
  if (!currency) return null;
  const widestPrice = formatApproxPrice(WIDEST_USD_AMOUNT, currency, FALLBACK_RATES);
  return widestPrice || null;
}
