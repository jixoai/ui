/**
 * The language-detector contract (lib/highlight/lang-detector.ts,
 * highlight-lang-detector change, 2026-09-07).
 *
 * The detection counterpart of backend.ts: a detector answers "what
 * language is this code" for cards running lang={AUTO_LANG}; the
 * highlighted OUTPUT always comes from a HighlightBackend. Detection
 * is a cross-cutting capability — no engine owns it (highlight.js
 * ships highlightAuto, exposed through the backend's optional
 * `detector` slot; the DLD waterfall and betlang live in their own
 * registry items).
 *
 * THE RESOLUTION LAW (three rings + a non-ring tail, design D2.1):
 *   langDetector prop → HIGHLIGHT_DETECT_KEY context →
 *   backend.detector → runtime reject (install + wiring guidance).
 * NULL CASCADES: a ring resolving null is "no opinion" — the chain
 * falls through to the next ring (the complementary semantics); a
 * ring rejecting/throwing is TERMINAL — plain-text fallback + warn.
 * A successful detection whose lang the backend's curated set
 * rejects is ALSO terminal (the matrix failure law names the
 * covering engine; detectors are never retried).
 *
 * SSR/prerender: detection is an async runtime behavior — the
 * prerendered artifact stays plain text; the chain runs after
 * hydration at a card's first paint.
 */

/** the lang sentinel — STRICT equality (`lang === AUTO_LANG`), no trim,
 * case-sensitive: 'AUTO', ' auto ', 'auto\n' are ordinary lang values */
export const AUTO_LANG = 'auto';

/** which ring produced a detection (the DLD layers carry their own) */
export type DetectSource =
  | 'filename' // DLD L1: extension / basename table
  | 'shebang' // DLD L2: interpreter table / first-line modeline
  | 'structure' // DLD L3: structural probes
  | 'statistical' // DLD L4: betlang wasm
  | 'engine'; // engine-borne (hljs highlightAuto)

/** a detection result — lang is in the card's canonical namespace and
 * flows straight into the backend's own alias/curated/reject law */
export interface DetectResult {
  lang: string;
  source: DetectSource;
  /** 0..1 calibrated probability where the source provides one; out-of-
   * range/NaN values are DROPPED (treated as absent) at the boundary,
   * never clamped, never thrown */
  confidence?: number;
}

/** what a detector receives — the card's filename prop passes through
 * verbatim (path handling is the detector's business) */
export interface DetectInput {
  code: string;
  filename?: string;
}

/** the contract every detector implements */
export interface LanguageDetector {
  id: string;
  detect(input: DetectInput): Promise<DetectResult | null>;
}
