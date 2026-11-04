import React, { ReactNode } from 'react';
import { CartProvider } from '../lib/context/CartContext';
import { Snackbar } from './Snackbar';

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