/**
 * @jixoai/ui-design (pipeline) — promotion into the host + drift status (r2 rev2).
 *
 * Orthogonal intents (3):
 *   1. rewriteSpecifiers: the PURE rewrite pipe (the r2 contract
 *      function): `#jixoai/<item>` specifiers → the host form given a
 *      plain specifier→specifier table. promote/status/apply all run
 *      content through THE SAME function, so the promoted base and
 *      every future "theirs" live in one coordinate system —
 *      import lines never phantom-conflict (design.md §2, review B2).
 *   2. promote: copy the RELEASED prototype content (the current
 *      annotated tag — promoting from the tag, not the working tree,
 *      keeps the recorded checkpoint honest) into the host tree
 *      (default src/lib/design/<proto>/), rewriting imports relative
 *      to each target file, and record per-file provenance in
 *      design/.promotions.json: {file, proto, ref, tag, commitSha,
 *      promotedAt} — NO inline base (r2 rev2: git is the database;
 *      base = `git show <commitSha>:…` on demand). Re-promoting an
 *      existing target refuses with a diff unless forced (force
 *      prints what it replaced).
 *   3. promotionStatus: the drift report — git is the engine:
 *      drifted = `git diff --name-status <commitSha>..HEAD -- <ref>`,
 *      the unified diff = `git diff <commitSha>..HEAD -- <ref>`, the
 *      intent summary = the release-tag notes published after the
 *      promoted checkpoint. Serves /__design__/api/promotions.json
 *      (the studio badge's data source) and `design status`.
 *
 * Original need: Owner 2026-09-11 (design-studio r2 rev2 direction
 * change: git release model replaces inline snapshots). The drift
 * anchor is the recorded commitSha — identical to the tag at
 * promotion time, and after a clean apply it advances so converged
 * promotions stop drifting (wip commits after it re-drift, honestly).
 * Rewrite form: RELATIVE specifiers derived from the probe's
 * absolute alias table (DesignHostInfo carries no raw consumer
 * alias string — frozen r1 probe; relative resolves in every host
 * build without tsconfig-path assumptions).
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

import {
  currentReleaseTag,
  diffNameStatus,
  diffRange,
  initDesignRepo,
  isAncestor,
  isDesignRepo,
  listReleaseTags,
  listTree,
  showFile,
} from './design-repo.ts';
import type { ReleaseTag } from './design-repo.ts';
import { unifiedDiff } from './diff.ts';
import type { DesignHostInfo } from '../server/probe.ts';
import { ITEM_ALIAS_PREFIX, probeDesignHost } from '../server/probe.ts';

/** the promotion manifest path (design/.promotions.json — r2 contract) */
export const PROMOTIONS_PATH = 'design/.promotions.json';
/** the prototype subtrees promotion copies (design.md §2: pages/components) */
export const PROMOTED_SUBTREES = ['pages', 'components'] as const;
/** the default host target dir, relative to the host root */
export const DEFAULT_PROMOTE_DIR = 'src/lib/design';

/**
 * one provenance record — the r2 rev2 contract schema: WHICH release
 * a host file came from (the merge base is reconstructed on demand
 * from git, never stored inline)
 */
export interface PromotionRecord {
  /** host-root-relative POSIX path of the promoted file */
  readonly file: string;
  /** the prototype name */
  readonly proto: string;
  /** prototype-relative POSIX path of the source ref */
  readonly ref: string;
  /** the release tag name at promotion time */
  readonly tag: string;
  /** the commit the tag pointed at (the drift anchor) */
  readonly commitSha: string;
  /** ISO timestamp of the promotion */
  readonly promotedAt: string;
}

/** refusal payload: the existing record, the incoming text, their diff */
export class PromotionExistsError extends Error {
  public readonly record: PromotionRecord;
  public readonly incoming: string;
  public readonly diff: string;

  public constructor(record: PromotionRecord, incoming: string, diff: string) {
    super(
      `[promote] target already promoted: ${record.file} (from ${record.proto}@${record.tag}, ${record.promotedAt}). ` +
        `Re-run with --force to overwrite (the diff below is printed first).`,
    );
    this.name = 'PromotionExistsError';
    this.record = record;
    this.incoming = incoming;
    this.diff = diff;
  }
}

