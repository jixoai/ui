/**
 * @jixoai/ui-plugin — vite integration (P3.3)
 *
 * jxUI() returns a Vite plugin that:
 *   1. owns ALL file I/O — providers receive loaded bytes through a
 *      ProviderContext (loadSource/watchFile); they never touch the
 *      filesystem (frozen principle #4)
 *   2. awaits the IconProviderFactory at build start (font/svg loading
 *      is async)
 *   3. serves `virtual:@jixoai/ui-plugin/icons` as a virtual CSS module:
 *
 *        @layer theme {
 *          :root {
 *            --jx-icon-calendar: url("data:image/svg+xml,...");
 *            ...
 *          }
 *        }
 *
 *      …for `@import 'virtual:@jixoai/ui-plugin/icons';` in the
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
import { createSafetyChecker } from './safety.js';
import { serializeIcon } from './serializer.js';
import { SLOT_NAMES, SLOT_REGISTRY } from './types.js';
import type {
  IconProvider,
  IconProviderFactory,
  SourceDescriptor,
} from './types.js';

// ── virtual module ids ─────────────────────────────────────────────

/** the public import id (CSS entries: @import 'virtual:@jixoai/ui-plugin/icons') */
export const VIRTUAL_MODULE_ID = 'virtual:@jixoai/ui-plugin/icons';

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

/** jxUI() plugin options */
export interface JxUIPluginOptions {
  /** the icon provider factory — awaited at build start with a ProviderContext */
  readonly icons: IconProviderFactory;
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
      throw new Error(`jxUI: WOFF 1.0 is not supported (${path}) — convert to TTF or WOFF2`);
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
  if (ext === '.woff2') throw new Error(`jxUI: not a valid WOFF2 file (${path})`);
  throw new Error(`jxUI: unrecognized icon source format (${path})`);
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
      'jxUI: WOFF2 source encountered but the optional dependency "wawoff2" is not installed ' +
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
const defaultChecker = createSafetyChecker({ mode: 'warn' });

function generateModules(provider: IconProvider): { readonly css: string; readonly js: string } {
  const declarations: string[] = [];
  const domEntries: string[] = [];

  for (const slot of SLOT_NAMES) {
    const asset = provider.getIcon(slot);
    if (asset === null) continue; // not this provider's slot — standard layer fallback serves
    // serializeIcon returns null when a warn-mode safety check rejects the
    // asset — the slot is omitted and the standard layer fallback serves
    const value = serializeIcon(asset, 'css-var', defaultChecker);
    if (value === null) continue;
    declarations.push(`    --jx-icon-${slot}: ${value};`);
    if (usesDomInjection(slot)) {
      const domString = serializeIcon(asset, 'dom-string', defaultChecker);
      if (domString !== null) {
        domEntries.push(`  ${slot}: ${JSON.stringify(domString)},`);
      }
    }
  }

  const css =
    declarations.length > 0
      ? `@layer theme {\n  :root {\n${declarations.join('\n')}\n  }\n}\n`
      : `/* jx-ui: no icons resolved — standard layer inline fallbacks serve */\n`;

  const js =
    `export const domIcons = {\n${domEntries.join('\n')}${domEntries.length > 0 ? '\n' : ''}};\n` +
    `export default domIcons;\n`;

  return { css, js };
}

// ── the plugin ─────────────────────────────────────────────────────

/**
 * create the @jixoai/ui-plugin vite plugin.
 *
 * ```ts
 * // vite.config.ts
 * import { jxUI, lucideIconProvider } from '@jixoai/ui-plugin';
 * export default { plugins: [sveltekit(), tailwindcss(), jxUI({ icons: lucideIconProvider() })] };
 * ```
 */
export function jxUI(options: JxUIPluginOptions): Plugin {
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
    if (logger) logger.error(`[jx-ui] ${message}\n`, { timestamp: true });
    else console.error(`[jx-ui] ${message}`);
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
    const generated = generateModules(provider);
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
   */
  const refresh = async (): Promise<void> => {
    try {
      await start();
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
    name: 'jx-ui',
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
