/**
 * @jixoai/ui-vite-plugin (icons library channels) — the phosphor
 * channel factory (A2, openspec icon-channel-api design §1; the
 * icon-library-presets mapping carried verbatim).
 *
 * `ph:atom` → `@phosphor-icons/core` at
 * `assets/${weight}/${name}${weight === 'regular' ? '' : `-${weight}`}.svg`
 * (weight default regular; the non-regular directories ship the SAME
 * icons under weight-suffixed filenames — `assets/fill/atom-fill.svg`,
 * probed 2026-09-07). MIT. The per-icon svg crosses the shared RAW
 * safety → svgo → extraction pipeline in resolve.ts like every channel.
 * This module doubles as the `…/icons/ph` sub-entry source (importable
 * WITHOUT reaching lucide/svgo/opentype).
 */

import { resolvePeerFile } from './peer.js';
import { defineIconChannel } from './define.js';
import type { IconChannel } from './types.js';

/** `ph(options?)` — the phosphor knob (weight) */
export interface PhosphorChannelOptions {
  /** assets/<weight>/ directory (default 'regular') */
  readonly weight?: 'thin' | 'light' | 'regular' | 'bold' | 'fill' | 'duotone';
}

/** the frozen default (documented on the icons page's channel table) */
export const PHOSPHOR_DEFAULTS = {
  weight: 'regular',
} as const;

/** the peer every phosphor weight lives in (one package, six weights) */
export const PHOSPHOR_PEER = '@phosphor-icons/core';

/**
 * build the phosphor channel — `import { ph } from
 * '@jixoai/ui-vite-plugin/icons/ph'` then `channels: [ph()]`.
 */
export function ph(options: Readonly<Partial<PhosphorChannelOptions>> = {}): IconChannel {
  const weight = options.weight ?? PHOSPHOR_DEFAULTS.weight;
  const suffix = weight === 'regular' ? '' : `-${weight}`;
  return defineIconChannel({
    id: 'phosphor',
    prefix: 'ph',
    peerPackage: PHOSPHOR_PEER,
    resolveFile(ref: string): string {
      return resolvePeerFile(PHOSPHOR_PEER, `assets/${weight}/${ref}${suffix}.svg`);
    },
    defaultsNote: `weight ${weight} (${PHOSPHOR_PEER} assets/${weight}/)`,
  });
}
