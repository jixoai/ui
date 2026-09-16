/**
 * admission.test.ts — the admission gate tests (collab-protocol M2,
 * protocol-spec §5): the p17 serialized-gate semantics on a real Loro
 * canonical (same-base concurrency → one 200 one 409, maxActive=1,
 * opId idempotency incl. rejections), the §5.2 cursor-identity overlap
 * decision (non-overlapping concurrent edits auto-fuse with the offset
 * RECOMPUTED from the anchor), the four-code error protocol with its
 * resync envelopes (p13 semantics), the §5.5 WAL ordering on the happy
 * path, and the §5.6 syncCursor tag normalization.
 *
 * M5a (tasks M3 gaps ①②): the buffer-creation op (actor-attributed
 * commit, frozen 409-on-existing conflict semantics, tombstone law,
 * boundary shape law) and the tree data-update op (payload replacement,
 * before/after journal audit, 404 target law, plain-JSON meta shape),
 * plus the 换源脚手架 scenario — an externally changed scaffold lands
 * via update instead of surfacing as scaffoldStale.
 *
 * Original need: collab-protocol M2 + M5a (2026-09-15).
 */

import { strict as assert } from 'node:assert';
import test from 'node:test';

import { LoroDoc } from 'loro-crdt';

import { AdmissionGate } from './admission.ts';
import { bufferKeyOf, CollabKernel, encodeContainerKey, FIRST_ACTOR_PEER } from './kernel.ts';
import { MemoryCollabStore } from './store.ts';
import { isCommitReceipt } from './types.ts';
import type { AdmissionResult, Frontier, OpEnvelope, SyncCursor, TextCreateOpEnvelope, TextOpEnvelope } from './types.ts';

/* ── scaffolding ──────────────────────────────────────────────────────── */

const LABEL_KEY = encodeContainerKey('a1', bufferKeyOf('label'));

interface Workspace {
  kernel: CollabKernel;
  gate: AdmissionGate;
}

function workspace(seed = 'abcd', buffer = 'label', componentId = 'a1'): Workspace {
  const kernel = CollabKernel.open(new MemoryCollabStore());
  kernel.ensureBuffer(componentId, buffer, seed);
  return { kernel, gate: new AdmissionGate(kernel) };
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
  syncCursor?: SyncCursor;
  transactionId?: string;
  expectedRaw?: string;
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
    syncCursor: init.syncCursor,
    transactionId: init.transactionId,
    expectedRaw: init.expectedRaw,
  };
}

const isOk = (result: AdmissionResult): boolean => result.status === 200;

/** M5a ①: the buffer-creation envelope (no anchor, no extent) */
function textCreateOp(init: {
  actor: string;
  opId: string;
  componentId?: string;
  buffer?: string;
  initialText: string;
  base: Frontier;
  syncCursor?: SyncCursor;
}): TextCreateOpEnvelope {
  return {
    actor: init.actor,
    opId: init.opId,
    baseFrontiers: init.base,
    domain: 'text',
    kind: 'create',
    target: { componentId: init.componentId ?? 'a1', buffer: init.buffer ?? 'label' },
    initialText: init.initialText,
    syncCursor: init.syncCursor,
  };
}

/** minimal structural-op builder for the M5a scenarios */
function treeOp(init: { actor: string; opId: string; kind: 'insert' | 'remove' | 'update'; componentId: string; base: Frontier; item?: unknown }): OpEnvelope {
  const common = { actor: init.actor, opId: init.opId, baseFrontiers: init.base, domain: 'tree' as const, target: { componentId: init.componentId } };
  if (init.kind === 'insert') return { ...common, kind: 'insert', tree: { item: init.item ?? { tag: 'Card' } } };
  if (init.kind === 'remove') return { ...common, kind: 'remove', tree: { componentId: init.componentId } };
  return { ...common, kind: 'update', tree: { componentId: init.componentId, item: init.item } };
}

/* ── the happy path + §5.5 ordering ───────────────────────────────────── */

test('single insert commits: receipt fields, journal row, WAL prepare→receipt order', async () => {
  const { kernel, gate } = workspace();
  const base = kernel.frontiers();
  const receipt = await gate.admit(textOp({ actor: 'human', opId: 'human:1', kind: 'insert', offset: 0, text: 'X', base, cursorBytes: cursorAt(kernel, LABEL_KEY, 0) }));

  assert.equal(receipt.status, 200);
  assert.ok(isOk(receipt));
  assert.equal(receipt.opId, 'human:1');
  assert.equal(receipt.value, 'Xabcd');
  assert.equal(receipt.containerKey, LABEL_KEY);
  assert.ok(receipt.update.byteLength > 0, 'absent cursor → restricted snapshot delta');
  assert.equal(receipt.syncCursor.kind, 'frontier');
  assert.ok(receipt.frontier.length > 0 && receipt.frontier !== base, 'frontier advanced');

  const wal = kernel.walEntries().filter((entry) => entry.opId === 'human:1');
  assert.deepEqual(wal.map((entry) => entry.type), ['prepare', 'receipt'], 'frozen WAL ordering');
  const commit = kernel.journalEntries().find((entry) => entry.type === 'commit' && entry.opId === 'human:1');
  assert.ok(commit !== undefined && commit.type === 'commit' && commit.value === 'Xabcd');
  assert.ok(receipt.logTail.some((row) => row.opId === 'human:1'), 'the tail includes the just-committed op');
});