/** promote() options */
export interface PromoteOptions {
  /** prototype-relative refs to promote (default: every pages/ + components/ file in the tag) */
  readonly select?: readonly string[];
  /** target dir override, host-root-relative (default src/lib/design/<proto>) */
  readonly to?: string;
  /** overwrite an existing promotion of the same target (diff printed first) */
  readonly force?: boolean;
}

/** promote() outcome */
export interface PromoteResult {
  /** absolute target dir */
  readonly toDir: string;
  /** the release tag promoted from */
  readonly tag: ReleaseTag;
  /** host-root-relative POSIX paths promoted this run */
  readonly promoted: readonly string[];
  /** paths overwritten through --force (host edits replaced — explicit opt-in) */
  readonly forced: readonly string[];
  /** with --force: the host→incoming diff of every replaced file (design.md §2: print before overwriting) */
  readonly forcedDiffs: readonly { readonly file: string; readonly diff: string }[];
  /** absolute manifest path */
  readonly manifestPath: string;
}

/* ── the rewrite pipe (r2 contract, pure) ──────────────────────────────── */

/**
 * Rewrite import specifiers through a plain { from: to } table. Pure
 * string mapping on QUOTED occurrences (single or double) — the keys
 * are exact specifiers, so entries can never shadow each other, and
 * unknown `#jixoai/*` specifiers stay verbatim. Kept dependency-free:
 * the parallel workstream's spike imports it directly (r2 contract).
 */
export function rewriteSpecifiers(source: string, aliases: Readonly<Record<string, string>>): string {
  let out = source;
  for (const [from, to] of Object.entries(aliases)) {
    out = out.replaceAll(`'${from}'`, `'${to}'`).replaceAll(`"${from}"`, `"${to}"`);
  }
  return out;
}

/**
 * The rewrite table for one target file: every probe-known
 * `#jixoai/<item>` → a RELATIVE specifier from the target file's own
 * directory. Directory items with an index entry stay directory-form
 * (vite resolves index.*); bare .svelte entries name the file.
 */
export function buildRewriteAliases(host: DesignHostInfo, fromDir: string): Readonly<Record<string, string>> {
  const table: Record<string, string> = {};
  for (const [alias, entry] of Object.entries(host.itemAliases)) {
    const item = alias.slice(ITEM_ALIAS_PREFIX.length);
    const base = entry.split(/[\\/]/).pop() ?? '';
    const dirBase = dirname(entry).split(/[\\/]/).pop() ?? '';
    const target = (base === 'index.ts' || base === 'index.js') && dirBase === item ? dirname(entry) : entry;
    let spec = relative(fromDir, target).split('\\').join('/');
    if (!spec.startsWith('.')) spec = `./${spec}`; // ESM: same-dir relatives need './'
    table[alias] = spec;
  }
  return table;
}

/** rewrite design-side source for a given absolute target file (same pipe everywhere) */
function rewriteForTarget(source: string, host: DesignHostInfo, targetFile: string): string {
  return rewriteSpecifiers(source, buildRewriteAliases(host, dirname(targetFile)));
}

/** repo-relative tracked path of a prototype ref */
export function repoPathOf(proto: string, ref: string): string {
  return `prototypes/${proto}/${ref}`;
}

/** reconstruct the promoted base content of a record (git is the database) */
export function baseContentOf(root: string, host: DesignHostInfo, record: PromotionRecord, targetFile: string): string | null {
  const raw = showFile(join(root, 'design'), record.commitSha, repoPathOf(record.proto, record.ref));
  if (raw === null) return null;
  return rewriteForTarget(raw, host, targetFile);
}

/* ── the manifest ───────────────────────────────────────────────────────── */

/** absolute path of the promotion manifest */
export function promotionsPath(root: string): string {
  return join(root, PROMOTIONS_PATH);
}

/** read the manifest (absent → []); malformed content fails naming the file */
export function readPromotions(rootInput: string): readonly PromotionRecord[] {
  const root = resolve(rootInput);
  const path = promotionsPath(root);
  if (!existsSync(path)) return [];
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(path, 'utf8'));
  } catch (cause) {
    throw new Error(`[promote] ${PROMOTIONS_PATH} is not valid JSON: ${(cause as Error).message}`);
  }
  if (!Array.isArray(parsed)) {
    throw new Error(`[promote] ${PROMOTIONS_PATH} must be an array of promotion records`);
  }
  return parsed as readonly PromotionRecord[];
}

