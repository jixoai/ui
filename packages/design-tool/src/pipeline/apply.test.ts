/**
 * apply.test.ts — three-way drift apply over the git merge-file
 * engine (r2 rev2, VP2/VP3): clean merge (both sides coexist + the
 * anchor advances), conflict markers (git --diff3 with ours/base/
 * theirs labels, the file carries them, the report names file and
 * region), ours-deleted skip, the ours-changed CAS skip (through
 * the beforeWrite seam), dry-run, ref-removed-in-design, and
 * hand-resolution convergence.
 *
 * Original need: design-studio r2 rev2 (2026-09-11, git release
 * model — git merge-file replaced the diff3 npm package).
 */

import { strict as assert } from 'node:assert';
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

import { applyDrift } from './apply.ts';
import { releaseDesignTag, runGit, saveDesignCommit } from './design-repo.ts';
import { promote, promotionStatus, readPromotions } from './promote.ts';
import { buildTestHost } from './test-host.ts';

/** promote the fixture (r1) then move the design to r2 with a page edit */
function setupDrift(host: ReturnType<typeof buildTestHost>, v2Hero: string): void {
  promote(host.root, 'checkout');
  writeFileSync(host.heroPath, v2Hero, 'utf8');
  saveDesignCommit(host.root, 'checkout', 'design moved ahead');
  releaseDesignTag(host.root, 'r2', 'tonal rung');
}

test('VP2 clean merge: developer footer + design edit coexist; the anchor advances to HEAD', async () => {
  const host = buildTestHost();
  try {
    setupDrift(host, readFileSync(host.heroPath, 'utf8').replace('Deploy', 'Ship it'));
    writeFileSync(host.promotedHeroPath, `${readFileSync(host.promotedHeroPath, 'utf8')}<!-- dev footer -->\n`, 'utf8');

    const report = applyDrift(host.root);
    assert.equal(report.dryRun, false);
    const hero = report.files.find((f) => f.file.endsWith('pages/hero.svelte'))!;
    assert.equal(hero.applied, true);
    assert.equal(hero.clean, true);
    assert.deepEqual(hero.conflicts, []);
    assert.ok(hero.mergedHunks >= 1, 'the report lists the merged hunks');
    // cta: content-identical between r1..r2 → git sees NO drift → not even
    // in the report (the git model is content-honest, version-free)
    assert.equal(report.files.find((f) => f.file.endsWith('components/cta.svelte')), undefined);

    const merged = readFileSync(host.promotedHeroPath, 'utf8');
    assert.ok(merged.includes('Ship it'), 'the design edit landed');
    assert.ok(merged.includes('<!-- dev footer -->'), 'the developer edit survived');
    assert.equal(merged.includes('<<<<<<<'), false);

    // convergence: status no longer drifts, the record anchored at HEAD
    assert.equal(promotionStatus(host.root).promotions.every((p) => !p.drifted), true);
    const headSha = runGit(host.designDir, ['rev-parse', 'HEAD']).stdout.trim();
    assert.equal(readPromotions(host.root).find((r) => r.ref === 'pages/hero.svelte')!.commitSha, headSha);
  } finally {
    rmSync(host.root, { recursive: true, force: true });
  }
});

test('VP3 conflicting edit: git markers land in the file, the report names file and region; the anchor stays', async () => {
  const host = buildTestHost();
  try {
    setupDrift(host, readFileSync(host.heroPath, 'utf8').replace('variant="fill"', 'variant="tonal"'));
    // the developer rebound the SAME prop differently
    writeFileSync(
      host.promotedHeroPath,
      readFileSync(host.promotedHeroPath, 'utf8').replace('variant="fill"', 'variant="outline"'),
      'utf8',
    );

    const report = applyDrift(host.root);
    const hero = report.files.find((f) => f.file.endsWith('pages/hero.svelte'))!;
    assert.equal(hero.applied, true);
    assert.equal(hero.clean, false);
    assert.equal(hero.conflicts.length, 1);
    assert.ok(hero.conflicts[0]!.ours.some((line) => line.includes('variant="outline"')), 'report names the ours prop');
    assert.ok(hero.conflicts[0]!.theirs.some((line) => line.includes('variant="tonal"')), 'report names the theirs prop');
    assert.ok(hero.conflicts[0]!.base.some((line) => line.includes('variant="fill"')), 'report shows the base region');

    const merged = readFileSync(host.promotedHeroPath, 'utf8');
    assert.ok(merged.includes('<<<<<<< ours'));
    assert.ok(merged.includes('||||||| base'));
    assert.ok(merged.includes('======='));
    assert.ok(merged.includes('>>>>>>> theirs'));
    assert.ok(merged.includes('variant="outline"') && merged.includes('variant="tonal"'));

    // a conflicted file keeps its anchor — still drifted until resolved
    assert.equal(promotionStatus(host.root).promotions.find((p) => p.ref === 'pages/hero.svelte')!.drifted, true);
    assert.equal(readPromotions(host.root).find((r) => r.ref === 'pages/hero.svelte')!.commitSha, host.r1.commitSha);
  } finally {
    rmSync(host.root, { recursive: true, force: true });
  }
});

test('ours deleted: the file stays deleted and the report lists it as skipped', async () => {
  const host = buildTestHost();
  try {
    setupDrift(host, readFileSync(host.heroPath, 'utf8').replace('Deploy', 'Ship it'));
    rmSync(host.promotedHeroPath);
    const report = applyDrift(host.root);
    const hero = report.files.find((f) => f.file.endsWith('pages/hero.svelte'))!;
    assert.equal(hero.applied, false);
    assert.equal(hero.skipReason, 'ours-deleted');
    assert.equal(existsSync(host.promotedHeroPath), false, 'apply never resurrects');
  } finally {
    rmSync(host.root, { recursive: true, force: true });
  }
});

