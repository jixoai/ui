/**
 * channels.test.ts — the spinner channel contract battery
 * (spinner-channel-api tasks 6–8: the factory's shape+grammar
 * errors, the set-level uniqueness law, the smuggle gate, the merge
 * law defaults → channels → flat, the pack factories, and the
 * generator-level namespaced round-trip that pins the component's
 * zero-change law).
 */

import { describe, expect, test } from 'vitest';
import { defineSpinnerChannel } from '../../src/spinners/channel/define.js';
import { normalizeSpinnerChannels } from '../../src/spinners/channel/normalize.js';
import type { SpinnerChannel } from '../../src/spinners/channel/types.js';
import {
  normalizeSpinnersOptions,
  resolveSpinnerInputs,
  SPINNER_FULL_NAME_PATTERN,
} from '../../src/spinners/resolve.js';
import { generateSpinSet } from '../../src/spinners/generate.js';
import { createSafetyChecker } from '../../src/icons/safety.js';
import type { ProviderContext } from '../../src/icons/types.js';
import { magecdn } from '../../src/spinners/packs/magecdn.js';
import { sam } from '../../src/spinners/packs/svg-loaders.js';
import { magecdnSpinners } from '../../src/spinners/packs/magecdn.js';
import { svgLoadersSpinners } from '../../src/spinners/packs/svg-loaders.js';

// a minimal legal inline loader (root svg + viewBox — the extractor's
// structural contract)
const PULSE_SVG =
  '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8" fill="currentColor"><animate attributeName="r" dur="0.8s" values="8;3;8" repeatCount="indefinite"/></circle></svg>';
const OTHER_SVG = PULSE_SVG.replace('0.8s', '1.2s');

/** the inline-only io twin ({file} never exercised here) */
const inlineIo = (): ProviderContext => ({
  async loadSource() {
    throw new Error('no file sources in the channel battery');
  },
  watchFile: () => undefined,
});

const myco = (): SpinnerChannel =>
  defineSpinnerChannel({
    id: 'myco',
    prefix: 'myco',
    spinners: { pulse: PULSE_SVG, wave: OTHER_SVG },
  });

// ── the factory (design §1 — everything checkable fails there) ─────

describe('defineSpinnerChannel', () => {
  test('builds the instance; optional metadata omitted when not given', () => {
    const channel = myco();
    expect(channel.id).toBe('myco');
    expect(channel.prefix).toBe('myco');
    expect(Object.keys(channel.spinners)).toEqual(['pulse', 'wave']);
    expect('peerPackage' in channel).toBe(false);
    expect('defaultsNote' in channel).toBe(false);
  });

  test('prefix grammar: lowercase-led alphanumeric only, taught by name', () => {
    expect(() =>
      defineSpinnerChannel({ id: 'a', prefix: 'my-co', spinners: { x: PULSE_SVG } }),
    ).toThrowError(/prefix "my-co" is illegal.*\^\[a-z\]\[a-z0-9\]\*\$/s);
    expect(() =>
      defineSpinnerChannel({ id: 'a', prefix: 'MyCo', spinners: { x: PULSE_SVG } }),
    ).toThrowError(/prefix "MyCo" is illegal/s);
  });

  test('id grammar: kebab, taught by name', () => {
    expect(() =>
      defineSpinnerChannel({ id: 'My Co', prefix: 'myco', spinners: { x: PULSE_SVG } }),
    ).toThrowError(/id "My Co" is illegal/s);
  });

  test('an empty spinners record is a named error (no silent no-ops)', () => {
    expect(() =>
      defineSpinnerChannel({ id: 'myco', prefix: 'myco', spinners: {} }),
    ).toThrowError(/"myco" needs a non-empty spinners record.*silent no-op/s);
  });

  test('channel-RELATIVE names: the flat grammar, no prefix inside the channel', () => {
    expect(() =>
      defineSpinnerChannel({ id: 'a', prefix: 'myco', spinners: { 'myco:pulse': PULSE_SVG } }),
    ).toThrowError(/"a" spinner name "myco:pulse" is illegal.*channel-RELATIVE/s);
  });

  test('metadata types validated at the factory (the icons diff-r1 m1 mirror)', () => {
    expect(() =>
      defineSpinnerChannel({
        id: 'a',
        prefix: 'myco',
        spinners: { x: PULSE_SVG },
        // @ts-expect-error the smuggled literal lane
        peerPackage: 42,
      }),
    ).toThrowError(/peerPackage must be a string/s);
    expect(() =>
      defineSpinnerChannel({
        id: 'a',
        prefix: 'myco',
        spinners: { x: PULSE_SVG },
        // @ts-expect-error the smuggled literal lane
        defaultsNote: null,
      }),
    ).toThrowError(/defaultsNote must be a string/s);
  });
});

