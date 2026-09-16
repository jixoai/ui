/**
 * kernel.test.ts — the collab kernel tests (collab-protocol M2):
 * the frozen container-key codec, the actor→peer registry (design
 * 治理冻结一/二), journal-driven recovery (canonical IS the journal
 * replay), the three §5.5 WAL crash windows (prepare / abort / receipt),
 * buffer seeding, the tree registry lifecycle, and the file-backed
 * `.jx-collab/` layout with its .gitignore law.
 *
 * M5a (tasks M3 gaps ①②③): buffer creation as an admitted op (journal-
 * truth recovery; ensureBuffer demoted to the internal lane, still
 * compatible), the tree data-update op, and the treeItems() read
 * accessor pinned equal to the snapshot client read.
 *
 * Crash windows are simulated with a store that stops persisting the
 * instant a given WAL marker lands ("the process died HERE") — recovery
 * then reopens a kernel from a clone of exactly that persisted state.
 *
 * Original need: collab-protocol M2 + M5a (2026-09-15).
 */

import { strict as assert } from 'node:assert';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { LoroDoc } from 'loro-crdt';

import { AdmissionGate } from './admission.ts';
import {
  bufferKeyOf,
  CollabKernel,
  ContainerKeyError,
  decodeContainerKey,
  encodeContainerKey,
  FIRST_ACTOR_PEER,
  PrunedSyncCursorError,
  TREE_CONTAINER,
} from './kernel.ts';
import { FileCollabStore, MemoryCollabStore, type CollabStore } from './store.ts';
import { isCommitReceipt } from './types.ts';
import type { CommitJournalEntry, ErrorEnvelope, Frontier, JournalEntry, OpEnvelope, TextCreateOpEnvelope, TextOpEnvelope, TreeOpEnvelope, WalEntry } from './types.ts';

/* ── test scaffolding ─────────────────────────────────────────────────── */

/** a store that stops persisting the moment a chosen WAL marker lands */
class CrashPointStore implements CollabStore {
  readonly inner = new MemoryCollabStore();
  #dead = false;
  readonly stopAfter: WalEntry['type'];

  constructor(stopAfter: WalEntry['type']) {
    this.stopAfter = stopAfter;
  }

