/**
 * The tree-sitter highlight backend (lib/highlight/tree-sitter.ts,
 * highlight-engine-matrix, 2026-09-06).
 *
 * A MARKUP backend — the query-based heavyweight of the engine matrix:
 * web-tree-sitter parses the sample into a real syntax tree, the
 * MIT-licensed highlight queries captured from the grammar packages
 * (embedded verbatim in tree-sitter-queries.ts) are executed against
 * that tree, and the captures become token spans
 * (`<span style="color:var(--tok-token-*)">`) written to innerHTML —
 * the inline-code rendering precedent, so the paint survives the print
 * pipeline's freeze clone like shiki's and prism's does.
 *
 * OUTPUT MODEL (capture → span): query captures arrive as named ranges
 * over the source; captures whose name has no entry in the token map
 * below are skipped COLORLESS, overlapping captures resolve to the
 * SHORTER range (the more specific node), and every source slice is
 * entity-escaped before it lands in markup.
 *
 * ASSET CHANNEL (npm-asset): every wasm — the core runtime and the
 * three grammars — ships inside the npm packages this item declares
 * (web-tree-sitter@^0.27.0, tree-sitter-typescript@^0.23.2,
 * tree-sitter-javascript@^0.23.1), emitted by the consumer's bundler
 * via four LITERAL dynamic `?url` imports (vite forbids runtime-assembled
 * specifiers; the static map below is the whole surface). Supply chain =
 * lockfile. `wasmBase` re-prefixes every asset onto a self-hosted base;
 * `wasmLoader` takes the channel over completely (URL or bytes).
 *
 * ABI WINDOW: grammar wasm from the 0.23.x packages builds at ABI 14,
 * inside web-tree-sitter 0.27's support window (MIN_COMPATIBLE_VERSION
 * 13 … LANGUAGE_VERSION 15 — read live off the initialized runtime).
 * The contract test REALLY initializes core + grammars + query from
 * node_modules bytes and asserts the loaded abiVersion sits in that
 * window, so an ABI drift breaks the build instead of painting plain.
 *
 * WASM LOADING SEAM (per-asset, two source shapes — .d.ts-verified):
 *
 *   source shape   core                          grammar
 *   ------------   ---------------------------   ----------------------
 *   {url}          Parser.init({ locateFile })   Language.load(url)
 *   {bytes}        Parser.init({ wasmBinary })   Language.load(bytes)
 *
 * (`Language.load` accepts string | URL | Uint8Array natively; the JS
 * module is itself a dynamic import — nothing of tree-sitter joins the
 * page until a treeSitter()-backed card actually paints, the engine-
 * minisearch lazy law. The embedded query constants are backend SOURCE,
 * not a downloadable unit — they ride the item itself.)
 *
 * SINGLETONS: one module-level core init promise (a failed init clears
 * the cache so the next paint retries — the shiki facade hardening
 * law) and one promise per grammar id (concurrent paints share the
 * in-flight load; failures clear; jsx needs no wasm of its own — it
 * IS the javascript grammar). Already-loaded grammars are never
 * re-fetched by later instances.
 *
 * THEME SEMANTICS (per-backend mapping): 'jixoai'/undefined → the
 * embedded --tok-token-* palette below (the spans ARE the theme);
 * any other name warns and stays jixoai — tree-sitter queries carry
 * structure, not colors, so there is nothing else to map onto.
 *
 * LANGUAGES: curated = typescript/tsx/javascript/jsx (jsx is the
 * javascript grammar's native dialect — alias, not a separate wasm);
 * ts/mts/cts/js/mjs/cjs aliases canonicalize like shiki's table;
 * anything else rejects with a hint — the card's plain-text fallback
 * law.
 */

import { canonicalLang, requestedLang, type HighlightBackend } from './backend';
import {
  JAVASCRIPT_HIGHLIGHTS_QUERY,
  JAVASCRIPT_JSX_HIGHLIGHTS_QUERY,
  TYPESCRIPT_HIGHLIGHTS_QUERY,
} from './tree-sitter-queries';

