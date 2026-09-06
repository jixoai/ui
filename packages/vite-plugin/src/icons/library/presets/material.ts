/**
 * @jixoai/vite-plugin (icons library presets) — the material preset
 * (A2, openspec icon-library-presets design §1).
 *
 * `md:home` → `@material-symbols/svg-${weight}` at
 * `${style}/${name}${fill ? '-fill' : ''}.svg`. Defaults frozen:
 * outlined / weight 400 / FILL 0 (the docs page's default mapping row).
 * Apache-2.0. One weight = ONE peer package — the weight knob picks
 * the package, style/fill pick paths inside it, so enabling {weight:
 * 400, style: 'rounded', fill: true} needs only @material-symbols/svg-400
 * installed. The per-icon svg then crosses the SAME shared RAW safety
 * → svgo → extraction pipeline as any other source (resolve.ts).
 */

import { resolvePeerFile } from './peer.js';
import type { IconPreset, MaterialPresetOptions } from './types.js';

/** the frozen defaults (documented on the icons page's preset table) */
export const MATERIAL_DEFAULTS = {
  weight: 400,
  style: 'outlined',
  fill: false,
} as const;

/** build the ENABLED material preset instance from its config knobs */
export function materialPreset(
  options: Readonly<Partial<MaterialPresetOptions>> = {},
): IconPreset {
  const weight = options.weight ?? MATERIAL_DEFAULTS.weight;
  const style = options.style ?? MATERIAL_DEFAULTS.style;
  const fill = options.fill ?? MATERIAL_DEFAULTS.fill;
  const peerPackage = `@material-symbols/svg-${weight}`;
  return {
    id: 'material',
    prefix: 'md',
    peerPackage,
    resolveFile(ref: string): string {
      return resolvePeerFile(peerPackage, `${style}/${ref}${fill ? '-fill' : ''}.svg`);
    },
    defaultsNote: `${style} · weight ${weight} · FILL ${fill ? 1 : 0} (${peerPackage})`,
  };
}
