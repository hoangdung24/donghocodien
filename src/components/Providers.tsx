import React, { ReactNode } from 'react';
import { CartProvider } from '../lib/context/CartContext';

interface Props {
  children: ReactNode;
}

export function Providers({ children }: Props) {
  return <CartProvider>{children}</CartProvider>;
}