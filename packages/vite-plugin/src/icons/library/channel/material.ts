/**
 * @jixoai/ui-vite-plugin (icons library channels) — the material
 * channel factory (A2, openspec icon-channel-api design §1; the
 * icon-library-presets mapping carried verbatim).
 *
 * `md:home` → `@material-symbols/svg-${weight}` at
 * `${style}/${name}${fill ? '-fill' : ''}.svg`. Defaults frozen:
 * outlined / weight 400 / FILL 0 (the docs page's default mapping row).
 * Apache-2.0. One weight = ONE peer package — the weight knob picks
 * the package, style/fill pick paths inside it, so enabling
 * {weight: 400, style: 'rounded', fill: true} needs only
 * @material-symbols/svg-400 installed. The per-icon svg then crosses
 * the SAME shared RAW safety → svgo → extraction pipeline as any other
 * source (resolve.ts). This module doubles as the `…/icons/md`
 * sub-entry source (importable WITHOUT reaching lucide/svgo/opentype).
 */

import { resolvePeerFile } from './peer.js';
import { defineIconChannel } from './define.js';
import type { IconChannel } from './types.js';

/** `md(options?)` — the material knobs (weight/style/fill) */
export interface MaterialChannelOptions {
  /** the SVG package weight (default 400 → @material-symbols/svg-400) */
  readonly weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700;
  /** the style directory (default 'outlined') */
  readonly style?: 'outlined' | 'rounded' | 'sharp';
  /** FILL 1 variant: the `-fill` filename suffix (default false = FILL 0) */
  readonly fill?: boolean;
}

/** the frozen defaults (documented on the icons page's channel table) */
export const MATERIAL_DEFAULTS = {
  weight: 400,
  style: 'outlined',
  fill: false,
} as const;

/**
 * build the material channel — `import { md } from
 * '@jixoai/ui-vite-plugin/icons/md'` then `channels: [md()]`.
 * weight/style/fill are frozen defaults (outlined / 400 / FILL 0);
 * grade/opsz exist only in the variable FONT, not the SVG packages.
 */
export function md(options: Readonly<Partial<MaterialChannelOptions>> = {}): IconChannel {
  const weight = options.weight ?? MATERIAL_DEFAULTS.weight;
  const style = options.style ?? MATERIAL_DEFAULTS.style;
  const fill = options.fill ?? MATERIAL_DEFAULTS.fill;
  const peerPackage = `@material-symbols/svg-${weight}`;
  return defineIconChannel({
    id: 'material',
    prefix: 'md',
    peerPackage,
    resolveFile(ref: string): string {
      return resolvePeerFile(peerPackage, `${style}/${ref}${fill ? '-fill' : ''}.svg`);
    },
    defaultsNote: `${style} · weight ${weight} · FILL ${fill ? 1 : 0} (${peerPackage})`,
  });
}
