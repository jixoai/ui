// Vite 8 native wasm behavior fixture (design.md D1 matrix lock).
//
// Purpose: freeze the documented vite@8 (rolldown) behaviors so a vite
// upgrade that changes them fails here instead of silently invalidating
// the design conclusion ("no native form fits a release-downloaded
// wasm"):
//   bare import   -> auto-instantiate glue, wasm emitted to dist
//   ?init import  -> init factory, wasm emitted to dist
//   ?url import   -> URL string, wasm emitted to dist
//   publicDir     -> verbatim copy, no hash, no verification
// Plus the pin-binary wasm table sentinel (imports=[], exports include
// the required families; exact counts from the briefs' fact baseline).

import { mkdir, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeAll, beforeEach, afterAll, describe, expect, it } from 'vitest';
import { build } from 'vite';

import { loadWasmBytes } from './helpers.ts';

// (module (type (func)) (func) (export "foo" (func 0)) (code))
const MINIMAL_WASM = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x04, 0x01, 0x60, 0x00, 0x00, 0x03, 0x02,
  0x01, 0x00, 0x07, 0x07, 0x01, 0x03, 0x66, 0x6f, 0x6f, 0x00, 0x00, 0x0a, 0x04, 0x01, 0x02, 0x00,
  0x0b,
]);

/** Same valid module + a custom section tag, so each fixture file has a
 *  distinct content hash (rolldown dedupes byte-identical assets). */
function taggedMinimalWasm(tag: string): Uint8Array {
  const name = new TextEncoder().encode(`jixoai-${tag}`);
  const content = [name.length, ...name]; // custom-section name, no payload
  return new Uint8Array([...MINIMAL_WASM, 0x00, content.length, ...content]);
}

let outRoot: string;
let fixtureRoot: string;
let outDir: string;

beforeAll(async () => {
  outRoot = await mkdtemp(join(tmpdir(), 'jixoai-native-'));
});

afterAll(async () => {
  await rm(outRoot, { recursive: true, force: true });
});

beforeEach(async () => {
  fixtureRoot = join(outRoot, `fixture-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  outDir = join(fixtureRoot, 'dist');
  await mkdir(join(fixtureRoot, 'src', 'wasm'), { recursive: true });
  await mkdir(join(fixtureRoot, 'public'), { recursive: true });

  await writeFile(join(fixtureRoot, 'src', 'wasm', 'bare.wasm'), taggedMinimalWasm('bare'));
  await writeFile(join(fixtureRoot, 'src', 'wasm', 'init.wasm'), taggedMinimalWasm('init'));
  await writeFile(join(fixtureRoot, 'src', 'wasm', 'url.wasm'), taggedMinimalWasm('url'));
  await writeFile(join(fixtureRoot, 'public', 'copy.wasm'), taggedMinimalWasm('copy'));

  await writeFile(
    join(fixtureRoot, 'src', 'entry.js'),
      [
      // vite 8 bare-import glue re-exports the instance's NAMED exports
      // (no default) — see generateInstanceGlue in vite's wasm plugin.
      "import * as bare from './wasm/bare.wasm';",
      "import init from './wasm/init.wasm?init';",
      "import url from './wasm/url.wasm?url';",
      'console.log(bare.foo, typeof init, url);',
      ].join('\n'),
  );
});

async function walk(dir: string, base: string): Promise<string[]> {
  const out: string[] = [];
  for (const f of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, f.name);
    if (f.isDirectory()) out.push(...(await walk(p, base)));
    else out.push(p.slice(base.length + 1));
  }
  return out;
}

describe('vite@8 native wasm forms (D1 matrix)', () => {
  it('bare, ?init and ?url imports all emit the wasm into dist; ?url yields the asset path; publicDir is copied verbatim', async () => {
    await build({
      root: fixtureRoot,
      logLevel: 'silent',
      build: {
        outDir,
        emptyOutDir: true,
        // the fixture wasm is tiny; without this it would be inlined as
        // data URLs and the emission assertions would be vacuous
        assetsInlineLimit: 0,
        rollupOptions: { input: join(fixtureRoot, 'src', 'entry.js') },
      },
    });

    const files = await walk(outDir, outDir);

    // three module-graph forms each emit a (hashed) wasm asset
    const emittedWasm = files.filter((f) => f.startsWith('assets/') && f.endsWith('.wasm'));
    expect(emittedWasm.length).toBe(3);

    // publicDir copy lands at the dist root, original name, verbatim bytes
    expect(files).toContain('copy.wasm');
    expect(new Uint8Array(await readFile(join(outDir, 'copy.wasm')))).toEqual(taggedMinimalWasm('copy'));

    // the ?url import surface: the emitted js references an assets/*.wasm path
    const js = await Promise.all(
      files.filter((f) => f.endsWith('.js')).map((f) => readFile(join(outDir, f), 'utf8')),
    );
    expect(
      js.some((code) => /assets\/[A-Za-z0-9_-]+\.wasm/.test(code)),
    ).toBe(true);
  });
});

describe('pin binary wasm table sentinel (fact baseline)', () => {
  it('both variants: imports=[], 181 exports, 0 global exports, required families present', async (ctx) => {
    for (const variant of ['full', 'small'] as const) {
      const bytes = await loadWasmBytes(variant);
      if (bytes === undefined) {
        console.warn(`[vite-native.test] skipping ${variant} table sentinel (wasm unavailable offline)`);
        continue;
      }
      const module = new WebAssembly.Module(bytes);
      const imports = WebAssembly.Module.imports(module);
      const exports = WebAssembly.Module.exports(module);
      expect(imports, `${variant} import face`).toEqual([]);
      expect(exports.length, `${variant} export count`).toBe(181);
      expect(exports.filter((e) => e.kind === 'global'), `${variant} globals`).toEqual([]);
      const names = new Set(exports.map((e) => e.name));
      for (const family of [
        'ghostty_terminal_new',
        'ghostty_terminal_vt_write',
        'ghostty_render_state_new',
        'ghostty_key_encoder_encode',
        'ghostty_paste_is_safe',
        'ghostty_build_info',
        'ghostty_type_json',
        'ghostty_wasm_alloc',
        'ghostty_wasm_free',
      ]) {
        expect(names.has(family), `${variant} exports ${family}`).toBe(true);
      }
      // instantiation contract: {} is enough
      new WebAssembly.Instance(module, {});
    }
  });
});
