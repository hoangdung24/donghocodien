import { useEffect, useState } from 'react';
import { getExchangeRates, resolveApproxDisplayCurrency } from '@/lib/utils/currency';
import { detectVisitorCountry, readVisitorCountry } from '@/lib/utils/geo';

export interface ApproxDisplay {
  currency: string;
  rates: Record<string, number> | null;
}

export function useApproxDisplay(country?: string | null): ApproxDisplay | null {
  const [display, setDisplay] = useState<ApproxDisplay | null>(() => {
    const currency = resolveApproxDisplayCurrency(country);
    return currency ? { currency, rates: null } : null;
  });

  useEffect(() => {
    let cancelled = false;

    const apply = (resolvedCountry: string | null) => {
      const currency = resolveApproxDisplayCurrency(resolvedCountry);
      if (!currency) {
        setDisplay(null);
        return;
      }
      getExchangeRates().then((rates) => {
        if (!cancelled && rates) {
          setDisplay({ currency, rates });
        }
      });
    };

    const known = country ?? readVisitorCountry();
    if (known) {
      apply(known);
    } else {
      detectVisitorCountry().then((detected) => {
        if (!cancelled) apply(detected);
      });
    }

    return () => {
      cancelled = true;
    };
  }, [country]);

  return display;
}
