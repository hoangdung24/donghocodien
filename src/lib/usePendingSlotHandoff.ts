import { useEffect } from 'react';

export function usePendingSlotHandoff(isReady: boolean): void {
  useEffect(() => {
    if (!isReady) return;
    const target = window as Window & { __PENDING_SLOT_BIND__?: () => void };
    target.__PENDING_SLOT_BIND__?.();
  }, [isReady]);
}