test('ours changed mid-apply (CAS): the external write wins, the merge is skipped and reported', async () => {
  const host = buildTestHost();
  try {
    setupDrift(host, readFileSync(host.heroPath, 'utf8').replace('Deploy', 'Ship it'));
    // beforeWrite simulates an editor save racing apply between the
    // ours read and the write-back (the VD1e CAS posture)
    const report = applyDrift(host.root, {
      beforeWrite: (target) => {
        const current = readFileSync(target, 'utf8');
        writeFileSync(target, `${current}\n<!-- raced edit -->\n`, 'utf8');
      },
    });
    const hero = report.files.find((f) => f.file.endsWith('pages/hero.svelte'))!;
    assert.equal(hero.applied, false);
    assert.equal(hero.skipReason, 'ours-changed');
    const disk = readFileSync(host.promotedHeroPath, 'utf8');
    assert.ok(disk.includes('<!-- raced edit -->'), 'the external edit survives');
    assert.ok(!disk.includes('Ship it'), 'the merged write never lands');
  } finally {
    rmSync(host.root, { recursive: true, force: true });
  }
});

test('dry-run reports without writing: disk and manifest stay untouched', async () => {
  const host = buildTestHost();
  try {
    setupDrift(host, readFileSync(host.heroPath, 'utf8').replace('Deploy', 'Ship it'));
    const before = readFileSync(host.promotedHeroPath, 'utf8');
    const manifestBefore = readFileSync(join(host.root, 'design/.promotions.json'), 'utf8');

    const report = applyDrift(host.root, { dryRun: true });
    assert.equal(report.dryRun, true);
    assert.equal(report.files.find((f) => f.file.endsWith('pages/hero.svelte'))!.applied, false);
    assert.equal(readFileSync(host.promotedHeroPath, 'utf8'), before, 'no write under dry-run');
    assert.equal(readFileSync(join(host.root, 'design/.promotions.json'), 'utf8'), manifestBefore, 'manifest untouched under dry-run');
  } finally {
    rmSync(host.root, { recursive: true, force: true });
  }
});

test('ref removed from the design: apply skips with a named reason (no resurrection, no deletion)', async () => {
  const host = buildTestHost();
  try {
    promote(host.root, 'checkout');
    // the design deletes the ref at r2
    rmSync(host.heroPath);
    saveDesignCommit(host.root, 'checkout', 'drop hero');
    releaseDesignTag(host.root, 'r2', 'hero removed');

    const report = applyDrift(host.root);
    const hero = report.files.find((f) => f.file.endsWith('pages/hero.svelte'))!;
    assert.equal(hero.applied, false);
    assert.equal(hero.skipReason, 'ref-removed-from-design');
    assert.equal(existsSync(host.promotedHeroPath), true, 'apply never deletes host files either');
  } finally {
    rmSync(host.root, { recursive: true, force: true });
  }
});

test('re-applying over unresolved markers skips (never buries the pending decision in nested markers)', async () => {
  const host = buildTestHost();
  try {
    setupDrift(host, readFileSync(host.heroPath, 'utf8').replace('variant="fill"', 'variant="tonal"'));
    writeFileSync(
      host.promotedHeroPath,
      readFileSync(host.promotedHeroPath, 'utf8').replace('variant="fill"', 'variant="outline"'),
      'utf8',
    );
    const first = applyDrift(host.root);
    assert.equal(first.files.find((f) => f.file.endsWith('pages/hero.svelte'))!.clean, false, 'conflict markers land');
    const second = applyDrift(host.root);
    const hero = second.files.find((f) => f.file.endsWith('pages/hero.svelte'))!;
    assert.equal(hero.skipReason, 'unresolved-markers');
    assert.equal(hero.applied, false);
    const disk = readFileSync(host.promotedHeroPath, 'utf8');
    assert.equal(disk.split('<<<<<<< ours').length, 2, 'no nested marker blocks — the file is untouched');
  } finally {
    rmSync(host.root, { recursive: true, force: true });
  }
});

test('resolution convergence: after the developer resolves markers to the design side, the anchor advances', async () => {
  const host = buildTestHost();
  try {
    setupDrift(host, readFileSync(host.heroPath, 'utf8').replace('variant="fill"', 'variant="tonal"'));
    writeFileSync(
      host.promotedHeroPath,
      readFileSync(host.promotedHeroPath, 'utf8').replace('variant="fill"', 'variant="outline"'),
      'utf8',
    );
    applyDrift(host.root); // conflict markers land
    // resolve by hand to exactly the design's line (indentation and
    // all) — ours becomes theirs, byte-for-byte
    const conflicted = readFileSync(host.promotedHeroPath, 'utf8');
    const resolved = conflicted.replace(
      /<<<<<<< ours\n[\s\S]*?>>>>>>> theirs\n/,
      '  <PressButton variant="tonal">Deploy</PressButton>\n',
    );
    writeFileSync(host.promotedHeroPath, resolved, 'utf8');

    assert.equal(promotionStatus(host.root).promotions.find((p) => p.ref === 'pages/hero.svelte')!.drifted, true, 'still drifted before the second apply');
    const report = applyDrift(host.root);
    const hero = report.files.find((f) => f.file.endsWith('pages/hero.svelte'))!;
    assert.equal(hero.clean, true);
    const headSha = runGit(host.designDir, ['rev-parse', 'HEAD']).stdout.trim();
    assert.equal(readPromotions(host.root).find((r) => r.ref === 'pages/hero.svelte')!.commitSha, headSha, 'anchor advanced after convergence');
  } finally {
    rmSync(host.root, { recursive: true, force: true });
  }
});
