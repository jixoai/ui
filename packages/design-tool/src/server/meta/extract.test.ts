/**
 * extract.test.ts — the on-demand extraction kernel + endpoint
 * resolver tests (design-studio-r2 T7).
 *
 * Fixture law: tmp trees for the sibling-meta/unknown-key/503 paths;
 * the REAL worktree's press-button for the vehicle shape assertions
 * (enum variants, defaults, vehicle annotation lane). typescript is
 * probed with a dynamic import — when the devDependency is not
 * installed the extraction tests SKIP with a note (the declared
 * posture: install to enable).
 *
 * Original need: Owner 2026-09-11 (design-studio-r2 T7; VD2/VD2h +
 * unknown-key 400 + the typescript-absent 503).
 */

import { strict as assert } from 'node:assert';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { AnnotationValidationError, extractItemSchema } from './extract.ts';
import { resolveMetaResponse } from './endpoint.ts';
import { probeDesignHost } from '../probe.ts';

const PACKAGE_ROOT = join(dirname(fileURLToPath(import.meta.url)), '../../..');
const REPO_ROOT = join(PACKAGE_ROOT, '../..');

/** probe the declared devDependency — skip the kernel tests when absent */
async function loadTypescriptOrFail(): Promise<typeof import('typescript')> {
  try {
    const mod = await import('typescript');
    return ((mod as { default?: typeof import('typescript') }).default ?? (mod as unknown as typeof import('typescript')));
  } catch {
    return Promise.reject(new Error('skip'));
  }
}

let typescriptPresent: boolean | null = null;
async function haveTypescript(): Promise<boolean> {
  typescriptPresent ??= await loadTypescriptOrFail().then(
    () => true,
    () => false,
  );
  return typescriptPresent;
}

function tmpHost(): string {
  return mkdtempSync(join(tmpdir(), 'design-meta-'));
}

function write(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content);
}

/* ── kernel: fixture shapes (the gen --self-test vocabulary) ───────────── */

test('kernel: enum + default + snippet + spread passthrough (fixture)', async (t) => {
  if (!(await haveTypescript())) {
    t.skip('typescript not installed — extraction disabled by design (npm install in @jixoai/ui-design to enable)');
    return;
  }
  const host = tmpHost();
  try {
    const source = join(host, 'fixture-enum.svelte');
    write(source, `<script module lang="ts">
  export type Shape = 'sharp' | 'bevel' | 'round';
</script>

<script lang="ts">
  interface Props {
    shape?: Shape;
    label?: string;
    disabled?: boolean;
    children: Snippet;
  }
  let { shape = 'bevel', label, disabled = false, children, ...restProps }: Props = $props();
</script>

<button data-jx-fixture={shape}>{label}</button>
`);
    const { schema } = await extractItemSchema(source);
    const props = schema.properties;
    // type alias in the MODULE script resolves through the locals map
    assert.deepEqual(props.shape!.enum, ['sharp', 'bevel', 'round']);
    assert.equal(props.shape!.default, 'bevel');
    assert.equal(props.label!.type, 'string');
    assert.equal(props.disabled!.type, 'boolean');
    assert.equal(props.disabled!.default, false);
    // snippet + spread lower to control:none + sourceType, panel-excluded
    assert.equal(props.children!['x-ui']?.control, 'none');
    assert.equal(props.children!['x-ui']?.sourceType, 'Snippet');
    assert.equal(props.restProps!['x-ui']?.control, 'none');
    assert.deepEqual(schema.required, ['label', 'children', 'restProps']);
  } finally {
    rmSync(host, { recursive: true, force: true });
  }
});

