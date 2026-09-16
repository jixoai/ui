/**
 * collab-host.test.ts — the M6b integration tests: the design server's
 * collab kernel HOST (collab-host.ts) over a temp design workspace —
 * idempotent open/dispose with identity continuity across reopen, the
 * §8 host cycle for hand edits (journal accounting as actor
 * `file-system`, atomic write-back, idempotence — no ingest storm),
 * the self-write guard (HMR loop), the dsh file-system actor lane
 * (routeTurnWrites + chat-visible envelopes), the genuine station 409
 * → resolveStale and the host's three-way rebase with concurrent agent
 * ops surviving, panel-shaped direct-write interleaving, the watcher
 * layer (host-owned fs.watch + the vite adapter) with handle-release
 * evidence, projection-pending recovery at reopen, and the REAL
 * createDesignViteServer hosting (collab attached, disposed on close,
 * no port — middlewareMode-free create/close only).
 *
 * Original need: collab-protocol M6b (2026-09-15).
 */

import { strict as assert } from 'node:assert';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test, { type TestContext } from 'node:test';

import { routeTurnWrites } from '../agent/dsh.ts';
import { resolveCollabApiRequest } from './collab-api.ts';
import { projectSource, treeItemsOf } from './collab/bridge.ts';
import { cliUpdate } from './collab/cli.ts';
import type { CommitJournalEntry } from './collab/types.ts';
import {
  findCollabHost,
  fsWatchDesignDir,
  openCollabHost,
  viteWatcherAdapter,
  type CollabHost,
  type CollabHostOptions,
  type HostFileWatcher,
  type OwnedFileWatcher,
} from './collab-host.ts';
import type { ProjectionFileAdapter } from './collab/resync.ts';

/* ── scaffolding ──────────────────────────────────────────────────────── */

const sha256 = (text: string): string => createHash('sha256').update(text).digest('hex');

interface Workspace {
  readonly root: string;
  readonly designDir: string;
  readonly host: CollabHost;
  readonly page: string;
  readonly pageAbs: string;
  readonly writePage: (source: string) => void;
  readonly readPage: () => string;
}

/**
 * A temp design workspace + hosted kernel. The default factory opts
 * OUT of the passive fs watcher (deterministic cycles — tests route
 * events explicitly); watcher tests pass options through.
 *
 * KERNEL-GAP BOUNDARY (M5 leftover ②, honored by every test here):
 * structural edits to an ALREADY-INGESTED page cannot round-trip —
 * the scaffold rewrite awaits the tree data-update op. The tree/journal
 * side of a structural change lands (component adopted, counter
 * advanced) but the projection cannot render it, so structural
 * additions are tested through FRESH pages (full adoption) and
 * structural removals through the DEFERRED envelope, never by
 * asserting a structural file round-trip.
 */
function workspace(t: TestContext, options: CollabHostOptions & { initial?: string } = {}): Workspace {
  const root = mkdtempSync(join(tmpdir(), 'jx-collab-host-'));
  const designDir = join(root, 'design');
  const page = 'prototypes/demo/canvas.svelte';
  const pageAbs = join(designDir, page);
  mkdirSync(join(designDir, 'prototypes', 'demo'), { recursive: true });
  writeFileSync(pageAbs, options.initial ?? '<Button label="Save">Click</Button>\n');
  const { initial: _initial, ...hostOptions } = options;
  const host = openCollabHost(designDir, { ownFsWatch: false, ...hostOptions });
  t.after(() => {
    void host.dispose();
    rmSync(root, { recursive: true, force: true });
  });
  return {
    root,
    designDir,
    host,
    page,
    pageAbs,
    writePage: (source) => writeFileSync(pageAbs, source),
    readPage: () => readFileSync(pageAbs, 'utf8'),
  };
}

/** commit rows, optionally for one actor */
const commitsOf = (host: CollabHost, actor?: string): readonly CommitJournalEntry[] =>
  host.kernel.journalEntries().filter((entry): entry is CommitJournalEntry => entry.type === 'commit' && (actor === undefined || entry.actor === actor));

const journalCount = (host: CollabHost): number => host.kernel.journalEntries().length;

