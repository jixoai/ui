/*
 * readScrollbar + scrollViewport ground truth (owner scroll-bug fix
 * 2026-08-28). The original bug: the binding wrote the DELTA at the
 * tagged union's TAG offset — lines=+3 literally became tag=ROW with
 * row 0, jumping the viewport to the top of scrollback on every scroll.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { Terminal, loadGhosttyVT } from '../../../registry/files/lib/ghostty-vt';

const wasmPath = process.env.JIXOAI_GHOSTTY_WASM_PATH ?? '/tmp/ghostty-research/ghostty-vt.wasm';

describe('readScrollbar live (owner scroll-bug fix)', () => {
  it('delta scrolls by exact lines; huge deltas clamp, never jump', async () => {
    const core = await loadGhosttyVT({ bytes: readFileSync(resolve(wasmPath)) });
    const term = new Terminal({ core, cols: 80, rows: 10 });
    const enc = new TextEncoder();
    for (let i = 0; i < 200; i++) term.write(enc.encode(`line ${i}\r\n`));
    for (const _ of core.dirtyRows());

    const tail = core.readScrollbar();
    expect(tail.total).toBeGreaterThanOrEqual(200);
    expect(tail.offset).toBe(tail.total - tail.len); // parked at the tail

    // wheel-down (positive) clamps at the tail instead of jumping anywhere
    core.scrollViewport(5000);
    const clamped = core.readScrollbar();
    expect(clamped.offset).toBe(clamped.total - clamped.len);

    // 40 lines up into history, then a huge down-flick back to the tail
    core.scrollViewport(-40);
    expect(core.readScrollbar().offset).toBe(clamped.offset - 40);
    core.scrollViewport(99999);
    const back = core.readScrollbar();
    expect(back.offset).toBe(back.total - back.len); // at the TAIL, not the top
    expect(back.offset).not.toBe(0);
    core.free();
  });
});
