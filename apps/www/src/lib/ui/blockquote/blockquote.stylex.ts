// blockquote.stylex.ts — the blockquote family's atom table
// (tailwindless one-shot Wave 1 batch 0, 2026-09-17).
//
// The tailwindless re-authoring of the tw4 utility payload (the
// separator family's law): structural utilities became static
// longhand atoms; theme-able values ride the typed token layer, the
// ruler's kernel channels as PLAIN var() strings (--jx-text-base =
// 13px, the chrome rows' 0.8125rem verbatim), or the family's own
// hue seams (--jx-tonal / --jx-outline, injected by jx-hue-* scope
// classes — the §4.2 CSS-var binding idiom).
//
// Value notes (receipted):
//   - the 1px tonal box rides --jx-hairline (borderWidth literals
//     are tier-2 red); the rule channel's 1/4/8 px ladder rides the
//     hairline's calc equations (calc(var(--hairline) * N)) — the
//     Owner's literal enumeration preserved exactly, reported as
//     MISSING steps for serial promotion;
//   - py-3 (12px) maps to the --space-12 step; px-3.5 / ps (14px)
//     has NO step — the calc(var(--jx-unit) * 3.5) equation is the
//     sheet's own ladder physics, reported as a MISSING step
//     (--space-14);
//   - the root's em-ratio body voice (0.875em) CANNOT be a token
//     (tokens are absolute; the ratio must rescale with the ambient
//     scale) — it lives in blockquote.css keyed on the data hook.
//
// Lane-2 residue (blockquote.css): the em-ratio body voice + the
// rule channel's SHADOW modes (inset shadow literals carry px
// lengths — tier-2 red in atoms; UNLAYERED :where() rules keyed on
// data-jx-blockquote-rule, the command.css carve-out precedent).
// The rule channel's BORDER modes live HERE as atoms — stylex
// layers nest under components, so atoms beat any plain-components
// border rule (the layer ordering that forced the split).
//
// Forced colors: the border modes' CanvasText re-ink rides nested
// media conditions in the atoms; the shadow modes' Npx CanvasText
// re-materialization lives with their css shadows (same reason).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const blockquoteStyles = stylex.create({
  // ── the root: centered flex column, no margins of its own ────────
  root: {
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    margin: 0, // the UA blockquote margin reset (no preflight to lean on)
  },
  // ── variant grounds (design §1.1 recipes, verbatim) ──────────────
  outlineGround: {
    paddingInlineStart: 'calc(var(--jx-unit) * 3.5)',
  },
  tonalGround: {
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    backgroundColor: 'color-mix(in oklab, var(--jx-tonal) 12%, transparent)',
    borderColor: 'color-mix(in oklab, var(--jx-tonal) 45%, transparent)',
    borderRadius: tokens['--jx-radius'],
    paddingInline: 'calc(var(--jx-unit) * 3.5)',
    paddingBlock: tokens['--jx-space-12'],
    '@media (forced-colors: active)': {
      backgroundColor: 'Canvas',
      borderColor: 'CanvasText',
    },
  },
  // ── the rule channel's BORDER modes (the rule consumes geometry) ──
  // outline emits NO border at all in shadow mode (the css shadow IS
  // the rule); tonal keeps its box border PLUS the widened start
  ruleBorder1: {
    borderInlineStartWidth: tokens['--jx-hairline'],
    borderInlineStartStyle: 'solid',
    '@media (forced-colors: active)': {
      borderInlineStartColor: 'CanvasText',
    },
  },
  ruleBorder4: {
    borderInlineStartWidth: 'calc(var(--hairline) * 4)',
    borderInlineStartStyle: 'solid',
    '@media (forced-colors: active)': {
      borderInlineStartColor: 'CanvasText',
    },
  },
  ruleBorder8: {
    borderInlineStartWidth: 'calc(var(--hairline) * 8)',
    borderInlineStartStyle: 'solid',
    '@media (forced-colors: active)': {
      borderInlineStartColor: 'CanvasText',
    },
  },
  ruleBorderOutlineTint: {
    borderInlineStartColor: 'color-mix(in oklab, var(--jx-outline) 55%, transparent)',
  },
  // ── the ink roles: label/body consume the rung's own ramp ────────
  titleOutline: {
    color: tokens['--jx-foreground'],
    '@media (forced-colors: active)': { color: 'CanvasText' },
  },
  titleTonal: {
    color: 'var(--jx-tonal)',
    '@media (forced-colors: active)': { color: 'CanvasText' },
  },
  bodyOutline: {
    color: tokens['--jx-muted-foreground'],
    '@media (forced-colors: active)': { color: 'CanvasText' },
  },
  bodyTonal: {
    color: 'var(--jx-tonal)',
    '@media (forced-colors: active)': { color: 'CanvasText' },
  },
  // ── the label chrome row (alert title-row form) ──────────────────
  labelRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens['--jx-space-8'],
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--jx-text-base)',
    letterSpacing: tokens['--jx-track-wide'],
    textTransform: 'uppercase',
  },
  iconSpan: { display: 'inline-flex' },
  // ── the cite footer (chrome ink, both rungs) ─────────────────────
  citeRow: {
    fontSize: 'var(--jx-text-base)',
    color: tokens['--jx-muted-foreground'],
  },
  citeItalic: { fontStyle: 'italic' },
});
