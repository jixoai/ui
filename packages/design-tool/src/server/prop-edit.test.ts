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

import { applyPropEdit, applyTextEdit, dryRunUsage, locateUsages, resolvePropEditRequest, serializeTemplateText, type FileOps } from './prop-edit.ts';

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

/* ── slot text (issue #38 B3: the children.text[n] edit kernel) ───────── */

const TEXT_HERO = `<script module lang="ts">
  import PressButton from '#jixoai/press-button';
  import Badge from '#jixoai/badge';
</script>

<main>
  <PressButton variant="fill">Start designing</PressButton>
  <PressButton variant="ghost">
    Read
    the standard
  </PressButton>
  <Badge tone="outline">&amp; more</Badge>
  <Badge tone="outline">{dynamic}</Badge>
</main>
`;

test('text: the serializer escapes in ORDER, quotes ride free', () => {
  assert.equal(serializeTemplateText('plain'), 'plain');
  assert.equal(serializeTemplateText('say "hi" and \'ok\''), 'say "hi" and \'ok\'');
  // ORDER matters: & first, or the entities of later escapes double-encode
  assert.equal(serializeTemplateText('<&>'), '&lt;&amp;&gt;');
  assert.equal(serializeTemplateText('{a}'), '&#123;a&#125;');
  assert.equal(serializeTemplateText('a & b'), 'a &amp; b');
  // multi-line keeps RAW newlines — text, never a JSON literal
  assert.equal(serializeTemplateText('l1\nl2'), 'l1\nl2');
});

test('text: single-fragment replacement in place (peripheral whitespace kept)', () => {
  const outcome = applyTextEdit(TEXT_HERO, 'press-button', 1, 0, 'Ship it');
  assert.equal(outcome.ok, true);
  if (!outcome.ok) return;
  assert.ok(outcome.output.includes('<PressButton variant="fill">Ship it</PressButton>'));
  // the untouched sibling stays byte-identical
  assert.ok(outcome.output.includes('Read\n    the standard'));
});

test('text: multi-fragment ordinals address the right span (children.text[n])', () => {
  // usage 2's direct Text children are [\n    Read\n    the standard\n  ]
  // — ONE node (no expression/comment boundary inside), trimmed span
  const outcome = applyTextEdit(TEXT_HERO, 'press-button', 2, 0, 'Read\nthe rules');
  assert.equal(outcome.ok, true);
  if (!outcome.ok) return;
  assert.ok(
    outcome.output.includes('<PressButton variant="ghost">\n    Read\nthe rules\n  </PressButton>'),
    'the newline value lands verbatim, the peripheral indent survives',
  );
});

test('text: entity-bearing span replaces cleanly (raw coords, decoded seed)', () => {
  const outcome = applyTextEdit(TEXT_HERO, 'badge', 3, 0, 'less & fewer');
  assert.equal(outcome.ok, true);
  if (!outcome.ok) return;
  assert.ok(outcome.output.includes('<Badge tone="outline">less &amp; fewer</Badge>'));
  assert.ok(!outcome.output.includes('&amp; more'));
});

test('text: braces/angles in the value serialize hostile-free and still compile', async () => {
  const { compile } = await import('svelte/compiler');
  for (const [value, written] of [
    ['set {x} = <b>', 'set &#123;x&#125; = &lt;b&gt;'],
    ['a<b && c>d', 'a&lt;b &amp;&amp; c&gt;d'],
  ] as const) {
    const outcome = applyTextEdit(TEXT_HERO, 'press-button', 1, 0, value);
    assert.equal(outcome.ok, true, value);
    if (!outcome.ok) return;
    assert.ok(outcome.output.includes(`>${written}<`), value);
    compile(outcome.output, { generate: 'client' }); // never re-opens a boundary
  }
});

test('text: empty value DELETES the visible fragment, peripheral whitespace survives', () => {
  const outcome = applyTextEdit(TEXT_HERO, 'press-button', 2, 0, '');
  assert.equal(outcome.ok, true);
  if (!outcome.ok) return;
  assert.ok(
    outcome.output.includes('<PressButton variant="ghost">\n    \n  </PressButton>'),
    'only the trimmed fragment goes; the surrounding whitespace stays',
  );
});

