// canvasPlugin() integration tests (typography-context-and-parts §7,
// design F5/F6/F8): the resolveId/load contract, the importer-derived
// page validation (the cross-page copy-paste kill), the `\0` + `?t=`
// id tolerance, addWatchFile (the HMR contract), the named-error
// overlay wraps, and REAL vite round-trips — a dev server serves the
// emitted module through ssrLoadModule and re-extracts on page edit,
// and a non-page importer of the specifier fails a real build by name.
import { realpathSync } from 'node:fs';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { build, createServer } from 'vite';
import type { Plugin } from 'vite';

import { canvasPlugin } from '../../src/index.ts';
import { CANVAS_MODULE_PREFIX } from '../../src/canvas/ids.js';

let fixtureRoot: string;
let pagePath: string;
const REL = 'docs/components/thing.html';
const SPECIFIER = `${CANVAS_MODULE_PREFIX}${REL}/+page`;
const RESOLVED_ID = `\0${SPECIFIER}`;

const PAGE_SOURCE = [
  '<ComponentCanvas id="demo" title="t">',
  '  <Thing rule="shadow" ruleSize={4}>the extracted body</Thing>',
  '  {#snippet playground()}',
  '    <p>pane chrome</p>',
  '  {/snippet}',
  '</ComponentCanvas>',
].join('\n');

beforeEach(async () => {
  fixtureRoot = await mkdtemp(join(tmpdir(), 'jixoai-canvas-plugin-'));
  await mkdir(join(fixtureRoot, 'src/routes', REL), { recursive: true });
  await writeFile(join(fixtureRoot, 'src/routes', REL, '+page.svelte'), PAGE_SOURCE, 'utf8');
  // vite hands hooks REALPATHed ids (macOS: /var → /private/var) —
  // compare against the canonical spelling from the start
  pagePath = realpathSync(join(fixtureRoot, 'src/routes', REL, '+page.svelte'));
});

/** the plugin with configResolved applied (root captured), ready for hook calls */
async function readyPlugin(root: string = fixtureRoot): Promise<Plugin> {
  const plugin = canvasPlugin();
  const resolved = plugin.configResolved as (config: { root: string }) => void;
  resolved({ root });
  return plugin;
}

/** a minimal rollup load() context capturing addWatchFile + this.error */
function loadContext(): {
  watched: string[];
  ctx: { addWatchFile(file: string): void; error(message: string): never };
} {
  const watched: string[] = [];
  return {
    watched,
    ctx: {
      addWatchFile(file: string) {
        watched.push(file);
      },
      error(message: string): never {
        throw new Error(message);
      },
    },
  };
}

describe('canvasPlugin resolveId (F5/F6)', () => {
  it('claims its own specifier with the \\0 prefix; passes everything else through', async () => {
    const plugin = await readyPlugin();
    const resolveId = plugin.resolveId as (
      id: string,
      importer: string | undefined,
    ) => string | null;
    expect(resolveId(SPECIFIER, pagePath)).toBe(RESOLVED_ID);
    expect(resolveId('/src/lib/thing.svelte', pagePath)).toBeNull();
    expect(resolveId('virtual:jixoai-ghostty', pagePath)).toBeNull();
    expect(resolveId('virtual:jixoai-canvas/not-a-page-form', pagePath)).toBeNull();
  });

  it('rejects a traversal rel by name', async () => {
    const plugin = await readyPlugin();
    const resolveId = plugin.resolveId as (
      id: string,
      importer: string | undefined,
    ) => string | null;
    expect(() => resolveId('virtual:jixoai-canvas/../../etc/+page', pagePath)).toThrow(
      /invalid canvas specifier/,
    );
  });

  it('rejects a cross-page importer by name (the F6 copy-paste kill)', async () => {
    const plugin = await readyPlugin();
    const resolveId = plugin.resolveId as (
      id: string,
      importer: string | undefined,
    ) => string | null;
    const otherPage = join(fixtureRoot, 'src/routes/docs/components/other.html/+page.svelte');
    expect(() => resolveId(SPECIFIER, otherPage)).toThrow(/may only be imported by its own page/);
    expect(() => resolveId(SPECIFIER, undefined)).toThrow(/may only be imported by its own page/);
  });
});

