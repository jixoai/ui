/**
 * chrome-items.test.ts — the dogfooding manifest's lockstep assertion
 * (r3 acceptance gate 3: "STUDIO_CHROME_ITEMS exists and matches the
 * actual import set").
 *
 * Scans the studio .svelte sources for `#jixoai/<item>` import
 * specifiers and asserts the manifest lists exactly that set — a new
 * import without a manifest line (or a stale line after a removal)
 * fails here, keeping the dogfooding coverage list an auditable
 * footprint rather than an aspiration.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { STUDIO_CHROME_ITEMS } from './chrome-items.ts';

const here = dirname(fileURLToPath(import.meta.url));

/** every #jixoai/<item> specifier imported by the studio sources */
function importedItems(): Set<string> {
  const items = new Set<string>();
  const specifiers = /from\s+'#jixoai\/([a-z0-9-]+)'/g;
  for (const entry of readdirSync(here, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith('.svelte')) continue;
    const source = readFileSync(join(here, entry.name), 'utf8');
    for (const match of source.matchAll(specifiers)) {
      items.add(match[1] ?? '');
    }
  }
  return items;
}

test('STUDIO_CHROME_ITEMS matches the studio sources’ actual #jixoai imports', () => {
  const imported = importedItems();
  const listed = new Set(STUDIO_CHROME_ITEMS);
  if (imported.size === 0) {
    assert.fail('no #jixoai imports found in the studio sources — the scan or the rebuild regressed');
  }
  assert.deepEqual(
    [...listed].filter((item) => !imported.has(item)),
    [],
    'manifest lists items nothing imports anymore (stale dogfooding lines)',
  );
  assert.deepEqual(
    [...imported].filter((item) => !listed.has(item)),
    [],
    'studio imports #jixoai items missing from STUDIO_CHROME_ITEMS — append them (rebuild-plan §2.3)',
  );
});