test('kernel: numeric literal union lowers to min/max', async (t) => {
  if (!(await haveTypescript())) {
    t.skip('typescript not installed — extraction disabled by design');
    return;
  }
  const host = tmpHost();
  try {
    const source = join(host, 'fixture-number.svelte');
    write(source, `<script lang="ts">
  interface Props { level?: 0 | 1 | 2 | 3; count?: number; }
  let { level, count = 1 }: Props = $props();
</script>
<span></span>
`);
    const { schema } = await extractItemSchema(source);
    assert.equal(schema.properties.level!.type, 'number');
    assert.equal(schema.properties.level!.minimum, 0);
    assert.equal(schema.properties.level!.maximum, 3);
    assert.equal(schema.properties.count!.default, 1);
  } finally {
    rmSync(host, { recursive: true, force: true });
  }
});

/* ── annotation merge ─────────────────────────────────────────────────── */

test('annotations: sibling meta.ts merges (icon/i18n r2 keys + control)', async (t) => {
  if (!(await haveTypescript())) {
    t.skip('typescript not installed — extraction disabled by design');
    return;
  }
  const host = tmpHost();
  try {
    const source = join(host, 'demo.svelte');
    write(source, `<script lang="ts">
  interface Props { variant?: 'fill' | 'tonal' | 'outline'; note?: string; }
  let { variant = 'outline', note }: Props = $props();
</script>
<div>{variant}</div>
`);
    // sibling meta.ts — the hand zone with the r2 vocabulary extension
    write(join(host, 'demo.meta.ts'), `import { defineAnnotations } from '$lib/schema/ir';
// ===== end GENERATED — annotations below survive regeneration =====
export const annotations = defineAnnotations({
  variant: { 'x-ui': { control: 'segmented', label: 'rung', icon: 'layers', i18n: 'press.variant' } },
  note: { 'x-ui': { label: 'note' } },
});
`);
    const { schema, warnings } = await extractItemSchema(source);
    const xui = schema.properties.variant!['x-ui']!;
    assert.equal(xui.control, 'segmented');
    assert.equal(xui.label, 'rung');
    assert.equal(xui.icon, 'layers');
    assert.equal(xui.i18n, 'press.variant');
    assert.equal(schema.properties.note!['x-ui']?.label, 'note');
    assert.equal(schema.properties.variant!.default, 'outline');
    // a meta.ts WAS found → no "purely generated" warning
    assert.ok(!warnings.some((w) => w.includes('purely generated')));
  } finally {
    rmSync(host, { recursive: true, force: true });
  }
});

test('annotations: annotationRoots lane merges and unknown prop keys warn (not fail)', async (t) => {
  if (!(await haveTypescript())) {
    t.skip('typescript not installed — extraction disabled by design');
    return;
  }
  const host = tmpHost();
  try {
    const source = join(host, 'item-dir/solo.svelte');
    write(source, `<script lang="ts">
  interface Props { tone?: 'a' | 'b'; }
  let { tone = 'a' }: Props = $props();
</script>
<div></div>
`);
    // a SEPARATE annotations lane (the vehicle posture: meta lives elsewhere)
    const lane = join(host, 'meta-lane');
    write(join(lane, 'solo.meta.ts'), `import { defineAnnotations } from '$lib/schema/ir';
export const annotations = defineAnnotations({
  tone: { 'x-ui': { label: 'tonE' } },
  ghostProp: { 'x-ui': { label: 'no such prop' } },
});
`);
    const { schema, warnings } = await extractItemSchema(source, { annotationRoots: [lane] });
    assert.equal(schema.properties.tone!['x-ui']?.label, 'tonE');
    assert.ok(warnings.some((w) => w.includes('ghostProp')), `expected the ghost-prop warning, got: ${warnings.join(' | ')}`);
  } finally {
    rmSync(host, { recursive: true, force: true });
  }
});

