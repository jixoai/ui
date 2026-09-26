/**
 * @jixoai/ui-vite-plugin (universal-props) — the query() desugarer
 * (explicit-props W2 task 2.3b, design §9/§9.1 "Compile output").
 *
 * The BUILD-TIME twin of the runtime engine (kernel lib
 * universal-props-query.svelte.ts): statically analyzable LITERAL
 * query({...}) calls compile to custom-property re-assignment blocks
 * — media keys → @media (min-width: …), container keys →
 * @container [<name>] (min-width: …) — emitted in REGISTERED-SCALE
 * order (narrow → wide; §9's authoring-order-independence ruling:
 * {lg:'a',sm:'b'} and {sm:'b',lg:'a'} compile to IDENTICAL css).
 * Best-effort by design (the Owner's 编译期脱糖不绝对 ruling): the
 * engine remains the source of truth for dynamic cases; what the
 * pass cannot prove lands in the per-route un-desugarable manifest
 * (query-shim's import driver).
 *
 * The KEY DIAGNOSTICS (§9.1/§9, all named, all actionable):
 *   · unknown-scale      — key outside the registered scale tables → WARNING
 *   · duplicate-key      — textual duplicate in the literal → WARNING
 *   · empty-container-name (@md/) — §9's parse rejection → ERROR (fatal)
 *   · missing-container-ancestor — an @ key with no container-type
 *     supply in the same file's scope → WARNING (best-effort file
 *     heuristic; the runtime twin is auditTree)
 *
 * Orthogonal intents:
 *   1. the scanner — literal query( call sites with balanced-brace
 *      object extraction (source text; no AST dependency)
 *   2. the diagnostics — the four rules above
 *   3. the emitter — ladder-ordered blocks keyed on the instance
 *      selector [data-jx-q-<axis>="<id>"]; the carrier declarations
 *      MIRROR defaults.svelte.ts's stampCarriers (the runtime stamp)
 *      — two stamps, one law (§11); the instance attribute lands with
 *      the family wiring (W3), which is why this lane is best-effort
 *   4. the carrier-declaration helper shared with the shim
 */

import { compareQueryKeys, parseQueryKey } from './alias-tables.js';

/** the eight §0 axes (the desugarer's axis-prop vocabulary) */
export const UNIVERSAL_AXES = [
  'size',
  'shape',
  'radius',
  'density',
  'color',
  'theme',
  'elevation',
  'motion',
] as const;
export type UniversalAxis = (typeof UNIVERSAL_AXES)[number];

/** §0.1's frozen elevation table (the kernel schema's ELEVATION_DP —
 *  duplicated VERBATIM here because the plugin package cannot import
 *  the apps/www artifact; both cite §0.1 and the battery pins the
 *  agreement) */
export const ELEVATION_DP: Readonly<Record<string, number>> = {
  'level-1': -1,
  level0: 0,
  level1: 1,
  level2: 3,
  level3: 6,
  level4: 8,
  level5: 12,
};

/** §17's color namedSteps (the semantic closure for the color axis —
 *  the raw/plugin-name string lane passes through verbatim) */
const COLOR_NAMED_STEPS = ['primary', 'secondary', 'error', 'warn', 'success', 'info'];

// ── 1. the scanner ────────────────────────────────────────────────

export interface QueryCallSite {
  /** the literal object's keys, in SOURCE order (duplicate detection) */
  readonly keys: readonly string[];
  /** the second (base) argument's literal text, when present */
  readonly base: string | null;
  /** the owning axis when the call sits in an axis attribute value */
  readonly axis: UniversalAxis | null;
  /** [start, end) span of the whole call in the source */
  readonly start: number;
  readonly end: number;
  /** true when the first argument is NOT an object literal (dynamic) */
  readonly dynamic: boolean;
}

/** find `query(` call sites in source text. A call is a query() call
 *  when the identifier is bare (not `x.query(`) — the §9.1 name. */
