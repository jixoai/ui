/**
 * resolve.test.ts — the ADAPTER-side resolution + validation matrix
 * (P4, design §5/§6): option normalization with the frozen defaults,
 * the kebab name grammar, the merge/override law (same-name custom
 * OVERRIDES the built-in in place — the icons law), custom inline +
 * `{file}` sources joining the union, the RAW safety semantics
 * (`<script>` rejected / `<animate>` ALLOWED — the R2 pin) and the
 * structural-validation drop path.
 */

import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve as resolvePath } from 'node:path';
import { afterAll, describe, expect, test } from 'vitest';
import {
  normalizeSpinnersOptions,
  resolveSpinnerInputs,
  SPINNER_NAME_PATTERN,
} from '../../src/spinners/resolve.js';
import { BLOCKS_WAVE_SVG } from '../../src/spinners/manifest.js';
import { createSafetyChecker } from '../../src/icons/safety.js';
import type { ProviderContext } from '../../src/icons/types.js';

// ── the fs-backed io twin (the icons adapter-test fixture style) ────

const fsIo = (): ProviderContext => ({
  async loadSource(path: string) {
    const resolved = resolvePath(path);
    return {
      data: new Uint8Array(await readFile(resolved)),
      path: resolved,
      mimeType: 'image/svg+xml',
    };
  },
  watchFile: () => undefined,
});

const io = fsIo();
const warnChecker = () => createSafetyChecker({ mode: 'warn' });

// ── fixtures root ({file} sources need a real tree) ────────────────

let fixtureRoot: string;

afterAll(async () => {
  if (fixtureRoot !== undefined) await rm(fixtureRoot, { recursive: true, force: true });
});

const freshFixture = async (): Promise<string> => {
  fixtureRoot = await mkdtemp(join(tmpdir(), 'jixoai-spins-resolve-'));
  return fixtureRoot;
};

// ── option normalization ───────────────────────────────────────────

describe('normalizeSpinnersOptions (the frozen defaults)', () => {
  test('a bare {} = blocks-wave only — the defaults normalize cleanly', () => {
    expect(normalizeSpinnersOptions({})).toEqual({
      includeDefaults: true,
      spinners: {},
      output: 'src/lib/spin-set.gen.ts',
      write: false,
    });
  });

  test('spinner names must match /^[a-z][a-z0-9-]*$/ (kebab, the channel-id grammar)', () => {
    expect(() => normalizeSpinnersOptions({ spinners: { MyLoader: '<svg/>' } })).toThrowError(
      /"MyLoader".*\/\^\[a-z\]\[a-z0-9-\]\*\$\//s,
    );
    expect(() => normalizeSpinnersOptions({ spinners: { my_loader: '<svg/>' } })).toThrowError(
      /"my_loader"/,
    );
    expect(() => normalizeSpinnersOptions({ spinners: { _loader: '<svg/>' } })).toThrowError(
      /"_loader"/,
    );
    expect(() => normalizeSpinnersOptions({ spinners: { '9dots': '<svg/>' } })).toThrowError(
      /"9dots"/,
    );
    expect(() =>
      normalizeSpinnersOptions({ spinners: { 'my-loader': '<svg/>', ok: '<svg/>' } }),
    ).not.toThrow();
    expect(SPINNER_NAME_PATTERN.test('a')).toBe(true);
    expect(SPINNER_NAME_PATTERN.test('a-b-c')).toBe(true);
    expect(SPINNER_NAME_PATTERN.test('blocks-wave')).toBe(true);
    expect(SPINNER_NAME_PATTERN.test('aB')).toBe(false);
    expect(SPINNER_NAME_PATTERN.test('Aa')).toBe(false);
    expect(SPINNER_NAME_PATTERN.test('-a')).toBe(false);
  });

  test('illegal outputs fail with named teaching errors', () => {
    expect(() => normalizeSpinnersOptions({ output: '/abs/gen.ts' })).toThrowError(
      /project-root-relative/,
    );
    expect(() => normalizeSpinnersOptions({ output: '../escape.ts' })).toThrowError(
      /project-root-relative/,
    );
    expect(() => normalizeSpinnersOptions({ output: '' })).toThrowError(/project-root-relative/);
  });
});

// ── merge / resolution ─────────────────────────────────────────────

