/**
 * @jixoai/vite-plugin (icons library) — ADAPTER-side source resolution
 * (A1/A4, openspec icon-component-pipeline design §2/§5; preset + font
 * lanes: openspec icon-library-presets design §1/§2, 2026-09-07).
 *
 * resolveLibraryInputs() is the ONLY stage of the library pipeline with
 * I/O: lucide refs (a dynamic `import('lucide')` with a loud-fail
 * install hint), `{file}` sources (through a plugin-owned
 * ProviderContext — the frozen principle #4 machinery, re-used
 * INDEPENDENTLY of whether the optional provider face is configured;
 * svg files join watchFile so HMR rides the existing refresh path),
 * preset refs (`md:`/`ph:`/`rx:` — the preset node-resolves the peer's
 * ABSOLUTE svg path, this adapter still READS it through the context),
 * font sources (`{font, code}`/`{font, liga}` — parsed + extracted at
 * build time into fill-nature artwork through the SAME context: woff2
 * decompression, the woff1 hard error and ttf/otf mime detection are
 * all inherited from io.loadSource) and inline literals. Per icon the
 * pipeline is:
 *
 *     resolve → safety check (RAW, untrusted) → svgo optimize →
 *     structural validation → ResolvedLibraryIcon
 *
 * Safety runs BEFORE any transformation — optimization never launders
 * unvalidated content. A warn-mode rejection DROPS the icon with a
 * named warning (collected in the resolution); error-mode fails the
 * build. The output feeds the PURE generator (generate.ts) a resolved
 * asset list — never IconSource.
 */

import type { Font as OtFont, Glyph as OtGlyph } from 'opentype.js';
import type { IconNode } from 'lucide';
import type { ProviderContext, SafetyChecker } from '../types.js';
import { serializeLucideIcon } from '../providers/lucide.js';
import { DEFAULT_LIBRARY_MANIFEST } from './manifest.js';
import { optimizeSvg } from './optimize.js';
import {
  findLigatureGlyph,
  glyphNameHint,
  hasEmptyOutline,
  ligatureNames,
  loadOpentype,
  normalizeGlyph,
  toArrayBuffer,
} from './font-extract.js';
import type { IconPreset } from './presets/types.js';
import type {
  IconLibraryOptions,
  IconSource,
  ResolvedLibraryIcon,
} from './types.js';
import { normalizeLibraryOptions, type NormalizedLibraryOptions } from './config.js';

/** what resolveLibraryInputs hands back: survivors + named warnings */
export interface LibraryResolution {
  readonly icons: readonly ResolvedLibraryIcon[];
  readonly warnings: readonly string[];
}

/** one manifest entry after config merge: where the artwork comes from */
interface PendingIcon {
  readonly name: string;
  readonly source: IconSource;
}

/** load the lucide package once per generation — loud-fail install hint */
async function loadLucide(): Promise<typeof import('lucide')> {
  try {
    return await import('lucide');
  } catch (cause) {
    throw new Error(
      '[jixoai-icons] the library face needs the `lucide` package (built-ins or ' +
        'lucide: sources) but it is not installed. lucide is an optional peer ' +
        'dependency of @jixoai/vite-plugin — install it (npm i lucide), switch the ' +
        'icon to an inline/file source, or set includeDefaults:false',
      { cause },
    );
  }
}

/** runtime guard: a lucide module export that is IconNode artwork */
function isIconNode(value: unknown): value is IconNode {
  return (
    Array.isArray(value) &&
    typeof value[0] === 'string' &&
    typeof value[1] === 'object' &&
    value[1] !== null &&
    (value[2] === undefined || Array.isArray(value[2]))
  );
}

/** `lucide:circle-alert` (kebab) → the `CircleAlert` (PascalCase) export */
function lucideExportOf(slug: string): string {
  return slug
    .split('-')
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

/**
 * merge the built-in manifest with the config's icons into packing
 * order: built-ins in GROUPS order first, custom icons after in config
 * insertion order; a same-name custom entry OVERRIDES the built-in in
 * place (no duplicates — Map key insertion order provides both rules).
 */
function mergeSources(normalized: NormalizedLibraryOptions): PendingIcon[] {
  const byName = new Map<string, PendingIcon>();
  if (normalized.includeDefaults) {
    for (const [name, lucideExport] of DEFAULT_LIBRARY_MANIFEST) {
      byName.set(name, { name, source: `lucide:${lucideExport}` });
    }
  }
  for (const [name, source] of Object.entries(normalized.icons)) {
    byName.set(name, { name, source });
  }
  return Array.from(byName.values());
}

// ── structural validation (post-optimize, pre-output) ─────────────

/** the root <svg …> opening tag */
const ROOT_TAG = /<svg\b[^>]*>/i;

/** a viewBox attribute inside the root tag */
const VIEWBOX_ATTRIBUTE = /\sviewBox\s*=\s*(?:"([^"]*)"|'([^']*)')/i;

