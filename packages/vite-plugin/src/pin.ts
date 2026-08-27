// Pin manifest: schema, reading, and validation.
//
// Intents (orthogonal count: 2):
//   1. Types + `readPin()` for the shipped ghostty.pin.json (the single
//      on-disk supply-chain artifact; sole writer after bootstrap is the
//      ghostty-wasm-sync workflow via PR).
//   2. `validatePin()` — schema plus cross-field assertions frozen in
//      openspec/changes/ghostty-term/design.md D2: source.tag must be a
//      safe single path segment, tag must agree across releaseUrl and
//      every variant URL, variant keys are exactly full+small, and each
//      variant URL must be the canonical GitHub download path for its
//      allowlisted asset name.
//
// Owner original demand: 2026-08-28 "ghostty-term / packages/vite-plugin".

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

/** The only repo ghostty pins releases from. */
export const PINNED_REPO = 'ghostty-org/ghostty';

/** Asset name per variant — the URL path allowlist. */
export const VARIANT_ASSET_NAMES: Record<PinVariantName, string> = {
  full: 'ghostty-vt.wasm',
  small: 'ghostty-vt-small.wasm',
};

export type PinVariantName = 'full' | 'small';
export const PIN_VARIANT_NAMES = ['full', 'small'] as const;

export interface PinSource {
  repo: string;
  tag: string;
  releaseUrl: string;
}

export interface PinVariant {
  url: string;
  sha256: string;
  size: number;
  buildInfo: string;
}

export interface GhosttyPin {
  pinnedAt: string;
  source: PinSource;
  variants: Record<PinVariantName, PinVariant>;
}

/** A tag must be a safe single path segment (no traversal, no slashes). */
const SAFE_TAG = /^[A-Za-z0-9._-]+$/;
const SHA256 = /^[0-9a-f]{64}$/;

export function releaseTagUrl(source: PinSource): string {
  return `https://github.com/${source.repo}/releases/tag/${source.tag}`;
}

export function variantDownloadUrl(
  source: PinSource,
  variant: PinVariantName,
): string {
  return `https://github.com/${source.repo}/releases/download/${source.tag}/${VARIANT_ASSET_NAMES[variant]}`;
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function str(v: unknown): string | undefined {
  return typeof v === 'string' ? v : undefined;
}

/**
 * Validate a parsed pin document. Returns a list of problems (empty =
 * valid). Pure — no fs, no network; schema tests exercise every branch.
 */
export function validatePin(doc: unknown): string[] {
  const problems: string[] = [];
  if (!isPlainObject(doc)) {
    return ['pin must be a JSON object'];
  }

  const pinnedAt = str(doc['pinnedAt']);
  if (pinnedAt === undefined) problems.push('pinnedAt must be a string');
  else if (Number.isNaN(Date.parse(pinnedAt)))
    problems.push(`pinnedAt must be ISO 8601 (found ${JSON.stringify(pinnedAt)})`);

  const source = doc['source'];
  if (!isPlainObject(source)) {
    problems.push('source must be an object');
  } else {
    const repo = str(source['repo']);
    if (repo !== PINNED_REPO)
      problems.push(`source.repo must be ${JSON.stringify(PINNED_REPO)} (found ${JSON.stringify(repo)})`);
    const tag = str(source['tag']);
    if (tag === undefined) problems.push('source.tag must be a string');
    else if (!SAFE_TAG.test(tag))
      problems.push(`source.tag must match ${SAFE_TAG.toString()} — path traversal or unsafe characters rejected (found ${JSON.stringify(tag)})`);
    const releaseUrl = str(source['releaseUrl']);
    if (tag !== undefined && SAFE_TAG.test(tag) && repo === PINNED_REPO) {
      const expected = releaseTagUrl({ repo, tag, releaseUrl: '' });
      if (releaseUrl !== expected)
        problems.push(`source.releaseUrl must be ${JSON.stringify(expected)} — it must agree with source.tag (found ${JSON.stringify(releaseUrl)})`);
    }
  }

  const variants = doc['variants'];
  if (!isPlainObject(variants)) {
    problems.push('variants must be an object');
    return problems;
  }

  const keys = Object.keys(variants).sort();
  const expectedKeys = [...PIN_VARIANT_NAMES].sort();
  if (keys.length !== expectedKeys.length || keys.some((k, i) => k !== expectedKeys[i])) {
    problems.push(`variants keys must be exactly full+small (found [${keys.join(', ')}])`);
  }

  const tag = isPlainObject(source) ? str(source['tag']) : undefined;
  const repoOk = isPlainObject(source) && str(source['repo']) === PINNED_REPO;
  for (const name of PIN_VARIANT_NAMES) {
    const variant = variants[name];
    if (!isPlainObject(variant)) {
      problems.push(`variants.${name} must be an object`);
      continue;
    }
    const url = str(variant['url']);
    const sha256 = str(variant['sha256']);
    const size = variant['size'];
    const buildInfo = str(variant['buildInfo']);

    if (tag !== undefined && SAFE_TAG.test(tag) && repoOk) {
      const expected = variantDownloadUrl({ repo: PINNED_REPO, tag, releaseUrl: '' }, name);
      if (url !== expected)
        problems.push(`variants.${name}.url must be ${JSON.stringify(expected)} — cross-check tag/asset against source (found ${JSON.stringify(url)})`);
    }
    if (sha256 === undefined) problems.push(`variants.${name}.sha256 must be a string`);
    else if (!SHA256.test(sha256))
      problems.push(`variants.${name}.sha256 must be 64 lowercase hex chars (found ${JSON.stringify(sha256)})`);
    if (typeof size !== 'number' || !Number.isSafeInteger(size) || size <= 0)
      problems.push(`variants.${name}.size must be a positive integer (found ${JSON.stringify(size)})`);
    if (buildInfo === undefined || buildInfo.length === 0)
      problems.push(`variants.${name}.buildInfo must be a non-empty string read from ghostty_build_info`);
  }

  return problems;
}

export class PinError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PinError';
  }
}

/** Default pin path: <package root>/ghostty.pin.json (adjacent to dist/). */
export function defaultPinPath(): string {
  return fileURLToPath(new URL('../ghostty.pin.json', import.meta.url));
}

/** Read and validate a pin manifest; throws PinError with a named fix. */
export async function readPin(path?: string): Promise<GhosttyPin> {
  const file = path ?? defaultPinPath();
  let text: string;
  try {
    text = await readFile(file, 'utf8');
  } catch (err) {
    throw new PinError(
      `[jixoai-ghostty] MISSING REQUIREMENT — cannot read pin manifest ${file} (${(err as Error).message}); the package install is broken — reinstall @jixoai/vite-plugin`,
    );
  }
  let doc: unknown;
  try {
    doc = JSON.parse(text);
  } catch (err) {
    throw new PinError(
      `[jixoai-ghostty] MISSING REQUIREMENT — pin manifest ${file} is not valid JSON (${(err as Error).message}); reinstall @jixoai/vite-plugin`,
    );
  }
  const problems = validatePin(doc);
  if (problems.length > 0) {
    throw new PinError(
      `[jixoai-ghostty] INVALID PIN — ${file}:\n  - ${problems.join('\n  - ')}`,
    );
  }
  return doc as GhosttyPin;
}
