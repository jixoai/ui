/**
 * promote.test.ts — promotion into the host + drift status (r2 rev2,
 * VP1): rewrite correctness (#jixoai/ → host-relative), the 6-field
 * tag/commitSha manifest contract (NO inline base), promote-from-tag
 * (unsaved working-tree state is never promoted), repeated promotion
 * refusal + --force, and the git-backed drift report (changelog =
 * tag notes, diff = git range, tag-between grouping data).
 *
 * Original need: design-studio r2 rev2 (2026-09-11, git release
 * model).
 */

import { strict as assert } from 'node:assert';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import test from 'node:test';

import { releaseDesignTag, runGit, saveDesignCommit } from './design-repo.ts';
import {
  PromotionExistsError,
  buildRewriteAliases,
  promote,
  promotionStatus,
  readPromotions,
  rewriteSpecifiers,
} from './promote.ts';
import { probeDesignHost } from '../server/probe.ts';
import { buildTestHost } from './test-host.ts';

/** the exact relative specifier the rewriter must produce (computed, not hand-derived) */
function expectedSpec(host: ReturnType<typeof buildTestHost>, fromDir: string, itemTarget: string): string {
  const spec = relative(fromDir, join(host.root, itemTarget)).split('\\').join('/');
  return spec.startsWith('.') ? spec : `./${spec}`;
}

test('rewriteSpecifiers is a pure table-driven map (both quote styles; unknown keys verbatim)', () => {
  const source = `import A from '#jixoai/press-button';\nimport B from "#jixoai/badge";\nimport { K } from '#jixoai/prototype-kit';\n`;
  const out = rewriteSpecifiers(source, { '#jixoai/press-button': '../../ui/press-button', '#jixoai/badge': '../../ui/badge/badge.svelte' });
  assert.equal(out.includes(`from '../../ui/press-button'`), true);
  assert.equal(out.includes(`from "../../ui/badge/badge.svelte"`), true);
  assert.equal(out.includes(`from '#jixoai/prototype-kit'`), true, 'unknown alias stays verbatim');
  assert.equal(source.includes(`'#jixoai/press-button'`), true, 'source untouched (purity)');
});

test('buildRewriteAliases: index items stay directory-form, .svelte items name the file', () => {
  const host = buildTestHost();
  try {
    const probed = probeDesignHost(host.root);
    assert.equal(probed.kind, 'consumer');
    const table = buildRewriteAliases(probed, join(host.root, 'src/lib/design/checkout/pages'));
    assert.equal(table['#jixoai/press-button'], expectedSpec(host, join(host.root, 'src/lib/design/checkout/pages'), 'src/lib/ui/press-button'));
    assert.equal(table['#jixoai/badge'], expectedSpec(host, join(host.root, 'src/lib/design/checkout/pages'), 'src/lib/ui/badge/badge.svelte'));
  } finally {
    rmSync(host.root, { recursive: true, force: true });
  }
});

test('VP1 first promotion: tagged refs land rewritten, canvas excluded, manifest records the 6-field tag contract (no inline base)', () => {
  const host = buildTestHost();
  try {
    const result = promote(host.root, 'checkout');
    assert.equal(result.toDir, join(host.root, 'src/lib/design/checkout'));
    assert.equal(result.tag.name, 'r1');
    assert.deepEqual(result.promoted, ['src/lib/design/checkout/components/cta.svelte', 'src/lib/design/checkout/pages/hero.svelte']);
    assert.equal(existsSync(join(host.root, 'src/lib/design/checkout/canvas.svelte')), false, 'canvas.svelte is not promoted');

    const hero = readFileSync(host.promotedHeroPath, 'utf8');
    assert.equal(hero.includes('#jixoai/'), false, 'no #jixoai specifiers survive');
    assert.equal(hero.includes(`from '${expectedSpec(host, dirname(host.promotedHeroPath), 'src/lib/ui/press-button')}'`), true);
    assert.equal(hero.includes(`from '${expectedSpec(host, dirname(host.promotedHeroPath), 'src/lib/ui/badge/badge.svelte')}'`), true);

    const records = readPromotions(host.root);
    assert.equal(records.length, 2);
    const heroRecord = records.find((r) => r.ref === 'pages/hero.svelte')!;
    assert.deepEqual(
      Object.keys(heroRecord).sort(),
      ['commitSha', 'file', 'promotedAt', 'proto', 'ref', 'tag'],
      'the r2 rev2 contract schema, exactly — git is the database, no inline base',
    );
    assert.equal(heroRecord.tag, 'r1');
    assert.equal(heroRecord.commitSha, host.r1.commitSha);
    assert.equal(heroRecord.file, 'src/lib/design/checkout/pages/hero.svelte');
    assert.equal(heroRecord.proto, 'checkout');
    assert.equal(Number.isNaN(Date.parse(heroRecord.promotedAt)), false);
  } finally {
    rmSync(host.root, { recursive: true, force: true });
  }
});

