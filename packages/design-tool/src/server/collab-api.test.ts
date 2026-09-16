/**
 * collab-api.test.ts — the M7a panel op lane over a REAL hosted
 * workspace: the usage resolution (id-first addressing + the §8
 * adoption drive), the admit route (§4 envelope → §5 receipt/error,
 * actor=human journal accounting, the canonical projection reaching
 * the .svelte file), the sync route (log-cursor increment + tail-5)
 * and the undo face (status / override-undo / give-up). The admit
 * envelopes are built EXACTLY the way the browser panel builds them —
 * a mirror LoroDoc fed by the sync route's updateB64 — so the e2e
 * loop (mirror → cursorBytes → admit → projection → file) is proven
 * without sockets.
 *
 * Original need: collab-protocol M7a (2026-09-15).
 */

import { strict as assert } from 'node:assert';
import { createServer } from 'node:http';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test, { type TestContext } from 'node:test';

import { LoroDoc } from 'loro-crdt';

import { bufferAnchor, projectSource } from './collab/bridge.ts';
import type { CollabHost } from './collab-host.ts';
import { openCollabHost } from './collab-host.ts';
import { containerKeyOf, bytesToB64 } from '../studio/panel-collab.ts';
import { collabApiMiddleware, envelopeFromJson, pageOfFile, resolveCollabApiRequest, resolveUsage } from './collab-api.ts';

/* ── scaffolding ──────────────────────────────────────────────────────── */

const PAGE_SOURCE = `<script module lang="ts">
  import Button from '#jixoai/press-button';
</script>

<main>
  <Button id="a1" raised={true} variant="ghost">Start designing</Button>
</main>
`;

interface Workspace {
  readonly host: CollabHost;
  readonly page: string;
  readonly pageAbs: string;
  readonly readPage: () => string;
}

function workspace(t: TestContext, initial: string = PAGE_SOURCE): Workspace {
  const root = mkdtempSync(join(tmpdir(), 'jx-collab-api-'));
  const designDir = join(root, 'design');
  const page = 'prototypes/demo/canvas.svelte';
  const pageAbs = join(designDir, page);
  mkdirSync(join(designDir, 'prototypes', 'demo'), { recursive: true });
  writeFileSync(pageAbs, initial);
  const host = openCollabHost(designDir, { ownFsWatch: false });
  t.after(() => {
    void host.dispose();
    rmSync(root, { recursive: true, force: true });
  });
  return { host, page, pageAbs, readPage: () => readFileSync(pageAbs, 'utf8') };
}

/** the browser panel's mirror: import the sync route's update, read texts/cursors from it */
class Mirror {
  readonly doc = new LoroDoc();
  cursor: { kind: 'frontier'; value: unknown } | undefined;
  readonly host: CollabHost;

  constructor(host: CollabHost) {
    this.host = host;
    this.doc.setPeerId(0xc0ffee);
  }

  async sync(): Promise<void> {
    const response = await resolveCollabApiRequest(this.host, 'sync', this.cursor === undefined ? {} : { syncCursor: this.cursor });
    const body = response.body as { updateB64: string; syncCursor: { kind: 'frontier'; value: unknown } };
    assert.equal(response.status, 200);
    if (body.updateB64.length > 0) this.doc.import(Buffer.from(body.updateB64, 'base64'));
    this.cursor = body.syncCursor;
  }

  text(componentId: string, buffer: string): string {
    return this.doc.getText(containerKeyOf(componentId, buffer)).toString();
  }

  frontiers(): unknown {
    return this.doc.frontiers();
  }

  anchorB64(componentId: string, buffer: string, offset: number): string {
    const cursor = this.doc.getText(containerKeyOf(componentId, buffer)).getCursor(offset, 0);
    assert.ok(cursor !== undefined, 'the mirror must anchor at the offset');
    return bytesToB64(cursor.encode());
  }
}

/** a panel-shaped text op JSON built against the mirror */
function panelOp(mirror: Mirror, componentId: string, buffer: string, kind: 'insert' | 'delete' | 'replace', offset: number, length: number, text: string): Record<string, unknown> {
  return {
    actor: 'human',
    opId: `human:test:${Math.random().toString(36).slice(2, 8)}`,
    baseFrontiers: mirror.frontiers(),
    domain: 'text',
    kind,
    target: { componentId, buffer },
    cursorBytesB64: mirror.anchorB64(componentId, buffer, offset),
    offset,
    length,
    text,
    timestamp: Date.now(),
  };
}

