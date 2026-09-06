/**
 * vite-build.test.ts — the REAL vite integration (A6, the
 * vite-native.test.ts precedent): a fixture app whose icon-set
 * artifact has LAZY chunks (forced with a low maxChunkBytes) builds
 * through `vite build()` with the library plugin wired, emitting the
 * chunk assets; and a dev-server (ssrLoadModule) run executes the
 * artifact's runtime sentinel path (plugin present, library NOT
 * configured → the LAZY catch rethrows the fixed message with the
 * original failure as cause).
 */

import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { build, createServer } from 'vite';
import type { InlineConfig, ViteDevServer } from 'vite';
import { afterAll, beforeAll, describe, expect, test } from 'vitest';
import { createIconPlugin } from '../../../src/icons/vite-plugin.js';
import { ICON_LIBRARY_SENTINEL_ERROR } from '../../../src/icons/ids.js';
import { generateIconLibraryArtifacts } from '../../../src/icons/library/generate.js';

const stubIcon = (marker: string): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M1 1l3 3 ${marker}"/></svg>`;

/** a budget that puts every icon in its OWN chunk (no oversized warnings) */
const perIconBudget = (svgs: readonly string[]): number => {
  const probe = generateIconLibraryArtifacts(
    svgs.map((svg, i) => ({ name: `probe${i}`, svg })),
    { maxChunkBytes: 1 << 30 },
  );
  return Math.max(...Object.values(probe.report.perIconBytes));
};

let outRoot: string;

beforeAll(async () => {
  outRoot = await mkdtemp(join(tmpdir(), 'jixoai-lib-vite-'));
});

afterAll(async () => {
  await rm(outRoot, { recursive: true, force: true });
});

describe('a real vite build with lazy chunks', () => {
  test('emits the chunk assets and builds the artifact module', async () => {
    const root = join(outRoot, `build-${Date.now()}`);
    await mkdir(join(root, 'src', 'lib'), { recursive: true });

    const icons = {
      alpha: stubIcon('alpha'),
      beta: stubIcon('beta'),
      gamma: stubIcon('gamma'),
    };
    const plugin = createIconPlugin({
      library: {
        includeDefaults: false,
        icons,
        maxChunkBytes: perIconBudget(Object.values(icons)), // one icon per chunk → 2 lazy
        output: 'src/lib/icon-set.gen.ts',
      },
    });

    // the on-disk artifact the entry imports (extensionless relative
    // import — vite's resolver lands on the path our load() serves)
    await writeFile(
      join(root, 'src', 'lib', 'icon-set.gen.ts'),
      '// placeholder — the plugin serves the generated module\n',
      'utf8',
    );
    await writeFile(
      join(root, 'src', 'entry.js'),
      [
        "import { getIcon, ICON_NAMES, preloadIcons } from './lib/icon-set.gen';",
        'export const inlineIcon = getIcon(ICON_NAMES[0]);',
        '// the lazy names miss the inline cache — preload drives the LAZY',
        '// loaders (the sentinel catch rides every one of them)',
        'export const lazyNames = ICON_NAMES.filter((name) => getIcon(name) === null);',
        'export const ready = preloadIcons(lazyNames);',
      ].join('\n'),
      'utf8',
    );

    const outDir = join(root, 'dist');
    await build({
      root,
      logLevel: 'silent',
      plugins: [plugin],
      build: {
        outDir,
        emptyOutDir: true,
        rollupOptions: { input: join(root, 'src', 'entry.js') },
      },
    } satisfies InlineConfig);

    // the artifact was served GENERATED (not the placeholder): the
    // entry carries the seeded Map cache; the bundle is MINIFIED
    // (identifiers renamed), so assert behavior + literals, not names
    const outputs = await walk(outDir); // {path, content} — read inline
    const jsOutputs = outputs.filter((entry) => entry.path.endsWith('.js'));
    const bundle = jsOutputs.map((entry) => entry.content).join('\n');
    expect(bundle).toContain('new Map(Object.entries('); // the seeded cache
    // the lazy path carries the sentinel catch + real chunk payloads
    expect(bundle).toContain(ICON_LIBRARY_SENTINEL_ERROR);
    expect(bundle).toContain('0 0 24 24'); // {v} payloads from the chunk modules
    // the dynamic imports split into emitted assets beyond the entry:
    // the lazy chunk body (beta/gamma) lives in its own emitted file
    expect(jsOutputs.length).toBeGreaterThan(1);
    const lazyBodyFile = jsOutputs.find(
      (entry) => entry.content.includes('beta') && entry.content.includes('0 0 24 24'),
    );
    expect(lazyBodyFile).toBeDefined();
  }, 120_000);
});

