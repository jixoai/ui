/**
 * bridge.test.ts — the projection bridge tests (collab-protocol M3,
 * protocol-spec §1 投影 / §3 序列化桥): the ingest → admitted text op →
 * projectSource round trip asserted BYTE-LEVEL against hand-written
 * oracles (entity `&amp;`, braces, multi-line, the trim law, the
 * prop-quoted JSON law), the serializer dispatch itself, projection
 * reports (buffers + skipped non-literal props), and the unknown-page
 * error. The ingest station this file drives is resync.ts' — the
 * kernel-integration path, not a test bootstrap.
 *
 * Original need: collab-protocol M3 (2026-09-15).
 */

import { strict as assert } from 'node:assert';
import test from 'node:test';

import { bufferAnchor, BridgeError, projectSource, serializeHole, treeParentageOf } from './bridge.ts';
import { AdmissionGate } from './admission.ts';
import { CollabKernel, encodeContainerKey, bufferKeyOf } from './kernel.ts';
import { ResyncStation } from './resync.ts';
import { MemoryCollabStore } from './store.ts';
import type { TextOpEnvelope } from './types.ts';

/* ── scaffolding ──────────────────────────────────────────────────────── */

interface Workspace {
  kernel: CollabKernel;
  gate: AdmissionGate;
  station: ResyncStation;
}

function workspace(): Workspace {
  const kernel = CollabKernel.open(new MemoryCollabStore());
  const gate = new AdmissionGate(kernel);
  return { kernel, gate, station: new ResyncStation(kernel, gate) };
}

/** submit one text op through admission (the client-mirror anchor) */
async function submitTextOp(ws: Workspace, init: {
  actor: string;
  opId: string;
  componentId: string;
  buffer: string;
  kind: 'insert' | 'delete' | 'replace';
  offset: number;
  length?: number;
  text?: string;
}): Promise<string> {
  const envelope: TextOpEnvelope = {
    actor: init.actor,
    opId: init.opId,
    baseFrontiers: ws.kernel.frontiers(),
    domain: 'text',
    kind: init.kind,
    target: { componentId: init.componentId, buffer: init.buffer },
    cursorBytes: bufferAnchor(ws.kernel, init.componentId, init.buffer, init.offset),
    offset: init.offset,
    length: init.length ?? 0,
    text: init.text ?? '',
  };
  const result = await ws.gate.admit(envelope);
  assert.equal(result.status, 200, `op ${init.opId} must admit (got ${String(result.status)})`);
  return result.value;
}

/* ── the serializer dispatch (§3 authorities, hand-written oracles) ────── */

test('serializeHole: template-text escapes & < > { } in order, quotes and newlines stay raw', () => {
  assert.equal(serializeHole('template-text', 'plain'), 'plain');
  assert.equal(serializeHole('template-text', 'A & B'), 'A &amp; B');
  assert.equal(serializeHole('template-text', 'a<b>c'), 'a&lt;b&gt;c');
  assert.equal(serializeHole('template-text', 'x { y } z'), 'x &#123; y &#125; z');
  // escape ORDER law: the & of an earlier escape can never re-open
  assert.equal(serializeHole('template-text', '&amp; &lt;'), '&amp;amp; &amp;lt;');
  assert.equal(serializeHole('template-text', 'l1\nl2 "q"'), 'l1\nl2 "q"');
});

test('serializeHole: prop-quoted applies the JSON law inside the quotes — no entity escaping', () => {
  assert.equal(serializeHole('prop-quoted', 'Save'), 'Save');
  assert.equal(serializeHole('prop-quoted', 'a "quoted" \\ path'), 'a \\"quoted\\" \\\\ path');
  assert.equal(serializeHole('prop-quoted', 'A & B < C'), 'A & B < C'); // entities are NOT re-escaped for props
  assert.equal(serializeHole('prop-quoted', ''), '');
});

test('serializeHole: verbatim passes script/style bytes through untouched', () => {
  const script = "let t = 'a';\nif (x < y && y > z) { f(&amp;); }";
  assert.equal(serializeHole('verbatim', script), script);
});

/* ── the round trip: ingest → text ops → byte-level projection ─────────── */

test('projectSource round-trips the ingested page byte-exactly (canonical forms are a fixed point)', async () => {
  const ws = workspace();
  const source = `<script>let t = 'demo';</script>\n\n<style>.hero { color: red; }</style>\n\n<Button label="Save &amp; go">  Click &amp; go  </Button>\n<Card />\ntop-level &amp; text\n`;
  const report = await ws.station.ingestFile('pages/home.svelte', source);

  const projection = projectSource(ws.kernel, 'pages/home.svelte');
  // slot/page texts were in canonical escape form, script/style are
  // verbatim, the id injections ride the chunks — byte-exact EXCEPT the
  // one law that differs per domain: prop values serialize through the
  // JSON law (no entity escaping), so `&amp;` in a PROP canonicalizes to
  // `&` (in a slot it stays `&amp;` — serializeTemplateText is canonical)
  assert.equal(projection.source, report.rewrittenSource.replace('label="Save &amp; go"', 'label="Save & go"'));
  assert.ok(projection.source.includes('<Button id="a1" label="Save & go">  Click &amp; go  </Button>'));
  assert.ok(projection.source.includes('<Card id="a2" />'));
});

