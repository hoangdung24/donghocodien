import React, { useEffect, useState } from 'react';
import { useCart } from '../lib/context/CartContext';
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight, Truck, Shield, CreditCard, RotateCcw } from 'lucide-react';
import { formatApproxVND } from '../lib/utils/currency';

export function CartPage() {
  const {
    cart,
    isLoading,
    error,
    itemCount,
    totalPrice,
    currency,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart,
  } = useCart();

  const [mounted, setMounted] = useState(false);
  const [vndRate, setVndRate] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    fetch('https://api.exchangerate-api.com/v4/latest/USD')
      .then((res) => res.json())
      .then((data) => setVndRate(data.rates?.VND ?? null))
      .catch(() => {});
  }, []);

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return `${currency.symbol}${num.toFixed(currency.code === 'VND' ? 0 : 2)}`;
  };

  const getItemTotal = (item: typeof cart.items[0]) => {
    return parseFloat(item.totals.line_total);
  };

  const subtotal = cart?.items.reduce((sum, item) => sum + getItemTotal(item), 0) ?? 0;
  const shipping = cart?.shipping_rates[0] ? parseFloat(cart.shipping_rates[0].cost) : 0;
  const discount = parseFloat(cart?.totals.total_discount ?? '0');

  if (!mounted) {
    return (
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-stone-900 border-t-transparent" />
      </main>
    );
  }

  if (isLoading && !cart) {
    return (
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-stone-900 border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-stone-500 mb-8 font-sans">
        <a href="/" className="hover:text-stone-900 transition-colors">Home</a>
        <span>/</span>
        <a href="/shop" className="hover:text-stone-900 transition-colors">Collection</a>
        <span>/</span>
        <span className="text-stone-900">Collector's Case</span>
      </nav>

      <div className="mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl text-stone-950 font-normal leading-tight mb-2">
          Collector's Case
        </h1>
        <p className="text-sm text-stone-500">
          {itemCount} {itemCount === 1 ? 'timepiece' : 'timepieces'} selected
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-900 text-sm rounded flex items-center justify-between">
          <span>{error}</span>
          <button onClick={refreshCart} className="text-sm font-medium hover:underline">
            Retry
          </button>
        </div>
      )}

      {!cart || cart.items.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="w-24 h-24 text-stone-300 mx-auto mb-6" />
          <h2 className="font-serif text-2xl text-stone-900 mb-3">Your case is empty</h2>
          <p className="text-stone-500 mb-8 max-w-md mx-auto">
            You haven't added any timepieces to your collector's case yet. Browse our curated collection of rare vintage watches.
          </p>
          <a
            href="/shop"
            className="inline-block px-8 py-4 bg-stone-900 text-white font-serif text-sm tracking-wider uppercase hover:bg-stone-800 transition-colors"
          >
            Browse Collection
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.key}
                className="flex gap-6 p-6 bg-white border border-stone-200 hover:border-stone-300 transition-colors"
              >
                {item.images[0] && (
                  <a href={item.permalink} className="flex-shrink-0">
                    <img
                      src={item.images[0].src}
                      alt={item.name}
                      className="w-24 h-32 object-cover border border-stone-200"
                    />
                  </a>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <a href={item.permalink} className="font-serif text-lg font-medium text-stone-900 hover:text-yellow-900 transition-colors block truncate">
                        {item.name}
                      </a>
                      {item.sku && (
                        <p className="text-xs text-stone-400 mt-1">Ref: {item.sku}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeItem(item.key)}
                      className="p-2 text-stone-400 hover:text-red-600 transition-colors flex-shrink-0"
                      aria-label="Remove {item.name}"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center border border-stone-200">
                      <button
                        onClick={() => updateQuantity(item.key, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className="px-3 py-1.5 text-stone-500 hover:text-stone-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border-r border-stone-200 bg-white"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="px-4 py-1.5 text-sm font-mono font-medium text-stone-900 border-x border-stone-200 bg-white min-w-[3rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.key, item.quantity + 1)}
                        className="px-3 py-1.5 text-stone-500 hover:text-stone-900 transition-colors border-l border-stone-200 bg-white"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="font-semibold text-yellow-900 ml-auto whitespace-nowrap">
                      {formatPrice(item.totals.line_total)}
                    </span>
                  </div>
                  {vndRate && (
                    <span className="text-xs text-stone-400 font-mono tracking-tight mt-2 block approximate-vnd" data-usd-price={item.totals.line_total}>
                      ≈ {formatApproxVND(item.totals.line_total, vndRate)}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {cart.cross_sells.length > 0 && (
              <div className="mt-8 pt-6 border-t border-stone-200">
                <h3 className="font-serif text-xl text-stone-900 mb-4">You may also appreciate</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {cart.cross_sells.slice(0, 4).map((crossSell) => (
                    <a
                      key={crossSell.id}
                      href={crossSell.permalink}
                      className="group p-4 bg-stone-50 border border-stone-200 hover:border-stone-300 transition-colors"
                    >
                      {crossSell.images[0] && (
                        <img
                          src={crossSell.images[0].src}
                          alt={crossSell.name}
                          className="w-full h-32 object-cover mb-3"
                        />
                      )}
                      <p className="text-xs font-serif text-stone-900 truncate group-hover:text-yellow-900 transition-colors">
                        {crossSell.name}
                      </p>
                      <p className="text-xs font-semibold text-yellow-900 mt-1">
                        {crossSell.prices.currency_symbol}{crossSell.prices.price}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-28 bg-white border border-stone-200 p-6">
              <h2 className="font-serif text-lg text-stone-900 mb-4 pb-3 border-b border-stone-200">
                Case Summary
              </h2>

              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-stone-600">Subtotal ({itemCount} items)</dt>
                  <dd className="font-medium text-stone-900">{formatPrice(subtotal.toFixed(2))}</dd>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-700">
                    <dt>Discount</dt>
                    <dd className="font-medium">-{formatPrice(discount.toFixed(2))}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-stone-600">Shipping</dt>
                  <dd className="font-medium text-stone-900">
                    {shipping > 0 ? formatPrice(shipping.toFixed(2)) : 'Calculated at checkout'}
                  </dd>
                </div>
                <div className="flex justify-between pt-3 border-t border-stone-200">
                  <dt className="font-serif text-base font-medium text-stone-950">Total</dt>
                  <dd className="font-serif text-base font-medium text-yellow-900">
                    {formatPrice(totalPrice)}
                  </dd>
                </div>
                {vndRate && (
                  <dd className="text-xs text-stone-400 font-mono tracking-tight approximate-vnd" data-usd-price={totalPrice}>
                    ≈ {formatApproxVND(totalPrice, vndRate)}
                  </dd>
                )}
              </dl>

              <div className="mt-6 pt-4 border-t border-stone-200 space-y-3 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-green-700" />
                  <span>Authenticated & mechanically verified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-green-700" />
                  <span>Worldwide insured delivery</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-green-700" />
                  <span>Secure checkout</span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <a
                  href="/checkout"
                  className="w-full py-3.5 bg-stone-900 text-white font-serif text-sm tracking-wider uppercase hover:bg-stone-800 transition-colors text-center block"
                >
                  Proceed to Checkout
                </a>
                <button
                  onClick={clearCart}
                  className="w-full py-3.5 border border-stone-300 text-stone-800 font-serif text-sm tracking-wider uppercase hover:border-stone-900 transition-colors flex items-center justify-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear Case
                </button>
                <a
                  href="/shop"
                  className="w-full py-3.5 text-stone-600 font-serif text-sm tracking-wider uppercase hover:text-stone-900 transition-colors text-center block"
                >
                  ← Continue Shopping
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}