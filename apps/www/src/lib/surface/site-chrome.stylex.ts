// site-chrome.stylex.ts — the site chrome's shared atom table
// (tailwindless one-shot Wave 2 batch LIBS, 2026-09-16).
//
// The WWW-ONLY surface module for the docs site's scattered lib
// files — the chrome基建 that is neither a component family (lib/ui)
// nor a blueprint scene nor a route: icon-table, overview-card,
// print-controls, hue-popover's layout utilities, docs-install,
// docs-see-also, copy-icon-button, copy-command, code-block, the
// five area-probe fixtures, and play-timing. Per the Wave-2 ruling
// each consuming FILE owns a member prefix (it/oc/pc/hp/di/sa/cib/
// cc/cb/fb/dd/mb/po/tp/pt) — atoms never cross files, so a file's
// migration never disturbs a neighbor's set. This module exports the
// create result ONLY (never a joiner — the cx lives inside each
// consuming component, the separator serialize law).
//
// Value law (tier-2): theme-able slots ride the typed tokens or the
// density kernel channels as PLAIN var() strings (--jx-stack/
// --jx-inset/--jx-text/--jx-text-secondary/--jx-hit/--jx-icon/
// --jx-gap — the props-table/props-table.stylex.ts precedent);
// structural constants (position geometry, probe viewport literals,
// z-index, opacity) are lawful literals. The oddball voices with NO
// sheet step ride exact-value promotion seams (reported to the
// orchestrator; the sheet's own header rules 16.8px/19.52px hero
// oddballs "css-exact, un-promoted" — the seams below follow that
// ruling at atom scope):
//   - 11.5px print status voice  → var(--text-print, 0.71875rem)
//   - amber-600 diag code ink    → var(--print-diag-code, oklch(…))
//   - the 2px icon-preview bevel → var(--radius-2, 2px)
//   - the 16.8/19.52px card-title pair → var(--text-title, 1.05rem)
//     / var(--text-title-lg, 1.22rem) (sm: seam at 40rem, the TW
//     breakpoint parity law)
//   - the 24px probe panel leading → calc(var(--jx-unit) * 6) (the
//     hero-summary equation form — TW leading-6's 1.5rem exactly)
//
// Hover/active/motion seams are NATIVE pseudos/media inside the
// atoms (the chip/link/alert Wave-1 law); breakpoints keep the
// ORIGINAL thresholds (sm = 40rem). No lane-2 css was needed by this
// batch — every seam is expressible at atom scope.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../tokens.stylex';