// ---------------------------------------------------------------------------
// the wasm loading seam (design D5, frozen)
// ---------------------------------------------------------------------------

/** one wasm this backend ever needs: the core runtime or a grammar */
export type WasmAsset = { kind: 'core' } | {
  kind: 'grammar';
  id: 'typescript' | 'tsx' | 'javascript';
};

/** how a loader hands that wasm over: a fetchable URL or raw bytes */
export type WasmSource = { url: string } | { bytes: Uint8Array };

/** Options for the tree-sitter backend factory. */
export interface TreeSitterBackendOptions {
  /**
   * Restrict THIS instance to a grammar subset (alias or canonical ids;
   * canonicalized on construction). Omitted = the full curated set
   * (typescript/tsx/javascript/jsx). A request outside the set rejects
   * with a hint — the card's plain-text fallback law takes over. The
   * shared grammar caches are never mutated: instances compose freely.
   */
  langs?: readonly string[];
  /**
   * Prefix every wasm URL onto a self-hosted base (own CDN, an
   * intranet mirror): resolves to `{ url: \`\${base}\${basename}\` }`
   * for the core runtime AND every grammar. A missing trailing '/' is
   * normalized. Ignored when `wasmLoader` is injected (loader wins
   * outright).
   */
  wasmBase?: string;
  /**
   * Take the whole wasm channel over (byte-level control): called for
   * the core asset once and each grammar asset once per process.
   * Return `{ bytes }` to hand over file/ArrayBuffer contents (the
   * shape the contract tests use — node reads node_modules directly)
   * or `{ url }` to point at any fetchable location.
   */
  wasmLoader?: (asset: WasmAsset) => Promise<WasmSource>;
}

/** the lazily imported engine module — its JS is a downloadable unit too */
type Engine = typeof import('web-tree-sitter');

/** a capture the query engine produced (name + the captured node) */
type EngineCapture = ReturnType<Engine['Query']['prototype']['captures']>[number];

/** the wasm basenames keyed by asset (the `wasmBase` sugar appends these) */
const WASM_BASENAME = {
  core: 'web-tree-sitter.wasm',
  typescript: 'tree-sitter-typescript.wasm',
  tsx: 'tree-sitter-tsx.wasm',
  javascript: 'tree-sitter-javascript.wasm',
} as const;

type WasmKey = keyof typeof WASM_BASENAME;

/**
 * The default browser loader — a LITERAL static import map (vite law:
 * `?url` specifiers must be analyzable strings, never concatenated).
 * Each thunk only runs when its asset is first needed, so the wasms
 * land in lazy chunks, never in the entry.
 */
const DEFAULT_WASM_URL: Record<WasmKey, () => Promise<string>> = {
  core: () => import('web-tree-sitter/web-tree-sitter.wasm?url').then((m) => m.default),
  typescript: () =>
    import('tree-sitter-typescript/tree-sitter-typescript.wasm?url').then((m) => m.default),
  tsx: () => import('tree-sitter-typescript/tree-sitter-tsx.wasm?url').then((m) => m.default),
  javascript: () =>
    import('tree-sitter-javascript/tree-sitter-javascript.wasm?url').then((m) => m.default),
};

// ---------------------------------------------------------------------------
// languages, grammars, queries
// ---------------------------------------------------------------------------

/** the curated language set — jsx is the javascript grammar's native dialect */
const CURATED_LANGS = ['typescript', 'tsx', 'javascript', 'jsx'] as const;

type CuratedLang = (typeof CURATED_LANGS)[number];

const CURATED_SET: ReadonlySet<string> = new Set(CURATED_LANGS);

/** alias → canonical id (mirrors lib/shiki.ts's table for these langs) */
const langAliases: Record<string, string> = {
  ts: 'typescript',
  mts: 'typescript',
  cts: 'typescript',
  js: 'javascript',
  mjs: 'javascript',
  cjs: 'javascript',
};

