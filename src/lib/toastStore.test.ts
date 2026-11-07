import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastStore } from './toastStore';

describe('ToastStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('show adds a toast with an error variant by default', () => {
    const store = new ToastStore(4000);
    store.show('Failed to add item');
    expect(store.getState()).toHaveLength(1);
    expect(store.getState()[0].message).toBe('Failed to add item');
    expect(store.getState()[0].variant).toBe('error');
  });

  it('each toast gets a unique id', () => {
    const store = new ToastStore(4000);
    store.show('first');
    store.show('second');
    expect(store.getState()[0].id).not.toBe(store.getState()[1].id);
  });

  it('auto-dismisses a toast after the configured duration', () => {
    const store = new ToastStore(4000);
    store.show('Failed to add item');
    vi.advanceTimersByTime(3999);
    expect(store.getState()).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(store.getState()).toHaveLength(0);
  });

  it('dismiss removes a specific toast and leaves others to expire', () => {
    const store = new ToastStore(4000);
    store.show('first');
    store.show('second');
    store.dismiss(store.getState()[0].id);
    expect(store.getState().map((toast) => toast.message)).toEqual(['second']);
    vi.advanceTimersByTime(4000);
    expect(store.getState()).toHaveLength(0);
  });

  it('dismiss of an unknown id is a no-op that does not notify', () => {
    const store = new ToastStore(4000);
    let calls = 0;
    store.subscribe(() => {
      calls += 1;
    });
    store.dismiss(999);
    expect(calls).toBe(0);
  });

  it('notifies subscribers on show and on auto-dismiss', () => {
    const store = new ToastStore(4000);
    let calls = 0;
    store.subscribe(() => {
      calls += 1;
    });
    store.show('msg');
    expect(calls).toBe(1);
    vi.advanceTimersByTime(4000);
    expect(calls).toBe(2);
  });
});
