/*
 * Text-selection live probe (selection feature, owner request 2026-08-28).
 * Real-wasm golden tests for the gesture-driven selection surface:
 * drag spans, multi-click tiers, row-selection render state, clear.
 *
 * Probed semantics these goldens pin (see the binding's field notes):
 *   - drag (2,0) -> (5,1) selects row0 x2..cols-1 and row1 x0..4 (the
 *     pointer cell is NOT included on the end row); PLAIN+trim text is
 *     "llo world\nsecon".
 *   - press+release+press within the 250ms window = click tier 2 = word.
 *   - RowSnapshot.selection spans are both-inclusive viewport columns.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { loadGhosttyVT, type RowSnapshot } from '../../../registry/files/lib/ghostty-vt';

const wasmPath =
  process.env.JIXOAI_GHOSTTY_WASM_PATH ?? '/tmp/ghostty-research/ghostty-vt.wasm';

const enc = (text: string): Uint8Array => new TextEncoder().encode(text);

describe('selection (live wasm)', () => {
  it('drag press→drag→release produces the cross-line span, text, and row spans', async () => {
    const vt = await loadGhosttyVT({ bytes: readFileSync(resolve(wasmPath)) });
    vt.resize(40, 6);
    vt.vtWrite(enc('hello world\r\nsecond line here\r\nthird'));
    for (const _ of vt.dirtyRows());

    vt.selection.events.press(2, 0, 1);
    vt.selection.events.drag(5, 1);
    vt.selection.events.release(5, 1);

    expect(vt.selection.text()).toBe('llo world\nsecon');

    const spans = new Map<number, RowSnapshot['selection']>();
    for (const row of vt.dirtyRows()) {
      if (row.selection !== undefined) spans.set(row.y, row.selection);
    }
    // row 0 runs to the last column (inclusive), row 1 stops before the
    // pointer cell (drag to x=5 selects x0..4, inclusive)
    expect(spans.get(0)).toEqual({ startX: 2, endX: 39 });
    expect(spans.get(1)).toEqual({ startX: 0, endX: 4 });
    expect(spans.has(2)).toBe(false);

    // a fresh single click retires the highlight
    vt.selection.events.press(0, 5, 1);
    expect(vt.selection.text()).toBeNull();
    vt.free();
  });

  it('double-click (tier 2) selects the word under the pointer', async () => {
    const vt = await loadGhosttyVT({ bytes: readFileSync(resolve(wasmPath)) });
    vt.resize(40, 6);
    vt.vtWrite(enc('hello world\r\nsecond line here\r\nthird'));
    for (const _ of vt.dirtyRows());

    // the real UI cadence: press, release, press again within 250ms —
    // the binding's synthesized clock drives the upstream counter
    vt.selection.events.press(0, 1, 1);
    vt.selection.events.release(0, 1);
    vt.selection.events.press(0, 1, 2);
    vt.selection.events.release(0, 1);

    expect(vt.selection.text()).toBe('second');

    let sawSpan = false;
    for (const row of vt.dirtyRows()) {
      if (row.selection !== undefined) {
        sawSpan = true;
        expect(row.y).toBe(1);
      }
    }
    expect(sawSpan).toBe(true);
    vt.free();
  });

  it('triple-click (tier 3) selects the whole line and clear() drops it', async () => {
    const vt = await loadGhosttyVT({ bytes: readFileSync(resolve(wasmPath)) });
    vt.resize(40, 6);
    vt.vtWrite(enc('hello world\r\nsecond line here\r\nthird'));
    for (const _ of vt.dirtyRows());

    vt.selection.events.press(4, 1, 1);
    vt.selection.events.press(4, 1, 2);
    vt.selection.events.press(4, 1, 3);
    expect(vt.selection.text()).toBe('second line here');

    vt.selection.clear();
    expect(vt.selection.text()).toBeNull();
    // clear() marks the previously selected row dirty (repaint hygiene)
    const dirty = [...vt.dirtyRows()].map((row) => row.y);
    expect(dirty).toContain(1);
    vt.free();
  });

  it('cell drag within one row selects the cells before the pointer', async () => {
    const vt = await loadGhosttyVT({ bytes: readFileSync(resolve(wasmPath)) });
    vt.resize(40, 6);
    vt.vtWrite(enc('hello world'));
    for (const _ of vt.dirtyRows());

    vt.selection.events.press(0, 0, 1);
    vt.selection.events.drag(3, 0);
    expect(vt.selection.text()).toBe('hel');
    vt.free();
  });
});

// keep the file single-purpose marker (mirrors cursor-probe's suite note)
describe('selection probe suite', () => {
  it('placeholder keeps the file single-purpose', () => {
    expect(fileURLToPath(import.meta.url)).toContain('selection-probe');
  });
});
