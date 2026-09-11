/**
 * @jixoai/ui-design (pipeline) — the design/ git repo, the version engine (r2 rev2).
 *
 * Orthogonal intents (3):
 *   1. the nested repository: design/ carries its OWN .git (the host
 *      repo already ignores design/ wholesale — zero pollution) with
 *      a tool-managed .gitignore (studio.svelte, files/, .promotions
 *     .json stay untracked artifacts); a local user.name/email
 *      fallback keeps commits working on hosts with no global git
 *      identity. initDesignRepo is IDEMPOTENT — re-runs fill gaps.
 *   2. the checkpoint verbs over that repo: saveDesignCommit (wip
 *      commit, repo-wide or per-proto pathspec) and releaseDesignTag
 *      (annotated tag — the deliberate version checkpoint; notes are
 *      the release notes / intent summary). Discipline: re-releasing
 *      an existing name refuses, releasing an unchanged tree refuses
 *      with a hint, a dirty tree refuses with a save hint.
 *   3. the read plumbing the pipeline consumes: tag listing with
 *      notes (the intent ledger), blob reads at a ref, range diffs,
 *      and the three-way `git merge-file --diff3` engine (git IS the
 *      merge engine — the diff3 npm dependency was dropped with the
 *      r2 direction change, Owner 2026-09-11).
 *
 * Original need: Owner direction change 2026-09-11 (design-studio r2
 * rev2): git replaces the inline-snapshot storage — save = wip
 * commit, release = annotated tag, status = git diff, apply =
 * git merge-file. All git invocations are explicit, cwd-pinned to
 * the design repo, and never touch the host repository.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/** one annotated release tag — notes are the intent summary ledger */
export interface ReleaseTag {
  readonly name: string;
  readonly commitSha: string;
  readonly at: string;
  readonly note: string;
}

/** releaseDesignTag outcome */
export interface ReleaseResult {
  readonly tag: ReleaseTag;
}

/** git execution failure with the command + stderr attached */
export class DesignRepoError extends Error {
  public readonly command: string;
  public readonly stderr: string;

  public constructor(message: string, command: string, stderr: string) {
    super(`[design-repo] ${message} (command: ${command}; stderr: ${stderr.trim()})`);
    this.name = 'DesignRepoError';
    this.command = command;
    this.stderr = stderr;
  }
}

/* ── the runner ─────────────────────────────────────────────────────────── */

/**
 * Run git in the design repo. stderr is captured (never leaks to the
 * operator's console); a nonzero exit without `allowFailure` throws a
 * DesignRepoError naming the command. `env` overrides the child
 * environment (the identity-fallback TEST isolates the global/system
 * configs through GIT_CONFIG_GLOBAL/GIT_CONFIG_SYSTEM=/dev/null).
 */
export function runGit(designDir: string, args: readonly string[], options: { allowFailure?: boolean; stdin?: string; env?: NodeJS.ProcessEnv } = {}): { code: number; stdout: string; stderr: string } {
  const result = spawnSync('git', args, {
    cwd: designDir,
    encoding: 'utf8',
    env: { ...process.env, ...options.env },
    input: options.stdin,
  });
  if (result.error !== undefined) {
    throw new DesignRepoError(`git failed to start: ${result.error.message}`, `git ${args.join(' ')}`, String(result.error));
  }
  const stdout = result.stdout ?? '';
  const stderr = result.stderr ?? '';
  if (result.status !== 0 && options.allowFailure !== true) {
    throw new DesignRepoError(`git exited ${result.status}`, `git ${args.join(' ')}`, stderr);
  }
  return { code: result.status ?? -1, stdout, stderr };
}

/* ── init / identity ────────────────────────────────────────────────────── */

/** files that stay OUT of the design repo (artifacts + host-owned page) */
const REPO_GITIGNORE = `# tool-managed (design-studio r2 rev2, 2026-09-11): the design
# repo tracks prototypes/ only — everything below is a regenerable
# artifact or host-owned state
/.promotions.json
/files/
/studio.svelte
`;

/** the local identity fallback for hosts without a global git identity */
const LOCAL_IDENTITY = { name: 'design-studio', email: 'design-studio@jixoai.local' } as const;

function gitConfigMissing(designDir: string, key: string, env?: NodeJS.ProcessEnv): boolean {
  const effective = runGit(designDir, ['config', '--get', key], { allowFailure: true, env });
  return effective.code !== 0 || effective.stdout.trim().length === 0;
}

