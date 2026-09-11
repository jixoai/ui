/**
 * equivalence tests — the #12 (design-studio-r3 T0) gates: the
 * structural signatures that decide whether a poll/observer burst may
 * rewrite $state, and the panel seed contract (seedTargetOf) whose
 * primitive-only equality makes an identity-only effect re-run a
 * no-op — the W2-③ "10s 静置零闪烁" regression net.
 *
 * Original need: Owner 2026-09-11 issue #12 (design-studio-r3 T0,
 * 2026-09-12).
 */

import { strict as assert } from 'node:assert';
import test from 'node:test';

import {
  manifestSignature,
  promotionsSignature,
  recordsSignature,
  seedSignature,
  seedTargetOf,
  type ManifestEntry,
  type PromotionFileStatus,
} from './equivalence.ts';
import type { StampRecord } from './selection.ts';

/* ── fixtures ───────────────────────────────────────────────────────── */

function manifestFixture(): ManifestEntry[] {
  return [
    { name: 'welcome', path: '/__design__/frame/welcome/', frames: [{ id: 'hero', ref: './hero.svelte' }] },
    { name: 'pricing', path: '/__design__/frame/pricing/', frames: [{ id: 'hero', ref: './hero.svelte' }, { id: 'cta' }] },
  ];
}

function promotionFixture(): PromotionFileStatus {
  return {
    file: 'src/lib/design/welcome/Hero.svelte',
    proto: 'welcome',
    ref: 'Hero.svelte',
    tag: 'v1',
    commitSha: 'a1b2c3',
    promotedAt: '2026-09-11T10:00:00.000Z',
    currentTag: 'v2',
    drifted: true,
    tagMissing: false,
    hostMissing: false,
    hostModified: true,
    changelogSince: [{ tag: 'v2', at: '2026-09-11T12:00:00.000Z', note: 'destructive pass' }],
    diff: '@@ -1 +1 @@\n-old\n+new',
    refRemovedFromDesign: false,
  };
}

function recordsFixture(): StampRecord[] {
  return [
    { frameId: null, component: 'press-button', usageIndex: 1, instanceCount: 1, parentUsageIndex: null },
    { frameId: 'hero', component: 'badge', usageIndex: 2, instanceCount: 3, parentUsageIndex: 1 },
  ];
}

/** deep-clone with FRESH identities everywhere (the poll's new array) */
function fresh<T>(value: T): T {
  return structuredClone(value);
}

/* ── the manifest gate ──────────────────────────────────────────────── */

test('manifest signature: byte-equal polls (new identities) are interchangeable', () => {
  const first = manifestSignature(manifestFixture());
  const secondPoll = manifestSignature(fresh(manifestFixture()));
  assert.equal(first, secondPoll);
});

test('manifest signature: every real change flips it (name/path/frame id/ref/order)', () => {
  const base = manifestSignature(manifestFixture());
  const variants: ManifestEntry[][] = [
    // name change
    [{ ...manifestFixture()[0]!, name: 'welcome-v2' }, manifestFixture()[1]!],
    // path change
    [{ ...manifestFixture()[0]!, path: '/__design__/frame/welcome-v2/' }, manifestFixture()[1]!],
    // frame ref change
    [
      { ...manifestFixture()[0]!, frames: [{ id: 'hero', ref: './hero-v2.svelte' }] },
      manifestFixture()[1]!,
    ],
    // frame ref APPEARS (undefined → set is a change)
    [{ ...manifestFixture()[0]!, frames: [{ id: 'hero' }] }, manifestFixture()[1]!],
    // frame added
    [
      { ...manifestFixture()[0]!, frames: [{ id: 'hero', ref: './hero.svelte' }, { id: 'cta' }] },
      manifestFixture()[1]!,
    ],
    // entry order change (the navigator's DOM order follows it)
    [manifestFixture()[1]!, manifestFixture()[0]!],
  ];
  for (const variant of variants) {
    assert.notEqual(manifestSignature(variant), base);
  }
});

test('manifest signature: frames undefined and frames [] are ONE state', () => {
  const withUndefined = manifestSignature([{ name: 'a', path: '/a/' }]);
  const withEmpty = manifestSignature([{ name: 'a', path: '/a/', frames: [] }]);
  assert.equal(withUndefined, withEmpty);
});

/* ── the promotions gate ────────────────────────────────────────────── */

test('promotions signature: byte-equal polls (new identities) are interchangeable', () => {
  const first = promotionsSignature([promotionFixture()]);
  assert.equal(first, promotionsSignature(fresh([promotionFixture()])));
  assert.equal(promotionsSignature([]), promotionsSignature([]));
});

