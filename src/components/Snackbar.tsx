import { useSyncExternalStore } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { toastStore } from '@/lib/toastStore';

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

  if (toasts.length === 0) return null;

  return (
    <div className='pointer-events-none fixed right-4 bottom-6 left-4 z-60 flex flex-col items-end gap-3 sm:right-6 sm:left-auto'>
      {toasts.map((toast) => {
        const style = VARIANT_STYLES[toast.variant];
        return (
          <div
            key={toast.id}
            role={style.role}
            className='animate-snackbar-in pointer-events-auto flex w-full max-w-sm items-stretch border border-stone-200 bg-white shadow-xl sm:w-auto'
          >
            <div className={`w-1 shrink-0 ${style.accent}`} />
            <div className='flex min-w-0 items-center gap-3 px-4 py-3.5'>
              <style.Icon className={`h-4 w-4 shrink-0 ${style.icon}`} />
              <p className='text-sm leading-relaxed wrap-break-word text-stone-900'>
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => toastStore.dismiss(toast.id)}
              aria-label='Dismiss notification'
              className='flex items-center px-3 text-stone-400 transition-colors duration-200 hover:bg-stone-100 hover:text-brand-dark'
            >
              <X className='h-4 w-4' />
            </button>
          </div>
        );
      })}
    </div>
  );
}