/** each curated lang's grammar wasm (jsx has no wasm of its own) */
const GRAMMAR_OF: Record<CuratedLang, 'typescript' | 'tsx' | 'javascript'> = {
  typescript: 'typescript',
  tsx: 'tsx',
  javascript: 'javascript',
  jsx: 'javascript',
};

/**
 * The composed highlight query per GRAMMAR (probe-verified against
 * QueryError: a query may only reference node types its grammar has —
 * see tree-sitter-queries.ts's composition law). The typescript
 * package's highlights.scm is a TS SUPPLEMENT over the javascript
 * package's base query; the JSX query only parses against tsx and
 * javascript grammars.
 */
const QUERY_SOURCE: Record<'typescript' | 'tsx' | 'javascript', string> = {
  typescript: `${JAVASCRIPT_HIGHLIGHTS_QUERY}\n\n${TYPESCRIPT_HIGHLIGHTS_QUERY}`,
  tsx: `${JAVASCRIPT_HIGHLIGHTS_QUERY}\n\n${TYPESCRIPT_HIGHLIGHTS_QUERY}\n\n${JAVASCRIPT_JSX_HIGHLIGHTS_QUERY}`,
  javascript: `${JAVASCRIPT_HIGHLIGHTS_QUERY}\n\n${JAVASCRIPT_JSX_HIGHLIGHTS_QUERY}`,
};

// ---------------------------------------------------------------------------
// the singletons (core init + per-grammar loads)
// ---------------------------------------------------------------------------

/** one core init per process — failures clear the cache for a retry */
let corePromise: Promise<Engine> | undefined;

function initEngine(loadWasm: (asset: WasmAsset) => Promise<WasmSource>): Promise<Engine> {
  corePromise ??= (async () => {
    const engine: Engine = await import('web-tree-sitter');
    const source = await loadWasm({ kind: 'core' });
    if ('bytes' in source) {
      await engine.Parser.init({ wasmBinary: source.bytes });
    } else {
      await engine.Parser.init({ locateFile: () => source.url });
    }
    return engine;
  })().catch((error: unknown) => {
    corePromise = undefined;
    throw error;
  });
  return corePromise;
}

/** a loaded grammar: the Language plus its compiled highlight Query */
interface LoadedGrammar {
  engine: Engine;
  language: InstanceType<Engine['Language']>;
  query: InstanceType<Engine['Query']>;
}

/**
 * One promise per grammar id — the prismjs loadOnce pattern taken to
 * its logical end: the promise itself is the cache (concurrent paints
 * share the in-flight load, successes persist for later instances,
 * failures delete themselves so the next paint retries).
 */
const grammarCache = new Map<'typescript' | 'tsx' | 'javascript', Promise<LoadedGrammar>>();

function ensureGrammar(
  lang: CuratedLang,
  loadWasm: (asset: WasmAsset) => Promise<WasmSource>,
): Promise<LoadedGrammar> {
  const grammarId = GRAMMAR_OF[lang];
  const cached = grammarCache.get(grammarId);
  if (cached !== undefined) return cached;
  const promise: Promise<LoadedGrammar> = (async () => {
    const engine = await initEngine(loadWasm);
    const source = await loadWasm({ kind: 'grammar', id: grammarId });
    const language =
      'bytes' in source
        ? await engine.Language.load(source.bytes)
        : await engine.Language.load(source.url);
    const query = new engine.Query(language, QUERY_SOURCE[grammarId]);
    return { engine, language, query };
  })().catch((error: unknown) => {
    grammarCache.delete(grammarId);
    throw error;
  });
  grammarCache.set(grammarId, promise);
  return promise;
}

// ---------------------------------------------------------------------------
// capture → span (the token map, overlap law, escaping)
// ---------------------------------------------------------------------------

