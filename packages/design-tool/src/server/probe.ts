/**
 * @jixoai/ui-design (server) — the monorepo/consumer host probe (T0).
 *
 * Orthogonal intents (2):
 *   1. classify the host root (jixoai-labs/ui registry vehicle vs a
 *      consumer project) and derive the `#jixoai/<item>` alias table —
 *      real registry source paths for the vehicle, components.json
 *      alias-resolved paths for consumers (undetectable → vehicle mode,
 *      per the design-studio brief 2026-09-11).
 *   2. locate the css entry (app.css) whose @import graph RESOLVES ON
 *      DISK, the tailwind content roots (must cover design/) and the
 *      moduleRoot — the directory whose node_modules resolves the
 *      plugin set (this repo installs per-vehicle, not at the root).
 *
 * Original need: Owner 2026-09-11 (`jixoai-ui design`, design-studio
 * change T0). PURE function over the filesystem — every branch is
 * unit-tested against fixture trees (probe.test.ts).
 *
 * Why app.css prefers apps/www: `registry/files/app.css` is the
 * same-source MIRROR of `apps/www/src/app.css` (byte-identical, proven)
 * and imports `./lib/jixoai.css` — which exists only next to the www
 * copy. Serving the mirror would dead-end the import chain; the www
 * path is the one vehicle whose graph resolves.
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { resolvePackageEntry } from './resolver.ts';

/** how a canvas/page file addresses a registry item (`#jixoai/press-button`) */
export const ITEM_ALIAS_PREFIX = '#jixoai/';

export interface DesignHostInfo {
  /** 'vehicle' = this repository (registry sources), 'consumer' = installed project */
  readonly kind: 'vehicle' | 'consumer';
  /** absolute host root — the directory that contains design/ */
  readonly root: string;
  /** absolute design workspace dir (root/design) */
  readonly designDir: string;
  /** `#jixoai/<item>` → absolute entry path; every value exists on disk */
  readonly itemAliases: Readonly<Record<string, string>>;
  /** the directory `#jixoai/<item>/…` sub-path imports rewrite into */
  readonly itemAliasBase: string;
  /**
   * the `$lib/…` alias base — registry components import shared libs
   * through it (548 uses, 2026-09-11): the vehicle maps to
   * registry/files/lib (the canonical same-source), consumers to
   * their components.json aliases.lib (tsconfig-paths resolved).
   */
  readonly libAliasBase: string;
  /** css entry whose relative @import graph resolves; null = host has none */
  readonly appCss: string | null;
  /** roots tailwind content scanning must cover (design/ is under one of them) */
  readonly tailwindContentRoots: readonly string[];
  /**
   * directory whose node_modules resolves the design-server plugin set
   * (vite / @sveltejs/vite-plugin-svelte / @tailwindcss/vite /
   * @jixoai/ui-vite-plugin); null = fall back to plain bare imports
   * (standard single-root consumer installs).
   */
  readonly moduleRoot: string | null;
}

/* ── vehicle (this repository) ────────────────────────────────────────── */

