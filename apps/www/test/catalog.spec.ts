/**
 * Catalog derivation lock (test/catalog.spec.ts, reworked 2026-08-23).
 *
 * The catalog is now DERIVED from registry.json (catalog.ts imports it
 * directly) — the old bi-directional hand-lock ("nothing hidden,
 * nothing invented") is a tautology by construction. What CAN still go
 * wrong lives in the per-item `meta` block, so this suite locks THAT:
 *
 *   - every registry item carries meta (group + href) — the build-time
 *     throw in catalog.ts gives instructions; this test gives a list
 *   - the group is a known taxonomy id
 *   - the href targets a route that actually exists (dead links fail)
 *   - the description (the card's sr-only summary source) is present
 *
 * Reads registry.json straight from the repo root (fs — vitest's vite
 * server fs.allow does not cover it).
 */
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CATALOG, CATALOG_GROUPS, catalogByGroup, FEATURED_IDS, FEATURED_ITEMS, REGISTRY_TOTAL } from '../src/lib/catalog';
import { docsComponentGroups } from '../src/lib/docs-route-model';

const repoRoot = resolve(fileURLToPath(import.meta.url), '../../../..');
const registry = JSON.parse(
  readFileSync(resolve(repoRoot, 'registry.json'), 'utf8'),
) as { items: { name: string; type: string; description?: string; meta?: { group: string; href: string } }[] };

describe('catalog ↔ registry single-source derivation', () => {
  it('every registry item carries site meta (the sync binding)', () => {
    const missing = registry.items.filter((item) => !item.meta).map((item) => item.name);
    expect(
      missing,
      'registry items without {"meta":{"group","href"}} — add it to the registry.json entry; the overview page and the navigation are generated from it',
    ).toEqual([]);
  });

  it('every meta.group is a known taxonomy id', () => {
    const ids = new Set(CATALOG_GROUPS.map((group) => group.id));
    const unknown = registry.items.filter((item) => item.meta && !ids.has(item.meta.group as never));
    expect(unknown.map((item) => `${item.name}→${item.meta!.group}`), 'unknown taxonomy groups').toEqual([]);
  });

  it('every meta.href targets an EXISTING route (no dead catalog links)', () => {
    const routes = new Set(
      readFileSync(resolve(repoRoot, 'apps/www/svelte.config.js'), 'utf8')
        .match(/'\/[^']+'/g)
        ?.map((match) => match.slice(1, -1)) ?? [],
    );
    for (const item of registry.items) {
      if (!item.meta) continue;
      const [path] = item.meta.href.split('#');
      expect(
        routes.has(path),
        `${item.name} → ${path} (add the page to svelte.config entries or fix meta.href)`,
      ).toBe(true);
    }
  });

  it('every item has a description (the card summary source)', () => {
    const bare = registry.items.filter((item) => !item.description || item.description.length < 8);
    expect(bare.map((item) => item.name), 'items without a meaningful description').toEqual([]);
  });

  it('the derived catalog mirrors the registry one-to-one', () => {
    expect(CATALOG.length).toBe(registry.items.length);
    expect(CATALOG.length).toBeGreaterThanOrEqual(77);
    const names = new Set(CATALOG.map((entry) => entry.name));
    for (const item of registry.items) {
      expect(names.has(item.name), `${item.name} missing from derived CATALOG`).toBe(true);
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

  it('overview renders through the catalog wrapper (the hydration-crash guard)', async () => {
    // walkthrough-6 P1: catalogByGroup() wraps each group as {group,
    // entries}; the page's each-key/section-id must reach THROUGH the
    // wrapper (group.group.id). Duplicate-undefined keys pass SSR but
    // crash every hydration — this source guard pins the fix.
    const page = readFileSync(
      resolve(repoRoot, 'apps/www/src/routes/docs/components.html/+page.svelte'),
      'utf8',
    );
    expect(page).toContain('{#each groups as group (group.group.id)}');
    expect(page).toContain('<section id={group.group.id}');
    // and the BUILT page carries every anchor when dist exists
    const dist = resolve(repoRoot, 'apps/www/dist/docs/components.html');
    if (existsSync(dist)) {
      const html = readFileSync(dist, 'utf8');
      // r2: the index page renders UI modules only (docsComponentGroups
      // — engines has no ui members, guides is a Sections chapter now)
      for (const { group } of docsComponentGroups) {
        expect(html, `dist section #${group.id}`).toContain(`id="${group.id}"`);
      }
      expect(html, 'engines section is gone').not.toContain('id="engines"');
      expect(html, 'guides section is gone').not.toContain('id="guides"');
    }
  });
});

describe('featured projection (2026-08-30-registry-install-integrity task 4.1)', () => {
  // importing catalog.ts above already RAN the projection validation:
  // an unknown or duplicate FEATURED_IDS entry throws at module load, so
  // a green import here IS the build-time teeth. The assertions below
  // pin the projection's contract on top of that.
  it('every featured id resolves exactly once (no ghosts, no duplicates)', () => {
    const names = CATALOG.map((entry) => entry.name);
    for (const id of FEATURED_IDS) {
      expect(names.filter((name) => name === id).length, `featured id "${id}" must resolve exactly once`).toBe(1);
    }
  });

  it('the registry-total and the featured count stay separate numbers', () => {
    expect(REGISTRY_TOTAL).toBe(CATALOG.length);
    expect(FEATURED_ITEMS.length).toBe(FEATURED_IDS.length);
    expect(FEATURED_IDS.length).toBeLessThan(REGISTRY_TOTAL);
  });

  it('the reveal ghost never comes back (the 2026-08-30 purge)', () => {
    expect(FEATURED_IDS as readonly string[]).not.toContain('reveal');
    expect(CATALOG.some((entry) => entry.name === 'reveal')).toBe(false);
  });
});
