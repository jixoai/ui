import { sveltekit } from '@sveltejs/kit/vite';
import { jixoai } from '@jixoai/vite-plugin';
import { lucideIconProvider } from '@jixoai/vite-plugin/icons';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, type Plugin } from 'vite';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import type { IncomingMessage, ServerResponse } from 'node:http';

// Dev-only `/r/*.json` fallback (site-polish F5): the docs site links
// `/r/registry.json` (footer, docs-nav, registry overview), but the
// registry JSON lives in the repo-root `public/r/` — written by
// `scripts/build-site.mjs`, NOT inside the www asset space — so the dev
// server 404s every link into the SPA fallback. This middleware maps a
// missing `/r/<name>.json` (and the `/registry.json` alias) onto the
// repo-root file, read-only. It never writes: `build-site.mjs` stays
// the only WRITER of `public/r/`. A miss passes through untouched so
// the 404 stays honest.
function devRegistryFallback(): Plugin {
  const wwwDir = dirname(fileURLToPath(import.meta.url));
  const repoPublicR = resolve(wwwDir, '../../public/r');

  const serve = (res: ServerResponse, file: string): void => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    createReadStream(file).pipe(res);
  };

  return {
    name: 'dev-registry-fallback',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const url = (req.url ?? '').split('?')[0];
        let name: string | undefined;
        if (url.startsWith('/r/') && url.endsWith('.json')) {
          name = url.slice('/r/'.length);
        } else if (url === '/registry.json') {
          name = 'registry.json';
        }
        if (!name || name.includes('/') || name.includes('..')) return next();
        const file = join(repoPublicR, name);
        if (existsSync(file) && statSync(file).isFile()) return serve(res, file);
        return next();
      });
    },
  };
}

// Dev-only /search/corpus.json fallback (r9 acceptance, S1): the
// search palette fetches the page-semantics corpus, but the corpus is
// written into the repo-root public/search/ by build-site's declared
// phase (never inside the www asset space), so dev 404s and the
// palette reads as "no matches" (Owner hit exactly this). Same law as
// devRegistryFallback: read-only mapping onto the repo-root file, the
// build stays the only writer, a miss passes through so the 404 stays
// honest (no public/ yet: search stays empty until one root build;
// the middleware logs the hint once).
function devSearchCorpusFallback(): Plugin {
  const wwwDir = dirname(fileURLToPath(import.meta.url));
  const corpusFile = resolve(wwwDir, '../../public/search/corpus.json');
  let hinted = false;

  return {
    name: 'dev-search-corpus-fallback',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use((req: IncomingMessage, res: ServerResponse, next: () => void) => {
        const url = (req.url ?? '').split('?')[0];
        if (url !== '/search/corpus.json') return next();
        if (existsSync(corpusFile) && statSync(corpusFile).isFile()) {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          createReadStream(corpusFile).pipe(res);
          return;
        }
        if (!hinted) {
          hinted = true;
          server.config.logger.info(
            '[dev-search-corpus] no public/search/corpus.json yet (run a root npm run build once)',
          );
        }
        return next();
      });
    },
  };
}

// Dev-only registry ⇄ www mirror sync (scripts overhaul 2026-08-31).
// registry/files/** is the canonical source tree; apps/www/src/lib/**
// holds byte-identical mirrors (the mirror-manifest law). Editing
// either side during dev propagates the exact bytes to the other —
// vite's own chokidar both observes (the www side is inside root; the
// registry tree is explicitly added) and hot-reloads the www copy.
// apply:'serve' — build-time sync is nobody's business (verify:mirror
// is the gate), and `server.watcher` only exists under the dev server.
//
// The mirror LOGIC loads through a RUNTIME dynamic import anchored on
// cwd, not a static import: vite bundles the config with esbuild, and
// a static relative import from outside the vite root drags the
// bundler into re-shaping node_modules externals (observed: the
// tailwindcss named export vanishing). The logic stays single-sourced
// at scripts/lib/mirror-sync.mjs (the mirror gate reads the same law).
function devMirrorSync(): Plugin {
  return {
    name: 'dev-mirror-sync',
    apply: 'serve',
    async configureServer(server) {
      const { createMirrorSync } = await import(
        join(process.cwd(), '../../scripts/lib/mirror-sync.mjs')
      );
      const sync = createMirrorSync(resolve(process.cwd(), '../..'));
      void sync.reportDrift();
      // the registry tree lives outside the vite root — hand it to
      // chokidar explicitly; the www side is already watched
      server.watcher.add(join(process.cwd(), '../../registry/files'));
      for (const event of ['add', 'change', 'unlink'] as const) {
        server.watcher.on(event, (path: string) => sync.schedule(path));
      }
    },
  };
}