// ── set-level normalization (design §1 — config-time) ──────────────

describe('normalizeSpinnerChannels', () => {
  test('passes valid instances through untouched (same references)', () => {
    const a = myco();
    const b = defineSpinnerChannel({ id: 'other', prefix: 'other', spinners: { x: PULSE_SVG } });
    const out = normalizeSpinnerChannels([a, b]);
    expect(out).toHaveLength(2);
    expect(out[0]).toBe(a);
    expect(out[1]).toBe(b);
  });

  test('one entry per id', () => {
    const a = myco();
    const b = defineSpinnerChannel({ id: 'myco', prefix: 'zzz', spinners: { x: PULSE_SVG } });
    expect(() => normalizeSpinnerChannels([a, b])).toThrowError(
      /two channels share the id "myco".*"myco".*"zzz"/s,
    );
  });

  test('ONE channel per prefix — two namespaces folding into one is refused by name', () => {
    const a = myco();
    const b = defineSpinnerChannel({ id: 'evil', prefix: 'myco', spinners: { x: PULSE_SVG } });
    expect(() => normalizeSpinnerChannels([a, b])).toThrowError(
      /two channels share the prefix "myco:".*"myco" and "evil"/s,
    );
  });

  test('the smuggle gate: a forged literal fails the factory checks by name', () => {
    const forged = { id: 'ok-id', prefix: 'Bad-Prefix', spinners: { x: PULSE_SVG } };
    expect(() => normalizeSpinnerChannels([forged])).toThrowError(/prefix "Bad-Prefix" is illegal/s);
    const forgedEmpty = { id: 'ok-id', prefix: 'myco', spinners: {} };
    expect(() => normalizeSpinnerChannels([forgedEmpty])).toThrowError(/empty spinners record/s);
    const forgedMeta = { id: 'ok-id', prefix: 'myco', spinners: { x: PULSE_SVG }, peerPackage: 7 };
    expect(() => normalizeSpinnerChannels([forgedMeta])).toThrowError(/peerPackage must be a string/s);
  });

  test('a non-channel entry is refused with the factory teaching error', () => {
    expect(() => normalizeSpinnerChannels(['myco'])).toThrowError(
      /build them.*defineSpinnerChannel\(spec\).*magecdn\(\{ pick\? \}\) \/ sam\(\{ pick\? \}\)/s,
    );
  });
});

// ── the merge law (design §2) ───────────────────────────────────────

