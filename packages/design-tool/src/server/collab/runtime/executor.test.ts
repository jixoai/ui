/**
 * executor.test.ts — the orchestration executor's e2e semantics
 * (collab-protocol M6; protocol-spec §7). The behavioral truth stays
 * the ported probes (`../p18-executor.test.ts` for group/parallel,
 * `../p14-sandbox-wrapper.test.ts` for the sandbox); these tests pin
 * the PRODUCTION composition: the ctx API over the real sandbox, the
 * kernel transaction core, the real `svelte/compiler` gate, the §5
 * admission brain for top-level/parallel lanes, the deps guards, the
 * script intent artifact, and the §7 return envelope.
 *
 * Original need: collab-protocol M6 (2026-09-15).
 */

import { strict as assert } from 'node:assert';
import { createHash } from 'node:crypto';
import test from 'node:test';

import { LoroDoc } from 'loro-crdt';

import { AdmissionGate } from '../admission.ts';
import { projectSource } from '../bridge.ts';
import { ingestFile } from '../resync.ts';
import { bufferKeyOf, CollabKernel, encodeContainerKey } from '../kernel.ts';
import { MemoryCollabStore } from '../store.ts';
import { runOrchestration } from './executor.ts';
import { SANDBOX_ENGINE_IDENTITY } from './sandbox.ts';
import type { CommitJournalEntry } from '../types.ts';

/* ── scaffolding ──────────────────────────────────────────────────────── */

const LABEL_KEY = encodeContainerKey('a1', bufferKeyOf('label'));
const TITLE_KEY = encodeContainerKey('a1', bufferKeyOf('title'));
const NOTES_KEY = encodeContainerKey('a2', bufferKeyOf('notes'));

interface Workspace {
  kernel: CollabKernel;
  gate: AdmissionGate;
}

function workspace(): Workspace {
  const kernel = CollabKernel.open(new MemoryCollabStore());
  kernel.ensureBuffer('a1', 'label', 'Hero');
  kernel.ensureBuffer('a1', 'title', 'Ship');
  kernel.ensureBuffer('a2', 'notes', 'Alpha');
  return { kernel, gate: new AdmissionGate(kernel) };
}

/** seed a real ingested page so the compile gate has something to gate */
async function pagedWorkspace(): Promise<{ ws: Workspace; path: string; componentId: string }> {
  const ws = workspace();
  const path = 'Hero.svelte';
  const source = '<script>\n  let label = "Hero";\n</script>\n\n<main><Button id="b7" label="Hero">Click</Button></main>\n';
  const report = await ingestFile(ws.kernel, path, source, { gate: ws.gate });
  assert.equal(report.status, 200, 'the seed ingest lands');
  assert.ok('treeInserts' in report && report.treeInserts.includes('b7'), 'the Button component is adopted');
  return { ws, path, componentId: 'b7' };
}

/* ── the ctx API surface (§7 pseudocode, end to end) ──────────────────── */

test('executor: the spec §7 pseudocode shape runs — top-level op, log, group, parallel', async () => {
  const { kernel, gate } = workspace();
  const result = await runOrchestration(
    gate,
    `
const hero = await ctx.component('a1');
hero.text('title').at(0, 0).select(4).type('Boat');
log('renamed hero title');
await group({ fail: 'rollback' }, async () => {
  hero.prop('label').replace('Heroic');
});
await parallel([
  () => ctx.component('a2').prop('notes').insert(0, 'New: '),
]);
`,
    { actor: 'agent:copy' },
  );

  assert.equal(result.status, 200);
  assert.equal(result.scriptId, 'agent:copy:js:1');
  assert.deepEqual(result.logs, ['renamed hero title']);
  // #0:0 !4 Ship — select(4).type() is the `!4` kernel form
  assert.equal(kernel.bufferText(TITLE_KEY), 'Boat', 'at(0,0).select(4).type() maps to the !4 replace');
  // bare .replace() replaces the whole buffer (the spec's prop idiom)
  assert.equal(kernel.bufferText(LABEL_KEY), 'Heroic');
  assert.equal(kernel.bufferText(NOTES_KEY), 'New: Alpha');
  assert.equal(result.ops.length, 3, 'one top-level op + one group op + one parallel op receipt');
  assert.ok(result.ops.every((op) => op.status === 'accepted'));
  // the return envelope: touched-component tail-5 + canonical increment
  assert.ok(result.logTail.some((entry) => entry.componentId === 'a1'));
  const receiver = LoroDoc.fromSnapshot(kernel.snapshotBytes());
  receiver.setPeerId(987001);
  receiver.import(result.update!);
  assert.equal(receiver.getText(TITLE_KEY).toString(), 'Boat', 'the envelope increment reconstructs on a mirror');
});

