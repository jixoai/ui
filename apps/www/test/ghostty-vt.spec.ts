//
// Golden tests for registry/files/lib/ghostty-vt.ts (design.md D4 binding
// layer). Everything runs against the REAL pinned wasm asset — the same
// module the vite plugin serves — so the ABI contract (type_json layout,
// dirty semantics, key/paste encoding, snapshot) is locked by behavior,
// not by mocks.
//
// wasm bytes acquisition (two paths, in order):
//   1. JIXOAI_GHOSTTY_WASM_PATH env override; when unset, the research
//      copy at /tmp/ghostty-research/ghostty-vt.wasm is used if present.
//      No network involved.
//   2. Otherwise Batch A's resolver runs (imported straight from source
//      under packages/vite-plugin/src/resolve.ts — vitest transforms TS)
//      and downloads once into the shared node_modules/.cache cache.
//
// Owner original demand: 2026-08-28 "ghostty-term / Batch B (design.md D4)".

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import {
  GhosttyVTError,
  loadGhosttyVT,
  type GhosttyVT,
  type RowSnapshot,
} from '../../../registry/files/lib/ghostty-vt';

const DEFAULT_LOCAL_WASM = '/tmp/ghostty-research/ghostty-vt.wasm';

async function acquireWasmBytes(): Promise<Uint8Array> {
  // an explicit env override defers to the same loud-failure semantics as
  // Batch A's resolver (an unreadable override is an error, not a fallback)
  const envPath = process.env.JIXOAI_GHOSTTY_WASM_PATH;
  if (envPath !== undefined) {
    return new Uint8Array(readFileSync(envPath));
  }
  if (existsSync(DEFAULT_LOCAL_WASM)) {
    return new Uint8Array(readFileSync(DEFAULT_LOCAL_WASM));
  }
  // Resolver fallback. We drive resolveWasmFromPin with an explicitly-read
  // pin because the www vitest config runs jsdom under the browser
  // condition, where import.meta.url is an http:// URL and the resolver's
  // defaultPinPath() (fileURLToPath) rejects it. readPin(path?) and
  // resolveWasmFromPin(pin, opts) are the exported for-tests seams; all
  // download/cache/verify behavior stays Batch A's code.
  const { readPin, resolveWasmFromPin } = await import(
    '../../../packages/vite-plugin/src/resolve'
  );
  const pinPath = join(process.cwd(), '../../packages/vite-plugin/ghostty.pin.json');
  const pin = await readPin(pinPath);
  const resolved = await resolveWasmFromPin(pin, { variant: 'full' });
  return resolved.bytes;
}

const enc = (text: string): Uint8Array => new TextEncoder().encode(text);
const dec = (bytes: Uint8Array): string => new TextDecoder().decode(bytes);
const rowText = (row: RowSnapshot): string => row.cells.map((cell) => cell.grapheme).join('');

let vt: GhosttyVT;

beforeAll(async () => {
  vt = await loadGhosttyVT({ bytes: await acquireWasmBytes() });
}, 60_000);

describe('ghostty-vt type manifest', () => {
  it('exposes the runtime type layout with a valid ABI (usize 4 or 8)', () => {
    expect(vt.typeLayout.abi.usize_size === 4 || vt.typeLayout.abi.usize_size === 8).toBe(true);
    expect(vt.typeLayout.types.GhosttyStyle).toBeDefined();
    expect(vt.typeLayout.types.GhosttyStyle?.fields?.bold).toBeDefined();
    expect(vt.typeLayout.types.GhosttyResult?.values?.SUCCESS).toBe(0);
  });

  it('exposes a non-empty buildInfo string', () => {
    expect(typeof vt.buildInfo).toBe('string');
    expect(vt.buildInfo.length).toBeGreaterThan(0);
  });
});

