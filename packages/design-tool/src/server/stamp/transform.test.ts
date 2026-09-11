/**
 * stamp transform tests — the pure kernel of the usage-site stamping
 * (design-studio-r2 T0; spec scenarios "static numbering is
 * HMR-stable" and the degradation matrix).
 *
 * Original need: design-studio-r2 tasks.md T0 (2026-09-11).
 */

import { strict as assert } from 'node:assert';
import test from 'node:test';

import { compile } from 'svelte/compiler';

import {
  STAMP_COMPONENT_ATTR,
  STAMP_INSTANCE_ATTR,
  USAGE_MAP_EXPORT,
  jsStringLiteral,
  stampSvelteSource,
} from './transform.ts';

/** a prototype-shaped fixture with the welcome scaffold's real shape */
const HERO_FIXTURE = `<script module lang="ts">
  import Badge from '#jixoai/badge';
  import Card, { CardBody } from '#jixoai/card';
  import PressButton from '#jixoai/press-button';
</script>

<main>
  <header>
    <Badge variant="outline">design studio</Badge>
    <div class="actions">
      <PressButton variant="fill">Start designing</PressButton>
      <PressButton variant="ghost">Read the standard</PressButton>
    </div>
  </header>
  <Card title="Real viewports">
    <CardBody>media queries</CardBody>
  </Card>
</main>
`;

const HERO_BINDINGS = {
  Badge: 'badge',
  Card: 'card',
  CardBody: 'card',
  PressButton: 'press-button',
};

test('stamps every jixoai usage with file-global document-order numbering', async () => {
  const result = await stampSvelteSource(HERO_FIXTURE, { filename: 'hero.svelte', bindings: HERO_BINDINGS });
  assert.notEqual(result, null);
  assert.equal(result!.stamped, 5); // Badge, 2x PressButton, Card, CardBody
  // numbering is file-global (the {file, usageIndex} address must be unique)
  assert.equal(result!.code.includes(`${STAMP_COMPONENT_ATTR}="badge" ${STAMP_INSTANCE_ATTR}="1"`), true);
  assert.equal(result!.code.includes(`${STAMP_COMPONENT_ATTR}="press-button" ${STAMP_INSTANCE_ATTR}="2"`), true);
  assert.equal(result!.code.includes(`${STAMP_COMPONENT_ATTR}="press-button" ${STAMP_INSTANCE_ATTR}="3"`), true);
  // named re-exports (CardBody from #jixoai/card) stamp the ITEM id
  assert.equal(result!.code.includes(`${STAMP_COMPONENT_ATTR}="card" ${STAMP_INSTANCE_ATTR}="4"`), true);
  assert.equal(result!.code.includes(`${STAMP_COMPONENT_ATTR}="card" ${STAMP_INSTANCE_ATTR}="5"`), true);
});

test('stamps land after the last attribute so a usage spread cannot override them', async () => {
  const source = `<script module>import P from '#jixoai/press-button';</script>\n<P variant="fill" {...rest}>go</P>`;
  const result = await stampSvelteSource(source, { filename: 'x.svelte', bindings: { P: 'press-button' } });
  assert.notEqual(result, null);
  assert.equal(result!.code.includes('<P variant="fill" {...rest} data-jx-component="press-button" data-jx-instance="1">'), true);
});

