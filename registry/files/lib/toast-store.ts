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
 *  4. api.promise — the async two-step (enhance-picker-feedback,
 *     2026-08-30): the pending notice pushes at call time, settle
 *     REPLACES it; a rejection lands the error shape (tonal +
 *     jx-hue-error, assertive, sticky). Framework-free, no module
 *     side effects.
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

/** the surface MATERIAL axis (float-button's model) — the ground the
 *  toast paints; variant stays the prominence ladder independently */
export type ToastMaterial = 'popover' | 'glass';

/** the EFFECT loop axis — pulse (breathing ring) | sweep (traveling light) */
export type ToastEffect = 'none' | 'pulse' | 'sweep';

export interface ToastInit {
  title: string;
  description?: string;
  /** ladder prominence: outline (plain notice, default) | tonal (tinted emphasis) */
  variant?: ToastVariant;
  /** the surface material: popover (solid, default) | glass (backdrop-filter
   *  translucent — the entity law's restrained ground) */
  material?: ToastMaterial;
  /** the effect loop: none (default) | pulse (breathing ring) | sweep (a
   *  traveling light — the live/pending signal) */
  effect?: ToastEffect;
  /** render the countdown companion in the trailing lane (needs duration > 0;
   *  hover/focus pause freezes it) */
  countdown?: boolean;
  /** the toast grid's inline-start lane (an icon snippet) */
  leading?: import('svelte').Snippet;
  /** the toast grid's inline-end lane (actions, custom companions) */
  trailing?: import('svelte').Snippet;
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
  /** the async two-step (enhance-picker-feedback, 2026-08-30): push the
   *  pending notice now, then ON SETTLE replace it — a resolve pushes
   *  the success message (polite, default expiry), a rejection pushes
   *  the error message (error variant: tonal + jx-hue-error, assertive,
   *  sticky — a failure must not auto-vanish). Framework-free, no
   *  module side effects; returns the pending toast's id. */
  promise<V>(task: Promise<V>, messages: ToastPromiseInit<V>): number;
}

/** a promise-toast message: a plain title string, a full ToastInit (minus
 *  id), or a function of the settled value / rejection reason returning
 *  either — the function is how "deployed build 4f2a" gets its sha */
export type ToastSettledMessage<V> =
  | string
  | Omit<ToastInit, 'id'>
  | ((value: V) => string | Omit<ToastInit, 'id'>);

export interface ToastPromiseInit<V> {
  /** the in-flight notice — pushed immediately, sticky by default (it is
   *  replaced on settle; a promise that never settles stays honest) */
  pending: string | Omit<ToastInit, 'id'>;
  /** on resolve; omitted → the pending toast is simply dismissed */
  success?: ToastSettledMessage<V>;
  /** on rejection; omitted → the pending toast is simply dismissed.
   *  Defaults to the error shape: tonal + jx-hue-error, assertive,
   *  sticky. A string is the title; an object OVERRIDES the defaults
   *  field-by-field (its `class` replaces jx-hue-error wholesale). */
  error?: ToastSettledMessage<unknown>;
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

  function push(init: ToastInit): number {
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
  }

  // ---- the async two-step ---------------------------------------------------
  // normalize a settled message: string → its title, function → applied to
  // the settled value then normalized, object → verbatim (minus id)
  function normalize<V>(
    message: ToastSettledMessage<V> | undefined,
    value: V,
  ): Omit<ToastInit, 'id'> | undefined {
    if (message == null) return undefined;
    const resolved = typeof message === 'function' ? message(value) : message;
    return typeof resolved === 'string' ? { title: resolved } : resolved;
  }

  function promise<V>(task: Promise<V>, messages: ToastPromiseInit<V>): number {
    const pendingInit =
      typeof messages.pending === 'string' ? { title: messages.pending } : messages.pending;
    // sticky while in flight — the settle swap is the exit, a promise
    // that never settles must keep saying so; an explicit duration wins
    const pendingId = push({ duration: 0, ...pendingInit });
    task.then(
      (value) => {
        dismiss(pendingId);
        const init = normalize(messages.success, value);
        if (init != null) push(init);
      },
      (reason: unknown) => {
        dismiss(pendingId);
        // the error shape IS the contract: tonal + jx-hue-error,
        // assertive, sticky — a consumer object overrides field-by-field
        const init = normalize(messages.error, reason) ?? { title: 'Something failed' };
        push({
          variant: 'tonal',
          class: 'jx-hue-error',
          assertive: true,
          duration: 0,
          ...init,
        });
      },
    );
    return pendingId;
  }

  return {
    api: {
      push,
      dismiss,
      snapshot: () => [...queue],
      promise,
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
