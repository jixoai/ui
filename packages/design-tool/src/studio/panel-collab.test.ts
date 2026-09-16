/**
 * panel-collab.test.ts — the panel's collab client state machine (M7a):
 * the container-key codec's parity with the kernel, the diff/literal
 * codecs, and the FULL client lane against a REAL hosted workspace
 * routed through the REAL collab API resolver (no sockets — the
 * transport posts into `resolveCollabApiRequest`): seed → optimistic
 * overlay → debounced fragment commit → projection write-back, the
 * §1 rebase ladder (stale frontier resubmit), the §6 conflict card's
 * two resolutions, and the awaiting-ingest transitional defense.
 *
 * Original need: collab-protocol M7a (2026-09-15).
 */

import { strict as assert } from 'node:assert';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test, { type TestContext } from 'node:test';

import { bufferAnchor } from '../server/collab/bridge.ts';
import type { CollabHost } from '../server/collab-host.ts';
import { openCollabHost } from '../server/collab-host.ts';
import { bufferKeyOf, encodeContainerKey } from '../server/collab/kernel.ts';
import { resolveCollabApiRequest } from '../server/collab-api.ts';
import {
  PanelCollabClient,
  bufferSlugOf,
  b64ToBytes,
  bytesToB64,
  containerKeyOf,
  diffText,
  parsePropLiteral,
  renderPropLiteral,
  type PanelCollabSnapshot,
} from './panel-collab.ts';

/* ── the codec batteries ──────────────────────────────────────────────── */

test('containerKeyOf: byte-parity with the kernel codec across named/slot/prop/percent cases', () => {
  const cases: readonly [string, string][] = [
    ['a1', 'raised'],
    ['a1', 't-0'],
    ['hero.svelte', 'script'],
    ['hero.svelte', 'style'],
    ['a13', 'data-testid'],
    ['ünïcode', 'variant'],
  ];
  for (const [componentId, buffer] of cases) {
    assert.equal(containerKeyOf(componentId, buffer), encodeContainerKey(componentId, bufferKeyOf(buffer)), `${componentId}/${buffer}`);
    assert.equal(bufferSlugOf(buffer), bufferKeyOf(buffer), `slug parity for ${buffer}`);
  }
});

test('bytesToB64/b64ToBytes round-trip', () => {
  const bytes = new Uint8Array([0, 1, 2, 250, 251, 252, 255]);
  assert.deepEqual(b64ToBytes(bytesToB64(bytes)), bytes);
});

test('diffText: common prefix/suffix laws', () => {
  assert.equal(diffText('true', 'true'), null);
  assert.deepEqual(diffText('true', 'false'), { kind: 'replace', offset: 0, length: 3, text: 'fals' }, 'the shared suffix e survives');
  assert.deepEqual(diffText('ghost', 'ghost-x'), { kind: 'insert', offset: 5, length: 0, text: '-x' });
  assert.deepEqual(diffText('ghost-x', 'ghost'), { kind: 'delete', offset: 5, length: 2, text: '' });
  assert.deepEqual(diffText('abcXdef', 'abcYdef'), { kind: 'replace', offset: 3, length: 1, text: 'Y' });
});

test('parsePropLiteral/renderPropLiteral: the §3 round trips', () => {
  assert.equal(parsePropLiteral('true', 'prop-expr'), true);
  assert.equal(parsePropLiteral('42', 'prop-expr'), 42);
  assert.equal(parsePropLiteral('-1.5e3', 'prop-expr'), -1500);
  assert.equal(parsePropLiteral('"ghost"', 'prop-expr'), 'ghost');
  assert.equal(parsePropLiteral("'ghost'", 'prop-expr'), 'ghost');
  assert.equal(parsePropLiteral('title.toUpperCase()', 'prop-expr'), null);
  assert.equal(parsePropLiteral('a & b', 'prop-quoted'), 'a & b');
  assert.equal(renderPropLiteral(true, 'prop-expr'), 'true');
  assert.equal(renderPropLiteral(16, 'prop-expr'), '16');
  assert.equal(renderPropLiteral('say "hi"', 'prop-expr'), '"say \\"hi\\""');
  assert.equal(renderPropLiteral('a & b', 'prop-quoted'), 'a & b');
  for (const value of ['ghost', 42, true, false] as const) {
    const raw = renderPropLiteral(value, 'prop-expr');
    assert.deepEqual(parsePropLiteral(raw, 'prop-expr'), value);
  }
});