test('promotions signature: every drift-relevant change flips it', () => {
  const base = promotionsSignature([promotionFixture()]);
  const flips: Array<Partial<PromotionFileStatus>> = [
    { tag: 'v3' }, // re-anchored
    { currentTag: null }, // releases converged/removed
    { drifted: false }, // apply landed (W9: badge must disappear)
    { hostModified: false },
    { hostMissing: true },
    { tagMissing: true },
    { refRemovedFromDesign: true },
    { commitSha: 'deadbe' },
    { diff: null },
    { diff: '@@ -1 +1 @@\n-other' },
    { changelogSince: [] }, // a release note left the window
    {
      changelogSince: [
        { tag: 'v2', at: '2026-09-11T12:00:00.000Z', note: 'destructive pass' },
        { tag: 'v3', at: '2026-09-12T08:00:00.000Z', note: 'calmer copy' },
      ],
    },
  ];
  for (const flip of flips) {
    assert.notEqual(
      promotionsSignature([{ ...promotionFixture(), ...flip }]),
      base,
      `a change to ${Object.keys(flip).join(',')} must flip the signature`,
    );
  }
  // the file identity itself (list order included)
  const other = { ...promotionFixture(), file: 'src/lib/design/welcome/Cta.svelte' };
  assert.notEqual(promotionsSignature([other, promotionFixture()]), promotionsSignature([promotionFixture(), other]));
});

/* ── the tree records gate ──────────────────────────────────────────── */

test('records signature: byte-equal walks (new identities) are interchangeable', () => {
  const first = recordsSignature(recordsFixture());
  assert.equal(first, recordsSignature(fresh(recordsFixture())));
});

test('records signature: every stamp change flips it (count/nesting/order/added)', () => {
  const base = recordsSignature(recordsFixture());
  const variants: StampRecord[][] = [
    // instanceCount change (an {#each} grew)
    [
      recordsFixture()[0]!,
      { ...recordsFixture()[1]!, instanceCount: 4 },
    ],
    // nesting change
    [
      recordsFixture()[0]!,
      { ...recordsFixture()[1]!, parentUsageIndex: null },
    ],
    // walk order change
    [recordsFixture()[1]!, recordsFixture()[0]!],
    // a stamp appeared
    [...recordsFixture(), { frameId: 'hero', component: 'chip', usageIndex: 3, instanceCount: 1, parentUsageIndex: null }],
    // a stamp vanished
    [recordsFixture()[0]!],
  ];
  for (const variant of variants) {
    assert.notEqual(recordsSignature(variant), base);
  }
});

/* ── the panel seed contract (W2-③: the effect's no-op guarantee) ───── */

test('seedTargetOf: null or malformed selections resolve to null (defensive seam payloads)', () => {
  assert.equal(seedTargetOf(null, 'design/prototypes/x/canvas.svelte'), null);
  assert.equal(seedTargetOf({}, null), null); // missing keys
  assert.equal(seedTargetOf({ frameId: 'hero', component: 'badge' }, null), null); // no usageIndex
});

test('seedTargetOf: the full primitive bundle (frameId null = the canvas document)', () => {
  assert.deepEqual(seedTargetOf({ frameId: null, usageIndex: 2, component: 'press-button' }, 'design/prototypes/welcome/canvas.svelte'), {
    frameId: null,
    usageIndex: 2,
    component: 'press-button',
    file: 'design/prototypes/welcome/canvas.svelte',
  });
  assert.deepEqual(seedTargetOf({ frameId: 'hero', usageIndex: 1, component: 'badge' }, 'design/prototypes/welcome/hero.svelte'), {
    frameId: 'hero',
    usageIndex: 1,
    component: 'badge',
    file: 'design/prototypes/welcome/hero.svelte',
  });
});

test('seed contract: identity-only churn (tree recreating the selection object, poll re-deriving upstream) is a NO-OP', () => {
  const selection = { frameId: 'hero', usageIndex: 2, component: 'badge' } as const;
  const file = 'design/prototypes/welcome/hero.svelte';
  const first = seedTargetOf(selection, file)!;
  // same keys, FRESH object identity — the P2-1 scenario
  const churned = seedTargetOf({ ...selection }, file)!;
  assert.deepEqual(churned, first);
  assert.equal(seedSignature(churned), seedSignature(first)); // the effect's guard hits: no reset, no refetch
});

test('seed contract: a REAL change re-seeds (the guard must not swallow it)', () => {
  const selection = { frameId: 'hero', usageIndex: 2, component: 'badge' };
  const base = seedSignature(seedTargetOf(selection, 'design/prototypes/welcome/hero.svelte')!);
  assert.notEqual(seedSignature(seedTargetOf({ ...selection, usageIndex: 3 }, 'design/prototypes/welcome/hero.svelte')!), base);
  assert.notEqual(seedSignature(seedTargetOf({ ...selection, component: 'chip' }, 'design/prototypes/welcome/hero.svelte')!), base);
  assert.notEqual(seedSignature(seedTargetOf({ ...selection, frameId: null }, 'design/prototypes/welcome/canvas.svelte')!), base);
  // selectionFile changed (the frame's ref resolved differently) — new file
  assert.notEqual(seedSignature(seedTargetOf(selection, 'design/prototypes/welcome/hero-v2.svelte')!), base);
  // selection file UNRESOLVED (ref-less frame) — the read-only path
  assert.notEqual(seedSignature(seedTargetOf(selection, null)!), base);
});

test('seed contract: deselection is a real transition (reset still runs), not a swallowed no-op', () => {
  const seeded: string | null = seedSignature(seedTargetOf({ frameId: 'hero', usageIndex: 2, component: 'badge' }, 'f')!);
  const deselected: string | null = null; // the effect's seed when no selection is live
  assert.notEqual(deselected, seeded); // null seed ≠ any live seed — the effect resets
});
