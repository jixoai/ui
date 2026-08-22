/**
 * Registry payload drift guard (2026-08-23, Codex r2 finding).
 *
 * public/r/*.json embeds the CONTENT of registry/files/** sources; the
 * root `shadcn build` regenerates them. Editing a source without
 * re-running that build ships a stale, potentially inconsistent payload
 * (r2: file-input.json carried the old WeakMap beside the new iteration
 * effect — runtime-fatal for registry consumers). This test fails the
 * suite the moment a published payload diverges from its source. It
 * skips items whose payload has never been built (fresh clone before
 * the first `npm run build`).
 */

import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const here = resolve(fileURLToPath(import.meta.url), '..');
const repoRoot = resolve(here, '../../..');
const registry = JSON.parse(readFileSync(resolve(repoRoot, 'registry.json'), 'utf8')) as {
  items: { name: string; files: { path: string }[] }[];
};

const published = registry.items.filter((item) =>
  existsSync(resolve(repoRoot, 'public/r', `${item.name}.json`)),
);

describe('registry payload ↔ source parity', () => {
  it('every published public/r payload embeds its current registry/files source', () => {
    expect(published.length, 'no published payloads found — run the root npm run build').toBeGreaterThan(0);
    const drift: string[] = [];
    for (const item of published) {
      const payload = JSON.parse(readFileSync(resolve(repoRoot, 'public/r', `${item.name}.json`), 'utf8')) as {
        files: { path: string; content: string }[];
      };
      for (const file of payload.files) {
        const source = readFileSync(resolve(repoRoot, file.path), 'utf8');
        if (source !== file.content) drift.push(`${item.name}: ${file.path}`);
      }
    }
    expect(drift, `stale payloads — re-run the root npm run build: ${drift.join(', ')}`).toEqual([]);
  });
});
