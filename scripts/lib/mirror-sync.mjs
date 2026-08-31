#!/usr/bin/env node
/**
 * The registry ⇄ www mirror sync LOGIC (scripts/lib/mirror-sync.mjs,
 * scripts overhaul 2026-08-31; watch-free since the chokidar handoff).
 *
 * THE LAW (mirror-manifest, tw4-css-modularization P0.3):
 * `registry/files/**` is the canonical registry source tree;
 * `apps/www/src/lib/**` holds byte-identical mirrors. The mapping is
 * the manifest generator's own prefix rule:
 *
 *   registry/files/ui/**     → apps/www/src/lib/ui/**
 *   registry/files/{lib,theme}/** → apps/www/src/lib/**
 *
 * Everything else on the www side (SITE_ONLY chrome) has NO mirror
 * and is ignored; everything else under registry/files (docs tooling
 * like llms-txt.mjs) maps nowhere and is ignored too.
 *
 * WATCHING IS NOT DONE HERE — on purpose. The host (the dev server's
 * chokidar via the vite plugin in apps/www/vite.config.ts) drives
 * `schedule(path)` with absolute paths; this module only maps, syncs,
 * and suppresses echoes. (The first cut used fs.watch({recursive}),
 * which libuv only supports on macOS/Windows — a Linux landmine. The
 * vite watcher is cross-platform and its lifecycle comes free.)
 *
 * Behavior:
 *   - schedule(path) debounces (60ms) and syncs: change one side, the
 *     other receives the exact bytes (vite HMR picks the www side up);
 *   - a missing source file propagates as a mirror deletion;
 *   - echo suppression: after a sync write, the copy-back event on
 *     the OTHER side is recognized by content hash and skipped — no
 *     feedback loop, no double logs;
 *   - reportDrift() is the startup reconciliation: informational,
 *     NEVER writes (silently clobbering one side on launch would eat
 *     unsaved work; verify:mirror stays the drift gate).
 */
import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, readdir, rm, stat } from 'node:fs/promises';
import { dirname, join, relative, sep } from 'node:path';
import { isSiteOnly } from './site-only.mjs';

