/**
 * undo.test.ts — the §6 conflict-and-undo tests (collab-protocol M4):
 * give-up compensations (only the target op is removed — third-party
 * edits survive at buffer semantics, P3/P10), `supersedes` journal
 * accounting with frozen idempotency, override（保自己）undo/redo through
 * a per-actor loro UndoManager session (others' edits survive), the
 * tree concurrent-move LWW receipts (p12 productized: contenders,
 * orderKey={lamport,peer}, winner, resolution:"lww"), and the FROZEN
 * revive semantics reconciling the M2-vs-p12 records on loro 1.16.1.
 *
 * O1/O2 unlock (2026-09-15, `.zcode/epic40/o1o2-probe.md` outcome A —
 * journal-level rebind; loro-crdt stays pinned at 1.16.1):
 *   - revive of a DIRECTLY-deleted target rebinds at the journal level:
 *     fresh TreeID under the same componentId, item read off the dead
 *     node's surviving data, doc-level buffer containers reused verbatim
 *     (they never died), `tree.rebindOf` auditing the lineage. The M4
 *     404 freeze (engine move paths throw "is deleted" on the direct
 *     target) was an implementation detail, not a product law;
 *   - the rebind's still-attached (inherited-tombstoned) subtree returns
 *     with it keeping its TreeIDs, while DIRECTLY-deleted descendants
 *     stay dead (§6 "revive 不隐式恢复已删除后代" holds precisely for
 *     directly-deleted descendants); inherited targets keep the engine
 *     move / their TreeID (the p12 path, unchanged);
 *   - ordinary `move` of any tombstoned node is still refused at
 *     admission (404) even where the engine would revive it — explicit
 *     `revive` remains the only door back;
 *   - tree `remove` compensations rebind (probe A9): fresh node at the
 *     pre-remove placement + item copy + attached children hung back,
 *     third party and buffers surviving — the retired journaled 503
 *     `compensation-unsupported` was a revertTo artifact (fabricated
 *     bare node), not an engine truth;
 *   - compensating a text op on a tombstoned component is 200-and-
 *     effective (probe C2): a compensation is history rollback, not a
 *     new write — §6's tombstone 404 law covers ordinary writes only.
 *
 * Original need: collab-protocol M4 (2026-09-15).
 */

import { strict as assert } from 'node:assert';
import test from 'node:test';

import { LoroDoc } from 'loro-crdt';

import { AdmissionGate } from './admission.ts';
import { bufferKeyOf, CollabKernel, encodeContainerKey } from './kernel.ts';
import { MemoryCollabStore } from './store.ts';
import type { AdmissionResult, CommitJournalEntry, Frontier, TextOpEnvelope, TreeOpEnvelope } from './types.ts';
import { isCommitReceipt } from './types.ts';
import { giveUp, openOverride } from './undo.ts';

/* ── scaffolding (mirrors admission.test.ts) ──────────────────────────── */

const LABEL_KEY = encodeContainerKey('a1', bufferKeyOf('label'));
const A2_LABEL_KEY = encodeContainerKey('a2', bufferKeyOf('label'));

interface Workspace {
  kernel: CollabKernel;
  gate: AdmissionGate;
  store: MemoryCollabStore;
}

function workspace(seed = 'base', buffer = 'label', componentId = 'a1'): Workspace {
  const store = new MemoryCollabStore();
  const kernel = CollabKernel.open(store);
  kernel.ensureBuffer(componentId, buffer, seed);
  return { kernel, gate: new AdmissionGate(kernel), store };
}

/** encode a client-side stable anchor against the current snapshot */
function cursorAt(kernel: CollabKernel, containerKey: string, offset: number): Uint8Array {
  const client = LoroDoc.fromSnapshot(kernel.snapshotBytes());
  const cursor = client.getText(containerKey).getCursor(offset, 0);
  if (cursor === undefined) throw new Error(`cannot anchor at ${offset}`);
  return cursor.encode();
}

function textOp(init: {
  actor: string;
  opId: string;
  kind: 'insert' | 'delete' | 'replace';
  offset: number;
  length?: number;
  text?: string;
  base: Frontier;
  cursorBytes: Uint8Array;
  componentId?: string;
  buffer?: string;
}): TextOpEnvelope {
  return {
    actor: init.actor,
    opId: init.opId,
    baseFrontiers: init.base,
    domain: 'text',
    kind: init.kind,
    target: { componentId: init.componentId ?? 'a1', buffer: init.buffer ?? 'label' },
    cursorBytes: init.cursorBytes,
    offset: init.offset,
    length: init.length ?? 0,
    text: init.text ?? '',
  };
}

function treeOp(init: {
  actor: string;
  opId: string;
  kind: 'insert' | 'move' | 'remove' | 'revive';
  componentId: string;
  base: Frontier;
  item?: unknown;
  parentComponentId?: string;
  index?: number;
}): TreeOpEnvelope {
  const common = { actor: init.actor, opId: init.opId, baseFrontiers: init.base, domain: 'tree' as const, target: { componentId: init.componentId } };
  if (init.kind === 'insert') {
    return { ...common, kind: 'insert', tree: { item: init.item ?? { tag: 'Card' }, parentComponentId: init.parentComponentId, index: init.index } };
  }
  if (init.kind === 'move') {
    return { ...common, kind: 'move', tree: { componentId: init.componentId, newParentId: init.parentComponentId, index: init.index } };
  }
  if (init.kind === 'remove') {
    return { ...common, kind: 'remove', tree: { componentId: init.componentId } };
  }
  return { ...common, kind: 'revive', tree: { componentId: init.componentId, parentComponentId: init.parentComponentId, index: init.index } };
}

