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
  private durations = new Map<number, number>();
  private paused = false;

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

  private scheduleDismiss(id: number, durationMs: number): void {
    if (this.paused) return;
    this.durations.set(id, durationMs);
    this.timers.set(
      id,
      setTimeout(() => this.dismiss(id), durationMs)
    );
  }

  show(message: string, variant: Toast['variant'] = 'error', durationMs = this.durationMs): void {
    const toast: Toast = { id: this.nextId++, message, variant };
    this.toasts = [...this.toasts, toast];
    this.scheduleDismiss(toast.id, durationMs);
    this.notify();
  }

  pause(): void {
    this.paused = true;
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
  }

  resume(): void {
    if (!this.paused) return;
    this.paused = false;
    for (const [id, durationMs] of this.durations) {
      if (this.timers.has(id)) continue;
      this.scheduleDismiss(id, durationMs);
    }
  }

  dismiss(id: number): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this.durations.delete(id);
    if (!this.toasts.some((toast) => toast.id === id)) return;
    this.toasts = this.toasts.filter((toast) => toast.id !== id);
    this.notify();
  }
}

export const toastStore = new ToastStore();