test('promote anchors on the RELEASE, never unsaved working-tree state', () => {
  const host = buildTestHost();
  try {
    // working-tree edit WITHOUT save/release
    writeFileSync(host.heroPath, '<main>unreleased rewrite</main>\n', 'utf8');
    promote(host.root, 'checkout');
    const hero = readFileSync(host.promotedHeroPath, 'utf8');
    assert.equal(hero.includes('unreleased rewrite'), false, 'unsaved state is not promoted');
    assert.equal(hero.includes('Deploy'), true, 'the tagged r1 content is');
  } finally {
    rmSync(host.root, { recursive: true, force: true });
  }
});

test('promote without any release tag fails, pointing at the release flow', () => {
  const host = buildTestHost();
  try {
    // empty the tag ledger (a repo with history but no releases)
    runGit(host.designDir, ['tag', '-d', 'r1']);
    assert.throws(() => promote(host.root, 'checkout'), /design release/);
  } finally {
    rmSync(host.root, { recursive: true, force: true });
  }
});

test('repeated promotion refuses with a diff and leaves the host untouched; --force overwrites after printing it', () => {
  const host = buildTestHost();
  try {
    promote(host.root, 'checkout');
    const before = readFileSync(host.promotedHeroPath, 'utf8');

    // design evolves to r2; developer touches the host copy
    writeFileSync(host.heroPath, `${readFileSync(host.heroPath, 'utf8')}<!-- v2 -->\n`, 'utf8');
    saveDesignCommit(host.root, 'checkout', 'v2 edits');
    releaseDesignTag(host.root, 'r2', 'second release');
    writeFileSync(host.promotedHeroPath, `${before}<!-- dev edit -->\n`, 'utf8');

    // full promote: the FIRST refusal (sorted refs) is cta — content-identical, empty diff
    assert.throws(() => promote(host.root, 'checkout'), (error: unknown) => {
      assert.ok(error instanceof PromotionExistsError);
      assert.equal(error.diff, '', 'identical content still refuses (provenance discipline)');
      return true;
    });
    // the edited hero target refuses with the host side in the diff
    assert.throws(() => promote(host.root, 'checkout', { select: ['pages/hero.svelte'] }), (error: unknown) => {
      assert.ok(error instanceof PromotionExistsError);
      assert.ok(error.diff.includes('-<!-- dev edit -->'), `refusal diff shows the host side: ${error.diff}`);
      assert.ok(error.diff.includes('+#jixoai') === false, 'incoming side is already rewritten');
      return true;
    });
    assert.equal(readFileSync(host.promotedHeroPath, 'utf8'), `${before}<!-- dev edit -->\n`, 'refused run writes nothing');

    const forced = promote(host.root, 'checkout', { force: true });
    assert.deepEqual(forced.forced.sort(), ['src/lib/design/checkout/components/cta.svelte', 'src/lib/design/checkout/pages/hero.svelte']);
    assert.equal(forced.forcedDiffs.length, 2);
    const heroDiff = forced.forcedDiffs.find((d) => d.file.endsWith('hero.svelte'))!.diff;
    assert.ok(heroDiff.includes('-<!-- dev edit -->'), 'force exposes what it replaced');
    assert.equal(forced.tag.name, 'r2');
    const after = readFileSync(host.promotedHeroPath, 'utf8');
    assert.equal(after.includes('<!-- dev edit -->'), false, 'force replaces host edits (explicit opt-in)');
    assert.equal(after.includes('<!-- v2 -->'), true);
    const records = readPromotions(host.root);
    assert.equal(records.length, 2, 'still one record per file');
    assert.equal(records.find((r) => r.ref === 'pages/hero.svelte')!.tag, 'r2');
  } finally {
    rmSync(host.root, { recursive: true, force: true });
  }
});

test('--select promotes exactly the named refs (validated against the tagged tree)', () => {
  const host = buildTestHost();
  try {
    const result = promote(host.root, 'checkout', { select: ['pages/hero.svelte'] });
    assert.deepEqual(result.promoted, ['src/lib/design/checkout/pages/hero.svelte']);
    assert.equal(existsSync(host.promotedCtaPath), false);
    assert.throws(() => promote(host.root, 'checkout', { select: ['pages/missing.svelte'] }), /not in tag r1/);
  } finally {
    rmSync(host.root, { recursive: true, force: true });
  }
});