export function scanQueryCalls(source: string): QueryCallSite[] {
  const calls: QueryCallSite[] = [];
  const re = /\bquery\s*\(/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(source))) {
    const start = m.index;
    // bare-identifier guard: the char before `query` must not be `.`
    // or a name character (member/qualified calls are not ours)
    const prev = source[start - 1];
    if (prev === '.' || /[A-Za-z0-9_$]/.test(prev ?? '')) continue;
    const openParen = m.index + m[0].length - 1;
    const argsSpan = readBalanced(source, openParen, '(', ')');
    if (!argsSpan) continue; // unbalanced — not ours to judge
    const argsText = source.slice(argsSpan.contentStart, argsSpan.contentEnd);
    const parsed = parseCallArgs(argsText);
    const callEnd = argsSpan.end + 1; // past ')'
    const axis = detectAxisContext(source, start);
    if (parsed.kind === 'dynamic') {
      calls.push({ keys: [], base: null, axis, start, end: callEnd, dynamic: true });
      continue;
    }
    calls.push({
      keys: parsed.keys,
      base: parsed.base,
      axis,
      start,
      end: callEnd,
      dynamic: false,
    });
  }
  return calls;
}

interface BalancedSpan {
  contentStart: number;
  contentEnd: number;
  end: number;
}

/** read a balanced (...) region from the index of its opener; returns
 *  null when the region never closes before source end */
function readBalanced(source: string, openIndex: number, open: string, close: string): BalancedSpan | null {
  let depth = 0;
  let quote: string | null = null;
  for (let i = openIndex; i < source.length; i += 1) {
    const ch = source[i]!;
    if (quote) {
      if (ch === '\\') i += 1;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === open) depth += 1;
    else if (ch === close) {
      depth -= 1;
      if (depth === 0) return { contentStart: openIndex + 1, contentEnd: i, end: i };
    }
  }
  return null;
}

type ParsedArgs =
  | { kind: 'literal'; keys: string[]; base: string | null }
  | { kind: 'dynamic' };

/** split a call's argument text into the object literal (first arg)
 *  and the optional base (second arg, literal text) */
function parseCallArgs(argsText: string): ParsedArgs {
  const trimmed = argsText.trim();
  if (!trimmed.startsWith('{')) return { kind: 'dynamic' };
  const objSpan = readBalancedFromContent(trimmed, 0);
  if (!objSpan) return { kind: 'dynamic' };
  const objText = trimmed.slice(1, objSpan.closeIndex);
  const rest = trimmed.slice(objSpan.closeIndex + 1).trim();
  const base = rest.startsWith(',') ? rest.slice(1).trim() || null : rest ? rest : null;
  const keys: string[] = [];
  for (const entry of splitTopLevel(objText)) {
    const colon = findTopLevelColon(entry);
    if (colon === -1) continue;
    let key = entry.slice(0, colon).trim();
    if ((key.startsWith("'") && key.endsWith("'")) || (key.startsWith('"') && key.endsWith('"'))) {
      key = key.slice(1, -1);
    }
    if (key) keys.push(key);
  }
  return { kind: 'literal', keys, base };
}

/** content-first balanced reader — text[from] IS the opener; scanning
 *  starts past it with depth 1 */
function readBalancedFromContent(text: string, from: number): { closeIndex: number } | null {
  let depth = 1;
  let quote: string | null = null;
  for (let i = from + 1; i < text.length; i += 1) {
    const ch = text[i]!;
    if (quote) {
      if (ch === '\\') i += 1;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === '{') depth += 1;
    else if (ch === '}') {
      depth -= 1;
      if (depth === 0) return { closeIndex: i };
    }
  }
  return null;
}

/** split object-literal entries on top-level commas */
function splitTopLevel(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let quote: string | null = null;
  let start = 0;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]!;
    if (quote) {
      if (ch === '\\') i += 1;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === '{' || ch === '(' || ch === '[') depth += 1;
    else if (ch === '}' || ch === ')' || ch === ']') depth -= 1;
    else if (ch === ',' && depth === 0) {
      parts.push(text.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(text.slice(start));
  return parts.map((p) => p.trim()).filter(Boolean);
}

function findTopLevelColon(text: string): number {
  let depth = 0;
  let quote: string | null = null;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]!;
    if (quote) {
      if (ch === '\\') i += 1;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === '{' || ch === '(' || ch === '[') depth += 1;
    else if (ch === '}' || ch === ')' || ch === ']') depth -= 1;
    else if (ch === ':' && depth === 0) return i;
  }
  return -1;
}

