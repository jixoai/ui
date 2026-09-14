// stylex/vite-plugin.ts — the stylex engine wiring, build-side ONLY
// (stylex-kernel phase 0, P0.2; F11: consumers of the registry never
// need @stylexjs/* — the engine rides OUR build through this plugin).
//
// Reached ONLY through the memoized dynamic import in src/index.ts
// (the icons-bridge law, icon-component-pipeline design §9): the
// engine's graph (babel ×20 + lightningcss + browserslist) must never
// enter the umbrella entry's static module graph — the dist
// graph-purity gates pin that.
//
// What this module owns, each load-bearing (research dossier:
// archive/2026-09-13-stylex-kernel-research):
//
//   1. THE KERNEL-SCOPE GATE — the stylex babel transform runs ONLY
//      on modules inside the configured kernel trees (the `include`
//      dirs: registry/files + the apps/www/src/lib mirror in OUR
//      repo). Docs routes and consumer trees NEVER enter the
//      transform, whatever they import.
//   2. THE F9 LAYER LAW — every emitted CSS asset that carries stylex
//      output starts with the ONE canonical FULL statement
//      (STYLEX_LAYER_STATEMENT) at byte zero, ahead of Tailwind's own
//      layers — the O1-H-measured remedy (spike-report §5.1): without
//      it, unplugin 0.19.0's appended stylex CSS inscribes its layers
//      LAST and consumer utilities can never win (D2-01/D2-03).
//   3. THE CSS-ENTRY LESSON (spike-report §5.2, Vite 8 + rolldown):
//      a build that produces stylex CSS but NO css asset silently
//      drops it — the upstream writeBundle fallback writes an
//      UNLINKED stylex.css. We keep the fallback file but WARN with
//      a named-fix message so the loss is never silent.
//   4. The kernel babel pins (D1-06 contract): debug +
//      propertyValidationMode:'throw' (the silent shorthand-drop
//      guard, §5.3) + explicit dev/runtimeInjection (the unplugin
//      derives `dev` from NODE_ENV, which vite never sets) + the
//      `enforce: undefined` plugin-order trick (the official
//      example-sveltekit wiring, applied at the BRIDGE registration —
//      babel must see COMPILED svelte js, never raw .svelte source).
//
// VERSION PIN POLICY: @stylexjs/unplugin is EXACT-pinned 0.19.0 in
// devDependencies. This wrapper drives the pinned version through
// its public plugin surface plus ONE internal accessor
// (__stylexCollectCss — stable within the pin), so any version bump
// MUST re-run the research dossier's D1 fixtures AND re-audit this
// wrapper. Bumps are a research-level event, not a chore (the
// F-series pin set ruling).

import * as nodePath from 'node:path';
import { realpathSync } from 'node:fs';
import stylexVite from '@stylexjs/unplugin/vite';
import type { ViteDevServer } from 'vite';
import { STYLEX_LAYER_STATEMENT } from './layer-law.js';

/**
 * the stylex feature's options as the UMBRELLA defines them
 * (src/index.ts keeps its own structural twin — the bridge law: no
 * static link between the two modules).
 */
export interface StylexEngineOptions {
  /**
   * the kernel trees: directories whose modules MAY enter the stylex
   * transform (absolute or vite-root-relative). Everything else —
   * docs routes, consumer trees, node_modules — is never transformed.
   * Required and non-empty: the scope is the law, not a default.
   */
  readonly include: readonly string[];
}

/** creation-time context the bridge already knows from vite's config env */
export interface StylexEngineContext {
  /** vite root (also the babel moduleResolution rootDir — the ssg lesson: $lib aliases break it, relative imports only) */
  readonly root: string;
  /** 'serve' | 'build' */
  readonly command: string;
}

/**
 * the subset of the vite/rollup hook context the emission hooks use —
 * typed explicitly so the plain-function surface stays `this`-honest
 * (the bridge forwards the real hook context via .call)
 */
export interface StylexHookContext {
  /** vite ≥6 environment on plugin contexts (absent under plain rollup) */
  readonly environment?: { readonly config?: { readonly consumer?: string } };
  emitFile(file: { type: 'asset'; name: string; source: string }): string;
  getFileName(referenceId: string): string;
  warn?(message: string): void;
}

