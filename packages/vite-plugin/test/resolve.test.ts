// Resolver behavior matrix tests (design.md D2/D3):
//   env override | offline cache-only | cache hit without fetch | download
//   hardening (https only, per-hop host allowlist, redirect budget,
//   streaming size cap, sha256 verification, atomic cache write).
//
// Hardening cases run against a synthetic pin via resolveWasmFromPin so
// they need no network and no real wasm bytes; the env/cache cases use
// small synthetic files with matching synthetic pins.

import { mkdtemp, readdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  GHOSTTY_WASM_PATH_ENV,
  HOST_ALLOWLIST,
  MAX_DOWNLOAD_BYTES,
  resolveWasmFromPin,
  sha256Hex,
  type GhosttyPin,
} from '../src/resolve.ts';
import { PIN_VARIANT_NAMES, type PinVariant } from '../src/pin.ts';
import { loadWasmBytes } from './helpers';

function syntheticPin(bytes: Uint8Array, overrides: Partial<PinVariant> = {}): GhosttyPin {
  const variant: PinVariant = {
    url: 'https://github.com/ghostty-org/ghostty/releases/download/tip/ghostty-vt.wasm',
    sha256: sha256Hex(bytes),
    size: bytes.byteLength,
    buildInfo: 'synthetic-build-info',
    ...overrides,
  };
  return {
    pinnedAt: '2026-08-28T00:00:00Z',
    source: {
      repo: 'ghostty-org/ghostty',
      tag: 'tip',
      releaseUrl: 'https://github.com/ghostty-org/ghostty/releases/tag/tip',
    },
    variants: {
      full: variant,
      small: { ...variant, url: variant.url.replace(/ghostty-vt\.wasm$/, 'ghostty-vt-small.wasm') },
    },
  };
}

const PAYLOAD = new TextEncoder().encode('synthetic wasm payload — not a real module');

let tmpRoot: string;
let savedEnv: string | undefined;
let cacheDir: string;

beforeEach(async () => {
  tmpRoot = await mkdtemp(join(tmpdir(), 'jixoai-resolve-'));
  cacheDir = join(tmpRoot, 'cache');
  savedEnv = process.env[GHOSTTY_WASM_PATH_ENV];
  delete process.env[GHOSTTY_WASM_PATH_ENV];
});

afterEach(async () => {
  if (savedEnv === undefined) delete process.env[GHOSTTY_WASM_PATH_ENV];
  else process.env[GHOSTTY_WASM_PATH_ENV] = savedEnv;
  vi.unstubAllGlobals();
  await rm(tmpRoot, { recursive: true, force: true });
});

describe('env override (JIXOAI_GHOSTTY_WASM_PATH)', () => {
  it('returns the absolute source path and never writes the cache', async () => {
    const pin = syntheticPin(PAYLOAD);
    const sourcePath = join(tmpRoot, 'local.wasm');
    await writeFile(sourcePath, PAYLOAD);
    process.env[GHOSTTY_WASM_PATH_ENV] = sourcePath;

    const result = await resolveWasmFromPin(pin, { cacheDir });
    expect(result.path).toBe(resolve(sourcePath));
    expect(result.bytes).toEqual(PAYLOAD);
    expect(result.sha256).toBe(pin.variants.full.sha256);
    expect(result.buildInfo).toBe('synthetic-build-info');
    // no cache write happened
    await expect(readdir(cacheDir)).rejects.toThrow();
  });

  it('env wins over offline:true (explicit local intent)', async () => {
    const pin = syntheticPin(PAYLOAD);
    const sourcePath = join(tmpRoot, 'local.wasm');
    await writeFile(sourcePath, PAYLOAD);
    process.env[GHOSTTY_WASM_PATH_ENV] = sourcePath;

    const result = await resolveWasmFromPin(pin, { cacheDir, offline: true });
    expect(result.path).toBe(resolve(sourcePath));
  });

  it('fails with a named fix when the env file hash disagrees with the pin', async () => {
    const pin = syntheticPin(PAYLOAD);
    process.env[GHOSTTY_WASM_PATH_ENV] = join(tmpRoot, 'wrong.wasm');
    await writeFile(join(tmpRoot, 'wrong.wasm'), 'tampered');

    await expect(resolveWasmFromPin(pin, { cacheDir })).rejects.toThrow(
      /SHA256 MISMATCH.*JIXOAI_GHOSTTY_WASM_PATH/s,
    );
  });

  it('fails with a named fix when the env file does not exist', async () => {
    const pin = syntheticPin(PAYLOAD);
    process.env[GHOSTTY_WASM_PATH_ENV] = join(tmpRoot, 'missing.wasm');

    await expect(resolveWasmFromPin(pin, { cacheDir })).rejects.toThrow(/UNREADABLE OVERRIDE/);
  });
});

