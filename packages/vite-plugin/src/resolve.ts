// Wasm source resolver: env override -> content-addressed cache -> verified
// download. Pure node (fs/crypto/fetch), zero dependencies.
//
// Intents (orthogonal count: 2):
//   1. The frozen public API `resolveGhosttyWasm(opts)` with the behavior
//      matrix frozen in design.md D2 (env returns the source file path and
//      never writes the cache; offline reads cache only and names the env
//      escape hatch on miss; online goes cache -> download -> verify ->
//      atomic tmp+rename cache write).
//   2. Download hardening (design.md D2): https only, per-hop host
//      allowlist with a 5-hop redirect budget, 30s timeout, streaming
//      4MB cap that never trusts Content-Length, and the canonical URL
//      path structure check parameterized by pin.source.tag.
//
// Owner original demand: 2026-08-28 "ghostty-term / packages/vite-plugin".

import { createHash, randomUUID } from 'node:crypto';
import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';

import {
  PINNED_REPO,
  VARIANT_ASSET_NAMES,
  defaultPinPath,
  readPin,
  type GhosttyPin,
  type PinVariantName,
} from './pin.ts';

export type { GhosttyPin, PinVariantName } from './pin.ts';

export const GHOSTTY_WASM_PATH_ENV = 'JIXOAI_GHOSTTY_WASM_PATH';

/** Redirect target hosts that may ever serve a GitHub release asset. */
export const HOST_ALLOWLIST: ReadonlySet<string> = new Set([
  'github.com',
  'objects.githubusercontent.com',
  'release-assets.githubusercontent.com',
]);

export const MAX_REDIRECTS = 5;
export const REQUEST_TIMEOUT_MS = 30_000;
export const MAX_DOWNLOAD_BYTES = 4 * 1024 * 1024;

export interface ResolveGhosttyWasmOptions {
  /** default 'full' */
  variant?: PinVariantName;
  /** default <cwd>/node_modules/.cache/jixoai-ghostty */
  cacheDir?: string;
  /** true = cache only; a miss is an error (no network) */
  offline?: boolean;
}

export interface ResolvedGhosttyWasm {
  bytes: Uint8Array;
  /** env override: absolute source file path; otherwise the cache path */
  path: string;
  sha256: string;
  variant: PinVariantName;
  buildInfo: string;
}

export class GhosttyResolveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GhosttyResolveError';
  }
}

export function defaultCacheDir(): string {
  return join(process.cwd(), 'node_modules', '.cache', 'jixoai-ghostty');
}

export function sha256Hex(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

const pinDriftFix =
  'the pinned sha256 and the upstream release asset disagree — check the ghostty-wasm-sync workflow status; to force a local file, set JIXOAI_GHOSTTY_WASM_PATH to a wasm you trust';

function assertCanonicalDownloadUrl(url: string, pin: GhosttyPin, variant: PinVariantName): URL {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new GhosttyResolveError(
      `[jixoai-ghostty] INVALID URL — ${JSON.stringify(url)} does not parse; ${pinDriftFix}`,
    );
  }
  const expectedPath = `/${PINNED_REPO}/releases/download/${pin.source.tag}/${VARIANT_ASSET_NAMES[variant]}`;
  if (parsed.protocol !== 'https:') {
    throw new GhosttyResolveError(
      `[jixoai-ghostty] REJECTED URL — only https: is allowed (found ${parsed.protocol}); ${pinDriftFix}`,
    );
  }
  if (parsed.hostname !== 'github.com' || parsed.pathname !== expectedPath) {
    throw new GhosttyResolveError(
      `[jixoai-ghostty] REJECTED URL — release asset must live at https://github.com${expectedPath} (found ${url}); ${pinDriftFix}`,
    );
  }
  return parsed;
}

function assertHopUrl(url: URL): void {
  if (url.protocol !== 'https:') {
    throw new GhosttyResolveError(
      `[jixoai-ghostty] REJECTED REDIRECT — only https: hops are allowed (found ${url.protocol} at ${url.href})`,
    );
  }
  if (!HOST_ALLOWLIST.has(url.hostname)) {
    throw new GhosttyResolveError(
      `[jixoai-ghostty] REJECTED REDIRECT — host ${url.hostname} is not in the allowlist [${[...HOST_ALLOWLIST].join(', ')}] (${url.href})`,
    );
  }
}