/**
 * Capture name → --tok-token-* slot. The jixoai palette carries a
 * REDUCED token vocabulary (keyword/string/comment/function/constant/
 * parameter/punctuation/link + diff slots) — tree-sitter's finer names
 * land on the SEMANTICALLY NEAREST slot (the 就近 rule, per entry
 * below); names with no sensible slot (@variable, @property, @embedded)
 * stay COLORLESS and are skipped. A Map, not an object literal:
 * 'constructor' is a real capture name and would find
 * Object.prototype.constructor on a bare record (probe-verified 2026-09-06).
 */
const TOKEN_OF = new Map<string, string>([
  ['keyword', 'keyword'],
  ['string', 'string'],
  ['string.special', 'string'], // regexes paint like strings
  ['comment', 'comment'],
  ['function', 'function'],
  ['function.builtin', 'function'], // require
  ['function.call', 'function'],
  ['function.method', 'function'],
  ['type', 'constant'], // no type slot — types park on the constant tone
  ['type.builtin', 'constant'], // string/number/boolean builtin types
  ['constructor', 'constant'], // capitalized identifiers, @type's family
  ['number', 'constant'],
  ['constant', 'constant'],
  ['constant.builtin', 'constant'], // true/false/null/undefined
  ['variable.parameter', 'parameter'],
  ['variable.builtin', 'keyword'], // this/super — keyword behavior
  ['tag', 'keyword'], // JSX tags; no tag slot — structural, keyword-adjacent
  ['attribute', 'parameter'], // JSX attributes ≈ named parameters
  ['punctuation.bracket', 'punctuation'],
  ['punctuation.delimiter', 'punctuation'],
  ['punctuation.special', 'punctuation'], // ${ and } of substitutions
  ['operator', 'punctuation'], // no operator slot; symbols render muted
]);

/** exact name first, then the dotted base (`function.method` → `function`) */
function tokenOfCapture(name: string): string | undefined {
  const exact = TOKEN_OF.get(name);
  if (exact !== undefined) return exact;
  return TOKEN_OF.get(name.split('.')[0] ?? name);
}

/** one resolved, non-overlapping token range over the source */
interface PaintSpan {
  start: number;
  end: number;
  token: string;
}

/**
 * Overlap law: where captures overlap the SHORTER range wins (the more
 * specific node — `${`/`}` punctuation inside a template string); the
 * longer capture keeps painting whatever of itself remains UNCOVERED
 * (subtraction painting, so a template string keeps its string color
 * around its substitution punctuation instead of losing it wholesale).
 * Between equal-length captures the LATER one wins (these queries list
 * generic patterns before specific ones). One ascending-length pass
 * over sorted candidates implements exactly that: every placed atom
 * belongs to the shortest candidate covering it.
 */
function resolveSpans(captures: readonly EngineCapture[]): PaintSpan[] {
  const candidates: (PaintSpan & { order: number })[] = [];
  for (let order = 0; order < captures.length; order++) {
    const capture = captures[order];
    if (capture === undefined) continue;
    const token = tokenOfCapture(capture.name);
    if (token === undefined) continue; // colorless capture
    const { startIndex: start, endIndex: end } = capture.node;
    if (end <= start) continue; // zero-width
    candidates.push({ start, end, token, order });
  }
  candidates.sort(
    (a, b) => a.end - a.start - (b.end - b.start) || b.order - a.order,
  );
  const placed: PaintSpan[] = [];
  for (const candidate of candidates) {
    // subtract everything already placed from this candidate; the
    // leftover pieces join the paint under the candidate's token
    let pieces: PaintSpan[] = [{ ...candidate }];
    for (const span of placed) {
      const next: PaintSpan[] = [];
      for (const piece of pieces) {
        if (span.end <= piece.start || span.start >= piece.end) {
          next.push(piece); // no overlap with this placed span
          continue;
        }
        if (span.start > piece.start) next.push({ ...piece, end: span.start });
        if (span.end < piece.end) next.push({ ...piece, start: span.end });
      }
      pieces = next;
    }
    for (const piece of pieces) {
      if (piece.end > piece.start) placed.push(piece);
    }
  }
  placed.sort((a, b) => a.start - b.start);
  return placed;
}