/**
 * the subset of the transform hook context the pinned engine reads
 * (its watch-mode module-graph prefetch — core.mjs `ctx.meta.watchMode`)
 */
export interface StylexTransformContext {
  readonly meta?: { readonly watchMode?: boolean };
  parse?(code: string): unknown;
  resolve?(source: string, importer: string): Promise<{ external: boolean; id: string } | null>;
  load?(resolved: { id: string }): Promise<{ meta?: Record<string, unknown> } | null>;
}

/** the plain-function hook surface the umbrella bridge delegates to */
export interface StylexEngineHooks {
  configResolved(config: { root: string }): void;
  buildStart(): void;
  shouldTransformCachedModule(arg: { id: string; meta: unknown }): false;
  resolveId(id: string): string | null;
  load(id: string): string | null;
  transform(this: StylexTransformContext, code: string, id: string): unknown;
  transformIndexHtml(): unknown;
  handleHotUpdate(ctx: unknown): void;
  configureServer(server: ViteDevServer): void;
  generateBundle(this: StylexHookContext, options: { dir?: string }, bundle: Record<string, unknown>): void;
  writeBundle(this: StylexHookContext, options: { dir?: string; file?: string }, bundle: Record<string, unknown>): Promise<void>;
}

// the dev virtual css path (unplugin 0.19.0's consts DEV_CSS_PATH —
// not exported through the package exports map; the EXACT pin makes a
// local literal safe, and dev wiring drift fails loudly at sight)
const DEV_CSS_PATH = '/virtual:stylex.css';

const CSS_ENTRY_TRAP_WARNING =
  '[jixoai-stylex] the build produced stylex CSS but NO css asset exists to ' +
  'carry it — on Vite 8 (rolldown) this is the silent-loss trap (research ' +
  'spike-report §5.2): the fallback assets/stylex.css file was written but ' +
  'NOTHING LINKS IT. Give the app a css entry (import a .css file from the ' +
  'app entry) so the stylex output rides the linked, hashed asset.';

/** strip vite query/hash suffixes before path math ('/a/b.svelte?x' → '/a/b.svelte') */
function idToPath(id: string): string {
  return id.split('?')[0]!;
}

/** minimal structural type for the single plugin object @stylexjs/unplugin's vite factory emits */
interface StylexInternalPlugin {
  readonly name: string;
  configResolved?: (config: { root: string }) => void;
  buildStart?: () => void;
  shouldTransformCachedModule?: (arg: { id: string; meta: unknown }) => false;
  resolveId?: (id: string) => string | null;
  load?: (id: string) => string | null;
  transform?: (code: string, id: string) => unknown;
  transformIndexHtml?: () => unknown;
  handleHotUpdate?: (ctx: unknown) => void;
  configureServer?: (server: ViteDevServer) => void;
  /** the pinned-version internal accessor this wrapper is built around */
  __stylexCollectCss?: () => string;
}

interface BundleAsset {
  type: string;
  fileName?: string;
  name?: string;
  source?: string | Uint8Array;
}

interface BundleChunk {
  type: string;
  fileName?: string;
  code?: string;
  viteMetadata?: { importedCss?: Set<string> | string[] };
}

/** the asset-name preference mirrored from the pinned unplugin core (pickCssAssetFromRollupBundle) */
function pickCssAsset(bundle: Record<string, unknown>): BundleAsset | null {
  const assets = Object.values(bundle).filter(
    (a): a is BundleAsset =>
      !!a &&
      typeof a === 'object' &&
      (a as BundleAsset).type === 'asset' &&
      typeof (a as BundleAsset).fileName === 'string' &&
      (a as BundleAsset).fileName!.endsWith('.css'),
  );
  if (assets.length === 0) return null;
  return (
    assets.find((a) => /(^|\/)index\.css$/.test(a.fileName!)) ??
    assets.find((a) => /(^|\/)style\.css$/.test(a.fileName!)) ??
    assets[0]!
  );
}

function assetSourceString(asset: BundleAsset): string {
  return typeof asset.source === 'string' ? asset.source : asset.source?.toString() ?? '';
}

