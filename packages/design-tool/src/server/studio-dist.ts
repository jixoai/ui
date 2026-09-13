/**
 * @jixoai/ui-design (server) — the studio static bundle's shared base
 * (issue #18, foundation round).
 *
 * Orthogonal intents (3):
 *   1. INPUT HASHING: computeStudioInputsHash content-hashes every
 *      tree the prebuilt studio compiles from (studio sources, the
 *      build script, registry/files/{ui,lib,theme}, apps/www/src/lib —
 *      the #jixoai/ and $lib build-alias targets). Content, not mtime:
 *      git checkout/rebase resets mtimes and would flag forever-stale
 *      bundles. The SAME function feeds the builder (manifest writer)
 *      and the checker (CLI startup warning) — one definition, no
 *      drift between what was built and what is validated.
 *   2. BUILD MANIFEST: dist-studio/build-manifest.json (inputsHash,
 *      versions, builtAt) — the artifact's provenance record and the
 *      staleness oracle.
 *   3. STATIC HOSTING: the design-server middlewares that serve
 *      /__design__/ (index.html or the LOUD missing-bundle guidance —
 *      never a silent fallback to the dev pipeline) and the bundle's
 *      hashed assets with honest MIME types.
 *
 * Original need: issue #18 (Owner 2026-09-13). PURE node module — no
 * vite/browser imports; unit-tested against fixture trees
 * (studio-dist.test.ts).
 */

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { ServerResponse } from 'node:http';

import { resolvePackageEntry } from './resolver.ts';
import { probeDesignHost } from './probe.ts';

const PACKAGE_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

/** the prebuilt studio bundle directory (gitignored; npm run build:studio output) */
export const STUDIO_DIST_DIRNAME = 'dist-studio';
/** absolute path of the bundle inside THIS package */
export const STUDIO_DIST_DIR = join(PACKAGE_DIR, STUDIO_DIST_DIRNAME);

/* ── input set ────────────────────────────────────────────────────────── */

/**
 * Every file/tree the static studio compiles from (or whose change
 * demands a rebuild), repo-relative. The list is part of the hash
 * contract — append, never reorder. registry/files/lib is deliberately
 * included even though $lib maps to the www mirror: the mirror-sync
 * law means a registry change that has not reached apps/www/src/lib
 * yet must still flag the bundle as stale (rebuild after the sync).
 */
export function studioInputRoots(repoRoot: string): string[] {
  return [
    join(repoRoot, 'packages/design-tool/src/studio'),
    join(repoRoot, 'packages/design-tool/src/server/svelte-aliases.ts'),
    join(repoRoot, 'packages/design-tool/src/server/resolver.ts'),
    join(repoRoot, 'packages/design-tool/src/server/studio-dist.ts'),
    join(repoRoot, 'scripts/build-studio.mjs'),
    join(repoRoot, 'registry/files/ui'),
    join(repoRoot, 'registry/files/lib'),
    join(repoRoot, 'registry/files/theme'),
    join(repoRoot, 'apps/www/src/lib'),
  ];
}

/** directory names never hashed inside a walked tree (defensive — none expected) */
const WALK_SKIP = new Set(['node_modules', '.git', '.svelte-kit', 'dist']);

