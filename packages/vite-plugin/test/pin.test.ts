// Pin manifest schema + cross-field validation tests (design.md D2):
// every validatePin branch is exercised against mutations of the real
// shipped pin.

import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { PinError, readPin, validatePin, type GhosttyPin } from '../src/pin.ts';

const pinPath = fileURLToPath(new URL('../ghostty.pin.json', import.meta.url));

async function readRealPin(): Promise<GhosttyPin> {
  return JSON.parse(await readFile(pinPath, 'utf8')) as GhosttyPin;
}

function mutate(pin: GhosttyPin, fn: (p: GhosttyPin) => void): unknown {
  const clone = structuredClone(pin);
  fn(clone);
  return clone;
}

let tmpRoot: string;

beforeEach(async () => {
  tmpRoot = await mkdtemp(join(tmpdir(), 'jixoai-pin-'));
});

afterEach(async () => {
  await rm(tmpRoot, { recursive: true, force: true });
});

/** A complete, valid pin pinned to a stable tag (every URL agrees with it). */
function stableTagPin(): GhosttyPin {
  const download = (asset: string): string =>
    `https://github.com/ghostty-org/ghostty/releases/download/stable/${asset}`;
  return {
    pinnedAt: '2026-08-28T00:00:00Z',
    source: {
      repo: 'ghostty-org/ghostty',
      tag: 'stable',
      releaseUrl: 'https://github.com/ghostty-org/ghostty/releases/tag/stable',
    },
    variants: {
      full: {
        url: download('ghostty-vt.wasm'),
        sha256: 'a'.repeat(64),
        size: 123,
        buildInfo: 'stable-build-info',
      },
      small: {
        url: download('ghostty-vt-small.wasm'),
        sha256: 'b'.repeat(64),
        size: 45,
        buildInfo: 'stable-build-info',
      },
    },
  };
}

