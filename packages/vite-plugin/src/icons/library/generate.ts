/**
 * @jixoai/vite-plugin (icons library) — the PURE generator core (A3/A4,
 * openspec icon-component-pipeline design §3/§5/§6).
 *
 * generateIconLibraryArtifacts() is the ONLY code that serializes the
 * library. It is PURE: no fs, no vite, no dynamic imports — its input
 * is the RESOLVED asset list (ResolvedLibraryIcon, never IconSource;
 * the type split makes I/O smuggling untypeable) and its output is
 * text. Determinism is law: identical inputs produce byte-identical
 * outputs (the `--check` freshness gate is meaningful because of it).
 *
 * Pipeline inside the core: structured extract {v,n,d} → greedy chunk
 * packing (budget = serialized entry bytes, RAW non-gzip) → the
 * artifact (icon-set.gen.ts, design §6) + the lazy chunk module
 * bodies (virtual:jixoai-icons/chunk/K, `export default {name:{v,n,d}}`).
 *
 * The LAZY loaders embed the design §5 overflow named-error sentinel
 * VERBATIM as a runtime catch (the same fixed message the plugin's
 * resolver throws at build time when the library is unconfigured).
 */

import type {
  IconData,
  IconPackingOptions,
  LibraryReport,
  ResolvedLibraryIcon,
} from './types.js';
import { DEFAULT_MAX_CHUNK_BYTES } from './config.js';
import {
  ICON_CHUNK_MODULE_PREFIX,
  ICON_LIBRARY_SENTINEL_ERROR,
} from '../ids.js';

// the chunk-id prefix + the overflow sentinel are contract surface
// (ids.ts — shared with the umbrella bridge); re-exported here so the
// ./icons barrel surface keeps one obvious home
export { ICON_CHUNK_MODULE_PREFIX, ICON_LIBRARY_SENTINEL_ERROR };

/** the virtual module id of one chunk */
export const chunkModuleId = (index: number): string =>
  `${ICON_CHUNK_MODULE_PREFIX}${index}`;

// ── serialization dialect ──────────────────────────────────────────

/** single-quoted TS string literal (the artifact's frozen dialect).
 *  Backslash first, then the quote, then control chars — a raw \n or
 *  \r inside a payload (legal in SVG text/attr content, e.g. via
 *  character refs surviving an optimize:false pass) would otherwise
 *  terminate the literal and corrupt the generated TypeScript. The
 *  JS line separators U+2028/U+2029 join the set for the same reason
 *  at the tooling layer (legal in ES strings, historically hostile
 *  to some minifiers/parsers — the E4-r2 hardening). */
const sq = (value: string): string =>
  `'${value
    .replaceAll('\\', '\\\\')
    .replaceAll("'", "\\'")
    .replaceAll('\n', '\\n')
    .replaceAll('\r', '\\r')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029')}'`;

const byteLength = (text: string): number => new TextEncoder().encode(text).length;

/** the exact text one icon occupies inside a chunk module / CHUNK_0 */
const serializeEntry = (name: string, data: IconData): string =>
  `  ${name}: { v: ${sq(data.v)}, n: ${sq(data.n)}, d: ${sq(data.d)} },`;

// ── structured extraction (design §2) ──────────────────────────────

/** the root <svg …> opening tag */
const ROOT_TAG = /<svg\b[^>]*>/i;

/** a viewBox attribute inside the root tag */
const VIEWBOX_ATTRIBUTE = /\sviewBox\s*=\s*(?:"([^"]*)"|'([^']*)')/i;

/** any element opening/self-closing tag (closing tags start `</`) */
const CHILD_TAG = /<[a-zA-Z][^<>]*>/g;

/** the last closing </svg> (case-insensitive) */
const CLOSING_TAG = /<\/svg\s*>/gi;