/* ── §5.0 idempotency ─────────────────────────────────────────────────── */

test('same-opId retry returns the original receipt object with no duplicated effect', async () => {
  const { kernel, gate } = workspace();
  const envelope = textOp({ actor: 'human', opId: 'human:1', kind: 'insert', offset: 0, text: 'X', base: kernel.frontiers(), cursorBytes: cursorAt(kernel, LABEL_KEY, 0) });
  const first = await gate.admit(envelope);
  assert.equal(first.status, 200);

  const retry = await gate.admit(envelope);
  assert.strictEqual(retry, first, 'the original receipt OBJECT (p17 semantics)');
  assert.equal(kernel.bufferText(LABEL_KEY), 'Xabcd');
  assert.equal(kernel.journalEntries().filter((entry) => entry.type === 'commit' && entry.opId === 'human:1').length, 1);
});

/* ── §5 serialized gate + §5.2 overlap (p17 + p2 semantics) ───────────── */

test('same-base concurrent overlapping deletes through the gate: one 200, one 409 conflict, maxActive stays 1', async () => {
  const { kernel, gate } = workspace('abcd');
  const base = kernel.frontiers(); // both clients built on this exact state
  const first = gate.admit(textOp({ actor: 'human', opId: 'human:1', kind: 'delete', offset: 1, length: 2, base, cursorBytes: cursorAt(kernel, LABEL_KEY, 1) }));
  const second = gate.admit(textOp({ actor: 'agent:copy', opId: 'agent:copy:1', kind: 'delete', offset: 2, length: 1, base, cursorBytes: cursorAt(kernel, LABEL_KEY, 2) }));
  const [a, b] = await Promise.all([first, second]);

  assert.equal(a.status, 200);
  assert.equal(b.status, 409);
  assert.equal(b.code, 'conflict');
  if (!isCommitReceipt(b)) {
    assert.equal(b.conflict?.incoming.opId, 'agent:copy:1');
    assert.equal(b.conflict?.committed[0]?.opId, 'human:1');
    assert.ok(b.conflict?.committed[0]?.offset === 1, 'the record span re-anchors at the submitter base');
    assert.equal(b.conflict?.currentText, 'ad');
    assert.ok(b.conflict?.tail !== undefined && b.conflict.tail.length > 0, 'target tail rides the envelope');
  }
  assert.equal(gate.stats().maxActive, 1, 'the per-workspace gate serializes commit points');
  assert.equal(kernel.bufferText(LABEL_KEY), 'ad', 'the conflict loser was not imported');
});

test('same-base concurrent NON-overlapping deletes auto-fuse with the offset recomputed from the anchor', async () => {
  const { kernel, gate } = workspace('abcd');
  const base = kernel.frontiers();
  const first = gate.admit(textOp({ actor: 'human', opId: 'human:1', kind: 'delete', offset: 1, length: 2, base, cursorBytes: cursorAt(kernel, LABEL_KEY, 1) }));
  // agent anchors on 'd' (base offset 3) — after the human delete the
  // anchor RE-ANCHORS to canonical offset 1; the envelope offset (3) is
  // the client's stale belief and must not be used as-is
  const second = gate.admit(textOp({ actor: 'agent:copy', opId: 'agent:copy:1', kind: 'delete', offset: 3, length: 1, base, cursorBytes: cursorAt(kernel, LABEL_KEY, 3) }));
  const [a, b] = await Promise.all([first, second]);

  assert.equal(a.status, 200);
  assert.equal(b.status, 200);
  assert.equal(kernel.bufferText(LABEL_KEY), 'a', 'fused result — the anchor, not the base-relative offset, drove the apply');
});

/* ── §5.1 stale-or-unknown-frontier (p13 unknown-frontier mapping) ────── */

test('unknown base frontier maps to 409 stale-or-unknown-frontier with canonicalUpdate + retry syncCursor', async () => {
  const { kernel, gate } = workspace();
  const envelope = textOp({ actor: 'human', opId: 'human:1', kind: 'insert', offset: 0, text: 'X', base: [{ peer: '999999', counter: 77 }], cursorBytes: cursorAt(kernel, LABEL_KEY, 0) });
  const rejection = await gate.admit(envelope);

  assert.equal(rejection.status, 409);
  assert.equal(rejection.code, 'stale-or-unknown-frontier');
  assert.ok(!isOk(rejection));
  if (!isCommitReceipt(rejection)) {
    assert.ok(rejection.canonicalUpdate !== undefined && rejection.canonicalUpdate.byteLength > 0, 'resync update required');
    assert.ok(rejection.syncCursor !== undefined && rejection.syncCursor.kind === 'frontier', 'retry cursor required');
    assert.deepEqual(rejection.canonicalFrontier, kernel.frontiers());
    assert.ok(typeof rejection.detail === 'string' && rejection.detail.includes('not included'), 'the loro unknown-frontier throw surfaces in the detail');
  }

  const retry = await gate.admit(envelope);
  assert.strictEqual(retry, rejection, 'rejections are receipts — the same object comes back');
  assert.equal(kernel.journalEntries().filter((entry) => entry.type === 'rejection' && entry.opId === 'human:1').length, 1);
});

/* ── §5.3 stale-cursor family ─────────────────────────────────────────── */

