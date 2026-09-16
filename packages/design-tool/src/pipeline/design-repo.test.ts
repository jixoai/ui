/**
 * design-repo.test.ts — the design/ git repo engine (r2 rev2):
 * init idempotence, the wip-save discipline, the release-tag
 * discipline (same-name refuse / unchanged refuse / dirty refuse),
 * the identity fallback under config isolation, and the merge-file
 * engine + marker parsing.
 *
 * Original need: design-studio r2 rev2 (2026-09-11, git release
 * model direction change).
 */

import { strict as assert } from 'node:assert';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';

import {
  DesignRepoError,
  currentReleaseTag,
  gitMergeFile,
  initDesignRepo,
  listReleaseTags,
  parseConflictBlocks,
  releaseDesignTag,
  runGit,
  saveDesignCommit,
  workingTreeDirty,
} from './design-repo.ts';

/** isolate git from the machine's global/system config (proves the identity fallback) */
const ISOLATED_ENV = { GIT_CONFIG_GLOBAL: '/dev/null', GIT_CONFIG_SYSTEM: '/dev/null' } as const;

function seedPrototype(root: string): void {
  const dir = join(root, 'design/prototypes/checkout/pages');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'hero.svelte'), '<main>one</main>\n', 'utf8');
}

test('init creates the nested repo + initial commit and is idempotent', () => {
  const host = mkdtempSync(join(tmpdir(), 'design-repo-'));
  try {
    seedPrototype(host);
    const first = initDesignRepo(host);
    assert.equal(first.created, true);
    assert.equal(existsSync(join(host, 'design/.git')), true, 'nested .git');
    assert.equal(readFileSync(join(host, 'design/.gitignore'), 'utf8').includes('/.promotions.json'), true, 'artifacts stay untracked');

    const second = initDesignRepo(host);
    assert.equal(second.created, false, 're-init makes no new commit');
    assert.equal(listReleaseTags(join(host, 'design')).length, 0);
  } finally {
    rmSync(host, { recursive: true, force: true });
  }
});

test('the identity fallback commits without any global/system git config', () => {
  const host = mkdtempSync(join(tmpdir(), 'design-repo-'));
  try {
    seedPrototype(host);
    // global+system configs pointed at /dev/null: no user.name/email anywhere
    initDesignRepo(host, { env: ISOLATED_ENV });
    const saved = saveDesignCommit(host, { proto: 'checkout', note: 'seed' });
    assert.equal(saved.committed, true, 'the local fallback identity carried the commit');
    assert.equal(saved.commitSha !== null && saved.commitSha.length === 40, true);
  } finally {
    rmSync(host, { recursive: true, force: true });
  }
});

test('save discipline: unchanged saves commit nothing; notes ride the subject', () => {
  const host = mkdtempSync(join(tmpdir(), 'design-repo-'));
  try {
    seedPrototype(host);
    initDesignRepo(host);
    assert.equal(saveDesignCommit(host, { proto: 'checkout', note: 'a note' }).committed, true);
    assert.equal(saveDesignCommit(host, { proto: 'checkout' }).committed, false, 'nothing changed → no empty wip commit');
    assert.equal(saveDesignCommit(host).committed, false);
  } finally {
    rmSync(host, { recursive: true, force: true });
  }
});

