/**
 * The tree-sitter highlight backend suite
 * (test/code-card-backend-tree-sitter.spec.ts, highlight-engine-matrix,
 * 2026-09-06).
 *
 * Verified here, against a bare <pre><code> box (the code-card-backend
 * suite's own shape):
 *
 *   - the lazy law: constructing backends — and paints that reject
 *     before the engine — load NOTHING of tree-sitter
 *   - REAL wasm initialization, zero mock: core + every grammar wasm is
 *     read from node_modules as bytes (createRequire + readFile, node
 *     24 runs wasm natively), painted through, and the loaded grammar
 *     abiVersions are asserted to sit inside the runtime's support
 *     window (the ABI-drift lock the design demands)
 *   - the singleton law: core inits once, grammars load once per id —
     * a second instance's loader is never called for warm assets
 *   - the markup paint: token spans with --tok-token-* colors, source
 *     slices entity-escaped, textContent round-trip intact
 *   - the overlap law (subtraction painting): the SHORTER capture wins
 *     and the longer capture paints its uncovered remainder
 *   - the langs law: curated set, alias convergence, per-instance
 *     allowlists, unknown langs rejecting with a hint
 *   - theme semantics: jixoai-only, other names warn and stay jixoai
 *   - wasmBase: every asset URL is `${wasmBase}${basename}` at the
 *     engine seam (observed via spies on the real module's statics —
 *     no wasm execution, per the design's "不必真跑 wasm")
 *   - query fidelity: the embedded .scm constants are byte-identical
 *     to the installed packages' own files
 *
 * SUITE ORDER IS LOAD-BEARING (vitest 4 lesson, carried from the
 * sibling engine suites): vi.resetModules does NOT re-run mock
 * factories, so the engine-load counter below is only observable in a
 * pristine module graph. The lazy suite runs FIRST — before anything
 * paints — where "never loaded" is provable; the wasmBase spy suite
 * runs LAST because it poisons the (reset) module graph's core
 * singleton with a mocked init.
 */
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  JAVASCRIPT_HIGHLIGHTS_QUERY,
  JAVASCRIPT_JSX_HIGHLIGHTS_QUERY,
  TYPESCRIPT_HIGHLIGHTS_QUERY,
} from '../src/lib/highlight/tree-sitter-queries';
import { treeSitter, type WasmAsset, type WasmSource } from '../src/lib/highlight/tree-sitter';

// ---- the engine-load counter (the lazy contract's observable) --------------
// A PURE passthrough mock: the real module loads untouched; only the
// factory invocation itself is counted. Zero shims — the real-wasm
// suites below run through the genuine classes.
const engineLoads = vi.hoisted(() => ({ count: 0 }));

vi.mock('web-tree-sitter', async (importOriginal) => {
  engineLoads.count += 1;
  return importOriginal();
});

// ---- shared helpers --------------------------------------------------------

/** a bare <pre><code> box, the shape every backend paints into */
function codeBox(): { code: HTMLElement } {
  const pre = document.createElement('pre');
  const code = document.createElement('code');
  pre.append(code);
  document.body.append(pre);
  return { code };
}

/** the npm specifiers of every wasm this backend can ask for */
const WASM_SPECIFIERS = {
  core: 'web-tree-sitter/web-tree-sitter.wasm',
  typescript: 'tree-sitter-typescript/tree-sitter-typescript.wasm',
  tsx: 'tree-sitter-typescript/tree-sitter-tsx.wasm',
  javascript: 'tree-sitter-javascript/tree-sitter-javascript.wasm',
} as const;

const nodeRequire = createRequire(import.meta.url);

/** the contract tests' bytes channel: node reads node_modules directly */
function readWasmBytes(asset: WasmAsset): Promise<Uint8Array> {
  const specifier = WASM_SPECIFIERS[asset.kind === 'core' ? 'core' : asset.id];
  return readFile(nodeRequire.resolve(specifier)).then((buffer) => new Uint8Array(buffer));
}

const TS_SAMPLE = [
  'const greet = (name: string): string => {',
  '  // hello',
  '  return `hi ${name}!`;',
  '};',
].join('\n');

