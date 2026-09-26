// pattern-faq.stylex.ts — the man-page FAQ pattern's atom table
// (tailwindless one-shot W1, 2026-09-17).
//
// Source of record: the markup utilities the pattern carried since
// 2026-08-30 (openspec 2026-08-30-terminal-patterns). The man LABEL
// voice (NAME / SEE ALSO) is NOT here — font-bold(700) has no weight
// token, so the whole label composite rides pattern-faq.css's
// :where(.jx-man-label) rule (the tl-eyebrow precedent: a recurring
// composite is a registered semantic rule, never atom fragments).
//
// Value receipts (missing steps reported for serial promotion):
//   - text-sm (14px) has no step → calc(var(--jx-text-base) +
//     var(--jx-unit)), the ruler equation (13px + the 4px unit);
//   - leading-5 (20px) IS the density default line rung exactly
//     (var(--jx-density-line-default) = 13px × 20/13);
//   - 13px rides the fixed --jx-text-base kernel channel (chrome
//     voice — the pattern is page framing, not density content);
//   - tracking 0.06em/0.14em have no steps → equations over the
//     --jx-track-wide token.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const patternFaqStyles = stylex.create({
  // ── the man page's shell ──
  shell: {
    marginInline: 'auto',
    width: '100%',
    maxWidth: '52rem',
  },
  // ── the head block ──
  header: {
    borderBottomWidth: tokens['--jx-hairline'],
    borderBottomStyle: 'solid',
    borderBottomColor: tokens['--jx-border'],
    paddingBlockEnd: tokens['--jx-space-16'],
  },
  commandRow: {
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: tokens['--jx-space-8'],
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'calc(var(--jx-text-base) + var(--jx-unit))',
    letterSpacing: 'calc(var(--jx-track-wide) * 0.75)',
  },
  commandIcon: { display: 'inline-flex', color: tokens['--jx-muted-foreground'] },
  commandName: { color: tokens['--jx-foreground'] },
  commandSection: { color: tokens['--jx-muted-foreground'] },
  nameRow: { margin: 0, marginTop: tokens['--jx-space-12'] },
  summary: {
    minWidth: 0,
    fontSize: 'var(--jx-text-base)',
    lineHeight: 'var(--jx-density-line-default)',
    color: tokens['--jx-muted-foreground'],
  },
  // ── the questions block ──
  questions: { marginTop: tokens['--jx-space-20'] },
  // ── the SEE ALSO footer ──
  footer: {
    marginTop: tokens['--jx-space-20'],
    borderTopWidth: tokens['--jx-hairline'],
    borderTopStyle: 'solid',
    borderTopColor: tokens['--jx-border'],
    paddingBlockStart: tokens['--jx-space-16'],
  },
  seeAlsoRow: { margin: 0 },
  seeAlsoContent: {
    display: 'flex',
    minWidth: 0,
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: tokens['--jx-space-16'],
    rowGap: tokens['--jx-space-4'],
    fontSize: 'var(--jx-text-base)',
    lineHeight: 'var(--jx-density-line-default)',
  },
  seeAlsoDefault: { color: tokens['--jx-muted-foreground'] },
});
