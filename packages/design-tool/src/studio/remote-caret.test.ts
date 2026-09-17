/**
 * remote-caret tests — the ZERO-WIDTH SPAN MIRROR method's pure half
 * (presence-liveness P4): the marker plan, MIRROR_PROPS, the line
 * split, and the selection-range segmentation run in node with
 * structural fakes; the selectionchange tracker runs against a fake
 * host + injected scheduler; the DOM measure halves stay source-law
 * pinned in presence-tree-panel.test.ts.
 *
 * Original need: presence-visuals task group 2 (2026-09-17); the v2
 * zero-width-span battery is presence-liveness P4 (2026-09-17).
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import {
  MIRROR_PROPS,
  ZERO_WIDTH_MARKER,
  caretLineSplit,
  clampCaretOffset,
  mirrorPlanOf,
  selectionRects,
  trackFieldSelection,
} from './remote-caret.ts';

/* ── offset clamping ─────────────────────────────────────────────────── */

test('offsets clamp into the value range: negatives → 0, beyond-length → len, non-integers truncate', () => {
  assert.equal(clampCaretOffset('hello', -3), 0);
  assert.equal(clampCaretOffset('hello', 99), 5);
  assert.equal(clampCaretOffset('hello', 2), 2);
  assert.equal(clampCaretOffset('hello', 2.9), 2); // truncates, never rounds up past the char
  assert.equal(clampCaretOffset('hello', Number.NaN), 0);
  assert.equal(clampCaretOffset('hello', Number.POSITIVE_INFINITY), 5);
});

/* ── the line split (the pure "which line" model) ────────────────────── */

test('line split: explicit newlines advance the line, the prefix restarts per line', () => {
  const value = 'ab\ncdef\nghi';
  // caret at the very start
  assert.deepEqual(caretLineSplit(value, 0), { lineIndex: 0, linePrefix: '' });
  // end of line 1 (before the \n)
  assert.deepEqual(caretLineSplit(value, 2), { lineIndex: 0, linePrefix: 'ab' });
  // ON the newline position → line 2's start
  assert.deepEqual(caretLineSplit(value, 3), { lineIndex: 1, linePrefix: '' });
  // mid line 2
  assert.deepEqual(caretLineSplit(value, 6), { lineIndex: 1, linePrefix: 'cde' });
  // mid line 3 (offset 9 sits one char in: 'g')
  assert.deepEqual(caretLineSplit(value, 9), { lineIndex: 2, linePrefix: 'g' });
  assert.deepEqual(caretLineSplit(value, 10), { lineIndex: 2, linePrefix: 'gh' });
});

/* ── the zero-width marker plan (the mirror's child sequence) ────────── */

test('the marker is the SOURCE-ESCAPED zero-width space — six ASCII characters, never a literal', () => {
  assert.equal(ZERO_WIDTH_MARKER.length, 1); // the RUNTIME value is one code unit…
  assert.equal(ZERO_WIDTH_MARKER.codePointAt(0), 0x200b); // …U+200B exactly
  // the SOURCE law lives in presence-tree-panel.test.ts; here the
  // behavioral half: the marker is invisible but not empty
  assert.notEqual(ZERO_WIDTH_MARKER, '');
});

test('mirror plan: the value splits AT the clamped offset — before | marker | after', () => {
  assert.deepEqual(mirrorPlanOf('raised=true', 7), {
    before: 'raised=',
    marker: ZERO_WIDTH_MARKER,
    after: 'true',
  });
  // clamping rides through the plan
  assert.deepEqual(mirrorPlanOf('ab', 99), { before: 'ab', marker: ZERO_WIDTH_MARKER, after: '' });
  assert.deepEqual(mirrorPlanOf('ab', -1), { before: '', marker: ZERO_WIDTH_MARKER, after: 'ab' });
  assert.deepEqual(mirrorPlanOf('', 0), { before: '', marker: ZERO_WIDTH_MARKER, after: '' });
  // the plan round-trips the value (before + after = the whole value)
  const plan = mirrorPlanOf('one\ntwo-things', 8);
  assert.equal(plan.before + plan.after, 'one\ntwo-things');
  assert.equal(plan.marker, ZERO_WIDTH_MARKER);
});

test('mirror plan: multi-byte values split by code units (selectionStart semantics)', () => {
  // '世界' is 2 chars / 6 UTF-16 units; offsets are code units like the DOM's
  const value = '世界';
  assert.deepEqual(mirrorPlanOf(value, 1), { before: '世', marker: ZERO_WIDTH_MARKER, after: '界' });
});

/* ── MIRROR_PROPS (the reference's full copy list) ───────────────────── */

test('MIRROR_PROPS: the full typography + padding + border list, camelCase for style read/write parity', () => {
  const required = [
    'fontFamily', 'fontSize', 'fontWeight', 'fontStyle', 'fontVariant', 'fontStretch',
    'letterSpacing', 'wordSpacing', 'lineHeight', 'textTransform', 'textIndent',
    'textAlign', 'direction', 'tabSize',
    'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
    'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
    'borderTopStyle', 'borderRightStyle', 'borderBottomStyle', 'borderLeftStyle',
  ];
  for (const prop of required) {
    assert.ok((MIRROR_PROPS as readonly string[]).includes(prop), `MIRROR_PROPS copies ${prop}`);
  }
  // no duplicates (a copy loop that rewrites the same property is a bug)
  assert.equal(new Set(MIRROR_PROPS).size, MIRROR_PROPS.length);
});

