// tokens.stylex.ts — StyleX design-token definitions (defineVars).
// The named-key form ('--probe-bg', not a hashed key) keeps the emitted
// custom property names stable for the D1-01/D1-05 computed-style probes.
import * as stylex from '@stylexjs/stylex';

export const tokens = stylex.defineVars({
  '--probe-bg': '#123456',
  '--probe-fg': '#abcdef',
  '--probe-hi': '#00aa33',
});
