/**
 * store.test.ts — the persistence-boundary tests (collab-protocol M2,
 * impl-review-1 B7): persisted input is UNTRUSTED. Every journal/WAL
 * line and both cache files go through a runtime schema parse before
 * the recovery path can see them — a truncated final line (append cut
 * by a crash), a malformed JSON line, an unknown row type, a corrupt
 * base64 blob or an out-of-enum code all fail stop with the file and
 * line, never `as T` passthrough. Valid lines (including B3 rejection
 * rows with their one-shot envelope fields) recover untouched.
 *
 * Original need: collab-protocol M2 / impl-review-1 B7 (2026-09-15).
 */

import { strict as assert } from 'node:assert';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { LoroDoc } from 'loro-crdt';

import { AdmissionGate } from './admission.ts';
import { bufferKeyOf, CollabKernel, encodeContainerKey } from './kernel.ts';
import { FileCollabStore, PersistedStateError } from './store.ts';

/* ── scaffolding ──────────────────────────────────────────────────────── */

const LABEL_KEY = encodeContainerKey('a1', bufferKeyOf('label'));

/** a populated file-backed workspace: one buffer seed + one committed op */
async function populatedStore(root: string): Promise<{ store: FileCollabStore; journalPath: string; walPath: string }> {
  const store = new FileCollabStore(root);
  const kernel = CollabKernel.open(store);
  kernel.ensureBuffer('a1', 'label', 'abcd');
  const gate = new AdmissionGate(kernel);
  const cursorBytes = LoroDoc.fromSnapshot(kernel.snapshotBytes()).getText(LABEL_KEY).getCursor(0, 0)!.encode();
  const receipt = await gate.admit({
    actor: 'human',
    opId: 'human:1',
    baseFrontiers: kernel.frontiers(),
    domain: 'text',
    kind: 'insert',
    target: { componentId: 'a1', buffer: 'label' },
    cursorBytes,
    offset: 0,
    length: 0,
    text: 'X',
  });
  assert.equal(receipt.status, 200, 'the setup op committed');
  return {
    store,
    journalPath: join(store.dir, 'journal.ndjson'),
    walPath: join(store.dir, 'wal', 'wal.ndjson'),
  };
}

/* ── valid lines recover (incl. B3 rejection rows) ────────────────────── */

