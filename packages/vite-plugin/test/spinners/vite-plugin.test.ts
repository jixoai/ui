/**
 * vite-plugin.test.ts — the BUILD-START adapter inside
 * createSpinnersPlugin (P4, design §5/§6, §8), exercised through the
 * mocked vite lifecycle (the icons adapter.test.ts precedent):
 *
 *   - the hook surface is EXACTLY configResolved + buildStart (§8: no
 *     resolveId/load, no virtual ids, no configureServer, no transform)
 *   - write:false never touches disk — a drifted on-disk artifact only
 *     WARNS in dev (command 'serve'), never in build
 *   - write:true writes ONLY on content change (the single-writer
 *     opt-in), with the created/rewritten notice
 *   - bare {} builds the blocks-wave-only generation cleanly
 *   - custom inline + {file} sources flow through buildStart into the
 *     written artifact
 *   - config errors fail at plugin-construction time (startup, never
 *     mid-build)
 */

import { mkdtemp, mkdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Plugin } from 'vite';
import { afterAll, afterEach, describe, expect, test, vi } from 'vitest';
import { createSpinnersPlugin } from '../../src/spinners/vite-plugin.js';
import { BLOCKS_WAVE_SVG } from '../../src/spinners/manifest.js';

// ── lifecycle helpers (the icons adapter.test.ts precedent) ────────

interface PluginLifecycle {
  configResolved(config: { root: string; command?: string; logger?: { warn(message: string): void } }): void;
  buildStart(): Promise<void>;
}

const lifecycle = (plugin: Plugin): PluginLifecycle => plugin as unknown as PluginLifecycle;

/** build a spinners plugin rooted at `root` with the given options + command */
const spinnersPlugin = (
  root: string,
  options: Parameters<typeof createSpinnersPlugin>[0],
  command = 'serve',
  logger?: { warn(message: string): void },
): Plugin => {
  const plugin = createSpinnersPlugin(options);
  // exactOptionalPropertyTypes: the logger key rides only when present
  lifecycle(plugin).configResolved(
    logger === undefined ? { root, command } : { root, command, logger },
  );
  return plugin;
};

// ── fixtures root (drift/write tests need a real tree) ─────────────

let fixtureRoot: string;

afterAll(async () => {
  if (fixtureRoot !== undefined) await rm(fixtureRoot, { recursive: true, force: true });
});

const freshFixture = async (): Promise<string> => {
  fixtureRoot = await mkdtemp(join(tmpdir(), 'jixoai-spins-adapter-'));
  return fixtureRoot;
};

afterEach(() => {
  vi.restoreAllMocks();
});

// ── the hook surface (design §8 pin) ───────────────────────────────

describe('the hook surface — no virtual module face (design §8)', () => {
  test('the plugin carries EXACTLY configResolved + buildStart', () => {
    const plugin = createSpinnersPlugin({});
    expect(plugin.name).toBe('jixoai-spinners');
    expect(plugin.enforce).toBe('pre');
    expect(Object.keys(plugin).sort()).toEqual(['buildStart', 'configResolved', 'enforce', 'name']);
    // the rejected surfaces are absent BY NAME (a regression here would
    // resurrect the dead virtual-module weight)
    expect(plugin).not.toHaveProperty('resolveId');
    expect(plugin).not.toHaveProperty('load');
    expect(plugin).not.toHaveProperty('transform');
    expect(plugin).not.toHaveProperty('configureServer');
  });
});

// ── the single-writer law ──────────────────────────────────────────

describe('write:false (the default) never touches disk', () => {
  test('a drifted on-disk artifact WARNS in dev naming the output; the disk bytes stay stale', async () => {
    const root = await freshFixture();
    await mkdir(join(root, 'src/lib'), { recursive: true });
    const artifactPath = join(root, 'src/lib/spin-set.gen.ts');
    await writeFile(artifactPath, '// stale content\n', 'utf8');

    const warnings: string[] = [];
    const plugin = spinnersPlugin(root, {}, 'serve', { warn: (m) => warnings.push(m) });
    await lifecycle(plugin).buildStart();

    expect(warnings.some((line) => line.includes('drifted from the generator output'))).toBe(true);
    expect(warnings.some((line) => line.includes('src/lib/spin-set.gen.ts'))).toBe(true);
    // the single-writer law: the adapter NEVER wrote
    expect(await readFile(artifactPath, 'utf8')).toBe('// stale content\n');
  });

  test('build mode stays silent (freshness is verify:spins\u2019 job, not a build log)', async () => {
    const root = await freshFixture();
    await mkdir(join(root, 'src/lib'), { recursive: true });
    await writeFile(join(root, 'src/lib/spin-set.gen.ts'), '// stale content\n', 'utf8');

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const plugin = spinnersPlugin(root, {}, 'build');
    await lifecycle(plugin).buildStart();
    expect(warn).not.toHaveBeenCalled();
  });

  test('an absent artifact with write:false stays absent (no creation)', async () => {
    const root = await freshFixture();
    const plugin = spinnersPlugin(root, {}, 'serve');
    await lifecycle(plugin).buildStart();
    // nothing written, nothing thrown
    await expect(readFile(join(root, 'src/lib/spin-set.gen.ts'), 'utf8')).rejects.toThrowError();
  });
});

