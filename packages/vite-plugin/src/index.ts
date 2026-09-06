// @jixoai/vite-plugin — the jixoai build-time features for vite 8.
//
// Intents (orthogonal count: 3):
//   1. `jixoai()` — THE umbrella entry wiring every
//      jixoai build-time feature. `ghostty` (the wasm supply) is the
//      first, default-on feature (owner request 2026-08-28: the consumer
//      remembers ONE name, features arrive as options under it). The
//      ghostty plugin itself stays an internal single-element Plugin[]
//      handling the three serving
//      faces frozen in design.md D3: dev middleware at
//      /@jixoai/ghostty-vt-<sha16>.wasm (application/wasm + immutable),
//      build-time emitFile with the content-addressed fileName
//      assets/ghostty-vt-<sha256[0..16]>.wasm from inside the virtual
//      module load() (ROLLUP_FILE_URL_<ref> placeholder), and the
//      server-consumer path that never emits.
//      `icons` (merge-alignment A1, 2026-08-29) is the second feature:
//      the unified SVG icon system migrated from @jixoai/ui-plugin,
//      default-OFF — without an `icons` option the plugin is not
//      registered, no files are read and no optional dependency is
//      loaded. Since icon-component-pipeline (2026-09-06, design §9)
//      the icons implementation is reachable ONLY through a thin
//      BRIDGE plugin: hooks (configResolved/buildStart/resolveId/load/
//      configureServer) memoize one dynamic
//      `import('./icons/vite-plugin.js')` and delegate, so jixoai()
//      stays sync (Plugin[] returned immediately) while provider/svgo/
//      lucide code never enters this entry's STATIC module graph (the
//      dist graph-purity gate parses real imports).
//   2. The `virtual:jixoai-ghostty` module (resolveId claim + \0 internal
//      id) exporting pure data {url, sha256, variant, buildInfo} — no
//      fetch/WebAssembly at module evaluation time (SSR/vitest safe).
//   3. Named-fix error surface (check-tw4-prereq style): resolution
//      failures tell the consumer exactly how to unblock.
//
// Owner original demand: 2026-08-28 "ghostty-term / packages/vite-plugin".
// merge-alignment A1 (2026-08-29): icons fold in as a feature option.

import type { Plugin } from 'vite';

import type { IconProviderFactory, SafetyCheckerConfig } from './icons/types.js';
import type { IconLibraryOptions } from './icons/library/types.js';
import type { IconPluginHooks, IconPluginOptions } from './icons/vite-plugin.js';
import {
  chunkIndexOf,
  classifyVirtualId,
  ICON_CHUNK_MODULE_PREFIX,
  ICON_LIBRARY_SENTINEL_ERROR,
  RESOLVED_CSS_ID,
  RESOLVED_JS_ID,
  isChunkModuleId,
} from './icons/ids.js';
import { readPin } from './pin.js';
import { resolveGhosttyWasm, type ResolvedGhosttyWasm, type ResolveGhosttyWasmOptions } from './resolve.js';

export { readPin, resolveGhosttyWasm };
export type { ResolvedGhosttyWasm, ResolveGhosttyWasmOptions };

export const VIRTUAL_MODULE_ID = 'virtual:jixoai-ghostty';
const RESOLVED_VIRTUAL_ID = `\0${VIRTUAL_MODULE_ID}`;

/**
 * Cheap shape gate for the dev middleware route. The exact path can only
 * be known after the wasm resolves (it is content-addressed by the pin
 * sha), but unrelated requests must never pay for — or be failed by —
 * that resolution, so the shape is checked first. Keep the
 * `/@jixoai/ghostty-vt-<16 hex>.wasm` spelling in sync with devServePath.
 */
