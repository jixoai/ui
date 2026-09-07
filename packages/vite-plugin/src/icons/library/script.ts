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
 *
 * v1 scope law (icon-library-presets B2, 2026-09-07): font sources
 * (`{ font, code }` / `{ font, liga }`) are REJECTED with a named
 * error — the script twin's I/O carries no woff2 decompression or font
 * mime detection (vite-plugin loadSource owns both). Extending the
 * script twin to fonts is future work outside that change.
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve as resolvePath } from 'node:path';
import type { ProviderContext, SafetyCheckerConfig, SourceDescriptor } from '../types.js';
import { createSafetyChecker } from '../safety.js';
import { generateIconLibraryArtifacts } from './generate.js';
import { normalizeIconPresets } from './presets/index.js';
import { scanProjectSources } from './scan.js';
import { resolveLibraryInputs } from './resolve.js';
import { DEFAULT_LIBRARY_OUTPUT } from './config.js';
import type { IconLibraryOptions, LibraryReport } from './types.js';

/** the named rejection for font sources in the svg-only script twin */
function assertNoFontSources(options: IconLibraryOptions): void {
  for (const [name, source] of Object.entries(options.icons ?? {})) {
    if (typeof source === 'object' && source !== null && 'font' in source) {
      throw new Error(
        `[jixoai-icons] library icon "${name}" uses a font source ({ font, code | ` +
          'liga }) — the root-script adapter (gen:icons / verify:icons) is svg-only ' +
          'by design: font extraction needs the vite plugin\'s loadSource lane ' +
          '(woff2 decompression + font mime detection). Extract the glyph through ' +
          'jixoai({ icons: { library } }) in vite, or reference a pre-extracted ' +
          '.svg through { file }',
      );
    }
  }
}

/** the shared build both script modes run (resolve → generate). The
 *  scanRoot (optional, default process.cwd()) feeds the EAGER project
 *  walk — the same walk the vite build runs at buildStart, so the
 *  script twin's scanned set (and therefore its artifact bytes) equals
 *  the vite artifact's for the same sources (design §1a: no
 *  scanner-less twin, no divergence). The walk EXCLUDES both the
 *  configured output AND the actual write target (codex r2 M2: a
 *  custom target inside the scan root would otherwise be scanned on
 *  the next run, violating the generated-artifact exclusion and
 *  parity). With no presets enabled the walk is skipped entirely — no
 *  ref could ever match. */
async function buildArtifacts(
  options: IconLibraryOptions,
  safety?: SafetyCheckerConfig,
  scanRoot?: string,
  artifactPath?: string,
): Promise<{ artifact: string; report: LibraryReport }> {
  assertNoFontSources(options);
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
  // the EAGER walk (icon-prefix-compiler design §1a) — parity with the
  // vite build's buildStart walk over the same project sources
  const root = resolvePath(scanRoot ?? process.cwd());
  const presets = normalizeIconPresets(options.presets);
  const templatePrefixes = [...new Set(presets.map((preset) => preset.prefix))];
  const excluded = [resolvePath(root, options.output ?? DEFAULT_LIBRARY_OUTPUT)];
  if (artifactPath !== undefined) excluded.push(resolvePath(artifactPath));
  const scanned =
    templatePrefixes.length === 0
      ? []
      : await scanProjectSources(root, templatePrefixes, { exclude: excluded });
  const resolution = await resolveLibraryInputs(options, io, checker, scanned);
  for (const warning of resolution.warnings) console.warn(warning);
  const generated = generateIconLibraryArtifacts(resolution.icons, {
    ...options,
    aliases: resolution.aliases,
    templatePrefixes,
  });
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
 * repeated runs stay idempotent for watch tooling. The optional
 * `scanRoot` (project root for the eager prefix scan; default
 * process.cwd()) keeps the script twin byte-equal to the vite build.
 */
export async function writeIconLibraryArtifact(
  options: IconLibraryOptions,
  target: string,
  safety?: SafetyCheckerConfig,
  scanRoot?: string,
): Promise<IconLibraryWriteResult> {
  const artifactPath = resolvePath(target);
  const { artifact, report } = await buildArtifacts(options, safety, scanRoot, artifactPath);
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
 * by name so CI catches post-edit drift. The optional `scanRoot`
 * mirrors writeIconLibraryArtifact's (the eager scan's project root).
 */
export async function checkIconLibraryArtifact(
  options: IconLibraryOptions,
  target: string,
  safety?: SafetyCheckerConfig,
  scanRoot?: string,
): Promise<IconLibraryCheckResult> {
  const artifactPath = resolvePath(target);
  const { artifact, report } = await buildArtifacts(options, safety, scanRoot, artifactPath);
  let existing = '<absent>';
  try {
    existing = await readFile(artifactPath, 'utf8');
  } catch {
    /* absent — reported stale */
  }
  return { fresh: existing === artifact, artifactPath, report };
}
