/**
 * The DLD factory (lib/highlight/default-detector.ts,
 * highlight-lang-detector, 2026-09-07).
 *
 * defaultLangDetector() composes the four-layer waterfall of design D3 —
 * L1 filename → L2 shebang/modeline → L3 structure → L4 statistical —
 * where every layer is its OWN lazy module: `await import()` per layer,
 * a hit short-circuits, and the unselected layers never load a byte
 * (the short-circuit law; L1 answering means L2/L3/L4 stay untouched on
 * the wire). Layer answers map onto DetectSource directly:
 * filename / shebang / structure / statistical.
 *
 * The layers are pure no-opinion functions returning null on a miss;
 * THIS closure owns the waterfall semantics (order, short-circuit, the
 * DetectResult shape) and nothing else — no state, no cache (design D6:
 * no detection cache layer), so factories compose freely and each call
 * re-runs the chain. A filename only enters L1 (the card passes it
 * verbatim; L2-L4 are content layers and never look at it).
 *
 * THE TRACE CHANNEL (optional, additive — the detect contract is
 * unchanged): `defaultLangDetector({ onTrace })` gets ONE event per
 * EXECUTED layer with its outcome, a human-readable detail line, and
 * the layer's wall time. Layers after the hit are skipped silently
 * (they never ran — the short-circuit IS the trace's negative space;
 * render unreported layers as "skipped"). Built for the docs
 * playground's live detection log and ad-hoc debugging; the events are
 * advisory, never load-bearing.
 */

import type { DetectResult, LanguageDetector } from './lang-detector';

// The sentinel rides this item's public surface (the r1-B4 edge-liveness
// law): consumers wiring the DLD import lang={AUTO_LANG} from the same
// module as the factory — one import site, one version of the truth, and
// a RUNTIME edge to the core contract item (import type alone erases and
// would leave the @jixoai/highlight registry edge dead).
export { AUTO_LANG } from './lang-detector';

/** one EXECUTED layer's outcome — advisory, never load-bearing */
export interface DetectTraceEvent {
  /** which waterfall layer ran */
  layer: 'L1' | 'L2' | 'L3' | 'L4';
  /** hit = the layer answered (waterfall stops here); miss = no opinion */
  outcome: 'hit' | 'miss';
  /** the winning canonical id (hit only; a miss carries no lang) */
  lang?: string;
  /** human-readable one-liner: what was consulted, what answered */
  detail: string;
  /** the layer's wall time in milliseconds */
  ms: number;
}

/** Options for the default detector factory. */
export interface DefaultLangDetectorOptions {
  /**
   * Receive one event per executed layer (query → outcome, with detail
   * and timing). Omitted = zero overhead beyond a few clock reads;
   * the detect() return value is identical either way.
   */
  onTrace?: (event: DetectTraceEvent) => void;
}

/** wall-clock helper (performance.now when present, Date otherwise) */
function now(): number {
  return typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now();
}

/** the first line, trimmed, for L2's trace detail */
function firstLine(code: string): string {
  const line = code.split('\n', 1)[0] ?? '';
  return line.length > 40 ? `${line.slice(0, 40)}…` : line;
}

/**
 * The default detector: `<CodeCard lang={AUTO_LANG} … />` with the DLD
 * wired as the context default (or an explicit langDetector prop).
 * Instances are stateless — create as many as you like.
 */
export function defaultLangDetector(
  options: DefaultLangDetectorOptions = {},
): LanguageDetector {
  const trace = options.onTrace;
  return {
    id: 'dld',
    async detect(input): Promise<DetectResult | null> {
      // L1 — the filename tables (only when a filename came along; a
      // miss keeps the waterfall going with the content layers)
      if (input.filename !== undefined) {
        const t0 = now();
        const { detectByFilename } = await import('./detect-ext-table');
        const lang = detectByFilename(input.filename);
        trace?.({
          layer: 'L1',
          outcome: lang !== null ? 'hit' : 'miss',
          lang: lang ?? undefined,
          detail:
            lang !== null
              ? `filename '${input.filename}' answered in the extension/basename tables`
              : `filename '${input.filename}' has no extension/basename table entry`,
          ms: now() - t0,
        });
        if (lang !== null) return { lang, source: 'filename' };
      }

      // L2 — the first-line shebang / modeline
      {
        const t0 = now();
        const { detectByShebang } = await import('./detect-shebang-table');
        const shebang = detectByShebang(input.code);
        trace?.({
          layer: 'L2',
          outcome: shebang !== null ? 'hit' : 'miss',
          lang: shebang ?? undefined,
          detail:
            shebang !== null
              ? `first line '${firstLine(input.code)}' matched the interpreter/modeline table`
              : `first line '${firstLine(input.code)}' is no shebang and carries no modeline`,
          ms: now() - t0,
        });
        if (shebang !== null) return { lang: shebang, source: 'shebang' };
      }

      // L3 — the structural probes (Markdown-guarded; never a
      // programming-language fingerprint)
      {
        const t0 = now();
        const { detectByStructure } = await import('./detect-structure');
        const structure = detectByStructure(input.code);
        const lang = structure?.lang;
        trace?.({
          layer: 'L3',
          outcome: structure !== null ? 'hit' : 'miss',
          lang,
          detail:
            structure !== null
              ? `a structural probe answered (${structure.source})`
              : 'no XML/HTML/SVG/JSON/YAML/TOML/INI shape — and the markdown guard kept programming fingerprints out',
          ms: now() - t0,
        });
        if (structure !== null) return structure;
      }

      // L4 — the betlang statistical layer (wasm, its own module).
      // The import is the waterfall's only wasm-bearing edge: reached
      // only when L1-L3 all answer null, so a filename/shebang/shape
      // hit never loads a byte of it (its bytes channel under vitest
      // is betlang-detector.spec.ts's own real-wasm suite).
      {
        const t0 = now();
        const { betlangDetector } = await import('./betlang-detector');
        const result = await betlangDetector().detect(input);
        trace?.({
          layer: 'L4',
          outcome: result !== null ? 'hit' : 'miss',
          lang: result?.lang,
          detail:
            result !== null
              ? `betlang statistical top-1${result.confidence !== undefined ? ` (confidence ${result.confidence.toFixed(2)})` : ''}`
              : 'betlang answered no opinion (empty/too-short input, or an unmapped label)',
          ms: now() - t0,
        });
        return result;
      }
    },
  };
}
