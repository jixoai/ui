/**
 * p10-review-loro.test.ts — lab probe p10-review-loro port
 * (M0 collab-protocol).
 *
 * Original need: Owner 2026-09-15 (collab-protocol M0 — P1-P20 regression
 * battery). Source: `.zcode/epic40/lab/p10-review-loro.mjs`.
 * Port deviation: none (loro-crdt is a pinned dependency).
 */

import { strict as assert } from 'node:assert';
import test from 'node:test';
import { LoroDoc } from 'loro-crdt';

import { finish } from './lab-helpers.ts';

function snapshotWithFile(): Uint8Array {
  const doc = new LoroDoc();
  doc.setPeerId('901');
  doc.getText('file').insert(0, 'A');
  doc.commit({ message: 'seed' });
  return doc.export({ mode: 'snapshot' });
}

test('p10-review-loro', () => {
  const mixed = new LoroDoc();
  mixed.setPeerId('902');
  const mixedText = mixed.getText('component_label');
  const mixedTree = mixed.getTree('components');
  const mixedNode = mixedTree.createNode();
  mixed.setNextCommitOptions({ origin: 'group', message: 'mixed-tree-text' });
  mixedText.insert(0, 'label');
  mixedNode.data.set('id', 'component-1');
  mixed.commit();
  const mixedChanges = [...mixed.getAllChanges().values()].flat();
  assert.ok(mixedChanges.length === 1, `mixed group emitted ${mixedChanges.length} changes`);
  assert.ok(
    mixed.toJSON().component_label === 'label' && mixed.toJSON().components.length === 1,
    'mixed group did not commit both containers',
  );

  const canonical = LoroDoc.fromSnapshot(snapshotWithFile());
  canonical.setPeerId('903');
  const agent = LoroDoc.fromSnapshot(snapshotWithFile());
  agent.setPeerId('904');
  const targetParent = agent.frontiers();
  agent.getText('file').insert(1, 'B');
  agent.commit({ message: 'target-agent-op' });
  canonical.import(agent.export({ mode: 'update', from: canonical.oplogVersion() }));
  const wrongFork = canonical.forkAt(targetParent);
  wrongFork.revertTo(targetParent);
  assert.ok(
    wrongFork.getText('file').toString() === 'A',
    'forkAt(parent) should contain only parent history',
  );
  const wrongPathBytes = wrongFork.export({ mode: 'update' }).byteLength;
  assert.ok(wrongPathBytes > 0, 'fork export is not a canonical inverse');

  const compensator = LoroDoc.fromSnapshot(canonical.export({ mode: 'snapshot' }));
  compensator.setPeerId('905');
  compensator.revertTo(targetParent);
  canonical.import(compensator.export({ mode: 'update', from: canonical.oplogVersion() }));
  assert.ok(
    canonical.getText('file').toString() === 'A',
    'revertTo(parent) on a branch containing target op should compensate it',
  );

  const racedCanonical = LoroDoc.fromSnapshot(snapshotWithFile());
  racedCanonical.setPeerId('906');
  const pendingAgent = LoroDoc.fromSnapshot(snapshotWithFile());
  pendingAgent.setPeerId('907');
  pendingAgent.getText('file').insert(1, 'B');
  pendingAgent.commit({ message: 'pending-agent' });
  const staleIngest = LoroDoc.fromSnapshot(snapshotWithFile());
  staleIngest.setPeerId('908');
  staleIngest.getText('file').delete(0, 1);
  staleIngest.getText('file').insert(0, 'F');
  staleIngest.commit({ origin: 'file-system', message: 'stale-file-ingest' });
  racedCanonical.import(pendingAgent.export({ mode: 'update', from: racedCanonical.oplogVersion() }));
  racedCanonical.import(staleIngest.export({ mode: 'update', from: racedCanonical.oplogVersion() }));
  assert.ok(
    racedCanonical.getText('file').toString() === 'FB',
    'stale ingest should demonstrate a visible race, not silently equal the file',
  );

  finish('p10-review-loro', {
    mixedCommit: { changes: mixedChanges.length, state: mixed.toJSON() },
    giveUp: { targetParent, wrongForkText: wrongFork.getText('file').toString(), wrongPathBytes, correctedText: canonical.getText('file').toString() },
    staleIngestRace: { canonicalAfterConcurrentImport: racedCanonical.getText('file').toString(), externalFileText: 'F', requiresAdmissionRecheck: true },
  });
});