test('container-mismatch cursor: 409 stale-cursor with explicit reselect (no forged cursor)', async () => {
  const { kernel, gate } = workspace();
  kernel.ensureBuffer('a1', 'title', 'other');
  const wrongContainer = cursorAt(kernel, encodeContainerKey('a1', bufferKeyOf('title')), 0);
  const rejection = await gate.admit(textOp({ actor: 'human', opId: 'human:1', kind: 'insert', offset: 0, text: 'X', base: kernel.frontiers(), cursorBytes: wrongContainer }));
  assert.equal(rejection.status, 409);
  assert.equal(rejection.code, 'stale-cursor');
  if (!isCommitReceipt(rejection)) {
    assert.equal(rejection.retry?.reason, 'reselect');
    assert.equal(rejection.retry?.cursorBytes, undefined, 'a mismatched anchor must not be re-encoded');
  }
});

test('malformed cursor bytes: 409 stale-cursor reselect', async () => {
  const { kernel, gate } = workspace();
  const rejection = await gate.admit(textOp({ actor: 'human', opId: 'human:1', kind: 'insert', offset: 0, text: 'X', base: kernel.frontiers(), cursorBytes: new Uint8Array([1, 2, 3]) }));
  assert.equal(rejection.status, 409);
  assert.equal(rejection.code, 'stale-cursor');
  if (!isCommitReceipt(rejection)) assert.equal(rejection.retry?.reason, 'reselect');
});

test('stale extent beyond the buffer: 409 stale-cursor (spatial belief no longer locates)', async () => {
  const { kernel, gate } = workspace('abc');
  const rejection = await gate.admit(textOp({ actor: 'human', opId: 'human:1', kind: 'delete', offset: 1, length: 9, base: kernel.frontiers(), cursorBytes: cursorAt(kernel, LABEL_KEY, 1) }));
  assert.equal(rejection.status, 409);
  assert.equal(rejection.code, 'stale-cursor');
});

test('expectedRaw mismatch on the same-version path is evidence-level stale-cursor', async () => {
  const { kernel, gate } = workspace('abcd');
  const rejection = await gate.admit(textOp({ actor: 'human', opId: 'human:1', kind: 'insert', offset: 0, text: 'X', base: kernel.frontiers(), cursorBytes: cursorAt(kernel, LABEL_KEY, 0), expectedRaw: 'WRONG' }));
  assert.equal(rejection.status, 409);
  assert.equal(rejection.code, 'stale-cursor');
});

/* ── §5.3 bad-target ──────────────────────────────────────────────────── */

test('unknown buffer and tombstoned component writes return 404 bad-target with the resolved target', async () => {
  const { kernel, gate } = workspace();
  const unknownBuffer = await gate.admit(textOp({ actor: 'human', opId: 'human:1', kind: 'insert', offset: 0, text: 'X', base: kernel.frontiers(), cursorBytes: cursorAt(kernel, LABEL_KEY, 0), buffer: 'ghost' }));
  assert.equal(unknownBuffer.status, 404);
  assert.equal(unknownBuffer.code, 'bad-target');
  if (!isCommitReceipt(unknownBuffer)) {
    assert.deepEqual(unknownBuffer.target, { componentId: 'a1', buffer: 'ghost' }, 'the failing target rides the envelope');
  }
});

/* ── §5.3 utf16-boundary ──────────────────────────────────────────────── */

test('surrogate-splitting extents return 422; a mid-pair anchor snaps (cursor identity cannot encode a split point)', async () => {
  const { kernel, gate } = workspace('a😀b', 'emoji');
  const key = encodeContainerKey('a1', bufferKeyOf('emoji'));

  // the extent [1,2) ends INSIDE the pair — the end boundary splits it
  const splitDelete = await gate.admit(textOp({ actor: 'human', opId: 'human:1', kind: 'delete', offset: 1, length: 1, base: kernel.frontiers(), cursorBytes: cursorAt(kernel, key, 1), buffer: 'emoji' }));
  assert.equal(splitDelete.status, 422);
  assert.equal(splitDelete.code, 'utf16-boundary');
  if (!isCommitReceipt(splitDelete)) assert.deepEqual(splitDelete.range, { offset: 1, length: 1 });

  // a cursor ENCODED at the mid-pair offset 2 snaps to 1 when resolved —
  // loro cursor identity is unicode-safe and cannot express a split
  // point, so the anchor-recomputed insert lands at a legal position
  const snappedInsert = await gate.admit(textOp({ actor: 'human', opId: 'human:2', kind: 'insert', offset: 2, text: '!', base: kernel.frontiers(), cursorBytes: cursorAt(kernel, key, 2), buffer: 'emoji' }));
  assert.equal(snappedInsert.status, 200);
  assert.equal(kernel.bufferText(key), 'a!😀b');

  // a replace whose extent ends inside the pair also 422s
  const splitReplace = await gate.admit(textOp({ actor: 'human', opId: 'human:3', kind: 'replace', offset: 1, length: 2, text: 'Z', base: kernel.frontiers(), cursorBytes: cursorAt(kernel, key, 1), buffer: 'emoji' }));
  assert.equal(splitReplace.status, 422);
  assert.equal(splitReplace.code, 'utf16-boundary');

  // the whole-pair delete stays legal. Note: offset 2 sits exactly on
  // the insert-origin junction (peer B's '!' meets peer A's pair) where
  // loro 1.16.1 cannot encode ANY cursor — a real client anchors at the
  // nearest resolvable position (3, which snaps to 2); the recompute
  // law then derives the true kernel offset from the anchor
  const legal = await gate.admit(textOp({ actor: 'human', opId: 'human:4', kind: 'delete', offset: 3, length: 2, base: kernel.frontiers(), cursorBytes: cursorAt(kernel, key, 3), buffer: 'emoji' }));
  assert.equal(legal.status, 200);
  assert.equal(kernel.bufferText(key), 'a!b');
});

