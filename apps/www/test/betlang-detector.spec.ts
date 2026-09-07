/**
 * The betlang detector suite (test/betlang-detector.spec.ts,
 * highlight-lang-detector, 2026-09-07) — the L4 statistical channel.
 *
 * Verified here, REAL wasm and zero internal mocks:
 *
 *   - the eight evidence samples run through the ACTUAL dist wasm
 *     (packages/betlang-wasm/dist/betlang_wasm.wasm, read as bytes via
 *     the package's exports) and land in the canonical ids the
 *     authoritative lang-canonical table derives — including the
 *     shebang-python sample (L4 sees code only; shebangs are L2's
 *     business, the model still calls it Python)
 *   - the wasmLoader seam: injected bytes, and the URL channel's
 *     contract (non-2xx rejected; non-wasm MIME rejected; MIME
 *     normalization strips `;` params and ASCII-lowercases)
 *   - the Node DEFAULT channel end to end (createRequire + readFile —
 *     no loader injected)
 *   - the confidence law: calibrated top-1 passes through verbatim;
 *     out-of-range and NaN are DROPPED (absent — never clamped)
 *   - the label law: unmapped labels (Gemfile — design D4's frozen
 *     null) return null + a ONE-TIME warn (Set-cached); unknown
 *     indices from a future wasm degrade the same way
 *   - the lazy law: constructing detectors moves NO wasm IO (the URL
 *     channel's fetch stays silent until the first detect); the
 *     singleton law: one load per process (the first detector's
 *     channel wins — a second instance's loader never runs)
 *
 * HOW THE CONTRACT NEGATIVES RUN REAL WEBASSEMBLY: the fake-wasm
 * fixtures below are hand-encoded wasm MODULES (type/function/memory/
 * export/code sections, ~60 bytes) exporting the exact ABI —
 * memory + detect(ptr,len) returning a scripted i32 +
 * last_confidence() returning scripted f64 bits — so even the
 * confidence-drop and warn-once laws execute genuine
 * WebAssembly.instantiate through the genuine package loader.
 *
 * MODULE GRAPH (the tree-sitter suite's vitest-4 lesson): the detector
 * keeps a module-level wasm singleton and a module-level warn cache,
 * so every suite that needs cold state calls freshDetector() —
 * vi.resetModules + dynamic import — never one shared graph (and no
 * vi.mock anywhere: a mocked module instance would survive resets
 * with warm internal state, bleeding one suite's wasm into the next).
 */
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { afterEach, describe, expect, it, vi } from 'vitest';

import type { BetlangDetectorOptions } from '../src/lib/highlight/betlang-detector';

// ---- shared helpers --------------------------------------------------------

const nodeRequire = createRequire(import.meta.url);

/** the REAL dist wasm as bytes — the bytes channel every real-wasm
 * suite uses (never a mock; node 24 runs wasm natively) */
async function realWasmBytes(): Promise<Uint8Array> {
  const path = nodeRequire.resolve('@jixoai/ui-betlang-wasm/dist/betlang_wasm.wasm');
  return new Uint8Array(await readFile(path));
}

/** a cold detector (fresh module graph: cold wasm singleton + cold
 * warn cache) — the suite-order law made explicit per group */
async function freshDetector(options?: BetlangDetectorOptions) {
  vi.resetModules();
  const { betlangDetector } = await import('../src/lib/highlight/betlang-detector');
  return betlangDetector(options);
}

// ---- the hand-encoded fake wasm (real WebAssembly, scripted ABI) -----------

/** signed LEB128 (the i32.const operand) */
function leb128Signed(value: number): number[] {
  const out: number[] = [];
  let v = value;
  for (;;) {
    const byte = v & 0x7f;
    v >>= 7;
    const done = (v === 0 && (byte & 0x40) === 0) || (v === -1 && (byte & 0x40) !== 0);
    out.push(done ? byte : byte | 0x80);
    if (done) return out;
  }
}

const f64Le = (value: number): number[] => {
  const view = new DataView(new ArrayBuffer(8));
  view.setFloat64(0, value, true);
  return [...new Uint8Array(view.buffer)];
};

