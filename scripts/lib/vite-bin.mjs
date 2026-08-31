#!/usr/bin/env node
/**
 * Shared CLI binary resolution (scripts/lib/vite-bin.mjs).
 *
 * vite's package exports map hides ./bin/vite.js, so the CLI cannot be
 * resolved as a package export — the path is joined explicitly from
 * the package root (the same trick build-site.mjs used inline; the
 * scripts overhaul 2026-08-31 lifts it so every entry shares it).
 *
 * Runtime transparency: callers spawn `process.execPath` + these bins
 * — whatever runtime executes the orchestrator (node under npm/pnpm,
 * bun under `bun run --bun`) also runs the tool. Nothing here names a
 * runtime.
 */
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const repoRoot = dirname(dirname(dirname(fileURLToPath(import.meta.url))));

/**
 * Locate <pkg>/package.json from a starting dir. The resolver path
 * (`require.resolve('<pkg>/package.json')`) only works when the package
 * exports it (vite does; shadcn does NOT — ERR_PACKAGE_PATH_NOT_EXPORTED),
 * so a node_modules walk is the fallback: plain fs reads are not subject
 * to the exports map, and pnpm's symlinked layout resolves the same way.
 */
function findPackageDir(packageName, fromDir) {
  try {
    return dirname(require.resolve(`${packageName}/package.json`, { paths: [fromDir] }));
  } catch {
    let dir = resolve(fromDir);
    for (;;) {
      const candidate = join(dir, 'node_modules', packageName, 'package.json');
      if (existsSync(candidate)) return dirname(candidate);
      const parent = dirname(dir);
      if (parent === dir) return null;
      dir = parent;
    }
  }
}

function binOf(packageName, binName, fromDir) {
  const packageDir = findPackageDir(packageName, fromDir);
  if (packageDir === null) {
    console.error(`[scripts] cannot locate ${packageName} under ${fromDir}; run the install there first`);
    process.exit(1);
  }
  const pkg = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));
  const binField = typeof pkg.bin === 'string' ? pkg.bin : pkg.bin?.[binName];
  const binPath = binField ? join(packageDir, binField) : null;
  if (!binPath || !existsSync(binPath)) {
    console.error(`[scripts] cannot locate the ${packageName} binary under ${fromDir}; run the install there first`);
    process.exit(1);
  }
  return binPath;
}

/** the vite CLI as installed for a workspace (apps/www) */
export function resolveViteBin(fromDir) {
  return binOf('vite', 'vite', fromDir);
}

/** the shadcn CLI as installed for a workspace root (default: this repo) */
export function resolveShadcnBin(fromDir = repoRoot) {
  return binOf('shadcn', 'shadcn', fromDir);
}
