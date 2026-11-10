const PENDING_SLOT_ID = 'page-pending-slot';

type PendingSlotWindow = Window & {
  __PENDING_CLAIMED__?: boolean;
  __PENDING_SLOT_BIND__?: () => void;
};

function claimPendingSlot(target: PendingSlotWindow): void {
  if (target.__PENDING_CLAIMED__) return;
  const slot = document.getElementById(PENDING_SLOT_ID);
  if (!slot) return;
  target.__PENDING_CLAIMED__ = true;
  slot.remove();
}

export function registerPendingSlot(): void {
  if (typeof window === 'undefined' || !document.getElementById(PENDING_SLOT_ID)) return;
  (window as PendingSlotWindow).__PENDING_SLOT_BIND__ = () =>
    claimPendingSlot(window as PendingSlotWindow);
}

registerPendingSlot();
