// layer-law.ts — the F9 canonical layer statement (stylex-kernel
// phase 0, P0.2; openspec/changes/2026-09-14-stylex-kernel-phase0
// design §1).
//
// THE LAW: every kernel-emitted CSS establishes exactly ONE canonical
// layer order, and it is THIS full statement — the O1-H-measured order
// from the research dossier (archive/2026-09-13-stylex-kernel-research,
// spike-report §5.1 / ledger F9). Consumer utilities sort AFTER the
// stylex tiers ("consumer utility wins"), which the as-frozen order
// could not deliver: unplugin 0.19.0 appends stylex CSS after the
// Tailwind utilities block, so without this statement hoisted above
// everything the stylex layers are inscribed LAST and permanently beat
// utilities (the silent D2-01/D2-03 failure the research measured).
//
// OWNERSHIP: the plugin bakes this statement at byte zero of every
// emitted CSS asset that carries stylex output (and into the dev
// /virtual:stylex.css payload). Authors NEVER hand-write it — neither
// in app.css entries nor in folder sheets. The `useCSSLayers` engine
// config ({prefix:'stylex', after:['utilities']}) rides the same law.

/**
 * The F9 canonical FULL layer statement, verbatim. The exact byte
 * sequence is contract surface: `@layer properties, theme, base,
 * components, stylex.priority1, stylex.priority2, stylex.priority3,
 * utilities;` — pinned by test/stylex/*.test.ts and the phase-0
 * verification F9 probe.
 */
export const STYLEX_LAYER_STATEMENT =
  '@layer properties, theme, base, components, stylex.priority1, stylex.priority2, stylex.priority3, utilities;';