/** when the call is a Svelte attribute value (`axis={query(…}`) or an
 *  object-literal prop (`{ axis: query(…) }` — the props-object
 *  authoring shape), return the axis; else null */
function detectAxisContext(source: string, callStart: number): UniversalAxis | null {
  const head = source.slice(Math.max(0, callStart - 80), callStart);
  const m = /([A-Za-z][A-Za-z0-9-]*)\s*(?:=\s*\{|:)\s*$/.exec(head);
  if (!m) return null;
  return (UNIVERSAL_AXES as readonly string[]).includes(m[1]!) ? (m[1] as UniversalAxis) : null;
}

// ── 2. the diagnostics ────────────────────────────────────────────

export type QueryDiagnosticCode =
  | 'unknown-scale'
  | 'duplicate-key'
  | 'empty-container-name'
  | 'missing-container-ancestor';

export interface QueryDiagnostic {
  readonly code: QueryDiagnosticCode;
  readonly key: string | null;
  /** §9's parse rejections are FATAL (@md/ names a rule, not a hint) */
  readonly fatal: boolean;
  readonly message: string;
}

/** the same-file container-supply heuristic: does the file's own css/
 *  markup declare any container at all? (best-effort — the ancestor
 *  may legitimately live in a parent component; WARNING, never error) */
export function fileDeclaresContainer(source: string): boolean {
  return /container-type|container-name|@container/.test(source);
}

export function diagnoseQueryCall(call: QueryCallSite, fileSource: string): QueryDiagnostic[] {
  const diags: QueryDiagnostic[] = [];
  const seen = new Set<string>();
  let hasContainerKey = false;
  for (const key of call.keys) {
    const parsed = parseQueryKey(key);
    if (parsed === 'empty-container-name') {
      diags.push({
        code: 'empty-container-name',
        key,
        fatal: true,
        message: `query() key '${key}': the named-container grammar demands a NON-EMPTY name segment (design §9 — \`@<scale>/<name>\`, size first); \`@${key.slice(1)}\` is a parse error`,
      });
      continue;
    }
    if (parsed === null) {
      diags.push({
        code: 'unknown-scale',
        key,
        fatal: false,
        message: `query() key '${key}' is not in the registered scale tables (viewport: xs|sm|md|lg · container: @3xs|@2xs|@xs|@sm|@md|@lg|@xl[@/name]); the case can never match`,
      });
      continue;
    }
    if (parsed.kind === 'container') hasContainerKey = true;
    if (seen.has(key)) {
      diags.push({
        code: 'duplicate-key',
        key,
        fatal: false,
        message: `query() key '${key}' appears twice in the same literal — the later case wins at runtime and the ladder does not merge them`,
      });
    }
    seen.add(key);
  }
  if (hasContainerKey && !fileDeclaresContainer(fileSource)) {
    diags.push({
      code: 'missing-container-ancestor',
      key: call.keys.find((k) => k.startsWith('@')) ?? null,
      fatal: false,
      message: `query() uses a container (@) key but this file's scope declares no container-type/container-name — a container key with no qualifying ancestor NEVER matches (design §9; the broadcast duty §11 requires contributors to stamp it)`,
    });
  }
  return diags;
}

// ── 3+4. the carrier declarations + the emitter ───────────────────

/** parse a case/base literal (source text) into its lane value */
export function parseLaneLiteral(literal: string | null): string | number | undefined {
  if (literal === null) return undefined;
  const t = literal.trim();
  const m = /^(['"])(.*)\1$/.exec(t);
  if (m) return m[2]!;
  if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
  return t === '' ? undefined : t;
}

/**
 * The §11 carrier declarations for one axis/lane — the BUILD twin of
 * defaults.svelte.ts's stampCarriers (two stamps, one law; theme is
 * NEVER a var — its carrier is the .dark class bridge, so a theme
 * query is un-desugarable by construction).
 */
export function carrierDeclarationsFor(axis: UniversalAxis, lane: string | number): string[] | null {
  switch (axis) {
    case 'size': {
      const value = typeof lane === 'number' ? `${lane}px` : `var(--jx-size-${lane})`;
      return [`--jx-size-effective: ${value}`, 'font-size: var(--jx-size-effective, 1rem)'];
    }
    case 'shape':
      return [
        `--jx-shape-effective: var(--jx-shape-${lane})`,
        `--jx-radius-factor-effective: var(--jx-radius-factor-${lane})`,
      ];
    case 'radius': {
      const value = typeof lane === 'number' ? `${lane}px` : `var(--jx-radius-${lane})`;
      return [`--jx-radius-effective: ${value}`];
    }
    case 'density':
      // §4 precedence: a NAMED lane sets the rung scope (the
      // data-density attr — the template half, never css) AND resets
      // the coefficient to 1; the NUMBER lane is the coefficient
      return [
        `--jx-density-coefficient: ${typeof lane === 'number' ? lane : 1}`,
      ];
    case 'color': {
      const value = COLOR_NAMED_STEPS.includes(lane as string)
        ? `var(--jx-color-${lane})`
        : typeof lane === 'number'
          ? `oklch(var(--jx-color-formula-l, 0.6489) var(--jx-color-formula-c, 0.237) calc(${lane} + var(--jx-color-formula-drift, 0)))`
          : `${lane}`;
      return [`--jx-color-effective: ${value}`];
    }
    case 'theme':
      return null; // the .dark class bridge carries theme — never a var
    case 'elevation': {
      const dp = typeof lane === 'number' ? lane : ELEVATION_DP[lane as string];
      if (dp === undefined) return null;
      return [`--jx-elevation-effective: ${dp}`];
    }
    case 'motion': {
      const value = typeof lane === 'number' ? `${lane}` : `var(--jx-motion-${lane})`;
      return [`--jx-motion-effective: ${value}`];
    }
  }
}

/** fnv1a-32 — the deterministic instance id digest */
export function instanceId(seed: string): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(16).padStart(8, '0');
}

export interface DesugarCase {
  readonly key: string;
  readonly lane: string | number;
}

export interface DesugarResult {
  /** the emitted css (empty string when nothing is provable) */
  readonly css: string;
  /** the instance id (selector key) */
  readonly id: string;
  /** why nothing was emitted, when css is empty */
  readonly reason: 'no-axis' | 'dynamic' | 'theme-axis' | 'no-cases' | null;
}

/**
 * Desugar one literal call onto its instance selector. Emission
 * order is the REGISTERED-SCALE order (compareQueryKeys) — never raw
 * insertion order (§9's authoring-order-independence ruling).
 */
export function desugarQueryCall(
  axis: UniversalAxis | null,
  cases: readonly DesugarCase[],
  base: string | number | undefined,
  seed: string,
): DesugarResult {
  const id = instanceId(seed);
  if (axis === null) return { css: '', id, reason: 'no-axis' };
  if (axis === 'theme') return { css: '', id, reason: 'theme-axis' };
  const provable = cases
    .map((c): DesugarCase | null => {
      const parsed = parseQueryKey(c.key);
      if (parsed === null || parsed === 'empty-container-name') return null;
      return c;
    })
    .filter((c): c is DesugarCase => c !== null)
    .slice()
    .sort((a, b) => compareQueryKeys(a.key, b.key));
  if (provable.length === 0) return { css: '', id, reason: 'no-cases' };

  const selector = `[data-jx-q-${axis}='${id}']`;
  const blocks: string[] = [];
  for (const c of provable) {
    const parsed = parseQueryKey(c.key);
    if (parsed === null || parsed === 'empty-container-name') continue;
    const decls = carrierDeclarationsFor(axis, c.lane);
    if (decls === null || decls.length === 0) continue;
    const condition = `(min-width: ${parsed.minWidthRem}rem)`;
    const prelude =
      parsed.kind === 'media'
        ? `@media ${condition}`
        : parsed.containerName
          ? `@container ${parsed.containerName} ${condition}`
          : `@container ${condition}`;
    blocks.push(`${prelude} {\n  ${selector} {\n${decls.map((d) => `    ${d};`).join('\n')}\n  }\n}`);
  }
  if (blocks.length === 0) {
    // every case was unprovable at the declaration level — the base
    // still carries first paint at runtime; nothing to emit
    void base;
    return { css: '', id, reason: 'no-cases' };
  }
  return { css: blocks.join('\n'), id, reason: null };
}
