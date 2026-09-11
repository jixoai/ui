/**
 * @jixoai/ui-design (studio) — the transient notice lifecycle (r3 T1,
 * ID5: failure notices must dismiss).
 *
 * Orthogonal intent (1): the auto-dismiss scheduler for the property
 * panel's transient notices (edit failures: 409 concurrent write,
 * non-representable fallback, endpoint errors). The r2 dead weight:
 * a failure notice hung until the next selection — the Owner read it
 * as a permanent panel state. Semantics (the simplest honest set):
 *
 *   show     the notice renders AND a fresh NOTICE_DISMISS_MS timer
 *            arms; a newer notice replaces the older timer (no stale
 *            dismissal can kill the new message early)
 *   clear    the notice leaves and any pending timer cancels — valid
 *            actions (a new commit, a selection change) already
 *            cleared the text in r2; the timer must never resurrect
 *            or fire after that
 *   teardown pending timer cancels (no dismissal after unmount)
 *
 * PURE scheduling core with injected timers: node tests drive the
 * lifecycle with a manual clock; the panel passes nothing (the real
 * globals) in the browser. The panel keeps owning the notice $state —
 * this module owns only WHEN a shown notice dismisses itself.
 *
 * Original need: Owner 2026-09-12 (design-studio-r3 T1/ID5).
 */

/** how long a transient notice stays up before dismissing itself */
export const NOTICE_DISMISS_MS = 6000;

/** the timer surface (real contexts get the globals; tests a manual clock) */
export interface NoticeTimers {
  setTimeout(callback: () => void, ms: number): unknown;
  clearTimeout(handle: unknown): void;
}

/** the scheduling core the panel wires its notice $state to */
export interface NoticeDismissal {
  /** (re)arm the auto-dismiss — call on every show */
  schedule(): void;
  /** cancel a pending auto-dismiss — call on every clear and on teardown */
  cancel(): void;
}

export function createNoticeDismissal(
  onDismiss: () => void,
  timers: NoticeTimers = {
    setTimeout: (callback, ms) => setTimeout(callback, ms),
    clearTimeout: (handle) => clearTimeout(handle),
  },
): NoticeDismissal {
  let handle: unknown = null;
  return {
    schedule(): void {
      if (handle !== null) timers.clearTimeout(handle);
      handle = timers.setTimeout(() => {
        handle = null;
        onDismiss();
      }, NOTICE_DISMISS_MS);
    },
    cancel(): void {
      if (handle === null) return;
      timers.clearTimeout(handle);
      handle = null;
    },
  };
}
