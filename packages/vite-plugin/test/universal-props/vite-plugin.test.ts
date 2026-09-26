// the vite pass tests (explicit-props W2 task 2.5): transform-unit
// coverage (the injected virtual import, the diagnostics' warn/error
// split — `@md/` is §9's parse ERROR, the other three are warnings),
// the virtual css module contract, and ONE real vite build proving
// the desugared blocks ride the css pipeline end to end (via the
// `include` filter over a plain module — the .svelte face is covered
// by the transform units; the svelte vite plugin is not this
// package's dependency).
import { mkdtemp, readFile, readdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';
import { build } from 'vite';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createUniversalPropsPlugin } from '../../src/universal-props/vite-plugin.js';
import { jixoai } from '../../src/index.ts';

const asCtx = () => ({
  warn: vi.fn(),
  error: (e: Error): never => {
    throw e;
  },
});

let plugin: Plugin;
beforeEach(() => {
  plugin = createUniversalPropsPlugin();
});

const transform = (code: string, id: string) =>
  plugin.transform!.call(asCtx() as never, code, id) as { code: string } | null;

describe('the transform (unit)', () => {
  it('injects the virtual css import into the svelte script block', () => {
    const src = `<script>\n  import PressButton from './press-button.svelte';\n</script>\n<PressButton size={query({ sm: 'small' }, 'large')} />`;
    const out = transform(src, '/x/press-demo.svelte');
    expect(out).not.toBeNull();
    expect(out!.code).toMatch(/<script>\nimport 'virtual:jixoai-universal-props\/[0-9a-f]{12}\.css';/);
    expect(out!.code).toContain(`import PressButton from './press-button.svelte';`);
  });

  it('appends a fresh script block when the component has none', () => {
    const out = transform(`<button size={query({ sm: 'small' })}>go</button>`, '/x/bare.svelte');
    expect(out!.code).toContain("<script>\nimport 'virtual:jixoai-universal-props/");
    expect(out!.code.trimEnd().endsWith('</script>')).toBe(true);
  });

  it('serves the desugared blocks from the virtual module', async () => {
    const src = `<input size={query({ sm: 14, lg: 18 }, 16)} />`;
    const out = transform(src, '/x/sizes.svelte');
    const virtualId = /import '(virtual:jixoai-universal-props\/[0-9a-f]+\.css)';/.exec(out!.code)![1]!;
    const resolved = plugin.resolveId!.call(undefined as never, virtualId, undefined as never) as string;
    expect(resolved.startsWith('\0')).toBe(true);
    const css = (await plugin.load!.call(undefined as never, resolved)) as string;
    expect(css).toContain('@media (min-width: 40rem)');
    expect(css).toContain('--jx-size-effective: 14px');
    expect(css).toContain('@media (min-width: 64rem)');
    expect(css).toContain('--jx-size-effective: 18px');
  });

  it('skips non-svelte ids entirely (default scope)', () => {
    expect(transform(`const q = query({ sm: 1 });`, '/x/logic.ts')).toBeNull();
  });

  it('`@md/` fails the build (§9\'s parse error) naming the key and the rule', () => {
    const src = `<input size={query({ '@md/': 'large' })} />`;
    expect(() => transform(src, '/x/bad.svelte')).toThrowError(/NON-EMPTY name segment/);
  });

  it('unknown scale + duplicate key + missing container ancestor are WARNINGS', () => {
    const src = [
      '<style>.card { color: red; }</style>',
      `<input size={query({ xl: 'large' })} />`,
      `<input size={query({ sm: 'small', sm: 'large' })} />`,
      `<input size={query({ '@sm': 'small' })} />`,
    ].join('\n');
    const ctx = asCtx();
    plugin.transform!.call(ctx as never, src, '/x/warns.svelte');
    const messages = ctx.warn.mock.calls.map((c) => String(c[0]?.message ?? c[0]));
    expect(messages.some((m) => m.includes("'xl'") && m.includes('not in the registered scale'))).toBe(true);
    expect(messages.some((m) => m.includes('appears twice'))).toBe(true);
    expect(messages.some((m) => m.includes('no qualifying ancestor'))).toBe(true);
  });
});

describe('one real vite build (the css pipeline end to end)', () => {
  it('emits the desugared block into the bundle css', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'jx-up-'));
    const entry = join(dir, 'query-fixture.ts');
    await writeFile(
      entry,
      [
        '// a fixture module whose SOURCE carries a literal query() call in',
        '// the props-object authoring shape ({ axis: query(…) }); the',
        '// container-supply note satisfies the file heuristic (the real',
        '// container-type: inline-size is the consumer css\'s job)',
        'export const props = { size: query({ sm: 14, "@sm": 18 }, 16) };',
        'export default props;',
      ].join('\n'),
      'utf8',
    );
    const out = await build({
      configFile: false,
      logLevel: 'silent',
      root: dir,
      plugins: [
        createUniversalPropsPlugin({ include: [/query-fixture\.ts$/] }),
      ],
      build: {
        write: true,
        outDir: 'dist',
        cssCodeSplit: false,
        rollupOptions: { input: entry },
      },
    });
    void out;
    const dist = join(dir, 'dist');
    const walk = async (rel: string): Promise<string[]> => {
      const entries = await readdir(join(dist, rel), { withFileTypes: true });
      const nested = await Promise.all(
        entries.map((e) =>
          e.isDirectory()
            ? walk(rel ? `${rel}/${e.name}` : e.name)
            : Promise.resolve([rel ? `${rel}/${e.name}` : e.name]),
        ),
      );
      return nested.flat();
    };
    const files = await walk('');
    const cssFile = files.find((f) => f.endsWith('.css'));
    expect(cssFile).toBeDefined();
    const css = await readFile(join(dist, cssFile!), 'utf8');
    // vite's css minifier rewrites `(min-width: 40rem)` to `width>=40rem`
    // — assert on the threshold + the ladder's emission ORDER (the
    // narrower @sm container block precedes the wider sm media block)
    expect(css).toContain('width>=40rem');
    expect(css).toContain('--jx-size-effective:14px');
    expect(css).toContain('width>=24rem');
    expect(css).toContain('--jx-size-effective:18px');
    expect(css.indexOf('width>=24rem')).toBeLessThan(css.indexOf('width>=40rem'));
  }, 60_000);
});

describe('the jixoai() umbrella wiring', () => {
  it('default OFF (the site owes nothing until W3 wires the attribute)', () => {
    expect(jixoai({ ghostty: false }).every((p) => p.name !== 'jixoai:universal-props')).toBe(true);
  });
  it('a bare {} opts in and the pass registers', () => {
    const plugins = jixoai({ ghostty: false, universalProps: {} });
    expect(plugins.some((p) => p.name === 'jixoai:universal-props')).toBe(true);
  });
  it('the frozen export entry exists in package.json (§9.1)', async () => {
    const pkg = JSON.parse(
      await readFile(
        fileURLToPath(new URL('../../package.json', import.meta.url)),
        'utf8',
      ),
    );
    expect(pkg.exports['./universal-props/query-shim']).toEqual({
      types: './dist/query-shim.d.ts',
      import: './dist/query-shim.js',
    });
    expect(pkg.exports['./universal-props']).toEqual({
      types: './dist/universal-props.d.ts',
      import: './dist/universal-props.js',
    });
  });
});