const WASM_ROUTE_SHAPE = /^\/@jixoai\/ghostty-vt-[0-9a-f]{16}\.wasm$/;

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
function ghosttyPlugin(options: JixoaiGhosttyOptions): Plugin[] {
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
        // Named exports only (client.d.ts freezes that surface — no
        // default export).
        return [
          `export const url = ${urlExpression};`,
          `export const sha256 = ${JSON.stringify(wasm.sha256)};`,
          `export const variant = ${JSON.stringify(wasm.variant)};`,
          `export const buildInfo = ${JSON.stringify(wasm.buildInfo)};`,
        ].join('\n');
      },

      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const pathname = (req.url ?? '').split('?')[0]!;
          // Shape gate BEFORE resolving: unrelated routes must fall through
          // synchronously — never awaiting (or failing on) the wasm supply.
          if (!WASM_ROUTE_SHAPE.test(pathname)) {
            next();
            return;
          }
          void (async () => {
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

/**
 * `icons` feature options (merge-alignment A1; the library face arrives
 * with icon-component-pipeline A5). The safety config nests here — it
 * is no longer a top-level/global option (it scoped the icon
 * serializer, so it rides the feature that owns it) and serves BOTH
 * faces. ≥1 of provider|library is required (the design §1 matrix).
 */
export interface IconsPluginOptions {
  /**
   * the slot/CSS face's icon provider factory — awaited at build start
   * (see @jixoai/vite-plugin/icons). OPTIONAL since the library face:
   * a library-only config emits no CSS module content.
   */
  readonly provider?: IconProviderFactory;
  /**
   * the named-icon/library face (see IconLibraryOptions in
   * @jixoai/vite-plugin/icons): the icon-set artifact + virtual chunk
   * modules behind `<Icon name>` components.
   */
  readonly library?: IconLibraryOptions;
  /**
   * safety checker configuration (shared by both faces). defaults to
   * `{ mode: 'warn' }` — rejected icons serve the standard layer's
   * inline fallback (slot face) or drop with a named warning (library
   * face). pass `{ mode: 'error', … }` (and/or tighter limits) to fail
   * the build instead, e.g. for HTTP-sourced icons.
   */
  readonly safety?: SafetyCheckerConfig;
}

/**
 * the design §1 matrix startup error — byte-identical to the icons
 * sub-entry's MISSING_ICONS_FACES_ERROR (a test pins the two together;
 * the umbrella keeps its own copy because its entry must stay free of
 * static icons imports — design §9, the bridge owns the only path in)
 */
const MISSING_ICONS_FACES_ERROR =
  '[jixoai-icons] the icons option is configured but neither face is set — ' +
  'pass icons.provider (the slot/CSS face) and/or icons.library (the ' +
  'named-icon face); an empty icons object is not a configuration';

/**
 * The icons bridge (design §9): a thin proxy plugin keeping jixoai()
 * SYNC (Plugin[] returned immediately) while the icons/provider/svgo
 * graph stays out of this entry's static module graph. The hooks
 * memoize ONE dynamic `import('./icons/vite-plugin.js')` and delegate
 * to the real createIconPlugin() instance — behavior is
 * indistinguishable from the pre-bridge direct wiring. The import is
 * also kicked off eagerly so the delegate is warm before the first
 * dev-server tick; hook awaits resurface any failure.
 */
function iconsBridgePlugin(options: IconsPluginOptions): Plugin {
  // the delegate is held through its PLAIN-FUNCTION hook surface — the
  // vite Plugin type's ObjectHook unions are the container's business,
  // not the delegator's
  let delegate: IconPluginHooks | undefined;
  let pending: Promise<IconPluginHooks> | undefined;

  // exactOptionalPropertyTypes: keys are present only when configured
  const buildDelegateOptions = (): IconPluginOptions => ({
    ...(options.provider !== undefined ? { icons: options.provider } : {}),
    ...(options.library !== undefined ? { library: options.library } : {}),
    ...(options.safety !== undefined ? { safety: options.safety } : {}),
  });

  const ensureDelegate = (): Promise<IconPluginHooks> => {
    pending ??= import('./icons/vite-plugin.js').then((mod) => {
      delegate = mod.createIconPlugin(buildDelegateOptions());
      return delegate;
    });
    return pending;
  };
  // eager warm-up (validation errors resurface through hook awaits)
  void ensureDelegate().catch(() => undefined);

  return {
    name: 'jixoai-icons',
    enforce: 'pre',

    async configResolved(config) {
      (await ensureDelegate()).configResolved(config);
    },

    async buildStart() {
      await (await ensureDelegate()).buildStart();
    },

    resolveId(id, importer) {
      // SYNCHRONOUS claims for the icons feature's own virtual ids —
      // the id vocabulary is contract surface (ids.ts), so the frozen
      // sync resolveId surface survives the bridge. the chunk sentinel
      // also fires synchronously (an unwired overflow build fails by
      // name, never through vite's generic resolver).
      if (isChunkModuleId(id)) {
        if (options.library === undefined) {
          throw new Error(ICON_LIBRARY_SENTINEL_ERROR);
        }
        const index = chunkIndexOf(id);
        if (index !== null) return `\0${ICON_CHUNK_MODULE_PREFIX}${index}`;
        return null;
      }
      const kind = classifyVirtualId(id);
      if (kind !== null) {
        return kind === 'js' ? RESOLVED_JS_ID : RESOLVED_CSS_ID;
      }
      // everything else (the artifact-path claim) defers to the delegate
      return ensureDelegate().then((real) => real.resolveId(id, importer) ?? null);
    },

    async load(id) {
      return (await ensureDelegate()).load(id) ?? null;
    },

    configureServer(server) {
      void ensureDelegate()
        .then((real) => {
          real.configureServer(server);
        })
        .catch(() => undefined);
    },
  };
}

/**
 * `jixoai()` — THE umbrella entry. One call wires every jixoai build-time
 * feature; each feature is an option on this object (default-on where it
 * has no cost for projects that don't touch it — opting out is explicit;
 * default-off where activating it has a cost — opting in is explicit):
 *
 *   plugins: [sveltekit(), tailwindcss(), ...jixoai()]
 *   plugins: [sveltekit(), tailwindcss(), ...jixoai({ ghostty: { variant: 'small' } })]
 *   plugins: [sveltekit(), tailwindcss(), ...jixoai({ ghostty: false })]
 *   plugins: [sveltekit(), tailwindcss(), ...jixoai({ icons: { provider: lucideIconProvider() } })]
 *
 * The package is unpublished — `jixoaiGhostty()`/`jxUI()` never shipped,
 * so the unified surface lands without a compat shim (house law: bold
 * breaks).
 */
export interface JixoaiOptions {
  /**
   * The ghostty-vt wasm supply feature (dev serving + build emission +
   * the virtual:jixoai-ghostty module). Default: on. `false` opts out;
   * an object passes JixoaiGhosttyOptions through.
   */
  ghostty?: boolean | JixoaiGhosttyOptions;
  /**
   * The icon system feature (merge-alignment A1; the library face since
   * icon-component-pipeline): the slot/CSS face (provider factories +
   * serializer behind the `virtual:jixoai-icons` module) and/or the
   * named-icon face (`library` — the icon-set artifact + virtual chunk
   * modules). ≥1 of `provider` | `library` required. Default: `false`
   * — no plugin is registered, no files are read and no optional
   * dependency (opentype.js / wawoff2) is loaded unless an option
   * object opts in.
   */
  icons?: IconsPluginOptions | false;
}

export function jixoai(options: JixoaiOptions = {}): Plugin[] {
  const plugins: Plugin[] = [];
  const ghostty = options.ghostty ?? true;
  if (ghostty !== false) {
    plugins.push(...ghosttyPlugin(ghostty === true ? {} : ghostty));
  }
  if (options.icons !== false && options.icons !== undefined) {
    const icons = options.icons;
    // the design §1 matrix, enforced at startup: ≥1 of provider|library
    if (icons.provider === undefined && icons.library === undefined) {
      throw new Error(MISSING_ICONS_FACES_ERROR);
    }
    plugins.push(iconsBridgePlugin(icons));
  }
  return plugins;
}