test('release discipline: annotated tag + notes; same name refuses; unchanged refuses; dirty refuses', () => {
  const host = mkdtempSync(join(tmpdir(), 'design-repo-'));
  try {
    seedPrototype(host);
    initDesignRepo(host);
    saveDesignCommit(host, { proto: 'checkout', note: 'first cut' });
    const { tag } = releaseDesignTag(host, 'r1', 'deploy → ship it');
    assert.equal(tag.name, 'r1');
    assert.equal(tag.note, 'deploy → ship it');
    assert.equal(currentReleaseTag(join(host, 'design'))?.name, 'r1');

    // same name
    assert.throws(() => releaseDesignTag(host, 'r1', 'again'), /already exists/);
    // unchanged tree
    assert.throws(() => releaseDesignTag(host, 'r2'), /nothing new since tag "r1"/);

    // dirty tree: new work saved? no — raw edit, unsaved
    writeFileSync(join(host, 'design/prototypes/checkout/pages/hero.svelte'), '<main>two</main>\n', 'utf8');
    assert.throws(() => releaseDesignTag(host, 'r2'), /working tree is dirty.*design save/s);

    // saved work → release works; notes default to the newest wip subject
    saveDesignCommit(host, { proto: 'checkout', note: 'hero rewrite' });
    const second = releaseDesignTag(host, 'r2');
    assert.equal(second.tag.note, 'wip: hero rewrite', 'agent-turn-summary default when no -n given');
    assert.deepEqual(listReleaseTags(join(host, 'design')).map((t) => t.name), ['r1', 'r2']);
  } finally {
    rmSync(host, { recursive: true, force: true });
  }
});

test('gitMergeFile: clean hunks merge, conflicts carry the r2 marker block + count', () => {
  const base = ['top', 'mid', 'bottom'].join('\n');
  const clean = gitMergeFile(base, ['top', 'mid', 'bottom', 'ours footer'].join('\n'), ['header', 'top', 'mid', 'bottom'].join('\n'));
  assert.equal(clean.conflicts, 0);
  assert.equal(clean.merged, ['header', 'top', 'mid', 'bottom', 'ours footer'].join('\n'));

  const conflicted = gitMergeFile(base, ['top', 'OURS', 'bottom'].join('\n'), ['top', 'THEIRS', 'bottom'].join('\n'));
  assert.equal(conflicted.conflicts, 1);
  const parsed = parseConflictBlocks(conflicted.merged);
  assert.deepEqual(parsed, [{ ours: ['OURS'], base: ['mid'], theirs: ['THEIRS'] }]);
  assert.ok(conflicted.merged.includes('<<<<<<< ours'));
  assert.ok(conflicted.merged.includes('||||||| base'));
  assert.ok(conflicted.merged.includes('>>>>>>> theirs'));
});

test('DesignRepoError names the command and stderr', () => {
  const host = mkdtempSync(join(tmpdir(), 'design-repo-'));
  try {
    seedPrototype(host);
    initDesignRepo(host);
    saveDesignCommit(host, { proto: 'checkout', note: 'clean tree first' });
    assert.throws(
      () => releaseDesignTag(host, 'bad..name', 'x'),
      (error: unknown) => {
        assert.ok(error instanceof DesignRepoError);
        assert.ok(error.message.includes('[design-repo]'));
        assert.ok(error.command.length > 0);
        return true;
      },
    );
  } finally {
    rmSync(host, { recursive: true, force: true });
  }
});

/* ── M7 collab-protocol: explicit path-set staging (round1 attack) ─────── */

/** seed a two-file prototype so two roles have separate files to touch */
function seedTwoFilePrototype(root: string): { hero: string; cta: string } {
  const dir = join(root, 'design/prototypes/checkout/pages');
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'hero.svelte'), '<main>one</main>\n', 'utf8');
  const cta = join(dir, 'cta.svelte');
  writeFileSync(cta, '<span>cta</span>\n', 'utf8');
  return { hero: join(dir, 'hero.svelte'), cta };
}

const filesOf = (designDir: string, ref: string): readonly string[] =>
  runGit(designDir, ['ls-tree', '-r', '--name-only', ref]).stdout.split('\n').filter((line) => line.length > 0);

