/**
 * retention.test.ts — the M7 journal-retention governance tests
 * (collab-protocol §9 留存冻结): the active-cursor enumeration
 * (journal-derived, per actor the last-issued cursor), the
 * tombstone-obligation enumeration (deletion rows + dead-node payload
 * rows), and the compaction guard in BOTH directions —
 *
 *   refused: a lagging active cursor (compaction only after every
 *   cursor crossed the frontier), an unresolvable cursor (fail-safe),
 *   an unknown compaction frontier, and — outranking everything — a
 *   tombstone obligation that pruning would drop (loro 1.16.1
 *   persisted state may drop tombstones; the identity high-water and
 *   the A-route rebind both read them);
 *   allowed: a frontier every cursor dominates AND no obligation lives
 *   at-or-below — including the case where the chosen frontier predates
 *   all deletions (later tombstones sit above the prune line).
 *
 * No compaction executor exists (the journal is append-only, the doc is
 * never pruned) — the guard stands as the fail-safe gate any future
 * executor must clear (M7 注记: 压缩执行器接后续，或无需压缩时 guard
 * 待命).
 *
 * Original need: collab-protocol M7 (2026-09-15).
 */

import { strict as assert } from 'node:assert';
import test from 'node:test';

import { LoroDoc } from 'loro-crdt';

import { AdmissionGate } from './admission.ts';
import {
  bufferKeyOf,
  CollabKernel,
  CompactionRefusedError,
  encodeContainerKey,
} from './kernel.ts';
import { MemoryCollabStore } from './store.ts';
import type { Frontier, RejectionJournalEntry, SyncCursor, TextOpEnvelope, TreeOpEnvelope } from './types.ts';

/* ── test scaffolding (the kernel.test.ts driving vocabulary) ──────────── */

const LABEL_KEY = encodeContainerKey('a1', bufferKeyOf('label'));

/** a client-side stable anchor encoded against the current snapshot */
function clientCursor(kernel: CollabKernel, containerKey: string, offset: number): Uint8Array {
  const client = LoroDoc.fromSnapshot(kernel.snapshotBytes());
  const cursor = client.getText(containerKey).getCursor(offset, 0);
  if (cursor === undefined) throw new Error(`cannot anchor at ${offset}`);
  return cursor.encode();
}

function textInsert(init: { actor: string; opId: string; offset: number; text: string; base: Frontier; kernel: CollabKernel }): TextOpEnvelope {
  return {
    actor: init.actor,
    opId: init.opId,
    baseFrontiers: init.base,
    domain: 'text',
    kind: 'insert',
    target: { componentId: 'a1', buffer: 'label' },
    cursorBytes: clientCursor(init.kernel, LABEL_KEY, init.offset),
    offset: init.offset,
    length: 0,
    text: init.text,
  };
}

function treeOp(init: {
  actor: string;
  opId: string;
  kind: 'insert' | 'remove';
  componentId: string;
  base: Frontier;
  item?: unknown;
  parentComponentId?: string;
}): TreeOpEnvelope {
  const common = { actor: init.actor, opId: init.opId, baseFrontiers: init.base, domain: 'tree' as const, target: { componentId: init.componentId } };
  if (init.kind === 'remove') return { ...common, kind: 'remove', tree: { componentId: init.componentId } };
  return { ...common, kind: 'insert', tree: { item: init.item ?? { tag: 'Card' }, parentComponentId: init.parentComponentId, index: undefined } };
}

/** open a kernel over a seeded label buffer */
function seededKernel(): CollabKernel {
  const kernel = CollabKernel.open(new MemoryCollabStore());
  kernel.ensureBuffer('a1', 'label', 'abc');
  return kernel;
}

/* ── the enumerations ──────────────────────────────────────────────────── */

