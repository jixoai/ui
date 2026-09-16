/**
 * p1-vocabulary.test.ts — lab probe p1-vocabulary port (M0 collab-protocol).
 *
 * Original need: Owner 2026-09-15 (collab-protocol M0 — P1-P20 regression
 * battery). Source: `.zcode/epic40/lab/p1-vocabulary.mjs`.
 * Port deviation (the only one): the lab's yjs arms (Y.Text mapping +
 * Y.relative-position cursor) are omitted — see YJS_OMITTED in
 * lab-helpers.ts. All loro arms and the pure-JS vocabulary oracle are
 * assertion-for-assertion identical.
 */

import { strict as assert } from 'node:assert';
import test from 'node:test';
import { Cursor, LoroDoc } from 'loro-crdt';

import { applyVocabulary, finish, YJS_OMITTED, type VocabularyOperation } from './lab-helpers.ts';

test('p1-vocabulary', () => {
  const operations: VocabularyOperation[] = [
    { type: 'cursor', row: 1, col: 2 },
    { type: 'insert', text: 'X' },
    { type: 'cursor', row: 1, col: 3 },
    { type: 'delete', length: 1 },
    { type: 'cursor', row: 1, col: 2 },
    { type: 'replace', length: 1, text: 'Q' },
  ];
  const expected = applyVocabulary('abcd', operations);

  // lab yjs arm omitted (YJS_OMITTED): Y.Text mapping assert
  // `ytext.toString() === expected.text` and relative-cursor assert
  // `yAbsolute?.index === 3`.

  const loro = new LoroDoc();
  loro.setPeerId('101');
  const ltext = loro.getText('buffer');
  ltext.insert(0, 'abcd');
  let lCursor = 0;
  for (const operation of operations) {
    if (operation.type === 'cursor')
      lCursor = operation.row === 1 ? operation.col - 1 : lCursor;
    if (operation.type === 'insert') {
      ltext.insert(lCursor, operation.text);
      lCursor += operation.text.length;
    }
    if (operation.type === 'delete') ltext.delete(lCursor, operation.length);
    if (operation.type === 'replace') {
      ltext.delete(lCursor, operation.length);
      ltext.insert(lCursor, operation.text);
      lCursor += operation.text.length;
    }
  }
  loro.commit();
  assert.ok(ltext.toString() === expected.text, `LoroText mapping produced ${ltext.toString()}`);

  const lBase = new LoroDoc();
  lBase.setPeerId('201');
  const lBaseText = lBase.getText('t');
  lBaseText.insert(0, 'abcd');
  lBase.commit();
  const lA = LoroDoc.fromSnapshot(lBase.export({ mode: 'snapshot' }));
  lA.setPeerId('202');
  const lB = LoroDoc.fromSnapshot(lBase.export({ mode: 'snapshot' }));
  lB.setPeerId('203');
  const lAText = lA.getText('t');
  const lBText = lB.getText('t');
  const lCursorObject = lAText.getCursor(2, 0);
  const lEncodedCursor = lCursorObject?.encode();
  lBText.insert(0, 'X');
  lB.commit();
  lA.import(lB.export({ mode: 'update', from: lA.oplogVersion() }));
  const lDecodedCursor = lEncodedCursor === undefined ? undefined : Cursor.decode(lEncodedCursor);
  const lAbsolute = lDecodedCursor === undefined ? undefined : lA.getCursorPos(lDecodedCursor);
  assert.ok(
    lAbsolute?.offset === 3,
    `Loro cursor moved to ${lAbsolute?.offset}, expected 3`,
  );

  finish('p1-vocabulary', {
    mapping: { source: 'abcd', expected: expected.text, yjs: YJS_OMITTED, loro: ltext.toString() },
    relativeCursor: {
      yjs: YJS_OMITTED,
      loro: lAbsolute?.offset,
      loroEncodedBytes: lEncodedCursor?.byteLength,
      expected: 3,
    },
    operations: ['#ROW:COL', '+TEXT', '-n', '!n TEXT'],
  });
});
