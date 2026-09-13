/**
 * @jixoai/ui-design (server) — minimal ESM package-entry resolver.
 *
 * Orthogonal intent (1): resolve a fixed set of bare specs
 * (vite / @sveltejs/vite-plugin-svelte / @tailwindcss/vite /
 * @jixoai/ui-vite-plugin[/icons/...]) to real entry FILES from a
 * candidate root, honoring the exports-map "import" condition.
 *
 * Original need: design-studio T0/T3 (2026-09-11). Why not
 * require.resolve: ESM-only packages (exports without a "require"
 * condition — @jixoai/ui-vite-plugin) throw MODULE_NOT_FOUND under
 * CJS resolution. Why not import.meta.resolve(spec, parent): the
 * two-argument form proved unreliable in this environment (node 24
 * ignored the parent in eval contexts, 2026-09-11). The operational
 * surface is small and fixed, so a ~60-line walker is cheaper and
 * unit-testable. NOT a general resolver: no export patterns, no
 * browser conditions, no bare-"main"-only legacy probing beyond a
 * simple fallback.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

interface PkgExports {
  [condition: string]: string | PkgExports | undefined;
}

interface PkgJson {
  main?: string;
  module?: string;
  exports?: string | PkgExports;
}

/** pick the entry string out of an exports node: "import" > "default" > raw string */
function exportEntry(node: PkgJson['exports']): string | null {
  if (typeof node === 'string') return node;
  if (!node || typeof node !== 'object') return null;
  const conditions = [node.import, node.default];
  for (const condition of conditions) {
    if (typeof condition === 'string') return condition;
  }
  // one more nesting level (e.g. { ".": { "node": { "import": "…" } } })
  for (const value of Object.values(node)) {
    if (typeof value === 'object' && value !== null) {
      const nested = exportEntry(value as PkgExports);
      if (nested !== null) return nested;
    }
  }
  return null;
}

/** find the nearest node_modules/<pkgDir>/package.json walking up from `from` */
function findPkgJson(from: string, pkgDir: string): string | null {
  let dir = resolve(from);
  for (;;) {
    const candidate = join(dir, 'node_modules', pkgDir, 'package.json');
    if (existsSync(candidate)) return candidate;
    const parent = dirname(dir);
    if (parent === dir) return null;
    dir = parent;
  }
}

/**
 * Resolve `spec` (a bare specifier like '@jixoai/ui-vite-plugin/icons')
 * to an entry file path from `root`; null when the package or a usable
 * entry is absent. Symlinked node_modules are followed transparently
 * (existsSync/readFileSync follow links).
 */
export function resolvePackageEntry(root: string, spec: string): string | null {
  if (spec.startsWith('.') || spec.startsWith('/')) return null; // bare specs only
  const parts = spec.split('/');
  const pkgDir = spec.startsWith('@') ? `${parts[0]}/${parts[1]}` : parts[0]!;
  const subpath = parts.slice(pkgDir.split('/').length).join('/');

  const pkgJsonPath = findPkgJson(root, pkgDir);
  if (pkgJsonPath === null) return null;

  let pkg: PkgJson;
  try {
    pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8')) as PkgJson;
  } catch {
    return null;
  }

  const pkgRoot = dirname(pkgJsonPath);
  if (typeof pkg.exports === 'object' && pkg.exports !== null && !Array.isArray(pkg.exports)) {
    const key = subpath === '' ? '.' : `./${subpath}`;
    const direct = exportEntry(pkg.exports[key]);
    if (direct !== null) {
      const file = join(pkgRoot, direct);
      return existsSync(file) ? file : null;
    }
    return null; // an exports map exists but lacks our subpath — respect it
  }
  if (typeof pkg.exports === 'string') {
    // root-only string exports: only the "." subpath is legal
    if (subpath !== '') return null;
    const file = join(pkgRoot, pkg.exports);
    return existsSync(file) ? file : null;
  }
  // no exports map: main/module + subpath as plain file
  const relative = subpath === '' ? (pkg.module ?? pkg.main ?? 'index.js') : subpath;
  const file = join(pkgRoot, relative);
  return existsSync(file) ? file : null;
}
