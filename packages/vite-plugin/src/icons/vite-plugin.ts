/**
 * @jixoai/vite-plugin (icons) — vite integration (P3.3)
 *
 * createIconPlugin() returns a Vite plugin that:
 *   1. owns ALL file I/O — providers receive loaded bytes through a
 *      ProviderContext (loadSource/watchFile); they never touch the
 *      filesystem (frozen principle #4)
 *   2. awaits the IconProviderFactory at build start (font/svg loading
 *      is async)
 *   3. serves `virtual:jixoai-icons` as a virtual CSS module:
 *
 *        @layer theme {
 *          :root {
 *            --jx-icon-calendar: url("data:image/svg+xml,...");
 *            --jx-icon-calendar-ink: url("data:image/svg+xml,...");
 *            ...
 *          }
 *        }
 *        .dark { ...white-ink matrix... }
 *        .jx-light { ...black-ink matrix... }
 *
 *      Covering a concept slot emits its plain value AND its derived
 *      ink family (icons-docs §2 — one swap, the whole family follows;
 *      a mixed plain/ink pair cannot occur). …for
 *      `@import 'virtual:jixoai-icons';` in the
 *      consumer's CSS entry (the ONLY injection path — frozen
 *      principle #1). JS consumers (the clear slot's {@html} DOM
 *      injection) import the explicit `…icons?dom` form, which exports
 *      `domIcons` (dom-string serialization).
 *   4. invalidates the virtual modules when watched source files change
 *      (HMR: re-runs the factory with fresh bytes, then invalidates).
 *
 * WOFF2 sources are transparently decompressed to TTF via the optional
 * `wawoff2` dependency before providers ever see the bytes (providers
 * always receive parseable TTF/OTF data — see design.md §6).
 *
 * The NAMED-ICON face (icon-component-pipeline A4): when `library` is
 * configured the plugin additionally runs the library pipeline
 * (adapter-side resolution → safety → svgo → the pure generator) and
 *   - serves the artifact module for its configured `output` path (dev
 *     drift-warns; writes only when the consumer opted in via
 *     write:true — the single-writer law keeps the root gen:icons
 *     script the only in-repo writer),
 *   - serves `virtual:jixoai-icons/chunk/K` lazy chunk modules,
 *   - throws the fixed overflow sentinel (design §5) when a chunk id
 *     is imported while NO library is configured.
 * HMR rides the slot face's existing refresh path: {file}-sourced
 * library icons join the same watch machinery; a change re-runs both
 * faces and invalidates every virtual module.
 *
 * The PREFIX COMPILER (icon-prefix-compiler, 2026-09-07): with presets
 * enabled, `name="md:copy_all"` literals in consumer sources enter the
 * set with NO library.icons declaration — through the scanner's two
 * entries (scan.ts): an EAGER project walk at buildStart in build mode
 * (generation precedes transforms), and a DEV transform collector
 * whose scanned-set changes ride scheduleRefresh. The `as` alias form
 * packs one payload under the canonical key with an ALIASES indirection.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, extname, resolve as resolvePath } from 'node:path';
import type { Plugin, ViteDevServer } from 'vite';
import { INK_DERIVATIONS } from './ink.js';
import { createSafetyChecker } from './safety.js';
import { serializeIcon, serializeInkVariant } from './serializer.js';
import { SLOT_NAMES, SLOT_REGISTRY } from './types.js';
import type {
  IconProvider,
  IconProviderFactory,
  SafetyChecker,
  SafetyCheckerConfig,
  SourceDescriptor,
} from './types.js';
import {
  assertIconsFacesConfigured,
  normalizeLibraryOptions,
  type NormalizedLibraryOptions,
} from './library/config.js';
import { generateIconLibraryArtifacts, type GeneratedLibraryArtifacts } from './library/generate.js';
import { resolveLibraryInputs } from './library/resolve.js';
import {
  collectScannedRefs,
  isScannableModuleId,
  mergeScannedRefs,
  scanProjectSources,
  type ScannedRef,
} from './library/scan.js';
import type { IconLibraryOptions } from './library/types.js';
import {
  chunkIndexOf,
  classifyVirtualId,
  ICON_CHUNK_MODULE_PREFIX,
  ICON_LIBRARY_SENTINEL_ERROR,
  isChunkModuleId,
  RESOLVED_CSS_ID,
  RESOLVED_JS_ID,
  VIRTUAL_MODULE_ID,
} from './ids.js';

// the id vocabulary + sentinel are contract surface (ids.ts) —
// re-exported here for the established import surface
export { VIRTUAL_MODULE_ID, chunkIndexOf, ICON_LIBRARY_SENTINEL_ERROR } from './ids.js';

// ── options ────────────────────────────────────────────────────────

/** createIconPlugin() plugin options */
export interface IconPluginOptions {
  /**
   * the slot/CSS face's icon provider factory — awaited at build start
   * with a ProviderContext. optional since the library face
   * (icon-component-pipeline): ≥1 of `icons` | `library` is required
   * (the named startup error teaches the two legal shapes)
   */
  readonly icons?: IconProviderFactory;
  /** the named-icon/library face (see IconLibraryOptions) */
  readonly library?: IconLibraryOptions;
  /**
   * safety checker configuration (follow-up C5) — SHARED by both faces.
   * defaults to `{ mode: 'warn' }` — rejected icons serve the standard
   * layer's inline fallback (slot face) or drop with a named warning
   * (library face). pass `{ mode: 'error', … }` (and/or tighter limits)
   * to fail the build instead, e.g. for HTTP-sourced icons.
   */
  readonly safety?: SafetyCheckerConfig;
}

