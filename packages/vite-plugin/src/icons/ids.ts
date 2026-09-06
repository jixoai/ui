/**
 * @jixoai/vite-plugin (icons) — the virtual-module id vocabulary
 * (icon-component-pipeline design §5/§9).
 *
 * PURE string/regex contract — zero imports — so the umbrella bridge
 * (src/index.ts) may claim the icons feature's virtual ids
 * SYNCHRONOUSLY (the frozen pre-bridge test surface assumed a sync
 * resolveId) while the implementation itself stays reachable only
 * through the ./icons sub-entry and the bridge's dynamic import. This
 * module is contract surface, like client.d.ts: the id vocabulary and
 * the overflow sentinel are shared by BOTH sides and defined exactly
 * once, here.
 */

/** the slot face's public import id (CSS entries: @import 'virtual:jixoai-icons') */
export const VIRTUAL_MODULE_ID = 'virtual:jixoai-icons';

/**
 * the slot face's resolved virtual ids. the `\0` prefix is the
 * rollup/vite convention for "our virtual module" — it keeps other
 * plugins/resolvers from touching it.
 */
export const RESOLVED_CSS_ID = `\0${VIRTUAL_MODULE_ID}`;
export const RESOLVED_JS_ID = `${RESOLVED_CSS_ID}?dom`;

/** which slot-face virtual module an id refers to */
export type VirtualKind = 'css' | 'js';

/**
 * classify a (raw or resolved) module id as one of the slot face's
 * virtual modules. tolerant of the `\0` prefix and of vite's
 * cache-busting query params (`?t=…` appended by moduleGraph
 * invalidation).
 */
export function classifyVirtualId(id: string): VirtualKind | null {
  const bare = id.startsWith('\0') ? id.slice(1) : id;
  if (bare === VIRTUAL_MODULE_ID) return 'css';
  if (bare === `${VIRTUAL_MODULE_ID}?dom` || bare.startsWith(`${VIRTUAL_MODULE_ID}?dom&`)) {
    return 'js';
  }
  if (bare.startsWith(`${VIRTUAL_MODULE_ID}?`)) return 'css';
  return null;
}

// ── the library face's virtual chunk modules ───────────────────────

/** the lazy chunk module prefix every artifact LAZY import targets */
export const ICON_CHUNK_MODULE_PREFIX = 'virtual:jixoai-icons/chunk/';

/** `virtual:jixoai-icons/chunk/7` (+`\0` prefix, +`?t=` cache busts) */
const CHUNK_ID_PATTERN = /^(\0?)virtual:jixoai-icons\/chunk\/(\d+)/;

/** the chunk index a module id carries, or null when not a chunk id */
export function chunkIndexOf(id: string): number | null {
  const match = CHUNK_ID_PATTERN.exec(id);
  return match === null ? null : Number(match[2]);
}

/** does the id belong to a library chunk module? */
export function isChunkModuleId(id: string): boolean {
  return CHUNK_ID_PATTERN.test(id);
}

// ── the overflow sentinel (design §5) ──────────────────────────────

/**
 * the fixed named error for unwired overflow imports — build-time (the
 * plugin's resolver, when the library face is not configured) and
 * runtime (the artifact's LAZY catch, after a green build) share these
 * exact bytes.
 */
export const ICON_LIBRARY_SENTINEL_ERROR =
  '[jixoai/icon-set] virtual:jixoai-icons/chunk/* imported but no icons library ' +
  'is configured — wire jixoai({ icons: { library } }) in your vite plugins ' +
  '(see the icon-set item docs)';