/**
 * re-emit a css asset with new source under a fresh content hash and
 * repoint every bundle reference — the mechanism mirrored from the
 * pinned unplugin core's replaceCssAssetWithHashedCopy (not exported
 * through its package exports map; the EXACT pin licenses the local
 * twin).
 */
function replaceCssAssetWithHashedCopy(
  ctx: Pick<StylexHookContext, 'emitFile' | 'getFileName'>,
  bundle: Record<string, unknown>,
  asset: BundleAsset,
  nextSource: string,
): void {
  const fallbackName = asset.fileName ? nodePath.basename(asset.fileName) : 'stylex.css';
  const hashedSuffix = /^(.*?)(-[a-z0-9]{8,})?\.css$/i.exec(fallbackName);
  const baseName = asset.name ?? (hashedSuffix?.[1] ? `${hashedSuffix[1]}.css` : fallbackName);
  const referenceId = ctx.emitFile({ type: 'asset', name: baseName, source: nextSource });
  const nextFileName = ctx.getFileName(referenceId);
  const oldFileName = asset.fileName;
  if (!nextFileName || !oldFileName || nextFileName === oldFileName) {
    asset.source = nextSource;
    return;
  }
  for (const item of Object.values(bundle)) {
    if (!item || typeof item !== 'object') continue;
    if ((item as BundleChunk).type === 'chunk') {
      const chunk = item as BundleChunk;
      if (typeof chunk.code === 'string' && chunk.code.includes(oldFileName)) {
        chunk.code = chunk.code.split(oldFileName).join(nextFileName);
      }
      const importedCss = chunk.viteMetadata?.importedCss;
      if (importedCss instanceof Set && importedCss.has(oldFileName)) {
        importedCss.delete(oldFileName);
        importedCss.add(nextFileName);
      } else if (Array.isArray(importedCss) && importedCss.includes(oldFileName)) {
        chunk.viteMetadata!.importedCss = importedCss.map((n) => (n === oldFileName ? nextFileName : n));
      }
    } else if ((item as BundleAsset).type === 'asset') {
      const source = (item as BundleAsset).source;
      if (typeof source === 'string' && source.includes(oldFileName)) {
        (item as BundleAsset).source = source.split(oldFileName).join(nextFileName);
      }
    }
  }
  delete bundle[oldFileName];
}

/**
 * create the stylex engine hooks. Returns the plain-function surface
 * the umbrella bridge delegates to (never a vite Plugin[] — the
 * bridge owns registration and hook `this` contexts; the underlying
 * unplugin object's `this`-free hooks are called plainly, its
 * transform gets the bridge's hook `this` forwarded by the bridge).
 */
