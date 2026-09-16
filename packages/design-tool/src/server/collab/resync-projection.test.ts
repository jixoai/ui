/**
 * resync-projection.test.ts — the §8 file-resync full-cycle tests
 * (collab-protocol M5b, protocol-spec §8; p19 semantics productized —
 * the probe's local Loro model becomes the production station): the
 * stale observed state's 409 envelope (canonical update + retry cursor +
 * external hash/diff, external file NEVER touched), the buffer-granular
 * rebase with BOTH sides' changes coexisting, the atomic write-back
 * (temp + rename + hash check, real fs), the `projection-pending`
 * recovery worklist (no rollback, no other write), and the watcher seam
 * `station.onFileChange(path)` with its debounce-collapses-bursts law
 * (API + tests only — server wiring is M6 by design decision).
 *
 * Original need: collab-protocol M5b (2026-09-15).
 */

import { strict as assert } from 'node:assert';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import { AdmissionGate } from './admission.ts';
import { bufferAnchor, projectSource } from './bridge.ts';
import { bufferKeyOf, encodeContainerKey, CollabKernel } from './kernel.ts';
import { FILE_SYSTEM_ACTOR, nodeProjectionFiles, ResyncStation, type ProjectionFileAdapter, type StaleIngest } from './resync.ts';
import { MemoryCollabStore } from './store.ts';
import type { CommitJournalEntry, TextOpEnvelope } from './types.ts';

/* ── scaffolding ──────────────────────────────────────────────────────── */

const sha256 = (text: string): string => createHash('sha256').update(text).digest('hex');

/** a recording in-memory file adapter (the external-writer test double) */
class MemoryFiles implements ProjectionFileAdapter {
  readonly files = new Map<string, string>();
  readonly writes: { readonly path: string; readonly content: string; readonly hash: string }[] = [];
  reads = 0;
  /** injected write failure (disk-full style) */
  failWrites = false;
  /** write different bytes than asked, then run the adapter-side hash check */
  corruptWrites = false;

  read(path: string): string {
    this.reads += 1;
    const content = this.files.get(path);
    if (content === undefined) throw new Error(`ENOENT: ${path}`);
    return content;
  }

  writeAtomic(path: string, content: string, expectedHash: string): void {
    if (this.failWrites) throw new Error('injected write failure');
    const written = this.corruptWrites ? `${content}\u0000corrupted` : content;
    this.files.set(path, written);
    this.writes.push({ path, content, hash: expectedHash });
    if (sha256(written) !== expectedHash) {
      throw new Error(`hash mismatch after atomic write of ${path}: expected ${expectedHash}, file holds ${sha256(written)}`);
    }
  }

  /** the external writer's hand (git apply / editor save) — bypasses the station */
  externalWrite(path: string, content: string): void {
    this.files.set(path, content);
  }
}

interface Workspace {
  kernel: CollabKernel;
  gate: AdmissionGate;
  station: ResyncStation;
  files: MemoryFiles;
  readonly page: string;
}

function workspace(): Workspace {
  const kernel = CollabKernel.open(new MemoryCollabStore());
  const gate = new AdmissionGate(kernel);
  const files = new MemoryFiles();
  return { kernel, gate, files, station: new ResyncStation(kernel, gate, { files }), page: 'pages/home.svelte' };
}

const commits = (kernel: CollabKernel): CommitJournalEntry[] =>
  kernel.journalEntries().filter((entry): entry is CommitJournalEntry => entry.type === 'commit');

/** one whole-buffer replace through admission, the human's lane */
async function humanReplace(ws: Workspace, opId: string, componentId: string, buffer: string, text: string): Promise<void> {
  // bufferKeyOf is the law: prop buffers live under their p-<name> slug
  // (latent helper bug caught by the M6 收敛轮 literal-prop test — slots
  // were the only users before, and t-<n> slugs map verbatim)
  const containerKey = encodeContainerKey(componentId, bufferKeyOf(buffer));
  const envelope: TextOpEnvelope = {
    actor: 'human',
    opId,
    baseFrontiers: ws.kernel.frontiers(),
    domain: 'text',
    kind: 'replace',
    target: { componentId, buffer },
    cursorBytes: bufferAnchor(ws.kernel, componentId, buffer, 0),
    offset: 0,
    length: ws.kernel.bufferText(containerKey).length,
    text,
    timestamp: Date.now(),
  };
  const result = await ws.gate.admit(envelope);
  assert.equal(result.status, 200, `the concurrent human op must admit (got ${String(result.status)})`);
}

