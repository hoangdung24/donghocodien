import { COUNTRY_TO_CURRENCY } from '@/lib/data/countryCurrency';

export const EXCHANGE_RATES_CACHE_KEY = 'spacetime_usd_rates_v2';
export const EXCHANGE_RATE_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

export interface CachedExchangeRates {
  rates: Record<string, number>;
  timestamp: number;
}

export function isExchangeRateExpired(
  cachedTimestamp: number,
  currentTimestamp: number = Date.now(),
  ttlMs: number = EXCHANGE_RATE_CACHE_TTL_MS
): boolean {
  if (!cachedTimestamp || cachedTimestamp <= 0) {
    return true;
  }
  return currentTimestamp - cachedTimestamp >= ttlMs;
}

export function resolveCountryCurrency(countryCode: string | null | undefined): string | null {
  if (!countryCode) return null;
  return COUNTRY_TO_CURRENCY[countryCode.trim().toUpperCase()] ?? null;
}

export function resolveApproxDisplayCurrency(
  countryCode: string | null | undefined
): string | null {
  const currency = resolveCountryCurrency(countryCode);
  return currency && currency !== 'USD' ? currency : null;
}

const zeroDecimalCache = new Map<string, boolean>();

function isZeroDecimalCurrency(currencyCode: string): boolean {
  const cached = zeroDecimalCache.get(currencyCode);
  if (cached !== undefined) return cached;
  let zeroDecimal = false;
  try {
    zeroDecimal =
      new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currencyCode,
      }).resolvedOptions().maximumFractionDigits === 0;
  } catch {
    zeroDecimal = false;
  }
  zeroDecimalCache.set(currencyCode, zeroDecimal);
  return zeroDecimal;
}

export function formatApproxPrice(
  usdAmount: number | string,
  currencyCode: string,
  rates: Record<string, number> | null | undefined
): string {
  if (currencyCode === 'USD') return '';
  const num = typeof usdAmount === 'string' ? parseFloat(usdAmount) : usdAmount;
  if (isNaN(num) || num <= 0) return '';
  const rate = rates?.[currencyCode];
  if (!rate || rate <= 0) return '';
  const step = isZeroDecimalCurrency(currencyCode) ? 1000 : 10;
  const rounded = Math.round((num * rate) / step) * step;
  try {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 0,
    })
      .format(rounded)
      .replace(/[\u00A0\u202F]/g, ' ');
    return `≈ ${formatted}`;
  } catch {
    return '';
  }
}

export async function getExchangeRates(): Promise<Record<string, number> | null> {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const rawCache = window.localStorage.getItem(EXCHANGE_RATES_CACHE_KEY);
    if (rawCache) {
      const parsed: CachedExchangeRates = JSON.parse(rawCache);
      if (parsed.rates && parsed.rates.VND > 0 && !isExchangeRateExpired(parsed.timestamp)) {
        return parsed.rates;
      }
    }
  } catch {}

  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!response.ok) {
      throw new Error(`Exchange rate API responded with status ${response.status}`);
    }
    const data = await response.json();
    const rates = data?.rates;
    if (rates && typeof rates === 'object' && Number(rates.VND) > 0) {
      const cachePayload: CachedExchangeRates = {
        rates,
        timestamp: Date.now(),
      };
      window.localStorage.setItem(EXCHANGE_RATES_CACHE_KEY, JSON.stringify(cachePayload));
      return rates;
    }
  } catch (error) {
    console.warn('Unable to refresh exchange rates, falling back to cached rates:', error);
  }

  try {
    const rawCache = window.localStorage.getItem(EXCHANGE_RATES_CACHE_KEY);
    if (rawCache) {
      const parsed: CachedExchangeRates = JSON.parse(rawCache);
      if (parsed?.rates && parsed.rates.VND > 0) return parsed.rates;
    }
  } catch {}

  return null;
}
