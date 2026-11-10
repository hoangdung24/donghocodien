import { describe, it, expect, vi, beforeEach } from 'vitest';

const ratesState: {
  latest: Record<string, number> | null;
  listeners: Set<(rates: Record<string, number> | null) => void>;
} = {
  latest: null,
  listeners: new Set(),
};

vi.mock('@/lib/hooks/exchangeRates', () => ({
  hasSharedExchangeRates: () => ratesState.latest !== null,
  readSharedExchangeRates: () => ratesState.latest,
  subscribeExchangeRates: (listener: (rates: Record<string, number> | null) => void) => {
    ratesState.listeners.add(listener);
    return () => ratesState.listeners.delete(listener);
  },
  loadSharedExchangeRates: async () => {
    const rates = { VND: 25000, HKD: 7.84 };
    ratesState.latest = rates;
    for (const listener of ratesState.listeners) listener(rates);
    return rates;
  },
}));

vi.mock('@/lib/utils/geo', () => ({
  readVisitorCountry: () => 'HK',
  detectVisitorCountry: async () => 'HK',
}));

describe('useApproxDisplay rate delivery', () => {
  beforeEach(() => {
    ratesState.latest = null;
    ratesState.listeners.clear();
  });

  it('delivers rates that resolve before the subscriber callback is registered', async () => {
    const { loadSharedExchangeRates, subscribeExchangeRates } =
      await import('@/lib/hooks/exchangeRates');
    const received: Array<Record<string, number> | null> = [];

    subscribeExchangeRates((rates) => received.push(rates));
    await loadSharedExchangeRates();

    expect(received).toHaveLength(1);
    expect(received[0]?.HKD).toBe(7.84);
  });

  it('lets a late subscriber read the cached rates instead of missing the broadcast', async () => {
    const { loadSharedExchangeRates, readSharedExchangeRates, hasSharedExchangeRates } =
      await import('@/lib/hooks/exchangeRates');
    await loadSharedExchangeRates();

    expect(hasSharedExchangeRates()).toBe(true);
    expect(readSharedExchangeRates()?.HKD).toBe(7.84);
  });
});