// ── byte sniffing / normalization ──────────────────────────────────

/** WOFF2 magic bytes: 0x77 0x4F 0x46 0x32 ("wOF2") */
function isWoff2(data: Uint8Array): boolean {
  return (
    data.length >= 4 &&
    data[0] === 0x77 && data[1] === 0x4f &&
    data[2] === 0x46 && data[3] === 0x32
  );
}

/** WOFF 1.0 magic bytes: 0x77 0x4F 0x46 0x46 ("wOFF") — not supported */
function isWoff1(data: Uint8Array): boolean {
  return (
    data.length >= 4 &&
    data[0] === 0x77 && data[1] === 0x4f &&
    data[2] === 0x46 && data[3] === 0x46
  );
}

/**
 * does the (latin1-decoded) head of a file look like an SVG document?
 * skips a BOM, comments, an xml declaration and a doctype, then requires
 * `<svg` + whitespace or `>`.
 */
function looksLikeSvg(head: string): boolean {
  let rest = head.replace(/^\uFEFF/, '').trimStart();
  for (;;) {
    if (rest.startsWith('<?xml')) {
      const end = rest.indexOf('?>');
      if (end < 0) return false;
      rest = rest.slice(end + 2).trimStart();
      continue;
    }
    if (rest.startsWith('<!--')) {
      const end = rest.indexOf('-->');
      if (end < 0) return false;
      rest = rest.slice(end + 3).trimStart();
      continue;
    }
    if (/^<!DOCTYPE/i.test(rest)) {
      const end = rest.indexOf('>');
      if (end < 0) return false;
      rest = rest.slice(end + 1).trimStart();
      continue;
    }
    break;
  }
  return /^<svg[\s>]/i.test(rest);
}

/**
 * normalize a loaded source to its post-normalization mime type.
 * magic bytes take priority; the file extension is the fallback.
 */
