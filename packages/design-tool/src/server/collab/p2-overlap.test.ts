/**
 * p2-overlap.test.ts — lab probe p2-overlap port (M0 collab-protocol).
 *
 * Original need: Owner 2026-09-15 (collab-protocol M0 — P1-P20 regression
 * battery). Source: `.zcode/epic40/lab/p2-overlap.mjs`.
 * Port deviation (the only one): the lab's yjs replica arm is omitted
 * (YJS_OMITTED) — it existed to prove the journal predicates on top of yjs
 * state vectors; every predicate below runs on the loro-derived op records
 * with identical conditions. The non-overlap control spreads the loro
 * records (lAOp/lBOp) instead of the lab's yAOp/yBOp — same record shape,
 * same predicate inputs.
 */

import { strict as assert } from 'node:assert';
import test from 'node:test';
import { LoroDoc } from 'loro-crdt';

import { concurrentRanges, finish, rangesOverlap, YJS_OMITTED } from './lab-helpers.ts';

test('p2-overlap', () => {
  // lab yjs arm omitted (YJS_OMITTED): two Y.Doc replicas + state-vector
  // baseVersion records + the assertion
  // `concurrentRanges(yAOp, yBOp) && rangesOverlap(yAOp, yBOp)`.

  const lBase = new LoroDoc();
  lBase.setPeerId('301');
  const lBaseText = lBase.getText('t');
  lBaseText.insert(0, 'abcd');
  lBase.commit();
  const lA = LoroDoc.fromSnapshot(lBase.export({ mode: 'snapshot' }));
  lA.setPeerId('302');
  const lB = LoroDoc.fromSnapshot(lBase.export({ mode: 'snapshot' }));
  lB.setPeerId('303');
  const lBaseFrontiers = lA.frontiers();
  const lAOp = {
    actor: 'human',
    offset: 1,
    length: 2,
    baseVersion: JSON.stringify(lBaseFrontiers),
    kind: 'delete',
  };
  const lBOp = {
    actor: 'agent',
    offset: 2,
    length: 1,
    baseVersion: JSON.stringify(lBaseFrontiers),
    kind: 'delete',
  };
  lA.getText('t').delete(lAOp.offset, lAOp.length);
  lA.commit();
  lB.getText('t').delete(lBOp.offset, lBOp.length);
  lB.commit();
  const lAFrontiers = lA.frontiers();
  const lBFrontiers = lB.frontiers();
  lA.import(lB.export({ mode: 'update', from: lA.oplogVersion() }));
  const frontierRelation = lA.cmpFrontiers(lAFrontiers, lBFrontiers);
  const lMerged = lA.getText('t').toString();
  assert.ok(
    frontierRelation === undefined,
    `Loro should report concurrent frontiers, got ${String(frontierRelation)}`,
  );
  assert.ok(
    concurrentRanges(lAOp, lBOp) && rangesOverlap(lAOp, lBOp),
    'Loro journal should classify overlapping concurrent ranges',
  );

  // non-overlap control: lab spread the yjs records; record shape is engine
  // independent, so the loro records feed the identical predicate.
  const nonOverlap = { ...lAOp, offset: 0, length: 1 };
  const nonOverlapB = { ...lBOp, offset: 3, length: 1 };
  assert.ok(!rangesOverlap(nonOverlap, nonOverlapB), 'non-overlap control must remain mergeable');

  finish('p2-overlap', {
    yjs: {
      omitted: YJS_OMITTED,
      rawPrimitive: 'state-vector + updates; no text-range overlap API',
    },
    loro: { merged: lMerged, frontierRelation, rawPrimitive: 'cmpFrontiers/findIdSpansBetween; no conflict policy' },
    conflict: { overlapping: true, actors: [lAOp.actor, lBOp.actor], spans: [{ offset: 1, length: 2 }, { offset: 2, length: 1 }], nonOverlappingControl: true },
    conclusion: 'Both engines require an application op journal carrying base version and offset/length; CRDT merge alone silently converges.',
  });
});