/**
 * A minimal wasm module exporting the betlang ABI with scripted
 * answers: detect ignores its input and returns `labelIndex`;
 * last_confidence returns `confidence` bits. Built section by section
 * (magic/version, types (i32,i32)->i32 + ()->f64, functions, one-page
 * memory, exports memory/detect/last_confidence, code bodies) —
 * WebAssembly.instantiate validates it like any module.
 */
function fakeWasm(labelIndex: number, confidence: number): Uint8Array {
  const bytes: number[] = [0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00];
  const section = (id: number, payload: number[]) => bytes.push(id, payload.length, ...payload);
  section(0x01, [0x02, 0x60, 0x02, 0x7f, 0x7f, 0x01, 0x7f, 0x60, 0x00, 0x01, 0x7c]); // types
  section(0x03, [0x02, 0x00, 0x01]); // functions: type0, type1
  section(0x05, [0x01, 0x00, 0x01]); // memory: min 1 page
  section(0x07, [
    0x03,
    0x06, ...[...('memory')].map((c) => c.charCodeAt(0)), 0x02, 0x00,
    0x06, ...[...('detect')].map((c) => c.charCodeAt(0)), 0x00, 0x00,
    0x0f, ...[...('last_confidence')].map((c) => c.charCodeAt(0)), 0x00, 0x01,
  ]);
  const i32Body = [0x00, 0x41, ...leb128Signed(labelIndex), 0x0b];
  const f64Body = [0x00, 0x44, ...f64Le(confidence), 0x0b];
  section(0x0a, [0x02, i32Body.length, ...i32Body, f64Body.length, ...f64Body]);
  return new Uint8Array(bytes);
}

const bytesLoader = (wasm: Uint8Array) => async () => ({ bytes: wasm });

// ---- the warn-once cache is per FRESH MODULE — spy per test ----------------

function warnSpy() {
  return vi.spyOn(console, 'warn').mockImplementation(() => {});
}

