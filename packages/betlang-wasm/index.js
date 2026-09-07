/**
 * The @jixoai/betlang-wasm loader (index.js, task 4.1 — handwritten,
 * NO wasm-bindgen; bindgen glue would add ~3-8 KiB raw against the
 * 100 KiB budget law, design D4).
 *
 * THE ABI (src/lib.rs, frozen):
 *   detect(ptr, len) -> i32      betlang::Language discriminant 0..=47
 *                                (alphabetical labels asm..yaml) or -1
 *                                for empty/whitespace/too-short input
 *   last_confidence() -> f64     top-1 calibrated probability of the
 *                                last detect() call (0.0 after -1)
 *
 * LINEAR-MEMORY UTF-8 IN/OUT — the alloc-free pattern: JS grows the
 * module's memory by exactly the pages the input needs and writes the
 * TextEncoder bytes into the freshly grown region (its base = the old
 * byteLength). Rust's wasm allocator only ever manages pages IT grew
 * itself, so the JS-grown pages are never handed out underneath a
 * call; pages stay claimed (bounded by the largest sample ever seen —
 * a card-sized snippet), no allocator export, no dealloc protocol.
 *
 * DUAL ENVIRONMENT (the omitted-source default channel): Node reads
 * dist/betlang.wasm via fs (WebAssembly.Module), the browser fetches
 * the new-URL(...) relative asset — the form bundlers rewrite into an
 * emitted asset URL (vite's ?url semantics for package files). An
 * explicit source ({ url } | { bytes }) takes the channel over, which
 * is how the DLD betlang-detector wasmLoader seam drives it.
 *
 * SUPPLY CHAIN: npm is the only channel; the bytes were built from
 * crates.io betlang =0.1.1 under a sparse-index checksum gate — see
 * ARTIFACT.md (as-shipped sizes/sha256) and scripts/build.mjs.
 */

const encoder = new TextEncoder();
const WASM_MAGIC = [0x00, 0x61, 0x73, 0x6d];
const WASM_MIME = 'application/wasm';

const isNode =
  typeof process !== 'undefined' && process.versions !== undefined && process.versions.node !== undefined;

/** MIME normalization: strip any `;` parameters, trim, ASCII-lowercase */
function normalizeMime(raw) {
  return (raw ?? '').split(';')[0].trim().toLowerCase();
}

/** the {url} channel: 2xx + normalized application/wasm, or a named rejection */
async function fetchWasmBytes(url) {
  let res;
  try {
    res = await fetch(url);
  } catch (err) {
    throw new Error(`[betlang-wasm] fetching ${url} failed (${err.message}) — check the network or hand over { bytes }`);
  }
  if (!res.ok) {
    throw new Error(`[betlang-wasm] ${url} answered ${res.status} ${res.statusText} — expected 2xx for the wasm asset`);
  }
  const mime = normalizeMime(res.headers.get('content-type'));
  if (mime !== WASM_MIME) {
    throw new Error(
      `[betlang-wasm] ${url} serves "${mime || '(no content-type)'}" — expected ${WASM_MIME} ` +
        '(a misconfigured host; hand over { bytes } or fix the server)',
    );
  }
  return new Uint8Array(await res.arrayBuffer());
}

/** the omitted-source default channel: Node fs bytes / browser fetch of the relative asset */
async function defaultSource() {
  if (isNode) {
    const { readFile } = await import('node:fs/promises');
    const bytes = new Uint8Array(await readFile(new URL('./dist/betlang_wasm.wasm', import.meta.url)));
    return { bytes };
  }
  return { url: new URL('./dist/betlang_wasm.wasm', import.meta.url).href };
}

/** the instantiated ABI surface (see index.d.ts) */
function bindDetector(exports) {
  if (!(exports.memory instanceof WebAssembly.Memory)) {
    throw new Error('[betlang-wasm] the module does not export `memory` — not a betlang-wasm artifact');
  }
  if (typeof exports.detect !== 'function' || typeof exports.last_confidence !== 'function') {
    throw new Error('[betlang-wasm] the module lacks detect/last_confidence exports — not a betlang-wasm artifact');
  }
  return {
    exports,
    detect(code) {
      const input = encoder.encode(code);
      const memory = exports.memory;
      const pages = (input.length + 0xffff) >> 16;
      const ptr = memory.buffer.byteLength; // base of the pages grown below
      if (pages > 0) memory.grow(pages);
      new Uint8Array(memory.buffer, ptr, input.length).set(input);
      const labelIndex = exports.detect(ptr, input.length);
      if (labelIndex < 0) return null;
      return { labelIndex, confidence: exports.last_confidence() };
    },
  };
}

const assertMagic = (bytes) => {
  if (bytes.length < 4 || WASM_MAGIC.some((byte, i) => bytes[i] !== byte)) {
    throw new Error('[betlang-wasm] the source does not start with the \\0asm magic bytes — not a wasm module');
  }
};

/** one module per process — failures clear the cache for a retry */
let modulePromise;

/** instantiate from an explicit source ({url}|{bytes}) or the default channel */
export async function loadBetlang(source) {
  const resolved = source ?? (await defaultSource());
  const bytes = resolved.bytes ?? (await fetchWasmBytes(resolved.url));
  assertMagic(bytes);
  modulePromise ??= WebAssembly.instantiate(bytes, {}).then(
    ({ instance }) => bindDetector(instance.exports),
    (err) => {
      modulePromise = undefined;
      throw err;
    },
  );
  return modulePromise;
}

/** convenience one-shot: detect a code sample through the default channel */
export async function detectSource(code, source) {
  return (await loadBetlang(source)).detect(code);
}
