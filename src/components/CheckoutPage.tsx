import React, { useEffect, useState } from 'react';
import { useCart } from '@/lib/context/CartContext';
import { ShoppingBag, Shield, Truck, CreditCard, Check } from 'lucide-react';
import { formatApproxPrice } from '@/lib/utils/currency';
import { useApproxDisplay } from '@/lib/hooks/useApproxDisplay';
import { CHECKOUT_COUNTRIES, COUNTRY_STATES, COUNTRY_LOCALE } from '@/lib/data/woocommerce-regions';
import { Button } from '@/components/Button';
import { SelectField, type SelectOption } from '@/components/SelectField';

const COUNTRY_OPTIONS: SelectOption[] = CHECKOUT_COUNTRIES.filter((country) => country.code).map(
  (country) => ({
    value: country.code,
    label: country.name,
  })
);

const decodeEntities = (value: string) => {
  if (typeof window === 'undefined' || !value.includes('&')) return value;
  const doc = new DOMParser().parseFromString(value, 'text/html');
  return doc.documentElement.textContent ?? value;
};

interface BillingForm {
  first_name: string;
  last_name: string;
  country: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postcode: string;
  phone: string;
  email: string;
}

const EMPTY_FORM: BillingForm = {
  first_name: '',
  last_name: '',
  country: '',
  address_1: '',
  address_2: '',
  city: '',
  state: '',
  postcode: '',
  phone: '',
  email: '',
};

const inputClass =
  'w-full px-4 py-3 border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:border-stone-900 focus-visible:ring-2 focus-visible:ring-brand-dark focus-visible:ring-offset-2 transition-colors placeholder:text-stone-400';

const labelClass = 'block text-xs uppercase tracking-wider text-stone-500 mb-2 font-sans';