/** write the manifest (2-space + trailing newline, repo style) */
function writePromotions(root: string, records: readonly PromotionRecord[]): string {
  const path = promotionsPath(root);
  writeFileSync(path, `${JSON.stringify(records, null, 2)}\n`, 'utf8');
  return path;
}

/** POSIX host-root-relative path */
function toPosixRelative(root: string, absolute: string): string {
  return relative(root, absolute).split('\\').join('/');
}

/** the ref set eligible for promotion, enumerated from the TAGGED tree (sorted) */
function promotionRefs(designDir: string, tag: ReleaseTag, proto: string): string[] {
  const prefix = `prototypes/${proto}`;
  return listTree(designDir, tag.name, prefix)
    .map((repoPath) => repoPath.slice(prefix.length + 1))
    .filter((ref) => PROMOTED_SUBTREES.some((subtree) => ref === subtree || ref.startsWith(`${subtree}/`)))
    .sort((a, b) => (a < b ? -1 : 1));
}

/* ── promote ────────────────────────────────────────────────────────────── */

/**
 * Promote a prototype's released pages/components into the host tree.
 * The content source is the CURRENT RELEASE TAG (annotated, reachable
 * from HEAD) — working-tree state that was never saved/released is
 * not promoted (release first). Same-target re-promotion refuses
 * with a diff unless forced.
 */
export function promote(rootInput: string, proto: string, options: PromoteOptions = {}): PromoteResult {
  const root = resolve(rootInput);
  const host = probeDesignHost(root);
  const { designDir } = initDesignRepo(root);
  if (!existsSync(join(root, 'design/prototypes', proto))) {
    throw new Error(`[promote] prototype not found: design/prototypes/${proto}`);
  }
  const tag = currentReleaseTag(designDir);
  if (tag === null) {
    throw new Error(`[promote] no release tag in the design repo — run \`jixoai-ui design save\` then \`jixoai-ui design release\` first (promotions anchor on releases)`);
  }

  // refs: --select wins (validated against the tagged tree); default
  // = every pages/components file the tag carries
  const refs = options.select !== undefined ? [...options.select] : promotionRefs(designDir, tag, proto);
  if (refs.length === 0) {
    throw new Error(`[promote] nothing to promote for ${proto} at tag ${tag.name} (no pages/ or components/ files${options.select !== undefined ? ' matched --select' : ''})`);
  }
  for (const ref of refs) {
    if (showFile(designDir, tag.name, repoPathOf(proto, ref)) === null) {
      throw new Error(`[promote] selected ref not in tag ${tag.name}: design/prototypes/${proto}/${ref} (save + release first)`);
    }
  }

  const toDir = resolve(root, options.to ?? join(DEFAULT_PROMOTE_DIR, proto));
  const records = [...readPromotions(root)];
  const now = new Date().toISOString();
  const promoted: string[] = [];
  const forced: string[] = [];
  const forcedDiffs: { file: string; diff: string }[] = [];

  for (const ref of refs) {
    const source = showFile(designDir, tag.name, repoPathOf(proto, ref))!;
    const target = join(toDir, ref);
    const file = toPosixRelative(root, target);
    const incoming = rewriteForTarget(source, host, target);

    const existingIndex = records.findIndex((r) => r.file === file);
    if (existingIndex >= 0) {
      const record = records[existingIndex]!;
      const hostContent = existsSync(target) ? readFileSync(target, 'utf8') : '';
      const diff = unifiedDiff(hostContent, incoming, { a: `${file} (host, promoted ${record.promotedAt} from ${record.tag})`, b: `${file} (incoming, ${proto}@${tag.name})` });
      if (options.force !== true) {
        throw new PromotionExistsError(record, incoming, diff);
      }
      // --force: keep the diff in the result — the operator sees what
      // the overwrite replaced (design.md §2: the diff prints first)
      forcedDiffs.push({ file, diff });
    }
    if (existingIndex >= 0) forced.push(file);

    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, incoming, 'utf8');
    const record: PromotionRecord = {
      file,
      proto,
      ref,
      tag: tag.name,
      commitSha: tag.commitSha,
      promotedAt: now,
    };
    if (existingIndex >= 0) records[existingIndex] = record;
    else records.push(record);
    promoted.push(file);
  }

  records.sort((a, b) => (a.file < b.file ? -1 : 1));
  const manifestPath = writePromotions(root, records);
  return { toDir, tag, promoted, forced, forcedDiffs, manifestPath };
}

