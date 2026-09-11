/**
 * notice.test.ts — the ID5 dismissal lifecycle, node-tested with a
 * manual clock (no DOM, no real waiting).
 *
 * Covers the three semantics notice.ts promises: fires once at the
 * deadline, reschedule moves the deadline (no stale early dismissal),
 * cancel stops it forever.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { createNoticeDismissal, NOTICE_DISMISS_MS } from './notice.ts';

/** a deterministic clock: advance(ms) fires due timers in time order */
function manualClock(): {
  timers: { setTimeout: (run: () => void, ms: number) => unknown; clearTimeout: (handle: unknown) => void };
  advance: (ms: number) => void;
} {
  let now = 0;
  let seq = 0;
  const pending = new Map<number, { at: number; run: () => void }>();
  return {
    timers: {
      setTimeout(run: () => void, ms: number): unknown {
        seq += 1;
        pending.set(seq, { at: now + ms, run });
        return seq;
      },
      clearTimeout(handle: unknown): void {
        pending.delete(handle as number);
      },
    },
    advance(ms: number): void {
      const end = now + ms;
      for (;;) {
        const due = [...pending.entries()]
          .filter(([, task]) => task.at <= end)
          .sort((a, b) => a[1].at - b[1].at || a[0] - b[0])[0];
        if (due === undefined) break;
        pending.delete(due[0]);
        now = due[1].at;
        due[1].run();
      }
      now = end;
    },
  };
}

test('dismisses exactly once, at NOTICE_DISMISS_MS after schedule', () => {
  const clock = manualClock();
  let dismissed = 0;
  const dismissal = createNoticeDismissal(() => {
    dismissed += 1;
  }, clock.timers);

  dismissal.schedule();
  clock.advance(NOTICE_DISMISS_MS - 1);
  assert.equal(dismissed, 0, 'still visible one tick before the deadline');

  clock.advance(1);
  assert.equal(dismissed, 1, 'dismissed at the deadline');

  clock.advance(60_000);
  assert.equal(dismissed, 1, 'never fires again');
});

test('rescheduling replaces the pending timer — no stale early dismissal', () => {
  const clock = manualClock();
  let dismissed = 0;
  const dismissal = createNoticeDismissal(() => {
    dismissed += 1;
  }, clock.timers);

  dismissal.schedule();
  clock.advance(NOTICE_DISMISS_MS / 2); // half of the first deadline passes
  dismissal.schedule(); // a NEW notice arrives — fresh 6s from now

  clock.advance(NOTICE_DISMISS_MS / 2);
  assert.equal(dismissed, 0, 'the old deadline is gone — the new notice survives it');

  clock.advance(NOTICE_DISMISS_MS / 2);
  assert.equal(dismissed, 1, 'dismissed at the NEW deadline');
});

test('cancel stops the auto-dismiss — nothing fires, ever', () => {
  const clock = manualClock();
  let dismissed = 0;
  const dismissal = createNoticeDismissal(() => {
    dismissed += 1;
  }, clock.timers);

  dismissal.schedule();
  dismissal.cancel(); // the valid action cleared the notice first
  clock.advance(10 * NOTICE_DISMISS_MS);
  assert.equal(dismissed, 0, 'a cleared notice never resurrects');

  // cancel is idempotent (teardown may follow a clear)
  dismissal.cancel();
  assert.equal(dismissed, 0);
});
