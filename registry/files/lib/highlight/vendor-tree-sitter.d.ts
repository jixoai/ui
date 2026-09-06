/**
 * Vendor ambient types for the tree-sitter highlight backend
 * (lib/highlight/vendor-tree-sitter.d.ts, highlight-engine-matrix,
 * 2026-09-06 — per-engine vendor surface, the prismjs/microlighter
 * pattern).
 *
 * Two seams the backend's imports hit that nothing else types:
 *
 *  1. The four wasm `?url` imports (vite's asset-URL channel — the
 *     DEFAULT_WASM_URL static map in tree-sitter.ts). apps/www
 *     references vite/client (src/vite-env.d.ts), whose generic
 *     `*?url` wildcard would cover them, but the REGISTRY tree's own
 *     type gates make no such assumption — declaring the four EXACT
 *     specifiers keeps both trees identical without wildcard games
 *     (specific declarations also beat any wildcard that is present).
 *
 *  2. web-tree-sitter.d.ts types Parser.init's argument as
 *     Partial<EmscriptenModule>, leaving EmscriptenModule to
 *     @types/emscripten — a devDependency of the PUBLISHER, not
 *     something consumers get. The global interface below declares
 *     exactly the two members the backend's two core quadrants use,
 *     turning that seam into a checked surface (skipLibCheck hides the
 *     dangling reference; this makes it resolve).
 */

declare module 'web-tree-sitter/web-tree-sitter.wasm?url' {
  const url: string;
  export default url;
}

declare module 'tree-sitter-typescript/tree-sitter-typescript.wasm?url' {
  const url: string;
  export default url;
}

declare module 'tree-sitter-typescript/tree-sitter-tsx.wasm?url' {
  const url: string;
  export default url;
}

declare module 'tree-sitter-javascript/tree-sitter-javascript.wasm?url' {
  const url: string;
  export default url;
}

interface EmscriptenModule {
  /** remap auxiliary files (the core wasm) onto a fetchable URL — the {url} core quadrant */
  locateFile?: (path: string, scriptDirectory: string) => string;
  /** hand the core wasm bytes straight to the runtime — the {bytes} core quadrant */
  wasmBinary?: ArrayBuffer | Uint8Array;
}
