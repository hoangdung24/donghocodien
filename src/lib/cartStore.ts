import type { Cart } from '@/lib/schema/cart';
import type { CheckoutRequest, CheckoutResponse } from '@/lib/services/cart';
import { toastStore } from '@/lib/toastStore';
import { resolveToastDuration } from '@/lib/toastDuration';
import { describeCartError } from '@/lib/utils/cartText';

const API_BASE = '/wc/store/v1';
const CART_TOKEN_KEY = 'wc-cart-token';

const stripHtml = (value: unknown): string =>
  typeof value === 'string' ? value.replace(/<[^>]*>/g, '').trim() : '';

export interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  isDrawerOpen: boolean;
}

type Listener = () => void;

export class CartStore {
  private state: CartState = {
    cart: null,
    isLoading: true,
    error: null,
    isDrawerOpen: false,
  };
  private listeners: Set<Listener> = new Set();
  private nonce: string | null = null;
  private cartToken: string | null = null;

  constructor() {
    if (typeof localStorage !== 'undefined') {
      this.cartToken = localStorage.getItem(CART_TOKEN_KEY);
    }
  }

  private async fetchWithNonce(url: string, options: RequestInit = {}): Promise<Response> {
    if (options.method && options.method !== 'GET' && !this.nonce) {
      await this.fetchWithNonce(`${API_BASE}/cart`);
    }
    const headers = new Headers(options.headers);
    headers.set('Accept', 'application/json');
    if (this.nonce) {
      headers.set('X-WC-Store-API-Nonce', this.nonce);
    }
    if (this.cartToken) {
      headers.set('Cart-Token', this.cartToken);
    }
    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    const nonce = response.headers.get('x-wc-store-api-nonce');
    if (nonce) {
      this.nonce = nonce;
    }
    const token = response.headers.get('cart-token');
    if (token && token !== this.cartToken) {
      this.cartToken = token;
      try {
        localStorage.setItem(CART_TOKEN_KEY, token);
      } catch {}
    }

    return response;
  }

  private async fetchCart(): Promise<Cart> {
    const response = await this.fetchWithNonce(`${API_BASE}/cart`);
    if (!response.ok) throw new Error('Failed to fetch cart');
    return response.json();
  }

