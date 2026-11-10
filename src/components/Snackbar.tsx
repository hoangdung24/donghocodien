import { useRef, useState, useSyncExternalStore } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { toastStore, type Toast } from '@/lib/toastStore';

type VisibleToast = Pick<Toast, 'id' | 'message' | 'variant'>;

interface ToastClip {
  source: Toast[];
  visible: VisibleToast[];
}

const intersectToasts = (previous: VisibleToast[], next: Toast[]): VisibleToast[] => {
  if (previous.length === 0) return [];
  const nextById = new Map(next.map((toast) => [toast.id, toast]));
  return previous.flatMap((toast) => {
    const replacement = nextById.get(toast.id);
    return replacement ? [replacement] : [];
  });
};

const VARIANT_STYLES = {
  error: { accent: 'bg-red-700', icon: 'text-red-700', Icon: AlertCircle, role: 'alert' },
  success: { accent: 'bg-green-700', icon: 'text-green-700', Icon: CheckCircle2, role: 'status' },
} as const;

export function Snackbar() {
  const toasts = useSyncExternalStore(
    toastStore.subscribe.bind(toastStore),
    toastStore.getState.bind(toastStore),
    () => []
  );

  const sourceToasts = useRef(toasts);
  sourceToasts.current = toasts;
  const [clip, setClip] = useState<ToastClip>({ source: toasts, visible: [] });

  if (clip.source !== toasts) {
    const entered = toasts.some(
      (toast) => !clip.visible.some((visibleToast) => visibleToast.id === toast.id)
    );
    setClip({
      source: toasts,
      visible: entered ? clip.visible : intersectToasts(clip.visible, toasts),
    });
    if (entered && clip.visible.length === 0) {
      const deferredToasts = toasts;
      queueMicrotask(() => {
        if (sourceToasts.current !== deferredToasts) return;
        setClip((current) =>
          current.source === deferredToasts
            ? current
            : { source: deferredToasts, visible: deferredToasts }
        );
      });
    }
  }

  const visibleToasts = clip.visible;

  const holdToRead = () => toastStore.pause();
  const releaseHold = () => toastStore.resume();

  return (
    <div
      role='region'
      aria-label='Notifications'
      onPointerEnter={holdToRead}
      onPointerLeave={releaseHold}
      onFocusCapture={holdToRead}
      onBlurCapture={releaseHold}
      className='pointer-events-none fixed right-4 bottom-6 left-4 z-60 flex flex-col items-end gap-3 sm:right-6 sm:left-auto'
    >
      {visibleToasts.map((toast) => {
        const style = VARIANT_STYLES[toast.variant];
        return (
          <div
            key={toast.id}
            role={style.role}
            className='motion-safe:animate-snackbar-in pointer-events-auto flex w-full max-w-sm items-stretch border border-stone-200 bg-white shadow-xl sm:w-auto'
          >
            <div aria-hidden='true' className={`w-1 shrink-0 ${style.accent}`} />
            <div className='flex min-w-0 items-center gap-3 px-4 py-3.5'>
              <style.Icon aria-hidden='true' className={`h-4 w-4 shrink-0 ${style.icon}`} />
              <p className='text-sm leading-relaxed wrap-break-word text-stone-900'>
                <span className='sr-only'>
                  {toast.variant === 'error' ? 'Error: ' : 'Success: '}
                </span>
                {toast.message}
              </p>
            </div>
            <button
              type='button'
              onClick={() => toastStore.dismiss(toast.id)}
              aria-label='Dismiss notification'
              className='flex min-w-11 items-center justify-center px-3 text-stone-600 transition-colors duration-200 hover:bg-stone-100 hover:text-brand-dark'
            >
              <X className='h-4 w-4' aria-hidden='true' />
            </button>
          </div>
        );
      })}
    </div>
  );
}
