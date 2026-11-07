import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { cartStore, type CartState } from '../../lib/cartStore';
import type { Cart } from '../schema/cart';
import type { CheckoutRequest, CheckoutResponse } from '../services/cart';

interface CartContextType extends Omit<CartState, 'cart'> {
  cart: Cart | null;
  itemCount: number;
  totalPrice: string;
  currency: { code: string; symbol: string };
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (key: string, quantity: number) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
  processCheckout: (request: CheckoutRequest) => Promise<CheckoutResponse>;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({
  children,
  initialCart = null,
}: {
  children: ReactNode;
  initialCart?: Cart | null;
}) {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    if (initialCart) {
      cartStore.setState({ cart: initialCart, isLoading: false });
    } else {
      cartStore.loadCart();
    }
    const unsubscribe = cartStore.subscribe(() => forceUpdate((count) => count + 1));
    return unsubscribe;
  }, [initialCart]);

  const addItem = useCallback(async (productId: number, quantity = 1) => {
    await cartStore.addItem(productId, quantity);
  }, []);

  const updateQuantity = useCallback(async (key: string, quantity: number) => {
    await cartStore.updateQuantity(key, quantity);
  }, []);

  const removeItem = useCallback(async (key: string) => {
    await cartStore.removeItem(key);
  }, []);

  const clearCart = useCallback(async () => {
    await cartStore.clearCart();
  }, []);

  const refreshCart = useCallback(async () => {
    await cartStore.loadCart();
  }, []);

  const processCheckout = useCallback(
    async (request: CheckoutRequest): Promise<CheckoutResponse> => {
      return cartStore.processCheckout(request);
    },
    []
  );

  const value: CartContextType = {
    cart: cartStore.getState().cart,
    isLoading: cartStore.getState().isLoading,
    error: cartStore.getState().error,
    isDrawerOpen: cartStore.getState().isDrawerOpen,
    itemCount: cartStore.itemCount,
    totalPrice: cartStore.totalPrice,
    currency: cartStore.currency,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart,
    processCheckout,
    openDrawer: cartStore.openDrawer.bind(cartStore),
    closeDrawer: cartStore.closeDrawer.bind(cartStore),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

const SERVER_SNAPSHOT: CartState = {
  cart: null,
  isLoading: true,
  error: null,
  isDrawerOpen: false,
};

function useCartStore() {
  const snapshot = useSyncExternalStore(
    cartStore.subscribe.bind(cartStore),
    cartStore.getState.bind(cartStore),
    () => SERVER_SNAPSHOT
  );
  return snapshot;
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (context) return context;

  const snapshot = useCartStore();

  return {
    cart: snapshot.cart,
    isLoading: snapshot.isLoading,
    error: snapshot.error,
    isDrawerOpen: snapshot.isDrawerOpen,
    itemCount: cartStore.itemCount,
    totalPrice: cartStore.totalPrice,
    currency: cartStore.currency,
    addItem: cartStore.addItem.bind(cartStore),
    updateQuantity: cartStore.updateQuantity.bind(cartStore),
    removeItem: cartStore.removeItem.bind(cartStore),
    clearCart: cartStore.clearCart.bind(cartStore),
    refreshCart: cartStore.loadCart.bind(cartStore),
    processCheckout: cartStore.processCheckout.bind(cartStore),
    openDrawer: cartStore.openDrawer.bind(cartStore),
    closeDrawer: cartStore.closeDrawer.bind(cartStore),
  };
}

export function useCartItemCount() {
  const { itemCount } = useCart();
  return itemCount;
}

export function useCartTotal() {
  const { totalPrice, currency } = useCart();
  return { totalPrice, currency };
}

export function useCartDrawer() {
  const { isDrawerOpen, openDrawer, closeDrawer } = useCart();
  return { isDrawerOpen, openDrawer, closeDrawer };
}