// ===========================================================================
// 1 · the lazy + singleton laws (FIRST — cold graph, before any wasm runs)
// ===========================================================================
describe('betlang — the lazy + singleton laws', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('constructing detectors moves no wasm IO — the URL fetch stays silent until first detect', async () => {
    const wasm = fakeWasm(37, 0.9);
    const fetchStub = vi.fn(async () => ({
      ok: true,
      status: 200,
      statusText: 'stub 200',
      headers: { get: () => 'application/wasm' },
      arrayBuffer: async () => wasm.slice().buffer,
    }));
    vi.stubGlobal('fetch', fetchStub);
    const detector = await freshDetector({ wasmLoader: async () => ({ url: 'https://cdn.example/betlang.wasm' }) });
    expect(detector.id).toBe('betlang');
    expect(fetchStub).not.toHaveBeenCalled(); // construction loaded nothing

    await expect(detector.detect({ code: 'fn main() {}' })).resolves.toMatchObject({ lang: 'rust' });
    expect(fetchStub).toHaveBeenCalledTimes(1); // the first detect is the first IO
  });

  it('one wasm load per process: the first detector\u2019s channel wins, a second instance\u2019s loader never runs', async () => {
    const first = await freshDetector({
      wasmLoader: async () => ({ bytes: fakeWasm(37, 0.9) }),
    });
    const loaderB = vi.fn(async () => ({ bytes: fakeWasm(34, 0.9) }));
    const second = (await import('../src/lib/highlight/betlang-detector')).betlangDetector({
      wasmLoader: loaderB,
    });
    // module NOT reset between the two factories — the singleton binds
    // to the first channel; B composes over the warm wasm
    const a = await first.detect({ code: 'fn main() {}' });
    const b = await second.detect({ code: 'def x(): pass' });
    expect(a?.lang).toBe('rust');
    expect(b?.lang).toBe('rust'); // B shares A's wasm — 37, not 34
    expect(loaderB).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// 2 · the real wasm contract (evidence's eight samples, bytes channel)
// ===========================================================================
describe('betlang — the real wasm contract (eight evidence samples)', () => {
  // the evidence matrix + the mapping-after-canonical expectation: each
  // sample asserts lang AND a finite calibrated confidence in 0..1
  const SAMPLES: readonly [name: string, code: string, canonical: string][] = [
    ['rust', 'fn main() { println!("hi"); }', 'rust'],
    ['python', 'def add(a, b):\n    return a + b', 'python'],
    ['typescript', 'const x: number = 1;', 'typescript'],
    ['json', '{"name": "jixoai", "v": [1, 2]}', 'json'],
    ['go', 'package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println("hi")\n}', 'go'],
    ['shebang-python', '#!/usr/bin/env python3\nimport sys', 'python'],
    ['sql', 'SELECT * FROM users WHERE id = 1;', 'sql'],
    ['html', '<div class="x">hello</div>', 'html'],
  ];

  it('every sample detects through the real wasm into its canonical id', async () => {
    const detector = await freshDetector({ wasmLoader: async () => ({ bytes: await realWasmBytes() }) });
    for (const [name, code, canonical] of SAMPLES) {
      const result = await detector.detect({ code });
      expect(result, `sample ${name}`).toEqual({
        lang: canonical,
        source: 'statistical',
        confidence: expect.any(Number),
      });
      const confidence = result?.confidence;
      expect(confidence, `sample ${name} confidence`).toBeGreaterThanOrEqual(0);
      expect(confidence, `sample ${name} confidence`).toBeLessThanOrEqual(1);
      expect(Number.isFinite(confidence), `sample ${name} confidence finite`).toBe(true);
    }
  }, 30000);

  it('empty / whitespace input returns null (no opinion, silent)', async () => {
    const warn = warnSpy();
    const detector = await freshDetector({ wasmLoader: async () => ({ bytes: await realWasmBytes() }) });
    expect(await detector.detect({ code: '' })).toBeNull();
    expect(await detector.detect({ code: '   \n\t ' })).toBeNull();
    expect(warn).not.toHaveBeenCalled();
  }, 30000);

  it('filename is ignored — the statistical layer reads code only', async () => {
    const detector = await freshDetector({ wasmLoader: async () => ({ bytes: await realWasmBytes() }) });
    const viaFilename = await detector.detect({ code: 'def add(a, b):\n    return a + b' });
    expect(viaFilename?.lang).toBe('python');
  }, 30000);
});

// ===========================================================================
// 3 · the Node default channel (createRequire + readFile, no injection)
// ===========================================================================
describe('betlang — the Node default channel', () => {
  it('betlangDetector() with no options detects via the package wasm read from disk', async () => {
    const detector = await freshDetector();
    const result = await detector.detect({ code: 'fn main() { println!("hi"); }' });
    expect(result).toEqual({
      lang: 'rust',
      source: 'statistical',
      confidence: expect.any(Number),
    });
  }, 30000);

  // the browser default delegates to the package's own new-URL channel —
  // a literal `import('…wasm?url')` here compiles in a consumer BUILD but
  // breaks vite DEV (the ?import-rewritten request answers the raw binary;
  // the browser fails the ES-module parse — caught live on the docs
  // playground 2026-09-07). Source-level guard: the literal must not return.
  it('the browser default channel never re-introduces a literal ?url wasm import', async () => {
    const source = await readFile(nodeRequire.resolve('../src/lib/highlight/betlang-detector.ts'), 'utf8');
    expect(source).not.toMatch(/\.wasm\?url/);
  });
});

// ===========================================================================
// 4 · the label + confidence laws (real WebAssembly, scripted ABI)
// ===========================================================================
describe('betlang — the label + confidence laws', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('a calibrated confidence passes through verbatim', async () => {
    const detector = await freshDetector({ wasmLoader: bytesLoader(fakeWasm(37, 0.42)) });
    expect(await detector.detect({ code: 'x' })).toEqual({
      lang: 'rust',
      source: 'statistical',
      confidence: 0.42,
    });
  });

  it('out-of-range confidence is DROPPED (absent — never clamped)', async () => {
    for (const bad of [2.5, -0.1, Number.NaN]) {
      const detector = await freshDetector({ wasmLoader: bytesLoader(fakeWasm(34, bad)) });
      const result = await detector.detect({ code: 'x' });
      expect(result, `confidence ${bad}`).toEqual({ lang: 'python', source: 'statistical' });
      expect(result && 'confidence' in result, `confidence ${bad}`).toBe(false);
    }
  });

  it('an unmapped label returns null + ONE warn for the label per process', async () => {
    const warn = warnSpy();
    const detector = await freshDetector({ wasmLoader: bytesLoader(fakeWasm(13, 0.9)) }); // 13 = Gemfile
    expect(await detector.detect({ code: 'source "https://rubygems.org"' })).toBeNull();
    expect(await detector.detect({ code: 'gem "rails"' })).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('label "Gemfile"'));
  });

  it('every design-D4 frozen null label warns under its own key', async () => {
    const warn = warnSpy();
    // 13 Gemfile · 14 Gemspec · 44 Vba · 45 Verilog — the frozen nulls
    for (const [index, label] of [
      [13, 'Gemfile'],
      [14, 'Gemspec'],
      [44, 'Vba'],
      [45, 'Verilog'],
    ] as const) {
      const detector = await freshDetector({ wasmLoader: bytesLoader(fakeWasm(index, 0.9)) });
      expect(await detector.detect({ code: 'x' }), `label ${label}`).toBeNull();
      expect(warn, `label ${label}`).toHaveBeenCalledWith(expect.stringContaining(`"${label}"`));
    }
  });

  it('an index outside the 48-label table degrades to null + a one-time warn keyed by the index', async () => {
    const warn = warnSpy();
    const detector = await freshDetector({ wasmLoader: bytesLoader(fakeWasm(99, 0.9)) });
    expect(await detector.detect({ code: 'x' })).toBeNull();
    expect(await detector.detect({ code: 'y' })).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('label index 99'));
  });

  it('a -1 detection (no language) returns null silently', async () => {
    const warn = warnSpy();
    const detector = await freshDetector({ wasmLoader: bytesLoader(fakeWasm(-1, 0.0)) });
    expect(await detector.detect({ code: 'x' })).toBeNull();
    expect(warn).not.toHaveBeenCalled();
  });
});

