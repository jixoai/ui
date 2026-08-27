/**
 * The component catalog (apps/www/src/lib/catalog.ts).
 * ONE inventory for the whole site, DERIVED from the registry — the
 * single source of metadata (2026-08-23, user ruling: overview pages
 * and the secondary navigation must be generated from the same
 * metadata). The overview page, the header mega menu and the
 * component tree nav all consume catalogByGroup()/CATALOG below;
 * those are now projections of registry.json itself:
 *
 *   registry.json item fields → catalog entry
 *     name        → name        (install argument / blueprint slug)
 *     type        → type        (eyebrow)
 *     description → summary     (the card's sr-only introduction)
 *     meta.group  → group       (antd taxonomy id)
 *     meta.href   → href        (docs page)
 *
 * Adding a component therefore means adding its registry item WITH a
 * meta block — catalog.spec.ts fails the suite the moment an item
 * lacks meta, so "exists in the registry but missing from overview or
 * navigation" is structurally impossible (no hand-maintained copy to
 * drift, which was the old failure mode).
 *
 * Grouping follows antd's official taxonomy (General / Layout /
 * Navigation / Data Entry / Data Display / Feedback) plus Engines &
 * Theme and Docs Tooling for this repo's own surfaces.
 */

import registryJson from '../../../../registry.json';

export type CatalogGroupId =
  | 'general'
  | 'terminal'
  | 'layout'
  | 'navigation'
  | 'layer'
  | 'data-entry'
  | 'data-display'
  | 'feedback'
  | 'engines'
  | 'docs'
;

export interface CatalogGroup {
  id: CatalogGroupId;
  /** english label (antd taxonomy naming) */
  label: string;
  /** one-line scope */
  description: string;
}

export interface CatalogEntry {
  /** registry item name (the `npx jixoai-ui add` argument) */
  name: string;
  group: CatalogGroupId;
  /** registry type eyebrow */
  type: string;
  summary: string;
  /** docs page (anchor optional) */
  href: string;
}

export const CATALOG_GROUPS: CatalogGroup[] = [
  { id: 'general', label: 'General', description: 'The base atoms every surface rides on' },
  { id: 'terminal', label: 'Terminal', description: "The brand's native surface: live and static terminal faces" },
  { id: 'layout', label: 'Layout', description: 'Page structure, shells, and separators' },
  { id: 'navigation', label: 'Navigation', description: 'Moving through a site or a wizard' },
  { id: 'layer', label: 'Layer', description: 'Floating surfaces: modal, anchored, docked, spotlight' },
  { id: 'data-entry', label: 'Data Entry', description: 'Forms, picks, and the ElementInternals bridge' },
  { id: 'data-display', label: 'Data Display', description: 'Reading data: tables, cards, streams, states' },
  { id: 'feedback', label: 'Feedback', description: 'Inline notices, loading, and operation outcomes' },
  { id: 'engines', label: 'Engines & Theme', description: 'Framework-free libs and the token sheet' },
  { id: 'docs', label: 'Docs Tooling', description: 'The documentation workbench itself' },
];

/** the registry fields the catalog projects (kept minimal + typed) */
interface RegistryItem {
  name: string;
  type: string;
  title?: string;
  description?: string;
  /** site metadata — REQUIRED per item, enforced by catalog.spec.ts */
  meta?: { group: CatalogGroupId; href: string };
}

const registryItems = (registryJson as unknown as { items: RegistryItem[] }).items;

export const CATALOG: CatalogEntry[] = registryItems.map((item) => {
  // fail AT BUILD TIME with instructions — the sync-binding teeth: a
  // registry item without site metadata can never silently miss the
  // overview page or the navigation
  if (!item.meta) {
    throw new Error(
      `registry item "${item.name}" lacks site meta — add {"meta":{"group":"<taxonomy-id>","href":"/docs/components/<page>.html"}} to its registry.json entry`,
    );
  }
  return {
    name: item.name,
    group: item.meta.group,
    type: item.type,
    summary: item.description ?? item.title ?? item.name,
    href: item.meta.href,
  };
});

/** entries grouped in taxonomy order (for menus and index pages) */
export function catalogByGroup(): { group: CatalogGroup; entries: CatalogEntry[] }[] {
  return CATALOG_GROUPS.map((group) => ({
    group,
    entries: CATALOG.filter((entry) => entry.group === group.id),
  }));
}
