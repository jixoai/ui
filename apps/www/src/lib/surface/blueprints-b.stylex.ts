// blueprints-b.stylex.ts — the blueprint scenes' atom table, the
// SECOND half (tailwindless one-shot Wave 2 batch BP-B, 2026-09-16).
//
// WWW-ONLY surface module (apps/www/src/lib/surface/** — the pilot
// placement law's lane-1 extension; blueprint scenes have NO registry
// mirror). Scope: the 68 scenes from math-block.svelte through
// website-svelte's dictionary neighbors — precisely the allowlist's
// `/lib/blueprints/scenes/` back half (the front half, accordion
// through llms-txt, is batch BP-A's blueprints-a.stylex.ts sibling).
//
// MEMBER LAW (batch ruling): one scene, one member prefix — every
// member is `<sceneCamel><Element>` and belongs to exactly one scene;
// recurring utility bodies repeat per scene deliberately (stylex
// content-hashes identical declarations to one class; provenance
// stays per-scene) — EXCEPT pure flow (the Layout-family adoption,
// 2026-09-19, R6 slice 1): display/flexDirection/align/justify/gap/
// wrap bodies compose the Stack family in the scene markup, never a
// table member (5 atoms retired here; `1fr auto 1fr` and asymmetric
// minmax tracks stay — Grid's law is equal tracks only). The module's ONLY export is this stylex.create
// result — the cx joiner lives inside each consuming scene (the
// separator serialize law; a .stylex.ts module never exports it).
//
// VALUE LAW receipts (tier-2 slots):
//   - space ladder: `p-10`→space-40 … every Tailwind step maps
//     EXACTLY (--space-N == N px, U=--jx-unit=4px); sub-ladder
//     oddities ride the ruler equation in calc() and are seam-
//     reported for promotion: `p-12`(48px)→space-40+space-8,
//     `gap-20`(80px)→space-40*2, `gap-[3px]`→space-2+1px,
//     `py-[5px]`/`py-[3px]`→space-4±1px, `mt-7`(28px)→space-24+4,
//     `mr-[-8px]`→space-8*-1.
//   - type ladder: text-[9/9.5/10.5/11.5/13.5px] ride the ruler
//     equation calc(var(--jx-text-base) ± var(--jx-unit)*k) — the
//     sheet's own density-text physics (T=13px, U=4px); 10/11/12/
//     12.5/14/15px are exact voice steps; 13px is the --jx-text-base
//     kernel channel (plain var string — the cycle law).
//     AMENDMENT (the audit's named-gap fill, 2026-09-19): the 9px
//     voice gained its rung — --jx-text-caption (var(--text-caption),
//     theme-side 0.5625rem). The 26 caption atoms' calc(base−U)
//     became token reads; pixels unchanged; the var() is also the
//     master switch for any future merge into micro (10px) — one
//     value, all 26.
//   - tracking: 0.24/0.2/0.18/0.14/0.1em are exact steps;
//     `tracking-tight` (-0.025em) rides --track-tight (-0.02em, the
//     W1 nearest-step remap — seam-reported).
//   - leading: Tailwind's leading-N is the SPACING ladder as a
//     length (leading-4=16px … leading-8=32px) — 16/20/24/32 are
//     exact space steps, 28px rides calc(space-24 + space-4);
//     named text steps carry their Tailwind line-height pairs as
//     lengths too (text-sm→14/20, text-xs→12/16, text-base→16/24,
//     text-lg→18/28 — 18px is the one missing font step, ruler
//     calc + seam-reported).
//   - alpha channels (`bg-muted/40`, `border-border/60`, …) ride
//     color-mix(in oklab, var(--x) N%, transparent) — the
//     component-canvas precedent.
//   - `rounded-md`/`rounded-lg`/`rounded-none`: the site KILLS the
//     Tailwind radius scale (--radius-*:initial, the radius law), so
//     the utilities computed to 0 — the atoms say borderRadius: 0
//     (parity); `rounded-full` is Tailwind's static
//     calc(infinity * 1px) (the chip precedent).
//   - hover poses (`hover:bg-muted`/`hover:underline`/`hover:text-
//     terminal-foreground`) and the one `lg:px-3` seam ride pseudo/
//     media VALUE objects inside the atoms (breadcrumb + hero-
//     section precedents) — this half needed zero lane-2 css bytes
//     (no :has()/descendant seams exist in the batch).
//   - shadows: shadow-2xs/shadow-xs are exact tokens; the one
//     arbitrary `shadow-[1px_1px_2px_rgba(0,0,0,0.2)]` rides the
//     nearest hard-offset rung (shadow-2xs) — seam-reported.

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../tokens.stylex';

// ── the recipe constants (the non-layout audit, R6 slice 5,
// 2026-09-19): the three declaration recipes repeated across dozens
// of members collapse here — spread into each member, so the BODIES
// stay byte-identical (same stylex hashes, same css payloads) while
// the recipe has ONE home. New members compose these; the recipes
// themselves are token-bound (hairline width law, the nav label
// voice, the canvas-precedent muted mix).
const HAIRLINE = { borderWidth: 'var(--hairline)', borderStyle: 'solid' } as const;
const LABEL_VOICE = { fontFamily: tokens['--jx-font-nav'], textTransform: 'uppercase' } as const;
const MUTED_MIX_40 = { backgroundColor: 'color-mix(in oklab, var(--muted) 40%, transparent)' } as const;


