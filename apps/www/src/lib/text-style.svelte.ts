/**
 * jixoai text-style kernel (registry/files/lib/text-style.svelte.ts,
 * inline-code-engine-and-text-modifiers Lane A / design D5, 2026-09-08).
 *
 * The SHARED text-modifier kernel: one pure resolver turning the six
 * common text-modifier props (lineHeight/weight/italic/tracking/
 * family/fontSize) into a single space-joined Tailwind utility
 * string. Owner ruling (2026-09-08, ask 5): <Text> and inline-code
 * SHARE this kernel but stay INDEPENDENT components — the file ships
 * under the text item (it is the text kernel; inline-code's registry
 * edge on @jixoai/text pulls it into the chip's install). No new
 * registry item; no component logic lives here.
 *
 * THE ABSENT-AMBIENT LAW: an ABSENT prop contributes NO utility —
 * nothing is emitted for the channel, so the ambient channels flow
 * untouched (the typography trio's inheritance, the prose scope's
 * leading, the ambient type ramp). Absent = inheritance.
 *
 * THE EXPLICIT-BEATS-AMBIENT INTERPLAY RULING (the ambient-scale
 * amendment's second half): an EXPLICIT prop emits its utility and
 * beats the ambient — in particular an explicit member lineHeight
 * (a utilities-layer leading-[…] class) beats the prose scope's
 * --jx-ty-leading residue (the components-layer rule in prose.css):
 * the layer law's own posture, written down for the text family.
 *
 * Utility forms (design D5):
 *   - lineHeight — number ⇒ the UNITLESS ratio form (1.5 →
 *     leading-[1.5]); string ⇒ verbatim (2rem → leading-[2rem])
 *   - weight — the named set maps to the core utilities Tailwind
 *     already ships (font-normal/font-medium/font-semibold/
 *     font-bold/…); anything else ('450', '550', unknown names)
 *     rides the arbitrary font-[…] form (same tailwind-merge group
 *     as the named set — a later modifier or consumer class still
 *     replaces it)
 *   - italic — true ⇒ 'italic'; NEVER 'not-italic' (absent/false =
 *     ambient — a consumer killing inherited italics passes
 *     not-italic through the class channel, which merges LAST)
 *   - tracking — the named set (tighter…widest) maps to the core
 *     utilities; anything else rides verbatim tracking-[…] (the
 *     '-0.02em' escape)
 *   - family — the arbitrary-property form [font-family:…], no
 *     stack registry this round; spaces escape to underscores (the
 *     Tailwind arbitrary-value law — a raw space would split the
 *     class token into broken halves)
 *   - fontSize — the arbitrary-property form [font-size:…]: NEVER
 *     a text-* size utility, and the prop is never NAMED `size`
 *     (the AXIS_PROPS gate collision — `size` is an axis word)
 *
 * PURE: zero context reads, zero style writes — a value-domain
 * carrier (the code-card `code` precedent, not a variant axis).
 * This file is a member of the text registry item (installs with
 * the family, byte mirrored to apps/www/src/lib).
 */

/** the named weight set — every weight Tailwind's core ships a
 *  utility for; the ONLY weights that avoid the arbitrary form */
const NAMED_WEIGHTS = {
  thin: 'font-thin',
  extralight: 'font-extralight',
  light: 'font-light',
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
  extrabold: 'font-extrabold',
  black: 'font-black',
} as const;

/** the named tracking set — tighter…widest, the core utilities */
const NAMED_TRACKING = {
  tighter: 'tracking-tighter',
  tight: 'tracking-tight',
  normal: 'tracking-normal',
  wide: 'tracking-wide',
  wider: 'tracking-wider',
  widest: 'tracking-widest',
} as const;

export interface TextStyleProps {
  /** number ⇒ the unitless ratio (1.5 → leading-[1.5]); string ⇒
   *  verbatim ('2rem' → leading-[2rem]) */
  lineHeight?: number | string;
  /** a weight word or number — 'bold' → font-bold (the named map);
   *  '450' → font-[450] (the arbitrary escape) */
  weight?: string;
  /** true ⇒ italic; NEVER not-italic — absent/false stays ambient */
  italic?: boolean;
  /** a letter-spacing word or length — 'wide' → tracking-wide (the
   *  named map); '-0.02em' → tracking-[-0.02em] (verbatim) */
  tracking?: string;
  /** a font-family value or stack — verbatim [font-family:…]; no
   *  stack registry this round */
  family?: string;
  /** a CSS length — verbatim [font-size:…]; NEVER a text-* size
   *  utility, never named `size` (the AXIS_PROPS gate law) */
  fontSize?: string;
}

/** the shared text-modifier kernel: props → utilities. Absent prop ⇒
 *  NO utility (the absent-ambient law) — the joined string is '' for
 *  an empty props object, never a fallback chain. */
export function resolveTextStyle(props: TextStyleProps): string {
  const utilities: string[] = [];

  if (props.lineHeight !== undefined) {
    // number ⇒ unitless ratio; string ⇒ verbatim — one template
    utilities.push(`leading-[${props.lineHeight}]`);
  }

  if (props.weight !== undefined) {
    const named = (NAMED_WEIGHTS as Record<string, string | undefined>)[props.weight];
    utilities.push(named ?? `font-[${props.weight}]`);
  }

  if (props.italic === true) {
    utilities.push('italic');
  }

  if (props.tracking !== undefined) {
    const named = (NAMED_TRACKING as Record<string, string | undefined>)[props.tracking];
    utilities.push(named ?? `tracking-[${props.tracking}]`);
  }

  if (props.family !== undefined) {
    // spaces → underscores: the arbitrary-value law (a raw space
    // splits the class token); the value itself rides unmapped
    utilities.push(`[font-family:${props.family.replace(/ /g, '_')}]`);
  }

  if (props.fontSize !== undefined) {
    utilities.push(`[font-size:${props.fontSize}]`);
  }

  return utilities.join(' ');
}