/** does <designDir> already carry a repository? */
export function isDesignRepo(designDir: string): boolean {
  // a real .git dir (init) or file (worktree link) both count
  return existsSync(join(designDir, '.git'));
}

/**
 * The idempotent `design init`: create the nested repo when absent,
 * pin the identity fallback when the environment has none, write the
 * tool-managed .gitignore, and make the initial commit (repo may be
 * prototype-empty — the .gitignore commit anchors the history).
 * Re-runs on an existing repo only fill gaps (gitignore, identity).
 */
export function initDesignRepo(root: string, options: { env?: NodeJS.ProcessEnv } = {}): { designDir: string; created: boolean } {
  const designDir = join(root, 'design');
  const env = options.env;
  if (!isDesignRepo(designDir)) {
    runGit(designDir, ['init', '-b', 'main'], { allowFailure: true, env }); // -b needs git>=2.28; older gits default branch anyway
  }
  if (gitConfigMissing(designDir, 'user.name', env)) {
    runGit(designDir, ['config', 'user.name', LOCAL_IDENTITY.name]);
  }
  if (gitConfigMissing(designDir, 'user.email', env)) {
    runGit(designDir, ['config', 'user.email', LOCAL_IDENTITY.email]);
  }
  const gitignorePath = join(designDir, '.gitignore');
  if (!existsSync(gitignorePath)) {
    writeFileSync(gitignorePath, REPO_GITIGNORE, 'utf8');
  }
  const created = !hasCommits(designDir);
  if (created) {
    runGit(designDir, ['add', '.gitignore'], { env });
    runGit(designDir, ['commit', '-m', 'init: design workspace (design-studio)', '--allow-empty'], { env });
  }
  return { designDir, created };
}

/** does the repo have any commit yet? */
export function hasCommits(designDir: string): boolean {
  return runGit(designDir, ['rev-parse', '--verify', 'HEAD'], { allowFailure: true }).code === 0;
}

/** tracked-but-changed + untracked-but-not-ignored entries ('  '-prefixed porcelain lines) */
export function workingTreeDirty(designDir: string): readonly string[] {
  return runGit(designDir, ['status', '--porcelain']).stdout.split('\n').filter((line) => line.trim().length > 0);
}

/* ── save (wip commit) ──────────────────────────────────────────────────── */

/** saveDesignCommit outcome */
export interface SaveCommitResult {
  /** false when there was nothing to commit (the wip discipline: no empty commits) */
  readonly committed: boolean;
  readonly commitSha: string | null;
  readonly subject: string;
}

/**
 * `design save [proto] [-n note]`: wip commit of the design repo
 * (pathspec-scoped to prototypes/<proto> when proto is given — the
 * rest of the tree stays staged for its own save). Unchanged → no
 * commit, honestly reported.
 */
export function saveDesignCommit(root: string, proto?: string, note?: string): SaveCommitResult {
  const { designDir } = initDesignRepo(root);
  const subject = note !== undefined && note.length > 0 ? `wip: ${note}` : `wip ${new Date().toISOString()}`;
  const pathspec = proto === undefined ? ['prototypes'] : [`prototypes/${proto}`];
  const add = runGit(designDir, ['add', '--', ...pathspec], { allowFailure: true });
  if (add.code !== 0) {
    throw new DesignRepoError(`nothing matches ${pathspec.join(' ')} — does the prototype exist?`, `git add ${pathspec.join(' ')}`, add.stderr);
  }
  const staged = runGit(designDir, ['diff', '--cached', '--quiet', '--', ...pathspec], { allowFailure: true });
  if (staged.code === 0) return { committed: false, commitSha: null, subject };
  runGit(designDir, ['commit', '-m', subject]);
  const sha = runGit(designDir, ['rev-parse', 'HEAD']).stdout.trim();
  return { committed: true, commitSha: sha, subject };
}

/* ── release (annotated tag) ────────────────────────────────────────────── */

