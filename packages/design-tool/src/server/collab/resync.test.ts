/**
 * resync.test.ts — the ingest station tests (collab-protocol M3,
 * protocol-spec §8 / §2): the file-system op stream (tree inserts + each
 * buffer's first insert through admission, journaled and attributed), the
 * observed frontier/hash recording, P15 idempotence re-proven on the
 * kernel-integration path (second ingest of the projected file content
 * lands ZERO ops and ZERO journal rows), ledger recovery across reopened
 * stations (letters + never-reuse counters, tombstones included), the
 * changed-source boundary (new components adopt; existing buffers are
 * canonical truth; scaffold drift is reported, M5 owns the rebase), and
 * the typed-error feed.
 *
 * Original need: collab-protocol M3 (2026-09-15).
 */

import { strict as assert } from 'node:assert';
import { createHash } from 'node:crypto';
import test from 'node:test';

import { AdmissionGate } from './admission.ts';
import { bufferAnchor, projectSource, treeItemsOf, treeParentageOf } from './bridge.ts';
import { IdentityError } from './identity.ts';
import { CollabKernel } from './kernel.ts';
import { FILE_SYSTEM_ACTOR, ingestFile, recoverLedger, ResyncStation } from './resync.ts';
import type { IngestOptions, IngestReport, IngestResult } from './resync.ts';
import { MemoryCollabStore } from './store.ts';
import type { CommitJournalEntry, TextOpEnvelope, TreeOpEnvelope } from './types.ts';

/* ── scaffolding ──────────────────────────────────────────────────────── */

function workspace(): { kernel: CollabKernel; gate: AdmissionGate; station: ResyncStation } {
  const kernel = CollabKernel.open(new MemoryCollabStore());
  const gate = new AdmissionGate(kernel);
  return { kernel, gate, station: new ResyncStation(kernel, gate) };
}

/**
 * The 200-lane narrowing helpers — node:assert's `equal` cannot narrow
 * the StationOutcome union, so the report fields stay type-hidden
 * without an explicit guard (the strict gate demands zero output).
 */
async function ingest200(station: ResyncStation, path: string, source: string): Promise<IngestReport> {
  const outcome = await station.ingestFile(path, source);
  if (outcome.status === 409) throw new Error(`expected the 200 lane on ${path}, got 409 ${outcome.code}`);
  return outcome;
}

async function ingestFile200(kernel: CollabKernel, path: string, source: string, options?: IngestOptions): Promise<IngestResult> {
  const outcome = await ingestFile(kernel, path, source, options);
  if (outcome.status === 409) throw new Error(`expected the 200 lane on ${path}, got 409 ${outcome.code}`);
  return outcome;
}

async function reconcile200(station: ResyncStation, path: string, source: string): Promise<IngestReport> {
  const outcome = await station.reconcileFile(path, source);
  if (outcome.status === 409) throw new Error(`expected the 200 lane on ${path}, got 409 ${outcome.code}`);
  return outcome;
}

const commits = (kernel: CollabKernel): CommitJournalEntry[] =>
  kernel.journalEntries().filter((entry): entry is CommitJournalEntry => entry.type === 'commit');

const treeInsertRows = (kernel: CollabKernel): CommitJournalEntry[] =>
  commits(kernel).filter((entry) => entry.domain === 'tree' && entry.kind === 'insert');

const bufferSeedRows = (kernel: CollabKernel) => kernel.journalEntries().filter((entry) => entry.type === 'buffer-seed');

/** submit one tree op through admission (tombstone setup for recovery) */
async function submitTreeRemove(ws: { kernel: CollabKernel; gate: AdmissionGate }, componentId: string): Promise<void> {
  const envelope: TreeOpEnvelope = {
    actor: 'human',
    opId: `human:rm:${componentId}`,
    baseFrontiers: ws.kernel.frontiers(),
    domain: 'tree',
    kind: 'remove',
    target: { componentId },
    tree: { componentId },
  };
  const result = await ws.gate.admit(envelope);
  assert.equal(result.status, 200);
}

/* ── the file-system op stream ────────────────────────────────────────── */

