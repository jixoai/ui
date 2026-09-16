/**
 * p5-file-resync.test.ts — lab probe p5-file-resync port
 * (M0 collab-protocol).
 *
 * Original need: Owner 2026-09-15 (collab-protocol M0 — P1-P20 regression
 * battery). Source: `.zcode/epic40/lab/p5-file-resync.mjs`.
 * Port deviation (the only one): the lab's yjs resync arm is omitted
 * (YJS_OMITTED). The single-span diff oracle, the loro resync assertion,
 * and the formatting-noise trap are identical to the lab.
 */

import { strict as assert } from 'node:assert';
import test from 'node:test';
import { LoroDoc } from 'loro-crdt';

import { finish, YJS_OMITTED } from './lab-helpers.ts';

function singleSpanDiff(before: string, after: string): {
  start: number;
  deleteCount: number;
  insertText: string;
} {
  let start = 0;
  while (start < before.length && start < after.length && before[start] === after[start]) {
    start += 1;
  }
  let beforeEnd = before.length;
  let afterEnd = after.length;
  while (beforeEnd > start && afterEnd > start && before[beforeEnd - 1] === after[afterEnd - 1]) {
    beforeEnd -= 1;
    afterEnd -= 1;
  }
  return { start, deleteCount: beforeEnd - start, insertText: after.slice(start, afterEnd) };
}

test('p5-file-resync', () => {
  const sourceBefore = '<Button label="Save">Click</Button>\n';
  const sourceAfter = '<Button label="Commit">Click now</Button>\n';
  // lab yjs arm omitted (YJS_OMITTED): applyYResync + assert
  // `ytext.toString() === sourceAfter`.

  const loro = new LoroDoc();
  loro.setPeerId('601');
  const ltext = loro.getText('svelte:file');
  ltext.insert(0, sourceBefore);
  loro.commit({ origin: 'seed' });
  const lDiff = singleSpanDiff(sourceBefore, sourceAfter);
  ltext.delete(lDiff.start, lDiff.deleteCount);
  if (lDiff.insertText.length > 0) ltext.insert(lDiff.start, lDiff.insertText);
  loro.commit({ origin: 'file-system', message: 'actor=file-system path=page/button' });
  assert.ok(ltext.toString() === sourceAfter, 'Loro file-system resync diverged');

  const formattingBefore = '<Button>Click</Button>\n';
  const formattingAfter = '<Button>Click</Button>\n\n';
  const formattingDiff = singleSpanDiff(formattingBefore, formattingAfter);
  assert.ok(
    formattingDiff.start === formattingBefore.length &&
      formattingDiff.deleteCount === 0 &&
      formattingDiff.insertText === '\n',
    'formatting noise should be visible as an import delta',
  );

  finish('p5-file-resync', {
    actor: 'file-system',
    yjs: { omitted: YJS_OMITTED, outputMatchesFile: ltext.toString() === sourceAfter },
    loro: { diff: lDiff, outputMatchesFile: ltext.toString() === sourceAfter, journalMessage: 'actor=file-system path=page/button' },
    trap: { formattingNoise: formattingDiff, policy: 'diff against canonical serialized source; do not silently normalize in CRDT layer' },
  });
});
