export const DEFAULT_USD_TO_VND_RATE = 25800;
export const EXCHANGE_RATE_CACHE_KEY = 'spacetime_usd_vnd_rate';
export const EXCHANGE_RATE_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

export interface CachedExchangeRate {
  rate: number;
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

export function formatApproxVND(
  usdAmount: number | string,
  rate: number = DEFAULT_USD_TO_VND_RATE
): string {
  const num = typeof usdAmount === 'string' ? parseFloat(usdAmount) : usdAmount;
  if (isNaN(num)) return 'Approx. VND 0';
  const effectiveRate = rate > 0 ? rate : DEFAULT_USD_TO_VND_RATE;
  const rawVnd = num * effectiveRate;
  const roundedVnd = Math.round(rawVnd / 100000) * 100000;
  const formattedNumber = roundedVnd.toLocaleString('vi-VN');
  return `Approx. VND ${formattedNumber}`;
}

export async function getClientExchangeRate(): Promise<number> {
  if (typeof window === 'undefined') {
    return DEFAULT_USD_TO_VND_RATE;
  }

  try {
    const rawCache = window.localStorage.getItem(EXCHANGE_RATE_CACHE_KEY);
    if (rawCache) {
      const parsed: CachedExchangeRate = JSON.parse(rawCache);
      if (parsed.rate > 0 && !isExchangeRateExpired(parsed.timestamp)) {
        return parsed.rate;
      }
    }
  } catch (err) {
  }

  try {
    const response = await fetch('https://open.er-api.com/v6/latest/USD');
    if (!response.ok) {
      throw new Error(`Exchange rate API responded with status ${response.status}`);
    }
    const data = await response.json();
    const rate = Number(data?.rates?.VND);

    if (rate && rate > 0) {
      const cachePayload: CachedExchangeRate = {
        rate,
        timestamp: Date.now(),
      };
      window.localStorage.setItem(EXCHANGE_RATE_CACHE_KEY, JSON.stringify(cachePayload));
      return rate;
    }
  } catch (err) {
    console.warn('Unable to refresh exchange rate, falling back to local/default rate:', err);
  }

  try {
    const staleCache = window.localStorage.getItem(EXCHANGE_RATE_CACHE_KEY);
    if (staleCache) {
      const parsed = JSON.parse(staleCache);
      if (parsed?.rate > 0) return parsed.rate;
    }
  } catch {
  }

  return DEFAULT_USD_TO_VND_RATE;
}