/** an attribute's value inside one tag, or undefined when absent */
function attrValue(tag: string, name: string): string | undefined {
  const match = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i').exec(tag);
  return match?.[1] ?? match?.[2];
}

/**
 * Extract the structured payload from a resolved svg: the viewBox (`v`
 * — the only root attr kept; width/height are dropped by law), the
 * artwork nature (`n` — stroke-based artwork wins over fill: the root
 * stroke, else any child stroke; lucide is stroke) and the children
 * inner-HTML (`d` — child-level overrides like lucide's fill dots
 * survive verbatim; the component re-owns the root).
 */
export function extractIconData(svg: string): IconData {
  const root = ROOT_TAG.exec(svg);
  if (root === null) {
    throw new Error('[jixoai-icons] extractIconData: no <svg> root element — the adapter must structurally validate before the pure core runs');
  }
  const rootTag = root[0];
  const viewBox = VIEWBOX_ATTRIBUTE.exec(rootTag);
  if (viewBox === null) {
    throw new Error('[jixoai-icons] extractIconData: the root <svg> carries no viewBox — the adapter must structurally validate before the pure core runs');
  }

  const rootStroke = attrValue(rootTag, 'stroke');
  let nature: 'fill' | 'stroke' =
    rootStroke !== undefined && rootStroke.toLowerCase() !== 'none' ? 'stroke' : 'fill';
  if (nature === 'fill') {
    const inner = svg.slice(root.index + rootTag.length);
    for (const match of inner.matchAll(CHILD_TAG)) {
      const stroke = attrValue(match[0], 'stroke');
      if (stroke !== undefined && stroke.toLowerCase() !== 'none') {
        nature = 'stroke';
        break;
      }
    }
  }

  let end = -1;
  for (const match of svg.matchAll(CLOSING_TAG)) end = match.index;
  const rootEnd = root.index + rootTag.length;
  if (end < rootEnd) {
    // svgo can strip no-op artwork down to a SELF-CLOSED empty root —
    // a legal optimized shape (d = ''); anything else is malformed
    if (!/\/>$/.test(rootTag)) {
      throw new Error('[jixoai-icons] extractIconData: no closing </svg> — the adapter must structurally validate before the pure core runs');
    }
    return { v: viewBox[1] ?? viewBox[2] ?? '', n: nature, d: '' };
  }
  const d = svg.slice(rootEnd, end);
  return { v: viewBox[1] ?? viewBox[2] ?? '', n: nature, d };
}

// ── greedy packing (design §3) ─────────────────────────────────────

/** one icon, extracted + serialized, ready to place in a chunk */
interface PackedEntry {
  readonly name: string;
  readonly data: IconData;
  readonly entryText: string;
  readonly bytes: number;
}

/** pack entries into chunks under the mode matrix */
function packChunks(
  entries: readonly PackedEntry[],
  maxChunkBytes: number,
  chunking: 'auto' | 'single',
): { chunks: PackedEntry[][]; warnings: string[] } {
  if (chunking === 'single') {
    return { chunks: entries.length > 0 ? [entries.slice()] : [], warnings: [] };
  }
  const chunks: PackedEntry[][] = [];
  const warnings: string[] = [];
  let current: PackedEntry[] = [];
  let currentBytes = 0;
  const closeCurrent = (): void => {
    if (current.length > 0) {
      chunks.push(current);
      current = [];
      currentBytes = 0;
    }
  };
  for (const entry of entries) {
    if (entry.bytes > maxChunkBytes) {
      closeCurrent();
      chunks.push([entry]);
      warnings.push(
        `[jixoai-icons] library icon "${entry.name}" (${entry.bytes} serialized ` +
          `bytes) exceeds maxChunkBytes (${maxChunkBytes}) — it packs as its own ` +
          'chunk; slim the artwork or raise the budget',
      );
      continue;
    }
    if (currentBytes + entry.bytes > maxChunkBytes) closeCurrent();
    current.push(entry);
    currentBytes += entry.bytes;
  }
  closeCurrent();
  return { chunks, warnings };
}

