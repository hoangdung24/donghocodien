import type { Cart } from './schema/cart';
import type { CheckoutRequest, CheckoutResponse } from './services/cart';
import { toastStore } from './toastStore';

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
      this.setState({ cart: data, isLoading: false });
    } catch (err) {
      this.setState({
        error: err instanceof Error ? err.message : 'Failed to load cart',
        isLoading: false,
      });
    }
  }

  async addItem(productId: number, quantity = 1): Promise<void> {
    try {
      this.setState({ error: null });
      const newCart = await this.addToCartApi(productId, quantity);
      this.setState({ cart: newCart, isDrawerOpen: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add item';
      this.setState({ error: message });
      toastStore.show(message, 'error');
      throw err;
    }
  }

  async updateQuantity(key: string, quantity: number): Promise<void> {
    if (quantity < 1) return this.removeItem(key);
    try {
      this.setState({ error: null });
      const newCart = await this.updateCartItemApi(key, quantity);
      this.setState({ cart: newCart });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update quantity';
      this.setState({ error: message });
      toastStore.show(message, 'error');
      throw err;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      this.setState({ error: null });
      const newCart = await this.removeCartItemApi(key);
      this.setState({ cart: newCart });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to remove item';
      this.setState({ error: message });
      toastStore.show(message, 'error');
      throw err;
    }
  }

  async clearCart(): Promise<void> {
    try {
      this.setState({ error: null });
      const newCart = await this.clearCartApi();
      this.setState({ cart: newCart });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to clear cart';
      this.setState({ error: message });
      toastStore.show(message, 'error');
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

export const cartStore = new CartStore();

if (typeof window !== 'undefined') {
  (window as unknown as { __CART_STORE__?: CartStore }).__CART_STORE__ = cartStore;
}