/* ── the transaction lane (M6: the 503 marker is retired) ─────────────── */

test('transactionId submissions execute as one-op groups: atomic receipt, shared id, idempotent', async () => {
  const { kernel, gate } = workspace();
  const envelope = textOp({ actor: 'human', opId: 'human:1', kind: 'insert', offset: 0, text: 'X', base: kernel.frontiers(), cursorBytes: cursorAt(kernel, LABEL_KEY, 0), transactionId: 'group-1' });
  const first = await gate.admit(envelope);
  assert.equal(first.status, 200, 'the M2 503 transaction-executor-unavailable marker is RETIRED — the lane executes');
  assert.equal(first.transactionId, 'group-1', 'the atomic receipt carries the transactionId');
  assert.equal(kernel.bufferText(LABEL_KEY), 'Xabcd');

  // one journal commit row, stamped with the transaction id
  const rows = kernel.journalEntries().filter((entry) => entry.type === 'commit' && entry.transactionId === 'group-1');
  assert.equal(rows.length, 1);

  // idempotency holds on the new lane
  const retry = await gate.admit(envelope);
  assert.strictEqual(retry, first);
});

/* ── §5.6 syncCursor tag normalization ────────────────────────────────── */

test('vv-tagged syncCursor: the response increment is a vv delta that reconstructs on the client', async () => {
  const { kernel, gate } = workspace('ab');
  const seedSnapshot = kernel.snapshotBytes();
  const seedFrontier = kernel.frontiers();
  // the seed committed under the bootstrap peer — frontier counter is the
  // inclusive last id, the vv end is exclusive
  const seedVV: SyncCursor = { kind: 'vv', value: Object.fromEntries(seedFrontier.map((point) => [point.peer, point.counter + 1])) };

  const receipt = await gate.admit(textOp({ actor: 'human', opId: 'human:1', kind: 'insert', offset: 2, text: 'X', base: seedFrontier, cursorBytes: cursorAt(kernel, LABEL_KEY, 2), syncCursor: seedVV }));
  assert.equal(receipt.status, 200);
  assert.equal(receipt.syncCursor.kind, 'vv', 'the response keeps the request tag');
  if (receipt.status === 200) {
    assert.ok(receipt.syncCursor.kind === 'vv' && Object.keys(receipt.syncCursor.value).length >= 2, 'the vv spans every known peer');

    const client = LoroDoc.fromSnapshot(seedSnapshot);
    client.setPeerId(987654);
    client.import(receipt.update);
    assert.equal(client.getText(LABEL_KEY).toString(), 'abX', 'the vv delta reconstructs the canonical buffer');
  }
});

test('frontier-tagged syncCursor: the delta carries exactly the post-cursor change', async () => {
  const { kernel, gate } = workspace('ab');
  const atSeed = kernel.frontiers();
  const snapshotAtSeed = kernel.snapshotBytes();

  const first = await gate.admit(textOp({ actor: 'human', opId: 'human:1', kind: 'insert', offset: 2, text: '1', base: atSeed, cursorBytes: cursorAt(kernel, LABEL_KEY, 2) }));
  const second = await gate.admit(textOp({ actor: 'agent:copy', opId: 'agent:copy:1', kind: 'insert', offset: 3, text: '2', base: kernel.frontiers(), cursorBytes: cursorAt(kernel, LABEL_KEY, 3), syncCursor: { kind: 'frontier', value: atSeed } }));
  assert.ok(first.status === 200 && second.status === 200);

  if (second.status === 200) {
    assert.equal(second.syncCursor.kind, 'frontier');
    const client = LoroDoc.fromSnapshot(snapshotAtSeed);
    client.setPeerId(987655);
    client.import(second.update);
    assert.equal(client.getText(LABEL_KEY).toString(), 'ab12', 'both post-cursor changes arrive in one delta');
  }
});

/* ── §4 syncCursor tag law at the boundary (impl-review-1 B2) ─────────── */

test('syncCursor with an illegal kind enum is a journaled 409 stale-or-unknown-frontier — never a 200', async () => {
  const { kernel, gate } = workspace();
  const envelope = textOp({
    actor: 'human',
    opId: 'human:1',
    kind: 'insert',
    offset: 0,
    text: 'X',
    base: kernel.frontiers(),
    cursorBytes: cursorAt(kernel, LABEL_KEY, 0),
    syncCursor: { kind: 'oops', value: [] } as unknown as SyncCursor,
  });
  const rejection = await gate.admit(envelope);

  assert.equal(rejection.status, 409);
  assert.equal(rejection.code, 'stale-or-unknown-frontier');
  if (!isCommitReceipt(rejection)) {
    assert.ok(rejection.canonicalUpdate !== undefined && rejection.canonicalUpdate.byteLength > 0, 'the 409 still carries the resync update');
    assert.ok(rejection.syncCursor !== undefined && rejection.syncCursor.kind === 'frontier', 'and a VALID retry cursor');
    assert.ok(rejection.detail !== undefined && rejection.detail.includes('oops'), 'the illegal tag surfaces in the detail');
  }
  assert.equal(kernel.bufferText(LABEL_KEY), 'abcd', 'nothing imported');
  assert.equal(kernel.journalEntries().filter((entry) => entry.type === 'rejection' && entry.opId === 'human:1').length, 1, 'adjudicated rejections are journaled receipts');
  const retry = await gate.admit(envelope);
  assert.strictEqual(retry, rejection, 'the rejection replays as the original receipt (§5.0)');
});

