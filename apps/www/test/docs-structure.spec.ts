/**
 * docs-route-model lock (test/docs-structure.spec.ts, docs-restructure
 * r1 design). The model is THE single source for the docs tree; these
 * locks keep the r1 rulings true by construction:
 *
 *   - Components nav = registry:ui ONLY (73, one canonical page each)
 *   - non-UI items never appear under Components (install targets, not
 *     doc destinations — the registry overview carries them)
 *   - the reading chain covers every ui item exactly once, prev/next
 *     are the chain neighbors, first.prev/last.next fall back to null
 *   - related is NEAREST FIRST: same group, ordered by chain distance,
 *     earlier side preferred on ties (-1, +1, -2, +2)
 *   - planned pages never enter the production sections (design D4)
 *   - the legacy manifest covers every old /components path and points
 *     into the new tree only
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  docsSections,
  flatComponents,
  componentContext,
  installTargets,
  docsComponentGroups,
} from '../src/lib/docs-route-model';
import { CATALOG } from '../src/lib/catalog';

const repoRoot = resolve(fileURLToPath(import.meta.url), '../../../..');

describe('docs-route-model — the section spine', () => {
  it('exactly three sections: Sections / Components / Registry', () => {
    expect(docsSections.map((s) => s.id)).toEqual(['sections', 'components', 'registry']);
  });

  it('no planned placeholders in production nav (design D4)', () => {
    const hrefs = docsSections.flatMap((s) => s.pages.map((p) => p.href));
    expect(hrefs.filter((h) => h === '#' || h === ''), 'dead hrefs').toEqual([]);
    for (const banned of ['introduction', 'installation', 'usage', 'registry-item'])
      expect(hrefs.some((h) => h.includes(banned)), `${banned} must not ship as a stub`).toBe(false);
  });

  it('Components nav = registry:ui only; non-UI items never listed', () => {
    const navNames = new Set(
      docsComponentGroups.flatMap(({ entries }) => entries.map((e) => e.name)),
    );
    for (const entry of CATALOG) {
      if (entry.type === 'registry:ui') {
        expect(navNames.has(entry.name), `${entry.name} missing from Components nav`).toBe(true);
      } else {
        // href collisions are LAWFUL (a lib's docs page IS its host
        // component's page — toc-engine → toc); the lock is on names
        expect(navNames.has(entry.name), `${entry.name} (${entry.type}) leaked into Components nav`).toBe(false);
      }
    }
    expect(navNames.size, 'one canonical page per ui item').toBe(
      CATALOG.filter((e) => e.type === 'registry:ui').length,
    );
    // and every ui item's canonical href is unique (73 own pages)
    const navHrefs = docsComponentGroups.flatMap(({ entries }) => entries.map((e) => e.href.split('#')[0]));
    expect(new Set(navHrefs).size, 'canonical page per ui item is unique').toBe(navHrefs.length);
  });

  it('layer group sits between navigation and data-entry (design D3)', () => {
    const ids = docsComponentGroups.map(({ group }) => group.id);
    expect(ids.indexOf('layer')).toBe(ids.indexOf('navigation') + 1);
    expect(ids).not.toContain('engines');
  });
});

describe('docs-route-model — the reading chain', () => {
  it('covers every ui item exactly once, neighbors correct', () => {
    expect(flatComponents.length).toBe(CATALOG.filter((e) => e.type === 'registry:ui').length);
    const names = flatComponents.map((f) => f.entry.name);
    expect(new Set(names).size, 'no duplicates in the chain').toBe(names.length);
    for (let i = 0; i < flatComponents.length; i++) {
      const ctx = componentContext(names[i])!;
      expect(ctx.prev?.entry.name ?? null).toBe(i > 0 ? names[i - 1] : null);
      expect(ctx.next?.entry.name ?? null).toBe(i < names.length - 1 ? names[i + 1] : null);
    }
  });

  it('related is nearest-first within the same group (-1, +1, -2, +2)', () => {
    for (let i = 0; i < flatComponents.length; i++) {
      const ctx = componentContext(flatComponents[i].entry.name)!;
      const distances: number[] = [];
      for (const rel of ctx.related) {
        expect(rel.groupId, 'related stays in-group').toBe(flatComponents[i].groupId);
        distances.push(Math.abs(names(flatComponents).indexOf(rel.entry.name) - i));
      }
      expect([...distances].sort((a, b) => a - b), 'sorted by distance').toEqual(distances);
    }
    // the midpoint sanity case: distances alternate outward, earlier side first
    const group = docsComponentGroups.find(({ entries }) => entries.length >= 5)!.entries;
    const midName = group[2].name;
    const ctx = componentContext(midName)!;
    const flatNames = names(flatComponents);
    expect(ctx.related.map((r) => flatNames.indexOf(r.entry.name))).toEqual(
      [flatNames.indexOf(group[1].name), flatNames.indexOf(group[3].name), flatNames.indexOf(group[0].name), flatNames.indexOf(group[4].name)],
    );
  });
});

function names(flat: { entry: { name: string } }[]): string[] {
  return flat.map((f) => f.entry.name);
}

describe('docs-route-model — install targets & the legacy map', () => {
  it('installTargets = every non-UI item, all with a host href', () => {
    expect(installTargets.length).toBe(CATALOG.filter((e) => e.type !== 'registry:ui').length);
    for (const t of installTargets) {
      expect(t.href.startsWith('/'), `${t.name} host href`).toBeTruthy();
    }
  });

  it('the frozen legacy manifest covers old routes → new tree only', () => {
    const manifest = JSON.parse(readFileSync(resolve(repoRoot, 'legacy-doc-routes.json'), 'utf8'));
    const routes: { from: string; to: string }[] = manifest.routes;
    expect(routes.length).toBeGreaterThanOrEqual(64);
    for (const r of routes) {
      expect(r.from.startsWith('/components'), `${r.from} is not a legacy doc route`).toBe(true);
      expect(r.to.startsWith('/docs') || r.to.startsWith('/tokens'), `${r.from} → ${r.to}`).toBe(true);
    }
  });
});