test('usage map: prop spans and kinds in ORIGINAL-source coordinates', async () => {
  const source = [
    '<script module>import P from "#jixoai/press-button";</script>',
    '<P variant="fill" disabled size={2} tone={tone} label="a{b}c">go</P>',
  ].join('\n');
  const result = await stampSvelteSource(source, { filename: 'x.svelte', bindings: { P: 'press-button' } });
  assert.notEqual(result, null);
  const entry = result!.usageMap['1']!;
  assert.equal(entry.component, 'press-button');
  assert.equal(entry.tag, 'P');
  assert.equal(entry.usageIndex, 1);

  // Text literal: the span covers exactly `fill` (quotes stay on rewrite)
  const variant = entry.props['variant']!;
  assert.equal(variant.kind, 'literal');
  assert.equal(variant.value, 'fill');
  assert.equal(source.slice(variant.start, variant.end), 'fill');

  // bare attribute: boolean true, whole-attribute span
  const disabled = entry.props['disabled']!;
  assert.equal(disabled.kind, 'literal');
  assert.equal(disabled.value, true);
  assert.equal(source.slice(disabled.start, disabled.end), 'disabled');

  // literal expression: the span covers exactly the literal token
  const size = entry.props['size']!;
  assert.equal(size.kind, 'literal');
  assert.equal(size.value, 2);
  assert.equal(source.slice(size.start, size.end), '2');

  // identifier expression: read-only
  const tone = entry.props['tone']!;
  assert.equal(tone.kind, 'expression');

  // interpolated value: read-only (multi-part)
  const label = entry.props['label']!;
  assert.equal(label.kind, 'expression');

  // absent props are simply unkeyed ('none' is the reserved kind for
  // absent props — the panel inserts at insertAt)
  assert.equal(entry.props['loading'], undefined);
  assert.equal(typeof entry.insertAt, 'number');
});

test('usage map: the __jxUsageMap export rides the module and parses', async () => {
  const result = await stampSvelteSource(HERO_FIXTURE, { filename: 'hero.svelte', bindings: HERO_BINDINGS });
  assert.notEqual(result, null);
  assert.equal(result!.code.includes(`export const ${USAGE_MAP_EXPORT}`), true);
  // the emitted code is valid svelte and compiles
  const compiled = compile(result!.code, { generate: 'client', filename: 'hero.svelte' });
  assert.equal(compiled.js.code.includes(USAGE_MAP_EXPORT), true);
});

test('module-script-bearing files: the export injects into the EXISTING module script', async () => {
  const result = await stampSvelteSource(HERO_FIXTURE, { filename: 'hero.svelte', bindings: HERO_BINDINGS });
  assert.notEqual(result, null);
  // exactly ONE module script (two are a compile error — verified)
  assert.equal(result!.code.match(/<script module/g)?.length, 1);
  // the export sits inside it, before its closing tag
  const scriptStart = result!.code.indexOf('<script module');
  const scriptEnd = result!.code.indexOf('</script>', scriptStart);
  const exportAt = result!.code.indexOf(`export const ${USAGE_MAP_EXPORT}`);
  assert.ok(exportAt > scriptStart && exportAt < scriptEnd);
});

test('no-module-script files: the export appends as a NEW module script at file end', async () => {
  const source = `<script>\n  import P from '#jixoai/press-button';\n</script>\n<P>go</P>`;
  const result = await stampSvelteSource(source, { filename: 'x.svelte', bindings: { P: 'press-button' } });
  assert.notEqual(result, null);
  assert.ok(result!.code.endsWith(`</script>\n`));
  assert.equal(result!.code.includes(`<script module>\nexport const ${USAGE_MAP_EXPORT}`), true);
  // and it compiles
  compile(result!.code, { generate: 'client' });
});

test('HMR stability: an order-preserving edit keeps numbering identical, spans update', async () => {
  const before = await stampSvelteSource(HERO_FIXTURE, { filename: 'hero.svelte', bindings: HERO_BINDINGS });
  const edited = HERO_FIXTURE.replace('variant="fill"', 'variant="tonal"');
  const after = await stampSvelteSource(edited, { filename: 'hero.svelte', bindings: HERO_BINDINGS });
  assert.notEqual(before, null);
  assert.notEqual(after, null);
  for (const key of Object.keys(before!.usageMap)) {
    assert.equal(after!.usageMap[key] !== undefined, true, `usage ${key} must survive`);
    assert.equal(after!.usageMap[key]!.component, before!.usageMap[key]!.component);
    assert.equal(after!.usageMap[key]!.usageIndex, before!.usageMap[key]!.usageIndex);
  }
  // the edited literal's span tracks the new value
  const variant = after!.usageMap['2']!.props['variant']!;
  assert.equal(variant.value, 'tonal');
  assert.equal(edited.slice(variant.start, variant.end), 'tonal');
});

