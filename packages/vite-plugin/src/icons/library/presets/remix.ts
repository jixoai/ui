/**
 * @jixoai/vite-plugin (icons library presets) — the remix preset
 * (A3, openspec icon-library-presets design §1).
 *
 * `rx:system:add-line` → the `remixicon` package at
 * `icons/${Category}/${icon}.svg` — the NAME carries its category
 * prefix (remixicon's own taxonomy: system, media, editor…; the
 * package's directories are capitalized, `System/`). Apache-2.0. The
 * per-icon svg crosses the shared RAW safety → svgo → extraction
 * pipeline in resolve.ts like every preset.
 */

import { resolvePeerFile } from './peer.js';
import type { IconPreset } from './types.js';

/** the frozen default mapping (no knobs: the category rides the name) */
export const REMIX_PEER = 'remixicon';

/** `system:add-line` → `icons/System/add-line.svg` (capitalized dirs) */
function remixFile(ref: string): string {
  const colon = ref.indexOf(':');
  if (colon <= 0 || colon === ref.length - 1) {
    throw new Error(
      `[jixoai-icons] remix refs carry their category prefix — expected ` +
        `'rx:category:icon-name' shaped like 'rx:system:add-line', got "rx:${ref}" ` +
        "(remixicon's own taxonomy: system, media, editor, business, …)",
    );
  }
  const category = ref.slice(0, colon);
  const icon = ref.slice(colon + 1);
  const dir = category.charAt(0).toUpperCase() + category.slice(1);
  return resolvePeerFile(REMIX_PEER, `icons/${dir}/${icon}.svg`);
}

/** build the ENABLED remix preset instance (no config knobs) */
export function remixPreset(): IconPreset {
  return {
    id: 'remix',
    prefix: 'rx',
    peerPackage: REMIX_PEER,
    resolveFile: remixFile,
    defaultsNote: `category-prefixed names (${REMIX_PEER} icons/<Category>/)`,
  };
}