// ===========================================================================
// 1 · the lazy law (FIRST — pristine module graph, see header)
// ===========================================================================
describe('tree-sitter — the lazy law', () => {
  it('constructing backends (and pre-engine rejections) loads nothing of the engine', async () => {
    treeSitter();
    treeSitter({ langs: ['ts'] });
    treeSitter({ wasmBase: '/wasm/' });
    expect(treeSitter().id).toBe('tree-sitter');
    expect(engineLoads.count).toBe(0);

    // an unknown lang rejects BEFORE any engine or wasm work — the
    // counter must not move
    const { code } = codeBox();
    code.textContent = 'x';
    await expect(treeSitter().highlight(code, 'x', { lang: 'bash' })).rejects.toThrow(
      /no grammar for "bash"/,
    );
    expect(engineLoads.count).toBe(0);
  });
});

// ===========================================================================
// 2 · the real wasm contract (zero mock — bytes from node_modules)
// ===========================================================================
describe('tree-sitter — the real wasm contract', () => {
  // runs FIRST in this describe on purpose: it re-initializes the raw
  // runtime (Parser.init replaces the binding's module state), so any
  // object created before it would be invalidated. The backend paints
  // below do their own init afterwards.
  it('grammar wasm abiVersions sit inside the runtime support window', async () => {
    const loadsBefore = engineLoads.count;
    const wts = await import('web-tree-sitter');
    // this raw import is the suite's FIRST engine load (the lazy suite
    // above proved nothing had loaded before it)
    expect(engineLoads.count - loadsBefore).toBeGreaterThanOrEqual(1);
    const core = await readWasmBytes({ kind: 'core' });
    // the asset is a real wasm before anything else (\0asm)
    expect([...core.subarray(0, 4)]).toEqual([0x00, 0x61, 0x73, 0x6d]);
    await wts.Parser.init({ wasmBinary: core });
    for (const id of ['typescript', 'tsx', 'javascript'] as const) {
      const language = await wts.Language.load(await readWasmBytes({ kind: 'grammar', id }));
      expect(language.abiVersion).toBeGreaterThanOrEqual(wts.MIN_COMPATIBLE_VERSION);
      expect(language.abiVersion).toBeLessThanOrEqual(wts.LANGUAGE_VERSION);
    }
  }, 30000);

  it('a ts paint produces --tok-token-* spans from real parsing', async () => {
    const loader = vi.fn((asset: WasmAsset): Promise<WasmSource> =>
      readWasmBytes(asset).then((bytes) => ({ bytes })),
    );
    const { code } = codeBox();
    await treeSitter({ wasmLoader: loader }).highlight(code, TS_SAMPLE, { lang: 'ts' });

    // core + the typescript grammar — nothing else
    expect(loader).toHaveBeenCalledTimes(2);
    expect(loader).toHaveBeenNthCalledWith(1, { kind: 'core' });
    expect(loader).toHaveBeenNthCalledWith(2, { kind: 'grammar', id: 'typescript' });

    // token spans across the mapped vocabulary (shortest-wins means
    // each assertion target is exactly the capture's own slice)
    expect(code.innerHTML).toContain('<span style="color:var(--tok-token-keyword)">const</span>');
    expect(code.innerHTML).toContain('<span style="color:var(--tok-token-function)">greet</span>');
    expect(code.innerHTML).toContain(
      '<span style="color:var(--tok-token-parameter)">name</span>',
    );
    expect(code.innerHTML).toContain('<span style="color:var(--tok-token-comment)">// hello</span>');
    // type.builtin "string" parks on the constant tone (the 就近 table)
    expect(code.innerHTML).toContain(
      '<span style="color:var(--tok-token-constant)">string</span>',
    );
    // the plain text survives verbatim under the markup
    expect(code.textContent).toBe(TS_SAMPLE);
  }, 30000);

  it('the singleton law: a second instance never re-loads warm assets', async () => {
    const loader = vi.fn((asset: WasmAsset): Promise<WasmSource> =>
      readWasmBytes(asset).then((bytes) => ({ bytes })),
    );
    const { code } = codeBox();
    await treeSitter({ wasmLoader: loader }).highlight(code, TS_SAMPLE, { lang: 'ts' });
    // core AND the typescript grammar were already warm — zero calls
    expect(loader).not.toHaveBeenCalled();
    expect(code.textContent).toBe(TS_SAMPLE);
  }, 30000);

  it('tsx paints JSX tags/attributes; the jsx alias shares the javascript grammar', async () => {
    const loader = vi.fn((asset: WasmAsset): Promise<WasmSource> =>
      readWasmBytes(asset).then((bytes) => ({ bytes })),
    );
    const tsxBox = codeBox();
    await treeSitter({ wasmLoader: loader }).highlight(
      tsxBox.code,
      'export const App = () => <div className="hero">Hi</div>;',
      { lang: 'tsx' },
    );
    // only the grammar was cold (the core singleton is warm)
    expect(loader).toHaveBeenCalledTimes(1);
    expect(loader).toHaveBeenCalledWith({ kind: 'grammar', id: 'tsx' });
    // JSX tags map to keyword, attributes to parameter (the 就近 table)
    expect(tsxBox.code.innerHTML).toContain(
      '<span style="color:var(--tok-token-keyword)">div</span>',
    );
    expect(tsxBox.code.innerHTML).toContain(
      '<span style="color:var(--tok-token-parameter)">className</span>',
    );

    // jsx is an alias onto the javascript grammar — its own wasm ask
    const jsxBox = codeBox();
    await treeSitter({ wasmLoader: loader }).highlight(jsxBox.code, 'const X = <b />;', {
      lang: 'jsx',
    });
    expect(loader).toHaveBeenCalledTimes(2);
    expect(loader).toHaveBeenLastCalledWith({ kind: 'grammar', id: 'javascript' });
    expect(jsxBox.code.textContent).toBe('const X = <b />;');
  }, 30000);

  it('source slices are entity-escaped inside the markup', async () => {
    const { code } = codeBox();
    const sample = `const tag = "<b>&'x'</b>";`;
    await treeSitter().highlight(code, sample, { lang: 'ts' });
    // the backend escapes every entity; reading innerHTML back runs the
    // DOM serializer, which re-renders &#39; as a bare ' — the & < >
    // entities (the injection-relevant ones) stay visible
    expect(code.innerHTML).toContain('&lt;b&gt;&amp;\'x\'&lt;/b&gt;');
    expect(code.textContent).toBe(sample);
  }, 30000);

  it('the overlap law: shorter captures win, longer ones paint their remainder', async () => {
    // one template literal: the whole-string capture is LONG, the ${ / }
    // punctuation captures inside it are SHORT — subtraction painting
    // must leave the string color on both uncovered ends
    const { code } = codeBox();
    await treeSitter().highlight(code, 'const t = `x${1}y`;', { lang: 'js' });
    expect(code.innerHTML).toContain('<span style="color:var(--tok-token-string)">`x</span>');
    expect(code.innerHTML).toContain(
      '<span style="color:var(--tok-token-punctuation)">${</span>',
    );
    expect(code.innerHTML).toContain('<span style="color:var(--tok-token-constant)">1</span>');
    expect(code.innerHTML).toContain('<span style="color:var(--tok-token-punctuation)">}</span>');
    expect(code.innerHTML).toContain('<span style="color:var(--tok-token-string)">y`</span>');
    // and NOT one monolithic string span swallowing the punctuation
    expect(code.innerHTML).not.toContain(
      '<span style="color:var(--tok-token-string)">`x${1}y`</span>',
    );
  }, 30000);

  it('the embedded queries are verbatim copies of the installed packages', async () => {
    const readQuery = (specifier: string): Promise<string> =>
      readFile(nodeRequire.resolve(specifier), 'utf8');
    expect(JAVASCRIPT_HIGHLIGHTS_QUERY).toBe(
      await readQuery('tree-sitter-javascript/queries/highlights.scm'),
    );
    expect(JAVASCRIPT_JSX_HIGHLIGHTS_QUERY).toBe(
      await readQuery('tree-sitter-javascript/queries/highlights-jsx.scm'),
    );
    expect(TYPESCRIPT_HIGHLIGHTS_QUERY).toBe(
      await readQuery('tree-sitter-typescript/queries/highlights.scm'),
    );
  }, 30000);
});

