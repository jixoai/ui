/**
 * identity.test.ts — the page ledger + id adoption/injection tests
 * (collab-protocol §2; M1 → M5b B5). Full P15 scenario port
 * (`.zcode/epic40/lab/p15-ingest-ids.mjs` — the semantic baseline):
 * fresh-page numbering (a1,a2), idempotent re-ingest, verbatim
 * adoption with the high-water jump (a7 → a8), per-page letters
 * (b1..b3), never-reuse after deletion (b3 gone → b4 next), concurrent
 * same-state determinism — plus the typed-error surface the spec's
 * legality/uniqueness validation defines and the RECURSIVE adoption
 * contract (B5: §2 「每个组件」含嵌套 — top-level-only was
 * impl-review-1's gap, upgraded, not weakened).
 *
 * Original need: collab-protocol M1 (2026-09-15); B5 recursion M5b.
 */

import { strict as assert } from 'node:assert';
import test from 'node:test';

import { IdentityError, ingestIds, pageLetter, type PageLedger } from './identity.ts';

const emptyLedger = (): PageLedger => ({ pages: new Map(), counters: new Map() });

const idsOf = (journal: readonly { id: string }[]): string[] => journal.map((e) => e.id);

const SOURCE = `<script>let title = 'demo';</script>\n<Button label={title}>Save</Button>\n<Card />\n`;

/** the admission-facing error predicate: right TYPE, right CODE */
const isIdentityError =
  (code: string) =>
  (err: unknown): boolean =>
    err instanceof IdentityError && err.code === code;

/* ── P15 scenarios (probe-frozen semantics) ───────────────────────────── */

test('fresh page adopts letter a and numbers components a1,a2 with native id injection', () => {
  const first = ingestIds(SOURCE, emptyLedger(), 'pages/home.svelte');
  assert.deepEqual(idsOf(first.journal), ['a1', 'a2']);
  assert.ok(first.journal.every((e) => e.adopted === 'generated'));
  assert.ok(first.source.includes('<Button id="a1"'));
  assert.ok(first.source.includes('<Card id="a2"'));
  assert.equal(first.ledger.pages.get('pages/home.svelte'), 'a');
  assert.equal(first.ledger.counters.get('a'), 2);
});

test('re-ingest of an injected source is a no-op: same bytes, stable journal, no double-counting', () => {
  const first = ingestIds(SOURCE, emptyLedger(), 'pages/home.svelte');
  const second = ingestIds(first.source, first.ledger, 'pages/home.svelte');
  assert.equal(second.source, first.source); // nothing injected twice
  assert.deepEqual(idsOf(second.journal), ['a1', 'a2']); // journal stable
  assert.ok(second.journal.every((e) => e.adopted === 'verbatim')); // existing ids now
  assert.equal(second.ledger.counters.get('a'), 2); // counters did not advance
});

test('existing legal ids are adopted verbatim; scheme-conforming a7 raises the high-water (next is a8)', () => {
  const first = ingestIds(SOURCE, emptyLedger(), 'pages/home.svelte');
  const manual = `<Button id="hero-cta">Go</Button>\n<Card id="a7" />\n<Chip />\n`;
  const run = ingestIds(manual, first.ledger, 'pages/home.svelte');
  assert.equal(run.journal[0]!.id, 'hero-cta');
  assert.equal(run.journal[0]!.adopted, 'verbatim');
  assert.equal(run.journal[0]!.component, 'Button');
  assert.equal(run.journal[1]!.id, 'a7');
  assert.equal(run.journal[1]!.adopted, 'verbatim');
  assert.equal(run.journal[2]!.id, 'a8'); // jump past the manual high-water
  assert.equal(run.journal[2]!.adopted, 'generated');
  assert.ok(run.source.includes('<Chip id="a8"'));
  assert.equal(run.ledger.counters.get('a'), 8);
});

test('the second page adopts letter b (b1,b2,b3); letters and counters are per-page', () => {
  const home = ingestIds(SOURCE, emptyLedger(), 'pages/home.svelte');
  const pageB = ingestIds(`<A />\n<B />\n<C />\n`, home.ledger, 'pages/second.svelte');
  assert.deepEqual(idsOf(pageB.journal), ['b1', 'b2', 'b3']);
  assert.equal(pageB.ledger.pages.get('pages/second.svelte'), 'b');
  assert.equal(pageB.ledger.counters.get('a'), 2); // page a untouched
  assert.equal(pageB.ledger.counters.get('b'), 3);
});