// icons-docs ICON-4 (2026-09-02): the site dogfoods the icon plugin
// pipeline — lucide's inline defaults, default warn-mode safety, every
// slot default (zero overrides). src/routes/+layout.svelte imports
// 'virtual:jixoai-icons.css', so the rendering path really consumes the
// plugin output: the serializer's declarations ride every build,
// byte-identical to jx-pure.css's frozen vocabulary block (same
// @layer theme :root names and values — dual supply, rendering
// zero-diff); apps/www/test/icons-dogfood.spec.ts locks the built dist
// against drift.
//
// Why the .css alias exists (and `@import 'virtual:jixoai-icons'` in
// app.css does NOT): the plugin's documented CSS-entry posture assumes
// vite's own CSS pipeline, but this site's entry is compiled by
// @tailwindcss/vite's generate pass, which resolves the entry's whole
// @import graph through enhanced-resolve WITHOUT plugin resolveId
// hooks — a virtual: id fails the build there ("Can't resolve
// 'virtual:jixoai-icons'", observed 2026-09-02). A bare JS import
// fails too: vite classifies CSS modules by CSS_LANGS_RE on the module
// id, and the plugin's resolveId normalizes every css-kind specifier
// to the extension-less '\0virtual:jixoai-icons' (which vite would
// then parse as JS). The alias below resolves to a .css-suffixed id —
// css-classified — and LOADS by delegating to the registered icon
// plugin's own load hook: same single plugin instance, same provider
// factory, same serializer; no packages/ change, no second config.
// (Dev-HMR note: the icon plugin invalidates only its own module id;
// the lucide provider registers no watched files, so the alias can
// never go stale short of a restart.)
const jixoaiPlugins = jixoai({
  icons: { provider: lucideIconProvider(), safety: { mode: 'warn' } },
});
const jixoaiIconsPlugin = jixoaiPlugins.find((plugin) => plugin.name === 'jixoai-icons');
if (!jixoaiIconsPlugin) {
  throw new Error('jixoai({ icons }) did not register the jixoai-icons plugin');
}

function jixoaiIconsCssEntry(): Plugin {
  const SPECIFIER = 'virtual:jixoai-icons.css';
  const RESOLVED_ID = '\0virtual:jixoai-icons.css';
  return {
    name: 'www-jixoai-icons-css-entry',
    enforce: 'pre',
    resolveId(id) {
      if (id === SPECIFIER) return RESOLVED_ID;
      return null;
    },
    async load(id) {
      if (id !== RESOLVED_ID) return null;
      const load = jixoaiIconsPlugin.load;
      if (typeof load !== 'function') {
        throw new Error('jixoai-icons plugin exposes no load hook');
      }
      // classifyVirtualId('virtual:jixoai-icons') → the CSS module; its
      // load awaits the provider factory itself (idempotent with the
      // plugin's own buildStart)
      return load.call(this, 'virtual:jixoai-icons');
    },
  };
}

export default defineConfig({
  plugins: [
    sveltekit(),
    tailwindcss(),
    ...jixoaiPlugins,
    jixoaiIconsCssEntry(),
    devRegistryFallback(),
    devSearchCorpusFallback(),
    // devMirrorSync loads scripts/lib/site-only.mjs ONCE at server
    // start (static import, cached per process): a NEW site-only
    // classification only takes effect after a config-change restart
    // — removing a mirror copy before the restart propagates as a
    // mirror DELETION back onto the www original (learned live,
    // icons-docs integration 2026-09-02).
    devMirrorSync(),
  ],
});
