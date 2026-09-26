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

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, resolve } from 'node:path';
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

  it('the delivery set is CLOSED over the registry (nothing missing, nothing extra, exactly one owner carrier per item)', () => {
    // the Codex r1 finding: iterating only EXISTING payloads cannot
    // catch a payload that was never built, an orphan, or a misplaced
    // css carrier. This test closes the set in BOTH directions.
    const stylexItems = registry.items.filter((item) =>
      (item.files ?? []).some((f) => f.path.endsWith('.stylex.ts')),
    );
    expect(stylexItems.length, 'the registry carries stylex sources').toBeGreaterThan(0);
    for (const item of stylexItems) {
      const payloadPath = resolve(repoRoot, 'public/r', `${item.name}.json`);
      expect(existsSync(payloadPath), `${item.name}: no published payload — run shadcn build + the swap`).toBe(true);
      const payload = JSON.parse(readFileSync(payloadPath, 'utf8')) as {
        files: { path: string; content: string }[];
      };
      expect(
        payload.files.some((f) => f.path.endsWith('.stylex.ts')),
        `${item.name}: a raw .stylex.ts survived the swap`,
      ).toBe(false);
      const js = payload.files.filter((f) => f.path.endsWith('.stylex.js'));
      const css = payload.files.filter((f) => f.path.endsWith('.stylex.css'));
      expect(js.length, `${item.name}: expected the swapped module set`).toBeGreaterThan(0);
      expect(css.length, `${item.name}: exactly ONE css carrier (the item's own module)`).toBe(1);
      // the carrier resolves through the swap's ladder: stem-named,
      // own-dir (registry/files[/ui]/<name>/), or the single-entry item
      // (tokens → registry/files/lib/tokens.stylex.css) — never a
      // foreign dep's module
      const stem = item.name.split('/').at(-1)!;
      const sources = (item.files ?? []).filter((f) => f.path.endsWith('.stylex.ts'));
      const ladderOk =
        css[0]!.path.endsWith(`/${stem}.stylex.css`) ||
        css[0]!.path.startsWith(`registry/files/ui/${item.name}/`) ||
        css[0]!.path.startsWith(`registry/files/${item.name}/`) ||
        sources.length === 1;
      expect(ladderOk, `${item.name}: the css carrier must resolve through the owner ladder, got ${css[0]!.path}`).toBe(true);
      const carrier = js.find((f) => f.content.startsWith("import './"));
      expect(carrier, `${item.name}: exactly one module wires the css (the leading relative import)`).toBeDefined();
      const cssStem = css[0]!.path.split('/').at(-1)!.replace('.stylex.css', '');
      expect(carrier!.path.endsWith(`/${cssStem}.stylex.js`), `${item.name}: the wiring module is the owner carrier (${cssStem}.stylex.js)`).toBe(true);
      expect(
        js.filter((f) => f.content.startsWith("import './")).length,
        `${item.name}: no second wiring`,
      ).toBe(1);
    }
    // reverse: every published payload with swapped modules maps back
    // to a registry item that still carries the sources
    const names = new Set(registry.items.map((i) => i.name));
    const rDir = resolve(repoRoot, 'public/r');
    for (const name of readdirSync(rDir)) {
      if (!name.endsWith('.json') || name === 'registry.json') continue;
      const payload = JSON.parse(readFileSync(join(rDir, name), 'utf8')) as {
        name?: string;
        files?: { path: string }[];
      };
      const items = payload.files ? [payload] : []; // index handled below
      const candidates = payload.items ?? items;
      for (const entry of candidates) {
        if (!(entry.files ?? []).some((f: { path: string }) => f.path.endsWith('.stylex.js'))) continue;
        expect(names.has(entry.name!), `orphan swapped payload '${entry.name}' (${name}) — no registry item owns it`).toBe(true);
        const owner = registry.items.find((i) => i.name === entry.name!)!;
        expect(
          (owner.files ?? []).some((f) => f.path.endsWith('.stylex.ts')),
          `${entry.name}: swapped delivery without sources in the registry`,
        ).toBe(true);
      }
    }
  });
});
