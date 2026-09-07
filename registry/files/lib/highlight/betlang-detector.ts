/**
 * The betlang statistical detector (lib/highlight/betlang-detector.ts,
 * highlight-lang-detector change, 2026-09-07) — the DLD waterfall's L4,
 * exported standalone: `betlangDetector()` is the direct statistical
 * opinion (skip L1-L3), the prop/context/plugin default and the L4
 * fallback both compose it (design D3.3/D4).
 *
 * CHANNEL (frozen, design D4 channel A): the wasm ships inside the
 * @jixoai/betlang-wasm npm package (betlang =0.1.1 from crates.io,
 * checksum-gated build — supply chain = consumer lockfile, the
 * tree-sitter law). This module owns NO wasm knowledge beyond the ABI's
 * label-index contract; the package's handwritten loader (no
 * wasm-bindgen) owns linear-memory UTF-8 and instantiation.
 *
 * WASM LOADING SEAM (single asset, two source shapes — the tree-sitter
 * four-quadrant seam's single-asset simplification, design D4):
 *
 *   wasmLoader() → { url }     fetchable URL (validated 2xx +
 *                              application/wasm by the package loader)
 *   wasmLoader() → { bytes }   raw bytes (Node/vitest default:
 *                              createRequire + readFile of the package
 *                              wasm — tests run REAL wasm, never a
 *                              mock; the browser default passes NO
 *                              source — the package's own new-URL
 *                              channel is the vite dev+build law)
 *
 * Omitted loader = the environment default above. One module-level
 * singleton per process (concurrent cards share the in-flight load;
 * failures clear the cache so the next detect retries); the FIRST
 * detector's channel wins for the process — inject the loader before
 * any other betlangDetector() paints to control it.
 *
 * LABEL LAW: the wasm returns betlang's 48-label enum INDEX (0..=47,
 * alphabetical, betlang 0.1.1's `Language` discriminants — the frozen
 * table below; bump it and the package's index.d.ts table together or
 * never). The index resolves to the model label (Rust Debug form, the
 * lang-canonical table's betlang= column spelling), the label to a
 * canonical id via lang-canonical's betlangLabelMap view (the D8.1
 * authoritative table's derived export — single source, this file
 * never re-encodes the mapping). A label ABSENT from the view (the
 * unmapped labels: gemfile/gemspec/vba/verilog/…) yields null — "no
 * opinion", the cascade law — plus a ONE-TIME warn per label per
 * process (Set-cached). An index outside the table (a future wasm) is
 * treated the same, keyed by the index.
 *
 * CONFIDENCE LAW: betlang's calibrated top-1 probability passes
 * through VERBATIM when finite and within 0..1; out-of-range/NaN
 * values are DROPPED (absent — never clamped, never thrown), per the
 * lang-detector.ts contract. A split distribution (ambiguous input)
 * still returns top-1 with its honest probability — consumers decide.
 *
 * filename is IGNORED (the statistical layer reads only code; filename
 * belongs to L1). Empty/whitespace/too-short input returns null (the
 * ABI's -1) — no opinion, not an error.
 */

import { loadBetlang, type BetlangWasmSource } from '@jixoai/betlang-wasm';

import { getBetlangLabelMap } from './lang-canonical';
import type { DetectResult, LanguageDetector } from './lang-detector';

/** re-exported so consumers can name the seam's source shape */
export type { BetlangWasmSource } from '@jixoai/betlang-wasm';

/** Options for the betlang detector factory. */
export interface BetlangDetectorOptions {
  /**
   * Take the wasm channel over: return `{ url }` (fetchable, validated
   * 2xx + `application/wasm` by the loader) or `{ bytes }` (the shape
   * Node/vitest tests use — read the package wasm directly). Omitted =
   * the environment default (browser: no source — the package's own
   * new-URL channel, vite dev+build; Node: createRequire + readFile).
   */
  wasmLoader?: () => Promise<BetlangWasmSource>;
}

/**
 * betlang 0.1.1's 48 model labels in ENUM-INDEX order (`Language`
 * discriminants, alphabetical), written in the Rust Debug form that
 * lang-canonical's betlang= column spells: the ABI contract between
 * the wasm and this module — index 37 is Rust, 43 TypeScript
 * (probe-verified 2026-09-07; mirrors packages/betlang-wasm's table).
 */
const BETLANG_LABELS: readonly string[] = [
  'Asm', // 0
  'Batch', // 1
  'C', // 2
  'Clojure', // 3
  'CMake', // 4
  'Cobol', // 5
  'Cpp', // 6
  'Cs', // 7
  'Css', // 8
  'Dart', // 9
  'Dockerfile', // 10
  'Elixir', // 11
  'Erlang', // 12
  'Gemfile', // 13
  'Gemspec', // 14
  'Go', // 15
  'Gradle', // 16
  'Groovy', // 17
  'Haskell', // 18
  'Html', // 19
  'Ini', // 20
  'Java', // 21
  'JavaScript', // 22
  'Json', // 23
  'Julia', // 24
  'Kotlin', // 25
  'Lisp', // 26
  'Lua', // 27
  'Markdown', // 28
  'ObjectiveC', // 29
  'Ocaml', // 30
  'Perl', // 31
  'Php', // 32
  'Powershell', // 33
  'Python', // 34
  'R', // 35
  'Ruby', // 36
  'Rust', // 37
  'Scala', // 38
  'Shell', // 39
  'Sql', // 40
  'Swift', // 41
  'Toml', // 42
  'TypeScript', // 43
  'Vba', // 44
  'Verilog', // 45
  'Xml', // 46
  'Yaml', // 47
];

