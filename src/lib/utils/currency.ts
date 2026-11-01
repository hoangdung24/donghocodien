export const DEFAULT_USD_TO_VND_RATE = 25800;
export const EXCHANGE_RATE_CACHE_KEY = 'spacetime_usd_vnd_rate';
export const EXCHANGE_RATE_CACHE_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

export interface CachedExchangeRate {
  rate: number;
  timestamp: number;
}

/**
 * Checks if a cached exchange rate timestamp has exceeded the TTL (6 hours)
 */
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

/**
 * Formats approximate VND amount matching live site ("Approx. VND 46.400.000")
 */
export function formatApproxVND(
  usdAmount: number,
  rate: number = DEFAULT_USD_TO_VND_RATE
): string {
  const effectiveRate = rate > 0 ? rate : DEFAULT_USD_TO_VND_RATE;
  const rawVnd = usdAmount * effectiveRate;
  // Round to nearest 100,000 VND matching live luxury watch pricing convention
  const roundedVnd = Math.round(rawVnd / 100000) * 100000;
  
  // Format with dot thousand separator (vi-VN standard: 46.400.000)
  const formattedNumber = roundedVnd.toLocaleString('vi-VN');
  return `Approx. VND ${formattedNumber}`;
}

/**
 * Retrieves the USD to VND exchange rate from localStorage or fetches from Open Exchange API
 * Caches in localStorage and revalidates every 6 hours
 */
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
    // Ignore localStorage parse error and proceed to refresh
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

  // Fallback to existing stale cache if available, otherwise default constant
  try {
    const staleCache = window.localStorage.getItem(EXCHANGE_RATE_CACHE_KEY);
    if (staleCache) {
      const parsed = JSON.parse(staleCache);
      if (parsed?.rate > 0) return parsed.rate;
    }
  } catch {
    // fallback
  }

  return DEFAULT_USD_TO_VND_RATE;
}