/* ── §8 stale observed state → the 409 envelope ───────────────────────── */

test('a stale observed state answers the 409 envelope: canonical update, retry cursor, external hash/diff — and the external file is NEVER touched', async () => {
  const ws = workspace();
  const source = '<Button label="Save">Click</Button>\n<Status mode="on" />\n';
  const first = await ws.station.ingestFile(ws.page, source);
  assert.equal(first.status, 200);
  assert.equal(ws.files.writes.length, 1, 'the successful ingest wrote the canonical projection back');

  // the external writer drifts two prop buffers ON THE PROJECTED FILE (ids intact)
  const external = first.rewrittenSource.replace('label="Save"', 'label="New"').replace('mode="on"', 'mode="off"');
  ws.files.externalWrite(ws.page, external);

  // observed recorded at read time, BEFORE a concurrent canonical op lands
  const observed = {
    frontier: ws.kernel.frontiers(),
    hash: sha256(external),
    projectionHash: sha256(projectSource(ws.kernel, ws.page).source),
  };
  await humanReplace(ws, 'human:c1', 'a1', 't-0', 'Clicked'); // same-buffer family, DIFFERENT buffer than the drift

  const outcome = await ws.station.ingestFile(ws.page, external, { observed });
  assert.equal(outcome.status, 409);
  assert.equal(outcome.code, 'stale-or-unknown-frontier');
  assert.equal(outcome.path, ws.page);
  assert.ok(outcome.canonicalUpdate.byteLength > 0, 'the envelope carries the canonical increment from the observed frontier');
  assert.deepEqual(outcome.syncCursor, { kind: 'frontier', value: ws.kernel.frontiers() }, 'the retry cursor is canonical NOW');
  assert.equal(outcome.externalHash, sha256(external));
  assert.ok(outcome.externalSource === external, 'the rebase input rides the envelope');
  // the diff is component/buffer-granular and THREE-WAY: label and mode are
  // external drift; the slot only CANONICAL moved — not drift, it survives
  const changed = outcome.externalDiff.filter((entry) => entry.kind === 'buffer-change').map((entry) => `${entry.componentId}:${entry.buffer}`).sort();
  assert.deepEqual(changed, ['a1:label', 'a2:mode'], 'external drift only — canonical-only movement is never counted as drift');
  assert.ok(outcome.canonicalProjection !== undefined && outcome.canonicalProjection.includes('>Clicked<'));

  // §8's hard law: canonical keeps its truth, the external file keeps ITS bytes
  assert.equal(ws.kernel.bufferText('b:a1:p-label'), 'Save', 'nothing landed — canonical is untouched');
  assert.equal(ws.kernel.bufferText('b:a1:t-0'), 'Clicked');
  assert.equal(ws.files.read(ws.page), external, 'the 409 lane never overwrites the external file');
  assert.equal(ws.files.writes.length, 1, 'no write-back on the 409 lane');
  // no ops landed: the only text commits are the ingest seeds + the human op
  assert.ok(commits(ws.kernel).every((row) => row.opId !== 'file-system:409'));
});

test('a fresh-observed ingest (same synchronous section) can never go stale — the 200 lane stays the default', async () => {
  const ws = workspace();
  const outcome = await ws.station.ingestFile(ws.page, '<Button label="Save">Go</Button>\n');
  assert.equal(outcome.status, 200);
  assert.equal(outcome.idempotent, false);
  const again = await ws.station.ingestFile(ws.page, projectSource(ws.kernel, ws.page).source);
  assert.equal(again.status, 200);
  assert.equal(again.idempotent, true);
});

