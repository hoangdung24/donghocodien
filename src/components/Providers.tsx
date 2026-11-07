import type { ReactNode } from 'react';
import { CartProvider } from '@/lib/context/CartContext';
import { Snackbar } from '@/components/Snackbar';

interface Props {
  children: ReactNode;
}

export function Providers({ children }: Props) {
  return (
    <CartProvider>
      {children}
      <Snackbar />
    </CartProvider>
  );
}
