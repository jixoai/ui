/**
 * presets.test.ts — the preset machinery (A1–A4, openspec
 * icon-library-presets design §1 / spec delta).
 *
 *   - registry + normalization: the string shorthand = frozen defaults;
 *     the object form carries per-preset knobs; already-normalized
 *     instances pass through (idempotence); unknown ids fail by name
 *   - the enabled-prefix law: `fa:home` (unknown) and `md:home` with the
 *     material preset NOT enabled both fail at CONFIG validation,
 *     naming the reference and the enabled prefixes
 *   - peer resolution (real packages in devDeps): every shipped preset
 *     resolves a REAL icon to an ABSOLUTE peer path, the adapter reads
 *     that path through ctx.loadSource + watchFile (frozen principle
 *     #4), and the shared pipeline yields {v,n,d} with per-icon nature
 *     detection (fill families; the extractor decides per icon)
 *   - the loud-fail laws: absent peer → the npm install line; installed
 *     peer + missing icon → the named not-found error (both through the
 *     REAL resolvePeerFile, not a mock)
 */

import { readFile } from 'node:fs/promises';
import { isAbsolute } from 'node:path';
import { describe, expect, test } from 'vitest';
import { createSafetyChecker } from '../../../src/icons/safety.js';
import { normalizeLibraryOptions } from '../../../src/icons/library/config.js';
import {
  MATERIAL_DEFAULTS,
  PRESET_IDS,
  normalizeIconPresets,
  resolvePeerFile,
} from '../../../src/icons/library/presets/index.js';
import { materialPreset } from '../../../src/icons/library/presets/material.js';
import { phosphorPreset } from '../../../src/icons/library/presets/phosphor.js';
import { remixPreset } from '../../../src/icons/library/presets/remix.js';
import { extractIconData } from '../../../src/icons/library/generate.js';
import { resolveLibraryInputs } from '../../../src/icons/library/resolve.js';
import type { ProviderContext, SourceDescriptor } from '../../../src/icons/types.js';

// ── the plugin's REAL I/O twin (fs-backed, mime-sniffing like loadSource) ──

/** mime-detect an svg by content head (the plugin's looksLikeSvg law) */
const isSvgHead = (data: Uint8Array): boolean => {
  const head = Buffer.from(data.buffer, data.byteOffset, Math.min(data.byteLength, 1024)).toString('latin1');
  return /^<svg[\s>]/i.test(head.trimStart());
};

const fsIo = (): { io: ProviderContext; loaded: string[]; watched: string[] } => {
  const loaded: string[] = [];
  const watched: string[] = [];
  return {
    io: {
      async loadSource(path) {
        loaded.push(path);
        const data = new Uint8Array(await readFile(path));
        const mimeType = isSvgHead(data) ? 'image/svg+xml' : 'application/octet-stream';
        const descriptor: SourceDescriptor = { data, path, mimeType };
        return descriptor;
      },
      watchFile(path) {
        watched.push(path);
      },
    },
    loaded,
    watched,
  };
};