// ── the generated outputs ──────────────────────────────────────────

/** the GENERATED header every emitted module carries */
const GENERATED_HEADER =
  '// GENERATED — do not edit (source: @jixoai/vite-plugin icons library face)';

/** one lazy chunk module body: `export default {name:{v,n,d}}` */
const chunkModule = (entries: readonly PackedEntry[]): string =>
  `${GENERATED_HEADER}\nexport default {\n${entries
    .map((entry) => entry.entryText)
    .join('\n')}\n};\n`;

/** the LAZY loader for one chunk — the sentinel catch rides every import */
const lazyLoader = (index: number): string =>
  `  ${index}: () => import('${chunkModuleId(index)}').catch((cause: unknown) => {\n` +
  `    throw new Error(${JSON.stringify(ICON_LIBRARY_SENTINEL_ERROR)}, { cause });\n` +
  '  }),';

/** the complete artifact (icon-set.gen.ts) per design §6 */
function buildArtifact(
  entries: readonly PackedEntry[],
  chunks: readonly (readonly PackedEntry[])[],
  lazyChunks: readonly number[],
  inlineFirstChunk: boolean,
): string {
  const names = entries.map((entry) => entry.name);

  const iconUnion =
    names.length === 0
      ? 'export type IconName = never;'
      : `export type IconName =\n${names.map((name) => `  | ${sq(name)}`).join('\n')}\n  ;`;

  const iconNames =
    `export const ICON_NAMES = [\n${names.map((name) => `  ${sq(name)},`).join('\n')}\n] as readonly IconName[];`;

  // chunk 0 embeds inline whenever a chunk exists and inlineFirstChunk
  // is on; the all-lazy escape hatch (and the empty library) keeps the
  // const shape stable as {}
  const inlineChunk = inlineFirstChunk ? (chunks[0] ?? []) : [];
  const chunk0 =
    inlineChunk.length === 0
      ? 'const CHUNK_0: Readonly<Record<string, IconData>> = {};'
      : `const CHUNK_0: Readonly<Record<string, IconData>> = {\n${inlineChunk
          .map((entry) => entry.entryText)
          .join('\n')}\n};`;

  const chunkOfLines = chunks.flatMap((chunk, index) =>
    chunk.map((entry) => `  ${sq(entry.name)}: ${index},`),
  );
  const chunkOf =
    chunkOfLines.length === 0
      ? 'const CHUNK_OF: Readonly<Record<IconName, number>> = {};'
      : `const CHUNK_OF: Readonly<Record<IconName, number>> = {\n${chunkOfLines.join('\n')}\n};`;

  const lazy =
    lazyChunks.length === 0
      ? 'const LAZY: Readonly<Record<number, () => Promise<{ default: Record<string, IconData> }>>> = {};'
      : `const LAZY: Readonly<Record<number, () => Promise<{ default: Record<string, IconData> }>>> = {\n${lazyChunks
          .map((index) => lazyLoader(index))
          .join('\n')}\n};`;

  return [
    GENERATED_HEADER,
    iconUnion,
    iconNames,
    'export interface IconData { v: string; n: \'fill\' | \'stroke\'; d: string }',
    chunk0,
    chunkOf,
    lazy,
    'const cache: Map<string, IconData> = new Map(Object.entries(CHUNK_0));',
    '',
    'export function getIcon(name: IconName): IconData | null {',
    '  return cache.get(name) ?? null;',
    '}',
    '',
    'export async function loadIcon(name: IconName): Promise<IconData> {',
    '  const hit = cache.get(name);',
    '  if (hit !== undefined) return hit;',
    '  const loader = LAZY[CHUNK_OF[name] ?? -1];',
    '  if (loader === undefined) {',
    '    throw new Error(`[jixoai/icon-set] icon "${name}" has no chunk loader — the artifact drifted from the library config (regenerate icon-set.gen.ts)`);',
    '  }',
    '  const chunk = (await loader()).default;',
    '  for (const [chunkName, data] of Object.entries(chunk)) {',
    '    if (!cache.has(chunkName)) cache.set(chunkName, data);',
    '  }',
    '  const loaded = cache.get(name);',
    '  if (loaded === undefined) {',
    '    throw new Error(`[jixoai/icon-set] the chunk for "${name}" loaded but the icon is missing — the artifact drifted from the library config (regenerate icon-set.gen.ts)`);',
    '  }',
    '  return loaded;',
    '}',
    '',
    'export function preloadIcons(names: Iterable<IconName>): Promise<unknown[]> {',
    '  return Promise.all(Array.from(names, (name) => loadIcon(name)));',
    '}',
    '',
  ].join('\n');
}

