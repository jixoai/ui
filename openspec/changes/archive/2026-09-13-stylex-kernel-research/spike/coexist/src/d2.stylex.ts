// d2.stylex.ts — StyleX token definitions for the D2 synthetic rows.
import * as stylex from '@stylexjs/stylex';

// D2-09 — the custom-prop precedence probe: a defineVars default
// (#0000ff at root scope) + a createTheme class override (#00ff00 on
// a subtree). Nearest scope must win in BOTH directions.
export const d2vars = stylex.defineVars({
  '--d2-probe-color': '#0000ff',
});

export const d2green = stylex.createTheme(d2vars, {
  '--d2-probe-color': '#00ff00',
});