test('ingest lands the page and components as file-system actor ops: journal rows carry the adoption ids', async () => {
  const ws = workspace();
  const source = `<script>let t = 'a';</script>\n<Button label="Save">Click</Button>\n<Card />\n`;
  const report = await ingest200(ws.station, 'pages/home.svelte', source);

  assert.deepEqual(report.adoptions.map((adoption) => adoption.id), ['a1', 'a2']);
  assert.ok(report.adoptions.every((adoption) => adoption.path === 'pages/home.svelte'));
  assert.deepEqual(report.adoptions.map((adoption) => adoption.component), ['Button', 'Card']);

  // tree inserts: the page node + both components, ALL under file-system
  const rows = treeInsertRows(ws.kernel);
  assert.deepEqual(
    rows.map((row) => row.target.componentId),
    ['pages/home.svelte', 'a1', 'a2'],
  );
  assert.ok(rows.every((row) => row.actor === FILE_SYSTEM_ACTOR), 'adoption rows are file-system attributed');
  assert.ok(rows.every((row) => row.tree !== undefined), 'each insert journals the componentId↔TreeID mapping');

  // buffer first inserts: same actor, real text commits with anchors
  const textRows = commits(ws.kernel).filter((entry) => entry.domain === 'text');
  assert.ok(textRows.length >= 3, 'label + slot + script first inserts landed');
  assert.ok(textRows.every((row) => row.actor === FILE_SYSTEM_ACTOR));
  assert.ok(textRows.every((row) => row.offset === 0 && row.length === 0), 'first inserts are kernel-form insert@0');

  // the op stream is opId-unique and monotonic (file-system:<n>)
  const opIds = commits(ws.kernel).map((row) => row.opId);
  assert.equal(new Set(opIds).size, opIds.length);
});

test('the observed state records the pre-admission frontier and the external source hash', async () => {
  const ws = workspace();
  const source = '<Button>Go</Button>\n';
  const frontierBefore = ws.kernel.frontiers();
  const report = await ingest200(ws.station, 'pages/home.svelte', source);

  assert.deepEqual(report.observed.frontier, frontierBefore, 'observed BEFORE any landing op moved the frontier');
  assert.equal(report.observed.hash, createHash('sha256').update(source).digest('hex'), 'the EXTERNAL source bytes were hashed (pre-injection)');
});

/* ── P15 idempotence on the kernel-integration path ───────────────────── */

test('re-ingesting the projected file content is a full no-op: zero ops, zero journal rows, zero WAL rows', async () => {
  const ws = workspace();
  const source = `<script>let t = 'a';</script>\n<Button label="Save &amp; go">  Click  </Button>\n<Card />\n`;
  const first = await ingest200(ws.station, 'pages/home.svelte', source);

  const before = {
    journal: ws.kernel.journalEntries().length,
    wal: ws.kernel.walEntries().length,
    frontier: JSON.stringify(ws.kernel.frontiers()),
    stats: JSON.stringify(ws.kernel.stats()),
    bufferText: ws.kernel.bufferText('b:a1:p-label'),
  };

  // the file on disk holds the canonical projection (id-injected) —
  // re-ingest THAT, exactly as the watcher would read it back
  const second = await ingest200(ws.station, 'pages/home.svelte', first.rewrittenSource);

  assert.equal(second.idempotent, true);
  assert.equal(second.pageAdopted, false);
  assert.deepEqual(second.treeInserts, []);
  assert.ok(second.buffers.every((buffer) => !buffer.created && !buffer.seeded && buffer.opId === undefined));
  assert.ok(second.adoptions.every((adoption) => adoption.adopted === 'verbatim'), 'P15: verbatim now, nothing injected');
  assert.deepEqual(second.adoptions.map((adoption) => adoption.id), ['a1', 'a2'], 'journal stable');
  assert.equal(second.scaffoldStale, false);

  assert.equal(ws.kernel.journalEntries().length, before.journal, 'zero new journal rows');
  assert.equal(ws.kernel.walEntries().length, before.wal, 'zero new WAL rows');
  assert.equal(JSON.stringify(ws.kernel.frontiers()), before.frontier, 'the canonical frontier did not move');
  assert.equal(JSON.stringify(ws.kernel.stats()), before.stats);
  assert.equal(ws.kernel.bufferText('b:a1:p-label'), before.bufferText);
});

