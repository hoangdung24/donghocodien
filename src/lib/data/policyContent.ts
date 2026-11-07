export const POLICY_TITLES = {
  'warranty-policy': 'Warranty Policy',
  'exchange-policy': 'Exchange Policy',
  'payment-shipping-methods': 'Payment & Shipping Methods',
} as const;

export type PolicySlug = keyof typeof POLICY_TITLES;

export const POLICY_CONTENT: Record<PolicySlug, string> = {
  'warranty-policy': `
    <h2>6 Months Warranty</h2>
    <p>Every timepiece sold by Spacetime Vintage Watch is covered by a 6 month warranty from the date of delivery, covering movement accuracy and mechanical function.</p>
    <p>The warranty does not cover normal wear, water damage, accidental impact, or any intervention performed by a third party. Please contact us before returning any watch for service.</p>
  `,
  'exchange-policy': `
    <h2>Exchange Policy</h2>
    <p>We want every collector to be delighted with their timepiece. If a watch does not meet your expectations, contact us within 7 days of delivery to arrange an exchange.</p>
    <p>Watches must be returned unworn and in the condition in which they were received. Return shipping is arranged on a case by case basis.</p>
  `,
  'payment-shipping-methods': `
    <h2>Payment Methods</h2>
    <p>We accept secure online payments in USD through our WooCommerce checkout. Contact us directly for alternate arrangements on premium and rare collectible pieces.</p>
    <h2>Shipping</h2>
    <p>We ship worldwide with fully insured, tracked courier services. Dispatch is typically arranged within two business days of confirmed payment.</p>
  `,
};