test('observed/source disagreement is a caller bug (TypeError), never an adjudication', async () => {
  const ws = workspace();
  await ws.station.ingestFile(ws.page, '<Button>Go</Button>\n');
  await assert.rejects(
    ws.station.ingestFile(ws.page, '<Card />\n', { observed: { frontier: ws.kernel.frontiers(), hash: sha256('<Other />\n') } }),
    (error: unknown) => error instanceof TypeError,
  );
});

/* ── §8 rebase: the buffer-granular diff lands, BOTH sides coexist ────── */

test('rebase lands the external diff against canonical NOW — the concurrent human edit and the external drift COEXIST (p19\u2019s production form)', async () => {
  const ws = workspace();
  const source = '<Button label="Save">Click</Button>\n<Status mode="on" />\n';
  const first = await ws.station.ingestFile(ws.page, source);
  const external = first.rewrittenSource.replace('label="Save"', 'label="New"').replace('mode="on"', 'mode="off"');
  ws.files.externalWrite(ws.page, external);
  const observed = {
    frontier: ws.kernel.frontiers(),
    hash: sha256(external),
    projectionHash: sha256(projectSource(ws.kernel, ws.page).source),
  };
  await humanReplace(ws, 'human:c1', 'a1', 't-0', 'Clicked');
  const stale: StaleIngest = await ws.station.ingestFile(ws.page, external, { observed });
  assert.equal(stale.status, 409);

  const rebased = await ws.station.rebase(stale);
  assert.equal(rebased.status, 200);
  assert.equal(rebased.rebased, true);
  assert.equal(rebased.idempotent, false);
  assert.deepEqual(
    rebased.landed!.filter((entry) => entry.kind === 'buffer-change').map((entry) => `${entry.componentId}:${entry.buffer}`).sort(),
    ['a1:label', 'a2:mode'],
    'the envelope\u2019s buffer diff is exactly what landed',
  );
  assert.deepEqual(rebased.deferred, [], 'a value-only drift defers nothing');

  // external won where it drifted…
  assert.equal(ws.kernel.bufferText('b:a1:p-label'), 'New');
  assert.equal(ws.kernel.bufferText('b:a2:p-mode'), 'off');
  // …and the concurrent canonical edit SURVIVED (p19: preservedConcurrentEdit)
  assert.equal(ws.kernel.bufferText('b:a1:t-0'), 'Clicked');

  // the replace ops are journaled file-system ops (attribution + idempotency receipts)
  const replaces = commits(ws.kernel).filter((row) => row.domain === 'text' && row.kind === 'replace' && row.actor === FILE_SYSTEM_ACTOR);
  assert.equal(replaces.length, 2);
  assert.ok(replaces.every((row) => ws.kernel.receiptFor(row.opId) !== undefined));

  // §8 convergence: file == canonical projection, byte-exact, and the fixed
  // point re-ingests as a no-op
  const projection = projectSource(ws.kernel, ws.page).source;
  assert.ok(projection.includes('label="New"') && projection.includes('>Clicked<') && projection.includes('mode="off"'));
  assert.equal(ws.files.read(ws.page), projection);
  const converged = await ws.station.ingestFile(ws.page, projection);
  assert.equal(converged.status, 200);
  assert.equal(converged.idempotent, true);
});

test('rebase also adopts NEW external components (tree inserts, parent-aware) while canonical edits survive', async () => {
  const ws = workspace();
  const source = '<Button label="Save">Click</Button>\n';
  const first = await ws.station.ingestFile(ws.page, source);
  const external = `${first.rewrittenSource}<Badge note="hi">new</Badge>\n`;
  ws.files.externalWrite(ws.page, external);
  const observed = {
    frontier: ws.kernel.frontiers(),
    hash: sha256(external),
    projectionHash: sha256(projectSource(ws.kernel, ws.page).source),
  };
  await humanReplace(ws, 'human:c1', 'a1', 't-0', 'Clicked'); // canonical moves → stale
  const stale = await ws.station.ingestFile(ws.page, external, { observed });
  assert.equal(stale.status, 409);
  assert.ok(stale.externalDiff.some((entry) => entry.kind === 'new-component' && entry.componentId === 'a2'));

  const rebased = await ws.station.rebase(stale);
  assert.deepEqual(rebased.treeInserts, ['a2'], 'the new component adopted through admission');
  assert.equal(ws.kernel.bufferText('b:a2:p-note'), 'hi');
  assert.equal(ws.kernel.bufferText('b:a1:t-0'), 'Clicked', 'the concurrent edit survived the structural rebase too');
  assert.equal(rebased.scaffoldStale, true, 'a structural addition changes the scaffold — reported (kernel gap), not silently rewritten');
  assert.ok(rebased.deferred!.some((entry) => entry.kind === 'scaffold-change'));
});

