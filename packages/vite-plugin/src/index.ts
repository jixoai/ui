// @jixoai/vite-plugin — the ghostty-vt wasm supply plugin for vite 8.
//
// Intents (orthogonal count: 3):
//   1. `jixoaiGhostty(options)` — one plugin handling the three serving
//      faces frozen in design.md D3: dev middleware at
//      /@jixoai/ghostty-vt-<sha16>.wasm (application/wasm + immutable),
//      build-time emitFile with the content-addressed fileName
//      assets/ghostty-vt-<sha256[0..16]>.wasm from inside the virtual
//      module load() (ROLLUP_FILE_URL_<ref> placeholder), and the
//      server-consumer path that never emits.
//   2. The `virtual:jixoai-ghostty` module (resolveId claim + \0 internal
//      id) exporting pure data {url, sha256, variant, buildInfo} — no
//      fetch/WebAssembly at module evaluation time (SSR/vitest safe).
//   3. Named-fix error surface (check-tw4-prereq style): resolution
//      failures tell the consumer exactly how to unblock.
//
// Owner original demand: 2026-08-28 "ghostty-term / packages/vite-plugin".

import type { Plugin } from 'vite';

import { readPin } from './pin';
import { resolveGhosttyWasm, type ResolvedGhosttyWasm, type ResolveGhosttyWasmOptions } from './resolve';

export { readPin, resolveGhosttyWasm };
export type { ResolvedGhosttyWasm, ResolveGhosttyWasmOptions };

export const VIRTUAL_MODULE_ID = 'virtual:jixoai-ghostty';
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_MODULE_ID}`;

export interface JixoaiGhosttyOptions extends ResolveGhosttyWasmOptions {}

/** dev middleware path (content-addressed so immutable caching is sound) */
export function devServePath(sha256: string): string {
  return `/@jixoai/ghostty-vt-${sha256.slice(0, 16)}.wasm`;
}

/** build asset fileName (rollup [hash] is NOT the pin sha — we name it) */
export function assetFileName(sha256: string): string {
  return `assets/ghostty-vt-${sha256.slice(0, 16)}.wasm`;
}

/**
 * The jixoai ghostty wasm plugin. Returns a single-element Plugin[]
 * (kept as an array so future middleware siblings ship without a
 * breaking re-export).
 */
export function jixoaiGhostty(options: JixoaiGhosttyOptions = {}): Plugin[] {
  let resolved: ResolvedGhosttyWasm | undefined;
  // emitFile with an explicit duplicate fileName is a hard rollup error;
  // the referenceId is memoized per environment graph (SvelteKit builds
  // client and server environments through the same plugin instance).
  const emittedByEnvironment = new Map<string, string>();

  const resolveOnce = async (): Promise<ResolvedGhosttyWasm> => {
    resolved ??= await resolveGhosttyWasm(options).catch((err: Error) => {
      throw new Error(`[jixoai-ghostty] WASM RESOLVE FAILED — ${err.message}`);
    });
    return resolved;
  };

  return [
    {
      name: 'jixoai-ghostty',

      async buildStart() {
        await resolveOnce();
      },

      resolveId(id) {
        if (id === VIRTUAL_MODULE_ID) return RESOLVED_VIRTUAL_ID;
        return null;
      },

      async load(id) {
        if (id !== RESOLVED_VIRTUAL_ID) return null;
        const wasm = await resolveOnce();
        const environment = this.environment;
        const consumer = environment?.config.consumer;
        const command = environment?.config.command;

        let urlExpression: string;
        if (command === 'build' && consumer !== 'server') {
          // Client (or other asset-emitting) build: emit inside load() so
          // the placeholder resolves against the final relative URL.
          const key = environment?.name ?? 'build';
          let referenceId = emittedByEnvironment.get(key);
          if (referenceId === undefined) {
            referenceId = this.emitFile({
              type: 'asset',
              fileName: assetFileName(wasm.sha256),
              source: wasm.bytes,
            });
            emittedByEnvironment.set(key, referenceId);
          }
          urlExpression = `import.meta.ROLLUP_FILE_URL_${referenceId}`;
        } else if (consumer === 'server') {
          // Server consumers never emit client assets; url carries the
          // would-be asset name (the field is unused server-side).
          urlExpression = JSON.stringify(assetFileName(wasm.sha256));
        } else {
          // Dev serve: hand the middleware path.
          urlExpression = JSON.stringify(devServePath(wasm.sha256));
        }

        // Pure data module: nothing here touches fetch or WebAssembly.
        return [
          `export const url = ${urlExpression};`,
          `export const sha256 = ${JSON.stringify(wasm.sha256)};`,
          `export const variant = ${JSON.stringify(wasm.variant)};`,
          `export const buildInfo = ${JSON.stringify(wasm.buildInfo)};`,
          `export default { url, sha256, variant, buildInfo };`,
        ].join('\n');
      },

      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          void (async () => {
            const pathname = (req.url ?? '').split('?')[0]!;
            let wasm: ResolvedGhosttyWasm;
            try {
              wasm = await resolveOnce();
            } catch (err) {
              res.statusCode = 500;
              res.end(`[jixoai-ghostty] WASM RESOLVE FAILED — ${(err as Error).message}`);
              return;
            }
            if (pathname !== devServePath(wasm.sha256)) {
              next();
              return;
            }
            res.setHeader('Content-Type', 'application/wasm');
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
            res.end(wasm.bytes);
          })().catch(next);
        });
      },
    },
  ];
}
