/**
 * Vendor ambient types for the betlang statistical detector
 * (lib/highlight/vendor-betlang-wasm.d.ts, highlight-lang-detector,
 * 2026-09-07 — the tree-sitter vendor pattern, single-asset edition).
 *
 * The DEFAULT browser wasmLoader in betlang-detector.ts hits one seam
 * nothing else types: the package wasm's `?url` import (vite's
 * asset-URL channel). apps/www references vite/client
 * (src/vite-env.d.ts), whose generic `*?url` wildcard would cover it,
 * but the REGISTRY tree's own type gates make no such assumption —
 * declaring the one EXACT specifier keeps both trees identical without
 * wildcard games (a specific declaration also beats any wildcard that
 * is present).
 */

declare module '@jixoai/betlang-wasm/dist/betlang_wasm.wasm?url' {
  const url: string;
  export default url;
}