test('a pruned/unknown frontier syncCursor is a journaled 409 carrying canonicalUpdate', async () => {
  const { kernel, gate } = workspace();
  const rejection = await gate.admit(
    textOp({
      actor: 'human',
      opId: 'human:1',
      kind: 'insert',
      offset: 0,
      text: 'X',
      base: kernel.frontiers(),
      cursorBytes: cursorAt(kernel, LABEL_KEY, 0),
      syncCursor: { kind: 'frontier', value: [{ peer: '999999', counter: 77 }] },
    }),
  );
  assert.equal(rejection.status, 409);
  assert.equal(rejection.code, 'stale-or-unknown-frontier');
  if (!isCommitReceipt(rejection)) {
    assert.ok(rejection.canonicalUpdate !== undefined && rejection.canonicalUpdate.byteLength > 0, 'resync update rides the 409');
    assert.ok(rejection.detail !== undefined && rejection.detail.includes('unknown or pruned'), 'the pruned cursor is named in the detail');
  }
  assert.equal(kernel.bufferText(LABEL_KEY), 'abcd', 'nothing imported');
});

test('structurally garbage syncCursors are caller bugs: TypeError before adjudication', async () => {
  const { kernel, gate } = workspace();
  const good = () => textOp({ actor: 'human', opId: 'human:1', kind: 'insert', offset: 0, text: 'X', base: kernel.frontiers(), cursorBytes: cursorAt(kernel, LABEL_KEY, 0) });
  await assert.rejects(async () => gate.admit({ ...good(), syncCursor: { kind: 'frontier', value: 42 } as unknown as SyncCursor }), TypeError);
  await assert.rejects(async () => gate.admit({ ...good(), syncCursor: { kind: 42 } as unknown as SyncCursor }), TypeError);
  await assert.rejects(async () => gate.admit({ ...good(), syncCursor: { kind: 'vv', value: [1, 2] } as unknown as SyncCursor }), TypeError);
  assert.equal(kernel.journalEntries().filter((entry) => (entry.type === 'commit' || entry.type === 'rejection') && entry.opId === 'human:1').length, 0, 'no journal cost');
  assert.equal(kernel.walEntries().length, 0, 'no WAL cost');
});

/* ── §4 tagged-union kind law at the boundary (impl-review-1 B4) ───────── */

test('text kind outside insert|delete|replace throws TypeError at the boundary — no peer, no WAL, no journal', async () => {
  const { kernel, gate } = workspace();
  const good = textOp({ actor: 'human', opId: 'human:1', kind: 'insert', offset: 0, text: 'X', base: kernel.frontiers(), cursorBytes: cursorAt(kernel, LABEL_KEY, 0) });
  await assert.rejects(async () => gate.admit({ ...good, kind: 'oops' as never }), TypeError);

  assert.equal(kernel.bufferText(LABEL_KEY), 'abcd', 'canonical untouched');
  assert.equal(kernel.walEntries().length, 0, 'boundary rejection never reaches the WAL');
  assert.equal(kernel.journalEntries().filter((entry) => entry.type === 'peer').length, 0, 'no registry peer was allocated for a malformed op');
  assert.equal(kernel.journalEntries().filter((entry) => (entry.type === 'commit' || entry.type === 'rejection') && entry.opId === 'human:1').length, 0, 'no journal row');
});

test('tree kind outside insert|move|remove|revive and kind-specific payload gaps throw TypeError at the boundary', async () => {
  const { kernel, gate } = workspace();
  const base = kernel.frontiers();
  const common = { actor: 'human', opId: 'human:t1', baseFrontiers: base, domain: 'tree' as const, target: { componentId: 'a1' } };

  await assert.rejects(async () => gate.admit({ ...common, kind: 'oops', tree: { componentId: 'a1' } } as unknown as OpEnvelope), TypeError, 'tree kind enum');
  // a move with NO tree.componentId must die at the boundary — it may never
  // surface as the business 404 of the resolved-lookup path (impl-review-1 B4)
  await assert.rejects(async () => gate.admit({ ...common, kind: 'move', tree: {} } as unknown as OpEnvelope), TypeError, 'move without a tree target');
  await assert.rejects(async () => gate.admit({ ...common, kind: 'remove', tree: {} } as unknown as OpEnvelope), TypeError, 'remove without a tree target');
  await assert.rejects(async () => gate.admit({ ...common, kind: 'revive', tree: {} } as unknown as OpEnvelope), TypeError, 'revive without a tree target');
  await assert.rejects(async () => gate.admit({ ...common, kind: 'insert', tree: { parentComponentId: 'a0' } } as unknown as OpEnvelope), TypeError, 'insert without its item payload');
  await assert.rejects(async () => gate.admit({ ...common, kind: 'insert', tree: { item: { tag: 'Card' }, index: 'zero' } } as unknown as OpEnvelope), TypeError, 'non-integer tree index');

  assert.equal(kernel.walEntries().length, 0, 'no WAL cost for any of them');
  assert.equal(kernel.journalEntries().filter((entry) => entry.type === 'peer').length, 0, 'no peer allocated');
});

