/**
 * umbrella-bridge.test.ts — the bridge delegating end-to-end across the
 * config matrix (A5, design §9): jixoai() stays sync and returns the
 * 'jixoai-icons' bridge whose hooks load the real icon plugin through
 * ONE memoized dynamic import. Behavior is indistinguishable from the
 * pre-bridge direct wiring:
 *
 *   - provider-only: the CSS module byte-matches the COMMITTED GOLDEN
 *     fixture (frozen pre-change output — the regression lock)
 *   - library-only: no CSS module content; artifact + chunk serving work
 *   - both: independent modules in one plugin
 *   - the bridge's resolveId stays SYNCHRONOUS for virtual ids
 */

import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import { afterAll, describe, expect, test } from 'vitest';
import { jixoai } from '../../../src/index.ts';
import { lucideIconProvider } from '../../../src/icons/providers/lucide.js';
import { md } from '../../../src/icons/library/channel/material.js';
import { VIRTUAL_MODULE_ID } from '../../../src/icons/ids.js';

// the scanner fixtures' tmp roots (cleaned once at the end)
const fixtureRoots: string[] = [];
afterAll(async () => {
  for (const root of fixtureRoots) await rm(root, { recursive: true, force: true });
});

interface PluginLifecycle {
  buildStart(): Promise<void>;
  resolveId(id: string, importer?: string): string | null;
  load(id: string): Promise<string | null>;
}

const lifecycle = (plugin: Plugin): PluginLifecycle => plugin as unknown as PluginLifecycle;

const GOLDEN = fileURLToPath(new URL('./golden/provider-only.css', import.meta.url));

const loadCss = async (plugin: Plugin): Promise<string> => {
  const { buildStart, resolveId, load } = lifecycle(plugin);
  const resolved = resolveId(VIRTUAL_MODULE_ID, '/app/src/app.css');
  expect(resolved).toBeTruthy();
  await buildStart();
  const css = await load(resolved!);
  expect(css).toBeTruthy();
  return css!;
};

describe('the provider-only row is regression-locked against the GOLDEN fixture', () => {
  test('the emitted CSS module is byte-identical to the frozen pre-change output', async () => {
    const plugins = jixoai({ icons: { provider: lucideIconProvider() } });
    const bridge = plugins.find((plugin) => plugin.name === 'jixoai-icons');
    expect(bridge).toBeDefined();
    const css = await loadCss(bridge!);
    const golden = await readFile(GOLDEN, 'utf8');
    expect(css).toBe(golden);
  });
});