async function admitText(ws: Workspace, init: Omit<Parameters<typeof textOp>[0], 'cursorBytes'>): Promise<AdmissionResult> {
  const containerKey = encodeContainerKey(init.componentId ?? 'a1', bufferKeyOf('label'));
  const cursor = cursorAt(ws.kernel, containerKey, init.offset);
  return ws.gate.admit(textOp({ ...init, cursorBytes: cursor, buffer: 'label' }));
}

/** walk the tree summary for the parent TreeID of one component (root → undefined) */
function parentTreeNodeOf(kernel: CollabKernel, componentId: string): string | undefined {
  const treeNodeId = kernel.treeNodeOf(componentId);
  assert.ok(treeNodeId !== undefined, `${componentId} has no tree node`);
  const search = (nodes: Array<{ id: string; children?: unknown[] }>, parent: string | undefined): string | undefined => {
    for (const node of nodes) {
      if (node.id === treeNodeId) return parent;
      const children = (node.children ?? []) as Array<{ id: string; children?: unknown[] }>;
      const found = search(children, node.id);
      if (found !== undefined) return found;
    }
    return undefined;
  };
  return search(JSON.parse(kernel.treeSummary()) as Array<{ id: string; children?: unknown[] }>, undefined);
}

const commitsOf = (kernel: CollabKernel, opId: string): CommitJournalEntry[] =>
  kernel.journalEntries().filter((entry): entry is CommitJournalEntry => entry.type === 'commit' && entry.opId === opId);

const liveNodeIds = (kernel: CollabKernel): string[] => {
  const ids: string[] = [];
  const walk = (nodes: Array<{ id: string; children?: unknown[] }>): void => {
    for (const node of nodes) {
      ids.push(node.id);
      walk((node.children ?? []) as Array<{ id: string; children?: unknown[] }>);
    }
  };
  walk(JSON.parse(kernel.treeSummary()) as Array<{ id: string; children?: unknown[] }>);
  return ids;
};

/* ── give-up: only the target op is removed, third party survives ─────── */

test('give-up removes only the target op: third-party edits survive, supersedes is journaled, history is not rewritten', async () => {
  const ws = workspace('base');
  const seedBase = ws.kernel.frontiers();
  // the op to give up: agent prepends 'B'
  await admitText(ws, { actor: 'agent:copy', opId: 'agent:copy:1', kind: 'insert', offset: 0, text: 'B', base: seedBase });
  // third party appends 'C' AFTER the target op
  await admitText(ws, { actor: 'human', opId: 'human:1', kind: 'insert', offset: ws.kernel.bufferText(LABEL_KEY).length, text: 'C', base: ws.kernel.frontiers() });
  assert.equal(ws.kernel.bufferText(LABEL_KEY), 'BbaseC');

  const result = await giveUp(ws.gate, 'agent:copy:1', 'human');
  assert.equal(result.status, 200);
  assert.ok(isCommitReceipt(result));
  assert.equal(result.supersedes, 'agent:copy:1');
  assert.equal(ws.kernel.bufferText(LABEL_KEY), 'baseC', 'only B is compensated; the third-party C survives (P3 semantics)');

  // the compensation is a NEW journal row — the target's history stays verbatim
  const compensation = commitsOf(ws.kernel, result.opId);
  assert.equal(compensation.length, 1);
  assert.equal(compensation[0]?.kind, 'give-up-compensation');
  assert.equal(compensation[0]?.supersedes, 'agent:copy:1');
  assert.equal(commitsOf(ws.kernel, 'agent:copy:1').length, 1, 'the superseded op row is untouched');
  assert.equal(commitsOf(ws.kernel, 'human:1').length, 1, 'the third-party op row is untouched');
  // WAL discipline holds for the compensation too
  assert.deepEqual(ws.kernel.walEntries().filter((entry) => entry.opId === result.opId).map((entry) => entry.type), ['prepare', 'receipt']);
});

test('give-up is identity-precise when a third-party edit sits INSIDE the compensated span', async () => {
  const ws = workspace('base');
  const seedBase = ws.kernel.frontiers();
  await admitText(ws, { actor: 'agent:copy', opId: 'agent:copy:1', kind: 'insert', offset: 4, text: 'BBBB', base: seedBase }); // baseBBBB
  await admitText(ws, { actor: 'human', opId: 'human:1', kind: 'insert', offset: 6, text: 'CC', base: ws.kernel.frontiers() }); // baseBBCCBB
  assert.equal(ws.kernel.bufferText(LABEL_KEY), 'baseBBCCBB');

  const result = await giveUp(ws.gate, 'agent:copy:1', 'human');
  assert.equal(result.status, 200);
  assert.equal(ws.kernel.bufferText(LABEL_KEY), 'baseCC', 'only the four inserted Bs are compensated; the inside-span CC survives');
});

test('give-up idempotency is frozen: a repeated give-up returns the original receipt with no second effect (across actors)', async () => {
  const ws = workspace('base');
  await admitText(ws, { actor: 'agent:copy', opId: 'agent:copy:1', kind: 'insert', offset: 0, text: 'B', base: ws.kernel.frontiers() });
  await admitText(ws, { actor: 'human', opId: 'human:1', kind: 'insert', offset: ws.kernel.bufferText(LABEL_KEY).length, text: 'C', base: ws.kernel.frontiers() });

  const first = await giveUp(ws.gate, 'agent:copy:1', 'human');
  assert.equal(first.status, 200);
  const textAfterFirst = ws.kernel.bufferText(LABEL_KEY);
  const second = await giveUp(ws.gate, 'agent:copy:1', 'human');
  assert.strictEqual(second, first, 'same requester replays the original receipt object');
  const third = await giveUp(ws.gate, 'agent:copy:1', 'agent:other');
  assert.strictEqual(third, first, 'a DIFFERENT actor giving up the same op also replays it (journal supersedes is the idempotency key)');
  assert.equal(ws.kernel.bufferText(LABEL_KEY), textAfterFirst, 'no double compensation');
  assert.equal(ws.kernel.journalEntries().filter((entry) => entry.type === 'commit' && entry.supersedes === 'agent:copy:1').length, 1, 'exactly one supersedes row');
});

