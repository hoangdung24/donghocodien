/**
 * Approximate (non-USD) currency pricing visibility.
 *
 * The visitor's market is known on the server from the `st_country` cookie, so a page can
 * server-render whether approximate pricing starts visible. Only visitors whose market is
 * still unknown opt into `hidden`, keeping their layout reserved until detection resolves
 * instead of shifting content once prices are wiped or approximate prices appear.
 */
import { parseCountryCookie } from '@/lib/utils/geo';

export const APPROX_PRICING_VISIBILITY_CLASS = 'approx-pricing-hidden';

export interface ApproxPricingVisibility {
  initiallyHidden: boolean;
  className: string;
}

const HIDDEN: ApproxPricingVisibility = {
  initiallyHidden: true,
  className: APPROX_PRICING_VISIBILITY_CLASS,
};

const VISIBLE: ApproxPricingVisibility = { initiallyHidden: false, className: '' };

function isUppercaseCountryCode(value: string): boolean {
  return /^[A-Z]{2}$/.test(value);
}

export function resolveApproxPricingVisibility(
  country: string | null | undefined
): ApproxPricingVisibility {
  if (typeof country !== 'string') return HIDDEN;
  const normalized = country.trim();
  if (!isUppercaseCountryCode(normalized)) return HIDDEN;
  return normalized === 'US' ? HIDDEN : VISIBLE;
}

export function readRequestCountry(cookieHeader: string | null): string | null {
  return cookieHeader ? parseCountryCookie(cookieHeader) : null;
}
