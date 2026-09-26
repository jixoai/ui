// docs-sections-nav.stylex.ts — the docs rail's atom table
// (tailwindless one-shot W1, 2026-09-17; www-only chrome).
// ONE atom today: the blur band's overlay rung (the z-ladder under
// the head's z-10 — the layer-grid law in the component's own
// <style>). Everything else the rail paints lives in that scoped
// block's jx-dsn-* semantics (frozen law).

import * as stylex from '@stylexjs/stylex';

export const dsnStyles = stylex.create({
  bandZ: { zIndex: 5 },
});