test('give-up of an unknown op is a journaled 404 bad-target', async () => {
  const ws = workspace('base');
  const rejection = await giveUp(ws.gate, 'ghost:op', 'human');
  assert.equal(rejection.status, 404);
  assert.equal(rejection.code, 'bad-target');
  const retry = await giveUp(ws.gate, 'ghost:op', 'human');
  assert.strictEqual(retry, rejection, 'rejections are receipts (§5.0)');
});

test('give-up of a tree remove rebinds: the subtree returns with original TreeIDs, third party and buffers survive (O2 unlock, probe A9)', async () => {
  const ws = workspace('base');
  await ws.gate.admit(treeOp({ actor: 'human', opId: 't:1', kind: 'insert', componentId: 'a1', base: ws.kernel.frontiers(), item: { tag: 'Card' } }));
  await ws.gate.admit(treeOp({ actor: 'human', opId: 't:2', kind: 'insert', componentId: 'a2', base: ws.kernel.frontiers(), parentComponentId: 'a1', item: { tag: 'Slot' } }));
  await ws.gate.admit(treeOp({ actor: 'human', opId: 't:3', kind: 'insert', componentId: 'a3', base: ws.kernel.frontiers(), parentComponentId: 'a2', item: { tag: 'Deep' } }));
  // third-party noise the compensation must not touch
  await ws.gate.admit(treeOp({ actor: 'agent:noise', opId: 'n:1', kind: 'insert', componentId: 'n1', base: ws.kernel.frontiers() }));
  await admitText(ws, { actor: 'human', opId: 'human:1', kind: 'insert', offset: 4, text: 'X', base: ws.kernel.frontiers() });
  assert.equal(ws.kernel.bufferText(LABEL_KEY), 'baseX');
  const oldA1 = ws.kernel.treeNodeOf('a1')!;
  const a2Node = ws.kernel.treeNodeOf('a2')!;
  const a3Node = ws.kernel.treeNodeOf('a3')!;
  const containerBefore = String(ws.kernel.containerIdOf(LABEL_KEY));

  await ws.gate.admit(treeOp({ actor: 'human', opId: 't:rm', kind: 'remove', componentId: 'a1', base: ws.kernel.frontiers() }));
  assert.ok(kernelIsTombstoned(ws.kernel, 'a1'), 'the subtree root is tombstoned');

  // (History: from M4 until the 2026-09-15 O2 ruling this was the journaled
  // 503 compensation-unsupported — revertTo's tree-delete inverse
  // fabricates a bare node, losing TreeID identity and node data. Probe A9
  // replaced the revert with the rebind recipe; the engine is unchanged.)
  const result = await giveUp(ws.gate, 't:rm', 'agent:copy');
  assert.equal(result.status, 200);
  assert.ok(isCommitReceipt(result));
  assert.equal(result.supersedes, 't:rm');

  // a1 is back via a FRESH TreeID; a2/a3 return with their ORIGINAL TreeIDs
  const newA1 = ws.kernel.treeNodeOf('a1')!;
  assert.notEqual(newA1, oldA1, 'the compensation rebinds onto a fresh TreeID');
  assert.ok(!kernelIsTombstoned(ws.kernel, 'a1'));
  assert.equal(ws.kernel.treeNodeOf('a2'), a2Node, 'the child keeps its TreeID');
  assert.equal(ws.kernel.treeNodeOf('a3'), a3Node, 'the grandchild keeps its TreeID');
  assert.ok(!kernelIsTombstoned(ws.kernel, 'a2') && !kernelIsTombstoned(ws.kernel, 'a3'), 'the attached subtree returned with the rebind');
  assert.equal(parentTreeNodeOf(ws.kernel, 'a2'), newA1, 'a2 hangs back under the rebound root');
  assert.equal(parentTreeNodeOf(ws.kernel, 'a3'), a2Node, 'the deeper subtree followed its parent (a3CameBackWithParent)');
  assert.deepEqual(ws.kernel.treeItems().find((node) => node.treeNodeId === newA1)?.meta, { tag: 'Card' }, 'the item payload was restored');

  // third party and buffers survive
  assert.ok(liveNodeIds(ws.kernel).includes(ws.kernel.treeNodeOf('n1')!), 'the third-party noise root survives');
  assert.equal(ws.kernel.bufferText(LABEL_KEY), 'baseX', 'the third-party buffer edit survives');
  assert.equal(String(ws.kernel.containerIdOf(LABEL_KEY)), containerBefore, 'the buffer container id is stable across the compensation');

  // the journal row audits the rebind lineage; idempotency holds
  const row = commitsOf(ws.kernel, result.opId)[0];
  assert.equal(row?.kind, 'give-up-compensation');
  assert.equal(row?.tree?.rebindOf, oldA1);
  const again = await giveUp(ws.gate, 't:rm', 'agent:other');
  assert.strictEqual(again, result, 'a second give-up of the same remove replays the original receipt');

  // the rebind row survives recovery: the mapping re-points onto the fresh TreeID
  const recovered = CollabKernel.open(ws.store.clone());
  assert.equal(recovered.treeNodeOf('a1'), newA1, 'the compensation row rebuilds the rebind');
  assert.ok(!recovered.isTreeNodeDeleted(newA1) && recovered.isTreeNodeDeleted(oldA1), 'the dead lineage stays dead');
  assert.equal(recovered.treeNodeOf('a2'), a2Node);
  assert.equal(recovered.bufferText(LABEL_KEY), 'baseX');
});