test('activeSyncCursors: per actor the LAST-issued journal cursor, enumeration is total and deterministic', async () => {
  const kernel = seededKernel();
  const gate = new AdmissionGate(kernel);
  await gate.admit(textInsert({ actor: 'human', opId: 'human:1', offset: 3, text: '!', base: kernel.frontiers(), kernel }));
  await gate.admit(textInsert({ actor: 'human', opId: 'human:2', offset: 4, text: '?', base: kernel.frontiers(), kernel }));
  await gate.admit(textInsert({ actor: 'agent', opId: 'agent:1', offset: 1, text: '~', base: kernel.frontiers(), kernel }));

  const cursors = kernel.activeSyncCursors();
  assert.deepEqual(cursors.map((active) => active.actor), ['agent', 'human'], 'one entry per actor, sorted');
  const human = cursors.find((active) => active.actor === 'human')!;
  const humanRows = kernel.journalEntries().filter((entry) => entry.type === 'commit' && entry.actor === 'human');
  assert.equal(human.seq, humanRows[humanRows.length - 1]!.seq, 'the cursor is the NEWEST row the actor was left holding');
  const agent = cursors.find((active) => active.actor === 'agent')!;
  const agentRows = kernel.journalEntries().filter((entry) => entry.type === 'commit' && entry.actor === 'agent');
  assert.equal(agent.seq, agentRows[agentRows.length - 1]!.seq, 'ditto the agent');
  assert.equal(cursors.length, 2, 'no third actor materializes');
});

test('tombstoneObligations: deletion rows AND dead-node payload rows, live components impose nothing', async () => {
  const kernel = seededKernel();
  const gate = new AdmissionGate(kernel);
  await gate.admit(treeOp({ actor: 'human', opId: 't:1', kind: 'insert', componentId: 'live-1', base: kernel.frontiers() }));
  await gate.admit(treeOp({ actor: 'human', opId: 't:2', kind: 'insert', componentId: 'dead-1', base: kernel.frontiers(), item: { tag: 'Dead' } }));
  await gate.admit(treeOp({ actor: 'human', opId: 't:3', kind: 'insert', componentId: 'dead-child', base: kernel.frontiers(), parentComponentId: 'dead-1' }));
  await gate.admit(treeOp({ actor: 'human', opId: 't:4', kind: 'remove', componentId: 'dead-1', base: kernel.frontiers() }));

  const obligations = kernel.tombstoneObligations();
  assert.ok(obligations.some((o) => o.componentId === 'dead-1' && o.kind === 'remove' && o.why === 'deletion-evidence'), 'the remove row itself is the deletion evidence');
  assert.ok(obligations.some((o) => o.componentId === 'dead-1' && o.kind === 'insert' && o.why === 'dead-node-payload'), 'the dead component\'s insert row carries the A8 fallback payload');
  assert.ok(obligations.some((o) => o.componentId === 'dead-child' && o.kind === 'insert' && o.why === 'dead-node-payload'), 'an INHERITED tombstone (deleted via its parent) counts — the identity high-water reads its payload');
  assert.equal(obligations.some((o) => o.componentId === 'live-1'), false, 'live components impose no obligation');
});

/* ── the guard: refusals ───────────────────────────────────────────────── */

test('guard REFUSES a tombstone-dropping compaction even with every cursor crossed (fail-safe outranks all)', async () => {
  const kernel = seededKernel();
  const gate = new AdmissionGate(kernel);
  await gate.admit(treeOp({ actor: 'human', opId: 't:1', kind: 'insert', componentId: 'dead-1', base: kernel.frontiers(), item: { tag: 'Dead' } }));
  await gate.admit(treeOp({ actor: 'human', opId: 't:2', kind: 'remove', componentId: 'dead-1', base: kernel.frontiers() }));

  const plan = { frontier: kernel.frontiers() }; // the LATEST frontier — the actor is fully crossed
  const decision = kernel.evaluateCompaction(plan);
  assert.equal(decision.activeCursors.length > 0, true);
  assert.equal(
    decision.activeCursors.every((active) => kernel.syncCursorResolvable(active.cursor)),
    true,
    'the actor\'s cursor resolves (crossed)',
  );
  assert.equal(decision.allowed, false);
  const tombstoneRefusals = decision.refusals.filter((r) => r.reason === 'tombstone-obligation');
  assert.ok(tombstoneRefusals.length > 0, 'the tombstone duty refuses the compaction');
  assert.ok(
    tombstoneRefusals.some((r) => r.detail.includes('dead-1') && r.detail.includes('remove')),
    `one refusal names the deletion row itself: ${tombstoneRefusals.map((r) => r.detail).join(' | ')}`,
  );
  assert.ok(
    tombstoneRefusals.some((r) => r.detail.includes('dead-1') && r.detail.includes('insert')),
    `one refusal names the dead-node payload row: ${tombstoneRefusals.map((r) => r.detail).join(' | ')}`,
  );
  assert.throws(() => kernel.requireCompactionAllowed(plan), (error: unknown) => {
    assert.ok(error instanceof CompactionRefusedError);
    assert.equal(error.decision.allowed, false);
    assert.ok(error.message.includes('tombstone-obligation'));
    return true;
  });
});

