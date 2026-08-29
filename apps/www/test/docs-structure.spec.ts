/**
 * docs-route-model lock (test/docs-structure.spec.ts, docs-restructure
 * r1 design). The model is THE single source for the docs tree; these
 * locks keep the r1 rulings true by construction:
 *
 *   - Components nav = registry:ui ONLY (74, one canonical page each)
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
import { existsSync, readFileSync, readdirSync } from 'node:fs';
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
    // and every ui item's canonical href is unique (74 own pages)
    const navHrefs = docsComponentGroups.flatMap(({ entries }) => entries.map((e) => e.href.split('#')[0]));
    expect(new Set(navHrefs).size, 'canonical page per ui item is unique').toBe(navHrefs.length);
  });

  it('taxonomy snapshot: group ids + ui member counts are deliberate (r4)', () => {
    // frozen 2026-08-25 after the orphan-group fix (component-canvas
    // → data-display): a single-member column in the mega panel was a
    // visual break — any taxonomy change must update this snapshot.
    // Re-frozen 2026-08-26 (variant-grammar): chip + inline-code join
    // general (6→8, 77 ui items — the running total's source of truth is
    // this snapshot itself).
    // Re-frozen 2026-08-28 (ghostty-term): the terminal group is carved
    // out second — terminal-card/-footer leave layout (10→8),
    // terminal-header leaves data-display (16→15), ghostty-term lands
    // with them (terminal:4, 78 ui items).
    const shape = docsComponentGroups.map(({ group, entries }) => `${group.id}:${entries.length}`);
    expect(shape).toEqual([
      'general:8', 'terminal:4', 'layout:8', 'navigation:10', 'layer:10',
      'data-entry:18', 'data-display:15', 'feedback:5',
    ]);
    expect(shape.every((x) => !x.endsWith(':1')), 'no single-member groups').toBe(true);
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

  it('legacy manifest is the EXACT derived set (closed loop, r2 P1-3)', () => {
    const manifest = JSON.parse(readFileSync(resolve(repoRoot, 'legacy-doc-routes.json'), 'utf8'));
    const routes: { from: string; to: string; preserveHash?: boolean }[] = manifest.routes;
    // the old world is a FROZEN LITERAL (r3 P1): git-time truth, never
    // derived from the live catalog — a future component must never
    // demand a legacy shell, and a deleted manifest entry can never be
    // papered over by catalog changes. Drift on either side fails here.
    const FROZEN_OLD_FROMS = [
      '/components.html',
      '/components/accordion.html',
      '/components/alert-dialog.html',
      '/components/alert.html',
      '/components/anchor.html',
      '/components/avatar.html',
      '/components/badge-indicator.html',
      '/components/badge.html',
      '/components/breadcrumb.html',
      '/components/card-grid.html',
      '/components/carousel.html',
      '/components/cascader.html',
      '/components/code-card.html',
      '/components/command.html',
      '/components/component-canvas.html',
      '/components/descriptions.html',
      '/components/dialog.html',
      '/components/dropdown-menu.html',
      '/components/empty.html',
      '/components/file-input.html',
      '/components/float-button.html',
      '/components/form.html',
      '/components/hero-section.html',
      '/components/hover-card.html',
      '/components/icon-button.html',
      '/components/image.html',
      '/components/input-otp.html',
      '/components/jx-pure.html',
      '/components/kbd.html',
      '/components/language-switcher.html',
      '/components/llms-txt.html',
      '/components/menubar.html',
      '/components/navigation-menu.html',
      '/components/pagination.html',
      '/components/popconfirm.html',
      '/components/popover.html',
      '/components/press-button.html',
      '/components/progress.html',
      '/components/recipes.html',
      '/components/result.html',
      '/components/scaffold-float.html',
      '/components/scroll-area.html',
      '/components/section-card.html',
      '/components/separator.html',
      '/components/sheet.html',
      '/components/skeleton.html',
      '/components/spin.html',
      '/components/statistic.html',
      '/components/steps.html',
      '/components/table.html',
      '/components/tabs.html',
      '/components/terminal-card.html',
      '/components/terminal-footer.html',
      '/components/terminal-header.html',
      '/components/theme-toggle.html',
      '/components/timeline.html',
      '/components/toast.html',
      '/components/toc.html',
      '/components/toggle-group.html',
      '/components/tooltip.html',
      '/components/tour.html',
      '/components/transfer.html',
      '/components/tree-view.html',
      '/components/website-scaffold.html',
    ].sort();
    expect(routes.map((r) => r.from).sort(), 'frozen old-world snapshot').toEqual(FROZEN_OLD_FROMS);
    expect(new Set(routes.map((r) => r.from)).size, 'from unique').toBe(routes.length);
    for (const r of routes) {
      expect(r.to.startsWith('/docs') || r.to.startsWith('/tokens'), `${r.from} → ${r.to}`).toBe(true);
      expect(r.preserveHash, `${r.from} must preserve the fragment`).toBe(true);
      // the target must be REAL (a source route or the tokens page) —
      // a deleted destination can never keep a live shell
      if (r.to.startsWith('/docs')) {
        expect(existsSync(resolve(repoRoot, 'apps/www/src/routes', `.${r.to.replace(/\.html$/, '.html')}`)), `target route for ${r.from} → ${r.to}`).toBe(true);
      }
    }
  });

  it('svelte.config entries are the EXACT derived set (no silent prerender drift)', () => {
    const config = readFileSync(resolve(repoRoot, 'apps/www/svelte.config.js'), 'utf8');
    const entries = new Set([
      '/',
      ...(config.match(/'\/[^']+'/g)?.map((m) => m.slice(1, -1)) ?? []),
    ]);
    const canonical = CATALOG.filter((e) => e.type === 'registry:ui').map((e) => e.href.split('#')[0]);
    const expected = new Set([
      // /probe-folder-css + /parity.html are internal gate surfaces
      // (the css probe + the native-parity fixtures), never catalog pages
      '/', '/probe-folder-css', '/parity.html', '/docs.html', '/docs/components.html',
      '/docs/components/form.html', '/docs/registry.html', '/docs/recipes.html',
      '/docs/jx-pure.html', '/docs/variant-grammar.html', '/docs/llms-txt.html', '/tokens.html', '/blueprints.html',
      ...canonical,
    ]);
    const missing = [...expected].filter((e) => !entries.has(e));
    const extra = [...entries].filter((e) => !expected.has(e));
    expect({ missing, extra }, 'entries exact-set drift').toEqual({ missing: [], extra: [] });
    // every canonical path has a real source route dir
    for (const path of canonical) {
      const dir = resolve(repoRoot, 'apps/www/src/routes', `.${path}`);
      expect(existsSync(dir), `source route for ${path}`).toBe(true);
    }
  });

  it('built dist closes the loop for every canonical page (r2 P1-3)', () => {
    // NOTE: the legacy shells and llms md mirrors are verified by the
    // build-site emitter/generator SELF-CHECKS at generation time — the
    // shared worktree regenerates public/ concurrently and a vitest
    // read can race a half-written artifact (observed live during r2);
    // dist/ is the vite-owned output this suite can trust
    const dist = resolve(repoRoot, 'apps/www/dist');
    if (!existsSync(resolve(dist, 'docs.html'))) return; // pre-build runs skip
    const canonical = CATALOG.filter((e) => e.type === 'registry:ui').map((e) => e.href.split('#')[0]);
    for (const path of canonical) {
      expect(existsSync(resolve(dist, path.slice(1))), `dist page ${path}`).toBe(true);
    }
    // the family hub + the moved sections pages are real routes too
    for (const extra of ['/docs/components/form.html', '/docs/registry.html', '/docs/recipes.html', '/docs/jx-pure.html', '/docs/variant-grammar.html', '/docs/llms-txt.html']) {
      expect(existsSync(resolve(dist, extra.slice(1))), `dist page ${extra}`).toBe(true);
    }
  });

  it('the catalog index page IS the UI inventory (r2 P1-1 source guard)', () => {
    const page = readFileSync(
      resolve(repoRoot, 'apps/www/src/routes/docs/components.html/+page.svelte'),
      'utf8',
    );
    expect(page).toContain('docsComponentGroups');
    expect(page).not.toContain('catalogByGroup');
    expect(page).not.toContain("from '$lib/catalog'");
    expect(page).not.toContain('id="guides"');
    const dist = resolve(repoRoot, 'apps/www/dist/docs/components.html');
    if (existsSync(dist)) {
      const html = readFileSync(dist, 'utf8');
      expect(html).toContain('npx jixoai-ui add press-button');
      expect(html).not.toContain('npx jixoai-ui add utils');
      expect(html).not.toContain('npx jixoai-ui add toc-engine');
    }
  });
});
