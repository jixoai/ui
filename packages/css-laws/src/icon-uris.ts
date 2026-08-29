/**
 * icon-uris.ts — lucide is the ONLY geometry source for every icon
 * data-URI in the sheets (icons spec, 2026-08-29).
 *
 * - Intent 1: serialize lucide IconNodes into the byte-frozen URI
 *   dialect the sheets have shipped since the hand-copy era.
 * - Intent 2: expose the jx icon-slot fallback URIs the law sources
 *   embed as `var(--jx-icon-<slot>, <uri>)` defaults.
 *
 * The frozen dialect (reverse-engineered from the committed literals):
 *   - svg attrs = lucide defaultAttributes MINUS width/height, with
 *     stroke → ink and stroke-width → sw (insertion order preserved)
 *   - child attrs in lucide insertion order, single quotes, self-closing
 *   - a fill='currentColor' child (palette dots) becomes fill=ink plus
 *     stroke='none' appended — fill-painted dots must not inherit the
 *     2px stroke
 *   - percent-encoding: ONLY '<' '>' '#' (%3C %3E %23); spaces, quotes,
 *     slashes, commas and dots ride literal inside the quoted url()
 *
 * LIBRARY-CANONICAL LAW (zero-exemption ruling, 2026-08-29): every
 * byte derives from the installed lucide's IconNode order. The one
 * deliberate visual change in this migration is invalid-ink →
 * CircleAlert; the calendar child/attr order also shifted to lucide's
 * canonical sequence (render-identical — fill:none strokes don't
 * occlude). test/icon-uris.test.ts guards the emitted bytes.
 */
import {
  Calendar,
  Check,
  ChevronDown,
  CircleAlert,
  Clock,
  Mail,
  Palette,
  Search,
  X,
} from 'lucide';

// ── lucide node types (structural twins — the package exports icon
//    values but keeps these types internal) ─────────────────────────

export type IconAttrs = Readonly<Record<string, string | number>>;
export type IconChild = readonly [tag: string, attrs: IconAttrs];
export type IconNode = readonly [tag: string, attrs: IconAttrs, children?: readonly IconChild[]];

const childrenOf = (icon: IconNode): readonly IconChild[] => icon[2] ?? [];

// ── the serializer ──────────────────────────────────────────────────

/** the two alpha inks the vocabulary paints (mask ink vs dark-mode ink) */
export type IconInk = '#000' | '#fff';

export interface IconUriOptions {
  /** stroke ink substituted for lucide's currentColor (default #000) */
  readonly ink?: IconInk;
  /** stroke-width override (default 2 — lucide's own default) */
  readonly strokeWidth?: number;
}

/** percent-encode exactly the three bytes the dialect encodes */
const encodeDataUri = (svg: string): string =>
  svg.replaceAll('<', '%3C').replaceAll('>', '%3E').replaceAll('#', '%23');

const attrsToString = (attrs: IconAttrs): string =>
  Object.entries(attrs)
    .map(([k, v]) => ` ${k}='${String(v)}'`)
    .join('');

/**
 * child element: fill='currentColor' dots swap to ink + stroke='none'
 * (appended after fill — the committed byte order)
 */
function childToString([tag, attrs]: IconChild, ink: IconInk): string {
  const out: Record<string, string | number> = { ...attrs };
  if (out.fill === 'currentColor') {
    out.fill = ink;
    out.stroke = 'none';
  }
  return `<${tag}${attrsToString(out)}/>`;
}

/** serialize a lucide node into the un-encoded svg text */
export function iconSvg(icon: IconNode, opts: IconUriOptions = {}): string {
  const ink = opts.ink ?? '#000';
  const sw = opts.strokeWidth ?? 2;
  const svgAttrs: Record<string, string | number> = {};
  for (const [k, v] of Object.entries(icon[1])) {
    if (k === 'width' || k === 'height') continue; // data-URIs size via CSS
    svgAttrs[k] = v;
  }
  // stroke + stroke-width keep their defaultAttributes slot (order),
  // only the values swap for ink and weight
  svgAttrs['stroke'] = ink;
  svgAttrs['stroke-width'] = sw;
  const inner = childrenOf(icon)
    .map((child) => childToString(child, ink))
    .join('');
  return `<svg${attrsToString(svgAttrs)}>${inner}</svg>`;
}

/** serialize a lucide node into the frozen url("data:image/svg+xml,…") token */
export function iconUri(icon: IconNode, opts: IconUriOptions = {}): string {
  return `url("data:image/svg+xml,${encodeDataUri(iconSvg(icon, opts))}")`;
}

// ── the jx icon-slot vocabulary ─────────────────────────────────────

/** every glyph the vocabulary paints, as lucide nodes */
export const jxGlyphs = {
  calendar: Calendar,
  clock: Clock,
  mail: Mail,
  search: Search,
  chevron: ChevronDown,
  clear: X,
  palette: Palette,
  check: Check,
  'circle-alert': CircleAlert,
} as const satisfies Record<string, IconNode>;

export type JxGlyph = keyof typeof jxGlyphs;

/** slots the laws embed as var() fallbacks (the ink glyphs ride the vocab sheet only) */
export type JxIconSlotName =
  | 'calendar'
  | 'clock'
  | 'mail'
  | 'search'
  | 'chevron'
  | 'clear'
  | 'palette';

/** slot fallback URIs at the vocabulary defaults (ink #000, sw 2) */
export const jxIconSlots: Readonly<Record<JxIconSlotName, string>> = {
  calendar: iconUri(jxGlyphs.calendar),
  clock: iconUri(jxGlyphs.clock),
  mail: iconUri(jxGlyphs.mail),
  search: iconUri(jxGlyphs.search),
  chevron: iconUri(jxGlyphs.chevron),
  clear: iconUri(jxGlyphs.clear),
  palette: iconUri(jxGlyphs.palette),
};

/** the law-source sugar: `var(--jx-icon-<slot>, <fallback-uri>)` */
export function iconSlot(slot: JxIconSlotName): string {
  return `var(--jx-icon-${slot}, ${jxIconSlots[slot]})`;
}
