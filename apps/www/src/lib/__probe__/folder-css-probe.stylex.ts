// folder-css probe atoms (tailwindless W4, 2026-09-19): the layer-law
// arm's paint. The TW-era arm added engine-generated utilities
// (p-8 / text-primary) at runtime — those died with the engine; the
// law itself did not. These atoms ride the engine that replaced them,
// proving a stylex atom beats a :where() folder rule. A stylex
// module's only exports are stylex.create results (the joiner law).
import * as stylex from '@stylexjs/stylex';
import { tokens } from '../tokens.stylex';

export const probeStyles = stylex.create({
  pad32: { padding: tokens['--jx-space-32'] },
  inkPrimary: { color: tokens['--jx-primary'] },
});
