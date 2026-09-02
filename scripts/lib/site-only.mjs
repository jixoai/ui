#!/usr/bin/env node
/**
 * The curated www-side classifications (scripts/lib/site-only.mjs).
 *
 * Single source of truth shared by the mirror-manifest generator
 * (verify:mirror) and the dev-time mirror sync: which www files are
 * SITE-ONLY (never a registry item, never synced into registry/) and
 * which whole directory prefixes are. Hand-maintained here — the same
 * lists that used to live inline in gen-mirror-manifest.mjs.
 */
export const SITE_ONLY = [
  // the context-kernel wiring of the highlight family (r9): the
  // registry item ships the zero-dep HIGHLIGHT_KEY seam only —
  // createHighlightContext statically imports the kernel and stays
  // app-side (the install-completeness law)
  { path: 'apps/www/src/lib/highlight/context.svelte.ts', note: 'highlight context-kernel wiring — app-side by the density-seam precedent (r9)' },
  // mirror files that are docs-site chrome, never registry items
  { path: 'apps/www/src/lib/ui/docs-sections-nav.svelte', note: 'site docs sections rail (docs-restructure D2)' },
  { path: 'apps/www/src/lib/catalog.ts', note: 'site catalog index' },
  { path: 'apps/www/src/lib/site.ts', note: 'site helpers' },
  { path: 'apps/www/src/lib/hue-runtime.ts', note: 'tokens-page hue lab runtime' },
  { path: 'apps/www/src/lib/code-block.svelte', note: 'site docs code surface' },
  { path: 'apps/www/src/lib/copy-command.svelte', note: 'site docs copy affordance' },
  { path: 'apps/www/src/lib/copy-icon-button.svelte', note: 'site docs copy affordance' },
  { path: 'apps/www/src/lib/overview-card.svelte', note: 'site docs overview card' },
  { path: 'apps/www/src/lib/docs-route-model.ts', note: 'docs-restructure: the docs tree nav model (site-only)' },
  { path: 'apps/www/src/lib/ui/docs-pager.svelte', note: 'docs-restructure: per-page prev/next pager (site-only, rendered by layout)' },
  { path: 'apps/www/src/lib/ui/docs-pager.css', note: 'docs-restructure: pager styles (site-only)' },
  { path: 'apps/www/src/lib/ui/docs-sections-nav.svelte', note: 'docs-restructure: sections rail (site-only)' },
  { path: 'apps/www/src/lib/ui/docs-sections-nav.css', note: 'sections rail companion sheet — the VT presence law (site-only)' },
  { path: 'apps/www/src/lib/ui/a11y-table/a11y-table.svelte', note: 'docs-upgrade: Material3-style a11y reference table (site-only docs infra)' },
  { path: 'apps/www/src/lib/ui/a11y-table/index.ts', note: 'docs-upgrade: a11y-table barrel (site-only)' },
  { path: 'apps/www/src/lib/ui/density-demo/density-demo.svelte', note: 'docs-upgrade: all-scopes density wrapper (site-only docs infra)' },
  { path: 'apps/www/src/lib/ui/density-demo/index.ts', note: 'docs-upgrade: density-demo barrel (site-only)' },
  { path: 'apps/www/src/lib/ui/props-table/props-table.svelte', note: 'docs-upgrade: API reference table (site-only docs infra)' },
  { path: 'apps/www/src/lib/ui/props-table/index.ts', note: 'docs-upgrade: props-table barrel (site-only)' },
  { path: 'apps/www/src/lib/ui/token-table/token-table.svelte', note: 'docs-upgrade: token reference table (site-only docs infra)' },
  { path: 'apps/www/src/lib/ui/token-table/index.ts', note: 'docs-upgrade: token-table barrel (site-only)' },
];

/** site-only DIRECTORY prefixes under apps/www/src/lib (whole trees) */
export const SITE_ONLY_PREFIXES = [
  'apps/www/src/lib/blueprints/', // blueprint scene stage (site-only)
  'apps/www/src/lib/components/', // site-composed components
  'apps/www/src/lib/site/', // site-only surface modules (tw4 P2.2 placement law)
  'apps/www/src/lib/playground/', // component-canvas demo controls (site-only, canvas redesign 2026-08-25)
  'apps/www/src/lib/schema/', // jsonSchema kernel (www-only, canvas-schema-pipeline 2026-08-30)
  'apps/www/src/lib/meta/', // generated + annotated component meta (canvas-schema-pipeline 2026-08-30)
  'apps/www/src/lib/registry-source.ts', // canvas-floor-lab: registry path -> sourceUrl projection (site-only docs infra)
  'apps/www/src/lib/docs-install.svelte', // docs-demo-standard: install chrome (site-only)
  'apps/www/src/lib/docs-see-also.svelte', // docs-demo-standard: reading-chain chrome (site-only)
  'apps/www/src/lib/ui/props-table/docs/', // docs-demo-standard: per-component curated docs layer (site-only)
  'apps/www/src/lib/ui/props-table/from-meta.ts', // docs-demo-standard: meta -> PropEntry projection (site-only)
  'apps/www/src/lib/print/', // print-pipeline: the paged.js layer (site-only docs infra)
  'apps/www/src/lib/medium.svelte.ts', // print-pipeline: the three-state medium context (site-only)
  'apps/www/src/lib/context-plugin.svelte.ts', // context-plugin-system: the plugin kernel (site-only)
  'apps/www/src/lib/hue-runtime.svelte.ts', // context-plugin-system: hue adapter (runes need the .svelte.ts suffix)
  'apps/www/src/lib/__probe__/', // P0 scratch (removed when the probe retires)
];

const SITE_ONLY_PATHS = new Set(SITE_ONLY.map((e) => e.path));

/**
 * Is this repo-relative www path site-only (never mirrored into
 * registry/, whatever its prefix)? Exact entries and prefix trees
 * both count.
 * @param {string} repoRelPath
 */
export function isSiteOnly(repoRelPath) {
  if (SITE_ONLY_PATHS.has(repoRelPath)) return true;
  return SITE_ONLY_PREFIXES.some((prefix) => repoRelPath.startsWith(prefix));
}