/** all annotated tags, oldest first by tagger date (the intent ledger) */
export function listReleaseTags(designDir: string): readonly ReleaseTag[] {
  const fmt = '%(refname:short)%09%(objecttype)%09%(taggerdate:iso8601-strict)%09%(contents)';
  const raw = runGit(designDir, ['for-each-ref', 'refs/tags', `--sort=taggerdate`, `--format=${fmt}`], { allowFailure: true });
  if (raw.code !== 0) return [];
  const tags: ReleaseTag[] = [];
  for (const line of raw.stdout.split('\n')) {
    if (line.trim().length === 0) continue;
    const [name, type, at, ...rest] = line.split('\t');
    if (type !== 'tag') continue; // lightweight tags carry no notes — not ours
    const commitSha = runGit(designDir, ['rev-parse', `${name}^{commit}`], { allowFailure: true }).stdout.trim();
    if (commitSha.length === 0) continue;
    tags.push({ name: name!, commitSha, at: at ?? '', note: (rest.join('\t') ?? '').trimEnd() });
  }
  return tags;
}

/** the newest annotated tag reachable from HEAD (the current release anchor); null = none yet */
export function currentReleaseTag(designDir: string): ReleaseTag | null {
  const name = runGit(designDir, ['describe', '--tags', '--abbrev=0', 'HEAD'], { allowFailure: true }).stdout.trim();
  if (name.length === 0) return null;
  const all = listReleaseTags(designDir);
  return all.find((tag) => tag.name === name) ?? null;
}

/** the default release name when none is given (sortable, collision-free per second) */
function generatedReleaseName(): string {
  const now = new Date();
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `r-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
}

/**
 * `design release [name] [-n notes]`: the deliberate version
 * checkpoint — an annotated tag over the CURRENT commit. Discipline:
 * a dirty tree refuses with a save hint; an unchanged tree (no
 * commits since the newest tag) refuses with a nothing-new hint; an
 * existing tag name refuses. Notes default to the newest wip commit
 * subject (the agent-turn summary when one was supplied at save).
 */
export function releaseDesignTag(root: string, name?: string, notes?: string): ReleaseResult {
  const { designDir } = initDesignRepo(root);
  const tagName = name !== undefined && name.length > 0 ? name : generatedReleaseName();

  const dirty = workingTreeDirty(designDir);
  if (dirty.length > 0) {
    throw new DesignRepoError(
      `working tree is dirty (${dirty.length} change(s), first: ${dirty[0]!.trim()}) — run \`jixoai-ui design save\` first, a release tags committed state only`,
      'git status --porcelain',
      dirty.join('\n'),
    );
  }
  if (runGit(designDir, ['rev-parse', '-q', '--verify', `refs/tags/${tagName}`], { allowFailure: true }).code === 0) {
    throw new DesignRepoError(`tag "${tagName}" already exists — pick a new name (the release discipline refuses re-releasing a checkpoint)`, `git rev-parse refs/tags/${tagName}`, '');
  }
  const newest = newestTagName(designDir);
  if (newest !== null) {
    const unchanged = runGit(designDir, ['diff', '--quiet', newest, 'HEAD'], { allowFailure: true });
    if (unchanged.code === 0) {
      throw new DesignRepoError(
        `nothing new since tag "${newest}" — a release checkpoints CHANGE; save work first (\`jixoai-ui design save\`), then release`,
        `git diff --quiet ${newest} HEAD`,
        '',
      );
    }
  }

  const note = notes ?? defaultReleaseNotes(designDir);
  runGit(designDir, ['tag', '-a', tagName, '-m', note]);
  const tag = listReleaseTags(designDir).find((t) => t.name === tagName)!;
  return { tag };
}

/** newest tag name by tagger date, ignoring reachability */
function newestTagName(designDir: string): string | null {
  const tags = listReleaseTags(designDir);
  return tags.length > 0 ? tags[tags.length - 1]!.name : null;
}

/** release notes default: the newest wip commit subject (an agent-turn summary when saved with -n) */
function defaultReleaseNotes(designDir: string): string {
  const subject = runGit(designDir, ['log', '-1', '--format=%s'], { allowFailure: true }).stdout.trim();
  return subject.length > 0 ? subject : 'design release';
}

/* ── reads ──────────────────────────────────────────────────────────────── */

/** read a blob at a ref; null when the path is absent from that tree */
export function showFile(designDir: string, ref: string, path: string): string | null {
  const got = runGit(designDir, ['show', `${ref}:${path}`], { allowFailure: true });
  if (got.code !== 0) return null;
  return got.stdout;
}

