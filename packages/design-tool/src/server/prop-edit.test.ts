/**
 * prop-edit.test.ts — the source-edit kernel + CAS arbitration tests
 * (design-studio-r2 T8). Pure node: svelte parse + magic-string run
 * natively; the CAS race is simulated with FileOps stubs that write
 * behind the editor's back.
 *
 * Original need: Owner 2026-09-11 (design-studio-r2 T8; VD1/VD1e).
 */

import { strict as assert } from 'node:assert';
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import test from 'node:test';

import { applyPropEdit, dryRunUsage, locateUsages, resolvePropEditRequest, type FileOps } from './prop-edit.ts';

/* ── locate: document order + import anchoring + each-enclosure ───────── */

const HERO = `<script module lang="ts">
  import PressButton from '#jixoai/press-button';
  import Badge from '#jixoai/badge';
</script>

<main>
  <PressButton variant="fill">Start</PressButton>
  <PressButton variant="ghost" gap={8}>Read</PressButton>
  <ul>
    {#each items as item}
      <Badge tone={item.tone}>{item.label}</Badge>
    {/each}
  </ul>
</main>
`;

test('locate: usages in document order, 1-based, import-anchored', () => {
  const usages = locateUsages(HERO, 'press-button');
  assert.equal(usages.length, 2);
  assert.equal(usages[0]!.insideEach, false);
  assert.equal(usages[1]!.insideEach, false);

  const badges = locateUsages(HERO, 'badge');
  assert.equal(badges.length, 1);
  assert.equal(badges[0]!.insideEach, true); // the {#each} enclosure is reported
});

test('locate: bare identifier works without a #jixoai import', () => {
  const source = '<div><Thing a={1}/><Thing a={2}/></div>';
  assert.equal(locateUsages(source, 'Thing').length, 2);
});

test('locate: named-import specifiers anchor the item (prototype-kit shape)', () => {
  const source = [
    "<script module lang=\"ts\">",
    "  import { PrototypeCanvas, PrototypeComponent, type Foo } from '#jixoai/prototype-kit';",
    "</script>",
    "<PrototypeCanvas gridCols={3}><PrototypeComponent id='x' ref='./c.svelte'/></PrototypeCanvas>",
  ].join('\n');
  const usages = locateUsages(source, 'prototype-kit');
  assert.equal(usages.length, 2); // PrototypeCanvas + PrototypeComponent, NOT the type-only Foo
  const dry = dryRunUsage(source, 'prototype-kit', 1, ['gridCols']);
  assert.ok(!('error' in dry));
  if ('error' in dry) return;
  assert.deepEqual(dry.values.gridCols, { representable: true, value: 3 });
});

/* ── rewrite: replace / insert / non-representable ────────────────────── */

test('rewrite: quoted string literal replaced in place (quotes preserved)', () => {
  const outcome = applyPropEdit(HERO, 'press-button', 1, 'variant', 'tonal');
  assert.equal(outcome.ok, true);
  if (!outcome.ok) return;
  assert.ok(outcome.output.includes('<PressButton variant="tonal">Start</PressButton>'));
  assert.ok(!outcome.output.includes('"fill"'));
  // the untouched sibling stays byte-identical
  assert.ok(outcome.output.includes('<PressButton variant="ghost" gap={8}>Read</PressButton>'));
});

test('rewrite: braced number literal replaced with {…} rendering', () => {
  const outcome = applyPropEdit(HERO, 'press-button', 2, 'gap', 16);
  assert.equal(outcome.ok, true);
  if (!outcome.ok) return;
  assert.ok(outcome.output.includes('gap={16}'));
  // string-over-brace swaps to the quoted form
  const swapped = applyPropEdit(HERO, 'press-button', 2, 'gap', 'wide');
  assert.equal(swapped.ok, true);
  if (!swapped.ok) return;
  assert.ok(swapped.output.includes('gap="wide"'));
});

test('rewrite: absent prop inserted after the tag name (self-closing and child-carrying)', () => {
  const source = [
    '<script>import Flex from "#jixoai/prototype-flex";</script>',
    '<Flex><span>a</span></Flex>',
    '<Flex/>',
  ].join('\n');
  const first = applyPropEdit(source, 'prototype-flex', 1, 'gap', 16);
  assert.equal(first.ok, true);
  if (!first.ok) return;
  assert.ok(first.output.includes('<Flex gap={16}><span>a</span></Flex>'));
  const second = applyPropEdit(source, 'prototype-flex', 2, 'direction', 'column');
  assert.equal(second.ok, true);
  if (!second.ok) return;
  assert.ok(second.output.includes('<Flex direction="column"/>'));
});