describe('registry + normalization (A1)', () => {
  test('the string shorthand builds the frozen defaults', () => {
    // (instances carry closures — compare the contract fields, then the
    // resolveFile mapping through a real resolution below)
    expect(normalizeIconPresets(['material'])).toMatchObject([
      { id: 'material', prefix: 'md', peerPackage: '@material-symbols/svg-400', defaultsNote: materialPreset().defaultsNote },
    ]);
    expect(normalizeIconPresets(['phosphor'])).toMatchObject([
      { id: 'phosphor', prefix: 'ph', peerPackage: '@phosphor-icons/core', defaultsNote: phosphorPreset().defaultsNote },
    ]);
    expect(normalizeIconPresets(['remix'])).toMatchObject([
      { id: 'remix', prefix: 'rx', peerPackage: 'remixicon', defaultsNote: remixPreset().defaultsNote },
    ]);
    expect(typeof normalizeIconPresets(['material'])[0]!.resolveFile).toBe('function');
    expect(normalizeIconPresets(undefined)).toEqual([]);
    expect(PRESET_IDS).toEqual(['material', 'phosphor', 'remix']);
  });

  test('material defaults are frozen: outlined / weight 400 / FILL 0', () => {
    expect(MATERIAL_DEFAULTS).toEqual({ weight: 400, style: 'outlined', fill: false });
    const preset = materialPreset();
    expect(preset.id).toBe('material');
    expect(preset.prefix).toBe('md');
    expect(preset.peerPackage).toBe('@material-symbols/svg-400');
    expect(preset.defaultsNote).toContain('outlined');
    expect(preset.defaultsNote).toContain('400');
  });

  test('the object form carries the knobs (weight picks the peer package)', () => {
    const rounded = materialPreset({ weight: 400, style: 'rounded', fill: true });
    expect(rounded.peerPackage).toBe('@material-symbols/svg-400');
    expect(rounded.resolveFile('home')).toMatch(/\/rounded\/home-fill\.svg$/);
    const heavy = materialPreset({ weight: 700 });
    expect(heavy.peerPackage).toBe('@material-symbols/svg-700');
    const phFill = phosphorPreset({ weight: 'fill' });
    expect(phFill.resolveFile('atom')).toMatch(/\/assets\/fill\/atom-fill\.svg$/);
  });

  test('already-normalized instances pass through untouched (idempotence)', () => {
    const built = materialPreset({ style: 'rounded' });
    expect(normalizeIconPresets([built])).toEqual([built]);
    // the double normalize the vite adapter performs keeps custom knobs
    const normalized = normalizeLibraryOptions({ presets: [built] });
    expect(normalizeLibraryOptions(normalized).presets).toEqual([built]);
  });

  test('unknown preset ids fail with the named teaching error', () => {
    expect(() => normalizeIconPresets(['fontawesome' as never])).toThrowError(
      /"fontawesome" is not a shipped preset.*"material", "phosphor", "remix"/s,
    );
    expect(() => normalizeIconPresets([{ id: 'tabler' as never }])).toThrowError(
      /"tabler" is not a shipped preset/,
    );
  });

  test('a duplicate preset id fails by name — one entry per id (codex r1 m3)', () => {
    expect(() => normalizeIconPresets(['material', 'material'])).toThrowError(
      /declares "material" twice \("material" \(shorthand\) and "material" \(shorthand\)\)/,
    );
    expect(() => normalizeIconPresets(['material', { id: 'material', weight: 500 }])).toThrowError(
      /declares "material" twice \("material" \(shorthand\) and "material" \(object form\)\)/,
    );
  });

  test('two presets sharing a prefix fail by name — each prefix names one preset', () => {
    const impostor = { ...phosphorPreset(), prefix: 'md' as const };
    expect(() => normalizeIconPresets(['material', impostor])).toThrowError(
      /gives the prefix "md:" to two presets \("material" \(shorthand\) and "phosphor" \(instance\)\)/,
    );
  });
});