test('status: drift through git ranges — changelog = tag notes, diff = git unified output', () => {
  const host = buildTestHost();
  try {
    promote(host.root, 'checkout');

    // in sync right after promotion
    let status = promotionStatus(host.root);
    assert.equal(status.promotions.length, 2);
    assert.equal(status.promotions.every((p) => !p.drifted), true);

    // design moves to r2: a real line edit + release notes
    writeFileSync(host.heroPath, readFileSync(host.heroPath, 'utf8').replace('Deploy', 'Ship it'), 'utf8');
    saveDesignCommit(host.root, 'checkout', 'irrelevant wip note');
    releaseDesignTag(host.root, 'r2', 'deploy → ship it');

    status = promotionStatus(host.root);
    const hero = status.promotions.find((p) => p.ref === 'pages/hero.svelte')!;
    const cta = status.promotions.find((p) => p.ref === 'components/cta.svelte')!;
    assert.equal(hero.drifted, true);
    assert.equal(hero.currentTag, 'r2');
    assert.deepEqual(hero.changelogSince.map((c) => c.note), ['deploy → ship it'], 'tag notes are the intent summary');
    assert.deepEqual(hero.changelogSince.map((c) => c.tag), ['r2']);
    assert.ok(hero.diff !== null && hero.diff.includes('-  <PressButton variant="fill">Deploy</PressButton>'), `git diff names the old line: ${hero.diff}`);
    assert.ok(hero.diff.includes('+  <PressButton variant="fill">Ship it</PressButton>'));
    assert.equal(hero.hostModified, false);
    // the untouched cta: same commit range, content-identical → not drifted
    assert.equal(cta.drifted, false);
    assert.equal(cta.diff, null);

    // wip drift (no release yet): drifted via the git range, empty changelog
    writeFileSync(host.heroPath, readFileSync(host.heroPath, 'utf8').replace('Ship it', 'Launch'), 'utf8');
    saveDesignCommit(host.root, 'checkout', 'wip only');
    const wipStatus = promotionStatus(host.root);
    const wipHero = wipStatus.promotions.find((p) => p.ref === 'pages/hero.svelte')!;
    assert.equal(wipHero.drifted, true, 'git range sees the wip commit');
    assert.deepEqual(wipHero.changelogSince.map((c) => c.note), ['deploy → ship it'], 'no NEW tags after r2 → notes stop at r2');

    // host edits surface as hostModified (vs the reconstructed base)
    writeFileSync(host.promotedCtaPath, `${readFileSync(host.promotedCtaPath, 'utf8')}<!-- dev -->\n`, 'utf8');
    assert.equal(promotionStatus(host.root).promotions.find((p) => p.ref === 'components/cta.svelte')!.hostModified, true);
    // a deleted host file surfaces as hostMissing
    rmSync(host.promotedCtaPath);
    assert.equal(promotionStatus(host.root).promotions.find((p) => p.ref === 'components/cta.svelte')!.hostMissing, true);
  } finally {
    rmSync(host.root, { recursive: true, force: true });
  }
});

test('tag-between grouping: drift across MULTIPLE prototypes reports per prototype', () => {
  const host = buildTestHost('checkout');
  try {
    // a second prototype sharing the design repo
    const dir = join(host.root, 'design/prototypes/landing/pages');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'intro.svelte'), "<script module lang=\"ts\">\n  import Badge from '#jixoai/badge';\n</script>\n\n<Badge>landing</Badge>\n", 'utf8');
    saveDesignCommit(host.root, 'landing', 'add landing');
    releaseDesignTag(host.root, 'r2', 'landing arrives');

    promote(host.root, 'checkout');
    promote(host.root, 'landing');

    // r3: BOTH prototypes change
    writeFileSync(host.heroPath, readFileSync(host.heroPath, 'utf8').replace('Deploy', 'Ship'), 'utf8');
    writeFileSync(join(dir, 'intro.svelte'), "<script module lang=\"ts\">\n  import Badge from '#jixoai/badge';\n</script>\n\n<Badge variant=\"fill\">landing</Badge>\n", 'utf8');
    saveDesignCommit(host.root, undefined, 'both change');
    releaseDesignTag(host.root, 'r3', 'both move');

    const status = promotionStatus(host.root);
    assert.equal(status.promotions.length, 3);
    const protos = new Set(status.promotions.filter((p) => p.drifted).map((p) => p.proto));
    assert.deepEqual([...protos].sort(), ['checkout', 'landing'], 'the report covers every drifted prototype');
    for (const p of status.promotions) {
      if (p.drifted) assert.deepEqual(p.changelogSince.map((c) => c.tag), ['r3']);
    }
  } finally {
    rmSync(host.root, { recursive: true, force: true });
  }
});

test('empty host: status over a workspace with no promotions is an empty report', () => {
  const host = buildTestHost();
  try {
    assert.deepEqual(promotionStatus(host.root).promotions, []);
  } finally {
    rmSync(host.root, { recursive: true, force: true });
  }
});
