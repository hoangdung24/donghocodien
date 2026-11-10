import { getExchangeRates } from '@/lib/utils/currency';

type RateListener = (rates: Record<string, number> | null) => void;

let latestRates: Record<string, number> | null = null;
let inFlightRequest: Promise<Record<string, number> | null> | null = null;
const rateListeners = new Set<RateListener>();

export function subscribeExchangeRates(listener: RateListener): () => void {
  rateListeners.add(listener);
  return () => {
    rateListeners.delete(listener);
  };
}

export function hasSharedExchangeRates(): boolean {
  return latestRates !== null;
}

export function readSharedExchangeRates(): Record<string, number> | null {
  return latestRates;
}

export function loadSharedExchangeRates(): Promise<Record<string, number> | null> {
  if (latestRates) return Promise.resolve(latestRates);

  inFlightRequest ??= getExchangeRates()
    .then((rates) => {
      if (rates) {
        latestRates = rates;
        for (const listener of rateListeners) listener(rates);
      }
      return rates;
    })
    .finally(() => {
      inFlightRequest = null;
    });

  return inFlightRequest;
}
