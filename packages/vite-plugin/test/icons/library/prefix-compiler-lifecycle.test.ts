/**
 * prefix-compiler-lifecycle.test.ts — the scanner's TWO entries driven
 * through the REAL plugin/script lifecycle (A1/A2, openspec
 * icon-prefix-compiler design §1 / spec delta; codex r1 M7).
 *
 *   - the DEV path (the font-sources.test.ts real-plugin-lifecycle
 *     precedent): buildStart generates WITHOUT scanned refs, the
 *     enforce:'pre' transform collects literals module by module, and
 *     a scanned-set UNION change rides scheduleRefresh — the slot
 *     face's refresh path (module invalidation + one full reload)
 *   - the BUILD path: the EAGER project walk at buildStart packs
 *     undeclared scanned refs BEFORE any transform ran (the
 *     transform-only-collector-is-unreachable finding)
 *   - the SCRIPT twin (gen:icons / verify:icons): the same eager walk
 *     inside buildArtifacts — the dev artifact, the build artifact and
 *     the written script artifact are BYTE-IDENTICAL for the same
 *     sources (the parity requirement, scoped svg-only per M7)
 */

import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import type { Plugin, ViteDevServer } from 'vite';
import { afterAll, describe, expect, test } from 'vitest';
import { createIconPlugin } from '../../../src/icons/vite-plugin.js';
import {
  checkIconLibraryArtifact,
  writeIconLibraryArtifact,
} from '../../../src/icons/library/script.js';
import type { IconLibraryOptions } from '../../../src/icons/library/types.js';

// ── the fixture project (real files — the walk reads them) ─────────

interface Fixture {
  readonly root: string;
  readonly artifactPath: string;
  readonly appSvelte: string;
  readonly otherTs: string;
}

let fixtureRoot: string;
afterAll(async () => {
  if (fixtureRoot !== undefined) await rm(fixtureRoot, { recursive: true, force: true });
});

const freshFixture = async (): Promise<Fixture> => {
  const root = await mkdtemp(join(tmpdir(), 'jixoai-scan-life-'));
  fixtureRoot = root;
  await mkdir(join(root, 'src/lib'), { recursive: true });
  const appSvelte = join(root, 'src/App.svelte');
  const otherTs = join(root, 'src/other.ts');
  await writeFile(
    appSvelte,
    [
      '<script lang="ts">',
      "  import Icon from '$lib/ui/icon';",
      '</script>',
      '',
      '<Icon name="md:copy_all as copy2" />',
      '<Icon name="md:copy_all" />',
      '',
    ].join('\n'),
    'utf8',
  );
  await writeFile(otherTs, "export const home = `<Icon name=\"md:home\" />`;\n", 'utf8');
  // excluded trees carry lookalikes — they must contribute nothing
  await mkdir(join(root, 'node_modules/dep'), { recursive: true });
  await writeFile(join(root, 'node_modules/dep/mod.ts'), '<Icon name="md:delete" />', 'utf8');
  return { root, artifactPath: join(root, 'src/lib/icon-set.gen.ts'), appSvelte, otherTs };
};

const readSource = async (path: string): Promise<string> =>
  (await import('node:fs/promises')).readFile(path, 'utf8');

// ── the lifecycle harness (the adapter.test.ts precedent) ──────────

interface PluginLifecycle {
  configResolved(config: { root: string; command?: string }): void;
  buildStart(): Promise<void>;
  resolveId(id: string, importer?: string): string | null;
  load(id: string): Promise<string | null>;
  transform(code: string, id: string): { code: string; map: null } | null;
  configureServer(server: ViteDevServer): void;
}

const lifecycle = (plugin: Plugin): PluginLifecycle => plugin as unknown as PluginLifecycle;

interface MockServer {
  readonly server: object;
  readonly invalidated: string[];
  readonly reloads: number;
  /** fire a captured watcher event at the plugin (unlink coverage) */
  emit(event: string, file: string): void;
}

const mockServer = (): MockServer => {
  const invalidated: string[] = [];
  const handlers = new Map<string, (file: string) => void>();
  let reloads = 0;
  return {
    server: {
      watcher: {
        add: (): void => undefined,
        on: (event: string, callback: (file: string) => void): void => {
          handlers.set(event, callback);
        },
      },
      moduleGraph: {
        getModuleById: (id: string): object | undefined => (id ? { id } : undefined),
        invalidateModule: (node: { id: string }): void => {
          invalidated.push(node.id);
        },
      },
      ws: { send: (): void => { reloads += 1; } },
      config: { logger: { error: (): void => undefined, warn: (): void => undefined } },
    },
    invalidated,
    get reloads() {
      return reloads;
    },
    emit(event: string, file: string): void {
      handlers.get(event)?.(file);
    },
  };
};

