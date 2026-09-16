/**
 * prop-materialize.test.ts — the composite prop-materialization lane
 * (design-studio-acceptance-fixes §3): the PURE source transform's laws
 * (bare boolean → `={true}`, absent → ` <prop>=<literal>` per the §3
 * serialization rules, the typed refusals), the compile-gate whitelist
 * regression (`prop-expr` holes ARE compiled — the pre-fix gate
 * misread such pages as "no page" and skipped the check), and the
 * orchestration's typed failure surface against a REAL hosted
 * workspace.
 *
 * Original need: design-studio-acceptance-fixes task 3.6 (2026-09-16).
 */

import { strict as assert } from 'node:assert';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test, { type TestContext } from 'node:test';

import { LoroDoc } from 'loro-crdt';

import { bufferAnchor } from './bridge.ts';
import type { CollabHost } from '../collab-host.ts';
import { openCollabHost } from '../collab-host.ts';
import { MaterializeError, materializeProp, materializePropText } from './prop-materialize.ts';
import { resolveCollabApiRequest } from '../collab-api.ts';
import { transactionCompileGate } from './runtime/compile-gate.ts';

/* ── the pure transform ───────────────────────────────────────────────── */

const PURE_SOURCE = `<main>
  <Button id="a1" disabled variant="ghost">Start designing</Button>
</main>
`;

test('materializePropText: a bare boolean gains ={<bool>} right after the attribute', () => {
  const on = materializePropText(PURE_SOURCE, 'a1', 'disabled', true);
  assert.match(on.source, /disabled=\{true\} variant="ghost"/, 'the insertion lands at the attribute end');
  assert.deepEqual(on.holes, [{ buffer: 'disabled', how: 'prop-expr', text: 'true' }]);
  const off = materializePropText(PURE_SOURCE, 'a1', 'disabled', false);
  assert.match(off.source, /disabled=\{false\} variant="ghost"/);
  assert.deepEqual(off.holes, [{ buffer: 'disabled', how: 'prop-expr', text: 'false' }]);
  // the untouched bytes around the insertion are preserved exactly
  assert.ok(on.source.startsWith('<main>\n  <Button id="a1" '), 'the prefix bytes are untouched');
  assert.ok(on.source.endsWith('>Start designing</Button>\n</main>\n'), 'the suffix bytes are untouched');
});

test('materializePropText: an absent string lands quoted after the last attribute (the §3 law)', () => {
  const out = materializePropText(PURE_SOURCE, 'a1', 'label', 'hero');
  assert.match(out.source, /variant="ghost" label="hero">/, 'the insertion lands after the LAST attribute');
  assert.deepEqual(out.holes, [{ buffer: 'label', how: 'prop-quoted', text: 'hero' }]);
  // the buffer text is the bytes INSIDE the quotes — JSON escaping minus
  // the outer quotes round-trips byte-exactly
  const quoted = materializePropText(PURE_SOURCE, 'a1', 'label', 'say "hi"');
  assert.match(quoted.source, /label="say \\"hi\\""/);
  assert.deepEqual(quoted.holes, [{ buffer: 'label', how: 'prop-quoted', text: 'say \\"hi\\"' }]);
});

test('materializePropText: absent booleans and numbers land as braced literals', () => {
  const bool = materializePropText(PURE_SOURCE, 'a1', 'quiet', false);
  assert.match(bool.source, /quiet=\{false\}/);
  assert.deepEqual(bool.holes, [{ buffer: 'quiet', how: 'prop-expr', text: 'false' }]);
  const num = materializePropText(PURE_SOURCE, 'a1', 'count', 42);
  assert.match(num.source, /count=\{42\}/);
  assert.deepEqual(num.holes, [{ buffer: 'count', how: 'prop-expr', text: '42' }]);
});

test('materializePropText: nested usages address the inner id, siblings untouched', () => {
  const nested = `<main>
  <Outer id="o9"><Mid id="m3" disabled></Mid></Outer>
  <Button id="a1" disabled variant="ghost">Start</Button>
</main>
`;
  const out = materializePropText(nested, 'm3', 'disabled', true);
  assert.match(out.source, /<Mid id="m3" disabled=\{true\}>/);
  assert.match(out.source, /<Button id="a1" disabled variant/, 'the sibling stays bare');
});

test('materializePropText: the typed refusals — buffers, expressions, directives, the id anchor, stale ids', () => {
  const refusal = (action: () => unknown): MaterializeError => {
    try {
      action();
    } catch (error) {
      assert.ok(error instanceof MaterializeError, 'the refusal is a MaterializeError');
      return error;
    }
    assert.fail('expected a MaterializeError');
  };
  assert.equal(refusal(() => materializePropText(PURE_SOURCE, 'a1', 'variant', 'x')).code, 'prop-not-materializable', 'a quoted buffer is already materialized');
  assert.equal(refusal(() => materializePropText(PURE_SOURCE, 'a1', 'id', 'x1')).code, 'prop-not-materializable', 'the identity anchor is never a buffer');
  assert.equal(refusal(() => materializePropText(PURE_SOURCE, 'a1', 'disabled', 'yes')).code, 'prop-not-materializable', 'a bare boolean materializes from a boolean');
  assert.equal(
    refusal(() => materializePropText(PURE_SOURCE.replace('disabled ', 'loading={starting} '), 'a1', 'loading', true)).code,
    'prop-not-materializable',
    'an expression prop keeps the readonly lane',
  );
  assert.equal(
    refusal(() => materializePropText('<main><Input id="i7" bind:value={v} /></main>', 'i7', 'value', 'x')).code,
    'prop-not-materializable',
    'a directive-riding prop is not addressable',
  );
  assert.equal(refusal(() => materializePropText(PURE_SOURCE, 'zz9', 'disabled', true)).code, 'component-not-found');
});