describe('the enabled-prefix law (config validation)', () => {
  test('an unknown prefix fails at validation naming the reference + enabled set', () => {
    expect(() =>
      normalizeLibraryOptions({ includeDefaults: false, icons: { x: 'fa:home' } }),
    ).toThrowError(
      /"x" references "fa:home".*neither lucide: nor an enabled preset.*Enabled prefixes: lucide:/s,
    );
  });

  test('a disabled preset prefix fails the same way; enabling fixes it', () => {
    expect(() =>
      normalizeLibraryOptions({ includeDefaults: false, icons: { home: 'md:home' } }),
    ).toThrowError(/prefix "md:" is neither lucide: nor an enabled preset.*library\.presets/s);
    expect(() =>
      normalizeLibraryOptions({
        presets: ['material'],
        includeDefaults: false,
        icons: { home: 'md:home' },
      }),
    ).not.toThrow();
  });

  test('non-ref strings never trip the law (inline literals stay inline)', () => {
    expect(() =>
      normalizeLibraryOptions({
        includeDefaults: false,
        icons: { logo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"/>' },
      }),
    ).not.toThrow();
  });
});

describe('peer resolution — the REAL packages (A2/A3/A4)', () => {
  // [label, presets config, the ref under test, the resolved file pattern]
  type PresetsConfig = NonNullable<Parameters<typeof resolveLibraryInputs>[0]['presets']>;
  const cases: ReadonlyArray<readonly [string, PresetsConfig, string, RegExp]> = [
    ['material (md:) — outlined weight-400 FILL-0', ['material'], 'md:home', /@material-symbols\/svg-[0-9]+\/outlined\/home\.svg$/],
    ['material object form — rounded + fill', [{ id: 'material', style: 'rounded', fill: true }], 'md:home', /@material-symbols\/svg-[0-9]+\/rounded\/home-fill\.svg$/],
    ['phosphor (ph:) — default regular weight', ['phosphor'], 'ph:atom', /@phosphor-icons\/core\/assets\/regular\/atom\.svg$/],
    ['phosphor object form — fill weight', [{ id: 'phosphor', weight: 'fill' }], 'ph:atom', /@phosphor-icons\/core\/assets\/fill\/atom-fill\.svg$/],
    ['remix (rx:) — category-prefixed name', ['remix'], 'rx:system:add-line', /remixicon\/icons\/System\/add-line\.svg$/],
  ];

  test.each(cases)('%s resolves a real icon through the shared pipeline', async (_label, presetOptions, source, file) => {
    const { io, loaded, watched } = fsIo();
    const { icons, warnings } = await resolveLibraryInputs(
      { includeDefaults: false, presets: presetOptions, icons: { custom: source } },
      io,
      createSafetyChecker({ mode: 'warn' }),
    );
    expect(warnings).toEqual([]);
    expect(icons).toHaveLength(1);

    // resolveFile → ABSOLUTE peer path; the adapter READ it through the
    // context and joined it for HMR (frozen principle #4)
    expect(loaded).toHaveLength(1);
    expect(isAbsolute(loaded[0]!)).toBe(true);
    expect(loaded[0]).toMatch(file);
    expect(watched).toEqual(loaded);

    // {v,n,d} shape + per-icon nature (fill families → fill nature)
    const data = extractIconData(icons[0]!.svg);
    expect(data.v).toMatch(/^\d/);
    expect(data.n).toBe('fill');
    expect(data.d.length).toBeGreaterThan(0);
    expect(data.d).toContain('<path');
  });

  test('material artwork keeps its own viewBox (0 -960 960 960) — geometry law', async () => {
    const { io } = fsIo();
    const { icons } = await resolveLibraryInputs(
      { includeDefaults: false, presets: ['material'], icons: { home: 'md:home' } },
      io,
      createSafetyChecker({ mode: 'warn' }),
    );
    expect(extractIconData(icons[0]!.svg).v).toBe('0 -960 960 960');
  });

  test('preset icons pack alongside built-ins in config insertion order', async () => {
    const { io } = fsIo();
    const { icons } = await resolveLibraryInputs(
      { presets: ['material'], icons: { mdHome: 'md:home' } },
      io,
      createSafetyChecker({ mode: 'warn' }),
    );
    // the 38 built-ins untouched, the preset icon appended (override law)
    expect(icons).toHaveLength(39);
    expect(icons[37]!.name).toBe('type'); // the manifest's frozen last entry
    expect(icons[38]!.name).toBe('mdHome');
  });
});

describe('the loud-fail laws (the lucide precedent)', () => {
  test('an absent peer names the npm install line (real resolution, bogus package)', () => {
    expect(() => resolvePeerFile('@material-symbols/svg-not-a-weight', 'outlined/home.svg')).toThrowError(
      /"@material-symbols\/svg-not-a-weight" is not installed.*npm i @material-symbols\/svg-not-a-weight/s,
    );
  });

  test('an installed peer + missing icon fails by name', () => {
    expect(() =>
      materialPreset().resolveFile('definitely-not-an-icon'),
    ).toThrowError(
      /installed but has no icon file "outlined\/definitely-not-an-icon\.svg"/s,
    );
  });

  test('remix refs without the category prefix teach the taxonomy', () => {
    expect(() => remixPreset().resolveFile('add-line')).toThrowError(
      /carry their category prefix.*rx:system:add-line/s,
    );
  });
});