// ── the generator ──────────────────────────────────────────────────

/** what generateIconLibraryArtifacts() returns (design §5) */
export interface GeneratedLibraryArtifacts {
  /** the complete icon-set.gen.ts text */
  readonly artifact: string;
  /** every chunk module body by index (lazy ones are served virtually
   *  by the vite adapter; the inline chunk exists for parity checks) */
  readonly chunks: ReadonlyMap<number, string>;
  readonly report: LibraryReport;
}

/**
 * Generate the icon-set artifact + lazy chunk modules from RESOLVED
 * assets. PURE and DETERMINISTIC — identical inputs produce
 * byte-identical outputs (packing order = input order: built-ins in
 * manifest order, then custom icons in config insertion order).
 *
 * @param assets  the resolved asset list (adapter output — never
 *                IconSource)
 * @param options packing knobs (maxChunkBytes default 20480, chunking
 *                default 'auto', inlineFirstChunk default true)
 */
export function generateIconLibraryArtifacts(
  assets: readonly ResolvedLibraryIcon[],
  options?: IconPackingOptions,
): GeneratedLibraryArtifacts {
  const maxChunkBytes = options?.maxChunkBytes ?? DEFAULT_MAX_CHUNK_BYTES;
  const chunking = options?.chunking ?? 'auto';
  const inlineFirstChunk = options?.inlineFirstChunk ?? true;

  const entries: PackedEntry[] = assets.map((asset) => {
    const data = extractIconData(asset.svg);
    const entryText = serializeEntry(asset.name, data);
    return { name: asset.name, data, entryText, bytes: byteLength(`${entryText}\n`) };
  });

  const { chunks, warnings } = packChunks(entries, maxChunkBytes, chunking);

  // the mode matrix (design §3): which chunk indexes the artifact
  // imports virtually — single+inline is 不拆 (zero virtual imports);
  // auto+inline lazies only 1..N (N=1 → zero virtual imports)
  let lazyChunks: number[];
  if (chunking === 'single') {
    lazyChunks = inlineFirstChunk || chunks.length === 0 ? [] : [0];
  } else {
    lazyChunks = chunks.map((_, index) => index).filter(
      (index) => !inlineFirstChunk || index > 0,
    );
  }

  const artifact = buildArtifact(entries, chunks, lazyChunks, inlineFirstChunk);
  const chunkModules = new Map<number, string>(
    chunks.map((chunk, index) => [index, chunkModule(chunk)]),
  );

  const perIconBytes: Record<string, number> = {};
  for (const entry of entries) perIconBytes[entry.name] = entry.bytes;
  const chunkBytes = new Map<number, number>(
    chunks.map((chunk, index) => [
      index,
      chunk.reduce((sum, entry) => sum + entry.bytes, 0),
    ]),
  );

  return {
    artifact,
    chunks: chunkModules,
    report: {
      iconCount: entries.length,
      chunkCount: chunks.length,
      perIconBytes,
      chunkBytes,
      lazyChunks,
      warnings,
    },
  };
}
