import React, { useEffect, useState } from 'react';
import { useCart } from '../lib/context/CartContext';
import { ShoppingBag, Shield, Truck, CreditCard, Check, ChevronRight } from 'lucide-react';
import { formatApproxVND } from '../lib/utils/currency';

const COUNTRIES = [
  { code: 'VN', name: 'Vietnam' },
  { code: 'US', name: 'United States (US)' },
  { code: 'GB', name: 'United Kingdom (UK)' },
  { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'SG', name: 'Singapore' },
  { code: 'KR', name: 'South Korea' },
  { code: 'TH', name: 'Thailand' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'CN', name: 'China' },
  { code: 'AE', name: 'United Arab Emirates' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'AT', name: 'Austria' },
  { code: 'BE', name: 'Belgium' },
  { code: 'PT', name: 'Portugal' },
  { code: 'IE', name: 'Ireland' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'OTHER', name: 'Other' },
];

interface BillingForm {
  first_name: string;
  last_name: string;
  country: string;
  address_1: string;
  address_2: string;
  city: string;
  postcode: string;
  phone: string;
  email: string;
}

const EMPTY_FORM: BillingForm = {
  first_name: '',
  last_name: '',
  country: 'US',
  address_1: '',
  address_2: '',
  city: '',
  postcode: '',
  phone: '',
  email: '',
};

const inputClass =
  'w-full px-4 py-3 border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:border-stone-900 transition-colors placeholder:text-stone-400';

const labelClass = 'block text-xs uppercase tracking-wider text-stone-500 mb-2 font-sans';

