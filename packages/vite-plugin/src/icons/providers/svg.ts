/**
 * @jixoai/vite-plugin (icons) — svgIconProvider (P2.1)
 *
 * File-based SVG icons. The provider NEVER touches the filesystem —
 * every read goes through ctx.loadSource (the vite plugin owns ALL
 * file I/O; frozen principle #4), and HMR re-loads go through
 * ctx.watchFile.
 *
 * Failure policy (loud but non-fatal, mirroring the safety checker's
 * warn-mode idiom): a slot whose file cannot be loaded or parsed is
 * skipped — getIcon returns null for it and the next provider in the
 * mixin chain (or the standard layer's inline fallback) serves. A
 * console.warn explains which path failed and why.
 */

import type {
  IconProvider,
  IconProviderFactory,
  IconSlot,
  ProviderContext,
  SourceDescriptor,
  SvgAsset,
} from '../types.js';
import { SLOT_NAMES } from '../types.js';

/** options for {@link svgIconProvider} */
export interface SvgIconProviderOptions {
  /** directory containing the .svg files (resolved via ctx.loadSource) */
  readonly dir: string;
  /**
   * Per-slot filename overrides. When provided, the provider serves
   * ONLY the listed slots (each loading `{dir}/{filename}`) — this is
   * how a mixin override scopes itself to one slot. When omitted, all
   * registered slots are served with their default `{slot}.svg`
   * filenames.
   */
  readonly slots?: Partial<Record<IconSlot, string>>;
}

/** join a directory and filename without depending on node:path */
const joinPath = (dir: string, file: string): string =>
  dir.endsWith('/') ? `${dir}${file}` : `${dir}/${file}`;

/** the opening <svg …> tag (viewBox is read from here, not from children) */
const SVG_OPEN_TAG_RE = /<svg\b[^>]*>/i;

/** viewBox="minX minY width height" (XML allows comma separators too) */
const VIEWBOX_RE = /viewBox\s*=\s*["']([^"']+)["']/i;

/** every stroke="…" presentation attribute in the document */
const STROKE_ATTR_RE = /\bstroke\s*=\s*["']([^"']*)["']/gi;

/** opaque stroke paint values mean the artwork is stroke-based */
const TRANSPARENT_STROKE = new Set(['', 'none', 'transparent']);

/**
 * Detect the artwork nature: 'stroke' if any element paints a visible
 * stroke, otherwise 'fill' (fill is the SVG default — plain
 * `<path d="…"/>` glyphs and font extractions land here).
 *
 * Attribute-based heuristic: CSS inside a <style> block is not
 * inspected. Lucide-style roots (`fill="none" stroke="currentColor"`)
 * resolve to 'stroke'; `stroke="none"` values are ignored so
 * fill-based sets that disable stroke explicitly still resolve to
 * 'fill'.
 */
function detectNature(svg: string): 'fill' | 'stroke' {
  for (const match of svg.matchAll(STROKE_ATTR_RE)) {
    if (!TRANSPARENT_STROKE.has(match[1]!.trim().toLowerCase())) {
      return 'stroke';
    }
  }
  return 'fill';
}

/** decode + parse a loaded SVG file into a SvgAsset; throws on malformed input */
function parseSvgAsset(source: SourceDescriptor): SvgAsset {
  const svg = new TextDecoder().decode(source.data).trim();

  const openTag = SVG_OPEN_TAG_RE.exec(svg)?.[0];
  if (openTag === undefined) {
    throw new Error('no <svg> root element');
  }

  const viewBoxMatch = VIEWBOX_RE.exec(openTag);
  if (viewBoxMatch === null) {
    throw new Error('missing viewBox on the <svg> root');
  }

  const parts = viewBoxMatch[1]!.trim().split(/[\s,]+/).map(Number);
  const width = parts[2];
  const height = parts[3];
  if (
    parts.length !== 4 ||
    !parts.every((n) => Number.isFinite(n)) ||
    width! <= 0 ||
    height! <= 0
  ) {
    throw new Error(`invalid viewBox "${viewBoxMatch[1]!}"`);
  }

  return {
    svg,
    viewBox: { width: width!, height: height! },
    nature: detectNature(svg),
    source: { kind: 'file', path: source.path },
  };
}

/**
 * A file-based icon provider backed by .svg files in one directory.
 *
 * @example
 * ```ts
 * // full directory: all five slots, default filenames
 * svgIconProvider({ dir: './src/assets/icons' })
 *
 * // scoped override (mixin): only the chevron slot, custom filename
 * svgIconProvider({ dir: './src/assets/icons', slots: { chevron: 'down.svg' } })
 * ```
 */
export function svgIconProvider(options: SvgIconProviderOptions): IconProviderFactory {
  const slotFiles: readonly (readonly [IconSlot, string])[] = options.slots
    ? (Object.entries(options.slots) as [IconSlot, string | undefined][]).filter(
        (entry): entry is [IconSlot, string] => entry[1] !== undefined,
      )
    : SLOT_NAMES.map((slot) => [slot, `${slot}.svg`] as const);

  return async (ctx: ProviderContext) => {
    const cache = new Map<IconSlot, SvgAsset>();

    /** (re)load one slot's file into the cache; warn + skip on failure */
    const loadSlot = async (slot: IconSlot, file: string): Promise<void> => {
      const path = joinPath(options.dir, file);
      try {
        const source = await ctx.loadSource(path);
        cache.set(slot, parseSvgAsset(source));
      } catch (error) {
        cache.delete(slot);
        const reason = error instanceof Error ? error.message : String(error);
        console.warn(
          `[svgIconProvider] skipping slot "${slot}" (${path}): ${reason} — the slot falls back to the next provider`,
        );
      }
    };

    await Promise.all(slotFiles.map(([slot, file]) => loadSlot(slot, file)));

    // HMR: file changes re-run the same load path and update the cache
    for (const [slot, file] of slotFiles) {
      ctx.watchFile(joinPath(options.dir, file), () => {
        void loadSlot(slot, file);
      });
    }

    return {
      getIcon(slot: IconSlot): SvgAsset | null {
        return cache.get(slot) ?? null;
      },
    };
  };
}