function detectMimeType(data: Uint8Array, path: string): string {
  if (data.length >= 4) {
    // TrueType (0x00 0x01 0x00 0x00) or OpenType with CFF outlines ("OTTO")
    if (
      (data[0] === 0x00 && data[1] === 0x01 && data[2] === 0x00 && data[3] === 0x00) ||
      (data[0] === 0x4f && data[1] === 0x54 && data[2] === 0x54 && data[3] === 0x4f)
    ) {
      return 'font/ttf';
    }
    if (isWoff1(data)) {
      throw new Error(`createIconPlugin: WOFF 1.0 is not supported (${path}) — convert to TTF or WOFF2`);
    }
  }
  const head = Buffer.from(
    data.buffer,
    data.byteOffset,
    Math.min(data.byteLength, 1024),
  ).toString('latin1');
  if (looksLikeSvg(head)) return 'image/svg+xml';
  const ext = extname(path).toLowerCase();
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.ttf' || ext === '.otf') return 'font/ttf';
  if (ext === '.woff2') throw new Error(`createIconPlugin: not a valid WOFF2 file (${path})`);
  throw new Error(`createIconPlugin: unrecognized icon source format (${path})`);
}

// ── WOFF2 decompression (optional dependency) ──────────────────────

/** the subset of wawoff2's API this plugin uses (the package ships no types) */
interface Wawoff2Module {
  decompress(input: Buffer): Promise<Uint8Array>;
}

/**
 * non-literal specifier on purpose: `wawoff2` is an OPTIONAL runtime
 * dependency and must stay external (never analyzed/bundled). if the
 * package is absent the dynamic import rejects and we surface the
 * contract error below.
 */
const WAWOFF2_MODULE_ID = 'wawoff2';

async function decompressWoff2(data: Uint8Array): Promise<Uint8Array> {
  let wawoff2: Wawoff2Module;
  try {
    wawoff2 = (await import(WAWOFF2_MODULE_ID)) as Wawoff2Module;
  } catch {
    throw new Error(
      'createIconPlugin: WOFF2 source encountered but the optional dependency "wawoff2" is not installed ' +
        '(install wawoff2 or convert the font to TTF)',
    );
  }
  const decompressed = await wawoff2.decompress(
    Buffer.from(data.buffer, data.byteOffset, data.byteLength),
  );
  return new Uint8Array(decompressed);
}

// ── module generation ──────────────────────────────────────────────

