/**
 * @jixoai/ui-plugin — public API barrel
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
export { serializeIcon, serializeAllSlots } from './serializer.js';
export { createSafetyChecker } from './safety.js';

// vite plugin (optional peer — import fails gracefully without vite)
export { jxUI } from './vite-plugin.js';
export type { JxUIPluginOptions } from './vite-plugin.js';