// ===========================================================================
// 3 · the langs law (curated set, aliases, per-instance allowlists)
// ===========================================================================
describe('tree-sitter — the langs law', () => {
  it('an unknown language rejects with a hint, the element untouched', async () => {
    const { code } = codeBox();
    code.textContent = 'x';
    await expect(treeSitter().highlight(code, 'x', { lang: 'svelte' })).rejects.toThrow(
      /no grammar for "svelte".*use the shiki backend/s,
    );
    expect(code.textContent).toBe('x');
  });

  it('a langs allowlist rejects outside languages', async () => {
    const { code } = codeBox();
    code.textContent = 'x';
    const slim = treeSitter({ langs: ['tsx'] });
    await expect(slim.highlight(code, 'x', { lang: 'ts' })).rejects.toThrow(
      /outside this instance's langs set/,
    );
    expect(code.textContent).toBe('x');
  });

  it('an alias entry in the allowlist admits the canonical lang (and vice versa)', async () => {
    // allowlist written in ALIAS form ('ts'), paint asks canonical —
    // and the alias itself paints through the same grammar
    const fromAlias = treeSitter({ langs: ['ts'] });
    const boxA = codeBox();
    await fromAlias.highlight(boxA.code, 'const one = 1;', { lang: 'typescript' });
    expect(boxA.code.querySelector('span')?.getAttribute('style')).toContain('--tok-token-');
    const boxB = codeBox();
    await fromAlias.highlight(boxB.code, 'const two = 2;', { lang: 'ts' });
    expect(boxB.code.querySelector('span')?.getAttribute('style')).toContain('--tok-token-');
  }, 30000);
});

