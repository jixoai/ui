/**
 * adapter.test.ts — the VITE adapter inside createIconPlugin (A4/A6,
 * design §5/§6), exercised through the mocked vite lifecycle (the
 * vite-plugin.test.ts precedent):
 *
 *   - virtual:jixoai-icons/chunk/K resolves + loads `export default
 *     {name:{v,n,d}}`; a missing chunk fails with the named drift error
 *   - the artifact module is served for the configured output path
 *     (absolute claim + relative-import resolution), stale disk content
 *     drift-warns in dev, write:false never writes
 *   - write:true writes ONLY on content change
 *   - plugin present + library NOT configured: the chunk-id resolver
 *     throws the EXACT sentinel (build-time primary)
 *   - the runtime loader catch rethrows the same sentinel bytes with
 *     the original failure as cause (broken-import fixture, executed
 *     through the generated artifact text)
 *   - artifact↔chunk PARITY: the plugin-served chunk bodies equal the
 *     generator's chunk map byte-for-byte
 *   - library-only: the slot face's CSS module stays content-free
 */

import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Plugin, ViteDevServer } from 'vite';
import { afterAll, afterEach, describe, expect, test, vi } from 'vitest';
import { createIconPlugin, VIRTUAL_MODULE_ID } from '../../../src/icons/vite-plugin.js';
import { ICON_LIBRARY_SENTINEL_ERROR } from '../../../src/icons/ids.js';
import { generateIconLibraryArtifacts } from '../../../src/icons/library/generate.js';
import { resolveLibraryInputs } from '../../../src/icons/library/resolve.js';
import { createSafetyChecker } from '../../../src/icons/safety.js';
import type { IconLibraryOptions } from '../../../src/icons/library/types.js';

// ── lifecycle helpers (the vite-plugin.test.ts precedent) ──────────

interface PluginLifecycle {
  configResolved(config: { root: string }): void;
  buildStart(): Promise<void>;
  resolveId(id: string, importer?: string): string | null;
  load(id: string): Promise<string | null>;
  configureServer(server: ViteDevServer): void;
}

const lifecycle = (plugin: Plugin): PluginLifecycle => plugin as unknown as PluginLifecycle;

/** narrow an optional module load result (strict mode: no null-cast dances) */
const unwrap = (value: string | null, label: string): string => {
  if (value === null) throw new Error(`missing ${label}`);
  return value;
};

const factory = () => Promise.resolve({ getIcon: () => null });

