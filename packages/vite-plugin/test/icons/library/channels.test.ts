/**
 * channels.test.ts — the channel machinery (A1–A3, openspec
 * icon-channel-api design §0/§1 / spec delta; the presets-era contract
 * carried verbatim onto the new base).
 *
 *   - defineIconChannel: the grammar laws (prefix /^[a-z][a-z0-9]*$/,
 *     id /^[a-z][a-z0-9-]*$/), the reserved `lucide` prefix + id, the
 *     missing-resolveFile teaching error, and the ALWAYS-file-kind
 *     resolver (the lucide kind cannot be forged through the factory)
 *   - the shipped factories (md/ph/rx): frozen defaults preserved
 *     verbatim from the presets era (weight/style/fill knobs pick the
 *     peer package + the path inside it)
 *   - normalizeIconChannels: set-level uniqueness fails by name naming
 *     both entries; hand-forged smuggles (grammar, the reserved lucide
 *     resolver kind) fail by name; instances pass through (idempotence)
 *   - the enabled-prefix law: `fa:home` (unknown) and `md:home` with
 *     the material channel NOT registered both fail at CONFIG
 *     validation, naming the reference and the enabled prefixes
 *   - channel resolution (real packages in devDeps): every shipped
 *     channel resolves a REAL icon to an ABSOLUTE peer path, the
 *     adapter reads that path through ctx.loadSource + watchFile
 *     (frozen principle #4), and the shared pipeline yields {v,n,d}
 *     with per-icon nature detection
 *   - the loud-fail laws: absent peer → the npm install line; installed
 *     peer + missing icon → the named not-found error (both through the
 *     REAL resolvePeerFile, not a mock)
 */

import { readFile } from 'node:fs/promises';
import { isAbsolute } from 'node:path';
import { describe, expect, test } from 'vitest';
import { createSafetyChecker } from '../../../src/icons/safety.js';
import { normalizeLibraryOptions } from '../../../src/icons/library/config.js';
import { defineIconChannel } from '../../../src/icons/library/channel/define.js';
import { resolvePeerFile } from '../../../src/icons/library/channel/peer.js';
import { normalizeIconChannels } from '../../../src/icons/library/channel/normalize.js';
import { md, MATERIAL_DEFAULTS } from '../../../src/icons/library/channel/material.js';
import { ph, PHOSPHOR_DEFAULTS } from '../../../src/icons/library/channel/phosphor.js';
import { rx } from '../../../src/icons/library/channel/remix.js';
import { lucideChannel } from '../../../src/icons/library/channel/lucide.js';
import type { IconChannel } from '../../../src/icons/library/channel/types.js';
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

describe('defineIconChannel — the public base (A1)', () => {
  test('builds a file-kind channel from a legal spec (the myco: scenario)', () => {
    const resolveFile = (ref: string): string => `/peer/svgs/${ref}.svg`;
    const myco = defineIconChannel({
      id: 'myco',
      prefix: 'myco',
      peerPackage: 'my-icons',
      resolveFile,
      defaultsNote: 'my-icons svgs/',
    });
    expect(myco.id).toBe('myco');
    expect(myco.prefix).toBe('myco');
    expect(myco.peerPackage).toBe('my-icons');
    expect(myco.resolver.kind).toBe('file');
    expect((myco.resolver as { resolveFile: (ref: string) => string }).resolveFile).toBe(resolveFile);
    expect(myco.defaultsNote).toBe('my-icons svgs/');
    // the resolver answers refs through the given mapping
    expect((myco.resolver as { resolveFile: (ref: string) => string }).resolveFile('logo')).toBe(
      '/peer/svgs/logo.svg',
    );
  });

  test('the prefix grammar: lowercase-led alphanumeric words only', () => {
    expect(() => defineIconChannel({ id: 'x', prefix: 'Myco', resolveFile: () => '' })).toThrowError(
      /prefix "Myco" is illegal.*\/\^\[a-z\]\[a-z0-9\]\*\$\//s,
    );
    expect(() => defineIconChannel({ id: 'x', prefix: 'my-co', resolveFile: () => '' })).toThrowError(
      /prefix "my-co" is illegal/s,
    );
  });

  test('the reserved lucide prefix + id fail with the teaching error', () => {
    expect(() => defineIconChannel({ id: 'mine', prefix: 'lucide', resolveFile: () => '' })).toThrowError(
      /prefix "lucide" is reserved.*default-registered channel/s,
    );
    expect(() => defineIconChannel({ id: 'lucide', prefix: 'mine', resolveFile: () => '' })).toThrowError(
      /channel id "lucide" is reserved/s,
    );
  });

  test('the id grammar + the missing-resolveFile teaching error', () => {
    expect(() => defineIconChannel({ id: 'Myco', prefix: 'myco', resolveFile: () => '' })).toThrowError(
      /channel id "Myco" is illegal.*\/\^\[a-z\]\[a-z0-9-\]\*\$\//s,
    );
    expect(() =>
      defineIconChannel({ id: 'myco', prefix: 'myco', resolveFile: undefined as unknown as () => string }),
    ).toThrowError(/"myco" needs a resolveFile\(ref\) function/s);
  });
});

