/**
 * Approximate (non-USD) currency pricing visibility.
 *
 * Shared storefront pages are served from a country-independent edge cache, so the
 * `approx-pricing-hidden` hook is applied on the client: an inline head script hides
 * approximate prices while the market is unknown or USD, and a client effect removes
 * the hook once a resolvable non-USD market is known.
 */
export const APPROX_PRICING_VISIBILITY_CLASS = 'approx-pricing-hidden';

const HIDDEN_MARKETS = ['US'];

export function shouldHideApproxPricing(country: string | null | undefined): boolean {
  if (typeof country !== 'string') return true;
  const normalized = country.trim();
  if (!/^[A-Z]{2}$/.test(normalized)) return true;
  return HIDDEN_MARKETS.includes(normalized);
}