/* ── the full client lane against a real workspace ────────────────────── */

const PAGE_SOURCE = `<script module lang="ts">
  import Button from '#jixoai/press-button';
</script>

<main>
  <Button id="a1" raised={true} variant="ghost">Start designing</Button>
</main>
`;

interface Harness {
  readonly host: CollabHost;
  readonly pageAbs: string;
  readonly readPage: () => string;
  makeClient(): PanelCollabClient;
  usage(): Promise<{ componentId: string; buffers: { buffer: string; how: string; text: string }[] }>;
}

/** a workspace + a transport that routes into the REAL api resolver */
function harness(t: TestContext, initial: string = PAGE_SOURCE): Harness {
  const root = mkdtempSync(join(tmpdir(), 'jx-panel-collab-'));
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
  return {
    host,
    pageAbs,
    readPage: () => readFileSync(pageAbs, 'utf8'),
    makeClient: () =>
      new PanelCollabClient(
        {
          async post(route: string, body: unknown): Promise<unknown> {
            const response = await resolveCollabApiRequest(host, route, body);
            return response.body;
          },
        },
        { debounceMs: 5 }, // the real 350ms window, compressed — the tests wait ~10 windows
      ),
    usage: async () => {
      const response = await resolveCollabApiRequest(host, 'usage', { file: `design/${page}`, component: 'press-button', usageIndex: 1 });
      assert.equal(response.status, 200);
      return response.body as { componentId: string; buffers: { buffer: string; how: string; text: string }[] };
    },
  };
}

/** an immediate-fire scheduler — the debounce window collapses to one microtask-free commit */
const immediateScheduler = {
  setTimeout(fn: () => void, _ms: number): unknown {
    fn();
    return 0;
  },
  clearTimeout(): void {},
};

test('the happy lane: seed → setDesired → the fragment lands, the file follows, the overlay clears', async (t) => {
  const ws = harness(t);
  const usage = await ws.usage();
  const client = ws.makeClient();
  const snapshots: PanelCollabSnapshot[] = [];
  client.subscribe(() => snapshots.push(client.snapshot()));
  await client.seed({ page: 'prototypes/demo/canvas.svelte', componentId: usage.componentId, shared: false, buffers: usage.buffers });
  assert.equal(client.snapshot().phase, 'ready');
  assert.equal(client.snapshot().componentId, 'a1');

  // the optimistic echo: the overlay paints BEFORE the commit resolves
  let echoed = false;
  const gated = new PanelCollabClient(
    {
      async post(route: string, body: unknown): Promise<unknown> {
        if (route === 'admit') await new Promise((resolve) => setTimeout(resolve, 25));
        const response = await resolveCollabApiRequest(ws.host, route, body);
        return response.body;
      },
    },
    { scheduler: immediateScheduler },
  );
  await gated.seed({ page: 'prototypes/demo/canvas.svelte', componentId: usage.componentId, shared: false, buffers: usage.buffers });
  gated.setDesired('raised', 'false');
  echoed = gated.snapshot().buffers.find((buffer) => buffer.buffer === 'raised')?.text === 'false';
  await new Promise((resolve) => setTimeout(resolve, 60));
  assert.equal(echoed, true, 'the overlay text is visible while the commit is in flight');
  const after = gated.snapshot().buffers.find((buffer) => buffer.buffer === 'raised');
  assert.equal(after?.text, 'false');
  assert.equal(after?.pending, false);
  assert.match(ws.readPage(), /raised=\{false\}/);
  gated.dispose();

  // the first client sees the change through the mirror on its next sync
  await client.syncNow();
  assert.equal(client.mirrorTextOf('raised'), 'false');
  client.dispose();
});

test('fragmented debounce: rapid edits collapse into windows; the final state lands, nothing stranded', async (t) => {
  const ws = harness(t);
  const usage = await ws.usage();
  const client = ws.makeClient();
  await client.seed({ page: 'prototypes/demo/canvas.svelte', componentId: usage.componentId, shared: false, buffers: usage.buffers });

  // three desired states in quick succession — the debounce window
  // collapses them (re-arming supersedes), the LAST state lands, and
  // the overlay never strands
  client.setDesired('variant', 'solid');
  client.setDesired('variant', 'outline');
  client.setDesired('variant', 'fill');
  await new Promise((resolve) => setTimeout(resolve, 120));
  assert.match(ws.readPage(), /variant="fill"/);
  const rows = ws.host.kernel.journalEntries().filter((entry) => entry.type === 'commit' && (entry as { target?: { buffer?: string } }).target?.buffer === 'variant');
  assert.ok(rows.length >= 1 && rows.length <= 3, `the windows collapsed honestly (${rows.length} fragments)`);
  assert.equal(client.snapshot().buffers.find((buffer) => buffer.buffer === 'variant')?.pending, false);
  client.dispose();
});