describe('the shipped factories — defaults preserved verbatim (A2)', () => {
  test('material defaults are frozen: outlined / weight 400 / FILL 0', () => {
    expect(MATERIAL_DEFAULTS).toEqual({ weight: 400, style: 'outlined', fill: false });
    const channel = md();
    expect(channel.id).toBe('material');
    expect(channel.prefix).toBe('md');
    expect(channel.peerPackage).toBe('@material-symbols/svg-400');
    expect(channel.defaultsNote).toContain('outlined');
    expect(channel.defaultsNote).toContain('400');
    expect(channel.resolver.kind).toBe('file');
  });

  test('the knobs carry (weight picks the peer package, style/fill the path)', () => {
    const rounded = md({ weight: 400, style: 'rounded', fill: true });
    expect(rounded.peerPackage).toBe('@material-symbols/svg-400');
    expect((rounded.resolver as { resolveFile: (ref: string) => string }).resolveFile('home')).toMatch(
      /\/rounded\/home-fill\.svg$/,
    );
    const heavy = md({ weight: 700 });
    expect(heavy.peerPackage).toBe('@material-symbols/svg-700');
    const phFill = ph({ weight: 'fill' });
    expect((phFill.resolver as { resolveFile: (ref: string) => string }).resolveFile('atom')).toMatch(
      /\/assets\/fill\/atom-fill\.svg$/,
    );
    expect(PHOSPHOR_DEFAULTS).toEqual({ weight: 'regular' });
    expect(ph().peerPackage).toBe('@phosphor-icons/core');
    expect(rx().prefix).toBe('rx');
    expect(rx().peerPackage).toBe('remixicon');
  });

  test('the lucide channel instance: reserved kind, pure data', () => {
    expect(lucideChannel).toEqual({
      id: 'lucide',
      prefix: 'lucide',
      peerPackage: 'lucide',
      resolver: { kind: 'lucide' },
      defaultsNote: lucideChannel.defaultsNote,
    });
    expect(lucideChannel.defaultsNote).toContain('38-name');
  });
});

describe('normalizeIconChannels — the set-level laws (A1/A3)', () => {
  test('instances pass through untouched (idempotence)', () => {
    const built = md({ style: 'rounded' });
    expect(normalizeIconChannels([built])).toEqual([built]);
    // the double normalize the vite adapter performs keeps custom knobs
    const normalized = normalizeLibraryOptions({ channels: [built] });
    expect(normalizeLibraryOptions(normalized).channels).toEqual([built]);
    expect(normalizeIconChannels(undefined)).toEqual([]);
  });

  test('a duplicate channel id fails by name — one entry per id (the spec scenario)', () => {
    expect(() => normalizeIconChannels([md(), md({ weight: 500 })])).toThrowError(
      /library\.channels declares the id "material" twice \("material" \(md:\) and "material" \(md:\)\)/,
    );
  });

  test('two channels sharing a prefix fail by name — each prefix names one channel', () => {
    const impostor: IconChannel = { ...ph(), prefix: 'md' };
    expect(() => normalizeIconChannels([md(), impostor])).toThrowError(
      /library\.channels gives the prefix "md:" to two channels \("material" \(md:\) and "phosphor" \(md:\)\)/,
    );
  });

  test('hand-forged smuggles fail by name (grammar + the reserved resolver kind)', () => {
    expect(() =>
      normalizeIconChannels([{ id: 'mine', prefix: 'lucide', resolver: { kind: 'lucide' } }]),
    ).toThrowError(/prefix "lucide" is reserved/);
    expect(() =>
      normalizeIconChannels([{ id: 'mine', prefix: 'mine', resolver: { kind: 'lucide' } }]),
    ).toThrowError(/"mine" claims the reserved lucide resolver kind/s);
    expect(() =>
      normalizeIconChannels([{ id: 'mine', prefix: 'mine', resolver: { kind: 'file' } } as unknown as IconChannel]),
    ).toThrowError(/"mine" resolver is file-kind but carries no resolveFile/s);
    expect(() => normalizeIconChannels(['material' as unknown as IconChannel])).toThrowError(
      /library\.channels entries must be channel instances.*defineIconChannel/s,
    );
  });

  test('hand-forged metadata fails by name too (the factory checks mirrored, diff-r1 m1)', () => {
    const forged = (extra: Record<string, unknown>): IconChannel =>
      ({
        id: 'mine',
        prefix: 'mine',
        resolver: { kind: 'file', resolveFile: () => '/dev/null' },
        ...extra,
      }) as unknown as IconChannel;
    expect(() => normalizeIconChannels([forged({ peerPackage: 42 })])).toThrowError(
      /"mine" peerPackage must be a string when present.*install-hint/s,
    );
    expect(() => normalizeIconChannels([forged({ defaultsNote: {} })])).toThrowError(
      /"mine" defaultsNote must be a string when present/,
    );
    // well-typed optional metadata still passes (the factory twins do)
    expect(() =>
      normalizeIconChannels([forged({ peerPackage: 'my-icons', defaultsNote: 'regular' })]),
    ).not.toThrow();
  });
});