/* ── drift status ───────────────────────────────────────────────────────── */

/** changelog entries since a promotion — the tag ledger's notes (intent summaries) */
export interface ChangelogEntry {
  /** the release tag name */
  readonly tag: string;
  readonly at: string;
  readonly note: string;
}

/** one promotion's drift verdict */
export interface PromotionFileStatus {
  readonly file: string;
  readonly proto: string;
  readonly ref: string;
  readonly tag: string;
  readonly commitSha: string;
  readonly promotedAt: string;
  /** the newest release tag reachable from HEAD; null = none exist */
  readonly currentTag: string | null;
  /** the design moved ahead of the promotion anchor (apply is meaningful) */
  readonly drifted: boolean;
  /** the recorded tag is gone from the ledger (deleted by hand) — provenance lost */
  readonly tagMissing: boolean;
  /** the promoted file is gone from the host (developer deleted it) */
  readonly hostMissing: boolean;
  /** the promoted file differs from its reconstructed base (developer edits present) */
  readonly hostModified: boolean;
  /** release notes published after the promotion (empty when in sync) */
  readonly changelogSince: readonly ChangelogEntry[];
  /** git unified diff commitSha..HEAD for the ref (null when not drifted) */
  readonly diff: string | null;
  /** the ref no longer exists at HEAD (the design deleted it) */
  readonly refRemovedFromDesign: boolean;
}

/** the status document served at /__design__/api/promotions.json */
export interface PromotionStatus {
  readonly generatedAt: string;
  readonly promotions: readonly PromotionFileStatus[];
}

/**
 * The drift report: for every promotion record, diff the recorded
 * anchor (commitSha — the tag's commit at promotion time) against
 * the design repo HEAD through git, list the release-tag notes
 * published since, and flag host-side states (missing / locally
 * modified vs the reconstructed base). Pure read: status never
 * writes anything.
 */
export function promotionStatus(rootInput: string): PromotionStatus {
  const root = resolve(rootInput);
  const host = probeDesignHost(root);
  const designDir = join(root, 'design');
  const repoPresent = isDesignRepo(designDir);
  const ledger = repoPresent ? listReleaseTags(designDir) : [];
  const newestTag = repoPresent ? currentReleaseTag(designDir) : null;

  const promotions: PromotionFileStatus[] = readPromotions(root).map((record) => {
    const target = join(root, record.file);
    const hostContent = existsSync(target) ? readFileSync(target, 'utf8') : null;
    const path = repoPathOf(record.proto, record.ref);

    const tagMissing = repoPresent && !ledger.some((t) => t.name === record.tag);
    let drifted = false;
    let diff: string | null = null;
    let refRemovedFromDesign = false;
    if (repoPresent) {
      const changes = diffNameStatus(designDir, record.commitSha, 'HEAD', path);
      if (changes.length > 0) {
        drifted = true;
        refRemovedFromDesign = changes.some((line) => line.startsWith('D'));
        diff = diffRange(designDir, record.commitSha, 'HEAD', path);
      }
    }

    // intent since the anchor: release tags whose commit is reachable
    // from HEAD but NOT from the anchor — their notes are the why
    const changelogSince: ChangelogEntry[] = repoPresent
      ? ledger
          .filter((t) => !isAncestor(designDir, t.commitSha, record.commitSha) && isAncestor(designDir, t.commitSha, 'HEAD'))
          .map((t) => ({ tag: t.name, at: t.at, note: t.note }))
      : [];

    // host-side: developer edits vs the reconstructed promoted base
    let hostModified = false;
    if (hostContent !== null && repoPresent) {
      const base = baseContentOf(root, host, record, target);
      hostModified = base !== null && base !== hostContent;
    }

    return {
      file: record.file,
      proto: record.proto,
      ref: record.ref,
      tag: record.tag,
      commitSha: record.commitSha,
      promotedAt: record.promotedAt,
      currentTag: newestTag?.name ?? null,
      drifted,
      tagMissing,
      hostMissing: hostContent === null,
      hostModified,
      changelogSince,
      diff,
      refRemovedFromDesign,
    };
  });
  return { generatedAt: new Date().toISOString(), promotions };
}
