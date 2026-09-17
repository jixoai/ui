/**
 * remote-caret tests — the mirror-measurement math with an INJECTED
 * measure fn (the pure/DOM split's law: node tests hand-roll a
 * monospace fake, the DOM half is source-law pinned in
 * presence-tree-panel.test.ts).
 *
 * Original need: presence-visuals task group 2 (2026-09-17).
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { caretGeometry, caretLineSplit, clampCaretOffset } from './remote-caret.ts';

/** the monospace fake: 8px per char — exact arithmetic, no font files */
const charWidth = 8;
const fakeMeasure = (text: string): number => text.length * charWidth;

/* ── offset clamping ─────────────────────────────────────────────────── */

test('offsets clamp into the value range: negatives → 0, beyond-length → len, non-integers truncate', () => {
  assert.equal(clampCaretOffset('hello', -3), 0);
  assert.equal(clampCaretOffset('hello', 99), 5);
  assert.equal(clampCaretOffset('hello', 2), 2);
  assert.equal(clampCaretOffset('hello', 2.9), 2); // truncates, never rounds up past the char
  assert.equal(clampCaretOffset('hello', Number.NaN), 0);
  assert.equal(clampCaretOffset('hello', Number.POSITIVE_INFINITY), 5);
});

/* ── the single-line law (EXACT in v1) ───────────────────────────────── */

test('single line: the measure receives value.slice(0, offset), the x is its width', () => {
  const seen: string[] = [];
  const geometry = caretGeometry({ value: 'raised=true' }, 7, 20, (text) => {
    seen.push(text);
    return fakeMeasure(text);
  });
  assert.deepEqual(seen, ['raised=']);
  assert.equal(geometry.x, 7 * charWidth);
  assert.equal(geometry.y, 0);
});

/* ── the multi-line approximation (explicit \n only — v1) ────────────── */

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

test('textarea geometry: y = lineIndex × lineHeight, x = the line-local prefix width', () => {
  const value = 'one\ntwo-things';
  const onLine2 = caretGeometry({ value }, 8, 18, fakeMeasure);
  // offset 8 = one\ntwo- → line 1, prefix 'two-' (4 chars)
  assert.equal(onLine2.y, 1 * 18);
  assert.equal(onLine2.x, 4 * charWidth);
  const onLine1 = caretGeometry({ value }, 2, 18, fakeMeasure);
  assert.equal(onLine1.y, 0);
  assert.equal(onLine1.x, 2 * charWidth);
});

test('the soft-wrap honesty: a long unbroken line stays line 0 (v1 approximation, documented)', () => {
  const long = 'x'.repeat(200); // would visually wrap in a real textarea
  const geometry = caretGeometry({ value: long }, 150, 16, fakeMeasure);
  assert.equal(geometry.y, 0); // no \n — one line, no matter the reflow
  assert.equal(geometry.x, 150 * charWidth);
});

test('empty value / empty offset: geometry is the origin', () => {
  assert.deepEqual(caretGeometry({ value: '' }, 0, 20, fakeMeasure), { x: 0, y: 0 });
  assert.deepEqual(caretGeometry({ value: 'abc' }, 0, 20, fakeMeasure), { x: 0, y: 0 });
});