test('re-ingesting the RAW (id-less) source adopts NEW components — ids are minted once, the file must hold the projection', async () => {
  const ws = workspace();
  const source = '<Button>Go</Button>\n';
  const first = await ingest200(ws.station, 'pages/home.svelte', source);
  const second = await ingest200(ws.station, 'pages/home.svelte', source);

  assert.equal(second.idempotent, false);
  assert.deepEqual(second.treeInserts, ['a2'], 'the raw source has no ids — a NEW component is adopted (a2)');
  assert.deepEqual(second.adoptions.map((adoption) => adoption.id), ['a2']);
});

/* ── ledger recovery across reopened stations ─────────────────────────── */

test('a reopened station recovers letters and counters from the kernel (new pages letter on, numbers never reuse)', async () => {
  const ws = workspace();
  await ingest200(ws.station, 'pages/home.svelte', '<Button>Go</Button>\n<Card />\n');
  await ingest200(ws.station, 'pages/other.svelte', '<Chip />\n');

  const ledger = recoverLedger(ws.kernel);
  // nodes() order is internal — letters are VALUES on the page items, so
  // recovery is order-free (only the page COUNT feeds the next letter)
  assert.equal(ledger.pages.size, 2);
  assert.equal(ledger.pages.get('pages/home.svelte'), 'a');
  assert.equal(ledger.pages.get('pages/other.svelte'), 'b');
  assert.equal(ledger.counters.get('a'), 2);
  assert.equal(ledger.counters.get('b'), 1);

  // a fresh station over the SAME kernel: page c is next, page a mints a3
  const reopened = new ResyncStation(ws.kernel);
  const third = await ingest200(reopened, 'pages/third.svelte', '<Row />\n');
  assert.equal(third.adoptions[0]!.id, 'c1');
  const growth = await ingest200(reopened, 'pages/home.svelte', '<Button id="a1">Go</Button>\n<Card id="a2" />\n<Row />\n');
  assert.equal(growth.adoptions[2]!.id, 'a3', 'recovered high-water continues — never restarts at a1');
});

test('tombstoned components still feed the recovered high-water (§2: tombstones release nothing)', async () => {
  const ws = workspace();
  await ingest200(ws.station, 'pages/home.svelte', '<A />\n<B />\n<C />\n'); // a1 a2 a3
  await submitTreeRemove(ws, 'a3');

  const reopened = new ResyncStation(ws.kernel);
  const after = await ingest200(reopened, 'pages/home.svelte', '<A id="a1" />\n<B id="a2" />\n<D />\n');
  assert.equal(after.adoptions[2]!.id, 'a4', 'the deleted a3 keeps its number spent');
});

/* ── the changed-source boundary (M3 scope: M5 owns the rebase) ───────── */

test('a changed source adopts new components and new buffers, leaves existing buffer content canonical, and reports scaffold drift', async () => {
  const ws = workspace();
  const first = await ingest200(ws.station, 'pages/home.svelte', '<Button label="Save">Click</Button>\n<Card />\n');
  const before = ws.kernel.bufferText('b:a1:p-label');

  // external edit: label value changed AND a structural addition
  const changed = first.rewrittenSource.replace('label="Save"', 'label="New"').replace('<Card id="a2" />', '<Card id="a2" />\n<Badge id="a3" note="hi">!</Badge>\n');
  const second = await ingest200(ws.station, 'pages/home.svelte', changed);

  assert.deepEqual(second.treeInserts, ['a3'], 'the new component adopts through admission');
  assert.equal(second.scaffoldStale, true, 'the stored scaffold differs from the changed source — reported, M5 rebases');
  assert.equal(ws.kernel.bufferText('b:a1:p-label'), before, 'existing buffers stay canonical — no silent re-seed');
  const noteBuffer = second.buffers.find((buffer) => buffer.buffer === 'note');
  assert.ok(noteBuffer !== undefined && noteBuffer.seeded, 'the NEW prop buffer lands a first insert');
  assert.equal(ws.kernel.bufferText('b:a3:p-note'), 'hi');
});

