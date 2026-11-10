import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { CartProvider } from '@/lib/context/CartContext';
import { Snackbar } from '@/components/Snackbar';
import { detectVisitorCountry } from '@/lib/utils/geo';
import { APPROX_PRICING_VISIBILITY_CLASS, shouldHideApproxPricing } from '@/lib/utils/visual';

function ApproxPricingSync() {
  useEffect(() => {
    let cancelled = false;
    void detectVisitorCountry().then((country) => {
      if (cancelled) return;
      if (country && !shouldHideApproxPricing(country)) {
        document.documentElement.classList.remove(APPROX_PRICING_VISIBILITY_CLASS);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);
  return null;
}

interface Props {
  children: ReactNode;
}

export function Providers({ children }: Props) {
  return (
    <CartProvider>
      <ApproxPricingSync />
      {children}
      <Snackbar />
    </CartProvider>
  );
}