describe('ghostty.pin.json (shipped manifest)', () => {
  it('validates against the frozen schema', async () => {
    const doc = JSON.parse(await readFile(pinPath, 'utf8'));
    expect(validatePin(doc)).toEqual([]);
  });

  it('readPin() returns the validated manifest', async () => {
    const pin = await readPin(pinPath);
    expect(pin.source.repo).toBe('ghostty-org/ghostty');
    expect(pin.source.tag).toBe('tip');
    expect([...Object.keys(pin.variants)].sort()).toEqual(['full', 'small']);
    expect(pin.variants.full.sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(pin.variants.small.sha256).toMatch(/^[0-9a-f]{64}$/);
  });
});

describe('validatePin cross-field assertions', () => {
  it('rejects a tag that is not a safe single path segment', async () => {
    const doc = mutate(await readRealPin(), (p) => {
      p.source.tag = '../evil';
    });
    expect(validatePin(doc)).toContainEqual(
      expect.stringContaining('source.tag must match'),
    );
  });

  it('rejects a slash-bearing tag (path traversal)', async () => {
    const doc = mutate(await readRealPin(), (p) => {
      p.source.tag = 'a/b';
    });
    expect(validatePin(doc).some((x) => x.includes('source.tag must match'))).toBe(true);
  });

  it('rejects the dot-segment tags "." and ".." (URL traversal)', async () => {
    const pin = await readRealPin();
    for (const tag of ['.', '..', 'a/../b']) {
      const doc = mutate(pin, (p) => {
        p.source.tag = tag;
      });
      const problems = validatePin(doc);
      expect(
        problems.some((x) => x.includes('source.tag must match')),
        `tag ${JSON.stringify(tag)} must be rejected`,
      ).toBe(true);
    }
  });

  it('readPin throws PinError for a manifest whose tag is a dot segment', async () => {
    const doc = mutate(await readRealPin(), (p) => {
      p.source.tag = '..';
    });
    const badPath = join(tmpRoot, 'evil.pin.json');
    await writeFile(badPath, JSON.stringify(doc));
    await expect(readPin(badPath)).rejects.toThrow(PinError);
    await expect(readPin(badPath)).rejects.toThrow(/source\.tag must match/);
  });

  it('rejects releaseUrl that disagrees with source.tag', async () => {
    const doc = mutate(await readRealPin(), (p) => {
      p.source.releaseUrl = 'https://github.com/ghostty-org/ghostty/releases/tag/other';
    });
    expect(validatePin(doc).some((x) => x.includes('releaseUrl must be'))).toBe(true);
  });

  it('rejects a variant url whose tag disagrees with source.tag', async () => {
    const doc = mutate(await readRealPin(), (p) => {
      p.variants.full.url =
        'https://github.com/ghostty-org/ghostty/releases/download/other/ghostty-vt.wasm';
    });
    expect(validatePin(doc).some((x) => x.includes('variants.full.url must be'))).toBe(true);
  });

  it('rejects a variant url with a substituted asset name', async () => {
    const doc = mutate(await readRealPin(), (p) => {
      p.variants.small.url =
        'https://github.com/ghostty-org/ghostty/releases/download/tip/ghostty-vt.wasm';
    });
    expect(validatePin(doc).some((x) => x.includes('variants.small.url must be'))).toBe(true);
  });

  it('rejects non-https variant urls', async () => {
    const doc = mutate(await readRealPin(), (p) => {
      p.variants.full.url = `http://${p.variants.full.url.slice('https://'.length)}`;
    });
    expect(validatePin(doc).some((x) => x.includes('variants.full.url must be'))).toBe(true);
  });

  it('rejects variant keys other than exactly full+small', async () => {
    const doc = mutate(await readRealPin(), (p) => {
      delete (p.variants as Record<string, unknown>).small;
    });
    expect(validatePin(doc).some((x) => x.includes('variants keys must be exactly full+small'))).toBe(true);
  });

  it('rejects extra variant keys', async () => {
    const doc = mutate(await readRealPin(), (p) => {
      (p.variants as Record<string, unknown>).medium = p.variants.small;
    });
    expect(validatePin(doc).some((x) => x.includes('variants keys must be exactly full+small'))).toBe(true);
  });

  it('rejects malformed sha256', async () => {
    const doc = mutate(await readRealPin(), (p) => {
      p.variants.full.sha256 = 'XYZ';
    });
    expect(validatePin(doc).some((x) => x.includes('sha256 must be 64 lowercase hex'))).toBe(true);
  });

  it('rejects non-positive size', async () => {
    const doc = mutate(await readRealPin(), (p) => {
      p.variants.full.size = 0;
    });
    expect(validatePin(doc).some((x) => x.includes('size must be a positive integer'))).toBe(true);
  });

  it('rejects empty buildInfo', async () => {
    const doc = mutate(await readRealPin(), (p) => {
      p.variants.full.buildInfo = '';
    });
    expect(validatePin(doc).some((x) => x.includes('buildInfo must be a non-empty string'))).toBe(true);
  });

  it('rejects a foreign repo', async () => {
    const doc = mutate(await readRealPin(), (p) => {
      p.source.repo = 'evil/ghostty';
    });
    expect(validatePin(doc).some((x) => x.includes('source.repo must be'))).toBe(true);
  });

  it('rejects a non-object document', () => {
    expect(validatePin(null)).toEqual(['pin must be a JSON object']);
    expect(validatePin([1, 2])).toEqual(['pin must be a JSON object']);
  });

  it('rejects an unparseable pinnedAt', async () => {
    const doc = mutate(await readRealPin(), (p) => {
      p.pinnedAt = 'not-a-date';
    });
    expect(validatePin(doc).some((x) => x.includes('pinnedAt must be ISO 8601'))).toBe(true);
  });
});

describe('stable tag pins (positive fixture)', () => {
  it('accepts a complete valid pin whose source.tag is "stable"', () => {
    expect(validatePin(stableTagPin())).toEqual([]);
  });

  it('keeps rejecting a stable-tag pin when any URL disagrees with the tag', () => {
    const doc = mutate(stableTagPin(), (p) => {
      p.source.releaseUrl = 'https://github.com/ghostty-org/ghostty/releases/tag/tip';
    });
    expect(validatePin(doc).some((x) => x.includes('releaseUrl must be'))).toBe(true);

    const doc2 = mutate(stableTagPin(), (p) => {
      p.variants.small.url =
        'https://github.com/ghostty-org/ghostty/releases/download/tip/ghostty-vt-small.wasm';
    });
    expect(validatePin(doc2).some((x) => x.includes('variants.small.url must be'))).toBe(true);
  });

  it('readPin returns a stable-tag manifest unchanged', async () => {
    const stablePath = join(tmpRoot, 'stable.pin.json');
    const pin = stableTagPin();
    await writeFile(stablePath, JSON.stringify(pin));
    const loaded = await readPin(stablePath);
    expect(loaded.source.tag).toBe('stable');
    expect(loaded.variants.full.url).toBe(
      'https://github.com/ghostty-org/ghostty/releases/download/stable/ghostty-vt.wasm',
    );
  });
});