test('an admitted slot-text op re-projects byte-exactly: entities, braces, multi-line, trim law', async () => {
  const ws = workspace();
  const source = `<Button label="Save">  Click  </Button>\n`;
  await ws.station.ingestFile('pages/home.svelte', source);

  // replace the WHOLE visible slot fragment (half-open span: the two
  // peripheral double-spaces are chunk bytes and must survive)
  const value = await submitTextOp(ws, {
    actor: 'human',
    opId: 'human:1',
    componentId: 'a1',
    buffer: 't-0',
    kind: 'replace',
    offset: 0,
    length: 'Click'.length,
    text: 'L1 & < > { }\nL2 "q"',
  });
  assert.equal(value, 'L1 & < > { }\nL2 "q"');

  const { source: projected } = projectSource(ws.kernel, 'pages/home.svelte');
  assert.equal(
    projected,
    `<Button id="a1" label="Save">  L1 &amp; &lt; &gt; &#123; &#125;\nL2 "q"  </Button>\n`,
    'projection must apply the template-text law and keep the peripheral whitespace (trim law)',
  );
});

test('an admitted prop op re-projects through the quoted-JSON law (quotes stay, no entity escaping)', async () => {
  const ws = workspace();
  const source = `<Button label="Save">Click</Button>\n`;
  await ws.station.ingestFile('pages/home.svelte', source);

  await submitTextOp(ws, {
    actor: 'agent:copy',
    opId: 'agent:copy:1',
    componentId: 'a1',
    buffer: 'label',
    kind: 'replace',
    offset: 0,
    length: 'Save'.length,
    text: 'He said "hi" & left\nfast',
  });

  const { source: projected } = projectSource(ws.kernel, 'pages/home.svelte');
  // the prop-edit quotedText law is JSON escaping: quotes become \",
  // entities stay bare, and a NEWLINE rides as the two characters `\n`
  // — exactly what applyPropEdit writes for a multi-line prop value
  assert.equal(
    projected,
    `<Button id="a1" label="He said \\"hi\\" & left\\nfast">Click</Button>\n`,
    'prop values serialize through renderValue(...).slice(1, -1) — the prop-edit quotedText law',
  );
});

test('admitted script/style ops re-project verbatim (raw JS/CSS, no template escaping)', async () => {
  const ws = workspace();
  const source = `<script>let a = 1;</script>\n\n<style>.x { color: red; }</style>\n<Button>Go</Button>\n`;
  await ws.station.ingestFile('pages/home.svelte', source);

  await submitTextOp(ws, { actor: 'agent:x', opId: 'agent:x:1', componentId: 'pages/home.svelte', buffer: 'script', kind: 'insert', offset: 'let a = 1;'.length, text: '\nif (a < 2 && a > 0) { run(); }' });
  await submitTextOp(ws, { actor: 'agent:x', opId: 'agent:x:2', componentId: 'pages/home.svelte', buffer: 'style', kind: 'replace', offset: 0, length: '.x { color: red; }'.length, text: '.x & .y { content: "{" }' });

  const { source: projected } = projectSource(ws.kernel, 'pages/home.svelte');
  assert.equal(projected, `<script>let a = 1;\nif (a < 2 && a > 0) { run(); }</script>\n\n<style>.x & .y { content: "{" }</style>\n<Button id="a1">Go</Button>\n`);
});

test('projection canonicalizes exotic entity spellings by construction (p7: the buffer is decoded truth)', async () => {
  const ws = workspace();
  // `&#x20;` decodes to a plain space; the canonical template-text form
  // of a space is the space itself — the next projection normalizes
  const source = `<Button>Click&#x20;go</Button>\n`;
  const report = await ws.station.ingestFile('pages/home.svelte', source);

  const { source: projected } = projectSource(ws.kernel, 'pages/home.svelte');
  assert.equal(projected, `<Button id="a1">Click go</Button>\n`);
  assert.notEqual(projected, report.rewrittenSource); // visible, auditable — never normalized inside the CRDT
});

/* ── nested round trips (B5: holes at depth re-serialize in place) ────── */

test('a three-level nested page projects byte-exactly; every nested buffer is a hole (the fixed point)', async () => {
  const ws = workspace();
  const source = '<Outer label="shell">head <Mid note="mid"><Inner hint="deep">core &amp; text</Inner></Mid> tail</Outer>\n';
  await ws.station.ingestFile('pages/deep.svelte', source);

  const { source: projected, report } = projectSource(ws.kernel, 'pages/deep.svelte');
  assert.equal(
    projected,
    '<Outer id="a1" label="shell">head <Mid id="a2" note="mid"><Inner id="a3" hint="deep">core &amp; text</Inner></Mid> tail</Outer>\n',
    'nested holes project back byte-exactly (canonical entity forms are the fixed point)',
  );
  const keys = report.buffers.map((buffer) => buffer.containerKey);
  for (const expected of ['b:a1:p-label', 'b:a1:t-0', 'b:a1:t-1', 'b:a2:p-note', 'b:a3:p-hint', 'b:a3:t-0']) {
    assert.ok(keys.includes(expected), `${expected} must be a projected buffer`);
  }
});