function kernelIsTombstoned(kernel: CollabKernel, componentId: string): boolean {
  const treeNodeId = kernel.treeNodeOf(componentId);
  return treeNodeId !== undefined && kernel.isTreeNodeDeleted(treeNodeId);
}

/* ── give-up on tree ops ───────────────────────────────────────────────── */

test('give-up of a tree insert removes the node while third-party buffer edits survive', async () => {
  const ws = workspace('base');
  await ws.gate.admit(treeOp({ actor: 'agent:copy', opId: 'agent:t1', kind: 'insert', componentId: 'a1', base: ws.kernel.frontiers() }));
  await ws.gate.admit(treeOp({ actor: 'agent:copy', opId: 'agent:t2', kind: 'insert', componentId: 'a2', base: ws.kernel.frontiers(), parentComponentId: 'a1' }));
  ws.kernel.ensureBuffer('a2', 'label', 'kept');
  await admitText(ws, { actor: 'human', opId: 'human:1', kind: 'insert', offset: 4, text: 'X', base: ws.kernel.frontiers(), componentId: 'a2' });
  assert.equal(ws.kernel.bufferText(A2_LABEL_KEY), 'keptX');

  const result = await giveUp(ws.gate, 'agent:t2', 'human');
  assert.equal(result.status, 200);
  assert.equal(result.supersedes, 'agent:t2');
  assert.ok(!liveNodeIds(ws.kernel).includes(ws.kernel.treeNodeOf('a2')!), 'the inserted node left the live tree');
  assert.ok(kernelIsTombstoned(ws.kernel, 'a2'), 'the compensated node is tombstoned, not never-seen');
  assert.equal(ws.kernel.bufferText(A2_LABEL_KEY), 'keptX', 'third-party buffer edit survives the structural compensation');
  assert.ok(liveNodeIds(ws.kernel).includes(ws.kernel.treeNodeOf('a1')!), 'the parent survives');
});

test('give-up of a tree move restores the previous placement with the same node identity', async () => {
  const ws = workspace('base');
  await ws.gate.admit(treeOp({ actor: 'human', opId: 't:1', kind: 'insert', componentId: 'a1', base: ws.kernel.frontiers() }));
  await ws.gate.admit(treeOp({ actor: 'human', opId: 't:2', kind: 'insert', componentId: 'a2', base: ws.kernel.frontiers(), parentComponentId: 'a1' }));
  await ws.gate.admit(treeOp({ actor: 'human', opId: 't:3', kind: 'insert', componentId: 'a3', base: ws.kernel.frontiers(), parentComponentId: 'a1' }));
  const a3Node = ws.kernel.treeNodeOf('a3')!;
  await admitText(ws, { actor: 'human', opId: 't:4', kind: 'insert', offset: 0, text: 'T', base: ws.kernel.frontiers() }); // concurrent text noise
  await ws.gate.admit(treeOp({ actor: 'agent:copy', opId: 'agent:m1', kind: 'move', componentId: 'a3', base: ws.kernel.frontiers(), parentComponentId: 'a2' }));
  assert.equal(parentTreeNodeOf(ws.kernel, 'a3'), ws.kernel.treeNodeOf('a2'));

  const result = await giveUp(ws.gate, 'agent:m1', 'human');
  assert.equal(result.status, 200);
  assert.equal(parentTreeNodeOf(ws.kernel, 'a3'), ws.kernel.treeNodeOf('a1'), 'a3 is back under a1');
  assert.equal(ws.kernel.treeNodeOf('a3'), a3Node, 'the node identity survives the move compensation');
  assert.equal(ws.kernel.bufferText(LABEL_KEY), 'Tbase', 'the concurrent text edit survives');
});

/* ── override (保自己): the per-actor UndoManager session ─────────────── */

test('override undo/redo: the actor own op is reverted/reapplied and the OTHER actor edits survive', async () => {
  const ws = workspace('base');
  const session = openOverride(ws.gate, 'human');

  await admitText(ws, { actor: 'human', opId: 'human:1', kind: 'insert', offset: 4, text: '-H', base: ws.kernel.frontiers() });
  await admitText(ws, { actor: 'agent:copy', opId: 'agent:copy:1', kind: 'insert', offset: 0, text: 'A', base: ws.kernel.frontiers() });
  assert.equal(ws.kernel.bufferText(LABEL_KEY), 'Abase-H');
  assert.equal(session.canUndo(), true, 'the session recorded the actor op (local commit through the session fork)');

  const undoOutcome = await session.undo('human:undo:1');
  assert.equal(undoOutcome.status, 'performed');
  assert.ok(undoOutcome.status === 'performed');
  assert.equal(undoOutcome.receipt.supersedes, 'human:1', 'the undo step metadata names the undone op');
  assert.equal(ws.kernel.bufferText(LABEL_KEY), 'Abase', 'only the human op is undone; the agent A survives (p3 semantics)');
  assert.deepEqual(
    ws.kernel.walEntries().filter((entry) => entry.opId === 'human:undo:1').map((entry) => entry.type),
    ['prepare', 'receipt'],
  );

  assert.equal(session.canRedo(), true);
  const redoOutcome = await session.redo('human:redo:1');
  assert.equal(redoOutcome.status, 'performed');
  assert.equal(ws.kernel.bufferText(LABEL_KEY), 'Abase-H', 'redo reapplies the actor own op');

  const undoRow = commitsOf(ws.kernel, 'human:undo:1')[0];
  assert.equal(undoRow?.kind, 'override-undo');
  assert.equal(undoRow?.supersedes, 'human:1');
  assert.equal(commitsOf(ws.kernel, 'human:redo:1')[0]?.kind, 'override-redo');
  assert.equal(commitsOf(ws.kernel, 'agent:copy:1').length, 1, 'the other actor history is untouched');
});

