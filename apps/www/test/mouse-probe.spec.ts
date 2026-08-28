/*
 * Mouse-reporting live probe (design.md D3, owner request 2026-08-28).
 * Real-wasm golden tests locking the ABI facts the binding marshals:
 *
 *   - MOUSE_TRACKING (terminal_get 11) is a plain bool: true under ANY of
 *     DECSET ?9 (X10) / ?1000-?1003, false otherwise; DECRST flips back.
 *   - The encoder needs the SIZE option (screen+cell dims) for every cell
 *     format: WITHOUT it screen is 0x0, every position counts as
 *     out-of-viewport — presses/motions drop and releases encode garbage
 *     cells 1;1 (releases bypass the viewport check upstream).
 *   - SGR (DECSET ?1006) byte shapes: `ESC [ < Cb ; col ; row M/m` with
 *     1-based cells computed from px / cell size; Cb = button + mods (+32
 *     for motion). X10 (DECSET ?9) drops releases entirely.
 *   - SGR_PIXELS (DECSET ?1016) passes pixels through without SIZE.
 *   - Out-of-viewport positions are dropped for presses (clamped for
 *     releases) — the upstream posOutOfViewport rule.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { GhosttyVTError, loadGhosttyVT, type GhosttyVT } from '../../../registry/files/lib/ghostty-vt';

const wasmPath = process.env.JIXOAI_GHOSTTY_WASM_PATH ?? '/tmp/ghostty-research/ghostty-vt.wasm';

const enc = (text: string): Uint8Array => new TextEncoder().encode(text);
const latin1 = (bytes: Uint8Array): string => String.fromCharCode(...bytes);
/** 80x24 grid @ 8x16 px cells — the SIZE context every cell-format test feeds */
const CELL = { w: 8, h: 16 };

async function loadVT(): Promise<GhosttyVT> {
  const vt = await loadGhosttyVT({ bytes: new Uint8Array(readFileSync(resolve(wasmPath))) });
  vt.new(80, 24);
  return vt;
}

describe('mouse tracking mode (live wasm)', () => {
  it('MOUSE_TRACKING is a bool flipped by DECSET/DECRST (X10 and button-event)', async () => {
    const vt = await loadVT();
    expect(vt.readMouseTracking()).toBe(false);

    vt.vtWrite(enc('\x1b[?1002h\x1b[?1006h')); // button-event tracking + SGR
    for (const _ of vt.dirtyRows());
    expect(vt.readMouseTracking()).toBe(true);

    vt.vtWrite(enc('\x1b[?1002l'));
    expect(vt.readMouseTracking()).toBe(false);

    vt.vtWrite(enc('\x1b[?9h')); // X10 counts as tracking too
    expect(vt.readMouseTracking()).toBe(true);
    vt.vtWrite(enc('\x1b[?9l'));
    expect(vt.readMouseTracking()).toBe(false);
    vt.free();
  });

  it('onMouseTrackingChange fires only on flips (not on unrelated writes)', async () => {
    const vt = await loadVT();
    const seen: boolean[] = [];
    vt.onMouseTrackingChange((active) => seen.push(active));

    vt.vtWrite(enc('plain text, no mode change'));
    expect(seen).toEqual([]);

    vt.vtWrite(enc('\x1b[?1000h')); // normal tracking
    vt.vtWrite(enc('\x1b[?1000h')); // idempotent — still one flip
    expect(seen).toEqual([true]);

    vt.vtWrite(enc('\x1b[?1000l'));
    expect(seen).toEqual([true, false]);

    vt.vtWrite(enc('more text'));
    expect(seen).toEqual([true, false]);
    vt.free();
  });

  it('reset() (RIS) turns tracking off and observers see the flip', async () => {
    const vt = await loadVT();
    const seen: boolean[] = [];
    vt.onMouseTrackingChange((active) => seen.push(active));
    vt.vtWrite(enc('\x1b[?1002h'));
    expect(seen).toEqual([true]);
    vt.reset();
    expect(seen).toEqual([true, false]);
    expect(vt.readMouseTracking()).toBe(false);
    vt.free();
  });
});

