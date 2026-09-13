/**
 * @jixoai/ui-design (pipeline) — the design file artifact: open + export (r2 rev2).
 *
 * Orthogonal intents (2):
 *   1. openDesignFile: materialize a design file back into
 *      design/prototypes/<name>/ — idempotent (identical bytes pass
 *      in silence), a clashing path throws NAMING the file, and
 *      paths escaping the prototype dir are rejected outright.
 *   2. exportDesignFile: the RELEASE ARTIFACT writer — a
 *      registry-item-shaped JSON snapshot of one prototype at a
 *      release tag (design/files/<name>.jixoai-design.json), for
 *      cross-project sharing. It is NOT the version database: git is
 *      (the r2 rev2 direction change, Owner 2026-09-11 — the old
 *      saveDesignFile version++/changelog engine was deleted; the
 *      changelog in the artifact is derived from the tag ledger's
 *      notes).
 *
 * Original need: Owner 2026-09-11 (design-studio r2 rev2). Paths
 * inside the JSON are POSIX relative to the prototype dir; content
 * is stored and restored byte-identically.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import { listReleaseTags, listTree, showFile } from './design-repo.ts';
import type { ReleaseTag } from './design-repo.ts';

/** the design-file schema stamp (design.md §1) */
export const DESIGN_FILE_SCHEMA = 'https://ui.jixoai.com/r/design-file.schema.json';
/** the design-file type stamp */
export const DESIGN_FILE_TYPE = 'jixoai:design';
/** design file extension + dir (design/files/<name>.jixoai-design.json) */
export const DESIGN_FILE_EXT = '.jixoai-design.json';
export const DESIGN_FILES_DIR = 'design/files';

/** one changelog entry — in the artifact, derived from the tag ledger's notes */
export interface DesignChange {
  readonly version: number;
  readonly at: string;
  readonly note: string;
}

/** one file snapshot inside the design file */
export interface DesignFileEntry {
  readonly path: string;
  readonly content: string;
}

/** the parsed *.jixoai-design.json shape */
export interface DesignFile {
  readonly $schema: string;
  readonly name: string;
  readonly type: string;
  readonly version: number;
  readonly meta: { readonly created: string; readonly savedAt: string; readonly tag?: string };
  readonly changes: readonly DesignChange[];
  readonly files: readonly DesignFileEntry[];
}

/** openDesignFile outcome */
export interface OpenDesignFileResult {
  readonly name: string;
  readonly version: number;
  /** prototype-relative POSIX paths written this run */
  readonly written: readonly string[];
  /** prototype-relative POSIX paths already materialized byte-identical */
  readonly unchanged: readonly string[];
}

/** errors naming exactly what clashed — callers print, never guess */
export class DesignFileError extends Error {
  public constructor(message: string) {
    super(`[design-file] ${message}`);
    this.name = 'DesignFileError';
  }
}

/** the canonical design-file path for a prototype name */
export function designFilePath(root: string, proto: string): string {
  return join(root, DESIGN_FILES_DIR, `${proto}${DESIGN_FILE_EXT}`);
}

/** prototype names are single safe segments (the manifest/canvas rule) */
function assertProtoName(proto: string): void {
  if (!/^[A-Za-z0-9._-]+$/.test(proto)) {
    throw new DesignFileError(`prototype name must be a single [A-Za-z0-9._-] segment (got: ${proto})`);
  }
}

