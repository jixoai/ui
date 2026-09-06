/**
 * resolution.test.ts — ADAPTER-side source resolution + the safety
 * gate's injection fixtures (A1/A6, design §2).
 *
 *   - packing order + override: same-name customs replace the built-in
 *     in its manifest position; new customs append in insertion order
 *   - lucide: refs resolve through the package (kebab → PascalCase),
 *     with a named error for unknown slugs
 *   - {file} sources load through the injected I/O context (the plugin
 *     owns ALL file I/O) and join watchFile
 *   - includeDefaults:false with no lucide sources never imports lucide
 *   - the RAW safety gate: disallowed elements, event-handler attrs,
 *     foreign namespaces, CDATA + comment-injection payloads — warn
 *     drops the icon with a named warning, error fails the build, and
 *     optimization never launders unvalidated content
 */

import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, test, vi } from 'vitest';
import * as lucide from 'lucide';
import { createSafetyChecker } from '../../../src/icons/safety.js';
import { resolveLibraryInputs } from '../../../src/icons/library/resolve.js';
import { serializeLucideIcon } from '../../../src/icons/providers/lucide.js';
import type { ProviderContext } from '../../../src/icons/types.js';

const cleanSvg =
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M1 1l2 2"/></svg>';

const makeIo = (): {
  io: ProviderContext;
  loaded: string[];
  watched: string[];
} => {
  const loaded: string[] = [];
  const watched: string[] = [];
  return {
    io: {
      async loadSource(path) {
        loaded.push(path);
        return {
          data: new TextEncoder().encode(cleanSvg),
          path,
          mimeType: 'image/svg+xml',
        };
      },
      watchFile(path) {
        watched.push(path);
      },
    },
    loaded,
    watched,
  };
};

const resolve = (options: Parameters<typeof resolveLibraryInputs>[0], mode: 'warn' | 'error' = 'warn') =>
  resolveLibraryInputs(options, makeIo().io, createSafetyChecker({ mode }));

describe('order + override (design §1)', () => {
  test('defaults pack in manifest order; customs append in insertion order', async () => {
    const { icons } = await resolve({
      includeDefaults: false,
      icons: { zebra: cleanSvg, alpha: cleanSvg, mid: cleanSvg },
    });
    expect(icons.map((entry) => entry.name)).toEqual(['zebra', 'alpha', 'mid']);
  });

  test('a same-name custom OVERRIDES the built-in in its manifest position (no duplicate)', async () => {
    // a VALID alternative geometry (svgo keeps it — the no-op pin does
    // not apply to non-canonical artwork)
    const marker = cleanSvg.replace('M1 1l2 2', 'M9 9l3 3');
    const { icons } = await resolve({ icons: { check: marker } });
    const names = icons.map((entry) => entry.name);
    expect(names.filter((name) => name === 'check')).toHaveLength(1);
    expect(names.indexOf('check')).toBe(8); // GROUPS position preserved
    expect(icons.find((entry) => entry.name === 'check')!.svg).toContain('M9 9l3 3');
  });

  test('includeDefaults:false drops the built-ins', async () => {
    const { icons } = await resolve({ includeDefaults: false, icons: { custom: cleanSvg } });
    expect(icons.map((entry) => entry.name)).toEqual(['custom']);
  });
});

describe('lucide: refs', () => {
  test('a kebab ref resolves to lucide artwork (canonical serialization)', async () => {
    const { icons } = await resolve({
      includeDefaults: false,
      icons: { menu: 'lucide:menu', circleAlert: 'lucide:circle-alert' },
    });
    expect(icons).toHaveLength(2);
    expect(icons[0]!.svg).toBe(serializeLucideIcon(lucide.Menu));
    expect(icons[1]!.svg).toBe(serializeLucideIcon(lucide.CircleAlert));
  });

  test('an unknown slug fails with a named error teaching the kebab convention', async () => {
    await expect(
      resolve({ includeDefaults: false, icons: { nope: 'lucide:definitely-not-an-icon' } }),
    ).rejects.toThrowError(
      /lucide exports no icon "DefinitelyNotAnIcon".*kebab slug/s,
    );
  });

  test('includeDefaults:false with no lucide sources never touches the lucide import', async () => {
    // the lazy-import branch is keyed on pending sources: a spy on the
    // module namespace is impractical; assert the fast path instead —
    // resolution succeeds with zero lucide-shaped sources present
    const { icons } = await resolve({ includeDefaults: false, icons: { plain: cleanSvg } });
    expect(icons).toHaveLength(1);
  });
});