describe('the runtime sentinel through a real dev server (ssrLoadModule)', () => {
  test('a wired-but-broken library → loadIcon rejects with the FIXED message + the failure as cause', async () => {
    const root = join(outRoot, `ssr-${Date.now()}`);
    await mkdir(join(root, 'src', 'lib'), { recursive: true });

    // the artifact comes from a library whose packing LAZIES 'two' into
    // chunk 1…
    const wiredIcons = { one: stubIcon('one'), two: stubIcon('two') };
    const wired = createIconPlugin({
      library: {
        includeDefaults: false,
        icons: wiredIcons,
        maxChunkBytes: perIconBudget(Object.values(wiredIcons)), // one per chunk — 'two' lazy
        output: 'src/lib/icon-set.gen.ts',
      },
    });
    const wiredHooks = wired as unknown as {
      buildStart(): Promise<void>;
      resolveId(id: string, importer?: string): string | null;
      load(id: string): Promise<string | null>;
      configResolved(config: { root: string }): void;
    };
    wiredHooks.configResolved({ root });
    await wiredHooks.buildStart();
    const artifactPath = join(root, 'src', 'lib', 'icon-set.gen.ts');
    const generated = await wiredHooks.load(wiredHooks.resolveId(artifactPath, undefined)!);
    expect(generated).toContain("import('virtual:jixoai-icons/chunk/1')");
    await writeFile(artifactPath, generated!, 'utf8');

    // …but the SERVER wires a different (smaller) library: chunk 1
    // resolves but fails to load — the broken-import fixture. The LAZY
    // catch must rethrow the FIXED sentinel with the drift error as
    // cause. The server's own output points ELSEWHERE so the artifact
    // under test serves from disk (the plugin would otherwise serve its
    // own regenerated 1-icon artifact over it).
    const server: ViteDevServer = await createServer({
      root,
      logLevel: 'silent',
      configFile: false,
      plugins: [
        createIconPlugin({
          library: { includeDefaults: false, icons: { one: wiredIcons.one }, output: 'src/lib/other.gen.ts' },
        }),
      ],
    });
    try {
      const module = (await server.ssrLoadModule('/src/lib/icon-set.gen.ts')) as {
        getIcon(name: string): unknown;
        loadIcon(name: string): Promise<unknown>;
      };
      // the inline core answers synchronously
      expect(module.getIcon('one')).not.toBeNull();
      // the lazy path: the chunk import rejects (named drift error) →
      // the LAZY catch rethrows the FIXED sentinel with the cause chain
      let caught: (Error & { cause?: unknown }) | undefined;
      try {
        await module.loadIcon('two');
      } catch (err) {
        caught = err as Error & { cause?: unknown };
      }
      expect(caught).toBeDefined();
      expect(caught!.message).toBe(ICON_LIBRARY_SENTINEL_ERROR);
      expect(caught!.cause).toBeInstanceOf(Error);
      expect((caught!.cause as Error).message).toMatch(/chunk 1 requested but the configured library/);
    } finally {
      await server.close();
    }
  }, 120_000);
});

interface OutputFile {
  readonly path: string;
  readonly content: string;
}

/** walk dist, reading contents inline (hash names can be exotic) */
async function walk(dir: string): Promise<OutputFile[]> {
  const out: OutputFile[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(path)));
    else out.push({ path: path.slice(dir.length + 1), content: await readFile(path, 'utf8') });
  }
  return out;
}