/* ── the selection-range segmentation ────────────────────────────────── */

/** the monospace fake's char pitch (px per code unit) */
const charWidth = 6;

test('same-line range → ONE rect spanning from.x → to.x', () => {
  const from = { x: 2 * charWidth, y: 0, height: 16 };
  const to = { x: 9 * charWidth, y: 0, height: 16 };
  const rects = selectionRects(from, to, 16, 40 * charWidth);
  assert.equal(rects.length, 1);
  assert.equal(rects[0].x, from.x);
  assert.equal(rects[0].width, 7 * charWidth);
  assert.equal(rects[0].height, 16);
});

test('a collapsed "range" still renders a 2px sliver (never a zero-width nothing)', () => {
  const at = { x: 4 * charWidth, y: 0, height: 16 };
  const rects = selectionRects(at, at, 16, 40 * charWidth);
  assert.equal(rects.length, 1);
  assert.equal(rects[0].width, 2);
});

test('multi-line range → tail + full middle lines + head (the soft-wrap honesty)', () => {
  // line 0: x 12→box end; line 1: full; line 2: 0→x 18
  const from = { x: 2 * charWidth, y: 0, height: 16 };
  const to = { x: 3 * charWidth, y: 32, height: 16 };
  const contentWidth = 40 * charWidth;
  const rects = selectionRects(from, to, 16, contentWidth);
  assert.equal(rects.length, 3);
  assert.deepEqual(
    rects.map((rect) => ({ x: rect.x, y: rect.y, w: rect.width })),
    [
      { x: from.x, y: 0, w: contentWidth - from.x }, // the first line's tail
      { x: 0, y: 16, w: contentWidth }, // the full middle line
      { x: 0, y: 32, w: to.x }, // the last line's head
    ],
  );
});

test('a degenerate lineHeight falls back to the caret height (never a zero pitch loop)', () => {
  const from = { x: 0, y: 0, height: 20 };
  const to = { x: 10, y: 40, height: 20 };
  const rects = selectionRects(from, to, 0, 100);
  assert.equal(rects.length, 3); // pitch 20: y=0 tail, y=20 full, y=40 head
  assert.equal(rects[1].y, 20);
});

/* ── the selectionchange tracker (structural fake host) ──────────────── */

interface FakeField {
  readonly selectionStart: number;
  readonly selectionEnd: number;
}

function fakeHost(): { host: Parameters<typeof trackFieldSelection>[0]; fire(): void } {
  const listeners: Array<() => void> = [];
  return {
    host: {
      addEventListener: (_type, listener) => listeners.push(listener),
      removeEventListener: (_type, listener) => {
        const index = listeners.indexOf(listener);
        if (index >= 0) listeners.splice(index, 1);
      },
    },
    fire: () => {
      for (const listener of [...listeners]) listener();
    },
  };
}

test('selectionchange reads the ACTIVE field selection — rAF-coalesced to one read per frame', () => {
  const { host, fire } = fakeHost();
  const reads: Array<{ start: number; end: number }> = [];
  let field: FakeField | null = { selectionStart: 0, selectionEnd: 0 };
  let scheduled: Array<() => void> = [];
  const tracker = trackFieldSelection(
    host,
    () => field as unknown as HTMLInputElement,
    (active, start, end) => reads.push({ start, end }),
    (fn) => scheduled.push(fn),
  );
  // three changes inside one frame → ONE scheduled read of the LAST state
  field = { selectionStart: 2, selectionEnd: 2 };
  fire();
  field = { selectionStart: 0, selectionEnd: 5 };
  fire();
  field = { selectionStart: 3, selectionEnd: 9 };
  fire();
  assert.equal(scheduled.length, 1, 'a burst inside one frame coalesces to one read');
  scheduled.forEach((fn) => fn());
  scheduled = [];
  assert.deepEqual(reads, [{ start: 3, end: 9 }]);
  // the next frame schedules a fresh read
  field = { selectionStart: 1, selectionEnd: 1 };
  fire();
  assert.equal(scheduled.length, 1);
  scheduled.forEach((fn) => fn());
  scheduled = [];
  assert.deepEqual(reads.slice(-1), [{ start: 1, end: 1 }]);
  tracker.stop();
  fire();
  assert.equal(scheduled.length, 0, 'a stopped tracker never schedules again');
});

test('no active reportable field → the read is a no-op (no report, no throw)', () => {
  const { host, fire } = fakeHost();
  const reads: number[] = [];
  let field: FakeField | null = null;
  const tracker = trackFieldSelection(
    host,
    () => field as unknown as HTMLInputElement | null,
    (_active, start, _end) => reads.push(start),
    (fn) => fn(), // synchronous scheduler
  );
  fire(); // nothing active — silently nothing
  assert.deepEqual(reads, []);
  field = { selectionStart: 4, selectionEnd: 4 };
  fire();
  assert.deepEqual(reads, [4]);
  tracker.stop();
});

test('selectionless field types (null selectionStart) never report', () => {
  const { host, fire } = fakeHost();
  const reads: number[] = [];
  const field = { selectionStart: null, selectionEnd: null };
  const tracker = trackFieldSelection(
    host,
    () => field as unknown as HTMLInputElement,
    (_active, start) => reads.push(start),
    (fn) => fn(),
  );
  fire();
  assert.deepEqual(reads, []);
  tracker.stop();
});