test('deleted b3 is never reused — the next component takes b4 (monotonic high-water)', () => {
  const home = ingestIds(SOURCE, emptyLedger(), 'pages/home.svelte');
  const pageB = ingestIds(`<A />\n<B />\n<C />\n`, home.ledger, 'pages/second.svelte');
  const afterDelete = ingestIds(`<A id="b1" />\n<B id="b2" />\n`, pageB.ledger, 'pages/second.svelte');
  assert.deepEqual(idsOf(afterDelete.journal), ['b1', 'b2']);
  assert.equal(afterDelete.ledger.counters.get('b'), 3); // b3's number stays spent
  const resurrect = ingestIds(`<A id="b1" />\n<B id="b2" />\n<D />\n`, afterDelete.ledger, 'pages/second.svelte');
  assert.deepEqual(idsOf(resurrect.journal), ['b1', 'b2', 'b4']); // never b3
});

test('concurrent ingests from the same ledger state derive identical results (and never mutate the input)', () => {
  const shared = emptyLedger();
  const a = ingestIds(SOURCE, shared, 'pages/home.svelte');
  const b = ingestIds(SOURCE, shared, 'pages/home.svelte');
  assert.deepEqual(a.journal, b.journal);
  assert.equal(a.source, b.source);
  assert.deepEqual([...a.ledger.pages.entries()], [...b.ledger.pages.entries()]);
  assert.deepEqual([...a.ledger.counters.entries()], [...b.ledger.counters.entries()]);
  // purity: the caller's snapshot survives both forks untouched
  assert.equal(shared.pages.size, 0);
  assert.equal(shared.counters.size, 0);
});

/* ── the letter alphabet ──────────────────────────────────────────────── */

test('pageLetter is bijective base-26: a..z, aa, ab, … az, ba, … zz, aaa', () => {
  assert.deepEqual(
    [0, 1, 2, 25, 26, 27, 51, 52, 701, 702].map(pageLetter),
    ['a', 'b', 'c', 'z', 'aa', 'ab', 'az', 'ba', 'zz', 'aaa'],
  );
});

/* ── the typed-error surface (§2 legality / uniqueness, the 409 feed) ──── */

test('an id with whitespace fails legality (illegal-id)', () => {
  assert.throws(
    () => ingestIds('<Card id="x 1" />\n', emptyLedger(), 'pages/home.svelte'),
    isIdentityError('illegal-id'),
  );
});

test('an empty id value fails legality (illegal-id)', () => {
  assert.throws(
    () => ingestIds('<Card id="" />\n', emptyLedger(), 'pages/home.svelte'),
    isIdentityError('illegal-id'),
  );
});

test('a duplicate id in one file throws duplicate-id', () => {
  assert.throws(
    () => ingestIds('<Card id="dup" />\n<Button id="dup" />\n', emptyLedger(), 'pages/home.svelte'),
    isIdentityError('duplicate-id'),
  );
});

test('a non-literal id (bare, expression, multi-part) throws unreadable-id instead of double-writing the attribute', () => {
  for (const src of ['<Card id />\n', '<Card id={sel} />\n', '<Card id="a{b}c" />\n']) {
    assert.throws(
      () => ingestIds(src, emptyLedger(), 'pages/home.svelte'),
      isIdentityError('unreadable-id'),
    );
  }
});

test('a tampered (shrunken) ledger refuses to re-derive a held letter (letter-collision)', () => {
  const tampered = emptyLedger();
  tampered.pages.set('pages/one.svelte', 'a');
  tampered.pages.set('pages/two.svelte', 'b');
  tampered.pages.delete('pages/one.svelte'); // external removal — must not alias page three onto b
  assert.throws(
    () => ingestIds('<A />\n', tampered, 'pages/three.svelte'),
    isIdentityError('letter-collision'),
  );
});

/* ── recursive adoption (B5: the fragment subtree, not just top level) ─── */

test('nested usages inside plain elements are adopted (B5: <main><Inner /></main> gets a1)', () => {
  const nested = ingestIds('<main>\n  <Inner />\n</main>\n', emptyLedger(), 'pages/n.svelte');
  assert.deepEqual(idsOf(nested.journal), ['a1']);
  assert.equal(nested.journal[0]!.component, 'Inner');
  assert.ok(nested.source.includes('<Inner id="a1"'));
  assert.equal(nested.ledger.counters.get('a'), 1);
});