/** poll the served artifact until the refresh chain lands (bounded) */
const pollArtifact = async (
  plugin: PluginLifecycle,
  artifactPath: string,
  predicate: (artifact: string) => boolean,
): Promise<string> => {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const artifact = (await plugin.load(artifactPath)) ?? '';
    if (predicate(artifact)) return artifact;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error('pollArtifact: the refreshed artifact never landed');
};

const LIBRARY: IconLibraryOptions = { includeDefaults: false, presets: ['material'] };

// ── the DEV path (design §1b) ──────────────────────────────────────

describe('the DEV transform collector rides scheduleRefresh', () => {
  test('buildStart generates without scans; transforms collect; a UNION change refreshes', async () => {
    const { root, artifactPath, appSvelte, otherTs } = await freshFixture();
    const plugin = createIconPlugin({ library: LIBRARY });
    const hooks = lifecycle(plugin);
    const server = mockServer();
    hooks.configResolved({ root, command: 'serve' });
    hooks.configureServer(server.server as unknown as ViteDevServer);
    await hooks.buildStart();

    // pre-scan: the declared-only library — empty concrete set, but
    // the template member already rides the union (enabled preset)
    const initial = await hooks.load(artifactPath);
    expect(initial).toContain('export type IconName =\n  | `md:${string}`\n  ;');
    expect(initial).not.toContain("'md:copy_all'");

    // dev transforms arrive on demand — the collector never rewrites
    const appCode = await readSource(appSvelte);
    const otherCode = await readSource(otherTs);
    expect(hooks.transform(appCode, appSvelte)).toBeNull();
    expect(hooks.transform(otherCode, otherTs)).toBeNull();
    // out-of-scope ids pass through untouched
    expect(hooks.transform('<Icon name="md:delete" />', join(root, 'node_modules/dep/mod.ts'))).toBeNull();
    expect(hooks.transform(appCode, artifactPath)).toBeNull();

    // the UNION change rode scheduleRefresh: the regenerated artifact,
    // the module invalidation AND the full reload all observed (the
    // poll covers the refresh's full landing — library updates before
    // invalidation runs, so content alone would race)
    const refreshed = await pollArtifact(
      hooks,
      artifactPath,
      (a) =>
        a.includes("'md:copy_all'") &&
        server.invalidated.includes(artifactPath) &&
        server.reloads > 0,
    );
    expect(refreshed).toContain("  copy2: 'md:copy_all',"); // the ALIASES row
    expect(refreshed).toContain('`md:${string}`'); // the template member
    expect(refreshed).not.toContain('md:delete'); // exclusions held

    // a per-module churn with the SAME union does NOT re-refresh —
    // first let any in-flight refresh chain land (suite-load timing),
    // then prove the churn schedules nothing new
    const settleReloads = async (): Promise<number> => {
      let count = server.reloads;
      for (;;) {
        await new Promise((resolve) => setTimeout(resolve, 25));
        if (server.reloads === count) return count;
        count = server.reloads;
      }
    };
    const reloadsBefore = await settleReloads();
    expect(hooks.transform(appCode.replace(' as copy2', ' as copy2 '), appSvelte)).toBeNull();
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(server.reloads).toBe(reloadsBefore);

    // and dropping every scanned module shrinks the set back (delete)
    expect(hooks.transform('// gone', otherTs)).toBeNull();
    await pollArtifact(hooks, artifactPath, (a) => !a.includes("'md:home'"));
  });

  test('the transform is inert without presets and in build mode', async () => {
    const { root, appSvelte, otherTs } = await freshFixture();
    const appCode = await readSource(appSvelte);

    // no presets → the collector can never match
    const bare = createIconPlugin({ library: { includeDefaults: false } });
    lifecycle(bare).configResolved({ root, command: 'serve' });
    expect(lifecycle(bare).transform(appCode, appSvelte)).toBeNull();

    // build command → the eager walk owns collection, not the transform
    const building = createIconPlugin({ library: LIBRARY });
    lifecycle(building).configResolved({ root, command: 'build' });
    expect(lifecycle(building).transform(appCode, appSvelte)).toBeNull();
  });
});

// ── the BUILD path (design §1a) ────────────────────────────────────