/** @param {string} repoRoot */
export function createMirrorSync(repoRoot) {
  const registryFiles = join(repoRoot, 'registry', 'files');
  const wwwLib = join(repoRoot, 'apps', 'www', 'src', 'lib');

  const REGISTRY_PREFIXES = [
    { prefix: join(registryFiles, 'ui'), mirror: (rel) => join(wwwLib, 'ui', rel) },
    { prefix: join(registryFiles, 'lib'), mirror: (rel) => join(wwwLib, rel) },
    { prefix: join(registryFiles, 'theme'), mirror: (rel) => join(wwwLib, rel) },
  ];

  /** registry path → www path (null when the file is not a mirrored pair) */
  function toMirror(absPath) {
    for (const { prefix, mirror } of REGISTRY_PREFIXES) {
      if (absPath.startsWith(prefix + sep)) {
        return mirror(relative(prefix, absPath));
      }
    }
    return null;
  }

  /** resolve a www path back to its registry source (existence probe) */
  async function resolveRegistryPair(wwwPath) {
    const rel = relative(wwwLib, wwwPath);
    const parts = rel.split(sep);
    const candidates =
      parts[0] === 'ui'
        ? [join(registryFiles, 'ui', ...parts.slice(1))]
        : [join(registryFiles, 'lib', rel), join(registryFiles, 'theme', rel)];
    for (const candidate of candidates) {
      try {
        await stat(candidate);
        return candidate;
      } catch {
        /* probe next */
      }
    }
    // neither exists yet: a NEW file on the www side. Site-only chrome
    // (the curated SITE_ONLY law) never enters the registry — return
    // null so syncFile treats it as unmapped. Genuine new pairs join
    // the lib tree by default (the theme tree is fully mapped under
    // its own prefix; a genuinely new theme file is created there by
    // editing the registry side, the canonical flow).
    const repoRel = relative(repoRoot, wwwPath);
    if (isSiteOnly(repoRel)) return null;
    return candidates[0];
  }

  const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');

  /** every mirrored pair currently present (either side), as [registry, www] */
  async function listPairs() {
    const pairs = new Map(); // registry path → www path
    const walk = async (dir, into, prefix = '') => {
      let entries;
      try {
        entries = await readdir(dir, { withFileTypes: true });
      } catch {
        return;
      }
      for (const entry of entries) {
        const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
        if (entry.isDirectory()) await walk(join(dir, entry.name), into, rel);
        else into.push(rel);
      }
    };
    for (const { prefix } of REGISTRY_PREFIXES) {
      const files = [];
      await walk(prefix, files);
      for (const rel of files) pairs.set(join(prefix, rel), toMirror(join(prefix, rel)));
    }
    return pairs;
  }

  /** initial drift report — informational, never writes */
  async function reportDrift() {
    const pairs = await listPairs();
    let diverged = 0;
    let wwwOnly = 0;
    const lines = [];
    for (const [regPath, wwwPath] of pairs) {
      let regHash = null;
      let wwwHash = null;
      try {
        regHash = sha(await readFile(regPath));
      } catch {
        /* missing */
      }
      try {
        wwwHash = sha(await readFile(wwwPath));
      } catch {
        /* missing */
      }
      if (regHash === null && wwwHash !== null) {
        wwwOnly += 1;
        lines.push(`  www-only (no registry source): ${relative(repoRoot, wwwPath)}`);
      } else if (regHash !== wwwHash) {
        diverged += 1;
        lines.push(`  diverged: ${relative(repoRoot, regPath)}`);
      }
    }
    if (lines.length > 0) {
      console.warn(`[mirror] initial drift — ${diverged} diverged, ${wwwOnly} www-only (NOT auto-fixed; the next edit on either side re-converges, or run verify:mirror for the full law):`);
      for (const line of lines.slice(0, 12)) console.warn(line);
      if (lines.length > 12) console.warn(`  … and ${lines.length - 12} more`);
    } else {
      console.log('[mirror] registry ⇄ www in sync (' + pairs.size + ' pairs)');
    }
    return { diverged, wwwOnly };
  }

  // ── live sync (host-driven) ────────────────────────────────────────
  const DEBOUNCE_MS = 60;
  const pending = new Map(); // abs path → timer
  const echo = new Map(); // path just written by us → sha we wrote

  const log = (direction, from) =>
    console.log(`[mirror] ${direction} ${relative(repoRoot, from)}`);

  async function syncFile(absPath) {
    // decide direction by which side the path lives on
    const isRegistrySide = absPath.startsWith(registryFiles + sep);
    const dst = isRegistrySide ? toMirror(absPath) : await resolveRegistryPair(absPath);
    if (dst === null) return; // not a mirrored pair (SITE_ONLY / unmapped)
    const src = absPath;
    let bytes;
    try {
      bytes = await readFile(src);
    } catch {
      // deleted on the source side → remove the mirror
      try {
        await rm(dst);
        log('delete →', dst);
      } catch {
        /* mirror already gone */
      }
      return;
    }
    // echo suppression: our own write firing the other side's watcher
    const wrote = echo.get(dst);
    if (wrote !== undefined && sha(bytes) === wrote) {
      echo.delete(dst);
      return;
    }
    try {
      // skip a no-op write (identical content on both sides)
      try {
        const current = await readFile(dst);
        if (sha(current) === sha(bytes)) return;
      } catch {
        /* dst missing — write below */
      }
      await mkdir(dirname(dst), { recursive: true });
      await copyFile(src, dst);
      echo.set(dst, sha(bytes));
      log(isRegistrySide ? 'registry → www' : 'www → registry', src);
    } catch (err) {
      console.warn(`[mirror] sync failed for ${relative(repoRoot, src)}: ${err.message}`);
    }
  }

  /** the host (the dev server's watcher) calls this per event */
  function schedule(absPath) {
    const existing = pending.get(absPath);
    if (existing !== undefined) clearTimeout(existing);
    pending.set(
      absPath,
      setTimeout(() => {
        pending.delete(absPath);
        void syncFile(absPath);
      }, DEBOUNCE_MS),
    );
  }

  return { reportDrift, schedule, toMirror, listPairs };
}
