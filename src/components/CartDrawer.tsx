import { useEffect, useState } from 'react';
import { Dialog } from '@ark-ui/react/dialog';
import { ShoppingBag, X, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import type { Cart } from '@/lib/schema/cart';
import { useCart } from '@/lib/context/CartContext';
import { cartStore } from '@/lib/cartStore';
import { Button } from '@/components/Button';

function CartDrawerContent() {
  const {
    cart,
    isLoading,
    itemCount,
    totalPrice,
    currency,
    removeItem,
    closeDrawer,
    isDrawerOpen,
  } = useCart();

  useEffect(() => {
    if (isDrawerOpen) {
      // Get scrollbar width before hiding overflow
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isDrawerOpen]);

  const [removingKey, setRemovingKey] = useState<string | null>(null);

  const handleRemove = async (key: string) => {
    if (removingKey) return;
    setRemovingKey(key);
    try {
      await removeItem(key);
    } finally {
      setRemovingKey(null);
    }
  };

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

  if (isLoading && !cart) {
    return (
      <Dialog.Root open={isDrawerOpen} onOpenChange={() => {}}>
        <Dialog.Backdrop className='fixed inset-0 z-50 bg-black/40 backdrop-blur-xs transition-opacity duration-500' />
        <Dialog.Positioner className='fixed inset-y-0 right-0 z-50 flex w-full max-w-md'>
          <Dialog.Content className='flex h-full w-full flex-col overflow-y-auto border-l border-stone-200 bg-white p-6 shadow-2xl'>
            <div className='flex h-full items-center justify-center'>
              <div className='relative'>
                <div className='h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent' />
                <div className='absolute inset-0 animate-ping rounded-full border-2 border-stone-200 border-t-black' />
              </div>
              <p className='mt-4 text-sm text-stone-500'>Preparing your case...</p>
            </div>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    );
  }

  return (
    <Dialog.Root
      open={isDrawerOpen}
      onOpenChange={(details) => {
        if (details.open) cartStore.openDrawer();
        else closeDrawer();
      }}
    >
      <Button
        onClick={() => cartStore.openDrawer()}
        variant='ghost'
        size='sm'
        className='flex w-auto items-center justify-center gap-2 p-1.5! text-brand-dark lg:bg-black lg:px-4! lg:text-white lg:hover:text-white'
        aria-haspopup='dialog'
        aria-label="Open Collector's Case"
      >
        <ShoppingBag className='h-5 w-5' />
        <span className='hidden lg:inline'>Collector's Case</span>
        {itemCount > 0 && (
          <span className='min-w-6 animate-bounce-in bg-black px-2 py-0.5 text-center text-xs font-medium text-white'>
            {itemCount > 9 ? '9+' : itemCount}
          </span>
        )}
      </Button>

      <Dialog.Backdrop className='fixed inset-0 z-50 bg-black/40 backdrop-blur-xs data-[state=open]:animate-fade-in' />

      <Dialog.Positioner className='fixed inset-y-0 right-0 z-50 flex w-full max-w-md'>
        <Dialog.Content className='relative flex h-full w-full flex-col overflow-y-auto border-l border-stone-200 bg-white p-6 shadow-2xl data-[state=closed]:animate-slide-out-right data-[state=open]:animate-slide-in-right'>
          <div className='absolute top-0 right-0 left-0 h-px bg-black/50' />

          <div className='flex items-center justify-between border-b border-stone-200 pb-4'>
            <div className='flex items-center gap-3'>
              <div className='flex h-8 w-8 items-center justify-center bg-stone-100'>
                <ShoppingBag className='h-5 w-5' />
              </div>
              <Dialog.Title className='text-xl'>Collector's Case</Dialog.Title>
            </div>
            <Dialog.CloseTrigger className='p-2 text-stone-400 transition-all duration-200 hover:bg-stone-100 hover:text-brand-dark'>
              <X className='h-5 w-5' />
            </Dialog.CloseTrigger>
          </div>

          {!cart || cart.items.length === 0 ? (
            <div className='flex flex-1 flex-col items-center justify-center px-4 py-16 text-center'>
              <div className='relative mb-6'>
                <div className='mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-stone-100'>
                  <ShoppingBag className='h-10 w-10 text-stone-300' />
                </div>
                <div className='absolute inset-0 animate-spin-slow rounded-full border-2 border-stone-200 border-t-black opacity-50' />
              </div>
              <p className='mb-2 text-xl'>Your case is empty</p>
              <p className='mb-8 max-w-xs text-sm leading-relaxed text-stone-500'>
                Discover rare timepieces and add them to your collector's case.
              </p>
              <Button href='/watches' onClick={closeDrawer}>
                <ArrowRight className='h-4 w-4' />
                Browse Collection
              </Button>
            </div>
          ) : (
            <>
              <div className='flex-1 overflow-y-auto pt-4 pr-2 pb-4'>
                <div className='flex flex-col gap-4'>
                  {cart.items.map((item, index) => (
                    <div
                      key={item.key}
                      className={`group relative flex animate-slide-up gap-4 border border-stone-200 bg-white p-4 transition-all duration-300 hover:border-black hover:shadow-md ${removingKey === item.key ? 'pointer-events-none opacity-40' : ''}`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {removingKey === item.key && (
                        <div className='absolute inset-0 z-10 flex items-center justify-center bg-white/60'>
                          <div className='h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent' />
                        </div>
                      )}
                      {item.images[0] && (
                        <a
                          href={item.permalink}
                          className='relative h-28 w-24 shrink-0 overflow-hidden bg-stone-50'
                        >
                          <img
                            src={item.images[0].thumbnail || item.images[0].src}
                            alt={item.name}
                            className='h-full w-full object-cover transition-opacity duration-300'
                          />
                          {item.on_sale && (
                            <span className='absolute top-2 left-2 bg-red-700 px-1.5 py-0.5 font-sans text-[9px] font-medium tracking-widest text-white uppercase'>
                              Sale
                            </span>
                          )}
                        </a>
                      )}
                      <div className='min-w-0 flex-1'>
                        <div className='mb-1 flex items-start justify-between gap-2'>
                          <p className='truncate pr-2 text-sm font-medium'>{item.name}</p>
                          <button
                            onClick={() => handleRemove(item.key)}
                            disabled={removingKey !== null}
                            className='p-1.5 text-stone-400 opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50'
                            aria-label='Remove item'
                          >
                            <Trash2 className='h-4 w-4' />
                          </button>
                        </div>
                        {item.sku && (
                          <p className='mb-1.5 font-mono text-xs text-stone-400'>Ref: {item.sku}</p>
                        )}
                        <div className='mb-2 flex items-baseline gap-2'>
                          <span className='text-lg font-semibold'>
                            {formatPrice(item.totals.line_total)}
                          </span>
                          {item.on_sale && item.sale_price && (
                            <span className='text-xs text-stone-400 line-through'>
                              {formatPrice(item.regular_price)}
                            </span>
                          )}
                        </div>
                        <p className='font-mono text-xs text-stone-400'>Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {cart.cross_sells.length > 0 && (
                  <div className='mt-8 animate-slide-up border-t border-stone-200 pt-6'>
                    <div className='mb-4 flex items-center justify-between'>
                      <p className='flex items-center gap-2 text-xs font-semibold tracking-wider text-stone-500 uppercase'>
                        <Sparkles className='h-4 w-4 text-brand-dark' />
                        You may also appreciate
                      </p>
                    </div>
                    <div className='grid grid-cols-2 gap-3'>
                      {cart.cross_sells.slice(0, 4).map((crossSell, idx) => (
                        <a
                          key={crossSell.id}
                          href={crossSell.permalink}
                          className='group border border-stone-200 bg-stone-50 p-3 transition-all duration-300 hover:border-black hover:bg-white hover:shadow-md'
                          onClick={closeDrawer}
                          style={{ animationDelay: `${idx * 50}ms` }}
                        >
                          {crossSell.images[0] && (
                            <div className='relative mb-2 aspect-4/3 overflow-hidden bg-stone-100'>
                              <img
                                src={crossSell.images[0].thumbnail || crossSell.images[0].src}
                                alt={crossSell.name}
                                className='h-full w-full object-cover transition-transform duration-500 group-hover:scale-105'
                              />
                            </div>
                          )}
                          <p className='mb-1 truncate text-xs transition-colors'>
                            {crossSell.name}
                          </p>
                          <p className='text-xs font-semibold'>
                            {crossSell.prices.currency_symbol}
                            {crossSell.prices.price}
                          </p>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className='mt-4 flex animate-slide-up flex-col gap-3 border-t border-stone-200 pt-6'>
                <div className='flex justify-between text-sm'>
                  <span className='text-stone-600'>Subtotal</span>
                  <span className='font-medium'>{formatPrice(subtotal.toFixed(2))}</span>
                </div>
                {discount > 0 && (
                  <div className='flex justify-between text-sm text-green-700'>
                    <span className='flex items-center gap-1'>
                      <Sparkles className='h-3 w-3' /> Discount
                    </span>
                    <span className='font-medium'>-{formatPrice(discount.toFixed(2))}</span>
                  </div>
                )}
                <div className='flex justify-between text-sm'>
                  <span className='text-stone-600'>Shipping</span>
                  <span className='font-medium'>
                    {shipping > 0 ? formatPrice(shipping.toFixed(2)) : 'Calculated at checkout'}
                  </span>
                </div>
                <div className='flex justify-between border-t border-stone-200 pt-3'>
                  <span className='text-base font-medium'>Total</span>
                  <span className='text-xl font-medium'>{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <div className='mt-4 flex animate-slide-up flex-col gap-2'>
                <Button href='/checkout' size='sm' className='relative w-full overflow-hidden'>
                  <span className='relative z-10'>Proceed to Checkout</span>
                  <div className='absolute inset-0 bg-black opacity-0 transition-opacity duration-200 hover:opacity-100' />
                  <ArrowRight className='absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100' />
                </Button>
                <Button
                  href='/watches'
                  variant='outline'
                  size='sm'
                  className='w-full'
                  onClick={closeDrawer}
                >
                  Continue Shopping
                </Button>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}

export function CartDrawer() {
  return <CartDrawerContent />;
}