describe('the bridge delegates the full matrix (design §9)', () => {
  test('provider-only: sync resolveId for virtual ids; byte-matches the golden', async () => {
    const bridge = jixoai({ icons: { provider: lucideIconProvider() } })
      .find((plugin) => plugin.name === 'jixoai-icons')!;
    // the frozen pre-bridge surface: resolveId returns a STRING (sync)
    const resolved = lifecycle(bridge).resolveId(VIRTUAL_MODULE_ID, '/app/src/app.css');
    expect(typeof resolved).toBe('string');
    const css = await loadCss(bridge);
    expect(css).toBe(await readFile(GOLDEN, 'utf8'));
  });

  test('library-only: the artifact + lazy chunks serve; the CSS module carries no content', async () => {
    const bridge = jixoai({
      icons: {
        library: {
          includeDefaults: false,
          icons: { bridgeIcon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M1 1l2 2"/></svg>' },
        },
      },
    }).find((plugin) => plugin.name === 'jixoai-icons')!;
    const { buildStart, resolveId, load } = lifecycle(bridge);
    await buildStart();

    // chunk ids resolve synchronously through the bridge
    expect(resolveId('virtual:jixoai-icons/chunk/0', '/app/src/lib/icon-set.gen.ts')).toBe(
      '\0virtual:jixoai-icons/chunk/0',
    );

    const css = await load(resolveId(VIRTUAL_MODULE_ID, '/app/src/app.css')!);
    expect(css).not.toContain('--jx-icon-'); // no CSS module emitted
  });

  test('both faces: one plugin, independent modules (CSS golden + artifact)', async () => {
    const bridge = jixoai({
      icons: {
        provider: lucideIconProvider(),
        library: { includeDefaults: false, icons: { bothIcon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M2 2l4 4"/></svg>' } },
      },
    }).find((plugin) => plugin.name === 'jixoai-icons')!;
    const { buildStart, resolveId, load } = lifecycle(bridge);
    await buildStart();

    // slot face: golden CSS (the library face added nothing to it)
    const css = await load(resolveId(VIRTUAL_MODULE_ID, '/app/src/app.css')!);
    expect(css).toBe(await readFile(GOLDEN, 'utf8'));

    // library face: the artifact serves (artifact claims defer to the
    // delegate — an async resolveId is fine for vite and for this await)
    const artifactPath = await (resolveId(`${process.cwd()}/src/lib/icon-set.gen.ts`, undefined) as
      | string
      | null
      | Promise<string | null>);
    expect(artifactPath).toBeTruthy();
    const artifact = await load(artifactPath!);
    expect(artifact).toContain("'bothIcon'");
  });

  test('the unwired overflow sentinel fires synchronously through the bridge', () => {
    const bridge = jixoai({ icons: { provider: lucideIconProvider() } }).find(
      (plugin) => plugin.name === 'jixoai-icons',
    );
    expect(bridge).toBeDefined();
    // provider configured, library NOT: chunk ids throw the named error
    expect(() =>
      lifecycle(bridge!).resolveId('virtual:jixoai-icons/chunk/1', '/app/src/lib/icon-set.gen.ts'),
    ).toThrowError(
      '[jixoai/icon-set] virtual:jixoai-icons/chunk/* imported but no icons library is configured — wire jixoai({ icons: { library } }) in your vite plugins (see the icon-set item docs)',
    );
  });
});

describe('the bridge delegates the prefix compiler\'s transform (icon-prefix-compiler C2)', () => {
  interface BridgeLifecycle {
    configResolved(config: { root: string; command?: string }): Promise<void> | void;
    buildStart(): Promise<void>;
    load(id: string): Promise<string | null>;
    transform(code: string, id: string): Promise<{ code: string; map: null } | null> | { code: string; map: null } | null;
  }

  const bridgeLifecycle = (plugin: Plugin): BridgeLifecycle => plugin as unknown as BridgeLifecycle;

  test('an umbrella consumer gets the scanner — a scanned ref lands in the served artifact', async () => {
    const root = await mkdtemp(join(tmpdir(), 'jixoai-bridge-scan-'));
    fixtureRoots.push(root);
    const appSvelte = join(root, 'src/App.svelte');
    await mkdir(dirname(appSvelte), { recursive: true });
    await writeFile(appSvelte, '<Icon name="md:home" />\n', 'utf8');

    const bridge = jixoai({
      icons: { library: { includeDefaults: false, channels: [md()] } },
    }).find((plugin) => plugin.name === 'jixoai-icons')!;
    const hooks = bridgeLifecycle(bridge);
    await hooks.configResolved({ root, command: 'serve' });
    await hooks.buildStart();

    // the collector rides the delegate THROUGH the bridge — and never
    // rewrites the module (null pass-through)
    expect(await hooks.transform(await readFile(appSvelte, 'utf8'), appSvelte)).toBeNull();

    const artifactPath = join(root, 'src/lib/icon-set.gen.ts');
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const artifact = (await hooks.load(artifactPath)) ?? '';
      if (artifact.includes("'md:home'")) {
        expect(artifact).toContain('`md:${string}`');
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    throw new Error('the scanned ref never reached the bridge-served artifact');
  });

  test('the no-library fast path returns null without touching the delegate', async () => {
    const bridge = jixoai({
      icons: { library: { includeDefaults: false, icons: { plain: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"/>' } } },
    }).find((plugin) => plugin.name === 'jixoai-icons')!;
    const result = await bridgeLifecycle(bridge).transform('<Icon name="md:home" />', '/app/src/App.svelte');
    expect(result).toBeNull();
  });

  test('a lucide: literal scans through the bridge with ZERO channels (default-registered)', async () => {
    // icon-channel-api design §1: lucide is default-registered, so the
    // old no-presets fast path is GONE — a bare lucide: literal must
    // reach the collector for umbrella consumers too
    const root = await mkdtemp(join(tmpdir(), 'jixoai-bridge-lucide-'));
    fixtureRoots.push(root);
    const appSvelte = join(root, 'src/App.svelte');
    await mkdir(dirname(appSvelte), { recursive: true });
    await writeFile(appSvelte, '<Icon name="lucide:zap" />\n', 'utf8');

    const bridge = jixoai({ icons: { library: { includeDefaults: false } } }).find(
      (plugin) => plugin.name === 'jixoai-icons',
    )!;
    const hooks = bridgeLifecycle(bridge);
    await hooks.configResolved({ root, command: 'serve' });
    await hooks.buildStart();
    expect(await hooks.transform(await readFile(appSvelte, 'utf8'), appSvelte)).toBeNull();

    const artifactPath = join(root, 'src/lib/icon-set.gen.ts');
    for (let attempt = 0; attempt < 100; attempt += 1) {
      const artifact = (await hooks.load(artifactPath)) ?? '';
      if (artifact.includes("'lucide:zap'")) {
        expect(artifact).toContain('`lucide:${string}`');
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 10));
    }
    throw new Error('the scanned lucide ref never reached the bridge-served artifact');
  });
});