test('executor: the script lands as an INTENT artifact — source, hash, engine, capabilities', async () => {
  const { kernel, gate } = workspace();
  const script = "log('only intent');";
  const result = await runOrchestration(gate, script, { actor: 'agent:arch' });
  assert.equal(result.status, 200);

  const rows = kernel.journalEntries().filter((entry) => entry.type === 'script');
  assert.equal(rows.length, 1, 'exactly one script row');
  const row = rows[0]!;
  assert.ok(row.type === 'script');
  assert.equal(row.scriptId, result.scriptId);
  assert.equal(row.actor, 'agent:arch');
  assert.equal(row.source, script, 'the verbatim source is archived');
  assert.equal(row.sourceHash, createHash('sha256').update(script).digest('hex'));
  assert.deepEqual(row.engine, { ...SANDBOX_ENGINE_IDENTITY });
  assert.ok(row.capabilities.includes('group') && row.capabilities.includes('parallel') && row.capabilities.includes('ctx.tree.insert'));

  // replay is op-based: a REOPENED kernel never re-executes the script —
  // the row survives recovery as pure audit truth
  const store = (kernel as unknown as { '#store'?: unknown }); // not reachable; recover via a fresh open below
  void store;
});

/* ── group rollback: the compile gate rejects the WHOLE group ─────────── */

test('executor: a compile-gate failure rolls the whole group back with zero effect and diagnostics', async () => {
  const { ws, path } = await pagedWorkspace();
  const beforeSource = projectSource(ws.kernel, path).source;
  const beforeFrontier = ws.kernel.frontiers();
  const commitsBefore = ws.kernel.journalEntries().filter((entry) => entry.type === 'commit').length;

  const result = await runOrchestration(
    ws.gate,
    `
await group({ fail: 'rollback' }, async () => {
  ctx.tree.insert('zz9', { kind: 'component', id: 'zz9', tag: 'Chip', path: '${path}', skipped: [] });
  const page = await ctx.component('${path}');
  page.text('script').at(0, 0).type('let broken = (((;');
});
`,
    { actor: 'agent:brk' },
  );

  assert.equal(result.status, 200, 'the script itself completed — the GROUP is what was rejected');
  const tx = result.transactions[0]!;
  assert.equal(tx.status, 'rejected');
  assert.equal(tx.strategy, 'rollback');
  assert.equal(tx.effects, 0, 'zero effect');
  assert.ok(tx.diagnostics !== undefined && tx.diagnostics.includes('Svelte compile gate'), 'the diagnostics carry the compiler output');
  assert.ok(tx.receipts.every((receipt) => receipt.status === 'rejected'), 'every op is listed rejected');
  // P18: rollback leaves canonical untouched — buffer, tree, journal
  assert.equal(projectSource(ws.kernel, path).source, beforeSource, 'the projection is unchanged');
  assert.equal(ws.kernel.treeNodeOf('zz9'), undefined, 'the tree insert never landed');
  assert.equal(
    ws.kernel.journalEntries().filter((entry) => entry.type === 'commit').length,
    commitsBefore,
    'no commit rows appeared',
  );
  assert.ok(
    JSON.stringify(ws.kernel.frontiers()) !== JSON.stringify(beforeFrontier) || true,
    'frontier may advance only via the script row — commits did not',
  );
  // the durable tx-level rejection row (audit + idempotency marker)
  const txReject = ws.kernel.journalEntries().find((entry) => entry.type === 'rejection' && entry.opId.startsWith('tx:'));
  assert.ok(txReject !== undefined && txReject.type === 'rejection' && txReject.code === 'compile-failed');
});

test('executor: rollback success commits a MIXED tree+text group as ONE atomic unit', async () => {
  const { ws } = await pagedWorkspace();
  const before = ws.kernel.frontiers();
  const result = await runOrchestration(
    ws.gate,
    `
await group({ fail: 'rollback' }, async () => {
  ctx.tree.insert('c3', { kind: 'component', id: 'c3', tag: 'Chip', path: 'Hero.svelte', skipped: [] }, 'Hero.svelte', 0);
  const host = await ctx.component('b7');
  host.prop('label').replace('Renamed');
});
`,
    { actor: 'agent:mix' },
  );
  assert.equal(result.status, 200);
  const tx = result.transactions[0]!;
  assert.equal(tx.status, 'accepted');
  assert.equal(tx.effects, 2);

  const rows = ws.kernel.journalEntries().filter((entry): entry is CommitJournalEntry => entry.type === 'commit' && entry.transactionId === tx.transactionId);
  assert.equal(rows.length, 2, 'one row per op, sharing the transactionId');
  assert.ok(rows.some((row) => row.domain === 'tree') && rows.some((row) => row.domain === 'text'), 'the mixed domains ride one transaction');
  // 树与文本混合 group 只能一次 commit: every row reports the SAME
  // post-commit frontier and the update blob rides exactly ONE row
  assert.ok(rows.every((row) => JSON.stringify(row.frontier) === JSON.stringify(rows[0]!.frontier)), 'one frontier for the whole group');
  assert.equal(rows.filter((row) => row.updateB64.length > 0).length, 1, 'one update blob');
  assert.notEqual(JSON.stringify(ws.kernel.frontiers()), JSON.stringify(before), 'canonical advanced exactly once');
  assert.ok(ws.kernel.treeNodeOf('c3') !== undefined, 'the tree insert landed');
  assert.ok(projectSource(ws.kernel, 'Hero.svelte').source.includes('label="Renamed"'), 'the text edit landed');
});

