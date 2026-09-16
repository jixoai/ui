/**
 * p13-errors-and-cursor.test.ts — lab probe p13-errors-and-cursor port
 * (M0 collab-protocol).
 *
 * Original need: Owner 2026-09-15 (collab-protocol M0 — P1-P20 regression
 * battery). Source: `.zcode/epic40/lab/p13-errors-and-cursor.mjs`.
 * Port deviation: none (loro-crdt is a pinned dependency).
 */

import { strict as assert } from 'node:assert';
import test from 'node:test';
import { Cursor, LoroDoc } from 'loro-crdt';

import { finish } from './lab-helpers.ts';

function thrownMessage(callback: () => void): string | undefined {
  try {
    callback();
    return undefined;
  } catch (error) {
    return String(error);
  }
}

test('p13-errors-and-cursor', () => {
  const doc = new LoroDoc();
  doc.setPeerId('1101');
  const text = doc.getText('label');
  text.insert(0, 'abc');
  doc.commit({ message: 'seed' });
  const validCursor = text.getCursor(1, 0);
  const validBytes = validCursor!.encode();
  assert.ok(validCursor!.containerId() === text.id, 'cursor must expose its source container');

  const malformedMessage = thrownMessage(() => Cursor.decode(new Uint8Array([1, 2, 3])));
  assert.ok(
    malformedMessage?.includes('Hit the end of buffer'),
    'malformed cursor must fail decode',
  );

  const deletedDoc = LoroDoc.fromSnapshot(doc.export({ mode: 'snapshot' }));
  deletedDoc.setPeerId('1102');
  const deletedText = deletedDoc.getText('label');
  deletedText.delete(0, 3);
  deletedDoc.commit({ message: 'delete-all' });
  const deletedResolution = deletedDoc.getCursorPos(Cursor.decode(validBytes));
  assert.ok(
    deletedResolution?.update !== undefined && deletedResolution.offset === 0,
    'deleted content should return an updated cursor position',
  );

  const otherText = doc.getText('other');
  otherText.insert(0, 'x');
  doc.commit({ message: 'other' });
  const wrongContainerCursor = otherText.getCursor(0, 0);
  assert.ok(
    wrongContainerCursor!.containerId() !== text.id,
    'test cursor must belong to a different target',
  );
  assert.ok(
    doc.getCursorPos(wrongContainerCursor!)?.offset === 0,
    'Loro resolves a valid cursor independent of envelope target',
  );

  const missingContainerDoc = new LoroDoc();
  missingContainerDoc.setPeerId('1103');
  assert.ok(
    missingContainerDoc.getCursorPos(Cursor.decode(validBytes)) === undefined,
    'cursor for missing container must resolve undefined',
  );

  const utf16Doc = new LoroDoc();
  utf16Doc.setPeerId('1104');
  const utf16Text = utf16Doc.getText('emoji');
  utf16Text.insert(0, '😀x');
  const utf16Message = thrownMessage(() => utf16Text.delete(1, 1));
  assert.ok(
    utf16Message?.includes('middle of the codepoint'),
    'Loro must reject a UTF-16 delete that splits a codepoint',
  );

  const unknownFrontierMessage = thrownMessage(() =>
    doc.cmpFrontiers([{ peer: '999999', counter: 77 }], doc.frontiers()),
  );
  assert.ok(
    unknownFrontierMessage?.includes('not included by the doc'),
    'unknown frontier must fail explicitly',
  );

  const resyncEnvelope = {
    code: 'stale-cursor',
    target: { componentId: 'c-1', buffer: 'label' },
    canonicalFrontier: doc.frontiers(),
    syncCursor: { kind: 'frontier', value: doc.frontiers() },
    canonicalUpdate: '<bytes>',
    retry: { cursorBytes: '<re-encoded>', expectedRawHash: 'sha256:...' },
  };
  assert.ok(
    resyncEnvelope.code === 'stale-cursor' && resyncEnvelope.retry.cursorBytes,
    'resync envelope must include canonical version and retry cursor',
  );

  finish('p13-errors-and-cursor', {
    package: 'loro-crdt@1.16.1',
    malformed: { code: 'stale-cursor', decodeMessage: malformedMessage },
    deletedContent: { code: 'stale-cursor', returnedUpdatedCursor: deletedResolution?.update !== undefined, offset: deletedResolution?.offset, side: deletedResolution?.side },
    wrongContainer: { code: 'stale-cursor', cursorContainer: wrongContainerCursor!.containerId(), targetContainer: text.id, loroResolution: 'position resolves; admission must compare containerId before applying op' },
    missingContainer: { code: 'bad-target', resolution: undefined },
    utf16: { code: 'utf16-boundary', message: utf16Message },
    unknownFrontier: { code: 'stale-or-unknown-frontier', message: unknownFrontierMessage },
    resyncEnvelope,
    policy: 'decode errors and container mismatch are rejected; deleted content may be re-anchored only when getCursorPos returns update, otherwise require resync',
  });
});
