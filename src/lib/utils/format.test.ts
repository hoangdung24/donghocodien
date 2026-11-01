import { describe, it, expect } from 'vitest';
import { formatUSD, calculateDiscountPercentage } from './format';

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
    // 1500 regular, 1100 sale -> 27%
    expect(calculateDiscountPercentage(1500, 1100)).toBe(27);
    // 1200 regular, 1000 sale -> 17%
    expect(calculateDiscountPercentage(1200, 1000)).toBe(17);
  });

  it('returns 0 if regular price is zero or sale is equal/higher', () => {
    expect(calculateDiscountPercentage(1000, 1000)).toBe(0);
    expect(calculateDiscountPercentage(1000, 1200)).toBe(0);
  });
});