/* ── the hosted workspace (orchestration + gate regression) ───────────── */

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
}

function workspace(t: TestContext, initial: string = PAGE_SOURCE): Workspace {
  const root = mkdtempSync(join(tmpdir(), 'jx-prop-materialize-'));
  const designDir = join(root, 'design');
  const page = 'prototypes/demo/canvas.svelte';
  mkdirSync(join(designDir, 'prototypes', 'demo'), { recursive: true });
  writeFileSync(join(designDir, page), initial);
  const host = openCollabHost(designDir, { ownFsWatch: false });
  t.after(() => {
    void host.dispose();
    rmSync(root, { recursive: true, force: true });
  });
  return { host, page };
}

test('the compile-gate whitelist regression: a page with a prop-expr hole IS compiled (not misread as "no page")', async (t) => {
  const ws = workspace(t);
  await resolveCollabApiRequest(ws.host, 'usage', { file: `design/${ws.page}`, component: 'press-button', usageIndex: 1 }); // adopt

  // poison the raised buffer through the ordinary admit lane (single
  // text ops carry NO compile gate) — the projection now reads
  // raised={x =}, which must fail the REAL svelte compiler
  const poisoned = await ws.host.gate.admit({
    actor: 'agent:t',
    opId: 'agent:t:poison1',
    baseFrontiers: ws.host.kernel.frontiers(),
    domain: 'text',
    kind: 'replace',
    target: { componentId: 'a1', buffer: 'raised' },
    cursorBytes: bufferAnchor(ws.host.kernel, 'a1', 'raised', 0),
    offset: 0,
    length: 4,
    text: 'x =',
    timestamp: Date.now(),
  });
  assert.equal(poisoned.status, 200, 'the poisoning write landed (no gate on single text ops)');

  // the transaction gate on the candidate MUST throw — pre-fix, the
  // prop-expr hole failed isPageItem and the page was silently skipped
  const candidate = LoroDoc.fromSnapshot(ws.host.kernel.snapshotBytes());
  assert.throws(
    () => transactionCompileGate(candidate, new Set([ws.page])),
    (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.equal(error.name, 'CompileGateError');
      assert.equal((error as { stage?: string }).stage, 'svelte-compile');
      return true;
    },
    'a poisoned prop-expr page must fail the transaction compile gate',
  );

  // and a HEALTHY prop-expr page passes with the page actually compiled
  const healed = await ws.host.gate.admit({
    actor: 'agent:t',
    opId: 'agent:t:heal1',
    baseFrontiers: ws.host.kernel.frontiers(),
    domain: 'text',
    kind: 'replace',
    target: { componentId: 'a1', buffer: 'raised' },
    cursorBytes: bufferAnchor(ws.host.kernel, 'a1', 'raised', 0),
    offset: 0,
    length: 3, // the poisoned buffer holds the 3-unit 'x ='
    text: 'true',
    timestamp: Date.now(),
  });
  assert.equal(healed.status, 200);
  const result = transactionCompileGate(LoroDoc.fromSnapshot(ws.host.kernel.snapshotBytes()), new Set([ws.page]));
  assert.equal(result.compiledPages.length, 1, 'the page is compiled (the prop-expr hole no longer hides it)');
  assert.equal(result.compiledPages[0]?.path, ws.page);
});

test('materializeProp: typed 404s — a never-ingested page and a stale component id', async (t) => {
  const ws = workspace(t);
  await resolveCollabApiRequest(ws.host, 'usage', { file: `design/${ws.page}`, component: 'press-button', usageIndex: 1 });
  await assert.rejects(
    materializeProp(ws.host.gate, { page: 'nope/absent.svelte', componentId: 'a1', prop: 'label', value: 'x', opId: 'human:m-404a', actor: 'human' }),
    (error: unknown) => error instanceof MaterializeError && error.code === 'unknown-page',
  );
  await assert.rejects(
    materializeProp(ws.host.gate, { page: ws.page, componentId: 'zz9', prop: 'label', value: 'x', opId: 'human:m-404b', actor: 'human' }),
    (error: unknown) => error instanceof MaterializeError && error.code === 'component-not-found',
  );
});

test('materializeProp: an already-buffered prop refuses before any WAL/journal cost', async (t) => {
  const ws = workspace(t);
  await resolveCollabApiRequest(ws.host, 'usage', { file: `design/${ws.page}`, component: 'press-button', usageIndex: 1 });
  const commitsBefore = ws.host.kernel.journalEntries().filter((entry) => entry.type === 'commit').length;
  await assert.rejects(
    materializeProp(ws.host.gate, { page: ws.page, componentId: 'a1', prop: 'variant', value: 'x', opId: 'human:m-409', actor: 'human' }),
    (error: unknown) => error instanceof MaterializeError && error.code === 'prop-not-materializable',
  );
  assert.equal(ws.host.kernel.journalEntries().filter((entry) => entry.type === 'commit').length, commitsBefore, 'zero commits landed');
});
