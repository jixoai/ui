// list.stylex.ts — the list family's atom table
// (tailwindless one-shot Wave 1b batch C, 2026-09-17).
//
// Source of record: the face's B8 channels as the old component's
// utility strings spelled them — the marker vocabulary
// (disc|circle|square|decimal|alpha|roman|none; the core-utility and
// arbitrary [list-style:] forms collapsed into ONE atom map, the
// emitted rule identical either way) and the structural indent
// (ps-6 = 1.5rem → the space ladder's --space-24 step; nav mode's
// ps-0 = the chrome-list drop). The marker INK
// ([&_li::marker]:text-muted-foreground) rides list.css — a
// descendant+pseudo boundary StyleX forbids in atoms. `none` keeps
// the indent (structural — the no-font-size kinship family owns no
// other paint).
//
// Law mapping: ps-6 (24px) maps to --space-24 (the existing step IS
// the value); list-style keywords are structural vocabulary, not
// theme slots. The data-jx-list / data-jx-list-nav hooks stay
// attribute-stamped (the separator's data-orientation form).
//
// Mirror law: this file is byte-identical in registry/files/ui/list/
// and apps/www/src/lib/ui/list/ (cmp); the tokens import
// '../../tokens.stylex' resolves in BOTH trees (separator's
// divergence note #1).

import * as stylex from '@stylexjs/stylex';
import { tokens } from '../../tokens.stylex';

export const listStyles = stylex.create({
  // ── the marker vocabulary (word → list-style-type) ──────────────
  disc: { listStyleType: 'disc' },
  circle: { listStyleType: 'circle' },
  square: { listStyleType: 'square' },
  decimal: { listStyleType: 'decimal' },
  alpha: { listStyleType: 'lower-alpha' },
  roman: { listStyleType: 'lower-roman' },
  none: { listStyleType: 'none' },
  // ── the structural indent (nav mode drops it — chrome list) ─────
  indent: { paddingInlineStart: tokens['--jx-space-24'] },
  flush: { paddingInlineStart: 0 },
});