describe('mouseEncode SGR bytes (live wasm)', () => {
  it('press/release/motion produce xterm SGR sequences with 1-based cells', async () => {
    const vt = await loadVT();
    vt.vtWrite(enc('\x1b[?1002h\x1b[?1006h')); // button-event tracking + SGR format
    for (const _ of vt.dirtyRows());

    // (396,132) px @ 8x16 cells -> col 50, row 9
    expect(latin1(vt.mouseEncode({ action: 'press', button: 'left', x: 396, y: 132 }, CELL))).toBe('\x1b[<0;50;9M');
    expect(latin1(vt.mouseEncode({ action: 'release', button: 'left', x: 396, y: 132 }, CELL))).toBe('\x1b[<0;50;9m');
    // motion while the left button is held: Cb += 32; (500,200) -> 63;13
    expect(latin1(vt.mouseEncode({ action: 'motion', button: 'left', x: 500, y: 200 }, CELL))).toBe('\x1b[<32;63;13M');
    // button-less motion is NOT reported in button-event tracking (?1002)
    expect(vt.mouseEncode({ action: 'motion', x: 500, y: 200 }, CELL)).toHaveLength(0);
    vt.free();
  });

  it('any-event tracking (?1003) reports button-less motion with Cb=35', async () => {
    const vt = await loadVT();
    vt.vtWrite(enc('\x1b[?1003h\x1b[?1006h'));
    for (const _ of vt.dirtyRows());
    expect(latin1(vt.mouseEncode({ action: 'motion', x: 500, y: 200 }, CELL))).toBe('\x1b[<35;63;13M');
    vt.free();
  });

  it('button enum encodes LEFT=0 MIDDLE=1 RIGHT=2 FOUR=64 FIVE=65', async () => {
    const vt = await loadVT();
    vt.vtWrite(enc('\x1b[?1002h\x1b[?1006h'));
    for (const _ of vt.dirtyRows());
    const press = (button: 'left' | 'middle' | 'right' | 'four' | 'five'): string =>
      latin1(vt.mouseEncode({ action: 'press', button, x: 396, y: 132 }, CELL));
    expect(press('left')).toBe('\x1b[<0;50;9M');
    expect(press('middle')).toBe('\x1b[<1;50;9M');
    expect(press('right')).toBe('\x1b[<2;50;9M');
    expect(press('four')).toBe('\x1b[<64;50;9M');
    expect(press('five')).toBe('\x1b[<65;50;9M');
    vt.free();
  });

  it('mods add shift=4 alt=8 ctrl=16 to the SGR button code', async () => {
    const vt = await loadVT();
    vt.vtWrite(enc('\x1b[?1002h\x1b[?1006h'));
    for (const _ of vt.dirtyRows());
    expect(latin1(vt.mouseEncode({ action: 'press', button: 'left', x: 396, y: 132, mods: { shift: true } }, CELL))).toBe('\x1b[<4;50;9M');
    expect(latin1(vt.mouseEncode({ action: 'press', button: 'left', x: 396, y: 132, mods: { alt: true } }, CELL))).toBe('\x1b[<8;50;9M');
    expect(latin1(vt.mouseEncode({ action: 'press', button: 'left', x: 396, y: 132, mods: { ctrl: true } }, CELL))).toBe('\x1b[<16;50;9M');
    expect(latin1(vt.mouseEncode({ action: 'motion', button: 'right', x: 500, y: 200, mods: { shift: true, ctrl: true } }, CELL))).toBe('\x1b[<54;63;13M');
    vt.free();
  });
});

