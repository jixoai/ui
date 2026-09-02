/**
 * ink-equivalence.test.ts — the cross-package BYTE lock (icons-docs
 * ICON-3, 2026-09-02).
 *
 * HOW THE COMPARISON IS PINNED (three sides, all in one suite):
 *
 *  1. the PORT — src/icons/ink.ts baking the REAL lucide provider's
 *     SvgAsset strings (the production path, no synthetic fixtures);
 *  2. the SOURCE LAW — css-laws' own iconUri, imported LIVE from
 *     ../../../css-laws/src/icon-uris.ts (a test-only cross-package
 *     import; the package itself stays css-laws-free by law);
 *  3. the FROZEN BYTES — the sheet fixtures imported LIVE from
 *     ../../../css-laws/test/icon-uri-fixtures.ts. invalid-ink's
 *     fixture there still carries the retired hand-drawn exclamation,
 *     so its byte anchors are copied verbatim from css-laws'
 *     icon-uris.test.ts (where the sanctioned CircleAlert swap lives).
 *
 * For the default lucide glyphs (calendar / clock / check /
 * circle-alert) all three sides must agree byte-for-byte, at both inks
 * and the quartet's forced weights. Drift in lucide, in css-laws, or
 * in the port fails this suite BEFORE anything ships.
 *
 * The suite also carries the derived-matrix spec (icons-docs §1):
 * 9 concept slots → the 11 sheet vocabulary variables fully covered,
 * plus the palette override variable — and covering ONE concept bakes
 * its whole ink family from the same asset (a mixed plain/ink pair
 * cannot occur).
 */
import { describe, expect, it } from 'vitest';
import type { Plugin } from 'vite';

import { iconUri, jxGlyphs } from '../../../css-laws/src/icon-uris.ts';
import {
  committedDarkVars,
  committedPaletteMask,
  committedRootVars,
} from '../../../css-laws/test/icon-uri-fixtures.ts';

import { bakeInkUri } from '../../src/icons/ink.js';
import { lucideIconProvider } from '../../src/icons/providers/lucide.js';
import { createIconPlugin, VIRTUAL_MODULE_ID } from '../../src/icons/vite-plugin.js';
import type {
  IconProvider,
  IconProviderFactory,
  ProviderContext,
  SvgAsset,
} from '../../src/icons/types.js';

// ── byte anchors (copied verbatim — see the header) ────────────────

/** the sanctioned invalid-ink swap: lucide CircleAlert at sw 2.5.
 * B3 (2026-09-02): the anchor is the css-laws FIXTURE itself (re-extracted
 * from the sheet) — the copied literals are gone from this suite too */
const circleAlertBlack = committedRootVars['--jx-icon-invalid-ink'];
const circleAlertWhite = committedDarkVars['--jx-icon-invalid-ink'];

/** the palette glyph's own URI, extracted from the committed mask paint */
const paletteMaskUri = /url\("data:image\/svg\+xml,[^"]*"\)/.exec(committedPaletteMask)?.[0];

// ── the production-path assets (the real lucide provider) ──────────

const stubContext = (): ProviderContext => ({
  loadSource: () => {
    throw new Error('unexpected loadSource — the lucide provider does no I/O');
  },
  watchFile: () => {
    throw new Error('unexpected watchFile — the lucide provider does no I/O');
  },
});

/** the default provider's asset for one slot (throws when unserved) */
async function providerAsset(slot: 'calendar' | 'clock' | 'check' | 'invalid' | 'palette'): Promise<string> {
  const provider = await lucideIconProvider()(stubContext());
  const asset = provider.getIcon(slot);
  if (asset === null) throw new Error(`lucide provider did not serve "${slot}"`);
  return asset.svg;
}

// ── the lock: port === source law === frozen bytes ─────────────────