  init(): void {
    if (!this.#dead) this.inner.init();
  }

  appendJournal(entry: JournalEntry): void {
    if (!this.#dead) this.inner.appendJournal(entry);
  }

  readJournal(): JournalEntry[] {
    return this.inner.readJournal();
  }

  appendWal(entry: WalEntry): void {
    if (this.#dead) return;
    this.inner.appendWal(entry);
    if (entry.type === this.stopAfter) this.#dead = true;
  }

  readWal(): WalEntry[] {
    return this.inner.readWal();
  }

  savePeers(state: Parameters<MemoryCollabStore['savePeers']>[0]): void {
    if (!this.#dead) this.inner.savePeers(state);
  }

  loadPeers() {
    return this.inner.loadPeers();
  }

  saveLedger(state: Parameters<MemoryCollabStore['saveLedger']>[0]): void {
    if (!this.#dead) this.inner.saveLedger(state);
  }

  loadLedger() {
    return this.inner.loadLedger();
  }
}

const LABEL_KEY = encodeContainerKey('a1', bufferKeyOf('label'));

/** a client-side stable anchor encoded against the current snapshot */
function clientCursor(kernel: CollabKernel, containerKey: string, offset: number): Uint8Array {
  const client = LoroDoc.fromSnapshot(kernel.snapshotBytes());
  const cursor = client.getText(containerKey).getCursor(offset, 0);
  if (cursor === undefined) throw new Error(`cannot anchor at ${offset}`);
  return cursor.encode();
}

function textEnvelope(init: {
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

/** M5a ①: the buffer-creation envelope (no anchor, no extent) */
function textCreateEnvelope(init: { actor: string; opId: string; componentId?: string; buffer?: string; initialText: string; base: Frontier }): TextCreateOpEnvelope {
  return {
    actor: init.actor,
    opId: init.opId,
    baseFrontiers: init.base,
    domain: 'text',
    kind: 'create',
    target: { componentId: init.componentId ?? 'a1', buffer: init.buffer ?? 'label' },
    initialText: init.initialText,
  };
}

function treeEnvelope(init: {
  actor: string;
  opId: string;
  kind: 'insert' | 'move' | 'remove' | 'revive' | 'update';
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
  if (init.kind === 'update') {
    return { ...common, kind: 'update', tree: { componentId: init.componentId, item: init.item ?? { tag: 'Card' } } };
  }
  return { ...common, kind: 'revive', tree: { componentId: init.componentId, parentComponentId: init.parentComponentId, index: init.index } };
}

const commitsOf = (kernel: CollabKernel, opId: string): JournalEntry[] =>
  kernel.journalEntries().filter((entry) => (entry.type === 'commit' || entry.type === 'rejection') && entry.opId === opId);

const walOf = (kernel: CollabKernel, opId: string): WalEntry[] => kernel.walEntries().filter((entry) => entry.opId === opId);

/* ── the frozen container-key codec (design 治理冻结一) ────────────────── */

test('container keys: slug mapping, verbatim ids, percent-encoded exotica, strict roundtrip', () => {
  assert.equal(bufferKeyOf('label'), 'p-label');
  assert.equal(bufferKeyOf('variant'), 'p-variant');
  assert.equal(bufferKeyOf('script'), 'script');
  assert.equal(bufferKeyOf('style'), 'style');
  assert.equal(bufferKeyOf('page'), 'page');
  assert.equal(bufferKeyOf('t-0'), 't-0');
  assert.equal(bufferKeyOf('t-12'), 't-12');

  assert.equal(encodeContainerKey('a13', 'p-label'), 'b:a13:p-label');
  assert.equal(encodeContainerKey('hero-cta', 'p-label'), 'b:hero-cta:p-label'); // verbatim manual names stay readable

  const exotic = 'we:ird/x';
  const encoded = encodeContainerKey(exotic, 'p-label');
  assert.ok(encoded.includes('%3A') && encoded.includes('%2F'), `${encoded} must percent-encode the separator/banned bytes`);
  assert.equal(encoded.split(':').length, 3, 'encoded id must never add a third colon');
  assert.deepEqual(decodeContainerKey(encoded), { componentId: exotic, bufferKey: 'p-label' });

  for (const id of ['a1', 'hero-cta', 'UPPER', 'sp ace', 'tab\tchar', '唯一', 'a:b/c%d']) {
    assert.deepEqual(decodeContainerKey(encodeContainerKey(id, 'p-label')), { componentId: id, bufferKey: 'p-label' }, `roundtrip ${JSON.stringify(id)}`);
  }
  assert.deepEqual(decodeContainerKey('b:a13:p-label'), { componentId: 'a13', bufferKey: 'p-label' });

  assert.throws(() => bufferKeyOf('BAD SLUG'), ContainerKeyError);
  assert.throws(() => bufferKeyOf(''), ContainerKeyError);
  assert.throws(() => encodeContainerKey('a1', 'nope!'), ContainerKeyError);
  assert.throws(() => decodeContainerKey('plain-key'), ContainerKeyError);
  assert.throws(() => decodeContainerKey('b:a1:p-label:extra'), ContainerKeyError);
});

/* ── the actor→peer registry (design 治理冻结二) ───────────────────────── */

test('actor→peer registry: 1001 start, step 1, rebuild-stable, never reused', () => {
  const kernel = CollabKernel.open(new MemoryCollabStore());
  assert.equal(kernel.peerOf('human'), FIRST_ACTOR_PEER);
  assert.equal(kernel.peerOf('agent:copy'), FIRST_ACTOR_PEER + 1);
  assert.equal(kernel.peerOf('human'), FIRST_ACTOR_PEER); // stable
  assert.equal(kernel.peerOf('file-system'), FIRST_ACTOR_PEER + 2);

  // rebuild from the journal alone (the caches were never saved here)
  const store = new MemoryCollabStore();
  const seeded = CollabKernel.open(store);
  seeded.peerOf('human');
  seeded.peerOf('agent:copy');
  const recovered = CollabKernel.open(store.clone());
  assert.equal(recovered.peerOf('human'), FIRST_ACTOR_PEER, 'recovered registry must be stable');
  assert.equal(recovered.peerOf('agent:copy'), FIRST_ACTOR_PEER + 1);
  assert.equal(recovered.peerOf('file-system'), FIRST_ACTOR_PEER + 2, 'allocation continues past the recovered high-water, never reusing');
  assert.ok(
    recovered.journalEntries().filter((entry) => entry.type === 'peer').length >= 3,
    'peer allocations are journal rows',
  );
});

test('admitted commits land under the actor registry peer (never a doc-default random peer)', async () => {
  const store = new MemoryCollabStore();
  const kernel = CollabKernel.open(store);
  kernel.ensureBuffer('a1', 'label', 'abc');
  await new AdmissionGate(kernel).admit(textEnvelope({ actor: 'human', opId: 'human:1', kind: 'insert', offset: 3, text: '!', base: kernel.frontiers(), cursorBytes: clientCursor(kernel, LABEL_KEY, 3) }));
  const commit = kernel.journalEntries().find((entry) => entry.type === 'commit');
  assert.ok(commit !== undefined && commit.type === 'commit');
  assert.equal(commit.peer, FIRST_ACTOR_PEER, 'the loro change carries the actor registry peer');
  assert.ok(commit.frontier.some((point) => point.peer === String(FIRST_ACTOR_PEER)), 'frontier names the registry peer');
});

/* ── journal-driven recovery ──────────────────────────────────────────── */

test('journal rebuild: canonical text, receipts, buffers, tail-5 all recover from the journal alone', async () => {
  const store = new MemoryCollabStore();
  const kernel = CollabKernel.open(store);
  kernel.ensureBuffer('a1', 'label', 'Hero');
  kernel.ensureBuffer('a2', 'label', 'Footer');
  const gate = new AdmissionGate(kernel);

  const base0 = kernel.frontiers();
  await gate.admit(textEnvelope({ actor: 'human', opId: 'human:1', kind: 'insert', offset: 4, text: ' one', base: base0, cursorBytes: clientCursor(kernel, LABEL_KEY, 4) }));
  const base1 = kernel.frontiers();
  await gate.admit(textEnvelope({ actor: 'agent:copy', opId: 'agent:copy:1', kind: 'insert', offset: 6, text: ' two', base: base1, cursorBytes: clientCursor(kernel, encodeContainerKey('a2', bufferKeyOf('label')), 6), componentId: 'a2' }));
  await gate.admit(textEnvelope({ actor: 'file-system', opId: 'fs:1', kind: 'insert', offset: 0, text: 'X', base: kernel.frontiers(), cursorBytes: clientCursor(kernel, LABEL_KEY, 0) }));

  const heroText = kernel.bufferText(LABEL_KEY);
  const footerText = kernel.bufferText(encodeContainerKey('a2', bufferKeyOf('label')));

  const recovered = CollabKernel.open(store.clone());
  assert.equal(recovered.bufferText(LABEL_KEY), heroText, 'canonical is the journal replay');
  assert.equal(recovered.bufferText(encodeContainerKey('a2', bufferKeyOf('label'))), footerText);
  assert.equal(recovered.receiptFor('human:1')?.status, 200);
  assert.ok(recovered.hasBuffer(LABEL_KEY) && !recovered.hasBuffer(encodeContainerKey('a9', bufferKeyOf('label'))));
  const heroTail = recovered.tailFor('a1');
  assert.ok(heroTail.length === 3 && heroTail.every((row) => row.componentId === 'a1'), 'component-granularity tail');
  assert.equal(heroTail.at(-1)?.opId, 'fs:1');
});

test('ensureBuffer: idempotent seeding survives restart', () => {
  const store = new MemoryCollabStore();
  const kernel = CollabKernel.open(store);
  kernel.ensureBuffer('a1', 'label', 'Hello');
  kernel.ensureBuffer('a1', 'label', 'IGNORED'); // already known — no-op
  assert.equal(kernel.bufferText(LABEL_KEY), 'Hello');

  const recovered = CollabKernel.open(store.clone());
  assert.ok(recovered.hasBuffer(LABEL_KEY));
  assert.equal(recovered.bufferText(LABEL_KEY), 'Hello');
});

/* ── the three §5.5 WAL crash windows ─────────────────────────────────── */

test('crash after WAL prepare: recovery drops the op with zero effect; resubmission commits exactly once', async () => {
  const store = new CrashPointStore('prepare');
  const kernel = CollabKernel.open(store);
  kernel.ensureBuffer('a1', 'label', 'abc');
  const gate = new AdmissionGate(kernel);
  const base = kernel.frontiers();

  // the process dies right after the prepare marker — the returned
  // receipt never reached anyone and is discarded with the process
  await gate.admit(textEnvelope({ actor: 'human', opId: 'human:1', kind: 'insert', offset: 3, text: '!', base, cursorBytes: clientCursor(kernel, LABEL_KEY, 3) }));

  const persisted = store.inner.clone();
  assert.equal(persisted.readWal().at(-1)?.type, 'prepare');
  const recovered = CollabKernel.open(persisted);
  assert.equal(recovered.bufferText(LABEL_KEY), 'abc', 'zero canonical effect');
  assert.equal(recovered.receiptFor('human:1'), undefined, 'no receipt survived');
  assert.ok(
    recovered.recoveryNotes().some((note) => note.startsWith('dropped-prepared-op human:1')),
    'recovery must explain the dropped prepare',
  );

  // resubmission (same opId) executes exactly once
  const gate2 = new AdmissionGate(recovered);
  const receipt = await gate2.admit(textEnvelope({ actor: 'human', opId: 'human:1', kind: 'insert', offset: 3, text: '!', base: recovered.frontiers(), cursorBytes: clientCursor(recovered, LABEL_KEY, 3) }));
  assert.equal(receipt.status, 200);
  assert.equal(recovered.bufferText(LABEL_KEY), 'abc!');
  assert.equal(commitsOf(recovered, 'human:1').length, 1, 'exactly one commit row');
});

test('candidate abort (tree cycle): WAL prepare+abort, canonical/journal untouched, retry re-executes', async () => {
  const store = new MemoryCollabStore();
  const kernel = CollabKernel.open(store);
  const gate = new AdmissionGate(kernel);

  await gate.admit(treeEnvelope({ actor: 'human', opId: 'human:t1', kind: 'insert', componentId: 'a1', base: kernel.frontiers() }));
  await gate.admit(treeEnvelope({ actor: 'human', opId: 'human:t2', kind: 'insert', componentId: 'a2', base: kernel.frontiers(), parentComponentId: 'a1' }));
  const nodesBefore = kernel.treeSummary();

  // moving a parent under its own child is a cycle — rejected on the candidate fork
  const move = treeEnvelope({ actor: 'agent:cycle', opId: 'agent:cycle:1', kind: 'move', componentId: 'a1', base: kernel.frontiers(), parentComponentId: 'a2' });
  const rejection = await gate.admit(move);
  assert.equal(rejection.status, 404);
  assert.equal(rejection.code, 'bad-target');

  assert.deepEqual(walOf(kernel, 'agent:cycle:1').map((entry) => entry.type), ['prepare', 'abort'], 'abort path order');
  assert.equal(commitsOf(kernel, 'agent:cycle:1').length, 0, 'abort leaves no journal row (§5.5)');
  assert.equal(kernel.receiptFor('agent:cycle:1'), undefined, 'abort is not a cached receipt');
  assert.equal(kernel.treeSummary(), nodesBefore, 'canonical tree untouched');

  const again = await gate.admit(move);
  assert.equal(again.status, 404, 'retry re-executes rather than replaying');
  assert.deepEqual(walOf(kernel, 'agent:cycle:1').map((entry) => entry.type), ['prepare', 'abort', 'prepare', 'abort']);
  assert.equal(commitsOf(kernel, 'agent:cycle:1').length, 0);
});

test('crash after WAL receipt: recovery replays exactly once and the same-opId retry returns the original receipt', async () => {
  const store = new MemoryCollabStore();
  const kernel = CollabKernel.open(store);
  kernel.ensureBuffer('a1', 'label', 'abc');
  const gate = new AdmissionGate(kernel);
  const envelope = textEnvelope({ actor: 'human', opId: 'human:1', kind: 'insert', offset: 3, text: '!', base: kernel.frontiers(), cursorBytes: clientCursor(kernel, LABEL_KEY, 3) });
  const first = await gate.admit(envelope);
  assert.equal(first.status, 200);

  const recovered = CollabKernel.open(store.clone());
  assert.equal(recovered.bufferText(LABEL_KEY), 'abc!', 'exactly one replay');

  const retry = await new AdmissionGate(recovered).admit(envelope);
  assert.equal(retry.status, 200);
  assert.equal(retry.opId, 'human:1');
  assert.equal(recovered.bufferText(LABEL_KEY), 'abc!', 'idempotent retry does not duplicate the effect');
  assert.equal(commitsOf(recovered, 'human:1').length, 1);
  assert.equal(walOf(recovered, 'human:1').filter((entry) => entry.type === 'prepare').length, 1, 'no second prepare for a replayed receipt');
});

/* ── the tree registry lifecycle ──────────────────────────────────────── */

test('tree ops: insert/move/remove/revive with tombstone law and journal-only mapping rebuild', async () => {
  const store = new MemoryCollabStore();
  const kernel = CollabKernel.open(store);
  const gate = new AdmissionGate(kernel);
  kernel.ensureBuffer('a2', 'label', 'child');

  await gate.admit(treeEnvelope({ actor: 'human', opId: 't:1', kind: 'insert', componentId: 'a1', base: kernel.frontiers(), item: { tag: 'Card' } }));
  await gate.admit(treeEnvelope({ actor: 'human', opId: 't:2', kind: 'insert', componentId: 'a2', base: kernel.frontiers(), parentComponentId: 'a1' }));
  const a2Node = kernel.treeNodeOf('a2');
  assert.ok(kernel.treeNodeOf('a1') !== undefined && a2Node !== undefined);

  // removing the subtree root tombstones the descendants; buffer writes 404
  await gate.admit(treeEnvelope({ actor: 'human', opId: 't:3', kind: 'remove', componentId: 'a1', base: kernel.frontiers() }));
  assert.ok(kernel.isTreeNodeDeleted(kernel.treeNodeOf('a1')!));
  assert.ok(kernel.isTreeNodeDeleted(a2Node), 'descendants tombstone with the root');

  const tombstoneWrite = await gate.admit(textEnvelope({ actor: 'human', opId: 't:4', kind: 'insert', offset: 0, text: 'x', base: kernel.frontiers(), cursorBytes: clientCursor(kernel, encodeContainerKey('a2', bufferKeyOf('label')), 0), componentId: 'a2' }));
  assert.equal(tombstoneWrite.status, 404);
  assert.equal(tombstoneWrite.code, 'bad-target');

  // explicit revive of the descendant reopens it; the deletion root stays tombstoned
  const revive = await gate.admit(treeEnvelope({ actor: 'human', opId: 't:5', kind: 'revive', componentId: 'a2', base: kernel.frontiers() }));
  assert.equal(revive.status, 200);
  assert.ok(!kernel.isTreeNodeDeleted(a2Node));
  assert.ok(kernel.isTreeNodeDeleted(kernel.treeNodeOf('a1')!), 'revive does not cascade');

  const reopenedWrite = await gate.admit(textEnvelope({ actor: 'human', opId: 't:6', kind: 'insert', offset: 0, text: 'Y', base: kernel.frontiers(), cursorBytes: clientCursor(kernel, encodeContainerKey('a2', bufferKeyOf('label')), 0), componentId: 'a2' }));
  assert.equal(reopenedWrite.status, 200);

  // O1 unlock (2026-09-15, probe outcome A — A3/A5d): the deletion root now
  // revives via a journal-level rebind — a FRESH TreeID under the requested
  // parent, the item payload read off the dead node's surviving data, the
  // journal mapping re-pointed with `rebindOf` auditing the lineage.
  // (History: this was a frozen 404 "engine limit" — loro 1.16.1's move
  // paths throw "is deleted" on the direct target — until the O1/O2 ruling
  // re-framed it as an implementation detail the journal layer routes
  // around; the engine stays pinned at 1.16.1.)
  const oldA1Node = kernel.treeNodeOf('a1')!;
  const rootRevive = await gate.admit(treeEnvelope({ actor: 'human', opId: 't:7', kind: 'revive', componentId: 'a1', base: kernel.frontiers() }));
  assert.equal(rootRevive.status, 200);
  const newA1Node = kernel.treeNodeOf('a1')!;
  assert.notEqual(newA1Node, oldA1Node, 'the rebind mints a fresh TreeID');
  assert.ok(!kernel.isTreeNodeDeleted(newA1Node), 'the component is live again');
  assert.ok(kernel.isTreeNodeDeleted(oldA1Node), 'the dead TreeID stays dead — the lineage is audited, never rewritten');
  assert.deepEqual(kernel.treeItems().find((node) => node.treeNodeId === newA1Node)?.meta, { tag: 'Card' }, 'the item payload rides the rebind (A5d)');
  const reviveRow = commitsOf(kernel, 't:7').find((entry): entry is CommitJournalEntry => entry.type === 'commit');
  assert.equal(reviveRow?.tree?.rebindOf, oldA1Node, 'the journal row audits the rebind lineage');

  // the mapping is journal truth: it rebuilds
  const recovered = CollabKernel.open(store.clone());
  assert.equal(recovered.treeNodeOf('a2'), a2Node, 'journal-only mapping rebuild');
  assert.equal(recovered.treeNodeOf('a1'), newA1Node, 'the rebind row rebuilds the fresh mapping');
  assert.ok(!recovered.isTreeNodeDeleted(a2Node) && !recovered.isTreeNodeDeleted(newA1Node) && recovered.isTreeNodeDeleted(oldA1Node));
});

/* ── the file backend: frozen `.jx-collab/` layout ────────────────────── */

test('FileCollabStore: layout artifacts, .gitignore law, and a reopen round-trip', async (t) => {
  const designRoot = mkdtempSync(join(tmpdir(), 'jx-collab-kernel-'));
  t.after(() => rmSync(designRoot, { recursive: true, force: true }));

  const store = new FileCollabStore(designRoot);
  const kernel = CollabKernel.open(store);
  kernel.ensureBuffer('a1', 'label', 'abc');
  await new AdmissionGate(kernel).admit(textEnvelope({ actor: 'human', opId: 'human:1', kind: 'insert', offset: 3, text: '!', base: kernel.frontiers(), cursorBytes: clientCursor(kernel, LABEL_KEY, 3) }));

  const dir = store.dir;
  assert.ok(existsSync(join(dir, 'journal.ndjson')), 'journal.ndjson');
  assert.ok(existsSync(join(dir, 'wal', 'wal.ndjson')), 'wal/wal.ndjson');
  assert.ok(existsSync(join(dir, 'peers.json')), 'peers.json');
  assert.ok(existsSync(join(dir, 'ledger.json')), 'ledger.json');
  assert.ok(readFileSync(join(dir, 'journal.ndjson'), 'utf8').trim().length > 0, 'journal rows persisted');
  assert.ok(
    readFileSync(join(designRoot, '.gitignore'), 'utf8').split('\n').some((line) => line.trim() === '.jx-collab/'),
    'the design repo must ignore .jx-collab/',
  );

  const reopened = CollabKernel.open(new FileCollabStore(designRoot));
  assert.equal(reopened.bufferText(LABEL_KEY), 'abc!');
  assert.equal(reopened.peerOf('human'), FIRST_ACTOR_PEER);
  assert.equal(reopened.receiptFor('human:1')?.status, 200);
});

/* ── envelope shape contract (caller bugs, not protocol adjudications) ── */

test('structurally invalid envelopes throw TypeError before any adjudication', async () => {
  const kernel = CollabKernel.open(new MemoryCollabStore());
  kernel.ensureBuffer('a1', 'label', 'abc');
  const gate = new AdmissionGate(kernel);
  const base = kernel.frontiers();
  const good = textEnvelope({ actor: 'human', opId: 'human:1', kind: 'insert', offset: 0, text: 'x', base, cursorBytes: clientCursor(kernel, LABEL_KEY, 0) });

  await assert.rejects(async () => gate.admit({ ...good, cursorBytes: new Uint8Array(0) }), TypeError);
  await assert.rejects(async () => gate.admit({ ...good, offset: -1 }), TypeError);
  await assert.rejects(
    async () => gate.admit({ ...good, domain: 'tree', kind: 'insert', target: { componentId: 'a1' }, tree: { item: {} } } as unknown as OpEnvelope),
    TypeError,
  );
});

/* ── B3 (impl-review-1): the durable rejection IS the original receipt ── */

test('rejection receipts survive restart deepEqual: the journal row carries the full original envelope', async () => {
  const store = new MemoryCollabStore();
  const kernel = CollabKernel.open(store);
  kernel.ensureBuffer('a1', 'label', 'abcd');
  const gate = new AdmissionGate(kernel);

  // three rejection lanes, each exercising different one-shot fields:
  //  - frontier 409: canonicalUpdate + retry syncCursor + detail
  //  - conflict 409: the §5.2 conflict body (both ops + tail + text)
  //  - stale-cursor 409: retry.reason=reselect + detail
  const base = kernel.frontiers();
  const ahead = await gate.admit(
    textEnvelope({ actor: 'human', opId: 'human:ahead', kind: 'insert', offset: 0, text: 'X', base: [{ peer: '999999', counter: 77 }], cursorBytes: clientCursor(kernel, LABEL_KEY, 0) }),
  );
  assert.equal(ahead.status, 409);

  const first = gate.admit(textEnvelope({ actor: 'human', opId: 'human:1', kind: 'delete', offset: 1, length: 2, base, cursorBytes: clientCursor(kernel, LABEL_KEY, 1) }));
  const second = gate.admit(textEnvelope({ actor: 'agent:copy', opId: 'agent:copy:1', kind: 'delete', offset: 2, length: 1, base, cursorBytes: clientCursor(kernel, LABEL_KEY, 2) }));
  const [, conflict] = await Promise.all([first, second]);
  assert.equal(conflict.status, 409);

  const stale = await gate.admit(textEnvelope({ actor: 'human', opId: 'human:2', kind: 'insert', offset: 0, text: 'X', base: kernel.frontiers(), cursorBytes: new Uint8Array([1, 2, 3]) }));
  assert.equal(stale.status, 409);

  const originals: ErrorEnvelope[] = [];
  for (const result of [ahead, conflict, stale]) {
    assert.ok(!isCommitReceipt(result), `${result.opId} is a rejection in-memory`);
    originals.push(result);
  }

  // the journal rows carry the persisted one-shot fields (base64 for bytes)
  const rejectionRows = kernel.journalEntries().filter((entry) => entry.type === 'rejection');
  assert.equal(rejectionRows.length, 3);
  const aheadRow = rejectionRows.find((entry) => entry.opId === 'human:ahead');
  assert.ok(aheadRow !== undefined && aheadRow.type === 'rejection');
  assert.ok(aheadRow.canonicalUpdateB64 !== undefined && aheadRow.canonicalUpdateB64.length > 0, 'the 409 update bytes are journaled');
  assert.ok(aheadRow.syncCursor !== undefined && aheadRow.syncCursor.kind === 'frontier', 'the retry cursor is journaled');
  assert.ok(typeof aheadRow.detail === 'string' && aheadRow.detail.length > 0, 'the diagnostic detail is journaled');

  // restart: the SAME opIds replay the ORIGINAL receipts, field for field
  const recovered = CollabKernel.open(store.clone());
  for (const original of originals) {
    const replayed = recovered.receiptFor(original.opId);
    assert.ok(replayed !== undefined && !isCommitReceipt(replayed), `${original.opId} is still a rejection after restart`);
    assert.equal(replayed.status, original.status);
    assert.equal(replayed.code, original.code);
    assert.deepEqual(replayed.actor, original.actor);
    assert.deepEqual(replayed.target, original.target);
    assert.deepEqual(replayed.canonicalFrontier, original.canonicalFrontier);
    assert.deepEqual(replayed.canonicalUpdate, original.canonicalUpdate, `${original.opId}: resync update byte-equal`);
    assert.deepEqual(replayed.syncCursor, original.syncCursor);
    assert.deepEqual(replayed.retry, original.retry);
    assert.deepEqual(replayed.conflict, original.conflict);
    assert.deepEqual(replayed.range, original.range);
    assert.deepEqual(replayed.detail, original.detail);
    assert.deepEqual(replayed.serverAdmissionTime, original.serverAdmissionTime);
    assert.deepEqual(replayed, original, `${original.opId}: the whole envelope deepEqual across restart (B3)`);
  }
});

/* ── B2 (impl-review-1): exportFor never silently degrades ─────────────── */

test('exportFor: an unknown/pruned frontier cursor throws PrunedSyncCursorError — the shallow snapshot is reserved for the ABSENT cursor', () => {
  const kernel = CollabKernel.open(new MemoryCollabStore());
  kernel.ensureBuffer('a1', 'label', 'abc');

  assert.equal(kernel.syncCursorResolvable({ kind: 'frontier', value: kernel.frontiers() }), true, 'the current frontier resolves');
  assert.equal(kernel.syncCursorResolvable({ kind: 'frontier', value: [{ peer: '999999', counter: 77 }] }), false, 'an unknown frontier does not');
  assert.throws(() => kernel.exportFor({ kind: 'frontier', value: [{ peer: '999999', counter: 77 }] }), PrunedSyncCursorError, 'no silent shallow snapshot (B2)');

  // the absent cursor keeps its §5.6-sanctioned restricted snapshot
  const snapshot = kernel.exportFor(undefined);
  assert.ok(snapshot.update.byteLength > 0);
  assert.equal(snapshot.syncCursor.kind, 'frontier');
});

/* ── M5a ①: buffer creation as an op — journal-truth recovery ─────────── */

test('M5a buffer create: recovery rebuilds the container from the journal alone; ensureBuffer stays a compatible internal lane', async () => {
  const store = new MemoryCollabStore();
  const kernel = CollabKernel.open(store);
  const gate = new AdmissionGate(kernel);
  const heroKey = encodeContainerKey('a2', bufferKeyOf('label'));
  const titleKey = encodeContainerKey('a2', bufferKeyOf('title'));

  await gate.admit(textCreateEnvelope({ actor: 'human', opId: 'human:c1', componentId: 'a2', initialText: 'Hero', base: kernel.frontiers() }));
  await gate.admit(textCreateEnvelope({ actor: 'file-system', opId: 'fs:c1', componentId: 'a2', buffer: 'title', initialText: '', base: kernel.frontiers() }));
  // the resync.ts legacy bootstrap keeps working alongside (backward compat)
  kernel.ensureBuffer('a1', 'label', 'legacy');

  const recovered = CollabKernel.open(store.clone());
  assert.ok(recovered.hasBuffer(heroKey) && recovered.hasBuffer(titleKey) && recovered.hasBuffer(LABEL_KEY));
  assert.equal(recovered.bufferText(heroKey), 'Hero', 'canonical is the journal replay');
  assert.equal(recovered.bufferText(titleKey), '', 'even the empty create recovers as a known container');
  assert.equal(recovered.bufferText(LABEL_KEY), 'legacy');
  assert.equal(recovered.receiptFor('human:c1')?.status, 200, 'the create receipt replays after restart');

  // the recovered kernel takes ordinary anchored edits into the recovered container
  const edit = await new AdmissionGate(recovered).admit(
    textEnvelope({ actor: 'agent:copy', opId: 'agent:copy:1', kind: 'insert', offset: 4, text: '!', base: recovered.frontiers(), cursorBytes: clientCursor(recovered, heroKey, 4), componentId: 'a2' }),
  );
  assert.equal(edit.status, 200);
  assert.equal(recovered.bufferText(heroKey), 'Hero!');

  // a create colliding with the recovered container is still the frozen 409
  const collision = await new AdmissionGate(recovered).admit(
    textCreateEnvelope({ actor: 'agent:copy', opId: 'agent:copy:c1', componentId: 'a2', initialText: 'Z', base: recovered.frontiers() }),
  );
  assert.equal(collision.status, 409);
  assert.equal(collision.code, 'conflict');
});

/* ── M5a ②③: tree data update + the treeItems() read accessor ─────────── */

test('M5a treeItems(): parent/index/meta/tombstone reads equal the snapshot client read', async () => {
  const store = new MemoryCollabStore();
  const kernel = CollabKernel.open(store);
  const gate = new AdmissionGate(kernel);
  const pageItem = { kind: 'page', path: 'P.svelte', letter: 'a', chunks: ['<p>', '</p>'], holes: [], skipped: [] };
  const componentItem = (id: string) => ({ kind: 'component', id, tag: 'Card', path: 'P.svelte', skipped: [] });

  await gate.admit(treeEnvelope({ actor: 'human', opId: 't:1', kind: 'insert', componentId: 'p1', base: kernel.frontiers(), item: pageItem }));
  await gate.admit(treeEnvelope({ actor: 'human', opId: 't:2', kind: 'insert', componentId: 'c1', base: kernel.frontiers(), parentComponentId: 'p1', item: componentItem('c1') }));
  await gate.admit(treeEnvelope({ actor: 'human', opId: 't:3', kind: 'insert', componentId: 'c2', base: kernel.frontiers(), parentComponentId: 'p1', item: componentItem('c2') }));
  await gate.admit(treeEnvelope({ actor: 'human', opId: 't:4', kind: 'insert', componentId: 'c3', base: kernel.frontiers(), item: componentItem('c3') }));
  await gate.admit(treeEnvelope({ actor: 'human', opId: 't:5', kind: 'remove', componentId: 'c2', base: kernel.frontiers() }));
  // M5a ②: a data update rides the same tree (payload replacement only)
  const c1Updated = { ...componentItem('c1'), tag: 'Card', skipped: [], props: { variant: 'ghost' } };
  await gate.admit(treeEnvelope({ actor: 'human', opId: 't:6', kind: 'update', componentId: 'c1', base: kernel.frontiers(), item: c1Updated }));

  const items = kernel.treeItems();
  const byId = new Map(items.map((node) => [node.componentId, node]));
  // structural reads: parent linkage, sibling index, tombstone flag
  assert.equal(byId.get('p1')?.parentComponentId, undefined, 'p1 is a forest root');
  assert.equal(byId.get('c1')?.parentComponentId, 'p1');
  assert.equal(byId.get('c1')?.index, 0, 'first child');
  assert.equal(byId.get('c2')?.deleted, true, 'the removed node stays readable as a tombstone');
  assert.equal(byId.get('c3')?.parentComponentId, undefined, 'forest root sibling of p1');
  assert.deepEqual(byId.get('c1')?.meta, c1Updated, 'the updated payload reads through');
  assert.ok(items.every((node) => typeof node.treeNodeId === 'string' && node.treeNodeId.includes('@')), 'treeNodeIds are loro ids');

  // EQUIVALENCE with the snapshot client read — the bridge's mechanism
  // (LoroDoc.fromSnapshot(snapshotBytes()) → tree nodes), field for field
  const client = LoroDoc.fromSnapshot(kernel.snapshotBytes());
  const clientNodes = new Map(client.getTree(TREE_CONTAINER).nodes().map((node) => [node.id as string, node]));
  assert.equal(items.length, clientNodes.size, 'same node set including tombstones');
  for (const item of items) {
    const mirror = clientNodes.get(item.treeNodeId);
    assert.ok(mirror !== undefined, `snapshot holds ${item.componentId}`);
    assert.deepEqual(item.meta, mirror.data.get('item'), `meta equivalence for ${String(item.componentId)}`);
    assert.equal(item.deleted, mirror.isDeleted());
    assert.equal(item.parentTreeNodeId, mirror.parent()?.id, `parent equivalence for ${String(item.componentId)}`);
    assert.equal(item.index, mirror.index(), `index equivalence for ${String(item.componentId)}`);
  }

  // the mapping-side fields stay consistent with the journal-only registry
  assert.equal(byId.get('c1')?.treeNodeId, kernel.treeNodeOf('c1'));
});

/* ── M5 tail ① + M6: textAt, the script row, the projection-pending row ── */

/**
 * The reference three-way base — resync.ts's `bufferBaseAt` derivation,
 * inlined verbatim (journal walk: the latest in-base commit's post text;
 * the seed's content when no in-base commits sit above; undefined when
 * born after the observed version). `textAt` must agree wherever the
 * buffer EXISTED at the version (the accessor's documented edge: a
 * container born later reads as '' — existence stays journal-derived).
 */
function bufferBaseAtReference(kernel: CollabKernel, containerKey: string, at: Frontier): string | undefined {
  const entries = kernel.journalEntries();
  for (let i = entries.length - 1; i >= 0; i -= 1) {
    const entry = entries[i]!;
    if (entry.type === 'commit' && entry.domain === 'text' && entry.containerKey === containerKey) {
      let relation: -1 | 0 | 1 | undefined;
      try {
        relation = kernel.cmpFrontiers(entry.frontier, at);
      } catch {
        continue;
      }
      if (relation === -1 || relation === 0) return entry.value;
      continue;
    }
    if (entry.type === 'buffer-seed' && entry.containerKey === containerKey) {
      let relation: -1 | 0 | 1 | undefined;
      try {
        relation = kernel.cmpFrontiers(entry.frontier, at);
      } catch {
        return kernel.bufferText(containerKey);
      }
      if (relation === 1) return undefined;
      return entry.value;
    }
  }
  return undefined;
}

test('textAt(containerKey, frontier) equals the journal-walk three-way base for existing buffers', async () => {
  const kernel = CollabKernel.open(new MemoryCollabStore());
  kernel.ensureBuffer('a1', 'label', 'Hero');
  const atSeed = kernel.frontiers();
  const gate = new AdmissionGate(kernel);
  await gate.admit(textEnvelope({ actor: 'human', opId: 'human:1', kind: 'insert', offset: 4, text: ' one', base: atSeed, cursorBytes: clientCursor(kernel, LABEL_KEY, 4) }));
  const afterOne = kernel.frontiers();
  await gate.admit(textEnvelope({ actor: 'human', opId: 'human:2', kind: 'insert', offset: 0, text: 'X', base: afterOne, cursorBytes: clientCursor(kernel, LABEL_KEY, 0) }));
  const afterTwo = kernel.frontiers();
  kernel.ensureBuffer('a2', 'label', 'Late');

  // equivalence across every version where the buffer existed
  for (const at of [atSeed, afterOne, afterTwo]) {
    assert.equal(
      kernel.textAt(LABEL_KEY, at),
      bufferBaseAtReference(kernel, LABEL_KEY, at),
      `textAt agrees with the journal walk at ${JSON.stringify(at)}`,
    );
  }
  assert.equal(kernel.textAt(LABEL_KEY, afterTwo), 'XHero one', 'the current version reads the current text');
  assert.equal(kernel.textAt(LABEL_KEY, atSeed), 'Hero', 'the seed version reads the seed text');

  // the documented edge: born-later containers read '' (existence is a
  // journal question), and unresolvable frontiers answer undefined
  assert.equal(kernel.textAt(encodeContainerKey('a2', bufferKeyOf('label')), atSeed), '', 'a container born after the version reads empty');
  assert.equal(kernel.textAt(LABEL_KEY, [{ peer: '424242', counter: 3 }]), undefined, 'an unknown/pruned frontier answers undefined');
});

test('script and projection-pending journal rows persist, validate and recover with zero canonical effect', () => {
  const dir = mkdtempSync(join(tmpdir(), 'jx-collab-rows-'));
  try {
    const kernel = CollabKernel.open(new FileCollabStore(dir));
    kernel.ensureBuffer('a1', 'label', 'Hero');
    const before = kernel.frontiers();

    kernel.recordScriptArtifact({
      scriptId: 'agent:x:js:1',
      actor: 'agent:x',
      source: "log('intent only');",
      sourceHash: 'a'.repeat(64),
      engine: { package: 'quickjs-emscripten@0.32.0', variant: '@jitl/quickjs-wasmfile-release-sync', wasmSha256: 'b'.repeat(64) },
      capabilities: ['ctx.component', 'group'],
    });
    kernel.recordProjectionPending({ path: 'Hero.svelte', projectionHash: 'c'.repeat(64), reason: 'disk full' });

    // zero canonical effect by construction
    assert.equal(JSON.stringify(kernel.frontiers()), JSON.stringify(before), 'intent/audit rows never move canonical');

    // the store validates them on read; recovery replays them as no-ops
    const reopened = CollabKernel.open(new FileCollabStore(dir));
    const kinds = reopened.journalEntries().map((entry) => entry.type);
    assert.ok(kinds.includes('script') && kinds.includes('projection-pending'), 'both row types survive the round-trip');
    const script = reopened.journalEntries().find((entry) => entry.type === 'script');
    assert.ok(script !== undefined && script.type === 'script' && script.capabilities.includes('group'), 'the artifact fields round-trip');
    assert.equal(reopened.bufferText(LABEL_KEY), 'Hero', 'canonical rebuilds from the OP rows only');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('the pending-projection WORKLIST recovers from the journal at open and retires on flush (kernel gap ②, M6 收敛轮)', () => {
  const dir = mkdtempSync(join(tmpdir(), 'jx-collab-worklist-'));
  try {
    const kernel = CollabKernel.open(new FileCollabStore(dir));
    kernel.recordProjectionPending({ path: 'Hero.svelte', projectionHash: 'c'.repeat(64), reason: 'disk full', base: 'd'.repeat(64) });
    kernel.recordProjectionPending({ path: 'Other.svelte', projectionHash: 'e'.repeat(64), reason: 'disk full' }); // no base — the operator's row

    // the live worklist: rows in journal order, base intact, no smuggling
    assert.deepEqual(kernel.pendingProjections().map((row) => row.path), ['Hero.svelte', 'Other.svelte']);
    assert.equal(kernel.pendingProjections()[0]!.base, 'd'.repeat(64), 'the structured base rides the row');
    assert.ok(!kernel.pendingProjections()[0]!.reason.includes('base='), 'the M6b reason-suffix smuggling is retired');

    // retiring is process-local bookkeeping — the journal row stays audit truth
    const heroSeq = kernel.pendingProjections()[0]!.seq;
    assert.equal(kernel.markProjectionFlushed(heroSeq), true);
    assert.deepEqual(kernel.pendingProjections().map((row) => row.path), ['Other.svelte']);
    assert.equal(kernel.markProjectionFlushed(Number.MAX_SAFE_INTEGER), false, 'unknown seqs answer false');
    assert.ok(kernel.journalEntries().some((entry) => entry.type === 'projection-pending' && entry.seq === heroSeq), 'the row stays in the journal');

    // reopen: the FULL worklist rebuilds from the journal (the marker was memory-only)
    const reopened = CollabKernel.open(new FileCollabStore(dir));
    assert.deepEqual(reopened.pendingProjections().map((row) => row.path), ['Hero.svelte', 'Other.svelte'], 'open restores the worklist from the journal');
    assert.equal(reopened.pendingProjections().find((row) => row.path === 'Hero.svelte')?.base, 'd'.repeat(64), 'the base survives the crash');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
