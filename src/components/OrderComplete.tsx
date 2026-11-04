import { useEffect, useState } from "react";
import { BadgeCheck, CreditCard, ArrowRight, Copy, Check } from "lucide-react";
import { Button } from "./Button";
import {
  copyText,
  formatOrderTotal,
  readLastOrder,
  type LastOrder,
} from "../lib/utils/orderConfirmation";
import { BANK, CONTACT } from "../lib/constants";

const summaryOrder: Array<[string, (order: LastOrder) => string]> = [
  ["Order number", (o) => `#${o.orderId}`],
  ["Date", (o) => o.date ?? ""],
  ["Email", (o) => o.email ?? ""],
  ["Total", (o) => formatOrderTotal(o.total, o.currencySymbol)],
  [
    "Payment method",
    (o) => (o.paymentMethod === "bacs" ? "Direct bank transfer" : (o.paymentMethod ?? "")),
  ],
];

const bankDetails: Array<[string, string]> = [
  ["Beneficiary name", BANK.beneficiaryName],
  ["Bank name", BANK.bankName],
  ["Branch", BANK.branch],
  ["Bank address", BANK.bankAddress],
  ["Account number", BANK.accountNumber],
  ["Swift code", BANK.swiftCode],
  ["Account address", BANK.accountAddress],
  ["Email", CONTACT.email],
];

function CopyValue({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    const ok = await copyText(value);
    setCopied(ok);
    setTimeout(() => setCopied(false), 1600);
  };
  return (
    <div key={label} className="contents">
      <dt className="text-xs uppercase tracking-wider text-stone-500 font-sans pt-0.5">{label}</dt>
      <dd className="font-serif text-stone-950 wrap-break-words flex items-center gap-2">
        <span>{value}</span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Copy ${label}`}
          className="p-1 text-stone-400 hover:text-stone-900 transition-colors"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-green-700" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
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
    const orderId = window.location.pathname.split("/").filter(Boolean).pop() ?? "";
    const stored = readLastOrder(window.sessionStorage, orderId);
    setOrder(stored);
    setLoaded(true);
  }, []);

  if (!loaded) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-stone-900 border-t-transparent" />
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
      <div className="text-center mb-10">
        <h1 className="font-serif text-3xl sm:text-4xl text-stone-950 mb-3">
          Thank you. Your order has been received.
        </h1>
        <p className="text-sm text-stone-500 max-w-md mx-auto">
          A confirmation has been sent to your email address with your order details and payment
          instructions.
        </p>
      </div>

      {order && (
        <div className="border border-stone-200 bg-white p-6 sm:p-8 mb-8">
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-4">
            {summaryOrder.map(([label, get]) => {
              const value = get(order);
              if (!value) return null;
              return (
                <div key={label}>
                  <dt className="text-xs uppercase tracking-wider text-stone-500 mb-1 font-sans">
                    {label}
                  </dt>
                  <dd className="font-serif text-sm text-stone-950 break-words">{value}</dd>
                </div>
              );
            })}
          </dl>
        </div>
      )}

      {(order?.paymentMethod === "bacs" || !order) && (
        <div className="border border-stone-200 bg-white p-6 sm:p-8 mb-8">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4 text-stone-600" />
            <h2 className="font-serif text-lg text-stone-950">Direct bank transfer</h2>
          </div>
          <p className="text-sm text-stone-600 leading-relaxed">
            Make your payment directly into our bank account. Please use your order number{" "}
            <strong className="font-medium text-stone-950">
              {order ? `#${order.orderId}` : "(included in your confirmation email)"}
            </strong>{" "}
            as the payment reference. Your order will be shipped after the payment has been
            received.
          </p>

          <div className="mt-6 pt-5 border-t border-stone-200">
            <dl className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-x-8 gap-y-3 text-sm">
              {bankDetails.map(([label, value]) => (
                <CopyValue key={label} label={label} value={value} />
              ))}
            </dl>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <Button href="/shop" className="w-full sm:w-auto">
          Continue Shopping
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="mt-12 pt-8 border-t border-stone-200 text-center text-sm text-stone-500">
        <span>
          Questions about your order? Email{" "}
          <a href={CONTACT.emailLink} className="hover:underline underline-offset-2">
            {CONTACT.email}
          </a>{" "}
          or WhatsApp{" "}
          <a
            href={CONTACT.whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline underline-offset-2"
          >
            {CONTACT.whatsapp}
          </a>
          .
        </span>
      </div>
    </main>
  );
}
