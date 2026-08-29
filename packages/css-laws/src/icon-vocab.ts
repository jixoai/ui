/**
 * icon-vocab.ts — the 4th projection: the jx icon vocabulary block
 * (icons spec, 2026-08-29). Not a ComponentLaw — it owns no element;
 * it is the sheet-level custom-property vocabulary plus the two mask
 * rules that consume it. Emitted into jx-pure.css's `jx-icon-vocab`
 * generated slot (relocated byte-identical from the hand region,
 * between the alias slot and the face slot).
 *
 * - Intent 1: single-source every --jx-icon-* declaration — the URI
 *   bytes come from icon-uris.ts (lucide), the var order and the
 *   .dark / .jx-light ink matrix are declared here.
 * - Intent 2: own the .jx-color-shell::after palette mask and the
 *   .jx-color-picker-chevron mask (the vocabulary's only consumers
 *   that paint directly).
 *
 * 2026-08-29 · the only visual change since hand-authorship: the
 * invalid-ink glyph is lucide CircleAlert (was a hand-drawn bare
 * exclamation) — the mission's sanctioned swap; everything else is
 * byte-frozen (test/icon-uris.test.ts guards the relocation).
 */
import { iconUri, iconSlot, jxGlyphs, type IconInk } from './icon-uris';

// ── the vocabulary data ─────────────────────────────────────────────

/** :root plain-slot order (mail/search ride after clock here; the
 *  .dark/.jx-light blocks lead with them instead — frozen sheet order) */
const ROOT_PLAIN_ORDER = ['calendar', 'clock', 'mail', 'search', 'chevron', 'clear'] as const;

/** .dark/.jx-light plain-slot order (mail/search first — the comment
 *  below explains why the ink flip covers the plain slots) */
const DARK_PLAIN_ORDER = ['mail', 'search', 'calendar', 'clock', 'chevron', 'clear'] as const;

/** the ink quartet: UA-shadow pseudos that reject author mask paint */
const INK_QUARTET = [
  { slot: 'calendar-ink', glyph: 'calendar', strokeWidth: 2 },
  { slot: 'clock-ink', glyph: 'clock', strokeWidth: 2 },
  { slot: 'valid-ink', glyph: 'check', strokeWidth: 2.5 },
  { slot: 'invalid-ink', glyph: 'circle-alert', strokeWidth: 2.5 },
] as const;

const varLine = (name: string, glyph: keyof typeof jxGlyphs, ink: IconInk, strokeWidth?: number): string =>
  `  --jx-icon-${name}: ${iconUri(jxGlyphs[glyph], { ink, ...(strokeWidth ? { strokeWidth } : {}) })};`;

// ── the sheet builder ───────────────────────────────────────────────

function rootBlock(): string {
  const lines = [
    ...ROOT_PLAIN_ORDER.map((slot) => varLine(slot, slot, '#000')),
    // the placeholder rides the same :root (hand-authored value, not a glyph)
    '  --jx-placeholder: color-mix(in oklab, var(--foreground) 40%, var(--background));',
    ...INK_QUARTET.map((q) => varLine(q.slot, q.glyph, '#000', q.strokeWidth)),
  ];
  return `@layer theme {
  :root {
${lines.join('\n')}
}
}`;
}

function darkBlock(ink: IconInk, selector: '.dark' | '.jx-light'): string {
  const lines = [
    ...DARK_PLAIN_ORDER.map((slot) => varLine(slot, slot, ink)),
    ...INK_QUARTET.map((q) => varLine(q.slot, q.glyph, ink, q.strokeWidth)),
  ];
  const comment =
    selector === '.dark'
      ? `  /* the author-painted icon set flips to white ink in dark (the
     -ink quartet's law extended to the plain slots the input/select
     laws consume — black alpha URIs vanish on the dark token sheet) */\n`
      : '';
  return `${selector} {
${comment}${lines.join('\n')}
}`;
}

/** the pipette/palette glyph mask on the color-shell wrapper */
function paletteMaskRules(): string {
  const paint = `${iconSlot('palette')} center / contain no-repeat`;
  return `/* the pipette glyph — an ICON SLOT on the WRAPPER (input[type=color]
 * is a replaced element whose ::after is unreliable across engines;
 * the label wrapper is non-replaced and paints reliably) */
.jx-color-shell::after {
  content: '';
  position: absolute;
  z-index: 2;
  /* proportional optics: glyph ≈ 36% of the lane, end inset ≈ 27% —
     scale with the container, not with font size */
  inset-inline-end: calc(100cqh * 0.27);
  top: 50%;
  width: calc(100cqh * 0.36);
  height: calc(100cqh * 0.36);
  translate: 0 -50%;
  color: var(--muted-foreground);
  background-color: currentColor;
  -webkit-mask: ${paint};
  mask: ${paint};
  pointer-events: none;
}
.jx-color-shell:hover::after {
  color: var(--foreground);
}`;
}

/** the color-picker chevron mask */
function chevronMaskRule(): string {
  const paint = `${iconSlot('chevron')} center / contain no-repeat`;
  return `/* the color-picker chevron — an ICON SLOT (mask, currentColor themes) */
.jx-color-picker-chevron {
  display: block;
  width: 0.75rem;
  height: 0.75rem;
  background-color: currentColor;
  -webkit-mask: ${paint};
  mask: ${paint};
}`;
}

const VOCAB_BANNER = `/* =====================================================================
   Icon vocabulary — the mask/currentColor law. One alpha-only URI per
   glyph; the encoded stroke %23000 is an ALPHA SOURCE ONLY. The INK
   variants (calendar/clock/valid/invalid) serve UA-shadow pseudos that
   reject author mask paint; .dark flips them to %23fff, .jx-light back.
   ===================================================================== */`;

/** the full jx-icon-vocab slot body (trimmed by replaceSlot) */
export function buildIconVocabSheet(): string {
  // frozen hand layout: ONE blank line between the ::after rules and
  // the chevron rule; every other section joins tight (no blanks)
  return [
    `${paletteMaskRules()}\n\n${chevronMaskRule()}`,
    VOCAB_BANNER,
    rootBlock(),
    darkBlock('#fff', '.dark'),
    darkBlock('#000', '.jx-light'),
  ].join('\n');
}
