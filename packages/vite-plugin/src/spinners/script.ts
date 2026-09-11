/**
 * @jixoai/ui-vite-plugin (spinners) — the ROOT-SCRIPT adapter (C4,
 * openspec spin-ora-svg-lane design §5/§6).
 *
 * The programmatic entry behind the repo-root `gen:spins` /
 * `verify:spins --check` scripts: the canonical write (the ONLY
 * in-repo artifact writer — the single-writer law) and the freshness
 * check. This adapter imports NO vite: its `{file}` I/O is a node-fs
 * twin of the plugin-owned ProviderContext, and HMR watching is
 * meaningless outside a dev server. Spinners carry no scanner lane, so
 * there is no scan root — the script stands alone (design §5).
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve as resolvePath } from 'node:path';
import type { ProviderContext, SafetyCheckerConfig } from '../icons/types.js';
import { createSafetyChecker } from '../icons/safety.js';
import { generateSpinSet } from './generate.js';
import { resolveSpinnerInputs } from './resolve.js';
import type { SpinnersPluginOptions, SpinnersReport } from './types.js';

/** the shared build both script modes run (resolve → generate) */
async function buildArtifacts(
  options: SpinnersPluginOptions,
  safety?: SafetyCheckerConfig,
): Promise<{ artifact: string; report: SpinnersReport }> {
  const checker = createSafetyChecker(safety ?? { mode: 'warn' });
  const io: ProviderContext = {
    async loadSource(path: string) {
      const resolved = resolvePath(path);
      const data = new Uint8Array(await readFile(resolved));
      return { data, path: resolved, mimeType: 'image/svg+xml' };
    },
    watchFile(): void {
      /* no dev server in the script adapter — nothing to watch */
    },
  };
  const resolution = await resolveSpinnerInputs(options, io, checker);
  for (const warning of resolution.warnings) console.warn(warning);
  const generated = generateSpinSet(resolution.spinners);
  return {
    artifact: generated.artifact,
    report: {
      ...generated.report,
      warnings: [...resolution.warnings, ...generated.report.warnings],
    },
  };
}

/** what writeSpinSetArtifact reports back */
export interface SpinSetWriteResult {
  /** did the write happen? (unchanged content writes nothing) */
  readonly changed: boolean;
  readonly artifactPath: string;
  readonly report: SpinnersReport;
}

/**
 * Generate the canonical artifact and write it to `target` — the ONLY
 * sanctioned spin-set write in this repo (the vite adapter never
 * writes unless a consumer opts in). Writes only on content change so
 * repeated runs stay idempotent for watch tooling.
 */
export async function writeSpinSetArtifact(
  options: SpinnersPluginOptions,
  target: string,
  safety?: SafetyCheckerConfig,
): Promise<SpinSetWriteResult> {
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

/** what checkSpinSetArtifact reports back */
export interface SpinSetCheckResult {
  /** fresh = the on-disk artifact byte-matches the generator output */
  readonly fresh: boolean;
  readonly artifactPath: string;
  readonly report: SpinnersReport;
}

/**
 * The freshness gate (verify:spins --check): regenerate in memory and
 * compare — NO write, NO vite, NO dev server. A stale artifact fails
 * by name so CI catches post-edit drift.
 */
export async function checkSpinSetArtifact(
  options: SpinnersPluginOptions,
  target: string,
  safety?: SafetyCheckerConfig,
): Promise<SpinSetCheckResult> {
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