test('concurrent non-overlap auto-fuses: a stale-base disjoint edit merges and lands', async (t) => {
  const ws = harness(t);
  const usage = await ws.usage();
  const client = ws.makeClient();
  await client.seed({ page: 'prototypes/demo/canvas.svelte', componentId: usage.componentId, shared: false, buffers: usage.buffers });

  // an agent write the client has not seen — DISJOINT from the span the
  // client is about to touch (append at the tail vs a head rewrite):
  // §6 non-overlap auto-fusion carries the client's op through
  const agent = await ws.host.gate.admit({
    actor: 'agent:t',
    opId: 'agent:t:1',
    baseFrontiers: ws.host.kernel.frontiers(),
    domain: 'text',
    kind: 'insert',
    target: { componentId: 'a1', buffer: 'variant' },
    cursorBytes: bufferAnchor(ws.host.kernel, 'a1', 'variant', 5),
    offset: 5,
    length: 0,
    text: '-x',
    timestamp: Date.now(),
  });
  assert.equal(agent.status, 200);

  client.setDesired('variant', 'GHsty'); // rewrites the head [0,2) — disjoint from the agent's [5,5)
  await new Promise((resolve) => setTimeout(resolve, 60));
  assert.equal(client.snapshot().error, null);
  assert.equal(client.snapshot().conflicts.length, 0);
  assert.equal(ws.host.kernel.bufferText(containerKeyOf('a1', 'variant')), 'GHsty-x');
  client.dispose();
});

test('the §6 conflict card: same-buffer overlap → card → give-up accepts canonical', async (t) => {
  const ws = harness(t);
  const usage = await ws.usage();
  const client = ws.makeClient();
  await client.seed({ page: 'prototypes/demo/canvas.svelte', componentId: usage.componentId, shared: false, buffers: usage.buffers });

  // the agent lands a write on the SAME span the client is about to touch
  const agent = await ws.host.gate.admit({
    actor: 'agent:dsh',
    opId: 'agent:dsh:1',
    baseFrontiers: ws.host.kernel.frontiers(),
    domain: 'text',
    kind: 'replace',
    target: { componentId: 'a1', buffer: 'raised' },
    cursorBytes: bufferAnchor(ws.host.kernel, 'a1', 'raised', 0),
    offset: 0,
    length: 4,
    text: 'maybe',
    timestamp: Date.now(),
  });
  assert.equal(agent.status, 200);

  // the client's overlapping submission 409s → the card rises, the overlay dies
  client.setDesired('raised', 'false'); // differs from the STALE mirror ('true') — the diff spans the agent's write
  await new Promise((resolve) => setTimeout(resolve, 60));
  const snapshot = client.snapshot();
  const card = snapshot.conflicts.find((candidate) => candidate.buffer === 'raised');
  assert.ok(card !== undefined, 'the conflict card is raised');
  assert.equal(card.theirs, 'maybe');
  assert.equal(card.mine, 'false');
  assert.ok(card.actors.includes('agent:dsh'));
  // edits on the conflicted buffer suspend (setDesired is a no-op)
  client.setDesired('raised', 'whatever');
  assert.equal(client.snapshot().conflicts.length, 1);

  // give-up: accept the agent's value
  await client.chooseGiveUp('raised');
  const resolved = client.snapshot();
  assert.equal(resolved.conflicts.length, 0);
  assert.equal(resolved.buffers.find((buffer) => buffer.buffer === 'raised')?.text, 'maybe');
  assert.equal(ws.host.kernel.bufferText(containerKeyOf('a1', 'raised')), 'maybe');
  client.dispose();
});

