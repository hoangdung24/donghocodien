import { useEffect, useState } from 'react';
import { CreditCard, ArrowRight, Copy, Check } from 'lucide-react';
import { Button } from '@/components/Button';
import {
  copyText,
  formatOrderTotal,
  readLastOrder,
  type LastOrder,
} from '@/lib/utils/orderConfirmation';
import { BANK, CONTACT } from '@/lib/constants';

const summaryOrder: Array<[string, (order: LastOrder) => string]> = [
  ['Order number', (order) => `#${order.orderId}`],
  ['Date', (order) => order.date ?? ''],
  ['Email', (order) => order.email ?? ''],
  ['Total', (order) => formatOrderTotal(order.total, order.currencySymbol)],
  [
    'Payment method',
    (order) =>
      order.paymentMethod === 'bacs' ? 'Direct bank transfer' : (order.paymentMethod ?? ''),
  ],
];

const bankDetails: Array<[string, string]> = [
  ['Beneficiary name', BANK.beneficiaryName],
  ['Bank name', BANK.bankName],
  ['Branch', BANK.branch],
  ['Bank address', BANK.bankAddress],
  ['Account number', BANK.accountNumber],
  ['Swift code', BANK.swiftCode],
  ['Account address', BANK.accountAddress],
  ['Email', CONTACT.email],
];

function CopyValue({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    const ok = await copyText(value);
    setCopied(ok);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div key={label} className='contents'>
      <dt className='pt-0.5 font-sans text-xs tracking-wider text-stone-500 uppercase'>{label}</dt>
      <dd className='flex items-center gap-2 wrap-break-word text-stone-950'>
        <span>{value}</span>
        <button
          type='button'
          onClick={handleCopy}
          aria-label={`Copy ${label}`}
          className='p-1 text-stone-400 transition-colors hover:text-stone-900'
        >
          {copied ? (
            <Check className='h-3.5 w-3.5 text-green-700' />
          ) : (
            <Copy className='h-3.5 w-3.5' />
          )}
        </button>
      </dd>
    </div>
  );
}

export function OrderComplete() {
  const [order, setOrder] = useState<LastOrder | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const orderId = window.location.pathname.split('/').filter(Boolean).pop() ?? '';
    const stored = readLastOrder(window.sessionStorage, orderId);
    setOrder(stored);
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <main className='mx-auto flex min-h-[50vh] max-w-3xl items-center justify-center px-4 py-12 sm:px-6 sm:py-20 lg:px-8'>
        <div className='h-8 w-8 animate-spin rounded-full border-2 border-stone-900 border-t-transparent' />
      </main>
    );
  }

  return (
    <main className='mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8'>
      <div className='mb-10 text-center'>
        <h1 className='mb-3 text-3xl text-stone-950 sm:text-4xl'>
          Thank you. Your order has been received.
        </h1>
        <p className='mx-auto max-w-md text-sm'>
          A confirmation has been sent to your email address with your order details and payment
          instructions.
        </p>
      </div>

      {order && (
        <div className='mb-8 border border-stone-200 bg-white p-6 sm:p-8'>
          <dl className='grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-3'>
            {summaryOrder.map(([label, get]) => {
              const value = get(order);
              if (!value) return null;
              return (
                <div key={label}>
                  <dt className='mb-1 font-sans text-xs tracking-wider text-stone-500 uppercase'>
                    {label}
                  </dt>
                  <dd className='text-sm wrap-break-word text-stone-950'>{value}</dd>
                </div>
              );
            })}
          </dl>
        </div>
      )}

      {(order?.paymentMethod === 'bacs' || !order) && (
        <div className='mb-8 border border-stone-200 bg-white p-6 sm:p-8'>
          <div className='mb-3 flex items-center gap-2'>
            <CreditCard className='h-4 w-4 text-stone-600' />
            <h2 className='text-lg text-stone-950'>Direct bank transfer</h2>
          </div>
          <p className='text-sm leading-relaxed text-stone-600'>
            Make your payment directly into our bank account. Please use your order number{' '}
            <strong className='font-medium text-stone-950'>
              {order ? `#${order.orderId}` : '(included in your confirmation email)'}
            </strong>{' '}
            as the payment reference. Your order will be shipped after the payment has been
            received.
          </p>

          <div className='mt-6 border-t border-stone-200 pt-5'>
            <dl className='grid grid-cols-1 gap-x-8 gap-y-3 text-sm sm:grid-cols-[auto_1fr]'>
              {bankDetails.map(([label, value]) => (
                <CopyValue key={label} label={label} value={value} />
              ))}
            </dl>
          </div>
        </div>
      )}

      <div className='flex flex-col items-center justify-center gap-3 sm:flex-row'>
        <Button href='/watches' className='w-full sm:w-auto'>
          Continue Shopping
          <ArrowRight className='h-4 w-4' />
        </Button>
      </div>

      <div className='mt-12 border-t border-stone-200 pt-8 text-center text-sm'>
        <span>
          Questions about your order? Email{' '}
          <a href={CONTACT.emailLink} className='underline-offset-2 hover:underline'>
            {CONTACT.email}
          </a>{' '}
          or WhatsApp{' '}
          <a
            href={CONTACT.whatsappLink}
            target='_blank'
            rel='noopener noreferrer'
            className='underline-offset-2 hover:underline'
          >
            {CONTACT.whatsapp}
          </a>
          .
        </span>
      </div>
    </main>
  );
}
