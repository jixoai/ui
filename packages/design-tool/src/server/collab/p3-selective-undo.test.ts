/**
 * p3-selective-undo.test.ts — lab probe p3-selective-undo port
 * (M0 collab-protocol).
 *
 * Original need: Owner 2026-09-15 (collab-protocol M0 — P1-P20 regression
 * battery). Source: `.zcode/epic40/lab/p3-selective-undo.mjs`.
 * Port deviation (the only one): the lab's yjs arm is omitted (YJS_OMITTED)
 * — override (undo/redo own op), recipient UndoManager remote-history, and
 * the give-up inverse-update path were yjs engine-comparison evidence; all
 * loro assertions (remote merge, UndoManager scope, compensating revert)
 * are identical to the lab.
 */

import { strict as assert } from 'node:assert';
import test from 'node:test';
import { LoroDoc, UndoManager as LoroUndoManager } from 'loro-crdt';

import { finish, YJS_OMITTED } from './lab-helpers.ts';

test('p3-selective-undo', () => {
  // lab yjs arm omitted (YJS_OMITTED): Y.UndoManager override/redo asserts
  // ('BbaseA' -> 'Bbase' -> 'BbaseA'), recipient UndoManager canUndo()===false,
  // agent-branch undo -> inverse update give-up path ('baseA').

  const loro = new LoroDoc();
  loro.setPeerId('401');
  const loroText = loro.getText('t');
  loroText.insert(0, 'base');
  loro.commit({ origin: 'seed' });
  const loroUndo = new LoroUndoManager(loro, { mergeInterval: 0, maxUndoSteps: 20 });
  const loroRemote = new LoroDoc();
  loroRemote.import(loro.export({ mode: 'snapshot' }));
  loroRemote.setPeerId('402');
  const loroRemoteBefore = loroRemote.frontiers();
  loroRemote.getText('t').insert(0, 'B');
  loroRemote.commit({ origin: 'agent' });
  loro.import(loroRemote.export({ mode: 'update', from: loro.oplogVersion() }));
  assert.ok(
    loroText.toString() === 'Bbase',
    `Loro remote merge expected Bbase, got ${loroText.toString()}`,
  );
  assert.ok(!loroUndo.canUndo(), 'Loro UndoManager must not record a remote peer operation');
  loroText.insert(loroText.length, 'C');
  loro.commit({ origin: 'third-party' });
  loroRemote.revertTo(loroRemoteBefore);
  loro.import(loroRemote.export({ mode: 'update', from: loro.oplogVersion() }));
  assert.ok(
    loroText.toString() === 'baseC',
    `Loro compensating revert should remove only B, got ${loroText.toString()}`,
  );

  finish('p3-selective-undo', {
    yjs: {
      omitted: YJS_OMITTED,
      override: 'undo then redo own human op while agent op survives',
      giveUp: 'remote actor branch undo -> inverse update -> recipient',
      recipientRemoteUndo: 'not available',
    },
    loro: { remoteUndo: 'not available in recipient UndoManager; revertTo(frontiers) generated a compensating operation', compensatingRevert: 'passed' },
    final: { afterOverride: 'BbaseA', afterGiveUp: 'baseA', loroCompensatingRevert: 'baseC' },
  });
});
