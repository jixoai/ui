import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { loadGhosttyVT } from '../../../registry/files/lib/ghostty-vt';
const wasmPath = process.env.JIXOAI_GHOSTTY_WASM_PATH ?? '/tmp/ghostty-research/ghostty-vt.wasm';
describe('title timing (off-by-one hunt)', () => {
  it('readTitle reflects the write synchronously', async () => {
    const vt = await loadGhosttyVT({ bytes: readFileSync(wasmPath) });
    vt.new(80, 24);
    expect(vt.readTitle()).toBe('');
    vt.vtWrite(new TextEncoder().encode('\x1b]0;FIRST\x07'));
    expect(vt.readTitle()).toBe('FIRST'); // ← if this fails, terminal_get lags
    vt.free();
  });
  it('onTitleChange fires on the SAME write', async () => {
    const vt = await loadGhosttyVT({ bytes: readFileSync(wasmPath) });
    vt.new(80, 24);
    const seen: string[] = [];
    vt.onTitleChange((t) => seen.push(t));
    vt.vtWrite(new TextEncoder().encode('\x1b]0;SAME-WRITE\x07'));
    expect(seen).toEqual(['SAME-WRITE']); // ← if empty, the diff lags
    vt.free();
  });
});