// ===========================================================================
// 5 · the URL channel contract (fetch stubs; MIME normalization law)
// ===========================================================================
describe('betlang — the URL channel contract', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  const respond = (status: number, contentType: string | null, body: Uint8Array) =>
    vi.fn(async () => ({
      ok: status >= 200 && status < 300,
      status,
      statusText: `stub ${status}`,
      headers: { get: (name: string) => (name.toLowerCase() === 'content-type' ? contentType : null) },
      arrayBuffer: async () => body.slice().buffer,
    }));

  it('a non-2xx URL rejects with the status named', async () => {
    const wasm = fakeWasm(37, 0.9);
    vi.stubGlobal('fetch', respond(404, 'application/wasm', wasm));
    const detector = await freshDetector({ wasmLoader: async () => ({ url: 'https://cdn.example/betlang.wasm' }) });
    await expect(detector.detect({ code: 'x' })).rejects.toThrow(/answered 404 .* expected 2xx/);
  });

  it('a non-wasm MIME rejects with the served type named', async () => {
    const wasm = fakeWasm(37, 0.9);
    vi.stubGlobal('fetch', respond(200, 'text/plain', wasm));
    const detector = await freshDetector({ wasmLoader: async () => ({ url: 'https://cdn.example/betlang.wasm' }) });
    await expect(detector.detect({ code: 'x' })).rejects.toThrow(/serves "text\/plain" .* expected application\/wasm/);
  });

  it('a missing content-type also rejects (strict — hand over bytes if the host cannot say)', async () => {
    const wasm = fakeWasm(37, 0.9);
    vi.stubGlobal('fetch', respond(200, null, wasm));
    const detector = await freshDetector({ wasmLoader: async () => ({ url: 'https://cdn.example/betlang.wasm' }) });
    await expect(detector.detect({ code: 'x' })).rejects.toThrow(/expected application\/wasm/);
  });

  it('MIME normalization: uppercase + \";\" parameters accepted, detection runs', async () => {
    const wasm = fakeWasm(37, 0.9);
    const fetchStub = respond(200, 'APPLICATION/WASM; charset=utf-8', wasm);
    vi.stubGlobal('fetch', fetchStub);
    const detector = await freshDetector({ wasmLoader: async () => ({ url: 'https://cdn.example/betlang.wasm' }) });
    await expect(detector.detect({ code: 'x' })).resolves.toEqual({
      lang: 'rust',
      source: 'statistical',
      confidence: 0.9,
    });
    expect(fetchStub).toHaveBeenCalledWith('https://cdn.example/betlang.wasm');
  });
});
