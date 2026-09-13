/**
 * @jixoai/ui-design (stamp) — the barrel (design-studio-r2 T0).
 *
 * Public surface: the pure transform (tests + any future consumer)
 * and the vite plugin (create.ts registers it). The transform's
 * contract constants live in transform.ts — import them from there.
 */

export {
  STAMP_COMPONENT_ATTR,
  STAMP_ERROR_PREFIX,
  STAMP_INSTANCE_ATTR,
  USAGE_MAP_EXPORT,
  collectImports,
  jsStringLiteral,
  stampSvelteSource,
} from './transform.ts';
export type { PropSpan, StampOptions, StampResult, UsageEntry, UsageMap } from './transform.ts';
export { buildStampHmrPlugin, buildStampPlugin } from './plugin.ts';
export type { StampPluginOptions } from './plugin.ts';