export function CheckoutPage() {
  const { cart, isLoading, error, itemCount, refreshCart, processCheckout } = useCart();

  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<BillingForm>(EMPTY_FORM);
  const [terms, setTerms] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
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
    const symbol = cart?.totals.currency_symbol ?? '$';
    return `${symbol}${num.toFixed(2)}`;
  };

  const setField = (field: keyof BillingForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || submitting) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const address = {
        first_name: form.first_name,
        last_name: form.last_name,
        company: '',
        address_1: form.address_1,
        address_2: form.address_2,
        city: form.city,
        state: '',
        postcode: form.postcode,
        country: form.country,
        phone: form.phone,
        email: form.email,
      };
      const result = await processCheckout({
        billing_address: address,
        shipping_address: address,
        payment_method: 'bacs',
        customer_note: notes,
      });
      const payment = (result as Record<string, unknown>)?.payment_result as
        | { redirect_url?: string; payment_status?: string }
        | undefined;
      const redirect = payment?.redirect_url;
      if (redirect) {
        window.location.href = redirect;
        return;
      }
      window.location.href = `/checkout/order-received/?key=${(result as Record<string, unknown>).order_key ?? ''}`;
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Checkout failed. Please try again.');
      setSubmitting(false);
    }
  };

  if (!mounted || (isLoading && !cart)) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-stone-900 border-t-transparent" />
      </main>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-stone-500 mb-8 font-sans">
          <a href="/" className="hover:text-stone-900 transition-colors">Home</a>
          <span>/</span>
          <span className="text-stone-900">Checkout</span>
        </nav>
        <div className="text-center py-20">
          <ShoppingBag className="w-24 h-24 text-stone-300 mx-auto mb-6" />
          <h2 className="font-serif text-2xl text-stone-900 mb-3">Your cart is currently empty</h2>
          <p className="text-stone-500 mb-8 max-w-md mx-auto">
            Browse our curated collection of rare vintage watches before proceeding to checkout.
          </p>
          <a
            href="/shop"
            className="inline-block px-8 py-4 bg-stone-900 text-white font-serif text-sm tracking-wider uppercase hover:bg-stone-800 transition-colors"
          >
            Return to Shop
          </a>
        </div>
      </main>
    );
  }

  const subtotal = parseFloat(cart.totals.total_items);
  const discount = parseFloat(cart.totals.total_discount);
  const total = parseFloat(cart.totals.total_price);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-stone-500 mb-8 font-sans">
        <a href="/" className="hover:text-stone-900 transition-colors">Home</a>
        <span>/</span>
        <span className="text-stone-900">Checkout</span>
      </nav>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-0 mb-12" aria-label="Checkout progress">
        <a href="/cart" className="flex items-center gap-2 text-sm uppercase tracking-wider text-stone-500 hover:text-stone-900 transition-colors font-sans">
          Shopping Cart
          <ChevronRight className="w-4 h-4 text-stone-300" />
        </a>
        <span className="flex items-center gap-2 text-sm uppercase tracking-wider text-stone-950 font-medium font-sans border-b border-stone-900 pb-1">
          Checkout Details
          <ChevronRight className="w-4 h-4 text-stone-300" />
        </span>
        <span className="flex items-center gap-2 text-sm uppercase tracking-wider text-stone-400 font-sans">
          Order Complete
        </span>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 text-yellow-900 text-sm rounded flex items-center justify-between">
          <span>{error}</span>
          <button onClick={refreshCart} className="text-sm font-medium hover:underline">Retry</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
        <div className="lg:col-span-3">
          <h2 className="font-serif text-2xl text-stone-950 mb-6 pb-3 border-b border-stone-200">
            Billing Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="billing_first_name" className={labelClass}>First name *</label>
              <input
                id="billing_first_name"
                type="text"
                required
                value={form.first_name}
                onChange={setField('first_name')}
                className={inputClass}
                autoComplete="given-name"
              />
            </div>
            <div>
              <label htmlFor="billing_last_name" className={labelClass}>Last name *</label>
              <input
                id="billing_last_name"
                type="text"
                required
                value={form.last_name}
                onChange={setField('last_name')}
                className={inputClass}
                autoComplete="family-name"
              />
            </div>
          </div>

          <div className="mt-5">
            <label htmlFor="billing_country" className={labelClass}>Country / Region *</label>
            <select
              id="billing_country"
              required
              value={form.country}
              onChange={setField('country')}
              className={inputClass}
              autoComplete="country"
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>{c.name}</option>
              ))}
            </select>
          </div>

          <div className="mt-5">
            <label htmlFor="billing_address_1" className={labelClass}>Street address *</label>
            <input
              id="billing_address_1"
              type="text"
              required
              value={form.address_1}
              onChange={setField('address_1')}
              placeholder="House number and street name"
              className={inputClass}
              autoComplete="address-line1"
            />
          </div>

          <div className="mt-5">
            <label htmlFor="billing_address_2" className={labelClass}>
              Apartment, suite, unit, etc. <span className="normal-case text-stone-400">(optional)</span>
            </label>
            <input
              id="billing_address_2"
              type="text"
              value={form.address_2}
              onChange={setField('address_2')}
              className={inputClass}
              autoComplete="address-line2"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
            <div>
              <label htmlFor="billing_postcode" className={labelClass}>
                Postcode / ZIP <span className="normal-case text-stone-400">(optional)</span>
              </label>
              <input
                id="billing_postcode"
                type="text"
                value={form.postcode}
                onChange={setField('postcode')}
                className={inputClass}
                autoComplete="postal-code"
              />
            </div>
            <div>
              <label htmlFor="billing_city" className={labelClass}>Town / City *</label>
              <input
                id="billing_city"
                type="text"
                required
                value={form.city}
                onChange={setField('city')}
                className={inputClass}
                autoComplete="address-level2"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-5">
            <div>
              <label htmlFor="billing_phone" className={labelClass}>Phone *</label>
              <input
                id="billing_phone"
                type="tel"
                required
                value={form.phone}
                onChange={setField('phone')}
                className={inputClass}
                autoComplete="tel"
              />
            </div>
            <div>
              <label htmlFor="billing_email" className={labelClass}>Email address *</label>
              <input
                id="billing_email"
                type="email"
                required
                value={form.email}
                onChange={setField('email')}
                className={inputClass}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="mt-5">
            <label htmlFor="order_notes" className={labelClass}>
              Order notes <span className="normal-case text-stone-400">(optional)</span>
            </label>
            <textarea
              id="order_notes"
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Notes about your order, e.g. special notes for delivery."
              className={`${inputClass} resize-none`}
            />
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-28 bg-white border border-stone-200 p-6">
            <h2 className="font-serif text-lg text-stone-900 mb-4 pb-3 border-b border-stone-200">
              Your Order
            </h2>

            <div className="divide-y divide-stone-200">
              {cart.items.map((item) => (
                <div key={item.key} className="flex items-center gap-4 py-4">
                  {item.images[0] && (
                    <img
                      src={item.images[0].thumbnail ?? item.images[0].src}
                      alt={item.name}
                      className="w-16 h-20 object-cover border border-stone-200 flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-serif text-sm text-stone-900 truncate">{item.name}</p>
                    <p className="text-xs text-stone-400 mt-0.5">Qty: {item.quantity}</p>
                    {vndRate && (
                      <span
                        className="text-xs text-stone-400 font-mono tracking-tight mt-1 block approximate-vnd"
                        data-usd-price={item.totals.line_total}
                      >
                        ≈ {formatApproxVND(item.totals.line_total, vndRate)}
                      </span>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-yellow-900 whitespace-nowrap">
                    {formatPrice(item.totals.line_total)}
                  </span>
                </div>
              ))}
            </div>

            <dl className="space-y-3 text-sm pt-4 border-t border-stone-200">
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
                  {cart.shipping_rates[0] && parseFloat(cart.shipping_rates[0].cost) > 0
                    ? formatPrice(cart.shipping_rates[0].cost)
                    : 'Free'}
                </dd>
              </div>
              <div className="flex justify-between pt-3 border-t border-stone-200">
                <dt className="font-serif text-base font-medium text-stone-950">Total</dt>
                <dd className="font-serif text-base font-medium text-yellow-900">
                  {formatPrice(total.toFixed(2))}
                </dd>
              </div>
              {vndRate && (
                <dd
                  className="text-xs text-stone-400 font-mono tracking-tight approximate-vnd text-right"
                  data-usd-price={total.toFixed(2)}
                >
                  ≈ {formatApproxVND(total.toFixed(2), vndRate)}
                </dd>
              )}
            </dl>

            <label className="flex items-start gap-3 mt-6 text-xs text-stone-600 cursor-pointer">
              <input
                type="checkbox"
                checked={terms}
                onChange={(e) => setTerms(e.target.checked)}
                required
                className="mt-0.5 accent-stone-900"
              />
              <span>
                I have read and agree to the website{' '}
                <a href="/payment-shipping-methods" className="underline hover:text-stone-900">
                  terms and conditions
                </a>{' '}
                *
              </span>
            </label>

            {submitError && (
              <p className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs">{submitError}</p>
            )}

            <button
              type="submit"
              disabled={submitting || !terms}
              className="mt-6 w-full py-4 bg-stone-900 text-white font-serif text-sm tracking-wider uppercase hover:bg-stone-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  Processing…
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  Place Order
                </>
              )}
            </button>

            <div className="mt-6 pt-4 border-t border-stone-200 space-y-3 text-xs text-stone-600">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-green-700" />
                <span>Authenticated &amp; mechanically verified</span>
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
          </div>
        </div>
      </form>
    </main>
  );
}
