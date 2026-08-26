/**
 * tw-context-probe runner — runs OUTSIDE vitest (child process).
 * vitest's virtual module runner breaks rolldown's tsconfig
 * discovery; a plain node child keeps the build identical to the
 * real consumer pipeline (vite 8 + @tailwindcss/vite from
 * apps/www's own node_modules).
 *
 * usage: node tw-context-probe-runner.mjs <fixtureDir> <outDir>
 * stdout: JSON { ok: true, css } | { ok: false, error }
 */
import { build } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const [, , fixtureDir, outDir] = process.argv;

/** vite nests the bundle under <outDir>/assets/ — search one level. */
function findCss(dir) {
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    if (name.isFile() && name.name.endsWith('.css')) {
      return readFileSync(join(dir, name.name), 'utf8');
    }
    if (name.isDirectory() && name.name !== 'fonts') {
      const nested = findCss(join(dir, name.name));
      if (nested !== null) return nested;
    }
  }
  return null;
}

try {
  await build({
    root: fixtureDir,
    configFile: false,
    plugins: [tailwindcss()],
    logLevel: 'silent',
    build: {
      outDir,
      emptyOutDir: true,
      rollupOptions: { input: resolve(fixtureDir, 'main.js') },
    },
  });
  const css = findCss(resolve(fixtureDir, outDir)) ?? '';
  process.stdout.write(JSON.stringify({ ok: true, css }));
} catch (error) {
  process.stdout.write(JSON.stringify({ ok: false, error: String(error?.message ?? error) }));
}
