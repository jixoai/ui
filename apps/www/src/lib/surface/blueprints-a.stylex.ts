// blueprints-a.stylex.ts — the blueprint scenes' shared atom table,
// batch BP-A (tailwindless one-shot Wave 2, 2026-09-16).
//
// SITE-LANE module (apps/www/src/lib/surface/** — under the stylex
// transform root; blueprints are a site-only prefix, NO registry
// mirror exists or is owed). BP-A owns the FIRST HALF of
// src/lib/blueprints/scenes/ by filename lexicographic order —
// accordion.svelte .. llms-txt.svelte (69 files, 1,964 utility
// identities at the pinned baseline); the sibling batch BP-A2 owns
// the tail half in blueprints-b.stylex.ts. Every scene's former
// utility strings re-author as STATIC stylex atoms under that
// scene's own member prefix (accordion*…llmsTxt*) — one scene, one
// prefix, zero member collisions; near-identical stage wrappers are
// deliberately NOT deduped across prefixes (edits stay scene-local).
// EXCEPTION (the Layout-family adoption, 2026-09-19, R6 slice 1):
// PURE FLOW never lands in this table anymore — a member whose every
// property is display/flexDirection/align/justify/gap/wrap composes
// the Stack family instead (<Stack direction|align|justify|gap|wrap>;
// equal-track grids would compose <Grid cols>). The slice retired 33
// such atoms here (+5 in the BP-B sibling; 53 flow usages across 27
// scenes); the remaining grid members are NON-equal tracks (`1fr auto
// 1fr` chains) — structural geometry Grid's equal-track law
// deliberately does not own.
//
// Lane split: BP-A's scenes carry ZERO state/media/descendant
// utilities (verified by scan) — no lane-2 sheet is needed; every
// value lands here in lane 1. Scenes join atoms through their own
// component-local cx (the separator serialize law — this module
// exports atoms ONLY, never the joiner).
//
// Value-law receipts (tier-2 slots; the W1/W1b precedents govern):
//   - space steps ride the typed ladder exactly: p-10/p-8/p-6→
//     space-40/32/24, gap-5/6/8/10→space-20/24/32/40, px-4/py-2.5/
//     px-3/py-2/px-2.5/py-1.5/px-2/py-1→space-16/10/12/8/10/6/8/4,
//     gap-1/1.5/2/2.5/3→space-4/6/8/10/12, pt-3/pb-3→12, pt-4→16,
//     pt-0.5/gap-0.5→space-2, mt-1/my-1→4, mt-2→8, mt-3/ml-3/pl-2→12,
//     underline-offset-4→space-4.
//   - ruler equations for the off-ladder steps: p-12→calc(unit*12),
//     gap-7/gap-14→calc(unit*7)/calc(unit*14) (pattern-cta's
//     leading-6 precedent — the --jx-unit ruler owns sub/over-step).
//   - text voice scale: [10px]→--jx-text-micro, [11px]→--jx-text-label,
//     [12px]→--jx-text-label-lg, [12.5px]→--jx-text-small, [13px]→
//     var(--jx-text-base) (the kernel channel; density-stepping is
//     the honest promotion — canvas's 15px ruling), [15px]→
//     --jx-text-body-lg, [16px]→--jx-text-body-xl, text-sm→--jx-text-sm,
//     text-xs→--jx-text-label-lg (both EXACT 14/12px). NEAREST-STEP
//     (reported, none exact): [8.5px]/[9px]/[9.5px]→micro(10px),
//     [11.5px]→label(11px).
//   - fixed leadings ride the ruler EXACT px (pattern-cta's law):
//     leading-5/6/7→calc(unit*5/6/7) (20/24/28px); the named steps'
//     implicit pairings ride with them (text-sm→20px, text-xs→16px).
//   - tracking: widest(0.1em)→--jx-track-10, [0.14em]→track-14,
//     [0.18em]→track-18, [0.2em]→track-20, [0.24em]→--jx-track-label
//     — all EXACT.
//   - weights: bold→--jx-weight-bold, medium→--jx-weight-medium.
//   - borders: `border`/`border-b`/`border-t`→var(--hairline) + solid
//     + the typed role; border-l-2→calc(unit*0.5) (2px exact).
//   - rounded-md was a DEAD utility here (app.css kills --radius-*;
//     the radius law is 0) → atoms that carried it declare
//     borderRadius: 0 explicitly; rounded-none likewise. The one-off
//     schematic radii ride the ruler: [20px]→calc(unit*5),
//     [2px]→calc(unit*0.5).
//   - alpha recipes (bg-muted/30|40|70, border-border/50,
//     border-terminal-foreground/10) → color-mix(in oklab, …) over
//     the raw role vars (the canvas precedent).
//   - the glass scene's white/N and #101014 are SCHEMATIC simulation
//     values (the approved prototype's band, painted over its own
//     dark ground — not theme roles); they stay literals, reported.
//   - one-off diagram measures (w-[11rem], max-w-[520px], h-[190px],
//     w-2/3 fractions…) are atom-local STRUCTURAL geometry — lawful
//     literals; 4px-grid sizes ride the ruler (size-4→calc(unit*4),
//     h-11→calc(unit*11), h-36→calc(unit*36), h-[10px]→calc(unit*2.5)).
//   - inset steps ride the space ladder (left-4/top-4→16, bottom-6→
//     24, bottom-1.5→6, right-2.5→10); the 1px grid runs keep 1px.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../tokens.stylex';