describe('the enabled-prefix law (config validation)', () => {
  test('an unknown prefix fails at validation naming the reference + enabled set', () => {
    expect(() =>
      normalizeLibraryOptions({ includeDefaults: false, icons: { x: 'fa:home' } }),
    ).toThrowError(
      /"x" references "fa:home".*neither lucide: nor an enabled channel.*Enabled prefixes: lucide:/s,
    );
  });

  test('a disabled channel prefix fails the same way; registering fixes it', () => {
    expect(() =>
      normalizeLibraryOptions({ includeDefaults: false, icons: { home: 'md:home' } }),
    ).toThrowError(/prefix "md:" is neither lucide: nor an enabled channel.*library\.channels/s);
    expect(() =>
      normalizeLibraryOptions({
        channels: [md()],
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

describe('channel resolution — the REAL packages (A2)', () => {
  // [label, channels config, the ref under test, the resolved file pattern]
  const cases: ReadonlyArray<readonly [string, readonly IconChannel[], string, RegExp]> = [
    ['material (md:) — outlined weight-400 FILL-0', [md()], 'md:home', /@material-symbols\/svg-[0-9]+\/outlined\/home\.svg$/],
    ['material knobs — rounded + fill', [md({ style: 'rounded', fill: true })], 'md:home', /@material-symbols\/svg-[0-9]+\/rounded\/home-fill\.svg$/],
    ['phosphor (ph:) — default regular weight', [ph()], 'ph:atom', /@phosphor-icons\/core\/assets\/regular\/atom\.svg$/],
    ['phosphor knobs — fill weight', [ph({ weight: 'fill' })], 'ph:atom', /@phosphor-icons\/core\/assets\/fill\/atom-fill\.svg$/],
    ['remix (rx:) — category-prefixed name', [rx()], 'rx:system:add-line', /remixicon\/icons\/System\/add-line\.svg$/],
  ];

  test.each(cases)('%s resolves a real icon through the shared pipeline', async (_label, channels, source, file) => {
    const { io, loaded, watched } = fsIo();
    const { icons, warnings } = await resolveLibraryInputs(
      { includeDefaults: false, channels, icons: { custom: source } },
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
      { includeDefaults: false, channels: [md()], icons: { home: 'md:home' } },
      io,
      createSafetyChecker({ mode: 'warn' }),
    );
    expect(extractIconData(icons[0]!.svg).v).toBe('0 -960 960 960');
  });

  test('channel icons pack alongside built-ins in config insertion order', async () => {
    const { io } = fsIo();
    const { icons } = await resolveLibraryInputs(
      { channels: [md()], icons: { mdHome: 'md:home' } },
      io,
      createSafetyChecker({ mode: 'warn' }),
    );
    // the 39 built-ins + the channel icon = 40 (the override law)
    expect(icons).toHaveLength(40);
    expect(icons[38]!.name).toBe('type'); // the manifest's frozen last entry
    expect(icons[39]!.name).toBe('mdHome');
  });

  test('a resolver returning a RELATIVE path fails the absolute contract by name (diff-r1 M1)', async () => {
    const { io, loaded } = fsIo();
    // the file EXISTS relative to the package cwd — only the contract
    // guard rejects it, so a read failure can't fake the pass
    const relative = defineIconChannel({
      id: 'myco',
      prefix: 'myco',
      resolveFile: () => 'package.json',
    });
    await expect(
      resolveLibraryInputs(
        { includeDefaults: false, channels: [relative], icons: { logo: 'myco:logo' } },
        io,
        createSafetyChecker({ mode: 'warn' }),
      ),
    ).rejects.toThrowError(
      /the channel's resolveFile returned "package\.json".*must return ABSOLUTE \.svg paths.*never relative paths/s,
    );
    expect(loaded).toHaveLength(0); // refused before any read
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
      (md().resolver as { resolveFile: (ref: string) => string }).resolveFile('definitely-not-an-icon'),
    ).toThrowError(
      /installed but has no icon file "outlined\/definitely-not-an-icon\.svg"/s,
    );
  });

  test('remix refs without the category prefix teach the taxonomy', () => {
    expect(() =>
      (rx().resolver as { resolveFile: (ref: string) => string }).resolveFile('add-line'),
    ).toThrowError(
      /carry their category prefix.*rx:system:add-line/s,
    );
  });
});
