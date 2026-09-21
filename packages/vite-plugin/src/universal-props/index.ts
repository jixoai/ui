/**
 * @jixoai/ui-vite-plugin (universal-props) — the explicit-props
 * plugin layer's public barrel (W2 tasks 2.1–2.7; design §12).
 *
 * Exports the alias tables (+ the reserved-literal gate), the css
 * generator (universal-props.css — the §12 var-indirection sheet),
 * the query() desugarer (pure scanner/diagnostics/emitter) and the
 * vite pass. The BROWSER-side shim ships from its own sub-entry
 * `./universal-props/query-shim` (§9.1's frozen export) so a page
 * that imports it never pulls the node-side vite pass graph.
 */

export {
  COLOR_ALIASES,
  COLOR_FORMULA_PROFILES,
  CONTAINER_SCALE,
  MOTION_ALIASES,
  MOTION_KERNEL_PRESETS,
  RADIUS_ALIASES,
  RADIUS_FACTOR_LADDER,
  RESERVED_ALIAS_KEYS,
  SHAPE_LADDER,
  SIZE_ALIASES,
  VIEWPORT_SCALE,
  compareQueryKeys,
  isValidAliasKey,
  motionDurationScale,
  motionPresetForCoefficient,
  parseQueryKey,
  validateAliasTable,
  validateAliasTables,
  type ContainerScaleName,
  type MotionKernelPreset,
  type ParsedQueryKey,
  type ViewportScaleName,
} from './alias-tables.js';
export { generateUniversalPropsCss, type GeneratorAxisRow, type GenerateUniversalPropsCssInput } from './generate-css.js';
export {
  ELEVATION_DP,
  UNIVERSAL_AXES,
  carrierDeclarationsFor,
  desugarQueryCall,
  diagnoseQueryCall,
  fileDeclaresContainer,
  instanceId,
  parseLaneLiteral,
  scanQueryCalls,
  type DesugarCase,
  type DesugarResult,
  type QueryCallSite,
  type QueryDiagnostic,
  type QueryDiagnosticCode,
  type UniversalAxis,
} from './desugar.js';
export { createUniversalPropsPlugin, type UniversalPropsPluginOptions } from './vite-plugin.js';
