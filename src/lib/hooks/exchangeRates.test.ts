import { describe, it, expect, vi, beforeEach } from 'vitest';

const getExchangeRates = vi.fn<() => Promise<Record<string, number> | null>>();

vi.mock('@/lib/utils/currency', () => ({
  getExchangeRates: () => getExchangeRates(),
}));

async function loadModule() {
  vi.resetModules();
  return import('@/lib/hooks/exchangeRates');
}

describe('shared exchange rate loading', () => {
  beforeEach(() => {
    getExchangeRates.mockReset();
  });

  it('collapses concurrent loads from many cards into a single network request', async () => {
    getExchangeRates.mockResolvedValue({ VND: 25000, EUR: 0.9 });
    const { loadSharedExchangeRates } = await loadModule();

    const results = await Promise.all([
      loadSharedExchangeRates(),
      loadSharedExchangeRates(),
      loadSharedExchangeRates(),
    ]);

    expect(getExchangeRates).toHaveBeenCalledTimes(1);
    expect(results[0]).toEqual({ VND: 25000, EUR: 0.9 });
    expect(results[2]).toEqual({ VND: 25000, EUR: 0.9 });
  });

  it('reuses the resolved rates for later cards without refetching', async () => {
    getExchangeRates.mockResolvedValue({ VND: 25000 });
    const { loadSharedExchangeRates } = await loadModule();

    await loadSharedExchangeRates();
    await loadSharedExchangeRates();

    expect(getExchangeRates).toHaveBeenCalledTimes(1);
  });

  it('stops notifying a card that unsubscribed before rates arrive', async () => {
    let resolveRates: (rates: Record<string, number> | null) => void = () => undefined;
    getExchangeRates.mockReturnValue(
      new Promise((resolve) => {
        resolveRates = resolve;
      })
    );
    const { loadSharedExchangeRates, subscribeExchangeRates } = await loadModule();
    const activeListener = vi.fn();
    const removedListener = vi.fn();

    subscribeExchangeRates(activeListener);
    const unsubscribe = subscribeExchangeRates(removedListener);
    const pendingRequest = loadSharedExchangeRates();
    unsubscribe();
    resolveRates({ VND: 25000 });
    await pendingRequest;

    expect(activeListener).toHaveBeenCalledWith({ VND: 25000 });
    expect(removedListener).not.toHaveBeenCalled();
  });

  it('retries after a failed load instead of caching the failure forever', async () => {
    getExchangeRates.mockResolvedValueOnce(null).mockResolvedValueOnce({ VND: 25000 });
    const { loadSharedExchangeRates } = await loadModule();

    expect(await loadSharedExchangeRates()).toBeNull();
    expect(await loadSharedExchangeRates()).toEqual({ VND: 25000 });
    expect(getExchangeRates).toHaveBeenCalledTimes(2);
  });
});
