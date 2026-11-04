import { useEffect, useState } from "react";
import { Dialog } from "@ark-ui/react/dialog";
import { ShoppingBag, X, Trash2, ArrowRight, Sparkles } from "lucide-react";
import type { Cart } from "../lib/schema/cart";
import { useCart } from "../lib/context/CartContext";
import { cartStore } from "../lib/cartStore";
import { Button } from "./Button";

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
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
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
    return `${currency.symbol}${num.toFixed(currency.code === "VND" ? 0 : 2)}`;
  };

  const getItemTotal = (item: Cart["items"][number]) => {
    return parseFloat(item.totals.line_total);
  };

  const subtotal = cart?.items.reduce((sum, item) => sum + getItemTotal(item), 0) ?? 0;
  const shipping = cart?.shipping_rates[0] ? parseFloat(cart.shipping_rates[0].cost) : 0;
  const discount = parseFloat(cart?.totals.total_discount ?? "0");

  if (isLoading && !cart) {
    return (
      <Dialog.Root open={isDrawerOpen} onOpenChange={() => {}}>
        <Dialog.Backdrop className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 transition-opacity duration-500" />
        <Dialog.Positioner className="fixed inset-y-0 right-0 z-50 w-full max-w-md flex">
          <Dialog.Content className="w-full bg-white h-full shadow-2xl flex flex-col border-l border-stone-200 p-6 overflow-y-auto">
            <div className="flex items-center justify-center h-full">
              <div className="relative">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent" />
                <div className="absolute inset-0 rounded-full border-2 border-stone-200 border-t-black animate-ping" />
              </div>
              <p className="mt-4 text-sm text-stone-500 font-serif">Preparing your case...</p>
            </div>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    );
  }

  return (
    <Dialog.Root
      open={isDrawerOpen}
      onOpenChange={(e) => {
        if (e.open) cartStore.openDrawer();
        else closeDrawer();
      }}
    >
      <Button
        onClick={() => cartStore.openDrawer()}
        variant="ghost"
        size="sm"
        className="w-auto p-1.5! text-black flex items-center justify-center gap-2"
        aria-haspopup="dialog"
        aria-label="Open Collector's Case"
      >
        <ShoppingBag className="w-5 h-5" />
        <span className="hidden sm:inline">Collector's Case</span>
        {itemCount > 0 && (
          <span className="animate-bounce-in bg-black text-white px-2 py-0.5 rounded-full text-xs font-medium min-w-[1.5rem] text-center">
            {itemCount > 9 ? "9+" : itemCount}
          </span>
        )}
      </Button>

      <Dialog.Backdrop className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 data-[state=open]:animate-fade-in" />

      <Dialog.Positioner className="fixed inset-y-0 right-0 z-50 w-full max-w-md flex">
        <Dialog.Content className="w-full bg-white h-full shadow-2xl flex flex-col border-l border-stone-200 p-6 overflow-y-auto relative data-[state=open]:animate-slide-in-right data-[state=closed]:animate-slide-out-right">
          <div className="absolute top-0 left-0 right-0 h-px bg-black/50" />

          <div className="flex items-center justify-between pb-4 border-b border-stone-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-stone-100 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-black" />
              </div>
              <Dialog.Title className="font-serif text-xl text-black">
                Collector's Case
              </Dialog.Title>
            </div>
            <Dialog.CloseTrigger className="p-2 text-stone-400 hover:text-black hover:bg-stone-100 transition-all duration-200">
              <X className="w-5 h-5" />
            </Dialog.CloseTrigger>
          </div>

          {!cart || cart.items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-4">
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-full bg-stone-100 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-10 h-10 text-stone-300" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-stone-200 border-t-black animate-spin-slow opacity-50" />
              </div>
              <p className="font-serif text-xl text-black mb-2">Your case is empty</p>
              <p className="text-sm text-stone-500 mb-8 max-w-xs leading-relaxed">
                Discover rare timepieces and add them to your collector's case.
              </p>
              <Button href="/shop" onClick={closeDrawer}>
                <ArrowRight className="w-4 h-4" />
                Browse Collection
              </Button>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto pt-4 pb-4 pr-2">
                <div className="space-y-4">
                  {cart.items.map((item, index) => (
                    <div
                      key={item.key}
                      className={`group relative flex gap-4 p-4 bg-white border border-stone-200 hover:border-black hover:shadow-md transition-all duration-300 animate-slide-up ${removingKey === item.key ? "opacity-40 pointer-events-none" : ""}`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {removingKey === item.key && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60">
                          <div className="animate-spin rounded-full h-6 w-6 border-2 border-black border-t-transparent" />
                        </div>
                      )}
                      {item.images[0] && (
                        <a
                          href={item.permalink}
                          className="relative w-24 h-28 shrink-0 overflow-hidden bg-stone-50"
                        >
                          <img
                            src={item.images[0].thumbnail || item.images[0].src}
                            alt={item.name}
                            className="w-full h-full object-cover transition-opacity duration-300"
                          />
                          {item.on_sale && (
                            <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-red-700 text-white text-[9px] font-sans font-medium uppercase tracking-widest">
                              Sale
                            </span>
                          )}
                        </a>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-serif text-sm font-medium text-black truncate pr-2">
                            {item.name}
                          </p>
                          <button
                            onClick={() => handleRemove(item.key)}
                            disabled={removingKey !== null}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200 opacity-0 group-hover:opacity-100 disabled:opacity-50 disabled:cursor-not-allowed"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        {item.sku && (
                          <p className="text-xs text-stone-400 mb-1.5 font-mono">Ref: {item.sku}</p>
                        )}
                        <div className="flex items-baseline gap-2 mb-2">
                          <span className="font-semibold text-black text-lg">
                            {formatPrice(item.totals.line_total)}
                          </span>
                          {item.on_sale && item.sale_price && (
                            <span className="text-xs text-stone-400 line-through">
                              {formatPrice(item.regular_price)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-400 font-mono">Qty: {item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {cart.cross_sells.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-stone-200 animate-slide-up">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-black" />
                        You may also appreciate
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {cart.cross_sells.slice(0, 4).map((crossSell, idx) => (
                        <a
                          key={crossSell.id}
                          href={crossSell.permalink}
                          className="group p-3 bg-stone-50 border border-stone-200 hover:border-black hover:shadow-md hover:bg-white transition-all duration-300"
                          onClick={closeDrawer}
                          style={{ animationDelay: `${idx * 50}ms` }}
                        >
                          {crossSell.images[0] && (
                            <div className="relative aspect-[4/3] overflow-hidden mb-2 bg-stone-100">
                              <img
                                src={crossSell.images[0].thumbnail || crossSell.images[0].src}
                                alt={crossSell.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                            </div>
                          )}
                          <p className="text-xs font-serif text-black truncate group-hover:text-black transition-colors mb-1">
                            {crossSell.name}
                          </p>
                          <p className="text-xs font-semibold text-black">
                            {crossSell.prices.currency_symbol}
                            {crossSell.prices.price}
                          </p>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-t border-stone-200 pt-6 mt-4 space-y-3 animate-slide-up">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Subtotal</span>
                  <span className="font-medium text-black">{formatPrice(subtotal.toFixed(2))}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-700">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Discount
                    </span>
                    <span className="font-medium">-{formatPrice(discount.toFixed(2))}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Shipping</span>
                  <span className="font-medium text-black">
                    {shipping > 0 ? formatPrice(shipping.toFixed(2)) : "Calculated at checkout"}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t border-stone-200">
                  <span className="font-serif text-base font-medium text-black">Total</span>
                  <span className="font-serif text-xl font-medium text-black">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>

              <div className="mt-4 space-y-2 animate-slide-up">
                <Button href="/checkout" size="sm" className="w-full relative overflow-hidden">
                  <span className="relative z-10">Proceed to Checkout</span>
                  <div className="absolute inset-0 bg-black opacity-0 hover:opacity-100 transition-opacity duration-200" />
                  <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                </Button>
                <Button
                  href="/shop"
                  variant="outline"
                  size="sm"
                  className="w-full"
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