/** Node detection at module scope — the browser branch must never
 * import node internals (bundlers stay out of `node:` specifiers via
 * the @vite-ignore dynamic imports below) */
const IS_NODE =
  typeof process !== 'undefined' &&
  typeof process.versions === 'object' &&
  process.versions !== null &&
  typeof process.versions.node === 'string';

/**
 * The environment default channel: Node/vitest read the package wasm
 * as bytes (createRequire + readFile — the resolution goes through the
 * package's `./dist/betlang_wasm.wasm` export); the browser passes NO
 * source and lets the package's own default channel run
 * (`new URL('./dist/betlang_wasm.wasm', import.meta.url)` — the
 * pattern vite's asset plugin rewrites in dev AND emits in build). A
 * literal `import('…wasm?url')` here would compile in build but break
 * vite DEV: the `?import`-rewritten request answers the raw binary and
 * the browser fails the ES-module parse (caught live on the docs
 * playground, 2026-09-07).
 */
function defaultWasmSource(): Promise<BetlangWasmSource | undefined> {
  if (IS_NODE) {
    return (async () => {
      // variable specifiers + @vite-ignore: only the Node branch runs
      // these; bundlers must not try to resolve node internals
      const moduleSpec = 'node:module';
      const fsSpec = 'node:fs/promises';
      const { createRequire } = (await import(/* @vite-ignore */ moduleSpec)) as typeof import('node:module');
      const { readFile } = (await import(/* @vite-ignore */ fsSpec)) as typeof import('node:fs/promises');
      const nodeRequire = createRequire(import.meta.url);
      const wasmPath = nodeRequire.resolve('@jixoai/betlang-wasm/dist/betlang_wasm.wasm');
      return { bytes: new Uint8Array(await readFile(wasmPath)) };
    })();
  }
  return Promise.resolve(undefined);
}

// ---------------------------------------------------------------------------
// the singleton (one wasm per process, failures clear for a retry)
// ---------------------------------------------------------------------------

let wasmPromise: ReturnType<typeof loadBetlang> | undefined;

function ensureWasm(loader: BetlangDetectorOptions['wasmLoader']): Promise<Awaited<ReturnType<typeof loadBetlang>>> {
  wasmPromise ??= (async () => loadBetlang(await (loader !== undefined ? loader() : defaultWasmSource())))().catch(
    (error: unknown) => {
      wasmPromise = undefined;
      throw error;
    },
  );
  return wasmPromise;
}

// ---------------------------------------------------------------------------
// label resolution (slug → canonical via lang-canonical's view)
// ---------------------------------------------------------------------------

/** the warn-once cache: one line per unmapped label per process */
const warnedLabels = new Set<string>();

function warnOnceUnmapped(key: string, detail: string): void {
  if (warnedLabels.has(key)) return;
  warnedLabels.add(key);
  console.warn(
    `[jixoai/highlight/betlang-detector] betlang detected ${detail} but it has no canonical mapping ` +
      '— returning null (the detection chain falls through; this warning prints once per label per process)',
  );
}

/**
 * Resolve a betlang model label (Rust Debug form) to a canonical id
 * through the authoritative table's derived view. `null` = unmapped —
 * the view carries only mapped labels, absence means the same thing.
 */
function canonicalOf(label: string): string | null {
  const mapped = getBetlangLabelMap().get(label);
  return mapped !== undefined ? mapped : null;
}

// ---------------------------------------------------------------------------
// the factory
// ---------------------------------------------------------------------------

/**
 * The betlang detector factory: `betlangDetector()` for the default
 * channel, `betlangDetector({ wasmLoader })` for full control (bytes
 * in tests, a CDN/intranet URL in the field). Instances are cheap
 * closures over the shared module-level wasm singleton.
 */
export function betlangDetector(options: BetlangDetectorOptions = {}): LanguageDetector {
  return {
    id: 'betlang',
    async detect(input): Promise<DetectResult | null> {
      const wasm = await ensureWasm(options.wasmLoader);
      const detection = wasm.detect(input.code);
      if (detection === null) return null; // empty/whitespace/too short — no opinion

      // string | undefined at RUNTIME (a wasm newer than this table can
      // return indices past its end — degrade to "no opinion", warn once)
      const label: string | undefined = BETLANG_LABELS[detection.labelIndex];
      if (label === undefined) {
        warnOnceUnmapped(`index:${detection.labelIndex}`, `label index ${detection.labelIndex}`);
        return null;
      }
      const canonical = canonicalOf(label);
      if (canonical === null) {
        warnOnceUnmapped(label, `label "${label}"`);
        return null;
      }

      const result: DetectResult = { lang: canonical, source: 'statistical' };
      const { confidence } = detection;
      if (Number.isFinite(confidence) && confidence >= 0 && confidence <= 1) {
        result.confidence = confidence; // verbatim — never clamped; out-of-range dropped
      }
      return result;
    },
  };
}
