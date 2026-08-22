/**
 * Catalog coverage lock (test/catalog.spec.ts, 2026-08-22).
 *
 * The catalog is the site's ONE inventory (overview + header menu derive
 * from it). This suite locks it against registry.json BI-DIRECTIONALLY
 * and verifies every docs href targets a route that actually exists —
 * "many components, none shown" (the user's report) can never recur
 * silently.
 *
 * Reads registry.json straight from the repo root (fs — vitest's vite
 * server fs.allow does not cover it).
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CATALOG, CATALOG_GROUPS, catalogByGroup } from '../src/lib/catalog';

const repoRoot = resolve(fileURLToPath(import.meta.url), '../../../..');
const registry = JSON.parse(
  readFileSync(resolve(repoRoot, 'registry.json'), 'utf8'),
) as { items: { name: string; type: string }[] };

describe('catalog ↔ registry coverage', () => {
  it('every registry item has a catalog entry (nothing hidden)', () => {
    const catalogNames = new Set(CATALOG.map((entry) => entry.name));
    const missing = registry.items
      .map((item) => item.name)
      .filter((name) => !catalogNames.has(name));
    expect(missing, 'registry items missing from the catalog').toEqual([]);
  });

  it('every catalog entry matches a real registry item (nothing invented)', () => {
    const registryNames = new Set(registry.items.map((item) => item.name));
    const ghosts = CATALOG.map((entry) => entry.name).filter(
      (name) => !registryNames.has(name),
    );
    expect(ghosts, 'catalog entries without a registry item').toEqual([]);
  });

  it('registry types match the catalog eyebrow', () => {
    const byName = new Map(registry.items.map((item) => [item.name, item.type]));
    for (const entry of CATALOG) {
      expect(entry.type, `${entry.name} type`).toBe(byName.get(entry.name));
    }
  });

  it('every entry sits in a known group; groups are non-empty', () => {
    const ids = new Set(CATALOG_GROUPS.map((group) => group.id));
    for (const entry of CATALOG) {
      expect(ids.has(entry.group), `${entry.name} group`).toBe(true);
    }
    for (const { group, entries } of catalogByGroup()) {
      expect(entries.length, `${group.id} empty`).toBeGreaterThan(0);
    }
  });

  it('every docs href targets an EXISTING route (no dead catalog links)', () => {
    const routes = new Set(
      readFileSync(resolve(repoRoot, 'apps/www/svelte.config.js'), 'utf8')
        .match(/'\/[^']+'/g)
        ?.map((match) => match.slice(1, -1)) ?? [],
    );
    for (const entry of CATALOG) {
      const [path] = entry.href.split('#');
      if (path === '/components/overview.html' || path === '/tokens.html') {
        expect(routes.has(path), `${entry.name} → ${path}`).toBe(true);
        continue;
      }
      expect(
        routes.has(path),
        `${entry.name} → ${path} (add the page to svelte.config entries)`,
      ).toBe(true);
    }
  });

  it('the full inventory is sized for the milestone claims', () => {
    // 77 registry items at the antd-phase close; a drop here means the
    // catalog was regenerated against a stale registry
    expect(CATALOG.length).toBe(registry.items.length);
    expect(CATALOG.length).toBeGreaterThanOrEqual(77);
  });
});