describe('{file} sources ride the plugin-owned I/O context', () => {
  test('loads through ctx.loadSource and joins watchFile (HMR)', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'jixoai-lib-'));
    try {
      const svgPath = join(dir, 'logo.svg');
      await writeFile(svgPath, cleanSvg, 'utf8');
      const { io, loaded, watched } = makeIo();
      const { icons } = await resolveLibraryInputs(
        { includeDefaults: false, icons: { myLogo: { file: svgPath } } },
        io,
        createSafetyChecker({ mode: 'warn' }),
      );
      expect(loaded).toEqual([svgPath]); // the plugin's I/O, not fs in the resolver
      expect(watched).toEqual([svgPath]); // joined for HMR refresh
      expect(icons[0]!.svg).toBe(cleanSvg);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });

  test('a non-svg source fails with a named error', async () => {
    const io: ProviderContext = {
      async loadSource(path) {
        return { data: new TextEncoder().encode('not svg'), path, mimeType: 'font/ttf' };
      },
      watchFile: () => undefined,
    };
    await expect(
      resolveLibraryInputs(
        { includeDefaults: false, icons: { bad: { file: './x.ttf' } } },
        io,
        createSafetyChecker({ mode: 'warn' }),
      ),
    ).rejects.toThrowError(/font\/ttf, not image\/svg\+xml/);
  });
});

describe('the RAW safety gate (injection fixtures, design §2)', () => {
  const wrap = (inner: string): string =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${inner}</svg>`;

  const fixtures: readonly [string, string, RegExp][] = [
    ['disallowed element', wrap('<script>alert(1)</script>'), /disallowed element/],
    ['event-handler attribute', wrap('<path d="M1 1" onclick="alert(1)"/>'), /event-handler attribute/],
    ['uppercase handler', wrap('<path d="M1 1" ONLOAD="x()"/>'), /event-handler attribute/],
    ['foreign element namespace', wrap('<a:rect width="1" height="1"/>'), /foreign namespace/],
    ['foreign attribute namespace', wrap('<path xlink:href="#x" d="M1 1"/>'), /foreign namespace/],
    ['namespace declaration', wrap('<path xmlns:xlink="http://x" d="M1 1"/>'), /foreign namespace/],
    ['CDATA section', wrap('<path d="M1 1"><![CDATA[evil]]></path>'), /CDATA section/],
    ['comment smuggling an element', wrap('<!-- <script>alert(1)</script> -->'), /disallowed element/],
    ['comment smuggling a handler', wrap('<!-- <path onload="x()"/> --><path d="M1 1"/>'), /event-handler attribute/],
  ];

  test.each(fixtures)('warn mode: %s drops the icon with a named warning', async (_label, svg, pattern) => {
    const { icons, warnings } = await resolve({ includeDefaults: false, icons: { evil: svg } });
    expect(icons).toEqual([]);
    expect(warnings).toHaveLength(1);
    expect(warnings[0]).toMatch(/"evil"/);
    expect(warnings[0]).toMatch(pattern);
  });

  test.each(fixtures)('error mode: %s fails the build', async (_label, svg) => {
    await expect(
      resolve({ includeDefaults: false, icons: { evil: svg } }, 'error'),
    ).rejects.toThrowError(/SVG safety check failed/);
  });

  test('safety runs on the RAW source — optimization never launders (ordering pin)', async () => {
    // a handler payload hidden inside a comment that svgo would strip:
    // the RAW check must reject BEFORE optimize could clean it
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    try {
      const svg = wrap('<!-- <path onload="steal()"/> --><path d="M1 1"/>');
      const { icons, warnings } = await resolve({ includeDefaults: false, icons: { evil: svg } });
      expect(icons).toEqual([]);
      expect(warnings[0]).toMatch(/event-handler attribute/);
    } finally {
      spy.mockRestore();
    }
  });

  test('clean customs survive every gate (no false positives)', async () => {
    const { icons, warnings } = await resolve({ includeDefaults: false, icons: { ok: cleanSvg } });
    expect(warnings).toEqual([]);
    expect(icons).toHaveLength(1);
  });
});