test('guard REFUSES while any active cursor has not crossed the compaction frontier', async () => {
  const kernel = seededKernel();
  const gate = new AdmissionGate(kernel);
  await gate.admit(textInsert({ actor: 'human', opId: 'human:1', offset: 3, text: '!', base: kernel.frontiers(), kernel }));
  await gate.admit(textInsert({ actor: 'agent', opId: 'agent:1', offset: 1, text: '~', base: kernel.frontiers(), kernel }));
  // the agent stops syncing HERE; the human keeps moving canonical ahead
  await gate.admit(textInsert({ actor: 'human', opId: 'human:2', offset: 4, text: '?', base: kernel.frontiers(), kernel }));

  const plan = { frontier: kernel.frontiers() };
  const decision = kernel.evaluateCompaction(plan);
  assert.equal(decision.allowed, false);
  const refusal = decision.refusals.find((r) => r.reason === 'lagging-cursor')!;
  assert.ok(refusal !== undefined);
  assert.ok(refusal.detail.includes('agent'), `the lagging actor is named: ${refusal.detail}`);
  assert.equal(decision.refusals.some((r) => r.reason === 'lagging-cursor' && r.detail.includes('human')), false, 'the crossed actor is not blamed');
});

test('guard REFUSES an unresolvable cursor (unknown/pruned frontier) — fail-safe, never a prune underneath it', async () => {
  // a journal row leaves an actor holding a cursor canonical cannot resolve
  // (shape-valid, frontier unknown) — exactly what a PREVIOUS compaction
  // would have produced for a stale client
  const store = new MemoryCollabStore();
  const ghostCursor: SyncCursor = { kind: 'frontier', value: [{ peer: '9999', counter: 7 }] };
  const ghostRow: RejectionJournalEntry = {
    type: 'rejection',
    seq: 1,
    serverAdmissionTime: 1,
    opId: 'ghost:1',
    actor: 'ghost',
    status: 409,
    code: 'stale-or-unknown-frontier',
    target: { componentId: 'a1', buffer: 'label' },
    frontier: [],
    syncCursor: ghostCursor,
  };
  store.appendJournal(ghostRow);
  const kernel = CollabKernel.open(store);
  kernel.ensureBuffer('a1', 'label', 'abc');

  const cursors = kernel.activeSyncCursors();
  assert.deepEqual(cursors.map((active) => active.actor), ['ghost']);
  assert.equal(kernel.syncCursorResolvable(ghostCursor), false, 'precondition: the cursor indeed cannot resolve');

  const decision = kernel.evaluateCompaction({ frontier: kernel.frontiers() });
  assert.equal(decision.allowed, false);
  assert.ok(decision.refusals.some((r) => r.reason === 'lagging-cursor' && r.detail.includes('cannot resolve')), 'unresolvable counts as lagging, fail-safe');
});

