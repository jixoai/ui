/**
 * @jixoai/vite-plugin (icons) — lucideIconProvider (P2.2)
 *
 * The zero-I/O inline defaults, backed by the `lucide` npm package:
 * slot artwork is serialized at factory time from lucide's own
 * IconNode data — no hand-copied geometry lives in this module
 * (single-source law with the standard layer's fallbacks in
 * registry/files/lib/icons.ts and jx-pure.css).
 *
 * - `lucide` is an optional peer dependency: the factory imports it
 *   dynamically and REJECTS with an install hint when missing — no
 *   silent fallback to different artwork.
 * - Still zero plugin I/O: no ctx.loadSource / ctx.watchFile; the
 *   factory resolves with a fully populated cache.
 */

import type { IconNode, IconNodeChild } from 'lucide';
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
 *   button) it inherits the surrounding text color. In 'css-var' data
 *   URIs the serializer BAKES literal ink over it (src/icons/ink.ts —
 *   data-URI documents cannot inherit author color), so the emitted
 *   bytes match the %23000-encoded fallbacks baked into jx-pure.css.
 */
const lucideSvg = (paths: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths}</svg>`;

/**
 * Serialize IconNode children to the flat inner-SVG grammar: elements
 * in IconNode order, attributes in IconNode insertion order,
 * self-closing tags, no separators. Consumers pin these bytes.
 */
const serializeChildren = (children: readonly IconNodeChild[]): string =>
  children
    .map(([tag, attrs]) => {
      const attributes = Object.entries(attrs)
        .map(([name, value]) => ` ${name}="${value}"`)
        .join('');
      return `<${tag}${attributes}/>`;
    })
    .join('');

/**
 * slot → lucide export name (checked against lucide's export surface
 * at compile time; the geometry itself comes from the package at
 * runtime).
 */
const SLOT_ICONS = {
  /** lucide `calendar` — rect + header ticks + week line */
  calendar: 'Calendar',
  /** lucide `clock` — circle + hands polyline */
  clock: 'Clock',
  /** lucide `chevron-down` — the select dropdown arrow */
  chevron: 'ChevronDown',
  /** lucide `palette` — the color picker shell's indicator (ICON-1 rename:
   *  the slot and the glyph now both face the vocabulary's palette var) */
  palette: 'Palette',
  /** lucide `x` — the input clear button (×) */
  clear: 'X',
  /** lucide `mail` — envelope for email inputs */
  mail: 'Mail',
  /** lucide `search` — magnifier for search inputs */
  search: 'Search',
  /** lucide `check` — the combobox selected-row indicator (ICON-2) */
  check: 'Check',
  /** lucide `circle-alert` — the invalid-ink mark (the sanctioned swap,
   *  css-laws icon-uris 2026-08-29) */
  invalid: 'CircleAlert',
} as const satisfies Readonly<Record<IconSlot, keyof typeof import('lucide')>>;

/**
 * The default icon provider: every registered slot serves lucide's own
 * artwork, source kind 'inline', nature 'stroke'.
 *
 * @example
 * ```ts
 * jixoai({ icons: { provider: lucideIconProvider() } })
 * ```
 */
export function lucideIconProvider(): IconProviderFactory {
  return async () => {
    let lucide: typeof import('lucide');
    try {
      lucide = await import('lucide');
    } catch (cause) {
      throw new Error(
        'lucideIconProvider: the `lucide` package is not installed. ' +
          'It is an optional peer dependency of @jixoai/vite-plugin — ' +
          'install it (npm i lucide) or pick another icons provider.',
        { cause },
      );
    }
    const cache = new Map<IconSlot, SvgAsset>();
    for (const [slot, name] of Object.entries(SLOT_ICONS) as [
      IconSlot,
      (typeof SLOT_ICONS)[IconSlot],
    ][]) {
      const icon: IconNode = lucide[name];
      cache.set(slot, {
        svg: lucideSvg(serializeChildren(icon[2] ?? [])),
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