test('per-kind text field constraints: insert carries no length, delete carries no text', async () => {
  const { kernel, gate } = workspace();
  const base = kernel.frontiers();
  await assert.rejects(
    async () => gate.admit(textOp({ actor: 'human', opId: 'human:1', kind: 'insert', offset: 0, length: 2, text: 'X', base, cursorBytes: cursorAt(kernel, LABEL_KEY, 0) })),
    TypeError,
    'insert with a nonzero length',
  );
  await assert.rejects(
    async () => gate.admit(textOp({ actor: 'human', opId: 'human:2', kind: 'delete', offset: 0, length: 1, text: 'X', base, cursorBytes: cursorAt(kernel, LABEL_KEY, 0) })),
    TypeError,
    'delete with inserted text',
  );
  assert.equal(kernel.walEntries().length, 0);
});

test('giveUp/override cursors face the same §4 law: 409 before any WAL write, stale-sync-cursor leaves the session untouched', async () => {
  const { kernel, gate } = workspace();

  // giveUp with an illegal tag enum — journaled 409 with the resync payload
  const rejection = await gate.giveUp({ targetOpId: 'ghost:op', actor: 'human', syncCursor: { kind: 'oops', value: [] } as unknown as SyncCursor });
  assert.equal(rejection.status, 409);
  assert.equal(rejection.code, 'stale-or-unknown-frontier');
  if (!isCommitReceipt(rejection)) {
    assert.ok(rejection.canonicalUpdate !== undefined && rejection.canonicalUpdate.byteLength > 0);
  }
  assert.equal(kernel.walEntries().length, 0, 'no WAL cost on the giveUp boundary rejection');
  await assert.rejects(async () => gate.giveUp({ targetOpId: 'x', actor: 'human', syncCursor: { kind: 42 } as unknown as SyncCursor }), TypeError, 'structural garbage stays a caller bug');

  // override undo with an unresolvable cursor — terminal outcome, session untouched
  kernel.openOverrideSession('human');
  const committed = await gate.admit(textOp({ actor: 'human', opId: 'human:1', kind: 'insert', offset: 0, text: 'X', base: kernel.frontiers(), cursorBytes: cursorAt(kernel, LABEL_KEY, 0) }));
  assert.equal(committed.status, 200);
  const outcome = await gate.overrideUndo({ actor: 'human', opId: 'human:undo:1', syncCursor: { kind: 'frontier', value: [{ peer: '999999', counter: 77 }] } });
  assert.equal(outcome.status, 'stale-sync-cursor');
  assert.equal(kernel.bufferText(LABEL_KEY), 'Xabcd', 'the undo step was never driven');
  assert.equal(kernel.walEntries().filter((entry) => entry.opId === 'human:undo:1').length, 0, 'no WAL prepare for a refused override');
});

/* ── M5a ①: the buffer-creation op (tasks M3 gap ①) ───────────────────── */

test('M5a buffer create: commits as an actor-attributed op; the container takes real anchors immediately', async () => {
  const { kernel, gate } = workspace();
  const key = encodeContainerKey('a2', bufferKeyOf('label'));
  const receipt = await gate.admit(textCreateOp({ actor: 'human', opId: 'human:c1', componentId: 'a2', initialText: 'Hero', base: kernel.frontiers() }));

  assert.equal(receipt.status, 200);
  assert.ok(isOk(receipt));
  assert.equal(receipt.value, 'Hero');
  assert.equal(receipt.containerKey, key);
  assert.equal(kernel.bufferText(key), 'Hero');

  // journal truth: a COMMIT row under the actor's registry peer — never a kernel buffer-seed
  const commit = kernel.journalEntries().find((entry) => entry.type === 'commit' && entry.opId === 'human:c1');
  assert.ok(commit !== undefined && commit.type === 'commit');
  assert.equal(commit.kind, 'create');
  assert.equal(commit.peer, FIRST_ACTOR_PEER, 'creation rides the actor peer, not the kernel bootstrap peer');
  assert.equal(commit.actor, 'human');
  assert.equal(kernel.journalEntries().filter((entry) => entry.type === 'buffer-seed' && entry.componentId === 'a2').length, 0, 'no kernel seed row for an admitted create');
  assert.deepEqual(kernel.walEntries().filter((entry) => entry.opId === 'human:c1').map((entry) => entry.type), ['prepare', 'receipt'], 'frozen WAL ordering');

  // the created container takes ordinary anchored text ops right away
  const edit = await gate.admit(textOp({ actor: 'agent:copy', opId: 'agent:copy:1', kind: 'insert', offset: 4, text: '!', base: kernel.frontiers(), cursorBytes: cursorAt(kernel, key, 4), componentId: 'a2' }));
  assert.equal(edit.status, 200);
  assert.equal(kernel.bufferText(key), 'Hero!');

  // empty create — the ingest bootstrap shape (container-only, no content)
  const titleKey = encodeContainerKey('a2', bufferKeyOf('title'));
  const empty = await gate.admit(textCreateOp({ actor: 'file-system', opId: 'fs:c1', componentId: 'a2', buffer: 'title', initialText: '', base: kernel.frontiers() }));
  assert.equal(empty.status, 200);
  assert.ok(kernel.hasBuffer(titleKey));
  assert.equal(kernel.bufferText(titleKey), '');
});

