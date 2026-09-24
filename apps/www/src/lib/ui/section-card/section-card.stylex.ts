// section-card.stylex.ts — the section-card family's atom table
// (tailwindless one-shot Wave 1 batch 1, 2026-09-16).
//
// Source of record: the component's former utility strings re-authored
// as static stylex atoms (the separator law). Values: structural
// constants lawful; theme-able slots ride channels — the density
// kernel lanes as PLAIN var() strings (--jx-stack/--jx-inset/
// --jx-unit/--jx-text/--jx-line), the theme scale through the typed
// tokens layer.
//
// Lane split (the placement law): the MAPPABLE voices are atoms here;
// the two title/summary voices whose sizes/leadings/tracking have NO
// existing step (1.05rem, sm:1.22rem, leading 1.2/1.25, 24px, -0.025em,
// sm:14px) live as REGISTERED data-hook rules in section-card.css with
// their media seams at the ORIGINAL thresholds (40rem/64rem) — pixel
// parity preserved, literals reported as missing steps (see report).
//
// Value-law receipts (tier-2 slots, mapped per the playbook):
//   - border/border-border → borderWidth var(--hairline) + explicit
//     borderStyle solid (no preflight — the separator divergence #2).
//   - tracking-[0.24em] → --jx-track-label (0.24em EXACT).
//   - text-primary-text → var(--primary-text) — sheet channel, not
//     wrapped by the typed map (the cycle law).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const sectionCardStyles = stylex.create({
  // ── the card shell: hairline border, card ground, 2xs lift ──
  card: {
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
    boxShadow: tokens['--jx-shadow-2xs'],
  },

  // ── the header zone: stack+1u rhythm (density adoption 2026-09-03) ──
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--jx-stack) + var(--jx-unit))',
    paddingInline: 'calc(var(--jx-inset) + var(--jx-unit))',
    paddingBlock: 'calc(var(--jx-stack) + var(--jx-unit))',
  },

  // ── the eyebrow: brand ink, secondary−¼u size, label tracking ──
  eyebrow: {
    fontFamily: tokens['--jx-font-nav'],
    color: 'var(--primary-text)',
    fontSize: 'calc(var(--jx-text-secondary) - calc(var(--jx-unit) / 4))',
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-label'],
  },

  // ── the title/summary column: stack+½u ──
  titleBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--jx-stack) + calc(var(--jx-unit) / 2))',
  },

  // ── the two-wing header row (headerAside given — the hero's terminal
  //    seat, Owner walkthrough 2026-09-24): text stack LEFT, aside RIGHT
  //    at the wide tier; stacked on narrow. minmax discipline: the text
  //    wing may shrink (its prose wraps), the aside stays its own width ──
  headerRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--jx-stack) + var(--jx-unit))',
    '@media (min-width: 48rem)': {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 'calc(var(--jx-inset) * 3)',
    },
  },
  headerText: { display: 'flex', flexDirection: 'column', gap: 'calc(var(--jx-stack) + var(--jx-unit))', minWidth: 0, flex: '1 1 0%' },
  headerAsideCell: { flex: 'none', width: 'min(100%, 24rem)' },

  // ── the body zone: inset+1u / stack+2u (density adoption) ──
  body: {
    paddingInline: 'calc(var(--jx-inset) + var(--jx-unit))',
    paddingBlock: 'calc(var(--jx-stack) + calc(var(--jx-unit) * 2))',
  },
});
