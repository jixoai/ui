/**
 * @jixoai/vite-plugin/icons — the icon-system sub-entry.
 *
 * The whole icon system (providers/serializer/safety + the vite plugin)
 * lives behind the `./icons` export so the umbrella entry
 * (`dist/index.js`) stays free of provider code: nothing here is
 * evaluated unless the consumer opts in via `jixoai({ icons: … })` or
 * imports this subpath directly (merge-alignment A1).
 */
export type {
  IconSlot,
  ProviderContext,
  IconProviderFactory,
  ConsumerCapability,
  SlotDefinition,
  SvgAsset,
  SourceDescriptor,
  IconProvider,
  SerializeMode,
  SafetyCheckerConfig,
  SafetyIssue,
  SafetyResult,
  SafetyChecker,
} from './types.js';
export { SLOT_REGISTRY, SLOT_NAMES } from './types.js';

// providers
export { svgIconProvider } from './providers/svg.js';
export type { SvgIconProviderOptions } from './providers/svg.js';
export { lucideIconProvider } from './providers/lucide.js';
export { fontIconProvider } from './providers/font.js';
export type { FontIconProviderOptions } from './providers/font.js';
export { mixinIconProvider } from './providers/mixin.js';
export type { IconProviderOverrides } from './providers/mixin.js';

// infrastructure
export { serializeIcon, serializeAllSlots, serializeInkVariant } from './serializer.js';
export type { InkVariantOptions } from './serializer.js';
export { createSafetyChecker } from './safety.js';
// the ink-baking law (byte-equivalent port of css-laws' iconUri — icons-docs §2)
export { bakeInkSvg, bakeInkUri, INK_DERIVATIONS } from './ink.js';
export type { IconInk, InkVocab, InkDerivation, BakeInkOptions } from './ink.js';

// the library face (icon-component-pipeline): options + manifest +
// resolution + the pure generator + the root-script adapter
export type {
  IconLibraryOptions,
  IconSource,
  OptimizeConfig,
  ResolvedLibraryIcon,
  IconData,
  IconPackingOptions,
  LibraryReport,
} from './library/types.js';
export { DEFAULT_LIBRARY_MANIFEST, DEFAULT_LIBRARY_NAMES } from './library/manifest.js';
export {
  normalizeLibraryOptions,
  assertIconsFacesConfigured,
  ICON_NAME_PATTERN,
  DEFAULT_LIBRARY_OUTPUT,
  DEFAULT_MAX_CHUNK_BYTES,
  MISSING_ICONS_FACES_ERROR,
} from './library/config.js';
export type { NormalizedLibraryOptions } from './library/config.js';
// the library presets (icon-library-presets, 2026-09-07): registry +
// contracts — consumers configure them through library.presets
export type {
  IconPreset,
  IconPresetId,
  IconPresetOption,
  MaterialPresetOptions,
  PhosphorPresetOptions,
  RemixPresetOptions,
} from './library/presets/types.js';
export {
  PRESET_IDS,
  normalizeIconPresets,
  MATERIAL_DEFAULTS,
  PHOSPHOR_DEFAULTS,
} from './library/presets/index.js';
export { resolveLibraryInputs } from './library/resolve.js';
export type { LibraryResolution } from './library/resolve.js';
export { optimizeSvg } from './library/optimize.js';
export {
  generateIconLibraryArtifacts,
  extractIconData,
  chunkModuleId,
  ICON_CHUNK_MODULE_PREFIX,
  ICON_LIBRARY_SENTINEL_ERROR,
} from './library/generate.js';
export type { GeneratedLibraryArtifacts } from './library/generate.js';
export {
  writeIconLibraryArtifact,
  checkIconLibraryArtifact,
} from './library/script.js';
export type {
  IconLibraryWriteResult,
  IconLibraryCheckResult,
} from './library/script.js';
// lucide canonical serialization (shared by the slot provider + the library face)
export { serializeLucideIcon } from './providers/lucide.js';

// vite plugin (optional peer — import fails gracefully without vite)
export { createIconPlugin, VIRTUAL_MODULE_ID, chunkIndexOf } from './vite-plugin.js';
export type { IconPluginOptions } from './vite-plugin.js';
