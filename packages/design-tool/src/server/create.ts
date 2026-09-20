/**
 * @jixoai/ui-design (server) — createDesignViteServer (T3).
 *
 * Orthogonal intents (3):
 *   1. synthesize the ONE vite dev server config (svelte + tailwind v4
 *      + @jixoai/ui-vite-plugin with icons channels + the design
 *      surface plugins), with the probe's alias table — this is the
 *      whole plugin matrix of registry/vite.config.ts minus sveltekit,
 *      plus ghostty OFF (the design studio does not resolve wasm at
 *      startup; the registry vehicle keeps ghostty on its own config).
 *   2. the three surfaces on one origin (design.md §1):
 *      /__design__/ studio SPA (host-owned design/studio.svelte),
 *      /__design__/frame ref-mounting surface (?p=&f=&theme=&w=&h=),
 *      /prototypes/<name>/ canvas pages — plus the API endpoints
 *      (manifest.json, knowledge.json, agent.json, chat SSE, the
 *      M7a collab op lane /__design__/api/collab/*, and the
 *      collab-presence websocket /__design__/ws on the http server's
 *      upgrade lane — path-scoped, Vite HMR passes untouched).
 *   3. module plumbing for split installs: the plugin set is imported
 *      through the probe's moduleRoot (this repo installs per-vehicle,
 *      not at the root), the stable virtual entry ids resolve to REAL
 *      entry files in this package (import.meta.glob's root-relative
 *      literals work from any file location — virtual-module glob was
 *      the risk, real files kill it), and the icons CSS entry rides
 *      the same alias trick as registry/vite.config.ts:130-168.
 *
 * Original need: Owner 2026-09-11 (`jixoai-ui design`, design-studio
 * change T3; tasks.md T0 probe feeds the alias table).
 */