describe('canvasPlugin load (F5/F8 + the HMR contract)', () => {
  it('serves the emitted module: canvasIds + resolveRawCode; tolerates ?t=; watches the page', async () => {
    const plugin = await readyPlugin();
    const load = plugin.load as (
      this: { addWatchFile(file: string): void; error(message: string): never },
      id: string,
    ) => Promise<string | null>;

    const { watched, ctx } = loadContext();
    const code = await load.call(ctx, `${RESOLVED_ID}?t=1730000000000`);
    expect(watched).toEqual([pagePath]); // addWatchFile — the HMR contract
    expect(code).toContain('export const canvasIds = ["demo"];');
    expect(code).toContain('export function resolveRawCode(id)');
    // the dedented slice (the direct-child playground snippet stripped)
    expect(code).toContain('the extracted body');
    expect(code).toContain('ruleSize={4}');
    expect(code).not.toContain('pane chrome');
    expect(code).not.toContain('export default');
    // unrelated ids fall through
    expect(await load.call(ctx, '/src/entry.js')).toBeNull();
  });

  it('names the page when the derived route does not exist', async () => {
    const plugin = await readyPlugin();
    const load = plugin.load as (
      this: { addWatchFile(file: string): void; error(message: string): never },
      id: string,
    ) => Promise<string | null>;
    const { ctx } = loadContext();
    await expect(
      load.call(ctx, `\0${CANVAS_MODULE_PREFIX}docs/components/gone.html/+page`),
    ).rejects.toThrow(/cannot be read/);
  });

  it('wraps parse failures in the named error naming the page (the overlay pattern)', async () => {
    const brokenRel = 'broken.html';
    await mkdir(join(fixtureRoot, 'src/routes', brokenRel), { recursive: true });
    const brokenPath = join(fixtureRoot, 'src/routes', brokenRel, '+page.svelte');
    await writeFile(brokenPath, '<ComponentCanvas id="x">{#if no}</ComponentCanvas>', 'utf8');
    const broken = realpathSync(brokenPath);
    const plugin = await readyPlugin();
    const load = plugin.load as (
      this: { addWatchFile(file: string): void; error(message: string): never },
      id: string,
    ) => Promise<string | null>;
    const { ctx } = loadContext();
    // load() re-derives the page independently of resolveId (F5)
    await expect(
      load.call(ctx, `\0${CANVAS_MODULE_PREFIX}${brokenRel}/+page`),
    ).rejects.toThrow(
      new RegExp(`\\[jixoai-canvas\\] ${broken.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&')} did not parse`),
    );
  });
});

describe('canvasPlugin through a real vite dev server', () => {
  it('serves the module through the page-importer path; a page edit re-extracts (the addWatchFile HMR contract)', async () => {
    // a test bridge standing in for the svelte plugin: the page FILE is
    // served as a JS module importing the specifier, so vite's real
    // resolver runs our resolveId with the PAGE as importer (the honest
    // wiring the apps' svelte plugins provide)
    const pageBridge: Plugin = {
      name: 'test-page-bridge',
      enforce: 'pre', // run before vite's core fs loader
      load(id) {
        if (id === pagePath) {
          return `export { canvasIds, resolveRawCode } from '${SPECIFIER}';`;
        }
        return null;
      },
    };
    const server = await createServer({
      root: fixtureRoot,
      logLevel: 'silent',
      plugins: [pageBridge, canvasPlugin()],
    });
    try {
      await server.listen();
      const virtual = (await server.ssrLoadModule(pagePath)) as {
        canvasIds: readonly string[];
        resolveRawCode: (id: string) => string;
        default?: unknown;
      };
      expect(virtual.canvasIds).toEqual(['demo']);
      expect(virtual.resolveRawCode('demo')).toBe(
        '<Thing rule="shadow" ruleSize={4}>the extracted body</Thing>',
      );
      expect(virtual.default).toBeUndefined();

      // the HMR contract: a page edit + re-load re-extracts — the
      // virtual module watches the page (addWatchFile), so the change
      // invalidates it through vite's module graph
      await writeFile(
        pagePath,
        PAGE_SOURCE.replace('the extracted body', 'the EDITED body'),
        'utf8',
      );
      await vi.waitFor(async () => {
        const fresh = (await server.ssrLoadModule(`${pagePath}?t=${Date.now()}`)) as {
          resolveRawCode: (id: string) => string;
        };
        expect(fresh.resolveRawCode('demo')).toBe(
          '<Thing rule="shadow" ruleSize={4}>the EDITED body</Thing>',
        );
      });
    } finally {
      await server.close();
      await writeFile(pagePath, PAGE_SOURCE, 'utf8');
    }
  });

  it('a NON-page importer fails a real build with the named error', async () => {
    const entry = join(fixtureRoot, 'src/stray-importer.js');
    await writeFile(
      entry,
      `import { canvasIds } from '${SPECIFIER}';\nconsole.log(canvasIds);\n`,
      'utf8',
    );
    await expect(
      build({
        root: fixtureRoot,
        logLevel: 'silent',
        plugins: [canvasPlugin()],
        build: { ssr: entry, outDir: join(fixtureRoot, 'dist-stray') },
      }),
    ).rejects.toThrow(/may only be imported by its own page/);
  });
});
