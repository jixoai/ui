/**
 * knowledge.test.ts — snapshot↔registry consistency (T6): every guide
 * item name appears in registry.json, counts match, and the four
 * prompt layers are present with the selection layer sharing the index
 * (one source, prompt and guide).
 *
 * Original need: design-studio T6 (2026-09-11).
 */

import { strict as assert } from 'node:assert';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import { loadKnowledgePack } from './knowledge.ts';

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