/** entry file of a registry ui item dir: index.ts, else <dir>/<dir>.svelte, else first .svelte */
function itemEntry(dir: string, name: string): string | null {
  const candidates = [
    join(dir, 'index.ts'),
    join(dir, `${name}.svelte`),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  const firstSvelte = readdirSync(dir).find((f) => f.endsWith('.svelte'));
  return firstSvelte ? join(dir, firstSvelte) : null;
}

function scanRegistryItems(uiDir: string): Record<string, string> {
  const aliases: Record<string, string> = {};
  for (const entry of readdirSync(uiDir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    if (!entry.isDirectory()) continue;
    const entryPath = itemEntry(join(uiDir, entry.name), entry.name);
    if (entryPath) aliases[`${ITEM_ALIAS_PREFIX}${entry.name}`] = entryPath;
  }
  return aliases;
}

/**
 * The vehicle's app.css: the www copy (its ./lib graph resolves on
 * disk); registry/files/app.css is a mirror whose relative imports
 * dead-end (see file header). Falls back to any conventional candidate.
 */
function vehicleAppCss(root: string): string | null {
  const candidates = [
    join(root, 'apps/www/src/app.css'),
    join(root, 'src/app.css'),
    join(root, 'app.css'),
  ];
  for (const candidate of candidates) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

/* ── consumer (components.json) ───────────────────────────────────────── */

interface ComponentsJson {
  aliases?: Record<string, string>;
  tailwind?: { css?: string };
}

/** `$lib`-rooted alias values resolve through tsconfig/jsconfig paths (the jixoai-ui CLI law) */
function resolveAliasBase(value: string, root: string): string {
  if (!value.startsWith('$')) return resolve(root, value);
  for (const name of ['tsconfig.json', 'jsconfig.json']) {
    const path = join(root, name);
    if (!existsSync(path)) continue;
    try {
      const paths = (JSON.parse(readFileSync(path, 'utf8')) as { compilerOptions?: { paths?: Record<string, string[]> } }).compilerOptions?.paths;
      if (!paths) break;
      const star = (v: string): string => String(Array.isArray(v) ? v[0] ?? '' : v ?? '').replace(/\*$/, '');
      if (paths[value] !== undefined) return resolve(root, star(paths[value] as unknown as string));
      const wildcard = Object.keys(paths).filter((k) => k.endsWith('/*')).sort((a, b) => b.length - a.length)[0];
      if (wildcard && value.startsWith(wildcard.slice(0, -1))) {
        return resolve(root, star(paths[wildcard] as unknown as string) + value.slice(wildcard.slice(0, -1).length));
      }
    } catch {
      // unparseable config — the literal base stands
    }
  }
  return resolve(root, value);
}

function probeConsumer(root: string, config: ComponentsJson): Pick<DesignHostInfo, 'itemAliases' | 'itemAliasBase' | 'libAliasBase' | 'appCss'> | null {
  const uiAlias = config.aliases?.ui;
  if (typeof uiAlias !== 'string') return null;
  const uiDir = resolveAliasBase(uiAlias, root);
  if (!existsSync(uiDir)) return null;
  const libAlias = config.aliases?.lib;
  const libDir = typeof libAlias === 'string' ? resolveAliasBase(libAlias, root) : join(root, 'src/lib');
  const aliases: Record<string, string> = {};
  for (const entry of readdirSync(uiDir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
    if (!entry.isDirectory()) continue;
    const entryPath = itemEntry(join(uiDir, entry.name), entry.name);
    if (entryPath) aliases[`${ITEM_ALIAS_PREFIX}${entry.name}`] = entryPath;
  }
  let appCss: string | null = null;
  const tailwindCss = config.tailwind?.css;
  const cssCandidates = [
    ...(typeof tailwindCss === 'string' && tailwindCss ? [resolve(root, tailwindCss)] : []),
    join(root, 'src/app.css'),
    join(root, 'app.css'),
  ];
  for (const candidate of cssCandidates) {
    if (existsSync(candidate)) {
      appCss = candidate;
      break;
    }
  }
  return { itemAliases: aliases, itemAliasBase: uiDir, libAliasBase: libDir, appCss };
}

/* ── moduleRoot ───────────────────────────────────────────────────────── */

const PLUGIN_SET = ['vite', '@sveltejs/vite-plugin-svelte', '@tailwindcss/vite', '@jixoai/ui-vite-plugin'] as const;

/** does `dir`'s node_modules resolve every plugin-set member? (ESM-aware, see resolver.ts) */
function resolvesPluginSet(dir: string): boolean {
  return PLUGIN_SET.every((spec) => resolvePackageEntry(dir, spec) !== null);
}

/**
 * The design server imports its plugin set from THIS module graph's
 * resolution — in the monorepo the install lives per-vehicle (registry/,
 * apps/www/), never at the repo root. Candidates: host root first
 * (consumer installs), then the known vehicle roots.
 */
function probeModuleRoot(root: string, kind: DesignHostInfo['kind']): string | null {
  const candidates = kind === 'vehicle'
    ? [join(root, 'registry'), join(root, 'apps/www'), root]
    : [root, join(root, 'registry'), join(root, 'apps/www')];
  for (const candidate of candidates) {
    if (!existsSync(join(candidate, 'package.json'))) continue;
    if (resolvesPluginSet(candidate)) return candidate;
  }
  return null;
}

/* ── the probe ────────────────────────────────────────────────────────── */

/**
 * Probe a host root for the design server. Detection order: a
 * components.json with a resolvable ui alias wins (consumer);
 * otherwise the registry layout (registry/files/ui + registry.json)
 * marks the vehicle; an undetectable root degrades to vehicle mode
 * with an empty item table (studio still runs, prototypes render
 * host-local components only).
 */
export function probeDesignHost(rootInput: string): DesignHostInfo {
  const root = resolve(rootInput);
  const designDir = join(root, 'design');

  const componentsPath = join(root, 'components.json');
  const registryUiDir = join(root, 'registry/files/ui');
  const isRegistryJson = existsSync(join(root, 'registry.json'));

  let kind: DesignHostInfo['kind'] = 'vehicle';
  let scanned: Pick<DesignHostInfo, 'itemAliases' | 'itemAliasBase' | 'libAliasBase' | 'appCss'> | null = null;

  if (existsSync(componentsPath)) {
    try {
      const config = JSON.parse(readFileSync(componentsPath, 'utf8')) as ComponentsJson;
      scanned = probeConsumer(root, config);
      if (scanned) kind = 'consumer';
    } catch {
      // unparseable components.json — degrade to vehicle mode below
    }
  }
  if (!scanned && existsSync(registryUiDir) && isRegistryJson) {
    scanned = {
      itemAliases: scanRegistryItems(registryUiDir),
      itemAliasBase: registryUiDir,
      // the www mirror tree, NOT registry/files/lib: components import
      // `$lib/ui/...` (cross-item mirrors) which exist only beside the
      // site copy (registry/files/lib has no ui/ subtree — 2026-09-11)
      libAliasBase: join(root, 'apps/www/src/lib'),
      appCss: vehicleAppCss(root),
    };
  }
  if (!scanned) {
    // undetectable: vehicle posture, empty table (see doc comment)
    scanned = {
      itemAliases: {},
      itemAliasBase: join(root, 'src/lib/ui'),
      libAliasBase: join(root, 'src/lib'),
      appCss: vehicleAppCss(root),
    };
  }

  const tailwindContentRoots = [root];
  return {
    kind,
    root,
    designDir,
    itemAliases: scanned.itemAliases,
    itemAliasBase: scanned.itemAliasBase,
    libAliasBase: scanned.libAliasBase,
    appCss: scanned.appCss,
    tailwindContentRoots,
    moduleRoot: probeModuleRoot(root, kind),
  };
}