test('rewrite: bound and expression props are non-representable', () => {
  const source = '<script>import Thing from "#jixoai/thing";</script>\n<Thing label={dynamic} bind:value={x} count={n + 1} ok="lit" />';
  for (const prop of ['label', 'value', 'count']) {
    const outcome = applyPropEdit(source, 'thing', 1, prop, 'v');
    assert.equal(outcome.ok, false, prop);
    if (outcome.ok) return;
    assert.equal(outcome.reason, 'non-representable', prop);
  }
  const fine = applyPropEdit(source, 'thing', 1, 'ok', 'other');
  assert.equal(fine.ok, true);
});

test('rewrite: usage-not-found and kind-mismatch are named (the stamp space)', () => {
  assert.deepEqual(
    (() => { const o = applyPropEdit(HERO, 'press-button', 9, 'variant', 'x'); return o.ok ? null : o.reason; })(),
    'usage-not-found',
  );
  // a file WITH jixoai imports never says component-not-found — the
  // global index resolves and the KIND assertion refuses (P0 fix)
  const mismatch = applyPropEdit(HERO, 'ghost-button', 1, 'variant', 'x');
  assert.equal(mismatch.ok, false);
  if (mismatch.ok) return;
  assert.equal(mismatch.reason, 'usage-not-found');
  assert.match(mismatch.message, /ghost-button/);
  assert.match(mismatch.message, /press-button/);
});

test('rewrite: the stamp space counts ALL kinds — mixed files target correctly (P0 pin)', () => {
  const source = [
    '<script>import PressButton from "#jixoai/press-button"; import Badge from "#jixoai/badge";</script>',
    '<main><Badge tone="x">L</Badge>',
    '<PressButton variant="fill">A</PressButton>',
    '<PressButton variant="ghost">B</PressButton></main>',
  ].join('\n');
  // global order: Badge=1, A=2, B=3 — per-kind counting would have
  // made "press-button #2" hit B (the walkthrough's silent corruption)
  const a = applyPropEdit(source, 'press-button', 2, 'variant', 'tonal');
  assert.equal(a.ok, true);
  if (!a.ok) return;
  assert.ok(a.output.includes('<PressButton variant="tonal">A'));
  assert.ok(a.output.includes('<PressButton variant="ghost">B'));
  const b = applyPropEdit(source, 'press-button', 3, 'variant', 'fill');
  assert.equal(b.ok, true);
  if (!b.ok) return;
  assert.ok(b.output.includes('<PressButton variant="fill">B'));
});

test('rewrite: null removes the attribute (the absent-state restore, P2-2)', () => {
  const withRaised = HERO.replace('<PressButton variant="fill">', '<PressButton variant="fill" raised={true}>');
  const removed = applyPropEdit(withRaised, 'press-button', 1, 'raised', null);
  assert.equal(removed.ok, true);
  if (!removed.ok) return;
  assert.ok(removed.output.includes('<PressButton variant="fill">Start'));
  assert.ok(!removed.output.includes('raised'));
  // absent already → no-op success
  const noop = applyPropEdit(HERO, 'press-button', 1, 'raised', null);
  assert.equal(noop.ok, true);
  if (!noop.ok) return;
  assert.equal(noop.output, HERO);
});

/* ── dry-run: the panel's seed values + shared flag ───────────────────── */

test('dry-run: current literals, unset-and-representable rows, shared enclosure', () => {
  const result = dryRunUsage(HERO, 'press-button', 2, ['variant', 'gap', 'unset-prop']);
  assert.ok(!('error' in result));
  if ('error' in result) return;
  assert.deepEqual(result.values.variant, { representable: true, value: 'ghost' });
  assert.deepEqual(result.values.gap, { representable: true, value: 8 });
  assert.deepEqual(result.values['unset-prop'], { representable: true });
  assert.equal(result.shared, false);

  const badge = dryRunUsage(HERO, 'badge', 3, ['tone']); // global stamp space: Badge is the 3rd usage
  assert.ok(!('error' in badge));
  if ('error' in badge) return;
  assert.deepEqual(badge.values.tone, { representable: false }); // {item.tone} expression
  assert.equal(badge.shared, true);
});

/* ── the resolver: file safety + CAS arbitration ──────────────────────── */

function tmpRoot(): string {
  return mkdtempSync(join(tmpdir(), 'design-prop-edit-'));
}

