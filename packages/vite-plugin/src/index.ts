// @jixoai/ui-vite-plugin — the jixoai build-time features for vite 8.
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
//      transform/configureServer) memoize one dynamic
//      `import('./icons/vite-plugin.js')` and delegate, so jixoai()
//      stays sync (Plugin[] returned immediately) while provider/svgo/
//      lucide code never enters this entry's STATIC module graph (the
//      dist graph-purity gate parses real imports). `transform` joined
//      the delegated set with icon-prefix-compiler (2026-09-07): the
//      umbrella consumer must get the dev scanner, never silently
//      lose it — the hook rides the SAME memoized dynamic import.
//   2. The `virtual:jixoai-ghostty` module (resolveId claim + \0 internal
//      id) exporting pure data {url, sha256, variant, buildInfo} — no
//      fetch/WebAssembly at module evaluation time (SSR/vitest safe).
//   3. `spinners` (spin-ora-svg-lane, 2026-09-11) is the third feature:
//      the svg-spinner set (vendored blocks-wave + custom sources →
//      spin-set.gen.ts). Default-OFF like icons — the DEFAULT artifact
//      is plugin-free; opting in costs only a build-start generator +
//      drift-warner. The spinners face is SMALL and PURE (no svgo, no
//      lucide, no providers), so it is wired DIRECTLY (a static import)
//      — no bridge needed: the dist graph-purity gate pins exactly ONE
//      dynamic import (the icons bridge) and this graph adds none
//      (openspec spin-ora-svg-lane design §5).
//   4. Named-fix error surface (check-tw4-prereq style): resolution
//      failures tell the consumer exactly how to unblock.
//   5. `stylex` (stylex-kernel phase 0, 2026-09-15) is the fourth
//      feature: the StyleX engine wiring, build-side ONLY (F11 —
//      registry consumers never owe @stylexjs/*). Default-OFF like
//      icons/spinners. Like icons it rides a BRIDGE (memoized dynamic
//      import of ./stylex/vite-plugin.js) so the engine graph (babel
//      ×20 + lightningcss + browserslist) stays out of this entry's
//      static module graph; the bridge owns registration shape (the
//      official example-sveltekit `enforce: undefined` plugin-order
//      trick) and the delegate owns the kernel-scope gate, the F9
//      canonical layer law, and the css-entry trap warning (see
//      src/stylex/vite-plugin.ts header). The dist graph-purity gate
//      now pins TWO dynamic imports: the icons bridge and this one.
//
// Owner original demand: 2026-08-28 "ghostty-term / packages/vite-plugin".
// merge-alignment A1 (2026-08-29): icons fold in as a feature option.

import type { Plugin } from 'vite';

import type { IconProviderFactory, SafetyCheckerConfig } from './icons/types.js';
import type { IconLibraryOptions } from './icons/library/types.js';
import type { IconPluginHooks, IconPluginOptions } from './icons/vite-plugin.js';
import type { SpinnersPluginOptions } from './spinners/types.js';
import type {
  StylexEngineContext,
  StylexEngineHooks,
  StylexHookContext,
  StylexTransformContext,
} from './stylex/vite-plugin.js';
import { createSpinnersPlugin } from './spinners/vite-plugin.js';
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

// the canvas same-source feature (typography-context-and-parts §7) —
// STANDALONE by design (F3): never a jixoai() option, so the vitest
// wiring cannot drag ghostty/wasm resolution in. The plugin module
// statically imports only the pure extractor, whose svelte/compiler
// parse rides a memoized dynamic import (the bridge law) — this entry
// chunk stays svelte-free either way (F1/F7).
export { canvasPlugin } from './canvas/vite-plugin.js';

// the F9 canonical layer law — ONE source (layer-law.ts), part of the
// public surface so the payload tooling (phase 0 P0.4) and the
// verification probes read the same bytes the plugin bakes (Gate-2
// P1-1: the statement is dynamic over the css's highest priority tier,
// and the tiers nest under `components` — see layer-law.ts)
export {
  CANONICAL_STATEMENT_PATTERN,
  canonicalLayerStatement,
  countCanonicalStatements,
  maxStylexPriority,
  parseCanonicalStatement,
  stripCanonicalStatements,
  STYLEX_LAYERS_AFTER,
  STYLEX_LAYERS_BEFORE,
  STYLEX_LAYER_PREFIX,
} from './stylex/layer-law.js';
export type { CanonicalStatement } from './stylex/layer-law.js';

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
   * (see @jixoai/ui-vite-plugin/icons). OPTIONAL since the library face:
   * a library-only config emits no CSS module content.
   */
  readonly provider?: IconProviderFactory;
  /**
   * the named-icon/library face (see IconLibraryOptions in
   * @jixoai/ui-vite-plugin/icons): the icon-set artifact + virtual chunk
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

/** the spinners feature option's type (spin-ora-svg-lane design §5) —
 *  re-exported for umbrella consumers; the face itself is small and
 *  pure, wired directly (no bridge) */
