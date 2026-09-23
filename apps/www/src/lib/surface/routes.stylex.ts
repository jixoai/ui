// routes.stylex.ts — the routes zone's shared surface atom table
// (tailwindless one-shot Wave 3, 2026-09-16).
//
// Intents (orthogonal count: 2):
//   - the PATTERN LAYER: the cross-page voices every docs route
//     paints with — the shell band, the eyebrow family, the ink and
//     body voices, the stack pairs, the frame family, the data-table
//     cells — extracted from the allowlist's routes-zone frequency
//     census (15,063 occurrences / 136 files at pin; member comments
//     cite the counts: "z" = zone-wide aggregate, "t20" = the Wave-3
//     top-20-page aggregate).
//   - the PAGE SEATS: one prefixed section per migrated route (the
//     Wave-2 site-chrome ruling — a consuming file owns its prefix,
//     atoms never cross files), holding the page's one-off geometry
//     (demo stages, swatch art, viewport seams with no shared twin).
//
// Laws (the migration playbook + the W1/W2 seam rulings):
//   - This module exports the create result ONLY (`rt`) — never a
//     joiner; the cx lives inside each consuming page (the separator
//     serialize law).
//   - Value law tier-2: theme-able slots ride the typed tokens or
//     the ruler/kernel channels as PLAIN var() strings
//     (--jx-text-base, --jx-text, --jx-text-secondary, --jx-stack,
//     --jx-inset); structural constants (grid tracks, demo-stage
//     geometry, z-index, gradient art) are lawful literals.
//   - TW value remaps (the blueprints-b/W1 ledger):
//     tracking-tight (-0.025em) → --track-tight (-0.02em, W1
//     nearest-step); odd text steps ride the ruler equation
//     calc(var(--jx-text-base) ± var(--jx-unit)*k); leading-N is the
//     spacing ladder as a length (leading-6 = calc(unit*6));
//     alpha channels ride color-mix(in oklab, var(--x) N%,
//     transparent); rounded-md/lg → 0 (the site kills the TW radius
//     scale); max-w-* measures are structural literals (timeline
//     precedent); text-xl (20px) and font-normal (400) have NO sheet
//     step — seam-reported to the orchestrator.
//   - Breakpoints keep the ORIGINAL TW thresholds (sm 40rem,
//     md 48rem, lg 64rem, xl 80rem; min-[Npx] verbatim).
//   - Registered semantic classes (pill/dim/demo-cell/data-table/
//     table-scroll/jx-*/page <style> hooks) NEVER become atoms —
//     they stay verbatim strings in the class attribute's static
//     part (Svelte scoped-style pruning law, pilot gotcha #4).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../tokens.stylex';