test('three-level nesting adopts every component in document order; the page counter stays FLAT (no depth layering)', () => {
  const src = '<Outer><Mid><Inner /></Mid></Outer>\n';
  const run = ingestIds(src, emptyLedger(), 'pages/deep.svelte');
  assert.deepEqual(
    run.journal.map((e) => [e.component, e.id, e.adopted]),
    [
      ['Outer', 'a1', 'generated'],
      ['Mid', 'a2', 'generated'],
      ['Inner', 'a3', 'generated'],
    ],
    'pre-order document order — parent before descendants, depth never enters the numbering',
  );
  assert.ok(run.source.includes('<Outer id="a1">'));
  assert.ok(run.source.includes('<Mid id="a2">'));
  assert.ok(run.source.includes('<Inner id="a3"'));
  assert.equal(run.ledger.counters.get('a'), 3);
});

test('flat document-order numbering across mixed depths (top level and nested share one counter)', () => {
  const src = '<Header />\n<section>\n  <Card>\n    <Badge />\n  </Card>\n</section>\n<Footer />\n';
  const run = ingestIds(src, emptyLedger(), 'pages/mix.svelte');
  assert.deepEqual(idsOf(run.journal), ['a1', 'a2', 'a3', 'a4']); // Header, Card, Badge, Footer
  assert.deepEqual(run.journal.map((e) => e.component), ['Header', 'Card', 'Badge', 'Footer']);
  assert.equal(run.ledger.counters.get('a'), 4);
});

test('components inside block fragments are adopted ({#if}/{:else}/{#each}/{#await}/{#snippet})', () => {
  const src = [
    '{#if ok}',
    '  <Truthy />',
    '{:else}',
    '  {#each items as it}',
    '    <Row />',
    '  {/each}',
    '{/if}',
    '{#await promise then value}',
    '  <Awe />',
    '{/await}',
    '{#snippet cell()}',
    '  <Cell />',
    '{/snippet}',
  ].join('\n');
  const run = ingestIds(src, emptyLedger(), 'pages/blocks.svelte');
  assert.deepEqual(run.journal.map((e) => e.component), ['Truthy', 'Row', 'Awe', 'Cell']);
  assert.ok(run.source.includes('<Truthy id="a1"'));
  assert.ok(run.source.includes('<Row id="a2"'));
  assert.ok(run.source.includes('<Awe id="a3"'));
  assert.ok(run.source.includes('<Cell id="a4"'));
});

test('nested re-ingest is a no-op: ids injected at depth are adopted verbatim, nothing advances', () => {
  const first = ingestIds('<Outer><Mid><Inner /></Mid></Outer>\n', emptyLedger(), 'pages/deep.svelte');
  const second = ingestIds(first.source, first.ledger, 'pages/deep.svelte');
  assert.equal(second.source, first.source);
  assert.deepEqual(idsOf(second.journal), ['a1', 'a2', 'a3']);
  assert.ok(second.journal.every((e) => e.adopted === 'verbatim'));
  assert.equal(second.ledger.counters.get('a'), 3);
});

test('a verbatim nested id is adopted as-is; duplicates across depths throw (uniqueness is file-global)', () => {
  const run = ingestIds('<Outer><Mid id="hero-mid" /></Outer>\n', emptyLedger(), 'pages/v.svelte');
  assert.deepEqual(
    run.journal.map((e) => [e.id, e.adopted]),
    [
      ['a1', 'generated'],
      ['hero-mid', 'verbatim'],
    ],
  );
  assert.throws(
    () => ingestIds('<Card id="dup" /><Wrap><Chip id="dup" /></Wrap>\n', emptyLedger(), 'pages/d.svelte'),
    isIdentityError('duplicate-id'),
  );
});

test('a page with no top-level components adopts a letter and returns the source untouched', () => {
  const plain = ingestIds('<p>plain markup</p>\n', emptyLedger(), 'pages/plain.svelte');
  assert.equal(plain.source, '<p>plain markup</p>\n');
  assert.deepEqual(plain.journal, []);
  assert.equal(plain.ledger.pages.get('pages/plain.svelte'), 'a');
});