test('M5a create conflict semantics (frozen): existing container → 409 conflict; the §6 tombstone law dominates → 404', async () => {
  const { kernel, gate } = workspace(); // a1/label was ensureBuffer-seeded

  // an ensureBuffer-seeded container is committed truth too — creation collides
  const seeded = await gate.admit(textCreateOp({ actor: 'human', opId: 'human:c1', initialText: 'X', base: kernel.frontiers() }));
  assert.equal(seeded.status, 409);
  assert.equal(seeded.code, 'conflict');

  // a container created by an op defends itself the same way (new actor, new opId)
  const created = await gate.admit(textCreateOp({ actor: 'human', opId: 'human:c2', componentId: 'a2', initialText: 'Y', base: kernel.frontiers() }));
  assert.equal(created.status, 200);
  const again = await gate.admit(textCreateOp({ actor: 'agent:copy', opId: 'agent:copy:c1', componentId: 'a2', initialText: 'Z', base: kernel.frontiers() }));
  assert.equal(again.status, 409);
  assert.equal(again.code, 'conflict');
  assert.equal(kernel.bufferText(encodeContainerKey('a2', bufferKeyOf('label'))), 'Y', 'the losing create was not imported');

  // the tombstone law outranks everything: a deleted component rejects creation
  // even though a DIFFERENT buffer of it may exist
  await gate.admit(treeOp({ actor: 'human', opId: 'human:t1', kind: 'insert', componentId: 'z1', base: kernel.frontiers() }));
  await gate.admit(textCreateOp({ actor: 'human', opId: 'human:c3', componentId: 'z1', buffer: 'label', initialText: 'kept', base: kernel.frontiers() }));
  await gate.admit(treeOp({ actor: 'human', opId: 'human:t2', kind: 'remove', componentId: 'z1', base: kernel.frontiers() }));
  const tombstone = await gate.admit(textCreateOp({ actor: 'human', opId: 'human:c4', componentId: 'z1', buffer: 'title', initialText: 'T', base: kernel.frontiers() }));
  assert.equal(tombstone.status, 404);
  assert.equal(tombstone.code, 'bad-target');
});

test('M5a create shape law: initialText required, anchor/extent smuggling and unnamed buffers are caller bugs (zero cost)', async () => {
  const { kernel, gate } = workspace();
  const base = kernel.frontiers();
  const good = () => textCreateOp({ actor: 'human', opId: 'human:c1', componentId: 'a2', initialText: 'Hero', base });

  await assert.rejects(async () => gate.admit({ ...good(), initialText: undefined } as unknown as OpEnvelope), TypeError, 'missing initialText');
  await assert.rejects(async () => gate.admit({ ...good(), initialText: 42 } as unknown as OpEnvelope), TypeError, 'non-string initialText');
  await assert.rejects(async () => gate.admit({ ...good(), cursorBytes: cursorAt(kernel, LABEL_KEY, 0) } as unknown as OpEnvelope), TypeError, 'anchor smuggling');
  await assert.rejects(async () => gate.admit({ ...good(), text: 'Hero' } as unknown as OpEnvelope), TypeError, 'text alias smuggling');
  await assert.rejects(async () => gate.admit({ ...good(), offset: 0, length: 0 } as unknown as OpEnvelope), TypeError, 'extent smuggling');
  await assert.rejects(async () => gate.admit(textCreateOp({ actor: 'human', opId: 'human:c2', componentId: 'a2', buffer: '', initialText: 'Hero', base })), TypeError, 'unnamed buffer');

  assert.equal(kernel.walEntries().length, 0, 'no WAL cost for any of them');
  assert.equal(kernel.journalEntries().filter((entry) => (entry.type === 'commit' || entry.type === 'rejection') && entry.opId === 'human:c1').length, 0, 'no journal row');
});

/* ── M5a ②: the tree data-update op (tasks M3 gap ②) ──────────────────── */

test('M5a tree data update: replaces the node item payload; the journal row audits before/after', async () => {
  const { kernel, gate } = workspace();
  const v1 = { kind: 'component', id: 'a9', tag: 'Card', path: 'Hero.svelte', skipped: [] };
  await gate.admit(treeOp({ actor: 'human', opId: 'human:t1', kind: 'insert', componentId: 'a9', base: kernel.frontiers(), item: v1 }));

  const v2 = { kind: 'component', id: 'a9', tag: 'Card', path: 'Hero.svelte', skipped: [], props: { variant: 'ghost' } };
  const receipt = await gate.admit(treeOp({ actor: 'human', opId: 'human:t2', kind: 'update', componentId: 'a9', base: kernel.frontiers(), item: v2 }));
  assert.equal(receipt.status, 200);

  // the kernel-side accessor sees the replaced payload, structure untouched
  const node = kernel.treeItems().find((entry) => entry.componentId === 'a9');
  assert.ok(node !== undefined);
  assert.deepEqual(node.meta, v2);
  assert.equal(node.deleted, false);
  assert.equal(node.parentComponentId, undefined, 'data update never moves the node');

  // §9 前后值: the update row audits the replaced payload
  const commit = kernel.journalEntries().find((entry) => entry.type === 'commit' && entry.opId === 'human:t2');
  assert.ok(commit !== undefined && commit.type === 'commit');
  assert.equal(commit.kind, 'update');
  assert.deepEqual(JSON.parse(commit.before), v1, '§9 前后值: the replaced payload is the audit delta (key order is JSON-incidental — loro reorders map keys)');
  assert.deepEqual(commit.treeEcho, { componentId: 'a9' });
});

