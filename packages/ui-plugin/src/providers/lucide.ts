/**
 * @jixoai/ui-plugin — lucideIconProvider (P2.2)
 *
 * The zero-I/O inline defaults. All five slot icons are embedded as
 * lucide stroke geometry — the SAME paths as the standard layer's
 * fallbacks (registry/files/lib/icons.ts and the data URIs in
 * registry/files/theme/jx-pure.css share one geometry set; this module
 * is the plugin-side mirror of it — single-source law).
 *
 * The factory is async purely to match IconProviderFactory (font
 * parsing is async elsewhere); it performs no I/O and resolves
 * immediately with a fully populated cache.
 */

import type {
  IconProvider,
  IconProviderFactory,
  IconSlot,
  SvgAsset,
} from '../types.js';

/** lucide icons are normalized to the 24×24 design grid */
const LUCIDE_VIEWBOX = { width: 24, height: 24 } as const;

/**
 * lucide stroke-artwork wrapper. Mirrors the lucide attribute set:
 * fill="none", stroke="currentColor", round caps/joins, 2px stroke.
 *
 * - No width/height: the theme owns sizing (frozen principle #3).
 * - stroke="currentColor": in 'dom-string' mode (the clear slot's ×
 *   button) it inherits the surrounding text color; in 'css-var' data
 *   URIs currentColor computes to the initial `color` value (black),
 *   matching the %23000-encoded fallbacks baked into jx-pure.css.
 */
const lucideSvg = (paths: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

/**
 * The embedded slot artwork (lucide geometry, verified against the
 * standard layer's icons.ts / jx-pure.css data URIs).
 */
const LUCIDE_ICONS: Readonly<Record<IconSlot, string>> = {
  /** lucide `calendar` — rect + header ticks + week line */
  calendar: lucideSvg(
    '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4"/><path d="M8 2v4"/><path d="M3 10h18"/>',
  ),
  /** lucide `clock` — circle + hands polyline */
  clock: lucideSvg(
    '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  ),
  /** lucide `chevron-down` — the select dropdown arrow */
  chevron: lucideSvg('<path d="m6 9 6 6 6-6"/>'),
  /** lucide `mail` — envelope for email inputs */
  mail: lucideSvg(
    '<rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
  ),
  /** lucide `search` — magnifier for search inputs */
  search: lucideSvg(
    '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  ),
  /** lucide `pipette` — the color picker indicator */
  pipette: lucideSvg(
    '<path d="m2 22 1-1h3l9-9"/><path d="M3 21v-3l9-9"/><path d="m15 6 3.4-3.4a2.1 2.1 0 1 1 3 3L18 9l.4.4a2.1 2.1 0 1 1-3 3l-3.8-3.8a2.1 2.1 0 1 1 3-3l.4.4Z"/>',
  ),
  /** lucide `x` — the input clear button (×) */
  clear: lucideSvg('<path d="M18 6 6 18"/><path d="m6 6 12 12"/>'),
};

/**
 * The default icon provider: every registered slot serves embedded
 * lucide artwork, source kind 'inline', nature 'stroke'.
 *
 * @example
 * ```ts
 * jxUI({ icons: lucideIconProvider() })
 * ```
 */
export function lucideIconProvider(): IconProviderFactory {
  return async () => {
    const cache = new Map<IconSlot, SvgAsset>();
    for (const [slot, svg] of Object.entries(LUCIDE_ICONS) as [IconSlot, string][]) {
      cache.set(slot, {
        svg,
        viewBox: LUCIDE_VIEWBOX,
        nature: 'stroke',
        source: { kind: 'inline' },
      });
    }
    return {
      getIcon(slot: IconSlot): SvgAsset | null {
        return cache.get(slot) ?? null;
      },
    };
  };
}