test('text: whitespace-only usage and out-of-range ordinals are text-not-found', () => {
  // usage 4's only child is an expression — no fragments at all
  const exprOnly = applyTextEdit(TEXT_HERO, 'badge', 4, 0, 'x');
  assert.equal(exprOnly.ok, false);
  if (exprOnly.ok) return;
  assert.equal(exprOnly.reason, 'text-not-found');
  assert.match(exprOnly.message, /no direct editable text/);
  // ordinal past the range
  const past = applyTextEdit(TEXT_HERO, 'press-button', 1, 1, 'x');
  assert.equal(past.ok, false);
  if (past.ok) return;
  assert.equal(past.reason, 'text-not-found');
  assert.match(past.message, /children\.text\[1\]/);
});

test('text: dry-run seeds the fragments (decoded text, ordinals) for the panel', () => {
  const dry = dryRunUsage(TEXT_HERO, 'press-button', 2, ['variant']);
  assert.ok(!('error' in dry));
  if ('error' in dry) return;
  assert.deepEqual(dry.texts, [{ index: 0, text: 'Read\n    the standard', raw: 'Read\n    the standard' }]);
  const none = dryRunUsage(TEXT_HERO, 'badge', 4, ['tone']);
  assert.ok(!('error' in none));
  if ('error' in none) return;
  assert.deepEqual(none.texts, [], 'expression-only usage seeds zero rows');
});

