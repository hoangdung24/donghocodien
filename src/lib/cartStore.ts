import type { Cart } from '../schema/cart';

const API_BASE = 'https://donghocodien.com/wp-json/wc/store/v1';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  error: string | null;
  isDrawerOpen: boolean;
}

type Listener = () => void;

class CartStore {
  private state: CartState = {
    cart: null,
    isLoading: true,
    error: null,
    isDrawerOpen: false,
  };
  private listeners: Set<Listener> = new Set();

  private async fetchCart(): Promise<Cart> {
    const response = await fetch(`${API_BASE}/cart`, {
      headers: { Accept: 'application/json' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch cart');
    return response.json();
  }

  private async addToCartApi(productId: number, quantity = 1): Promise<Cart> {
    const response = await fetch(`${API_BASE}/cart/add-item`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ id: productId, quantity }),
    });
    if (!response.ok) throw new Error('Failed to add to cart');
    return response.json();
  }

  private async updateCartItemApi(key: string, quantity: number): Promise<Cart> {
    const response = await fetch(`${API_BASE}/cart/update-item`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ key, quantity }),
    });
    if (!response.ok) throw new Error('Failed to update cart');
    return response.json();
  }

  private async removeCartItemApi(key: string): Promise<Cart> {
    const response = await fetch(`${API_BASE}/cart/remove-item`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ key }),
    });
    if (!response.ok) throw new Error('Failed to remove item');
    return response.json();
  }

  private async clearCartApi(): Promise<Cart> {
    const response = await fetch(`${API_BASE}/cart/items`, {
      method: 'DELETE',
      headers: { Accept: 'application/json' },
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to clear cart');
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

  private setState(partial: Partial<CartState>): void {
    this.state = { ...this.state, ...partial };
    this.notify();
  }

  async loadCart(): Promise<void> {
    try {
      this.setState({ isLoading: true, error: null });
      const data = await this.fetchCart();
      this.setState({ cart: data, isLoading: false });
    } catch (err) {
      this.setState({ error: err instanceof Error ? err.message : 'Failed to load cart', isLoading: false });
    }
  }

  async addItem(productId: number, quantity = 1): Promise<void> {
    try {
      this.setState({ error: null });
      const newCart = await this.addToCartApi(productId, quantity);
      this.setState({ cart: newCart, isDrawerOpen: true });
    } catch (err) {
      this.setState({ error: err instanceof Error ? err.message : 'Failed to add item' });
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
      this.setState({ error: err instanceof Error ? err.message : 'Failed to update quantity' });
      throw err;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      this.setState({ error: null });
      const newCart = await this.removeCartItemApi(key);
      this.setState({ cart: newCart });
    } catch (err) {
      this.setState({ error: err instanceof Error ? err.message : 'Failed to remove item' });
      throw err;
    }
  }

  async clearCart(): Promise<void> {
    try {
      this.setState({ error: null });
      const newCart = await this.clearCartApi();
      this.setState({ cart: newCart });
    } catch (err) {
      this.setState({ error: err instanceof Error ? err.message : 'Failed to clear cart' });
      throw err;
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
      ? { code: this.state.cart.totals.currency_code, symbol: this.state.cart.totals.currency_symbol }
      : { code: 'USD', symbol: '$' };
  }
}

export const cartStore = new CartStore();

if (typeof window !== 'undefined') {
  (window as unknown as { __CART_STORE__?: CartStore }).__CART_STORE__ = cartStore;
}