function walkFiles(root: string, out: string[]): void {
  let entries: ReturnType<typeof readdirSync>;
  try {
    entries = readdirSync(root, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (WALK_SKIP.has(entry.name)) continue;
    const path = join(root, entry.name);
    if (entry.isDirectory()) {
      walkFiles(path, out);
    } else if (entry.isFile()) {
      out.push(path);
    }
  }
}

/** POSIX repo-relative path (hash portability across platforms) */
function toRel(repoRoot: string, path: string): string {
  return relative(repoRoot, path).split(sep).join('/');
}

/**
 * sha256 over the CONTENTS of every input root (sorted for determinism;
 * missing roots hash as named markers so the value stays computable in
 * any install). One call ≈ a few MB of reads — cheap enough for CLI
 * startup checks.
 */
export function computeStudioInputsHash(repoRoot: string): string {
  const hash = createHash('sha256');
  for (const root of studioInputRoots(repoRoot)) {
    hash.update(`ROOT:${toRel(repoRoot, root)}\n`);
    let stat: ReturnType<typeof statSync>;
    try {
      stat = statSync(root);
    } catch {
      hash.update('MISSING\n');
      continue;
    }
    if (stat.isFile()) {
      hash.update(`${toRel(repoRoot, root)}\0`);
      hash.update(readFileSync(root));
      hash.update('\n');
      continue;
    }
    const files: string[] = [];
    walkFiles(root, files);
    files.sort();
    for (const file of files) {
      hash.update(`${toRel(repoRoot, file)}\0`);
      hash.update(readFileSync(file));
      hash.update('\n');
    }
  }
  return hash.digest('hex');
}

/* ── build manifest ───────────────────────────────────────────────────── */

export interface StudioBuildManifest {
  /** packages/design-tool version at build time */
  readonly studioVersion: string;
  /** computeStudioInputsHash of the build's input set */
  readonly inputsHash: string;
  /** ISO8601 build timestamp */
  readonly builtAt: string;
  /** the vite install that produced the bundle */
  readonly vite: string;
  /** the svelte runtime compiled against */
  readonly svelte: string;
  /** the hashed input roots, repo-relative (the hash contract) */
  readonly inputRoots: readonly string[];
}

const MANIFEST_NAME = 'build-manifest.json';

/** parse dist-studio/build-manifest.json; null when absent or malformed */
export function readStudioBuildManifest(distDir: string = STUDIO_DIST_DIR): StudioBuildManifest | null {
  try {
    const raw = JSON.parse(readFileSync(join(distDir, MANIFEST_NAME), 'utf8')) as Partial<StudioBuildManifest>;
    if (typeof raw.inputsHash !== 'string' || typeof raw.builtAt !== 'string') return null;
    return {
      studioVersion: typeof raw.studioVersion === 'string' ? raw.studioVersion : 'unknown',
      inputsHash: raw.inputsHash,
      builtAt: raw.builtAt,
      vite: typeof raw.vite === 'string' ? raw.vite : 'unknown',
      svelte: typeof raw.svelte === 'string' ? raw.svelte : 'unknown',
      inputRoots: Array.isArray(raw.inputRoots) ? raw.inputRoots : [],
    };
  } catch {
    return null;
  }
}

/** the version field of the package.json walking up from a file (or 'unknown') */
function versionOf(entry: string | null): string {
  if (entry === null) return 'unknown';
  let dir = dirname(entry);
  for (;;) {
    const pkgPath = join(dir, 'package.json');
    if (existsSync(pkgPath)) {
      try {
        const version = (JSON.parse(readFileSync(pkgPath, 'utf8')) as { version?: unknown }).version;
        if (typeof version === 'string') return version;
      } catch {
        // fall through to the walk
      }
    }
    const parent = dirname(dir);
    if (parent === dir) return 'unknown';
    dir = parent;
  }
}

/** write dist-studio/build-manifest.json (the builder's closing act) */
export function writeStudioBuildManifest(
  repoRoot: string,
  distDir: string = STUDIO_DIST_DIR,
  moduleRoot: string | null = probeDesignHost(repoRoot).moduleRoot,
): StudioBuildManifest {
  const manifest: StudioBuildManifest = {
    studioVersion: versionOf(join(PACKAGE_DIR, 'package.json')),
    inputsHash: computeStudioInputsHash(repoRoot),
    builtAt: new Date().toISOString(),
    vite: versionOf(moduleRoot === null ? null : resolvePackageEntry(moduleRoot, 'vite')),
    svelte: versionOf(moduleRoot === null ? null : resolvePackageEntry(moduleRoot, 'svelte')),
    inputRoots: studioInputRoots(repoRoot).map((root) => toRel(repoRoot, root)),
  };
  writeFileSync(join(distDir, MANIFEST_NAME), `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

/* ── staleness check (the CLI's startup oracle) ───────────────────────── */

export type StudioDistState = 'current' | 'missing' | 'stale';

export interface StudioDistStatus {
  readonly state: StudioDistState;
  /** the expected bundle directory */
  readonly distDir: string;
  /** the hash the inputs compute to NOW (null when skipped — non-vehicle install) */
  readonly expectedHash: string | null;
  /** the built manifest, when one exists */
  readonly manifest: StudioBuildManifest | null;
}

/** monorepo markers: the build-alias target trees (absent in consumer installs) */
function isVehicleRepo(repoRoot: string): boolean {
  return existsSync(join(repoRoot, 'registry/files/ui')) || existsSync(join(repoRoot, 'apps/www/src/lib'));
}

/**
 * The bundle's state: missing (no index.html/manifest), stale (the
 * vehicle input hash moved past the built manifest), or current. The
 * hash comparison only runs in the monorepo — a consumer install has
 * no input trees to hash, and existence is the honest check there.
 */
export function studioDistStatus(): StudioDistStatus {
  const repoRoot = resolve(PACKAGE_DIR, '../..');
  const manifest = readStudioBuildManifest();
  const indexExists = existsSync(join(STUDIO_DIST_DIR, 'index.html'));
  if (!indexExists || manifest === null) {
    return { state: 'missing', distDir: STUDIO_DIST_DIR, expectedHash: null, manifest };
  }
  if (!isVehicleRepo(repoRoot)) {
    return { state: 'current', distDir: STUDIO_DIST_DIR, expectedHash: null, manifest };
  }
  const expectedHash = computeStudioInputsHash(repoRoot);
  return {
    state: expectedHash === manifest.inputsHash ? 'current' : 'stale',
    distDir: STUDIO_DIST_DIR,
    expectedHash,
    manifest,
  };
}

/* ── static hosting (the design server middlewares' engine) ───────────── */

const MIME_BY_EXT: Readonly<Record<string, string>> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
};

/** honest MIME for a bundle file (octet-stream as the last resort) */
export function mimeFor(path: string): string {
  const dot = path.lastIndexOf('.');
  const ext = dot === -1 ? '' : path.slice(dot).toLowerCase();
  return MIME_BY_EXT[ext] ?? 'application/octet-stream';
}

/** the LOUD guidance page — served when the bundle is absent (503) */
export function studioMissingGuidance(distDir: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>studio bundle missing — jixoai design</title>
<style>html,body{margin:0;padding:0}body{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;padding:2rem;min-height:100vh;box-sizing:border-box;background:#1a0d0d;color:#ffb4b4}</style>
</head>
<body>
<h1 style="font-size:1rem;letter-spacing:.15em;text-transform:uppercase;margin:0 0 1rem">studio bundle missing — jixoai design studio</h1>
<p style="font-size:1.05rem;margin:0 0 1rem"><strong>the studio chrome is a prebuilt static bundle (issue #18) — nothing was compiled for this host.</strong></p>
<pre style="white-space:pre-wrap;word-break:break-word;margin:0;font-size:.85rem;line-height:1.6;opacity:.9">expected: ${distDir}/index.html

build it (repo root):
  npm run build:studio

or keep it rebuilding while you work on the studio chrome:
  npm run dev:studio

(the frame surface, prototype canvases and every /__design__/api/* endpoint
stay live — only the studio chrome needs the prebuilt bundle)</pre>
</body>
</html>
`;
}

/**
 * Serve the studio SPA document: dist-studio/index.html, or the LOUD
 * guidance page with 503 when the bundle is absent. NEVER falls back
 * to a dev-compiled studio — the architecture ruling (issue #18) keeps
 * the studio a product surface, not a compile-on-demand dev artifact.
 */
export function serveStudioIndex(distDir: string, res: ServerResponse): void {
  let html: string;
  try {
    html = readFileSync(join(distDir, 'index.html'), 'utf8');
  } catch {
    res.statusCode = 503;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(studioMissingGuidance(distDir));
    return;
  }
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(html);
}

/** map /__design__/&lt;sub&gt; to a bundle file (null when sub is not a servable file) */
export function resolveStudioAsset(distDir: string, pathname: string): { file: string; mime: string } | null {
  const prefix = '/__design__/';
  if (!pathname.startsWith(prefix)) return null;
  let sub: string;
  try {
    sub = decodeURIComponent(pathname.slice(prefix.length));
  } catch {
    return null; // malformed percent-encoding
  }
  if (sub === '' || sub.startsWith('/')) return null;
  if (sub.split('/').some((segment) => segment === '' || segment === '.' || segment === '..')) return null;
  const file = resolve(distDir, sub);
  const rel = relative(distDir, file);
  if (rel.startsWith('..') || rel === '') return null; // traversal guard
  if (!existsSync(file) || !statSync(file).isFile()) return null;
  return { file, mime: mimeFor(file) };
}

/**
 * Serve a hashed bundle asset under /__design__/ (the built html's
 * absolute references, base '/__design__/'). Returns false when the
 * path maps to no bundle file — the caller falls through to the next
 * middleware (frame/api/prototypes routes run BEFORE this and own
 * their subpaths).
 */
export function serveStudioAsset(distDir: string, pathname: string, res: ServerResponse): boolean {
  const asset = resolveStudioAsset(distDir, pathname);
  if (asset === null) return false;
  res.statusCode = 200;
  res.setHeader('Content-Type', asset.mime);
  res.setHeader('Cache-Control', 'no-store');
  res.end(readFileSync(asset.file));
  return true;
}
