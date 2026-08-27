// Plugin integration tests (design.md D3/D7):
//   build (lib mode): emitFile inside load(), real dist file name =
//     assets/ghostty-vt-<sha16>.wasm, the built module imports in node
//     with a usable url (import.meta.ROLLUP_FILE_URL_<ref> resolved);
//   build (browser JS input): the emitted entry references the frozen
//     asset name and the asset is byte-identical;
//   SSR build: no client asset emitted, url carries the asset name string;
//   dev: middleware serves application/wasm + immutable at the
//     content-addressed path; the virtual module exports pure data.
//
// Test-engineering note (rolldown/vite 8): a browser JS-input entry that
// only re-exports pure data is legitimately tree-shaken to an empty
// chunk — the fixtures below keep a side effect / use lib mode, which is
// also why the "import the built bundle" assertion runs in lib mode.
//
// The wasm bytes come from the shared test asset helper (research copies
// or the verified resolver cache); the plugin is driven offline against
// a seeded cache so the suite is deterministic.

import { mkdir, mkdtemp, readdir, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { build, createServer } from 'vite';

import { jixoaiGhostty } from '../src/index.ts';
import { readPin } from '../src/pin.ts';
import { loadWasmBytes } from './helpers.ts';

let bytes: Uint8Array | undefined;
let pinSha: string;
let pinSha16: string;
let pinBuildInfo: string;

beforeAll(async () => {
  bytes = await loadWasmBytes('full');
  const pin = await readPin(fileURLToPath(new URL('../ghostty.pin.json', import.meta.url)));
  pinSha = pin.variants.full.sha256;
  pinSha16 = pinSha.slice(0, 16);
  pinBuildInfo = pin.variants.full.buildInfo;
});

let outRoot: string;
let fixtureRoot: string;
let cacheDir: string;

beforeEach(async () => {
  outRoot = await mkdtemp(join(tmpdir(), 'jixoai-plugin-'));
  fixtureRoot = join(outRoot, 'fixture');
  cacheDir = join(outRoot, 'cache');
  if (bytes !== undefined) {
    await mkdir(cacheDir, { recursive: true });
    await writeFile(join(cacheDir, `${pinSha}.wasm`), bytes);
  }
});

async function writeFixture(entryCode: string): Promise<void> {
  await mkdir(join(fixtureRoot, 'src'), { recursive: true });
  await writeFile(join(fixtureRoot, 'src', 'entry.js'), entryCode);
}

async function walk(dir: string, base: string): Promise<string[]> {
  const out: string[] = [];
  for (const f of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, f.name);
    if (f.isDirectory()) out.push(...(await walk(p, base)));
    else out.push(p.slice(base.length + 1));
  }
  return out;
}

describe('jixoaiGhostty() build', () => {
  it('lib mode: emits the content-addressed asset and a node-importable module', async (ctx) => {
    if (bytes === undefined) return ctx.skip('wasm unavailable offline');
    await writeFixture(
      [
        "import { url, sha256, variant, buildInfo } from 'virtual:jixoai-ghostty';",
        'export { url, sha256, variant, buildInfo };',
      ].join('\n'),
    );
    const outDir = join(outRoot, 'dist-lib');

    await build({
      root: fixtureRoot,
      logLevel: 'silent',
      plugins: jixoaiGhostty({ cacheDir, offline: true }),
      build: {
        outDir,
        emptyOutDir: true,
        lib: { entry: join(fixtureRoot, 'src', 'entry.js'), formats: ['es'] },
      },
    });

    // exactly one wasm, under the frozen name, byte-identical
    const assetPath = join(outDir, 'assets', `ghostty-vt-${pinSha16}.wasm`);
    expect(new Uint8Array(await readFile(assetPath))).toEqual(bytes);
    const wasmAssets = (await walk(outDir, outDir)).filter((f) => f.endsWith('.wasm'));
    expect(wasmAssets).toEqual([`assets/ghostty-vt-${pinSha16}.wasm`]);

    // the built module imports cleanly in node and hands over the data
    const entry = join(outDir, 'entry.mjs');
    const mod = (await import(pathToFileURL(entry).href)) as {
      url: string;
      sha256: string;
      variant: string;
      buildInfo: string;
    };
    expect(mod.url.endsWith(`assets/ghostty-vt-${pinSha16}.wasm`)).toBe(true);
    expect(new URL(mod.url).protocol).toBe('file:');
    expect(mod.sha256).toBe(pinSha);
    expect(mod.variant).toBe('full');
    expect(mod.buildInfo).toBe(pinBuildInfo);
  });

  it('browser JS input: emitted entry references the frozen asset name', async (ctx) => {
    if (bytes === undefined) return ctx.skip('wasm unavailable offline');
    await writeFixture(
      [
        "import { url } from 'virtual:jixoai-ghostty';",
        'console.log(url); // keep the reference alive through tree-shaking',
      ].join('\n'),
    );
    const outDir = join(outRoot, 'dist-browser');

    await build({
      root: fixtureRoot,
      logLevel: 'silent',
      plugins: jixoaiGhostty({ cacheDir, offline: true }),
      build: {
        outDir,
        emptyOutDir: true,
        rollupOptions: { input: join(fixtureRoot, 'src', 'entry.js') },
      },
    });

    expect(new Uint8Array(await readFile(join(outDir, 'assets', `ghostty-vt-${pinSha16}.wasm`)))).toEqual(bytes);
    const jsFiles = (await walk(outDir, outDir)).filter((f) => f.endsWith('.js'));
    expect(jsFiles.length).toBeGreaterThan(0);
    const code = await Promise.all(jsFiles.map((f) => readFile(join(outDir, f), 'utf8')));
    expect(code.some((c) => c.includes(`ghostty-vt-${pinSha16}.wasm`))).toBe(true);
  });

  it('SSR builds emit no client asset', async (ctx) => {
    if (bytes === undefined) return ctx.skip('wasm unavailable offline');
    await writeFixture(
      [
        "import { url } from 'virtual:jixoai-ghostty';",
        'console.log(url);',
      ].join('\n'),
    );
    const outDir = join(outRoot, 'dist-ssr');

    await build({
      root: fixtureRoot,
      logLevel: 'silent',
      plugins: jixoaiGhostty({ cacheDir, offline: true }),
      build: {
        outDir,
        emptyOutDir: true,
        ssr: join(fixtureRoot, 'src', 'entry.js'),
      },
    });

    const files = await walk(outDir, outDir);
    expect(files.filter((f) => f.endsWith('.wasm'))).toEqual([]);
    expect(files.some((f) => f.startsWith('assets/'))).toBe(false);
    const ssrEntry = files.find((f) => f.endsWith('.mjs') || f.endsWith('.js'));
    expect(ssrEntry).toBeDefined();
    const code = await readFile(join(outDir, ssrEntry!), 'utf8');
    expect(code).toContain(`assets/ghostty-vt-${pinSha16}.wasm`); // same-name string, unused server-side
  });
});