export const bpB = stylex.create({
  // ── math-block: the figure stage ──────────────────────────────
  mathBlockStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  mathBlockFrame: { width: '100%', maxWidth: '520px' },


  // ── math-inline: the prose stage ───────────────────────────────
  mathInlineStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  mathInlineBody: {
    maxWidth: '520px',
    textAlign: 'left',
    fontSize: tokens['--jx-text-body-xl'],
    lineHeight: 'calc(var(--space-24) + var(--space-4))',
  },


  // ── menubar: the app bar, File menu forced open ────────────────
  menubarStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  menubarSkel: { opacity: 0.6 },
  menubarSkelA: { height: '12px', width: '66.666667%' },
  menubarSkelB: { height: '12px', width: '50%' },
  menubarPanel: { minWidth: '10rem' },
  menubarItem: {
    paddingInline: tokens['--jx-space-10'],
    paddingBlock: tokens['--jx-space-4'],
    textAlign: 'left',
    fontSize: 'var(--jx-text-base)',
    backgroundColor: { default: 'transparent', ':hover': tokens['--jx-muted'] },
  },

  // ── mermaid-engine / mermaid: the diagram stages (twin shapes) ──
  mermaidEngineStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-24'],
  },
  mermaidEngineFrame: { width: '100%', maxWidth: '480px' },

  mermaidStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-24'],
  },
  mermaidFrame: { width: '100%', maxWidth: '480px' },


  // ── native-form: the Tier-1 sheet-styled stage ─────────────────
  nativeFormStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },


  // ── native-select: the platform picker stage ───────────────────
  nativeSelectStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  nativeSelectGrid: {
    width: '100%',
    maxWidth: '520px',
  },

  // ── navigation-menu: the site bar, panel forced shown ──────────
  navigationMenuStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  navigationMenuSkel: {
    opacity: 0.6,
  },
  navigationMenuSkelBar: { height: '12px', width: '50%' },
  navigationMenuPanel: {
    minWidth: '11rem',
  },
  navigationMenuLink: {
    fontSize: tokens['--jx-text-sm'],
    lineHeight: tokens['--jx-space-20'],
    textDecorationLine: { default: 'none', ':hover': 'underline' },
  },

  // ── number-input: the steppers stage ───────────────────────────
  numberInputStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  numberInputCol: {
    width: '100%',
    maxWidth: '320px',
  },

  // ── pagination: the page-window stage ──────────────────────────
  paginationStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },

  // ── paint: the axis ladder ─────────────────────────────────────
  paintStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  paintKey: {
    ...LABEL_VOICE,
    fontSize: tokens['--jx-text-micro'],
    letterSpacing: tokens['--jx-track-20'],
    color: tokens['--jx-muted-foreground'],
  },
  paintRow: {
    maxWidth: '22rem',
    borderRadius: 0,
    borderWidth: 'var(--hairline)',
    paddingInline: tokens['--jx-space-16'],
    paddingBlock: tokens['--jx-space-8'],
  },
  paintRowZone: {
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
  },
  paintRowPlain: {
    borderStyle: 'dashed',
    borderColor: tokens['--jx-border'],
    backgroundColor: 'transparent',
  },
  paintName: { fontFamily: tokens['--jx-font-mono'], fontSize: 'var(--jx-text-base)' },
  paintNote: { fontSize: tokens['--jx-text-label'], color: tokens['--jx-muted-foreground'] },

  // ── pattern-cta/faq/hero-set/login/pricing: the twin center
  //    stages (identical bodies — stylex content-dedupes the class) ──
  patternCtaStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  patternFaqStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  patternHeroSetStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  patternLoginStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  patternPricingStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },

  // ── popconfirm: the confirm bubble stage ───────────────────────
  popconfirmStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  popconfirmSkel: {
    opacity: 0.6,
  },
  popconfirmSkelA: { height: '12px', width: '75%' },
  popconfirmSkelB: { height: '12px', width: '50%' },

  // ── popover: the anchored panel stage ──────────────────────────
  popoverStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  popoverSkel: {
    opacity: 0.6,
  },
  popoverSkelA: { height: '12px', width: '75%' },
  popoverSkelB: { height: '12px', width: '66.666667%' },
  popoverBody: { fontSize: tokens['--jx-text-sm'], lineHeight: tokens['--jx-space-20'] },

  // ── press-button: the variant row ──────────────────────────────
  pressButtonStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },

  pressButtonSkelA: { height: '12px', width: '75%' },
  pressButtonSkelB: { height: '12px', width: '50%' },

  // ── progress: determinate + indeterminate bars ─────────────────
  progressStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },

  // ── progressive-blur: the docs-rail ladder schematic ───────────
  progressiveBlurStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  progressiveBlurRail: {
    width: '300px',
    flex: 'none',
  },
  progressiveBlurLabel: {
    ...LABEL_VOICE,
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-micro'],
    letterSpacing: tokens['--jx-track-label'],
  },
  progressiveBlurPort: {
    ...HAIRLINE,
    borderColor: tokens['--jx-border'],
    position: 'relative',
    height: '210px',
    overflow: 'hidden',
  },
  progressiveBlurList: {
    paddingInline: tokens['--jx-space-12'],
    paddingTop: tokens['--jx-space-24'],
  },
  progressiveBlurRow: {
    color: tokens['--jx-muted-foreground'],
    fontFamily: tokens['--jx-font-mono'],
    paddingBlock: 'calc(var(--space-4) + 1px)',
    fontSize: 'calc(var(--jx-text-base) - var(--jx-unit) * 0.625)',
  },
  progressiveBlurRowDim: { opacity: 0.4 },
  progressiveBlurRowLift: { opacity: 0.8 },
  progressiveBlurBand: { position: 'absolute', insetInline: 0, top: 0, height: '70px' },
  progressiveBlurRun95: {
    position: 'absolute',
    insetInline: 0,
    top: 0,
    height: '58px',
    backgroundImage:
      'linear-gradient(to bottom in oklab, color-mix(in oklab, var(--background) 95%, transparent) 0%, transparent 100%)',
  },
  progressiveBlurRun80: {
    position: 'absolute',
    insetInline: 0,
    top: 0,
    height: '46px',
    backgroundImage:
      'linear-gradient(to bottom in oklab, color-mix(in oklab, var(--background) 80%, transparent) 0%, transparent 100%)',
  },
  progressiveBlurRun60: {
    position: 'absolute',
    insetInline: 0,
    top: 0,
    height: '34px',
    backgroundImage:
      'linear-gradient(to bottom in oklab, color-mix(in oklab, var(--background) 60%, transparent) 0%, transparent 100%)',
  },
  progressiveBlurRun40: {
    position: 'absolute',
    insetInline: 0,
    top: 0,
    height: '22px',
    backgroundImage:
      'linear-gradient(to bottom in oklab, color-mix(in oklab, var(--background) 40%, transparent) 0%, transparent 100%)',
  },
  progressiveBlurCaption: {
    color: tokens['--jx-primary'],
    fontFamily: tokens['--jx-font-nav'],
    position: 'absolute',
    bottom: tokens['--jx-space-8'],
    left: tokens['--jx-space-10'],
    fontSize: tokens['--jx-text-caption'],
  },

  // ── prose: the reading region ──────────────────────────────────
  proseStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  proseRegion: { width: '100%', maxWidth: '520px' },


  // ── radio: the one-name group ──────────────────────────────────
  radioStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  radioCol: {
    width: '100%',
    maxWidth: '360px',
  },
  radioLabel: {
    ...LABEL_VOICE,
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-label-lg'],
    lineHeight: tokens['--jx-space-16'],
    letterSpacing: tokens['--jx-track-20'],
  },

  // ── range: the mid-commit sliders ──────────────────────────────
  rangeStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  rangeCol: {
    width: '100%',
    maxWidth: '440px',
  },

  // ── recipes: the guide's own subject ───────────────────────────
  recipesStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  // text-lg = 18px (no step — the ruler calc, seam-reported) with
  // Tailwind's own 28px line-height; tracking-tight → --track-tight
  recipesTitle: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'calc(var(--jx-text-base) + var(--jx-unit) * 1.25)',
    lineHeight: 'calc(var(--space-24) + var(--space-4))',
    letterSpacing: tokens['--jx-track-tight'],
  },


  // ── reference: the 引 resolution matrix ────────────────────────
  referenceStage: {
    height: '100%',
    width: '100%',
    padding: 'calc(var(--space-40) + var(--space-8))',
  },
  referenceBody: {
    fontSize: 'calc(var(--jx-text-base) + var(--jx-unit) * 0.125)',
  },
  referenceBroken: { color: tokens['--jx-muted-foreground'] },
  referenceFormula: { fontFamily: tokens['--jx-font-mono'], fontSize: tokens['--jx-text-sm'] },

  // ── result: the page-level outcome ─────────────────────────────
  resultStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  resultCard: { width: '100%', maxWidth: '440px' },

  // ── scaffold-float: the portal adoption diagram ────────────────
  scaffoldFloatStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  scaffoldFloatRow: {
    width: '100%',
  },
  scaffoldFloatSource: {
    borderColor: tokens['--jx-border'],
    flex: '1 1 0%',
    borderWidth: 'var(--hairline)',
    borderStyle: 'dashed',
    padding: tokens['--jx-space-12'],
  },
  scaffoldFloatTag: {
    ...LABEL_VOICE,
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-caption'],
    letterSpacing: tokens['--jx-track-20'],
  },
  scaffoldFloatFloat: {
    ...HAIRLINE,
    borderColor: tokens['--jx-border'],
    backgroundColor: 'color-mix(in oklab, var(--muted) 50%, transparent)',
    marginTop: tokens['--jx-space-4'],
    paddingInline: tokens['--jx-space-8'],
    paddingBlock: tokens['--jx-space-6'],
    opacity: 0.7,
  },
  scaffoldFloatDot: {
    backgroundColor: tokens['--jx-primary'],
    height: '8px',
    width: '8px',
    flex: 'none',
  },
  scaffoldFloatFloatLabel: { fontFamily: tokens['--jx-font-nav'], fontSize: tokens['--jx-text-micro'] },
  scaffoldFloatAnchorNote: {
    fontFamily: tokens['--jx-font-nav'],
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-caption'],
  },
  scaffoldFloatArrow: {
    color: tokens['--jx-muted-foreground'],
  },
  scaffoldFloatTarget: {
    ...HAIRLINE,
    borderColor: 'color-mix(in oklab, var(--primary) 60%, transparent)',
    flex: '1 1 0%',
    padding: tokens['--jx-space-12'],
  },
  scaffoldFloatTargetTag: {
    ...LABEL_VOICE,
    color: tokens['--jx-primary'],
    fontSize: tokens['--jx-text-caption'],
    letterSpacing: tokens['--jx-track-20'],
  },
  scaffoldFloatHeader: {
    ...HAIRLINE,
    borderColor: tokens['--jx-border'],
    backgroundColor: 'color-mix(in oklab, var(--muted) 60%, transparent)',
    marginTop: tokens['--jx-space-8'],
    paddingInline: tokens['--jx-space-8'],
    paddingBlock: tokens['--jx-space-6'],
  },
  scaffoldFloatHeaderLabel: {
    fontFamily: tokens['--jx-font-nav'],
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-micro'],
  },
  scaffoldFloatAdoptedFrame: {
    ...HAIRLINE,
    borderColor: tokens['--jx-primary'],
    marginTop: tokens['--jx-space-8'],
    paddingInline: tokens['--jx-space-8'],
    paddingBlock: tokens['--jx-space-8'],
  },
  scaffoldFloatAdopted: {
    backgroundColor: tokens['--jx-primary'],
    color: tokens['--jx-primary-foreground'],
    fontFamily: tokens['--jx-font-nav'],
    paddingInline: tokens['--jx-space-8'],
    paddingBlock: tokens['--jx-space-4'],
    fontSize: tokens['--jx-text-micro'],
  },
  scaffoldFloatAdoptedDot: {
    ...HAIRLINE,
    height: '6px',
    width: '6px',
    flex: 'none',
    borderColor: 'currentcolor',
  },
  scaffoldFloatCaption: {
    ...LABEL_VOICE,
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-micro'],
    letterSpacing: tokens['--jx-track-18'],
  },

  // ── scroll-area: hand-drawn law + platform sibling ─────────────
  scrollAreaStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  scrollAreaRail: {
    width: '300px',
    flex: 'none',
  },
  scrollAreaLabel: {
    ...LABEL_VOICE,
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-micro'],
    letterSpacing: tokens['--jx-track-label'],
  },
  scrollAreaPort: {
    ...HAIRLINE,
    borderColor: tokens['--jx-border'],
    position: 'relative',
    height: '210px',
  },
  scrollAreaListPad: {
    height: '100%',
    paddingInline: tokens['--jx-space-14'],
    paddingBlock: tokens['--jx-space-8'],
  },
  scrollAreaListSlim: {
    height: '100%',
    paddingInline: tokens['--jx-space-8'],
    paddingBlock: tokens['--jx-space-8'],
  },
  scrollAreaRow: {
    ...MUTED_MIX_40, ...HAIRLINE,
    borderColor: 'color-mix(in oklab, var(--border) 40%, transparent)',
    marginBottom: tokens['--jx-space-6'],
    paddingInline: tokens['--jx-space-8'],
    paddingBlock: tokens['--jx-space-10'],
    fontSize: 'calc(var(--jx-text-base) - var(--jx-unit) * 0.625)',
  },
  scrollAreaRowLit: { opacity: 1 },
  scrollAreaRowDim: { opacity: 0.8 },
  scrollAreaRowFaint: { opacity: 0.6 },
  scrollAreaThumb: {
    backgroundColor: tokens['--jx-primary'],
    position: 'absolute',
    right: tokens['--jx-space-4'],
    top: '46px',
    height: '64px',
    width: '9px',
    borderRadius: 'calc(infinity * 1px)',
    opacity: 0.8,
  },
  scrollAreaBar: {
    backgroundColor: tokens['--jx-primary'],
    position: 'absolute',
    bottom: tokens['--jx-space-4'],
    right: tokens['--jx-space-2'],
    top: tokens['--jx-space-4'],
    width: '9px',
    opacity: 0.8,
  },
  scrollAreaGutter: {
    ...HAIRLINE,
    borderColor: 'color-mix(in oklab, var(--border) 50%, transparent)',
    position: 'absolute',
    bottom: tokens['--jx-space-4'],
    left: tokens['--jx-space-2'],
    top: tokens['--jx-space-4'],
    width: '9px',
  },
  scrollAreaCaption: {
    color: tokens['--jx-primary'],
    fontFamily: tokens['--jx-font-nav'],
    position: 'absolute',
    bottom: tokens['--jx-space-8'],
    left: tokens['--jx-space-10'],
    fontSize: tokens['--jx-text-caption'],
  },

  // ── scroll-run: the strip mid-travel, verdict stamped ──────────
  scrollRunStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  scrollRunLabel: {
    ...LABEL_VOICE,
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-micro'],
    letterSpacing: tokens['--jx-track-label'],
  },
  scrollRunHost: {
    ...HAIRLINE,
    borderColor: tokens['--jx-border'],
    display: 'grid',
    width: '460px',
    gridTemplateColumns: 'minmax(0, 1fr)',
  },
  scrollRunRun: {
    paddingInline: tokens['--jx-space-12'],
    paddingBlock: tokens['--jx-space-12'],
  },
  scrollRunChip: {
    ...HAIRLINE,
    borderColor: 'color-mix(in oklab, var(--border) 60%, transparent)',
    backgroundColor: 'color-mix(in oklab, var(--muted) 30%, transparent)',
    flex: 'none',
    paddingInline: tokens['--jx-space-10'],
    paddingBlock: tokens['--jx-space-6'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'calc(var(--jx-text-base) - var(--jx-unit) * 0.625)',
  },
  scrollRunChipFar: { opacity: 0.4 },
  scrollRunChipMid: { opacity: 0.7 },
  scrollRunChipNear: { opacity: 0.95 },
  scrollRunChipPrimary: { color: tokens['--jx-primary'] },
  scrollRunChipMuted: { color: tokens['--jx-muted-foreground'] },
  scrollRunVeil: {
    pointerEvents: 'none',
    zIndex: 1,
    gridColumnStart: 1,
    gridRowStart: 1,
    height: '52px',
    alignSelf: 'center',
    justifySelf: 'flex-end',
  },
  scrollRunVeilA: {
    position: 'absolute',
    insetBlock: 0,
    right: 0,
    width: '16px',
    backgroundImage:
      'linear-gradient(to left in oklab, color-mix(in oklab, var(--background) 95%, transparent) 0%, transparent 100%)',
  },
  scrollRunVeilB: {
    position: 'absolute',
    insetBlock: 0,
    right: 0,
    width: '12px',
    backgroundImage:
      'linear-gradient(to left in oklab, color-mix(in oklab, var(--background) 80%, transparent) 0%, transparent 100%)',
  },
  scrollRunVeilC: {
    position: 'absolute',
    insetBlock: 0,
    right: 0,
    width: '8px',
    backgroundImage:
      'linear-gradient(to left in oklab, color-mix(in oklab, var(--background) 60%, transparent) 0%, transparent 100%)',
  },
  scrollRunVeilD: {
    position: 'absolute',
    insetBlock: 0,
    right: 0,
    width: '4px',
    backgroundImage:
      'linear-gradient(to left in oklab, color-mix(in oklab, var(--background) 40%, transparent) 0%, transparent 100%)',
  },
  // the arbitrary 1px 1px 2px rgba(0,0,0,0.2) rides the nearest
  // hard-offset rung (--jx-shadow-2xs) — seam-reported
  scrollRunChipBtn: {
    ...HAIRLINE,
    borderColor: 'color-mix(in oklab, var(--border) 60%, transparent)',
    backgroundColor: 'color-mix(in oklab, var(--background) 80%, transparent)',
    zIndex: 2,
    gridColumnStart: 1,
    gridRowStart: 1,
    marginBlock: 'auto',
    marginInlineEnd: 'calc(var(--space-8) * -1)',
    height: '26px',
    width: '26px',
    flex: 'none',
    boxShadow: tokens['--jx-shadow-2xs'],
  },
  scrollRunIcon: { color: tokens['--jx-foreground'] },
  scrollRunCaption: {
    color: tokens['--jx-primary'],
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-caption'],
  },

  // ── scroll-spy: the plain line-pick ────────────────────────────
  scrollSpyStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  scrollSpyBoard: {
    ...HAIRLINE,
    borderColor: tokens['--jx-border'],
    position: 'relative',
    height: '236px',
    width: '248px',
    flex: 'none',
  },
  scrollSpyBoardLabel: {
    ...LABEL_VOICE,
    color: tokens['--jx-muted-foreground'],
    position: 'absolute',
    left: tokens['--jx-space-8'],
    top: tokens['--jx-space-6'],
    fontSize: tokens['--jx-text-caption'],
    letterSpacing: tokens['--jx-track-20'],
  },
  scrollSpyStack: {
    marginTop: tokens['--jx-space-24'],
  },
  scrollSpyRow: {
    borderColor: tokens['--jx-border'],
    borderTopWidth: 'var(--hairline)',
    borderBottomWidth: 'var(--hairline)',
    borderStyle: 'solid',
    paddingInline: tokens['--jx-space-12'],
    paddingBlock: tokens['--jx-space-16'],
  },
  scrollSpyRowHeld: { backgroundColor: 'color-mix(in oklab, var(--muted) 60%, transparent)' },
  scrollSpyRowPlain: { backgroundColor: 'transparent' },
  scrollSpyRowLabel: {
    fontFamily: tokens['--jx-font-nav'],
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-micro'],
  },
  scrollSpyRowLabelHeld: { color: tokens['--jx-foreground'] },
  scrollSpyLine: {
    borderColor: tokens['--jx-primary'],
    position: 'absolute',
    insetInline: 0,
    top: '92px',
    borderTopWidth: 'calc(var(--hairline) * 2)',
    borderTopStyle: 'solid',
  },
  scrollSpyLineLabel: {
    color: tokens['--jx-primary'],
    fontFamily: tokens['--jx-font-nav'],
    position: 'absolute',
    right: tokens['--jx-space-4'],
    top: '98px',
    fontSize: tokens['--jx-text-caption'],
  },
  scrollSpyList: {
    display: 'flex',
    width: '150px',
    flex: 'none',
    flexDirection: 'column',
    gap: tokens['--jx-space-12'],
  },
  scrollSpyListLabel: {
    ...LABEL_VOICE,
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-micro'],
    letterSpacing: tokens['--jx-track-label'],
  },
  scrollSpyPickHeld: {
    color: tokens['--jx-primary'],
    borderColor: tokens['--jx-primary'],
    fontFamily: tokens['--jx-font-nav'],
    borderLeftWidth: 'calc(var(--hairline) * 2)',
    borderLeftStyle: 'solid',
    paddingInlineStart: tokens['--jx-space-8'],
    fontSize: tokens['--jx-text-label'],
    fontWeight: tokens['--jx-weight-bold'],
  },
  scrollSpyPickPlain: {
    fontFamily: tokens['--jx-font-nav'],
    color: tokens['--jx-muted-foreground'],
    paddingInlineStart: tokens['--jx-space-8'],
    fontSize: tokens['--jx-text-label'],
  },

  // ── scroll-virtual: the window ─────────────────────────────────
  scrollVirtualStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  scrollVirtualBoard: {
    ...HAIRLINE,
    borderColor: tokens['--jx-border'],
    position: 'relative',
    height: '236px',
    width: '248px',
    flex: 'none',
  },
  scrollVirtualBoardLabel: {
    ...LABEL_VOICE,
    color: tokens['--jx-muted-foreground'],
    position: 'absolute',
    left: tokens['--jx-space-8'],
    top: tokens['--jx-space-6'],
    fontSize: tokens['--jx-text-caption'],
    letterSpacing: tokens['--jx-track-20'],
  },
  scrollVirtualFaded: {
    marginTop: tokens['--jx-space-24'],
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(var(--space-2) + 1px)',
    paddingInline: tokens['--jx-space-16'],
    opacity: 0.4,
  },
  scrollVirtualFadedRow: {
    ...HAIRLINE,
    borderColor: 'color-mix(in oklab, var(--border) 40%, transparent)',
    height: '10px',
    width: '100%',
  },
  scrollVirtualWindow: {
    borderColor: tokens['--jx-primary'],
    position: 'absolute',
    insetInline: tokens['--jx-space-8'],
    top: '88px',
    height: '92px',
    borderWidth: 'calc(var(--hairline) * 2)',
    borderStyle: 'solid',
    backgroundColor: tokens['--jx-background'],
  },
  scrollVirtualWindowInner: {
    display: 'flex',
    height: '100%',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 'calc(var(--space-2) + 1px)',
    paddingInline: tokens['--jx-space-8'],
  },
  scrollVirtualRow: {
    backgroundColor: 'color-mix(in oklab, var(--muted) 60%, transparent)',
    color: tokens['--jx-foreground'],
    paddingInline: tokens['--jx-space-8'],
    paddingBlock: 'calc(var(--space-4) - 1px)',
    fontSize: 'calc(var(--jx-text-base) - var(--jx-unit) * 0.875)',
  },
  scrollVirtualOverscanUp: {
    color: tokens['--jx-primary'],
    fontFamily: tokens['--jx-font-nav'],
    position: 'absolute',
    right: tokens['--jx-space-6'],
    top: '76px',
    fontSize: tokens['--jx-text-caption'],
  },
  scrollVirtualOverscanDown: {
    color: tokens['--jx-primary'],
    fontFamily: tokens['--jx-font-nav'],
    position: 'absolute',
    bottom: tokens['--jx-space-6'],
    right: tokens['--jx-space-6'],
    fontSize: tokens['--jx-text-caption'],
  },
  scrollVirtualFacts: {
    width: '300px',
    flex: 'none',
  },
  scrollVirtualFactsLabel: {
    ...LABEL_VOICE,
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-micro'],
    letterSpacing: tokens['--jx-track-label'],
  },
  scrollVirtualFactRow: {
    ...HAIRLINE,
    borderColor: tokens['--jx-border'],
    paddingInline: tokens['--jx-space-12'],
    paddingBlock: tokens['--jx-space-8'],
  },
  scrollVirtualFactKey: { color: tokens['--jx-foreground'], fontSize: tokens['--jx-text-label'] },
  scrollVirtualFactValue: { color: tokens['--jx-muted-foreground'], fontSize: tokens['--jx-text-micro'] },

  // ── scrollbar-measure: the shadow-DOM probe ────────────────────
  scrollbarMeasureStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  scrollbarMeasureChamber: {
    ...HAIRLINE,
    borderColor: tokens['--jx-border'],
    position: 'relative',
    height: '236px',
    width: '300px',
    flex: 'none',
  },
  scrollbarMeasureLabel: {
    ...LABEL_VOICE,
    color: tokens['--jx-muted-foreground'],
    position: 'absolute',
    left: tokens['--jx-space-8'],
    top: tokens['--jx-space-6'],
    fontSize: tokens['--jx-text-caption'],
    letterSpacing: tokens['--jx-track-20'],
  },
  scrollbarMeasureRow: {
    marginTop: tokens['--jx-space-24'],
    paddingInline: tokens['--jx-space-12'],
  },
  scrollbarMeasureCell: {
    ...HAIRLINE,
    borderColor: tokens['--jx-border'],
    position: 'relative',
    height: '150px',
    width: '120px',
    backgroundColor: 'color-mix(in oklab, var(--muted) 30%, transparent)',
  },
  scrollbarMeasureCellLabel: {
    fontFamily: tokens['--jx-font-nav'],
    color: tokens['--jx-muted-foreground'],
    position: 'absolute',
    bottom: tokens['--jx-space-4'],
    left: tokens['--jx-space-4'],
    fontSize: tokens['--jx-text-caption'],
  },
  scrollbarMeasureThinBar: {
    backgroundColor: tokens['--jx-primary'],
    position: 'absolute',
    bottom: tokens['--jx-space-4'],
    right: tokens['--jx-space-2'],
    top: tokens['--jx-space-4'],
    width: '9px',
    opacity: 0.8,
  },
  scrollbarMeasureAutoBar: {
    backgroundColor: 'color-mix(in oklab, var(--foreground) 70%, transparent)',
    position: 'absolute',
    bottom: tokens['--jx-space-4'],
    right: tokens['--jx-space-2'],
    top: tokens['--jx-space-4'],
    width: '13px',
  },
  scrollbarMeasureRulerNarrow: {
    borderColor: 'color-mix(in oklab, var(--border) 60%, transparent)',
    position: 'absolute',
    insetBlock: tokens['--jx-space-4'],
    left: tokens['--jx-space-4'],
    right: tokens['--jx-space-12'],
    borderTopWidth: 'var(--hairline)',
    borderBottomWidth: 'var(--hairline)',
    borderStyle: 'solid',
  },
  scrollbarMeasureRulerWide: {
    borderColor: 'color-mix(in oklab, var(--border) 60%, transparent)',
    position: 'absolute',
    insetBlock: tokens['--jx-space-4'],
    left: tokens['--jx-space-4'],
    right: tokens['--jx-space-14'],
    borderTopWidth: 'var(--hairline)',
    borderBottomWidth: 'var(--hairline)',
    borderStyle: 'solid',
  },
  scrollbarMeasureCaption: {
    color: tokens['--jx-primary'],
    fontFamily: tokens['--jx-font-nav'],
    position: 'absolute',
    bottom: tokens['--jx-space-8'],
    right: tokens['--jx-space-8'],
    fontSize: tokens['--jx-text-caption'],
  },
  scrollbarMeasureVars: {
    width: '330px',
    flex: 'none',
  },
  scrollbarMeasureVarsLabel: {
    ...LABEL_VOICE,
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-micro'],
    letterSpacing: tokens['--jx-track-label'],
  },
  scrollbarMeasureVarRow: {
    ...HAIRLINE,
    borderColor: tokens['--jx-border'],
    paddingInline: tokens['--jx-space-12'],
    paddingBlock: tokens['--jx-space-10'],
  },
  scrollbarMeasureVarKey: { color: tokens['--jx-foreground'], fontSize: tokens['--jx-text-label-lg'] },
  scrollbarMeasureVarValue: { color: tokens['--jx-primary'], fontSize: tokens['--jx-text-label-lg'] },
  scrollbarMeasureVarNote: {
    color: tokens['--jx-muted-foreground'],
    marginTop: 'calc(var(--space-8) * -1)',
    paddingInlineStart: tokens['--jx-space-4'],
    fontSize: 'calc(var(--jx-text-base) - var(--jx-unit) * 0.875)',
  },

  // ── search-corpus: the structured harvest ──────────────────────
  searchCorpusStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-32'],
  },
  searchCorpusCard: {
    ...HAIRLINE,
    width: '100%',
    maxWidth: '42rem',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
    padding: tokens['--jx-space-24'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'var(--jx-text-base)',
    lineHeight: tokens['--jx-space-24'],
  },
  searchCorpusHead: {
    borderBottomWidth: 'var(--hairline)',
    borderBottomStyle: 'solid',
    borderColor: tokens['--jx-border'],
    paddingBottom: tokens['--jx-space-12'],
  },
  searchCorpusTitle: {
    fontWeight: tokens['--jx-weight-bold'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-10'],
    color: tokens['--jx-primary'],
  },
  searchCorpusTag: {
    fontSize: tokens['--jx-text-label'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-10'],
    color: tokens['--jx-muted-foreground'],
  },
  searchCorpusGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    gap: tokens['--jx-space-16'],
  },
  searchCorpusTree: { color: tokens['--jx-muted-foreground'] },
  searchCorpusArrow: { color: tokens['--jx-primary'] },
  searchCorpusFoot: {
    borderTopWidth: 'var(--hairline)',
    borderTopStyle: 'solid',
    borderColor: tokens['--jx-border'],
    paddingTop: tokens['--jx-space-12'],
    fontSize: tokens['--jx-text-label'],
    color: tokens['--jx-muted-foreground'],
  },

  // ── section-card: the content atom ─────────────────────────────
  sectionCardStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  sectionCardCard: { width: '100%', maxWidth: '420px' },


  // ── select: the rich listbox stage ─────────────────────────────
  selectStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  selectCard: { width: '100%', maxWidth: '400px' },

  // ── separator: thematic break + vertical posture ───────────────
  separatorStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  separatorText: { fontSize: tokens['--jx-text-sm'], lineHeight: tokens['--jx-space-20'] },

  separatorVertical: { height: '32px' },

  // ── sheet: the right drawer over a muted page ──────────────────
  sheetStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
    opacity: 0.7,
  },
  sheetSkelA: { height: '16px', width: '66.666667%' },
  sheetSkelB: { height: '12px', width: '50%' },
  sheetSkelC: { height: '12px', width: '60%' },
  sheetBody: {
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-sm'],
    lineHeight: tokens['--jx-space-24'],
  },

  sheetFormLabel: {
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-label-lg'],
    lineHeight: tokens['--jx-space-16'],
    color: tokens['--jx-muted-foreground'],
  },
  sheetFieldValue: {
    ...HAIRLINE,
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-background'],
    paddingInline: tokens['--jx-space-12'],
    paddingBlock: tokens['--jx-space-8'],
    fontSize: tokens['--jx-text-sm'],
    lineHeight: tokens['--jx-space-20'],
  },

  // ── shiki: the lib's consumer surface ──────────────────────────
  shikiStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  shikiCard: { width: '100%', maxWidth: '520px' },


  // ── skeleton: the page-shaped placeholder ──────────────────────
  skeletonStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  skeletonHead: { height: '24px', width: '40%' },
  skeletonLineA: { height: '12px', width: '80%' },
  skeletonLineB: { height: '12px', width: '60%' },
  skeletonPair: {
    marginTop: tokens['--jx-space-8'],
  },
  skeletonTile: { height: '96px', width: '50%' },
  skeletonTail: { height: '36px', width: '128px' },

  // ── spin: the one-name lane in three postures ──────────────────
  spinStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  spinFramed: {
    ...HAIRLINE,
    borderColor: tokens['--jx-border'],
  },
  spinBody: {
    color: tokens['--jx-muted-foreground'],
    padding: tokens['--jx-space-24'],
    fontSize: tokens['--jx-text-sm'],
    lineHeight: tokens['--jx-space-20'],
  },

  // ── statistic: three metric readouts ───────────────────────────
  statisticStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  statisticDivider: { backgroundColor: tokens['--jx-border'], height: '56px', width: 'var(--hairline)' },

  // ── steps: the wizard at step 2 of 4 ───────────────────────────
  stepsStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },

  // ── system-dialog: the destructive decision ────────────────────
  systemDialogStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
    opacity: 0.7,
  },
  systemDialogSkelA: { height: '16px', width: '60%' },
  systemDialogSkelB: { height: '12px', width: '66.666667%' },
  systemDialogSkelC: { height: '12px', width: '50%' },

  // ── table: a dense semantic table ──────────────────────────────
  tableStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },

  // ── tabs: the indicator system ─────────────────────────────────
  tabsStage: {
    display: 'flex',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    gap: 'calc(var(--space-40) * 2)',
    padding: tokens['--jx-space-40'],
  },
  tabsCol: {
    minWidth: 0,
    flex: '1 1 0%',
  },
  tabsGlassChip: { borderRadius: 0, padding: tokens['--jx-space-16'] },
  tabsSidebar: { flex: 'none' },
  tabsSidebarList: { minWidth: '10rem' },

  // ── tags-input: chips bound ────────────────────────────────────
  tagsInputStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  tagsInputCol: {
    width: '100%',
    maxWidth: '460px',
  },

  // ── terminal-card: the Broadside hero terminal ─────────────────
  terminalCardStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  terminalCardCard: { width: '100%', maxWidth: '480px' },

  // ── terminal-footer: the ghost wordmark close ──────────────────
  terminalFooterStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-32'],
  },
  terminalFooterSkel: {
    opacity: 0.5,
  },
  terminalFooterSkelA: { height: '12px', width: '50%' },
  terminalFooterSkelB: { height: '12px', width: '66.666667%' },

  // ── terminal-header: the CRT nav bar ───────────────────────────
  terminalHeaderStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  terminalHeaderNav: { flexWrap: 'nowrap', alignItems: 'center', gap: 0 },
  terminalHeaderSkel: {
    opacity: 0.6,
  },
  terminalHeaderSkelA: { height: '16px', width: '66.666667%' },
  terminalHeaderSkelB: { height: '12px', width: '50%' },
  terminalHeaderSkelC: { height: '12px', width: '60%' },
  // the bezel's pill paint: the one lg:px-3 media seam of the batch,
  // a media value object at Tailwind's own 64rem threshold
  terminalHeaderPill: {
    paddingInline: {
      default: tokens['--jx-space-10'],
      '@media (min-width: 64rem)': tokens['--jx-space-12'],
    },
    paddingBlock: tokens['--jx-space-4'],
  },
  terminalHeaderPillCurrent: { color: tokens['--jx-terminal-foreground'] },
  terminalHeaderPillDim: {
    color: {
      default: 'color-mix(in oklab, var(--terminal-foreground) 70%, transparent)',
      ':hover': tokens['--jx-terminal-foreground'],
    },
  },
  terminalHeaderExt: {
    display: 'inline-flex',
    flex: 'none',
    marginInlineStart: tokens['--jx-space-4'],
    verticalAlign: '-0.125em',
  },

  // ── text: the mark matrix ──────────────────────────────────────
  textStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  textBody: {
    margin: 0,
    maxWidth: '520px',
    textAlign: 'left',
    fontSize: tokens['--jx-text-body-xl'],
    lineHeight: tokens['--jx-space-32'],
  },


  // ── textarea: the slotted shell ────────────────────────────────
  textareaStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  textareaCard: { width: '100%', maxWidth: '480px' },

  // ── theme-toggle: four variants on the bezel ───────────────────
  themeToggleStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  themeToggleBezel: {
    ...HAIRLINE,
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-terminal'],
    color: tokens['--jx-terminal-foreground'],
    width: '100%',
    maxWidth: '440px',
    padding: tokens['--jx-space-24'],
  },
  themeToggleRowDivided: {
    borderColor: 'color-mix(in oklab, var(--terminal-foreground) 10%, transparent)',
    borderTopWidth: 'var(--hairline)',
    borderTopStyle: 'solid',
    paddingTop: tokens['--jx-space-16'],
  },
  themeToggleLabel: {
    ...LABEL_VOICE,
    fontSize: tokens['--jx-text-micro'],
    letterSpacing: tokens['--jx-track-label'],
    opacity: 0.6,
  },

  // ── timeline: the activity stream ──────────────────────────────
  timelineStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  timelineBody: {
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-label-lg'],
    lineHeight: tokens['--jx-space-20'],
  },

  // ── toast: the corner viewport ─────────────────────────────────
  toastStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  toastSkel: {
    opacity: 0.6,
  },
  toastSkelA: { height: '16px', width: '66.666667%' },
  toastSkelB: { height: '12px', width: '50%' },
  toastSkelC: { height: '12px', width: '60%' },

  // ── toc-engine: the geometry engine diagram ────────────────────
  tocEngineStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  tocEngineDoc: {
    borderColor: 'color-mix(in oklab, var(--primary) 70%, transparent)',
    position: 'relative',
    height: '236px',
    width: '264px',
    flex: 'none',
    borderWidth: 'calc(var(--hairline) * 2)',
    borderStyle: 'dashed',
  },
  tocEngineViewportTag: {
    ...LABEL_VOICE,
    backgroundColor: tokens['--jx-primary'],
    color: tokens['--jx-primary-foreground'],
    position: 'absolute',
    top: 0,
    left: 0,
    paddingInline: tokens['--jx-space-6'],
    paddingBlock: tokens['--jx-space-2'],
    fontSize: tokens['--jx-text-caption'],
    letterSpacing: tokens['--jx-track-14'],
  },
  tocEngineLine: {
    borderColor: tokens['--jx-primary'],
    position: 'absolute',
    insetInline: 0,
    top: 'calc(var(--space-24) + var(--space-4))',
    borderTopWidth: 'calc(var(--hairline) * 2)',
    borderTopStyle: 'solid',
  },
  tocEngineLineLabel: {
    color: tokens['--jx-primary'],
    fontFamily: tokens['--jx-font-nav'],
    position: 'absolute',
    top: '31px',
    right: tokens['--jx-space-4'],
    fontSize: tokens['--jx-text-caption'],
  },
  tocEngineBlockAbove: {
    ...MUTED_MIX_40, ...HAIRLINE,
    borderColor: tokens['--jx-border'],
    position: 'absolute',
    insetInline: tokens['--jx-space-12'],
    top: '44px',
    height: '36px',
    paddingTop: tokens['--jx-space-4'],
    paddingInlineStart: tokens['--jx-space-8'],
  },
  tocEngineBlockTag: {
    color: tokens['--jx-muted-foreground'],
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-caption'],
  },
  tocEngineBlockStraddle: {
    ...HAIRLINE,
    borderColor: tokens['--jx-border'],
    backgroundColor: 'color-mix(in oklab, var(--muted) 70%, transparent)',
    position: 'absolute',
    insetInline: tokens['--jx-space-12'],
    top: '84px',
    height: '88px',
    paddingTop: tokens['--jx-space-4'],
    paddingInlineStart: tokens['--jx-space-8'],
  },
  tocEngineBlockTitle: { fontFamily: tokens['--jx-font-nav'], fontSize: tokens['--jx-text-micro'] },
  tocEngineBlockBody: {
    color: tokens['--jx-muted-foreground'],
    marginTop: tokens['--jx-space-8'],
    paddingInline: tokens['--jx-space-8'],
    fontSize: tokens['--jx-text-micro'],
    lineHeight: tokens['--jx-space-16'],
  },
  tocEngineBlockBelow: {
    ...MUTED_MIX_40, ...HAIRLINE,
    borderColor: tokens['--jx-border'],
    position: 'absolute',
    insetInline: tokens['--jx-space-12'],
    bottom: tokens['--jx-space-8'],
    height: '44px',
    paddingTop: tokens['--jx-space-4'],
    paddingInlineStart: tokens['--jx-space-8'],
  },
  tocEngineRail: {
    width: '168px',
    flex: 'none',
  },
  tocEngineRailLabel: {
    ...LABEL_VOICE,
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-micro'],
    letterSpacing: tokens['--jx-track-label'],
  },

  tocEngineSwatch: {
    height: '10px',
    width: '10px',
    flex: 'none',
    borderWidth: 'calc(var(--hairline) * 2)',
    borderStyle: 'solid',
  },
  // the swatch/ink poses fold the former class: directive cluster
  // into ternary atoms (the pilot's expression-slot ruling)
  tocEngineSwatchPicked: {
    borderColor: tokens['--jx-primary'],
    backgroundColor: tokens['--jx-primary'],
  },
  tocEngineSwatchPlain: { borderColor: tokens['--jx-border'], backgroundColor: 'transparent' },
  tocEngineRailItem: { fontFamily: tokens['--jx-font-nav'], fontSize: tokens['--jx-text-label'] },
  tocEngineRailItemPicked: { color: tokens['--jx-primary'], fontWeight: tokens['--jx-weight-bold'] },
  tocEngineRailItemPlain: { color: tokens['--jx-muted-foreground'] },
  tocEngineRailWeight: {
    color: tokens['--jx-muted-foreground'],
    fontFamily: tokens['--jx-font-nav'],
    marginInlineStart: 'auto',
    fontSize: tokens['--jx-text-caption'],
  },
  tocEnginePick: {
    ...LABEL_VOICE,
    color: tokens['--jx-primary'],
    fontSize: tokens['--jx-text-caption'],
    letterSpacing: tokens['--jx-track-14'],
  },

  // ── toc-outline: the metadata export ───────────────────────────
  tocOutlineStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  tocOutlineRoot: {
    ...HAIRLINE,
    borderColor: tokens['--jx-border'],
    position: 'relative',
    height: '236px',
    width: '248px',
    flex: 'none',
  },
  tocOutlineRootLabel: {
    ...LABEL_VOICE,
    color: tokens['--jx-muted-foreground'],
    position: 'absolute',
    left: tokens['--jx-space-8'],
    top: tokens['--jx-space-6'],
    fontSize: tokens['--jx-text-caption'],
    letterSpacing: tokens['--jx-track-20'],
  },
  tocOutlineTree: {
    marginTop: 'calc(var(--space-24) + var(--space-4))',
    paddingInline: tokens['--jx-space-16'],
  },
  tocOutlineH2: {
    color: tokens['--jx-foreground'],
    fontSize: tokens['--jx-text-body-lg'],
    fontWeight: tokens['--jx-weight-semibold'],
  },
  tocOutlineH2Spaced: {
    color: tokens['--jx-foreground'],
    marginTop: tokens['--jx-space-4'],
    fontSize: tokens['--jx-text-body-lg'],
    fontWeight: tokens['--jx-weight-semibold'],
  },
  tocOutlineH3Nest: {
    borderColor: 'color-mix(in oklab, var(--border) 50%, transparent)',
    marginInlineStart: tokens['--jx-space-8'],
    borderLeftWidth: 'var(--hairline)',
    borderLeftStyle: 'solid',
    paddingInlineStart: tokens['--jx-space-12'],
  },
  tocOutlineH3: {
    color: 'color-mix(in oklab, var(--foreground) 80%, transparent)',
    fontSize: 'calc(var(--jx-text-base) - var(--jx-unit) * 0.375)',
  },
  tocOutlineExtent: {
    borderColor: tokens['--jx-primary'],
    position: 'absolute',
    bottom: tokens['--jx-space-24'],
    left: tokens['--jx-space-4'],
    top: '58px',
    width: '3px',
    opacity: 0.7,
  },
  tocOutlineExtentLabel: {
    color: tokens['--jx-primary'],
    fontFamily: tokens['--jx-font-nav'],
    position: 'absolute',
    bottom: tokens['--jx-space-8'],
    left: tokens['--jx-space-12'],
    fontSize: tokens['--jx-text-caption'],
  },
  tocOutlineRail: {
    width: '300px',
    flex: 'none',
  },
  tocOutlineRailLabel: {
    ...LABEL_VOICE,
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-micro'],
    letterSpacing: tokens['--jx-track-label'],
  },
  tocOutlineRow: {
    ...HAIRLINE,
    borderColor: tokens['--jx-border'],
    paddingInline: tokens['--jx-space-12'],
    paddingBlock: tokens['--jx-space-8'],
  },
  // the level-3 indent pose (the former template-literal tail)
  tocOutlineRowNested: {
    marginInlineStart: tokens['--jx-space-24'],
    backgroundColor: 'color-mix(in oklab, var(--muted) 30%, transparent)',
  },
  tocOutlineRowId: { color: tokens['--jx-primary'], fontSize: tokens['--jx-text-label'] },
  tocOutlineRowLabel: {
    color: tokens['--jx-foreground'],
    fontSize: 'calc(var(--jx-text-base) - var(--jx-unit) * 0.375)',
  },
  tocOutlineRowLevel: {
    color: tokens['--jx-muted-foreground'],
    marginInlineStart: 'auto',
    fontSize: tokens['--jx-text-caption'],
  },
  tocOutlineFoot: {
    color: tokens['--jx-muted-foreground'],
    paddingInlineStart: tokens['--jx-space-4'],
    fontSize: 'calc(var(--jx-text-base) - var(--jx-unit) * 0.875)',
  },

  // ── toc: the Combo ToC in a miniature docs page ────────────────
  tocStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  tocArticle: {
    display: 'flex',
    minWidth: 0,
    flex: '1 1 0%',
    flexDirection: 'column',
    gap: tokens['--jx-space-20'],
  },

  tocSection: { display: 'flex', flexDirection: 'column', gap: tokens['--jx-space-8'] },
  tocH2: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-sm'],
    lineHeight: tokens['--jx-space-20'],
    letterSpacing: tokens['--jx-track-tight'],
  },
  tocH3: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--jx-text-base)',
    letterSpacing: tokens['--jx-track-tight'],
  },
  tocBody: {
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-small'],
    lineHeight: tokens['--jx-space-20'],
  },
  tocAside: { width: '172px', flex: 'none' },

  // ── toggle-group: the joined-button set ────────────────────────
  toggleGroupStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },


  // ── toggle: the inline-end switch ──────────────────────────────
  toggleStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  toggleCol: {
    width: '100%',
    maxWidth: '360px',
  },

  // ── tokens: the typed-mirror board's eyebrow (the phase-0 pilot
  //    scene's last utility line) ─────────────────────────────────
  tokensEyebrow: {
    ...LABEL_VOICE,
    fontSize: tokens['--jx-text-micro'],
    letterSpacing: tokens['--jx-track-20'],
    color: tokens['--jx-muted-foreground'],
  },

  // ── tooltip: hover-intent tips forced shown ────────────────────
  tooltipStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  tooltipSkel: {
    opacity: 0.6,
  },
  tooltipSkelA: { height: '12px', width: '50%' },
  tooltipSkelB: { height: '12px', width: '66.666667%' },

  tooltipTrigger: {
    ...HAIRLINE,
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-background'],
    fontSize: tokens['--jx-text-sm'],
    lineHeight: tokens['--jx-space-20'],
    boxShadow: tokens['--jx-shadow-xs'],
    display: 'inline-flex',
    paddingInline: tokens['--jx-space-14'],
    paddingBlock: tokens['--jx-space-10'],
  },
  tooltipIconFrame: { display: 'inline-flex' },

  // ── tour: step 1 of 2 against real targets ─────────────────────
  tourStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  tourCard: {
    ...HAIRLINE,
    width: '100%',
    maxWidth: '420px',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
    padding: tokens['--jx-space-20'],
  },

  tourLabel: {
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-label-lg'],
    lineHeight: tokens['--jx-space-16'],
    color: tokens['--jx-muted-foreground'],
  },
  tourValue: {
    fontSize: tokens['--jx-text-sm'],
    lineHeight: tokens['--jx-space-20'],
    fontWeight: tokens['--jx-weight-medium'],
  },

  // ── transfer: mid-move between the fieldsets ───────────────────
  transferStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  transferFull: { width: '100%' },

  // ── tree-view: the file workbench pane ─────────────────────────
  treeViewStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  treeViewPane: {
    ...HAIRLINE,
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
    width: '100%',
    maxWidth: '360px',
    padding: tokens['--jx-space-16'],
    boxShadow: tokens['--jx-shadow-2xs'],
  },

  // ── typography: the scope lib's plugin chain ───────────────────
  typographyStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  typographyKey: {
    ...LABEL_VOICE,
    fontSize: tokens['--jx-text-micro'],
    letterSpacing: tokens['--jx-track-20'],
    color: tokens['--jx-muted-foreground'],
  },
  typographyNode: {
    ...HAIRLINE,
    width: '10.5rem',
    borderRadius: 0,
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
    paddingInline: tokens['--jx-space-12'],
    paddingBlock: tokens['--jx-space-8'],
  },
  typographyNodeName: { fontFamily: tokens['--jx-font-mono'], fontSize: tokens['--jx-text-label-lg'] },
  typographyNodeNote: { fontSize: tokens['--jx-text-micro'], color: tokens['--jx-muted-foreground'] },
  typographyApply: {
    width: '3rem',
    fontSize: tokens['--jx-text-micro'],
    color: tokens['--jx-muted-foreground'],
  },
  typographyApplyArrow: { fontSize: 'var(--jx-text-base)' },
  typographyArrow: {
    width: '1.25rem',
    fontSize: 'var(--jx-text-base)',
    color: tokens['--jx-muted-foreground'],
  },

  // ── utils: the cn() hygiene law diagram ────────────────────────
  utilsStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-sm'],
    lineHeight: tokens['--jx-space-20'],
  },
  utilsComment: { color: tokens['--jx-muted-foreground'] },
  utilsCode: {
    ...HAIRLINE,
    borderRadius: 0,
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-muted'],
    paddingInline: tokens['--jx-space-8'],
    paddingBlock: tokens['--jx-space-4'],
    boxShadow: tokens['--jx-shadow-2xs'],
  },
  utilsAccent: { color: tokens['--jx-accent'] },
  utilsResult: { color: tokens['--jx-primary'] },

  // ── website-scaffold: the grid shell diagram ───────────────────
  websiteScaffoldStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  websiteScaffoldFrame: {
    ...HAIRLINE,
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-background'],
  },
  websiteScaffoldHostBar: {
    padding: tokens['--jx-space-12'],
    paddingBottom: tokens['--jx-space-8'],
  },
  websiteScaffoldHostKey: {
    ...LABEL_VOICE,
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-caption'],
    letterSpacing: tokens['--jx-track-20'],
  },
  websiteScaffoldHostForms: {
    ...LABEL_VOICE,
    color: tokens['--jx-primary'],
    fontSize: tokens['--jx-text-caption'],
    letterSpacing: tokens['--jx-track-20'],
  },
  websiteScaffoldGridFrame: {
    ...HAIRLINE,
    borderColor: tokens['--jx-border'],
    padding: tokens['--jx-space-8'],
  },
  websiteScaffoldGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 2.2fr) minmax(0, 1fr)',
    gap: tokens['--jx-space-6'],
  },
  websiteScaffoldChrome: {
    borderColor: 'color-mix(in oklab, var(--primary) 60%, transparent)',
    gridColumn: 'span 2 / span 2',
    borderWidth: 'var(--hairline)',
    borderStyle: 'dashed',
    padding: tokens['--jx-space-8'],
  },

  websiteScaffoldZoneKey: {
    ...LABEL_VOICE,
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-caption'],
    letterSpacing: tokens['--jx-track-18'],
  },
  websiteScaffoldZoneValue: {
    color: tokens['--jx-primary'],
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-caption'],
  },
  websiteScaffoldHeaderBand: {
    ...HAIRLINE,
    backgroundColor: 'color-mix(in oklab, var(--muted) 60%, transparent)',
    marginTop: tokens['--jx-space-6'],
    borderColor: tokens['--jx-border'],
    paddingInline: tokens['--jx-space-12'],
    paddingBlock: tokens['--jx-space-6'],
  },
  websiteScaffoldBandText: { fontFamily: tokens['--jx-font-nav'], fontSize: tokens['--jx-text-micro'] },
  websiteScaffoldBandMuted: {
    fontFamily: tokens['--jx-font-nav'],
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-micro'],
  },
  websiteScaffoldSubgrid: {
    marginTop: tokens['--jx-space-6'],
    display: 'grid',
    gridTemplateColumns: 'subgrid',
  },
  websiteScaffoldAreaCell: { paddingInline: tokens['--jx-space-8'], paddingBlock: tokens['--jx-space-4'] },
  websiteScaffoldAreaCellRight: {
    paddingInline: tokens['--jx-space-8'],
    paddingBlock: tokens['--jx-space-4'],
    textAlign: 'right',
  },
  websiteScaffoldScrollPlane: {
    ...HAIRLINE,
    borderColor: tokens['--jx-border'],
  },
  websiteScaffoldMainHead: {
    borderColor: tokens['--jx-border'],
    borderBottomWidth: 'var(--hairline)',
    borderBottomStyle: 'solid',
    paddingInline: tokens['--jx-space-12'],
    paddingBlock: tokens['--jx-space-6'],
  },
  websiteScaffoldMainBody: {
    marginTop: tokens['--jx-space-6'],
    padding: tokens['--jx-space-8'],
    paddingInlineStart: tokens['--jx-space-16'],
  },
  websiteScaffoldSkelA: { height: '12px', width: '80%' },
  websiteScaffoldSkelB: { height: '12px', width: '60%' },
  websiteScaffoldFootBand: {
    ...MUTED_MIX_40,
    paddingInline: tokens['--jx-space-12'],
    paddingBlock: tokens['--jx-space-6'],
  },
  websiteScaffoldTocCol: {
    ...HAIRLINE,
    borderColor: tokens['--jx-border'],
    paddingInline: tokens['--jx-space-8'],
  },
  websiteScaffoldFoot: { padding: tokens['--jx-space-12'], paddingTop: tokens['--jx-space-8'] },

  // ══ stack (the Layout family; the coverage-debt sweep R6,
  // 2026-09-19 — every catalog entry renders. Stage shells only:
  // pure flow composes the Stack family in scene markup) ══════════
  stackStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  stackLabel: {
    ...LABEL_VOICE,
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-micro'],
    letterSpacing: tokens['--jx-track-label'],
  },
  stackCell: {
    ...MUTED_MIX_40, ...HAIRLINE,
    borderColor: 'color-mix(in oklab, var(--border) 40%, transparent)',
    paddingInline: tokens['--jx-space-8'],
    paddingBlock: tokens['--jx-space-4'],
    fontSize: 'calc(var(--jx-text-base) - var(--jx-unit) * 0.625)',
    whiteSpace: 'nowrap',
  },
  stackBar: {
    ...HAIRLINE,
    borderColor: tokens['--jx-border'],
    padding: tokens['--jx-space-8'],
  },
  stackBarTitle: { fontSize: 'calc(var(--jx-text-base) - var(--jx-unit) * 0.625)' },

  // ══ grid (the Layout family; the coverage sweep) ═══════════════
  gridStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  gridLabel: {
    ...LABEL_VOICE,
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-micro'],
    letterSpacing: tokens['--jx-track-label'],
  },
  gridCell: {
    ...MUTED_MIX_40, ...HAIRLINE,
    borderColor: 'color-mix(in oklab, var(--border) 40%, transparent)',
    padding: tokens['--jx-space-8'],
    fontSize: 'calc(var(--jx-text-base) - var(--jx-unit) * 0.625)',
    textAlign: 'center',
  },
  gridCellWide: {
    ...MUTED_MIX_40, ...HAIRLINE,
    borderColor: 'color-mix(in oklab, var(--border) 40%, transparent)',
    padding: tokens['--jx-space-8'],
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  gridCellTitle: {
    display: 'block',
    fontSize: 'calc(var(--jx-text-base) - var(--jx-unit) * 0.625)',
  },
  gridCellToken: {
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontFamily: tokens['--jx-font-mono'],
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-micro'],
  },
  gridLane: {
    ...HAIRLINE,
    borderColor: tokens['--jx-border'],
    backgroundColor: 'color-mix(in oklab, var(--muted) 30%, transparent)',
    padding: tokens['--jx-space-8'],
    fontSize: 'calc(var(--jx-text-base) - var(--jx-unit) * 0.625)',
  },

  // ══ spin-set (the loader pack; the coverage sweep) ═════════════
  spinSetStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  spinSetLabel: {
    ...LABEL_VOICE,
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-micro'],
    letterSpacing: tokens['--jx-track-label'],
    textAlign: 'center',
  },
  spinSetChip: {
    fontFamily: tokens['--jx-font-mono'],
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-micro'],
  },

  // ══ prototype-flex / prototype-grid / prototype-waterfall /
  // prototype-kit (the prototype family; the coverage sweep) ══════
  prototypeFlexStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  prototypeFlexLabel: {
    ...LABEL_VOICE,
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-micro'],
    letterSpacing: tokens['--jx-track-label'],
  },
  prototypeFlexCell: {
    ...MUTED_MIX_40, ...HAIRLINE,
    borderColor: 'color-mix(in oklab, var(--border) 40%, transparent)',
    paddingInline: tokens['--jx-space-8'],
    paddingBlock: tokens['--jx-space-4'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'calc(var(--jx-text-base) - var(--jx-unit) * 0.625)',
  },
  prototypeGridStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  prototypeGridLabel: {
    ...LABEL_VOICE,
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-micro'],
    letterSpacing: tokens['--jx-track-label'],
  },
  prototypeGridCell: {
    ...MUTED_MIX_40, ...HAIRLINE,
    borderColor: 'color-mix(in oklab, var(--border) 40%, transparent)',
    padding: tokens['--jx-space-6'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'calc(var(--jx-text-base) - var(--jx-unit) * 0.625)',
    textAlign: 'center',
  },
  prototypeGridAreaRail: {
    ...MUTED_MIX_40, ...HAIRLINE,
    gridArea: 'rail',
    borderColor: 'color-mix(in oklab, var(--border) 40%, transparent)',
    padding: tokens['--jx-space-6'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'calc(var(--jx-text-base) - var(--jx-unit) * 0.625)',
  },
  prototypeGridAreaMain: {
    ...HAIRLINE,
    gridArea: 'main',
    borderColor: tokens['--jx-border'],
    padding: tokens['--jx-space-6'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'calc(var(--jx-text-base) - var(--jx-unit) * 0.625)',
  },
  prototypeGridAreaFoot: {
    ...HAIRLINE,
    gridArea: 'foot',
    borderColor: tokens['--jx-border'],
    padding: tokens['--jx-space-6'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'calc(var(--jx-text-base) - var(--jx-unit) * 0.625)',
  },
  prototypeWaterfallStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-32'],
  },
  prototypeWaterfallLabel: {
    ...LABEL_VOICE,
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-micro'],
    letterSpacing: tokens['--jx-track-label'],
  },
  prototypeWaterfallCard: {
    ...HAIRLINE,
    borderColor: 'color-mix(in oklab, var(--border) 40%, transparent)',
    backgroundColor: 'color-mix(in oklab, var(--muted) 30%, transparent)',
    padding: tokens['--jx-space-8'],
    breakInside: 'avoid',
  },
  prototypeWaterfallTitle: {
    display: 'block',
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'calc(var(--jx-text-base) - var(--jx-unit) * 0.625)',
  },
  prototypeWaterfallLine: {
    display: 'block',
    color: tokens['--jx-muted-foreground'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-micro'],
    lineHeight: 'calc(var(--jx-unit) * 4)',
  },
  prototypeKitStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-32'],
  },
  prototypeKitCard: {
    ...HAIRLINE,
    borderColor: 'color-mix(in oklab, var(--border) 40%, transparent)',
    backgroundColor: 'color-mix(in oklab, var(--muted) 30%, transparent)',
    padding: tokens['--jx-space-8'],
  },
  prototypeKitTitle: {
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'calc(var(--jx-text-base) - var(--jx-unit) * 0.625)',
  },
  prototypeKitLine: {
    color: tokens['--jx-muted-foreground'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-micro'],
  },

  // ══ native-scroll-area / scroll-area-kit (the scroll family; the
  // coverage sweep — the kit's split staged beside its consumers) ══
  nativeScrollAreaStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  nativeScrollAreaRail: { width: '280px' },
  nativeScrollAreaLabel: {
    ...LABEL_VOICE,
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-micro'],
    letterSpacing: tokens['--jx-track-label'],
  },
  nativeScrollAreaPort: {
    ...HAIRLINE,
    borderColor: tokens['--jx-border'],
    position: 'relative',
  },
  nativeScrollAreaRow: {
    ...MUTED_MIX_40, ...HAIRLINE,
    borderColor: 'color-mix(in oklab, var(--border) 40%, transparent)',
    paddingInline: tokens['--jx-space-8'],
    paddingBlock: tokens['--jx-space-6'],
    fontSize: 'calc(var(--jx-text-base) - var(--jx-unit) * 0.625)',
  },
  scrollAreaKitStage: {
    height: '100%',
    width: '100%',
    padding: tokens['--jx-space-40'],
  },
  scrollAreaKitRail: { width: '280px' },
  scrollAreaKitLabel: {
    ...LABEL_VOICE,
    color: tokens['--jx-muted-foreground'],
    fontSize: tokens['--jx-text-micro'],
    letterSpacing: tokens['--jx-track-label'],
  },
  scrollAreaKitPort: {
    ...HAIRLINE,
    borderColor: tokens['--jx-border'],
    position: 'relative',
  },
  scrollAreaKitFill: { height: '170px' },
  scrollAreaKitRow: {
    ...MUTED_MIX_40, ...HAIRLINE,
    borderColor: 'color-mix(in oklab, var(--border) 40%, transparent)',
    paddingInline: tokens['--jx-space-8'],
    paddingBlock: tokens['--jx-space-6'],
    fontSize: 'calc(var(--jx-text-base) - var(--jx-unit) * 0.625)',
  },
  scrollAreaKitNote: {
    color: tokens['--jx-muted-foreground'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-micro'],
    textAlign: 'center',
  },
});