test('guard REFUSES a plan frontier canonical cannot address at all', async () => {
  const kernel = seededKernel();
  const gate = new AdmissionGate(kernel);
  await gate.admit(textInsert({ actor: 'human', opId: 'human:1', offset: 3, text: '!', base: kernel.frontiers(), kernel }));

  const decision = kernel.evaluateCompaction({ frontier: [{ peer: '424242', counter: 1 }] });
  assert.equal(decision.allowed, false);
  assert.equal(decision.refusals[0]!.reason, 'unknown-compaction-frontier');
});

/* ── the guard: allowances ─────────────────────────────────────────────── */

test('guard ALLOWS a compaction every active cursor dominates when no tombstone lives at-or-below (text-only history)', async () => {
  const kernel = seededKernel();
  const gate = new AdmissionGate(kernel);
  await gate.admit(textInsert({ actor: 'human', opId: 'human:1', offset: 3, text: '!', base: kernel.frontiers(), kernel }));
  const earlyFrontier = kernel.frontiers(); // a mid-stream prune line
  await gate.admit(textInsert({ actor: 'agent', opId: 'agent:1', offset: 1, text: '~', base: kernel.frontiers(), kernel }));
  await gate.admit(textInsert({ actor: 'human', opId: 'human:2', offset: 4, text: '?', base: kernel.frontiers(), kernel }));

  const decision = kernel.evaluateCompaction({ frontier: earlyFrontier });
  assert.deepEqual(decision.obligations, [], 'text-only history carries no tombstone duty');
  assert.deepEqual(decision.refusals, []);
  assert.equal(decision.allowed, true, 'both actors\' last cursors dominate the mid-stream frontier');
  kernel.requireCompactionAllowed({ frontier: earlyFrontier }); // the throwing form passes silently
});

test('guard ALLOWS a frontier chosen BEFORE the deletions — later tombstones sit above the prune line', async () => {
  const kernel = seededKernel();
  const gate = new AdmissionGate(kernel);
  await gate.admit(textInsert({ actor: 'human', opId: 'human:1', offset: 3, text: '!', base: kernel.frontiers(), kernel }));
  const beforeDeletions = kernel.frontiers();
  // the deletions happen AFTER the chosen prune line
  await gate.admit(treeOp({ actor: 'human', opId: 't:1', kind: 'insert', componentId: 'dead-1', base: kernel.frontiers(), item: { tag: 'Dead' } }));
  await gate.admit(treeOp({ actor: 'human', opId: 't:2', kind: 'remove', componentId: 'dead-1', base: kernel.frontiers() }));

  const decision = kernel.evaluateCompaction({ frontier: beforeDeletions });
  assert.equal(decision.obligations.length > 0, true, 'the obligations exist in the journal…');
  assert.equal(decision.allowed, true, '…but they all live ABOVE the prune line, and the actor crossed it');
  assert.deepEqual(decision.refusals, []);
});

test('guard decision is restart-stable: a recovered kernel enumerates and refuses identically', async () => {
  const store = new MemoryCollabStore();
  const kernel = CollabKernel.open(store);
  kernel.ensureBuffer('a1', 'label', 'abc');
  const gate = new AdmissionGate(kernel);
  await gate.admit(treeOp({ actor: 'human', opId: 't:1', kind: 'insert', componentId: 'dead-1', base: kernel.frontiers() }));
  await gate.admit(treeOp({ actor: 'human', opId: 't:2', kind: 'remove', componentId: 'dead-1', base: kernel.frontiers() }));
  const plan = { frontier: kernel.frontiers() };
  const before = kernel.evaluateCompaction(plan);

  const recovered = CollabKernel.open(store.clone());
  const after = recovered.evaluateCompaction(plan);
  assert.equal(after.allowed, false);
  assert.deepEqual(
    { allowed: after.allowed, refusals: after.refusals.map((r) => r.reason), obligations: after.obligations.map((o) => [o.seq, o.why]) },
    { allowed: before.allowed, refusals: before.refusals.map((r) => r.reason), obligations: before.obligations.map((o) => [o.seq, o.why]) },
    'journal-derived governance survives the restart byte-for-byte',
  );
});