test('the §6 conflict card: override withdraws my fragments and re-asserts mine', async (t) => {
  const ws = harness(t);
  const usage = await ws.usage();
  const client = ws.makeClient();
  await client.seed({ page: 'prototypes/demo/canvas.svelte', componentId: usage.componentId, shared: false, buffers: usage.buffers });

  // my FIRST fragment lands (becomes UndoManager-recorded)
  client.setDesired('raised', 'false');
  await new Promise((resolve) => setTimeout(resolve, 30));
  assert.equal(ws.host.kernel.bufferText(containerKeyOf('a1', 'raised')), 'false');

  // the agent lands a same-buffer write the client has not seen
  const agent = await ws.host.gate.admit({
    actor: 'agent:dsh',
    opId: 'agent:dsh:2',
    baseFrontiers: ws.host.kernel.frontiers(),
    domain: 'text',
    kind: 'replace',
    target: { componentId: 'a1', buffer: 'raised' },
    cursorBytes: bufferAnchor(ws.host.kernel, 'a1', 'raised', 0),
    offset: 0,
    length: 5,
    text: 'maybe',
    timestamp: Date.now(),
  });
  assert.equal(agent.status, 200);

  // my overlapping follow-up 409s → the card
  client.setDesired('raised', 'true');
  await new Promise((resolve) => setTimeout(resolve, 40));
  assert.equal(client.snapshot().conflicts.length, 1);

  // override: my interleaved fragment is withdrawn (UndoManager lane),
  // then my desired text re-asserts on current canonical
  await client.chooseOverride('raised');
  const resolved = client.snapshot();
  assert.equal(resolved.conflicts.length, 0);
  assert.equal(resolved.buffers.find((buffer) => buffer.buffer === 'raised')?.text, 'true');
  assert.equal(ws.host.kernel.bufferText(containerKeyOf('a1', 'raised')), 'true');
  assert.match(ws.readPage(), /raised=\{true\}/);
  client.dispose();
});

test('the awaiting-ingest defense parks the client (the transitional write-disable)', async (t) => {
  const ws = harness(t);
  void ws; // the workspace only proves the client needs no live lane to park
  const parked = ws.makeClient();
  parked.markAwaitingIngest('not in the protocol yet');
  assert.equal(parked.snapshot().phase, 'awaiting-ingest');
  parked.setDesired('raised', 'false'); // a no-op in the parked phase
  assert.equal(parked.snapshot().buffers.length, 0);
  assert.equal(parked.snapshot().undoable, false);
  parked.dispose();
});

test('the conflict card 旧值 reads the CONFLICTED buffer\'s own tail row — never a sibling buffer\'s value (the walkthrough catch)', async (t) => {
  const ws = harness(t);
  const usage = await ws.usage();
  const client = ws.makeClient();
  await client.seed({ page: 'prototypes/demo/canvas.svelte', componentId: usage.componentId, shared: false, buffers: usage.buffers });

  // fill the component's tail window with SIBLING-buffer writes (raised
  // and t-0 land between the adoption rows and the conflict write), so
  // the unfiltered tail[0] belongs to another buffer — the exact shape
  // the M7 walkthrough caught (a raised row leaking into a variant card)
  const agentWrite = async (buffer: string, length: number, text: string, seq: number): Promise<void> => {
    const result = await ws.host.gate.admit({
      actor: 'agent:dsh',
      opId: `agent:dsh:${seq}`,
      baseFrontiers: ws.host.kernel.frontiers(),
      domain: 'text',
      kind: 'replace',
      target: { componentId: 'a1', buffer },
      cursorBytes: bufferAnchor(ws.host.kernel, 'a1', buffer, 0),
      offset: 0,
      length,
      text,
      timestamp: Date.now(),
    });
    assert.equal(result.status, 200);
  };
  await agentWrite('raised', 4, 'false', 1);
  await agentWrite('t-0', 'Start designing'.length, 'Tapped', 2);
  await agentWrite('raised', 5, 'maybe', 3);
  await agentWrite('variant', 5, 'solid', 4); // the conflict write, LAST

  // the client's stale mirror overlaps the unseen variant write → the card
  client.setDesired('variant', 'outline');
  await new Promise((resolve) => setTimeout(resolve, 60));
  const card = client.snapshot().conflicts.find((candidate) => candidate.buffer === 'variant');
  assert.ok(card !== undefined, 'the conflict card is raised on variant');
  assert.equal(card.theirs, 'solid');
  assert.equal(card.mine, 'outline');
  assert.equal(card.oldValue, 'solid', '旧值 reads the variant buffer\'s own tail row');
  assert.notEqual(card.oldValue, 'Start designing', 'never the t-0 sibling row (the unfiltered tail[0])');
  assert.notEqual(card.oldValue, 'maybe', 'never the raised sibling row');
  client.dispose();
});
