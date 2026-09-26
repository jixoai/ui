/**
 * tw-context-probe runner — runs OUTSIDE vitest (child process).
 * vitest's virtual module runner breaks rolldown's tsconfig
 * discovery; a plain node child keeps the build identical to the
 * real consumer pipeline (vite 8 + @tailwindcss/vite).
 *
 * ENGINE RESOLUTION (W5-r2, 2026-09-21): the site manifest dropped
 * @tailwindcss/vite in the tailwindless Wave 4 (ffc9c4e1 — "out of
 * every manifest"), which stranded this runner's bare-specifier
 * import on a fresh install (ERR_MODULE_NOT_FOUND; the standing-set
 * failure this wiring closes). The engine now resolves from the
 * workspace tree that legitimately OWNS the consumer toolchain:
 * packages/design-tool declares @tailwindcss/vite + tailwindcss +
 * vite as one peer-coherent pnpm set. The fixture additionally gets
 * a node_modules/tailwindcss symlink into that tree — the plugin's
 * enhanced-resolve walks node_modules from the ENTRY CSS, and the
 * fixture dir itself has none.
 *
 * usage: node tw-context-probe-runner.mjs <fixtureDir> <outDir>
 * stdout: JSON { ok: true, css } | { ok: false, error }
 */
import { createRequire } from 'node:module';
import { mkdirSync, readdirSync, readFileSync, realpathSync, rmSync, symlinkSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// the workspace tree owning the consumer engine (see header)
const DESIGN_TOOL = join(
  dirname(fileURLToPath(import.meta.url)),
  '../../../../packages/design-tool',
);
const engineRequire = createRequire(join(DESIGN_TOOL, 'package.json'));
const { build } = engineRequire('vite');
const tailwindcssModule = engineRequire('@tailwindcss/vite');
const tailwindcss = tailwindcssModule.default ?? tailwindcssModule;

const [, , fixtureDir, outDir] = process.argv;

// the engine's own tailwindcss (peer-coherent with the plugin) —
// symlinked where the fixture's entry css can resolve it
const tailwindcssPkg = dirname(engineRequire.resolve('tailwindcss/package.json'));
const tailwindcssReal = realpathSync(tailwindcssPkg);
const fixtureModules = resolve(fixtureDir, 'node_modules');
mkdirSync(fixtureModules, { recursive: true });
const fixtureLink = resolve(fixtureModules, 'tailwindcss');
rmSync(fixtureLink, { recursive: true, force: true });
symlinkSync(tailwindcssReal, fixtureLink, 'junction');

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
