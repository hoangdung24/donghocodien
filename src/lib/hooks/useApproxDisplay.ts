import { useEffect, useState } from 'react';
import { resolveApproxDisplayCurrency } from '@/lib/utils/currency';
import { detectVisitorCountry, readVisitorCountry } from '@/lib/utils/geo';
import {
  hasSharedExchangeRates,
  loadSharedExchangeRates,
  readSharedExchangeRates,
  subscribeExchangeRates,
} from '@/lib/hooks/exchangeRates';

export interface ApproxDisplay {
  currency: string;
  rates: Record<string, number> | null;
}

function resolveDisplay(country: string | null | undefined): ApproxDisplay | null {
  const currency = resolveApproxDisplayCurrency(country);
  if (!currency) return null;
  return { currency, rates: readSharedExchangeRates() };
}

export function useApproxDisplay(country?: string | null): ApproxDisplay | null {
  const [display, setDisplay] = useState<ApproxDisplay | null>(() => resolveDisplay(country));

  useEffect(() => {
    let cancelled = false;

    const unsubscribe = subscribeExchangeRates((rates) => {
      if (cancelled || !rates) return;
      setDisplay((current) => (current ? { ...current, rates } : current));
    });

    const apply = (resolvedCountry: string | null) => {
      if (cancelled) return;
      const next = resolveDisplay(resolvedCountry);
      setDisplay(next);
      if (next && !hasSharedExchangeRates()) void loadSharedExchangeRates();
    };

    const knownCountry = country ?? readVisitorCountry();
    if (knownCountry) {
      apply(knownCountry);
    } else {
      detectVisitorCountry().then((detected) => apply(detected));
    }

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [country]);

  return display;
}
