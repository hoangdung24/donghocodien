import { describe, it, expect } from 'vitest';
import {
  APPROX_PRICING_VISIBILITY_CLASS,
  resolveApproxPricingVisibility,
} from '@/lib/utils/visual';

describe('resolveApproxPricingVisibility', () => {
  it('renders approximate pricing from the server for visitors from non-USD countries', () => {
    expect(resolveApproxPricingVisibility('VN')).toEqual({ initiallyHidden: false, className: '' });
    expect(resolveApproxPricingVisibility('JP')).toEqual({ initiallyHidden: false, className: '' });
  });

  it('hides approximate pricing when the visitor is already in the USD base market', () => {
    expect(resolveApproxPricingVisibility('US')).toEqual({
      initiallyHidden: true,
      className: APPROX_PRICING_VISIBILITY_CLASS,
    });
  });

  it('keeps approximate pricing hidden when the country is unknown or invalid', () => {
    expect(resolveApproxPricingVisibility(null)).toEqual({
      initiallyHidden: true,
      className: APPROX_PRICING_VISIBILITY_CLASS,
    });
    expect(resolveApproxPricingVisibility('zz')).toEqual({
      initiallyHidden: true,
      className: APPROX_PRICING_VISIBILITY_CLASS,
    });
  });
});