/* ── pageOfFile ───────────────────────────────────────────────────────── */

test('pageOfFile: design-root-relative pages, escapes refused', () => {
  assert.equal(pageOfFile('design/prototypes/demo/canvas.svelte'), 'prototypes/demo/canvas.svelte');
  assert.equal(pageOfFile('prototypes/demo/canvas.svelte'), 'prototypes/demo/canvas.svelte');
  assert.equal(pageOfFile('design/../etc/passwd.svelte'), null);
  assert.equal(pageOfFile('design/.jx-collab/journal.svelte'), null);
  assert.equal(pageOfFile('design/pages/hero.ts'), null);
});

/* ── /usage — id-first resolution + the adoption drive ────────────────── */

test('usage: a never-ingested page is ADOPTED and resolves id-first with its buffers', async (t) => {
  const ws = workspace(t);
  const response = await resolveCollabApiRequest(ws.host, 'usage', { file: `design/${ws.page}`, component: 'press-button', usageIndex: 1 });
  assert.equal(response.status, 200);
  const body = response.body as {
    ok: boolean; page: string; componentId: string; shared: boolean; adopted?: string;
    buffers: { buffer: string; how: string; text: string }[];
  };
  assert.equal(body.ok, true);
  assert.equal(body.page, ws.page);
  assert.equal(body.componentId, 'a1');
  assert.equal(body.adopted, 'adopted');
  const byName = new Map(body.buffers.map((buffer) => [buffer.buffer, buffer]));
  assert.equal(byName.get('raised')?.how, 'prop-expr');
  assert.equal(byName.get('raised')?.text, 'true');
  assert.equal(byName.get('variant')?.how, 'prop-quoted');
  assert.equal(byName.get('variant')?.text, 'ghost');
  assert.equal(byName.get('t-0')?.how, 'template-text');
  assert.equal(byName.get('t-0')?.text, 'Start designing');
  // the adoption wrote the ids back — the file now carries a1 natively
  assert.match(ws.readPage(), /<Button id="a1"/);
});

test('usage: kind mismatch and out-of-range ordinals answer honest 404s', async (t) => {
  const ws = workspace(t);
  const wrongKind = await resolveCollabApiRequest(ws.host, 'usage', { file: `design/${ws.page}`, component: 'badge', usageIndex: 1 });
  assert.equal(wrongKind.status, 404);
  assert.equal((wrongKind.body as { reason: string }).reason, 'usage-not-found');
  const outOfRange = await resolveCollabApiRequest(ws.host, 'usage', { file: `design/${ws.page}`, component: 'press-button', usageIndex: 9 });
  assert.equal(outOfRange.status, 404);
  assert.equal((outOfRange.body as { reason: string }).reason, 'usage-not-found');
});

test('usage: request-shape and path-escape rejections', async (t) => {
  const ws = workspace(t);
  const noIndex = await resolveCollabApiRequest(ws.host, 'usage', { file: `design/${ws.page}`, component: 'press-button' });
  assert.equal(noIndex.status, 400);
  const escapes = await resolveCollabApiRequest(ws.host, 'usage', { file: '../outside.svelte', component: 'press-button', usageIndex: 1 });
  assert.equal(escapes.status, 400);
});

test('usage: a page with no native ids yet answers awaiting-ingest only when adoption cannot mint (hand-written unparseable id)', async (t) => {
  // an unparseable page fails the adoption drive honestly (422), and a
  // parseable page ALWAYS gets ids minted — awaiting-ingest is the
  // transitional defense, not the expected path
  const ws = workspace(t, '<script>const x = ;</script>\n');
  const response = await resolveCollabApiRequest(ws.host, 'usage', { file: `design/${ws.page}`, component: 'press-button', usageIndex: 1 });
  assert.equal(response.status, 422);
  assert.equal((response.body as { reason: string }).reason, 'ingest-failed');
});

/* ── /admit — the op lane end to end ─────────────────────────────────── */

