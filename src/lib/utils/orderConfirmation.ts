export const LAST_ORDER_STORAGE_KEY = 'spacetime_last_order';

export interface LastOrder {
  orderId: number;
  orderKey: string;
  email?: string;
  total?: string;
  currencySymbol?: string;
  itemCount?: number;
  paymentMethod?: string;
  date?: string;
  status?: string;
  redirectUrl?: string;
}

interface StorageLike {
  getItem(key: string): string | null;
}

export function readLastOrder(storage: StorageLike | null, orderId: string): LastOrder | null {
  if (!storage || !orderId) return null;
  let raw: string | null = null;
  try {
    raw = storage.getItem(LAST_ORDER_STORAGE_KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<LastOrder>;
    if (parsed && String(parsed.orderId) === orderId && parsed.orderKey) {
      return parsed as LastOrder;
    }
    return null;
  } catch {
    return null;
  }
}

export function buildClassicOrderUrl(origin: string, pathname: string, search: string): string {
  const path = pathname.endsWith('/') ? pathname : `${pathname}/`;
  const query = search.replace(/^\?/, '');
  return `${origin}${path}${query ? `?${query}` : ''}`;
}

export function formatOrderTotal(total: string | undefined, currencySymbol = '$'): string {
  const num = parseFloat(total ?? '');
  if (isNaN(num)) return '';
  return `${currencySymbol}${num.toFixed(2)}`;
}

export function copyText(text: string): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text).then(
      () => true,
      () => copyTextLegacy(text)
    );
  }
  return Promise.resolve(copyTextLegacy(text));
}

function copyTextLegacy(text: string): boolean {
  if (typeof document === 'undefined') return false;
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  document.body.removeChild(textarea);
  return ok;
}