export function createStylexEngine(
  options: StylexEngineOptions,
  ctx: StylexEngineContext,
): StylexEngineHooks {
  if (options.include.length === 0) {
    throw new Error(
      '[jixoai-stylex] the stylex option requires a non-empty include — ' +
        'name the kernel trees (transform scope = the kernel ONLY, docs ' +
        'routes never enter the transform)',
    );
  }

  // the engine instance — the KERNEL babel pins ride here (header §4)
  const engine = stylexVite({
    dev: ctx.command === 'serve',
    runtimeInjection: ctx.command === 'serve',
    debug: true,
    propertyValidationMode: 'throw',
    useCSSLayers: { prefix: 'stylex', after: ['utilities'] },
    unstable_moduleResolution: { type: 'commonJS', rootDir: ctx.root },
  }) as StylexInternalPlugin;

  // absolute kernel dirs (root-relative entries resolve against the
  // vite root; nonexistent dirs simply match nothing — the registry
  // twin's root-relative math is the established twin-config precedent).
  // REALPATH-normalized: vite hands hooks realpath'd module ids
  // (/private/var/… on macOS) while config paths may be lexical
  // (/var/…) — lexical startsWith would silently never match
  const realpathCache = new Map<string, string>();
  const realpath = (p: string): string => {
    let cached = realpathCache.get(p);
    if (cached === undefined) {
      try {
        cached = realpathSync(p);
      } catch {
        cached = p;
      }
      realpathCache.set(p, cached);
    }
    return cached;
  };
  const kernelDirs = options.include
    .map((entry) => (nodePath.isAbsolute(entry) ? entry : nodePath.resolve(ctx.root, entry)))
    .map((dir) => realpath(nodePath.resolve(dir)));

  const inKernelScope = (id: string): boolean => {
    const abs = realpath(nodePath.resolve(idToPath(id)));
    return kernelDirs.some((dir) => abs === dir || abs.startsWith(dir + nodePath.sep));
  };

  const collectCss = (): string => engine.__stylexCollectCss?.() ?? '';

  // emission state (mirrors the upstream cssInjectedInGenerateBundle flag)
  let cssInjected = false;

  /** the F9-baked payload: the canonical statement first, then whatever css exists, then the stylex output */
  const bakeF9 = (current: string, css: string): string =>
    current ? `${STYLEX_LAYER_STATEMENT}\n${current}\n${css}` : `${STYLEX_LAYER_STATEMENT}\n${css}`;

  const isServerConsumer = (context: StylexHookContext): boolean =>
    context.environment?.config?.consumer === 'server';

  return {
    configResolved(config) {
      engine.configResolved?.(config);
    },

    buildStart() {
      engine.buildStart?.();
    },

    shouldTransformCachedModule(arg) {
      return engine.shouldTransformCachedModule?.(arg) ?? false;
    },

    resolveId(id) {
      return engine.resolveId?.(id) ?? null;
    },

    load(id) {
      return engine.load?.(id) ?? null;
    },

    transform(code, id) {
      // THE KERNEL-SCOPE GATE — before the engine ever sees the id.
      // (the engine's own stylex-import sniff is the second gate; this
      // one is the law the task pins: kernel trees ONLY)
      if (!inKernelScope(id)) return null;
      return engine.transform?.call(this, code, id) ?? null;
    },

    transformIndexHtml() {
      return engine.transformIndexHtml?.() ?? null;
    },

    handleHotUpdate(ctx_) {
      engine.handleHotUpdate?.(ctx_);
    },

    configureServer(server) {
      // the F9 statement rides the DEV virtual css too — dev layer
      // order should read the same law as prod (registered BEFORE the
      // engine's own middleware so THIS handler answers DEV_CSS_PATH)
      server.middlewares.use((req, res, next) => {
        if ((req.url ?? '').split('?')[0] !== DEV_CSS_PATH) {
          next();
          return;
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/css');
        res.setHeader('Cache-Control', 'no-store');
        res.end(`${STYLEX_LAYER_STATEMENT}\n${collectCss()}`);
      });
      engine.configureServer?.(server);
    },

    generateBundle(_options, bundle) {
      // kit builds client AND server environments through this plugin —
      // the server pass carries no linked css by design; only the
      // client pass bakes the payload
      if (isServerConsumer(this)) return;
      const css = collectCss();
      if (!css) return;
      const target = pickCssAsset(bundle);
      if (!target) {
        cssInjected = false;
        return; // writeBundle writes the fallback + warns (the §5.2 trap)
      }
      const current = assetSourceString(target);
      if (current.startsWith(STYLEX_LAYER_STATEMENT)) return; // already baked (idempotence)
      replaceCssAssetWithHashedCopy(this, bundle, target, bakeF9(current, css));
      cssInjected = true;
    },

    async writeBundle(options, _bundle) {
      if (isServerConsumer(this)) return;
      if (cssInjected) return;
      const css = collectCss();
      if (!css) return;
      // the §5.2 fallback: NO css asset in the bundle — write the file
      // (statement + css) so nothing is lost outright, and warn the
      // named fix so the unlink is never silent
      this.warn?.(CSS_ENTRY_TRAP_WARNING);
      const outDir = options.dir ?? (options.file ? nodePath.dirname(options.file) : process.cwd());
      const assetsDir = nodePath.join(outDir, 'assets');
      const { mkdir, writeFile } = await import('node:fs/promises');
      await mkdir(assetsDir, { recursive: true });
      await writeFile(nodePath.join(assetsDir, 'stylex.css'), bakeF9('', css), 'utf8');
      cssInjected = true;
    },
  };
}