test('admit: a panel-built replace lands as actor=human, journals, and reaches the file', async (t) => {
  const ws = workspace(t);
  await resolveCollabApiRequest(ws.host, 'usage', { file: `design/${ws.page}`, component: 'press-button', usageIndex: 1 });
  const mirror = new Mirror(ws.host);
  await mirror.sync();
  assert.equal(mirror.text('a1', 'raised'), 'true');

  const response = await resolveCollabApiRequest(ws.host, 'admit', panelOp(mirror, 'a1', 'raised', 'replace', 0, 4, 'false'));
  assert.equal(response.status, 200);
  const body = response.body as {
    status: number; actor: string; domain: string; kind: string; value: string; updateB64: string;
    logTail: { actor: string; kind: string }[]; projection: string;
  };
  assert.equal(body.actor, 'human');
  assert.equal(body.value, 'false');
  assert.ok(body.updateB64.length > 0);
  assert.ok(body.logTail.some((entry) => entry.actor === 'human'));
  // the canonical projection reached the file (atomic write-back → HMR)
  assert.match(ws.readPage(), /raised=\{false\}/);
  // the journal's last commit row is actor=human (the audit truth)
  const commits = ws.host.kernel.journalEntries().filter((entry) => entry.type === 'commit');
  const last = commits.at(-1);
  assert.equal(last?.type === 'commit' ? last.actor : undefined, 'human');
});

test('admit: a slot-text edit rides the same lane (t-0 replace → file copy changes)', async (t) => {
  const ws = workspace(t);
  await resolveCollabApiRequest(ws.host, 'usage', { file: `design/${ws.page}`, component: 'press-button', usageIndex: 1 });
  const mirror = new Mirror(ws.host);
  await mirror.sync();
  const response = await resolveCollabApiRequest(ws.host, 'admit', panelOp(mirror, 'a1', 't-0', 'replace', 0, 'Start designing'.length, 'Read the standard'));
  assert.equal(response.status, 200);
  assert.match(ws.readPage(), />Read the standard</);
});

test('admit: structural shape violations answer 400 without consuming a journal row', async (t) => {
  const ws = workspace(t);
  await resolveCollabApiRequest(ws.host, 'usage', { file: `design/${ws.page}`, component: 'press-button', usageIndex: 1 });
  const before = ws.host.kernel.journalEntries().filter((entry) => entry.type === 'commit' || entry.type === 'rejection').length;
  const missing = await resolveCollabApiRequest(ws.host, 'admit', { actor: 'human', opId: 'human:test:bad1', baseFrontiers: [], domain: 'text', kind: 'insert', target: { componentId: 'a1', buffer: 'raised' }, offset: 0, length: 0, text: 'x' });
  assert.equal(missing.status, 400);
  assert.equal((missing.body as { reason: string }).reason, 'bad-request');
  // the gate's own §4 shape law (insert carries no length) answers bad-envelope
  const illegalLength = await resolveCollabApiRequest(ws.host, 'admit', { actor: 'human', opId: 'human:test:bad1b', baseFrontiers: [], domain: 'text', kind: 'insert', target: { componentId: 'a1', buffer: 'raised' }, cursorBytesB64: 'AA==', offset: 0, length: 3, text: 'xyz' });
  assert.equal(illegalLength.status, 400);
  assert.equal((illegalLength.body as { reason: string }).reason, 'bad-envelope');
  const badDomain = await resolveCollabApiRequest(ws.host, 'admit', { actor: 'human', opId: 'human:test:bad2', baseFrontiers: [], domain: 'xml', kind: 'insert', target: { componentId: 'a1', buffer: 'raised' }, cursorBytesB64: 'AA==', offset: 0, length: 0, text: 'x' });
  assert.equal(badDomain.status, 400);
  assert.equal(ws.host.kernel.journalEntries().filter((entry) => entry.type === 'commit' || entry.type === 'rejection').length, before);
});

