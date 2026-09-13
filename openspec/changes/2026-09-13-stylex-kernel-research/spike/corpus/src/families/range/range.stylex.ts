// range.styles.ts — the field scaffolding (StyleX side of the split).
//
// Source intent: the label row (real label[for] + live mono readout),
// the tick ruler anchored to the THUMB's travel (half-thumb inline
// inset; repeating-gradient marks at step periods; the ::after end
// tick at 100%), the error line, density tiers via the ambient var
// scope. The source expresses the vertical face through DESCENDANT
// attr selectors (.jx-field[data-orient] [data-jx-range-body]) —
// StyleX has no descendant selectors; the orientation lifts into
// component conditionals (the state→class tax, recorded).
import * as stylex from '@stylexjs/stylex';

export const rangeStyles = stylex.create({
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  // vertical face: input + ruler share one row
  fieldVertical: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: '0.375rem',
  },
  head: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: '0.75rem',
  },
  label: {
    fontSize: 'var(--jx-text)',
    lineHeight: 'var(--jx-line)',
    color: 'var(--foreground)',
  },
  srOnly: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    padding: 0,
    margin: '-1px',
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
    borderWidth: 0,
    borderStyle: 'none',
  },
  readout: {
    fontSize: 'var(--jx-text)',
    lineHeight: 'var(--jx-line)',
    fontFamily: 'var(--font-mono)',
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--foreground)',
  },
  readoutInvalid: {
    color: 'var(--error)',
  },
  bodyHorizontal: {
    display: 'block',
  },
  bodyVertical: {
    display: 'flex',
    alignItems: 'stretch',
    gap: '0.375rem',
  },

  // ── the tick ruler: the thumb's travel box made visible ───────────
  rulerHorizontal: {
    position: 'relative',
    height: '0.25rem',
    marginBlockStart: '0.125rem',
    // half the icon token = the exact thumb half-travel inset
    marginInline: 'calc(var(--jx-icon, 1.5rem) / 2)',
  },
  rulerVertical: {
    position: 'relative',
    width: '0.75rem',
    height: 'auto',
    alignSelf: 'stretch',
    marginBlock: 'calc(var(--jx-icon, 1.5rem) / 2)',
    marginInline: 0,
  },
  // the end tick at the travel's terminal (inline-end / block-end)
  endTickH: {
    '::after': {
      content: "''",
      position: 'absolute',
      insetInlineEnd: 0,
      top: 0,
      bottom: 0,
      width: '1px',
      backgroundColor: 'var(--border)',
    },
  },
  endTickV: {
    '::after': {
      content: "''",
      top: 'auto',
      bottom: 0,
      left: 0,
      right: 0,
      width: 'auto',
      height: '1px',
      position: 'absolute',
      backgroundColor: 'var(--border)',
    },
  },
  // one scale of marks: repeating gradient at step periods; RTL flips
  // the gradient direction (the :dir pseudo-class IS supported)
  tickH: {
    position: 'absolute',
    insetInline: 0,
    top: 0,
    height: '100%',
    backgroundImage:
      'repeating-linear-gradient(to right, var(--border) 0 1px, transparent 1px var(--jx-tick-step))',
    ':dir(rtl)': {
      backgroundImage:
        'repeating-linear-gradient(to left, var(--border) 0 1px, transparent 1px var(--jx-tick-step))',
    },
  },
  tickV: {
    position: 'absolute',
    insetBlock: 0,
    top: 'auto',
    insetInlineStart: 0,
    width: '100%',
    height: 'auto',
    backgroundImage:
      'repeating-linear-gradient(to bottom, var(--border) 0 1px, transparent 1px var(--jx-tick-step))',
  },

  // ── the error line ────────────────────────────────────────────────
  error: {
    margin: 0,
    fontSize: 'var(--jx-text)',
    lineHeight: 'var(--jx-line)',
    color: 'var(--error)',
  },
  errorMark: {
    fontStyle: 'normal',
    fontWeight: 700,
    marginInlineEnd: '0.35em',
  },
});