/** parse + validate a design file's JSON (type stamp, files shape, path safety) */
export function parseDesignFile(json: string, source: string): DesignFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch (cause) {
    throw new DesignFileError(`${source} is not valid JSON: ${(cause as Error).message}`);
  }
  const record = parsed as Partial<DesignFile> | null;
  if (record === null || typeof record !== 'object') {
    throw new DesignFileError(`${source}: top level must be an object`);
  }
  if (record.type !== DESIGN_FILE_TYPE) {
    throw new DesignFileError(`${source}: type must be "${DESIGN_FILE_TYPE}" (got: ${String(record.type)})`);
  }
  if (typeof record.name !== 'string' || record.name.length === 0) {
    throw new DesignFileError(`${source}: name must be a non-empty string`);
  }
  if (!Number.isInteger(record.version) || (record.version ?? 0) < 1) {
    throw new DesignFileError(`${source}: version must be a positive integer (got: ${String(record.version)})`);
  }
  if (!Array.isArray(record.changes)) {
    throw new DesignFileError(`${source}: changes must be an array`);
  }
  if (!Array.isArray(record.files)) {
    throw new DesignFileError(`${source}: files must be an array`);
  }
  for (const entry of record.files) {
    if (typeof entry?.path !== 'string' || typeof entry.content !== 'string') {
      throw new DesignFileError(`${source}: every files[] entry needs { path, content } strings`);
    }
    // path safety: POSIX, relative, no escape
    if (entry.path.length === 0 || entry.path.startsWith('/') || entry.path.includes('\\') || entry.path.split('/').includes('..')) {
      throw new DesignFileError(`${source}: unsafe file path "${entry.path}" (must be a relative POSIX path inside the prototype dir)`);
    }
  }
  return {
    $schema: typeof record.$schema === 'string' ? record.$schema : DESIGN_FILE_SCHEMA,
    name: record.name,
    type: DESIGN_FILE_TYPE,
    version: record.version!,
    meta: { created: record.meta?.created ?? '', savedAt: record.meta?.savedAt ?? '', tag: record.meta?.tag },
    changes: record.changes,
    files: record.files,
  };
}

/**
 * Materialize a design file into design/prototypes/<name>/. Idempotent:
 * a target that already exists with identical bytes is reported as
 * unchanged; a target with DIFFERENT bytes throws naming the clashing
 * path (the caller decides — open never overwrites host work).
 */
export function openDesignFile(rootInput: string, filePath: string): OpenDesignFileResult {
  const root = resolve(rootInput);
  const path = resolve(root, filePath);
  if (!existsSync(path)) {
    throw new DesignFileError(`design file not found: ${path}`);
  }
  const designFile = parseDesignFile(readFileSync(path, 'utf8'), path);
  assertProtoName(designFile.name);

  const protoDir = join(root, 'design/prototypes', designFile.name);
  const written: string[] = [];
  const unchanged: string[] = [];
  for (const entry of designFile.files) {
    const target = join(protoDir, entry.path);
    if (existsSync(target)) {
      if (readFileSync(target, 'utf8') === entry.content) {
        unchanged.push(entry.path);
        continue;
      }
      throw new DesignFileError(
        `path conflict materializing ${path}: ${entry.path} already exists with different content at ${target} — move it aside or delete it, open never overwrites`,
      );
    }
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, entry.content, 'utf8');
    written.push(entry.path);
  }
  return { name: designFile.name, version: designFile.version, written, unchanged };
}

/**
 * Export the release artifact for one prototype at a release tag:
 * the full tagged tree of prototypes/<proto> plus a changelog
 * derived from the tag ledger (every release up to and including
 * this one, notes intact) — a shareable, git-independent snapshot.
 * Returns the absolute artifact path.
 */
export function exportDesignFile(rootInput: string, proto: string, tag: ReleaseTag): string {
  assertProtoName(proto);
  const root = resolve(rootInput);
  const designDir = join(root, 'design');
  const prefix = `prototypes/${proto}`;
  const paths = listTree(designDir, tag.name, prefix);
  if (paths.length === 0) {
    throw new DesignFileError(`prototype "${proto}" has no tracked files at tag ${tag.name} — nothing to export`);
  }
  const files: DesignFileEntry[] = paths.map((repoPath) => ({
    path: repoPath.slice(prefix.length + 1),
    content: showFile(designDir, tag.name, repoPath) ?? '',
  }));

  const ledger = listReleaseTags(designDir);
  const index = ledger.findIndex((t) => t.name === tag.name);
  if (index < 0) {
    throw new DesignFileError(`tag ${tag.name} is not in the release ledger (was it created by design release?)`);
  }
  const changes: DesignChange[] = ledger.slice(0, index + 1).map((t, i) => ({ version: i + 1, at: t.at, note: t.note }));

  const designFile: DesignFile = {
    $schema: DESIGN_FILE_SCHEMA,
    name: proto,
    type: DESIGN_FILE_TYPE,
    version: index + 1,
    meta: { created: ledger[0]?.at ?? tag.at, savedAt: tag.at, tag: tag.name },
    changes,
    files,
  };
  const path = designFilePath(root, proto);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(designFile, null, 2)}\n`, 'utf8');
  return path;
}
