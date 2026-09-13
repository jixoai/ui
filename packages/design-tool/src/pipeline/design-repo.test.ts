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
  saveDesignCommit,
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
    const saved = saveDesignCommit(host, 'checkout', 'seed');
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
    assert.equal(saveDesignCommit(host, 'checkout', 'a note').committed, true);
    assert.equal(saveDesignCommit(host, 'checkout').committed, false, 'nothing changed → no empty wip commit');
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
    saveDesignCommit(host, 'checkout', 'first cut');
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
    saveDesignCommit(host, 'checkout', 'hero rewrite');
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
    saveDesignCommit(host, 'checkout', 'clean tree first');
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