/** svg fixtures sized to force multiple chunks under a small budget */
const stubIcons = (count: number, artwork = 60): Record<string, string> => {
  const icons: Record<string, string> = {};
  for (let i = 0; i < count; i += 1) {
    const pad = `M2 2L4 4`.repeat(artwork / 11);
    icons[`stub${i}`] =
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="${pad}"/></svg>`;
  }
  return icons;
};

// ── fixtures root (drift/write tests need a real tree) ─────────────

let fixtureRoot: string;

afterAll(async () => {
  if (fixtureRoot !== undefined) await rm(fixtureRoot, { recursive: true, force: true });
});

const freshFixture = async (): Promise<string> => {
  fixtureRoot = await mkdtemp(join(tmpdir(), 'jixoai-lib-adapter-'));
  return fixtureRoot;
};

/** build a library-only plugin rooted at `root` with the given options */
const libraryPlugin = (root: string, options: IconLibraryOptions): Plugin => {
  const plugin = createIconPlugin({ library: options });
  lifecycle(plugin).configResolved({ root });
  return plugin;
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe('virtual chunk modules (virtual:jixoai-icons/chunk/K)', () => {
  test('resolve + load export default {name:{v,n,d}}; missing chunk = named drift error', async () => {
    const root = await freshFixture();
    const plugin = libraryPlugin(root, { includeDefaults: false, icons: stubIcons(4), maxChunkBytes: 300 });
    const { buildStart, resolveId, load } = lifecycle(plugin);
    await buildStart();

    const resolved = resolveId('virtual:jixoai-icons/chunk/1', '/app/src/lib/icon-set.gen.ts');
    expect(resolved).toBe('\0virtual:jixoai-icons/chunk/1');
    const body = await load(resolved!);
    expect(body).toContain('export default {');
    expect(body).toContain('  stub');
    expect(body).toContain("n: 'stroke'");

    // a chunk beyond the packed range fails by name (config drift)
    const missing = resolveId('virtual:jixoai-icons/chunk/99', '/app/src/lib/icon-set.gen.ts');
    await expect(load(missing!)).rejects.toThrowError(
      /chunk 99 requested but the configured library has no such chunk.*regenerate/s,
    );
  });

  test('PARITY: plugin-served chunk bodies equal the generator output byte-for-byte', async () => {
    const root = await freshFixture();
    const options: IconLibraryOptions = { includeDefaults: false, icons: stubIcons(6), maxChunkBytes: 300 };
    const plugin = libraryPlugin(root, options);
    const { buildStart, resolveId, load } = lifecycle(plugin);
    await buildStart();

    // the same config through the generator directly (adapter-free)
    const io = {
      loadSource: async () => {
        throw new Error('no file sources in this fixture');
      },
      watchFile: () => undefined,
    };
    const resolution = await resolveLibraryInputs(options, io, createSafetyChecker({ mode: 'warn' }));
    const generated = generateIconLibraryArtifacts(resolution.icons, options);
    expect(generated.report.chunkCount).toBeGreaterThan(1);

    for (const [index, expected] of generated.chunks) {
      const resolved = resolveId(`virtual:jixoai-icons/chunk/${index}`, '/app/x.ts');
      expect(await load(resolved!)).toBe(expected);
    }
  });
});

describe('the artifact module (the configured output path)', () => {
  test('served by absolute claim AND relative-import resolution; drift-warns in dev; never writes at write:false', async () => {
    const root = await freshFixture();
    await mkdir(join(root, 'src/lib'), { recursive: true });
    const artifactPath = join(root, 'src/lib/icon-set.gen.ts');
    await writeFile(artifactPath, '// stale content\n', 'utf8');

    const plugin = libraryPlugin(root, { includeDefaults: false, icons: stubIcons(2) });
    const { buildStart, resolveId, load } = lifecycle(plugin);
    await buildStart();

    // absolute claim
    expect(resolveId(artifactPath, undefined)).toBe(artifactPath);
    // relative import from a sibling module resolves to the artifact
    expect(resolveId('./icon-set.gen.ts', join(root, 'src/lib/main.ts'))).toBe(artifactPath);

    const served = await load(artifactPath);
    expect(served).toContain('// GENERATED — do not edit');
    expect(served).toContain('export type IconName =');

    // dev drift: the server-attached generation warns through the
    // SERVER LOGGER (the plugin's own channel), naming the file
    const server = mockServer();
    const second = createIconPlugin({ library: { includeDefaults: false, icons: stubIcons(2) } });
    lifecycle(second).configResolved({ root });
    lifecycle(second).configureServer(server.server as unknown as ViteDevServer);
    await lifecycle(second).buildStart();
    expect(server.warnings.some((line) => line.includes('drifted from the generator output'))).toBe(true);

    // write:false: the stale disk bytes are untouched
    expect(await readFile(artifactPath, 'utf8')).toBe('// stale content\n');
  });

  test('write:true writes ONLY on content change (single-writer opt-in)', async () => {
    const root = await freshFixture();
    const artifactPath = join(root, 'src/lib/icon-set.gen.ts');

    const build = async (): Promise<string> => {
      const plugin = libraryPlugin(root, {
        includeDefaults: false,
        icons: stubIcons(2),
        write: true,
        output: 'src/lib/icon-set.gen.ts',
      });
      const { buildStart, resolveId, load } = lifecycle(plugin);
      await buildStart();
      return (await load(resolveId(artifactPath, undefined)!))!;
    };

    const first = await build();
    expect(await readFile(artifactPath, 'utf8')).toBe(first); // written
    const writtenAt = (await readFile(artifactPath, 'utf8')).length;

    const second = await build();
    expect(second).toBe(first); // deterministic — content unchanged
    expect((await readFile(artifactPath, 'utf8')).length).toBe(writtenAt); // no rewrite needed
  });

  test('the default output is src/lib/icon-set.gen.ts, project-root-relative', async () => {
    const root = await freshFixture();
    const plugin = libraryPlugin(root, { includeDefaults: false, icons: stubIcons(1) });
    const { buildStart, resolveId } = lifecycle(plugin);
    await buildStart();
    expect(resolveId(join(root, 'src/lib/icon-set.gen.ts'), undefined)).toBe(
      join(root, 'src/lib/icon-set.gen.ts'),
    );
    // foreign paths are not ours
    expect(resolveId(join(root, 'src/lib/other.ts'), undefined)).toBeNull();
    expect(resolveId('/etc/passwd', undefined)).toBeNull();
  });
});

describe('the overflow sentinel (design §5)', () => {
  test('build-time: plugin present, library NOT configured → resolveId throws the EXACT sentinel', () => {
    const plugin = createIconPlugin({ icons: factory });
    const { resolveId } = lifecycle(plugin);
    expect(() => resolveId('virtual:jixoai-icons/chunk/1', '/app/src/lib/icon-set.gen.ts')).toThrowError(
      ICON_LIBRARY_SENTINEL_ERROR,
    );
    // the slot face's own ids still resolve (provider-only row unaffected)
    expect(resolveId(VIRTUAL_MODULE_ID, '/app/src/app.css')).toBeTruthy();
  });

  test('runtime: the artifact LAZY loaders carry the sentinel catch verbatim (execution in vite-build.test.ts)', async () => {
    // the broken-import fixture: an artifact with lazy chunk imports.
    // The loader block's BYTES are pinned here; the executing path
    // (rejecting chunk import → catch → rethrow with cause) runs
    // against a real vite server in vite-build.test.ts.
    const root = await freshFixture();
    const plugin = libraryPlugin(root, { includeDefaults: false, icons: stubIcons(3), maxChunkBytes: 250 });
    const { buildStart, resolveId, load } = lifecycle(plugin);
    await buildStart();
    const artifact = unwrap(await load(resolveId(join(root, 'src/lib/icon-set.gen.ts'), undefined)!), 'artifact');
    expect(artifact).toContain(`import('virtual:jixoai-icons/chunk/1')`);

    const lazyPrefix =
      'const LAZY: Readonly<Record<number, () => Promise<{ default: Record<string, IconData> }>>> = {';
    const lazyAt = artifact.indexOf(lazyPrefix);
    expect(lazyAt).toBeGreaterThanOrEqual(0);
    const loaderBody = artifact.slice(lazyAt + lazyPrefix.length, artifact.indexOf('\n};', lazyAt));
    expect(loaderBody.length).toBeGreaterThan(0);
    // every loader wraps its import in a catch rethrowing the FIXED
    // message with the original error as cause — verbatim design §5
    expect(loaderBody).toContain(`.catch((cause: unknown) => {`);
    expect(loaderBody).toContain(`throw new Error(${JSON.stringify(ICON_LIBRARY_SENTINEL_ERROR)}, { cause });`);
  });
});

describe('library-only row: the slot face stays inert', () => {
  test('no CSS module content (comment-only) and an empty domIcons export', async () => {
    const root = await freshFixture();
    const plugin = libraryPlugin(root, { includeDefaults: false, icons: stubIcons(1) });
    const { buildStart, resolveId, load } = lifecycle(plugin);
    await buildStart();

    const css = await load(resolveId(VIRTUAL_MODULE_ID, '/app/src/app.css')!);
    expect(css).not.toContain('--jx-icon-');
    expect(css).toContain('jixoai-icons'); // the comment-only module

    const js = await load(resolveId(`${VIRTUAL_MODULE_ID}?dom`, '/app/src/main.ts')!);
    expect(js).toContain('export const domIcons = {');
    expect(js).not.toContain('stub0');
  });
});

// ── mock dev server (drift-warn needs one attached) ────────────────

interface MockServer {
  readonly server: object;
  readonly warnings: string[];
}

function mockServer(): MockServer {
  const warnings: string[] = [];
  return {
    server: {
      watcher: { add: (): void => undefined, on: (): void => undefined },
      moduleGraph: { getModuleById: (): object | undefined => undefined, invalidateModule: (): void => undefined },
      ws: { send: (): void => undefined },
      config: {
        logger: {
          error: (): void => undefined,
          warn: (message: string): void => {
            warnings.push(message);
          },
        },
      },
    },
    warnings,
  };
}