test('admit: a concurrent same-buffer overlap answers the §5.2 conflict envelope verbatim', async (t) => {
  const ws = workspace(t);
  await resolveCollabApiRequest(ws.host, 'usage', { file: `design/${ws.page}`, component: 'press-button', usageIndex: 1 });
  const mirror = new Mirror(ws.host);
  await mirror.sync();

  // the agent lane lands a write the panel has not seen (kernel-side
  // anchor, actor agent:t) — same span the panel is about to touch
  const agentOp = {
    actor: 'agent:t',
    opId: 'agent:t:1',
    baseFrontiers: ws.host.kernel.frontiers(),
    domain: 'text' as const,
    kind: 'replace' as const,
    target: { componentId: 'a1', buffer: 'raised' },
    cursorBytes: bufferAnchor(ws.host.kernel, 'a1', 'raised', 0),
    offset: 0,
    length: 4,
    text: 'true',
    timestamp: Date.now(),
  };
  const agentResult = await ws.host.gate.admit(agentOp);
  assert.equal(agentResult.status, 200);

  // the panel's stale-base overlapping op → 409 conflict, no import
  const response = await resolveCollabApiRequest(ws.host, 'admit', panelOp(mirror, 'a1', 'raised', 'replace', 0, 4, 'false'));
  assert.equal(response.status, 409);
  const body = response.body as {
    code: string; canonicalFrontier: unknown;
    conflict: { committed: { opId: string; actor: string }[]; currentText: string; tail: unknown[] };
  };
  assert.equal(body.code, 'conflict');
  assert.ok(body.conflict.committed.some((op) => op.actor === 'agent:t'));
  assert.equal(body.conflict.currentText, 'true');
  // the buffer still holds the agent's write (the conflict was not imported)
  assert.equal(ws.host.kernel.bufferText(containerKeyOf('a1', 'raised')), 'true');
});

/* ── /sync — the log-cursor lane ─────────────────────────────────────── */

test('sync: absent cursor answers the restricted snapshot; a stale-base client then pulls the delta', async (t) => {
  const ws = workspace(t);
  await resolveCollabApiRequest(ws.host, 'usage', { file: `design/${ws.page}`, component: 'press-button', usageIndex: 1 });
  const first = await resolveCollabApiRequest(ws.host, 'sync', {});
  assert.equal(first.status, 200);
  const firstBody = first.body as { updateB64: string; syncCursor: { kind: string }; logs: { componentId: string; tail: unknown[] }[] };
  assert.ok(firstBody.updateB64.length > 0);
  assert.equal(firstBody.syncCursor.kind, 'frontier');
  assert.ok(firstBody.logs.some((log) => log.componentId === 'a1'));

  // a new canonical op → the SAME cursor now pulls a strictly smaller delta
  const mirror = new Mirror(ws.host);
  await mirror.sync();
  await resolveCollabApiRequest(ws.host, 'admit', panelOp(mirror, 'a1', 'raised', 'replace', 0, 4, 'false'));
  const second = await resolveCollabApiRequest(ws.host, 'sync', { syncCursor: firstBody.syncCursor });
  assert.equal(second.status, 200);
  const secondBody = second.body as { updateB64: string };
  assert.ok(secondBody.updateB64.length > 0);
  assert.notEqual(secondBody.updateB64, firstBody.updateB64);
});

/* ── /undo — the §6 face ─────────────────────────────────────────────── */

test('undo: status, override-undo takes the human fragment back; give-up compensates by opId', async (t) => {
  const ws = workspace(t);
  await resolveCollabApiRequest(ws.host, 'usage', { file: `design/${ws.page}`, component: 'press-button', usageIndex: 1 });
  const mirror = new Mirror(ws.host);
  await mirror.sync();

  const admitted = await resolveCollabApiRequest(ws.host, 'admit', panelOp(mirror, 'a1', 'raised', 'replace', 0, 4, 'false'));
  assert.equal(admitted.status, 200);
  assert.match(ws.readPage(), /raised=\{false\}/);

  const before = await resolveCollabApiRequest(ws.host, 'undo', { mode: 'status' });
  assert.equal((before.body as { open: boolean }).open, true);
  assert.equal((before.body as { canUndo: boolean }).canUndo, true);

  const undone = await resolveCollabApiRequest(ws.host, 'undo', { mode: 'override-undo', actor: 'human', opId: 'human:test:undo1' });
  assert.equal(undone.status, 200);
  assert.equal((undone.body as { status: string }).status, 'performed');
  assert.match(ws.readPage(), /raised=\{true\}/); // the projection followed the undo

  // give-up: re-commit, then compensate by opId — supersedes accounting
  await mirror.sync();
  const opId = 'human:test:giveup-source';
  const again = await resolveCollabApiRequest(ws.host, 'admit', { ...panelOp(mirror, 'a1', 'raised', 'replace', 0, 4, 'false'), opId });
  assert.equal(again.status, 200);
  const givenUp = await resolveCollabApiRequest(ws.host, 'undo', { mode: 'give-up', targetOpId: opId, actor: 'human' });
  assert.equal(givenUp.status, 200);
  const supersedes = (givenUp.body as { supersedes?: string }).supersedes;
  assert.equal(supersedes, opId);
  assert.match(ws.readPage(), /raised=\{true\}/);
});

