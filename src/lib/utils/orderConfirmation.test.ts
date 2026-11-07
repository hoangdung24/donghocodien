import { describe, expect, it } from 'vitest';
import {
  buildClassicOrderUrl,
  formatOrderTotal,
  readLastOrder,
  type LastOrder,
} from '@/lib/utils/orderConfirmation';

const sampleOrder: LastOrder = {
  orderId: 26419,
  orderKey: 'wc_order_abc123',
  email: 'test@mailinator.com',
  total: '300',
  currencySymbol: '$',
  itemCount: 1,
  paymentMethod: 'bacs',
};

const makeStorage = (raw: string | null) => ({
  getItem: (key: string) => (key === 'spacetime_last_order' ? raw : null),
});

describe('readLastOrder', () => {
  it('returns the order when the id matches', () => {
    const storage = makeStorage(JSON.stringify(sampleOrder));
    expect(readLastOrder(storage, '26419')).toEqual(sampleOrder);
  });

  it('returns null when the id does not match', () => {
    const storage = makeStorage(JSON.stringify(sampleOrder));
    expect(readLastOrder(storage, '9999')).toBeNull();
  });

  it('returns null for malformed json', () => {
    const storage = makeStorage('{not json');
    expect(readLastOrder(storage, '26419')).toBeNull();
  });

  it('returns null when nothing is stored', () => {
    expect(readLastOrder(makeStorage(null), '26419')).toBeNull();
  });

  it('returns null when orderKey is missing', () => {
    const storage = makeStorage(JSON.stringify({ orderId: 26419 }));
    expect(readLastOrder(storage, '26419')).toBeNull();
  });

  it('returns null without a storage', () => {
    expect(readLastOrder(null, '26419')).toBeNull();
  });
});

describe('buildClassicOrderUrl', () => {
  it('joins origin, pathname and query', () => {
    expect(
      buildClassicOrderUrl(
        'https://donghocodien.com',
        '/checkout/order-received/26419/',
        'key=wc_order_abc123'
      )
    ).toBe('https://donghocodien.com/checkout/order-received/26419/?key=wc_order_abc123');
  });

  it('adds the trailing slash when missing', () => {
    expect(
      buildClassicOrderUrl('https://donghocodien.com', '/checkout/order-received/26419', 'key=k')
    ).toBe('https://donghocodien.com/checkout/order-received/26419/?key=k');
  });

  it('omits the query when empty', () => {
    expect(
      buildClassicOrderUrl('https://donghocodien.com', '/checkout/order-received/1/', '')
    ).toBe('https://donghocodien.com/checkout/order-received/1/');
  });
});

describe('formatOrderTotal', () => {
  it('formats with the currency symbol', () => {
    expect(formatOrderTotal('300', '$')).toBe('$300.00');
  });

  it('returns empty string for missing or invalid amounts', () => {
    expect(formatOrderTotal(undefined)).toBe('');
    expect(formatOrderTotal('n/a')).toBe('');
  });
});