describe('mouseEncode SIZE necessity + format differences (live wasm)', () => {
  it('WITHOUT cellSize every position is out-of-viewport: press drops, release garbage', async () => {
    const vt = await loadVT();
    vt.vtWrite(enc('\x1b[?1002h\x1b[?1006h'));
    for (const _ of vt.dirtyRows());
    // screen defaults to 0x0 -> posOutOfViewport always true; presses die,
    // releases bypass the viewport rule and clamp to cells 1;1
    expect(vt.mouseEncode({ action: 'press', button: 'left', x: 396, y: 132 })).toHaveLength(0);
    expect(latin1(vt.mouseEncode({ action: 'release', button: 'left', x: 396, y: 132 }))).toBe('\x1b[<0;1;1m');
    vt.free();
  });

  it('X10 (DECSET ?9) encodes presses as ESC [ M +3 biased bytes and drops releases', async () => {
    const vt = await loadVT();
    vt.vtWrite(enc('\x1b[?1002l\x1b[?1006l\x1b[?9h'));
    for (const _ of vt.dirtyRows());
    // col 50, row 9 -> 50+32='R', 9+32=')'
    expect(latin1(vt.mouseEncode({ action: 'press', button: 'left', x: 396, y: 132 }, CELL))).toBe('\x1b[M R)');
    expect(vt.mouseEncode({ action: 'release', button: 'left', x: 396, y: 132 }, CELL)).toHaveLength(0);
    // X10 reports only left/middle/right
    expect(vt.mouseEncode({ action: 'press', button: 'four', x: 396, y: 132 }, CELL)).toHaveLength(0);
    vt.free();
  });

  it('out-of-viewport presses are dropped even WITH cellSize (upstream rule)', async () => {
    const vt = await loadVT();
    vt.vtWrite(enc('\x1b[?1002h\x1b[?1006h'));
    for (const _ of vt.dirtyRows());
    // screen is 640x384 (80x24 @ 8x16)
    expect(vt.mouseEncode({ action: 'press', button: 'left', x: 2000, y: 2000 }, CELL)).toHaveLength(0);
    expect(vt.mouseEncode({ action: 'press', button: 'left', x: -10, y: -10 }, CELL)).toHaveLength(0);
    // the last in-viewport cell still encodes
    expect(latin1(vt.mouseEncode({ action: 'press', button: 'left', x: 639, y: 383 }, CELL))).toBe('\x1b[<0;80;24M');
    vt.free();
  });

  it('SGR_PIXELS (DECSET ?1016) reports raw pixels (SIZE feeds only the viewport bound)', async () => {
    const vt = await loadVT();
    vt.vtWrite(enc('\x1b[?1002h\x1b[?1016h'));
    for (const _ of vt.dirtyRows());
    // sgr_pixels never divides by cells, but the out-of-viewport rule still
    // consults SIZE — without it even this format drops presses
    expect(vt.mouseEncode({ action: 'press', button: 'left', x: 396, y: 132 })).toHaveLength(0);
    expect(latin1(vt.mouseEncode({ action: 'press', button: 'left', x: 396, y: 132 }, CELL))).toBe('\x1b[<0;396;132M');
    expect(latin1(vt.mouseEncode({ action: 'release', button: 'left', x: 396, y: 132 }, CELL))).toBe('\x1b[<0;396;132m');
    vt.free();
  });
});

describe('mouseEncode lifecycle discipline', () => {
  it('throws a typed error after free; free is idempotent', async () => {
    const vt = await loadVT();
    vt.free();
    expect(() => vt.free()).not.toThrow();
    expect(() => vt.readMouseTracking()).toThrow(GhosttyVTError);
    expect(() => vt.mouseEncode({ action: 'press', button: 'left', x: 1, y: 1 }, CELL)).toThrow(GhosttyVTError);
  });

  it('new() clears the mouse-tracking registry (design freeze)', async () => {
    const vt = await loadVT();
    const seen: boolean[] = [];
    vt.onMouseTrackingChange((active) => seen.push(active));
    vt.new(80, 24); // recreation drops handlers
    vt.vtWrite(enc('\x1b[?1002h'));
    expect(seen).toEqual([]);
    vt.free();
  });
});
