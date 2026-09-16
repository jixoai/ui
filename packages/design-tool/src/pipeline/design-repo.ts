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
 *      commit over an EXPLICIT path set — declared paths, a proto
 *      scope, or the bare consolidation snapshot; never a repo-wide
 *      `git add -A`, M7 collab-protocol round1) and releaseDesignTag
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
import { isAbsolute, join } from 'node:path';

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
# the dsh agent's isolated home (r2.1 wiring — sessions/settings are
# runtime state, never design history)
/.dsh-home/
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
  /**
   * The explicit path set this save committed (repo-relative, sorted —
   * empty when nothing committed). The audit surface of the M7 staging
   * contract: a save's commit contains EXACTLY these paths and nothing
   * else — another role's uncommitted files never ride along.
   */
  readonly paths: readonly string[];
}

/**
 * The save options — one of three staging lanes (M7 collab-protocol:
 * 嵌套 git save 显式路径集 staging, round1 review):
 *
 *   1. `paths` (the role-attributed lane — PRIMARY for callers who know
 *      what they touched): stage and commit EXACTLY the declared
 *      repo-relative paths. Anything else in the tree — another role's
 *      working-tree edits, even another role's ALREADY-STAGED content —
 *      stays out of the commit.
 *   2. `proto` (the prototype scope lane): the declared set is every
 *      changed path under `prototypes/<proto>/` — a directory-scoped
 *      path set, never repo-wide.
 *   3. neither (the bare consolidation lane): the default set is the
 *      save operation's own touched set — every path git reports changed
 *      at snapshot time (staged + unstaged + untracked, tool-managed
 *      files like .gitignore included) — enumerated EXPLICITLY. This is
 *      the workspace-consolidating lane (`jixoai-ui design save` at the
 *      terminal); role-attributed callers MUST declare paths or a proto.
 *
 * There is NO repo-wide `git add -A` anywhere: `git add` only ever
 * receives the explicit path list, and the commit itself is
 * pathspec-scoped (`git commit -- <paths>`), so pre-staged foreign
 * content stays staged for its own owner instead of riding this
 * commit (the round1 attack: a save sweeping files other roles had
 * not committed).
 *
 * Frozen concurrency behavior (M7 注记): the path set is snapshotted
 * once per save call; two interleaved saves with disjoint declared
 * sets cannot contaminate each other (each commits only its own
 * list). Overlapping declared sets resolve last-writer-wins per file
 * as two sequential commits. A file reverted by a concurrent writer
 * in the window between this save's `git add` and its commit surfaces
 * as git's own nothing-to-commit failure (a DesignRepoError), never
 * as a wrong-content commit.
 */
export interface SaveDesignCommitOptions {
  /** pathspec scope shorthand: everything changed under prototypes/<proto>/ */
  readonly proto?: string;
  /** the wip subject note (agent-turn summary) */
  readonly note?: string;
  /**
   * The declared touched set — repo-relative paths (relative to design/).
   * Invalid entries (absolute paths, `..` escapes, empty strings, an
   * empty array, paths git cannot match at all) fail the save with a
   * DesignRepoError naming the problem.
   */
  readonly paths?: readonly string[];
}

/** validate a declared path list — repo-relative, no escapes, no empties */
function validateDeclaredPaths(paths: readonly string[]): readonly string[] {
  if (paths.length === 0) {
    throw new DesignRepoError('declared an empty path set — a role-attributed save names at least one path (use the bare lane to consolidate everything)', 'saveDesignCommit', '');
  }
  const seen = new Set<string>();
  for (const raw of paths) {
    if (raw.length === 0) throw new DesignRepoError('declared path set contains an empty path', 'saveDesignCommit', '');
    if (isAbsolute(raw)) throw new DesignRepoError(`declared path ${JSON.stringify(raw)} must be repo-relative (relative to design/)`, 'saveDesignCommit', '');
    const segments = raw.split('/');
    if (segments.includes('..') || raw.includes('\\') || raw.startsWith('/')) {
      throw new DesignRepoError(`declared path ${JSON.stringify(raw)} escapes the design repo`, 'saveDesignCommit', '');
    }
    seen.add(raw);
  }
  return [...seen].sort((a, b) => (a < b ? -1 : 1));
}

/**
 * Enumerate the changed paths `git status --porcelain -z` reports,
 * optionally filtered under one pathspec prefix. Rename entries carry
 * the post-image path plus the pre-image path as a second record — both
 * join the set (the commit pathspec needs both sides; probe-verified
 * 2026-09-15: `git commit -- new old` records the R100 pair).
 */
function enumerateChangedPaths(designDir: string, prefix?: string): readonly string[] {
  // -uall: untracked files list INDIVIDUALLY — the default collapses an
  // untracked directory to one `?? dir/` entry, hiding the files inside
  // it from the prefix filter (the seed-save regression, probe-traced)
  const out = runGit(designDir, ['status', '--porcelain', '-z', '--untracked-files=all'], { allowFailure: true });
  if (out.code !== 0) {
    throw new DesignRepoError('git status failed while enumerating the save path set', 'git status --porcelain -z', out.stderr);
  }
  const records = out.stdout.split('\0').filter((record) => record.length > 0);
  const paths: string[] = [];
  let expectPreimage = false;
  for (const record of records) {
    if (expectPreimage) {
      // the rename/copy PRE-image rides as a bare record right after the
      // post-image one (-z format: `R  new\0old\0`) — no status prefix
      paths.push(record);
      expectPreimage = false;
      continue;
    }
    // XY <path> — two status columns, then the path verbatim (-z never quotes)
    if (record.length < 4) continue;
    const status = record.slice(0, 2);
    paths.push(record.slice(3));
    if (status[0] === 'R' || status[0] === 'C') expectPreimage = true;
  }
  const unique = [...new Set(paths)];
  return (prefix === undefined ? unique : unique.filter((path) => path === prefix || path.startsWith(`${prefix}/`))).sort((a, b) => (a < b ? -1 : 1));
}

