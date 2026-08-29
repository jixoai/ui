//
// ghostty-term deferred dependency seam (registry/files/ui/ghostty-term/
// vt-deps.ts, 2026-08-28).
//
// Orthogonal intents (1): keep the two external module ids that are NOT
// resolvable in every compile context OUT of the component's transform
// unit, behind one relatively-resolvable module:
//   - `virtual:jixoai-ghostty` exists only where the vite plugin is
//     mounted (www build; never in the jsdom vitest config);
//   - `$lib/ghostty-vt` resolves in mirrored contexts (www src/lib) and
//     in consumer installs, but not in bare registry-source test runs.
// Vite statically analyzes THIS module wherever it is compiled with the
// plugin present (the virtual import is plugin-resolved and bundled);
// contexts that cannot resolve those ids mock this file instead — the
// mock intercepts before this module is ever fetched or transformed.
// The type-only import below is erased at compile time, so it never
// participates in module resolution.
//
// Owner original demand: 2026-08-28 "ghostty-term / Batch D (design.md D5)".
//

import type { GhosttyVT, LoadGhosttyVTOpts } from '$lib/ghostty-vt';

/** The plugin-served wasm asset URL (virtual:jixoai-ghostty `url`). */
export const virtualWasmUrl = (): Promise<string> =>
  import('virtual:jixoai-ghostty').then((module) => module.url);

/** Instantiate the wasm binding (delegates to loadGhosttyVT). */
export const loadVt = (opts: LoadGhosttyVTOpts): Promise<GhosttyVT> =>
  import('$lib/ghostty-vt').then((module) => module.loadGhosttyVT(opts));
