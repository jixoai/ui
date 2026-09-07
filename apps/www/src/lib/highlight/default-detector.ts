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
 */

import type { DetectResult, LanguageDetector } from './lang-detector';

// The sentinel rides this item's public surface (the r1-B4 edge-liveness
// law): consumers wiring the DLD import lang={AUTO_LANG} from the same
// module as the factory — one import site, one version of the truth, and
// a RUNTIME edge to the core contract item (import type alone erases and
// would leave the @jixoai/highlight registry edge dead).
export { AUTO_LANG } from './lang-detector';

/**
 * The default detector: `<CodeCard lang={AUTO_LANG} … />` with the DLD
 * wired as the context default (or an explicit langDetector prop).
 * Instances are stateless — create as many as you like.
 */
export function defaultLangDetector(): LanguageDetector {
  return {
    id: 'dld',
    async detect(input): Promise<DetectResult | null> {
      // L1 — the filename tables (only when a filename came along; a
      // miss keeps the waterfall going with the content layers)
      if (input.filename !== undefined) {
        const { detectByFilename } = await import('./detect-ext-table');
        const lang = detectByFilename(input.filename);
        if (lang !== null) return { lang, source: 'filename' };
      }

      // L2 — the first-line shebang / modeline
      const { detectByShebang } = await import('./detect-shebang-table');
      const shebang = detectByShebang(input.code);
      if (shebang !== null) return { lang: shebang, source: 'shebang' };

      // L3 — the structural probes (Markdown-guarded; never a
      // programming-language fingerprint)
      const { detectByStructure } = await import('./detect-structure');
      const structure = detectByStructure(input.code);
      if (structure !== null) return structure;

      // L4 — the betlang statistical layer (wasm, its own module).
      // The import is the waterfall's only wasm-bearing edge: reached
      // only when L1-L3 all answer null, so a filename/shebang/shape
      // hit never loads a byte of it (its bytes channel under vitest
      // is betlang-detector.spec.ts's own real-wasm suite).
      const { betlangDetector } = await import('./betlang-detector');
      return betlangDetector().detect(input);
    },
  };
}