export const siteChrome = stylex.create({
  // ═══ icon-table (apps/www/src/lib/icon-table — the icons-docs
  // vocabulary reference; props-table's twin shape) ═══════════════
  itScroller: { width: '100%', overflowX: 'auto' },
  itTable: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  itHeadRow: {
    borderBottomWidth: 'var(--hairline)',
    borderBottomStyle: 'solid',
    borderColor: tokens['--jx-border'],
  },
  itRow: {
    borderBottomWidth: 'var(--hairline)',
    borderBottomStyle: 'solid',
    borderColor: 'color-mix(in oklab, var(--border) 50%, transparent)',
  },
  itHeadCell: {
    fontFamily: tokens['--jx-font-nav'],
    paddingBlock: 'var(--jx-stack)',
    paddingInline: 'var(--jx-inset)',
    fontSize: 'var(--jx-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-14'],
  },
  itCell: { paddingBlock: 'var(--jx-stack)', paddingInline: 'var(--jx-inset)' },
  // the live glyph preview: a 20px block painting the vocabulary face
  // through the inline style contract (data-jx-icon-preview)
  itPreview: {
    display: 'block',
    width: '1.25rem',
    height: '1.25rem',
    borderRadius: 'var(--radius-2, 2px)',
    backgroundClip: 'border-box',
  },
  itSlotCell: {
    paddingBlock: 'var(--jx-stack)',
    paddingInline: 'var(--jx-inset)',
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'var(--jx-text)',
    whiteSpace: 'nowrap',
  },
  itConsumerCell: {
    paddingBlock: 'var(--jx-stack)',
    paddingInline: 'var(--jx-inset)',
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'var(--jx-text-secondary)',
    color: tokens['--jx-muted-foreground'],
  },
  itTechniqueCell: {
    paddingBlock: 'var(--jx-stack)',
    paddingInline: 'var(--jx-inset)',
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'var(--jx-text-secondary)',
    color: tokens['--jx-muted-foreground'],
    whiteSpace: 'nowrap',
  },
  itConceptCell: {
    paddingBlock: 'var(--jx-stack)',
    paddingInline: 'var(--jx-inset)',
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'var(--jx-text)',
  },

  // ═══ overview-card (the catalog card) ═══════════════════════════
  // the card face: hover warms the border + grows the shadow only
  // (the press law); active presses 1px into the page; reduced
  // motion kills the transition. sm seams at 40rem (TW parity).
  ocCard: {
    position: 'relative',
    display: 'grid',
    gridTemplateRows: 'subgrid',
    gridRow: 'span 2 / span 2',
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
    boxShadow: tokens['--jx-shadow-xs'],
    transitionProperty: 'transform, box-shadow, border-color',
    transitionDuration: tokens['--jx-motion-150'],
    ':hover': {
      borderColor: tokens['--jx-primary'],
      boxShadow: tokens['--jx-shadow-sm'],
    },
    ':active': {
      translate: '1px 1px',
      boxShadow: 'none',
    },
    '@media (prefers-reduced-motion: reduce)': {
      transitionProperty: 'none',
    },
  },
  ocHeader: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens['--jx-space-12'],
    borderBottomWidth: 'var(--hairline)',
    borderBottomStyle: 'solid',
    borderColor: tokens['--jx-border'],
    paddingInline: tokens['--jx-space-16'],
    paddingBlock: tokens['--jx-space-12'],
    '@media (min-width: 40rem)': {
      paddingInline: tokens['--jx-space-20'],
      paddingBlock: tokens['--jx-space-16'],
    },
  },
  ocEyebrow: {
    color: tokens['--jx-primary'],
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-label'],
  },
  ocTitle: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--text-title, 1.05rem)',
    lineHeight: tokens['--jx-leading-tight'],
    letterSpacing: tokens['--jx-track-tight'],
    textWrap: 'balance',
    '@media (min-width: 40rem)': {
      fontSize: 'var(--text-title-lg, 1.22rem)',
    },
  },
  // the access-tree summary (sr-only, the file-input recipe)
  ocSummary: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: 'calc(var(--jx-unit) * -0.25)',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  },
  // the top-corner copy seat; z-2 keeps it above the stretched link
  ocCopySlot: {
    position: 'absolute',
    top: tokens['--jx-space-10'],
    right: tokens['--jx-space-10'],
    zIndex: 2,
    pointerEvents: 'none',
    '@media (min-width: 40rem)': {
      top: tokens['--jx-space-12'],
      right: tokens['--jx-space-12'],
    },
  },
  ocBody: {
    paddingInline: tokens['--jx-space-16'],
    paddingBlock: tokens['--jx-space-16'],
    '@media (min-width: 40rem)': {
      paddingInline: tokens['--jx-space-20'],
      paddingBlock: tokens['--jx-space-20'],
    },
  },
  // the not-yet-generated blueprint hatch (the diagonal stripes ride
  // the inline style verbatim — geometry, not chrome)
  ocHatch: {
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: 'color-mix(in oklab, var(--border) 60%, transparent)',
  },
  ocBlueprint: {
    height: 'auto',
    width: '100%',
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: 'color-mix(in oklab, var(--border) 60%, transparent)',
  },

  // ═══ print-controls (the print layer's UI exits — utilities only;
  // the print-pipeline laws (@page/paged.js) live elsewhere, untouched)
  // ════════════════════════════════════════════════════════════════
  pcBar: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: tokens['--jx-space-8'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'var(--text-print, 0.71875rem)',
    color: tokens['--jx-muted-foreground'],
  },
  pcLabel: { fontWeight: tokens['--jx-weight-semibold'], color: tokens['--jx-foreground'] },
  // the ghost-press pose (registry press-button ghost law): all
  // three shadow channels none — the jx-press hook class carries the
  // physics; the atoms carry the box + the custom-property stamps
  pcSim: {
    cursor: 'pointer',
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-background'],
    paddingInline: tokens['--jx-space-10'],
    paddingBlock: tokens['--jx-space-2'],
    color: tokens['--jx-foreground'],
    '--jx-press-shadow': 'none',
    '--jx-press-shadow-hover': 'none',
    '--jx-press-shadow-active': 'none',
  },
  pcDirect: {
    cursor: 'pointer',
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-primary'],
    paddingInline: tokens['--jx-space-10'],
    paddingBlock: tokens['--jx-space-2'],
    color: tokens['--jx-primary'],
    '--jx-press-shadow': 'none',
    '--jx-press-shadow-hover': 'none',
    '--jx-press-shadow-active': 'none',
  },
  pcStatus: { opacity: 0.8 },
  pcMedium: { opacity: 0.6 },
  pcDiagList: {
    marginTop: tokens['--jx-space-4'],
    display: 'flex',
    flexDirection: 'column',
    gap: tokens['--jx-space-2'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-label'],
  },
  // amber-600 exact (no sheet step — the seam carries the literal)
  pcDiagCode: { color: 'var(--print-diag-code, oklch(0.666 0.179 58.318))' },
  pcDiagOwner: { opacity: 0.7 },
  pcDiagMessage: { opacity: 0.5 },

  // ═══ hue-popover (layout utilities only — the hue slider/trigger
  // laws stay in the component's scoped <style>, untouched) ════════
  hpHit: { minHeight: 'var(--jx-hit)', minWidth: 'var(--jx-hit)' },
  hpIcon: { height: 'var(--jx-icon)', width: 'var(--jx-icon)' },
  hpStack: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--jx-gap)',
    padding: 'var(--jx-inset)',
  },
  hpSection: { display: 'flex', flexDirection: 'column', gap: tokens['--jx-space-8'] },
  hpLabelRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  hpCycleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens['--jx-space-12'],
  },
  hpGlyph: { height: '0.75rem', width: '0.75rem' },

  // ═══ docs-install (the skeleton's Install section) ══════════════
  diRoot: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens['--jx-space-12'],
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: 'color-mix(in oklab, var(--card) 40%, transparent)',
    padding: tokens['--jx-space-16'],
    '@media (min-width: 40rem)': {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: tokens['--jx-space-20'],
    },
  },
  diLeft: { display: 'flex', minWidth: 0, flexDirection: 'column', gap: tokens['--jx-space-4'] },
  diEyebrow: {
    color: tokens['--jx-primary'],
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-label'],
  },
  // leading-5 (20px on 12.5px) = the 1.6 ratio step exactly
  diBody: {
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-small'],
    lineHeight: tokens['--jx-leading-16'],
  },
  diCode: { color: tokens['--jx-accent'], fontFamily: tokens['--jx-font-mono'] },
  diCodeWrap: { overflowWrap: 'break-all' },
  diActions: {
    display: 'flex',
    flexShrink: 0,
    alignItems: 'center',
    gap: tokens['--jx-space-8'],
  },
  diAuto: { pointerEvents: 'auto' },

  // ═══ docs-see-also (the reading-chain links) ════════════════════
  saTitle: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--text-title, 1.05rem)',
    letterSpacing: tokens['--jx-track-tight'],
    lineHeight: tokens['--jx-leading-tight'],
    textWrap: 'balance',
    '@media (min-width: 40rem)': {
      fontSize: 'var(--text-title-lg, 1.22rem)',
    },
  },
  saList: {
    marginTop: tokens['--jx-space-12'],
    display: 'flex',
    flexWrap: 'wrap',
    gap: tokens['--jx-space-8'],
  },
  // transition-colors = the property list only (no duration — the
  // utility shipped without one); hover warms border + ink
  saLink: {
    display: 'inline-flex',
    alignItems: 'baseline',
    gap: tokens['--jx-space-8'],
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: 'color-mix(in oklab, var(--card) 40%, transparent)',
    paddingInline: tokens['--jx-space-12'],
    paddingBlock: tokens['--jx-space-6'],
    fontSize: 'var(--jx-text-base)',
    transitionProperty: 'color, background-color, border-color, text-decoration-color, fill, stroke',
    ':hover': {
      borderColor: tokens['--jx-primary'],
      color: tokens['--jx-primary'],
    },
  },
  saName: { fontFamily: tokens['--jx-font-mono'] },
  saGroup: {
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-label'],
  },
  saEmpty: {
    marginTop: tokens['--jx-space-12'],
    color: tokens['--jx-muted-foreground'],
    fontSize: 'var(--jx-text-base)',
  },

  // ═══ copy-icon-button (the card-corner copy twin) ═══════════════
  // geometry atom (never a bg/ink source) + the three poses (each
  // pose the SOLE bg/border-color/color source — the badge collision
  // law); hover rides each pose natively
  cibBtn: {
    pointerEvents: 'auto',
    display: 'inline-grid',
    width: '1.75rem',
    height: '1.75rem',
    placeItems: 'center',
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
  },
  cibIdle: {
    backgroundColor: tokens['--jx-card'],
    borderColor: tokens['--jx-border'],
    color: 'color-mix(in oklab, var(--foreground) 80%, transparent)',
    ':hover': {
      backgroundColor: tokens['--jx-muted'],
      color: tokens['--jx-foreground'],
    },
  },
  cibCopied: {
    backgroundColor: tokens['--jx-secondary'],
    borderColor: tokens['--jx-border'],
    color: tokens['--jx-secondary-foreground'],
    ':hover': {
      backgroundColor: tokens['--jx-muted'],
      color: tokens['--jx-foreground'],
    },
  },
  cibFailed: {
    backgroundColor: tokens['--jx-card'],
    borderColor: tokens['--jx-destructive'],
    color: tokens['--jx-destructive'],
    ':hover': {
      backgroundColor: tokens['--jx-muted'],
      color: tokens['--jx-foreground'],
    },
  },

  // ═══ copy-command (the label span inside the PressButton) ═══════
  ccLabel: { fontFamily: tokens['--jx-font-mono'], fontSize: tokens['--jx-text-label-lg'] },

  // ═══ code-block (the meta strip in CodeCard's header slot) ══════
  cbPromptRow: { display: 'flex', alignItems: 'center' },
  cbMeta: { fontFamily: tokens['--jx-font-nav'], textTransform: 'uppercase' },

  // ═══ float-button-area-probe (the corner-sweep fixture) ═════════
  // the zero-size marker (read-back guard); the rows are the fixture's
  // own deterministic-width menu items
  fbMarker: { position: 'fixed', left: 0, top: 0, height: 0, width: 0 },
  fbRow: {
    display: 'block',
    width: '100%',
    paddingInline: tokens['--jx-space-12'],
    paddingBlock: tokens['--jx-space-6'],
    textAlign: 'left',
    fontSize: tokens['--jx-text-sm'],
  },

  // ═══ dropdown-area-probe (the placement × anchor matrix fixture) ═
  // fixed-position wrapper poses — viewport-literal geometry (1440×900
  // probe math; structural constants by the probe contract)
  ddFixed: { position: 'fixed' },
  ddMid: { left: '560px', top: '280px' },
  ddLow: { left: '560px', bottom: '48px' },
  ddFar: { left: '1300px', top: '280px' },

  // ═══ menubar-area-probe ═════════════════════════════════════════
  mbFixed: { position: 'fixed' },
  mbTop: { left: '80px', top: '120px' },
  mbLow: { left: '80px', bottom: '48px' },

  // ═══ popover-area-probe (the area-map primary/control fixture) ══
  // the anchor pose rides ruler equations (30U = 120px down, 44U =
  // 176px in) — the probe's viewport literals as calc law
  poRoot: {
    marginTop: 'calc(var(--jx-unit) * 30)',
    width: 'fit-content',
    paddingInlineStart: 'calc(var(--jx-unit) * 44)',
  },
  // leading-6 (24px) via the ruler equation — 13px panel body
  poPanel: {
    width: '16rem',
    fontSize: 'var(--jx-text-base)',
    lineHeight: 'calc(var(--jx-unit) * 6)',
  },

  // ═══ tooltip-area-probe (the collision-arm fixture) ═════════════
  tpFixed: { position: 'fixed' },
  tpMid: { left: '560px', top: '320px' },
  tpLow: { left: '560px', bottom: '64px' },
  tpFar: { left: '1300px', top: '320px' },
  tpTrigger: {
    display: 'inline-block',
    width: '7rem',
    paddingBlock: tokens['--jx-space-8'],
    textAlign: 'center',
    fontSize: 'var(--jx-text-base)',
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
  },

  // ═══ play-timing (the auto|custom switch row) ═══════════════════
  ptRow: { display: 'flex', alignItems: 'center', gap: tokens['--jx-space-8'] },
});
