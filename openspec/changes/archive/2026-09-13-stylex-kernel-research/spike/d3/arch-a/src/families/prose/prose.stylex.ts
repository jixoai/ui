// prose.styles.ts — the reading-region provider's HOST lane.
//
// Source intent: <Prose> resolves 11 knobs, emits ONLY-SET inheritance
// declarations + --jx-ty-* var mirrors + presence attrs; the
// descendant lanes ride the residue css. In StyleX terms: the STATIC
// enums (family/ink/ground/align/wrap/hyphens) compile to classes;
// the free-form CssLength knobs (size) ride the typed FACTORY idiom;
// the var mirrors + presence attrs stay inline/attrs (the source's
// own inline-style emission — same channel, no regression).
import * as stylex from '@stylexjs/stylex';

export type Family = 'sans' | 'mono' | 'serif';
export type Ink = 'default' | 'muted' | 'primary' | 'destructive';
export type Ground =
  | 'background'
  | 'card'
  | 'popover'
  | 'muted'
  | 'secondary'
  | 'accent'
  | 'transparent';
export type ProseAlign = 'start' | 'center' | 'end' | 'justify';
export type ProseWrap = 'pretty' | 'balance' | 'stable';
export type ProseHyphens = 'auto' | 'none' | 'manual';

export const proseStyles = stylex.create({
  host: {
    // the base reading region (jx-pure face essentials)
    fontFamily: 'var(--font-sans)',
    lineHeight: 1.6,
  },
  familyMono: { fontFamily: 'var(--font-mono)' },
  familySerif: { fontFamily: '"Iowan Old Style", Georgia, serif' },
  inkMuted: { color: 'var(--muted-foreground)' },
  inkPrimary: { color: 'var(--primary)' },
  inkDestructive: { color: 'var(--error)' },
  groundBackground: { backgroundColor: 'var(--background)' },
  groundCard: { backgroundColor: 'var(--card)' },
  groundPopover: { backgroundColor: 'var(--popover)' },
  groundMuted: { backgroundColor: 'var(--muted)' },
  groundSecondary: { backgroundColor: 'var(--secondary)' },
  groundAccent: { backgroundColor: 'var(--accent)' },
  groundTransparent: { backgroundColor: 'transparent' },
  alignCenter: { textAlign: 'center' },
  alignEnd: { textAlign: 'end' },
  alignJustify: { textAlign: 'justify' },
  wrapPretty: { textWrap: 'pretty' },
  wrapBalance: { textWrap: 'balance' },
  wrapStable: { textWrap: 'stable' },
  hyphensAuto: { hyphens: 'auto' },
  hyphensNone: { hyphens: 'none' },
  hyphensManual: { hyphens: 'manual' },
  // NOTE: the free-form size knob rides the provider's INLINE
  // declaration lane (prose.svelte mergedStyle) — the source's own
  // two-channel emission; the FACTORY idiom for dynamic values is
  // carried by the icon family (markup-level transform required).
});