/** repo-relative tracked files under a ref path prefix (sorted) */
export function listTree(designDir: string, ref: string, prefix: string): readonly string[] {
  const got = runGit(designDir, ['ls-tree', '-r', '--name-only', ref, '--', prefix], { allowFailure: true });
  if (got.code !== 0) return [];
  return got.stdout.split('\n').filter((line) => line.length > 0).sort((a, b) => (a < b ? -1 : 1));
}

/** `git diff --name-status <from>..<to> -- <path>` entries (M/A/D/R) */
export function diffNameStatus(designDir: string, from: string, to: string, path: string): readonly string[] {
  const got = runGit(designDir, ['diff', '--name-status', `${from}..${to}`, '--', path], { allowFailure: true });
  if (got.code !== 0) return [];
  return got.stdout.split('\n').filter((line) => line.trim().length > 0);
}

/** `git diff <from>..<to> -- <path>` unified output ('' when unchanged) */
export function diffRange(designDir: string, from: string, to: string, path: string): string {
  return runGit(designDir, ['diff', `${from}..${to}`, '--', path], { allowFailure: true }).stdout;
}

/** full commit sha of a ref */
export function revParse(designDir: string, ref: string): string | null {
  const got = runGit(designDir, ['rev-parse', ref], { allowFailure: true });
  return got.code === 0 ? got.stdout.trim() : null;
}

/** is <ancestor> reachable from <from>? (tags newer than the anchor) */
export function isAncestor(designDir: string, ancestor: string, from: string): boolean {
  return runGit(designDir, ['merge-base', '--is-ancestor', ancestor, from], { allowFailure: true }).code === 0;
}

/* ── the three-way engine: git merge-file ──────────────────────────────── */

/** merge-file outcome — markers (git --diff3 style) embedded in merged */
export interface MergeFileResult {
  readonly merged: string;
  /** number of conflicts (0 = clean) — git's own count */
  readonly conflicts: number;
}

/**
 * Three-way merge over REAL files (git demands paths, not stdin):
 * writes base/ours/theirs into a tmp dir, runs
 * `git merge-file --diff3 -p -L ours -L base -L theirs` — the marker
 * vocabulary matches the r2 spec verbatim — and returns the merged
 * text with git's conflict count (exit code >0 = conflicts).
 */
export function gitMergeFile(base: string, ours: string, theirs: string): MergeFileResult {
  const dir = mkdtempSync(join(tmpdir(), 'design-merge-'));
  try {
    const baseFile = join(dir, 'base');
    const oursFile = join(dir, 'ours');
    const theirsFile = join(dir, 'theirs');
    writeFileSync(baseFile, base, 'utf8');
    writeFileSync(oursFile, ours, 'utf8');
    writeFileSync(theirsFile, theirs, 'utf8');
    const merged = runGit(dir, ['merge-file', '--diff3', '-p', '-L', 'ours', '-L', 'base', '-L', 'theirs', oursFile, baseFile, theirsFile], {
      allowFailure: true,
    });
    // merge-file exits with the conflict count (0 = clean); 255 = real error
    if (merged.code === 255 || (merged.code !== 0 && merged.stdout.length === 0 && merged.stderr.trim().length > 0)) {
      throw new DesignRepoError('git merge-file failed', 'git merge-file', merged.stderr);
    }
    // -p prints to stdout; markers label the sides ours/base/theirs
    return { merged: merged.stdout, conflicts: Math.max(0, merged.code) };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** parse git --diff3 marker blocks out of merged text (the named conflict report) */
export interface ParsedConflict {
  readonly ours: readonly string[];
  readonly base: readonly string[];
  readonly theirs: readonly string[];
}
export function parseConflictBlocks(merged: string): readonly ParsedConflict[] {
  const conflicts: ParsedConflict[] = [];
  const lines = merged.split('\n');
  let i = 0;
  while (i < lines.length) {
    if (lines[i] !== '<<<<<<< ours') {
      i++;
      continue;
    }
    const ours: string[] = [];
    const base: string[] = [];
    const theirs: string[] = [];
    i++;
    while (i < lines.length && lines[i] !== '||||||| base') ours.push(lines[i++]!);
    i++; // past the base marker
    while (i < lines.length && lines[i] !== '=======') base.push(lines[i++]!);
    i++; // past the separator
    while (i < lines.length && lines[i] !== '>>>>>>> theirs') theirs.push(lines[i++]!);
    i++; // past the end marker
    conflicts.push({ ours, base, theirs });
  }
  return conflicts;
}
