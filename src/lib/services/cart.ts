import { Effect, Schema } from 'effect';
import { CartSchema } from '../schema/cart';
import type { CartAddress, AddToCartRequest, UpdateCartItemRequest, RemoveCartItemRequest } from '../schema/cart';

const API_BASE = 'https://donghocodien.com/wp-json/wc/store/v1';

export class CartNetworkError extends Schema.TaggedError<CartNetworkError, { readonly brand: unique symbol }>()('CartNetworkError', {
  message: Schema.String,
}) {}

export class CartHttpError extends Schema.TaggedError<CartHttpError, { readonly brand: unique symbol }>()('CartHttpError', {
  status: Schema.Finite,
  statusText: Schema.String,
  url: Schema.String,
}) {}

export class CartNotFoundError extends Schema.TaggedError<CartNotFoundError, { readonly brand: unique symbol }>()('CartNotFoundError', {
  message: Schema.String,
}) {}

const fetchWithAuth = (url: string, options: RequestInit = {}) =>
  Effect.tryPromise({
    try: () =>
      fetch(url, {
        ...options,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'DongHoCoDien-Headless/1.0',
          ...options.headers,
        },
        credentials: 'include' as RequestCredentials,
      }),
    catch: (cause) => new CartNetworkError({ message: String(cause) }),
  });

const handleResponse = <A>(schema: Schema.Schema<A>, url: string) =>
  Effect.gen(function* () {
    const response = yield* Effect.tryPromise({
      try: () => fetch(url, {
        headers: {
          Accept: 'application/json',
          'User-Agent': 'DongHoCoDien-Headless/1.0',
        },
        credentials: 'include' as RequestCredentials,
      }),
      catch: (cause) => new CartNetworkError({ message: String(cause) }),
    });

    if (!response.ok) {
      return yield* new CartHttpError({
        status: response.status,
        statusText: response.statusText,
        url,
      });
    }

    const raw = yield* Effect.tryPromise({
      try: () => response.json(),
      catch: (cause) => new CartNetworkError({ message: String(cause) }),
    });

    return yield* Schema.decodeUnknownEffect(schema)(raw);
  }).pipe(
    Effect.retry({ times: 2 }),
    Effect.timeout('30 seconds')
  );

export const getCart = handleResponse(CartSchema, `${API_BASE}/cart`);

export const addToCart = (request: AddToCartRequest) =>
  Effect.gen(function* () {
    const url = `${API_BASE}/cart/add-item`;
    const response = yield* fetchWithAuth(url, {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      return yield* new CartHttpError({
        status: response.status,
        statusText: response.statusText,
        url,
      });
    }

    const raw = yield* Effect.tryPromise({
      try: () => response.json(),
      catch: (cause) => new CartNetworkError({ message: String(cause) }),
    });

    return yield* Schema.decodeUnknownEffect(CartSchema)(raw);
  }).pipe(
    Effect.retry({ times: 2 }),
    Effect.timeout('30 seconds')
  );

export const updateCartItem = (request: UpdateCartItemRequest) =>
  Effect.gen(function* () {
    const url = `${API_BASE}/cart/update-item`;
    const response = yield* fetchWithAuth(url, {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      return yield* new CartHttpError({
        status: response.status,
        statusText: response.statusText,
        url,
      });
    }

    const raw = yield* Effect.tryPromise({
      try: () => response.json(),
      catch: (cause) => new CartNetworkError({ message: String(cause) }),
    });

    return yield* Schema.decodeUnknownEffect(CartSchema)(raw);
  }).pipe(
    Effect.retry({ times: 2 }),
    Effect.timeout('30 seconds')
  );

export const removeCartItem = (request: RemoveCartItemRequest) =>
  Effect.gen(function* () {
    const url = `${API_BASE}/cart/remove-item`;
    const response = yield* fetchWithAuth(url, {
      method: 'POST',
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      return yield* new CartHttpError({
        status: response.status,
        statusText: response.statusText,
        url,
      });
    }

    const raw = yield* Effect.tryPromise({
      try: () => response.json(),
      catch: (cause) => new CartNetworkError({ message: String(cause) }),
    });

    return yield* Schema.decodeUnknownEffect(CartSchema)(raw);
  }).pipe(
    Effect.retry({ times: 2 }),
    Effect.timeout('30 seconds')
  );

export const clearCart = Effect.gen(function* () {
  const url = `${API_BASE}/cart/items`;
  const response = yield* fetchWithAuth(url, {
    method: 'DELETE',
  });

  if (!response.ok) {
    return yield* new CartHttpError({
      status: response.status,
      statusText: response.statusText,
      url,
    });
  }

  const raw = yield* Effect.tryPromise({
    try: () => response.json(),
    catch: (cause) => new CartNetworkError({ message: String(cause) }),
  });

  return yield* Schema.decodeUnknownEffect(CartSchema)(raw);
}).pipe(
  Effect.retry({ times: 2 }),
  Effect.timeout('30 seconds')
);

export interface CheckoutRequest {
  billing_address: CartAddress;
  shipping_address?: CartAddress;
  payment_method: string;
  customer_note?: string;
}

export interface CheckoutResponse {
  order_id?: number;
  order_key?: string;
  order_number?: number;
  status?: string;
  payment_result?: {
    payment_status?: string;
    payment_method?: string;
    payment_details?: Record<string, string>;
    redirect_url?: string;
  };
  [key: string]: unknown;
}