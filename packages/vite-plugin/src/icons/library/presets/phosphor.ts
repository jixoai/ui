/**
 * @jixoai/vite-plugin (icons library presets) — the phosphor preset
 * (A3, openspec icon-library-presets design §1).
 *
 * `ph:atom` → `@phosphor-icons/core` at
 * `assets/${weight}/${name}${weight === 'regular' ? '' : `-${weight}`}.svg`
 * (weight default regular; the non-regular directories ship the SAME
 * icons under weight-suffixed filenames — `assets/fill/atom-fill.svg`,
 * probed 2026-09-07). MIT. The per-icon svg crosses the shared RAW
 * safety → svgo → extraction pipeline in resolve.ts like every preset.
 */

import { resolvePeerFile } from './peer.js';
import type { IconPreset, PhosphorPresetOptions } from './types.js';

/** the frozen default (documented on the icons page's preset table) */
export const PHOSPHOR_DEFAULTS = {
  weight: 'regular',
} as const;

/** the peer every phosphor weight lives in (one package, six weights) */
export const PHOSPHOR_PEER = '@phosphor-icons/core';

/** build the ENABLED phosphor preset instance from its config knobs */
export function phosphorPreset(
  options: Readonly<Partial<PhosphorPresetOptions>> = {},
): IconPreset {
  const weight = options.weight ?? PHOSPHOR_DEFAULTS.weight;
  const suffix = weight === 'regular' ? '' : `-${weight}`;
  return {
    id: 'phosphor',
    prefix: 'ph',
    peerPackage: PHOSPHOR_PEER,
    resolveFile(ref: string): string {
      return resolvePeerFile(PHOSPHOR_PEER, `assets/${weight}/${ref}${suffix}.svg`);
    },
    defaultsNote: `weight ${weight} (${PHOSPHOR_PEER} assets/${weight}/)`,
  };
}