describe('offline mode', () => {
  it('cache miss errors and names the env escape hatch', async () => {
    const pin = syntheticPin(PAYLOAD);
    await expect(resolveWasmFromPin(pin, { cacheDir, offline: true })).rejects.toThrow(
      new RegExp(`OFFLINE CACHE MISS[\\s\\S]*${GHOSTTY_WASM_PATH_ENV}`),
    );
  });

  it('cache hit serves without touching the network', async () => {
    const pin = syntheticPin(PAYLOAD);
    await import('node:fs/promises').then((fs) => fs.mkdir(cacheDir, { recursive: true }));
    await writeFile(join(cacheDir, `${pin.variants.full.sha256}.wasm`), PAYLOAD);

    const boom = vi.fn(() => {
      throw new Error('network must not be touched on a cache hit');
    });
    vi.stubGlobal('fetch', boom);

    const result = await resolveWasmFromPin(pin, { cacheDir, offline: true });
    expect(result.path).toBe(join(cacheDir, `${pin.variants.full.sha256}.wasm`));
    expect(boom).not.toHaveBeenCalled();
  });

  it('a corrupted cache file is discarded and reported as a miss when offline', async () => {
    const pin = syntheticPin(PAYLOAD);
    await import('node:fs/promises').then((fs) => fs.mkdir(cacheDir, { recursive: true }));
    await writeFile(join(cacheDir, `${pin.variants.full.sha256}.wasm`), 'corrupted');

    await expect(resolveWasmFromPin(pin, { cacheDir, offline: true })).rejects.toThrow(
      /OFFLINE CACHE MISS/,
    );
  });
});