test('an externally DELETED component is reported (removed-component), never auto-removed by the station', async () => {
  const ws = workspace();
  const source = '<Button label="Save">Click</Button>\n<Status mode="on" />\n';
  const first = await ws.station.ingestFile(ws.page, source);
  const external = first.rewrittenSource.replace(/<Status id="a2"[^>]*>\n?/, ''); // Status deleted externally
  assert.ok(!external.includes('Status'), 'the external writer removed the component');
  ws.files.externalWrite(ws.page, external);
  const observed = {
    frontier: ws.kernel.frontiers(),
    hash: sha256(external),
    projectionHash: sha256(projectSource(ws.kernel, ws.page).source),
  };
  await humanReplace(ws, 'human:c1', 'a1', 't-0', 'Clicked');
  const stale = await ws.station.ingestFile(ws.page, external, { observed });
  const rebased = await ws.station.rebase(stale);
  const removals = rebased.deferred!.filter((entry) => entry.kind === 'removed-component');
  assert.deepEqual(removals.map((entry) => entry.componentId), ['a2'], 'the deletion is DEFERRED — a policy decision, not the station\u2019s');
  assert.ok(ws.kernel.treeNodeOf('a2') !== undefined, 'canonical keeps the component (tombstone policy is the conflict surface\u2019s)');
});

/* ── §8 atomic write-back (real fs: temp + rename + hash check) ───────── */

test('the happy-path write-back is atomic and byte-exact: projection on disk, no temp lingers, journal has the receipt', async (t) => {
  const dir = mkdtempSync(join(tmpdir(), 'jixoai-resync-write-'));
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const page = join(dir, 'home.svelte');
  writeFileSync(page, '<Button label="Save">Click</Button>\n', 'utf8');

  const kernel = CollabKernel.open(new MemoryCollabStore());
  const station = new ResyncStation(kernel, new AdmissionGate(kernel), { files: nodeProjectionFiles() });
  station.onFileChange(page);
  await station.flush();

  const projection = projectSource(kernel, page).source;
  assert.equal(readFileSync(page, 'utf8'), projection, 'the file now holds the canonical projection (ids injected)');
  assert.ok(projection.includes('<Button id="a1"'));
  assert.equal(existsSync(`${page}.projection-tmp`), false, 'the temp file is gone — rename, not copy');
  assert.deepEqual(
    station.projectionJournal().map((entry) => entry.type),
    ['projection-written'],
    'the write landed its receipt row',
  );
  assert.equal(station.lastOutcome(page)!.status, 200);
});

/* ── §8 projection-pending: failed write-back is recoverable, never rolled back ── */

test('a failed write-back records projection-pending: canonical stays committed, nothing else is written, flushPendingProjections recovers', async () => {
  const ws = workspace();
  ws.files.failWrites = true;
  const outcome = await ws.station.ingestFile(ws.page, '<Button label="Save">Click</Button>\n');
  assert.equal(outcome.status, 200, 'canonical + journal landed — the write-back failure is NOT a rollback');
  assert.equal(ws.kernel.bufferText('b:a1:p-label'), 'Save');
  assert.equal(ws.files.writes.length, 0, 'no write succeeded (不另写)');

  const pending = ws.station.projectionJournal().find((entry) => entry.type === 'projection-pending');
  assert.ok(pending !== undefined && pending.projectionHash === sha256(projectSource(ws.kernel, ws.page).source));
  assert.match(pending.reason, /injected write failure/);

  // recovery: the adapter heals, the worklist retries against CURRENT canonical
  ws.files.failWrites = false;
  const flushed = await ws.station.flushPendingProjections();
  assert.equal(flushed, 1);
  assert.equal(ws.files.read(ws.page), projectSource(ws.kernel, ws.page).source, 'converged after recovery');
  const row = ws.station.projectionJournal().find((entry) => entry.type === 'projection-pending');
  assert.ok(row !== undefined && row.flushedAt !== undefined, 'the pending row carries its flush marker');
  // re-flushing is a no-op (the worklist is idempotent)
  assert.equal(await ws.station.flushPendingProjections(), 0);
});

