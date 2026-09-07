/**
 * @jixoai/vite-plugin/canvas — the canvas same-source PURE surface
 * (typography-context-and-parts §7, design F3).
 *
 * The extractor + the id vocabulary live behind this sub-entry so:
 *   - tests import the pure pipeline with NO vite plugin wiring (F3 —
 *     the vitest suites must never drag ghostty/wasm resolution in);
 *   - the root entry re-exports only `canvasPlugin` — the extractor
 *     itself stays reachable without it.
 *
 * The svelte/compiler parse rides a memoized dynamic import inside
 * extract.ts (the bridge law — design F1/F7), so importing this
 * sub-entry statically never pulls svelte into any entry chunk.
 */
export {
  extractCanvases,
  emitCanvasModule,
  dedentAndTrim,
  jsStringLiteral,
  CANVAS_ERROR_PREFIX,
} from './extract.js';
export type { CanvasExtraction, ExtractOptions } from './extract.js';

export {
  CANVAS_MODULE_PREFIX,
  canvasSpecifier,
  classifyCanvasId,
  isValidRouteRel,
} from './ids.js';
