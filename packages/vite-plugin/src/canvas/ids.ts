/**
 * @jixoai/vite-plugin (canvas) — the virtual-module id vocabulary
 * (typography-context-and-parts §7, the canvas same-source design).
 *
 * PURE string contract — zero imports — mirroring the icons ids.ts
 * precedent: the specifier grammar is contract surface shared by the
 * plugin's resolveId/load and the page-side imports, defined exactly
 * once, here. The specifier is
 *
 *   virtual:jixoai-canvas/<route-rel>/+page
 *
 * where <route-rel> is the SvelteKit route directory relative to
 * `src/routes` (e.g. `docs/components/blockquote.html`). NO root
 * config option exists (design F6): the page a specifier belongs to
 * is derived from the RESOLVEID IMPORTER (which must be that page),
 * so cross-page copy-paste of a specifier is a named error, never a
 * silent wrong-page extraction.
 */

/** the specifier prefix every canvas virtual module import carries */
export const CANVAS_MODULE_PREFIX = 'virtual:jixoai-canvas/';

/** `virtual:jixoai-canvas/<route-rel>/+page` */
const SPECIFIER_PATTERN = /^virtual:jixoai-canvas\/(.+)\/\+page$/;

/** does a route-rel contain no traversal/absolute/empty segments? */
export function isValidRouteRel(rel: string): boolean {
  if (rel.length === 0 || rel.startsWith('/') || rel.endsWith('/')) return false;
  if (rel.includes('\\') || rel.includes('\0')) return false;
  const segments = rel.split('/');
  return segments.every(
    (segment) =>
      segment.length > 0 &&
      segment !== '.' &&
      segment !== '..' &&
      !segment.includes('\0'),
  );
}

/** build the bare specifier for a route-rel (the pages' import id) */
export function canvasSpecifier(rel: string): string {
  return `${CANVAS_MODULE_PREFIX}${rel}/+page`;
}

/**
 * the route-rel a canvas module id carries, or null when the id is not
 * one of ours (the specifier SHAPE matched but the rel is invalid is
 * NOT null — the caller named-errors it, never silently passes it to
 * vite's generic resolver). Tolerant of the rollup `\0` prefix and of
 * vite's `?t=…` cache-busting query (design F5 — the icons
 * classifyVirtualId precedent), so the SAME classification serves
 * resolveId (raw importee) and load (resolved id).
 */
export function classifyCanvasId(id: string): string | null {
  const bare = id.startsWith('\0') ? id.slice(1) : id;
  const withoutQuery = bare.split('?')[0]!;
  const match = SPECIFIER_PATTERN.exec(withoutQuery);
  return match === null ? null : match[1]!;
}
