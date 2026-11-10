import { useDeferredValue, useEffect, useState } from 'react';
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
import { formatApproxPrice } from '@/lib/utils/currency';
import { productHref } from '@/lib/utils/products';
import { useApproxDisplay } from '@/lib/hooks/useApproxDisplay';
import { useCartContext, useCartCurrency } from '@/lib/context/CartContext';
import { useSettledLayout } from '@/lib/useSettledLayout';
import { usePendingSlotHandoff } from '@/lib/usePendingSlotHandoff';
import type { Cart } from '@/lib/schema/cart';
import { Button } from '@/components/Button';

const formatPrice = (price: string, symbol: string) => {
  const amount = parseFloat(price);
  const formatted = Math.round(amount)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${symbol}${formatted}`;
};

const LoadingCase = () => (
  <main className='mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4 py-10 sm:px-6 sm:py-16 lg:px-8'>
    <div
      role='status'
      className='h-8 w-8 animate-spin rounded-full border-2 border-stone-900 border-t-transparent'
    >
      <span className='sr-only'>Loading your collector's case</span>
    </div>
  </main>
);

export function CartPage() {
  const {
    cart: liveCart,
    isLoading,
    itemCount,
    error,
    refreshCart,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCartContext();

  const [mounted, setMounted] = useState(false);
  const cart = useSettledLayout(useDeferredValue(liveCart));
  const isStale = cart !== liveCart;
  const currency = useCartCurrency();
  const totalPrice = cart?.totals.total_price ?? '0';
  const approximateDisplay = useApproxDisplay();
  const [approxVisible, setApproxVisible] = useState(false);
  const approx = approxVisible ? approximateDisplay : null;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!approximateDisplay || approxVisible) return;
    const frame = requestAnimationFrame(() => setApproxVisible(true));
    return () => cancelAnimationFrame(frame);
  }, [approximateDisplay, approxVisible]);

  const getItemTotal = (item: Cart['items'][number]) => {
    return parseFloat(item.totals.line_total);
  };

  const subtotal = cart?.items.reduce((sum, item) => sum + getItemTotal(item), 0) ?? 0;
  const shipping = cart?.shipping_rates[0] ? parseFloat(cart.shipping_rates[0].cost) : 0;
  const discount = parseFloat(cart?.totals.total_discount ?? '0');

  usePendingSlotHandoff(mounted);

  if (!mounted || (isLoading && !cart)) {
    return <LoadingCase />;
  }

  return (
    <main className='mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8'>
      <nav
        aria-label='Breadcrumb'
        className='mb-8 flex items-center gap-2 font-sans text-xs tracking-wider text-stone-500 uppercase'
      >
        <a href='/' className='transition-colors hover:text-stone-900'>
          Home
        </a>
        <span aria-hidden='true'>/</span>
        <a href='/watches' className='transition-colors hover:text-stone-900'>
          Collection
        </a>
        <span aria-hidden='true'>/</span>
        <span className='text-stone-900' aria-current='page'>
          Collector's Case
        </span>
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
        <div
          role='alert'
          className='mb-6 flex items-center justify-between rounded border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900'
        >
          <span>{error}</span>
          <button
            type='button'
            onClick={refreshCart}
            className='text-sm font-medium hover:underline'
          >
            Retry loading your case
          </button>
        </div>
      )}

      {!cart || cart.items.length === 0 ? (
        <div className='py-20 text-center'>
          <ShoppingBag className='mx-auto mb-6 h-24 w-24 text-stone-300' aria-hidden='true' />
          <h2 className='mb-3 text-2xl text-stone-900'>Your case is empty</h2>
          <p className='mx-auto mb-8 max-w-md text-stone-500'>
            You haven't added any timepieces to your collector's case yet. Browse our curated
            collection of rare vintage watches.
          </p>
          <Button href='/watches'>Browse Collection</Button>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12'>
          <div className='lg:col-span-2'>
            <h2 className='sr-only'>Timepieces in your case</h2>
            <ul
              className='flex flex-col gap-4 transition-opacity duration-150 data-[stale=true]:opacity-70'
              data-stale={isStale || undefined}
              aria-busy={isStale || undefined}
            >
              {cart.items.map((item) => (
                <li
                  key={item.key}
                  className='flex gap-6 border border-stone-200 bg-white p-6 transition-colors hover:border-stone-300'
                >
                  {item.images[0] && (
                    <a href={productHref(item.permalink)} className='shrink-0'>
                      <img
                        src={item.images[0].src}
                        alt={item.name}
                        width={96}
                        height={128}
                        loading='lazy'
                        decoding='async'
                        className='h-32 w-24 border border-stone-200 bg-stone-100 object-cover'
                      />
                    </a>
                  )}
                  <div className='min-w-0 flex-1'>
                    <div className='flex items-start justify-between gap-4'>
                      <div>
                        <a
                          href={productHref(item.permalink)}
                          className='block truncate text-lg font-medium text-stone-900 transition-colors hover:text-yellow-900'
                        >
                          {item.name}
                        </a>
                        {item.sku && <p className='mt-1 text-xs text-stone-600'>Ref: {item.sku}</p>}
                      </div>
                      <button
                        type='button'
                        onClick={() => removeItem(item.key)}
                        className='flex min-h-11 min-w-11 shrink-0 items-center justify-center p-2 text-stone-600 transition-colors hover:text-red-600'
                        aria-label={`Remove ${item.name} from your case`}
                      >
                        <Trash2 className='h-5 w-5' aria-hidden='true' />
                      </button>
                    </div>
                    <div className='mt-4 flex items-center gap-4'>
                      <div className='flex items-center border border-stone-200'>
                        <button
                          type='button'
                          onClick={() => updateQuantity(item.key, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className='h-11 w-11 border-r border-stone-200 bg-white text-stone-500 transition-colors hover:text-stone-900 disabled:cursor-not-allowed disabled:opacity-50'
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          <Minus className='mx-auto h-4 w-4' aria-hidden='true' />
                        </button>
                        <span className='min-w-12 border-x border-stone-200 bg-white px-4 py-1.5 text-center font-mono text-sm font-medium text-stone-900 tabular-nums'>
                          <span className='sr-only'>Quantity: </span>
                          {item.quantity}
                        </span>
                        <button
                          type='button'
                          onClick={() => updateQuantity(item.key, item.quantity + 1)}
                          className='h-11 w-11 border-l border-stone-200 bg-white text-stone-500 transition-colors hover:text-stone-900'
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          <Plus className='mx-auto h-4 w-4' aria-hidden='true' />
                        </button>
                      </div>
                      <span className='ml-auto font-semibold whitespace-nowrap text-yellow-900 tabular-nums'>
                        <span className='sr-only'>Line total: </span>
                        {formatPrice(item.totals.line_total, currency.symbol)}
                      </span>
                    </div>
                    {approx && (
                      <span
                        className='approximate-vnd block'
                        data-usd-price={item.totals.line_total}
                        aria-hidden='true'
                      >
                        {formatApproxPrice(item.totals.line_total, approx.currency, approx.rates)}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {cart.cross_sells.length > 0 && (
              <section className='mt-8 border-t border-stone-200 pt-6'>
                <h2 className='mb-4 text-xl text-stone-900'>You may also appreciate</h2>
                <ul className='grid grid-cols-2 gap-4 sm:grid-cols-4'>
                  {cart.cross_sells.slice(0, 4).map((crossSell) => (
                    <li key={crossSell.id}>
                      <a
                        href={productHref(crossSell.permalink)}
                        className='group block border border-stone-200 bg-stone-50 p-4 transition-colors hover:border-stone-300'
                      >
                        {crossSell.images[0] && (
                          <img
                            src={crossSell.images[0].src}
                            alt={crossSell.name}
                            width={300}
                            height={128}
                            loading='lazy'
                            decoding='async'
                            className='mb-3 h-32 w-full bg-stone-100 object-cover'
                          />
                        )}
                        <p className='truncate text-xs text-stone-900 transition-colors group-hover:text-yellow-900'>
                          {crossSell.name}
                        </p>
                        <p className='mt-1 text-xs font-semibold text-yellow-900 tabular-nums'>
                          {crossSell.prices.currency_symbol}
                          {crossSell.prices.price}
                        </p>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <div className='lg:col-span-1'>
            <section
              aria-labelledby='case-summary-heading'
              className='border border-stone-200 bg-white p-6 lg:sticky lg:top-28'
            >
              <h2
                id='case-summary-heading'
                className='mb-4 border-b border-stone-200 pb-3 text-lg text-stone-900'
              >
                Case Summary
              </h2>

              <dl
                className='flex flex-col gap-3 text-sm tabular-nums transition-opacity duration-150 data-[stale=true]:opacity-70'
                data-stale={isStale || undefined}
              >
                <div className='flex justify-between'>
                  <dt className='text-stone-600'>Subtotal ({itemCount} items)</dt>
                  <dd className='font-medium text-stone-900'>
                    {formatPrice(subtotal.toFixed(2), currency.symbol)}
                  </dd>
                </div>
                {discount > 0 && (
                  <div className='flex justify-between text-green-700'>
                    <dt>Discount</dt>
                    <dd className='font-medium'>
                      -{formatPrice(discount.toFixed(2), currency.symbol)}
                    </dd>
                  </div>
                )}
                <div className='flex justify-between'>
                  <dt className='text-stone-600'>Shipping</dt>
                  <dd className='font-medium text-stone-900'>
                    {shipping > 0
                      ? formatPrice(shipping.toFixed(2), currency.symbol)
                      : 'Calculated at checkout'}
                  </dd>
                </div>
                <div className='flex justify-between border-t border-stone-200 pt-3'>
                  <dt className='text-base font-medium text-stone-950'>Total</dt>
                  <dd className='text-base font-medium text-yellow-900'>
                    {formatPrice(totalPrice, currency.symbol)}
                  </dd>
                </div>
                {approx && (
                  <div>
                    <dt className='sr-only'>Approximate total</dt>
                    <dd className='approximate-vnd' data-usd-price={totalPrice} aria-hidden='true'>
                      {formatApproxPrice(totalPrice, approx.currency, approx.rates)}
                    </dd>
                  </div>
                )}
              </dl>

              <ul className='mt-6 flex flex-col gap-3 border-t border-stone-200 pt-4 text-xs text-stone-600'>
                <li className='flex items-center gap-2'>
                  <Shield className='h-4 w-4 text-green-700' aria-hidden='true' />
                  <span>Authenticated &amp; mechanically verified</span>
                </li>
                <li className='flex items-center gap-2'>
                  <Truck className='h-4 w-4 text-green-700' aria-hidden='true' />
                  <span>Worldwide insured delivery</span>
                </li>
                <li className='flex items-center gap-2'>
                  <CreditCard className='h-4 w-4 text-green-700' aria-hidden='true' />
                  <span>Secure checkout</span>
                </li>
              </ul>

              <div className='mt-6 flex flex-col gap-3'>
                <Button href='/checkout' className='w-full'>
                  Proceed to Checkout
                </Button>
                <Button variant='outline' onClick={clearCart} className='w-full'>
                  <RotateCcw className='h-4 w-4' aria-hidden='true' />
                  Clear Case
                </Button>
                <Button variant='ghost' href='/watches' className='w-full'>
                  <span aria-hidden='true'>←</span> Continue Shopping
                </Button>
              </div>
            </section>
          </div>
        </div>
      )}
    </main>
  );
}
