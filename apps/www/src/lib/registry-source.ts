/**
 * Registry source projection (apps/www/src/lib/registry-source.ts,
 * canvas-floor-lab 2026-08-30, task 1.4).
 *
 * The canvas's GitHub source link is DERIVED, never hand-written: the
 * audit counted 46/77 dead sourceUrls on docs pages, every one a
 * hand-copied URL that drifted when items moved to folder form
 * (registry/files/ui/input.svelte → registry/files/ui/input/input.svelte).
 * This module is the single projection: registry item NAME → canonical
 * main file path → blob URL on the canonical GitHub remote.
 *
 * The main-file pick mirrors the mirror manifest's canonicalMain rule:
 * the file whose basename is `<item>.svelte`, else the first .svelte
 * file, else the first file. registry.json is the same import catalog.ts
 * already rides (one JSON, one module cache — no second bundle copy).
 *
 * Lint contract (task 2.2): docs pages pass `registrySourceUrl(name)`
 * to the canvas; a literal `https://github.com/` href inside a docs
 * page is a gate failure (component-canvas-floor.spec.ts greps the
 * pilot sources; the site-wide sweep lands with the docs lint pass).
 */
import registryJson from '../../../../registry.json';

/** the registry fields this projection reads (kept minimal + typed) */
interface RegistryFile {
  path: string;
}

interface RegistryItem {
  name: string;
  files?: RegistryFile[];
}

const items = (registryJson as unknown as { items: RegistryItem[] }).items;

function mainFileOf(item: RegistryItem): string | undefined {
  const files = item.files ?? [];
  return (
    files.find((f) => f.path === `registry/files/ui/${item.name}/${item.name}.svelte`)?.path ??
    files.find((f) => f.path.endsWith('.svelte'))?.path ??
    files[0]?.path
  );
}

/** item name → canonical main file path (undefined for unknown items) */
export function registrySourcePath(name: string): string | undefined {
  const item = items.find((i) => i.name === name);
  if (!item) return undefined;
  return mainFileOf(item);
}

/**
 * item name → GitHub blob URL on the canonical remote. Throws for
 * unknown items — a typo'd name must fail loudly at render time, not
 * ship as another dead link.
 */
export function registrySourceUrl(name: string): string {
  const path = registrySourcePath(name);
  if (path === undefined) {
    throw new Error(
      `registrySourceUrl: no registry item "${name}" — check the item name in registry.json`,
    );
  }
  return `https://github.com/jixoai/ui/blob/main/${path}`;
}