test('FileCollabStore round-trip: a B3 rejection row passes the schema and replays byte-equal', async (t) => {
  const root = mkdtempSync(join(tmpdir(), 'jx-collab-store-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const store = new FileCollabStore(root);
  const kernel = CollabKernel.open(store);
  kernel.ensureBuffer('a1', 'label', 'abcd');
  const gate = new AdmissionGate(kernel);
  const rejection = await gate.admit({
    actor: 'human',
    opId: 'human:1',
    baseFrontiers: [{ peer: '999999', counter: 77 }],
    domain: 'text',
    kind: 'insert',
    target: { componentId: 'a1', buffer: 'label' },
    cursorBytes: LoroDoc.fromSnapshot(kernel.snapshotBytes()).getText(LABEL_KEY).getCursor(0, 0)!.encode(),
    offset: 0,
    length: 0,
    text: 'X',
  });
  assert.equal(rejection.status, 409);

  // the row on disk really carries the one-shot fields
  const rowLine = readFileSync(join(store.dir, 'journal.ndjson'), 'utf8')
    .split('\n')
    .filter((line) => line.includes('"type":"rejection"'))
    .at(0);
  assert.ok(rowLine !== undefined, 'the rejection is persisted');
  const row = JSON.parse(rowLine!) as { canonicalUpdateB64?: string; syncCursor?: unknown; detail?: string };
  assert.ok(typeof row.canonicalUpdateB64 === 'string' && row.canonicalUpdateB64.length > 0);
  assert.ok(row.syncCursor !== undefined);
  assert.ok(typeof row.detail === 'string');

  // reopen: schema-valid rows pass and the receipt replays deepEqual
  const recovered = CollabKernel.open(new FileCollabStore(root));
  assert.deepEqual(recovered.receiptFor('human:1'), rejection, 'B3 across the FILE store too');
  assert.equal(recovered.bufferText(LABEL_KEY), 'abcd');
});

/* ── truncated final line = crash-interrupted append (fail-stop) ──────── */

test('a truncated final journal line fails stop with the file and line — the partial row is never parsed', async (t) => {
  const root = mkdtempSync(join(tmpdir(), 'jx-collab-store-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const { journalPath } = await populatedStore(root);
  const original = readFileSync(journalPath, 'utf8');

  // cut mid-line: strip the trailing newline AND half of the last row
  const cut = original.slice(0, Math.max(0, original.length - 20));
  assert.ok(!cut.endsWith('\n'), 'the simulated crash left a partial final line');
  writeFileSync(journalPath, cut);

  const store = new FileCollabStore(root);
  const lines = cut.split('\n').length;
  assert.throws(
    () => store.readJournal(),
    (error: unknown) => {
      assert.ok(error instanceof PersistedStateError);
      assert.equal(error.file, journalPath);
      assert.equal(error.line, lines, 'the error names the partial line');
      assert.ok(error.message.includes('truncated'), 'and says it was a crash-interrupted append');
      return true;
    },
  );
  // the recovery path is fail-stop, not skipping
  assert.throws(() => CollabKernel.open(new FileCollabStore(root)), PersistedStateError);
});

test('a fully-formed final line without its newline terminator is indistinguishable from a cut — same fail-stop', async (t) => {
  const root = mkdtempSync(join(tmpdir(), 'jx-collab-store-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const { journalPath } = await populatedStore(root);
  const original = readFileSync(journalPath, 'utf8');
  writeFileSync(journalPath, original.slice(0, -1)); // drop ONLY the terminator

  assert.throws(() => new FileCollabStore(root).readJournal(), (error: unknown) => {
    assert.ok(error instanceof PersistedStateError);
    assert.ok(error.message.includes('truncated'));
    return true;
  });
});

/* ── malformed / unknown / out-of-schema rows ─────────────────────────── */

test('a malformed JSON journal line fails stop naming the line', async (t) => {
  const root = mkdtempSync(join(tmpdir(), 'jx-collab-store-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const { journalPath } = await populatedStore(root);
  const original = readFileSync(journalPath, 'utf8');
  const lines = original.split('\n').filter((line) => line.trim().length > 0);
  writeFileSync(journalPath, `${lines[0]!}\n{"type":"commit" "seq": broken\n`);

  assert.throws(() => new FileCollabStore(root).readJournal(), (error: unknown) => {
    assert.ok(error instanceof PersistedStateError);
    assert.equal(error.line, 2, 'the malformed line is named');
    assert.ok(error.message.includes('malformed JSON'));
    return true;
  });
});

test('an unknown journal row type is fail-stop, never silently skipped', async (t) => {
  const root = mkdtempSync(join(tmpdir(), 'jx-collab-store-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const { journalPath } = await populatedStore(root);
  const original = readFileSync(journalPath, 'utf8');
  writeFileSync(journalPath, `${original}{"type":"oops","seq":99,"serverAdmissionTime":1,"opId":"x","actor":"y"}\n`);

  assert.throws(() => new FileCollabStore(root).readJournal(), (error: unknown) => {
    assert.ok(error instanceof PersistedStateError);
    assert.ok(error.message.includes('unknown journal row type'), 'not skipped, not coerced');
    return true;
  });
});

test('a commit row with a corrupt base64 updateB64 fails its runtime schema check', async (t) => {
  const root = mkdtempSync(join(tmpdir(), 'jx-collab-store-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const { journalPath } = await populatedStore(root);
  const lines = readFileSync(journalPath, 'utf8').split('\n').filter((line) => line.includes('"type":"commit"'));
  assert.ok(lines.length > 0, 'a commit row exists');
  const corrupted = lines[0]!.replace(/"updateB64":"[^"]*"/, '"updateB64":"@@not-base64@@"');
  const original = readFileSync(journalPath, 'utf8');
  writeFileSync(journalPath, original.replace(lines[0]!, corrupted));

  assert.throws(() => new FileCollabStore(root).readJournal(), (error: unknown) => {
    assert.ok(error instanceof PersistedStateError);
    assert.ok(error.message.includes('updateB64'), 'the failing field is named');
    return true;
  });
});

test('a rejection row with an out-of-enum code fails its runtime schema check', async (t) => {
  const root = mkdtempSync(join(tmpdir(), 'jx-collab-store-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const store = new FileCollabStore(root);
  const kernel = CollabKernel.open(store);
  kernel.ensureBuffer('a1', 'label', 'abcd');
  await new AdmissionGate(kernel).admit({
    actor: 'human',
    opId: 'human:1',
    baseFrontiers: [{ peer: '999999', counter: 77 }],
    domain: 'text',
    kind: 'insert',
    target: { componentId: 'a1', buffer: 'label' },
    cursorBytes: LoroDoc.fromSnapshot(kernel.snapshotBytes()).getText(LABEL_KEY).getCursor(0, 0)!.encode(),
    offset: 0,
    length: 0,
    text: 'X',
  });
  const journalPath = join(store.dir, 'journal.ndjson');
  const original = readFileSync(journalPath, 'utf8');
  writeFileSync(journalPath, original.replace('"code":"stale-or-unknown-frontier"', '"code":"mystery-error"'));

  assert.throws(() => new FileCollabStore(root).readJournal(), (error: unknown) => {
    assert.ok(error instanceof PersistedStateError);
    assert.ok(error.message.includes('code'));
    return true;
  });
});

test('an unknown WAL row type fails stop too', async (t) => {
  const root = mkdtempSync(join(tmpdir(), 'jx-collab-store-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const { walPath } = await populatedStore(root);
  const original = readFileSync(walPath, 'utf8');
  writeFileSync(walPath, `${original}{"type":"oops","opId":"x","serverTime":1}\n`);

  assert.throws(() => new FileCollabStore(root).readWal(), (error: unknown) => {
    assert.ok(error instanceof PersistedStateError);
    assert.ok(error.message.includes('unknown WAL row type'));
    return true;
  });
});

/* ── the materialized caches are validated on load as well ────────────── */

test('peers.json and ledger.json shape violations fail stop instead of `as T` passthrough', async (t) => {
  const root = mkdtempSync(join(tmpdir(), 'jx-collab-store-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const { store } = await populatedStore(root);

  writeFileSync(join(store.dir, 'peers.json'), '{"actors":{"human":"1001"},"nextPeer":1002}\n');
  assert.throws(() => store.loadPeers(), PersistedStateError);

  writeFileSync(join(store.dir, 'ledger.json'), '{"journalSeq":"3","nextPeer":1002,"receipts":{}}\n');
  assert.throws(() => store.loadLedger(), PersistedStateError);

  writeFileSync(join(store.dir, 'peers.json'), '{"actors":{"human":1001},"nextPeer":1002}\n');
  assert.doesNotThrow(() => store.loadPeers(), 'the valid shape still loads');
});