describe('ink-baking equivalence: the port vs css-laws vs the frozen sheet bytes', () => {
  const WHITE = '#fff' as const;

  /** the ink quartet: slot → glyph, forced weight, fixture key */
  const QUARTET = [
    { slot: 'calendar', glyph: 'calendar', strokeWidth: 2, key: '--jx-icon-calendar-ink' },
    { slot: 'clock', glyph: 'clock', strokeWidth: 2, key: '--jx-icon-clock-ink' },
    { slot: 'check', glyph: 'check', strokeWidth: 2.5, key: '--jx-icon-valid-ink' },
    { slot: 'invalid', glyph: 'circle-alert', strokeWidth: 2.5, key: '--jx-icon-invalid-ink' },
  ] as const;

  for (const { slot, glyph, strokeWidth, key } of QUARTET) {
    it(`${slot} → ${key}: port === iconUri === committed bytes, both inks`, async () => {
      const svg = await providerAsset(slot);

      const portBlack = bakeInkUri(svg, { strokeWidth });
      expect(portBlack).toBe(iconUri(jxGlyphs[glyph], { strokeWidth }));
      expect(portBlack).toBe(committedRootVars[key]);

      const portWhite = bakeInkUri(svg, { ink: WHITE, strokeWidth });
      expect(portWhite).toBe(iconUri(jxGlyphs[glyph], { ink: WHITE, strokeWidth }));
      expect(portWhite).toBe(committedDarkVars[key]);
    });
  }

  it('plain slots: the default bake (black, own weight) is the sheet plain byte form', async () => {
    // lucide's own weight is 2 — the source law's forced 2 and the
    // port's preserved 2 must produce identical bytes
    const calendar = await providerAsset('calendar');
    expect(bakeInkUri(calendar)).toBe(iconUri(jxGlyphs.calendar));
    expect(bakeInkUri(calendar)).toBe(committedRootVars['--jx-icon-calendar']);

    // check plain rides the live dual-run; the frozen fixture gains the
    // line when the css-laws batch re-freezes (conditional keeps either
    // batch state green, and the live compare is unconditional)
    const check = await providerAsset('check');
    expect(bakeInkUri(check)).toBe(iconUri(jxGlyphs.check));
    const checkFixture = committedRootVars['--jx-icon-check'];
    if (checkFixture !== undefined) expect(bakeInkUri(check)).toBe(checkFixture);
  });

  it('palette: the fill-dots rule reproduces the committed mask URI', async () => {
    const svg = await providerAsset('palette');
    expect(bakeInkUri(svg)).toBe(iconUri(jxGlyphs.palette));
    expect(paletteMaskUri).toBeDefined();
    expect(bakeInkUri(svg)).toBe(paletteMaskUri);
  });
});

// ── the derived-matrix spec through the plugin (9 concepts → 11 vars) ──

interface PluginLifecycle {
  buildStart(): Promise<void>;
  resolveId(id: string, importer?: string): string | null | undefined;
  load(id: string): Promise<string | null>;
}

const lifecycle = (plugin: Plugin): PluginLifecycle => plugin as unknown as PluginLifecycle;

const loadVirtualCss = async (factory: IconProviderFactory): Promise<string> => {
  const plugin = createIconPlugin({ icons: factory });
  const { buildStart, resolveId, load } = lifecycle(plugin);
  await buildStart();
  const resolved = resolveId(VIRTUAL_MODULE_ID, '/app/src/app.css');
  expect(resolved).toBeTruthy();
  const css = await load(resolved!);
  expect(css).toBeTruthy();
  return css!;
};

/** parse `--jx-icon-*: url(...);` declarations out of one css region */
const declarationsOf = (region: string): Map<string, string> => {
  const vars = new Map<string, string>();
  for (const match of region.matchAll(/^\s+(--jx-icon-[a-z-]+): (url\(.*\));$/gm)) {
    vars.set(match[1]!, match[2]!);
  }
  return vars;
};