test('override session scope: pre-session ops are not on the stack; empty-stack and no-session are explicit outcomes', async () => {
  const ws = workspace('base');
  // committed BEFORE any session — an UndoManager never records imports (p3)
  await admitText(ws, { actor: 'human', opId: 'human:1', kind: 'insert', offset: 4, text: '-H', base: ws.kernel.frontiers() });
  const session = openOverride(ws.gate, 'human');
  assert.equal(session.canUndo(), false);
  const empty = await session.undo('human:undo:1');
  assert.equal(empty.status, 'empty-stack');
  assert.equal(ws.kernel.bufferText(LABEL_KEY), 'base-H', 'nothing touched');

  const stranger = await ws.gate.overrideUndo({ actor: 'agent:copy', opId: 'agent:undo:1' });
  assert.equal(stranger.status, 'no-session');
});

/* ── concurrent tree moves: the LWW receipt (p12 productized) ─────────── */

test('concurrent same-node moves: both admitted, the second receipt carries the full LWW adjudication', async () => {
  const ws = workspace('base');
  await ws.gate.admit(treeOp({ actor: 'human', opId: 't:1', kind: 'insert', componentId: 'a1', base: ws.kernel.frontiers() }));
  await ws.gate.admit(treeOp({ actor: 'human', opId: 't:2', kind: 'insert', componentId: 'a2', base: ws.kernel.frontiers(), parentComponentId: 'a1' }));
  await ws.gate.admit(treeOp({ actor: 'human', opId: 't:3', kind: 'insert', componentId: 'a3', base: ws.kernel.frontiers(), parentComponentId: 'a1' }));
  const base = ws.kernel.frontiers(); // both movers built on this exact state

  const first = await ws.gate.admit(treeOp({ actor: 'agent:one', opId: 'agent:one:1', kind: 'move', componentId: 'a3', base, parentComponentId: 'a2' }));
  assert.equal(first.status, 200);
  if (isCommitReceipt(first)) assert.equal(first.lww, undefined, 'no contention is detectable at the first admission');

  const second = await ws.gate.admit(treeOp({ actor: 'agent:two', opId: 'agent:two:1', kind: 'move', componentId: 'a3', base, parentComponentId: undefined, index: 0 }));
  assert.equal(second.status, 200, 'both concurrent moves are admitted (the LWW receipt is the audit, not a rejection)');
  assert.ok(isCommitReceipt(second));
  const lww = second.lww;
  assert.ok(lww !== undefined, 'the contended admission carries the adjudication');
  assert.equal(lww.resolution, 'lww');
  assert.equal(lww.componentId, 'a3');
  const contenderIds = lww.contenders.map((contender) => contender.opId).sort();
  assert.deepEqual(contenderIds, ['agent:one:1', 'agent:two:1']);
  for (const contender of lww.contenders) {
    assert.ok(Number.isInteger(contender.orderKey.lamport), `contender ${contender.opId} carries a lamport`);
    assert.ok(Number.isInteger(contender.orderKey.peer), `contender ${contender.opId} carries its registry peer`);
  }
  // the later-admitted change is causally after the first: its lamport is
  // strictly greater — the orderKey data shows WHY the winner wins
  const one = lww.contenders.find((contender) => contender.opId === 'agent:one:1')!;
  const two = lww.contenders.find((contender) => contender.opId === 'agent:two:1')!;
  assert.ok(two.orderKey.lamport > one.orderKey.lamport);
  assert.equal(lww.winnerOpId, 'agent:two:1');

  // engine truth agrees: the effective last move on the node is the winner's
  assert.equal(parentTreeNodeOf(ws.kernel, 'a3'), undefined, 'a3 sits at the forest root (the winner moved it there)');

  // the journal row keeps the same audit (receipts are rebuildable)
  const row = commitsOf(ws.kernel, 'agent:two:1')[0];
  assert.deepEqual(row?.lww, lww);
});

/* ── revive semantics (M2 revisit, reconciled; O1 unlock 2026-09-15) ──── */

test('revive: inherited descendants revive by engine move; the direct remove target returns via journal rebind (O1 unlock)', async () => {
  const ws = workspace('base');
  await ws.gate.admit(treeOp({ actor: 'human', opId: 't:1', kind: 'insert', componentId: 'a1', base: ws.kernel.frontiers() }));
  await ws.gate.admit(treeOp({ actor: 'human', opId: 't:2', kind: 'insert', componentId: 'a2', base: ws.kernel.frontiers(), parentComponentId: 'a1' }));

  // (History: from M4 until the 2026-09-15 O1/O2 ruling, the direct target
  // of remove could NEVER come back on loro 1.16.1 — `tree.move`,
  // `handle.move` and two-step descendant maneuvers all throw "is deleted"
  // (probe-verified) — and this test pinned the honest 404. Outcome A of
  // the probe re-framed that as an implementation detail: revive now
  // rebinds directly-deleted targets at the journal level.)
  await ws.gate.admit(treeOp({ actor: 'human', opId: 't:3', kind: 'remove', componentId: 'a1', base: ws.kernel.frontiers() }));
  assert.ok(kernelIsTombstoned(ws.kernel, 'a1') && kernelIsTombstoned(ws.kernel, 'a2'), 'the subtree is tombstoned');

  const childRevive = await ws.gate.admit(treeOp({ actor: 'human', opId: 't:5', kind: 'revive', componentId: 'a2', base: ws.kernel.frontiers() }));
  assert.equal(childRevive.status, 200, 'an inherited tombstone revives via the engine move (the p12 path)');
  assert.ok(!kernelIsTombstoned(ws.kernel, 'a2'));
  const oldA1 = ws.kernel.treeNodeOf('a1')!;
  assert.ok(ws.kernel.isTreeNodeDeleted(oldA1), 'revive does not cascade to the deletion root');

  // the O1 unlock: the deletion root itself comes back via the rebind
  const rootRevive = await ws.gate.admit(treeOp({ actor: 'human', opId: 't:4', kind: 'revive', componentId: 'a1', base: ws.kernel.frontiers() }));
  assert.equal(rootRevive.status, 200);
  const newA1 = ws.kernel.treeNodeOf('a1')!;
  assert.notEqual(newA1, oldA1, 'the rebind mints a fresh TreeID');
  assert.ok(!ws.kernel.isTreeNodeDeleted(newA1) && ws.kernel.isTreeNodeDeleted(oldA1), 'the component is live; the dead TreeID stays dead');
  // a2 was already moved away by the child revive — a later op, nothing hangs back
  assert.equal(parentTreeNodeOf(ws.kernel, 'a2'), undefined, 'the earlier child revive survives the root rebind');
});

