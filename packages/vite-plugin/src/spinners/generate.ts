/**
 * @jixoai/ui-vite-plugin (spinners) — the PURE generator core (P1,
 * openspec spin-ora-svg-lane design §5/§6).
 *
 * generateSpinSet() is the ONLY code that serializes the spinner set.
 * It is PURE: no fs, no vite, no dynamic imports — its input is the
 * RESOLVED asset list (ResolvedSpinner, never SpinnerSource; the type
 * split makes I/O smuggling untypeable) and its output is text.
 * Determinism is law: identical inputs produce byte-identical outputs
 * (the `--check` freshness gate is meaningful because of it).
 *
 * NO svgo ever runs here (design §5/§8, the byte-faithful law): svgo's
 * default preset carries convertShapeToPath, which rewrites `<rect>`
 * to `<path>` and silently KILLS `attributeName="x|y|width|height"`
 * animate targeting. And NO id scoping either — the icons' scopeIconIds
 * rewrites `id="spinner_oJFS"` but cannot see the SMIL syncbase refs
 * (`begin="spinner_oJFS.begin+0.1s"`), so scoping would orphan every
 * dependent timeline; `d` is the root's children, sliced byte-faithful
 * (design §3: duplicate ids across instances = lockstep, a documented
 * compromise, not a bug to fix at generate time).
 *
 * The artifact is a SINGLE inline module (design §5): `SpinName` union,
 * `SPIN_NAMES`, `getSpin(name): SpinData | null` — null not undefined,
 * the getIcon precedent. No chunks, no lazy tier, no virtual ids: the
 * default artifact is plugin-free (spin-set installs without the
 * plugin; the plugin only re-generates with custom spinners).
 */

import type { ResolvedSpinner, SpinData, SpinnersReport } from './types.js';

// ── serialization dialect ──────────────────────────────────────────

/**
 * single-quoted TS string literal (the icons artifact's frozen
 * dialect, carried over verbatim). Backslash first, then the quote,
 * then control chars — a raw \n or \r inside a payload (legal in SVG
 * text/attr content) would otherwise terminate the literal and corrupt
 * the generated TypeScript. The JS line separators U+2028/U+2029 join
 * the set for the same reason (legal in ES strings, historically
 * hostile to some minifiers/parsers).
 */
const sq = (value: string): string =>
  `'${value
    .replaceAll('\\', '\\\\')
    .replaceAll("'", "\\'")
    .replaceAll('\n', '\\n')
    .replaceAll('\r', '\\r')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029')}'`;

/**
 * may an emitted key ride BARE in an object literal? spinner names are
 * kebab (`blocks-wave`), so quoting is the NORM — the bare test exists
 * so a hypothetical identifier-legal name stays readable
 */
const isBareKey = (key: string): boolean => /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key);

// ── structured extraction (design §3 — mirrors the icons' law) ─────

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
 * Extract the structured payload from a resolved spinner svg: the
 * viewBox (`v` — the only root attr kept), the artwork nature (`n`,
 * EXACTLY the icons' detection: root stroke non-none wins, else any
 * child stroke non-none, else fill — blocks-wave is fill-nature) and
 * the children inner-HTML (`d` — byte-faithful, the SMIL `<animate>`
 * content and its syncbase ids ride through untouched). The component
 * re-owns the root (design §3).
 */
export function extractSpinData(svg: string): SpinData {
  const root = ROOT_TAG.exec(svg);
  if (root === null) {
    throw new Error('[jixoai-spinners] extractSpinData: no <svg> root element — the adapter must structurally validate before the pure core runs');
  }
  const rootTag = root[0];
  const viewBox = VIEWBOX_ATTRIBUTE.exec(rootTag);
  if (viewBox === null) {
    throw new Error('[jixoai-spinners] extractSpinData: the root <svg> carries no viewBox — the adapter must structurally validate before the pure core runs');
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
    // a self-closed empty root is a legal shape (d = ''); anything
    // else is malformed
    if (!/\/>$/.test(rootTag)) {
      throw new Error('[jixoai-spinners] extractSpinData: no closing </svg> — the adapter must structurally validate before the pure core runs');
    }
    return { v: viewBox[1] ?? viewBox[2] ?? '', n: nature, d: '' };
  }
  const d = svg.slice(rootEnd, end);
  return { v: viewBox[1] ?? viewBox[2] ?? '', n: nature, d };
}

// ── the generated output ───────────────────────────────────────────

/**
 * the GENERATED header every emitted module carries — names gen:spins
 * as the owning writer (the single-writer law, design §5)
 */
const GENERATED_HEADER =
  '// GENERATED — do not edit (source: @jixoai/ui-vite-plugin spinners face — regenerate via npm run gen:spins)';

/**
 * Build the complete artifact (spin-set.gen.ts) per design §5: the
 * SpinName union, the SPIN_NAMES array, the inline SPINNERS record and
 * the synchronous getSpin(). Lookup guards with Object.hasOwn — a
 * grammar-legal name like `constructor` must miss, not inherit
 * Object's (the icons' diff-r1 M2 law).
 */
function buildArtifact(entries: readonly (readonly [name: string, data: SpinData])[]): string {
  const unionLines = entries.map(([name]) => `  | ${sq(name)}`);
  const spinUnion =
    unionLines.length === 0
      ? 'export type SpinName = never;'
      : `export type SpinName =\n${unionLines.join('\n')}\n  ;`;

  const spinNames =
    entries.length === 0
      ? 'export const SPIN_NAMES = [\n] as readonly SpinName[];'
      : `export const SPIN_NAMES = [\n${entries.map(([name]) => `  ${sq(name)},`).join('\n')}\n] as readonly SpinName[];`;

  const rows = entries.map(
    ([name, data]) =>
      `  ${isBareKey(name) ? name : sq(name)}: { v: ${sq(data.v)}, n: ${sq(data.n)}, d: ${sq(data.d)} },`,
  );
  const record =
    entries.length === 0
      ? 'const SPINNERS: Readonly<Record<SpinName, SpinData>> = {\n};'
      : `const SPINNERS: Readonly<Record<SpinName, SpinData>> = {\n${rows.join('\n')}\n};`;

  return [
    GENERATED_HEADER,
    spinUnion,
    spinNames,
    "export interface SpinData { v: string; n: 'fill' | 'stroke'; d: string }",
    record,
    '',
    'export function getSpin(name: SpinName): SpinData | null {',
    '  return Object.hasOwn(SPINNERS, name) ? SPINNERS[name] : null;',
    '}',
    '',
  ].join('\n');
}

// ── the generator ──────────────────────────────────────────────────

/** what generateSpinSet() returns (design §5) */
export interface GeneratedSpinSet {
  /** the complete spin-set.gen.ts text */
  readonly artifact: string;
  readonly report: SpinnersReport;
}

/**
 * Generate the spin-set artifact from RESOLVED assets. PURE and
 * DETERMINISTIC — identical inputs produce byte-identical outputs
 * (packing order = input order: the built-ins in manifest order, then
 * custom spinners in config insertion order — the ADAPTER owns that
 * ordering and the same-name override).
 */
export function generateSpinSet(assets: readonly ResolvedSpinner[]): GeneratedSpinSet {
  const entries = assets.map((asset) => {
    const data = extractSpinData(asset.svg);
    return [asset.name, data] as const;
  });
  return {
    artifact: buildArtifact(entries),
    report: { spinnerCount: entries.length, warnings: [] },
  };
}
