import { describe, it, expect } from 'vitest';
import {
  formatApproxVND,
  isExchangeRateExpired,
  DEFAULT_USD_TO_VND_RATE,
  EXCHANGE_RATE_CACHE_TTL_MS,
} from './currency';

describe('formatApproxVND', () => {
  it('calculates and formats approximate VND with dot thousand separators', () => {
    expect(formatApproxVND(1800, 25777.7778)).toBe('Approx. VND 46.400.000');
    expect(formatApproxVND(1400, 25785.7143)).toBe('Approx. VND 36.100.000');
    expect(formatApproxVND(1200, 25833.3333)).toBe('Approx. VND 31.000.000');
  });

  it('rounds to clean hundreds of thousands or nearest thousand for elegant display', () => {
    expect(formatApproxVND(1000, 25800)).toBe('Approx. VND 25.800.000');
    expect(formatApproxVND(8000, 25800)).toBe('Approx. VND 206.400.000');
  });

  it('uses default fallback rate if invalid rate is provided', () => {
    const formatted = formatApproxVND(1000, 0);
    expect(formatted).toBe(`Approx. VND ${(1000 * DEFAULT_USD_TO_VND_RATE).toLocaleString('vi-VN')}`);
  });
});

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