describe('download hardening', () => {
  const canonicalUrl = 'https://github.com/ghostty-org/ghostty/releases/download/tip/ghostty-vt.wasm';

  it('downloads via allowlisted redirect hops, verifies, and writes the cache atomically', async () => {
    const pin = syntheticPin(PAYLOAD);
    const fetchMock = vi.fn(async (input: string | URL) => {
      const url = String(input);
      if (url === canonicalUrl) {
        return new Response(null, {
          status: 302,
          headers: { location: 'https://release-assets.githubusercontent.com/a/b/c' },
        });
      }
      return new Response(PAYLOAD);
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await resolveWasmFromPin(pin, { cacheDir });
    expect(result.bytes).toEqual(PAYLOAD);
    expect(result.path).toBe(join(cacheDir, `${pin.variants.full.sha256}.wasm`));
    // exactly one cache file, no tmp leftovers
    const entries = await readdir(cacheDir);
    expect(entries).toEqual([`${pin.variants.full.sha256}.wasm`]);
    expect(new Uint8Array(await readFile(result.path))).toEqual(PAYLOAD);
  });

  it('rejects a redirect to a non-allowlisted host', async () => {
    const pin = syntheticPin(PAYLOAD);
    vi.stubGlobal('fetch', vi.fn(async () =>
      new Response(null, {
        status: 302,
        headers: { location: 'https://evil.example.com/asset' },
      }),
    ));
    await expect(resolveWasmFromPin(pin, { cacheDir })).rejects.toThrow(
      /REJECTED REDIRECT.*evil\.example\.com.*allowlist/s,
    );
  });

  it('rejects http: hops mid-redirect', async () => {
    const pin = syntheticPin(PAYLOAD);
    vi.stubGlobal('fetch', vi.fn(async () =>
      new Response(null, { status: 302, headers: { location: 'http://github.com/x' } }),
    ));
    await expect(resolveWasmFromPin(pin, { cacheDir })).rejects.toThrow(/REJECTED REDIRECT.*https/s);
  });

  it('rejects an http: canonical url from the pin', async () => {
    const pin = syntheticPin(PAYLOAD, {
      url: 'http://github.com/ghostty-org/ghostty/releases/download/tip/ghostty-vt.wasm',
    });
    await expect(resolveWasmFromPin(pin, { cacheDir })).rejects.toThrow(/REJECTED URL.*https/s);
  });

  it('rejects a url whose path leaves the canonical download layout', async () => {
    const pin = syntheticPin(PAYLOAD, {
      url: 'https://github.com/ghostty-org/ghostty/releases/download/tip/../../other.wasm',
    });
    await expect(resolveWasmFromPin(pin, { cacheDir })).rejects.toThrow(/REJECTED URL/);
  });

  it('malicious dot-segment tags never produce an out-of-bounds URL', async () => {
    // defense in depth behind validatePin: even an injected pin whose tag
    // is "." / ".." / "a/../b" must be rejected at the URL gate before
    // any fetch — the URL parser normalizes dot segments away, so the
    // literal expectedPath can never match
    for (const tag of ['.', '..', 'a/../b']) {
      const pin = syntheticPin(PAYLOAD, {
        url: `https://github.com/ghostty-org/ghostty/releases/download/${tag}/ghostty-vt.wasm`,
      });
      pin.source.tag = tag;
      const fetchMock = vi.fn(async () => {
        throw new Error('fetch must never run for a malicious tag');
      });
      vi.stubGlobal('fetch', fetchMock);
      await expect(resolveWasmFromPin(pin, { cacheDir })).rejects.toThrow(/REJECTED URL/);
      expect(fetchMock).not.toHaveBeenCalled();
      vi.unstubAllGlobals();
    }
  });

  it('downloads a stable-tag pin fixture through its canonical URL (mock fetch, no network)', async () => {
    const pin = syntheticPin(PAYLOAD, {
      url: 'https://github.com/ghostty-org/ghostty/releases/download/stable/ghostty-vt.wasm',
    });
    pin.source.tag = 'stable';
    pin.source.releaseUrl = 'https://github.com/ghostty-org/ghostty/releases/tag/stable';
    pin.variants.small.url =
      'https://github.com/ghostty-org/ghostty/releases/download/stable/ghostty-vt-small.wasm';

    const fetchMock = vi.fn(async (_input: string | URL | Request) => new Response(PAYLOAD));
    vi.stubGlobal('fetch', fetchMock);

    const result = await resolveWasmFromPin(pin, { cacheDir });
    expect(result.bytes).toEqual(PAYLOAD);
    expect(result.path).toBe(join(cacheDir, `${pin.variants.full.sha256}.wasm`));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(String(fetchMock.mock.calls[0]![0])).toBe(
      'https://github.com/ghostty-org/ghostty/releases/download/stable/ghostty-vt.wasm',
    );
  });

  it('rejects after the 5-hop redirect budget', async () => {
    const pin = syntheticPin(PAYLOAD);
    let hops = 0;
    vi.stubGlobal('fetch', vi.fn(async () => {
      hops += 1;
      return new Response(null, {
        status: 302,
        headers: { location: `https://objects.githubusercontent.com/hop-${hops}` },
      });
    }));
    await expect(resolveWasmFromPin(pin, { cacheDir })).rejects.toThrow(/TOO MANY REDIRECTS/);
    expect(hops).toBe(6); // initial + 5 redirects, then the budget error
  });

  it('streams under a hard 4MB cap without trusting Content-Length', async () => {
    const pin = syntheticPin(PAYLOAD);
    const chunk = new Uint8Array(1024 * 1024).fill(0x61);
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        for (let i = 0; i < 5; i += 1) controller.enqueue(chunk);
        controller.close();
      },
    });
    vi.stubGlobal('fetch', vi.fn(async () =>
      new Response(stream, {
        status: 200,
        headers: { 'content-length': String(PAYLOAD.byteLength) }, // lying header
      }),
    ));
    await expect(resolveWasmFromPin(pin, { cacheDir })).rejects.toThrow(/DOWNLOAD TOO LARGE/);
    expect(MAX_DOWNLOAD_BYTES).toBe(4 * 1024 * 1024);
    // nothing was cached
    await expect(readdir(cacheDir)).rejects.toThrow();
  });

  it('fails with a named fix on a non-200 terminal response', async () => {
    const pin = syntheticPin(PAYLOAD);
    vi.stubGlobal('fetch', vi.fn(async () => new Response('not found', { status: 404 })));
    await expect(resolveWasmFromPin(pin, { cacheDir })).rejects.toThrow(
      /DOWNLOAD FAILED.*JIXOAI_GHOSTTY_WASM_PATH/s,
    );
  });

  it('fails with a named fix when the downloaded hash disagrees with the pin', async () => {
    const pin = syntheticPin(PAYLOAD, { sha256: '0'.repeat(64), size: PAYLOAD.byteLength });
    vi.stubGlobal('fetch', vi.fn(async () => new Response(PAYLOAD)));
    await expect(resolveWasmFromPin(pin, { cacheDir })).rejects.toThrow(
      /SHA256 MISMATCH.*ghostty-wasm-sync/s,
    );
  });

  it('fails when the downloaded size disagrees with the pin', async () => {
    const pin = syntheticPin(PAYLOAD, { size: PAYLOAD.byteLength + 1 });
    vi.stubGlobal('fetch', vi.fn(async () => new Response(PAYLOAD)));
    await expect(resolveWasmFromPin(pin, { cacheDir })).rejects.toThrow(/SIZE MISMATCH/);
  });

  it('rejects an unknown variant name', async () => {
    const pin = syntheticPin(PAYLOAD);
    await expect(
      resolveWasmFromPin(pin, { cacheDir, variant: 'medium' as 'full' }),
    ).rejects.toThrow(/INVALID VARIANT/);
  });
});

describe('resolver against the real shipped pin (env path with real bytes)', () => {
  it('env override verifies the real wasm against the shipped pin (both variants)', async () => {
    for (const variant of PIN_VARIANT_NAMES) {
      const bytes = await loadWasmBytes(variant);
      if (bytes === undefined) {
        console.warn(`[resolve.test] skipping real-pin env test for ${variant} (wasm unavailable offline)`);
        continue;
      }
      const sourcePath = join(tmpRoot, `real-${variant}.wasm`);
      await writeFile(sourcePath, bytes);
      process.env[GHOSTTY_WASM_PATH_ENV] = sourcePath;

      const { resolveGhosttyWasm } = await import('../src/resolve.ts');
      const result = await resolveGhosttyWasm({ variant, cacheDir });
      expect(result.path).toBe(resolve(sourcePath));
      expect(result.bytes.byteLength).toBeGreaterThan(700_000);
      expect(HOST_ALLOWLIST.has('github.com')).toBe(true);
    }
  });
});