// ── the font lane (design §2: build-time glyph extraction) ─────────

/** the fill-nature viewBox every extracted glyph normalizes into */
const GLYPH_VIEW_BOX = { width: 24, height: 24 } as const;

/**
 * extract ONE glyph from a loaded+parsed font into the complete svg the
 * shared pipeline then treats like any RAW source. Codepoint lookup is
 * the primary lane (the slot-face fontIconProvider precedents: a
 * codepoint absent from cmap and an empty outline are NAMED errors);
 * the ligature lookup is best-effort (opentype.js GSUB coverage is
 * thin) and its miss lists the font's resolvable ligature names WHEN
 * THE PARSER EXPOSES THEM, else the glyph-name/cmap hint.
 */
function extractFontGlyphSvg(
  font: OtFont,
  source: { readonly font: string; readonly code: number } | { readonly font: string; readonly liga: string },
  label: string,
): string {
  let glyph: OtGlyph;
  if ('code' in source) {
    const code = source.code;
    if (!Number.isInteger(code) || code < 0 || code > 0x10ffff) {
      const hex = `U+${code.toString(16).toUpperCase()}`;
      throw new Error(
        `[jixoai-icons] ${label} — the codepoint ${String(code)} (${hex}) is not a ` +
          'legal Unicode scalar (0..0x10FFFF integer)',
      );
    }
    const char = String.fromCodePoint(code);
    const hex = `U+${code.toString(16).toUpperCase().padStart(4, '0')}`;
    if (font.charToGlyphIndex(char) === 0) {
      throw new Error(
        `[jixoai-icons] ${label} — the font has no glyph mapped at ${hex} — ` +
          'check the codepoint against the font\'s cmap',
      );
    }
    glyph = font.charToGlyph(char);
  } else {
    const found = findLigatureGlyph(font, source.liga);
    if (found === null) {
      const ligaNames = ligatureNames(font);
      const hint =
        ligaNames.length > 0
          ? `resolvable ligatures include: ${ligaNames.join(', ')}`
          : `the parser exposes no ligature table for this font; mapped glyph names include: ${glyphNameHint(font).join(', ')}`;
      throw new Error(
        `[jixoai-icons] ${label} — the ligature "${source.liga}" cannot be ` +
          `resolved in this font (${hint})`,
      );
    }
    glyph = found;
  }

  const bbox = glyph.getBoundingBox();
  if (hasEmptyOutline(bbox)) {
    throw new Error(
      `[jixoai-icons] ${label} — the extracted glyph has an empty outline ` +
        '(a mapped-but-blank glyph is a configuration error, never an invisible icon)',
    );
  }
  const { pathData } = normalizeGlyph(glyph, font.unitsPerEm, bbox, GLYPH_VIEW_BOX);
  const { width, height } = GLYPH_VIEW_BOX;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><path d="${pathData}" fill="currentColor"/></svg>`;
}

// ── resolution ─────────────────────────────────────────────────────

/**
 * Resolve every configured library icon. All file reads and the lucide
 * import flow through `io`/lazy module state — the pure generator
 * downstream receives only resolved, safety-checked, optimized svg
 * strings.
 *
 * @param options the library face config (validated here)
 * @param io      the plugin-owned I/O context ({file} sources read +
 *                watch through it; the root-script adapter passes its
 *                own fs-backed twin)
 * @param checker the SHARED safety checker (the `safety` option serves
 *                both faces) — runs on the RAW source pre-optimization
 */
export async function resolveLibraryInputs(
  options: IconLibraryOptions,
  io: ProviderContext,
  checker: SafetyChecker,
): Promise<LibraryResolution> {
  const normalized = normalizeLibraryOptions(options);
  const warnings: string[] = [];
  const resolved: ResolvedLibraryIcon[] = [];
  const pending = mergeSources(normalized);

  // the enabled presets' prefix → instance map (config validation has
  // already failed every disabled/unknown prefixed ref)
  const presetByPrefix = new Map<string, IconPreset>(
    normalized.presets.map((preset) => [preset.prefix, preset]),
  );
  const presetRefOf = (source: string): { preset: IconPreset; ref: string } | null => {
    const colon = source.indexOf(':');
    if (colon <= 0) return null;
    const preset = presetByPrefix.get(source.slice(0, colon));
    return preset === undefined ? null : { preset, ref: source.slice(colon + 1) };
  };

  // lucide loads lazily — includeDefaults:false with no lucide: sources
  // never touches the import at all; opentype.js loads lazily the same
  // way (only when a font source actually appears)
  let lucide: typeof import('lucide') | null = null;
  const needsLucide = pending.some(
    (icon) => typeof icon.source === 'string' && icon.source.startsWith('lucide:'),
  );
  if (needsLucide) lucide = await loadLucide();

  for (const { name, source } of pending) {
    const labelOf = (kind: string): string => `library icon "${name}" (${kind})`;

    // -- resolve to the RAW svg ------------------------------------
    let raw: string;
    let label: string;
    if (typeof source === 'string') {
      if (source.startsWith('lucide:')) {
        const exportName = lucideExportOf(source.slice('lucide:'.length));
        const exports: Readonly<Record<string, unknown>> = lucide ?? {};
        const icon: unknown = exports[exportName];
        if (!isIconNode(icon)) {
          throw new Error(
            `[jixoai-icons] ${labelOf(source)} — lucide exports no icon ` +
              `"${exportName}". Check the kebab slug against lucide's icon list ` +
              '(e.g. lucide:circle-alert)',
          );
        }
        raw = serializeLucideIcon(icon);
        label = labelOf(source);
      } else {
        const presetRef = presetRefOf(source);
        if (presetRef !== null) {
          // the preset node-resolves the peer's ABSOLUTE svg path; the
          // plugin still owns the READ (mime law + watchFile HMR reuse,
          // exactly like {file} sources) — absent peer / missing icon
          // fail loudly inside resolveFile (the lucide precedent)
          const absolute = presetRef.preset.resolveFile(presetRef.ref);
          const descriptor = await io.loadSource(absolute);
          if (descriptor.mimeType !== 'image/svg+xml') {
            throw new Error(
              `[jixoai-icons] ${labelOf(source)} — the resolved peer file is ` +
                `${descriptor.mimeType}, not image/svg+xml (preset sources must be ` +
                '.svg artwork)',
            );
          }
          io.watchFile(absolute, () => undefined);
          raw = Buffer.from(descriptor.data).toString('utf8');
          label = labelOf(`${source} → ${absolute}`);
        } else {
          raw = source;
          label = labelOf('inline');
        }
      }
    } else if ('font' in source) {
      // the font lane: woff2 decompress / woff1 hard error / ttf-otf
      // mime detection all live in io.loadSource (inherited, not
      // re-implemented); the parsed glyph outline becomes the RAW svg
      const descriptor = await io.loadSource(source.font);
      if (descriptor.mimeType !== 'font/ttf') {
        throw new Error(
          `[jixoai-icons] ${labelOf(`font ${source.font}`)} — the source is ` +
            `${descriptor.mimeType}, not font/ttf (library {font} sources accept ` +
            '.ttf/.otf and .woff2 — WOFF 1.0 is unsupported)',
        );
      }
      io.watchFile(source.font, () => undefined);
      const opentype = await loadOpentype();
      const font = opentype.parse(toArrayBuffer(descriptor.data));
      const selector = 'code' in source ? `code U+${source.code.toString(16).toUpperCase()}` : `liga "${source.liga}"`;
      raw = extractFontGlyphSvg(font, source, labelOf(`font ${source.font}, ${selector}`));
      label = labelOf(`font ${source.font}`);
    } else {
      const descriptor = await io.loadSource(source.file);
      if (descriptor.mimeType !== 'image/svg+xml') {
        throw new Error(
          `[jixoai-icons] ${labelOf(`file ${source.file}`)} — the source is ` +
            `${descriptor.mimeType}, not image/svg+xml (library {file} sources ` +
            'must be .svg artwork)',
        );
      }
      // watched for HMR: a change re-runs this resolution through the
      // plugin's existing refresh path (the callback itself is a no-op —
      // registration is what joins the file to the refresh chain)
      io.watchFile(source.file, () => undefined);
      raw = Buffer.from(descriptor.data).toString('utf8');
      label = labelOf(`file ${source.file}`);
    }

    // -- safety on the RAW source (before any transformation) -------
    const verdict = checker.check(raw, label);
    if (!verdict.passed) {
      const detail = verdict.issues.map((issue) => `  - ${issue.message}`).join('\n');
      const hasErrors = verdict.issues.some((issue) => issue.severity === 'error');
      if (hasErrors) {
        throw new Error(`[jixoai-icons] SVG safety check failed (${label}):\n${detail}`);
      }
      warnings.push(
        `[jixoai-icons] SVG safety check rejected ${label} — the icon is DROPPED ` +
          `from the library:\n${detail}`,
      );
      continue;
    }

    // -- svgo optimize (after safety; never on the slot face) -------
    let svg = raw;
    if (normalized.optimize !== false) {
      svg = await optimizeSvg(
        raw,
        normalized.optimize === true ? undefined : normalized.optimize,
      );
    }

    // -- structural validation (the extractor's contract) -----------
    const root = ROOT_TAG.exec(svg);
    if (root === null || !VIEWBOX_ATTRIBUTE.test(root[0])) {
      const message =
        `[jixoai-icons] ${label} — the svg has no root <svg … viewBox="…"> ` +
        'element; the structured extract needs the viewBox (the component ' +
        're-owns the root)';
      if (checker.mode === 'error') {
        throw new Error(message);
      }
      warnings.push(message);
      continue;
    }

    resolved.push({ name, svg });
  }

  return { icons: resolved, warnings };
}
