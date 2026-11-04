import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  formatApproxPrice,
  isExchangeRateExpired,
  getExchangeRates,
  resolveCountryCurrency,
  resolveApproxDisplayCurrency,
  EXCHANGE_RATE_CACHE_TTL_MS,
  EXCHANGE_RATES_CACHE_KEY,
} from './currency';

describe('isExchangeRateExpired', () => {
  it('returns false when cached timestamp is within 6 hours', () => {
    const now = Date.now();
    const threeHoursAgo = now - 3 * 60 * 60 * 1000;
    expect(isExchangeRateExpired(threeHoursAgo, now, EXCHANGE_RATE_CACHE_TTL_MS)).toBe(false);
  });

  it('returns true when cached timestamp is older than 6 hours', () => {
    const now = Date.now();
    const sevenHoursAgo = now - 7 * 60 * 60 * 1000;
    expect(isExchangeRateExpired(sevenHoursAgo, now, EXCHANGE_RATE_CACHE_TTL_MS)).toBe(true);
  });

  it('returns true when timestamp is missing or zero', () => {
    expect(isExchangeRateExpired(0, Date.now(), EXCHANGE_RATE_CACHE_TTL_MS)).toBe(true);
  });
});

describe('resolveCountryCurrency', () => {
  it('maps countries to their local currency', () => {
    expect(resolveCountryCurrency('VN')).toBe('VND');
    expect(resolveCountryCurrency('DE')).toBe('EUR');
    expect(resolveCountryCurrency('FR')).toBe('EUR');
    expect(resolveCountryCurrency('GB')).toBe('GBP');
    expect(resolveCountryCurrency('JP')).toBe('JPY');
    expect(resolveCountryCurrency('SG')).toBe('SGD');
    expect(resolveCountryCurrency('CH')).toBe('CHF');
    expect(resolveCountryCurrency('PL')).toBe('PLN');
  });

  it('is case-insensitive and tolerates whitespace', () => {
    expect(resolveCountryCurrency('vn')).toBe('VND');
    expect(resolveCountryCurrency(' jp ')).toBe('JPY');
  });

  it('returns null for unknown or missing countries', () => {
    expect(resolveCountryCurrency('ZZ')).toBeNull();
    expect(resolveCountryCurrency('')).toBeNull();
    expect(resolveCountryCurrency(null)).toBeNull();
    expect(resolveCountryCurrency(undefined)).toBeNull();
  });
});

describe('resolveApproxDisplayCurrency', () => {
  it('returns null for US visitors because USD is already the displayed currency', () => {
    expect(resolveApproxDisplayCurrency('US')).toBeNull();
  });

  it('returns the local currency for other mapped countries', () => {
    expect(resolveApproxDisplayCurrency('VN')).toBe('VND');
    expect(resolveApproxDisplayCurrency('FR')).toBe('EUR');
    expect(resolveApproxDisplayCurrency('JP')).toBe('JPY');
  });

  it('returns null when the country is unknown', () => {
    expect(resolveApproxDisplayCurrency('ZZ')).toBeNull();
    expect(resolveApproxDisplayCurrency(undefined)).toBeNull();
  });
});

describe('formatApproxPrice', () => {
  it('formats VND like every other currency', () => {
    expect(formatApproxPrice(1800, 'VND', { VND: 25777.7778 })).toBe('≈ ₫46,400,000');
    expect(formatApproxPrice(300, 'VND', { VND: 25800 })).toBe('≈ ₫7,740,000');
  });

  it('formats EUR with the euro symbol and en-US grouping rounded to nearest ten', () => {
    expect(formatApproxPrice(1800, 'EUR', { EUR: 0.92 })).toBe('≈ €1,660');
    expect(formatApproxPrice(1000, 'EUR', { EUR: 0.92 })).toBe('≈ €920');
  });

  it('formats JPY rounded to the nearest thousand without decimals', () => {
    expect(formatApproxPrice(1800, 'JPY', { JPY: 150 })).toBe('≈ ¥270,000');
  });

  it('formats SGD falling back to the currency code when no common symbol exists', () => {
    expect(formatApproxPrice(1000, 'SGD', { SGD: 1.34 })).toBe('≈ SGD 1,340');
  });

  it('returns an empty string for USD', () => {
    expect(formatApproxPrice(1000, 'USD', { USD: 1 })).toBe('');
  });

  it('returns an empty string when the rate is missing', () => {
    expect(formatApproxPrice(1000, 'JPY', {})).toBe('');
    expect(formatApproxPrice(1000, 'JPY', null)).toBe('');
    expect(formatApproxPrice(1000, 'VND', null)).toBe('');
  });

  it('returns an empty string for invalid amounts', () => {
    expect(formatApproxPrice('abc', 'EUR', { EUR: 0.92 })).toBe('');
    expect(formatApproxPrice(0, 'EUR', { EUR: 0.92 })).toBe('');
    expect(formatApproxPrice('abc', 'VND', { VND: 25800 })).toBe('');
  });
});

describe('getExchangeRates', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns null on the server where window is undefined', async () => {
    await expect(getExchangeRates()).resolves.toBeNull();
  });

  it('fetches rates once and reuses the fresh cache', async () => {
    const store = new Map<string, string>();
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => store.set(key, value),
      },
    });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ rates: { EUR: 0.92, VND: 25800 } }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const first = await getExchangeRates();
    expect(first).toEqual({ EUR: 0.92, VND: 25800 });

    const second = await getExchangeRates();
    expect(second).toEqual({ EUR: 0.92, VND: 25800 });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('falls back to the stale cache when the fetch fails', async () => {
    const stale = {
      rates: { VND: 25000 },
      timestamp: Date.now() - 10 * 60 * 60 * 1000,
    };
    const store = new Map<string, string>([[EXCHANGE_RATES_CACHE_KEY, JSON.stringify(stale)]]);
    vi.stubGlobal('window', {
      localStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => store.set(key, value),
      },
    });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    await expect(getExchangeRates()).resolves.toEqual({ VND: 25000 });
  });

  it('returns null when the fetch fails and there is no cache', async () => {
    vi.stubGlobal('window', {
      localStorage: {
        getItem: () => null,
        setItem: () => undefined,
      },
    });
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));

    await expect(getExchangeRates()).resolves.toBeNull();
  });
});