test('a value-only external edit changes no scaffold bytes: buffers hold the drift, projection stays canonical', async () => {
  const ws = workspace();
  const first = await ingest200(ws.station, 'pages/home.svelte', '<Button label="Save">Click</Button>\n');
  const changed = first.rewrittenSource.replace('label="Save"', 'label="New"');
  const second = await ingest200(ws.station, 'pages/home.svelte', changed);

  assert.equal(second.scaffoldStale, false, 'the label VALUE is a hole — the scaffold bytes did not change');
  assert.equal(ws.kernel.bufferText('b:a1:p-label'), 'Save', 'canonical truth wins; the drift is M5 rebase input');
  assert.equal(second.idempotent, true);
});

/* ── nested adoption (B5: tree parentage + buffer landing) ────────────── */

test('nested usages land parent-aware tree inserts: Mid under Outer\u2019s node, Inner under Mid\u2019s — never all on the page root', async () => {
  const ws = workspace();
  const source = '<Outer label="shell"><Mid note="mid"><Inner hint="deep">core</Inner></Mid>host slot</Outer>\n';
  const report = await ingest200(ws.station, 'pages/deep.svelte', source);

  assert.deepEqual(report.adoptions.map((adoption) => adoption.id), ['a1', 'a2', 'a3'], 'recursive document-order adoption');
  // journal truth: every nested insert is a file-system tree row with its mapping
  const rows = treeInsertRows(ws.kernel);
  assert.deepEqual(
    rows.map((row) => row.target.componentId),
    ['pages/deep.svelte', 'a1', 'a2', 'a3'],
  );
  // the B5 structure: top level on the page node, nested on the parent COMPONENT
  const parentage = treeParentageOf(ws.kernel);
  assert.equal(parentage.get('pages/deep.svelte'), undefined, 'the page node is the forest root');
  assert.equal(parentage.get('a1'), 'pages/deep.svelte');
  assert.equal(parentage.get('a2'), 'a1');
  assert.equal(parentage.get('a3'), 'a2');
  // nested buffers all landed
  assert.equal(ws.kernel.bufferText('b:a1:p-label'), 'shell');
  assert.equal(ws.kernel.bufferText('b:a2:p-note'), 'mid');
  assert.equal(ws.kernel.bufferText('b:a3:p-hint'), 'deep');
  assert.equal(ws.kernel.bufferText('b:a3:t-0'), 'core');
  assert.equal(ws.kernel.bufferText('b:a1:t-0'), 'host slot');
});

test('nested re-ingest of the projected source stays a full no-op (P15 at depth)', async () => {
  const ws = workspace();
  const source = '<Outer><Mid><Inner hint="deep">core</Inner></Mid></Outer>\n';
  const first = await ingest200(ws.station, 'pages/deep.svelte', source);
  const before = ws.kernel.journalEntries().length;
  const second = await ingest200(ws.station, 'pages/deep.svelte', first.rewrittenSource);
  assert.equal(second.idempotent, true);
  assert.deepEqual(second.treeInserts, []);
  assert.equal(ws.kernel.journalEntries().length, before, 'zero new journal rows');
});

test('a component added at depth (inside an existing host) adopts under that host\u2019s node', async () => {
  const ws = workspace();
  const first = await ingest200(ws.station, 'pages/deep.svelte', '<Outer><Mid /></Outer>\n');
  const changed = first.rewrittenSource.replace('<Mid id="a2" />', '<Mid id="a2"><Fresh note="n" /></Mid>');
  const second = await ingest200(ws.station, 'pages/deep.svelte', changed);
  assert.deepEqual(second.treeInserts, ['a3'], 'the depth-added component adopts');
  assert.equal(treeParentageOf(ws.kernel).get('a3'), 'a2', 'its parent is the HOST component, not the page root');
  assert.equal(second.scaffoldStale, true, 'the slot bytes changed — the scaffold differs (kernel gap: tree data-update)');
  assert.equal(ws.kernel.bufferText('b:a3:p-note'), 'n', 'the nested new buffer still lands');
});