test('a hash-mismatch after rename (corrupted bytes) is caught by the final hash check and recorded as pending', async () => {
  const ws = workspace();
  ws.files.corruptWrites = true;
  await ws.station.ingestFile(ws.page, '<Button label="Save">Click</Button>\n');
  const pending = ws.station.projectionJournal().find((entry) => entry.type === 'projection-pending');
  assert.ok(pending !== undefined);
  assert.match(pending.reason, /hash mismatch/);
  assert.notEqual(ws.files.read(ws.page), projectSource(ws.kernel, ws.page).source, 'the corrupted file is left as-is — no second write');

  ws.files.corruptWrites = false;
  await ws.station.flushPendingProjections();
  assert.equal(ws.files.read(ws.page), projectSource(ws.kernel, ws.page).source, 'recovery converges the file');
});

/* ── §8 the watcher seam (API + tests only — server wiring is M6) ─────── */

test('onFileChange requires the file adapter — the seam refuses to run half-wired (M6 owns the wiring)', () => {
  const kernel = CollabKernel.open(new MemoryCollabStore());
  const station = new ResyncStation(kernel);
  assert.throws(() => station.onFileChange('pages/home.svelte'), (error: unknown) => error instanceof TypeError);
});

test('watcher bursts collapse into ONE read-observe-ingest and the LATEST content wins (debounce law)', async () => {
  const ws = workspace();
  // a manual scheduler: deterministic, no real timers
  const timers: { fn: () => void; cleared: boolean }[] = [];
  const scheduler = {
    setTimeout: (fn: () => void, _ms: number) => {
      timers.push({ fn, cleared: false });
      return timers.length - 1;
    },
    clearTimeout: (handle: unknown) => {
      timers[handle as number]!.cleared = true;
    },
  };
  const kernel = CollabKernel.open(new MemoryCollabStore());
  const files = new MemoryFiles();
  const station = new ResyncStation(kernel, new AdmissionGate(kernel), { files, debounceMs: 10, scheduler });
  const page = 'pages/watched.svelte';

  files.externalWrite(page, '<A />\n');
  station.onFileChange(page);
  files.externalWrite(page, '<A />\n<B />\n');
  station.onFileChange(page); // re-arms the SAME window (clearTimeout + new timer)
  files.externalWrite(page, '<A />\n<B />\n<C />\n');
  station.onFileChange(page);

  assert.equal(timers.length, 3);
  assert.deepEqual(timers.map((timer) => timer.cleared), [true, true, false], 'earlier arms were cleared — one live window');

  for (const timer of timers) if (!timer.cleared) timer.fn();
  await station.flush();

  const outcome = station.lastOutcome(page);
  assert.equal(outcome!.status, 200);
  assert.deepEqual(outcome!.adoptions.map((adoption) => adoption.id), ['a1', 'a2', 'a3'], 'ONE ingest of the LATEST content');
  assert.equal(files.reads, 2, 'one fire-time ingest read + one write-back fixed-point probe — never one read per event');
  assert.equal(files.writes.length, 1, 'one projection write-back');
  assert.equal(files.read(page), projectSource(kernel, page).source, 'the watcher path converges file and canonical');
});