export function CheckoutPage() {
  const { cart, isLoading, error, itemCount, refreshCart, processCheckout } = useCart();

  const [mounted, setMounted] = useState(false);
  const [form, setForm] = useState<BillingForm>(EMPTY_FORM);
  const [terms, setTerms] = useState(false);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const approx = useApproxDisplay();

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    const symbol = cart?.totals.currency_symbol ?? '$';
    const formatted = Math.round(num)
      .toString()
      .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${symbol}${formatted}`;
  };

  const stateOptions = COUNTRY_STATES[form.country];
  const stateLocale = COUNTRY_LOCALE[form.country]?.state;
  const postcodeLocale = COUNTRY_LOCALE[form.country]?.postcode;
  const stateHidden = stateLocale?.hidden ?? false;
  const stateRequired = !stateHidden;
  const stateLabel = stateLocale?.label ?? 'State / Province';
  const postcodeHidden = postcodeLocale?.hidden ?? false;
  const postcodeRequired = !postcodeHidden;
  const postcodeLabel = postcodeLocale?.label ?? 'Postcode / ZIP';

  const handleCountryChange = (next: string) => {
    const nextStateOptions = COUNTRY_STATES[next];
    setForm((current) => ({
      ...current,
      country: next,
      state: nextStateOptions && current.state in nextStateOptions ? current.state : '',
    }));
  };

  const setField =
    (field: keyof BillingForm) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => ({ ...current, [field]: event.target.value }));
    };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!cart || submitting) return;
    if (!terms) {
      setSubmitError('Please read and accept the terms and conditions before placing your order.');
      document.getElementById('checkout_terms')?.focus();
      return;
    }
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
        state: form.state,
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
      const resultData = (result ?? {}) as Record<string, unknown>;
      const payment = resultData.payment_result as
        | { redirect_url?: string; payment_status?: string }
        | undefined;
      const orderId = Number(resultData.order_id);
      const orderKey = typeof resultData.order_key === 'string' ? resultData.order_key : '';

      if (orderId && orderKey) {
        try {
          window.sessionStorage.setItem(
            'spacetime_last_order',
            JSON.stringify({
              orderId,
              orderKey,
              email: form.email,
              total: cart.totals.total_price,
              currencySymbol: cart.totals.currency_symbol,
              itemCount: cart.totals.total_items
                ? Math.round(parseFloat(cart.totals.total_items)) || itemCount
                : itemCount,
              paymentMethod: 'bacs',
              status: resultData.status,
              date: new Date().toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              }),
              redirectUrl: payment?.redirect_url,
            })
          );
        } catch {}
        window.location.href = `/checkout/order-received/${orderId}/?key=${orderKey}`;
        return;
      }
      if (payment?.redirect_url) {
        window.location.href = payment.redirect_url;
        return;
      }
      throw new Error('Checkout failed. Please try again.');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Checkout failed. Please try again.');
      setSubmitting(false);
    }
  };

  if (!mounted || (isLoading && !cart)) {
    return (
      <main className='mx-auto flex min-h-[60vh] max-w-7xl items-center justify-center px-4 py-10 sm:px-6 sm:py-16 lg:px-8'>
        <div
          role='status'
          className='h-8 w-8 animate-spin rounded-full border-2 border-stone-900 border-t-transparent'
        >
          <span className='sr-only'>Loading checkout</span>
        </div>
      </main>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <main className='mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8'>
        <div className='py-20 text-center'>
          <ShoppingBag className='mx-auto mb-6 h-24 w-24 text-stone-300' aria-hidden='true' />
          <h1 className='mb-3 text-2xl text-stone-900'>Your cart is currently empty</h1>
          <p className='mx-auto mb-8 max-w-md text-stone-500'>
            Browse our curated collection of rare vintage watches before proceeding to checkout.
          </p>
          <Button href='/watches'>Return to Shop</Button>
        </div>
      </main>
    );
  }

  const subtotal = parseFloat(cart.totals.total_items);
  const discount = parseFloat(cart.totals.total_discount);
  const total = parseFloat(cart.totals.total_price);
  const termsErrorId = 'checkout-terms-error';

  return (
    <main className='mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8'>
      <h1 className='sr-only'>Checkout</h1>
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
            Retry loading your cart
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className='grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-12'>
        <fieldset className='lg:col-span-3'>
          <legend className='mb-6 w-full border-b border-stone-200 pb-3 text-2xl text-stone-950'>
            Billing Details
          </legend>

          <div className='grid grid-cols-1 gap-5 sm:grid-cols-2'>
            <div>
              <label htmlFor='billing_first_name' className={labelClass}>
                First name
                <span className='text-stone-600'> (required)</span>
              </label>
              <input
                id='billing_first_name'
                type='text'
                required
                value={form.first_name}
                onChange={setField('first_name')}
                placeholder='First name'
                className={inputClass}
                autoComplete='given-name'
              />
            </div>
            <div>
              <label htmlFor='billing_last_name' className={labelClass}>
                Last name *
              </label>
              <input
                id='billing_last_name'
                type='text'
                required
                value={form.last_name}
                onChange={setField('last_name')}
                placeholder='Last name'
                className={inputClass}
                autoComplete='family-name'
              />
            </div>
          </div>

          <div className='mt-5'>
            <SelectField
              id='billing_country'
              label='Country / Region'
              required
              placeholder='Select a country / region…'
              autoComplete='country'
              options={COUNTRY_OPTIONS}
              value={form.country}
              onValueChange={handleCountryChange}
            />
          </div>

          <div className='mt-5'>
            <label htmlFor='billing_address_1' className={labelClass}>
              Street address *
            </label>
            <input
              id='billing_address_1'
              type='text'
              required
              value={form.address_1}
              onChange={setField('address_1')}
              placeholder='House number and street name'
              className={inputClass}
              autoComplete='address-line1'
            />
          </div>

          <div className='mt-5'>
            <label htmlFor='billing_address_2' className={labelClass}>
              Apartment, suite, unit, etc.{' '}
              <span className='text-stone-600 normal-case'>(optional)</span>
            </label>
            <input
              id='billing_address_2'
              type='text'
              value={form.address_2}
              onChange={setField('address_2')}
              placeholder='Apartment, suite, unit, etc.'
              className={inputClass}
              autoComplete='address-line2'
            />
          </div>

          {!stateHidden && (
            <div className='mt-5'>
              {stateOptions ? (
                <SelectField
                  id='billing_state'
                  label={stateLabel}
                  required={stateRequired}
                  placeholder='Select an option…'
                  options={Object.entries(stateOptions).map(([code, name]) => ({
                    value: code,
                    label: name,
                  }))}
                  value={form.state}
                  onValueChange={(value) => setForm((current) => ({ ...current, state: value }))}
                />
              ) : (
                <>
                  <label htmlFor='billing_state' className={labelClass}>
                    {stateLabel}{' '}
                    {stateRequired ? (
                      '*'
                    ) : (
                      <span className='text-stone-600 normal-case'>(optional)</span>
                    )}
                  </label>
                  <input
                    id='billing_state'
                    type='text'
                    required={stateRequired}
                    value={form.state}
                    onChange={setField('state')}
                    placeholder={stateLabel}
                    className={inputClass}
                    autoComplete='address-level1'
                  />
                </>
              )}
            </div>
          )}

          <div className='mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2'>
            {!postcodeHidden && (
              <div>
                <label htmlFor='billing_postcode' className={labelClass}>
                  {postcodeLabel}{' '}
                  {postcodeRequired ? (
                    '*'
                  ) : (
                    <span className='text-stone-600 normal-case'>(optional)</span>
                  )}
                </label>
                <input
                  id='billing_postcode'
                  type='text'
                  required={postcodeRequired}
                  value={form.postcode}
                  onChange={setField('postcode')}
                  placeholder={postcodeLabel}
                  className={inputClass}
                  autoComplete='postal-code'
                />
              </div>
            )}
            <div>
              <label htmlFor='billing_city' className={labelClass}>
                Town / City *
              </label>
              <input
                id='billing_city'
                type='text'
                required
                value={form.city}
                onChange={setField('city')}
                placeholder='Town / City'
                className={inputClass}
                autoComplete='address-level2'
              />
            </div>
          </div>

          <div className='mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2'>
            <div>
              <label htmlFor='billing_phone' className={labelClass}>
                Phone *
              </label>
              <input
                id='billing_phone'
                type='tel'
                required
                value={form.phone}
                onChange={setField('phone')}
                placeholder='+84 94 162 5653'
                className={inputClass}
                autoComplete='tel'
              />
            </div>
            <div>
              <label htmlFor='billing_email' className={labelClass}>
                Email address *
              </label>
              <input
                id='billing_email'
                type='email'
                required
                value={form.email}
                onChange={setField('email')}
                placeholder='you@example.com'
                className={inputClass}
                autoComplete='email'
              />
            </div>
          </div>

          <div className='mt-5'>
            <label htmlFor='order_notes' className={labelClass}>
              Order notes <span className='text-stone-600 normal-case'>(optional)</span>
            </label>
            <textarea
              id='order_notes'
              rows={4}
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder='Notes about your order, e.g. special notes for delivery.'
              className={`${inputClass} resize-none`}
            />
          </div>
        </fieldset>

        <section aria-labelledby='order-summary-heading' className='lg:col-span-2'>
          <div className='border border-stone-200 bg-white p-6 lg:sticky lg:top-28'>
            <h2
              id='order-summary-heading'
              className='mb-4 border-b border-stone-200 pb-3 text-lg text-stone-900'
            >
              Your Order
            </h2>

            <ul className='divide-y divide-stone-200'>
              {cart.items.map((item) => (
                <li key={item.key} className='flex items-center gap-4 py-4'>
                  {item.images[0] && (
                    <img
                      src={item.images[0].src}
                      alt={decodeEntities(item.name)}
                      className='h-20 w-16 shrink-0 border border-stone-200 object-cover'
                    />
                  )}
                  <div className='min-w-0 flex-1'>
                    <p className='truncate text-sm text-stone-900'>{decodeEntities(item.name)}</p>
                    <p className='mt-0.5 text-xs text-stone-600'>
                      <span className='sr-only'>Quantity: </span>
                      Qty: {item.quantity}
                    </p>
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
                  <span className='text-sm font-semibold whitespace-nowrap'>
                    {formatPrice(item.totals.line_total)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className='flex flex-col gap-3 border-t border-stone-200 pt-4 text-sm'>
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
                  {cart.shipping_rates[0] && parseFloat(cart.shipping_rates[0].cost) > 0
                    ? formatPrice(cart.shipping_rates[0].cost)
                    : 'Free'}
                </dd>
              </div>
              <div className='flex justify-between border-t border-stone-200 pt-3'>
                <dt className='text-base font-medium text-stone-950'>Total</dt>
                <dd className='text-base font-medium'>{formatPrice(total.toFixed(2))}</dd>
              </div>
              {approx && (
                <div className='text-right'>
                  <dt className='sr-only'>Approximate total</dt>
                  <dd
                    className='approximate-vnd'
                    data-usd-price={total.toFixed(2)}
                    aria-hidden='true'
                  >
                    {formatApproxPrice(total.toFixed(2), approx.currency, approx.rates)}
                  </dd>
                </div>
              )}
            </dl>

            <div className='mt-6 flex items-start gap-3 text-xs text-stone-600'>
              <input
                id='checkout_terms'
                type='checkbox'
                checked={terms}
                onChange={(event) => {
                  setTerms(event.target.checked);
                  if (event.target.checked) setSubmitError(null);
                }}
                required
                className='mt-0.5 h-5 w-5 shrink-0 accent-stone-900'
              />
              <label htmlFor='checkout_terms' className='cursor-pointer'>
                I have read and agree to the website{' '}
                <a href='/payment-shipping-methods' className='underline hover:text-stone-900'>
                  terms and conditions
                </a>{' '}
                *
              </label>
            </div>

            {!terms && submitError && (
              <p id={termsErrorId} className='mt-2 text-xs font-medium text-red-700'>
                Tick the terms and conditions box to place your order.
              </p>
            )}

            {submitError && (
              <div
                role='alert'
                className='mt-4 border border-red-200 bg-red-50 p-3 text-xs text-red-700'
              >
                {submitError}
              </div>
            )}

            <Button type='submit' aria-disabled={submitting || undefined} className='mt-6 w-full'>
              {submitting ? (
                <>
                  <span
                    aria-hidden='true'
                    className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent'
                  />
                  Processing…
                </>
              ) : (
                <>
                  <Check className='h-4 w-4' aria-hidden='true' />
                  Place Order
                </>
              )}
            </Button>

            <div className='mt-6 flex flex-col gap-3 border-t border-stone-200 pt-4 text-xs text-stone-600'>
              <div className='flex items-center gap-2'>
                <Shield className='h-4 w-4 text-green-700' aria-hidden='true' />
                <span>Authenticated &amp; mechanically verified</span>
              </div>
              <div className='flex items-center gap-2'>
                <Truck className='h-4 w-4 text-green-700' aria-hidden='true' />
                <span>Worldwide insured delivery</span>
              </div>
              <div className='flex items-center gap-2'>
                <CreditCard className='h-4 w-4 text-green-700' aria-hidden='true' />
                <span>Secure checkout</span>
              </div>
            </div>
          </div>
        </section>
      </form>
    </main>
  );
}
