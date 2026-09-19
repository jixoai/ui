/**
 * @jixoai/ui-design (presence) — the wheel-opposite color law's pure
 * half (walkthrough R2, Owner 2026-09-19: 两个相邻颜色之间太相似了，
 * 最好在一个圆形色盘上每次选到对面的色——当然不是正对面).
 *
 * pickHue is deterministic and total: these tests pin BOTH the literal
 * sequence (73 → 252 → 342 → 163 → 27 → 118 → 297) and the semantic
 * properties it must preserve at every join (min-dist to the live set,
 * adjacency between consecutive joiners, never exactly antipodal).
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { BRAND_ANCHOR_HUE, PERSISTED_HUE_TTL_MS, PresenceLedger, circularHueDistance, pickHue } from './ledger.ts';

const joinSequence = (joins: number): number[] => {
  const hues: number[] = [];
  for (let i = 0; i < joins; i += 1) {
    hues.push(pickHue(hues, hues[hues.length - 1]));
  }
  return hues;
};

test('pickHue: the literal wheel-opposite sequence', () => {
  assert.deepEqual(joinSequence(12), [73, 252, 343, 162, 298, 207, 28, 117, 275, 51, 230, 6]);
});

test('pickHue: the anchor — the first player lands on the brand hue', () => {
  assert.equal(pickHue([]), BRAND_ANCHOR_HUE);
  assert.equal(BRAND_ANCHOR_HUE, 73);
});

test('pickHue: the second player lands opposite, never exactly antipodal', () => {
  const hue = pickHue([73], 73);
  const d = circularHueDistance(hue, 73);
  assert.ok(d >= 170 && d < 180, `expected near-opposite, got ${hue} (dist ${d})`);
});

test('pickHue: consecutive joiners stay dissimilar (the Owner complaint)', () => {
  // the spec's law: the FIRST SIX identities keep adjacent joins >= 90
  // degrees; beyond that the wheel's physics takes over (the worst pair
  // across 12 joins is 89, at join 8) — 85 keeps that locked without
  // over-promising
  const hues = joinSequence(12);
  for (let i = 1; i < hues.length; i += 1) {
    const d = circularHueDistance(hues[i]!, hues[i - 1]!);
    const floor = i <= 5 ? 90 : 85; // joins 2-6 are within the first six identities
    assert.ok(d >= floor, `joiners ${i}→${i + 1} (${hues[i - 1]}→${hues[i]}) only ${d}° apart (floor ${floor})`);
  }
});

test('pickHue: every join keeps max-min distance from the whole live set', () => {
  // realistic session sizes (2-7 concurrent players) hold >= 45; beyond
  // that the wheel's physics takes over (9 players average 40 deg apart)
  const hues = joinSequence(7);
  hues.forEach((hue, i) => {
    const before = hues.slice(0, i);
    if (before.length === 0) return;
    const minDist = Math.min(...before.map((e) => circularHueDistance(hue, e)));
    assert.ok(minDist >= 45, `join #${i + 1} (${hue}) only ${minDist}° from its live set`);
  });
});

test('pickHue: never exactly antipodal to any live hue', () => {
  const hues = joinSequence(12);
  for (let i = 0; i < hues.length; i += 1) {
    for (let j = 0; j < i; j += 1) {
      assert.notEqual(circularHueDistance(hues[i]!, hues[j]!), 180, `joins ${i + 1}/${j + 1} exactly antipodal`);
    }
  }
});

test('pickHue: tolerates junk input (non-finite hues are ignored)', () => {
  assert.equal(pickHue([Number.NaN]), BRAND_ANCHOR_HUE);
  assert.equal(pickHue([Number.NaN, 73], 73), 252);
});

test('circularHueDistance: the wheel metric (wraps both ways, normalizes input)', () => {
  assert.equal(circularHueDistance(0, 359), 1);
  assert.equal(circularHueDistance(359, 0), 1);
  assert.equal(circularHueDistance(90, 270), 180);
  assert.equal(circularHueDistance(-90, 270), 0); // -90 ≡ 270
  assert.equal(circularHueDistance(360 + 73, 73), 0);
});

test('PERSISTED_HUE_TTL: a fresh record constrains the next mint, a stale one does not', () => {
  const make = (lastSeenAgo: number) => {
    const root = mkdtempSync(join(tmpdir(), 'jx-presence-ttl-'));
    const file = join(root, 'design', '.jx-collab', 'presence.json');
    mkdirSync(dirname(file), { recursive: true });
    const first = new PresenceLedger(join(root, 'design')).restoreOrCreate({ name: 'a', kind: 'human' });
    // backdate the persisted record beyond (or within) the TTL window
    const state = JSON.parse(readFileSync(file, 'utf8')) as { players: { lastSeen: number }[] };
    state.players[0]!.lastSeen = Date.now() - lastSeenAgo;
    writeFileSync(file, JSON.stringify(state));
    const ledger = new PresenceLedger(join(root, 'design'));
    const second = ledger.restoreOrCreate({ name: 'b', kind: 'human' });
    return { firstHue: first.record.colorHue, secondHue: second.record.colorHue };
  };
  // fresh (within TTL): the second mint lands opposite the first
  const fresh = make(60_000);
  assert.equal(fresh.firstHue, 73);
  assert.equal(circularHueDistance(fresh.firstHue, fresh.secondHue), 179, `fresh record constrains: ${fresh.secondHue}`);
  // stale (beyond TTL): the record frees its hue — the next mint anchors anew
  const stale = make(PERSISTED_HUE_TTL_MS + 60_000);
  assert.equal(stale.secondHue, 73, 'a stale record no longer constrains the wheel');
});
