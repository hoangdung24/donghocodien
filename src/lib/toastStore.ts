type Listener = () => void;

export interface Toast {
  id: number;
  message: string;
  variant: 'error' | 'success';
}

export class ToastStore {
  private toasts: Toast[] = [];
  private listeners: Set<Listener> = new Set();
  private nextId = 1;
  private timers = new Map<number, ReturnType<typeof setTimeout>>();

  constructor(private readonly durationMs = 4000) {}

  getState(): Toast[] {
    return this.toasts;
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  show(message: string, variant: Toast['variant'] = 'error'): void {
    const toast: Toast = { id: this.nextId++, message, variant };
    this.toasts = [...this.toasts, toast];
    this.timers.set(
      toast.id,
      setTimeout(() => this.dismiss(toast.id), this.durationMs)
    );
    this.notify();
  }

  dismiss(id: number): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    if (!this.toasts.some((toast) => toast.id === id)) return;
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
    this.notify();
  }
}

export const toastStore = new ToastStore();