describe('the EAGER walk packs undeclared refs at buildStart (before transforms)', () => {
  test('command === build: the artifact carries the scanned set with zero transforms', async () => {
    const { root, artifactPath } = await freshFixture();
    const plugin = createIconPlugin({ library: LIBRARY });
    const hooks = lifecycle(plugin);
    hooks.configResolved({ root, command: 'build' });
    await hooks.buildStart(); // generation happens HERE — no transform ran

    const artifact = await hooks.load(artifactPath);
    expect(artifact).toContain("  | 'md:copy_all'");
    expect(artifact).toContain("  | 'copy2'");
    expect(artifact).toContain("  | 'md:home'");
    expect(artifact).toContain('  | `md:${string}`');
    expect(artifact).not.toContain('md:delete');
  });
});

// ── the SCRIPT twin parity (design §1a + codex r1 M7) ──────────────

describe('gen:icons parity — dev, build and script artifacts are byte-identical', () => {
  test('the same sources through all three paths produce the same bytes', async () => {
    const { root, artifactPath, appSvelte, otherTs } = await freshFixture();

    // (1) the dev path: transforms → refresh → served artifact
    const dev = createIconPlugin({ library: LIBRARY });
    const devHooks = lifecycle(dev);
    devHooks.configResolved({ root, command: 'serve' });
    devHooks.configureServer(mockServer().server as unknown as ViteDevServer);
    await devHooks.buildStart();
    devHooks.transform(await readSource(appSvelte), appSvelte);
    devHooks.transform(await readSource(otherTs), otherTs);
    const devArtifact = await pollArtifact(devHooks, artifactPath, (a) => a.includes("'md:home'"));

    // (2) the build path: the eager walk at buildStart
    const build = createIconPlugin({ library: LIBRARY });
    const buildHooks = lifecycle(build);
    buildHooks.configResolved({ root, command: 'build' });
    await buildHooks.buildStart();
    const buildArtifact = (await buildHooks.load(artifactPath)) ?? '';

    // (3) the script twin: the same eager walk inside buildArtifacts —
    // the single writer's ON-DISK bytes are the parity subject
    const written = await writeIconLibraryArtifact(LIBRARY, artifactPath, undefined, root);
    expect(written.changed).toBe(true);
    const scriptArtifact = await readSource(artifactPath);
    expect(written.report.iconCount).toBe(2); // md:copy_all + md:home — canonicals only (the alias is not an icon)
    expect(written.report.warnings).toEqual([]);

    expect(buildArtifact).toBe(devArtifact); // eager walk === transform union
    expect(scriptArtifact).toBe(devArtifact); // the script twin is no scanner-less twin

    // and the freshness gate agrees (verify:icons' in-memory comparison)
    const check = await checkIconLibraryArtifact(LIBRARY, artifactPath, undefined, root);
    expect(check.fresh).toBe(true);
  });
});

describe('codex r2 — the scan lifecycle gaps', () => {
  test('deleting a scanned source drops its refs and refreshes (M3)', async () => {
    const { root, artifactPath, appSvelte } = await freshFixture();
    const plugin = createIconPlugin({ library: LIBRARY });
    const hooks = lifecycle(plugin);
    const mock = mockServer();
    hooks.configResolved({ root, command: 'serve' });
    hooks.configureServer(mock.server as unknown as ViteDevServer);
    await hooks.buildStart();

    // the module transforms in, its refs land in the served artifact
    hooks.transform(await readSource(appSvelte), appSvelte);
    await pollArtifact(hooks, artifactPath, (artifact) => artifact.includes("'md:copy_all'"));

    // the file is deleted — the transform never fires for it again, so
    // the watcher's unlink event must forget the module and refresh
    await rm(appSvelte);
    mock.emit('unlink', appSvelte);
    await pollArtifact(hooks, artifactPath, (artifact) => !artifact.includes("'md:copy_all'"));
    // back to the enabled-preset template member only
    expect(await hooks.load(artifactPath)).toContain('`md:${string}`');
  });

  test('a custom write target is excluded from the eager scan (M2)', async () => {
    const { root } = await freshFixture();
    const customTarget = join(root, 'src/generated/icons.gen.ts');
    await mkdir(dirname(customTarget), { recursive: true });
    // a stale artifact at the custom target carrying a tag-shaped
    // lookalike — the walk must never read the target it writes
    await writeFile(customTarget, '// generated\n// <Icon name="md:evil_icon" />\n', 'utf8');

    const { report } = await writeIconLibraryArtifact(LIBRARY, customTarget, undefined, root);
    // md:copy_all + md:home only — the lookalike inside the target
    // contributed nothing (before the fix the walk scanned the target,
    // collected md:evil_icon, and the named resolution error aborted)
    expect(report.iconCount).toBe(2);
    expect(await readSource(customTarget)).not.toContain('md:evil_icon');

    // and the freshness gate agrees against the same exclusion
    const check = await checkIconLibraryArtifact(LIBRARY, customTarget, undefined, root);
    expect(check.fresh).toBe(true);
  });
});
