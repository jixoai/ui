// pattern-pricing.stylex.ts — the pattern-pricing family's atom table
// (tailwindless one-shot Wave 1b batch A, 2026-09-17).
//
// Source of record: the utility strings the old markup authored (tw4,
// 2026-08-30): the eyebrow's label voice (nav font, 11px, uppercase,
// the 0.24em --track-label step, primary-text ink), the tiers grid
// (auto-fit columns over 17rem), the tier card (hairline frame, card
// ground, the site radius), and the recommended tier's primary frame.
//
// Law mapping (the tier-2 value rule): the eyebrow's 11px/0.24em ride
// the promoted --text-label/--track-label steps; the tier note's 11px/
// 0.08em ride --text-label/--track-wide; every measure rides space
// steps; the 17rem floor is grid-template geometry (structural). The
// recommended-column paint that reaches consumer-authored table cells
// stays lane-2 in pattern-pricing.css (.jx-pattern-pricing hook).
//
// Mirror law: this file is byte-identical in registry/files/ui/
// pattern-pricing/ and apps/www/src/lib/ui/pattern-pricing/ (cmp).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const patternPricingStyles = stylex.create({
  // the section root (the css law rides the .jx-pattern-pricing hook)
  root: { width: '100%' },
  // the eyebrow: the label voice in primary-text ink
  eyebrow: {
    margin: 0,
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-label'],
    color: tokens['--jx-primary-text'],
  },
  // the table band under the eyebrow
  tableBand: { marginTop: tokens['--jx-space-16'] },
  // the tiers grid: auto-fit columns over a 17rem floor
  tiers: {
    marginTop: tokens['--jx-space-24'],
    display: 'grid',
    gap: tokens['--jx-space-16'],
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 17rem), 1fr))',
  },
  // the tier card
  tier: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens['--jx-space-12'],
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    backgroundColor: tokens['--jx-card'],
    padding: tokens['--jx-space-12'],
    borderRadius: tokens['--jx-radius'],
  },
  tierRecommended: { borderColor: tokens['--jx-primary'] },
  tierStandard: { borderColor: tokens['--jx-border'] },
  // the tier head: badge + note on a wrapping row
  tierHead: {
    display: 'flex',
    minWidth: 0,
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: tokens['--jx-space-8'],
  },
  tierNote: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label'],
    letterSpacing: tokens['--jx-track-wide'],
    color: tokens['--jx-muted-foreground'],
  },
  // the icon spans inside the copy button's lanes
  inlineIcon: { display: 'inline-flex' },
  // the CodeCard's min-width passthrough
  minZero: { minWidth: 0 },
});
