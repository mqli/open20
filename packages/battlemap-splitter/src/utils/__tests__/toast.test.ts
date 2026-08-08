import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { showToast, dismissToast, subscribeToToasts, __reset } from '@/utils/toast';
import type { Toast } from '@/utils/toast';

describe('toast', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    __reset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('showToast', () => {
    it('adds a toast and notifies listeners', () => {
      const listener = vi.fn();
      const unsub = subscribeToToasts(listener);

      const id = showToast('Test message', 'info');
      expect(typeof id).toBe('number');

      expect(listener).toHaveBeenCalledTimes(1);
      const toasts: Toast[] = listener.mock.calls[0][0];
      expect(toasts).toHaveLength(1);
      expect(toasts[0].message).toBe('Test message');
      expect(toasts[0].type).toBe('info');

      unsub();
    });

    it('auto-dismisses after the specified duration', () => {
      const listener = vi.fn();
      const unsub = subscribeToToasts(listener);

      showToast('Auto-dismiss', 'info', 2000);
      expect(listener).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(2000);
      expect(listener).toHaveBeenCalledTimes(2);
      const toastsAfter: Toast[] = listener.mock.calls[1][0];
      expect(toastsAfter).toHaveLength(0);

      unsub();
    });

    it('does not auto-dismiss when duration is 0', () => {
      const listener = vi.fn();
      const unsub = subscribeToToasts(listener);

      showToast('Persistent', 'error', 0);
      vi.advanceTimersByTime(10000);

      expect(listener).toHaveBeenCalledTimes(1);
      const toasts: Toast[] = listener.mock.calls[0][0];
      expect(toasts).toHaveLength(1);

      unsub();
    });

    it('supports warning type', () => {
      const listener = vi.fn();
      const unsub = subscribeToToasts(listener);

      showToast('Warning!', 'warning');
      const toasts: Toast[] = listener.mock.calls[0][0];
      expect(toasts[0].type).toBe('warning');

      unsub();
    });
  });

  describe('dismissToast', () => {
    it('removes a toast by id', () => {
      const listener = vi.fn();
      const unsub = subscribeToToasts(listener);

      const id = showToast('Message 1', 'info');
      showToast('Message 2', 'success');

      dismissToast(id);
      const toasts: Toast[] = listener.mock.calls[listener.mock.calls.length - 1][0];
      expect(toasts).toHaveLength(1);
      expect(toasts[0].message).toBe('Message 2');

      unsub();
    });
  });

  describe('subscribeToToasts', () => {
    it('returns an unsubscribe function', () => {
      const listener = vi.fn();
      const unsub = subscribeToToasts(listener);

      showToast('Test', 'info');
      expect(listener).toHaveBeenCalledTimes(1);

      unsub();

      showToast('Test 2', 'info');
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });
});