test('undo: empty-stack is honest when the session has nothing left', async (t) => {
  const ws = workspace(t);
  await resolveCollabApiRequest(ws.host, 'usage', { file: `design/${ws.page}`, component: 'press-button', usageIndex: 1 });
  const response = await resolveCollabApiRequest(ws.host, 'undo', { mode: 'override-undo', actor: 'human', opId: 'human:test:undo-empty' });
  assert.equal(response.status, 409);
  assert.equal((response.body as { status: string }).status, 'empty-stack');
});

/* ── envelopeFromJson / resolveUsage unit edges ──────────────────────── */

test('envelopeFromJson: the §4 tagged-union lanes round-trip faithfully', async (t) => {
  const ws = workspace(t);
  await resolveCollabApiRequest(ws.host, 'usage', { file: `design/${ws.page}`, component: 'press-button', usageIndex: 1 });
  const envelope = envelopeFromJson({
    actor: 'human',
    opId: 'human:test:shape',
    baseFrontiers: ws.host.kernel.frontiers(),
    domain: 'text',
    kind: 'insert',
    target: { componentId: 'a1', buffer: 'variant' },
    cursorBytesB64: bytesToB64(bufferAnchor(ws.host.kernel, 'a1', 'variant', 5)),
    offset: 5,
    length: 0,
    text: '-x',
  });
  assert.equal(envelope.domain, 'text');
  assert.equal(envelope.kind, 'insert');
  assert.ok(envelope.cursorBytes instanceof Uint8Array);
  // a create envelope carries no anchor fields
  const create = envelopeFromJson({
    actor: 'human', opId: 'human:test:create', baseFrontiers: [], domain: 'text', kind: 'create',
    target: { componentId: 'a1', buffer: 'fresh' }, initialText: 'seed',
  });
  assert.equal(create.kind, 'create');
});

test('resolveUsage: pure resolution against an ingested kernel (no adoption drive)', async (t) => {
  const ws = workspace(t);
  await ws.host.syncExternalChange(ws.page);
  const resolution = await resolveUsage(ws.host.kernel, ws.page, 'press-button', 1);
  assert.ok(resolution.ok);
  assert.equal(resolution.componentId, 'a1');
  assert.equal(resolution.shared, false);
});

/* ── the middleware over a real (ephemeral) socket ───────────────────── */

