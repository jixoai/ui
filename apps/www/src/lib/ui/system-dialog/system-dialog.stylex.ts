// system-dialog.stylex.ts — the system-dialog family's atom table
// (tailwindless-site Wave 1b batch B, 2026-09-17).
//
// Source of record: the family's utility strings as the popover-engine
// rebuild (2026-09-01) and the carved action band (2026-09-09) spelled
// them: the anchored panel's platform-element reset + popover ink +
// viewport measure, the body band's stack rhythm, the strip's bleed
// arithmetic (mt + the negative margins that cancel the body padding so
// the Separator rim spans the full surface), the alertdialog's
// name/description voices, and the primary-pair injection the host
// flips over the fill rung's destructive default.
//
// Law mapping (the tier-2 value rule): theme-able slots ride tokens or
// kernel-channel var()s ONLY — spacing steps (10/20/18/8px = the space
// ladder), the 15px body-lg text + 0.08em wide tracking on the title,
// 13px --jx-text-base on the description (the ruler's T_base, a kernel
// channel the typed map never wraps), and the 1.6 leading has NO sheet
// step yet and rides the promotion seam var(--leading-16, 1.6)
// (reported; the orchestrator promotes steps serially). Geometry (the
// padding reset, the min(24rem, …) viewport measure, flex layout) is
// structural. The platform element itself still paints nothing —
// .jx-surface owns isolation/translate, .jx-surface-body owns fill +
// border (the unlayered theme laws; no atom shares a property with
// them). The strip's flex-split + concentric-corner laws stay in
// system-dialog.css keyed on the data-jx-sysdlg hooks.
//
// Mirror law: this file is byte-identical in registry/files/ui/
// system-dialog/ and apps/www/src/lib/ui/system-dialog/ (cmp); the
// tokens import '../../tokens.stylex' resolves in BOTH trees.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const sysdlgStyles = stylex.create({
  // ── the platform element: reset + ink + the anchored measure ──
  panel: {
    padding: 0,
    width: 'min(24rem, calc(100vw - 2rem))',
    color: tokens['--jx-popover-foreground'],
    borderRadius: tokens['--jx-radius'],
  },
  // ── the body band: the stack rhythm the strip's bleed cancels ──
  body: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--space-10)',
    paddingInline: 'var(--space-20)',
    paddingBlock: 'var(--space-18)',
  },
  // ── the carved strip's bleed arithmetic: gap(10px) + mt(8px) = the
  //    body's 18px breathing room above the rim; -mx/-mb cancel the
  //    body padding so the rim spans the full surface ──
  actions: {
    marginTop: 'var(--space-8)',
    marginInline: 'calc(-1 * var(--space-20))',
    marginBottom: 'calc(-1 * var(--space-18))',
  },
  // the SPLIT member: ONE full-width group (display:flex rides the
  // inline style — the group's own grid yields through the cascade)
  actionsFill: { width: '100%' },
  // ── the alertdialog's required name: the eyebrow voice ──
  title: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--text-body-lg)',
    letterSpacing: 'var(--track-wide)',
    textTransform: 'uppercase',
    color: tokens['--jx-foreground'],
  },
  // ── the required body line: the 13px reading voice ──
  description: {
    fontSize: 'var(--jx-text-base)',
    lineHeight: 'var(--leading-16, 1.6)',
    color: tokens['--jx-muted-foreground'],
  },
  // ── the primary-pair injection (the host's confirm-tone flip over
  //    the fill rung's destructive default — the same custom properties
  //    the arbitrary utility used to carry) ──
  primaryPair: {
    '--jx-fill': 'var(--primary)',
    '--jx-fill-ink': 'var(--primary-foreground)',
  },
});