describe('the derived matrix: 9 concept slots → the 11 vocabulary variables', () => {
  it('the default provider covers every vocabulary variable with the sheet\'s own bytes', async () => {
    const css = await loadVirtualCss(lucideIconProvider());

    // the :root block rides @layer theme; .dark/.jx-light follow unlayered
    expect(css).toContain('@layer theme {');
    const root = declarationsOf(css.slice(css.indexOf('  :root {'), css.indexOf('\n  }\n}')));
    const darkRegion = css.slice(css.indexOf('.dark {'), css.indexOf('.jx-light {'));
    const dark = declarationsOf(darkRegion);
    const light = declarationsOf(css.slice(css.indexOf('.jx-light {')));

    // :root — 11 sheet vocabulary vars + the palette override var
    expect([...root.keys()].sort()).toEqual(
      [
        '--jx-icon-calendar', '--jx-icon-calendar-ink',
        '--jx-icon-clock', '--jx-icon-clock-ink',
        '--jx-icon-chevron', '--jx-icon-clear',
        '--jx-icon-mail', '--jx-icon-search',
        '--jx-icon-check', '--jx-icon-valid-ink',
        '--jx-icon-invalid-ink',
        '--jx-icon-palette',
      ].sort(),
    );
    // invalid is ink-only — no plain variable exists
    expect(root.has('--jx-icon-invalid')).toBe(false);

    // :root values ARE the sheet's frozen bytes (palette = the mask URI)
    for (const key of [
      '--jx-icon-calendar', '--jx-icon-clock', '--jx-icon-mail',
      '--jx-icon-search', '--jx-icon-chevron', '--jx-icon-clear',
      '--jx-icon-calendar-ink', '--jx-icon-clock-ink', '--jx-icon-valid-ink',
    ]) {
      expect(root.get(key), `${key} :root`).toBe(committedRootVars[key]);
    }
    expect(root.get('--jx-icon-invalid-ink')).toBe(circleAlertBlack);
    expect(root.get('--jx-icon-palette')).toBe(paletteMaskUri);
    const checkFixture = committedRootVars['--jx-icon-check'];
    if (checkFixture !== undefined) expect(root.get('--jx-icon-check')).toBe(checkFixture);

    // .dark — the 11 flipping vars (palette sits out: mask + currentColor)
    expect(dark.has('--jx-icon-palette')).toBe(false);
    expect(dark.size).toBe(11);
    for (const key of [
      '--jx-icon-calendar', '--jx-icon-clock', '--jx-icon-mail',
      '--jx-icon-search', '--jx-icon-chevron', '--jx-icon-clear',
      '--jx-icon-calendar-ink', '--jx-icon-clock-ink', '--jx-icon-valid-ink',
    ]) {
      expect(dark.get(key), `${key} .dark`).toBe(committedDarkVars[key]);
      expect(dark.get(key)).toContain("stroke='%23fff'");
    }
    expect(dark.get('--jx-icon-invalid-ink')).toBe(circleAlertWhite);
    const checkDark = committedDarkVars['--jx-icon-check'];
    if (checkDark !== undefined) expect(dark.get('--jx-icon-check')).toBe(checkDark);

    // .jx-light mirrors .dark at black ink — byte-identical to :root
    for (const [key, value] of dark) {
      expect(light.get(key), `${key} .jx-light`).toBe(root.get(key));
      expect(value).toBe(root.get(key)?.replace("stroke='%23000'", "stroke='%23fff'"));
    }
  });

  it('covering calendar bakes calendar AND calendar-ink from the SAME asset (mixing impossible)', async () => {
    const marker = 'MARK9';
    const svg =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="${marker}"/></svg>`;
    const calendarOnly: IconProvider = {
      getIcon: (slot) => (slot === 'calendar' ? {
        svg,
        viewBox: { width: 24, height: 24 },
        nature: 'stroke',
        source: { kind: 'inline' },
      } satisfies SvgAsset : null),
    };

    const css = await loadVirtualCss(async () => calendarOnly);
    const root = declarationsOf(css.slice(css.indexOf('  :root {'), css.indexOf('\n  }\n}')));

    // only the covered concept's family appears — nothing else leaks in
    expect([...root.keys()].sort()).toEqual(['--jx-icon-calendar', '--jx-icon-calendar-ink']);

    // both values bake from the same asset: same geometry, literal ink
    expect(root.get('--jx-icon-calendar')).toContain(`d='${marker}'`);
    expect(root.get('--jx-icon-calendar')).toContain("stroke='%23000'");
    expect(root.get('--jx-icon-calendar-ink')).toContain(`d='${marker}'`);

    // the dark matrix follows the same asset to white ink
    const darkRegion = css.slice(css.indexOf('.dark {'), css.indexOf('.jx-light {'));
    const dark = declarationsOf(darkRegion);
    expect([...dark.keys()].sort()).toEqual(['--jx-icon-calendar', '--jx-icon-calendar-ink']);
    expect(dark.get('--jx-icon-calendar-ink')).toContain(`d='${marker}'`);
    expect(dark.get('--jx-icon-calendar-ink')).toContain("stroke='%23fff'");
  });
});
