/**
 * @jixoai/vite-plugin (icons library presets) — the registry (A1,
 * openspec icon-library-presets design §1).
 *
 * Intents:
 * 1. the shipped-preset registry: material (md:) / phosphor (ph:) /
 *    remix (rx:) — lucide needs NO preset (the built-in default is
 *    always wired). tabler and hugeicons are OUT by design (no per-icon
 *    SVG source package on npm / JS-data only); SF Symbols is OUT on
 *    licensing (Apple system-provided-image terms) — the docs page
 *    states both verdicts.
 * 2. `library.presets` normalization: string shorthand = frozen
 *    defaults; object form = per-preset knobs. Already-normalized
 *    IconPreset instances pass through UNTOUCHED (idempotence — the
 *    vite adapter normalizes twice: once in createIconPlugin, once in
 *    resolveLibraryInputs; rebuilding an instance would be value-safe
 *    but wasteful, and pass-through keeps it provably so).
 * 3. the enabled-prefix law: a ref-shaped string source whose prefix is
 *    neither `lucide:` nor an ENABLED preset prefix is a NAMED config
 *    error listing the enabled set (and how to enable more) — an
 *    unknown `fa:home` fails at config validation, never as a confused
 *    inline literal deep inside safety/optimize (spec scenario).
 */

import { materialPreset } from './material.js';
import { phosphorPreset } from './phosphor.js';
import { remixPreset } from './remix.js';
import type { IconSource } from '../types.js';
import type {
  IconPreset,
  IconPresetId,
  IconPresetOption,
} from './types.js';

export type {
  IconPreset,
  IconPresetId,
  IconPresetOption,
  MaterialPresetOptions,
  PhosphorPresetOptions,
  RemixPresetOptions,
} from './types.js';
export { MATERIAL_DEFAULTS } from './material.js';
export { PHOSPHOR_DEFAULTS, PHOSPHOR_PEER } from './phosphor.js';
export { REMIX_PEER } from './remix.js';
export { isPeerInstalled, resolvePeerFile } from './peer.js';

/** the ids a `library.presets` entry may select */
export const PRESET_IDS: readonly IconPresetId[] = ['material', 'phosphor', 'remix'];

/** is the value an already-normalized preset instance? (idempotence) */
function isIconPreset(value: unknown): value is IconPreset {
  return (
    typeof value === 'object' &&
    value !== null &&
    'resolveFile' in value &&
    'peerPackage' in value &&
    'prefix' in value
  );
}

/** the named unknown-id error (typo teaching — runtime JS callers) */
function unknownPresetError(id: string): Error {
  return new Error(
    `[jixoai-icons] library presets entry "${id}" is not a shipped ` +
      `preset — the shipped ids are ${PRESET_IDS.map((x) => `"${x}"`).join(', ')} ` +
      '(lucide needs no preset: it is the built-in default)',
  );
}

/** build one preset instance from a VALIDATED option entry */
function buildPreset(entry: Exclude<IconPresetOption, IconPresetId>): IconPreset {
  switch (entry.id) {
    case 'material':
      return materialPreset(entry);
    case 'phosphor':
      return phosphorPreset(entry);
    case 'remix':
      return remixPreset();
  }
}

/**
 * Normalize the `library.presets` option into ENABLED preset instances.
 * Empty/absent → `[]` (prefix refs then fail the enabled-prefix law).
 *
 * @throws a named error for unknown preset ids (typo teaching)
 */
export function normalizeIconPresets(
  presets: readonly IconPresetOption[] | undefined,
): readonly IconPreset[] {
  if (presets === undefined) return [];
  const enabled: IconPreset[] = [];
  for (const entry of presets) {
    if (isIconPreset(entry)) {
      enabled.push(entry);
      continue;
    }
    if (typeof entry === 'string') {
      // the string shorthand: frozen defaults per id
      switch (entry) {
        case 'material':
          enabled.push(materialPreset());
          break;
        case 'phosphor':
          enabled.push(phosphorPreset());
          break;
        case 'remix':
          enabled.push(remixPreset());
          break;
        default:
          throw unknownPresetError(entry);
      }
      continue;
    }
    // the object form: per-preset knobs (runtime ids can be anything —
    // JS callers get the same named error as the shorthand path)
    if (
      typeof entry !== 'object' ||
      entry === null ||
      !(PRESET_IDS as readonly string[]).includes(entry.id)
    ) {
      throw unknownPresetError(
        typeof entry === 'object' && entry !== null ? String(entry.id) : String(entry),
      );
    }
    enabled.push(buildPreset(entry));
  }
  return enabled;
}

/** a ref-shaped string: `word:…` with an ascii-letter-led word prefix */
const REF_PREFIX = /^([a-z][a-z0-9-]*):/;

/**
 * the enabled-prefix law (config validation): every ref-shaped string
 * source must speak `lucide:` or an ENABLED preset prefix. Anything
 * else fails at startup naming the reference and the enabled set.
 *
 * @throws the named disabled/unknown-prefix error
 */
export function assertRefPrefixesEnabled(
  icons: Readonly<Record<string, IconSource>>,
  presets: readonly IconPreset[],
): void {
  const enabledPrefixes = ['lucide', ...presets.map((preset) => preset.prefix)];
  for (const [name, source] of Object.entries(icons)) {
    if (typeof source !== 'string') continue;
    const match = REF_PREFIX.exec(source);
    if (match === null) continue;
    const prefix = match[1]!;
    if (!enabledPrefixes.includes(prefix)) {
      throw new Error(
        `[jixoai-icons] library icon "${name}" references "${source}" — the ` +
          `prefix "${prefix}:" is neither lucide: nor an enabled preset. Enabled ` +
          `prefixes: ${enabledPrefixes.map((x) => `${x}:`).join(', ')}; add the ` +
          `matching preset to library.presets (${PRESET_IDS.map((x) => `"${x}"`).join(', ')}) ` +
          'or fix the reference',
      );
    }
  }
}
