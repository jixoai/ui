// Test asset acquisition for the pinned wasm bytes.
//
// Discipline (design.md D2): binaries never enter git; tests read them
// from (1) the local research copies under /tmp/ghostty-research, else
// (2) the plugin resolver cache / one-time verified download into
// node_modules/.cache/jixoai-ghostty. When neither is possible (offline,
// cold machine) the callers skip with an explicit message — CI must run
// with network or a pre-seeded cache as a prerequisite step.

import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { resolveGhosttyWasm } from '../src/resolve.ts';

const RESEARCH_DIR = '/tmp/ghostty-research';

export async function loadWasmBytes(
  variant: 'full' | 'small',
): Promise<Uint8Array<ArrayBuffer> | undefined> {
  const name = variant === 'full' ? 'ghostty-vt.wasm' : 'ghostty-vt-small.wasm';
  const local = join(RESEARCH_DIR, name);
  const copy = (raw: Uint8Array): Uint8Array<ArrayBuffer> => {
    // node Buffers may wrap pooled ArrayBuffers; hand WebAssembly a
    // plain ArrayBuffer-backed view
    const out = new Uint8Array(raw.byteLength);
    out.set(raw);
    return out;
  };
  if (existsSync(local)) {
    return copy(await readFile(local));
  }
  try {
    return copy((await resolveGhosttyWasm({ variant, offline: false })).bytes);
  } catch (err) {
    console.warn(
      `[test:helpers] wasm ${variant} unavailable (offline with cold cache) — skipping network-dependent assertions. CI prerequisite: run online once or pre-seed the cache. (${(err as Error).message})`,
    );
    return undefined;
  }
}

export function expectWasm(bytes: Uint8Array<ArrayBuffer> | undefined): Uint8Array<ArrayBuffer> {
  if (bytes === undefined) {
    throw new Error('unreachable: guard with skipIf instead');
  }
  return bytes;
}