test('the connect middleware serves the routes over HTTP with the degraded 503 lane', async (t) => {
  const ws = workspace(t);
  await resolveCollabApiRequest(ws.host, 'usage', { file: `design/${ws.page}`, component: 'press-button', usageIndex: 1 });
  const cell: { host: CollabHost | undefined } = { host: ws.host };
  // the bare server terminates the chain itself (vite's middlewares
  // own next() in production — a fall-through here would hang)
  const middleware = collabApiMiddleware(() => cell.host);
  const server = createServer((req, res) => middleware(req, res, () => {
    res.statusCode = 404;
    res.end('{}');
  }));
  const listen = new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  await listen;
  const { port } = server.address() as { port: number };
  t.after(() => new Promise<void>((resolve) => server.close(() => resolve())));

  const post = async (path: string, body: unknown): Promise<{ status: number; json: Record<string, unknown> }> => {
    const response = await fetch(`http://127.0.0.1:${String(port)}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return { status: response.status, json: (await response.json()) as Record<string, unknown> };
  };

  const session = await post('/__design__/api/collab/usage', { file: `design/${ws.page}`, component: 'press-button', usageIndex: 1 });
  assert.equal(session.status, 200);
  assert.equal((session.json as { componentId?: string }).componentId, 'a1');

  const bad = await post('/__design__/api/collab/admit', { nonsense: true });
  assert.equal(bad.status, 400);
  assert.equal((bad.json as { reason?: string }).reason, 'bad-request');

  const unrelated = await fetch(`http://127.0.0.1:${String(port)}/__design__/api/meta/whatever.json`);
  assert.notEqual(unrelated.status, 200, 'non-collab routes fall through to next()');

  // the M6b degrade lane: a missing host answers the honest 503
  cell.host = undefined;
  const degraded = await post('/__design__/api/collab/sync', {});
  assert.equal(degraded.status, 503);
  assert.equal((degraded.json as { reason?: string }).reason, 'collab-unavailable');
});

/* ── the known-page reconcile drive (M7 收官轮): cross-era tree meta ───── */

test('usage: a known page whose stored meta lags the current planner (the M3 shape) reconciles on /usage and answers the raised buffer', async (t) => {
  // adopt in the "old-era" shape: raised={title} is an IDENTIFIER
  // expression — scaffold in every era, so the adoption holds no raised
  // hole (the shape the M3-era journals hold for every brace literal)
  const ws = workspace(t, PAGE_SOURCE.replace('raised={true}', 'raised={title}'));
  const first = await resolveCollabApiRequest(ws.host, 'usage', { file: `design/${ws.page}`, component: 'press-button', usageIndex: 1 });
  assert.equal(first.status, 200);
  assert.ok(!((first.body as { buffers: { buffer: string }[] }).buffers.some((buffer) => buffer.buffer === 'raised')), 'the adoption-era answer has no raised buffer');

  // hand-migrate the literal; ONE ordinary §8 cycle constructs the guard
  // state (container seeded, stored meta unreferenced — the M3 shape)
  writeFileSync(ws.pageAbs, ws.readPage().replace('raised={title}', 'raised={false}'));
  const guarded = await ws.host.syncExternalChange(ws.page);
  assert.equal(guarded.writeBackGuard, true, 'the ordinary lane guards the scaffold change');
  assert.equal(ws.host.kernel.bufferText(containerKeyOf('a1', 'raised')), 'false', 'the container exists with content');

  // the M7 walkthrough symptom: the PURE resolution underreports
  const stale = await resolveUsage(ws.host.kernel, ws.page, 'press-button', 1);
  assert.ok(stale.ok);
  assert.ok(!stale.buffers.some((buffer) => buffer.buffer === 'raised'), 'the stale meta underreports the buffer (the panel degrades to edit-in-code)');

  // the /usage drive reconciles: the meta realigns, the answer completes
  const response = await resolveCollabApiRequest(ws.host, 'usage', { file: `design/${ws.page}`, component: 'press-button', usageIndex: 1 });
  assert.equal(response.status, 200);
  const body = response.body as { reconciled?: string; buffers: { buffer: string; how: string; text: string }[] };
  assert.equal(body.reconciled, 'rebased', 'the reconcile drive surfaced its outcome');
  const raised = body.buffers.find((buffer) => buffer.buffer === 'raised');
  assert.equal(raised?.how, 'prop-expr');
  assert.equal(raised?.text, 'false');
  assert.equal(ws.readPage(), projectSource(ws.host.kernel, ws.page).source, 'the file converged');
});

test('admit: the drive outcome is the host lane vocabulary — a panel edit reports written (the push), never a consumption-side write', async (t) => {
  const ws = workspace(t);
  await resolveCollabApiRequest(ws.host, 'usage', { file: `design/${ws.page}`, component: 'press-button', usageIndex: 1 });
  const mirror = new Mirror(ws.host);
  await mirror.sync();
  const first = await resolveCollabApiRequest(ws.host, 'admit', panelOp(mirror, 'a1', 'raised', 'replace', 0, 4, 'false'));
  assert.equal(first.status, 200);
  assert.equal((first.body as { projection?: string }).projection, 'written', 'the out-of-band advance pushed the current projection through the host');
  await mirror.sync();
  const second = await resolveCollabApiRequest(ws.host, 'admit', panelOp(mirror, 'a1', 'variant', 'replace', 0, 5, 'solid'));
  assert.equal(second.status, 200);
  assert.equal((second.body as { projection?: string }).projection, 'written');
  assert.match(ws.readPage(), /raised=\{false\}/);
  assert.match(ws.readPage(), /variant="solid"/);
  assert.equal(ws.readPage(), projectSource(ws.host.kernel, ws.page).source);
});