test('revive freeze: a directly-deleted descendant stays dead when its tombstoned parent is revived', async () => {
  const ws = workspace('base');
  await ws.gate.admit(treeOp({ actor: 'human', opId: 't:1', kind: 'insert', componentId: 'a1', base: ws.kernel.frontiers() }));
  await ws.gate.admit(treeOp({ actor: 'human', opId: 't:2', kind: 'insert', componentId: 'a2', base: ws.kernel.frontiers(), parentComponentId: 'a1' }));
  await ws.gate.admit(treeOp({ actor: 'human', opId: 't:3', kind: 'insert', componentId: 'a3', base: ws.kernel.frontiers(), parentComponentId: 'a2' }));
  // direct remove of the deepest node FIRST, then the subtree root
  await ws.gate.admit(treeOp({ actor: 'human', opId: 't:4', kind: 'remove', componentId: 'a3', base: ws.kernel.frontiers() }));
  await ws.gate.admit(treeOp({ actor: 'human', opId: 't:5', kind: 'remove', componentId: 'a1', base: ws.kernel.frontiers() }));

  const revive = await ws.gate.admit(treeOp({ actor: 'human', opId: 't:6', kind: 'revive', componentId: 'a2', base: ws.kernel.frontiers() }));
  assert.equal(revive.status, 200);
  assert.ok(!kernelIsTombstoned(ws.kernel, 'a2'), 'the revived node is live');
  assert.ok(kernelIsTombstoned(ws.kernel, 'a3'), 'the DIRECTLY-deleted descendant stays dead (§6: revive 不隐式恢复已删除后代)');
  assert.ok(kernelIsTombstoned(ws.kernel, 'a1'), 'the deletion root stays dead');
});

test('move guard: an ordinary move of a tombstoned node is refused even where the engine would revive it', async () => {
  const ws = workspace('base');
  await ws.gate.admit(treeOp({ actor: 'human', opId: 't:1', kind: 'insert', componentId: 'a1', base: ws.kernel.frontiers() }));
  await ws.gate.admit(treeOp({ actor: 'human', opId: 't:2', kind: 'insert', componentId: 'a2', base: ws.kernel.frontiers(), parentComponentId: 'a1' }));
  await ws.gate.admit(treeOp({ actor: 'human', opId: 't:3', kind: 'remove', componentId: 'a1', base: ws.kernel.frontiers() }));

  // a2 is tombstoned by INHERITANCE — the engine move would revive it
  // (that is how the explicit revive op is implemented); §6 forbids the
  // ordinary move from being that door
  const move = await ws.gate.admit(treeOp({ actor: 'agent:copy', opId: 'agent:m1', kind: 'move', componentId: 'a2', base: ws.kernel.frontiers(), parentComponentId: undefined, index: 0 }));
  assert.equal(move.status, 404);
  assert.equal(move.code, 'bad-target');
  assert.ok(kernelIsTombstoned(ws.kernel, 'a2'), 'no implicit revive happened');
});

/* ── O1 unlock: the direct-remove-target revive, end to end ───────────── */