describe('ghostty-vt render-state reads', () => {
  it('iterates cells for written text and styled runs (Hello / Green Bold)', () => {
    vt.vtWrite(enc('Hello, World!\r\n\x1b[1;32mGreen Bold\x1b[0m'));
    const rows = [...vt.dirtyRows()];
    const texts = rows.map(rowText);
    expect(texts.some((t) => t.includes('Hello'))).toBe(true);
    expect(texts.some((t) => t.includes('Green Bold'))).toBe(true);

    const greenRow = rows.find((row) => rowText(row).startsWith('Green'));
    expect(greenRow).toBeDefined();
    const gCell = greenRow?.cells[0];
    expect(gCell?.grapheme).toBe('G');
    // SGR 1;32 — bold + palette-green resolved to a draw-ready rgb() string
    expect(gCell?.style.bold).toBe(true);
    expect(gCell?.style.fg).toMatch(/^rgb\(/);
  });

  it('reports only affected rows on the second write (cursor row + written row)', () => {
    // first pass above completed -> render state is clean
    vt.vtWrite(enc('\x1b[5;1HX'));
    const dirty = [...vt.dirtyRows()].map((row) => row.y);
    // actual upstream semantics: the row the cursor LEFT (row 1) and the
    // row written to (row 4) flip dirty; untouched rows 0/2/3 stay clean
    expect(dirty).toContain(4);
    expect(dirty).not.toContain(0);
    expect(dirty).not.toContain(2);
    expect(dirty).not.toContain(3);
    expect(dirty.length).toBeLessThanOrEqual(2);
  });

  it('resolves hyperlink URIs for cells carrying the hyperlink bit', () => {
    vt.new(40, 6);
    vt.vtWrite(enc('\x1b]8;;https://example.com/a\x1b\\LINK\x1b]8;;\x1b\\'));
    const rows = [...vt.dirtyRows()];
    expect(rowText(rows[0]!)).toBe('LINK');
    const linked = rows[0]!.cells.filter((cell) => cell.hyperlinkUri !== undefined);
    expect(linked).toHaveLength(4);
    expect(linked.every((cell) => cell.hyperlinkUri === 'https://example.com/a')).toBe(true);
  });
});

describe('ghostty-vt input side', () => {
  it('encodes Enter as CR', () => {
    expect(dec(vt.keyEncode({ key: 'Enter' }))).toBe('\r');
  });

  it('encodes ctrl+a as 0x01 and bare modifiers as nothing', () => {
    expect(dec(vt.keyEncode({ key: 'a', code: 'KeyA', ctrlKey: true }))).toBe('\x01');
    expect(vt.keyEncode({ key: 'Shift', code: 'ShiftLeft' })).toHaveLength(0);
  });
});

describe('ghostty-vt paste', () => {
  it('flags newlines and the bracketed-paste end marker as unsafe (upstream rule)', () => {
    // upstream ghostty_paste_is_safe: unsafe iff the text contains \n or
    // "\x1b[201~"; a BARE ESC byte is considered safe because encode()
    // sanitizes it to a space (asserted below)
    expect(vt.paste.isSafe('plain')).toBe(true);
    expect(vt.paste.isSafe('a\nb')).toBe(false);
    expect(vt.paste.isSafe('\x1b[201~')).toBe(false);
    expect(vt.paste.isSafe('evil\x1bdanger')).toBe(true);
  });

  it('wraps bracketed pastes and sanitizes control bytes', () => {
    expect(dec(vt.paste.encode('hi', true))).toBe('\x1b[200~hi\x1b[201~');
    expect(dec(vt.paste.encode('evil\x1bdanger', false))).toBe('evil danger');
  });
});

describe('ghostty-vt lifecycle', () => {
  it('survives resize and keeps processing writes', () => {
    vt.resize(100, 30);
    vt.vtWrite(enc('\x1b[10;1Hafter resize'));
    const rows = [...vt.dirtyRows()];
    const row9 = rows.find((row) => row.y === 9);
    expect(rowText(row9!)).toContain('after resize');
  });

  it('scrolls the viewport without breaking the terminal', () => {
    expect(() => vt.scrollViewport(-3)).not.toThrow();
    expect(() => vt.scrollViewport(2)).not.toThrow();
    vt.vtWrite(enc('still alive'));
  });

  it('encodes a non-empty base64 snapshot', () => {
    const snapshot = vt.snapshotEncode();
    expect(snapshot.length).toBeGreaterThan(100);
    expect(snapshot).toMatch(/^[A-Za-z0-9+/]+={0,2}$/);
  });
});

describe('ghostty-vt failure discipline', () => {
  it('throws a typed error on use-after-free (and free is idempotent)', () => {
    vt.free();
    expect(() => vt.free()).not.toThrow();
    expect(() => vt.vtWrite(enc('A'))).toThrow(GhosttyVTError);
    // dirtyRows is a generator: the guard fires when iteration starts
    expect(() => [...vt.dirtyRows()]).toThrow(GhosttyVTError);
  });

  it('rejects loads with neither bytes nor url, and garbage bytes, with typed errors', async () => {
    await expect(loadGhosttyVT({})).rejects.toThrow(GhosttyVTError);
    await expect(loadGhosttyVT({ bytes: new Uint8Array([1, 2, 3]) })).rejects.toThrow(GhosttyVTError);
  });
});

describe('ghostty-vt url fallback discipline (instantiateStreaming)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('falls back to buffered instantiation when the content type is not application/wasm', async () => {
    // wrong MIME: instantiateStreaming refuses up front; the buffered
    // fallback must still load the REAL bytes and build the core
    const bytes = await acquireWasmBytes();
    const response = new Response(bytes.slice().buffer, {
      headers: { 'content-type': 'application/octet-stream' },
    });
    vi.stubGlobal('fetch', vi.fn(async () => response));

    const loaded = await loadGhosttyVT({ url: 'https://example.test/ghostty-vt.wasm' });
    expect(loaded.buildInfo.length).toBeGreaterThan(0);
    loaded.free();
  });

  it('reads a pristine clone after a streaming failure consumed the body', async () => {
    // application/wasm + garbage: the streaming compile consumes the body
    // and then fails. The fallback must compile a CLONE taken before any
    // consumption — re-reading the disturbed response (the pre-fix code)
    // died as a wrapped "could not be loaded" TypeError instead of the
    // honest instantiation error.
    const garbage = new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0xff, 0xff]);
    const response = new Response(garbage, {
      headers: { 'content-type': 'application/wasm' },
    });
    const cloneSpy = vi.spyOn(response, 'clone');
    vi.stubGlobal('fetch', vi.fn(async () => response));

    const promise = loadGhosttyVT({ url: 'https://example.test/broken.wasm' });
    await expect(promise).rejects.toThrow(/instantiation failed/);
    await expect(promise).rejects.not.toThrow(/could not be loaded/);
    // the clone was the fallback's source, not the consumed original
    expect(cloneSpy).toHaveBeenCalledTimes(1);
    expect(response.bodyUsed).toBe(true);
  });
});
