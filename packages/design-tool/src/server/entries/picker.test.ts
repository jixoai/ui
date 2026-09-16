/**
 * @jixoai/ui-design (server entries) — the studio-chain walk of the
 * canvas picker, node-tested through findStudioWindowFrom's
 * structural window fakes (no DOM — the selection.ts house style).
 *
 * Laws under test (r3 T6, #14 P1-1 — the second-layer pick seam):
 *   - the studio hook is found through the NESTED frame chain
 *     (frame → canvas → studio: 2 hops up, depth budget 6)
 *   - the depth budget is honored (a seam beyond it is unreachable)
 *   - a self-parent chain (the top window, or a standalone document)
 *     stops the walk — no infinite loop
 *   - a cross-origin ancestor (property read throws) bails to null
 *
 * Original need: Owner 2026-09-12 (design-studio-r3 T6).
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { findStudioWindowFrom, resolveRingUpdate } from './picker.js';

/** a window-shaped fake: parent chain by reference, seam via getter
 *  (typeof triggers the getter — the cross-origin throw channel) */
function fakeWindow({ seam = false, parent = null as object | null, throwOnSeamRead = false } = {}) {
  const self: Record<string, unknown> = { parent };
  Object.defineProperty(self, '__jixoaiDesignSelect', {
    get() {
      if (throwOnSeamRead) throw new TypeError('blocked a frame with origin "x" from accessing a cross-origin frame');
      return seam ? () => {} : undefined;
    },
    configurable: true,
  });
  // close the chain: a window whose parent is itself is the top
  return self as unknown as { parent: unknown; __jixoaiDesignSelect?: unknown };
}

/** frame → canvas → studio: the studio-embedded second-layer shape */
function nestedChain({ studioSeam }: { studioSeam: boolean }) {
  const studio = fakeWindow({ seam: studioSeam });
  (studio as unknown as { parent: unknown }).parent = studio; // top window
  const canvas = fakeWindow({ parent: studio });
  const frame = fakeWindow({ parent: canvas });
  return { frame, canvas, studio };
}

test('finds the studio seam two hops up (frame → canvas → studio)', () => {
  const { frame, studio } = nestedChain({ studioSeam: true });
  assert.equal(findStudioWindowFrom(frame), studio);
});

test('returns null when no ancestor carries the seam', () => {
  const { frame } = nestedChain({ studioSeam: false });
  assert.equal(findStudioWindowFrom(frame), null);
});

test('finds the seam on the starting window itself (first-layer canvas)', () => {
  const w = fakeWindow({ seam: true });
  (w as unknown as { parent: unknown }).parent = w;
  assert.equal(findStudioWindowFrom(w), w);
});

test('honors the depth budget: a seam seven hops up is unreachable', () => {
  // build top-down: top(seam) ← ... ← 7 intermediates ← frame
  const top = fakeWindow({ seam: true });
  (top as unknown as { parent: unknown }).parent = top;
  let current: { parent: unknown } = top as unknown as { parent: unknown };
  const intermediates: Array<{ parent: unknown }> = [];
  for (let i = 0; i < 7; i += 1) {
    const next = fakeWindow({ parent: current });
    intermediates.push(next as unknown as { parent: unknown });
    current = next as unknown as { parent: unknown };
  }
  const frame = intermediates[intermediates.length - 1];
  assert.equal(findStudioWindowFrom(frame), null); // intermediate[6] sits 7 hops below top — over budget
  // intermediate[1] sits 2 hops below top — well within the budget
  const twoHops = intermediates[1];
  assert.equal(findStudioWindowFrom(twoHops), top);
});

test('a standalone document (self-parent, no seam) stops cleanly', () => {
  const standalone = fakeWindow({ seam: false });
  (standalone as unknown as { parent: unknown }).parent = standalone;
  assert.equal(findStudioWindowFrom(standalone), null);
});

test('a cross-origin ancestor read bails to null, not a throw', () => {
  const hostile = fakeWindow({ throwOnSeamRead: true });
  (hostile as unknown as { parent: unknown }).parent = hostile;
  const canvas = fakeWindow({ parent: hostile });
  const frame = fakeWindow({ parent: canvas });
  assert.equal(findStudioWindowFrom(frame), null); // the walk SURVIVED the hostile parent
  assert.equal(findStudioWindowFrom(hostile), null); // reading the hostile window itself bails too
});

/* ── the three ring laws (the acceptance-fixes rewrite, Owner
   2026-09-17: the laws a user can recite) — resolveRingUpdate is the
   pure decision core; every scenario below is a real session shape,
   including the P3 probe sequence that exposed the old guard bug
   (select a frame component, re-pick the container: the panel moved,
   the ring stayed). */

const F1 = 'jixoai-design-frame-a';
const F2 = 'jixoai-design-frame-b';

test('law 1 — hover with a box: the last event always wins', () => {
  assert.deepEqual(resolveRingUpdate(F1, 'hover', F2, true, false), { owner: F2, apply: true });
  assert.deepEqual(resolveRingUpdate('canvas', 'hover', F1, true, true), { owner: F1, apply: true });
  assert.deepEqual(resolveRingUpdate(null, 'hover', 'canvas', true, false), { owner: 'canvas', apply: true });
});

test('law 2 — selected with a box: a pick always wins and takes ownership', () => {
  // a stale frame's REFRESH is ignored (the late-report steal), but any PICK wins
  assert.deepEqual(resolveRingUpdate('canvas', 'selected', F1, true, false), { owner: 'canvas', apply: false });
  assert.deepEqual(resolveRingUpdate('canvas', 'selected', F1, true, true), { owner: F1, apply: true });
  // the owner's own refresh re-applies (repeated placement of the same element is harmless)
  assert.deepEqual(resolveRingUpdate(F1, 'selected', F1, true, false), { owner: F1, apply: true });
});

test('law 3 — clearing: only the current owner may clear', () => {
  assert.deepEqual(resolveRingUpdate(F1, 'selected', F2, false, true), { owner: F1, apply: false });
  assert.deepEqual(resolveRingUpdate(F1, 'selected', F1, false, true), { owner: null, apply: true });
  assert.deepEqual(resolveRingUpdate(F1, 'hover', F2, false, false), { owner: F1, apply: false });
  assert.deepEqual(resolveRingUpdate(null, 'selected', 'canvas', false, true), { owner: null, apply: false });
});

test('the P3 sequence — re-picking the container after a frame pick', () => {
  // initial pick of the container (canvas): wins from nothing
  assert.deepEqual(resolveRingUpdate(null, 'selected', 'canvas', true, true), { owner: 'canvas', apply: true });
  // frame component picked inside frame A: the pick wins and takes ownership
  assert.deepEqual(resolveRingUpdate('canvas', 'selected', F1, true, true), { owner: F1, apply: true });
  // the user re-picks the container caption: a pick wins — the ring MUST move
  // (the old idempotence guard short-circuited exactly here: panel moved, ring stayed)
  assert.deepEqual(resolveRingUpdate(F1, 'selected', 'canvas', true, true), { owner: 'canvas', apply: true });
  // the frame's later refresh must NOT steal the ring back
  assert.deepEqual(resolveRingUpdate('canvas', 'selected', F1, true, false), { owner: 'canvas', apply: false });
  // nor may its null clear what it no longer owns
  assert.deepEqual(resolveRingUpdate('canvas', 'selected', F1, false, true), { owner: 'canvas', apply: false });
});