describe('write:true (the consumer opt-in)', () => {
  test('creates the artifact with the notice, then rewrites NOTHING on identical content', async () => {
    const root = await freshFixture();
    const artifactPath = join(root, 'src/lib/spin-set.gen.ts');

    const warnings: string[] = [];
    const first = spinnersPlugin(root, { write: true }, 'serve', { warn: (m) => warnings.push(m) });
    await lifecycle(first).buildStart();
    expect(warnings.some((line) => line.includes('spin-set artifact src/lib/spin-set.gen.ts created'))).toBe(true);

    const written = await readFile(artifactPath, 'utf8');
    expect(written).toContain("export type SpinName =\n  | 'blocks-wave'\n  ;");
    const firstStat = await stat(artifactPath);

    // deterministic second run: same bytes, NO rewrite (mtime unchanged)
    const secondWarnings: string[] = [];
    const second = spinnersPlugin(root, { write: true }, 'serve', { warn: (m) => secondWarnings.push(m) });
    await lifecycle(second).buildStart();
    expect(await readFile(artifactPath, 'utf8')).toBe(written);
    const secondStat = await stat(artifactPath);
    expect(secondStat.mtimeMs).toBe(firstStat.mtimeMs);
    expect(secondWarnings.filter((line) => line.includes('rewritten'))).toHaveLength(0);
  });

  test('a drifted artifact is REWRITTEN with the notice', async () => {
    const root = await freshFixture();
    await mkdir(join(root, 'src/lib'), { recursive: true });
    const artifactPath = join(root, 'src/lib/spin-set.gen.ts');
    await writeFile(artifactPath, '// stale content\n', 'utf8');

    const warnings: string[] = [];
    const plugin = spinnersPlugin(root, { write: true }, 'serve', { warn: (m) => warnings.push(m) });
    await lifecycle(plugin).buildStart();
    expect(warnings.some((line) => line.includes('rewritten'))).toBe(true);
    expect(await readFile(artifactPath, 'utf8')).toContain("| 'blocks-wave'");
  });
});

// ── the generation itself ──────────────────────────────────────────

describe('buildStart generation (bare {} + custom sources)', () => {
  test('a bare {} builds the blocks-wave-only generation cleanly', async () => {
    const root = await freshFixture();
    const warnings: string[] = [];
    const plugin = spinnersPlugin(root, {}, 'serve', { warn: (m) => warnings.push(m) });
    await expect(lifecycle(plugin).buildStart()).resolves.toBeUndefined();
    expect(warnings).toEqual([]);
  });

  test('custom inline + {file} sources land in the written artifact (union + payload)', async () => {
    const root = await freshFixture();
    const svgPath = join(root, 'ring.svg');
    await writeFile(
      svgPath,
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/></svg>',
      'utf8',
    );

    const plugin = spinnersPlugin(root, {
      write: true,
      spinners: {
        'inline-pulse':
          '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="6"/></svg>',
        'disk-loader': { file: svgPath },
      },
    });
    await lifecycle(plugin).buildStart();

    const artifact = await readFile(join(root, 'src/lib/spin-set.gen.ts'), 'utf8');
    expect(artifact).toContain("| 'blocks-wave'");
    expect(artifact).toContain("| 'inline-pulse'");
    expect(artifact).toContain("| 'disk-loader'");
    expect(artifact).toContain("'inline-pulse': { v: '0 0 24 24', n: 'fill',");
    expect(artifact).toContain("'disk-loader': { v: '0 0 24 24', n: 'fill',");
  });

  test('includeDefaults: false packs the custom set only', async () => {
    const root = await freshFixture();
    const plugin = spinnersPlugin(root, {
      write: true,
      includeDefaults: false,
      spinners: { solo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"/>' },
    });
    await lifecycle(plugin).buildStart();
    const artifact = await readFile(join(root, 'src/lib/spin-set.gen.ts'), 'utf8');
    expect(artifact).toContain("| 'solo'");
    expect(artifact).not.toContain('blocks-wave');
  });

  test('the default output is src/lib/spin-set.gen.ts, project-root-relative', async () => {
    const root = await freshFixture();
    const plugin = spinnersPlugin(root, { write: true });
    await lifecycle(plugin).buildStart();
    await expect(readFile(join(root, 'other', 'spin-set.gen.ts'), 'utf8')).rejects.toThrowError();
    expect(await readFile(join(root, 'src/lib/spin-set.gen.ts'), 'utf8')).toContain('blocks-wave');
  });

  test('warn-mode safety rejections surface through the adapter logger', async () => {
    const root = await freshFixture();
    const warnings: string[] = [];
    const plugin = spinnersPlugin(
      root,
      {
        includeDefaults: false,
        spinners: {
          evil:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><script>alert(1)</script></svg>',
        },
      },
      'serve',
      { warn: (m) => warnings.push(m) },
    );
    await lifecycle(plugin).buildStart();
    expect(warnings.join('\n')).toMatch(/safety check rejected spinner "evil"/);
  });
});

// ── startup validation ─────────────────────────────────────────────

describe('config errors fail at construction (startup, never mid-build)', () => {
  test('an illegal spinner name throws from createSpinnersPlugin itself', () => {
    expect(() => createSpinnersPlugin({ spinners: { MyLoader: '<svg/>' } })).toThrowError(
      /"MyLoader".*kebab/s,
    );
    expect(() => createSpinnersPlugin({ output: '/abs/gen.ts' })).toThrowError(
      /project-root-relative/,
    );
  });

  test('the vendored bytes never enter a warning path (blocks-wave is clean)', () => {
    // structural pin: the manifest constant is the file bytes (the
    // vendoring receipt), so the adapter's default generation is clean
    expect(BLOCKS_WAVE_SVG.startsWith('<svg fill="currentColor" viewBox="0 0 24 24"')).toBe(true);
    expect(BLOCKS_WAVE_SVG.endsWith('</svg>')).toBe(true);
  });
});