// ===========================================================================
// 4 · theme semantics (jixoai-only, warn + stay on other names)
// ===========================================================================
describe('tree-sitter — theme semantics', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('a foreign theme name warns and stays jixoai', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { code } = codeBox();
    await treeSitter().highlight(code, 'const themed = true;', {
      lang: 'ts',
      theme: 'github-dark',
    });
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('no theme "github-dark" — staying jixoai'),
    );
    // the paint still happened, in the jixoai palette
    expect(code.innerHTML).toContain('var(--tok-token-keyword)');
  }, 30000);

  it("'jixoai' and undefined paint silently", async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const boxA = codeBox();
    await treeSitter().highlight(boxA.code, 'const a = 1;', { lang: 'ts', theme: 'jixoai' });
    const boxB = codeBox();
    await treeSitter().highlight(boxB.code, 'const b = 2;', { lang: 'ts' });
    expect(warn).not.toHaveBeenCalled();
    expect(boxA.code.innerHTML).toContain('var(--tok-token-keyword)');
    expect(boxB.code.innerHTML).toContain('var(--tok-token-keyword)');
  }, 30000);
});

// ===========================================================================
// 5 · wasmBase prefixing (LAST — spies poison the reset graph; see header)
// ===========================================================================
describe('tree-sitter — the wasmBase seam', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('every asset resolves to `${wasmBase}${basename}` at the engine seam (no wasm run)', async () => {
    // fresh module graph: the backend's core singleton must be COLD so
    // the composed URLs actually reach Parser.init / Language.load,
    // where spies on the real module's statics observe them. The paint
    // itself cannot finish (the mocked init leaves the runtime
    // uninitialized and the engine rejects) — this test observes the
    // seam payloads only, which is exactly the design's "不必真跑 wasm".
    vi.resetModules();
    const wts = await import('web-tree-sitter');
    const located: string[] = [];
    const grammarInputs: (string | URL | Uint8Array)[] = [];
    const initSpy = vi
      .spyOn(wts.Parser, 'init')
      .mockImplementation(async (options?: Partial<EmscriptenModule>) => {
        const url = options?.locateFile?.('web-tree-sitter.wasm', '/');
        if (url !== undefined) located.push(url);
      });
    const loadSpy = vi.spyOn(wts.Language, 'load').mockImplementation(async (input) => {
      grammarInputs.push(input);
      return {} as InstanceType<typeof wts.Language>;
    });

    const { treeSitter: freshTreeSitter } = await import('../src/lib/highlight/tree-sitter');
    const { code } = codeBox();
    await expect(
      freshTreeSitter({ wasmBase: 'https://cdn.example/wasm/' }).highlight(
        code,
        'const a = 1;',
        { lang: 'tsx' },
      ),
    ).rejects.toThrow();

    // the {url} quadrants received the prefixed URLs — core AND grammar
    expect(located).toEqual(['https://cdn.example/wasm/web-tree-sitter.wasm']);
    expect(grammarInputs).toEqual(['https://cdn.example/wasm/tree-sitter-tsx.wasm']);
    expect(initSpy).toHaveBeenCalled();
    expect(loadSpy).toHaveBeenCalledTimes(1);
  });
});