const HTML_ESCAPES = new Map<string, string>([
  ['&', '&amp;'],
  ['<', '&lt;'],
  ['>', '&gt;'],
  ['"', '&quot;'],
  ["'", '&#39;'],
]);

/** source slices are entity-escaped before they enter innerHTML */
function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => HTML_ESCAPES.get(ch) ?? ch);
}

/** the markup paint: escaped gaps + token spans, byte-covering the source */
function paintHtml(source: string, spans: readonly PaintSpan[]): string {
  let html = '';
  let cursor = 0;
  for (const span of spans) {
    if (span.start < cursor) continue; // defensive; resolver emits disjoint spans
    html += escapeHtml(source.slice(cursor, span.start));
    html += `<span style="color:var(--tok-token-${span.token})">${escapeHtml(
      source.slice(span.start, span.end),
    )}</span>`;
    cursor = span.end;
  }
  return html + escapeHtml(source.slice(cursor));
}

// ---------------------------------------------------------------------------
// the factory
// ---------------------------------------------------------------------------

/**
 * The tree-sitter backend factory:
 * `<CodeCard backend={treeSitter()} />`, `treeSitter({ langs: ['tsx'] })`,
 * `treeSitter({ wasmBase: '/cdn/wasm/' })` or a fully injected
 * `treeSitter({ wasmLoader })`. Instances are cheap closures over the
 * shared module-level singletons (core init, per-grammar loads) —
 * create as many as you like.
 */
export function treeSitter(options: TreeSitterBackendOptions = {}): HighlightBackend {
  const allowed =
    options.langs === undefined
      ? undefined
      : new Set(options.langs.map((lang) => canonicalLang(langAliases, lang)));
  const wasmLoader = options.wasmLoader;
  const wasmBase = options.wasmBase;
  /** this instance's asset channel: injected loader > base prefix > the static URL map */
  const loadWasm = (asset: WasmAsset): Promise<WasmSource> => {
    if (wasmLoader !== undefined) return wasmLoader(asset);
    const key: WasmKey = asset.kind === 'core' ? 'core' : asset.id;
    if (wasmBase !== undefined) {
      // a missing trailing '/' is normalized away (final review B4)
      const base = wasmBase.endsWith('/') ? wasmBase : `${wasmBase}/`;
      return Promise.resolve({ url: `${base}${WASM_BASENAME[key]}` });
    }
    return DEFAULT_WASM_URL[key]().then((url) => ({ url }));
  };
  return {
    id: 'tree-sitter',
    async highlight(el, code, opts) {
      const lang = canonicalLang(langAliases, requestedLang(opts));
      if (!CURATED_SET.has(lang)) {
        throw new Error(
          `[jixoai/highlight/tree-sitter] no grammar for "${lang}" — this backend ships: ` +
            `${CURATED_LANGS.join(', ')} (use the shiki backend for other languages)`,
        );
      }
      if (allowed !== undefined && !allowed.has(lang)) {
        throw new Error(
          `[jixoai/highlight/tree-sitter] lang "${lang}" is outside this instance's langs set ` +
            `(allowed: ${[...allowed].join(', ')}) — widen treeSitter({ langs: [...] }) ` +
            `or use an unrestricted treeSitter()`,
        );
      }
      if (opts.theme !== undefined && opts.theme !== 'jixoai') {
        console.warn(
          `[jixoai/highlight/tree-sitter] no theme "${opts.theme}" — staying jixoai ` +
            `(this backend paints the --tok-token-* palette only)`,
        );
      }
      const grammar = await ensureGrammar(lang as CuratedLang, loadWasm);
      const parser = new grammar.engine.Parser();
      try {
        parser.setLanguage(grammar.language);
        const tree = parser.parse(code);
        if (tree === null) {
          throw new Error('[jixoai/highlight/tree-sitter] the parser produced no tree');
        }
        try {
          el.innerHTML = paintHtml(code, resolveSpans(grammar.query.captures(tree.rootNode)));
        } finally {
          tree.delete();
        }
      } finally {
        parser.delete();
      }
    },
  };
}
