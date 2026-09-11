/**
 * @jixoai/ui-design (pipeline) — three-way drift apply (r2 rev2).
 *
 * Orthogonal intents (2):
 *   1. applyDrift: for every DRIFTED promotion, run the three-way
 *      merge — base = `git show <commitSha>:<ref>` through the
 *      rewrite pipe, ours = the current host file (a missing ours
 *      means the developer deleted it: skipped and listed, never
 *      resurrected), theirs = the HEAD version through the SAME
 *      rewrite pipe. The engine is `git merge-file --diff3 -L ours
 *      -L base -L theirs` (git IS the engine — the diff3 npm
 *      dependency was dropped with the r2 rev2 direction change,
 *      Owner 2026-09-11; markers land in the r2 vocabulary
 *      verbatim). NOTHING is silently overwritten: before each
 *      write the host file is re-read and must still equal the ours
 *      that entered the merge (the CAS posture of design.md §4) —
 *      a mid-apply external edit skips that file with a report line.
 *   2. convergence bookkeeping: after a CLEAN, actually-written
 *      apply the record's commitSha advances to the design repo's
 *      HEAD (the merged state IS the new anchor); conflicted files
 *      keep the old anchor — resolve the markers, re-run apply, it
 *      converges. Nothing writes under dryRun.
 *
 * Original need: Owner Q2 2026-09-11 (design-studio r2): notify +
 * assist the merge, never auto-sync. The ours-deleted / CAS /
 * never-resurrect semantics carried over unchanged from the
 * inline-snapshot revision.
 */

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import { initDesignRepo, isDesignRepo, parseConflictBlocks, showFile, revParse, gitMergeFile } from './design-repo.ts';
import type { ParsedConflict } from './design-repo.ts';
import { diffHunks } from './diff.ts';
import { promotionStatus } from './promote.ts';
import { PROMOTIONS_PATH, baseContentOf, readPromotions, repoPathOf } from './promote.ts';
import { buildRewriteAliases, rewriteSpecifiers } from './promote.ts';
import type { PromotionRecord } from './promote.ts';
import { probeDesignHost } from '../server/probe.ts';

/** one conflict as reported per file (line arrays for the named report) */
export type AppliedConflict = ParsedConflict;

/** skip reasons — every one names the law it enforces */
export type ApplySkipReason =
  | 'ours-deleted' // the developer deleted the file: never resurrect (spec)
  | 'ours-changed' // external edit raced the merge: CAS refusal, never blind-write
  | 'ref-removed-from-design' // HEAD no longer carries the ref: no theirs to merge
  | 'base-missing' // the anchor commit lost the blob (history rewritten) — refuse to guess
  | 'unresolved-markers'; // ours still carries a past apply's markers — resolve first (re-merging buries the pending decision)

/** per-file outcome */
export interface ApplyFileReport {
  readonly file: string;
  readonly proto: string;
  /** true when content was written (or would be, outside dry-run) */
  readonly applied: boolean;
  /** written clean (no conflict markers) */
  readonly clean: boolean;
  /** conflict regions when clean === false (markers already in the file) */
  readonly conflicts: readonly AppliedConflict[];
  /** changed hunks base → merged (the "report lists the merged hunks" clause) */
  readonly mergedHunks: number;
  readonly skipReason?: ApplySkipReason;
}

/** applyDrift outcome */
export interface ApplyReport {
  readonly dryRun: boolean;
  readonly files: readonly ApplyFileReport[];
  /** absolute manifest path (unchanged under dry-run) */
  readonly manifestPath: string;
}

/** apply options — beforeWrite is the CAS test seam, dryRun reports only */
export interface ApplyDriftOptions {
  readonly dryRun?: boolean;
  /**
   * TEST SEAM: invoked after the merge, right before the CAS re-read
   * + write of each file — a hook that edits the file simulates an
   * external write racing apply (VD1e's CAS posture). Never set by
   * the CLI.
   */
  readonly beforeWrite?: (target: string) => void;
}

/** read a file as text; null when absent (the ours-deleted signal) */
function readOrNull(path: string): string | null {
  if (!existsSync(path)) return null;
  return readFileSync(path, 'utf8');
}

/**
 * Apply design drift into the host tree. See the module header for the
 * three-way model; nothing writes under dryRun, and the manifest only
 * advances for CLEAN, actually-written files.
 */
