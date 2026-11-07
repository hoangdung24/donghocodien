import { useEffect, useState } from 'react';
import { useCart } from '../lib/context/CartContext';
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Truck,
  Shield,
  CreditCard,
  RotateCcw,
} from 'lucide-react';
import { formatApproxPrice } from '../lib/utils/currency';
import { useApproxDisplay } from '../lib/hooks/useApproxDisplay';
import type { Cart } from '../lib/schema/cart';
import { Button } from './Button';

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
  const approx = useApproxDisplay();

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    const formatted = Math.round(num)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${currency.symbol}${formatted}`;
  };

  const getItemTotal = (item: Cart['items'][number]) => {
    return parseFloat(item.totals.line_total);
  };

  const subtotal = cart?.items.reduce((sum, item) => sum + getItemTotal(item), 0) ?? 0;
  const shipping = cart?.shipping_rates[0] ? parseFloat(cart.shipping_rates[0].cost) : 0;
  const discount = parseFloat(cart?.totals.total_discount ?? '0');

  if (!mounted) {
    return (
      <main className='mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4 py-10 sm:px-6 sm:py-16 lg:px-8'>
        <div className='h-8 w-8 animate-spin rounded-full border-2 border-stone-900 border-t-transparent' />
      </main>
    );
  }

  if (isLoading && !cart) {
    return (
      <main className='mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4 py-10 sm:px-6 sm:py-16 lg:px-8'>
        <div className='h-8 w-8 animate-spin rounded-full border-2 border-stone-900 border-t-transparent' />
      </main>
    );
  }

  return (
    <main className='mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8'>
      <nav className='mb-8 flex items-center gap-2 font-sans text-xs tracking-wider text-stone-500 uppercase'>
        <a href='/' className='transition-colors hover:text-stone-900'>
          Home
        </a>
        <span>/</span>
        <a href='/watches' className='transition-colors hover:text-stone-900'>
          Collection
        </a>
        <span>/</span>
        <span className='text-stone-900'>Collector's Case</span>
      </nav>

      <div className='mb-8'>
        <h1 className='mb-2 text-3xl leading-tight font-normal text-stone-950 sm:text-4xl'>
          Collector's Case
        </h1>
        <p className='text-sm text-stone-500'>
          {itemCount} {itemCount === 1 ? 'timepiece' : 'timepieces'} selected
        </p>
      </div>

      {error && (
        <div className='mb-6 flex items-center justify-between rounded border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900'>
          <span>{error}</span>
          <button onClick={refreshCart} className='text-sm font-medium hover:underline'>
            Retry
          </button>
        </div>
      )}

      {!cart || cart.items.length === 0 ? (
        <div className='py-20 text-center'>
          <ShoppingBag className='mx-auto mb-6 h-24 w-24 text-stone-300' />
          <h2 className='mb-3 text-2xl text-stone-900'>Your case is empty</h2>
          <p className='mx-auto mb-8 max-w-md text-stone-500'>
            You haven't added any timepieces to your collector's case yet. Browse our curated
            collection of rare vintage watches.
          </p>
          <Button href='/watches'>Browse Collection</Button>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12'>
          <div className='flex flex-col gap-4 lg:col-span-2'>
            {cart.items.map((item) => (
              <div
                key={item.key}
                className='flex gap-6 border border-stone-200 bg-white p-6 transition-colors hover:border-stone-300'
              >
                {item.images[0] && (
                  <a href={item.permalink} className='shrink-0'>
                    <img
                      src={item.images[0].src}
                      alt={item.name}
                      className='h-32 w-24 border border-stone-200 object-cover'
                    />
                  </a>
                )}
                <div className='min-w-0 flex-1'>
                  <div className='flex items-start justify-between gap-4'>
                    <div>
                      <a
                        href={item.permalink}
                        className='block truncate text-lg font-medium text-stone-900 transition-colors hover:text-yellow-900'
                      >
                        {item.name}
                      </a>
                      {item.sku && <p className='mt-1 text-xs text-stone-400'>Ref: {item.sku}</p>}
                    </div>
                    <button
                      onClick={() => removeItem(item.key)}
                      className='shrink-0 p-2 text-stone-400 transition-colors hover:text-red-600'
                      aria-label='Remove {item.name}'
                    >
                      <Trash2 className='h-5 w-5' />
                    </button>
                  </div>
                  <div className='mt-4 flex items-center gap-4'>
                    <div className='flex items-center border border-stone-200'>
                      <button
                        onClick={() => updateQuantity(item.key, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        className='border-r border-stone-200 bg-white px-3 py-1.5 text-stone-500 transition-colors hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-50'
                        aria-label='Decrease quantity'
                      >
                        <Minus className='h-4 w-4' />
                      </button>
                      <span className='min-w-12 border-x border-stone-200 bg-white px-4 py-1.5 text-center font-mono text-sm font-medium text-stone-900'>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.key, item.quantity + 1)}
                        className='border-l border-stone-200 bg-white px-3 py-1.5 text-stone-500 transition-colors hover:text-stone-900'
                        aria-label='Increase quantity'
                      >
                        <Plus className='h-4 w-4' />
                      </button>
                    </div>
                    <span className='ml-auto font-semibold whitespace-nowrap text-yellow-900'>
                      {formatPrice(item.totals.line_total)}
                    </span>
                  </div>
                  {approx && (
                    <span className='approximate-vnd block' data-usd-price={item.totals.line_total}>
                      {formatApproxPrice(item.totals.line_total, approx.currency, approx.rates)}
                    </span>
                  )}
                </div>
              </div>
            ))}

            {cart.cross_sells.length > 0 && (
              <div className='mt-8 border-t border-stone-200 pt-6'>
                <h3 className='mb-4 text-xl text-stone-900'>You may also appreciate</h3>
                <div className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
                  {cart.cross_sells.slice(0, 4).map((crossSell) => (
                    <a
                      key={crossSell.id}
                      href={crossSell.permalink}
                      className='group border border-stone-200 bg-stone-50 p-4 transition-colors hover:border-stone-300'
                    >
                      {crossSell.images[0] && (
                        <img
                          src={crossSell.images[0].src}
                          alt={crossSell.name}
                          className='mb-3 h-32 w-full object-cover'
                        />
                      )}
                      <p className='truncate text-xs text-stone-900 transition-colors group-hover:text-yellow-900'>
                        {crossSell.name}
                      </p>
                      <p className='mt-1 text-xs font-semibold text-yellow-900'>
                        {crossSell.prices.currency_symbol}
                        {crossSell.prices.price}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className='lg:col-span-1'>
            <div className='sticky top-28 border border-stone-200 bg-white p-6'>
              <h2 className='mb-4 border-b border-stone-200 pb-3 text-lg text-stone-900'>
                Case Summary
              </h2>

              <dl className='flex flex-col gap-3 text-sm'>
                <div className='flex justify-between'>
                  <dt className='text-stone-600'>Subtotal ({itemCount} items)</dt>
                  <dd className='font-medium text-stone-900'>{formatPrice(subtotal.toFixed(2))}</dd>
                </div>
                {discount > 0 && (
                  <div className='flex justify-between text-green-700'>
                    <dt>Discount</dt>
                    <dd className='font-medium'>-{formatPrice(discount.toFixed(2))}</dd>
                  </div>
                )}
                <div className='flex justify-between'>
                  <dt className='text-stone-600'>Shipping</dt>
                  <dd className='font-medium text-stone-900'>
                    {shipping > 0 ? formatPrice(shipping.toFixed(2)) : 'Calculated at checkout'}
                  </dd>
                </div>
                <div className='flex justify-between border-t border-stone-200 pt-3'>
                  <dt className='text-base font-medium text-stone-950'>Total</dt>
                  <dd className='text-base font-medium text-yellow-900'>
                    {formatPrice(totalPrice)}
                  </dd>
                </div>
                {approx && (
                  <dd className='approximate-vnd' data-usd-price={totalPrice}>
                    {formatApproxPrice(totalPrice, approx.currency, approx.rates)}
                  </dd>
                )}
              </dl>

              <div className='mt-6 flex flex-col gap-3 border-t border-stone-200 pt-4 text-xs text-stone-600'>
                <div className='flex items-center gap-2'>
                  <Shield className='h-4 w-4 text-green-700' />
                  <span>Authenticated & mechanically verified</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Truck className='h-4 w-4 text-green-700' />
                  <span>Worldwide insured delivery</span>
                </div>
                <div className='flex items-center gap-2'>
                  <CreditCard className='h-4 w-4 text-green-700' />
                  <span>Secure checkout</span>
                </div>
              </div>

              <div className='mt-6 flex flex-col gap-3'>
                <Button href='/checkout' className='w-full'>
                  Proceed to Checkout
                </Button>
                <Button variant='outline' onClick={clearCart} className='w-full'>
                  <RotateCcw className='h-4 w-4' />
                  Clear Case
                </Button>
                <Button variant='ghost' href='/watches' className='w-full'>
                  ← Continue Shopping
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