describe('merge + resolution (design §6 item b)', () => {
  test('a bare {} resolves exactly the vendored blocks-wave', async () => {
    const resolution = await resolveSpinnerInputs({}, io, warnChecker());
    expect(resolution.spinners).toEqual([{ name: 'blocks-wave', svg: BLOCKS_WAVE_SVG }]);
    expect(resolution.warnings).toEqual([]);
  });

  test('includeDefaults: false + no customs = the empty set', async () => {
    const resolution = await resolveSpinnerInputs({ includeDefaults: false }, io, warnChecker());
    expect(resolution.spinners).toEqual([]);
  });

  test('a custom INLINE source joins the union after the built-in', async () => {
    const ring =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><animateTransform attributeName="transform" type="rotate" dur="1s" values="0 12 12;360 12 12" repeatCount="indefinite"/><circle cx="12" cy="12" r="8"/></svg>';
    const resolution = await resolveSpinnerInputs(
      { spinners: { 'my-ring': ring } },
      io,
      warnChecker(),
    );
    expect(resolution.spinners.map((spinner) => spinner.name)).toEqual([
      'blocks-wave',
      'my-ring',
    ]);
    expect(resolution.spinners[1]?.svg).toBe(ring);
  });

  test('a custom {file} source resolves from disk through the io context', async () => {
    const root = await freshFixture();
    const svgPath = join(root, 'ring.svg');
    await writeFile(
      svgPath,
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/></svg>',
      'utf8',
    );
    const resolution = await resolveSpinnerInputs(
      { spinners: { 'disk-loader': { file: svgPath } } },
      io,
      warnChecker(),
    );
    expect(resolution.spinners.map((spinner) => spinner.name)).toEqual([
      'blocks-wave',
      'disk-loader',
    ]);
    expect(resolution.spinners[1]?.svg).toContain('<circle cx="12" cy="12" r="8"/>');
  });

  test('same-name custom OVERRIDES the built-in in place, no duplicates (the icons override law)', async () => {
    const custom =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>';
    const resolution = await resolveSpinnerInputs(
      { spinners: { 'blocks-wave': custom } },
      io,
      warnChecker(),
    );
    expect(resolution.spinners).toHaveLength(1);
    expect(resolution.spinners[0]).toEqual({ name: 'blocks-wave', svg: custom });
  });
});

// ── safety (design §6 item d — the R2 pin) ─────────────────────────

describe('the RAW safety gate (R2: script rejected, animate allowed)', () => {
  test('the vendored SMIL artwork PASSES the reused icons checker (R2 pinned)', async () => {
    const resolution = await resolveSpinnerInputs({}, io, warnChecker());
    expect(resolution.spinners).toHaveLength(1);
    expect(resolution.warnings).toEqual([]);
  });

  test('an <animate>-carrying custom spinner passes too (no SMIL allowance needed — verified)', async () => {
    const smil =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="8"><animate attributeName="r" dur="0.6s" values="8;4;8" repeatCount="indefinite"/></circle></svg>';
    const resolution = await resolveSpinnerInputs(
      { includeDefaults: false, spinners: { pulse: smil } },
      io,
      warnChecker(),
    );
    expect(resolution.spinners).toHaveLength(1);
    expect(resolution.warnings).toEqual([]);
  });

  test('a <script>-carrying spinner is DROPPED with a named warning (warn mode)', async () => {
    const evil =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><script>alert(1)</script><circle cx="12" cy="12" r="8"/></svg>';
    const resolution = await resolveSpinnerInputs(
      { includeDefaults: false, spinners: { evil } },
      io,
      warnChecker(),
    );
    expect(resolution.spinners).toHaveLength(0);
    expect(resolution.warnings.join('\n')).toMatch(/safety check rejected spinner "evil"/);
    expect(resolution.warnings.join('\n')).toMatch(/disallowed element <script>/);
  });

  test('an event-handler attribute rejects too; error mode FAILS the build', async () => {
    const onload =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" onload="alert(1)"/></svg>';
    const dropped = await resolveSpinnerInputs(
      { includeDefaults: false, spinners: { 'on-load': onload } },
      io,
      warnChecker(),
    );
    expect(dropped.spinners).toHaveLength(0);
    expect(dropped.warnings.join('\n')).toMatch(/event-handler attribute/);

    const errorChecker = createSafetyChecker({ mode: 'error' });
    await expect(
      resolveSpinnerInputs(
        { includeDefaults: false, spinners: { 'on-load': onload } },
        io,
        errorChecker,
      ),
    ).rejects.toThrowError(/SVG safety check failed \(spinner "on-load"/);
  });

  test('error mode also fails the <script> spinner (never laundered)', async () => {
    const evil =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><script>alert(1)</script></svg>';
    await expect(
      resolveSpinnerInputs(
        { includeDefaults: false, spinners: { evil } },
        io,
        createSafetyChecker({ mode: 'error' }),
      ),
    ).rejects.toThrowError(/SVG safety check failed/);
  });
});

// ── structural validation ──────────────────────────────────────────

describe('structural validation (the extractor contract)', () => {
  test('no root viewBox → warn + drop (never reaches the pure core)', async () => {
    const noBox =
      '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="8"/></svg>';
    const resolution = await resolveSpinnerInputs(
      { includeDefaults: false, spinners: { nobox: noBox } },
      io,
      warnChecker(),
    );
    expect(resolution.spinners).toHaveLength(0);
    expect(resolution.warnings.join('\n')).toMatch(/nobox.*no root <svg … viewBox/s);
  });

  test('not svg at all → warn + drop', async () => {
    const resolution = await resolveSpinnerInputs(
      { includeDefaults: false, spinners: { junk: 'not svg' } },
      io,
      warnChecker(),
    );
    expect(resolution.spinners).toHaveLength(0);
    expect(resolution.warnings.join('\n')).toMatch(/junk.*no root/s);
  });

  test('structural failure in error mode throws', async () => {
    await expect(
      resolveSpinnerInputs(
        { includeDefaults: false, spinners: { junk: 'not svg' } },
        io,
        createSafetyChecker({ mode: 'error' }),
      ),
    ).rejects.toThrowError(/no root <svg … viewBox/);
  });
});
