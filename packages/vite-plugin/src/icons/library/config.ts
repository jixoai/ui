/**
 * @jixoai/vite-plugin (icons library) — options validation +
 * normalization (A1, openspec icon-component-pipeline design §1).
 *
 * Owns the config-validation matrix's library half: name validation
 * (/^[a-z][A-Za-z0-9]*$/), option normalization with the frozen
 * defaults, and the ≥1-of-provider|library startup assertion the
 * plugin re-uses. The UMBRELLA (src/index.ts) performs the same
 * faces check inline — its entry must stay free of static icons
 * imports (design §9) — and a test pins the two messages identical.
 */

import type { IconLibraryOptions, IconSource, OptimizeConfig } from './types.js';

/** icon names are lowerCamel and tame: they become TS union members,
 *  object keys and (for {file} sources) watched paths */
export const ICON_NAME_PATTERN = /^[a-z][A-Za-z0-9]*$/;

/** default artifact target, project-root-relative (consumer-app shape;
 * in-repo the root gen:icons script writes its own canonical target) */
export const DEFAULT_LIBRARY_OUTPUT = 'src/lib/icon-set.gen.ts';

/** default per-chunk budget: 20480 RAW non-gzip serialized entry bytes */
export const DEFAULT_MAX_CHUNK_BYTES = 20480;

/**
 * the named startup error for `jixoai({ icons: {} })` — neither face
 * configured (design §1 matrix). names `provider` and `library` as the
 * two legal shapes and teaches the unblock.
 */
export const MISSING_ICONS_FACES_ERROR =
  '[jixoai-icons] the icons option is configured but neither face is set — ' +
  'pass icons.provider (the slot/CSS face) and/or icons.library (the ' +
  'named-icon face); an empty icons object is not a configuration';

/** the normalized form every library consumer code path reads */
export interface NormalizedLibraryOptions {
  readonly includeDefaults: boolean;
  readonly icons: Readonly<Record<string, IconSource>>;
  readonly maxChunkBytes: number;
  readonly chunking: 'auto' | 'single';
  readonly inlineFirstChunk: boolean;
  readonly output: string;
  readonly write: boolean;
  readonly optimize: boolean | OptimizeConfig;
}

function isOptimizeConfig(value: boolean | OptimizeConfig): value is OptimizeConfig {
  return typeof value === 'object';
}

/**
 * Validate + normalize library options. Throws named, teaching errors
 * for illegal shapes (bad names, bad chunking, non-positive budgets,
 * absolute output paths) — misconfiguration must fail at startup, not
 * mid-build.
 */
export function normalizeLibraryOptions(
  options: IconLibraryOptions,
): NormalizedLibraryOptions {
  if (options.icons !== undefined) {
    for (const name of Object.keys(options.icons)) {
      if (!ICON_NAME_PATTERN.test(name)) {
        throw new Error(
          `[jixoai-icons] library icon name "${name}" is illegal — names must match ` +
            '/^[a-z][A-Za-z0-9]*$/ (lowerCamel, starts lowercase; they become TS ' +
            'union members), e.g. myLogo or chevronRight',
        );
      }
    }
  }
  const chunking = options.chunking ?? 'auto';
  if (chunking !== 'auto' && chunking !== 'single') {
    throw new Error(
      `[jixoai-icons] library chunking "${String(options.chunking)}" is not a ` +
        'legal mode — use \'auto\' (budgeted chunks) or \'single\' (one chunk, 不拆)',
    );
  }
  const maxChunkBytes = options.maxChunkBytes ?? DEFAULT_MAX_CHUNK_BYTES;
  if (!Number.isInteger(maxChunkBytes) || maxChunkBytes <= 0) {
    throw new Error(
      `[jixoai-icons] library maxChunkBytes ${String(options.maxChunkBytes)} is not ` +
        'a positive integer — the budget counts RAW serialized entry bytes per chunk ' +
        `(default ${DEFAULT_MAX_CHUNK_BYTES})`,
    );
  }
  const output = options.output ?? DEFAULT_LIBRARY_OUTPUT;
  if (output.length === 0 || output.startsWith('/') || output.includes('..')) {
    throw new Error(
      `[jixoai-icons] library output "${output}" must be a project-root-relative ` +
        `file path (default ${DEFAULT_LIBRARY_OUTPUT}) — the write target is joined ` +
        'to the vite root',
    );
  }
  const optimize = options.optimize ?? true;
  if (!isOptimizeConfig(optimize) && optimize !== false && optimize !== true) {
    throw new Error(
      '[jixoai-icons] library optimize must be a boolean or { floatPrecision } — ' +
        'the svgo pass itself is tuned by law (a no-op on lucide canonical bytes)',
    );
  }

  return {
    includeDefaults: options.includeDefaults ?? true,
    icons: options.icons ?? {},
    maxChunkBytes,
    chunking,
    inlineFirstChunk: options.inlineFirstChunk ?? true,
    output,
    write: options.write ?? false,
    optimize,
  };
}

/**
 * the ≥1-of assertion from the design §1 matrix — throws the named
 * startup error when neither face is configured. the standalone plugin
 * (createIconPlugin) validates through this; the umbrella validates
 * inline with the identical message.
 */
export function assertIconsFacesConfigured(
  provider: unknown,
  library: unknown,
): void {
  if (provider === undefined && library === undefined) {
    throw new Error(MISSING_ICONS_FACES_ERROR);
  }
}