describe('jixoaiGhostty() dev middleware', () => {
  it('serves application/wasm immutable at the content-addressed path', async (ctx) => {
    if (bytes === undefined) return ctx.skip('wasm unavailable offline');
    await writeFixture("import { url } from 'virtual:jixoai-ghostty';\nconsole.log(url);\n");
    const servePath = `/@jixoai/ghostty-vt-${pinSha16}.wasm`;

    const server = await createServer({
      root: fixtureRoot,
      logLevel: 'silent',
      plugins: jixoaiGhostty({ cacheDir, offline: true }),
    });
    try {
      await server.listen();
      const base = server.resolvedUrls?.local?.[0];
      expect(base).toBeDefined();

      const res = await fetch(`${base}${servePath.slice(1)}`);
      expect(res.status).toBe(200);
      expect(res.headers.get('content-type')).toBe('application/wasm');
      expect(res.headers.get('cache-control')).toContain('max-age=31536000');
      expect(res.headers.get('cache-control')).toContain('immutable');
      expect(new Uint8Array(await res.arrayBuffer())).toEqual(bytes);

      // unknown /@jixoai paths fall through to vite (404), never our bytes
      const miss = await fetch(`${base}@jixoai/ghostty-vt-deadbeefdeadbeef.wasm`);
      expect(miss.status).toBe(404);

      // server consumer (ssrLoadModule): no emit, url carries the
      // would-be asset name (the field is unused server-side)
      const mod = (await server.ssrLoadModule('virtual:jixoai-ghostty')) as {
        url: string;
        sha256: string;
        variant: string;
        buildInfo: string;
      };
      expect(mod.url).toBe(`assets/ghostty-vt-${pinSha16}.wasm`);
      expect(mod.sha256).toBe(pinSha);
      expect(mod.variant).toBe('full');
      expect(mod.buildInfo).toBe(pinBuildInfo);

      // client consumer (dev transform over HTTP): the virtual module
      // code carries the middleware path + the same pure data
      const entryRes = await fetch(`${base}src/entry.js`);
      expect(entryRes.status).toBe(200);
      const entryCode = await entryRes.text();
      const virtualImport = entryCode.match(/(["'])(\/@id\/__x00__virtual:jixoai-ghostty)\1/);
      expect(virtualImport).not.toBeNull();
      const virtRes = await fetch(`${base}${virtualImport![2]!.slice(1)}`);
      expect(virtRes.status).toBe(200);
      const virtCode = await virtRes.text();
      expect(virtCode).toContain(`export const url = ${JSON.stringify(servePath)}`);
      expect(virtCode).toContain(`export const sha256 = ${JSON.stringify(pinSha)}`);
      expect(virtCode).toContain(`export const variant = "full"`);
      expect(virtCode).toContain(`export const buildInfo = ${JSON.stringify(pinBuildInfo)}`);
    } finally {
      await server.close();
    }
  });
});
