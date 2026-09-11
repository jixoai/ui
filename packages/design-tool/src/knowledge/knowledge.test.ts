/**
 * knowledge.test.ts — snapshot↔registry consistency (T6): every guide
 * item name appears in registry.json, counts match, and the four
 * prompt layers are present with the selection layer sharing the index
 * (one source, prompt and guide).
 *
 * Original need: design-studio T6 (2026-09-11). r2 T9 addition: the
 * alpha-track passthrough (registry meta.alpha → KnowledgeItem.alpha
 * → the guide badge + the selection layer's [alpha] label) is
 * fixture-tested here — the layout family itself ships from the main
 * branch's own workflow, so this suite carries the mechanism.
 */

import { strict as assert } from 'node:assert';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { loadKnowledgePack } from './knowledge.ts';
import { buildKnowledgePack } from './build.ts';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../../..');

test('snapshot item names are exactly the registry.json item names', () => {
  const registry = JSON.parse(readFileSync(join(repoRoot, 'registry.json'), 'utf8')) as { items: { name: string }[] };
  const registryNames = registry.items.map((item) => item.name).sort();

  const pack = loadKnowledgePack();
  const snapshotNames = pack.componentIndex.groups.flatMap((group) => group.items.map((item) => item.name)).sort();

  assert.equal(snapshotNames.length, registryNames.length);
  assert.deepEqual(snapshotNames, registryNames);
});

test('snapshot sanity: version, groups, full prompt composition', () => {
  const pack = loadKnowledgePack();
  assert.equal(pack.version, 1);
  assert.ok(pack.componentIndex.groups.length >= 8, `expected the registry groups, got ${pack.componentIndex.groups.length}`);

  const ids = pack.systemPrompt.layers.map((layer) => layer.id);
  assert.deepEqual(ids, ['selection', 'variants', 'state-machine', 'prototype-standard']);
  // one source: every indexed item name appears in the selection layer
  const selection = pack.systemPrompt.layers[0]!.body;
  for (const group of pack.componentIndex.groups) {
    for (const item of group.items) {
      assert.ok(selection.includes(`- ${item.name} — `), `${item.name} missing from the selection layer`);
    }
  }
  // full prompt = layer bodies joined
  assert.equal(pack.systemPrompt.full, pack.systemPrompt.layers.map((layer) => layer.body).join('\n\n'));
});

test('prototype-standard layer carries the folder law and stable specifiers', () => {
  const pack = loadKnowledgePack();
  const standard = pack.systemPrompt.layers.find((layer) => layer.id === 'prototype-standard')!.body;
  assert.ok(standard.includes('design/prototypes/<name>'));
  assert.ok(standard.includes('#jixoai/prototype-kit'));
  assert.ok(standard.includes('#jixoai/<item>'));
  assert.ok(standard.includes('canvas.svelte'));
});

test('prototype-standard layer documents the selection context format (r2 T6)', () => {
  const pack = loadKnowledgePack();
  const standard = pack.systemPrompt.layers.find((layer) => layer.id === 'prototype-standard')!.body;
  assert.ok(standard.includes('[selected: <component>#<usageIndex> in <frameId>]'));
  assert.ok(standard.includes('instances share this usage'));
  assert.ok(standard.includes('data-jx-component'));
  // and the snapshot (what consumers read) stays in sync with the builder
  const snapshotStandard = JSON.parse(
    readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'snapshot.json'), 'utf8'),
  ) as typeof pack;
  assert.equal(snapshotStandard.systemPrompt.layers.find((layer) => layer.id === 'prototype-standard')!.body, standard);
});

/* ── the alpha-track passthrough (r2 T9 — fixture-tested, the layout
      family itself lands from the main branch's own workflow) ─────── */

test('registry meta.alpha flows to KnowledgeItem.alpha and the selection layer label (fixture)', () => {
  const host = mkdtempSync(join(tmpdir(), 'design-alpha-'));
  try {
    writeFileSync(join(host, 'registry.json'), JSON.stringify({
      items: [
        { name: 'stable-thing', type: 'registry:ui', title: 'Stable', description: 'a stable item', meta: { group: 'layout' } },
        { name: 'future-flex', type: 'registry:ui', title: 'Flex (alpha)', description: 'an alpha item', meta: { group: 'layout', alpha: true } },
      ],
    }));
    const pack = buildKnowledgePack(host);
    const items = pack.componentIndex.groups.flatMap((group) => group.items);
    assert.equal(items.find((item) => item.name === 'stable-thing')?.alpha, undefined);
    assert.equal(items.find((item) => item.name === 'future-flex')?.alpha, true);
    // the agent's selection layer carries the same flag as a label
    const selection = pack.systemPrompt.layers[0]!.body;
    assert.ok(selection.includes('- future-flex — Flex (alpha): an alpha item [alpha]'));
    assert.ok(!selection.includes('stable-thing — Stable: a stable item [alpha]'));
  } finally {
    rmSync(host, { recursive: true, force: true });
  }
});
