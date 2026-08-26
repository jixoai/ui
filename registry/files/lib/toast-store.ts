/**
 * jixoai toast store (registry/files/lib/toast-store.ts → @lib/toast-store.ts).
 * The state-and-lifecycle half of the toast pair — framework-free, DOM-free.
 * Pair with toast-viewport.svelte, which owns the presentation surface
 * (corner stack, max visible, live regions, dismiss buttons).
 *
 * Two seams, one reason (Codex batch-3 ruling): the STORE is created by
 * the application (createToastStore()) — never a module-level singleton,
 * so SSR requests never share state — and handed to the viewport mounted
 * once in the root layout. Anything in the app pushes through the api
 * handle it captured at creation.
 *
 * Intent list (2026-08-22, batch-3):
 *  1. push/dismiss/subscribe — the whole surface, ~100 lines
 *  2. per-toast expiry with hover/focus pause (arm/pause/resume)
 *  3. duration: 0 = sticky (only the dismiss button clears it)
 *
 * Variant grammar (2026-08-26, variant-grammar change): the retired
 * tone law (default/primary/destructive) becomes the ladder —
 * variant 'outline' (default, the plain notice) | 'tonal' (tinted
 * emphasis) — and semantic hue rides the SAME class-utility injection
 * seam as markup: push({ variant: 'tonal', class:
 * 'jx-hue-error') for a failed status (error, never
 * the destructive action hue — design §3). The optional class lands
 * on the toast card through the viewport's cn() merge.
 */

export type ToastVariant = 'outline' | 'tonal';

export interface ToastInit {
  title: string;
  description?: string;
  /** ladder prominence: outline (plain notice, default) | tonal (tinted emphasis) */
  variant?: ToastVariant;
  /** consumer classes — the hue-injection seam, e.g. 'jx-hue-error' */
  class?: string;
  /** ms until auto-dismiss; 0 = sticky. Default 5000 */
  duration?: number;
  /** true → the viewport announces this one assertively (role=alert) */
  assertive?: boolean;
}

export interface ToastItem extends ToastInit {
  id: number;
}

export interface ToastApi {
  /** queue a toast; returns its id (for targeted dismiss) */
  push(init: ToastInit): number;
  dismiss(id: number): void;
  /** the current queue, oldest first — for tests and diagnostics */
  snapshot(): ToastItem[];
}

interface ToastInternal {
  item: ToastItem;
  timer: ReturnType<typeof setTimeout> | undefined;
  /** remaining ms while paused; undefined while the timer runs */
  remaining: number | undefined;
  expiresAt: number;
}

export interface ToastStore {
  api: ToastApi;
  subscribe(fn: (items: ToastItem[]) => void): () => void;
  /** freeze one toast's countdown (viewport pointer/focus enter) */
  pause(id: number): void;
  /** unfreeze; restarts from the remaining time */
  resume(id: number): void;
}

const DEFAULT_DURATION = 5000;

export function createToastStore(): ToastStore {
  const subs = new Set<(items: ToastItem[]) => void>();
  const live = new Map<number, ToastInternal>();
  let queue: ToastItem[] = [];
  let nextId = 1;
  let now = () => Date.now();

  const emit = (): void => {
    const snapshot = [...queue];
    for (const fn of subs) fn(snapshot);
  };

  function clearTimer(internal: ToastInternal): void {
    if (internal.timer !== undefined) clearTimeout(internal.timer);
    internal.timer = undefined;
  }

  function arm(internal: ToastInternal): void {
    clearTimer(internal);
    const wait = internal.remaining ?? internal.expiresAt - now();
    if (wait <= 0) {
      dismiss(internal.item.id);
      return;
    }
    internal.timer = setTimeout(() => dismiss(internal.item.id), wait);
  }

  function dismiss(id: number): void {
    const internal = live.get(id);
    if (!internal) return;
    clearTimer(internal);
    live.delete(id);
    queue = queue.filter((item) => item.id !== id);
    emit();
  }

  return {
    api: {
      push(init: ToastInit): number {
        const id = nextId++;
        const item: ToastItem = { ...init, id };
        const duration = init.duration ?? DEFAULT_DURATION;
        const internal: ToastInternal = {
          item,
          timer: undefined,
          remaining: undefined,
          expiresAt: duration === 0 ? Infinity : now() + duration,
        };
        queue = [...queue, item];
        live.set(id, internal);
        if (duration !== 0) arm(internal);
        emit();
        return id;
      },
      dismiss,
      snapshot: () => [...queue],
    },
    subscribe(fn: (items: ToastItem[]) => void): () => void {
      subs.add(fn);
      fn([...queue]);
      return () => subs.delete(fn);
    },
    pause(id: number): void {
      const internal = live.get(id);
      if (!internal || internal.timer === undefined || internal.expiresAt === Infinity) return;
      internal.remaining = internal.expiresAt - now();
      clearTimer(internal);
    },
    resume(id: number): void {
      const internal = live.get(id);
      if (!internal || internal.remaining === undefined) return;
      internal.expiresAt = now() + internal.remaining;
      internal.remaining = undefined;
      arm(internal);
    },
  };
}
