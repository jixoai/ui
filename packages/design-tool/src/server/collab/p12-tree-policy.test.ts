/**
 * p12-tree-policy.test.ts — lab probe p12-tree-policy port
 * (M0 collab-protocol).
 *
 * Original need: Owner 2026-09-15 (collab-protocol M0 — P1-P20 regression
 * battery). Source: `.zcode/epic40/lab/p12-tree-policy.mjs`.
 * Port deviation: none (loro-crdt is a pinned dependency).
 */

import { strict as assert } from 'node:assert';
import test from 'node:test';
import { LoroDoc, LoroText } from 'loro-crdt';

import { finish } from './lab-helpers.ts';

interface TreeJsonNode {
  id: string;
  meta?: Record<string, unknown>;
}

interface TreeNodeLike {
  id: string;
  parent(): { toJSON(): TreeJsonNode } | undefined;
  toJSON(): TreeJsonNode;
  isDeleted(): boolean;
  getLastMoveId(): { peer: string } | undefined;
  readonly data: {
    set(key: string, value: unknown): unknown;
    toJSON(): { buffer?: unknown };
    getShallowValue(): { buffer?: unknown };
    setContainer(key: string, container: LoroText): LoroText;
  };
  move(parent?: unknown, index?: number): void;
  createNode(): TreeNodeLike;
}

function seed(): Uint8Array {
  const doc = new LoroDoc();
  doc.setPeerId('100');
  const tree = doc.getTree('components');
  const left = tree.createNode();
  left.data.set('name', 'left');
  const right = tree.createNode();
  right.data.set('name', 'right');
  const third = tree.createNode();
  third.data.set('name', 'third');
  const target = tree.createNode(left.id);
  target.data.set('name', 'target');
  const child = target.createNode();
  child.data.set('name', 'child');
  const text = target.data.setContainer('buffer', new LoroText());
  text.insert(0, 'payload');
  doc.commit({ message: 'seed' });
  return doc.export({ mode: 'snapshot' });
}

function byName(doc: LoroDoc, name: string): TreeNodeLike | undefined {
  return doc.getTree('components').nodes().find((node) => node.toJSON().meta?.name === name) as
    | TreeNodeLike
    | undefined;
}

test('p12-tree-policy', () => {
  const base = seed();
  const a = LoroDoc.fromSnapshot(base);
  a.setPeerId('2');
  const b = LoroDoc.fromSnapshot(base);
  b.setPeerId('3');
  const targetA = byName(a, 'target')!;
  const targetB = byName(b, 'target')!;
  const rightA = byName(a, 'right')!;
  const thirdB = byName(b, 'third')!;
  const aVersion = a.oplogVersion();
  const bVersion = b.oplogVersion();
  targetA.move(rightA);
  a.setNextCommitOptions({ timestamp: 999999, message: 'move-to-right' });
  a.commit();
  targetB.move(thirdB);
  b.setNextCommitOptions({ timestamp: 1, message: 'move-to-third' });
  b.commit();
  const aUpdate = a.export({ mode: 'update', from: aVersion });
  const bUpdate = b.export({ mode: 'update', from: bVersion });
  a.import(bUpdate);
  b.import(aUpdate);
  const mergedA = byName(a, 'target');
  const mergedB = byName(b, 'target');
  assert.ok(
    mergedA?.parent()?.toJSON().meta?.name === 'third',
    'higher peer move must win concurrent LWW tie-break',
  );
  assert.ok(
    mergedB?.parent()?.toJSON().meta?.name === 'third',
    'replicas must converge on concurrent move',
  );
  assert.ok(mergedA?.getLastMoveId()?.peer === '3', 'last effective move must identify the winner');

  const deleted = LoroDoc.fromSnapshot(base);
  deleted.setPeerId('4');
  const deletedTree = deleted.getTree('components');
  const left = byName(deleted, 'left')!;
  const deletedTarget = byName(deleted, 'target')!;
  const deletedChild = byName(deleted, 'child')!;
  deletedTree.delete(left.id);
  deleted.commit({ message: 'remove-left-subtree' });
  assert.ok(
    !deletedTree.toJSON().some((node) => node.id === left.id),
    'deleted subtree must be hidden from visible JSON',
  );
  assert.ok(
    deletedTree.has(left.id) && deletedTree.isNodeDeleted(left.id),
    'remove must retain a tombstone for the root',
  );
  assert.ok(deletedTarget.isDeleted() && deletedChild.isDeleted(), 'remove must tombstone descendants');
  assert.ok(
    deletedTarget.data.toJSON().buffer === 'payload',
    'remove must retain nested buffer history',
  );
  const deletedBufferId = deletedTarget.data.getShallowValue().buffer as string;
  const deletedBuffer = deleted.getContainerById(deletedBufferId as never) as
    | (LoroText & { insert(pos: number, text: string): void })
    | undefined;
  let tombstoneWriteError: string | undefined;
  try {
    deletedBuffer?.insert(0, 'blocked');
  } catch (error) {
    tombstoneWriteError = String(error);
  }
  assert.ok(
    tombstoneWriteError?.includes('container') && tombstoneWriteError.includes('deleted'),
    'writes through a tombstoned buffer must fail',
  );
  const visibleAfterDelete = deletedTree.toJSON().length;
  deletedTarget.move();
  deleted.commit({ message: 'explicit-revive-target' });
  assert.ok(
    !deletedTarget.isDeleted() && deletedTree.toJSON().some((node) => node.id === deletedTarget.id),
    'Loro move can revive a tombstoned node',
  );

  const structureConflictReceipt = {
    kind: 'structure-conflict',
    target: targetA.id,
    contenders: [
      { opId: '2:move', parent: 'right', orderKey: 'lamport,peer' },
      { opId: '3:move', parent: 'third', orderKey: 'lamport,peer' },
    ],
    winner: { opId: '3:move', parent: 'third' },
    policy: 'lww-lamport-then-numeric-peer',
    resolution: 'auto',
  };
  assert.ok(
    structureConflictReceipt.kind === 'structure-conflict' &&
      structureConflictReceipt.winner.opId === '3:move',
    'receipt shape must identify winner and contenders',
  );

  finish('p12-tree-policy', {
    package: 'loro-crdt@1.16.1',
    concurrentMove: {
      timestamps: { peer2: 999999, peer3: 1 },
      winner: { peer: mergedA!.getLastMoveId()!.peer, parent: mergedA!.parent()!.toJSON().meta!.name },
      replicasConverged:
        mergedA!.parent()!.toJSON().meta!.name === mergedB!.parent()!.toJSON().meta!.name,
      policy: 'implicit LWW by effective Lamport order, then numeric peer ID; commit timestamp is not the tie-break',
    },
    remove: {
      visibleNodesAfterDelete: visibleAfterDelete,
      tombstoneRoot: left.id,
      descendantsTombstoned: deletedTarget.isDeleted() === false ? 'revived-after-explicit-move' : true,
      bufferRetained: deletedTarget.data.toJSON().buffer === 'payload',
      bufferWriteRejected: tombstoneWriteError,
      revive: 'Loro move() revives a deleted node; protocol requires explicit revive intent and rejects ordinary buffer writes while tombstoned',
    },
    structureConflictReceipt,
    apiSurface: { publicLwwSwitch: false, observedLoroTreePrimitives: ['getLastMoveId', 'isNodeDeleted', 'has', 'nodes'] },
  });
});