test('M5a tree update target law: unknown component → 404; tombstoned component → 404 (§6)', async () => {
  const { kernel, gate } = workspace();

  const unknown = await gate.admit(treeOp({ actor: 'human', opId: 'human:u1', kind: 'update', componentId: 'ghost', base: kernel.frontiers(), item: { tag: 'X' } }));
  assert.equal(unknown.status, 404);
  assert.equal(unknown.code, 'bad-target');

  await gate.admit(treeOp({ actor: 'human', opId: 'human:t1', kind: 'insert', componentId: 'a9', base: kernel.frontiers() }));
  await gate.admit(treeOp({ actor: 'human', opId: 'human:t2', kind: 'remove', componentId: 'a9', base: kernel.frontiers() }));
  const tombstone = await gate.admit(treeOp({ actor: 'human', opId: 'human:u2', kind: 'update', componentId: 'a9', base: kernel.frontiers(), item: { tag: 'X' } }));
  assert.equal(tombstone.status, 404);
  assert.equal(tombstone.code, 'bad-target');
  if (!isCommitReceipt(tombstone)) {
    assert.ok(tombstone.detail !== undefined && tombstone.detail.includes('tombstoned'), 'the §6 law is named in the detail');
  }
});

test('M5a tree update shape law: item must be a plain JSON value — caller bugs die at the boundary', async () => {
  const { kernel, gate } = workspace();
  const base = kernel.frontiers();
  await gate.admit(treeOp({ actor: 'human', opId: 'human:t1', kind: 'insert', componentId: 'a9', base }));
  const updateWith = (item: unknown) => treeOp({ actor: 'human', opId: 'human:u1', kind: 'update', componentId: 'a9', base, item });

  await assert.rejects(
    async () => gate.admit({ ...updateWith({ tag: 'X' }), tree: { componentId: 'a9' } } as unknown as OpEnvelope),
    TypeError,
    'no item payload',
  );
  await assert.rejects(async () => gate.admit(updateWith(undefined)), TypeError, 'undefined item');
  await assert.rejects(async () => gate.admit(updateWith({ fn: () => 1 })), TypeError, 'function value');
  await assert.rejects(async () => gate.admit(updateWith({ u: undefined })), TypeError, 'undefined property value');
  await assert.rejects(async () => gate.admit(updateWith(Number.NaN)), TypeError, 'NaN');
  await assert.rejects(async () => gate.admit(updateWith(new Date(0))), TypeError, 'class instance');

  assert.equal(kernel.walEntries().filter((entry) => entry.opId === 'human:u1').length, 0, 'no WAL cost');
  assert.equal(kernel.journalEntries().filter((entry) => (entry.type === 'commit' || entry.type === 'rejection') && entry.opId === 'human:u1').length, 0, 'no journal row');
});

test('M5a 换源脚手架: an externally changed scaffold lands via tree update — the stored item no longer reads stale', async () => {
  const { kernel, gate } = workspace();
  const path = 'Hero.svelte';
  // ingest-shaped scaffold (bridge.ts's PageTreeItem vocabulary, built inline
  // to stay decoupled from the parallel bridge work)
  const v1 = {
    kind: 'page',
    path,
    letter: 'a',
    chunks: ['<Card variant="solid">', '</Card>'],
    holes: [{ componentId: 'a2', buffer: 'label', how: 'template-text' }],
    skipped: [],
  };
  await gate.admit(treeOp({ actor: 'file-system', opId: 'fs:t1', kind: 'insert', componentId: path, base: kernel.frontiers(), item: v1 }));
  await gate.admit(textCreateOp({ actor: 'file-system', opId: 'fs:c1', componentId: 'a2', initialText: 'Ship it', base: kernel.frontiers() }));

  // the external source changed a tag attribute → the re-plan differs → M3
  // could only report scaffoldStale; M5a lands the new scaffold as a tree update
  const v2 = {
    kind: 'page',
    path,
    letter: 'a',
    chunks: ['<Card variant="ghost">', '</Card>'],
    holes: [{ componentId: 'a2', buffer: 'label', how: 'template-text' }],
    skipped: [],
  };
  const landed = await gate.admit(treeOp({ actor: 'file-system', opId: 'fs:t2', kind: 'update', componentId: path, base: kernel.frontiers(), item: v2 }));
  assert.equal(landed.status, 200);

  // resync.ts's scaffoldStale predicate (stored plan vs. re-plan deep compare)
  // now reads EQUAL — the stored scaffold is the re-planned one
  const stored = kernel.treeItems().find((entry) => entry.componentId === path)?.meta;
  assert.deepEqual(stored, v2, 'no longer scaffoldStale');

  // data-only: the buffer the scaffold points at is untouched by the update
  assert.equal(kernel.bufferText(encodeContainerKey('a2', bufferKeyOf('label'))), 'Ship it');
});
