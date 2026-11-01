import { describe, it, expect } from 'vitest';
import { formatUSD, calculateDiscountPercentage, formatHeaderClock } from './format';

describe('formatUSD', () => {
  it('formats whole dollar amounts correctly with comma separation', () => {
    expect(formatUSD(8000)).toBe('$8,000');
    expect(formatUSD(1200)).toBe('$1,200');
    expect(formatUSD(499)).toBe('$499');
  });

  it('handles zero and undefined gracefully', () => {
    expect(formatUSD(0)).toBe('$0');
  });
});

describe('calculateDiscountPercentage', () => {
  it('calculates the correct integer discount percentage', () => {
    expect(calculateDiscountPercentage(1500, 1100)).toBe(27);
    expect(calculateDiscountPercentage(1200, 1000)).toBe(17);
  });

  it('returns 0 if regular price is zero or sale is equal/higher', () => {
    expect(calculateDiscountPercentage(1000, 1000)).toBe(0);
    expect(calculateDiscountPercentage(1000, 1200)).toBe(0);
  });
});

describe('formatHeaderClock', () => {
  it('formats dates in "MMM DD HH:mm:ss" format matching live site', () => {
    const testDate = new Date(2026, 10, 1, 16, 21, 34);
    expect(formatHeaderClock(testDate)).toBe('Nov 01 16:21:34');
  });

  it('pads single-digit days, hours, minutes, and seconds with leading zero', () => {
    const testDate = new Date(2026, 0, 5, 8, 4, 9);
    expect(formatHeaderClock(testDate)).toBe('Jan 05 08:04:09');
  });
});