export function applyDrift(rootInput: string, options: ApplyDriftOptions = {}): ApplyReport {
  const root = resolve(rootInput);
  const host = probeDesignHost(root);
  const dryRun = options.dryRun === true;

  const status = promotionStatus(root);
  const designDir = join(root, 'design');
  const headSha = isDesignRepo(designDir) ? revParse(designDir, 'HEAD') : null;
  const records = [...readPromotions(root)];
  const byFile = new Map(records.map((record) => [record.file, record]));
  const files: ApplyFileReport[] = [];
  let recordsChanged = false;

  for (const promotion of status.promotions) {
    if (!promotion.drifted) continue;
    const record = byFile.get(promotion.file);
    if (record === undefined) continue; // manifest changed mid-run — next run sees it
    const target = join(root, promotion.file);

    const ours = readOrNull(target);
    if (ours === null) {
      files.push({ file: promotion.file, proto: promotion.proto, applied: false, clean: false, conflicts: [], mergedHunks: 0, skipReason: 'ours-deleted' });
      continue;
    }
    if (promotion.refRemovedFromDesign) {
      files.push({ file: promotion.file, proto: promotion.proto, applied: false, clean: false, conflicts: [], mergedHunks: 0, skipReason: 'ref-removed-from-design' });
      continue;
    }
    if (ours.includes('<<<<<<< ours') && ours.includes('>>>>>>> theirs')) {
      files.push({ file: promotion.file, proto: promotion.proto, applied: false, clean: false, conflicts: [], mergedHunks: 0, skipReason: 'unresolved-markers' });
      continue;
    }

    // base + theirs from git through the SAME rewrite pipe
    const base = baseContentOf(root, host, record, target);
    const theirsRaw = showFile(designDir, 'HEAD', repoPathOf(record.proto, record.ref));
    if (base === null || theirsRaw === null) {
      files.push({ file: promotion.file, proto: promotion.proto, applied: false, clean: false, conflicts: [], mergedHunks: 0, skipReason: 'base-missing' });
      continue;
    }
    const theirs = rewriteSpecifiers(theirsRaw, buildRewriteAliases(host, dirname(target)));

    const result = gitMergeFile(base, ours, theirs);
    const conflicts = parseConflictBlocks(result.merged);

    // CAS: ours must be byte-stable from the read that entered the merge
    // to this re-read right before the write — anything else races us
    // (the beforeWrite seam is where tests inject that race)
    if (options.beforeWrite !== undefined) options.beforeWrite(target);
    if (readOrNull(target) !== ours) {
      files.push({ file: promotion.file, proto: promotion.proto, applied: false, clean: false, conflicts: [], mergedHunks: 0, skipReason: 'ours-changed' });
      continue;
    }

    if (result.merged === ours) {
      // already converged (e.g. the developer resolved markers by hand):
      // nothing to write — but the anchor still advances
      if (!dryRun) recordsChanged = advanceRecord(records, promotion.file, headSha) || recordsChanged;
      files.push({ file: promotion.file, proto: promotion.proto, applied: false, clean: true, conflicts: [], mergedHunks: 0 });
      continue;
    }

    if (!dryRun) {
      writeFileSync(target, result.merged, 'utf8');
      if (result.conflicts === 0) {
        recordsChanged = advanceRecord(records, promotion.file, headSha) || recordsChanged;
      }
    }
    files.push({
      file: promotion.file,
      proto: promotion.proto,
      applied: !dryRun,
      clean: result.conflicts === 0,
      conflicts,
      mergedHunks: diffHunks(base.split('\n'), result.merged.split('\n')).length,
    });
  }

  if (!dryRun && recordsChanged) {
    writeFileSync(join(root, PROMOTIONS_PATH), `${JSON.stringify(records, null, 2)}\n`, 'utf8');
  }
  return { dryRun, files, manifestPath: join(root, PROMOTIONS_PATH) };
}

/** advance one record's anchor to the design repo HEAD (the next merge ancestor); true when found */
function advanceRecord(records: PromotionRecord[], file: string, headSha: string | null): boolean {
  if (headSha === null) return false;
  const index = records.findIndex((r) => r.file === file);
  if (index < 0) return false;
  records[index] = { ...records[index]!, commitSha: headSha };
  return true;
}