test('an idempotent watcher fire (file already at the fixed point) writes nothing', async () => {
  const ws = workspace();
  const first = await ws.station.ingestFile(ws.page, '<Button label="Save">Click</Button>\n');
  assert.equal(ws.files.writes.length, 1);
  const second = await ws.station.ingestFile(ws.page, first.rewrittenSource);
  assert.equal(second.status, 200);
  assert.equal(second.idempotent, true);
  assert.equal(ws.files.writes.length, 1, 'the fixed point on disk is left untouched');
});

/* ── §3 literal-expression buffers + the W4② regression (M6 收敛轮) ───── */

test('braced literal props are buffers (§3): every literal kind round-trips byte-exactly, quote style included', async () => {
  const ws = workspace();
  const source = `<Card raised={true} ghost={false} size={42} ratio={3.14} name={'ghost'} note={"dq"}>body</Card>\n`;
  const report = await ws.station.ingestFile(ws.page, source);
  assert.equal(report.status, 200);

  // every literal is a BUFFER holding the raw expression bytes (§3's
  // 「按其文本序列化值处理，同词表」— the frozen round-trip note)
  assert.equal(ws.kernel.bufferText('b:a1:p-raised'), 'true');
  assert.equal(ws.kernel.bufferText('b:a1:p-ghost'), 'false');
  assert.equal(ws.kernel.bufferText('b:a1:p-size'), '42');
  assert.equal(ws.kernel.bufferText('b:a1:p-ratio'), '3.14');
  assert.equal(ws.kernel.bufferText('b:a1:p-name'), "'ghost'", 'the QUOTE STYLE is buffer content');
  assert.equal(ws.kernel.bufferText('b:a1:p-note'), '"dq"');

  // byte-exact fixed point: the projection re-renders the file verbatim
  const projection = projectSource(ws.kernel, ws.page).source;
  assert.equal(projection, report.rewrittenSource);
  assert.ok(projection.includes("name={'ghost'}") && projection.includes('note={"dq"}') && projection.includes('ratio={3.14}'));
  assert.equal(ws.files.read(ws.page), projection, 'write-back converged the file');

  // nothing was skipped — literals left the scaffold's skip list
  assert.deepEqual(report.skipped, []);
});

test('arbitrary expressions stay scaffold: identifiers, arithmetic, multi-part, directives — listed, never buffers', async () => {
  const ws = workspace();
  const source = `<Card tone={title} count={n + 1} mix="a{b}c" bind:value={v}>x</Card>\n`;
  const report = await ws.station.ingestFile(ws.page, source);
  assert.deepEqual(
    report.skipped.filter((skip) => skip.componentId === 'a1').map((skip) => skip.name),
    ['tone', 'count', 'mix', 'bind:value'],
  );
  assert.equal(report.skipped.find((skip) => skip.name === 'tone')?.why, 'expression prop — not a text-serializable literal');
  // scaffold bytes round-trip verbatim (the projection is the fixed point)
  assert.equal(projectSource(ws.kernel, ws.page).source, report.rewrittenSource);
});

test('an admitted op on a braced-literal buffer re-projects inside the braces (raised={true} → {false})', async () => {
  const ws = workspace();
  await ws.station.ingestFile(ws.page, '<Card raised={true}>x</Card>\n');
  await humanReplace(ws, 'human:1', 'a1', 'raised', 'false');
  assert.equal(ws.kernel.bufferText('b:a1:p-raised'), 'false');
  assert.equal(projectSource(ws.kernel, ws.page).source, '<Card id="a1" raised={false}>x</Card>\n');
});

