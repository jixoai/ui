// popover.styles.ts — the floating-surface family's StyleX side:
// trigger button paint, caret, surface body/shadow/scroll ring.
//
// Source intent: the default trigger is a bordered jx-press button
// with muted hover + a chevron caret that flips via the css residue's
// :has(:popover-open) rule (the flip itself stays css — :has over a
// SIBLING selector is not a StyleX construct). The panel body is THE
// SURFACE: variant fill (solid | acrylic 72%+blur | auto), 1px border;
// the shadow child carries the fixed backdrop treatment; the scroll
// ring owns overflow + padding (never the body).
//
// OUT OF SCOPE (recorded): the WAAPI motion kernel (surface-motion.ts
// 204 LOC + the declarative @property --jx-p formulas) — runtime
// animation, not authoring surface; the panel rests at the open pose.
import * as stylex from '@stylexjs/stylex';

export const popoverStyles = stylex.create({
  anchor: {
    display: 'inline-flex',
  },
  // ── the default trigger: bordered press button ────────────────────
  trigger: {
    display: 'inline-flex',
    cursor: 'pointer',
    alignItems: 'center',
    gap: '0.625rem',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    backgroundColor: 'var(--background)',
    paddingInline: '0.875rem',
    paddingBlock: '0.625rem',
    fontFamily: 'var(--font-sans)',
    fontSize: '0.875rem',
    fontWeight: 500,
    color: 'var(--foreground)',
    // the press law (pose vars default to the source's explicit
    // xs/sm/sm-press carriers — inline vars beat nothing here since
    // this spike's trigger defines them at :root with these values)
    boxShadow: 'var(--shadow-xs)',
    transition:
      'translate 150ms ease-out, box-shadow 150ms ease-out, background-color 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out',
    ':hover': {
      backgroundColor: 'var(--muted)',
      boxShadow: 'var(--shadow-sm)',
    },
    ':active': {
      translate: '1px 1px',
      boxShadow: 'var(--shadow-sm-press)',
    },
    ':focus-visible': {
      outline: '2px solid Highlight',
      outlineOffset: '2px',
    },
    '@media (prefers-reduced-motion: reduce)': {
      transition: 'none',
    },
  },
  caret: {
    display: 'inline-flex',
    flex: 'none',
    transitionProperty: 'transform',
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease-out',
  },

  // ── the surface (children of the platform panel element) ──────────
  shadow: {
    position: 'absolute',
    inset: 0,
    zIndex: -1,
    backgroundColor: 'var(--surface-shadow, oklch(1 0 0 / 0.32))',
    backdropFilter: 'brightness(0.5) blur(8px) contrast(2)',
    WebkitBackdropFilter: 'brightness(0.5) blur(8px) contrast(2)',
    translate: 'var(--jx-surface-ox, 6px) var(--jx-surface-oy, 6px)',
  },
  body: {
    position: 'relative',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'var(--border)',
    backgroundColor: 'var(--popover)',
  },
  bodyAcrylic: {
    backgroundColor: 'color-mix(in oklab, var(--popover) 72%, transparent)',
    backdropFilter: 'blur(14px) saturate(1) brightness(2)',
    WebkitBackdropFilter: 'blur(14px) saturate(1) brightness(2)',
    // auto = acrylic UNLESS reduced transparency — then exactly solid
    '@media (prefers-reduced-transparency: reduce)': {
      backgroundColor: 'var(--popover)',
      backdropFilter: 'none',
      WebkitBackdropFilter: 'none',
    },
  },
  // the scroll+padding ring: overflow + padding live INSIDE the body
  scroll: {
    maxHeight: '72vh',
    overflow: 'auto',
    scrollbarGutter: 'stable both-edges',
    padding: 'var(--jx-pop-pad, 12px 14px)',
    paddingInline: 'max(var(--jx-pop-pad-inline, 14px) - var(--jx-scrollbar-thin, 0px), 0px)',
  },
});