export const bpA = stylex.create({
  // ══ accordion ══════════════════════════════════════════════════
  accordionStage: {
    display: 'flex',
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: tokens['--jx-space-40'],
  },
  accordionBody: {
    fontSize: 'var(--jx-text-sm)',
    lineHeight: 'calc(var(--jx-unit) * 6)',
  },

  // ══ alert ══════════════════════════════════════════════════════
  alertStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },

  // ══ anchor ═════════════════════════════════════════════════════
  anchorStage: {
    display: 'grid',
    height: '100%',
    width: '100%',
    gridTemplateColumns: 'minmax(0, 1fr) 11rem',
    alignItems: 'flex-start',
    gap: tokens['--jx-space-32'],
    padding: tokens['--jx-space-40'],
  },
  anchorColumn: {
    minWidth: 0,
  },
  anchorHeading: {
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'var(--jx-text-sm)',
    lineHeight: 'calc(var(--jx-unit) * 5)',
  },
  anchorHeadingGap: { marginTop: tokens['--jx-space-8'] },
  anchorBody: {
    color: tokens['--jx-muted-foreground'],
    fontSize: 'var(--jx-text-sm)',
    lineHeight: 'calc(var(--jx-unit) * 6)',
  },
  anchorAside: { alignSelf: 'flex-start', paddingTop: tokens['--jx-space-2'] },

  // ══ avatar ═════════════════════════════════════════════════════
  avatarStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  avatarRow: { display: 'flex', alignItems: 'center', gap: tokens['--jx-space-20'] },

  // ══ badge-indicator ════════════════════════════════════════════
  badgeIndicatorStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  badgeIndicatorNote: {
    color: tokens['--jx-muted-foreground'],
    fontSize: 'var(--jx-text-sm)',
    lineHeight: 'calc(var(--jx-unit) * 5)',
  },

  // ══ badge ══════════════════════════════════════════════════════
  badgeStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },

  // ══ blockquote ═════════════════════════════════════════════════
  blockquoteStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  blockquoteColumn: {
    width: '100%',
    maxWidth: '520px',
  },
  blockquoteRow: { display: 'flex', flexWrap: 'wrap', gap: tokens['--jx-space-8'] },

  // ══ breadcrumb ═════════════════════════════════════════════════
  breadcrumbStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },

  // ══ button-group ═══════════════════════════════════════════════
  buttonGroupStage: {
    display: 'flex',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'calc(var(--jx-unit) * 14)',
    padding: tokens['--jx-space-40'],
  },

  // ══ card-grid ══════════════════════════════════════════════════
  cardGridStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  cardGridGrid: { width: '100%' },
  cardGridBody: {
    fontSize: tokens['--jx-text-small'],
    lineHeight: 'calc(var(--jx-unit) * 5)',
  },
  cardGridList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens['--jx-space-6'],
    fontSize: tokens['--jx-text-small'],
    lineHeight: 'calc(var(--jx-unit) * 5)',
  },

  // ══ card ═══════════════════════════════════════════════════════
  cardStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  cardFrame: { width: '100%', maxWidth: '340px' },
  cardMeta: {
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-label'],
    color: tokens['--jx-muted-foreground'],
  },
  cardList: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens['--jx-space-6'],
    fontSize: tokens['--jx-text-small'],
    lineHeight: 'calc(var(--jx-unit) * 5)',
  },

  // ══ carousel ═══════════════════════════════════════════════════
  carouselStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  carouselSlide: {
    display: 'flex',
    height: 'calc(var(--jx-unit) * 36)',
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
    padding: tokens['--jx-space-16'],
  },
  carouselIndex: {
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-label-lg'],
    lineHeight: 'calc(var(--jx-unit) * 4)',
    color: tokens['--jx-muted-foreground'],
  },
  carouselCaption: {
    fontSize: 'var(--jx-text-sm)',
    lineHeight: 'calc(var(--jx-unit) * 5)',
    fontWeight: tokens['--jx-weight-medium'],
  },

  // ══ cascader ═══════════════════════════════════════════════════
  cascaderStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },

  // ══ chart ══════════════════════════════════════════════════════
  chartStage: {
    display: 'flex',
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 'calc(var(--jx-unit) * 7)',
    padding: tokens['--jx-space-40'],
    fontFamily: tokens['--jx-font-mono'],
  },
  chartRow: { display: 'flex', alignItems: 'center', gap: tokens['--jx-space-40'] },
  chartColumn: {
    minWidth: 0,
  },
  chartLabel: {
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-label-lg'],
    lineHeight: 'calc(var(--jx-unit) * 4)',
  },

  // ══ checkbox ═══════════════════════════════════════════════════
  checkboxStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  checkboxColumn: {
    width: '100%',
    maxWidth: '380px',
  },

  // ══ chip ═══════════════════════════════════════════════════════
  chipStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },

  // ══ code-card ══════════════════════════════════════════════════
  codeCardStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  codeCardCard: { width: '100%', maxWidth: '520px' },

  // ══ color-picker ═══════════════════════════════════════════════
  colorPickerStage: {
    display: 'flex',
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: tokens['--jx-space-40'],
  },
  colorPickerFrame: { width: '100%', maxWidth: '300px' },

  // ══ color-utils ════════════════════════════════════════════════
  colorUtilsStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  colorUtilsPanel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: tokens['--jx-space-16'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'var(--jx-text-base)',
  },
  colorUtilsComment: { color: tokens['--jx-muted-foreground'] },
  colorUtilsRow: { display: 'flex', alignItems: 'center', gap: tokens['--jx-space-12'] },
  colorUtilsNode: {
    borderRadius: 0,
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-muted'],
    paddingInline: tokens['--jx-space-8'],
    paddingBlock: tokens['--jx-space-4'],
    boxShadow: tokens['--jx-shadow-2xs'],
  },
  colorUtilsChip: {
    borderRadius: 0,
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    paddingInline: tokens['--jx-space-8'],
    paddingBlock: tokens['--jx-space-4'],
  },
  colorUtilsArrow: { color: tokens['--jx-primary'] },
  colorUtilsNote: {
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-label'],
  },
  colorUtilsTail: { marginTop: tokens['--jx-space-8'] },

  // ══ combobox ═══════════════════════════════════════════════════
  comboboxStage: {
    display: 'flex',
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    padding: tokens['--jx-space-40'],
  },
  comboboxFrame: { width: '100%', maxWidth: '420px' },

  // ══ command-match ══════════════════════════════════════════════
  commandMatchStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  commandMatchEyebrow: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-micro'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-20'],
    color: tokens['--jx-muted-foreground'],
  },
  commandMatchRow: {
    maxWidth: '22rem',
    borderRadius: 0,
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    paddingInline: tokens['--jx-space-16'],
    paddingBlock: tokens['--jx-space-8'],
  },
  commandMatchVisible: {
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
  },
  commandMatchHidden: {
    borderColor: 'transparent',
    backgroundColor: 'transparent',
    opacity: 0.4,
    textDecoration: 'line-through',
  },
  commandMatchLabel: { fontFamily: tokens['--jx-font-mono'], fontSize: 'var(--jx-text-base)' },

  // ══ command ════════════════════════════════════════════════════
  commandStage: {
    display: 'flex',
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: tokens['--jx-space-16'],
    padding: tokens['--jx-space-40'],
    opacity: 0.7,
  },
  commandSkeletonA: { height: 'calc(var(--jx-unit) * 4)', width: '66.666667%' },
  commandSkeletonB: { height: 'calc(var(--jx-unit) * 3)', width: '50%' },
  commandSkeletonC: { height: 'calc(var(--jx-unit) * 3)', width: '60%' },

  // ══ component-canvas ═══════════════════════════════════════════
  componentCanvasStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-32'],
  },

  // ══ context-plugin ═════════════════════════════════════════════
  contextPluginStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  contextPluginEyebrow: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-micro'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-20'],
    color: tokens['--jx-muted-foreground'],
  },
  contextPluginDefCard: {
    display: 'flex',
    width: '11rem',
    flexDirection: 'column',
    gap: tokens['--jx-space-2'],
    borderRadius: 0,
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    paddingInline: tokens['--jx-space-12'],
    paddingBlock: tokens['--jx-space-8'],
  },
  contextPluginDefMutable: {
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
  },
  contextPluginDefReadOnly: {
    borderStyle: 'dashed',
    borderColor: tokens['--jx-border'],
    backgroundColor: 'transparent',
  },
  contextPluginName: {
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-label-lg'],
  },
  contextPluginNote: {
    fontSize: tokens['--jx-text-micro'],
    color: tokens['--jx-muted-foreground'],
  },
  contextPluginArrowColumn: {
    display: 'flex',
    width: '3rem',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens['--jx-space-4'],
    fontSize: tokens['--jx-text-micro'],
    color: tokens['--jx-muted-foreground'],
  },
  contextPluginArrowGlyph: { fontSize: 'var(--jx-text-base)' },
  contextPluginCard: {
    display: 'flex',
    width: '10.5rem',
    flexDirection: 'column',
    gap: tokens['--jx-space-2'],
    borderRadius: 0,
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
    paddingInline: tokens['--jx-space-12'],
    paddingBlock: tokens['--jx-space-8'],
  },
  contextPluginHookRow: {
    display: 'flex',
    width: '10.5rem',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 0,
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
    paddingInline: tokens['--jx-space-12'],
    paddingBlock: tokens['--jx-space-6'],
  },
  contextPluginFlowArrow: {
    display: 'flex',
    width: '1.25rem',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 'var(--jx-text-base)',
    color: tokens['--jx-muted-foreground'],
  },

  // ══ control-chrome ═════════════════════════════════════════════
  controlChromeStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  controlChromeEyebrow: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-micro'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-20'],
    color: tokens['--jx-muted-foreground'],
  },
  controlChromeRow: {
    display: 'flex',
    maxWidth: '26rem',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 0,
    paddingInline: tokens['--jx-space-16'],
    paddingBlock: tokens['--jx-space-10'],
  },
  controlChromeFrame: {
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
  },
  controlChromeBare: {
    borderWidth: 'var(--hairline)',
    borderStyle: 'dashed',
    borderColor: 'color-mix(in oklab, var(--border) 50%, transparent)',
  },
  controlChromeName: { fontFamily: tokens['--jx-font-mono'], fontSize: 'var(--jx-text-base)' },
  controlChromeNote: {
    fontSize: tokens['--jx-text-label'],
    color: tokens['--jx-muted-foreground'],
  },
  controlChromeFoot: {
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-micro'],
    color: tokens['--jx-muted-foreground'],
  },

  // ══ date-picker ════════════════════════════════════════════════
  datePickerStage: {
    display: 'flex',
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: tokens['--jx-space-20'],
    padding: tokens['--jx-space-40'],
  },
  datePickerMuted: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens['--jx-space-12'],
    opacity: 0.6,
  },
  datePickerSkeletonA: { height: 'calc(var(--jx-unit) * 3)', width: '50%' },
  datePickerSkeletonB: { height: 'calc(var(--jx-unit) * 3)', width: '66.666667%' },
  datePickerFrame: { width: '100%', maxWidth: '280px' },

  // ══ defaults ═══════════════════════════════════════════════════
  defaultsStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  defaultsEyebrow: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-micro'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-20'],
    color: tokens['--jx-muted-foreground'],
  },
  defaultsRow: {
    display: 'flex',
    maxWidth: '22rem',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 0,
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
    paddingInline: tokens['--jx-space-16'],
    paddingBlock: tokens['--jx-space-10'],
  },
  defaultsName: { fontFamily: tokens['--jx-font-mono'], fontSize: 'var(--jx-text-base)' },
  defaultsNote: {
    fontSize: tokens['--jx-text-label'],
    color: tokens['--jx-muted-foreground'],
  },

  // ══ density ════════════════════════════════════════════════════
  densityStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  densityEyebrow: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-micro'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-20'],
    color: tokens['--jx-muted-foreground'],
  },
  densityGroup: { maxWidth: '20rem' },

  // ══ descriptions ═══════════════════════════════════════════════
  descriptionsStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  descriptionsLabel: {
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-label-lg'],
    lineHeight: 'calc(var(--jx-unit) * 4)',
    color: tokens['--jx-muted-foreground'],
  },
  descriptionsFrame: { marginTop: tokens['--jx-space-12'] },

  // ══ dialog ═════════════════════════════════════════════════════
  dialogStage: {
    display: 'flex',
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: tokens['--jx-space-16'],
    padding: tokens['--jx-space-40'],
    opacity: 0.7,
  },
  dialogSkeletonA: { height: 'calc(var(--jx-unit) * 4)', width: '66.666667%' },
  dialogSkeletonB: { height: 'calc(var(--jx-unit) * 3)', width: '50%' },
  dialogSkeletonC: { height: 'calc(var(--jx-unit) * 3)', width: '60%' },
  dialogBody: {
    color: tokens['--jx-muted-foreground'],
    fontSize: 'var(--jx-text-sm)',
    lineHeight: 'calc(var(--jx-unit) * 6)',
  },

  // ══ dropdown-menu ══════════════════════════════════════════════
  dropdownMenuStage: {
    display: 'flex',
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: tokens['--jx-space-20'],
    padding: tokens['--jx-space-40'],
  },
  dropdownMenuMuted: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens['--jx-space-12'],
    opacity: 0.6,
  },
  dropdownMenuSkeletonA: { height: 'calc(var(--jx-unit) * 3)', width: '66.666667%' },
  dropdownMenuSkeletonB: { height: 'calc(var(--jx-unit) * 3)', width: '50%' },
  dropdownMenuDivider: {
    borderTopWidth: 'var(--hairline)',
    borderTopStyle: 'solid',
    borderColor: tokens['--jx-border'],
    marginBlock: tokens['--jx-space-4'],
  },

  // ══ empty ══════════════════════════════════════════════════════
  emptyStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },

  // ══ entity ═════════════════════════════════════════════════════
  entityStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  entityEyebrow: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-micro'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-20'],
    color: tokens['--jx-muted-foreground'],
  },
  entityLabel: {
    display: 'flex',
    width: '13rem',
    flexDirection: 'column',
    gap: tokens['--jx-space-6'],
    fontSize: tokens['--jx-text-label'],
  },
  entityLabelNote: { color: tokens['--jx-muted-foreground'] },
  entityLabelInner: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens['--jx-space-6'],
    fontSize: tokens['--jx-text-label'],
  },
  entityPanel: {
    display: 'flex',
    width: '22rem',
    flexDirection: 'column',
    gap: tokens['--jx-space-12'],
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-popover'],
    padding: tokens['--jx-space-16'],
    color: tokens['--jx-popover-foreground'],
  },

  // ══ figure ═════════════════════════════════════════════════════
  figureStage: {
    height: '100%',
    width: '100%',
    padding: 'calc(var(--jx-unit) * 12)',
  },
  figureEquation: {
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-body-lg'],
  },
  figureNote: {
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'var(--jx-text-base)',
    color: tokens['--jx-muted-foreground'],
  },
  figureBound: {
    fontSize: 'var(--jx-text-base)',
    color: tokens['--jx-muted-foreground'],
  },

  // ══ file-input ═════════════════════════════════════════════════
  fileInputStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  fileInputFrame: { width: '100%', maxWidth: '440px' },

  // ══ float-button ═══════════════════════════════════════════════
  floatButtonStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  floatButtonSkeletonA: { height: 'calc(var(--jx-unit) * 4)', width: '66.666667%' },
  floatButtonSkeletonB: { height: 'calc(var(--jx-unit) * 3)', width: '50%' },
  floatButtonSkeletonC: { height: 'calc(var(--jx-unit) * 3)', width: '60%' },
  floatButtonGlyph: { transform: 'rotate(-90deg)', display: 'inline-flex' },

  // ══ form-field ═════════════════════════════════════════════════
  formFieldStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  formFieldForm: {
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: 'color-mix(in oklab, var(--muted) 30%, transparent)',
    display: 'flex',
    width: '100%',
    maxWidth: '400px',
    flexDirection: 'column',
    gap: tokens['--jx-space-20'],
    padding: tokens['--jx-space-24'],
  },
  formFieldTitle: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-label'],
  },
  formFieldFoot: {
    marginTop: tokens['--jx-space-4'],
  },
  formFieldNote: {
    fontFamily: tokens['--jx-font-nav'],
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-micro'],
  },

  // ══ ghostty-term ═══════════════════════════════════════════════
  ghosttyTermStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  ghosttyTermBody: { minHeight: 0, width: '100%', flex: '1 1 0%' },

  // ══ ghostty-vt ═════════════════════════════════════════════════
  ghosttyVtStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  ghosttyVtPanel: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: tokens['--jx-space-16'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'var(--jx-text-base)',
  },
  ghosttyVtComment: { color: tokens['--jx-muted-foreground'] },
  ghosttyVtHead: {
    borderRadius: 0,
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-muted'],
    paddingInline: tokens['--jx-space-8'],
    paddingBlock: tokens['--jx-space-4'],
    boxShadow: tokens['--jx-shadow-2xs'],
  },
  ghosttyVtArrow: { color: tokens['--jx-primary'] },
  ghosttyVtGap: { marginTop: tokens['--jx-space-8'] },
  ghosttyVtLine: {
    borderLeftWidth: 'calc(var(--jx-unit) * 0.5)',
    borderLeftStyle: 'solid',
    borderColor: tokens['--jx-border'],
    paddingInlineStart: tokens['--jx-space-8'],
  },

  // ══ glass — the schematic band (simulation colors, see header) ═
  glassStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-32'],
  },
  glassBand: {
    width: '520px',
  },
  glassEyebrow: {
    fontFamily: tokens['--jx-font-nav'],
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-micro'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-label'],
  },
  glassField: {
    position: 'relative',
    height: '190px',
    width: '100%',
    overflow: 'hidden',
    backgroundColor: '#101014',
  },
  glassVRun: {
    position: 'absolute',
    top: 0,
    height: '100%',
    width: '1px',
    backgroundColor: 'color-mix(in oklab, #fff 15%, transparent)',
  },
  glassHRun: {
    position: 'absolute',
    left: 0,
    height: '1px',
    width: '100%',
    backgroundColor: 'color-mix(in oklab, #fff 15%, transparent)',
  },
  glassHeadlineBox: {
    position: 'absolute',
    left: tokens['--jx-space-16'],
    top: tokens['--jx-space-16'],
    display: 'flex',
    flexDirection: 'column',
    gap: tokens['--jx-space-4'],
  },
  glassHeadline: {
    fontSize: tokens['--jx-text-body-xl'],
    fontWeight: tokens['--jx-weight-bold'],
    color: 'color-mix(in oklab, #fff 90%, transparent)',
  },
  glassSub: {
    fontSize: tokens['--jx-text-micro'],
    color: 'color-mix(in oklab, #fff 55%, transparent)',
  },
  glassLensRow: {
    position: 'absolute',
    bottom: tokens['--jx-space-24'],
    left: tokens['--jx-space-16'],
    display: 'flex',
    alignItems: 'center',
    gap: tokens['--jx-space-12'],
  },
  glassLens: {
    display: 'flex',
    height: '40px',
    width: '190px',
    alignItems: 'center',
    borderRadius: 'calc(var(--jx-unit) * 5)',
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: 'color-mix(in oklab, #fff 45%, transparent)',
    backgroundColor: 'color-mix(in oklab, #fff 10%, transparent)',
    paddingInline: tokens['--jx-space-12'],
  },
  glassLensLabel: {
    fontSize: tokens['--jx-text-micro'],
    color: 'color-mix(in oklab, #fff 90%, transparent)',
  },
  glassFrost: {
    display: 'flex',
    height: '40px',
    width: '130px',
    alignItems: 'center',
    borderRadius: 'calc(var(--jx-unit) * 5)',
    backgroundColor: 'color-mix(in oklab, #fff 5%, transparent)',
    paddingInline: tokens['--jx-space-12'],
  },
  glassFrostLabel: {
    fontSize: tokens['--jx-text-micro'],
    color: 'color-mix(in oklab, #fff 65%, transparent)',
  },
  glassFormula: {
    color: tokens['--jx-primary'],
    fontFamily: tokens['--jx-font-nav'],
    position: 'absolute',
    bottom: tokens['--jx-space-6'],
    right: tokens['--jx-space-10'],
    fontSize: tokens['--jx-text-micro'],
  },
  glassKnob: {
    color: tokens['--jx-muted-foreground'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-micro'],
  },

  // ══ heading ════════════════════════════════════════════════════
  headingStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  headingColumn: {
    width: '100%',
    maxWidth: '520px',
  },
  headingRow: { display: 'flex', flexWrap: 'wrap', gap: tokens['--jx-space-8'] },

  // ══ hero-section ═══════════════════════════════════════════════
  heroSectionClip: { height: '100%', width: '100%', overflow: 'hidden' },
  heroSectionFrame: { width: '900px' },

  // ══ highlight-detect-default ═══════════════════════════════════
  highlightDetectDefaultStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-32'],
  },
  highlightDetectDefaultPanel: {
    display: 'flex',
    width: '100%',
    maxWidth: '42rem',
    flexDirection: 'column',
    gap: tokens['--jx-space-12'],
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
    padding: tokens['--jx-space-24'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-label-lg'],
    lineHeight: 'calc(var(--jx-unit) * 6)',
  },
  highlightDetectDefaultHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 'var(--hairline)',
    borderBottomStyle: 'solid',
    borderColor: tokens['--jx-border'],
    paddingBlockEnd: tokens['--jx-space-12'],
  },
  highlightDetectDefaultTitle: {
    fontSize: 'var(--jx-text-base)',
    fontWeight: tokens['--jx-weight-bold'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-10'],
    color: tokens['--jx-primary'],
  },
  highlightDetectDefaultSub: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-10'],
    color: tokens['--jx-muted-foreground'],
  },
  highlightDetectDefaultCard: {
    display: 'flex',
    flex: '1 1 0%',
    flexDirection: 'column',
    gap: tokens['--jx-space-4'],
    borderRadius: 0,
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: 'color-mix(in oklab, var(--muted) 40%, transparent)',
    paddingInline: tokens['--jx-space-12'],
    paddingBlock: tokens['--jx-space-8'],
  },
  highlightDetectDefaultCardTitle: {
    fontSize: tokens['--jx-text-label-lg'],
    fontWeight: tokens['--jx-weight-bold'],
  },
  highlightDetectDefaultCardLine: {
    fontSize: tokens['--jx-text-micro'],
    color: tokens['--jx-muted-foreground'],
  },
  highlightDetectDefaultArrow: { color: tokens['--jx-primary'] },
  highlightDetectDefaultSide: {
    flex: '1 1 0%',
  },
  highlightDetectDefaultSideLabel: {
    fontSize: tokens['--jx-text-micro'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-14'],
    color: tokens['--jx-muted-foreground'],
  },
  highlightDetectDefaultSideLine: { fontSize: tokens['--jx-text-label'] },
  highlightDetectDefaultFoot: {
    display: 'flex',
    flexDirection: 'column',
    borderTopWidth: 'var(--hairline)',
    borderTopStyle: 'solid',
    borderColor: tokens['--jx-border'],
    paddingBlockStart: tokens['--jx-space-12'],
    fontSize: tokens['--jx-text-label'],
    lineHeight: 'calc(var(--jx-unit) * 5)',
    color: tokens['--jx-muted-foreground'],
  },

  // ══ highlight-highlightjs ══════════════════════════════════════
  highlightHighlightjsStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-32'],
  },
  highlightHighlightjsPanel: {
    display: 'flex',
    width: '100%',
    maxWidth: '42rem',
    flexDirection: 'column',
    gap: tokens['--jx-space-12'],
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
    padding: tokens['--jx-space-24'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-label-lg'],
    lineHeight: 'calc(var(--jx-unit) * 6)',
  },
  highlightHighlightjsHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 'var(--hairline)',
    borderBottomStyle: 'solid',
    borderColor: tokens['--jx-border'],
    paddingBlockEnd: tokens['--jx-space-12'],
  },
  highlightHighlightjsTitle: {
    fontSize: 'var(--jx-text-base)',
    fontWeight: tokens['--jx-weight-bold'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-10'],
    color: tokens['--jx-primary'],
  },
  highlightHighlightjsSub: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-10'],
    color: tokens['--jx-muted-foreground'],
  },
  highlightHighlightjsCard: {
    display: 'flex',
    flex: '1 1 0%',
    flexDirection: 'column',
    gap: tokens['--jx-space-4'],
    borderRadius: 0,
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: 'color-mix(in oklab, var(--muted) 40%, transparent)',
    paddingInline: tokens['--jx-space-12'],
    paddingBlock: tokens['--jx-space-8'],
  },
  highlightHighlightjsCardLine: { fontSize: tokens['--jx-text-label'] },
  highlightHighlightjsCardLineBold: { fontWeight: tokens['--jx-weight-bold'] },
  highlightHighlightjsCardNote: {
    fontSize: tokens['--jx-text-micro'],
    color: tokens['--jx-muted-foreground'],
  },
  highlightHighlightjsGapCard: {
    display: 'flex',
    width: '178px',
    flex: 'none',
    flexDirection: 'column',
    gap: tokens['--jx-space-4'],
    borderRadius: 0,
    borderWidth: 'var(--hairline)',
    borderStyle: 'dashed',
    borderColor: tokens['--jx-border'],
    paddingInline: tokens['--jx-space-12'],
    paddingBlock: tokens['--jx-space-8'],
  },
  highlightHighlightjsGapLabel: {
    fontSize: tokens['--jx-text-micro'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-14'],
    color: tokens['--jx-muted-foreground'],
  },
  highlightHighlightjsGapLine: {
    fontSize: tokens['--jx-text-label'],
    color: tokens['--jx-muted-foreground'],
  },
  highlightHighlightjsFoot: {
    display: 'flex',
    flexDirection: 'column',
    borderTopWidth: 'var(--hairline)',
    borderTopStyle: 'solid',
    borderColor: tokens['--jx-border'],
    paddingBlockStart: tokens['--jx-space-12'],
    fontSize: tokens['--jx-text-label'],
    lineHeight: 'calc(var(--jx-unit) * 5)',
    color: tokens['--jx-muted-foreground'],
  },

  // ══ highlight-lang-detector ════════════════════════════════════
  highlightLangDetectorStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-32'],
  },
  highlightLangDetectorPanel: {
    display: 'flex',
    width: '100%',
    maxWidth: '42rem',
    flexDirection: 'column',
    gap: tokens['--jx-space-12'],
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
    padding: tokens['--jx-space-24'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-label-lg'],
    lineHeight: 'calc(var(--jx-unit) * 6)',
  },
  highlightLangDetectorHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 'var(--hairline)',
    borderBottomStyle: 'solid',
    borderColor: tokens['--jx-border'],
    paddingBlockEnd: tokens['--jx-space-12'],
  },
  highlightLangDetectorTitle: {
    fontSize: 'var(--jx-text-base)',
    fontWeight: tokens['--jx-weight-bold'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-10'],
    color: tokens['--jx-primary'],
  },
  highlightLangDetectorSub: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-10'],
    color: tokens['--jx-muted-foreground'],
  },
  highlightLangDetectorLayerId: {
    width: '22px',
    flex: 'none',
    fontWeight: tokens['--jx-weight-bold'],
    color: tokens['--jx-primary'],
  },
  highlightLangDetectorLayerName: {
    width: '92px',
    flex: 'none',
    fontSize: tokens['--jx-text-label'],
  },
  highlightLangDetectorLayerReads: {
    flex: '1 1 0%',
    fontSize: tokens['--jx-text-label'],
    color: tokens['--jx-muted-foreground'],
  },
  highlightLangDetectorLayerOut: { fontSize: tokens['--jx-text-label'] },
  highlightLangDetectorLayersNote: {
    fontSize: tokens['--jx-text-micro'],
    color: tokens['--jx-muted-foreground'],
  },
  highlightLangDetectorFoot: {
    display: 'flex',
    flexDirection: 'column',
    borderTopWidth: 'var(--hairline)',
    borderTopStyle: 'solid',
    borderColor: tokens['--jx-border'],
    paddingBlockStart: tokens['--jx-space-12'],
    fontSize: tokens['--jx-text-label'],
    lineHeight: 'calc(var(--jx-unit) * 5)',
    color: tokens['--jx-muted-foreground'],
  },

  // ══ highlight-microlighter ═════════════════════════════════════
  highlightMicrolighterStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-32'],
  },
  highlightMicrolighterPanel: {
    display: 'flex',
    width: '100%',
    maxWidth: '42rem',
    flexDirection: 'column',
    gap: tokens['--jx-space-12'],
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
    padding: tokens['--jx-space-24'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-label-lg'],
    lineHeight: 'calc(var(--jx-unit) * 6)',
  },
  highlightMicrolighterHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 'var(--hairline)',
    borderBottomStyle: 'solid',
    borderColor: tokens['--jx-border'],
    paddingBlockEnd: tokens['--jx-space-12'],
  },
  highlightMicrolighterTitle: {
    fontSize: 'var(--jx-text-base)',
    fontWeight: tokens['--jx-weight-bold'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-10'],
    color: tokens['--jx-primary'],
  },
  highlightMicrolighterSub: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-10'],
    color: tokens['--jx-muted-foreground'],
  },
  highlightMicrolighterNodeCol: {
    width: '158px',
    flex: 'none',
  },
  highlightMicrolighterColLabel: {
    fontSize: tokens['--jx-text-micro'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-14'],
    color: tokens['--jx-muted-foreground'],
  },
  highlightMicrolighterNodeLine: { fontSize: tokens['--jx-text-label'] },
  highlightMicrolighterNodeLineMuted: { color: tokens['--jx-muted-foreground'] },
  highlightMicrolighterRangesCard: {
    display: 'flex',
    flex: '1 1 0%',
    flexDirection: 'column',
    gap: tokens['--jx-space-4'],
    borderRadius: 0,
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: 'color-mix(in oklab, var(--muted) 40%, transparent)',
    paddingInline: tokens['--jx-space-12'],
    paddingBlock: tokens['--jx-space-8'],
  },
  highlightMicrolighterRangesLine: { fontSize: tokens['--jx-text-label'] },
  highlightMicrolighterCardNote: {
    fontSize: tokens['--jx-text-micro'],
    color: tokens['--jx-muted-foreground'],
  },
  highlightMicrolighterPaintCol: {
    width: '132px',
    flex: 'none',
  },
  highlightMicrolighterArrow: { color: tokens['--jx-primary'] },
  highlightMicrolighterFoot: {
    display: 'flex',
    flexDirection: 'column',
    borderTopWidth: 'var(--hairline)',
    borderTopStyle: 'solid',
    borderColor: tokens['--jx-border'],
    paddingBlockStart: tokens['--jx-space-12'],
    fontSize: tokens['--jx-text-label'],
    lineHeight: 'calc(var(--jx-unit) * 5)',
    color: tokens['--jx-muted-foreground'],
  },

  // ══ highlight-prismjs ══════════════════════════════════════════
  highlightPrismjsStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-32'],
  },
  highlightPrismjsPanel: {
    display: 'flex',
    width: '100%',
    maxWidth: '42rem',
    flexDirection: 'column',
    gap: tokens['--jx-space-12'],
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
    padding: tokens['--jx-space-24'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-label-lg'],
    lineHeight: 'calc(var(--jx-unit) * 6)',
  },
  highlightPrismjsHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 'var(--hairline)',
    borderBottomStyle: 'solid',
    borderColor: tokens['--jx-border'],
    paddingBlockEnd: tokens['--jx-space-12'],
  },
  highlightPrismjsTitle: {
    fontSize: 'var(--jx-text-base)',
    fontWeight: tokens['--jx-weight-bold'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-10'],
    color: tokens['--jx-primary'],
  },
  highlightPrismjsSub: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-10'],
    color: tokens['--jx-muted-foreground'],
  },
  highlightPrismjsChainLabel: {
    fontSize: tokens['--jx-text-micro'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-14'],
    color: tokens['--jx-muted-foreground'],
  },
  highlightPrismjsChainLink: {
    borderRadius: 0,
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    paddingInline: tokens['--jx-space-10'],
    paddingBlock: tokens['--jx-space-4'],
    fontSize: tokens['--jx-text-label'],
  },
  highlightPrismjsChainLinkHot: {
    backgroundColor: 'color-mix(in oklab, var(--muted) 70%, transparent)',
    fontWeight: tokens['--jx-weight-bold'],
  },
  highlightPrismjsChainArrow: { color: tokens['--jx-primary'] },
  highlightPrismjsChainNote: {
    marginInlineStart: tokens['--jx-space-12'],
    fontSize: tokens['--jx-text-label'],
    color: tokens['--jx-muted-foreground'],
  },
  highlightPrismjsThemeChip: {
    borderRadius: 0,
    borderWidth: 'var(--hairline)',
    borderStyle: 'dashed',
    borderColor: tokens['--jx-border'],
    paddingInline: tokens['--jx-space-10'],
    paddingBlock: tokens['--jx-space-4'],
    fontSize: tokens['--jx-text-label'],
  },
  highlightPrismjsThemeNote: {
    fontSize: tokens['--jx-text-label'],
    color: tokens['--jx-muted-foreground'],
  },
  highlightPrismjsFoot: {
    display: 'flex',
    flexDirection: 'column',
    borderTopWidth: 'var(--hairline)',
    borderTopStyle: 'solid',
    borderColor: tokens['--jx-border'],
    paddingBlockStart: tokens['--jx-space-12'],
    fontSize: tokens['--jx-text-label'],
    lineHeight: 'calc(var(--jx-unit) * 5)',
    color: tokens['--jx-muted-foreground'],
  },

  // ══ highlight-shiki ════════════════════════════════════════════
  highlightShikiStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-32'],
  },
  highlightShikiPanel: {
    display: 'flex',
    width: '100%',
    maxWidth: '42rem',
    flexDirection: 'column',
    gap: tokens['--jx-space-12'],
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
    padding: tokens['--jx-space-24'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-label-lg'],
    lineHeight: 'calc(var(--jx-unit) * 6)',
  },
  highlightShikiHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 'var(--hairline)',
    borderBottomStyle: 'solid',
    borderColor: tokens['--jx-border'],
    paddingBlockEnd: tokens['--jx-space-12'],
  },
  highlightShikiTitle: {
    fontSize: 'var(--jx-text-base)',
    fontWeight: tokens['--jx-weight-bold'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-10'],
    color: tokens['--jx-primary'],
  },
  highlightShikiSub: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-10'],
    color: tokens['--jx-muted-foreground'],
  },
  highlightShikiLazyCol: {
    width: '164px',
    flex: 'none',
  },
  highlightShikiColLabel: {
    fontSize: tokens['--jx-text-micro'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-14'],
    color: tokens['--jx-muted-foreground'],
  },
  highlightShikiLazyLine: {
    fontSize: tokens['--jx-text-label'],
    color: tokens['--jx-muted-foreground'],
  },
  highlightShikiAdapterCard: {
    display: 'flex',
    flex: '1 1 0%',
    flexDirection: 'column',
    gap: tokens['--jx-space-4'],
    borderRadius: 0,
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: 'color-mix(in oklab, var(--muted) 40%, transparent)',
    paddingInline: tokens['--jx-space-12'],
    paddingBlock: tokens['--jx-space-8'],
  },
  highlightShikiAdapterTitle: {
    fontSize: tokens['--jx-text-label-lg'],
    fontWeight: tokens['--jx-weight-bold'],
  },
  highlightShikiAdapterLine: { fontSize: tokens['--jx-text-label'] },
  highlightShikiCardNote: {
    fontSize: tokens['--jx-text-micro'],
    color: tokens['--jx-muted-foreground'],
  },
  highlightShikiOutCol: {
    width: '140px',
    flex: 'none',
  },
  highlightShikiOutLine: { fontSize: tokens['--jx-text-label'] },
  highlightShikiArrow: { color: tokens['--jx-primary'] },
  highlightShikiFoot: {
    display: 'flex',
    flexDirection: 'column',
    borderTopWidth: 'var(--hairline)',
    borderTopStyle: 'solid',
    borderColor: tokens['--jx-border'],
    paddingBlockStart: tokens['--jx-space-12'],
    fontSize: tokens['--jx-text-label'],
    lineHeight: 'calc(var(--jx-unit) * 5)',
    color: tokens['--jx-muted-foreground'],
  },

  // ══ highlight-sugar-high ═══════════════════════════════════════
  highlightSugarHighStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-32'],
  },
  highlightSugarHighPanel: {
    display: 'flex',
    width: '100%',
    maxWidth: '42rem',
    flexDirection: 'column',
    gap: tokens['--jx-space-12'],
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
    padding: tokens['--jx-space-24'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-label-lg'],
    lineHeight: 'calc(var(--jx-unit) * 6)',
  },
  highlightSugarHighHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 'var(--hairline)',
    borderBottomStyle: 'solid',
    borderColor: tokens['--jx-border'],
    paddingBlockEnd: tokens['--jx-space-12'],
  },
  highlightSugarHighTitle: {
    fontSize: 'var(--jx-text-base)',
    fontWeight: tokens['--jx-weight-bold'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-10'],
    color: tokens['--jx-primary'],
  },
  highlightSugarHighSub: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-10'],
    color: tokens['--jx-muted-foreground'],
  },
  highlightSugarHighOutLabel: {
    fontSize: tokens['--jx-text-micro'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-14'],
    color: tokens['--jx-muted-foreground'],
  },
  highlightSugarHighOutCode: { fontSize: tokens['--jx-text-label'] },
  highlightSugarHighOutArrow: { color: tokens['--jx-primary'] },
  highlightSugarHighOutChip: {
    borderRadius: 0,
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: 'color-mix(in oklab, var(--muted) 40%, transparent)',
    paddingInline: tokens['--jx-space-10'],
    paddingBlock: tokens['--jx-space-4'],
    fontSize: tokens['--jx-text-label'],
    fontWeight: tokens['--jx-weight-bold'],
  },
  highlightSugarHighBarsLabel: {
    fontSize: tokens['--jx-text-micro'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-14'],
    color: tokens['--jx-muted-foreground'],
  },
  highlightSugarHighBarLabel: {
    width: '86px',
    flex: 'none',
    fontSize: tokens['--jx-text-label'],
  },
  highlightSugarHighBarLabelBold: { fontWeight: tokens['--jx-weight-bold'] },
  highlightSugarHighBarTrack: {
    height: '10px',
    flex: 'none',
    borderRadius: 'calc(var(--jx-unit) * 0.5)',
  },
  highlightSugarHighBarW42: { width: '42px' },
  highlightSugarHighBarW62: { width: '62px' },
  highlightSugarHighBarW126: { width: '126px' },
  highlightSugarHighBarFillPrimary: { backgroundColor: tokens['--jx-primary'] },
  highlightSugarHighBarFillMuted: { backgroundColor: tokens['--jx-muted'] },
  highlightSugarHighBarValue: {
    fontSize: tokens['--jx-text-label'],
    color: tokens['--jx-muted-foreground'],
  },
  highlightSugarHighFoot: {
    display: 'flex',
    flexDirection: 'column',
    borderTopWidth: 'var(--hairline)',
    borderTopStyle: 'solid',
    borderColor: tokens['--jx-border'],
    paddingBlockStart: tokens['--jx-space-12'],
    fontSize: tokens['--jx-text-label'],
    lineHeight: 'calc(var(--jx-unit) * 5)',
    color: tokens['--jx-muted-foreground'],
  },

  // ══ highlight-tree-sitter ══════════════════════════════════════
  highlightTreeSitterStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-32'],
  },
  highlightTreeSitterPanel: {
    display: 'flex',
    width: '100%',
    maxWidth: '42rem',
    flexDirection: 'column',
    gap: tokens['--jx-space-12'],
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
    padding: tokens['--jx-space-24'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-label-lg'],
    lineHeight: 'calc(var(--jx-unit) * 6)',
  },
  highlightTreeSitterHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 'var(--hairline)',
    borderBottomStyle: 'solid',
    borderColor: tokens['--jx-border'],
    paddingBlockEnd: tokens['--jx-space-12'],
  },
  highlightTreeSitterTitle: {
    fontSize: 'var(--jx-text-base)',
    fontWeight: tokens['--jx-weight-bold'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-10'],
    color: tokens['--jx-primary'],
  },
  highlightTreeSitterSub: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-10'],
    color: tokens['--jx-muted-foreground'],
  },
  highlightTreeSitterTreeCol: {
    width: '172px',
    flex: 'none',
  },
  highlightTreeSitterColLabel: {
    fontSize: tokens['--jx-text-micro'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-14'],
    color: tokens['--jx-muted-foreground'],
  },
  highlightTreeSitterTreeLine: { fontSize: tokens['--jx-text-label'] },
  highlightTreeSitterQueryCard: {
    display: 'flex',
    flex: '1 1 0%',
    flexDirection: 'column',
    gap: tokens['--jx-space-4'],
    borderRadius: 0,
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: 'color-mix(in oklab, var(--muted) 40%, transparent)',
    paddingInline: tokens['--jx-space-12'],
    paddingBlock: tokens['--jx-space-8'],
  },
  highlightTreeSitterQueryLine: { fontSize: tokens['--jx-text-label'] },
  highlightTreeSitterCardNote: {
    fontSize: tokens['--jx-text-micro'],
    color: tokens['--jx-muted-foreground'],
  },
  highlightTreeSitterPaintCol: {
    width: '152px',
    flex: 'none',
  },
  highlightTreeSitterArrow: { color: tokens['--jx-primary'] },
  highlightTreeSitterFoot: {
    display: 'flex',
    flexDirection: 'column',
    borderTopWidth: 'var(--hairline)',
    borderTopStyle: 'solid',
    borderColor: tokens['--jx-border'],
    paddingBlockStart: tokens['--jx-space-12'],
    fontSize: tokens['--jx-text-label'],
    lineHeight: 'calc(var(--jx-unit) * 5)',
    color: tokens['--jx-muted-foreground'],
  },

  // ══ highlight (the contract itself) ════════════════════════════
  highlightStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-32'],
  },
  highlightPanel: {
    display: 'flex',
    width: '100%',
    maxWidth: '42rem',
    flexDirection: 'column',
    gap: tokens['--jx-space-12'],
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
    padding: tokens['--jx-space-24'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'var(--jx-text-base)',
    lineHeight: 'calc(var(--jx-unit) * 6)',
  },
  highlightHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 'var(--hairline)',
    borderBottomStyle: 'solid',
    borderColor: tokens['--jx-border'],
    paddingBlockEnd: tokens['--jx-space-12'],
  },
  highlightTitle: {
    fontWeight: tokens['--jx-weight-bold'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-10'],
    color: tokens['--jx-primary'],
  },
  highlightSub: {
    fontSize: tokens['--jx-text-label'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-10'],
    color: tokens['--jx-muted-foreground'],
  },
  highlightGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    gap: tokens['--jx-space-16'],
  },
  highlightColumnLabel: {
    fontSize: tokens['--jx-text-micro'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-14'],
    color: tokens['--jx-muted-foreground'],
  },
  highlightEngineName: { fontSize: tokens['--jx-text-label'] },
  highlightEngineModel: {
    fontSize: tokens['--jx-text-micro'],
    color: tokens['--jx-muted-foreground'],
  },
  highlightEngineModelBold: { fontWeight: tokens['--jx-weight-bold'] },
  highlightArrow: { color: tokens['--jx-primary'] },
  highlightIfaceCode: { fontWeight: tokens['--jx-weight-bold'] },
  highlightIfaceNote: {
    fontSize: tokens['--jx-text-label'],
    color: tokens['--jx-muted-foreground'],
  },
  highlightGridDivided: {
    borderTopWidth: 'var(--hairline)',
    borderTopStyle: 'solid',
    borderColor: tokens['--jx-border'],
    paddingBlockStart: tokens['--jx-space-12'],
  },
  highlightFoot: {
    borderTopWidth: 'var(--hairline)',
    borderTopStyle: 'solid',
    borderColor: tokens['--jx-border'],
    paddingBlockStart: tokens['--jx-space-12'],
    fontSize: tokens['--jx-text-label'],
    lineHeight: 'calc(var(--jx-unit) * 5)',
    color: tokens['--jx-muted-foreground'],
  },

  // ══ hover-card ═════════════════════════════════════════════════
  hoverCardStage: {
    display: 'flex',
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: tokens['--jx-space-24'],
    padding: tokens['--jx-space-40'],
  },
  hoverCardMuted: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens['--jx-space-12'],
    opacity: 0.6,
  },
  hoverCardSkeletonA: { height: 'calc(var(--jx-unit) * 3)', width: '75%' },
  hoverCardSkeletonB: { height: 'calc(var(--jx-unit) * 3)', width: '50%' },
  hoverCardBody: {
    fontSize: 'var(--jx-text-sm)',
    lineHeight: 'calc(var(--jx-unit) * 6)',
  },
  hoverCardTrigger: {
    fontWeight: tokens['--jx-weight-medium'],
    textDecoration: 'underline dotted',
    textUnderlineOffset: tokens['--jx-space-4'],
  },
  hoverCardPeekName: {
    fontSize: 'var(--jx-text-sm)',
    lineHeight: 'calc(var(--jx-unit) * 5)',
    fontWeight: tokens['--jx-weight-medium'],
  },
  hoverCardPeekNote: {
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-label-lg'],
    lineHeight: 'calc(var(--jx-unit) * 5)',
  },

  // ══ icon-button ════════════════════════════════════════════════
  iconButtonStage: {
    display: 'flex',
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: tokens['--jx-space-24'],
    padding: tokens['--jx-space-40'],
  },
  iconButtonIcon: { width: 'calc(var(--jx-unit) * 4)', height: 'calc(var(--jx-unit) * 4)' },
  iconButtonMuted: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens['--jx-space-12'],
    opacity: 0.6,
  },
  iconButtonSkeletonA: { height: 'calc(var(--jx-unit) * 3)', width: '75%' },
  iconButtonSkeletonB: { height: 'calc(var(--jx-unit) * 3)', width: '50%' },

  // ══ icon-set ═══════════════════════════════════════════════════
  iconSetStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  iconSetEyebrow: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-micro'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-20'],
    color: tokens['--jx-muted-foreground'],
  },
  iconSetWall: {
    display: 'grid',
    maxWidth: '30rem',
    gridTemplateColumns: 'repeat(11, minmax(0, 1fr))',
    alignItems: 'center',
    columnGap: tokens['--jx-space-8'],
    rowGap: tokens['--jx-space-12'],
  },
  iconSetGlyph: { color: tokens['--jx-muted-foreground'] },
  iconSetFoot: {
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-micro'],
    color: tokens['--jx-muted-foreground'],
  },

  // ══ icon ═══════════════════════════════════════════════════════
  iconStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  iconEyebrow: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-micro'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-20'],
    color: tokens['--jx-muted-foreground'],
  },
  iconCellLabel: {
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-micro'],
    color: tokens['--jx-muted-foreground'],
  },
  iconStrokeRow: { display: 'flex', alignItems: 'center', gap: tokens['--jx-space-16'] },
  iconNameRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens['--jx-space-12'],
    color: tokens['--jx-muted-foreground'],
  },
  iconNameRowLabel: { fontFamily: tokens['--jx-font-mono'], fontSize: tokens['--jx-text-micro'] },

  // ══ image ══════════════════════════════════════════════════════
  imageStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  imageCover: { width: '100%' },
  imageRow: { display: 'flex', gap: tokens['--jx-space-16'] },
  imageThumb: {
    minWidth: 0,
    flex: '1 1 0%',
  },
  imageCaption: {
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-label-lg'],
    lineHeight: 'calc(var(--jx-unit) * 4)',
    color: tokens['--jx-muted-foreground'],
  },

  // ══ inline-code ════════════════════════════════════════════════
  inlineCodeStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },

  // ══ input-group ════════════════════════════════════════════════
  inputGroupStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  inputGroupField: { width: '26rem' },

  // ══ input-otp ══════════════════════════════════════════════════
  inputOtpStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },

  // ══ input ══════════════════════════════════════════════════════
  inputStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },

  // ══ jixoai-theme ═══════════════════════════════════════════════
  jixoaiThemeStage: {
    display: 'flex',
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 'calc(var(--jx-unit) * 7)',
    padding: tokens['--jx-space-40'],
  },
  jixoaiThemeRow: { display: 'flex', alignItems: 'center', gap: tokens['--jx-space-20'] },
  jixoaiThemeRowLabel: {
    fontFamily: tokens['--jx-font-nav'],
    color: tokens['--jx-muted-foreground'],
    width: '96px',
    flex: 'none',
    fontSize: tokens['--jx-text-micro'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-18'],
  },
  jixoaiThemeSwatches: { display: 'flex', flex: '1 1 0%', gap: tokens['--jx-space-12'] },
  jixoaiThemeSwatch: { flex: '1 1 0%' },
  jixoaiThemeChip: {
    height: 'calc(var(--jx-unit) * 11)',
    width: '100%',
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
  },
  jixoaiThemeChipLabel: {
    fontFamily: tokens['--jx-font-nav'],
    color: tokens['--jx-muted-foreground'],
    marginTop: tokens['--jx-space-4'],
    display: 'block',
    fontSize: tokens['--jx-text-micro'],
  },
  jixoaiThemeGrid: {
    flex: '1 1 0%',
  },
  jixoaiThemeLaw: {
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-label'],
    lineHeight: 'calc(var(--jx-unit) * 5)',
  },

  // ══ jx-pure ═══════════════════════════════════════════════════
  jxPureStage: {
    display: 'flex',
    height: '100%',
    width: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: tokens['--jx-space-32'],
    padding: tokens['--jx-space-40'],
  },
  jxPureRow: { display: 'flex', alignItems: 'center', gap: tokens['--jx-space-24'] },

  // ══ katex ═════════════════════════════════════════════════════
  katexStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  katexBlock: { width: '100%', maxWidth: '520px' },
  katexRow: { display: 'flex', flexWrap: 'wrap', gap: tokens['--jx-space-8'] },

  // ══ kbd ═══════════════════════════════════════════════════════
  kbdStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  kbdRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens['--jx-space-8'],
    fontSize: 'var(--jx-text-sm)',
    lineHeight: 'calc(var(--jx-unit) * 5)',
  },
  kbdNote: { color: tokens['--jx-muted-foreground'] },

  // ══ language-switcher ══════════════════════════════════════════
  languageSwitcherStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  languageSwitcherPanel: {
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-terminal'],
    color: tokens['--jx-terminal-foreground'],
    display: 'flex',
    width: '100%',
    maxWidth: '440px',
    flexDirection: 'column',
    gap: tokens['--jx-space-16'],
    padding: tokens['--jx-space-24'],
  },
  languageSwitcherRowLabel: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-micro'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-label'],
    opacity: 0.6,
  },
  languageSwitcherDividerRow: {
    borderTopWidth: 'var(--hairline)',
    borderTopStyle: 'solid',
    borderColor: 'color-mix(in oklab, var(--terminal-foreground) 10%, transparent)',
    paddingBlockStart: tokens['--jx-space-16'],
  },

  // ══ link ══════════════════════════════════════════════════════
  linkStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  linkColumn: {
    display: 'flex',
    width: '100%',
    maxWidth: '520px',
    flexDirection: 'column',
    gap: tokens['--jx-space-12'],
    fontSize: 'var(--jx-text-sm)',
    lineHeight: 'calc(var(--jx-unit) * 7)',
  },
  linkPara: { margin: 0 },
  linkParaMuted: { margin: 0, color: tokens['--jx-muted-foreground'] },
  linkRow: { display: 'flex', flexWrap: 'wrap', gap: tokens['--jx-space-8'] },

  // ══ list-item ═════════════════════════════════════════════════
  listItemStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  listItemGroup: { width: '34rem', maxWidth: '100%' },

  // ══ list ══════════════════════════════════════════════════════
  listStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  listRow: {
    display: 'flex',
    width: '100%',
    maxWidth: '520px',
    justifyContent: 'center',
    gap: 'calc(var(--jx-unit) * 14)',
  },
  listBadgeRow: { display: 'flex', flexWrap: 'wrap', gap: tokens['--jx-space-8'] },

  // ══ llms-txt ══════════════════════════════════════════════════
  llmsTxtStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-32'],
  },
  llmsTxtPanel: {
    display: 'flex',
    width: '100%',
    maxWidth: '42rem',
    flexDirection: 'column',
    gap: tokens['--jx-space-12'],
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
    padding: tokens['--jx-space-24'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'var(--jx-text-base)',
    lineHeight: 'calc(var(--jx-unit) * 6)',
  },
  llmsTxtHead: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 'var(--hairline)',
    borderBottomStyle: 'solid',
    borderColor: tokens['--jx-border'],
    paddingBlockEnd: tokens['--jx-space-12'],
  },
  llmsTxtTitle: {
    fontWeight: tokens['--jx-weight-bold'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-10'],
    color: tokens['--jx-primary'],
  },
  llmsTxtSub: {
    fontSize: tokens['--jx-text-label'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-10'],
    color: tokens['--jx-muted-foreground'],
  },
  llmsTxtGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    gap: tokens['--jx-space-16'],
  },
  llmsTxtInputPre: { color: tokens['--jx-muted-foreground'] },
  llmsTxtArrow: { color: tokens['--jx-primary'] },
  llmsTxtFoot: {
    borderTopWidth: 'var(--hairline)',
    borderTopStyle: 'solid',
    borderColor: tokens['--jx-border'],
    paddingBlockStart: tokens['--jx-space-12'],
    fontSize: tokens['--jx-text-label'],
    color: tokens['--jx-muted-foreground'],
  },

  // ══ markdown (the A/B boundary seam — the roster's 70th file sat
  // between the two alphabetical halves; swept by the orchestrator
  // at W2 integration, 2026-09-18) ═════════════════════════════════
  markdownStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  markdownFace: { width: '100%', maxWidth: '520px' },

  // ══ boot-splash (the FOUC round, 2026-09-19; the coverage-debt
  // sweep R6 — every catalog entry renders) ═══════════════════════
  bootSplashStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  // the transform box: position:fixed resolves against a transformed
  // ancestor (the CSS containment law) — the layer clips into the
  // card instead of veiling the gallery page
  bootSplashFrame: {
    overflow: 'hidden',
    transform: 'translate(0, 0)',
    height: '190px',
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
  },
  bootSplashNotes: { justifyContent: 'center' },
  bootSplashChip: {
    fontFamily: tokens['--jx-font-nav'],
    color: tokens['--jx-muted-foreground'],
    borderColor: 'color-mix(in oklab, var(--border) 50%, transparent)',
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    paddingInline: tokens['--jx-space-8'],
    paddingBlock: tokens['--jx-space-4'],
    fontSize: tokens['--jx-text-micro'],
    letterSpacing: tokens['--jx-track-label'],
    textTransform: 'uppercase',
  },
});
