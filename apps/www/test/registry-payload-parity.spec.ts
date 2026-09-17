/**
 * Registry payload drift guard (2026-08-23, Codex r2 finding;
 * phase-1 flip 2026-09-19).
 *
 * public/r/*.json embeds the CONTENT of registry/files/** sources; the
 * root `shadcn build` regenerates them, then registry-stylex-swap
 * rewrites each item's .stylex.ts entries to their COMPILED form
 * (.stylex.js classModule + .stylex.css carrier — bytes from
 * registry/payload/stylex/, the F11 zero-engine consumer contract).
 * Editing a source without re-running that build+swap ships a stale,
 * potentially inconsistent payload. This test fails the suite the
 * moment a published payload diverges: unswapped entries must match
 * their registry/files source byte-for-byte; swapped entries must
 * match the compiled payload derivation (the item's OWN module — the
 * css carrier — carries the classModule behind a leading css import).
 * It skips items whose payload has never been built (fresh clone
 * before the first `npm run build`).
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

/** the compiled-payload artifacts for an item key (registry/payload/stylex/<key>/) */
const compiledArtifacts = (key: string): { classModule: string; css: string } | null => {
  const dir = resolve(repoRoot, 'registry/payload/stylex', key);
  const stem = key.split('/').at(-1)!;
  const classModule = resolve(dir, `${stem}.styles.js`);
  const css = resolve(dir, `${stem}.css`);
  if (!existsSync(classModule) || !existsSync(css)) return null;
  return { classModule: readFileSync(classModule, 'utf8'), css: readFileSync(css, 'utf8') };
};

describe('registry payload ↔ source parity', () => {
  it('every published public/r payload embeds its current registry/files source', () => {
    expect(published.length, 'no published payloads found — run the root npm run build').toBeGreaterThan(0);
    const drift: string[] = [];
    for (const item of published) {
      const payload = JSON.parse(readFileSync(resolve(repoRoot, 'public/r', `${item.name}.json`), 'utf8')) as {
        files: { path: string; content: string }[];
      };
      const compiled = compiledArtifacts(item.name);
      for (const file of payload.files) {
        if (file.path.endsWith('.stylex.js')) {
          if (!compiled) {
            drift.push(`${item.name}: ${file.path} (no compiled payload for item — re-run the swap)`);
            continue;
          }
          if (file.content.startsWith("import './")) {
            // the carrier module = the css import line + the classModule
            const importLine = file.content.slice(0, file.content.indexOf('\n'));
            const want = file.content.slice(file.content.indexOf('\n') + 1);
            if (!/^import '\.\/[a-z0-9-]+\.stylex\.css';$/.test(importLine)) {
              drift.push(`${item.name}: ${file.path} (carrier css import malformed)`);
            }
            if (want !== compiled.classModule) drift.push(`${item.name}: ${file.path} (compiled classModule drift)`);
          } else if (file.content !== compiled.classModule) {
            // a non-carrier entry (e.g. the shared tokens dep) carries
            // the classModule verbatim
            drift.push(`${item.name}: ${file.path} (compiled classModule drift)`);
          }
          continue;
        }
        if (file.path.endsWith('.stylex.css')) {
          if (!compiled || file.content !== compiled.css) drift.push(`${item.name}: ${file.path} (compiled item css drift)`);
          continue;
        }
        const source = readFileSync(resolve(repoRoot, file.path), 'utf8');
        if (source !== file.content) drift.push(`${item.name}: ${file.path}`);
      }
    }
    expect(drift, `stale payloads — re-run the root npm run build (shadcn build + registry-stylex-swap): ${drift.join(', ')}`).toEqual([]);
  });
});
