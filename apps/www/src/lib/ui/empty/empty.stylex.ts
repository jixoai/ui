// empty.stylex.ts — the empty family's atom table
// (tailwindless one-shot Wave 1 batch 0, 2026-09-17).
//
// The tailwindless re-authoring of the tw4 utility payload (the
// separator family's law, applied verbatim): every structural
// utility became a static longhand atom; theme-able values ride the
// typed token layer (jixoai.css "The site voice scale" ⇄
// tokens.stylex.ts) or the ruler's kernel channels as PLAIN var()
// strings (the cycle law: a typed key may never share its sheet
// name — --jx-text/--jx-line/--jx-gap/--jx-stack/--jx-inset are
// consumed unwrapped, the timeline pilot's textBase precedent).
//
// Value notes (receipted):
//   - the figure/art 1px frames ride --jx-hairline (the voice
//     scale's own 1px step — borderWidth literals are tier-2 red);
//   - the title's 0.12em tracking derives from the typed wide step
//     (0.08em × 1.5) — reported as a MISSING step (--track-title)
//     for the orchestrator's serial promotion; calc() from a typed
//     step is the sheet's own ladder physics (space steps are
//     calc(var(--jx-unit) * n) equations);
//   - max-w 36ch is a structural measure (ch-anchored, atom-local
//     geometry — the pilot's maxW24/42 precedent).
//
// Lane-2 residue: none — no pseudo/at-rule/mask geometry survives
// the utility strip (no <fam>.css exists for this family).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const emptyStyles = stylex.create({
  // ── the figure: dashed muted ground, inset×2 air ─────────────────
  figure: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--jx-stack)',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'dashed',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-muted'],
    padding: 'calc(var(--jx-inset) * 2)',
  },
  // ── the terminal illustration slot: card ground, hairline box ──
  art: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--jx-stack)',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
    padding: 'var(--jx-inset)',
    boxShadow: tokens['--jx-shadow-2xs'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'var(--jx-text)',
  },
  term: { color: tokens['--jx-muted-foreground'] },
  zero: { color: tokens['--jx-primary'] },
  // ── the caption stack ────────────────────────────────────────────
  caption: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--jx-stack)',
    textAlign: 'center',
  },
  title: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--jx-text)',
    lineHeight: 'var(--jx-line)',
    letterSpacing: 'calc(var(--track-wide) * 1.5)',
    textTransform: 'uppercase',
    color: tokens['--jx-foreground'],
  },
  desc: {
    maxWidth: '36ch',
    fontSize: 'var(--jx-text)',
    lineHeight: 'var(--jx-line)',
    color: tokens['--jx-muted-foreground'],
  },
  actions: {
    marginBlockStart: 'var(--jx-stack)',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 'var(--jx-gap)',
  },
});