test('annotations: unknown x-ui key raises AnnotationValidationError naming file/key/vocabulary', async (t) => {
  if (!(await haveTypescript())) {
    t.skip('typescript not installed — extraction disabled by design');
    return;
  }
  const host = tmpHost();
  try {
    const source = join(host, 'bad.svelte');
    write(source, `<script lang="ts">
  interface Props { variant?: 'x' | 'y'; }
  let { variant = 'x' }: Props = $props();
</script>
<div></div>
`);
    const metaPath = join(host, 'bad.meta.ts');
    write(metaPath, `import { defineAnnotations } from '$lib/schema/ir';
export const annotations = defineAnnotations({
  variant: { 'x-ui': { nonsense: true } },
});
`);
    await assert.rejects(
      () => extractItemSchema(source),
      (cause: unknown) => {
        assert.ok(cause instanceof AnnotationValidationError);
        assert.ok(cause.file.includes('bad.meta.ts'));
        assert.equal(cause.key, 'nonsense');
        assert.ok(cause.message.includes('control'));
        return true;
      },
    );
  } finally {
    rmSync(host, { recursive: true, force: true });
  }
});

/* ── endpoint resolver ────────────────────────────────────────────────── */

test('endpoint: real worktree press-button — vehicle shape + vehicle annotation lane', async (t) => {
  if (!(await haveTypescript())) {
    t.skip('typescript not installed — extraction disabled by design');
    return;
  }
  const host = probeDesignHost(REPO_ROOT);
  const response = await resolveMetaResponse(host, 'press-button');
  assert.equal(response.status, 200, JSON.stringify(response.body));
  const body = response.body as {
    item: string;
    source: string;
    schema: { properties: Record<string, { enum?: string[]; type?: string; default?: string | boolean; 'x-ui'?: { control?: string; label?: string; sourceType?: string } }> };
    warnings: string[];
  };
  assert.equal(body.item, 'press-button');
  assert.ok(body.source.startsWith('registry/files/ui/press-button/'));
  const props = body.schema.properties;
  // PressButtonVariant is ReturnType<typeof slot> in the MODULE script —
  // beyond the same-file literal-union ceiling, honestly opaque (the
  // committed .meta.ts carries the identical opaque node)
  assert.equal(props.variant!['x-ui']?.control, 'none');
  assert.equal(props.variant!['x-ui']?.sourceType, 'PressButtonVariant');
  // the vehicle annotation lane still decorates the opaque row
  assert.equal(props.variant!['x-ui']?.label, 'variant');
  // same-file literal unions lower fully
  assert.deepEqual(props.type!.enum, ['button', 'submit']);
  assert.equal(props.type!.default, 'button');
  assert.equal(props.type!['x-ui']?.control, 'none'); // annotation opts the row out
  assert.equal(props.loading!.type, 'boolean');
  assert.equal(props.loading!.default, false);
  assert.equal(props.loading!['x-ui']?.control, 'toggle'); // annotation picks the control
  // snippet children lower excluded-but-documented
  assert.equal(props.children!['x-ui']?.control, 'none');
  assert.equal(props.children!['x-ui']?.sourceType, 'Snippet');
  // the annotation zone's `attach` key matches no prop (source evolved) — a warning, not an error
  assert.ok(body.warnings.some((w) => w.includes('attach')), `expected the attach warning, got: ${body.warnings.join(' | ')}`);
});

test('endpoint: unknown item 404 names the alias base', async () => {
  const host = probeDesignHost(REPO_ROOT);
  const response = await resolveMetaResponse(host, 'no-such-item');
  assert.equal(response.status, 404);
  const body = response.body as { error: string; itemAliasBase: string };
  assert.ok(body.error.includes('no-such-item'));
  assert.ok(body.itemAliasBase.includes('registry/files/ui'));
});

test('endpoint: typescript unavailable → 503 with install hint', async () => {
  const host = probeDesignHost(REPO_ROOT);
  const response = await resolveMetaResponse(host, 'press-button', {
    loadTypescript: () => Promise.reject(new Error('ERR_MODULE_NOT_FOUND')),
  });
  assert.equal(response.status, 503);
  const body = response.body as { error: string; hint: string };
  assert.ok(body.error.includes('typescript'));
  assert.ok(body.hint.includes('npm install'));
});

test('endpoint: malformed item name → 400', async () => {
  const host = probeDesignHost(REPO_ROOT);
  const response = await resolveMetaResponse(host, '..%2fescape');
  assert.equal(response.status, 400);
});
