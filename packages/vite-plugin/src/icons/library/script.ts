/**
 * @jixoai/vite-plugin (icons library) — the ROOT-SCRIPT adapter (A4,
 * openspec icon-component-pipeline design §5/§6).
 *
 * The programmatic entry behind the repo-root `gen:icons` /
 * `verify:icons --check` scripts (their package.json wiring is stream
 * B3's): the canonical write (the ONLY in-repo artifact writer — the
 * single-writer law) and the freshness check. This adapter imports NO
 * vite: its `{file}` I/O is a node-fs twin of the plugin-owned
 * ProviderContext (svg-only — the library face never reads fonts),
 * and HMR watching is meaningless outside a dev server.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve as resolvePath } from 'node:path';
import type { ProviderContext, SafetyCheckerConfig, SourceDescriptor } from '../types.js';
import { createSafetyChecker } from '../safety.js';
import { generateIconLibraryArtifacts } from './generate.js';
import { resolveLibraryInputs } from './resolve.js';
import type { IconLibraryOptions, LibraryReport } from './types.js';

/** the shared build both script modes run (resolve → generate) */
async function buildArtifacts(
  options: IconLibraryOptions,
  safety?: SafetyCheckerConfig,
): Promise<{ artifact: string; report: LibraryReport }> {
  const checker = createSafetyChecker(safety ?? { mode: 'warn' });
  const io: ProviderContext = {
    async loadSource(path: string): Promise<SourceDescriptor> {
      const resolved = resolvePath(path);
      const data = new Uint8Array(await readFile(resolved));
      return { data, path: resolved, mimeType: 'image/svg+xml' };
    },
    watchFile(): void {
      /* no dev server in the script adapter — nothing to watch */
    },
  };
  const resolution = await resolveLibraryInputs(options, io, checker);
  for (const warning of resolution.warnings) console.warn(warning);
  const generated = generateIconLibraryArtifacts(resolution.icons, options);
  return {
    artifact: generated.artifact,
    report: { ...generated.report, warnings: [...resolution.warnings, ...generated.report.warnings] },
  };
}

/** what writeIconLibraryArtifact reports back */
export interface IconLibraryWriteResult {
  /** did the write happen? (unchanged content writes nothing) */
  readonly changed: boolean;
  readonly artifactPath: string;
  readonly report: LibraryReport;
}

/**
 * Generate the canonical artifact and write it to `target` — the ONLY
 * sanctioned artifact write in this repo (the vite adapter never
 * writes unless a consumer opts in). Writes only on content change so
 * repeated runs stay idempotent for watch tooling.
 */
export async function writeIconLibraryArtifact(
  options: IconLibraryOptions,
  target: string,
  safety?: SafetyCheckerConfig,
): Promise<IconLibraryWriteResult> {
  const artifactPath = resolvePath(target);
  const { artifact, report } = await buildArtifacts(options, safety);
  let existing: string | null = null;
  try {
    existing = await readFile(artifactPath, 'utf8');
  } catch {
    /* absent — a fresh write */
  }
  if (existing !== artifact) {
    await mkdir(dirname(artifactPath), { recursive: true });
    await writeFile(artifactPath, artifact, 'utf8');
    return { changed: true, artifactPath, report };
  }
  return { changed: false, artifactPath, report };
}

/** what checkIconLibraryArtifact reports back */
export interface IconLibraryCheckResult {
  /** fresh = the on-disk artifact byte-matches the generator output */
  readonly fresh: boolean;
  readonly artifactPath: string;
  readonly report: LibraryReport;
}

/**
 * The freshness gate (verify:icons --check): regenerate in memory and
 * compare — NO write, NO vite, NO dev server. A stale artifact fails
 * by name so CI catches post-edit drift.
 */
export async function checkIconLibraryArtifact(
  options: IconLibraryOptions,
  target: string,
  safety?: SafetyCheckerConfig,
): Promise<IconLibraryCheckResult> {
  const artifactPath = resolvePath(target);
  const { artifact, report } = await buildArtifacts(options, safety);
  let existing = '<absent>';
  try {
    existing = await readFile(artifactPath, 'utf8');
  } catch {
    /* absent — reported stale */
  }
  return { fresh: existing === artifact, artifactPath, report };
}
