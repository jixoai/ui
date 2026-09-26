// code-card.stylex.ts — the code-card family's atom table
// (tailwindless one-shot Wave 1 batch 0, 2026-09-17).
//
// The tailwindless re-authoring of the tw4 utility payload (the
// separator family's law): card/head/foot statics + the fill/vscroll
// branches became static longhand atoms; the --readonly-code-* /
// --tok-* seams stay PLAIN var() strings (the css sheet's own
// scoped-token contract, code-card.css).
//
// Value notes (receipted):
//   - text-[11px] maps to the --text-label step (0.6875rem = 11px);
//     tracking-[0.08em] to --track-wide; gap-3/px-3/ps-3 (12px) to
//     --space-12; pe-2 (8px) to --space-8;
//   - py-[0.32rem] (5.12px) and pt/pb-[0.3rem] (4.8px) have NO steps
//     — the calc(var(--jx-unit) * 1.28 / 1.2) equations keep the
//     exact tuned values on the ruler's physics, reported as MISSING
//     steps for serial promotion;
//   - tracking-[0.14em] derives from the wide step (× 1.75),
//     reported as MISSING (--track-lang);
//   - min-h-[2.1rem] is structural band geometry (lawful literal).
//
// Lane-2 residue (code-card.css): the --tok-*/--readonly-code-*
// token wiring, the pre scrollport law, the edge veils (mask
// geometry), the focus rings + reduced-motion kill, and the copy
// button's copied-state tonal override (an !important rule — the
// former !bg/!text utilities, same semantics).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const codeCardStyles = stylex.create({
  // ── the card ─────────────────────────────────────────────────────
  card: {
    margin: 0,
    minWidth: 0,
    backgroundColor: 'var(--readonly-code-bg)',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: 'var(--readonly-code-border)',
  },
  cardFill: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  // ── the head band ────────────────────────────────────────────────
  head: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens['--jx-space-12'],
    minWidth: 0,
    paddingInline: tokens['--jx-space-12'],
    paddingBlock: 'calc(var(--jx-unit) * 1.28)',
    fontSize: tokens['--jx-text-label'],
    letterSpacing: tokens['--jx-track-wide'],
    backgroundColor: 'var(--readonly-code-meta-bg)',
    borderBottomWidth: tokens['--jx-hairline'],
    borderBottomStyle: 'solid',
    borderBottomColor: 'var(--readonly-code-border)',
    color: 'var(--readonly-code-meta-fg)',
  },
  file: {
    fontFamily: tokens['--jx-font-nav'],
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  side: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: 'auto',
    minWidth: 0,
  },
  lang: {
    letterSpacing: 'calc(var(--track-wide) * 1.75)',
    opacity: 0.75,
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  // ── the veil host (never scrolls itself) ──────────────────────────
  scrollWrap: {
    position: 'relative',
    minWidth: 0,
  },
  scrollWrapFill: {
    display: 'flex',
    flex: '1',
    minHeight: 0,
    flexDirection: 'column',
  },
  // ── the pre scrollport branches ─────────────────────────────────
  preMax: {
    overflowY: 'auto',
  },
  preFill: {
    flex: '1',
    minHeight: 0,
    overflowY: 'auto',
  },
  // ── the foot band ────────────────────────────────────────────────
  foot: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens['--jx-space-12'],
    minHeight: '2.1rem',
    paddingTop: 'calc(var(--jx-unit) * 1.2)',
    paddingInlineEnd: tokens['--jx-space-8'],
    paddingBottom: 'calc(var(--jx-unit) * 1.2)',
    paddingInlineStart: tokens['--jx-space-12'],
    borderTopWidth: tokens['--jx-hairline'],
    borderTopStyle: 'solid',
    borderTopColor: 'var(--readonly-code-border)',
  },
  footSide: {
    display: 'flex',
    alignItems: 'center',
    minWidth: 0,
  },
  iconWrap: { display: 'inline-flex' },
});