/** poll until the predicate holds (fs.watch events are asynchronous) */
async function until(predicate: () => boolean, what: string, ms = 4000): Promise<void> {
  const started = Date.now();
  while (!predicate()) {
    if (Date.now() - started > ms) throw new Error(`timeout waiting for ${what}`);
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
}

/** one agent-CLI op through the host's shared gate (the concurrent-actor double) */
async function agentOp(ws: Workspace, opId: string, buffer: string, patch: string): Promise<void> {
  const result = await cliUpdate(ws.host.gate, { actor: 'agent:test', componentId: 'a1', buffer, patch });
  assert.equal(result.status, 200, `the agent op must admit (got ${String(result.status)})`);
  assert.ok(result.receipts.every((receipt) => receipt.status === 'accepted'), `agent op ${opId} landed cleanly`);
}

/* ── hosting: idempotent open, dispose, identity continuity ───────────── */

test('open is idempotent per workspace (one kernel per journal); dispose unregisters; reopen recovers identity continuity', async (t) => {
  const ws = workspace(t);
  assert.equal(openCollabHost(ws.designDir), ws.host, 'a second open reuses the SAME host instance');
  assert.equal(findCollabHost(ws.designDir), ws.host, 'the registry probe finds it without creating');

  // page a adopts (a1); a SECOND page adopts fresh (letter b — full
  // adoption round-trips; the letter table survives the reopen test)
  assert.equal((await ws.host.syncExternalChange(ws.pageAbs)).kind, 'adopted');
  const freshAbs = join(ws.designDir, 'prototypes', 'fresh', 'canvas.svelte');
  mkdirSync(join(ws.designDir, 'prototypes', 'fresh'), { recursive: true });
  writeFileSync(freshAbs, '<Card label="Second page">x</Card>\n');
  assert.equal((await ws.host.syncExternalChange(freshAbs)).kind, 'adopted');
  assert.ok(readFileSync(freshAbs, 'utf8').includes('id="b1"'), 'the second page drew letter b');

  const beforeCount = journalCount(ws.host);
  await ws.host.dispose();
  assert.ok(ws.host.disposed, 'the disposed flag is set');
  assert.equal(findCollabHost(ws.designDir), undefined, 'dispose unregisters the workspace');

  // reopen replays the journal: the counter of page a CONTINUES (the
  // structural add is scaffold-deferred — the kernel gap — but the
  // identity mint must not reset or reuse)
  const reopened = openCollabHost(ws.designDir, { ownFsWatch: false });
  assert.notEqual(reopened, ws.host, 'reopen builds a fresh instance over the same journal');
  assert.equal(journalCount(reopened), beforeCount, 'the journal replays byte-identically');
  ws.writePage(ws.readPage().replace('</Button>', '</Button>\n<Badge note="x" />\n'));
  const outcome = await reopened.syncExternalChange(ws.pageAbs);
  assert.equal(outcome.kind, 'rebased');
  assert.deepEqual(outcome.report?.treeInserts, ['a2'], 'the reopened ledger minted a2 — the counter continues (no reset, no reuse)');
  assert.ok(reopened.kernel.treeNodeOf('a2') !== undefined, 'the new component lives in the tree');
  await reopened.dispose();
});

/* ── the §8 host cycle: hand edits land, are accounted, converge, and do not storm ── */

test('an external hand edit lands through admission (actor file-system), writes back atomically, and re-routes idempotently', async (t) => {
  const ws = workspace(t);
  assert.equal((await ws.host.syncExternalChange(ws.pageAbs)).kind, 'adopted');
  assert.ok(ws.readPage().includes('<Button id="a1"'), 'adoption injected the native id and wrote back the projection');

  // the hand edit: an editor-style save of a drifted prop
  ws.writePage(ws.readPage().replace('label="Save"', 'label="New"'));
  const outcome = await ws.host.syncExternalChange(ws.pageAbs);
  assert.equal(outcome.kind, 'rebased');
  assert.equal(ws.host.kernel.bufferText('b:a1:p-label'), 'New', 'the drift landed in canonical');

  const fileSystemReplaces = commitsOf(ws.host, 'file-system').filter((row) => row.domain === 'text' && row.kind === 'replace');
  assert.equal(fileSystemReplaces.length, 1, 'the drift is journaled as ONE file-system replace');
  assert.equal(ws.readPage(), projectSource(ws.host.kernel, ws.page).source, 'the file holds the canonical projection byte-exactly');
  assert.ok(ws.readPage().includes('label="New"'));
  assert.equal(existsSync(`${ws.pageAbs}.projection-tmp`), false, 'atomic write-back left no temp file');

  // idempotence: the same change again runs NO cycle (no ingest storm)
  const journalBefore = journalCount(ws.host);
  const again = await ws.host.syncExternalChange(ws.pageAbs);
  assert.equal(again.kind, 'idempotent');
  assert.equal(journalCount(ws.host), journalBefore, 'zero new journal rows — the fixed point is free');
});

test('watcher bursts for one path collapse into ONE cycle and the LATEST content wins', async (t) => {
  const ws = workspace(t);
  ws.host.routeFileEvent(ws.pageAbs, 'change');
  ws.writePage('<Button label="One">x</Button>\n<Card label="Two">y</Card>\n');
  ws.host.routeFileEvent(ws.pageAbs, 'change');
  ws.writePage('<Button label="One">x</Button>\n<Card label="Two">y</Card>\n<Badge note="three" />\n');
  ws.host.routeFileEvent(ws.pageAbs, 'change');
  await ws.host.flush();
  assert.ok(ws.readPage().includes('id="a3"'), 'ONE ingest of the LATEST content (a1+a2+a3, not intermediate states)');
  const adoption = ws.host.station.lastOutcome(ws.page);
  assert.equal(adoption?.status, 200);
});

test('non-page files never route (md/json/dot-dirs), and unlink events are ignored', async (t) => {
  const ws = workspace(t);
  await ws.host.syncExternalChange(ws.pageAbs); // adopt baseline
  const before = journalCount(ws.host);
  ws.host.routeFileEvent(join(ws.designDir, 'README.md'), 'change');
  ws.host.routeFileEvent(join(ws.designDir, '.jx-collab', 'journal.ndjson'), 'change');
  ws.host.routeFileEvent(ws.pageAbs, 'unlink');
  await ws.host.flush();
  assert.equal(journalCount(ws.host), before, 'nothing routed — journal quiet');
});

/* ── the self-write guard (HMR loop protection) + the converge-aligned root fix ── */

test('the echo of the station\'s own write-back never arms a second INGEST cycle — but an out-of-band canonical advance converges (the M7a root fix)', async (t) => {
  const ws = workspace(t);
  await ws.host.syncExternalChange(ws.pageAbs); // adopt (write-back #1 recorded)
  ws.writePage(ws.readPage().replace('label="Save"', 'label="Edited"'));
  const rebased = await ws.host.syncExternalChange(ws.pageAbs); // write-back #2 recorded
  assert.equal(rebased.kind, 'rebased');

  // make the recorded base STALE (an agent op moves canonical; no file
  // write happens — the M7a out-of-band shape) so ONLY the held-hash
  // guards can justify skipping the INGEST cycle
  await agentOp(ws, 'agent:1', 't-0', '#1:1\n!5 Tapped');
  const outcomeBefore = ws.host.station.lastOutcome(ws.page);
  const journalBefore = journalCount(ws.host);

  // the echo event for the station's own write-back (same bytes): the
  // CONVERGE-ALIGNED law (M7 收官轮) — the held projection justifies no
  // ingest, but the file lagging the CURRENT projection is no longer an
  // "idempotent" answer: the current projection is PUSHED atomically
  const outcome = await ws.host.syncExternalChange(ws.pageAbs);
  assert.equal(outcome.kind, 'written', 'the out-of-band advance pushed the current projection');
  assert.equal(ws.host.station.lastOutcome(ws.page), outcomeBefore, 'the station ran NO ingest cycle — the guards skipped pre-station');
  assert.equal(journalCount(ws.host), journalBefore, 'no journal movement (the push admits nothing)');
  assert.equal(ws.host.kernel.bufferText('b:a1:t-0'), 'Tapped', 'the concurrent agent op survived untouched');
  assert.equal(ws.readPage(), projectSource(ws.host.kernel, ws.page).source, 'the file converged to the current projection');
  assert.ok(ws.readPage().includes('>Tapped<'), 'the pushed bytes carry the agent op (the browser converges via HMR)');

  // the push's own echo settles as a true idempotent (file == current projection)
  const echo = await ws.host.syncExternalChange(ws.pageAbs);
  assert.equal(echo.kind, 'idempotent');
  assert.equal(journalCount(ws.host), journalBefore, 'still no journal movement');
});

test('a direct drive after an out-of-band canonical advance converges the file (the retired M7a consumption-side lane\'s successor)', async (t) => {
  const ws = workspace(t);
  await ws.host.syncExternalChange(ws.pageAbs);
  await ws.host.syncExternalChange(ws.pageAbs); // settle the convergence marker

  // the panel-lane shape: an admitted op with NO file event (driveProjection
  // used to write the file itself — the host now owns the push)
  await agentOp(ws, 'agent:1', 'label', '#1:1\n!4 Ship');
  assert.equal(ws.host.kernel.bufferText('b:a1:p-label'), 'Ship');
  assert.ok(!ws.readPage().includes('Ship'), 'the file still holds the prior projection (no file event)');

  const outcome = await ws.host.syncExternalChange(ws.pageAbs);
  assert.equal(outcome.kind, 'written');
  assert.ok(ws.readPage().includes('label="Ship"'), 'the drive pushed the current projection');
  assert.equal(ws.readPage(), projectSource(ws.host.kernel, ws.page).source);

  // a hand edit that raced PAST the held bytes still owns the full cycle
  ws.writePage(ws.readPage().replace('>Click<', '>Tap<'));
  const drift = await ws.host.syncExternalChange(ws.pageAbs);
  assert.equal(drift.kind, 'rebased', 'a genuine edit never takes the push lane');
  assert.equal(ws.host.kernel.bufferText('b:a1:t-0'), 'Tap');
  assert.equal(ws.readPage(), projectSource(ws.host.kernel, ws.page).source);
});

/* ── the dsh lane (file-system actor): routeTurnWrites + envelopes ───── */

test('dsh-shaped subprocess writes are collected through the station: new pages adopt, drift lands as journal file-system ops, quiet on clean landings', async (t) => {
  const ws = workspace(t);
  await ws.host.syncExternalChange(ws.pageAbs); // the page already exists (previous turn)

  // the "subprocess" writes: a drifted prop + a brand-new page
  ws.writePage(ws.readPage().replace('label="Save"', 'label="Dsh"'));
  const newPageAbs = join(ws.designDir, 'prototypes', 'fresh', 'canvas.svelte');
  mkdirSync(join(ws.designDir, 'prototypes', 'fresh'), { recursive: true });
  writeFileSync(newPageAbs, '<Card label="Brand">new page</Card>\n');

  const result = await routeTurnWrites(ws.host, [ws.pageAbs, newPageAbs, join(ws.designDir, 'README.md')]);
  assert.deepEqual(result.envelopes, [], 'clean landings stay quiet in the chat log');
  assert.equal(result.entries.length, 2, 'only .svelte files route (the README does not)');
  assert.equal(result.entries[0]?.outcome.kind, 'rebased');
  assert.equal(result.entries[1]?.outcome.kind, 'adopted');
  assert.equal(result.entries[0]?.path, ws.page, 'the entry speaks the page-path vocabulary');
  assert.equal(ws.host.kernel.bufferText('b:a1:p-label'), 'Dsh', 'the drift landed');
  assert.ok(ws.host.kernel.bufferText('b:b1:p-label') === 'Brand' || readFileSync(newPageAbs, 'utf8').includes('id="'), 'the new page adopted (letter b — second page of the workspace)');
  assert.ok(commitsOf(ws.host, 'file-system').length > 0, 'the writes are journal-accounted as file-system ops');
});

test('dsh-lane deferred entries surface as chat-visible envelope lines (never silently dropped)', async (t) => {
  // two components from the START (full adoption — the scaffold holds both)
  const ws = workspace(t, { initial: '<Button label="Save">Click</Button>\n<Status mode="on" />\n' });
  assert.equal((await ws.host.syncExternalChange(ws.pageAbs)).kind, 'adopted');
  await ws.host.syncExternalChange(ws.pageAbs); // settle base

  // the subprocess DELETES a component and drifts a prop — the drift
  // lands, the removal policy is DEFERRED (kernel gap), both visible
  ws.writePage(ws.readPage().replace(/<Status id="a2"[^>]*>\n?/, '').replace('label="Save"', 'label="Dsh"'));
  const result = await routeTurnWrites(ws.host, [ws.pageAbs]);
  assert.equal(result.entries[0]?.outcome.kind, 'rebased');
  assert.equal(ws.host.kernel.bufferText('b:a1:p-label'), 'Dsh', 'the drift landed');
  assert.ok(
    result.entries[0]?.outcome.deferred?.some((item) => item.kind === 'removed-component'),
    'the removal is reported as deferred',
  );
  assert.ok(result.envelopes.length === 1 && result.envelopes[0]!.includes('removed-component'), 'the envelope line is chat-visible');
  // the M6 收敛轮 write-back guard, asserted honestly: the deferred
  // SCAFFOLD change keeps the external bytes authoritative — the file
  // is NOT converged (the removal stays removed in the file, never
  // silently reverted), while canonical keeps the component (the
  // tombstone policy stays the conflict surface's) and the guard rides
  // the outcome as a visible envelope
  assert.equal(result.entries[0]?.outcome.writeBackGuard, true, 'the guard surfaced on the outcome');
  assert.notEqual(ws.readPage(), projectSource(ws.host.kernel, ws.page).source, 'the file was NOT overwritten with the projection');
  assert.ok(!ws.readPage().includes('<Status'), 'the external removal STAYS in the file — reported, not silently reverted');
  assert.ok(ws.host.kernel.treeNodeOf('a2') !== undefined, 'canonical keeps the component');
});

/* ── §8 stale lane: the genuine station 409 + resolveStale ───────────── */

test('a pre-observed stale ingest answers the genuine station 409; host.resolveStale lands the envelope with BOTH sides coexisting', async (t) => {
  const ws = workspace(t);
  await ws.host.syncExternalChange(ws.pageAbs);
  await ws.host.syncExternalChange(ws.pageAbs); // settle base

  // external drift on label, observed recorded BEFORE a concurrent agent op
  const external = ws.readPage().replace('label="Save"', 'label="New"');
  ws.writePage(external);
  const observed = {
    frontier: ws.host.kernel.frontiers(),
    hash: sha256(external),
    projectionHash: sha256(projectSource(ws.host.kernel, ws.page).source),
  };
  await agentOp(ws, 'agent:1', 't-0', '#1:1\n!5 Tapped'); // canonical moves → the observed state goes stale

  const stale = await ws.host.station.ingestFile(ws.page, external, { observed });
  assert.equal(stale.status, 409);
  assert.equal(stale.code, 'stale-or-unknown-frontier');
  assert.ok(stale.canonicalUpdate.byteLength > 0, 'the envelope carries the canonical increment');
  assert.equal(ws.host.kernel.bufferText('b:a1:p-label'), 'Save', 'nothing landed on the 409 lane');
  assert.equal(ws.readPage(), external, 'the external file was never touched');

  const report = await ws.host.resolveStale(stale);
  assert.equal(report.status, 200);
  assert.equal(ws.host.kernel.bufferText('b:a1:p-label'), 'New', 'the external drift landed');
  assert.equal(ws.host.kernel.bufferText('b:a1:t-0'), 'Tapped', 'the concurrent agent op SURVIVED (three-way)');
  assert.equal(ws.readPage(), projectSource(ws.host.kernel, ws.page).source, 'the file converged');
  assert.ok(ws.readPage().includes('label="New"') && ws.readPage().includes('>Tapped<'));
});

/* ── host three-way: concurrent agent op + external write ─────────────── */

test('an external write racing a concurrent agent op (host cycle): both sides coexist through the three-way rebase', async (t) => {
  const ws = workspace(t);
  await ws.host.syncExternalChange(ws.pageAbs);
  await ws.host.syncExternalChange(ws.pageAbs); // settle base

  // canonical moves FIRST (agent op on label) — the file's base is now behind
  await agentOp(ws, 'agent:1', 'label', '#1:1\n!4 Ship');
  assert.equal(ws.host.kernel.bufferText('b:a1:p-label'), 'Ship');

  // then the human hand-edits the SLOT text on the (now behind) file
  ws.writePage(ws.readPage().replace('>Click<', '>Tap<'));
  const outcome = await ws.host.syncExternalChange(ws.pageAbs);
  assert.equal(outcome.kind, 'rebased');
  assert.equal(ws.host.kernel.bufferText('b:a1:t-0'), 'Tap', 'the external slot edit landed');
  assert.equal(ws.host.kernel.bufferText('b:a1:p-label'), 'Ship', 'the concurrent agent op survived (canonical-only movement is never drift)');
  const projection = projectSource(ws.host.kernel, ws.page).source;
  assert.equal(ws.readPage(), projection, 'converged');
  assert.ok(projection.includes('>Tap<') && projection.includes('label="Ship"'));
});

/* ── panel-shaped direct writes (the pre-M7 CAS lane) interleaved ────── */

test('panel-shaped direct writes interleaved with external writes: both land as file-system ops and the file converges', async (t) => {
  const ws = workspace(t);
  await ws.host.syncExternalChange(ws.pageAbs);

  // panel write: a direct CAS-style file save (the pre-M7 lane, prop-edit.ts shape)
  ws.writePage(ws.readPage().replace('label="Save"', 'label="Panel"'));
  ws.host.routeFileEvent(ws.pageAbs, 'change');
  await ws.host.flush();

  // external write interleaves right after (an editor save of the slot text)
  ws.writePage(ws.readPage().replace('>Click<', '>Hand<'));
  ws.host.routeFileEvent(ws.pageAbs, 'change');
  await ws.host.flush();

  assert.equal(ws.host.kernel.bufferText('b:a1:p-label'), 'Panel', 'the panel-shaped write landed');
  assert.equal(ws.host.kernel.bufferText('b:a1:t-0'), 'Hand', 'the external write landed');
  const fileSystemOps = commitsOf(ws.host, 'file-system');
  assert.ok(fileSystemOps.length >= 2, 'both writes are journal-accounted as file-system ops');
  assert.equal(ws.readPage(), projectSource(ws.host.kernel, ws.page).source, 'the file converged to the merged projection');
  assert.ok(ws.readPage().includes('label="Panel"') && ws.readPage().includes('>Hand<'));
});

/* ── W4② regression end-to-end (M6 收敛轮): boolean prop edits survive ── */

test('W4② regression (host lane): a panel-shaped BOOLEAN prop edit survives both the direct cycle and the debounce window', async (t) => {
  const ws = workspace(t, { initial: '<Button label="Save" raised={true}>Click</Button>\n' });
  assert.equal((await ws.host.syncExternalChange(ws.pageAbs)).kind, 'adopted');
  assert.ok(ws.readPage().includes('raised={true}'));

  // the pre-M7 CAS lane: prop-edit's canonical boolean rendering lands on the file
  ws.writePage(ws.readPage().replace('raised={true}', 'raised={false}'));
  const outcome = await ws.host.syncExternalChange(ws.pageAbs);
  assert.equal(outcome.kind, 'rebased');
  assert.equal(ws.host.kernel.bufferText('b:a1:p-raised'), 'false', 'the boolean edit landed in canonical (a literal-expression buffer now, §3)');
  assert.ok(ws.readPage().includes('raised={false}'), 'the file converged on the edit — no silent rollback');
  assert.equal(ws.readPage(), projectSource(ws.host.kernel, ws.page).source);
  assert.ok(
    commitsOf(ws.host, 'file-system').some((row) => row.domain === 'text' && row.containerKey === 'b:a1:p-raised'),
    'the drift is journaled as a file-system op on the raised buffer',
  );

  // …and the same edit shape through the watcher/debounce path
  ws.writePage(ws.readPage().replace('raised={false}', 'raised={true}'));
  ws.host.routeFileEvent(ws.pageAbs, 'change');
  await ws.host.flush();
  assert.equal(ws.host.kernel.bufferText('b:a1:p-raised'), 'true', 'the toggled-back edit survived the debounce window too');
  assert.ok(ws.readPage().includes('raised={true}'));
  assert.equal(ws.readPage(), projectSource(ws.host.kernel, ws.page).source);
});

test('W4② regression (write-back guard): an externally hand-edited ARBITRARY expression prop keeps its bytes through the host cycle', async (t) => {
  const ws = workspace(t, { initial: '<Input tone={title} label="Save">x</Input>\n' });
  await ws.host.syncExternalChange(ws.pageAbs); // adopt + settle
  ws.writePage(ws.readPage().replace('tone={title}', 'tone={subtitle}'));
  const outcome = await ws.host.syncExternalChange(ws.pageAbs);
  assert.equal(outcome.kind, 'idempotent', 'the scaffold-only movement lands nothing');
  assert.equal(outcome.writeBackGuard, true, 'the guard surfaced — the write-back was skipped');
  assert.ok(ws.readPage().includes('tone={subtitle}'), 'the hand edit kept its bytes (scaffold bytes are authoritative until M7)');
  assert.ok(
    outcome.deferred?.some((item) => item.kind === 'scaffold-change'),
    'the scaffold change is visible in the outcome envelope',
  );
});

/* ── the watcher layer ────────────────────────────────────────────────── */

test('the host-owned fs.watch watcher routes real file events and dispose releases the handle (no residue)', async (t) => {
  const root = mkdtempSync(join(tmpdir(), 'jx-collab-watch-'));
  const designDir = join(root, 'design');
  const pageAbs = join(designDir, 'home.svelte');
  mkdirSync(designDir, { recursive: true });
  writeFileSync(pageAbs, '<Button label="Save">Go</Button>\n');
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const owned: OwnedFileWatcher | null = fsWatchDesignDir(designDir);
  assert.ok(owned !== null, 'the minimal watcher attached');
  const host = openCollabHost(designDir, { watcher: owned!, ownFsWatch: false });
  t.after(() => {
    void host.dispose();
  });

  writeFileSync(pageAbs, '<Button label="First">Go</Button>\n');
  await until(() => host.station.lastOutcome('home.svelte') !== undefined, 'the first fs.watch event routed');
  await host.flush();
  assert.ok(readFileSync(pageAbs, 'utf8').includes('id="a1"'), 'the passive event adopted the page (ids injected)');

  await host.dispose();
  assert.ok(owned!.closed, 'the owned watcher is CLOSED (handle released)');
  const after = journalCount(host);

  // post-dispose writes route nowhere — the release evidence
  writeFileSync(pageAbs, '<Button label="Second">Go</Button>\n');
  await new Promise((resolve) => setTimeout(resolve, 200));
  assert.equal(journalCount(host), after, 'no routing after dispose — no watcher residue');
});

test('the vite watcher adapter forwards change/add/unlink and the subscription detaches cleanly', async (t) => {
  const ws = workspace(t);
  // a chokidar-shaped fake: per-event listener sets, removable by identity
  const registered = new Map<string, Set<(path: string) => void>>();
  const fakeViteWatcher = {
    on(event: 'change' | 'add' | 'unlink', listener: (path: string) => void): unknown {
      const set = registered.get(event) ?? new Set<(path: string) => void>();
      set.add(listener);
      registered.set(event, set);
      return this;
    },
    off(event: 'change' | 'add' | 'unlink', listener: (path: string) => void): unknown {
      registered.get(event)?.delete(listener);
      return this;
    },
  };
  const emit = (event: 'change' | 'add' | 'unlink', path: string): void => {
    for (const listener of registered.get(event) ?? []) listener(path);
  };
  const adapter: HostFileWatcher = viteWatcherAdapter(fakeViteWatcher);
  const sub = adapter.onEvent((event) => ws.host.routeFileEvent(event.path, event.kind));

  emit('change', ws.pageAbs);
  await ws.host.flush();
  assert.ok(ws.readPage().includes('id="a1"'), 'the vite change event routed through adoption');

  sub.dispose();
  assert.equal(registered.get('change')?.size ?? 0, 0, 'the adapter removed its listener from vite');
  const before = journalCount(ws.host);
  ws.writePage(ws.readPage().replace('label="Save"', 'label="Post"'));
  emit('change', ws.pageAbs);
  await ws.host.flush();
  assert.equal(journalCount(ws.host), before, 'a detached subscription routes nothing');
});

/* ── projection-pending recovery at reopen (§8 crash recovery) ───────── */

test('a failed write-back stays pending (never rolled back); the journaled row recovers on reopen — and a moved-on file is never clobbered', async (t) => {
  const root = mkdtempSync(join(tmpdir(), 'jx-collab-pending-'));
  const designDir = join(root, 'design');
  const page = 'home.svelte';
  const pageAbs = join(designDir, page);
  mkdirSync(designDir, { recursive: true });
  writeFileSync(pageAbs, '<Button label="Save">Go</Button>\n');
  t.after(() => rmSync(root, { recursive: true, force: true }));

  // write failures only — reads pass through (the disk-full posture)
  const failingWrites: ProjectionFileAdapter = {
    read: (path) => readFileSync(path, 'utf8'),
    writeAtomic: () => {
      throw new Error('injected disk-full');
    },
  };
  const crashed = openCollabHost(designDir, { files: failingWrites, ownFsWatch: false });
  const outcome = await crashed.syncExternalChange(page);
  assert.equal(outcome.kind, 'adopted');
  assert.equal(crashed.kernel.bufferText('b:a1:p-label'), 'Save', 'canonical landed — the write-back failure is NOT a rollback');
  assert.ok(!readFileSync(pageAbs, 'utf8').includes('id='), 'the file keeps its external bytes (no other write)');
  const pendingRows = crashed.kernel.journalEntries().filter((entry) => entry.type === 'projection-pending');
  assert.equal(pendingRows.length, 1, 'the failure landed a kernel projection-pending journal row (cross-process audit)');
  await crashed.dispose();

  // reopen: the journaled row recovers — the file still holds the
  // pre-write bytes, so the canonical projection is pushed atomically
  const reopened = openCollabHost(designDir, { ownFsWatch: false });
  assert.equal(readFileSync(pageAbs, 'utf8'), projectSource(reopened.kernel, page).source, 'recovery converged the file (ids injected)');
  await reopened.dispose();

  // the no-clobber guard: crash again, drift the file into a FAILED
  // write cycle (pending row with its base marker), then a human edits
  // the file while unhosted — reopen must leave their bytes alone
  const drifted = readFileSync(pageAbs, 'utf8').replace('label="Save"', 'label="Drift"');
  writeFileSync(pageAbs, drifted);
  const crashedAgain = openCollabHost(designDir, { files: failingWrites, ownFsWatch: false });
  const driftOutcome = await crashedAgain.syncExternalChange(page);
  assert.equal(driftOutcome.kind, 'rebased');
  assert.ok(crashedAgain.kernel.journalEntries().some((entry) => entry.type === 'projection-pending'), 'the failed write landed its pending row');
  await crashedAgain.dispose();
  const human = drifted.replace('label="Drift"', 'label="Human"');
  writeFileSync(pageAbs, human); // the human wins the unhosted window
  const reopened2 = openCollabHost(designDir, { ownFsWatch: false });
  assert.equal(readFileSync(pageAbs, 'utf8'), human, 'a moved-on file is never clobbered by recovery');
  await reopened2.dispose();
});

test('the pending worklist is kernel-formal (kernel gap ②): the row carries the STRUCTURED base, recovery retires it', async (t) => {
  const root = mkdtempSync(join(tmpdir(), 'jx-collab-worklist-host-'));
  const designDir = join(root, 'design');
  const page = 'home.svelte';
  const pageAbs = join(designDir, page);
  mkdirSync(designDir, { recursive: true });
  const initial = '<Button label="Save">Go</Button>\n';
  writeFileSync(pageAbs, initial);
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const failingWrites: ProjectionFileAdapter = {
    read: (path) => readFileSync(path, 'utf8'),
    writeAtomic: () => {
      throw new Error('injected disk-full');
    },
  };
  const crashed = openCollabHost(designDir, { files: failingWrites, ownFsWatch: false });
  assert.equal((await crashed.syncExternalChange(page)).kind, 'adopted');

  // the kernel worklist row: structured base (the pre-write file hash), no reason smuggling
  const rows = crashed.kernel.pendingProjections();
  assert.equal(rows.length, 1, 'one un-flushed worklist row');
  assert.equal(rows[0]!.base, sha256(initial), 'the base is the pre-write file bytes the cycle read');
  assert.ok(!rows[0]!.reason.includes('base='), 'the M6b reason-suffix smuggling is retired');
  await crashed.dispose();

  // reopen: the journaled row drives recovery (file still holds the base
  // bytes → the projection lands) and RETIRES from the worklist
  const reopened = openCollabHost(designDir, { ownFsWatch: false });
  assert.equal(readFileSync(pageAbs, 'utf8'), projectSource(reopened.kernel, page).source, 'recovery converged the file');
  assert.deepEqual(reopened.kernel.pendingProjections(), [], 'the flushed row retired from the worklist');
  await reopened.dispose();
});

/* ── the REAL design server hosting (no listen — create + close only) ── */

test('createDesignViteServer hosts the collab kernel over the design workspace and server.close() disposes it', async (t) => {
  const { createDesignViteServer } = await import('./create.ts');
  const root = mkdtempSync(join(tmpdir(), 'jx-design-boot-'));
  mkdirSync(join(root, 'design', 'prototypes', 'demo'), { recursive: true });
  writeFileSync(join(root, 'design', 'prototypes', 'demo', 'canvas.svelte'), '<Button label="Save">Go</Button>\n');
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const server = await createDesignViteServer(root, {});
  try {
    assert.ok(server.collab !== undefined, 'the server carries the collab accessor');
    assert.equal(findCollabHost(join(root, 'design')), server.collab, 'the server-registered host is the process singleton');
    assert.ok(existsSync(join(root, 'design', '.jx-collab', 'journal.ndjson')), 'the frozen .jx-collab/ layout was laid out');
    // the dsh lane finds the SAME host through the registry
    assert.equal(findCollabHost(join(root, 'design')), server.collab);

    // the REAL vite watcher drives the §8 cycle end-to-end: a hand edit
    // through vite's own chokidar → debounced ingest → journal rows →
    // atomic write-back converging the file (and the self-write guard
    // keeps the write-back's own event from starting a second cycle).
    // Generous ceiling — under a saturated run, fsevents delivery can
    // lag well past the standalone ~1s or DROP the event entirely (load
    // flake, not logic; verified 2026-09-15): when routing stalls, the
    // same bytes are re-written to mint a fresh event instead of
    // failing on environment noise.
    const pageAbs = join(root, 'design', 'prototypes', 'demo', 'canvas.svelte');
    writeFileSync(pageAbs, readFileSync(pageAbs, 'utf8').replace('label="Save"', 'label="Live"'));
    const routed = (): boolean => server.collab!.station.lastOutcome('prototypes/demo/canvas.svelte') !== undefined;
    const deadline = Date.now() + 45_000;
    let nextRewrite = Date.now() + 15_000;
    while (!routed()) {
      if (Date.now() > deadline) throw new Error('timeout waiting for the vite watcher routed the edit');
      if (Date.now() > nextRewrite) {
        writeFileSync(pageAbs, readFileSync(pageAbs, 'utf8')); // same bytes, fresh mtime
        nextRewrite = Date.now() + 15_000;
      }
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
    await server.collab!.flush();
    const converged = readFileSync(pageAbs, 'utf8');
    assert.ok(converged.includes('label="Live"') && converged.includes('id="a1"'), 'the file holds the merged canonical projection');
    assert.equal(server.collab!.kernel.bufferText('b:a1:p-label'), 'Live', 'the edit is journal-accounted');
    const journalAtConvergence = server.collab!.kernel.journalEntries().length;
    await new Promise((resolve) => setTimeout(resolve, 500)); // the write-back echo settles
    await server.collab!.flush();
    assert.equal(server.collab!.kernel.journalEntries().length, journalAtConvergence, 'no second ingest cycle — the HMR loop guard holds');
  } finally {
    await server.close();
  }
  assert.ok(server.collab!.disposed, 'close disposed the host');
  assert.equal(findCollabHost(join(root, 'design')), undefined, 'the registry entry is released — no residue');
});

/* ── the startup reconcile sweep (M7 收官轮): cross-era journals converge ── */

test('reconcileAtOpen sweeps KNOWN pages at startup: an M3-shaped journal realigns its tree meta and /usage answers the raised buffer', async (t) => {
  // the "old era" construction: adopt with an arbitrary-expression raised
  // (the M3 planner skipped brace literals), then hand-migrate the file to
  // a brace LITERAL and run ONE ordinary cycle — the guard-state is the
  // M3 shape byte-for-byte in the aspects reconcile cares about: the
  // container exists (file-system seeded), the stored meta never
  // references it (scaffold deferred, write-back guarded)
  const ws = workspace(t, { initial: '<script module>\n  import Button from \'#jixoai/press-button\';\n</script>\n\n<Button id="a1" label="Save" raised={title}>Click</Button>\n' });
  assert.equal((await ws.host.syncExternalChange(ws.pageAbs)).kind, 'adopted');
  ws.writePage(ws.readPage().replace('raised={title}', 'raised={false}'));
  const guarded = await ws.host.syncExternalChange(ws.pageAbs);
  assert.equal(guarded.kind, 'rebased', 'the ordinary lane lands only the buffer (created + seeded by the guard cycle)');
  assert.equal(guarded.writeBackGuard, true, 'the guard kept the external bytes');
  assert.equal(ws.host.kernel.bufferText('b:a1:p-raised'), 'false', 'the container was seeded by the guard cycle');
  let pageItem = treeItemsOf(ws.host.kernel).find((entry) => entry.page?.path === ws.page)?.page;
  assert.ok(pageItem !== undefined && !pageItem.holes.some((hole) => hole.buffer === 'raised'), 'the stored meta does not reference the raised buffer (the M7 walkthrough symptom)');

  // reopen WITH the sweep: every known page reconciles at open
  const designDir = ws.designDir;
  const pagePath = ws.page;
  await ws.host.dispose();
  const reopened = openCollabHost(designDir, { ownFsWatch: false, reconcileAtOpen: true });
  t.after(() => {
    void reopened.dispose();
  });
  await reopened.flush(); // the sweep settles inside flush
  pageItem = treeItemsOf(reopened.kernel).find((entry) => entry.page?.path === pagePath)?.page;
  assert.ok(pageItem !== undefined && pageItem.holes.some((hole) => hole.componentId === 'a1' && hole.buffer === 'raised' && hole.how === 'prop-expr'), 'the realigned meta references the raised buffer');
  assert.ok(
    reopened.kernel.journalEntries().some((entry) => entry.type === 'commit' && entry.domain === 'tree' && entry.kind === 'update'),
    'the realignment is journaled (file-system tree update rows)',
  );
  assert.equal(readFileSync(join(designDir, pagePath), 'utf8'), projectSource(reopened.kernel, pagePath).source, 'the file converged');

  // the /usage lane now answers the raised buffer (the panel's question)
  const usage = await resolveCollabApiRequest(reopened, 'usage', { file: `design/${pagePath}`, component: 'press-button', usageIndex: 1 });
  assert.equal(usage.status, 200);
  const body = usage.body as { buffers: { buffer: string; how: string; text: string }[]; reconciled?: string };
  const raised = body.buffers.find((buffer) => buffer.buffer === 'raised');
  assert.equal(raised?.how, 'prop-expr');
  assert.equal(raised?.text, 'false');

  // the second /usage is free (the converged marker short-circuits)
  const again = await resolveCollabApiRequest(reopened, 'usage', { file: `design/${pagePath}`, component: 'press-button', usageIndex: 1 });
  assert.equal((again.body as { reconciled?: string }).reconciled, undefined, 'a verifiably converged page drives no cycle');
});

test('a hand edit made while UNHOSTED lands through the startup sweep (drift landing at open)', async (t) => {
  const root = mkdtempSync(join(tmpdir(), 'jx-collab-sweep-'));
  const designDir = join(root, 'design');
  const page = 'home.svelte';
  const pageAbs = join(designDir, page);
  mkdirSync(designDir, { recursive: true });
  writeFileSync(pageAbs, '<Button label="Save">Go</Button>\n');
  t.after(() => rmSync(root, { recursive: true, force: true }));

  const first = openCollabHost(designDir, { ownFsWatch: false });
  await first.syncExternalChange(page);
  await first.dispose();

  // the human edits while NO host watches — no event will ever fire
  writeFileSync(pageAbs, readFileSync(pageAbs, 'utf8').replace('label="Save"', 'label="Unhosted"'));

  const reopened = openCollabHost(designDir, { ownFsWatch: false, reconcileAtOpen: true });
  await reopened.flush();
  assert.equal(reopened.kernel.bufferText('b:a1:p-label'), 'Unhosted', 'the unhosted drift landed through the sweep');
  assert.ok(
    commitsOf(reopened, 'file-system').some((row) => row.domain === 'text' && row.containerKey === 'b:a1:p-label'),
    'the drift is journaled as a file-system replace',
  );
  assert.equal(readFileSync(pageAbs, 'utf8'), projectSource(reopened.kernel, page).source, 'the file converged');
  await reopened.dispose();
});
