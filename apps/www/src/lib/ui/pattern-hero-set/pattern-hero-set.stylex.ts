// pattern-hero-set.stylex.ts — the pattern-hero family's atom table
// (tailwindless one-shot Wave 1 batch 0, 2026-09-17).
//
// The tailwindless re-authoring of the tw4 utility payload (the
// separator family's law): both heroes' shells, eyebrows, leads,
// CTA rows and the marquee strip became static longhand atoms. The
// responsive seams (sm:/lg:) ride NESTED media conditions at the
// ORIGINAL Tailwind thresholds (40rem / 64rem — breakpoint parity,
// the pilot's ruling); the marquee machinery stays class-hooked in
// pattern-hero-set.css.
//
// Value notes (receipted):
//   - px-4/px-6/px-8/pb-10/pt-10/mt-4/mt-5/mt-8/mt-10/gap-3/py-3 map
//     to the --space-16/24/32/40/16/20/32/40/12/12 steps; sm:pt-14
//     (56px) and the lead's 24px/28px leadings ride the ruler's calc
//     equations (reported MISSING: --space-14-family / leading rungs);
//   - text-[15px] → calc(var(--jx-unit) * 3.75) (reported MISSING:
//     --text-lead, 15px); sm:text-base is the --jx-text-base channel;
//   - text-[11px] maps to --text-label; text-xs to --text-label-lg;
//     tracking 0.24em rides the --track-label step verbatim; 0.14em
//     derives from the wide step (×1.75);
//   - --primary-text has NO typed member — consumed as the plain
//     var(--primary-text) string (reported for the tokens map);
//   - the clamp() type scales and the 90rem/62ch/30ch measures are
//     structural geometry (lawful literals).
//
// Lane-2 residue (pattern-hero-set.css): the marquee loop machinery
// (pre-existing) + the ascii banner's 1.1 leading, the title's bold
// weight / 1.2 leading / -0.02em tracking (ratio/weight rungs with
// no tokens — reported MISSING), and the thin-scrollbar lanes
// (scrollbar-width on the two overflow lanes).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const heroStyles = stylex.create({
  // ── the shared hero shell (sm/lg media seams at Tailwind's own
  //    thresholds — 40rem / 64rem, breakpoint parity) ───────────────
  shell: {
    marginInline: 'auto',
    width: '100%',
    maxWidth: '90rem',
    paddingInline: tokens['--jx-space-16'],
    paddingBottom: tokens['--jx-space-40'],
    paddingTop: tokens['--jx-space-40'],
    '@media (min-width: 40rem)': {
      paddingInline: tokens['--jx-space-24'],
      paddingTop: 'calc(var(--jx-unit) * 14)',
    },
    '@media (min-width: 64rem)': {
      paddingInline: tokens['--jx-space-32'],
    },
  },
  inner: { minWidth: 0 },
  // ── the tracked eyebrow ──────────────────────────────────────────
  eyebrow: {
    margin: 0,
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-label'],
    color: 'var(--primary-text)',
  },
  // ── the lead paragraph (62ch measure; sm seam re-voices it) ──────
  lead: {
    marginTop: tokens['--jx-space-20'],
    maxWidth: '62ch',
    textWrap: 'pretty',
    fontSize: 'calc(var(--jx-unit) * 3.75)',
    lineHeight: 'calc(var(--jx-unit) * 6)',
    color: tokens['--jx-muted-foreground'],
    '@media (min-width: 40rem)': {
      fontSize: 'var(--jx-text-base)',
      lineHeight: 'calc(var(--jx-unit) * 7)',
    },
  },
  // ── the CTA row ──────────────────────────────────────────────────
  ctaRow: {
    marginTop: tokens['--jx-space-32'],
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens['--jx-space-12'],
  },
  ctaGlyph: { display: 'inline-flex' },
  // ── the ascii banner (mono scale law: clamp + own scroll lane) ──
  asciiArt: {
    marginTop: tokens['--jx-space-16'],
    maxWidth: '100%',
    overflowX: 'auto',
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'clamp(0.5rem, 2.4vw, 1.125rem)',
    letterSpacing: 'normal',
    color: tokens['--jx-foreground'],
  },
  // ── the marquee title (clamp display voice) ─────────────────────
  title: {
    marginTop: tokens['--jx-space-16'],
    maxWidth: '30ch',
    fontSize: 'clamp(2rem, 4.4vw, 3.6rem)',
    textWrap: 'balance',
  },
  // ── the marquee strip ────────────────────────────────────────────
  strip: {
    marginTop: tokens['--jx-space-40'],
    overflowX: 'auto',
    borderTopWidth: tokens['--jx-hairline'],
    borderTopStyle: 'solid',
    borderBottomWidth: tokens['--jx-hairline'],
    borderBottomStyle: 'solid',
    borderColor: tokens['--jx-border'],
    paddingBlock: tokens['--jx-space-12'],
    maskImage:
      'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
    WebkitMaskImage:
      'linear-gradient(to right, transparent, black 6%, black 94%, transparent)',
  },
  // ── the marquee rows (readable + aria-hidden duplicate) ─────────
  row: {
    margin: 0,
    listStyleType: 'none',
    padding: 0,
  },
  token: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--jx-hero-marquee-gap)',
  },
  tokenLabel: {
    whiteSpace: 'nowrap',
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label-lg'],
    letterSpacing: 'calc(var(--track-wide) * 1.75)',
    textTransform: 'uppercase',
    color: tokens['--jx-muted-foreground'],
  },
  dotPrimaryText: {
    fontSize: tokens['--jx-text-label-lg'],
    color: 'var(--primary-text)',
  },
  dotPrimary: {
    fontSize: tokens['--jx-text-label-lg'],
    color: tokens['--jx-primary'],
  },
});
