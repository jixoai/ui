#!/usr/bin/env node
/**
 * The ONE dev entry (scripts/dev.mjs, scripts overhaul 2026-08-31).
 *
 *   pnpm dev                    # vite dev on :5199 (the dev server's
 *                               # own vite plugin runs the registry ⇄
 *                               # www mirror sync — see
 *                               # apps/www/vite.config.ts devMirrorSync)
 *   pnpm dev --port 3000        # custom port (any vite flag passes through)
 *   pnpm dev --prod             # production mode + the experimental
 *                               # client bundle strategy (single file)
 *   JIXOAI_BUNDLE=inline pnpm dev --prod   # pick split|single|inline
 *   bun run --bun dev           # the whole chain (this script AND vite)
 *                               # runs under bun — runtime transparency:
 *                               # children spawn from process.execPath,
 *                               # nothing names node or npm
 *
 * What it replaces: `shadcn build --watch` (a flag the CLI never had —
 * the old root `dev` was broken outright) and dev-site.mjs (which
 * spawned npm by name). This is now a THIN argument translator: the
 * mirror sync rides the dev server itself (any way you start it —
 * this entry, `vite dev` directly, bun — the plugin is always in),
 * and the registry JSON payloads (public/r/*.json) are BUILD output
 * (`build:registry`), never needed in dev (the fallback middleware
 * serves /r/*.json from the committed public/).
 */
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { resolveViteBin } from './lib/vite-bin.mjs';

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const wwwDir = join(repoRoot, 'apps', 'www');

const args = process.argv.slice(2);
const hasFlag = (name) => args.includes(name);
const flagValue = (name, fallback) => {
  const at = args.indexOf(name);
  return at >= 0 && args[at + 1] && !args[at + 1].startsWith('-') ? args[at + 1] : fallback;
};

// --prod: dev server in production mode + the experimental client
// bundle strategy. SvelteKit's kit.output.bundleStrategy
// ('split'|'single'|'inline', since 2.13) is read by svelte.config.js
// from JIXOAI_BUNDLE; --prod defaults it to 'single'.
const prod = hasFlag('--prod');
const bundleStrategy = process.env.JIXOAI_BUNDLE ?? (prod ? 'single' : undefined);
if (bundleStrategy && !['split', 'single', 'inline'].includes(bundleStrategy)) {
  console.error(`[dev] JIXOAI_BUNDLE must be split|single|inline (got ${JSON.stringify(bundleStrategy)})`);
  process.exit(1);
}

const port = flagValue('--port', '5199');
// vite receives: our consumed flags translated + everything else verbatim
const passthrough = args.filter((a, i) => {
  if (a === '--prod' || a === '--port') return false;
  if (args[i - 1] === '--port') return false; // the value --port consumed
  return true;
});
const viteArgs = ['dev', '--port', port, ...passthrough];
if (prod) viteArgs.push('--mode', 'production');

const env = { ...process.env };
if (bundleStrategy) env.JIXOAI_BUNDLE = bundleStrategy;

console.log(`[dev] vite ${viteArgs.join(' ')}${bundleStrategy ? ` (bundle: ${bundleStrategy})` : ''}`);
const child = spawn(process.execPath, [resolveViteBin(wwwDir), ...viteArgs], {
  cwd: wwwDir,
  stdio: 'inherit',
  env,
});
child.on('exit', (code) => process.exit(code ?? 0));