  private async addToCartApi(productId: number, quantity = 1): Promise<Cart> {
    const response = await this.fetchWithNonce(`${API_BASE}/cart/add-item`, {
      method: 'POST',
      body: JSON.stringify({ id: productId, quantity }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to add to cart' }));
      throw new Error(error.message || 'Failed to add to cart');
    }
    return response.json();
  }

  private async updateCartItemApi(key: string, quantity: number): Promise<Cart> {
    const response = await this.fetchWithNonce(`${API_BASE}/cart/update-item`, {
      method: 'POST',
      body: JSON.stringify({ key, quantity }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update cart' }));
      throw new Error(error.message || 'Failed to update cart');
    }
    return response.json();
  }

  private async removeCartItemApi(key: string): Promise<Cart> {
    const response = await this.fetchWithNonce(`${API_BASE}/cart/remove-item`, {
      method: 'POST',
      body: JSON.stringify({ key }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to remove item' }));
      throw new Error(error.message || 'Failed to remove item');
    }
    return response.json();
  }

  private async clearCartApi(): Promise<Cart> {
    const response = await this.fetchWithNonce(`${API_BASE}/cart/items`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to clear cart' }));
      throw new Error(error.message || 'Failed to clear cart');
    }
    return response.json();
  }

  getState(): CartState {
    return this.state;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  setState(partial: Partial<CartState>): void {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  async loadCart(): Promise<void> {
    try {
      this.setState({ isLoading: true, error: null });
      const data = await this.fetchCart();
      writeCartCache(CART_CACHE_KEY, data);
      this.state = { ...this.state, cart: data, isLoading: false };
      this.notify();
    } catch (error) {
      this.setState({
        error: describeCartError(error, 'Failed to load cart'),
        isLoading: false,
      });
    }
  }

  async addItem(productId: number, quantity = 1): Promise<void> {
    try {
      this.setState({ error: null });
      const newCart = await this.addToCartApi(productId, quantity);
      writeCartCache(CART_CACHE_KEY, newCart);
      this.setState({ cart: newCart, isDrawerOpen: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add item';
      this.setState({ error: message });
      toastStore.show(message, 'error', resolveToastDuration('error'));
      throw err;
    }
  }

  async updateQuantity(key: string, quantity: number): Promise<void> {
    if (quantity < 1) return this.removeItem(key);
    try {
      this.setState({ error: null });
      const newCart = await this.updateCartItemApi(key, quantity);
      writeCartCache(CART_CACHE_KEY, newCart);
      this.setState({ cart: newCart });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update quantity';
      this.setState({ error: message });
      toastStore.show(message, 'error', resolveToastDuration('error'));
      throw err;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      this.setState({ error: null });
      const newCart = await this.removeCartItemApi(key);
      writeCartCache(CART_CACHE_KEY, newCart);
      this.setState({ cart: newCart });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove item';
      this.setState({ error: message });
      toastStore.show(message, 'error', resolveToastDuration('error'));
      throw err;
    }
  }

  async clearCart(): Promise<void> {
    try {
      this.setState({ error: null });
      const newCart = await this.clearCartApi();
      writeCartCache(CART_CACHE_KEY, newCart);
      this.setState({ cart: newCart });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to clear cart';
      this.setState({ error: message });
      toastStore.show(message, 'error', resolveToastDuration('error'));
      throw err;
    }
  }

  async processCheckout(request: CheckoutRequest): Promise<CheckoutResponse> {
    try {
      this.setState({ error: null });
      const response = await this.fetchWithNonce(`${API_BASE}/checkout`, {
        method: 'POST',
        body: JSON.stringify(request),
      });
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Checkout failed' }));
        throw new Error(stripHtml(error.message) || 'Checkout failed');
      }
      return response.json();
    } catch (err) {
      const message = stripHtml(err instanceof Error ? err.message : 'Checkout failed');
      this.setState({ error: message });
      throw new Error(message);
    }
  }

  openDrawer(): void {
    this.setState({ isDrawerOpen: true });
  }

  closeDrawer(): void {
    this.setState({ isDrawerOpen: false });
  }

  get itemCount(): number {
    return this.state.cart?.items_count ?? 0;
  }

  get totalPrice(): string {
    return this.state.cart?.totals.total_price ?? '0';
  }

  get currency(): { code: string; symbol: string } {
    return this.state.cart?.totals
      ? {
          code: this.state.cart.totals.currency_code,
          symbol: this.state.cart.totals.currency_symbol,
        }
      : { code: 'USD', symbol: '$' };
  }
}

const CART_LOAD_KEY = '__SPACETIME_CART_LOAD__';

export function startCartLoad(): void {
  if (typeof window === 'undefined') return;
  const registry = window as unknown as Record<string, number | undefined>;
  const startedAt = registry[CART_LOAD_KEY];
  if (startedAt && Date.now() - startedAt < 5000) return;
  registry[CART_LOAD_KEY] = Date.now();
  void cartStore.loadCart();
}

export const cartStore = new CartStore();

declare global {
  var __SPACETIME_CART_SINGLETON__: CartStore | undefined;
}

export const activeCartStore: CartStore =
  globalThis.__SPACETIME_CART_SINGLETON__ ?? (globalThis.__SPACETIME_CART_SINGLETON__ = cartStore);

if (typeof window !== 'undefined') {
  (window as unknown as { __CART_STORE__?: CartStore }).__CART_STORE__ = activeCartStore;
  startCartLoad();
}

interface CachedCart {
  cachedAt: number;
  cart: Cart;
}

export const CART_CACHE_KEY = 'spacetime_cart_snapshot';
export const CART_CACHE_TTL_MS = 5 * 60 * 1000;

const cartCache = new Map<string, CachedCart>();

export function readCartCache(key: string, now: number = Date.now()): Cart | null {
  const entry = cartCache.get(key);
  if (!entry) return null;
  if (now - entry.cachedAt >= CART_CACHE_TTL_MS) {
    cartCache.delete(key);
    return null;
  }
  return entry.cart;
}

export function writeCartCache(key: string, cart: Cart, now: number = Date.now()): void {
  cartCache.set(key, { cachedAt: now, cart });
}

export function clearCartCache(key?: string): void {
  if (key === undefined) {
    cartCache.clear();
    return;
  }
  cartCache.delete(key);
}

export function primeCartStore(cart: Cart): boolean {
  if (cartStore.getState().cart) return false;
  cartStore.setState({ cart, isLoading: false });
  return true;
}