test('revive unlock e2e: same componentId back, item restored, buffers reused, attached subtree back, directly-deleted child stays dead (O1, probe A1/A3/A5d/A6)', async () => {
  const ws = workspace('base');
  // a1 {Card} with a2→a3 (inherited subtree) and a4 (directly deleted first)
  await ws.gate.admit(treeOp({ actor: 'human', opId: 't:1', kind: 'insert', componentId: 'a1', base: ws.kernel.frontiers(), item: { tag: 'Card' } }));
  await ws.gate.admit(treeOp({ actor: 'human', opId: 't:2', kind: 'insert', componentId: 'a2', base: ws.kernel.frontiers(), parentComponentId: 'a1', item: { tag: 'Slot' } }));
  await ws.gate.admit(treeOp({ actor: 'human', opId: 't:3', kind: 'insert', componentId: 'a3', base: ws.kernel.frontiers(), parentComponentId: 'a2', item: { tag: 'Deep' } }));
  await ws.gate.admit(treeOp({ actor: 'human', opId: 't:4', kind: 'insert', componentId: 'a4', base: ws.kernel.frontiers(), parentComponentId: 'a1', item: { tag: 'Badge' } }));
  await admitText(ws, { actor: 'human', opId: 'human:1', kind: 'insert', offset: 4, text: 'X', base: ws.kernel.frontiers() });
  assert.equal(ws.kernel.bufferText(LABEL_KEY), 'baseX');
  const oldA1 = ws.kernel.treeNodeOf('a1')!;
  const a2Node = ws.kernel.treeNodeOf('a2')!;
  const a3Node = ws.kernel.treeNodeOf('a3')!;
  const a4Node = ws.kernel.treeNodeOf('a4')!;
  const containerBefore = String(ws.kernel.containerIdOf(LABEL_KEY));

  // direct remove of a4 FIRST, then the subtree root
  await ws.gate.admit(treeOp({ actor: 'human', opId: 't:5', kind: 'remove', componentId: 'a4', base: ws.kernel.frontiers() }));
  await ws.gate.admit(treeOp({ actor: 'human', opId: 't:6', kind: 'remove', componentId: 'a1', base: ws.kernel.frontiers() }));
  assert.ok(
    kernelIsTombstoned(ws.kernel, 'a1') && kernelIsTombstoned(ws.kernel, 'a2') && kernelIsTombstoned(ws.kernel, 'a3') && kernelIsTombstoned(ws.kernel, 'a4'),
    'the whole subtree is tombstoned',
  );
  assert.equal(ws.kernel.bufferText(LABEL_KEY), 'baseX', 'A1: the buffer survives the remove, untouched');

  const revive = await ws.gate.admit(treeOp({ actor: 'human', opId: 't:7', kind: 'revive', componentId: 'a1', base: ws.kernel.frontiers() }));
  assert.equal(revive.status, 200);

  // A3: fresh TreeID for the same componentId; the dead one stays dead
  const newA1 = ws.kernel.treeNodeOf('a1')!;
  assert.notEqual(newA1, oldA1);
  assert.ok(!ws.kernel.isTreeNodeDeleted(newA1) && ws.kernel.isTreeNodeDeleted(oldA1));
  // A5d: the item payload rides the rebind
  assert.deepEqual(ws.kernel.treeItems().find((node) => node.treeNodeId === newA1)?.meta, { tag: 'Card' });
  // A1/A3: the buffer container is reused verbatim — same id, same content
  assert.equal(ws.kernel.bufferText(LABEL_KEY), 'baseX');
  assert.equal(String(ws.kernel.containerIdOf(LABEL_KEY)), containerBefore);
  // A6: the attached subtree returned keeping its TreeIDs
  assert.equal(ws.kernel.treeNodeOf('a2'), a2Node);
  assert.equal(ws.kernel.treeNodeOf('a3'), a3Node);
  assert.ok(!kernelIsTombstoned(ws.kernel, 'a2') && !kernelIsTombstoned(ws.kernel, 'a3'));
  assert.equal(parentTreeNodeOf(ws.kernel, 'a2'), newA1, 'a2 hangs back under the rebound parent');
  assert.equal(parentTreeNodeOf(ws.kernel, 'a3'), a2Node, 'a3 followed a2 automatically (a3CameBackWithParent)');
  // §6: the DIRECTLY-deleted child is not implicitly restored
  assert.equal(ws.kernel.treeNodeOf('a4'), a4Node);
  assert.ok(kernelIsTombstoned(ws.kernel, 'a4'), 'the directly-deleted descendant stays dead');

  // A3b: post-revive writes land in the SAME container
  const write = await admitText(ws, { actor: 'human', opId: 'human:2', kind: 'insert', offset: 5, text: '!', base: ws.kernel.frontiers() });
  assert.equal(write.status, 200);
  assert.equal(ws.kernel.bufferText(LABEL_KEY), 'baseX!');
  assert.equal(String(ws.kernel.containerIdOf(LABEL_KEY)), containerBefore);

  // journal: the rebind lineage + A8 insert-row item persistence
  assert.equal(commitsOf(ws.kernel, 't:7')[0]?.tree?.rebindOf, oldA1);
  assert.deepEqual(commitsOf(ws.kernel, 't:1')[0]?.tree?.item, { tag: 'Card' }, 'A8: the insert row persists the item payload');

  // projection round-trip: a snapshot replica carries the rebound world
  const replica = LoroDoc.fromSnapshot(ws.kernel.snapshotBytes());
  const replicaNodes = replica.getTree('tree').nodes();
  const replicaNew = replicaNodes.find((node) => String(node.id) === newA1);
  const replicaOld = replicaNodes.find((node) => String(node.id) === oldA1);
  assert.ok(replicaNew !== undefined && !replicaNew.isDeleted(), 'projection round-trip: the rebound node is live in the snapshot');
  assert.ok(replicaOld === undefined || replicaOld.isDeleted(), 'projection round-trip: the dead lineage stays dead');
  assert.equal(replica.getText(LABEL_KEY).toString(), 'baseX!', 'projection round-trip: the reused buffer rides the snapshot');

  // the rebind row rebuilds across recovery
  const recovered = CollabKernel.open(ws.store.clone());
  assert.equal(recovered.treeNodeOf('a1'), newA1, 'rebindOf journal row: the fresh mapping rebuilds');
  assert.ok(!recovered.isTreeNodeDeleted(newA1) && recovered.isTreeNodeDeleted(oldA1));
  assert.equal(recovered.treeNodeOf('a2'), a2Node);
  assert.equal(recovered.bufferText(LABEL_KEY), 'baseX!');
});

