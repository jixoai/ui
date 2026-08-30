import { sveltekit } from '@sveltejs/kit/vite';
import { jixoai } from '@jixoai/vite-plugin';
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

export default defineConfig({
  plugins: [sveltekit(), tailwindcss(), ...jixoai(), devRegistryFallback()],
});