test('admitted ops on NESTED buffers re-project in place (deepest hole edited, structure bytes intact)', async () => {
  const ws = workspace();
  const source = '<Outer label="shell">head <Mid note="mid"><Inner hint="deep">core</Inner></Mid> tail</Outer>\n';
  await ws.station.ingestFile('pages/deep.svelte', source);

  await submitTextOp(ws, { actor: 'agent:nest', opId: 'agent:nest:1', componentId: 'a3', buffer: 'hint', kind: 'replace', offset: 0, length: 'deep'.length, text: 'shallow' });
  await submitTextOp(ws, { actor: 'agent:nest', opId: 'agent:nest:2', componentId: 'a1', buffer: 't-0', kind: 'replace', offset: 0, length: 'head'.length, text: 'HEAD & <' });

  const { source: projected } = projectSource(ws.kernel, 'pages/deep.svelte');
  assert.equal(
    projected,
    '<Outer id="a1" label="shell">HEAD &amp; &lt; <Mid id="a2" note="mid"><Inner id="a3" hint="shallow">core</Inner></Mid> tail</Outer>\n',
    'the deepest prop and the host slot both re-serialize in place with their serialization laws',
  );
  // the nesting structure rides the payload — the parentage is stable under edits
  const parentage = treeParentageOf(ws.kernel);
  assert.equal(parentage.get('a3'), 'a2');
  assert.equal(parentage.get('a2'), 'a1');
});

/* ── the projection report ────────────────────────────────────────────── */

test('the projection report inventories every buffer and lists the skipped non-buffers', async () => {
  const ws = workspace();
  const source = `<script>let t = 'a';</script>\n\n<style>.x { color: red; }</style>\n\n<script module>export const k = 1;</script>\n\n<Button label="Save" size={2} tone={t} disabled bind:value={v} plain="a{b}c">  Click  </Button>\ntop text\n`;
  await ws.station.ingestFile('pages/home.svelte', source);

  const { report } = projectSource(ws.kernel, 'pages/home.svelte');
  const keys = report.buffers.map((buffer) => buffer.containerKey);
  assert.ok(keys.includes(encodeContainerKey('a1', bufferKeyOf('label'))));
  assert.ok(keys.includes(encodeContainerKey('a1', bufferKeyOf('size'))), '§3: the braced NUMBER literal is a buffer (its text serialization)');
  assert.ok(keys.includes(encodeContainerKey('a1', bufferKeyOf('t-0'))));
  assert.ok(keys.includes(encodeContainerKey('pages/home.svelte', bufferKeyOf('script'))));
  assert.ok(keys.includes(encodeContainerKey('pages/home.svelte', bufferKeyOf('style'))));
  assert.ok(keys.includes(encodeContainerKey('pages/home.svelte', bufferKeyOf('t-0'))), 'top-level text is a page-level buffer');
  assert.equal(ws.kernel.bufferText(encodeContainerKey('a1', bufferKeyOf('size'))), '2');

  const skippedOf = (componentId: string) => report.skipped.filter((skip) => skip.componentId === componentId).map((skip) => skip.name);
  // M6 收敛轮 migration: `size={2}` left the skip list — literal
  // expressions are buffers now (§3); identifiers/directives/multi-part
  // values stay scaffold
  assert.deepEqual(skippedOf('a1'), ['tone', 'disabled', 'bind:value', 'plain']);
  const pageSkips = skippedOf('pages/home.svelte');
  assert.ok(pageSkips.includes('script:module'), 'the module script is reported as page-level scaffold');
});

/* ── errors ───────────────────────────────────────────────────────────── */

test('projecting a never-ingested path fails typed (unknown-page)', async () => {
  const ws = workspace();
  await ws.station.ingestFile('pages/one.svelte', '<Button>Go</Button>\n');
  assert.throws(
    () => projectSource(ws.kernel, 'pages/other.svelte'),
    (error: unknown) => error instanceof BridgeError && error.code === 'unknown-page',
  );
});

test('bufferAnchor encodes a locatable anchor on an empty buffer (the first-insert substrate)', async () => {
  const ws = workspace();
  const report = await ws.station.ingestFile('pages/home.svelte', `<Card label="" />\n`);
  const empty = report.buffers.find((buffer) => buffer.buffer === 'label')!;
  assert.equal(empty.seeded, false); // empty content → container, no first-insert op
  // the anchor still encodes and resolves — a later writer can target it
  const anchor = bufferAnchor(ws.kernel, 'a1', 'label', 0);
  assert.ok(anchor.byteLength > 0);
  const value = await submitTextOp(ws, { actor: 'human', opId: 'human:9', componentId: 'a1', buffer: 'label', kind: 'insert', offset: 0, text: 'late' });
  assert.equal(value, 'late');
  assert.equal(projectSource(ws.kernel, 'pages/home.svelte').source, `<Card id="a1" label="late" />\n`);
});
