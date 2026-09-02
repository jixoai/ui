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
 */

import { readFile } from 'node:fs/promises';
import { extname, resolve as resolvePath } from 'node:path';
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

// ── virtual module ids ─────────────────────────────────────────────

/** the public import id (CSS entries: @import 'virtual:jixoai-icons') */
export const VIRTUAL_MODULE_ID = 'virtual:jixoai-icons';

/**
 * resolved virtual ids. the `\0` prefix is the rollup/vite convention for
 * "our virtual module" — it keeps other plugins/resolvers from touching it.
 */
const RESOLVED_PREFIX = `\0${VIRTUAL_MODULE_ID}`;
const RESOLVED_CSS_ID = RESOLVED_PREFIX;
const RESOLVED_JS_ID = `${RESOLVED_PREFIX}?dom`;

/** which virtual module an id refers to */
type VirtualKind = 'css' | 'js';

/**
 * classify a (raw or resolved) module id as one of our virtual modules.
 * tolerant of the `\0` prefix and of vite's cache-busting query params
 * (`?t=…` appended by moduleGraph invalidation).
 */
function classifyVirtualId(id: string): VirtualKind | null {
  const bare = id.startsWith('\0') ? id.slice(1) : id;
  if (bare === VIRTUAL_MODULE_ID) return 'css';
  if (bare === `${VIRTUAL_MODULE_ID}?dom` || bare.startsWith(`${VIRTUAL_MODULE_ID}?dom&`)) {
    return 'js';
  }
  if (bare.startsWith(`${VIRTUAL_MODULE_ID}?`)) return 'css';
  return null;
}

// ── options ────────────────────────────────────────────────────────

/** createIconPlugin() plugin options */
export interface IconPluginOptions {
  /** the icon provider factory — awaited at build start with a ProviderContext */
  readonly icons: IconProviderFactory;
  /**
   * safety checker configuration (follow-up C5). defaults to
   * `{ mode: 'warn' }` — rejected icons serve the standard layer's
   * inline fallback. pass `{ mode: 'error', … }` (and/or tighter
   * limits) to fail the build instead, e.g. for HTTP-sourced icons.
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
 * create the icon plugin standalone (canonical entry: the `icons` option
 * of the `jixoai()` umbrella in `@jixoai/vite-plugin`).
 *
 * ```ts
 * // vite.config.ts — umbrella (preferred)
 * import { jixoai } from '@jixoai/vite-plugin';
 * import { lucideIconProvider } from '@jixoai/vite-plugin/icons';
 * export default { plugins: [sveltekit(), tailwindcss(), ...jixoai({ icons: { provider: lucideIconProvider() } })] };
 *
 * // standalone (icons feature only)
 * import { createIconPlugin } from '@jixoai/vite-plugin/icons';
 * export default { plugins: [createIconPlugin({ icons: lucideIconProvider() })] };
 * ```
 */
export function createIconPlugin(options: IconPluginOptions): Plugin {
  // follow-up C5: consumers can replace the default warn-mode checker;
  // the checker is per-plugin-instance (never a module-level singleton)
  const checker = createSafetyChecker(options.safety ?? { mode: 'warn' });

  let provider: IconProvider | null = null;
  let cssCode = '';
  let jsCode = '';
  let server: ViteDevServer | null = null;
  let buildPromise: Promise<void> | null = null;
  let refreshChain: Promise<void> = Promise.resolve();

  /** watched files (absolute) → provider-registered change callbacks */
  const watches = new Map<string, Set<() => void>>();

  const logError = (message: string): void => {
    const logger = server?.config.logger;
    if (logger) logger.error(`[jixoai-icons] ${message}\n`, { timestamp: true });
    else console.error(`[jixoai-icons] ${message}`);
  };

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

  const start = async (): Promise<void> => {
    provider = await options.icons(createContext());
    const generated = generateModules(provider, checker);
    cssCode = generated.css;
    jsCode = generated.js;
  };

  const ensureBuilt = (): Promise<void> => {
    buildPromise ??= start();
    return buildPromise;
  };

  const invalidateVirtualModules = (): void => {
    if (!server) return;
    for (const id of [RESOLVED_CSS_ID, RESOLVED_JS_ID]) {
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

  // -- hooks ----------------------------------------------------------

  const plugin: Plugin = {
    name: 'jixoai-icons',
    enforce: 'pre',

    /** await the provider factory; failures fail the build by design */
    async buildStart(): Promise<void> {
      await ensureBuilt();
    },

    resolveId(id: string, importer: string | undefined): string | null {
      const kind = classifyVirtualId(id);
      if (kind === null) return null;
      // CSS entries import the bare id; JS consumers use the explicit ?dom form
      return kind === 'js' ? RESOLVED_JS_ID : RESOLVED_CSS_ID;
    },

    async load(id: string): Promise<string | null> {
      const kind = classifyVirtualId(id);
      if (kind === null) return null;
      await ensureBuilt();
      return kind === 'js' ? jsCode : cssCode;
    },

    configureServer(devServer: ViteDevServer): void {
      server = devServer;
      server.watcher.on('change', onWatchEvent);
      // atomic-saving editors replace files (unlink + add), not just change
      server.watcher.on('add', onWatchEvent);
      // replay watches registered before the server existed
      for (const watched of watches.keys()) server.watcher.add(watched);
    },
  };

  return plugin;
}