/* ── the function form + typed errors ─────────────────────────────────── */

test('ingestFile (function form) works with an injected gate and returns the next ledger', async () => {
  const kernel = CollabKernel.open(new MemoryCollabStore());
  const gate = new AdmissionGate(kernel);
  const first = await ingestFile200(kernel, 'pages/one.svelte', '<A />\n', { gate });
  assert.equal(first.ledger.pages.get('pages/one.svelte'), 'a');
  assert.equal(first.ledger.counters.get('a'), 1);
  assert.ok(first.buffers.every((buffer) => buffer.opId === undefined || kernel.receiptFor(buffer.opId) !== undefined), 'every admitted op has its idempotency receipt');

  const second = await ingestFile200(kernel, 'pages/two.svelte', '<B />\n', { gate, ledger: first.ledger });
  assert.equal(second.ledger.pages.get('pages/two.svelte'), 'b');
  assert.equal(second.adoptions[0]!.id, 'b1');
});

test('identity violations surface as IdentityError (the admission 409 feed), never a corrupted adoption', async () => {
  const ws = workspace();
  await assert.rejects(
    ws.station.ingestFile('pages/home.svelte', '<Card id="x 1" />\n'),
    (error: unknown) => error instanceof IdentityError && error.code === 'illegal-id',
  );
  // nothing landed: the fail-stop left zero journal truth behind
  assert.equal(ws.kernel.journalEntries().length, 0);
});

test('an unparseable source fails with the svelte error, nothing lands', async () => {
  const ws = workspace();
  await assert.rejects(ws.station.ingestFile('pages/home.svelte', '<Button'));
  assert.equal(ws.kernel.journalEntries().length, 0);
});

/* ── buffer-addressability from the op lane (the round-trip substrate) ─── */

test('every seeded buffer is addressable by a later stable-anchor text op (the mirror seam)', async () => {
  const ws = workspace();
  const source = `<script>let a = 1;</script>\n\n<style>.x { color: red; }</style>\n\n<Button label="Save">  Click &amp; go  </Button>\ntop text\n`;
  await ingest200(ws.station, 'pages/home.svelte', source);

  for (const [componentId, buffer, insertText, at] of [
    ['a1', 'label', 'X', 0],
    ['a1', 't-0', 'Y', 5],
    ['pages/home.svelte', 'script', 'Z', 10],
    ['pages/home.svelte', 'style', 'W', 3],
    ['pages/home.svelte', 't-0', 'V', 0],
  ] as const) {
    const envelope: TextOpEnvelope = {
      actor: 'human',
      opId: `human:addr:${componentId}:${buffer}`,
      baseFrontiers: ws.kernel.frontiers(),
      domain: 'text',
      kind: 'insert',
      target: { componentId, buffer },
      cursorBytes: bufferAnchor(ws.kernel, componentId, buffer, at),
      offset: at,
      length: 0,
      text: insertText,
    };
    const result = await ws.gate.admit(envelope);
    assert.equal(result.status, 200, `${componentId}:${buffer} must be addressable (got ${String(result.status)})`);
  }
});

/* ── the reconcile lane (M7 收官轮): cross-era tree-meta realignment ───── */

