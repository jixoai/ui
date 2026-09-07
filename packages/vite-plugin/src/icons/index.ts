/**
 * @jixoai/ui-vite-plugin/icons — the icon-system sub-entry.
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
// the icon channels (icon-channel-api, 2026-09-07): the contract +
// the base factory + the config-time normalization — consumers
// register channels through library.channels (the shipped ones import
// from their own sub-entries; the barrel re-exports the whole surface
// for type imports)
export type {
  IconChannel,
  IconChannelResolver,
  DefineIconChannelSpec,
} from './library/channel/types.js';
export {
  defineIconChannel,
  isPeerInstalled,
  resolvePeerFile,
  CHANNEL_PREFIX_PATTERN,
  CHANNEL_ID_PATTERN,
} from './library/channel/index.js';
export type { MaterialChannelOptions } from './library/channel/material.js';
export { md, MATERIAL_DEFAULTS } from './library/channel/material.js';
export type { PhosphorChannelOptions } from './library/channel/phosphor.js';
export { ph, PHOSPHOR_DEFAULTS, PHOSPHOR_PEER } from './library/channel/phosphor.js';
export { rx, REMIX_PEER } from './library/channel/remix.js';
export { lucideChannel } from './library/channel/lucide.js';
export {
  normalizeIconChannels,
  enabledChannelPrefixes,
} from './library/channel/normalize.js';
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
// the source scanner (icon-prefix-compiler, 2026-09-07): the pure
// module behind the prefix compiler — its types + both collection
// entries (the eager project walk + the literal matcher the dev
// transform drives), exported for consumer tooling and tests
export type { ScannedRef, ScanProjectOptions } from './library/scan.js';
export {
  collectScannedRefs,
  compareScannedRefs,
  isScannableModuleId,
  mergeScannedRefs,
  scanProjectSources,
  scannedRefKey,
} from './library/scan.js';
// lucide canonical serialization (shared by the slot provider + the library face)
export { serializeLucideIcon } from './providers/lucide.js';

// vite plugin (optional peer — import fails gracefully without vite)
export { createIconPlugin, VIRTUAL_MODULE_ID, chunkIndexOf } from './vite-plugin.js';
export type { IconPluginOptions } from './vite-plugin.js';