test('declared-path save: another role\'s uncommitted working-tree file NEVER rides the commit', () => {
  const host = mkdtempSync(join(tmpdir(), 'design-repo-'));
  try {
    const { hero, cta } = seedTwoFilePrototype(host);
    const { designDir } = initDesignRepo(host);
    saveDesignCommit(host, { proto: 'checkout', note: 'seed' });

    // role B (human in the editor) leaves an unsaved-file edit behind
    writeFileSync(cta, '<span>FOREIGN unsaved edit</span>\n', 'utf8');
    // role A (the agent turn) touched exactly hero and declares it
    writeFileSync(hero, '<main>two</main>\n', 'utf8');
    const saved = saveDesignCommit(host, { paths: ['prototypes/checkout/pages/hero.svelte'], note: 'agent turn' });

    assert.equal(saved.committed, true);
    assert.deepEqual(saved.paths, ['prototypes/checkout/pages/hero.svelte'], 'the audit surface names exactly the declared set');
    // the commit itself: hero changed, cta still at its seeded content
    const last = filesOf(designDir, 'HEAD');
    assert.ok(last.includes('prototypes/checkout/pages/cta.svelte'), 'cta stays tracked (from the seed)');
    assert.equal(
      runGit(designDir, ['show', 'HEAD:prototypes/checkout/pages/cta.svelte']).stdout,
      '<span>cta</span>\n',
      'the foreign edit is NOT in the commit — cta content in HEAD is the seed',
    );
    assert.equal(runGit(designDir, ['show', 'HEAD:prototypes/checkout/pages/hero.svelte']).stdout, '<main>two</main>\n');
    // and the foreign edit is still sitting in the working tree, unclaimed
    assert.equal(workingTreeDirty(designDir).some((line) => line.includes('cta.svelte')), true, 'role B\'s edit survives untouched');
  } finally {
    rmSync(host, { recursive: true, force: true });
  }
});

test('declared-path save: another role\'s ALREADY-STAGED content stays staged, not committed', () => {
  const host = mkdtempSync(join(tmpdir(), 'design-repo-'));
  try {
    const { hero, cta } = seedTwoFilePrototype(host);
    const { designDir } = initDesignRepo(host);
    saveDesignCommit(host, { proto: 'checkout', note: 'seed' });

    // role B staged its edit (git add, no commit) — the sneakier variant
    writeFileSync(cta, '<span>STAGED foreign</span>\n', 'utf8');
    runGit(designDir, ['add', '--', 'prototypes/checkout/pages/cta.svelte']);

    // role A declares hero only
    writeFileSync(hero, '<main>agent cut</main>\n', 'utf8');
    const saved = saveDesignCommit(host, { paths: ['prototypes/checkout/pages/hero.svelte'] });

    assert.equal(saved.committed, true);
    assert.equal(runGit(designDir, ['show', 'HEAD:prototypes/checkout/pages/cta.svelte']).stdout, '<span>cta</span>\n', 'the staged foreign content did not ride the pathspec commit');
    const porcelain = workingTreeDirty(designDir).join('\n');
    assert.ok(porcelain.startsWith('M  prototypes/checkout/pages/cta.svelte'), `the foreign content stays STAGED for its owner: ${porcelain}`);
    // and a later save by role B commits exactly its own file
    const bSave = saveDesignCommit(host, { paths: ['prototypes/checkout/pages/cta.svelte'], note: 'role B' });
    assert.equal(bSave.committed, true);
    assert.equal(runGit(designDir, ['show', 'HEAD:prototypes/checkout/pages/cta.svelte']).stdout, '<span>STAGED foreign</span>\n');
  } finally {
    rmSync(host, { recursive: true, force: true });
  }
});

