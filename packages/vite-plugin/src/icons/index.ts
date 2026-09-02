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

// vite plugin (optional peer — import fails gracefully without vite)
export { createIconPlugin, VIRTUAL_MODULE_ID } from './vite-plugin.js';
export type { IconPluginOptions } from './vite-plugin.js';