test('text resolver: 200 write path — the disk file carries the edit', async () => {
  const root = tmpRoot();
  try {
    const path = join(root, 'hero.svelte');
    write(path, TEXT_HERO);
    const response = await resolvePropEditRequest(root, {
      file: 'hero.svelte',
      component: 'press-button',
      usageIndex: 1,
      slot: 'children',
      textIndex: 0,
      value: 'Ship it',
    });
    assert.equal(response.status, 200, JSON.stringify(response.body));
    assert.equal(response.body.ok, true);
    const after = readFileSync(path, 'utf8');
    assert.ok(after.includes('>Ship it<'));
    // and the dry-run reflects the new text (the panel's reseed source)
    const dry = await resolvePropEditRequest(root, { file: 'hero.svelte', component: 'press-button', usageIndex: 1, dryRun: true });
    assert.equal(dry.status, 200);
    if (dry.body.ok) assert.deepEqual(dry.body.textSpans, [{ index: 0, text: 'Ship it', raw: 'Ship it' }]);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('text resolver: 200 ok:false for a stale ordinal, 400 for malformed requests', async () => {
  const root = tmpRoot();
  try {
    const path = join(root, 'hero.svelte');
    write(path, TEXT_HERO);
    const stale = await resolvePropEditRequest(root, { file: 'hero.svelte', component: 'press-button', usageIndex: 1, slot: 'children', textIndex: 5, value: 'x' });
    assert.equal(stale.status, 200);
    if (stale.body.ok) throw new Error('expected ok:false');
    assert.equal(stale.body.reason, 'text-not-found');
    const noIndex = await resolvePropEditRequest(root, { file: 'hero.svelte', component: 'press-button', usageIndex: 1, slot: 'children', value: 'x' });
    assert.equal(noIndex.status, 400);
    const badValue = await resolvePropEditRequest(root, { file: 'hero.svelte', component: 'press-button', usageIndex: 1, slot: 'children', textIndex: 0, value: 7 });
    assert.equal(badValue.status, 400);
    const badSlot = await resolvePropEditRequest(root, { file: 'hero.svelte', component: 'press-button', usageIndex: 1, slot: 'head', textIndex: 0, value: 'x' });
    assert.equal(badSlot.status, 400);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('text resolver: 409 — a racing write that turns the text into an expression (node type change)', async () => {
  const root = tmpRoot();
  try {
    const path = join(root, 'hero.svelte');
    write(path, TEXT_HERO);
    // after the editor's first read, an agent replaces the Text child
    // with an ExpressionTag — the ordinal dies under the write
    let reads = 0;
    const racingTypeChange: FileOps = {
      read: (p) => {
        reads += 1;
        const current = readFileSync(p, 'utf8');
        if (reads === 2) {
          const moved = current.replace('>Start designing<', '>{agentLabel}<');
          writeFileSync(p, moved, 'utf8');
          return moved;
        }
        return current;
      },
      write: (p, content) => writeFileSync(p, content, 'utf8'),
    };
    const refused = await resolvePropEditRequest(
      root,
      { file: 'hero.svelte', component: 'press-button', usageIndex: 1, slot: 'children', textIndex: 0, value: 'Ship it' },
      racingTypeChange,
    );
    assert.equal(refused.status, 409, JSON.stringify(refused.body));
    if (refused.body.ok) throw new Error('expected ok:false');
    assert.equal(refused.body.reason, 'cas-conflict');
    assert.match(refused.body.message, /children\.text\[0\]/);
    // the editor's guess never lands; the agent's expression survives
    const after = readFileSync(path, 'utf8');
    assert.ok(after.includes('>{agentLabel}<'));
    assert.ok(!after.includes('Ship it'));
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('text resolver: CAS — a benign racing write re-locates and lands', async () => {
  const root = tmpRoot();
  try {
    const path = join(root, 'hero.svelte');
    write(path, TEXT_HERO);
    let reads = 0;
    const racingOnce: FileOps = {
      read: (p) => {
        reads += 1;
        const current = readFileSync(p, 'utf8');
        if (reads === 2) {
          const moved = current.replace('variant="fill"', 'variant="tonal"');
          writeFileSync(p, moved, 'utf8');
          return moved;
        }
        return current;
      },
      write: (p, content) => writeFileSync(p, content, 'utf8'),
    };
    const response = await resolvePropEditRequest(
      root,
      { file: 'hero.svelte', component: 'press-button', usageIndex: 1, slot: 'children', textIndex: 0, value: 'Ship it' },
      racingOnce,
    );
    assert.equal(response.status, 200, JSON.stringify(response.body));
    assert.equal(response.body.ok, true);
    const after = readFileSync(path, 'utf8');
    assert.ok(after.includes('>Ship it<'));
    assert.ok(after.includes('variant="tonal"'), 'the external write survived');
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});


/* ── the raw fingerprint (Codex round-2 P1): ordinal identity ───────── */

test('#38-P1 a competing INSERT before the target shifts the ordinal — the fingerprint 409s, never edits the wrong fragment', async () => {
  // Codex's exact repro: target children.text[1] = "two"; the external
  // write prepends zero<!--x--> so text[1] is now "one" — still legal,
  // but WRONG. Without the fingerprint this silently edits "one".
  const before = '<script module>import P from \'#jixoai/text\';</script>\n<P>one<!--c-->two</P>';
  const after = '<script module>import P from \'#jixoai/text\';</script>\n<P>zero<!--x-->one<!--c-->two</P>';
  // seeded against BEFORE: fragment 1 raw is "two"
  const seeded = applyTextEdit(before, 'text', 1, 1, 'edited');
  assert.equal(seeded.ok, true, 'sanity: against the seeded source it edits');
  // replayed against AFTER (the CAS retry's fresh bytes): fragment 1
  // raw is now "one" — identity lost, must refuse
  const replay = applyTextEdit(after, 'text', 1, 1, 'edited', 'two');
  assert.equal(replay.ok, false);
  assert.equal((replay as { reason?: string }).reason, 'text-shifted');
  // and the disk content is UNTOUCHED by the refused attempt (pure fn)
  assert.equal(after.includes('>edited<'), false);
});

test('#38-P1 benign relocations pass — same raw, external prop edits elsewhere', async () => {
  const before = '<script module>import P from \'#jixoai/text\';</script>\n<P variant="a">hello</P>';
  const after = '<script module>import P from \'#jixoai/text\';</script>\n<P variant="b">hello</P>';
  const outcome = applyTextEdit(after, 'text', 1, 0, 'hi', 'hello');
  assert.equal(outcome.ok, true, 'same raw → the edit lands despite the external prop change');
  assert.equal((outcome as { output?: string }).output?.includes('>hi<'), true);
});

test('#38-P1 an entity at the tail followed by ASCII whitespace trims correctly (Codex non-blocking pin)', async () => {
  // the raw ends with an ENTITY then a space: only the space is
  // peripheral; the entity is content, decoded text keeps the &.
  // Raw: "a &amp; " → trimmed raw "a &amp;", decoded "a &"
  const src = '<script module>import P from \'#jixoai/text\';</script>\n<P>a &amp; </P>';
  const outcome = applyTextEdit(src, 'text', 1, 0, 'X', 'a &amp;');
  assert.equal(outcome.ok, true);
  assert.equal((outcome as { output?: string }).output?.includes('>X '), true, 'the entity+space tail trims; the peripheral space survives the edit');
});
