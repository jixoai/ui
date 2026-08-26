/*
 * docs-route-model (openspec/changes/docs-restructure, r1 design):
 * THE single source for the docs tree's navigation shape. Everything —
 * the header pills (Docs panel + Components panel), the sections rail,
 * the catalog index, the per-page prev/next pager and the related
 * links — derives from here, on top of the ONE catalog. Locked by
 * test/docs-structure.spec.ts:
 *   - Components = registry:ui ONLY (one canonical page each; the count derives from CATALOG — see docs-structure's frozen snapshot)
 *   - non-UI items never appear in the Components nav (install targets,
 *     documented on host pages; the registry overview carries them)
 *   - the reading chain covers every ui item; related is nearest-first
 */
import { CATALOG, CATALOG_GROUPS, catalogByGroup, type CatalogEntry } from './catalog';

/* ── sections (the three-section spine; planned pages stay OUT until
      real content exists — design D4) ─────────────────────────────── */

export interface DocsPage {
  /** the nav line 1 — short title (Owner ruling 2026-08-25: the rail is
   *  too narrow for long single lines; qualifiers move to a subtitle) */
  title: string;
  /** the nav line 2 — muted qualifier (e.g. 'where wrapping stops') */
  subtitle?: string;
  /** inventory metadata: a trailing count on the title line */
  count?: number;
  href: string;
}
export interface DocsSection {
  id: string;
  label: string;
  pages: DocsPage[];
}

/** the Components listing: UI modules only, antd taxonomy order */
export const docsComponentGroups = catalogByGroup()
  .map(({ group, entries }) => ({
    group,
    entries: entries.filter((e) => e.type === 'registry:ui'),
  }))
  .filter(({ entries }) => entries.length > 0);

const uiCount = docsComponentGroups.reduce((n, g) => n + g.entries.length, 0);

export const docsSections: DocsSection[] = [
  {
    // the curriculum: theming, the boundary rulings, the componentless
    // face — design D2/D5 (Owner directions 2026-08-25)
    id: 'sections',
    label: 'Sections',
    pages: [
      { title: 'theming & tokens', href: '/tokens.html' },
      { title: 'recipes', subtitle: 'where wrapping stops', href: '/docs/recipes.html' },
      { title: 'jx-pure', subtitle: 'the componentless face', href: '/docs/jx-pure.html' },
    ],
  },
  {
    id: 'components',
    label: 'Components',
    pages: [
      { title: 'all components', count: uiCount, href: '/docs/components.html' },
      ...docsComponentGroups.map(({ group, entries }) => ({
        title: group.label,
        count: entries.length,
        href: `/docs/components.html#${group.id}`,
      })),
    ],
  },
  {
    // protocol info; the installable inventory (incl. non-UI targets)
    // lives on the overview page
    id: 'registry',
    label: 'Registry',
    pages: [
      { title: 'registry overview', href: '/docs/registry.html' },
      { title: 'registry.json', href: '/r/registry.json' },
      { title: 'llms-txt', href: '/docs/llms-txt.html' },
    ],
  },
];

/* ── the reading chain (design D7: group order × registry order) ──── */

export interface FlatComponent {
  entry: CatalogEntry;
  groupId: string;
  groupLabel: string;
}

export const flatComponents: FlatComponent[] = docsComponentGroups.flatMap(
  ({ group, entries }) =>
    entries.map((entry) => ({ entry, groupId: group.id, groupLabel: group.label })),
);

export interface ComponentContext {
  entry: CatalogEntry;
  groupLabel: string;
  prev: FlatComponent | null;
  next: FlatComponent | null;
  /** same-group neighbors, NEAREST FIRST: -1, +1, -2, +2 (design D7) */
  related: FlatComponent[];
}

export function componentContext(name: string): ComponentContext | null {
  const idx = flatComponents.findIndex((f) => f.entry.name === name);
  if (idx < 0) return null;
  const flat = flatComponents[idx];
  // NEAREST FIRST (design D7): same-group peers by chain distance, ties
  // preferring the earlier side → -1, +1, -2, +2
  const related = flatComponents
    .map((f, i) => ({ f, i }))
    .filter(({ f, i }) => i !== idx && f.groupId === flat.groupId)
    .sort((a, b) => Math.abs(a.i - idx) - Math.abs(b.i - idx) || a.i - b.i)
    .slice(0, 4)
    .map(({ f }) => f);
  return {
    entry: flat.entry,
    groupLabel: flat.groupLabel,
    prev: idx > 0 ? flatComponents[idx - 1] : null,
    next: idx < flatComponents.length - 1 ? flatComponents[idx + 1] : null,
    related,
  };
}

/* ── misc surfaces the model owns ─────────────────────────────────── */

/** the registry overview's installable inventory: every non-UI item */
export const installTargets = CATALOG.filter((e) => e.type !== 'registry:ui');

/** antd taxonomy group ids in order (for section anchors + locks) */
export const groupIds = CATALOG_GROUPS.map((g) => g.id);