export const rt = stylex.create({
  // ═══ the docs shell (the pattern ×212 zone-wide) ═════════════════
  // `mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8`
  shell: {
    width: '100%',
    maxWidth: tokens['--jx-shell-w'],
    marginInline: 'auto',
    paddingInline: tokens['--jx-space-16'],
    paddingBlock: tokens['--jx-space-40'],
    '@media (min-width: 40rem)': { paddingInline: tokens['--jx-space-24'] },
    '@media (min-width: 64rem)': { paddingInline: tokens['--jx-space-32'] },
  },
  // `flex min-w-0 flex-col gap-8` — the shell's inner column (×114 z)
  shellCol: {
    display: 'flex',
    minWidth: 0,
    flexDirection: 'column',
    gap: tokens['--jx-space-32'],
  },
  // the flush variant (×85 z): flex column, block-start padding 0
  shellFlush: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens['--jx-space-32'],
    width: '100%',
    maxWidth: tokens['--jx-shell-w'],
    marginInline: 'auto',
    paddingInline: tokens['--jx-space-16'],
    paddingBlockEnd: tokens['--jx-space-40'],
    '@media (min-width: 40rem)': { paddingInline: tokens['--jx-space-24'] },
    '@media (min-width: 64rem)': { paddingInline: tokens['--jx-space-32'] },
  },

  // ═══ layout singles (composable flow/geometry) ═══════════════════
  flex: { display: 'flex' }, // z1522
  col: { flexDirection: 'column' }, // z925
  wrap: { flexWrap: 'wrap' }, // z283
  grid: { display: 'grid' }, // z198
  inlineFlex: { display: 'inline-flex' }, // z20
  inlineBlock: { display: 'inline-block' }, // z3
  block: { display: 'block' }, // z2
  itemsCenter: { alignItems: 'center' }, // z287
  itemsStart: { alignItems: 'flex-start' }, // z67
  itemsEnd: { alignItems: 'flex-end' }, // z3
  itemsBaseline: { alignItems: 'baseline' }, // z12
  justifyCenter: { justifyContent: 'center' }, // z44
  justifyBetween: { justifyContent: 'space-between' }, // z15
  selfCenter: { alignSelf: 'center' }, // z3
  minW0: { minWidth: 0 }, // z128
  wFull: { width: '100%' }, // z370
  hFull: { height: '100%' },
  wFit: { width: 'fit-content' },
  grow: { flexGrow: 1, flexShrink: 1, flexBasis: '0%' }, // flex-1 z27
  flexNone: { flex: 'none' }, // z20
  shrink0: { flexShrink: 0 }, // z?
  relative: { position: 'relative' }, // z16
  absolute: { position: 'absolute' },
  sticky: { position: 'sticky' },
  top0: { top: 0 },
  inset0: { inset: 0 },
  isolate: { isolation: 'isolate' }, // z4
  z10: { zIndex: 10 },
  overflowHidden: { overflow: 'hidden' }, // z7
  oxAuto: { overflowX: 'auto' }, // z5
  overflowAuto: { overflow: 'auto' }, // z3
  minH0: { minHeight: 0 },
  textLeft: { textAlign: 'left' }, // z21
  textCenter: { textAlign: 'center' }, // z2
  textRight: { textAlign: 'right' }, // z12
  cursorPointer: { cursor: 'pointer' }, // z16
  selectNone: { userSelect: 'none' },
  truncate: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  m0: { margin: 0 }, // z75
  alignTop: { verticalAlign: 'top' }, // z5

  // ═══ the stack pairs (gap rides the space steps) ═════════════════
  // the PLAIN row (no align — stretch stays default; byte-honest
  // against `flex gap-2`, never auto-centered)
  row8: { display: 'flex', gap: tokens['--jx-space-8'] }, // z178
  // the centered row (the brief's row primitive: flex items-center)
  rowC4: { display: 'flex', alignItems: 'center', gap: tokens['--jx-space-4'] }, // gap-1
  rowC6: { display: 'flex', alignItems: 'center', gap: tokens['--jx-space-6'] }, // gap-1.5
  rowC8: { display: 'flex', alignItems: 'center', gap: tokens['--jx-space-8'] }, // gap-2
  rowC10: { display: 'flex', alignItems: 'center', gap: tokens['--jx-space-10'] }, // gap-2.5 z48
  rowC12: { display: 'flex', alignItems: 'center', gap: tokens['--jx-space-12'] }, // gap-3 z17+
  rowC16: { display: 'flex', alignItems: 'center', gap: tokens['--jx-space-16'] }, // gap-4
  rowC24: { display: 'flex', alignItems: 'center', gap: tokens['--jx-space-24'] }, // gap-6
  rowC32: { display: 'flex', alignItems: 'center', gap: tokens['--jx-space-32'] }, // gap-8
  // the column pairs (`flex flex-col gap-N`)
  col8: { display: 'flex', flexDirection: 'column', gap: tokens['--jx-space-8'] }, // z60
  col10: { display: 'flex', flexDirection: 'column', gap: tokens['--jx-space-10'] }, // z21
  col12: { display: 'flex', flexDirection: 'column', gap: tokens['--jx-space-12'] }, // z74
  col16: { display: 'flex', flexDirection: 'column', gap: tokens['--jx-space-16'] }, // z37
  col20: { display: 'flex', flexDirection: 'column', gap: tokens['--jx-space-20'] }, // z145
  col24: { display: 'flex', flexDirection: 'column', gap: tokens['--jx-space-24'] }, // z55
  col28: { display: 'flex', flexDirection: 'column', gap: tokens['--jx-space-28'] }, // gap-7
  col32: { display: 'flex', flexDirection: 'column', gap: tokens['--jx-space-32'] }, // z12+
  // the wrap pairs (`flex flex-wrap …`)
  wrap12: { display: 'flex', flexWrap: 'wrap', gap: tokens['--jx-space-12'] }, // z139
  wrap16: { display: 'flex', flexWrap: 'wrap', gap: tokens['--jx-space-16'] }, // z12
  wrapRow12: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: tokens['--jx-space-12'] }, // z28
  wrapRow16: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: tokens['--jx-space-16'] }, // z12
  wrapStart24: { display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: tokens['--jx-space-24'] }, // z20
  wrapStart40: { display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start', gap: tokens['--jx-space-40'] }, // z11

  // ═══ the gap ladder (bare, for non-pair compositions) ═════════════
  gap2: { gap: tokens['--jx-space-2'] },
  gap4: { gap: tokens['--jx-space-4'] },
  gap6: { gap: tokens['--jx-space-6'] },
  gap8: { gap: tokens['--jx-space-8'] },
  gap10: { gap: tokens['--jx-space-10'] },
  gap12: { gap: tokens['--jx-space-12'] },
  gap16: { gap: tokens['--jx-space-16'] },
  gap20: { gap: tokens['--jx-space-20'] },
  gap24: { gap: tokens['--jx-space-24'] },
  gap28: { gap: tokens['--jx-space-28'] },
  gap32: { gap: tokens['--jx-space-32'] },
  gap40: { gap: tokens['--jx-space-40'] },
  gapX6: { columnGap: tokens['--jx-space-6'] },
  gapX8: { columnGap: tokens['--jx-space-8'] }, // gap-x-8 z17
  gapX10: { columnGap: tokens['--jx-space-10'] }, // gap-x-10 z6
  gapX12: { columnGap: tokens['--jx-space-12'] },
  gapY4: { rowGap: tokens['--jx-space-4'] },
  gapY20: { rowGap: tokens['--jx-space-20'] }, // gap-y-5 z23
  gapY24: { rowGap: tokens['--jx-space-24'] }, // gap-y-6 z5

  // ═══ the eyebrow family (uppercase + tracking + nav face) ════════
  // `font-nav text-[11px] uppercase tracking-[0.24em]` — the voice
  // alone; ink composes (inkMuted/inkPrimary) per call site
  eyebrow: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-label'],
  },
  // the primary-ink twin (×151 z as a full string)
  eyebrowPrimary: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-label'],
    color: tokens['--jx-primary'],
  },
  // the 10px micro voice (×10 z)
  microEyebrow: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-micro'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-label'],
  },

  // ═══ the ink voices ══════════════════════════════════════════════
  inkMuted: { color: tokens['--jx-muted-foreground'] }, // z799
  inkPrimary: { color: tokens['--jx-primary'] }, // z305
  inkAccent: { color: tokens['--jx-accent'] }, // z594
  inkFg: { color: tokens['--jx-foreground'] }, // z47
  inkMuted70: { color: 'color-mix(in oklab, var(--muted-foreground) 70%, transparent)' },
  inkMuted60: { color: 'color-mix(in oklab, var(--muted-foreground) 60%, transparent)' },
  inkTermFg: { color: tokens['--jx-terminal-foreground'] }, // z2
  inkTermFg70: { color: 'color-mix(in oklab, var(--terminal-foreground) 70%, transparent)' },
  inkTermFg55: { color: 'color-mix(in oklab, var(--terminal-foreground) 55%, transparent)' },
  fillMuted: { fill: tokens['--jx-muted-foreground'] }, // fill-muted-foreground z3

  // ═══ the text ladder ═════════════════════════════════════════════
  text10: { fontSize: tokens['--jx-text-micro'] }, // text-[10px] z37
  text11: { fontSize: tokens['--jx-text-label'] }, // text-[11px] z327
  text12: { fontSize: tokens['--jx-text-label-lg'] }, // text-[12px]/text-xs z98+
  text125: { fontSize: tokens['--jx-text-small'] }, // text-[12.5px] z143
  text13: { fontSize: 'var(--jx-text-base)' }, // z365 — the kernel channel
  text105: { fontSize: 'calc(var(--jx-text-base) - var(--jx-unit) * 0.625)' }, // 10.5px oddball — ruler
  text115: { fontSize: 'calc(var(--jx-text-base) - var(--jx-unit) * 0.375)' }, // 11.5px oddball — ruler
  text135: { fontSize: 'calc(var(--jx-text-base) + var(--jx-unit) * 0.125)' }, // 13.5px oddball — ruler
  text15: { fontSize: tokens['--jx-text-body-lg'] }, // text-[15px] z46
  text95: { fontSize: 'var(--text-95, 0.95rem)' }, // 15.2px oddball — seam
  textSm: { fontSize: tokens['--jx-text-sm'] }, // text-sm z13
  textLg: { fontSize: tokens['--jx-text-lg'] }, // text-lg z17
  textXl: { fontSize: 'calc(var(--jx-text-base) + var(--jx-unit) * 1.75)' }, // 20px — NO sheet step, seam-reported
  textVar: { fontSize: 'var(--jx-text)' }, // text-[length:var(--jx-text)]
  textVar2: { fontSize: 'var(--jx-text-secondary)' }, // text-[length:var(--jx-text-secondary)] z31
  // the leading lengths (the spacing ladder as lineHeight)
  leadNone: { lineHeight: tokens['--jx-leading-none'] },
  lead4: { lineHeight: 'calc(var(--jx-unit) * 4)' }, // leading-4 = 16px
  lead5: { lineHeight: 'calc(var(--jx-unit) * 5)' }, // leading-5 = 20px z33
  lead6: { lineHeight: 'calc(var(--jx-unit) * 6)' }, // leading-6 = 24px z309
  // type singles
  fontNav: { fontFamily: tokens['--jx-font-nav'] }, // z342
  fontMono: { fontFamily: tokens['--jx-font-mono'] }, // z166
  upper: { textTransform: 'uppercase' }, // z307
  tabular: { fontVariantNumeric: 'tabular-nums' }, // z10
  pretty: { textWrap: 'pretty' }, // z86
  nowrap: { whiteSpace: 'nowrap' }, // z22
  medium: { fontWeight: tokens['--jx-weight-medium'] }, // font-medium z10
  semibold: { fontWeight: tokens['--jx-weight-semibold'] }, // z41
  bold: { fontWeight: tokens['--jx-weight-bold'] }, // z40
  weightNormal: { fontWeight: 'var(--weight-normal, 400)' }, // font-normal — NO step, seam
  trackTight: { letterSpacing: tokens['--jx-track-tight'] }, // tracking-tight → W1 remap
  track10: { letterSpacing: tokens['--jx-track-10'] },
  track12: { letterSpacing: tokens['--jx-track-12'] },
  track14: { letterSpacing: tokens['--jx-track-14'] },
  track18: { letterSpacing: tokens['--jx-track-18'] },
  track24: { letterSpacing: tokens['--jx-track-label'] }, // tracking-[0.24em] z207
  underline: { textDecorationLine: 'underline' }, // z18
  underlineOffset2: { textUnderlineOffset: '2px' }, // z13
  dotted: { textDecorationStyle: 'dotted' }, // decoration-dotted

  // ═══ the body voices (recurring composite strings) ═══════════════
  // `text-[13px] leading-6` — the body pair (z60 as a bare pair)
  body13: { fontSize: 'var(--jx-text-base)', lineHeight: 'calc(var(--jx-unit) * 6)' },
  // the muted body (z34) — muted ink + body pair
  bodyMuted: {
    color: tokens['--jx-muted-foreground'],
    fontSize: 'var(--jx-text-base)',
    lineHeight: 'calc(var(--jx-unit) * 6)',
  },
  // the paragraph voice (z51): + text-pretty
  para: {
    color: tokens['--jx-muted-foreground'],
    fontSize: 'var(--jx-text-base)',
    lineHeight: 'calc(var(--jx-unit) * 6)',
    textWrap: 'pretty',
  },
  // the note voices (muted ink + fixed step, leading inherits)
  note11: { color: tokens['--jx-muted-foreground'], fontSize: tokens['--jx-text-label'] }, // z53
  note12: { color: tokens['--jx-muted-foreground'], fontSize: tokens['--jx-text-label-lg'] }, // z87
  noteSmall: { color: tokens['--jx-muted-foreground'], fontSize: tokens['--jx-text-small'] }, // z108
  // the mono note voices
  code11: {
    color: tokens['--jx-muted-foreground'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-label'],
  }, // z27
  code12: {
    color: tokens['--jx-muted-foreground'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-label-lg'],
  }, // z11
  // the card title (z22): `text-[15px] font-bold tracking-tight`
  title15: {
    fontSize: tokens['--jx-text-body-lg'],
    fontWeight: tokens['--jx-weight-bold'],
    letterSpacing: tokens['--jx-track-tight'],
  },
  // the weightless twin (z17): `text-[15px] font-bold`
  title15Plain: { fontSize: tokens['--jx-text-body-lg'], fontWeight: tokens['--jx-weight-bold'] },
  // the accent link (z10)
  linkAccent: {
    color: tokens['--jx-accent'],
    textDecorationLine: 'underline',
    textUnderlineOffset: '2px',
  },

  // ═══ the frame family ════════════════════════════════════════════
  // `border border-border` (×~400 z) — the hairline frame
  frame: {
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
  },
  frameW: { borderWidth: 'var(--hairline)', borderStyle: 'solid' }, // border alone
  frame60: {
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: 'color-mix(in oklab, var(--border) 60%, transparent)',
  }, // border-border/60 z53
  frame50: {
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: 'color-mix(in oklab, var(--border) 50%, transparent)',
  }, // z13
  frame40: {
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: 'color-mix(in oklab, var(--border) 40%, transparent)',
  },
  framePrimary40: {
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: 'color-mix(in oklab, var(--primary) 40%, transparent)',
  },
  framePrimary: {
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-primary'],
  },
  frameCurrent: {
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: 'currentColor',
  }, // border-current z3
  frameNone: { borderWidth: 0 }, // border-0
  // the edge hairs (border-b/-t + color; the color longhand paints
  // all sides but only the weighted edge shows — width is the gate)
  bBorder: {
    borderBottomWidth: 'var(--hairline)',
    borderBottomStyle: 'solid',
    borderColor: tokens['--jx-border'],
  }, // border-b border-border z~38
  bBorder60: {
    borderBottomWidth: 'var(--hairline)',
    borderBottomStyle: 'solid',
    borderColor: 'color-mix(in oklab, var(--border) 60%, transparent)',
  },
  bBorder50: {
    borderBottomWidth: 'var(--hairline)',
    borderBottomStyle: 'solid',
    borderColor: 'color-mix(in oklab, var(--border) 50%, transparent)',
  },
  bBorderW: { borderBottomWidth: 'var(--hairline)', borderBottomStyle: 'solid' }, // border-b alone (currentColor)
  tBorder: {
    borderTopWidth: 'var(--hairline)',
    borderTopStyle: 'solid',
    borderColor: tokens['--jx-border'],
  },
  tBorderW: { borderTopWidth: 'var(--hairline)', borderTopStyle: 'solid' }, // border-t alone
  // the color-only longhands (width painted elsewhere)
  frameBorder: { borderColor: tokens['--jx-border'] },
  frameBorder60: { borderColor: 'color-mix(in oklab, var(--border) 60%, transparent)' },
  frameBorder50: { borderColor: 'color-mix(in oklab, var(--border) 50%, transparent)' },
  // the panel voices (frame + padding)
  panel: {
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    padding: tokens['--jx-space-16'],
  }, // `border border-border p-4` z228
  panel60: {
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: 'color-mix(in oklab, var(--border) 60%, transparent)',
    padding: tokens['--jx-space-16'],
  }, // z24
  panel60P12: {
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: 'color-mix(in oklab, var(--border) 60%, transparent)',
    padding: tokens['--jx-space-12'],
  }, // `border border-border/60 p-3` z18
  // `border border-border bg-muted/40 px-4 py-4` — the callout panel
  notePanel: {
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: 'color-mix(in oklab, var(--muted) 40%, transparent)',
    paddingInline: tokens['--jx-space-16'],
    paddingBlock: tokens['--jx-space-16'],
  }, // z17

  // ═══ grounds ═════════════════════════════════════════════════════
  bgCard: { backgroundColor: tokens['--jx-card'] }, // z32
  bgCard40: { backgroundColor: 'color-mix(in oklab, var(--card) 40%, transparent)' }, // z7
  bgBackground: { backgroundColor: tokens['--jx-background'] }, // z21
  bgBackground55: { backgroundColor: 'color-mix(in oklab, var(--background) 55%, transparent)' }, // z8
  bgMuted40: { backgroundColor: 'color-mix(in oklab, var(--muted) 40%, transparent)' }, // z41
  bgMuted30: { backgroundColor: 'color-mix(in oklab, var(--muted) 30%, transparent)' }, // z5
  bgMuted: { backgroundColor: tokens['--jx-muted'] },
  bgTransparent: { backgroundColor: 'transparent' }, // z4
  bgBorder60: { backgroundColor: 'color-mix(in oklab, var(--border) 60%, transparent)' }, // z3
  bgPrimary: { backgroundColor: tokens['--jx-primary'] },
  bgTerminal: { backgroundColor: tokens['--jx-terminal'] }, // z2
  shadow2xs: { boxShadow: tokens['--jx-shadow-2xs'] }, // z7
  shadowXs: { boxShadow: tokens['--jx-shadow-xs'] },
  shadowSm: { boxShadow: tokens['--jx-shadow-sm'] },
  shadowMd: { boxShadow: tokens['--jx-shadow-md'] },
  radius0: { borderRadius: 0 }, // rounded-md/lg — the radius law
  radiusFull: { borderRadius: 'calc(infinity * 1px)' }, // rounded-full — chip precedent

  // ═══ the data-table cells (icon-table's twin shape) ══════════════
  tableShell: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' }, // w-full border-collapse text-left
  collapse: { borderCollapse: 'collapse' },
  thRow: {
    borderBottomWidth: 'var(--hairline)',
    borderBottomStyle: 'solid',
    borderColor: tokens['--jx-border'],
  },
  tdRow: {
    borderBottomWidth: 'var(--hairline)',
    borderBottomStyle: 'solid',
    borderColor: 'color-mix(in oklab, var(--border) 50%, transparent)',
  },
  thCell: {
    fontFamily: tokens['--jx-font-nav'],
    paddingBlock: 'var(--jx-stack)',
    paddingInline: 'var(--jx-inset)',
    fontSize: 'var(--jx-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-14'],
  }, // the docs th voice ×21 per table
  tdCell: { paddingBlock: 'var(--jx-stack)', paddingInline: 'var(--jx-inset)' },
  // the density-channel padding pair (py-[var(--jx-stack)] px-[var(--jx-inset)])
  padStack: { paddingBlock: 'var(--jx-stack)' },
  padInset: { paddingInline: 'var(--jx-inset)' },

  // ═══ margins (the recurring steps) ═══════════════════════════════
  mt4: { marginTop: tokens['--jx-space-4'] }, // mt-1
  mt8: { marginTop: tokens['--jx-space-8'] }, // mt-2 z58
  mt12: { marginTop: tokens['--jx-space-12'] }, // mt-3 z16
  mt16: { marginTop: tokens['--jx-space-16'] }, // mt-4 z15
  mt20: { marginTop: tokens['--jx-space-20'] }, // mt-5 z23
  mt24: { marginTop: tokens['--jx-space-24'] }, // mt-6
  mb4: { marginBottom: tokens['--jx-space-4'] }, // mb-1
  mb8: { marginBottom: tokens['--jx-space-8'] }, // mb-2 z42
  mb12: { marginBottom: tokens['--jx-space-12'] }, // mb-3 z48
  mb16: { marginBottom: tokens['--jx-space-16'] }, // mb-4
  pt4: { paddingTop: tokens['--jx-space-4'] }, // pt-1
  pt16: { paddingTop: tokens['--jx-space-16'] }, // pt-4
  pt20: { paddingTop: tokens['--jx-space-20'] }, // pt-5 z17
  pb8: { paddingBottom: tokens['--jx-space-8'] }, // pb-2
  pb40: { paddingBottom: tokens['--jx-space-40'] }, // pb-10
  mlAuto: { marginLeft: 'auto' },
  mxAuto: { marginInline: 'auto' }, // mx-auto
  mx4: { marginInline: tokens['--jx-space-4'] }, // mx-1

  // ═══ the padding ladder (bare steps) ══════════════════════════════
  p4: { padding: tokens['--jx-space-4'] }, // p-1
  p8: { padding: tokens['--jx-space-8'] }, // p-2 z45
  p12: { padding: tokens['--jx-space-12'] }, // p-3 z29
  p16: { padding: tokens['--jx-space-16'] }, // p-4
  p20: { padding: tokens['--jx-space-20'] }, // p-5
  p24: { padding: tokens['--jx-space-24'] }, // p-6
  px8: { paddingInline: tokens['--jx-space-8'] }, // px-2
  px12: { paddingInline: tokens['--jx-space-12'] }, // px-3 z52
  px14: { paddingInline: tokens['--jx-space-14'] }, // px-3.5 / px-[0.875rem]
  px16: { paddingInline: tokens['--jx-space-16'] }, // px-4 z~250
  px20: { paddingInline: tokens['--jx-space-20'] }, // px-5
  px24: { paddingInline: tokens['--jx-space-24'] }, // px-6
  py2: { paddingBlock: tokens['--jx-space-2'] }, // py-0.5
  py4: { paddingBlock: tokens['--jx-space-4'] }, // py-1
  py6: { paddingBlock: tokens['--jx-space-6'] }, // py-1.5
  py8: { paddingBlock: tokens['--jx-space-8'] }, // py-2 z36
  py10: { paddingBlock: tokens['--jx-space-10'] }, // py-2.5
  py12: { paddingBlock: tokens['--jx-space-12'] }, // py-3
  py16: { paddingBlock: tokens['--jx-space-16'] }, // py-4
  py40: { paddingBlock: tokens['--jx-space-40'] }, // py-10 z123
  pl20: { paddingInlineStart: tokens['--jx-space-20'] }, // pl-5 (list-disc indent)
  listDisc: { listStyleType: 'disc' },

  // ═══ the measure ceilings (structural literals, timeline law) ════
  maxW64ch: { maxWidth: '64ch' }, // z16
  maxW2xl: { maxWidth: '42rem' }, // z19
  maxWXl: { maxWidth: '36rem' }, // z23
  maxW3xl: { maxWidth: '48rem' }, // z3
  maxWMd: { maxWidth: '28rem' }, // z12
  maxWLg: { maxWidth: '32rem' }, // z20
  maxW70: { maxWidth: '70rem' }, // max-w-[70rem] z3
  maxW60: { maxWidth: '60rem' },
  maxWFull: { maxWidth: '100%' },
  maxH56: { maxHeight: '14rem' }, // max-h-56

  // ═══ the responsive grids (composites with original thresholds) ══
  // `grid gap-4 sm:grid-cols-2` z30
  gridSm2: {
    display: 'grid',
    gap: tokens['--jx-space-16'],
    '@media (min-width: 40rem)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  },
  // `grid gap-4 sm:grid-cols-3` z12
  gridSm3: {
    display: 'grid',
    gap: tokens['--jx-space-16'],
    '@media (min-width: 40rem)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
  },
  // `grid gap-5 min-[760px]:grid-cols-2` z28
  grid760a: {
    display: 'grid',
    gap: tokens['--jx-space-20'],
    '@media (min-width: 760px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  },
  // `grid gap-4 min-[760px]:grid-cols-2` z17
  grid760b: {
    display: 'grid',
    gap: tokens['--jx-space-16'],
    // the base track is minmax(0,1fr), never auto: an auto track sizes
    // to the widest item's max-content, so a code-bearing panel panned
    // the shell at narrow viewports (the finale sweep's code-card +
    // inline-code finding)
    gridTemplateColumns: 'minmax(0, 1fr)',
    '@media (min-width: 760px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  },
  // `grid gap-4 min-[760px]:grid-cols-3` z14
  grid760c: {
    display: 'grid',
    gap: tokens['--jx-space-16'],
    '@media (min-width: 760px)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
  },

  // ═══ misc singles ════════════════════════════════════════════════
  appearanceNone: { appearance: 'none' }, // z8
  transitionColors: {
    transitionProperty: 'color, background-color, border-color, text-decoration-color, fill, stroke',
  }, // the property list only (no duration — saLink precedent)
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: 'calc(var(--jx-unit) * -0.25)',
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
  }, // the file-input recipe (site-chrome ocSummary twin)

  // ═══ page seats (one prefixed section per migrated route) ════════
  // atoms below carry the consuming page's slug prefix — they never
  // cross files (the Wave-2 ruling); sections land as pages migrate.

  // ── docs/icons.html (ic…; 722 occurrences at pin) ────────────────
  // the named-icon grid: 2 cells at base, 3 at sm, 4 at lg
  icGrid: {
    display: 'grid',
    gap: tokens['--jx-space-8'],
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    '@media (min-width: 40rem)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
    '@media (min-width: 64rem)': { gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' },
  },
  icGlyph16: { width: '1.5rem', height: '1.5rem' }, // size-6 demo-glyph box
  icDotPad: { paddingInline: 'var(--pad-dot, 0.2em)' }, // the 20·KiB budget separator dot (em-oddball seam)

  // ── docs/components/code-card.html (cc…; 452 at pin) ─────────────
  ccMaxW40: { maxWidth: '40rem' }, // the meta-note measure ×2
  ccTrackWide: { letterSpacing: 'var(--track-025, 0.025em)' }, // tracking-wide — the sheet's un-promoted oddball
  ccTable70: { width: '100%', minWidth: '70rem', fontSize: tokens['--jx-text-small'] }, // the engine-matrix table
  ccTable60: { width: '100%', minWidth: '60rem', fontSize: tokens['--jx-text-small'] }, // the shiki/themes table
  ccGrid: {
    display: 'grid',
    width: '100%',
    gap: tokens['--jx-space-16'],
    '@media (min-width: 48rem)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
  }, // md:grid-cols-3 at the original 48rem threshold
  ml6: { marginLeft: tokens['--jx-space-6'] }, // ml-1.5
  ccShikiRow: { backgroundColor: 'color-mix(in oklab, var(--primary) 5%, transparent)' }, // bg-primary/5 — the default-engine row tint

  // ── docs/variant-grammar.html (vg…; 339 at pin) ──────────────────
  // the grammar's arbitrary-property hue injections as atoms (the
  // @utility seam classes' destination form — custom properties)
  vgFillDestructive: { '--jx-fill': 'var(--destructive)' },
  vgInkDestructive: { '--jx-fill-ink': 'var(--destructive-foreground)' },
  vgTonalViolet: { '--jx-tonal': 'oklch(0.72 0.14 300)' }, // the untitled-violet demo tonal
  grid760g24: {
    display: 'grid',
    gap: tokens['--jx-space-24'],
    '@media (min-width: 760px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  }, // grid gap-6 min-[760px]:grid-cols-2 (the grammar's matrix grids ×3)
  maxW16: { maxWidth: '16rem' }, // max-w-[16rem]
  maxW40: { maxWidth: '40rem' }, // max-w-[40rem]
  w36: { width: '9rem' }, // w-36
  w28: { width: '7rem' }, // w-28
  w56: { width: '14rem' }, // w-56
  pe8: { paddingInlineEnd: tokens['--jx-space-8'] }, // pr-2
  opacity75: { opacity: 0.75 }, // the ⌘K hint wash
  gapX16: { columnGap: tokens['--jx-space-16'] }, // gap-x-4
  pb32: { paddingBottom: tokens['--jx-space-32'] }, // pb-8
  ps12: { paddingInlineStart: tokens['--jx-space-12'] }, // ps-3
  mr8: { marginRight: tokens['--jx-space-8'] }, // mr-2
  ml8: { marginLeft: tokens['--jx-space-8'] }, // ml-2
  minW64: { minWidth: '16rem' }, // min-w-64
  gridMd3: {
    display: 'grid',
    gap: tokens['--jx-space-16'],
    '@media (min-width: 48rem)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
  }, // grid gap-4 md:grid-cols-3

  // ── docs/effects.html (ef…; 329 at pin) ──────────────────────────
  // the command-palette demo stage (the 11rem top riding the ruler:
  // 44 units — the hero heading band above the glass surface)
  efStage: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: tokens['--jx-space-32'],
    paddingInline: tokens['--jx-space-24'],
    paddingTop: 'calc(var(--jx-unit) * 44)',
    paddingBottom: tokens['--jx-space-32'],
    '@media (min-width: 40rem)': { paddingInline: tokens['--jx-space-40'] },
  },
  efMinW260: { minWidth: '260px' }, // the glass-box demo floor
  efTable: {
    width: '100%',
    minWidth: '560px',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: tokens['--jx-text-small'],
  }, // the three prop tables' shared shell
  efCell220: { width: '220px' }, // the variant cell
  efCell280: { width: '280px' }, // the action cell
  minW36: { minWidth: '9rem' }, // min-w-36 — the vertical bar floor
  minW52: { minWidth: '13rem' }, // min-w-52
  maxWSm: { maxWidth: '24rem' }, // max-w-sm — the wrapping bar ceiling
  ml4: { marginLeft: tokens['--jx-space-4'] }, // ml-1

  // ── docs/components/tabs.html (tabs…; 324 at pin) ────────────────
  // the workbench grid: 1 → 2 (md) → 3 (xl) at the original thresholds
  tabsGrid: {
    display: 'grid',
    gap: tokens['--jx-space-16'],
    '@media (min-width: 48rem)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
    '@media (min-width: 80rem)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
  },
  tabsGrid24: {
    display: 'grid',
    gap: tokens['--jx-space-24'],
    '@media (min-width: 48rem)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  }, // the vertical pair grid
  // the indicator demo gradients (demo artwork — structural strings)
  tabsGradA: { backgroundImage: 'linear-gradient(115deg, oklch(0.8 0.15 var(--brand-hue)), oklch(0.8 0.14 260), oklch(0.84 0.13 145))' },
  tabsGradB: { backgroundImage: 'linear-gradient(115deg, oklch(0.8 0.14 260), oklch(0.8 0.15 var(--brand-hue)), oklch(0.84 0.13 145))' },
  tabsPillPaint: {
    height: '100%',
    width: '100%',
    borderRadius: 'calc(infinity * 1px)',
    backgroundImage: 'linear-gradient(90deg, var(--primary), var(--accent))',
  }, // the custom-indicator pill paint
  w24: { width: '1.5rem' }, // w-6

  // ── docs/components/press-button.html (pb…; 322 at pin) ───────────
  // the material matrices: 2 up at sm, 5/4 up at lg
  pbGrid5: {
    display: 'grid',
    gap: tokens['--jx-space-12'],
    '@media (min-width: 40rem)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
    '@media (min-width: 64rem)': { gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' },
  },
  pbGrid4: {
    display: 'grid',
    gap: tokens['--jx-space-12'],
    '@media (min-width: 40rem)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
    '@media (min-width: 64rem)': { gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' },
  },
  pbDot13: { width: '13px', height: '13px' }, // the badge dot geometry

  // ── docs/components/tour.html (tour…; 299 at pin) ─────────────────
  tourGrid: {
    display: 'grid',
    width: '100%',
    gap: tokens['--jx-space-16'],
    '@media (min-width: 40rem)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  },
  tourSpacer72: { height: '18rem' }, // h-72 — the scroll runway
  // the skip links + footer controls (native hover/disabled pseudos)
  tourSkipGhost: {
    cursor: 'pointer',
    appearance: 'none',
    borderWidth: 0,
    backgroundColor: 'transparent',
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-10'],
    color: tokens['--jx-muted-foreground'],
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
    ':hover': { color: tokens['--jx-foreground'] },
  },
  tourCtlGhost: {
    display: 'inline-flex',
    cursor: 'pointer',
    appearance: 'none',
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    paddingInline: tokens['--jx-space-14'],
    paddingBlock: tokens['--jx-space-6'],
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-10'],
    boxShadow: tokens['--jx-shadow-2xs'],
    ':disabled': { cursor: 'not-allowed', opacity: 0.4 },
  },
  tourCtlPrimary: {
    display: 'inline-flex',
    cursor: 'pointer',
    appearance: 'none',
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-primary'],
    backgroundColor: tokens['--jx-background'],
    paddingInline: tokens['--jx-space-14'],
    paddingBlock: tokens['--jx-space-6'],
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-10'],
    color: tokens['--jx-primary'],
    boxShadow: tokens['--jx-shadow-2xs'],
    ':disabled': { cursor: 'not-allowed', opacity: 0.4 },
  },

  // ── docs/components/dialog.html (dg…; 284 at pin) ────────────────
  dgColStart1: { gridColumnStart: 1 }, // the flush-escape column
  dgW40: { width: '10rem' }, // the dialog demo width
  dgDot1: { width: '0.25rem', height: '0.25rem' }, // size-1 marker dot
  dgGridMd3: {
    display: 'grid',
    gap: tokens['--jx-space-16'],
    '@media (min-width: 48rem)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
  },

  // ── docs/components/spin.html (sp…; 281 at pin) ──────────────────
  // the catalog cells (centered columns with width floors)
  spCell24: { display: 'flex', minWidth: '6rem', flexDirection: 'column', alignItems: 'center', gap: tokens['--jx-space-8'] },
  spCell36: { display: 'flex', minWidth: '9rem', flexDirection: 'column', alignItems: 'center', gap: tokens['--jx-space-8'] },
  spCell40: { display: 'flex', minWidth: '10rem', flexDirection: 'column', alignItems: 'center', gap: tokens['--jx-space-8'] },
  spCell52: { display: 'flex', minWidth: '13rem', flexDirection: 'column', alignItems: 'center', gap: tokens['--jx-space-8'] },

  // ── tokens.html (tk…; 267 at pin) ────────────────────────────────
  tkRow: { display: 'flex', height: '2.6rem', alignItems: 'center', paddingInline: tokens['--jx-space-12'] },
  tkChip: {
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    paddingInline: tokens['--jx-space-8'],
    paddingBlock: tokens['--jx-space-2'],
    fontSize: tokens['--jx-text-micro'],
    fontFamily: tokens['--jx-font-nav'],
    transitionProperty: 'color, background-color, border-color, text-decoration-color, fill, stroke',
    ':hover': { backgroundColor: tokens['--jx-muted'] },
  }, // the swatch copy chip

  // ── docs/components/scroll-run.html (sr…; 241 at pin) ─────────────
  // the one-cell grid host track ([grid-template-columns:minmax(0,1fr)])
  srSingle: { gridTemplateColumns: 'minmax(0, 1fr)' },
  srDivider: {
    backgroundColor: 'color-mix(in oklab, var(--border) 60%, transparent)',
    marginInline: tokens['--jx-space-4'],
    display: 'inline-block',
    height: '1rem',
    width: '1px',
    alignSelf: 'center',
  }, // the toolbar divider
  srBtn: {
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: 'color-mix(in oklab, var(--background) 55%, transparent)',
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-label'],
    paddingInline: tokens['--jx-space-8'],
    paddingBlock: tokens['--jx-space-4'],
    ':hover': { backgroundColor: 'color-mix(in oklab, var(--muted) 50%, transparent)' },
  }, // the workbench toggle chips (ink rides the pressed ternary)
  srChip: {
    flex: 'none',
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: 'color-mix(in oklab, var(--border) 60%, transparent)',
    backgroundColor: 'color-mix(in oklab, var(--muted) 30%, transparent)',
    paddingInline: tokens['--jx-space-12'],
    paddingBlock: tokens['--jx-space-8'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-label'],
  }, // the demo members (the i===3 highlighted cell)

  // ── docs/components/chart.html (ch…; 226 at pin) ──────────────────
  chGridLg2: {
    display: 'grid',
    gap: tokens['--jx-space-32'],
    '@media (min-width: 64rem)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  },
  chGridLg21: {
    display: 'grid',
    gap: tokens['--jx-space-32'],
    '@media (min-width: 64rem)': { gridTemplateColumns: '2fr 1fr' },
  },
  chGrid4: {
    display: 'grid',
    gap: tokens['--jx-space-16'],
    '@media (min-width: 40rem)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
    '@media (min-width: 64rem)': { gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' },
  },
  chSpan2Sm: { '@media (min-width: 40rem)': { gridColumn: 'span 2 / span 2' } },
  chSpan2Lg: { '@media (min-width: 64rem)': { gridColumn: 'span 2 / span 2' } },
  chSparkPad: { marginInline: tokens['--jx-space-8'] },
  chMiddle: { verticalAlign: 'middle' },

  // ── docs/components/progressive-blur.html (pr…; 210 at pin) ───────
  prZ5: { zIndex: 5 }, // the band above the content
  prPair: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    gap: tokens['--jx-space-24'],
    '@media (min-width: 40rem)': { flexDirection: 'row', gap: tokens['--jx-space-32'] },
  },
  prHalf: { width: '100%', '@media (min-width: 40rem)': { flexGrow: 1, flexShrink: 1, flexBasis: '0%' } },
  prScroll64: {
    position: 'relative',
    height: '16rem',
    overflow: 'auto',
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-background'],
  },
  prScroll40: {
    position: 'relative',
    height: '10rem',
    overflow: 'auto',
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
  },
  prPinnedHead: {
    position: 'sticky',
    top: 0,
    zIndex: 10,
    backgroundColor: 'color-mix(in oklab, var(--background) 60%, transparent)',
    padding: tokens['--jx-space-8'],
    fontSize: tokens['--jx-text-label'],
  },
  prRow: {
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: 'color-mix(in oklab, var(--border) 50%, transparent)',
    backgroundColor: 'color-mix(in oklab, var(--muted) 30%, transparent)',
    paddingInline: tokens['--jx-space-8'],
    paddingBlock: tokens['--jx-space-8'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-label'],
  },

  // ── docs/components/popover.html (pv…; 202 at pin) ────────────────
  pvPanel13: { display: 'flex', width: '13rem', flexDirection: 'column' },
  pvW52: { width: '13rem' }, // the lone panel-width paragraph
  pvW36: { width: '9rem' },
  pvDl: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    columnGap: tokens['--jx-space-24'],
    rowGap: tokens['--jx-space-4'],
    fontSize: tokens['--jx-text-small'],
  },

  // ── docs/components/ghostty-term.html (gh…; 199 at pin) ───────────
  ghStage40: { height: '10rem' }, // the density stages
  ghStage32: { height: '8rem' },
  ghStage152: { height: '9.5rem' },
  ghDemoShell: {
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-terminal'],
    color: tokens['--jx-terminal-foreground'],
    display: 'flex',
    height: '380px',
    width: '100%',
    flexDirection: 'column',
    overflow: 'hidden',
    boxShadow: tokens['--jx-shadow-md'],
  }, // the build-your-own demo shell
  // the traffic lights (demo artwork — seam vars per the value law)
  ghDotRed: {
    height: '0.5rem',
    width: '0.5rem',
    flex: 'none',
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: 'currentColor',
    backgroundColor: 'var(--gh-dot-red, oklch(0.7 0.18 25))',
  },
  ghDotYellow: {
    height: '0.5rem',
    width: '0.5rem',
    flex: 'none',
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: 'currentColor',
    backgroundColor: 'var(--gh-dot-yellow, oklch(0.85 0.17 95))',
  },
  ghDotGreen: {
    height: '0.5rem',
    width: '0.5rem',
    flex: 'none',
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: 'currentColor',
    backgroundColor: 'var(--gh-dot-green, oklch(0.75 0.17 150))',
  },
  ghTitleBtn: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    transitionProperty: 'color, background-color, border-color, text-decoration-color, fill, stroke',
    ':hover': { color: tokens['--jx-terminal-foreground'] },
  },
  ghBtn: {
    height: '1.5rem',
    width: '2.5rem',
    cursor: 'pointer',
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: 'transparent',
  }, // the demo title-bar buttons

  // the measured paragraph (zone ×11): 64ch ceiling, pretty wrap, the
  // 13px body pair, muted ink — and the 14px sm step at 40rem
  measurePara: {
    maxWidth: '64ch',
    textWrap: 'pretty',
    fontSize: 'var(--jx-text-base)',
    lineHeight: 'calc(var(--jx-unit) * 6)',
    color: tokens['--jx-muted-foreground'],
    '@media (min-width: 40rem)': { fontSize: tokens['--jx-text-sm'] },
  },

  // ── docs/components/scroll-area.html (sa…; 192 at pin) ────────────
  saStage40: { height: '10rem' }, // the demo stage heights
  saStage36: { height: '9rem' },
  saStage56: { height: '14rem' },
  saStage64: { height: '16rem' },
  saGrid900: {
    display: 'grid',
    gap: tokens['--jx-space-12'],
    '@media (min-width: 900px)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
  },
  saGrid900Side: {
    display: 'grid',
    gap: tokens['--jx-space-16'],
    '@media (min-width: 900px)': { gridTemplateColumns: '1fr 13rem' },
  },

  // ── docs/context-defaults.html (cd…; 187 at pin) ──────────────────
  cdGrid20: {
    display: 'grid',
    gap: tokens['--jx-space-20'],
    gridTemplateColumns: 'minmax(0, 1fr)',
    '@media (min-width: 760px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  },
  cdGrid24: {
    display: 'grid',
    gap: tokens['--jx-space-24'],
    gridTemplateColumns: 'minmax(0, 1fr)',
    '@media (min-width: 760px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  },

  // ── docs/components/table.html (tb…; 184 at pin) ──────────────────
  tbGridMd2: { '@media (min-width: 48rem)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' } },
  tbGridMd2Full: {
    display: 'grid',
    gap: tokens['--jx-space-16'],
    '@media (min-width: 48rem)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  },

  // ── docs/components/chip.html (chip…; 182 at pin) ─────────────────
  chipGrid: {
    display: 'grid',
    width: '100%',
    gap: tokens['--jx-space-12'],
    '@media (min-width: 40rem)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
    '@media (min-width: 64rem)': { gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' },
  },

  // ── probe-stylex-corpus (psc…; 9 at pin) ──────────────────────────
  pscP32: { padding: tokens['--jx-space-32'] }, // p-8
  pscMb24: { marginBottom: tokens['--jx-space-24'] }, // mb-6
  pscMaxWProse: { maxWidth: '65ch' }, // max-w-prose — structural literal

  // ── probe-float-button-area (pfa…; 9 at pin) ──────────────────────
  pfaP32: { padding: tokens['--jx-space-32'] }, // p-8
  pfaMb24: { marginBottom: tokens['--jx-space-24'] }, // mb-6
  pfaMaxWProse: { maxWidth: '65ch' }, // max-w-prose — structural literal

  // ── docs.html (dx…; 64 at pin) ────────────────────────────────────
  // the section-card grid: 2 up at sm, 3 at lg
  dxGrid: {
    display: 'grid',
    gap: tokens['--jx-space-16'],
    '@media (min-width: 40rem)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
    '@media (min-width: 64rem)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
  },
  // the section heading voice: text-[1.05rem] (16.8px) rides the ruler
  dxHeading: { fontSize: 'calc(var(--jx-text-base) + var(--jx-unit) * 0.95)' },
  // the curriculum link cell: two-baseline grid with the muted→fg hover
  dxNavLink: {
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    alignItems: 'baseline',
    columnGap: tokens['--jx-space-8'],
    rowGap: tokens['--jx-space-2'],
    color: tokens['--jx-muted-foreground'],
    transitionProperty: 'color, background-color, border-color, text-decoration-color, fill, stroke',
    ':hover': { color: tokens['--jx-foreground'] },
  },
  dxCol1: { gridColumnStart: 1 },
  dxRow1: { gridRowStart: 1 },
  dxCol2: { gridColumnStart: 2 },
  dxRow2: { gridRowStart: 2 },
  dxOpacity50: { opacity: 0.5 },
  dxTrack02: { letterSpacing: 'var(--track-02, 0.02em)' }, // tracking-[0.02em] — seam (no positive 0.02em step)

  // ═══ Wave 3 batch C seats (w3-c; one slug per route; atoms never
  // cross files) ═════════════════════════════════════════════════

  // ── routes/docs/+layout.svelte (dl…; 7 at pin) ────────────────────
  // the print-controls strip shell: the docs shell's shape with a
  // block-start-only 24px (py-10 → pt-6 seam)
  dlControls: {
    width: '100%',
    maxWidth: tokens['--jx-shell-w'],
    marginInline: 'auto',
    paddingInline: tokens['--jx-space-16'],
    paddingTop: tokens['--jx-space-24'],
    '@media (min-width: 40rem)': { paddingInline: tokens['--jx-space-24'] },
    '@media (min-width: 64rem)': { paddingInline: tokens['--jx-space-32'] },
  },

  // ── probe-tooltip-area (tta…; 9 at pin) ───────────────────────────
  ttaPad: { padding: tokens['--jx-space-32'] }, // p-8 — no pattern p32
  ttaMb24: { marginBottom: tokens['--jx-space-24'] }, // mb-6 — no pattern mb24
  ttaProse: { maxWidth: '65ch' }, // max-w-prose

  // ── probe-menubar-area (mba…; 9 at pin) ───────────────────────────
  mbaPad: { padding: tokens['--jx-space-32'] },
  mbaMb24: { marginBottom: tokens['--jx-space-24'] },
  mbaProse: { maxWidth: '65ch' },

  // ── probe-folder-css (pfc…; 14 at pin) ────────────────────────────
  pfcPad: { padding: tokens['--jx-space-32'] },
  pfcProse: { maxWidth: '65ch' },

  // ═══ Wave 3 batch B seats (w3-b; one slug per route; atoms never
  // cross files) ═════════════════════════════════════════════════

  // ── patterns.html (pt…; 58 at pin) ────────────────────────────────
  // the gallery grid: 2 up at 760px, 3 at 1100px (original thresholds)
  ptGrid: {
    display: 'grid',
    gap: tokens['--jx-space-16'],
    '@media (min-width: 760px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
    '@media (min-width: 1100px)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
  },
  ptRadius: { borderRadius: tokens['--jx-radius'] }, // rounded-(--radius)
  // the card's press physics: hover grows the shadow + primary edge,
  // active presses 1px into the page, reduced motion freezes all
  ptCardFx: {
    transitionProperty: 'transform, box-shadow, border-color',
    transitionDuration: tokens['--jx-motion-150'],
    ':hover': { borderColor: tokens['--jx-primary'], boxShadow: tokens['--jx-shadow-sm'] },
    ':active': { transform: 'translate(1px, 1px)', boxShadow: 'none' },
    '@media (prefers-reduced-motion: reduce)': { transitionProperty: 'none' },
  },
  // the card heading: 16.8px rides the ruler; leading-tight pairs
  ptHeading: {
    fontSize: 'calc(var(--jx-text-base) + var(--jx-unit) * 0.95)',
    lineHeight: tokens['--jx-leading-tight'],
  },
  // the summary body: 13px/20px with the 3.2rem floor (structural)
  ptSummary: {
    minHeight: '3.2rem',
    fontSize: 'var(--jx-text-base)',
    lineHeight: 'calc(var(--jx-unit) * 5)',
    color: tokens['--jx-muted-foreground'],
  },
  ptTrack04: { letterSpacing: tokens['--jx-track-04'] }, // tracking-[0.04em]
  ptMtAuto: { marginTop: 'auto' }, // mt-auto

  // ── docs/components/empty.html (em…; 30 at pin) ────────────────────
  emGrid: {
    display: 'grid',
    gap: tokens['--jx-space-16'],
    '@media (min-width: 48rem)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  }, // grid gap-4 md:grid-cols-2

  // ── docs/components/result.html (rs…; 38 at pin) ───────────────────
  // the posture pair: gap-6 with the 720px column seam
  rsGrid: {
    display: 'grid',
    gap: tokens['--jx-space-24'],
    '@media (min-width: 720px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  },
  rsGridMd2: {
    display: 'grid',
    gap: tokens['--jx-space-16'],
    '@media (min-width: 48rem)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  },

  // ── blueprints.html (bp…; 29 at pin) ──────────────────────────────
  bpGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: tokens['--jx-space-24'],
  }, // the satori stage wall
  bpTrack30: { letterSpacing: 'var(--track-30, 0.3em)' }, // tracking-[0.3em] — seam (no 0.3em step)
  bpTrack20: { letterSpacing: tokens['--jx-track-20'] }, // tracking-[0.2em]
  bpText08: { fontSize: 'var(--text-08em, 0.8em)' }, // text-[0.8em] — the em-scaled subtitle
  bpInkDestructive: { color: tokens['--jx-destructive'] }, // the missing-scene flag

  // ═══ Wave-3 batch-A page seats ════════════════════════════════════

  // ── docs/components.html (cg…; 22 at pin) ─────────────────────────
  // the group heading voice: nav caps over the 1px rule that flexes
  cgHeading: {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens['--jx-space-16'],
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-lg'],
    textTransform: 'uppercase',
    letterSpacing: 'var(--track-30, 0.3em)',
  }, // tracking-[0.3em] — the 0.3em seam (bp twin)
  cgRule: { height: '1px', backgroundColor: tokens['--jx-border'] }, // bg-border h-px

  // ── +page.svelte, the home (hm…; 52 at pin) ───────────────────────
  hmShell: {
    width: '100%',
    maxWidth: tokens['--jx-shell-w'],
    marginInline: 'auto',
    paddingInline: tokens['--jx-space-16'],
    '@media (min-width: 40rem)': { paddingInline: tokens['--jx-space-24'] },
    '@media (min-width: 64rem)': { paddingInline: tokens['--jx-space-32'] },
  }, // the py-free shell band
  hmShellPt: {
    width: '100%',
    maxWidth: tokens['--jx-shell-w'],
    marginInline: 'auto',
    paddingInline: tokens['--jx-space-16'],
    paddingTop: tokens['--jx-space-32'],
    '@media (min-width: 40rem)': { paddingInline: tokens['--jx-space-24'] },
    '@media (min-width: 64rem)': { paddingInline: tokens['--jx-space-32'] },
  }, // the pt-8 twin
  hmHeading: {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens['--jx-space-16'],
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-lg'],
    textTransform: 'uppercase',
    letterSpacing: 'var(--track-30, 0.3em)',
  }, // the Why band voice (cg twin)
  hmRule: { height: '1px', backgroundColor: tokens['--jx-border'] },
  hmMl2: { marginLeft: tokens['--jx-space-2'] }, // ml-0.5 — the external-link nudge
  hmAlign: { verticalAlign: '-0.125em' }, // align-[-0.125em]

  // ── docs/registry.html (rg…; 47 at pin) ───────────────────────────
  rgHeading: {
    display: 'flex',
    alignItems: 'baseline',
    gap: tokens['--jx-space-16'],
    marginBottom: tokens['--jx-space-16'],
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-lg'],
    textTransform: 'uppercase',
    letterSpacing: 'var(--track-30, 0.3em)',
  }, // the inventory band voice (cg twin + mb-4)
  rgRule: { height: '1px', backgroundColor: tokens['--jx-border'] },
  rgMt2: { marginTop: tokens['--jx-space-2'] }, // mt-0.5 — the note glyph

  // ── probe-popover-area (ppa…; 8 at pin) ───────────────────────────
  ppaPad: { padding: tokens['--jx-space-32'] }, // p-8
  ppaMb24: { marginBottom: tokens['--jx-space-24'] }, // mb-6
  ppaProse: { maxWidth: '65ch' }, // max-w-prose — the TW prose measure

  // ── probe-dropdown-area (pda…; 8 at pin) ──────────────────────────
  pdaPad: { padding: tokens['--jx-space-32'] }, // p-8 (ppa twin)
  pdaMb24: { marginBottom: tokens['--jx-space-24'] }, // mb-6
  pdaProse: { maxWidth: '65ch' }, // max-w-prose

  // ── probe-timeline-progress (ptp…; 39 at pin) ─────────────────────
  ptpPad: { padding: tokens['--jx-space-32'] }, // p-8 (ppa twin)
  ptpMb40: { marginBottom: tokens['--jx-space-40'] }, // mb-10
  ptpScroll: { height: '16rem', overflowY: 'auto' }, // h-64 overflow-y-auto — arm D's runway

  // ── docs/components/image.html (im…; 70 at pin) ───────────────────
  imFallbackFrame: {
    borderWidth: 'var(--hairline)',
    borderStyle: 'dashed',
    borderColor: tokens['--jx-border'],
  }, // the composed-fallback span's dashed frame

  // ── docs/components/highlight-detect-default.html (hdd…; 26 at pin)
  // the wrapped/unwrapped card pair: column stack at base, the two-up
  // grid at 760px (flex:none in the grid arm)
  hddPair: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens['--jx-space-16'],
    '@media (min-width: 760px)': {
      display: 'grid',
      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
      gap: tokens['--jx-space-16'],
      flexGrow: 0,
      flexShrink: 1,
      flexBasis: 'auto',
    },
  },

  // ── docs/components/badge-indicator.html (bi…; 113 at pin) ────────
  // the demo child box the badge rides: the 2rem frame square
  biChild: {
    display: 'inline-flex',
    width: '2rem',
    height: '2rem',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-muted'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-label'],
  }, // size-8 inline-flex frame + bg-muted + mono 11px

  // ── docs/components/pagination.html (pgn…; 55 at pin) ─────────────
  pgnGrid: {
    display: 'grid',
    gridTemplateColumns: '8rem 1fr',
    columnGap: tokens['--jx-space-24'],
    rowGap: tokens['--jx-space-6'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-small'],
  }, // the props grid (gap-x-6 / gap-y-1.5 have no pattern pair)
  pgnGrid23: {
    display: 'grid',
    gap: tokens['--jx-space-12'],
    '@media (min-width: 40rem)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
    '@media (min-width: 64rem)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
  }, // grid gap-3 sm:grid-cols-2 lg:grid-cols-3

  // ── docs/components/scroll-virtual.html (sv…; 74 at pin) ───────────
  svOffset4: { textUnderlineOffset: '4px' }, // underline-offset-4
  svHover: { ':hover': { textDecorationLine: 'underline' } }, // hover:underline
  svSpacer72: { height: '18rem' }, // h-72 — the virtual runway
  svH36: { height: '9rem' }, // h-36 — the density sample
  // the jump chip: the press law with the shadow vars zeroed
  svJumpBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-background'],
    paddingInline: tokens['--jx-space-8'],
    paddingBlock: 'calc(var(--jx-unit) * 0.8)',
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-label-lg'],
    color: tokens['--jx-muted-foreground'],
    cursor: 'pointer',
    '--jx-press-shadow': 'none',
    '--jx-press-shadow-hover': 'none',
    '--jx-press-shadow-active': 'none',
    ':hover': { color: tokens['--jx-foreground'] },
  },

  // ── docs/demo-standard.html (ds…; 76 at pin) ──────────────────────
  dsGridLg2: {
    display: 'grid',
    gap: tokens['--jx-space-16'],
    '@media (min-width: 64rem)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  }, // grid gap-4 lg:grid-cols-2

  // ── docs/components/cascader.html (csc…; 68 at pin) ────────────────
  cscGridMd3: {
    display: 'grid',
    gap: tokens['--jx-space-16'],
    '@media (min-width: 48rem)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
  }, // grid gap-4 md:grid-cols-3

  // ── docs/components/blockquote.html (bq…; 69 at pin) ───────────────
  bqGrid640a: {
    display: 'grid',
    gap: tokens['--jx-space-16'],
    '@media (min-width: 640px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  }, // grid gap-4 min-[640px]:grid-cols-2
  bqGrid640b: {
    display: 'grid',
    gap: tokens['--jx-space-16'],
    '@media (min-width: 640px)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
  }, // grid gap-4 min-[640px]:grid-cols-3

  // ── docs/components/float-button.html (fb…; 84 at pin) ─────────────
  fbGridSm2: {
    display: 'grid',
    gap: tokens['--jx-space-12'],
    '@media (min-width: 40rem)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  }, // grid gap-3 sm:grid-cols-2
  // the demo trigger: hit-lane floors + popover ground + press shadows
  fbDemoBtn: {
    display: 'inline-flex',
    minHeight: 'var(--jx-hit)',
    minWidth: 'var(--jx-hit)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-popover'],
    color: tokens['--jx-popover-foreground'],
    '--jx-press-shadow': 'var(--shadow)',
    '--jx-press-shadow-hover': 'var(--shadow-md)',
    '--jx-press-shadow-active': 'var(--shadow-md-press)',
  },

  // ── parity.html (par…; 85 at pin) ─────────────────────────────────
  parW40: { width: '10rem' }, // w-40 — the contrast tile
  parProse: { maxWidth: '65ch' }, // max-w-prose
  parTrack30: { letterSpacing: 'var(--track-30, 0.3em)' }, // tracking-[0.3em] — seam
  parP40: { padding: tokens['--jx-space-40'] }, // p-10 — no pattern p40

  // ── docs/recipes.html (rcp…; 41 at pin) ───────────────────────────
  rcpSize10: { width: '2.5rem', height: '2.5rem' }, // size-10 — the swatch box
  rcpMax38: { maxWidth: '38rem' }, // max-w-[38rem] — the watermark stage
  rcpGrid: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    gap: tokens['--jx-space-16'],
    '@media (min-width: 40rem)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
  }, // grid grid-cols-1 sm:grid-cols-3 gap-4
  rcpTitle: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'calc(var(--jx-text-base) + var(--jx-unit) * 1.63)',
    letterSpacing: tokens['--jx-track-tight'],
  }, // the 19.52px hero step — css-exact, un-promoted (sheet ruling)

  // ── docs/components/carousel.html (ca…; 89 at pin) ─────────────────
  caGrid: {
    display: 'grid',
    gap: tokens['--jx-space-16'],
    '@media (min-width: 48rem)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
  }, // grid gap-4 md:grid-cols-3

  // ── docs/components/sheet.html (sh…; 79 at pin) ────────────────────
  shGrid: {
    display: 'grid',
    gap: tokens['--jx-space-16'],
    '@media (min-width: 48rem)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
  }, // grid gap-4 md:grid-cols-3

  // ── docs/components/hover-card.html (hc…; 84 at pin) ───────────────
  hcBody: {
    fontSize: tokens['--jx-text-body-lg'],
    lineHeight: 'calc(var(--jx-unit) * 7)',
  }, // text-[13.5px] leading-7 — the pair composite (the bare 13.5px atom is text135)
  hcOffset4: { textUnderlineOffset: '4px' }, // underline-offset-4
  hcGrid: {
    display: 'grid',
    gap: tokens['--jx-space-16'],
    '@media (min-width: 48rem)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
  }, // grid gap-4 md:grid-cols-3

  // ── docs/components/menubar.html (mbar…; 62 at pin) ─────────────────
  mbarGrid: {
    display: 'grid',
    gap: tokens['--jx-space-16'],
    '@media (min-width: 40rem)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  }, // grid gap-4 sm:grid-cols-2

  // ── docs/components/command.html (cmd…; 54 at pin) ─────────────────
  cmdGrid: {
    display: 'grid',
    width: '100%',
    gap: tokens['--jx-space-16'],
    '@media (min-width: 40rem)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  }, // grid w-full gap-4 sm:grid-cols-2

  // ── docs/components/link.html (lk…; 67 at pin) ─────────────────────
  lkBody: {
    fontSize: tokens['--jx-text-body-lg'],
    lineHeight: 'calc(var(--jx-unit) * 7)',
  }, // text-[13.5px] leading-7

  // ── docs/components/breadcrumb.html (bc…; 74 at pin) ───────────────
  bcGrid: {
    display: 'grid',
    gap: tokens['--jx-space-16'],
    '@media (min-width: 40rem)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
  }, // grid gap-4 sm:grid-cols-3

  // ── docs/components/theme-toggle.html (tt…; 220 at pin) ────────────
  ttGapX32: { columnGap: tokens['--jx-space-32'] }, // gap-x-8 — no pattern gapX32

  // ── docs/components/website-scaffold.html (ws…; 204 at pin) ────────
  // the architecture card's head band: the sm padding step rides media
  wsCardHead: {
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
  // the card title voice: 16.8px ruler base, 19.52px at sm, balance wrap
  wsTitle: {
    fontSize: 'calc(var(--jx-text-base) + var(--jx-unit) * 0.95)',
    lineHeight: tokens['--jx-leading-tight'],
    color: tokens['--jx-foreground'],
    textWrap: 'balance',
    '@media (min-width: 40rem)': { fontSize: 'calc(var(--jx-text-base) + var(--jx-unit) * 1.63)' },
  },
  // the card body: 13px/20px muted with the 64ch measure, sm 14px/24px
  wsPara: {
    maxWidth: '64ch',
    textWrap: 'pretty',
    fontSize: 'var(--jx-text-base)',
    lineHeight: 'calc(var(--jx-unit) * 5)',
    color: tokens['--jx-muted-foreground'],
    '@media (min-width: 40rem)': {
      fontSize: tokens['--jx-text-sm'],
      lineHeight: 'calc(var(--jx-unit) * 6)',
    },
  },
  wsPad: {
    paddingInline: tokens['--jx-space-16'],
    paddingBlock: tokens['--jx-space-16'],
    '@media (min-width: 40rem)': {
      paddingInline: tokens['--jx-space-20'],
      paddingBlock: tokens['--jx-space-20'],
    },
  }, // px-4 py-4 sm:px-5 sm:py-5

  // ── docs/components/terminal-header.html (thd…; 170 at pin) ────────
  thdCardHead: {
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
  thdTitle: {
    fontSize: 'calc(var(--jx-text-base) + var(--jx-unit) * 0.95)',
    lineHeight: tokens['--jx-leading-tight'],
    color: tokens['--jx-foreground'],
    textWrap: 'balance',
    '@media (min-width: 40rem)': { fontSize: 'calc(var(--jx-text-base) + var(--jx-unit) * 1.63)' },
  },
  thdPara: {
    maxWidth: '64ch',
    textWrap: 'pretty',
    fontSize: 'var(--jx-text-base)',
    lineHeight: 'calc(var(--jx-unit) * 5)',
    color: tokens['--jx-muted-foreground'],
    '@media (min-width: 40rem)': {
      fontSize: tokens['--jx-text-sm'],
      lineHeight: 'calc(var(--jx-unit) * 6)',
    },
  },
  thdPad: {
    paddingInline: tokens['--jx-space-16'],
    paddingBlock: tokens['--jx-space-16'],
    '@media (min-width: 40rem)': {
      paddingInline: tokens['--jx-space-20'],
      paddingBlock: tokens['--jx-space-20'],
    },
  },
  thdTrack20: { letterSpacing: tokens['--jx-track-20'] }, // tracking-[0.2em]

  // ── docs/components/kbd.html (kb…; 231 at pin) ─────────────────────
  // the shortcut row: full-width button voice with the muted/50 hover
  kbRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens['--jx-space-16'],
    paddingInline: tokens['--jx-space-12'],
    paddingBlock: tokens['--jx-space-8'],
    textAlign: 'left',
    fontSize: 'var(--jx-text-base)',
    ':hover': { backgroundColor: 'color-mix(in oklab, var(--muted) 50%, transparent)' },
  },
  kbW14: { width: '3.5rem' }, // w-14 — the label column

  // ── docs/components/toc.html (tc…; 143 at pin) ─────────────────────
  // the workbench grid: article + the 14rem outline rail at 900px
  tcGrid: {
    display: 'grid',
    width: '100%',
    gap: tokens['--jx-space-32'],
    '@media (min-width: 900px)': { gridTemplateColumns: 'minmax(0, 1fr) 14rem' },
  },
  // the article heading voice: 16.8px ruler, 19.52px at sm
  tcHeading: {
    fontSize: 'calc(var(--jx-text-base) + var(--jx-unit) * 0.95)',
    '@media (min-width: 40rem)': { fontSize: 'calc(var(--jx-text-base) + var(--jx-unit) * 1.63)' },
  },
  // the article paragraph: 64ch measured body with the sm 14px step
  tcPara: {
    maxWidth: '64ch',
    textWrap: 'pretty',
    fontSize: 'var(--jx-text-base)',
    lineHeight: 'calc(var(--jx-unit) * 6)',
    color: tokens['--jx-muted-foreground'],
    '@media (min-width: 40rem)': { fontSize: tokens['--jx-text-sm'] },
  },

  // ═══ Wave-3 batch-A page seats, wave 2 ════════════════════════════

  // ── docs/components/radio.html (ra…; 73 at pin) ────────────────────
  raLane: {
    display: 'flex',
    width: '100%',
    maxWidth: '20rem',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: tokens['--jx-space-12'],
  }, // the demo lane
  raCell: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: tokens['--jx-space-8'],
  }, // the demo-cell inner stack

  // ── docs/components/popconfirm.html (pc…; 89 at pin) ───────────────
  pcTrack08: { letterSpacing: 'var(--track-08, 0.08em)' }, // tracking-[0.08em] — seam
  pcLead15: { lineHeight: 'var(--leading-15)' }, // leading-[1.5] unitless
  pcRowEnd: { display: 'flex', justifyContent: 'flex-end', gap: tokens['--jx-space-8'] },
  // the demo action button (the native-popover recipe's ghost voice)
  pcBtn: {
    appearance: 'none',
    paddingInline: tokens['--jx-space-12'],
    paddingBlock: 'calc(var(--jx-unit) * 1.25)',
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-background'],
    color: tokens['--jx-foreground'],
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label'],
    letterSpacing: tokens['--jx-track-10'],
    textTransform: 'uppercase',
    cursor: 'pointer',
    boxShadow: tokens['--jx-shadow-2xs'],
  },

  // ── docs/components/toggle-group.html (tg…; 49 at pin) ─────────────
  tgStack: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: tokens['--jx-space-20'],
  }, // the canvas lane stack
  tgGrid: {
    display: 'grid',
    width: '100%',
    gap: tokens['--jx-space-16'],
    '@media (min-width: 40rem)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  }, // the w-full twin of gridSm2

  // ── docs/components/terminal-card.html (termc…; 111 at pin; tc is
  //    the toc page's prefix) ─────────────────────────────────────────
  termcStage: {
    display: 'flex',
    width: '100%',
    maxWidth: '38rem',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens['--jx-space-20'],
  }, // the centered demo stage
  termcPanel: {
    display: 'flex',
    minWidth: '16rem',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '0%',
    flexDirection: 'column',
    gap: tokens['--jx-space-12'],
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    padding: tokens['--jx-space-16'],
  }, // the variant panel (min-w-64 flex-1 …)

  // ── docs/components/anchor.html (an…; 85 at pin) ───────────────────
  anGrid: {
    display: 'grid',
    gap: tokens['--jx-space-32'],
    '@media (min-width: 1024px)': { gridTemplateColumns: 'minmax(0, 1fr) 200px' },
  }, // the article + rail split
  // the section heading voice: 16.8px ruler, 18.4px at sm (the 1.05/
  // 1.15rem pair — no sheet steps, ruler equations)
  anHeading: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'calc(var(--jx-text-base) + var(--jx-unit) * 3.8)',
    letterSpacing: tokens['--jx-track-tight'],
    '@media (min-width: 40rem)': {
      fontSize: 'calc(var(--jx-text-base) + var(--jx-unit) * 5.4)',
    },
  },
  anGrid12: {
    display: 'grid',
    gap: tokens['--jx-space-12'],
    '@media (min-width: 40rem)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  }, // the gap-3 sm:2 twin
  anBorderL: {
    borderLeftWidth: 'var(--hairline)',
    borderLeftStyle: 'solid',
    borderColor: tokens['--jx-border'],
  }, // the usage demo's gutter line
  anMt32: { marginTop: tokens['--jx-space-32'] }, // mt-8 — the section offsets
  // the usage demo's nav item (the component's own item recipe)
  anDemoItem: {
    display: 'flex',
    minHeight: 'var(--jx-hit)',
    alignItems: 'center',
    borderLeftWidth: 'calc(var(--jx-unit) * 0.5)',
    borderLeftStyle: 'solid',
    borderLeftColor: tokens['--jx-primary'],
    paddingInline: 'var(--jx-inset)',
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--jx-text)',
    lineHeight: 'var(--jx-line)',
  },

  // ── docs/components/language-switcher.html (ls…; 134 at pin) ───────
  lsStage: {
    display: 'flex',
    width: '100%',
    flexDirection: 'column',
    gap: tokens['--jx-space-24'],
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-terminal'],
    color: tokens['--jx-terminal-foreground'],
    padding: tokens['--jx-space-20'],
    '@media (min-width: 40rem)': { padding: tokens['--jx-space-24'] },
  }, // the bezel demo stage
  lsChips: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: tokens['--jx-space-40'],
    rowGap: tokens['--jx-space-20'],
  }, // the demo chip well
  lsLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens['--jx-space-10'],
    fontSize: tokens['--jx-text-label-lg'],
    color: 'color-mix(in oklab, var(--terminal-foreground) 70%, transparent)',
  }, // the demo lane labels
  lsFoot: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: tokens['--jx-space-10'],
    borderTopWidth: 'var(--hairline)',
    borderTopStyle: 'solid',
    borderColor: 'color-mix(in oklab, var(--terminal-foreground) 15%, transparent)',
    paddingTop: tokens['--jx-space-20'],
  }, // the stage footnote band
  lsInk60: { color: 'color-mix(in oklab, var(--terminal-foreground) 60%, transparent)' },
  lsPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens['--jx-space-12'],
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    padding: tokens['--jx-space-16'],
  }, // the variant panel

  // ── docs/components/native-scroll-area.html (nsa…; 151 at pin) ─────
  nsaLane: {
    display: 'flex',
    width: '100%',
    maxWidth: '28rem',
    flexDirection: 'column',
    gap: tokens['--jx-space-12'],
  }, // the demo lane
  nsaH40: { height: '10rem' }, // the demo stage heights
  nsaH36: { height: '9rem' },
  nsaH28: { height: '7rem' },
  nsaH72: { height: '18rem' },
  nsaH56: { height: '14rem' },
  nsaRow: {
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: 'color-mix(in oklab, var(--border) 40%, transparent)',
    backgroundColor: 'color-mix(in oklab, var(--muted) 40%, transparent)',
    paddingInline: tokens['--jx-space-12'],
    paddingBlock: tokens['--jx-space-6'],
    fontSize: tokens['--jx-text-small'],
  }, // the demo row cells
  nsaPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens['--jx-space-12'],
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    padding: tokens['--jx-space-16'],
  }, // the capability panel
  nsaTierGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: tokens['--jx-space-8'],
  }, // the three-tier stage
  nsaTierContent: {
    width: '10rem',
    whiteSpace: 'nowrap',
    paddingBlock: tokens['--jx-space-4'],
    fontSize: tokens['--jx-text-label-lg'],
  }, // the tier demo's wide content

  // ── docs/components/accordion.html (ac…; 107 at pin) ───────────────
  acTint: {
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: 'color-mix(in oklab, var(--muted) 40%, transparent)',
    paddingInline: tokens['--jx-space-16'],
    paddingBlock: tokens['--jx-space-16'],
  }, // the law panel tint (notePanel twin, literal px)

  // ── docs/components/component-canvas.html (ccn…; 121 at pin) ───────
  ccnMaxW: { maxWidth: '38rem' }, // the demo measure
  ccnTint: {
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: 'color-mix(in oklab, var(--muted) 40%, transparent)',
    paddingInline: tokens['--jx-space-16'],
    paddingBlock: tokens['--jx-space-16'],
  }, // the law panel tint

  // ── docs/components/pattern-hero-set.html (phs…; 58 at pin) ────────
  phsStage: {
    width: '100%',
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: 'color-mix(in oklab, var(--muted) 40%, transparent)',
  }, // the hero demo stage frame

  // ── docs/components/math-inline.html (mi…; 33 at pin) ──────────────
  miLead7: { lineHeight: 'calc(var(--jx-unit) * 7)' }, // leading-7 = 28px

  // ═══ Wave-3 batch-A page seats, wave 3 (the large pages) ══════════

  // ── docs/components/statistic.html (st…; 63 at pin) ────────────────
  stWrap8: { display: 'flex', flexWrap: 'wrap', gap: tokens['--jx-space-8'] },
  stWrapEnd: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'flex-end',
    gap: tokens['--jx-space-16'],
  },
  stGrid560: {
    display: 'grid',
    gap: tokens['--jx-space-24'],
    '@media (min-width: 560px)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
  },
  stGrid720: {
    display: 'grid',
    gap: tokens['--jx-space-24'],
    '@media (min-width: 720px)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
  },
  stMono115: {
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'calc(var(--jx-text-base) - var(--jx-unit) * 0.375)',
    color: tokens['--jx-muted-foreground'],
  }, // the 11.5px mono note

  // ── docs/components/textarea.html (ta…; 76 at pin) ─────────────────
  taLane: {
    display: 'flex',
    width: '100%',
    maxWidth: '28rem',
    flexDirection: 'column',
    gap: tokens['--jx-space-12'],
  }, // the demo lane

  // ── docs/components/transfer.html (tr…; 76 at pin) ─────────────────
  trWrap8: { display: 'flex', flexWrap: 'wrap', gap: tokens['--jx-space-8'] },
  trLane: {
    display: 'flex',
    width: '100%',
    maxWidth: '42rem',
    flexDirection: 'column',
    gap: tokens['--jx-space-12'],
  }, // the demo lane
  trGrid: {
    display: 'grid',
    width: '100%',
    alignItems: 'flex-start',
    gap: tokens['--jx-space-16'],
    '@media (min-width: 900px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  }, // the panels + verdict split
  trMono115: {
    fontFamily: tokens['--jx-font-mono'],
    fontSize: 'calc(var(--jx-text-base) - var(--jx-unit) * 0.375)',
    color: tokens['--jx-muted-foreground'],
  }, // st twin (page-local per the seat law)

  // ── docs/components/tags-input.html (ti…; 118 at pin) ──────────────
  tiPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens['--jx-space-16'],
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    padding: tokens['--jx-space-16'],
  }, // `flex flex-col gap-4 border-border border p-4`
  tiHint: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: tokens['--jx-space-8'],
    color: tokens['--jx-muted-foreground'],
    fontSize: 'var(--jx-text-base)',
    lineHeight: 'calc(var(--jx-unit) * 6)',
  }, // the empty-state hint
  tiLane: {
    display: 'flex',
    width: '100%',
    maxWidth: '20rem',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: tokens['--jx-space-12'],
  }, // the demo lane (max-w-xs)

  // ── docs/components/color-picker.html (cp…; 80 at pin) ─────────────
  cpLane: {
    display: 'flex',
    width: '100%',
    maxWidth: '20rem',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: tokens['--jx-space-12'],
  }, // ti twin (page-local per the seat law)
  cpGridSm: {
    display: 'grid',
    width: '100%',
    gap: tokens['--jx-space-16'],
    '@media (min-width: 40rem)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
  }, // the w-full sm:3 twin
  cpGrid760: {
    display: 'grid',
    width: '100%',
    gap: tokens['--jx-space-20'],
    '@media (min-width: 760px)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
  }, // the w-full gap-5 760px:3

  // ── docs/components/avatar.html (av…; 90 at pin) ───────────────────
  avWrapRow20: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: tokens['--jx-space-20'],
  }, // the gallery wells

  // ── docs/components/range.html (rng…; rg is the registry's) ────────
  rngStage: {
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: tokens['--jx-space-16'],
  }, // the centered demo stage
  rngLane: {
    display: 'flex',
    width: '100%',
    maxWidth: '20rem',
    flexDirection: 'column',
    gap: tokens['--jx-space-12'],
  }, // the demo lane
  rngGrid760: {
    display: 'grid',
    width: '100%',
    gap: tokens['--jx-space-20'],
    '@media (min-width: 760px)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
  }, // cp twin (page-local per the seat law)
  rngPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens['--jx-space-16'],
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    padding: tokens['--jx-space-16'],
  }, // ti twin (the rtl demo panel)

  // ── docs/components/mermaid.html (mm…; 225 at pin) ─────────────────
  mmW34: { maxWidth: '34rem' }, // the deploy-flow measure

  // ── docs/components/file-input.html (fi…; 159 at pin) ──────────────
  fiPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens['--jx-space-12'],
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    padding: tokens['--jx-space-16'],
  }, // the variant panels
  fiLane: {
    display: 'flex',
    width: '100%',
    maxWidth: '28rem',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: tokens['--jx-space-12'],
  }, // the demo lane
  fiPhone: {
    width: '390px',
    maxWidth: '100%',
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    padding: tokens['--jx-space-16'],
  }, // the phone-width demo

  // ── docs/components/tree-view.html (tv…; 82 at pin) ────────────────
  tvRow: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    paddingBlock: tokens['--jx-space-2'],
    lineHeight: 'var(--leading-tight)',
  }, // py-0.5 leading-tight — the node label stack
  tvGrid900: {
    display: 'grid',
    width: '100%',
    alignItems: 'flex-start',
    gap: tokens['--jx-space-16'],
    '@media (min-width: 900px)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
  }, // the api/props/a11y grid
  tvGrid1000: {
    display: 'grid',
    alignItems: 'flex-start',
    gap: tokens['--jx-space-24'],
    '@media (min-width: 1000px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  }, // the workbench split
  // the demo hue injections (TW palette literals — demo artwork)
  tvAmber: { color: 'oklch(0.769 0.188 70.08)' }, // text-amber-500
  tvBlue: { color: 'oklch(0.623 0.214 259.815)' }, // text-blue-500
  tvPurple: { color: 'oklch(0.627 0.265 303.9)' }, // text-purple-500
  tvYellow: { color: 'oklch(0.795 0.184 86.047)' }, // text-yellow-500

  // ── docs/components/input.html (input…; 153 at pin) ────────────────
  inputLane: {
    display: 'flex',
    width: '100%',
    maxWidth: '20rem',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: tokens['--jx-space-12'],
  }, // the demo lane (max-w-xs)
  inputGrid760: {
    display: 'grid',
    width: '100%',
    gap: tokens['--jx-space-20'],
    '@media (min-width: 760px)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
  }, // cp twin (page-local per the seat law)

  // ── docs/components/scaffold-float.html (sf…; 142 at pin) ──────────
  sfFloatCard: {
    width: '100%',
    maxWidth: '48rem',
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-card'],
    boxShadow: tokens['--jx-shadow-xs'],
  }, // the adoption-explainer card
  sfFloatHead: {
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
  }, // the card head band
  // the hero voice: 16.8px → 19.52px at sm (the 1.05/1.22rem pair,
  // ruler equations — no sheet steps)
  sfHero: {
    fontFamily: tokens['--jx-font-nav'],
    textWrap: 'balance',
    fontSize: 'calc(var(--jx-text-base) + var(--jx-unit) * 3.8)',
    letterSpacing: tokens['--jx-track-tight'],
    lineHeight: 'var(--leading-tight)',
    color: tokens['--jx-foreground'],
    '@media (min-width: 40rem)': {
      fontSize: 'calc(var(--jx-text-base) + var(--jx-unit) * 6.52)',
    },
  },
  // the measured para: 64ch, 13/20 at base, 14/24 at sm
  sfPara: {
    maxWidth: '64ch',
    textWrap: 'pretty',
    fontSize: 'var(--jx-text-base)',
    lineHeight: 'calc(var(--jx-unit) * 5)',
    color: tokens['--jx-muted-foreground'],
    '@media (min-width: 40rem)': {
      fontSize: tokens['--jx-text-sm'],
      lineHeight: 'calc(var(--jx-unit) * 6)',
    },
  },
  sfFloatBody: {
    paddingInline: tokens['--jx-space-16'],
    paddingBlock: tokens['--jx-space-16'],
    '@media (min-width: 40rem)': {
      paddingInline: tokens['--jx-space-20'],
      paddingBlock: tokens['--jx-space-20'],
    },
  }, // the card body band
  sfTint: {
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: 'color-mix(in oklab, var(--muted) 40%, transparent)',
    paddingInline: tokens['--jx-space-12'],
    paddingBlock: tokens['--jx-space-8'],
    fontFamily: tokens['--jx-font-mono'],
    fontSize: tokens['--jx-text-label'],
  }, // the density demo chip

  // ── +layout.svelte, the site chrome (lay…; 87 at pin) ──────────────
  layPx10: { paddingInline: tokens['--jx-space-10'] }, // px-2.5
  layPx4: { paddingInline: tokens['--jx-space-4'] }, // px-1 — the drawer rows
  layPxLg: {
    '@media (min-width: 64rem)': { paddingInline: tokens['--jx-space-12'] },
  }, // lg:px-3
  layHoverFg: { ':hover': { color: tokens['--jx-terminal-foreground'] } },
  layBgTermHover: { backgroundColor: 'var(--terminal-hover)' },
  layCaret: {
    width: '10px',
    height: '10px',
    flex: 'none',
    transitionProperty: 'transform',
    transitionDuration: 'var(--motion-150)',
    transitionTimingFunction: 'var(--motion-ease-in-out, cubic-bezier(0, 0, 0.2, 1))',
  }, // w-2.5 h-2.5 duration-150 ease-out — the nav caret
  layExt: {
    display: 'inline-flex',
    flex: 'none',
    width: '12px',
    height: '12px',
    marginInlineStart: tokens['--jx-space-4'],
    verticalAlign: '-0.125em',
  }, // the external-link glyph box (svg sizing rides .jx-ext-ico)
  layMegaGrid: {
    display: 'grid',
    margin: 'calc(var(--jx-unit) * -0.25)',
    gridTemplateColumns: 'repeat(auto-fill, minmax(13.5rem, 1fr))',
  }, // -m-px + the auto-fill track — the hairline shave law
  layGroupCell: {
    minWidth: 0,
    paddingInline: tokens['--jx-space-12'],
    paddingTop: tokens['--jx-space-8'],
    paddingBottom: tokens['--jx-space-10'],
    borderTopWidth: 'var(--hairline)',
    borderTopStyle: 'solid',
    borderLeftWidth: 'var(--hairline)',
    borderLeftStyle: 'solid',
    borderColor: 'color-mix(in oklab, var(--terminal-foreground) 15%, transparent)',
  }, // the mega panel's group cell
  layGroupLabel: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-micro'],
    lineHeight: 'var(--leading-12)',
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-18'],
    opacity: 0.55,
    padding: 0,
    paddingInlineEnd: tokens['--jx-space-10'],
    marginBottom: tokens['--jx-space-8'],
  }, // leading-[1.2] opacity-55 pe-[0.625rem] — the group eyebrow
  laySubLink: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    alignItems: 'flex-start',
    paddingBlock: 'calc(var(--jx-unit) * 1.75)', // py-[0.4375rem] = 7px — no space-7 step, ruler
    paddingInline: tokens['--jx-space-10'],
    transitionProperty: 'background-color',
    transitionDuration: 'var(--motion-120, 120ms)',
    transitionTimingFunction: 'var(--motion-ease-in-out, cubic-bezier(0, 0, 0.2, 1))',
  }, // py-[0.4375rem] px-[0.625rem] duration-[120ms]
  laySubLabel: {
    fontSize: 'var(--jx-text-base)',
    fontWeight: tokens['--jx-weight-medium'],
    lineHeight: 'var(--leading-snug, 1.375)',
  }, // leading-snug
  laySubDesc: {
    fontSize: tokens['--jx-text-label'],
    lineHeight: 'var(--leading-snug, 1.375)',
    opacity: 0.6,
    display: '-webkit-box',
    WebkitLineClamp: '2',
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  }, // line-clamp-2
  layRowStretch: { display: 'flex', alignItems: 'stretch' },
  layInkTerm60: { color: 'color-mix(in oklab, var(--terminal-foreground) 60%, transparent)' },
  layCollapse: {
    display: 'grid',
    gridTemplateRows: '0fr',
    transitionProperty: 'grid-template-rows',
    transitionDuration: 'var(--motion-200)',
  }, // the height-only disclosure collapse
  layCollapseOpen: { gridTemplateRows: '1fr' },
  layBorderL: {
    borderLeftWidth: 'var(--hairline)',
    borderLeftStyle: 'solid',
    borderColor: 'color-mix(in oklab, var(--terminal-foreground) 15%, transparent)',
  },
  layMGroupLabel: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-micro'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-18'],
    opacity: 0.55,
    paddingTop: tokens['--jx-space-10'],
    paddingBottom: tokens['--jx-space-4'],
    paddingInlineStart: tokens['--jx-space-4'],
  }, // pt-[0.625rem] pb-1 ps-1
  layPs8: { paddingInlineStart: tokens['--jx-space-8'] }, // pl-2
  layLeadTight: { lineHeight: 'var(--leading-tight)' }, // leading-tight
  layOp60: { opacity: 0.6 },
  laySearchBtn: {
    marginRight: tokens['--jx-space-6'],
    display: 'flex',
    minHeight: 'var(--jx-hit)',
    minWidth: 'var(--jx-hit)',
    flex: 'none',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'color-mix(in oklab, var(--terminal-foreground) 70%, transparent)',
    transitionProperty: 'color, background-color, border-color, text-decoration-color, fill, stroke',
  }, // the ⌘K trigger (svg sizing rides .jx-ico-18)
  layNav: { flexWrap: 'nowrap', alignItems: 'center', gap: 0 }, // flex-nowrap gap-0
  layLogo: { height: '1.75rem', width: '1.75rem' }, // h-7 w-7
  layDrawerNav: {
    display: 'flex',
    flexDirection: 'column',
    borderTopWidth: 'var(--hairline)',
    borderTopStyle: 'solid',
    borderColor: 'color-mix(in oklab, var(--terminal-foreground) 10%, transparent)',
    paddingBlock: tokens['--jx-space-8'],
    fontSize: tokens['--jx-text-label-lg'],
  }, // the mobile drawer's nav column

  // ── docs/components/toast.html (to…; 178 at pin) ───────────────────
  toGrid: {
    display: 'grid',
    width: '100%',
    gap: tokens['--jx-space-16'],
    '@media (min-width: 40rem)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  }, // grid w-full gap-4 sm:grid-cols-2

  // ── docs/components/navigation-menu.html (nm…; 95 at pin) ──────────
  nmMega: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    columnGap: tokens['--jx-space-24'],
    rowGap: tokens['--jx-space-4'],
  }, // grid grid-cols-2 gap-x-6 gap-y-1

  // ── docs/components/icon.html (icn…; 100 at pin) ───────────────────
  icnGapX40: { columnGap: tokens['--jx-space-40'] }, // gap-x-10 — no pattern gapX40

  // ── docs/components/list.html (li…; 95 at pin) ─────────────────────
  liGrid: {
    display: 'grid',
    width: '100%',
    maxWidth: '48rem',
    gap: tokens['--jx-space-32'],
    '@media (min-width: 760px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  },
  liGridXY: {
    display: 'grid',
    width: '100%',
    maxWidth: '48rem',
    columnGap: tokens['--jx-space-40'],
    rowGap: tokens['--jx-space-24'],
    '@media (min-width: 760px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  },
  liCode85: { fontSize: 'var(--text-085em, 0.85em)' }, // text-[0.85em] — seam (em-relative step)

  // ── docs/components/number-input.html (ni…; 155 at pin) ────────────
  niMaxWXs: { maxWidth: '20rem' }, // max-w-xs — structural measure
  niGrid760x3: {
    display: 'grid',
    gap: tokens['--jx-space-20'],
    '@media (min-width: 760px)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
  },

  // ── docs/components/date-picker.html (dp…; 120 at pin) ─────────────
  dpMaxWXs: { maxWidth: '20rem' },
  dpGrid: {
    display: 'grid',
    width: '100%',
    gap: tokens['--jx-space-16'],
    '@media (min-width: 760px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  },

  // ── docs/density-2xs.html (d2…; 188 at pin) ────────────────────────
  d2MinW64r: { minWidth: '64rem' }, // the scale table's scroll floor
  // the scale header: label column + ten axis columns (structural tracks)
  d2HeadRow: {
    display: 'grid',
    gridTemplateColumns: '5rem repeat(10, minmax(0, 1fr))',
    alignItems: 'flex-end',
    columnGap: tokens['--jx-space-12'],
    rowGap: tokens['--jx-space-4'],
    borderBottomWidth: 'var(--hairline)',
    borderBottomStyle: 'solid',
    borderColor: tokens['--jx-border'],
    paddingBottom: tokens['--jx-space-8'],
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-14'],
    color: tokens['--jx-muted-foreground'],
  },
  d2PointerNone: { pointerEvents: 'none' }, // the probe cluster
  d2Invisible: { visibility: 'hidden' },
  d2LeadLine: { lineHeight: 'var(--jx-line)' },
  d2GapXGap: { columnGap: 'var(--jx-gap)' },
  d2GapYStack: { rowGap: 'var(--jx-stack)' },
  d2PsInset: { paddingInlineStart: 'var(--jx-inset)' },
  d2MinHRowMin: { minHeight: 'var(--jx-row-min)' },
  d2MinHHit: { minHeight: 'var(--jx-hit)' },
  d2WIcon: { width: 'var(--jx-icon)' },
  d2WImage: { width: 'var(--jx-image)' },
  d2RungRow: {
    display: 'grid',
    gridTemplateColumns: '5rem repeat(10, minmax(0, 1fr))',
    alignItems: 'center',
    columnGap: tokens['--jx-space-12'],
    rowGap: tokens['--jx-space-8'],
    borderBottomWidth: 'var(--hairline)',
    borderBottomStyle: 'solid',
    borderColor: 'color-mix(in oklab, var(--border) 50%, transparent)',
    paddingBlock: tokens['--jx-space-8'],
  },
  d2SelfEnd: { alignSelf: 'flex-end' },
  d2BgPrimary70: { backgroundColor: 'color-mix(in oklab, var(--primary) 70%, transparent)' },
  d2BgPrimary30: { backgroundColor: 'color-mix(in oklab, var(--primary) 30%, transparent)' },
  d2W3: { width: '0.75rem' },
  d2H3: { height: '0.75rem' },
  d2Radius1: { borderRadius: 'calc(var(--jx-unit) * 0.25)' }, // rounded-[1px] — the 1px step rides the ruler
  d2SceneGrid: {
    display: 'grid',
    gap: tokens['--jx-space-24'],
    '@media (min-width: 80rem)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  },
  d2Caption: {
    display: 'block',
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--jx-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-14'],
    color: tokens['--jx-muted-foreground'],
    marginBottom: 'var(--jx-stack)',
  },
  d2PInset: { padding: 'var(--jx-inset)' },
  d2Toolbar: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--jx-gap)',
    marginBottom: 'var(--jx-stack)',
  },
  d2EyebrowSec: {
    fontFamily: tokens['--jx-font-nav'],
    fontSize: 'var(--jx-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-14'],
  },
  d2GapGap: { gap: 'var(--jx-gap)' },
  d2SizeEm: { width: '1.15em', height: '1.15em' }, // size-[1.15em] — em-relative icon box
  d2PropRows: {
    display: 'grid',
    gap: 'var(--jx-stack)',
    marginTop: 'var(--jx-stack)',
    '@media (min-width: 420px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  },

  // ── docs/components/text.html (tx…; 157 at pin) ────────────────────
  txBody: { fontSize: tokens['--jx-text-sm'], lineHeight: 'calc(var(--jx-unit) * 7)' }, // text-[14px] leading-7
  txW16: { width: '4rem' }, // w-16 — the matrix label column
  txCode85: { fontSize: 'var(--text-085em, 0.85em)' }, // seam twin of liCode85

  // ── docs/components/math-block.html (mbk…; 202 at pin) ─────────────
  mbkMaxW42: { maxWidth: '42rem' }, // the figure measure

  // ── docs/components/descriptions.html (de…; 167 at pin) ────────────
  deGrid: {
    display: 'grid',
    width: '100%',
    maxWidth: '48rem',
    gap: tokens['--jx-space-24'],
    '@media (min-width: 720px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  },
  deGridMd2: {
    display: 'grid',
    width: '100%',
    gap: tokens['--jx-space-12'],
    '@media (min-width: 48rem)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  },
  // grid-cols-1! — the consumer override law: important-pinned so no
  // layer order can flip the component's own cols channel back
  deCols1Imp: { gridTemplateColumns: 'repeat(1, minmax(0, 1fr)) !important' },
  dePb12: { paddingBottom: tokens['--jx-space-12'] },

  // ── docs/components/select.html (se…; 141 at pin) ──────────────────
  seMaxWXs: { maxWidth: '20rem' },

  // ── docs/components/inline-code.html (il…; 234 at pin) ─────────────
  ilMs1: { marginInlineStart: tokens['--jx-space-4'] }, // ms-1
  ilRadius: { borderRadius: tokens['--jx-radius'] }, // rounded-(--radius)
  // the busy-stripe demo ground (demo artwork — structural string)
  ilStripe: {
    backgroundImage: 'repeating-linear-gradient(45deg, var(--muted) 0 8px, transparent 8px 16px)',
  },

  // ── docs/components/button-group.html (bu…; 184 at pin) ────────────
  buMaxW360: { maxWidth: '360px' },
  buGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
    gap: tokens['--jx-space-20'],
    '@media (min-width: 760px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  },
  buTrack20: { letterSpacing: tokens['--jx-track-20'] }, // tracking-[0.2em]

  // ── docs/components/native-select.html (ns…; 187 at pin) ───────────
  nsMaxWXs: { maxWidth: '20rem' },
  nsOffset4: { textUnderlineOffset: '4px' },
  nsGrid900: {
    display: 'grid',
    gap: tokens['--jx-space-24'],
    '@media (min-width: 900px)': { gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 0.9fr)' },
  },
  nsMinH40: { minHeight: '10rem' }, // min-h-40 — the payload pane floor
  nsP24: { padding: tokens['--jx-space-24'] },

  // ── docs/components/list-item.html (lsi…; 256 at pin) ──────────────
  // size-7! — the demo's icon-only override, important-pinned over the
  // component's own geometry (the consumer-wins merge law)
  lsiSize7Imp: { width: '1.75rem !important', height: '1.75rem !important' },
  lsiGridMd: {
    display: 'grid',
    width: '100%',
    gap: tokens['--jx-space-24'],
    '@media (min-width: 48rem)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  },
  lsiGridLg: {
    display: 'grid',
    width: '100%',
    gap: tokens['--jx-space-24'],
    '@media (min-width: 64rem)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  },
  lsiGridSm: {
    display: 'grid',
    gap: tokens['--jx-space-12'],
    '@media (min-width: 40rem)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  },
  lsiOpacity60: { opacity: 0.6 },
  lsiMaxW19: { maxWidth: '19rem' },
  lsiMaxW17: { maxWidth: '17rem' },
  lsiPy4: { paddingBlock: tokens['--jx-space-4'] }, // py-1

  // ── docs/components/section-card.html (sc…; 91 at pin) ─────────────
  scMinW64: { minWidth: '16rem' }, // min-w-64 — the composer panel floor

  // ── docs/components/terminal-footer.html (tf…; 92 at pin) ──────────
  tfMinW56: { minWidth: '14rem' }, // min-w-56 — the composer panel floor

  // ── docs/components/checkbox.html (cb…; 93 at pin) ─────────────────
  cbGrid900: {
    display: 'grid',
    width: '100%',
    gap: tokens['--jx-space-24'],
    '@media (min-width: 900px)': { gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 0.9fr)' },
  }, // grid w-full gap-6 min-[900px]:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]
  cbMaxWxs: { maxWidth: '20rem' }, // max-w-xs — the demo column
  // the demo stage: demo-cell rides as the semantic string, the geometry here
  cbCell: {
    display: 'flex',
    height: '100%',
    minHeight: '10rem',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens['--jx-space-8'],
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: 'color-mix(in oklab, var(--muted) 40%, transparent)',
    color: tokens['--jx-muted-foreground'],
    padding: tokens['--jx-space-24'],
    textAlign: 'center',
    fontSize: 'var(--jx-text-base)',
  },

  // ── docs/components/toggle.html (tgl…; 113 at pin) ─────────────────
  tglGrid900: {
    display: 'grid',
    width: '100%',
    gap: tokens['--jx-space-24'],
    '@media (min-width: 900px)': { gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 0.9fr)' },
  }, // the workbench pair grid (checkbox's twin shape)
  tglMaxWxs: { maxWidth: '20rem' },
  tglCell: {
    display: 'flex',
    height: '100%',
    minHeight: '10rem',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: tokens['--jx-space-8'],
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: 'color-mix(in oklab, var(--muted) 40%, transparent)',
    color: tokens['--jx-muted-foreground'],
    padding: tokens['--jx-space-24'],
    textAlign: 'center',
    fontSize: 'var(--jx-text-base)',
  },

  // ── docs/components/card.html (crd…; 117 at pin) ───────────────────
  crdMinW64: { minWidth: '16rem' }, // min-w-64 — the panel floor

  // ── docs/components/hero-section.html (hs…; 110 at pin) ────────────
  hsMinW67: { minWidth: '67rem' }, // min-w-[67rem] — the wide demo floor

  // ── docs/components/system-dialog.html (sd…; 106 at pin) ───────────
  // the dialog demo ghost buttons (px-4 py-2 + nav voice at track-10)
  sdGhostBtn: {
    paddingInline: tokens['--jx-space-16'],
    paddingBlock: tokens['--jx-space-8'],
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-background'],
    color: tokens['--jx-foreground'],
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label-lg'],
    letterSpacing: tokens['--jx-track-10'],
    textTransform: 'uppercase',
    cursor: 'pointer',
  },
  sdGridMd3: {
    display: 'grid',
    gap: tokens['--jx-space-16'],
    '@media (min-width: 48rem)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
  }, // grid gap-4 md:grid-cols-3
  sdHuePrimary: {
    '--jx-fill': 'var(--primary)',
    '--jx-fill-ink': 'var(--primary-foreground)',
  }, // the arbitrary-property hue injection pair

  // ── docs/components/card-grid.html (cg…; 124 at pin) ───────────────
  cgGridMd3: {
    display: 'grid',
    gap: tokens['--jx-space-16'],
    '@media (min-width: 48rem)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
  }, // grid gap-4 md:grid-cols-3

  // ── docs/components/prose.html (prs…; 130 at pin) ──────────────────
  prsGrid760: {
    display: 'grid',
    width: '100%',
    maxWidth: '56rem',
    gap: tokens['--jx-space-32'],
    '@media (min-width: 760px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  }, // grid w-full max-w-4xl gap-8 min-[760px]:grid-cols-2
  prsText085: { fontSize: 'var(--text-085em, 0.85em)' }, // text-[0.85em] — the em-scaled code voice
  prsTitle: { fontSize: 'calc(var(--jx-text-base) + var(--jx-unit) * 1.35)' }, // the 18.4px hero step — css-exact, un-promoted
  prsFrameWarn: {
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: 'color-mix(in oklab, var(--warning) 45%, transparent)',
  }, // border-warning/45
  prsBgWarn10: { backgroundColor: 'color-mix(in oklab, var(--warning) 10%, transparent)' }, // bg-warning/10

  // ── docs/components/markdown.html (md…; 131 at pin) ────────────────
  mdMax46: { maxWidth: '46rem' }, // max-w-[46rem] — the demo column
  mdHero: {
    fontFamily: tokens['--jx-font-nav'],
    textWrap: 'balance',
    fontSize: 'calc(var(--jx-text-base) + var(--jx-unit) * 0.95)',
    lineHeight: 'var(--leading-tight)',
    letterSpacing: tokens['--jx-track-tight'],
    '@media (min-width: 40rem)': { fontSize: 'calc(var(--jx-text-base) + var(--jx-unit) * 1.63)' },
  }, // the hero pair: 1.05 → 1.22rem at sm (both un-promoted steps)

  // ── docs/components/icon-button.html (ib…; 141 at pin) ─────────────
  ibSize4: { width: '1rem', height: '1rem' }, // size-4 — the glyph box
  ibGridSm2: {
    display: 'grid',
    gap: tokens['--jx-space-12'],
    '@media (min-width: 40rem)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  }, // grid gap-3 sm:grid-cols-2

  // ── docs/components/form.html (frm…; 143 at pin) ───────────────────
  frmGrid760c5: {
    display: 'grid',
    gap: tokens['--jx-space-16'],
    '@media (min-width: 760px)': { gridTemplateColumns: 'repeat(5, minmax(0, 1fr))' },
  }, // grid gap-4 min-[760px]:grid-cols-5
  frmGapVar: { gap: 'var(--jx-gap)' }, // gap-[var(--jx-gap)] — the density channel
  frmMax80: { maxWidth: '80ch' }, // max-w-[80ch]
  frmTrack30: { letterSpacing: 'var(--track-30, 0.3em)' }, // tracking-[0.3em] — seam
  // the bare input lane: hit floor + inset channel + the kernel text step
  frmHitLane: {
    minHeight: 'var(--jx-hit)',
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    paddingInline: 'var(--jx-inset)',
    fontSize: 'var(--jx-text)',
  },
  frmRule: {
    backgroundColor: tokens['--jx-border'],
    height: '1px',
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '0%',
  }, // bg-border h-px flex-1

  // ── docs/components/separator.html (sep…; 152 at pin) ──────────────
  sepMy24: { marginBlock: tokens['--jx-space-24'] }, // my-6
  sepWHalf: { width: '50%' }, // w-1/2
  sepSelfStart: { alignSelf: 'flex-start' }, // self-start
  sepH4: { height: '1rem' }, // h-4 — the vertical stage
  sepH5: { height: '1.25rem' }, // h-5
  sepMinW56: { minWidth: '14rem' }, // min-w-56 — the demo column floor
  sepRow8: {
    display: 'flex',
    height: '2rem',
    alignItems: 'stretch',
    gap: tokens['--jx-space-16'],
    fontSize: 'var(--jx-text-base)',
  }, // flex h-8 items-stretch gap-4 text-[13px]
  sepRow10: {
    display: 'flex',
    height: '2.5rem',
    alignItems: 'stretch',
    gap: tokens['--jx-space-16'],
    fontSize: 'var(--jx-text-base)',
  }, // flex h-10 items-stretch gap-4 text-[13px]
  // the label chips riding the separators (rounded-sm → 0, the radius law)
  sepChip12: {
    width: 'fit-content',
    alignSelf: 'flex-start',
    borderRadius: 0,
    backgroundColor: tokens['--jx-background'],
    paddingInline: tokens['--jx-space-6'],
    paddingBlock: tokens['--jx-space-2'],
    fontSize: tokens['--jx-text-label-lg'],
    color: tokens['--jx-foreground'],
  },
  sepChip11: {
    width: 'fit-content',
    alignSelf: 'flex-start',
    borderRadius: 0,
    backgroundColor: tokens['--jx-background'],
    paddingInline: tokens['--jx-space-6'],
    paddingBlock: tokens['--jx-space-2'],
    fontFamily: tokens['--jx-font-nav'],
    fontSize: tokens['--jx-text-label'],
    textTransform: 'uppercase',
    letterSpacing: tokens['--jx-track-label'],
    color: tokens['--jx-foreground'],
  },

  // ── docs/paged.html (pgd…; 156 at pin) ─────────────────────────────
  // the logical max-block-size ceiling (physical mapping in ltr-tb)
  pgdMaxBlock: { maxHeight: 'min(32rem, 60vh)' }, // [max-block-size:min(32rem,60vh)]
  pgdLead17: { lineHeight: 'var(--leading-17, 1.7)' }, // leading-[1.7] — un-promoted ratio
  pgdLead16: { lineHeight: tokens['--jx-leading-16'] }, // leading-[1.6]
  // the pipeline stage dots (size + full radius + ground)
  pgdDot3P60: {
    width: '0.75rem',
    height: '0.75rem',
    borderRadius: 'calc(infinity * 1px)',
    backgroundColor: 'color-mix(in oklab, var(--primary) 60%, transparent)',
  },
  pgdDot3P: { width: '0.75rem', height: '0.75rem', borderRadius: 'calc(infinity * 1px)', backgroundColor: tokens['--jx-primary'] },
  pgdDot25M70: {
    width: '0.625rem',
    height: '0.625rem',
    borderRadius: 'calc(infinity * 1px)',
    backgroundColor: 'color-mix(in oklab, var(--muted-foreground) 70%, transparent)',
  },
  pgdDot25M: {
    width: '0.625rem',
    height: '0.625rem',
    borderRadius: 'calc(infinity * 1px)',
    backgroundColor: tokens['--jx-muted-foreground'],
  },
  pgdDot25B: {
    width: '0.625rem',
    height: '0.625rem',
    borderRadius: 'calc(infinity * 1px)',
    backgroundColor: tokens['--jx-border'],
  },

  // ── docs/components/skeleton.html (sk…; 162 at pin) ────────────────
  skBar: { height: '0.75rem' }, // h-3 — the bar height (widths compose)
  skSize10: { width: '2.5rem', height: '2.5rem' }, // size-10 — the avatar box
  skSize8: { width: '2rem', height: '2rem' }, // size-8
  skSize6: { width: '1.5rem', height: '1.5rem' }, // size-6
  skMinW52: { minWidth: '13rem' }, // min-w-52 — the card floor
  skW32: { width: '8rem' }, // w-32 — the title bar
  skW20: { width: '5rem' }, // w-20 — the short bar
  skW23: { width: '66.666667%' }, // w-2/3
  skW34: { width: '75%' }, // w-3/4
  skW45: { width: '80%' }, // w-4/5
  skW13: { width: '33.333333%' }, // w-1/3
  skW1112: { width: '91.666667%' }, // w-11/12
  skH28: { height: '7rem' }, // h-28 — the block stage
  skH4: { height: '1rem' }, // h-4 — the thicker bar
  skMaxWsm: { maxWidth: '24rem' }, // max-w-sm — the card ceiling
  skGrid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: tokens['--jx-space-8'],
  }, // grid grid-cols-3 gap-2
  skGrid3T: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: tokens['--jx-space-8'],
    borderTopWidth: 'var(--hairline)',
    borderTopStyle: 'solid',
    borderColor: 'color-mix(in oklab, var(--border) 60%, transparent)',
    paddingTop: tokens['--jx-space-8'],
  }, // the footer triplet band (border-t border-border/60 pt-2)

  // ── docs/components/combobox.html (cbx…; 171 at pin) ───────────────
  cbxMaxWxs: { maxWidth: '20rem' }, // max-w-xs — the demo column

  // ── docs/components/progress.html (prg…; 64 at pin) ────────────────
  prgMinW56: { minWidth: '14rem' }, // min-w-56 — the demo column floor

  // ── docs/components/code-card.html/detector-playground.svelte (dpg…;
  // the W3 terminal sweep, 150 occurrences at pin; dp is date-picker's)
  // the lab split: grid gap-4, 2 tracks at the original 980px seam
  dpgGrid: {
    display: 'grid',
    gap: tokens['--jx-space-16'],
    // minmax base, never auto (an auto track sizes to the widest
    // child's max-content — the detection lab panned the shell at
    // narrow viewports; the finale sweep's code-card finding)
    gridTemplateColumns: 'minmax(0, 1fr)',
    '@media (min-width: 980px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
  },
  dpgSpan2: { '@media (min-width: 980px)': { gridColumn: 'span 2 / span 2' } }, // min-[980px]:col-span-2
  // the example-chip ternary arms (base paint rides frameW + px/py atoms)
  dpgBtnOn: {
    borderColor: tokens['--jx-accent'],
    backgroundColor: 'color-mix(in oklab, var(--accent) 10%, transparent)',
    color: tokens['--jx-accent'],
  },
  dpgBtnOff: {
    borderColor: tokens['--jx-border'],
    color: tokens['--jx-muted-foreground'],
    ':hover': {
      borderColor: 'color-mix(in oklab, var(--accent) 60%, transparent)',
      color: tokens['--jx-foreground'],
    },
  },
  // the input/textarea focus pair: outline-none focus:border-accent
  dpgFieldFocus: { outline: 'none', ':focus': { borderColor: tokens['--jx-accent'] } },
  dpgResizeY: { resize: 'vertical' }, // resize-y
  dpgInkDestructive: { color: tokens['--jx-destructive'] }, // text-destructive
  // the verdict chip: border-accent/50 over bg-accent/10 (radius rides radius0)
  dpgChip: {
    borderWidth: 'var(--hairline)',
    borderStyle: 'solid',
    borderColor: 'color-mix(in oklab, var(--accent) 50%, transparent)',
    backgroundColor: 'color-mix(in oklab, var(--accent) 10%, transparent)',
  },
  dpgMt2: { marginTop: tokens['--jx-space-2'] }, // mt-0.5
  dpgW96: { width: '6rem' }, // w-24 — the layer-name column
  dpgW48: { width: '3rem' }, // w-12 — the verdict column

  // ── tokens.html, the W3 terminal-sweep tail (tk… part 2; 147
  // occurrences at pin — the palette/semantics sections below the
  // already-migrated hue lab)
  // `grid grid-cols-1 gap-2 min-[560px]:grid-cols-2 min-[860px]:grid-cols-3`
  // — the palette swatch grid at its original seams
  tkSwatchGrid: {
    display: 'grid',
    gap: tokens['--jx-space-8'],
    gridTemplateColumns: 'repeat(1, minmax(0, 1fr))',
    '@media (min-width: 560px)': { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
    '@media (min-width: 860px)': { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
  },
  tkSize12: { width: '3rem', height: '3rem' }, // size-12 — the demo swatch squares
  tkSize10: { width: '2.5rem', height: '2.5rem' }, // size-10 — the glass demo primaries
});
