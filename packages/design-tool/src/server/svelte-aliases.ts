/**
 * @jixoai/ui-design (server) — per-file svelte resolution aliases.
 *
 * Orthogonal intent (1): the one svelte-install pinning rule, shared
 * by the design dev server (create.ts) and the studio static build
 * (scripts/build-studio.mjs) — a split-install repository reaches
 * DIFFERENT svelte copies from different trees (registry/ vs apps/www/
 * vs the repo root), and two bundled runtimes break Svelte 5 runes
 * across the seam. Every bare svelte id is therefore pinned to a REAL
 * FILE of the moduleRoot install, read from its exports map with
 * browser-priority conditions.
 *
 * Why per-file: a directory alias cannot work (svelte maps internals
 * into src/ via the exports map — a direct <pkg>/internal path does
 * not exist on disk). The export set is the same one
 * vite-plugin-svelte enumerates for its optimizer (SVELTE_IMPORTS).
 *
 * Original need: design-studio T3 (2026-09-11); extracted from
 * create.ts for the issue #18 studio static build (2026-09-13) so
 * both pipelines compile against the identical alias table.
 */

import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

import type { Alias } from 'vite';

import { resolvePackageEntry } from './resolver.ts';

/**
 * Exact-file aliases for EVERY runtime export of svelte ('svelte',
 * 'svelte/internal/client', …) from the moduleRoot install's exports
 * map with browser-priority conditions. Returns [] when the install
 * cannot be located (single-root consumer installs resolve svelte the
 * normal way and need no pinning).
 */
export function svelteFileAliases(moduleRoot: string | null): Alias[] {
  const entry = moduleRoot === null ? null : resolvePackageEntry(moduleRoot, 'svelte');
  if (entry === null) return [];
  let dir = dirname(entry);
  while (!existsSync(join(dir, 'package.json'))) {
    const parent = dirname(dir);
    if (parent === dir) return [];
    dir = parent;
  }
  let pkg: { exports?: Record<string, string | Record<string, string>> };
  try {
    pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')) as typeof pkg;
  } catch {
    return [];
  }
  const pick = (node: string | Record<string, string>): string | null => {
    if (typeof node === 'string') return node;
    const file = node.browser ?? node.default;
    if (typeof file !== 'string') return null; // types-only export
    return file;
  };
  const aliases: Alias[] = [];
  for (const [key, node] of Object.entries(pkg.exports ?? {})) {
    if (key === './package.json') continue;
    const file = pick(node);
    if (file === null) continue;
    const spec = key === '.' ? 'svelte' : `svelte${key.slice(1)}`;
    aliases.push({ find: new RegExp(`^${spec.replaceAll('/', '\\/')}$`), replacement: join(dir, file) });
  }
  return aliases;
}