async function readBodyCapped(response: Response): Promise<Uint8Array> {
  if (response.body === null) {
    return new Uint8Array(await response.arrayBuffer());
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (value !== undefined) {
      total += value.byteLength;
      if (total > MAX_DOWNLOAD_BYTES) {
        await reader.cancel();
        throw new GhosttyResolveError(
          `[jixoai-ghostty] DOWNLOAD TOO LARGE — exceeded the ${MAX_DOWNLOAD_BYTES} byte streaming cap before EOF (Content-Length is never trusted); ${pinDriftFix}`,
        );
      }
      chunks.push(value);
    }
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return out;
}

const REDIRECT_STATUSES = new Set([301, 302, 303, 307, 308]);

/**
 * Download with per-hop validation. The initial URL must be the canonical
 * GitHub download URL from the pin; every redirect hop must be https and
 * host-allowlisted; at most MAX_REDIRECTS hops; every response body is
 * streamed under the hard cap.
 */
export async function downloadPinnedAsset(
  startUrl: string,
  pin: GhosttyPin,
  variant: PinVariantName,
): Promise<Uint8Array> {
  let current = assertCanonicalDownloadUrl(startUrl, pin, variant);
  let redirects = 0;
  for (;;) {
    assertHopUrl(current);
    const response = await fetch(current, {
      redirect: 'manual',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (REDIRECT_STATUSES.has(response.status)) {
      if (redirects >= MAX_REDIRECTS) {
        throw new GhosttyResolveError(
          `[jixoai-ghostty] TOO MANY REDIRECTS — more than ${MAX_REDIRECTS} hops from ${startUrl}`,
        );
      }
      redirects += 1;
      const location = response.headers.get('location');
      if (location === null) {
        throw new GhosttyResolveError(
          `[jixoai-ghostty] BAD REDIRECT — status ${response.status} without a Location header at ${current.href}`,
        );
      }
      current = new URL(location, current);
      continue;
    }
    if (!response.ok) {
      throw new GhosttyResolveError(
        `[jixoai-ghostty] DOWNLOAD FAILED — HTTP ${response.status} at ${current.href}; retry, or set JIXOAI_GHOSTTY_WASM_PATH to a local wasm to work offline`,
      );
    }
    return readBodyCapped(response);
  }
}

async function writeCacheAtomically(cacheDir: string, sha256: string, bytes: Uint8Array): Promise<string> {
  await mkdir(cacheDir, { recursive: true });
  const finalPath = join(cacheDir, `${sha256}.wasm`);
  const tmpPath = join(cacheDir, `.tmp-${sha256.slice(0, 8)}-${randomUUID()}`);
  // tmp + rename: a half-written cache file must never be observable.
  await writeFile(tmpPath, bytes);
  await rename(tmpPath, finalPath);
  return finalPath;
}

/**
 * The public resolver against the shipped pin.
 * Signature and behavior matrix frozen in design.md D3/D2.
 */
export async function resolveGhosttyWasm(
  opts: ResolveGhosttyWasmOptions = {},
): Promise<ResolvedGhosttyWasm> {
  return resolveWasmFromPin(await readPin(), opts);
}

/**
 * Resolver core against an injected pin (internal; exported for tests and
 * the sync tooling that needs deterministic fixtures).
 */
export async function resolveWasmFromPin(
  pin: GhosttyPin,
  opts: ResolveGhosttyWasmOptions = {},
): Promise<ResolvedGhosttyWasm> {
  const variantName: PinVariantName = opts.variant ?? 'full';
  const variant = pin.variants[variantName];
  if (variant === undefined) {
    throw new GhosttyResolveError(
      `[jixoai-ghostty] INVALID VARIANT — ${JSON.stringify(variantName)} is not one of full|small`,
    );
  }

  // 1. Explicit local override wins; the source path is returned as-is and
  //    the cache is never written (explicit local intent).
  const envPath = process.env[GHOSTTY_WASM_PATH_ENV];
  if (envPath !== undefined && envPath !== '') {
    let bytes: Uint8Array;
    try {
      bytes = new Uint8Array(await readFile(envPath));
    } catch (err) {
      throw new GhosttyResolveError(
        `[jixoai-ghostty] UNREADABLE OVERRIDE — ${GHOSTTY_WASM_PATH_ENV} points at ${envPath} which cannot be read (${(err as Error).message}); unset it or fix the path`,
      );
    }
    const actual = sha256Hex(bytes);
    if (actual !== variant.sha256) {
      throw new GhosttyResolveError(
        `[jixoai-ghostty] SHA256 MISMATCH — ${GHOSTTY_WASM_PATH_ENV} file ${envPath} hashes to ${actual} but the pin expects ${variant.sha256}; ${pinDriftFix}`,
      );
    }
    return {
      bytes,
      path: resolve(envPath),
      sha256: variant.sha256,
      variant: variantName,
      buildInfo: variant.buildInfo,
    };
  }

  const cacheDir = opts.cacheDir ?? defaultCacheDir();
  const cachePath = join(cacheDir, `${variant.sha256}.wasm`);

  // 2. Cache hit (verified). A file that fails verification is discarded
  //    and treated as a miss.
  try {
    const cached = new Uint8Array(await readFile(cachePath));
    if (sha256Hex(cached) === variant.sha256) {
      return {
        bytes: cached,
        path: cachePath,
        sha256: variant.sha256,
        variant: variantName,
        buildInfo: variant.buildInfo,
      };
    }
    await unlink(cachePath).catch(() => {});
  } catch {
    // miss
  }

  // 3. Cache miss.
  if (opts.offline === true) {
    throw new GhosttyResolveError(
      `[jixoai-ghostty] OFFLINE CACHE MISS — no verified copy of the ${variantName} wasm in ${cacheDir} and network is disabled; rerun online once to populate the cache, or point ${GHOSTTY_WASM_PATH_ENV} at a local copy`,
    );
  }

  const bytes = await downloadPinnedAsset(variant.url, pin, variantName);
  if (bytes.byteLength !== variant.size) {
    throw new GhosttyResolveError(
      `[jixoai-ghostty] SIZE MISMATCH — downloaded ${bytes.byteLength} bytes but the pin expects ${variant.size}; ${pinDriftFix}`,
    );
  }
  const actual = sha256Hex(bytes);
  if (actual !== variant.sha256) {
    throw new GhosttyResolveError(
      `[jixoai-ghostty] SHA256 MISMATCH — ${variant.url} hashes to ${actual} but the pin expects ${variant.sha256}; ${pinDriftFix}`,
    );
  }

  const written = await writeCacheAtomically(cacheDir, variant.sha256, bytes);
  return {
    bytes,
    path: written,
    sha256: variant.sha256,
    variant: variantName,
    buildInfo: variant.buildInfo,
  };
}

// Re-exported for the plugin/bin surface (defaultPinPath keeps a single
// source of truth for manifest location).
export { defaultPinPath, readPin };