test('{#each} usages: flagged inEachBlock, one shared usageIndex for all iterations', async () => {
  const source = `<script module>import B from '#jixoai/badge';</script>\n{#each items as item}\n  <B variant="outline">{item}</B>\n{/each}`;
  const result = await stampSvelteSource(source, { filename: 'x.svelte', bindings: { B: 'badge' } });
  assert.notEqual(result, null);
  assert.equal(result!.stamped, 1);
  assert.equal(result!.usageMap['1']!.inEachBlock, true);
  // nesting through if/await branches still reaches usages
  const nested = `<script module>import B from '#jixoai/badge';</script>\n{#if ok}{#await p then q}<B/>{/await}{/if}`;
  const nestedResult = await stampSvelteSource(nested, { filename: 'n.svelte', bindings: { B: 'badge' } });
  assert.equal(nestedResult!.stamped, 1);
  assert.equal(nestedResult!.usageMap['1']!.inEachBlock, false);
});

test('degradation matrix: a component without rest spread stays unselectable, not broken', async () => {
  // the STAMP still lands at the usage site — the component definition
  // simply drops it (no {...rest} forwarding). Module-side this is
  // indistinguishable from any other usage; the compiled client code
  // must carry the attributes (what the component does with them is
  // the definition's business — verified visually in the smoke).
  const noSpreadComponent = `<script>\n  let { variant = 'fill', children } = $props();\n</script>\n\n<button class={variant}>{children}</button>`;
  const usage = `<script module>import P from '#jixoai/press-button';</script>\n<P variant="fill">go</P>`;
  const stamped = await stampSvelteSource(usage, { filename: 'u.svelte', bindings: { P: 'press-button' } });
  assert.notEqual(stamped, null);

  const compiledUsage = compile(stamped!.code, { generate: 'client', filename: 'u.svelte' }).js.code;
  assert.equal(compiledUsage.includes('data-jx-component'), true);

  // compile the no-spread DEFINITION and confirm no stamp side effects
  const compiledDefinition = compile(noSpreadComponent, { generate: 'client' }).js.code;
  assert.equal(compiledDefinition.includes('data-jx-component'), false);
});

test('non-consumer modules: untouched (null), zero cost', async () => {
  const plain = `<div>no components here</div>`;
  assert.equal(await stampSvelteSource(plain, { filename: 'p.svelte', bindings: {} }), null);
  const localOnly = `<script>import Local from './local.svelte';</script>\n<Local/>`;
  assert.equal(await stampSvelteSource(localOnly, { filename: 'l.svelte', bindings: {} }), null);
});

test('named-error surface: a mid-edit syntax failure names the file', async () => {
  await assert.rejects(
    stampSvelteSource('<div><P', { filename: 'broken.svelte', bindings: { P: 'press-button' } }),
    (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.ok(error.message.includes('broken.svelte'), error.message);
      assert.ok(error.message.includes('[jixoai-design-stamp]'));
      return true;
    },
  );
});

test('jsStringLiteral: U+2028/U+2029 escape as source sequences, never literals', async () => {
  // built from codepoints — no literal U+2028/U+2029 in THIS file (the law)
  const hostile = `a${String.fromCodePoint(0x2028)}b${String.fromCodePoint(0x2029)}c`;
  const literal = jsStringLiteral(hostile);
  assert.equal(literal.includes('\\u2028'), true);
  assert.equal(literal.includes('\\u2029'), true);
  assert.equal(literal.includes(String.fromCodePoint(0x2028)), false);
  assert.equal(literal.includes(String.fromCodePoint(0x2029)), false);
  // the emitted usage-map source with a hostile prop value compiles (the
  // export is the injection vehicle — a raw codepoint would break it)
  const source = `<script module>import P from '#jixoai/press-button';</script>\n<P label=${JSON.stringify('x' + String.fromCodePoint(0x2028) + 'y')}>go</P>`;
  const result = await stampSvelteSource(source, { filename: 'x.svelte', bindings: { P: 'press-button' } });
  assert.notEqual(result, null);
  compile(result!.code, { generate: 'client' });
});
