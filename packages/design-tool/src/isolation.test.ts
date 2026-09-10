/**
 * V7 isolation gate (packages/design-tool/src/isolation.test.ts).
 *
 * Orthogonal intent (1): assert the isolation law of the prototype
 * standard — production module graphs never import from design/, and
 * the design tool's own sources never import production lanes. This
 * is the persistent gate the design.md V-series promised (the r2
 * review caught it as an ad-hoc grep written up as a script).
 *
 * Original need: Owner 2026-09-11 (design-studio V7). Node test
 * runner, no server, no writes.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve as pathResolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { test } from 'node:test';

const ROOT = pathResolve(dirname(fileURLToPath(import.meta.url)), '../../..');

/** production lanes that must stay free of design/ import edges — the
 * design-tool package itself is the workspace OWNER and is excluded */
const PRODUCTION_LANES = ['apps/www/src', 'registry/files', 'packages/vite-plugin', 'packages/css-laws'];

/** import forms that would couple a lane to the design workspace */
const DESIGN_IMPORT_RE = /(?:from\s+|import\s*\(\s*|import\s+)['"][^'"]*\/design\/|['"]#design\//;

function collectSvelteAndTs(dir: string, out: string[] = []): string[] {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return out; // lane absent in this checkout shape
  }
  for (const entry of entries) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.svelte-kit') continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) collectSvelteAndTs(full, out);
    else if (/\.(svelte|ts|js|mjs)$/.test(entry.name)) out.push(full);
  }
  return out;
}

test('production lanes contain no design/ import edges', () => {
  const offenders: string[] = [];
  for (const lane of PRODUCTION_LANES) {
    for (const file of collectSvelteAndTs(join(ROOT, lane))) {
      const source = readFileSync(file, 'utf8');
      if (DESIGN_IMPORT_RE.test(source)) offenders.push(file);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    `isolation law violated — production files importing from design/: ${offenders.join(', ')}`,
  );
});