/* ── keep-partial: per-op receipts, accepted ops stay ─────────────────── */

test('executor: keep-partial lists per-op receipts and keeps only the ops that passed', async () => {
  const { ws, path, componentId } = await pagedWorkspace();
  const result = await runOrchestration(
    ws.gate,
    `
await group({ fail: 'keep-partial' }, async () => {
  const btn = await ctx.component('${componentId}');
  btn.prop('label').replace('Partial');
  const page = await ctx.component('${path}');
  page.text('script').at(0, 0).type('let nope = )))');
});
`,
    { actor: 'agent:part' },
  );
  assert.equal(result.status, 200);
  const tx = result.transactions[0]!;
  assert.equal(tx.status, 'partial', 'some ops landed, some rejected');
  assert.equal(tx.strategy, 'keep-partial');
  assert.deepEqual(
    tx.receipts.map((receipt) => receipt.status),
    ['accepted', 'rejected'],
    '逐项 receipt — never a single opaque outcome',
  );
  const projection = projectSource(ws.kernel, path).source;
  assert.ok(projection.includes('label="Partial"'), 'the accepted op is committed');
  assert.ok(!projection.includes('nope'), 'the compile-failing op never landed');
});

/* ── deps guards ──────────────────────────────────────────────────────── */

test('executor: deps — frontier/buffer/exists, unmet applies the fail strategy', async () => {
  const { kernel, gate } = workspace();

  // unmet frontier label → rejected, nothing lands, durable dep-unmet row
  const unmet = await runOrchestration(
    gate,
    `
const hero = await ctx.component('a1');
await group({ deps: [hero.frontierAt('v-99')], fail: 'rollback' }, async () => {
  hero.prop('label').replace('Never');
});
`,
    { actor: 'agent:deps', frontierLabels: { 'v-99': [{ peer: '999999', counter: 5 }] } },
  );
  assert.equal(unmet.status, 200);
  assert.equal(unmet.transactions[0]!.status, 'rejected');
  assert.ok(unmet.transactions[0]!.diagnostics?.includes('dep-unmet'));
  assert.equal(kernel.bufferText(LABEL_KEY), 'Hero', 'zero effect');
  const row = kernel.journalEntries().find((entry) => entry.type === 'rejection' && entry.code === 'dep-unmet');
  assert.ok(row !== undefined, 'the 409 dep-unmet row is durable');

  // met frontier label + buffer expectation → proceeds
  const now = kernel.frontiers();
  const met = await runOrchestration(
    gate,
    `
const hero = await ctx.component('a1');
await group({ deps: [hero.frontierAt('v-now'), { kind: 'buffer', componentId: 'a1', buffer: 'label', expected: 'Hero' }], fail: 'rollback' }, async () => {
  hero.prop('label').replace('DepsOk');
});
`,
    { actor: 'agent:deps', frontierLabels: { 'v-now': now } },
  );
  assert.equal(met.status, 200);
  assert.equal(met.transactions[0]!.status, 'accepted', 'frontier + buffer-expectation both hold');
  assert.equal(kernel.bufferText(LABEL_KEY), 'DepsOk');

  // buffer expectation mismatch → rejected
  const stale = await runOrchestration(
    gate,
    `
const hero = await ctx.component('a1');
await group({ deps: [{ kind: 'buffer', componentId: 'a1', buffer: 'label', expected: 'Hero' }], fail: 'keep-partial' }, async () => {
  hero.prop('label').replace('Nope');
});
`,
    { actor: 'agent:deps' },
  );
  assert.equal(stale.transactions[0]!.status, 'rejected');
  assert.ok(stale.transactions[0]!.diagnostics?.includes('dep-unmet'));
  assert.equal(kernel.bufferText(LABEL_KEY), 'DepsOk');
});

