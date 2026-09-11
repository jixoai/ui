/**
 * diff.test.ts — the line-diff kernel + unified rendering (r2 T2).
 * Assertions follow GNU-diff conventions (context lines count into
 * the @@ ranges) so status reports and refusal diffs read like the
 * tooling developers already know.
 *
 * Original need: design-studio r2 T2 (2026-09-11) — the drift report
 * and the promote refusal both render through unifiedDiff.
 */

import { strict as assert } from 'node:assert';
import test from 'node:test';

import { diffHunks, unifiedDiff } from './diff.ts';

test('diffHunks: replacement, insertion and deletion map to exact hunks', () => {
  // replacement: line 2 'b' → 'B'
  assert.deepEqual(diffHunks(['a', 'b', 'c'], ['a', 'B', 'c']), [{ aStart: 1, aLen: 1, bStart: 1, bLen: 1 }]);
  // insertion after line 1
  assert.deepEqual(diffHunks(['a', 'c'], ['a', 'b', 'c']), [{ aStart: 1, aLen: 0, bStart: 1, bLen: 1 }]);
  // deletion of line 2
  assert.deepEqual(diffHunks(['a', 'b', 'c'], ['a', 'c']), [{ aStart: 1, aLen: 1, bStart: 1, bLen: 0 }]);
  // identical
  assert.deepEqual(diffHunks(['a', 'b'], ['a', 'b']), []);
});

test('unifiedDiff: GNU shape — headers, @@ ranges, context bodies with -/+', () => {
  const a = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'].join('\n');
  const b = ['one', 'two', 'THREE', 'four', 'five', 'six', 'seven', 'eight'].join('\n');
  const diff = unifiedDiff(a, b, { a: 'a/hero.svelte', b: 'b/hero.svelte' });
  const lines = diff.split('\n');
  assert.equal(lines[0], '--- a/hero.svelte');
  assert.equal(lines[1], '+++ b/hero.svelte');
  // line 3 changed with 2 lines of head context (GNU counts context
  // into the ranges; only 2 preceding lines exist)
  assert.equal(lines[2], '@@ -1,6 +1,6 @@');
  assert.deepEqual(lines.slice(3, -1), [' one', ' two', '-three', '+THREE', ' four', ' five', ' six']);
  assert.equal(diff.endsWith('\n'), true, 'trailing newline');
});

test('unifiedDiff: mid-file change carries the full 3-line context both sides', () => {
  const a = Array.from({ length: 10 }, (_, i) => `l${i + 1}`).join('\n');
  const b = a.replace('l6', 'CHANGED');
  const lines = unifiedDiff(a, b).split('\n');
  assert.equal(lines[2], '@@ -3,7 +3,7 @@');
  assert.deepEqual(lines.slice(3, -1), [
    ' l3',
    ' l4',
    ' l5',
    '-l6',
    '+CHANGED',
    ' l7',
    ' l8',
    ' l9',
  ]);
});

test('unifiedDiff: top insertion and deletion-only hunks render their ranges', () => {
  // the trailing-newline sentinel counts as a context line (GNU does
  // the same with blank context lines)
  const insert = unifiedDiff('keep\n', 'new\nkeep\n');
  assert.ok(insert.includes('@@ -1,2 +1,3 @@'), `insertion header, got: ${insert}`);
  assert.ok(insert.includes('+new'));
  const del = unifiedDiff('a\nb\nc\n', 'a\nc\n');
  assert.ok(del.includes('@@ -1,4 +1,3 @@'), `deletion header, got: ${del}`);
  assert.ok(del.includes('-b'));
  // a lone line without trailing newline: GNU omits the length when it is 1
  assert.ok(unifiedDiff('x', 'y').includes('@@ -1 +1 @@'));
  assert.equal(unifiedDiff('same\n', 'same\n'), '', 'identical content yields an empty diff');
});