describe('the merge law (defaults → channels → flat)', () => {
  const resolve = async (options: Parameters<typeof resolveSpinnerInputs>[0]) => {
    const { spinners } = await resolveSpinnerInputs(options, inlineIo(), createSafetyChecker({ mode: 'warn' }));
    return spinners.map((spinner) => spinner.name);
  };

  test('a channel namespaces its entries into the packing set', async () => {
    const names = await resolve({ channels: [myco()] });
    expect(names).toEqual(['blocks-wave', 'myco:pulse', 'myco:wave']);
  });

  test('a flat namespaced key overrides a channel entry (the icons override law)', async () => {
    const names = await resolve({
      channels: [myco()],
      spinners: { 'myco:pulse': OTHER_SVG },
    });
    expect(names).toEqual(['blocks-wave', 'myco:pulse', 'myco:wave']);
    // the override is positional (same key, replaced source) — the
    // artwork check rides the generator-level test below
  });

  test('channels sit between the built-ins and the flat record', async () => {
    const names = await resolve({
      includeDefaults: false,
      channels: [myco()],
      spinners: { 'blocks-wave': PULSE_SVG, flat: PULSE_SVG },
    });
    // 'blocks-wave' flat OVERRIDES the default (not present — includeDefaults
    // false); channel keys carry ':', flat never does — the two lanes cannot collide
    expect(names).toEqual(['myco:pulse', 'myco:wave', 'blocks-wave', 'flat']);
  });

  test('the full-name grammar: namespaced flat keys legal, garbage refused (both forms taught)', () => {
    expect(SPINNER_FULL_NAME_PATTERN.test('magecdn:180-ring')).toBe(true);
    expect(SPINNER_FULL_NAME_PATTERN.test('myco:pulse')).toBe(true);
    expect(SPINNER_FULL_NAME_PATTERN.test('blocks-wave')).toBe(true);
    expect(SPINNER_FULL_NAME_PATTERN.test('a:b:c')).toBe(false);
    expect(SPINNER_FULL_NAME_PATTERN.test('myco:')).toBe(false);
    expect(SPINNER_FULL_NAME_PATTERN.test(':x')).toBe(false);
    expect(() => normalizeSpinnersOptions({ spinners: { 'myco:Pulse': PULSE_SVG } })).toThrowError(
      /"myco:Pulse" is illegal.*\^\[a-z0-9\]\[a-z0-9-\]\*\$.*\^\[a-z\]\[a-z0-9\]\*:/s,
    );
  });

  test('double normalization carries the instances (the vite idempotence path, §2a)', () => {
    const channel = myco();
    const once = normalizeSpinnersOptions({ channels: [channel] });
    const twice = normalizeSpinnersOptions(once);
    expect(twice.channels).toHaveLength(1);
    expect(twice.channels[0]).toBe(channel);
  });
});

// ── the pack channel factories (design §3) ─────────────────────────

describe('the pack channel factories', () => {
  test('magecdn(): id + prefix + all 94, pack record order', () => {
    const channel = magecdn();
    expect(channel.id).toBe('magecdn');
    expect(channel.prefix).toBe('magecdn');
    expect(Object.keys(channel.spinners)).toEqual(Object.keys(magecdnSpinners));
    expect(channel.defaultsNote).toContain('94 verified loaders');
  });

  test('magecdn({ pick }) is a FILTER — pack record order wins, duplicates dedupe', () => {
    const channel = magecdn({ pick: ['clock', 'bars-scale', 'clock'] });
    expect(Object.keys(channel.spinners)).toEqual(
      Object.keys(magecdnSpinners).filter((name) => name === 'bars-scale' || name === 'clock'),
    );
  });

  test('unknown pick + empty pick are named errors', () => {
    expect(() => magecdn({ pick: ['not-a-loader'] })).toThrowError(
      /pick names unknown loaders: not-a-loader.*channel-RELATIVE/s,
    );
    expect(() => magecdn({ pick: [] })).toThrowError(/pick is empty.*silent no-op/s);
  });

  test('sam(): the short-prefix law — id svg-loaders, prefix sam, all 12', () => {
    const channel = sam();
    expect(channel.id).toBe('svg-loaders');
    expect(channel.prefix).toBe('sam');
    expect(Object.keys(channel.spinners)).toEqual(Object.keys(svgLoadersSpinners));
    expect(() => sam({ pick: ['tail-spin', 'nope'] })).toThrowError(/unknown loaders: nope/s);
  });
});

// ── the generator-level namespaced round-trip (§4 zero-change pin) ─

describe('the namespaced artifact round-trip', () => {
  test('myco:pulse joins the union quoted and getSpin answers synchronously', async () => {
    const { spinners } = await resolveSpinnerInputs(
      { includeDefaults: false, channels: [myco()] },
      inlineIo(),
      createSafetyChecker({ mode: 'warn' }),
    );
    const { artifact } = generateSpinSet(spinners);
    // the union member is the QUOTED string (':' keys are never bare)
    expect(artifact).toContain("| 'myco:pulse'");
    expect(artifact).toContain("'myco:wave'");
    // the record keys carry the namespace byte-for-byte
    expect(artifact).toContain("'myco:pulse': {");
  });
});