test('reconcileFile realigns stale tree meta through admitted tree update ops (the M3 shape), while the ordinary lane keeps deferring', async () => {
  const ws = workspace();
  // the "old era" adoption: a source whose raised prop the OLD planner
  // would have skipped — adopt the shape the M3 journal could hold
  await ingest200(ws.station, 'pages/home.svelte', '<Button id="a1" label="Save" raised={title}>Click</Button>\n');
  let page = treeItemsOf(ws.kernel).find((entry) => entry.page?.path === 'pages/home.svelte')?.page;
  let component = treeItemsOf(ws.kernel).find((entry) => entry.component?.id === 'a1')?.component;
  assert.ok(page !== undefined && component !== undefined);
  assert.ok(!page.holes.some((hole) => hole.buffer === 'raised'), 'the literal-expression hole is absent at adoption (raised={title} is scaffold)');
  assert.ok(component.skipped.some((skip) => skip.name === 'raised'), 'the skipped list carries raised');

  // the ordinary fresh lane on the hand-migrated file (raised became a
  // brace LITERAL): the scaffold change stays DEFERRED (the guard's law)
  const migrated = '<Button id="a1" label="Save" raised={false}>Click</Button>\n';
  const guarded = await ingest200(ws.station, 'pages/home.svelte', migrated);
  assert.equal(guarded.status, 200);
  assert.equal(guarded.scaffoldStale, true, 'the ordinary lane reports the scaffold as stale (the guard feeds on it)');
  page = treeItemsOf(ws.kernel).find((entry) => entry.page?.path === 'pages/home.svelte')?.page;
  assert.ok(page !== undefined && !page.holes.some((hole) => hole.buffer === 'raised'), 'the stored meta still lacks the raised hole');

  // the reconcile lane: the stored items realign to the current plan
  // (reconcile200 guards the union: the fresh-observed lane cannot go stale)
  const report = await reconcile200(ws.station, 'pages/home.svelte', migrated);
  assert.deepEqual(
    [...(report.metaRealigned ?? [])].sort(),
    ['a1', 'pages/home.svelte'],
    'the page item AND the component item realigned',
  );
  assert.ok(!report.deferred?.some((entry) => entry.kind === 'scaffold-change'), 'the reconcile lane does not defer the realignment it landed');
  page = treeItemsOf(ws.kernel).find((entry) => entry.page?.path === 'pages/home.svelte')?.page;
  component = treeItemsOf(ws.kernel).find((entry) => entry.component?.id === 'a1')?.component;
  assert.ok(page !== undefined && page.holes.some((hole) => hole.componentId === 'a1' && hole.buffer === 'raised' && hole.how === 'prop-expr'), 'the raised prop-expr hole is now referenced by the stored meta');
  assert.ok(component !== undefined && !component.skipped.some((skip) => skip.name === 'raised'), 'the skipped list dropped raised');
  assert.equal(ws.kernel.bufferText('b:a1:p-raised'), 'false', 'the buffer content is the migrated literal');

  // the realignment is journaled as file-system tree update rows (audit truth)
  const updateRows = commits(ws.kernel).filter((entry) => entry.domain === 'tree' && entry.kind === 'update');
  assert.deepEqual(
    [...updateRows].map((row) => row.target.componentId).sort(),
    ['a1', 'pages/home.svelte'],
  );
  assert.ok(updateRows.every((row) => row.actor === FILE_SYSTEM_ACTOR), 'realignment rows are file-system attributed');

  // the projection now renders the buffer (report.buffers answers the panel's question)
  const projected = projectSource(ws.kernel, 'pages/home.svelte');
  assert.ok(projected.report.buffers.some((buffer) => buffer.componentId === 'a1' && buffer.buffer === 'raised' && buffer.how === 'prop-expr'), 'the projection report answers the raised buffer');
  assert.ok(projected.source.includes('raised={false}'), 'the projection renders the buffer content');
});

test('reconcileFile is idempotent at the realigned fixed point (zero ops, zero journal rows)', async () => {
  const ws = workspace();
  await ingest200(ws.station, 'pages/home.svelte', '<Button id="a1" label="Save" raised={title}>Click</Button>\n');
  await ingest200(ws.station, 'pages/home.svelte', '<Button id="a1" label="Save" raised={false}>Click</Button>\n');
  const aligned = await ws.station.reconcileFile('pages/home.svelte', '<Button id="a1" label="Save" raised={false}>Click</Button>\n');
  assert.notEqual(aligned.status, 409);
  const before = ws.kernel.journalEntries().length;
  const again = await ws.station.reconcileFile('pages/home.svelte', '<Button id="a1" label="Save" raised={false}>Click</Button>\n');
  if (again.status !== 409) {
    assert.equal(again.idempotent, true);
    assert.equal(again.metaRealigned, undefined);
  }
  assert.equal(ws.kernel.journalEntries().length, before, 'the aligned fixed point is free');
});
