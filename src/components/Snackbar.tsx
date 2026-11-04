import React, { useSyncExternalStore } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { toastStore } from '../lib/toastStore';

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
    <div className="fixed bottom-6 left-4 right-4 sm:left-6 sm:right-auto z-[60] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => {
        const style = VARIANT_STYLES[toast.variant];
        return (
          <div
            key={toast.id}
            role={style.role}
            className="pointer-events-auto flex items-stretch w-full sm:w-auto max-w-sm bg-white border border-stone-200 shadow-xl animate-snackbar-in"
          >
            <div className={`w-1 flex-shrink-0 ${style.accent}`} />
            <div className="flex items-center gap-3 px-4 py-3.5 min-w-0">
              <style.Icon className={`w-4 h-4 flex-shrink-0 ${style.icon}`} />
              <p className="text-sm text-stone-900 leading-relaxed break-words">{toast.message}</p>
            </div>
            <button
              onClick={() => toastStore.dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="flex items-center px-3 text-stone-400 hover:text-black hover:bg-stone-100 transition-colors duration-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
