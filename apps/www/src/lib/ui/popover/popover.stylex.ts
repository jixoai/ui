// popover.stylex.ts — the popover family's atom table (tailwindless
// one-shot Wave 1b batch A, 2026-09-17).
//
// Source of record: the utility strings the old markup authored (tw4,
// 2026-08-24): the default trigger's frame (border, background ground,
// 14px/10px insets, the 14px sm voice at weight 500, the muted hover,
// the --jx-press* pose seams verbatim), the caret lane's transform
// transition, and the scroll ring's measures (72vh ceiling, stable
// gutter, the --jx-pop-pad padding contract).
//
// Law mapping (the tier-2 value rule): the sm voice rides the
// promoted --text-sm step and the 500 weight the promoted
// --weight-medium token; the 150ms ease-out caret transition rides the
// --motion-150/--motion-ease-out tokens; the odd 14px/10px insets ride
// ruler equations (byte-exact). The panel's anchor geometry, the
// viewport-center fallback, the caret's :has()+:popover-open flip, and
// the reduced-motion kill stay lane-2 in popover.css (D1-exempt); the
// press law keeps .jx-press (press-button.css).
//
// Mirror law: this file is byte-identical in registry/files/ui/
// popover/ and apps/www/src/lib/ui/popover/ (cmp).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const popoverStyles = stylex.create({
  // the anchor wrapper (the native anchor-name rides the style attr)
  anchor: { display: 'inline-flex' },
  // the DEFAULT trigger button (a custom snippet owns its own paint)
  trigger: {
    display: 'inline-flex',
    cursor: 'pointer',
    alignItems: 'center',
    gap: 'calc(var(--jx-unit) * 2.5)',
    borderWidth: tokens['--jx-hairline'],
    borderStyle: 'solid',
    borderColor: tokens['--jx-border'],
    backgroundColor: tokens['--jx-background'],
    paddingInline: 'calc(var(--jx-unit) * 3.5)',
    paddingBlock: 'calc(var(--jx-unit) * 2.5)',
    fontFamily: tokens['--jx-font-sans'],
    fontSize: tokens['--jx-text-sm'],
    fontWeight: tokens['--jx-weight-medium'],
    color: tokens['--jx-foreground'],
    '--jx-press-shadow': 'var(--shadow-xs)',
    '--jx-press-shadow-hover': 'var(--shadow-sm)',
    '--jx-press-shadow-active': 'var(--shadow-sm-press)',
    ':hover': { backgroundColor: tokens['--jx-muted'] },
  },
  // the caret lane (popover.css flips it while open + kills the
  // transition under reduced motion)
  caret: {
    flex: 'none',
    display: 'inline-flex',
    transitionProperty: 'transform',
    transitionDuration: 'var(--motion-150, 150ms)',
    transitionTimingFunction: 'var(--motion-ease-out, ease-out)',
  },
  // the scroll+padding ring inside the surface body
  scroll: {
    maxHeight: '72vh',
    overflow: 'auto',
    scrollbarGutter: 'stable both-edges',
    padding: 'var(--jx-pop-pad, 12px 14px)',
    paddingInline: 'max(var(--jx-pop-pad-inline, 14px) - var(--jx-scrollbar-thin, 0px), 0px)',
  },
});
