/**
 * stamp plugin tests — the vite wiring around the pure transform
 * (design-studio-r2 T0): consumer detection, definition exclusion,
 * alias-base resolution, and the VD3 production-cleanliness posture.
 *
 * Original need: design-studio-r2 tasks.md T0 (2026-09-11). VD3 note:
 * a full vite BUILD assertion would need the whole svelte plugin
 * matrix inside a unit test; the honest cheap guarantee is the
 * plugin's `apply: 'serve'` (vite's own build filtering skips it)
 * plus its single registration site (createDesignViteServer — a
 * createServer factory, never a build pipeline).
 */

import { strict as assert } from 'node:assert';
import { copyFileSync, mkdtempSync, rmSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

import type { DesignHostInfo } from '../probe.ts';
import { buildStampHmrPlugin, buildStampPlugin } from './plugin.ts';
import { STAMP_COMPONENT_ATTR, USAGE_MAP_EXPORT } from './transform.ts';

/** a minimal-but-complete host info for the plugin's two anchors */
function fakeHost(itemAliasBase = '/host/project/ui'): DesignHostInfo {
  return {
    kind: 'consumer',
    root: '/host/project',
    designDir: '/host/project/design',
    itemAliases: {},
    itemAliasBase,
    libAliasBase: '/host/project/src/lib',
    appCss: null,
    tailwindContentRoots: ['/host/project'],
    moduleRoot: null,
  };
}

/** fake vite plugin context: a specifier → resolved-path table */
function fakeContext(resolutions: Readonly<Record<string, string>>): { resolve: (spec: string) => Promise<{ id: string } | null> } {
  return {
    resolve: async (spec) => {
      const id = resolutions[spec];
      return id === undefined ? null : { id };
    },
  };
}

const USAGE = `<script module>import P from '#jixoai/press-button';</script>\n<P variant="fill">go</P>`;

test('plugin stamps a prototype module and emits the usage map', async () => {
  const plugin = buildStampPlugin({ host: fakeHost() });
  const context = fakeContext({});
  const result = await plugin.transform!.call(context as never, USAGE, '/host/project/design/prototypes/demo/pages/hero.svelte');
  assert.notEqual(result, null);
  assert.equal((result as { code: string }).code.includes(`${STAMP_COMPONENT_ATTR}="press-button"`), true);
  assert.equal((result as { code: string }).code.includes(USAGE_MAP_EXPORT), true);
});

test('definitions under itemAliasBase are never stamped (never the component files)', async () => {
  const plugin = buildStampPlugin({ host: fakeHost() });
  const result = await plugin.transform!.call(fakeContext({}) as never, USAGE, '/host/project/ui/press-button/press-button.svelte');
  assert.equal(result, null);
});

test('consumer-host imports resolving under the alias base bind (the itemAliasBase anchor)', async () => {
  const plugin = buildStampPlugin({ host: fakeHost() });
  const source = `<script>import PressButton from '$lib/press-button';</script>\n<PressButton>go</PressButton>`;
  const context = fakeContext({ '$lib/press-button': '/host/project/ui/press-button/index.ts' });
  const result = await plugin.transform!.call(context as never, source, '/host/project/src/routes/+page.svelte');
  assert.notEqual(result, null);
  assert.equal((result as { code: string }).code.includes(`${STAMP_COMPONENT_ATTR}="press-button"`), true);
});

test('imports resolving OUTSIDE the alias base never bind (local components stay unstamped)', async () => {
  const plugin = buildStampPlugin({ host: fakeHost() });
  const source = `<script>import Local from './Local.svelte';</script>\n<Local>go</Local>`;
  const context = fakeContext({ './Local.svelte': '/host/project/src/lib/Local.svelte' });
  const result = await plugin.transform!.call(context as never, source, '/host/project/src/routes/+page.svelte');
  assert.equal(result, null);
});

test('svelte internals and node builtins skip resolution entirely', async () => {
  const plugin = buildStampPlugin({ host: fakeHost() });
  const source = `<script>import { onMount } from 'svelte';</script>\n<Local>go</Local>`;
  let resolved = 0;
  const context = { resolve: async () => { resolved += 1; return null; } };
  const result = await plugin.transform!.call(context as never, source, '/host/project/src/routes/+page.svelte');
  assert.equal(result, null);
  assert.equal(resolved, 0);
});

test('non-svelte modules and empty-candidate sources are untouched', async () => {
  const plugin = buildStampPlugin({ host: fakeHost() });
  const context = fakeContext({});
  assert.equal(await plugin.transform!.call(context as never, 'export const x = 1;', '/host/project/src/mod.ts'), null);
  assert.equal(await plugin.transform!.call(context as never, '<div>plain markup, no imports, no caps tags</div>', '/host/project/src/plain.svelte'), null);
});

test('VD3 posture: dev-only by construction (apply serve + enforce pre)', async () => {
  const plugin = buildStampPlugin({ host: fakeHost() });
  // vite's own build filtering honors apply — 'serve' never enters a
  // build pipeline; the only registration site is createDesignViteServer
  assert.equal(plugin.apply, 'serve');
  assert.equal(plugin.enforce, 'pre');
  assert.equal(plugin.name, 'jixoai-design-stamp');
});

/* ── the #28 HMR acceptance broadener ─────────────────────────────────── */

/** the compiled-module shape vite-plugin-svelte emits for a stamped file */
const COMPILED_STAMPED = [
  'import { createHotContext as __vite__createHotContext } from "/@vite/client";',
  'import.meta.hot = __vite__createHotContext("/design/prototypes/demo/pages/hero.svelte");',
  `export const ${USAGE_MAP_EXPORT} = {"1":{"component":"press-button"}};`,
  'if (import.meta.hot) {',
  '\timport.meta.hot.acceptExports(["default"],(module) => {',
  '\t\tHero = module.default;',
  '\t});',
  '}',
].join('\n');

test('#28 the broadener widens the accept set on stamped compiled modules', async () => {
  const plugin = buildStampHmrPlugin();
  assert.equal(plugin.name, 'jixoai-design-stamp-hmr');
  assert.equal(plugin.enforce, 'post');
  const result = await plugin.transform!.call(
    {} as never,
    COMPILED_STAMPED,
    '/design/prototypes/demo/pages/hero.svelte',
  );
  assert.notEqual(result, null, 'a stamped compiled module is amended');
  const code = (result as { code: string }).code;
  assert.equal(code.includes('acceptExports(["default", "__jxUsageMap"]'), true, 'the export joins the acceptance');
  assert.equal(code.includes('acceptExports(["default"],'), false, 'the narrow form is gone');
});

test('#28 the broadener leaves plain modules and sub-requests untouched', async () => {
  const plugin = buildStampHmrPlugin();
  // a plain compiled component (no usage map) is none of its business
  const plain = 'import.meta.hot.acceptExports(["default"],(module) => {});';
  assert.equal(await plugin.transform!.call({} as never, plain, '/src/App.svelte'), null);
  // style sub-requests never carry the accept call
  assert.equal(
    await plugin.transform!.call({} as never, `export const ${USAGE_MAP_EXPORT} = {};`, '/x/y.svelte?svelte&type=style&lang.css'),
    null,
  );
});

/* ── the #38 B4 law: the broadener holds on REAL vite-plugin-svelte
      output — the acceptance covers the textSpans-bearing map without
      ever growing the export set (which would mean full-reload) ──────── */

function resolvePathUp(levels: number): string {
  return dirname(join(fileURLToPath(import.meta.url), ...Array.from({ length: levels }, () => '..')));
}

const WORKTREE_ROOT = resolvePathUp(5);
const REAL_HERO = join(WORKTREE_ROOT, 'design/prototypes/welcome/pages/hero.svelte');
const REAL_ITEMS = join(WORKTREE_ROOT, 'registry/files/ui');

test('#38 the broadened acceptance rides REAL vite-plugin-svelte output (dev transform of the real hero.svelte)', async () => {
  const { createServer } = await import('vite');
  const { svelte } = await import('@sveltejs/vite-plugin-svelte');
  // the temp vite root lives INSIDE the package (not os.tmpdir): the
  // compiled module's `svelte/internal/*` imports must resolve through
  // the package's node_modules chain like any real consumer
  const root = mkdtempSync(join(resolvePathUp(3), '.tmp-broadener-'));
  try {
    // the REAL welcome hero, byte-identical (Heading/P/PressButton text
    // children included — the textSpans-bearing shape this issue ships)
    copyFileSync(REAL_HERO, join(root, 'hero.svelte'));
    const server = await createServer({
      root,
      configFile: false,
      envDir: false,
      appType: 'custom',
      logLevel: 'error',
      plugins: [buildStampPlugin({ host: fakeHost() }), buildStampHmrPlugin(), svelte()],
      resolve: { alias: [{ find: /^#jixoai\//, replacement: `${REAL_ITEMS.replaceAll('\\', '/')}/` }] },
      server: { middlewareMode: true },
      optimizeDeps: { noDiscovery: true },
    });
    try {
      const result = await server.transformRequest('/hero.svelte');
      assert.notEqual(result, null, 'the real hero transformed');
      const code = result!.code;
      // REAL compiled self-acceptance, broadened: textSpans are a FIELD
      // of __jxUsageMap, so ["default", "__jxUsageMap"] stays SUFFICIENT
      assert.ok(
        code.includes('acceptExports(["default", "__jxUsageMap"]'),
        'the broadened set is present on real vite-plugin-svelte output',
      );
      assert.ok(!code.includes('acceptExports(["default"],'), 'the narrow acceptance never survives');
      // the stamp export (now textSpans-bearing) rode the real compile
      assert.ok(code.includes(USAGE_MAP_EXPORT), 'the usage-map export is in the compiled module');
      assert.ok(code.includes('"textSpans"'), 'the compiled map carries the textSpans field');
      // and the module still exports nothing BEYOND the two accepted names
      const constExports = [...code.matchAll(/\bexport\s+const\s+(\w+)/g)].map((m) => m[1]);
      assert.deepEqual(constExports, [USAGE_MAP_EXPORT], 'no third export appeared');
    } finally {
      await server.close();
    }
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