/**
 * `design save`: wip commit over an EXPLICIT path set (see
 * {@link SaveDesignCommitOptions} for the three lanes and the frozen
 * concurrency behavior). Unchanged for the declared set → no commit,
 * honestly reported with `paths: []`.
 */
export function saveDesignCommit(root: string, options: SaveDesignCommitOptions = {}): SaveCommitResult {
  const { designDir } = initDesignRepo(root);
  const subject = options.note !== undefined && options.note.length > 0 ? `wip: ${options.note}` : `wip ${new Date().toISOString()}`;

  // 1. resolve the target path set (declared | proto-scoped | bare
  //    consolidation snapshot — never a repo-wide `add -A`)
  let target: readonly string[];
  if (options.paths !== undefined) {
    target = validateDeclaredPaths(options.paths);
  } else if (options.proto !== undefined) {
    const scope = `prototypes/${options.proto}`;
    target = enumerateChangedPaths(designDir, scope);
    // typo guard (the r2 contract): a named prototype with no directory
    // and no changes under it is almost certainly a misspelling
    if (target.length === 0 && !existsSync(join(designDir, scope))) {
      throw new DesignRepoError(`nothing matches ${scope} — does the prototype exist?`, 'git add', '');
    }
  } else {
    // the bare lane: everything changed at snapshot time, enumerated
    // explicitly (tool-managed files like .gitignore ride here — the
    // 2026-09-11 vehicle deadlock stays solved without ever going -A)
    target = enumerateChangedPaths(designDir);
  }

  // 2. stage: `git add` only the paths that still need staging. Fully
  //    staged entries (X column set, Y column blank — staged deletions,
  //    staged renames' old side) are already in the index; re-adding a
  //    rename's dropped old path would fatal ("did not match any
  //    files"). Unstaged edits, unstaged deletions (staged by the add —
  //    probe-verified) and untracked files all go through.
  if (options.paths === undefined && target.length > 0) {
    const addTargets = target.filter((path) => needsStaging(designDir, path));
    if (addTargets.length > 0) {
      const add = runGit(designDir, ['add', '--', ...addTargets], { allowFailure: true });
      if (add.code !== 0) {
        throw new DesignRepoError(`staging the save path set failed (${addTargets.join(', ')})`, 'git add', add.stderr);
      }
    }
  } else if (options.paths !== undefined) {
    // the declared lane stages verbatim — a declared path git cannot
    // match is a caller bug, surfaced as git's own fatal
    const add = runGit(designDir, ['add', '--', ...target], { allowFailure: true });
    if (add.code !== 0) {
      throw new DesignRepoError(`nothing matches the declared path set (${target.join(', ')}) — every declared path must exist or be tracked`, 'git add', add.stderr);
    }
  }

  // 3. unchanged check scoped to the target set ONLY — foreign staged
  //    content outside the set does not count (and does not commit)
  if (target.length > 0) {
    const staged = runGit(designDir, ['diff', '--cached', '--quiet', '--', ...target], { allowFailure: true });
    if (staged.code === 0) return { committed: false, commitSha: null, subject, paths: [] };
  } else {
    return { committed: false, commitSha: null, subject, paths: [] };
  }

  // 4. the pathspec-scoped commit: only the target paths ride, whatever
  //    else the index holds stays staged for its owner
  const commit = runGit(designDir, ['commit', '-m', subject, '--', ...target], { allowFailure: true });
  if (commit.code !== 0) {
    throw new DesignRepoError(
      `committing the save path set failed (${target.join(', ')}) — a concurrent writer likely reverted a staged file mid-save (frozen behavior: fail, never commit wrong content)`,
      'git commit',
      commit.stderr,
    );
  }
  const sha = runGit(designDir, ['rev-parse', 'HEAD']).stdout.trim();
  return { committed: true, commitSha: sha, subject, paths: target };
}

/**
 * Does this enumerated path still need `git add`? True when the file
 * exists in the worktree (modifications, untracked files, rename
 * post-images) or is tracked-but-missing (an UNSTAGED deletion — `git
 * add` stages the removal). False for entries whose change is already
 * fully staged (Y column blank): staged deletions and a staged
 * rename's dropped pre-image — re-adding those fatals.
 */
function needsStaging(designDir: string, path: string): boolean {
  if (existsSync(join(designDir, path))) return true;
  // missing from the worktree: stage only while the index still tracks
  // it (the unstaged deletion); a staged deletion or a rename's dropped
  // old side is already done
  const tracked = runGit(designDir, ['ls-files', '--', path], { allowFailure: true });
  return tracked.code === 0 && tracked.stdout.trim().length > 0;
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
