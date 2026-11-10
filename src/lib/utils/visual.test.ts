import { describe, it, expect } from 'vitest';
import { APPROX_PRICING_VISIBILITY_CLASS, shouldHideApproxPricing } from './visual';

describe('APPROX_PRICING_VISIBILITY_CLASS', () => {
  it('is the CSS hook hiding approximate prices', () => {
    expect(APPROX_PRICING_VISIBILITY_CLASS).toBe('approx-pricing-hidden');
  });
});

describe('shouldHideApproxPricing', () => {
  it('hides for unknown markets until the client resolves one', () => {
    expect(shouldHideApproxPricing(null)).toBe(true);
    expect(shouldHideApproxPricing('zz')).toBe(true);
  });

  it('hides for USD markets', () => {
    expect(shouldHideApproxPricing('US')).toBe(true);
    expect(shouldHideApproxPricing('us')).toBe(true);
  });

  it('shows for markets with a non-USD approximation', () => {
    expect(shouldHideApproxPricing('VN')).toBe(false);
    expect(shouldHideApproxPricing('JP')).toBe(false);
  });
});