export type { SpinnersPluginOptions } from './spinners/types.js';

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

    async transform(code, id) {
      // the prefix compiler's DEV collector rides the delegate too
      // (icon-prefix-compiler design §1 — the bridge must not silently
      // drop the scanner for umbrella consumers). The old no-presets
      // fast path is GONE (icon-channel-api, 2026-09-07): lucide is
      // default-registered, so the enabled set is never empty and a
      // bare `lucide:zap` literal must scan for umbrella consumers
      // too — with no library configured the delegation is still
      // skipped (nothing to collect for; no static icons import enters
      // this entry either way — design §9: the memoized dynamic import
      // stays the only path in).
      if (options.library === undefined) return null;
      return (await ensureDelegate()).transform(code, id);
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
 * `stylex` feature options (stylex-kernel phase 0, P0.2). The structural
 * twin of StylexEngineOptions in ./stylex/vite-plugin.ts — the bridge
 * law keeps the two modules unlinked at type time (the icons
 * IconPluginOptions precedent), so this interface must evolve in step.
 */
export interface StylexPluginOptions {
  /**
   * the kernel trees: directories whose modules MAY enter the stylex
   * transform (absolute or vite-root-relative) — in this repo,
   * `registry/files` and the `apps/www/src/lib` mirror. Everything
   * else (docs routes, consumer trees, node_modules) is NEVER
   * transformed. Non-empty and REQUIRED: the scope is the law.
   */
  readonly include: readonly string[];
}

/** the stylex engine module failed to load — the named fix (check-tw4-prereq style) */
const STYLEX_ENGINE_UNAVAILABLE_ERROR =
  '[jixoai-stylex] the stylex engine failed to load — @stylexjs/unplugin ' +
  'must be installed at EXACTLY 0.19.0 (the research F-series pin; bumps ' +
  're-run the dossier D1 fixtures). It ships as a devDependency of ' +
  '@jixoai/ui-vite-plugin: run npm install in the plugin package (or the ' +
  'workspace that consumes it) — and note the engine is BUILD-side only ' +
  '(F11): registry consumers never owe any @stylexjs/* package.';

/**
 * The stylex bridge (the icons-bridge law): a thin proxy keeping
 * jixoai() SYNC while the engine graph stays out of this entry's
 * static module graph. The delegate is created in the `config` hook
 * (vite's env.command and config.root are known there) and memoized;
 * every hook awaits it, resurfacing any failure as the named error.
 *
 * Registration shape (load-bearing): NO `enforce` on this plugin —
 * the official example-sveltekit trick. The unplugin hardcodes
 * `enforce: 'pre'`, which would babel-parse RAW .svelte source before
 * the svelte plugin compiles it; as a normal-order plugin sorted
 * after sveltekit() in the consumer's plugins array, the transform
 * sees COMPILED svelte js (spike-report §3).
 *
 * NOT delegated on purpose: the unplugin's own `config` hook
 * (optimizeDeps excludes for npm packages shipping stylex source —
 * our kernel stylex is in-tree and compiles away before resolution,
 * so the hook has nothing to do for us).
 */
function stylexBridgePlugin(options: StylexPluginOptions): Plugin {
  let delegate: StylexEngineHooks | undefined;
  // created ONCE — the first ctx wins (vite always calls `config`
  // first, so env.command + config.root are known before anything
  // else needs the engine)
  let pending: Promise<StylexEngineHooks> | undefined;

  const ensureDelegate = (ctx: StylexEngineContext): Promise<StylexEngineHooks> => {
    if (delegate !== undefined) return Promise.resolve(delegate);
    pending ??= import('./stylex/vite-plugin.js')
      .then((mod) => {
        delegate = mod.createStylexEngine(options, ctx);
        return delegate;
      })
      .catch((err: Error) => {
        throw new Error(`${STYLEX_ENGINE_UNAVAILABLE_ERROR} — ${err.message}`);
      });
    return pending;
  };

  return {
    name: 'jixoai-stylex',
    // `enforce` deliberately absent — see the doc comment above

    async config(config, env) {
      await ensureDelegate({ root: config.root ?? process.cwd(), command: env.command });
    },

    async configResolved(config) {
      await (await ensureDelegate({
        root: config.root,
        command: 'build',
      })).configResolved(config);
    },

    async buildStart() {
      // buildStart may run outside a config cycle (vitest in-process
      // builds) — the fallback ctx keeps the bridge total
      await (
        await ensureDelegate({ root: process.cwd(), command: 'build' })
      ).buildStart();
    },

    shouldTransformCachedModule(arg) {
      // sync hook — best-effort against the warmed delegate (watch
      // mode always ran config/buildStart first)
      return delegate?.shouldTransformCachedModule(arg) ?? false;
    },

    async resolveId(id) {
      return (await ensureDelegate({ root: process.cwd(), command: 'build' })).resolveId(id);
    },

    async load(id) {
      return (await ensureDelegate({ root: process.cwd(), command: 'build' })).load(id);
    },

    async transform(code, id) {
      const hooks = await ensureDelegate({ root: process.cwd(), command: 'build' });
      return hooks.transform.call(this as unknown as StylexTransformContext, code, id);
    },

    transformIndexHtml() {
      // sync hook — dev only; configureServer (async, awaited by vite
      // before the first html transform) has warmed the delegate
      return delegate?.transformIndexHtml() ?? null;
    },

    async handleHotUpdate(ctx) {
      (await ensureDelegate({ root: process.cwd(), command: 'build' })).handleHotUpdate(ctx);
    },

    async configureServer(server) {
      (await ensureDelegate({ root: process.cwd(), command: 'serve' })).configureServer(server);
    },

    async generateBundle(options, bundle) {
      const hooks = await ensureDelegate({ root: process.cwd(), command: 'build' });
      hooks.generateBundle.call(this as unknown as StylexHookContext, options, bundle);
    },

    async writeBundle(options, bundle) {
      const hooks = await ensureDelegate({ root: process.cwd(), command: 'build' });
      await hooks.writeBundle.call(this as unknown as StylexHookContext, options, bundle);
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
  /**
   * The svg-spinner feature (spin-ora-svg-lane design §5): the vendored
   * blocks-wave manifest + custom inline/`{file}` svg sources compiled
   * into the spin-set.gen.ts artifact (`SpinName` union, `SPIN_NAMES`,
   * synchronous `getSpin`). ONE face — a bare `{}` IS a legal
   * configuration (blocks-wave only); the icons ≥1-of-2 matrix error
   * does not apply. Default: `false` — no plugin is registered, nothing
   * is read; the committed artifact stays plugin-free.
   */
  spinners?: SpinnersPluginOptions | false;
  /**
   * The stylex engine feature (stylex-kernel phase 0, P0.2): the
   * kernel-scoped StyleX transform + the F9 canonical layer law baked
   * into every emitted css (see StylexPluginOptions). Build-side ONLY
   * (F11): registry consumers never owe @stylexjs/*. Default:
   * `false` — no plugin is registered and the engine graph is never
   * loaded unless the kernel trees are explicitly named.
   */
  stylex?: StylexPluginOptions | false;
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
  // ONE face, no matrix: a bare `{}` = blocks-wave only (design §5) —
  // the spinners plugin is small and pure, so it wires DIRECTLY (no
  // bridge; the dist graph-purity gate stays one-dynamic-import)
  if (options.spinners !== false && options.spinners !== undefined) {
    plugins.push(createSpinnersPlugin(options.spinners));
  }
  // the engine feature (phase 0 P0.2): the SECOND bridge — the babel
  // graph must never enter this entry's static graph. An empty
  // `include` is the named startup error (the scope is the law)
  if (options.stylex !== false && options.stylex !== undefined) {
    if (options.stylex.include.length === 0) {
      throw new Error(
        '[jixoai-stylex] the stylex option requires a non-empty include — ' +
          'name the kernel trees (transform scope = the kernel ONLY, docs ' +
          'routes never enter the transform)',
      );
    }
    plugins.push(stylexBridgePlugin(options.stylex));
  }
  return plugins;
}