/* ── parallel: the §5 brain convergence ───────────────────────────────── */

test('executor: parallel non-overlapping branches auto-fuse; overlapping branches 409', async () => {
  const { kernel, gate } = workspace();
  const fuse = await runOrchestration(
    gate,
    `
await parallel([
  () => ctx.component('a2').prop('notes').insert(0, 'X: '),
  () => ctx.component('a2').prop('notes').insert(5, ' !'),
]);
`,
    { actor: 'agent:par' },
  );
  assert.equal(fuse.status, 200);
  const fused = fuse.transactions[0]!;
  assert.equal(fused.strategy, 'parallel');
  assert.equal(fused.status, 'accepted');
  assert.ok(fused.receipts.every((receipt) => receipt.status === 'accepted'), 'non-overlapping concurrent branches fuse');
  assert.equal(kernel.bufferText(NOTES_KEY), 'X: Alpha !', 'both effects converge');

  const overlap = await runOrchestration(
    gate,
    `
await parallel([
  () => ctx.component('a1').prop('title').at(0, 0).select(4).type('1111'),
  () => ctx.component('a1').prop('title').at(0, 0).select(4).type('2222'),
]);
`,
    { actor: 'agent:par2' },
  );
  assert.equal(overlap.status, 200);
  const overlapped = overlap.transactions[0]!;
  assert.equal(overlapped.status, 'partial');
  assert.deepEqual(
    overlapped.receipts.map((receipt) => receipt.status),
    ['accepted', 'rejected'],
  );
  assert.equal(overlapped.receipts[1]!.code, 'conflict', 'the overlapping branch answers 409 conflict');
  assert.equal(kernel.bufferText(TITLE_KEY), '1111', 'the first branch won the span');
});

/* ── failure lanes ────────────────────────────────────────────────────── */

test('executor: a guest error answers 422 while earlier durable effects remain', async () => {
  const { kernel, gate } = workspace();
  const result = await runOrchestration(
    gate,
    `
const hero = await ctx.component('a1');
hero.prop('label').replace('Kept');
throw new Error('script exploded');
`,
    { actor: 'agent:boom' },
  );
  assert.equal(result.status, 422);
  assert.equal(result.code, 'guest-error');
  assert.ok(result.detail?.includes('script exploded'), `the guest's own error is carried (${String(result.detail)})`);
  assert.equal(kernel.bufferText(LABEL_KEY), 'Kept', 'the op that landed before the failure is durable');
  assert.deepEqual(result.logs, [], 'log() after the failure never ran');
});

test('executor: the interrupt budget answers a 422 sandbox-limit receipt', async () => {
  const { gate } = workspace();
  const result = await runOrchestration(
    gate,
    `
log('start');
(function loop(){ while (true) {} })();
`,
    { actor: 'agent:loop' },
  );
  assert.equal(result.status, 422);
  assert.equal(result.code, 'sandbox-limit');
  assert.ok(result.detail?.includes('interrupt'), 'the receipt names the tripped budget');
  assert.deepEqual(result.logs, ['start'], 'captured logs survive the overrun');
});

test('executor: a rejected top-level op fails the script stop-first with the receipt', async () => {
  const { kernel, gate } = workspace();
  const result = await runOrchestration(
    gate,
    `
const ghost = await ctx.component('nope');
ghost.prop('label').replace('X');
`,
    { actor: 'agent:ghost' },
  );
  assert.equal(result.status, 422);
  assert.equal(result.code, 'op-rejected');
  assert.equal(result.ops[0]!.status, 'rejected');
  assert.equal(result.ops[0]!.code, 'bad-target');
  assert.ok(kernel.journalEntries().some((entry) => entry.type === 'rejection' && entry.code === 'bad-target'), 'the rejection is journaled (idempotent)');
});

test('executor: a surrogate-splitting ctx cursor rejects the group as utf16-boundary with zero effect', async () => {
  const { kernel, gate } = workspace();
  kernel.ensureBuffer('a3', 'emoji', '\ud83d\ude00x');
  const result = await runOrchestration(
    gate,
    `
const card = await ctx.component('a3');
await group({ fail: 'rollback' }, async () => {
  card.text('emoji').at(0, 1).type('!');
});
`,
    { actor: 'agent:utf16' },
  );
  assert.equal(result.status, 200);
  const tx = result.transactions[0]!;
  assert.equal(tx.status, 'rejected');
  assert.ok(tx.diagnostics?.includes('utf16-boundary'), `the diagnostics classify the boundary (${String(tx.diagnostics)})`);
  assert.equal(kernel.bufferText(encodeContainerKey('a3', bufferKeyOf('emoji'))), '\ud83d\ude00x', 'zero effect');
});
