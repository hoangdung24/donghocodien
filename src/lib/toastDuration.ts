export const TOAST_AUTO_DISMISS_DELAY_MS = 4000;
export const TOAST_ERROR_DWELL_MS = 12000;
export const TOAST_SUCCESS_DWELL_MS = 6000;

export function resolveToastDuration(variant: 'error' | 'success'): number {
  return variant === 'error' ? TOAST_ERROR_DWELL_MS : TOAST_SUCCESS_DWELL_MS;
}