test('remove/revive cycles: every cycle mints a distinct TreeID, the buffer container id never moves (probe A3/A7)', async () => {
  const ws = workspace('v0');
  await ws.gate.admit(treeOp({ actor: 'human', opId: 't:1', kind: 'insert', componentId: 'a1', base: ws.kernel.frontiers(), item: { tag: 'Card' } }));
  const container = String(ws.kernel.containerIdOf(LABEL_KEY));
  const ids = [ws.kernel.treeNodeOf('a1')!];
  for (const [removeOp, reviveOp] of [
    ['t:2', 't:3'],
    ['t:4', 't:5'],
  ] as const) {
    await ws.gate.admit(treeOp({ actor: 'human', opId: removeOp, kind: 'remove', componentId: 'a1', base: ws.kernel.frontiers() }));
    const revive = await ws.gate.admit(treeOp({ actor: 'human', opId: reviveOp, kind: 'revive', componentId: 'a1', base: ws.kernel.frontiers() }));
    assert.equal(revive.status, 200);
    ids.push(ws.kernel.treeNodeOf('a1')!);
  }
  assert.equal(new Set(ids).size, 3, 'A7: each cycle rebinds onto a fresh TreeID');
  assert.equal(String(ws.kernel.containerIdOf(LABEL_KEY)), container, 'A3: the container id is stable across both cycles');
  assert.equal(ws.kernel.bufferText(LABEL_KEY), 'v0');
  const write = await admitText(ws, { actor: 'human', opId: 'human:9', kind: 'insert', offset: 2, text: '!', base: ws.kernel.frontiers() });
  assert.equal(write.status, 200, 'the reused container keeps accepting writes');
  assert.equal(ws.kernel.bufferText(LABEL_KEY), 'v0!');
});

test('give-up of a text op on a tombstoned component: 200 and effective — compensation is history rollback, not a new write (probe C2, §6)', async () => {
  const ws = workspace('base');
  await ws.gate.admit(treeOp({ actor: 'human', opId: 't:1', kind: 'insert', componentId: 'a1', base: ws.kernel.frontiers() }));
  await admitText(ws, { actor: 'agent:copy', opId: 'agent:copy:1', kind: 'insert', offset: 0, text: 'B', base: ws.kernel.frontiers() });
  assert.equal(ws.kernel.bufferText(LABEL_KEY), 'Bbase');
  await ws.gate.admit(treeOp({ actor: 'human', opId: 't:2', kind: 'remove', componentId: 'a1', base: ws.kernel.frontiers() }));

  // the ordinary write on the tombstone 404s (§6)…
  const direct = await admitText(ws, { actor: 'human', opId: 'human:tomb', kind: 'insert', offset: 5, text: 'X', base: ws.kernel.frontiers() });
  assert.equal(direct.status, 404);
  assert.equal(direct.code, 'bad-target');
  // …but the give-up compensation of the pre-remove op lands and takes
  // effect under the tombstone (C2): reverting history is not a new write,
  // so §6's tombstone 404 law does not cover the compensation path
  const result = await giveUp(ws.gate, 'agent:copy:1', 'human');
  assert.equal(result.status, 200);
  assert.ok(isCommitReceipt(result));
  assert.equal(result.supersedes, 'agent:copy:1');
  assert.equal(ws.kernel.bufferText(LABEL_KEY), 'base', 'the compensation was effective under the tombstone');
  assert.ok(kernelIsTombstoned(ws.kernel, 'a1'), 'the component stays tombstoned — no implicit revive');
});

/* ── durability: compensations, receipts and legacy rows across recovery ─ */

test('recovery: the compensation replay rebuilds buffer, receipt and supersedes; give-up stays idempotent after restart', async () => {
  const ws = workspace('base');
  const seedBase = ws.kernel.frontiers();
  await admitText(ws, { actor: 'agent:copy', opId: 'agent:copy:1', kind: 'insert', offset: 0, text: 'B', base: seedBase });
  await admitText(ws, { actor: 'human', opId: 'human:1', kind: 'insert', offset: ws.kernel.bufferText(LABEL_KEY).length, text: 'C', base: ws.kernel.frontiers() });
  const result = await giveUp(ws.gate, 'agent:copy:1', 'human');
  assert.equal(result.status, 200);
  const compensated = ws.kernel.bufferText(LABEL_KEY);
  assert.equal(compensated, 'baseC');

  const recovered = CollabKernel.open(ws.store.clone());
  assert.equal(recovered.bufferText(LABEL_KEY), compensated, 'the journal replay includes the compensation');
  const rebuilt = recovered.receiptFor(result.opId);
  assert.equal(rebuilt?.status, 200);
  assert.ok(isCommitReceipt(rebuilt));
  assert.equal(rebuilt.supersedes, 'agent:copy:1', 'the supersedes link survives recovery');

  // idempotency across restart: a fresh give-up of the same target replays
  const again = await giveUp(new AdmissionGate(recovered), 'agent:copy:1', 'agent:other');
  assert.ok(isCommitReceipt(again));
  assert.equal(again.opId, result.opId, 'the original compensation opId is replayed');
  assert.equal(recovered.bufferText(LABEL_KEY), compensated);
});

test('legacy M2 rows without parentFrontier: give-up derives the target parent from the frontier', async () => {
  const ws = workspace('base');
  const seedBase = ws.kernel.frontiers();
  await admitText(ws, { actor: 'agent:copy', opId: 'agent:copy:1', kind: 'insert', offset: 0, text: 'B', base: seedBase });
  await admitText(ws, { actor: 'human', opId: 'human:1', kind: 'insert', offset: ws.kernel.bufferText(LABEL_KEY).length, text: 'C', base: ws.kernel.frontiers() });

  // simulate a pre-M4 journal: strip parentFrontier from every commit row
  const legacy = ws.store.clone();
  for (const entry of legacy.readJournal()) {
    if (entry.type === 'commit') delete (entry as { parentFrontier?: Frontier }).parentFrontier;
  }
  const recovered = CollabKernel.open(legacy);
  assert.equal(recovered.commitRowFor('agent:copy:1')?.parentFrontier, undefined, 'the legacy row really lacks the field');

  const result = await giveUp(recovered, 'agent:copy:1', 'human');
  assert.equal(result.status, 200);
  assert.equal(recovered.bufferText(LABEL_KEY), 'baseC', 'the derived parent (frontiersToVV minus the own change) compensates exactly the target');
});
