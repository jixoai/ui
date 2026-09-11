/**
 * @jixoai/ui-vite-plugin/spinners — the svg-spinner sub-entry (P3,
 * openspec spin-ora-svg-lane design §5).
 *
 * The whole spinners face (the vendored manifest + resolution + the
 * pure generator + the root-script adapter + the vite plugin) lives
 * behind the `./spinners` export. Unlike the icons face it carries NO
 * heavy machinery (no providers, no svgo, no lucide, no font parsing)
 * — the umbrella imports it DIRECTLY (a bridge's memoized dynamic
 * import would break the dist gate pinning exactly one dynamic import;
 * the graph-purity test proves this graph stays clean).
 */

// types
export type {
  SpinnerSource,
  SpinnersPluginOptions,
  ResolvedSpinner,
  SpinData,
  SpinnersReport,
} from './types.js';

// the built-in manifest (the vendored blocks-wave receipt)
export {
  BLOCKS_WAVE_NAME,
  BLOCKS_WAVE_SVG,
  DEFAULT_SPINNERS_MANIFEST,
} from './manifest.js';

// adapter-side resolution + validation
export {
  normalizeSpinnersOptions,
  resolveSpinnerInputs,
  SPINNER_NAME_PATTERN,
  DEFAULT_SPIN_OUTPUT,
} from './resolve.js';
export type { NormalizedSpinnersOptions, SpinnerResolution } from './resolve.js';

// the RAW safety checker (the icons checker re-exported — R2 law)
export { createSafetyChecker } from './safety.js';
export type {
  SafetyChecker,
  SafetyCheckerConfig,
  SafetyIssue,
  SafetyResult,
} from './safety.js';

// the pure generator
export { generateSpinSet, extractSpinData } from './generate.js';
export type { GeneratedSpinSet } from './generate.js';

// the root-script adapter (gen:spins / verify:spins)
export { writeSpinSetArtifact, checkSpinSetArtifact } from './script.js';
export type { SpinSetWriteResult, SpinSetCheckResult } from './script.js';

// the vite adapter
export { createSpinnersPlugin } from './vite-plugin.js';
export type { SpinnersPluginEntryOptions } from './vite-plugin.js';