test('W4② regression: a panel-shaped boolean prop edit SURVIVES the watcher window (the fresh lane lands its drift)', async () => {
  const ws = workspace();
  const first = await ws.station.ingestFile(ws.page, '<Button label="Save" raised={true}>Click</Button>\n');
  assert.ok(first.rewrittenSource.includes('raised={true}'));
  assert.equal(ws.files.read(ws.page), projectSource(ws.kernel, ws.page).source, 'converged at {true}');

  // the panel's pre-M7 CAS lane writes the file directly (prop-edit.ts's
  // canonical boolean rendering: {${String(value)}}) — this is the byte
  // pattern the M6 walk-through caught being silently rolled back
  ws.files.externalWrite(ws.page, first.rewrittenSource.replace('raised={true}', 'raised={false}'));
  ws.station.onFileChange(ws.page);
  await ws.station.flush();

  assert.equal(ws.kernel.bufferText('b:a1:p-raised'), 'false', 'the boolean edit landed in canonical');
  const projection = projectSource(ws.kernel, ws.page).source;
  assert.ok(projection.includes('raised={false}'));
  assert.equal(ws.files.read(ws.page), projection, 'the file converged on the EDIT, not the rollback');
  const replaces = commits(ws.kernel).filter(
    (row) => row.domain === 'text' && row.kind === 'replace' && row.actor === FILE_SYSTEM_ACTOR && row.containerKey === 'b:a1:p-raised',
  );
  assert.equal(replaces.length, 1, 'ONE journaled file-system replace — attributed, idempotent, never silent');
});

test('fresh-lane drift landing is THREE-WAY: the concurrent canonical op on another buffer survives', async () => {
  const ws = workspace();
  const first = await ws.station.ingestFile(ws.page, '<Button label="Save">Click</Button>\n');
  // canonical moves the SLOT while the external writer drifts the LABEL
  await humanReplace(ws, 'human:c1', 'a1', 't-0', 'Clicked');
  ws.files.externalWrite(ws.page, first.rewrittenSource.replace('label="Save"', 'label="New"'));
  ws.station.onFileChange(ws.page);
  await ws.station.flush();

  assert.equal(ws.kernel.bufferText('b:a1:p-label'), 'New', 'the external drift landed (kernel gap ① repaid)');
  assert.equal(ws.kernel.bufferText('b:a1:t-0'), 'Clicked', 'the concurrent canonical op survived (canonical-only movement is never drift)');
  assert.equal(ws.files.read(ws.page), projectSource(ws.kernel, ws.page).source, 'converged with BOTH sides');
});

/* ── the §8 write-back guard (never silently overwrite) ────────────────── */

test('the write-back guard: a deferred scaffold change keeps the external bytes — never a silent revert', async () => {
  const ws = workspace();
  await ws.station.ingestFile(ws.page, '<Button label="Save">Click</Button>\n<Card />\n');
  // structural external edit: a wrapping div moves scaffold bytes
  const external = ws.files
    .read(ws.page)
    .replace('<Button id="a1"', '<div>\n<Button id="a1"')
    .replace('</Button>', '</Button>\n</div>');
  assert.ok(external.includes('<div>'));
  ws.files.externalWrite(ws.page, external);

  const outcome = await ws.station.ingestFile(ws.page, external);
  assert.equal(outcome.status, 200);
  assert.ok(outcome.writeBackGuard !== undefined, 'the guard fired and surfaced on the outcome');
  assert.ok(outcome.writeBackGuard!.deferred.some((entry) => entry.kind === 'scaffold-change'), 'the deferred details ride the envelope');
  assert.ok(outcome.writeBackGuard!.reason.length > 0);
  assert.equal(ws.files.read(ws.page), external, 'the external scaffold bytes stayed — NOT overwritten');
  assert.equal(
    ws.station.projectionJournal().filter((entry) => entry.type === 'projection-written').length,
    1,
    'no second projection write happened (the adoption write is the only one)',
  );
});

test('an externally hand-edited ARBITRARY expression prop is never overwritten (scaffold bytes — the guard holds)', async () => {
  const ws = workspace();
  await ws.station.ingestFile(ws.page, '<Input tone={title} label="Save">x</Input>\n');
  // the hand edit retargets the expression — not text-serializable, pure scaffold bytes
  const external = ws.files.read(ws.page).replace('tone={title}', 'tone={subtitle}');
  ws.files.externalWrite(ws.page, external);

  const outcome = await ws.station.ingestFile(ws.page, external);
  assert.equal(outcome.status, 200);
  assert.ok(outcome.writeBackGuard !== undefined, 'scaffold bytes moved — the write-back was skipped');
  assert.ok(ws.files.read(ws.page).includes('tone={subtitle}'), 'the hand edit survived the cycle');
});