test('declared-path save: an unchanged declared set commits nothing; a declared deletion rides; junk declarations fail loudly', () => {
  const host = mkdtempSync(join(tmpdir(), 'design-repo-'));
  try {
    const { hero } = seedTwoFilePrototype(host);
    const { designDir } = initDesignRepo(host);
    saveDesignCommit(host, { proto: 'checkout', note: 'seed' });

    // unchanged declared file → honest no-commit
    const unchanged = saveDesignCommit(host, { paths: ['prototypes/checkout/pages/hero.svelte'] });
    assert.equal(unchanged.committed, false);
    assert.deepEqual(unchanged.paths, []);

    // a declared DELETION rides the pathspec commit (the design-file
    // `rmSync` flow depends on it)
    rmSync(hero);
    const dropped = saveDesignCommit(host, { paths: ['prototypes/checkout/pages/hero.svelte'], note: 'drop hero' });
    assert.equal(dropped.committed, true);
    assert.equal(filesOf(designDir, 'HEAD').includes('prototypes/checkout/pages/hero.svelte'), false, 'the deletion landed');

    // junk declarations: escape, absolute, empty set
    assert.throws(() => saveDesignCommit(host, { paths: ['../outside.svelte'] }), /escapes the design repo/);
    assert.throws(() => saveDesignCommit(host, { paths: ['/etc/passwd'] }), /must be repo-relative/);
    assert.throws(() => saveDesignCommit(host, { paths: [] }), /empty path set/);
    assert.throws(() => saveDesignCommit(host, { paths: ['prototypes/ghost/pages/x.svelte'] }), /nothing matches the declared path set/);
  } finally {
    rmSync(host, { recursive: true, force: true });
  }
});

test('proto lane scopes to its prototype; the bare lane consolidates the enumerated snapshot (never add -A)', () => {
  const host = mkdtempSync(join(tmpdir(), 'design-repo-'));
  try {
    const { hero } = seedTwoFilePrototype(host);
    const checkoutPages = join(host, 'design/prototypes/checkout/pages');
    const landingPages = join(host, 'design/prototypes/landing/pages');
    mkdirSync(landingPages, { recursive: true });
    const { designDir } = initDesignRepo(host);
    saveDesignCommit(host, { proto: 'checkout', note: 'seed' });
    writeFileSync(join(landingPages, 'intro.svelte'), '<p>landing</p>\n', 'utf8');
    saveDesignCommit(host, { proto: 'landing', note: 'landing arrives' });

    // checkout moves + landing moves; a checkout-scoped save commits ONLY checkout
    writeFileSync(hero, '<main>scoped</main>\n', 'utf8');
    writeFileSync(join(landingPages, 'intro.svelte'), '<p>landing v2</p>\n', 'utf8');
    const scoped = saveDesignCommit(host, { proto: 'checkout', note: 'checkout only' });
    assert.equal(scoped.committed, true);
    assert.deepEqual(scoped.paths, ['prototypes/checkout/pages/hero.svelte'], 'the proto scope enumerates exactly its own changed files');
    assert.equal(runGit(designDir, ['show', 'HEAD:prototypes/landing/pages/intro.svelte']).stdout, '<p>landing</p>\n', 'landing stayed out');
    assert.equal(workingTreeDirty(designDir).some((line) => line.includes('intro.svelte')), true);

    // the bare lane: modify + delete + untracked + a tool-managed
    // .gitignore edit — the enumerated snapshot carries them all
    writeFileSync(join(checkoutPages, 'extra.svelte'), '<p>new</p>\n', 'utf8');
    writeFileSync(hero, '<main>final</main>\n', 'utf8');
    rmSync(join(landingPages, 'intro.svelte'));
    writeFileSync(join(designDir, '.gitignore'), `${readFileSync(join(designDir, '.gitignore'), 'utf8')}/.tmp-artifact/\n`, 'utf8');
    const bare = saveDesignCommit(host, { note: 'consolidate' });
    assert.equal(bare.committed, true);
    assert.deepEqual(
      bare.paths,
      [
        '.gitignore',
        'prototypes/checkout/pages/extra.svelte',
        'prototypes/checkout/pages/hero.svelte',
        'prototypes/landing/pages/intro.svelte',
      ],
      'the bare lane enumerates every changed path explicitly (tool-managed files ride here — the 2026-09-11 deadlock stays solved)',
    );
    assert.equal(filesOf(designDir, 'HEAD').includes('prototypes/landing/pages/intro.svelte'), false, 'the deletion rode');
    assert.equal(workingTreeDirty(designDir).length, 0, 'consolidated clean');
  } finally {
    rmSync(host, { recursive: true, force: true });
  }
});