function write(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

test('resolver: happy path writes the file (root-relative path)', async () => {
  const root = tmpRoot();
  try {
    write(join(root, 'design/prototypes/welcome/pages/hero.svelte'), HERO);
    const response = await resolvePropEditRequest(root, {
      file: 'design/prototypes/welcome/pages/hero.svelte',
      component: 'press-button',
      usageIndex: 1,
      prop: 'variant',
      value: 'tonal',
    });
    assert.equal(response.status, 200, JSON.stringify(response.body));
    assert.equal(response.body.ok, true);
    if (!response.body.ok) return;
    assert.equal(response.body.wrote, true);
    assert.ok(readFileSync(join(root, 'design/prototypes/welcome/pages/hero.svelte'), 'utf8').includes('variant="tonal"'));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('resolver: null REMOVES end-to-end through the request gate (the B1 pin)', async () => {
  // the final review caught the pure-kernel pin sailing past the
  // REQUEST validation: typeof null === 'object' 400'd while the
  // kernel's null semantics were green — pin the whole chain
  const root = tmpRoot();
  try {
    const path = join(root, 'design/prototypes/welcome/pages/hero.svelte');
    const withRaised = HERO.replace('<PressButton variant="fill">', '<PressButton variant="fill" raised={true}>');
    write(path, withRaised);
    const response = await resolvePropEditRequest(root, {
      file: 'design/prototypes/welcome/pages/hero.svelte',
      component: 'press-button',
      usageIndex: 1,
      prop: 'raised',
      value: null,
    });
    assert.equal(response.status, 200, JSON.stringify(response.body));
    assert.equal(response.body.ok, true);
    const after = readFileSync(path, 'utf8');
    assert.ok(!after.includes('raised'), 'the attribute must be gone from disk');
    assert.ok(after.includes('<PressButton variant="fill">Start'));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('resolver: path escape and non-svelte targets refused', async () => {
  const root = tmpRoot();
  try {
    write(join(root, 'inside.svelte'), HERO);
    write(join(root, 'outside/secret.txt'), 'x');
    const escape = await resolvePropEditRequest(root, { file: '../outside/secret.txt', component: 'press-button', usageIndex: 1, prop: 'variant', value: 'x' });
    assert.equal(escape.status, 400);
    const notSvelte = await resolvePropEditRequest(root, { file: 'inside.svelte.bak', component: 'press-button', usageIndex: 1, prop: 'variant', value: 'x' });
    assert.equal(notSvelte.status, 400); // suffix gate fires before existence
    const missing = await resolvePropEditRequest(root, { file: 'missing.svelte', component: 'press-button', usageIndex: 1, prop: 'variant', value: 'x' });
    assert.equal(missing.status, 404);
    const badBody = await resolvePropEditRequest(root, { file: 'inside.svelte', component: 'press-button', usageIndex: 0 });
    assert.equal(badBody.status, 400);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('resolver: CAS — one external write retries and lands, a second abandons 409', async () => {
  const root = tmpRoot();
  try {
    const path = join(root, 'page.svelte');
    write(path, HERO);

    // FileOps that simulates an EXTERNAL writer changing the file after
    // the editor's first read (one-shot: the retry then succeeds)
    let reads = 0;
    const racingOnce: FileOps = {
      read: (p) => {
        reads += 1;
        const current = readFileSync(p, 'utf8');
        if (reads === 2) {
          // the editor re-reads for the CAS check — the file moved under it
          const moved = current.replace('Start', 'Start (agent touched)');
          writeFileSync(p, moved, 'utf8');
          return moved;
        }
        return current;
      },
      write: (p, content) => writeFileSync(p, content, 'utf8'),
    };
    const retried = await resolvePropEditRequest(root, { file: 'page.svelte', component: 'press-button', usageIndex: 1, prop: 'variant', value: 'tonal' }, racingOnce);
    assert.equal(retried.status, 200, JSON.stringify(retried.body));
    assert.equal(retried.body.ok, true);
    const after = readFileSync(path, 'utf8');
    assert.ok(after.includes('variant="tonal"'));
    assert.ok(after.includes('(agent touched)')); // the external write survived

    // a PERSISTENT external writer (every read mutates) → re-location
    // still finds a changed file → 409, file untouched by the editor
    reads = 0;
    const racingAlways: FileOps = {
      read: (p) => {
        reads += 1;
        const current = readFileSync(p, 'utf8');
        const moved = current.replace('Read', `Read v${reads}`);
        writeFileSync(p, moved, 'utf8');
        return moved;
      },
      write: (p, content) => writeFileSync(p, content, 'utf8'),
    };
    const refused = await resolvePropEditRequest(root, { file: 'page.svelte', component: 'press-button', usageIndex: 1, prop: 'variant', value: 'fill' }, racingAlways);
    assert.equal(refused.status, 409, JSON.stringify(refused.body));
    const finalText = readFileSync(path, 'utf8');
    assert.ok(!finalText.includes('variant="fill"'), 'the abandoned edit must not land');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