/** does this slot have a consumer that injects the SVG into the DOM? */
function usesDomInjection(slot: keyof typeof SLOT_REGISTRY): boolean {
  return SLOT_REGISTRY[slot].consumers.some(
    (capability) => capability.technique === 'inline-svg',
  );
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

/** serialize every provided slot into the virtual CSS + JS module contents */
function generateModules(
  provider: IconProvider,
  checker: SafetyChecker,
): { readonly css: string; readonly js: string } {
  const rootDeclarations: string[] = [];
  const darkDeclarations: string[] = [];
  const lightDeclarations: string[] = [];
  const domEntries: string[] = [];

  for (const slot of SLOT_NAMES) {
    const asset = provider.getIcon(slot);
    if (asset === null) continue; // not this provider's slot — standard layer fallback serves
    // serializeIcon returns null when a warn-mode safety check rejects the
    // asset — the slot is omitted and the standard layer fallback serves
    // (an error-mode check throws and fails the build). The derived ink
    // variants share this gate: the baking law only substitutes fixed
    // attribute values into the checked source, so one gate covers the
    // whole family (and a rejected slot warns once, not once per variant).
    const plainValue = serializeIcon(asset, 'css-var', checker);
    if (plainValue === null) continue;
    const definition = SLOT_REGISTRY[slot];
    const derivation = INK_DERIVATIONS[slot];

    // :root — the plain value plus the derived ink value (icons-docs §2:
    // covering a concept re-bakes its whole ink family from the SAME
    // asset; a mixed plain/ink pair cannot occur). `invalid` is
    // ink-only — no plain variable exists to write.
    if (definition.plain) {
      rootDeclarations.push(`    --jx-icon-${slot}: ${plainValue};`);
    }
    if (derivation !== undefined) {
      rootDeclarations.push(
        `    --jx-icon-${derivation.vocab}: ${serializeInkVariant(asset, {
          ink: '#000',
          strokeWidth: derivation.strokeWidth,
        })};`,
      );
    }

    // the .dark/.jx-light white-ink matrix (the vocabulary sheet's own
    // law: black data-URI ink vanishes on the dark token sheet).
    // palette paints through a mask + currentColor background —
    // theme-agnostic, it joins no matrix.
    if (definition.flipsInDark) {
      if (definition.plain) {
        darkDeclarations.push(
          `  --jx-icon-${slot}: ${serializeInkVariant(asset, { ink: '#fff' })};`,
        );
        lightDeclarations.push(`  --jx-icon-${slot}: ${plainValue};`);
      }
      if (derivation !== undefined) {
        darkDeclarations.push(
          `  --jx-icon-${derivation.vocab}: ${serializeInkVariant(asset, {
            ink: '#fff',
            strokeWidth: derivation.strokeWidth,
          })};`,
        );
        lightDeclarations.push(
          `  --jx-icon-${derivation.vocab}: ${serializeInkVariant(asset, {
            ink: '#000',
            strokeWidth: derivation.strokeWidth,
          })};`,
        );
      }
    }

    if (usesDomInjection(slot)) {
      const domString = serializeIcon(asset, 'dom-string', checker);
      if (domString !== null) {
        domEntries.push(`  ${slot}: ${JSON.stringify(domString)},`);
      }
    }
  }

  // the override surface: :root rides `@layer theme` exactly as the
  // current output plane does; the .dark/.jx-light matrix mirrors the
  // vocabulary sheet — unlayered, so it beats the layered standard
  // vocabulary inside those scopes.
  const cssBlocks: string[] = [];
  if (rootDeclarations.length > 0) {
    cssBlocks.push(`@layer theme {\n  :root {\n${rootDeclarations.join('\n')}\n  }\n}`);
  }
  if (darkDeclarations.length > 0) {
    cssBlocks.push(`.dark {\n${darkDeclarations.join('\n')}\n}`);
    cssBlocks.push(`.jx-light {\n${lightDeclarations.join('\n')}\n}`);
  }
  const css =
    cssBlocks.length > 0
      ? `${cssBlocks.join('\n')}\n`
      : `/* jixoai-icons: no icons resolved — standard layer inline fallbacks serve */\n`;

  const js =
    `export const domIcons = {\n${domEntries.join('\n')}${domEntries.length > 0 ? '\n' : ''}};\n` +
    `export default domIcons;\n`;

  return { css, js };
}

// ── the plugin ─────────────────────────────────────────────────────

/**
 * the icon plugin's hook surface, typed for the umbrella bridge's
 * delegation (createIconPlugin always defines these as plain
 * functions — the umbrella's memoized dynamic import calls them
 * directly without vite re-invoking us). `transform` is the prefix
 * compiler's DEV collector hook (icon-prefix-compiler design §1b): a
 * plain-function member like `load`, so the umbrella bridge can
 * delegate it — an umbrella consumer must not silently lose the
 * scanner.
 */
export interface IconPluginHooks {
  configResolved(config: { root: string; command?: string }): void;
  buildStart(): Promise<void>;
  resolveId(id: string, importer: string | undefined): string | null;
  load(id: string): Promise<string | null>;
  /** the dev-incremental scanner collector — NEVER rewrites code
   *  (null pass-through); a scanned-set change rides scheduleRefresh */
  transform(code: string, id: string): { code: string; map: null } | null;
  configureServer(server: ViteDevServer): void;
}

/** the icon plugin (a vite Plugin with the typed hook surface above) */
export type IconPlugin = Plugin & IconPluginHooks;

/**
 * create the icon plugin standalone (canonical entry: the `icons` option
 * of the `jixoai()` umbrella in `@jixoai/vite-plugin`). ≥1 of
 * `icons` (the slot/CSS face) or `library` (the named-icon face) is
 * required — neither is the named startup error (design §1 matrix).
 *
 * ```ts
 * // vite.config.ts — umbrella (preferred)
 * import { jixoai } from '@jixoai/vite-plugin';
 * import { lucideIconProvider } from '@jixoai/vite-plugin/icons';
 * export default { plugins: [sveltekit(), tailwindcss(), ...jixoai({ icons: { provider: lucideIconProvider(), library: {} } })] };
 *
 * // standalone (icons feature only)
 * import { createIconPlugin } from '@jixoai/vite-plugin/icons';
 * export default { plugins: [createIconPlugin({ icons: lucideIconProvider() })] };
 * export default { plugins: [createIconPlugin({ library: { icons: { myLogo: { file: './brand/logo.svg' } } } })] };
 * ```
 */
export function createIconPlugin(options: IconPluginOptions): IconPlugin {
  // the design §1 matrix: ≥1 of provider|library, or the named startup
  // error (the umbrella performs the same check inline with the
  // identical message — a test pins the two together)
  assertIconsFacesConfigured(options.icons, options.library);

  // follow-up C5: consumers can replace the default warn-mode checker;
  // the checker is per-plugin-instance (never a module-level singleton)
  const checker = createSafetyChecker(options.safety ?? { mode: 'warn' });

  // the library face's normalized config (null = the face is off)
  const libraryOptions: NormalizedLibraryOptions | null =
    options.library === undefined ? null : normalizeLibraryOptions(options.library);

  let provider: IconProvider | null = null;
  let cssCode = '';
  let jsCode = '';
  let server: ViteDevServer | null = null;
  let buildPromise: Promise<void> | null = null;
  let refreshChain: Promise<void> = Promise.resolve();
  let projectRoot = process.cwd();
  /** the vite command ('build' | 'serve') — the eager-walk vs
   *  transform-collector switch (icon-prefix-compiler design §1) */
  let viteCommand: string | undefined;

  /** the library face's current generation (null until built) */
  let library: GeneratedLibraryArtifacts | null = null;
  /** chunk module ids ever served — all invalidated on refresh */
  const servedChunkIds = new Set<string>();

  // -- the prefix compiler's scanned stream (design §1) ────────────
  // DEV: the transform collector accumulates per module; a UNION
  // change rides scheduleRefresh. BUILD: the eager walk runs instead
  // (generation at buildStart precedes every transform).
  const enabledPrefixes = (): readonly string[] =>
    libraryOptions === null
      ? []
      : [...new Set(libraryOptions.presets.map((preset) => preset.prefix))];
  const scannedByModule = new Map<string, readonly ScannedRef[]>();
  let scannedUnion: readonly ScannedRef[] = [];
  const scannedUnionKeyOf = (refs: readonly ScannedRef[]): string =>
    refs.map((ref) => `${ref.preset}:${ref.name}\u0000${ref.alias ?? ''}`).join('|');

  /** watched files (absolute) → provider-registered change callbacks */
  const watches = new Map<string, Set<() => void>>();

  const logError = (message: string): void => {
    const logger = server?.config.logger;
    if (logger) logger.error(`[jixoai-icons] ${message}\n`, { timestamp: true });
    else console.error(`[jixoai-icons] ${message}`);
  };

  const logWarn = (message: string): void => {
    const logger = server?.config.logger;
    if (logger?.warn !== undefined) logger.warn(`[jixoai-icons] ${message}\n`, { timestamp: true });
    else console.warn(`[jixoai-icons] ${message}`);
  };

  /** the configured artifact's absolute path (library face only) */
  const artifactPath = (): string | null =>
    libraryOptions === null ? null : resolvePath(projectRoot, libraryOptions.output);

  // -- ProviderContext: the ONLY path to file I/O for providers ------

  const loadSource = async (path: string): Promise<SourceDescriptor> => {
    const resolved = resolvePath(path);
    const bytes = new Uint8Array(await readFile(resolved));
    if (isWoff2(bytes)) {
      // WOFF2 is transparently decompressed — providers always see TTF bytes
      return { data: await decompressWoff2(bytes), path: resolved, mimeType: 'font/ttf' };
    }
    return { data: bytes, path: resolved, mimeType: detectMimeType(bytes, resolved) };
  };

  const watchFile = (path: string, onChange: () => void): void => {
    const resolved = resolvePath(path);
    const callbacks = watches.get(resolved) ?? new Set<() => void>();
    callbacks.add(onChange);
    watches.set(resolved, callbacks);
    server?.watcher.add(resolved);
  };

  const createContext = () => ({ loadSource, watchFile });

  // -- generation / refresh ------------------------------------------

  /** the library-only slot face: no factory → the comment-only CSS
   *  module and the empty domIcons export keep the slot surface inert
   *  (the `{ library }` matrix row emits no CSS module content) */
  const EMPTY_PROVIDER: IconProvider = { getIcon: () => null };

  const start = async (): Promise<void> => {
    provider =
      options.icons === undefined
        ? EMPTY_PROVIDER
        : await options.icons(createContext());
    const generated = generateModules(provider, checker);
    cssCode = generated.css;
    jsCode = generated.js;

    if (libraryOptions !== null) {
      // the EAGER project walk (design §1a): a production build
      // generates at buildStart BEFORE any transform — only a project
      // walk can feed it (transform-only collection is unreachable in
      // build mode, the pre-review finding). DEV uses the transform
      // collector's accumulated union instead (§1b).
      const prefixes = enabledPrefixes();
      const artifact = artifactPath();
      const scanned =
        viteCommand === 'build' && prefixes.length > 0
          ? await scanProjectSources(projectRoot, prefixes, {
              exclude: artifact === null ? [] : [artifact],
            })
          : scannedUnion;
      const resolution = await resolveLibraryInputs(
        libraryOptions,
        createContext(),
        checker,
        scanned,
      );
      for (const warning of resolution.warnings) logWarn(warning);
      library = generateIconLibraryArtifacts(resolution.icons, {
        ...libraryOptions,
        aliases: resolution.aliases,
        templatePrefixes: prefixes,
      });
      await syncArtifact();
    }
  };

  /**
   * the artifact side of the single-writer law: with write:false (the
   * default) the adapter only SERVES the generated module and, in dev,
   * WARNS when the on-disk artifact drifted (freshness is CI's job via
   * verify:icons --check). A consumer opting in with write:true gets a
   * real write — only on content change, so watch tooling stays calm.
   */
  const syncArtifact = async (): Promise<void> => {
    if (libraryOptions === null || library === null) return;
    const target = artifactPath();
    if (target === null) return;
    let existing: string | null = null;
    try {
      existing = await readFile(target, 'utf8');
    } catch {
      /* absent on disk — the adapter still serves the module */
    }
    if (libraryOptions.write) {
      if (existing !== library.artifact) {
        await mkdir(dirname(target), { recursive: true });
        await writeFile(target, library.artifact, 'utf8');
        logWarn(
          `icon-set artifact ${libraryOptions.output} ${existing === null ? 'created' : 'rewritten'} (write:true is a consumer opt-in — in-repo apps run write:false)`,
        );
      }
      return;
    }
    if (server !== null && existing !== null && existing !== library.artifact) {
      logWarn(
        `the on-disk artifact ${libraryOptions.output} drifted from the generator output — regenerate it through the owning writer (this adapter runs write:false by default; freshness is verify:icons' job)`,
      );
    }
  };

  const ensureBuilt = (): Promise<void> => {
    buildPromise ??= start();
    return buildPromise;
  };

  const invalidateVirtualModules = (): void => {
    if (!server) return;
    const ids: string[] = [RESOLVED_CSS_ID, RESOLVED_JS_ID, ...servedChunkIds];
    const artifact = artifactPath();
    if (artifact !== null) ids.push(artifact);
    for (const id of ids) {
      const moduleNode = server.moduleGraph.getModuleById(id);
      if (moduleNode) server.moduleGraph.invalidateModule(moduleNode);
    }
    server.ws.send({ type: 'full-reload' });
  };

  /**
   * re-run the factory (fresh loadSource bytes), regenerate the virtual
   * modules and invalidate them. failures keep the previous icons and
   * log — a transient bad edit must not nuke a working dev session.
   *
   * follow-up C2 (HMR cleanup): every factory generation registers its
   * own watch callbacks; callbacks owned by earlier generations are
   * dropped once the new provider lands, so re-creations don't
   * accumulate listeners. a FAILED re-run keeps them — the next change
   * event must still be able to retry the refresh.
   */
  const refresh = async (): Promise<void> => {
    const stale = new Set(
      Array.from(watches.values(), (callbacks) => Array.from(callbacks)).flat(),
    );
    try {
      await start();
      for (const [file, callbacks] of watches) {
        for (const onChange of stale) callbacks.delete(onChange);
        if (callbacks.size === 0) watches.delete(file);
      }
      invalidateVirtualModules();
    } catch (error) {
      logError(`icon refresh failed — keeping previous icons: ${errorMessage(error)}`);
    }
  };

  const scheduleRefresh = (): void => {
    refreshChain = refreshChain.then(refresh);
  };

  // -- watcher events -------------------------------------------------

  const onWatchEvent = (file: string): void => {
    const callbacks = watches.get(file);
    if (!callbacks) return;
    for (const onChange of callbacks) onChange();
    scheduleRefresh();
  };

  /** drop every scanned-module entry for a deleted path — a file, or
   *  everything under a deleted directory (codex r2 M3: the transform
   *  never fires for a removed module, so without this the scanned
   *  union keeps its refs and the served artifact stays stale) */
  const forgetScannedModules = (path: string, directory: boolean): boolean => {
    let changed = false;
    for (const id of scannedByModule.keys()) {
      const bare = id.split('?')[0]!;
      const hit = directory ? bare.startsWith(`${path}/`) : bare === path;
      if (hit) {
        scannedByModule.delete(id);
        changed = true;
      }
    }
    return changed;
  };

  const onUnlinkEvent = (path: string, directory = false): void => {
    if (libraryOptions === null) return;
    if (!forgetScannedModules(path, directory)) return;
    const union = mergeScannedRefs(Array.from(scannedByModule.values()).flat());
    if (scannedUnionKeyOf(union) === scannedUnionKeyOf(scannedUnion)) return;
    scannedUnion = union;
    scheduleRefresh();
  };

  // -- hooks ----------------------------------------------------------

  const plugin: IconPlugin = {
    name: 'jixoai-icons',
    enforce: 'pre',

    /** capture the project root (the artifact `output` joins to it) and
     *  the command — the eager-walk (build) vs transform-collector
     *  (serve) switch for the prefix compiler's two entries */
    configResolved(config: { root: string; command?: string }): void {
      if (typeof config.root === 'string' && config.root.length > 0) {
        projectRoot = config.root;
      }
      if (typeof config.command === 'string') {
        viteCommand = config.command;
      }
    },

    /** await the provider factory + the library pipeline; failures fail the build by design */
    async buildStart(): Promise<void> {
      await ensureBuilt();
    },

    resolveId(id: string, importer: string | undefined): string | null {
      // library chunk modules — when the library face is NOT configured
      // the fixed overflow sentinel fires (design §5): an unwired
      // overflow consumer gets the named build error, never vite's
      // generic unresolved-import message
      if (isChunkModuleId(id)) {
        if (libraryOptions === null) {
          throw new Error(ICON_LIBRARY_SENTINEL_ERROR);
        }
        const index = chunkIndexOf(id);
        return index === null ? null : `\0${ICON_CHUNK_MODULE_PREFIX}${index}`;
      }

      // CSS entries import the bare id; JS consumers use the explicit ?dom form
      const kind = classifyVirtualId(id);
      if (kind !== null) {
        return kind === 'js' ? RESOLVED_JS_ID : RESOLVED_CSS_ID;
      }

      // the artifact module: claim the configured output path so load()
      // can serve the GENERATED text (dev stays fresh even when the
      // on-disk file is stale). extensionless relative imports resolve
      // through vite's own resolver to the same path and are served by
      // load() below; $lib-style aliases keep serving the on-disk file
      // (drift-warn covers those — freshness is CI's job)
      if (libraryOptions !== null) {
        const artifact = artifactPath();
        if (
          artifact !== null &&
          (id === artifact ||
            (importer !== undefined &&
              resolvePath(dirname(importer), id) === artifact))
        ) {
          return artifact;
        }
      }
      return null;
    },

    async load(id: string): Promise<string | null> {
      // lazy chunk modules: export default {name:{v,n,d}} (design §3)
      const chunkIndex = chunkIndexOf(id);
      if (chunkIndex !== null) {
        await ensureBuilt();
        const code = library?.chunks.get(chunkIndex);
        if (code === undefined) {
          throw new Error(
            `[jixoai-icons] virtual chunk ${chunkIndex} requested but the configured library has no such chunk — the importing artifact was generated from a different library config (regenerate icon-set.gen.ts)`,
          );
        }
        servedChunkIds.add(`\0${ICON_CHUNK_MODULE_PREFIX}${chunkIndex}`);
        return code;
      }

      // the artifact module — the generator's current output
      const artifact = artifactPath();
      if (libraryOptions !== null && artifact !== null && id === artifact) {
        await ensureBuilt();
        return library?.artifact ?? null;
      }

      const kind = classifyVirtualId(id);
      if (kind === null) return null;
      await ensureBuilt();
      return kind === 'js' ? jsCode : cssCode;
    },

    /**
     * the DEV-INCREMENTAL scanner collector (design §1b): collect the
     * module's static name literals under ENABLED preset prefixes; a
     * scanned-set UNION change rides scheduleRefresh — one full-reload
     * cycle, exactly like a config edit. NEVER rewrites code (null
     * pass-through — sources are never rewritten, the ruled form), and
     * inert outside dev (build mode is served by the eager walk at
     * buildStart) and without enabled presets.
     */
    transform(code: string, id: string): { code: string; map: null } | null {
      if (libraryOptions === null || viteCommand !== 'serve') return null;
      const prefixes = enabledPrefixes();
      if (prefixes.length === 0) return null;
      const artifact = artifactPath();
      if (!isScannableModuleId(id, artifact)) return null;

      const refs = collectScannedRefs(code, prefixes);
      if (refs.length === 0) {
        if (!scannedByModule.has(id)) return null; // nothing to forget
        scannedByModule.delete(id);
      } else {
        scannedByModule.set(id, refs);
      }
      const union = mergeScannedRefs(
        Array.from(scannedByModule.values()).flat(),
      );
      if (scannedUnionKeyOf(union) === scannedUnionKeyOf(scannedUnion)) {
        return null; // per-module churn, same set — nothing to regenerate
      }
      scannedUnion = union;
      scheduleRefresh(); // the slot face's refresh path (module-graph + full reload)
      return null;
    },

    configureServer(devServer: ViteDevServer): void {
      server = devServer;
      server.watcher.on('change', onWatchEvent);
      // atomic-saving editors replace files (unlink + add), not just change
      server.watcher.on('add', onWatchEvent);
      // deletions leave the scanned set (codex r2 M3 — the transform
      // never fires for a removed module)
      server.watcher.on('unlink', (file: string) => onUnlinkEvent(file));
      server.watcher.on('unlinkDir', (dir: string) => onUnlinkEvent(dir, true));
      // replay watches registered before the server existed
      for (const watched of watches.keys()) server.watcher.add(watched);
    },
  };

  return plugin;
}