import type { IncomingMessage, ServerResponse } from 'node:http';
import { realpathSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import type { DesignAgent } from '../agent/types.ts';
import { agentMiddleware } from '../agent/sse.ts';
import { loadKnowledgePack } from '../knowledge/knowledge.ts';
import { promotionStatus } from '../pipeline/promote.ts';
import { collabApiMiddleware } from './collab-api.ts';
import { dshSettingsApiMiddleware } from './settings/dsh-settings-api.ts';
import { openCollabHost, viteWatcherAdapter, type CollabHost } from './collab-host.ts';
import { metaMiddleware } from './meta/endpoint.ts';
import type { DesignHostInfo } from './probe.ts';
import { probeDesignHost } from './probe.ts';
import { attachPresenceGateway, type PresenceGateway } from './presence/gateway.ts';
import { resolvePackageEntry } from './resolver.ts';
import { scanPrototypes } from './manifest.ts';
import { buildStampHmrPlugin, buildStampPlugin } from './stamp/index.ts';
import { serveStudioAsset, serveStudioIndex, STUDIO_DIST_DIR } from './studio-dist.ts';
import { svelteFileAliases } from './svelte-aliases.ts';
import type { Plugin, InlineConfig, Alias, ViteDevServer } from 'vite';

/* ── stable module ids and the real files behind them ─────────────────── */

const ENTRIES_DIR = join(dirname(fileURLToPath(import.meta.url)), 'entries');
const PACKAGE_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

/** surface entry ids (the design.md §2 vocabulary — stable across hosts) */
const STUDIO_ENTRY = 'virtual:jixoai-design/studio-entry';
const FRAME_ENTRY = 'virtual:jixoai-design/frame-entry';
const CANVAS_ENTRY = 'virtual:jixoai-design/canvas-entry';
/** the css entry every surface imports (app.css when the probe found one) */
const CSS_ENTRY = 'virtual:jixoai-design/css';

const ICONS_CSS_SPECIFIER = 'virtual:jixoai-icons.css';
const ICONS_CSS_RESOLVED = `\0${ICONS_CSS_SPECIFIER}`;
const ICONS_PLUGIN_NAME = 'jixoai-icons';

export interface CreateDesignServerOptions {
  /** dev server port (default 5199 — the design-studio brief's smoke port) */
  readonly port?: number;
  /** refuse port drift (default true — deep links stay honest) */
  readonly strictPort?: boolean;
  /** the agent behind /__design__/api/chat (default: none — read-only studio) */
  readonly agent?: DesignAgent;
  /** server host (default 'localhost') */
  readonly hostname?: string;
}

/* ── HTML shells (served by the surface middleware) ───────────────────── */

function htmlShell(title: string, rootId: string, entryId: string, extraHead = ''): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
${extraHead}<style>html,body{margin:0;padding:0}#${rootId}{min-height:100vh}</style>
</head>
<body>
<div id="${rootId}"></div>
<script type="module" src="/@id/${entryId}"></script>
</body>
</html>
`;
}

/* ── the surface plugin: entry ids + HTML/API middlewares ─────────────── */

/**
 * The late-bound collab host reference: vite assembles the server (and
 * runs configureServer) BEFORE createDesignViteServer opens the collab
 * host — the middleware closes over this cell and reads it per request
 * (requests only arrive after listen, when the cell is populated or
 * honestly undefined — the M6b corrupt-journal degrade).
 */
export interface CollabHostCell {
  host: CollabHost | undefined;
}

function designSurfacesPlugin(host: DesignHostInfo, agent: DesignAgent, collab: CollabHostCell): Plugin {
  const frameHtml = () => htmlShell('frame — jixoai design', 'frame-root', FRAME_ENTRY);
  const canvasHtml = () => htmlShell('canvas — jixoai design', 'canvas-root', CANVAS_ENTRY);

  return {
    name: 'jixoai-design-surfaces',
    enforce: 'pre',

    resolveId(id) {
      // stable specifiers → REAL files (alias semantics): the entries'
      // import.meta.glob literals and bare imports then resolve through
      // vite's normal pipeline with the host root
      if (id === STUDIO_ENTRY) return join(ENTRIES_DIR, 'studio-entry.js');
      if (id === FRAME_ENTRY) return join(ENTRIES_DIR, 'frame-entry.js');
      if (id === CANVAS_ENTRY) return join(ENTRIES_DIR, 'canvas-entry.js');
      if (id === CSS_ENTRY) return host.appCss ?? join(ENTRIES_DIR, 'css-stub.js');
      return null;
    },

    configureServer(server) {
      // agent seam first (POST chat + agent info)
      server.middlewares.use(agentMiddleware(agent));

      // the property-panel service pair (r2 T7/T8 → M7a): on-demand
      // schema extraction over the itemAliasBase anchor + the collab op
      // lane (usage/admit/sync/undo — the prop-edit file-CAS endpoint
      // retired with the panel's migration)
      server.middlewares.use(metaMiddleware(host));
      server.middlewares.use(collabApiMiddleware(() => collab.host));

      // the settings panel's dsh lane (design-settings-panel S2): GET/
      // POST settings + credential set/clear + connection test
      server.middlewares.use(dshSettingsApiMiddleware());

      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const pathname = (req.url ?? '').split('?')[0]!;
        if (req.method !== 'GET' && req.method !== 'HEAD') return next();

        // studio SPA — the PREBUILT static bundle (issue #18): the
        // chrome is a product surface the server HOSTS, never compiles.
        // Absent bundle → the LOUD guidance page (503, points at
        // `npm run build:studio`) — no silent fallback to a dev studio
        if (pathname === '/__design__' || pathname === '/__design__/' || pathname === '/__design__/index.html') {
          serveStudioIndex(STUDIO_DIST_DIR, res);
          return;
        }

        // frame surface (?p=&f=&theme=&w=&h= ride the same document)
        if (pathname === '/__design__/frame') {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(frameHtml());
          return;
        }

        // canvas pages: /prototypes/<name>/ — name validated as a single
        // path segment (module ids derive from it)
        const canvasMatch = /^\/prototypes\/([A-Za-z0-9._-]+)\/?$/.exec(pathname);
        if (canvasMatch !== null) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(canvasHtml());
          return;
        }

        // API: manifest (re-scanned per request — new prototypes show up
        // on the next navigator poll; design/ sits inside the vite root
        // so file adds also propagate through the watcher)
        if (pathname === '/__design__/api/manifest.json') {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(scanPrototypes(host.designDir)));
          return;
        }

        // API: knowledge snapshot (the guide panel's single source)
        if (pathname === '/__design__/api/knowledge.json') {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(loadKnowledgePack()));
          return;
        }

        // API: promotion drift status — the studio badge's data source
        // (r2 T2; same data as `jixoai-ui design status`, re-read per
        // request so the badge refreshes after every save/promote/apply)
        if (pathname === '/__design__/api/promotions.json') {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.end(JSON.stringify(promotionStatus(host.root)));
          return;
        }

        // static studio assets: the bundle's hashed files (base
        // '/__design__/', so the built index.html references land right
        // back here). Runs AFTER the routes above — frame/api own their
        // subpaths, and only paths that map to a real bundle file are
        // consumed (everything else falls through to vite)
        if (serveStudioAsset(STUDIO_DIST_DIR, pathname, res)) {
          return;
        }

        next();
      });
    },
  };
}

/** realpath that tolerates absence — bare hosts boot instead of
 * crashing on fs.allow assembly (see the fs.allow comment) */
function realpathSafe(path: string): string[] {
  try {
    return [realpathSync(path)];
  } catch {
    return [];
  }
}

/* ── icons CSS entry (the registry/vite.config.ts:179-201 trick) ──────── */

/**
 * The icons plugin's virtual CSS cannot be `@import`ed under
 * @tailwindcss/vite (enhanced-resolve skips plugin hooks) and a bare
 * JS import of 'virtual:jixoai-icons' is classified as JS (extension-
 * less id). The .css-suffixed alias loads through the plugin's OWN
 * load hook — same single plugin instance, same provider factory.
 * Copied verbatim in spirit from registry/vite.config.ts (proven there
 * since 2026-09-02).
 */
function designIconsCssEntryPlugin(jixoaiPlugins: readonly Plugin[]): Plugin {
  const iconsPlugin = jixoaiPlugins.find((plugin) => plugin.name === ICONS_PLUGIN_NAME);
  if (iconsPlugin === undefined) {
    throw new Error('[design-server] jixoai({ icons }) did not register the jixoai-icons plugin — the icon pipeline is mandatory for the surfaces');
  }
  return {
    name: 'design-jixoai-icons-css-entry',
    enforce: 'pre',
    resolveId(id) {
      if (id === ICONS_CSS_SPECIFIER) return ICONS_CSS_RESOLVED;
      return null;
    },
    async load(id) {
      if (id !== ICONS_CSS_RESOLVED) return null;
      const load = iconsPlugin.load;
      if (typeof load !== 'function') {
        throw new Error('[design-server] jixoai-icons plugin exposes no load hook');
      }
      return load.call(this, 'virtual:jixoai-icons');
    },
  };
}

/* ── plugin set loading through the probe's moduleRoot ────────────────── */

/** structural shapes of the dynamically imported plugin modules (no any) */
interface SveltePluginModule {
  readonly svelte?: () => Plugin;
  readonly default?: unknown;
}
interface TailwindViteModule {
  readonly tailwindcss?: () => Plugin;
  readonly default?: unknown;
}
interface JixoaiModule {
  readonly jixoai?: (options: Record<string, unknown>) => Plugin[];
  readonly default?: unknown;
}
interface LucideProviderModule {
  readonly lucideIconProvider?: () => unknown;
  readonly default?: unknown;
}
interface ChannelModule {
  readonly md?: () => unknown;
  readonly ph?: () => unknown;
  readonly rx?: () => unknown;
  readonly default?: unknown;
}
interface ViteFactoryModule {
  readonly createServer: (inlineConfig: InlineConfig) => Promise<ViteDevServer>;
}

/**
 * Pick a function export across module shapes (named / default-wrapped /
 * default-as-function — @tailwindcss/vite ships a default, the tsdown
 * built plugin ships named exports). Throws a named error when absent.
 */
function requireExportFn<T>(mod: object, name: string, spec: string): T {
  const record = mod as Record<string, unknown>;
  const candidates = [record[name], (record.default as Record<string, unknown> | undefined)?.[name], record.default];
  for (const candidate of candidates) {
    if (typeof candidate === 'function') return candidate as T;
  }
  throw new Error(`[design-server] ${spec} exposes no usable "${name}" export (keys: ${Object.keys(record).join(', ')})`);
}

async function importFromModuleRoot<T>(moduleRoot: string | null, spec: string): Promise<T> {
  // moduleRoot-aware file resolution; falls back to the plain bare
  // import (standard single-root consumer installs resolve from the
  // design-tool package's own node_modules chain)
  const entry = moduleRoot === null ? null : resolvePackageEntry(moduleRoot, spec);
  if (entry !== null) {
    return (await import(pathToFileURL(entry).href)) as T;
  }
  return (await import(spec)) as T;
}

/* ── the server factory ───────────────────────────────────────────────── */

/**
 * Start ONE vite dev server carrying the three design surfaces over
 * <root> (the host root — the directory containing design/). The
 * caller owns the lifecycle: `const s = await createDesignViteServer(
 * root, { agent }); await s.listen();` (the CLI wraps exactly that).
 *
 * M6b: the returned server also HOSTS the design workspace's collab
 * kernel — `server.collab` (CollabKernel + AdmissionGate + ResyncStation,
 * `.jx-collab/` at the design root, idempotent per workspace). The
 * station rides the server's OWN vite watcher (no second handle), and
 * `server.close()` disposes the host (settle in-flight §8 cycles,
 * release watcher routing) before the vite teardown. Internal
 * accessor only — no new HTTP surface (panels are M7).
 */
export async function createDesignViteServer(
  rootInput: string,
  options: CreateDesignServerOptions = {},
): Promise<ViteDevServer & { collab: CollabHost | undefined; presence: PresenceGateway | undefined }> {
  const root = resolve(rootInput);
  const host = probeDesignHost(root);
  const agent = options.agent ?? (await import('../agent/none.ts')).createNoneAgent();

  // moduleRoot fallback (the CLI's dual-path law, design.md §6.2): a
  // host with NO install of its own (empty dir, first-run scaffold)
  // borrows the plugin set from THIS package's repository — the server
  // code itself runs from that repo, so its install can serve the host
  let moduleRoot = host.moduleRoot;
  if (moduleRoot === null) {
    moduleRoot = probeDesignHost(resolve(PACKAGE_DIR, '../..')).moduleRoot;
  }

  const viteMod = await importFromModuleRoot<ViteFactoryModule>(moduleRoot, 'vite');
  const svelteMod = await importFromModuleRoot<SveltePluginModule>(moduleRoot, '@sveltejs/vite-plugin-svelte');
  const tailwindMod = await importFromModuleRoot<TailwindViteModule>(moduleRoot, '@tailwindcss/vite');
  const jixoaiMod = await importFromModuleRoot<JixoaiModule>(moduleRoot, '@jixoai/ui-vite-plugin');
  const lucideMod = await importFromModuleRoot<LucideProviderModule>(moduleRoot, '@jixoai/ui-vite-plugin/icons');
  const mdMod = await importFromModuleRoot<ChannelModule>(moduleRoot, '@jixoai/ui-vite-plugin/icons/md');
  const phMod = await importFromModuleRoot<ChannelModule>(moduleRoot, '@jixoai/ui-vite-plugin/icons/ph');
  const rxMod = await importFromModuleRoot<ChannelModule>(moduleRoot, '@jixoai/ui-vite-plugin/icons/rx');

  const svelteFactory = requireExportFn<() => Plugin>(svelteMod, 'svelte', '@sveltejs/vite-plugin-svelte');
  const tailwindFactory = requireExportFn<() => Plugin>(tailwindMod, 'tailwindcss', '@tailwindcss/vite');
  const jixoaiFactory = requireExportFn<(options: Record<string, unknown>) => Plugin[]>(jixoaiMod, 'jixoai', '@jixoai/ui-vite-plugin');
  const lucideFactory = requireExportFn<() => unknown>(lucideMod, 'lucideIconProvider', '@jixoai/ui-vite-plugin/icons');
  const mdFactory = requireExportFn<() => unknown>(mdMod, 'md', '@jixoai/ui-vite-plugin/icons/md');
  const phFactory = requireExportFn<() => unknown>(phMod, 'ph', '@jixoai/ui-vite-plugin/icons/ph');
  const rxFactor = requireExportFn<() => unknown>(rxMod, 'rx', '@jixoai/ui-vite-plugin/icons/rx');

  // the jixoai() matrix, ghostty OFF (no wasm resolution at design-server
  // startup; terminal components degrade — recorded in the change report)
  const jixoaiPlugins = jixoaiFactory({
    ghostty: false,
    icons: {
      provider: lucideFactory(),
      safety: { mode: 'warn' },
      library: { includeDefaults: true, channels: [mdFactory(), phFactory(), rxFactor()] },
    },
  });

  // alias table: the stable specifiers + the probe's tables ($lib and
  // the #jixoai/ item tree — registry components import shared libs
  // through $lib/, 548 uses) + per-file svelte aliases (see helper)
  const alias: Alias[] = [
    { find: '#jixoai-design/shell', replacement: join(PACKAGE_DIR, 'src/studio/shell.svelte') },
    { find: /^#jixoai\//, replacement: `${host.itemAliasBase.replaceAll('\\', '/')}/` },
    { find: /^\$lib\//, replacement: `${host.libAliasBase.replaceAll('\\', '/')}/` },
    ...svelteFileAliases(moduleRoot),
  ];

  // the M7a late-binding cell — see CollabHostCell: populated right
  // after createServer resolves, read per request by the collab API
  const collabCell: CollabHostCell = { host: undefined };

  const inlineConfig: InlineConfig = {
    root,
    configFile: false,
    envDir: false, // no .env hunting across the host tree
    appType: 'custom', // the surfaces own routing; no vite SPA fallback
    clearScreen: false,
    // the kit's design-host flag (context.ts hasDesignHost): every
    // module this server transforms sees it — frames upgrade to real
    // iframes instead of the "requires the design server" notice
    // (the V5 re-check catch: A documented the channel, B never set
    // it — the integration seam nobody owned, 2026-09-11)
    define: { 'import.meta.env.VITE_JIXOAI_DESIGN': '"1"' },
    plugins: [
      // the usage-site stamp transform (r2 §3) — enforce:pre, apply:serve:
      // stamps land in the svelte SOURCE before vite-plugin-svelte
      // compiles it, and a host's production build never sees it
      buildStampPlugin({ host }),
      // the #28 companion (enforce post): broadens svelte's compiled
      // acceptExports to cover the stamp transform's __jxUsageMap —
      // without it every panel edit changes an UNACCEPTED export, vite
      // finds no hot boundary and broadcasts full-reload (the whole
      // studio wiped per edit, server log `page reload`, 2026-09-12)
      buildStampHmrPlugin(),
      svelteFactory(),
      tailwindFactory(),
      ...jixoaiPlugins,
      designIconsCssEntryPlugin(jixoaiPlugins),
      designSurfacesPlugin(host, agent, collabCell),
    ],
    resolve: { alias },
    server: {
      port: options.port ?? 5199,
      strictPort: options.strictPort ?? true,
      host: options.hostname ?? 'localhost',
      fs: {
        allow: [
          ...new Set([
            root,
            PACKAGE_DIR,
            host.itemAliasBase,
            dirname(host.itemAliasBase),
            // the aliased $lib tree and its app root (the vehicle's
            // app.css entry + shared utils live there)
            host.libAliasBase,
            dirname(host.libAliasBase),
            // the REAL node_modules of the module root AND of the repo
            // root: font/icon assets resolve through realpathed installs,
            // which a symlinked worktree spells OUTSIDE every other
            // allowed root — jetbrains-mono lives under the vehicle's
            // node_modules, share-tech-mono under the REPO root's
            // (V5 catches: both woff2s 403'd before their realpath
            // ancestors joined the allow list). realpathSafe: a bare
            // host with no node_modules must not crash the server boot
            // (A's r2 smoke caught realpathSync ENOENT killing the
            // process before listen — 2026-09-11)
            ...realpathSafe(join(moduleRoot ?? root, 'node_modules')),
            ...realpathSafe(join(root, 'node_modules')),
          ]),
        ],
      },
    },
    optimizeDeps: {
      // svelte EXCLUDED (the sveltekit monorepo posture): the plugin
      // otherwise auto-includes svelte/* subpaths, and the optimizer
      // resolves against the vite root — which has no svelte in this
      // split-install repository (observed 2026-09-11: "Cannot
      // optimize dependency: svelte/animate"). Excluded, every svelte
      // import resolves through the alias to the moduleRoot install.
      // '@jixoai/ui-design' ships SOURCE — transform, never bundle.
      exclude: ['svelte', '@jixoai/ui-design'],
    },
    // vite 8 environments: the svelte plugin's configEnvironment hook
    // reads the PER-ENVIRONMENT exclude list — the top-level entry
    // alone does not stop the ssr env's SVELTE_IMPORTS include
    // (observed live, 2026-09-11). Cover both environments explicitly.
    environments: {
      client: { optimizeDeps: { exclude: ['svelte', '@jixoai/ui-design'] } },
      ssr: { optimizeDeps: { exclude: ['svelte', '@jixoai/ui-design'] } },
    },
  };

  const server = await viteMod.createServer(inlineConfig);

  // M6b: host the collab kernel over this design workspace. The open is
  // idempotent per workspace (the dsh adapter reuses the same instance
  // through the process registry); a corrupted `.jx-collab/` journal
  // must NOT take the whole studio down — degrade loudly instead
  // (kernel law is fail-stop, the SERVER's posture is read-only studio).
  let collab: CollabHost | undefined;
  try {
    // reconcileAtOpen (M7 收官轮): every KNOWN page runs one §8 reconcile
    // cycle at startup — unhosted hand-edit drift lands, and cross-era
    // `.jx-collab` tree meta realigns to the current planner (the panel's
    // buffer underreport after a protocol upgrade)
    collab = openCollabHost(host.designDir, { watcher: viteWatcherAdapter(server.watcher), reconcileAtOpen: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[design-server] collab host failed to open (${host.designDir}): ${message} — collaborative lanes degraded; the studio/canvas surfaces are unaffected`);
  }
  collabCell.host = collab; // the late-binding cell — the API middleware reads this per request

  // collab-presence: the WS presence gateway rides the SAME http server's
  // upgrade lane. The listener is path-scoped (`/__design__/ws`) — Vite's
  // own HMR websocket (and any other upgrade) passes through untouched.
  // Deliberately INDEPENDENT of the collab host's fate: a degraded kernel
  // (corrupt journal) still serves presence; only journal-tail goes quiet
  // (no admits can commit without a host).
  let presence: PresenceGateway | undefined;
  if (server.httpServer !== null) {
    presence = attachPresenceGateway(server.httpServer, { designDir: host.designDir });
  } else {
    console.error('[design-server] no http server to host the presence gateway — presence degraded (middleware-mode host?)');
  }
  // server.close() drops the upgrade lane first (no late ws may hit a
  // closing wss), then settles the collab host, then runs the vite teardown
  const closeServer = server.close.bind(server);
  server.close = async (): Promise<void> => {
    presence?.close();
    await collab?.dispose();
    await closeServer();
  };
  return Object.assign(server, { collab, presence });
}

/* ── note on the retired #28 ws.send redirect (issue #18) ───────────────
 *
 * retargetDesignFullReloads (design/prototype full-reloads retargeted to
 * the jx-design:surface-reload custom event) is RETIRED with the static
 * studio: the studio document no longer carries the vite HMR client, so
 * a native full-reload broadcast physically cannot wipe it (#28's harm
 * is gone by construction), while the frame/canvas documents keep their
 * vite clients and reload themselves through the native path. The
 * surface-reload LISTENERS stay in frame-entry/canvas-entry (guarded by
 * import.meta.hot — dead but harmless); the stamp HMR broadener
 * (buildStampHmrPlugin) stays live so per-edit stamp exports keep
 * riding true HMR on the dynamic faces. */
