// Probe tests (design.md D2 check faces):
//   valid pinned wasm passes both variants; truncated / tampered /
//   garbage bytes fail; a hand-built wasm with a non-empty import face
//   fails with the import-contract message; a hand-built export-less
//   wasm fails the superset assertion; the CLI emits the frozen pin
//   fragment shape.

import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { GhosttyProbeError, MAX_C_STR_BYTES, probeGhosttyWasm, readCString, runProbeCli } from '../src/probe.ts';
import { loadWasmBytes } from './helpers.js';

// (module (type (func)) (import "e" "f" (func 0)))
const WASM_WITH_IMPORT = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x04, 0x01, 0x60, 0x00, 0x00, 0x02, 0x07,
  0x01, 0x01, 0x65, 0x01, 0x66, 0x00, 0x00,
]);

// (module (type (func)) (func) (export "foo" (func 0)) (code ...))
const WASM_WITHOUT_GHOSTTY_EXPORTS = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00, 0x01, 0x04, 0x01, 0x60, 0x00, 0x00, 0x03, 0x02,
  0x01, 0x00, 0x07, 0x07, 0x01, 0x03, 0x66, 0x6f, 0x6f, 0x00, 0x00, 0x0a, 0x04, 0x01, 0x02, 0x00,
  0x0b,
]);

let tmpRoot: string;

beforeEach(async () => {
  tmpRoot = await mkdtemp(join(tmpdir(), 'jixoai-probe-'));
});

afterEach(async () => {
  await rm(tmpRoot, { recursive: true, force: true });
});

describe('probeGhosttyWasm on the real pinned bytes', () => {
  it('full variant passes all five check faces', async (ctx) => {
    const bytes = await loadWasmBytes('full');
    if (bytes === undefined) return ctx.skip('wasm unavailable offline (CI needs network or a seeded cache)');
    const result = probeGhosttyWasm(bytes);
    expect(result.buildInfo.length).toBeGreaterThan(0);
    expect(result.importCount).toBe(0);
    expect(result.exportCount).toBe(181); // wasm fact baseline (briefs.md Batch A)
  });

  it('small variant passes all five check faces', async (ctx) => {
    const bytes = await loadWasmBytes('small');
    if (bytes === undefined) return ctx.skip('wasm unavailable offline (CI needs network or a seeded cache)');
    const result = probeGhosttyWasm(bytes);
    expect(result.buildInfo.length).toBeGreaterThan(0);
    expect(result.importCount).toBe(0);
    expect(result.exportCount).toBe(181);
  });

  it('truncated bytes fail validation', async (ctx) => {
    const bytes = await loadWasmBytes('full');
    if (bytes === undefined) return ctx.skip('wasm unavailable offline');
    expect(() => probeGhosttyWasm(bytes.slice(0, 10_000))).toThrow(/INVALID WASM/);
  });

  it('tampered bytes fail', async (ctx) => {
    const bytes = await loadWasmBytes('full');
    if (bytes === undefined) return ctx.skip('wasm unavailable offline');
    const tampered = bytes.slice();
    const mid = tampered.length >> 1;
    tampered[mid] = (tampered[mid] ?? 0) ^ 0xff;
    expect(() => probeGhosttyWasm(tampered)).toThrow(GhosttyProbeError);
  });
});

describe('probeGhosttyWasm failure modes (hand-built modules)', () => {
  it('rejects garbage bytes', () => {
    expect(() => probeGhosttyWasm(new TextEncoder().encode('not wasm at all'))).toThrow(
      /INVALID WASM/,
    );
  });

  it('rejects a module with a non-empty import face ({}-instantiation contract)', () => {
    expect(() => probeGhosttyWasm(WASM_WITH_IMPORT)).toThrow(/IMPORT FACE CHANGED/);
  });

  it('rejects a module missing the required export families', () => {
    expect(() => probeGhosttyWasm(WASM_WITHOUT_GHOSTTY_EXPORTS)).toThrow(/MISSING EXPORTS/);
  });
});

describe('readCString (bounded C-string scan)', () => {
  const decoder = new TextDecoder();

  it('reads a NUL-terminated string and stops at the terminator', () => {
    const mem = new TextEncoder().encode('0.1.0-dev\0trailing garbage');
    expect(readCString(mem, 0, decoder)).toBe('0.1.0-dev');
  });

  it('accepts a terminator at the very last byte of memory', () => {
    const mem = new TextEncoder().encode('ab\0');
    expect(readCString(mem, 0, decoder)).toBe('ab');
  });

  it('throws on an unterminated string running to the end of memory', () => {
    const mem = new TextEncoder().encode('no terminator');
    expect(() => readCString(mem, 0, decoder)).toThrow(GhosttyProbeError);
    expect(() => readCString(mem, 0, decoder)).toThrow(/UNTERMINATED C STRING/);
  });

  it('throws when the cap is reached before a NUL (no scan-forever loop)', () => {
    // non-zero fill just past the cap — must fail at MAX_C_STR_BYTES,
    // never walk off the view
    const mem = new Uint8Array(MAX_C_STR_BYTES + 64).fill(0x61);
    expect(() => readCString(mem, 0, decoder)).toThrow(/UNTERMINATED C STRING/);
    // the scan window is [ptr, ptr + MAX): MAX-1 payload bytes + NUL at
    // index MAX-1 is the longest legal read; a NUL one byte further out
    // is past the cap and still fails loudly
    const bounded = new Uint8Array(MAX_C_STR_BYTES + 1).fill(0x62);
    bounded[MAX_C_STR_BYTES - 1] = 0;
    expect(() => readCString(bounded, 0, decoder)).not.toThrow();
    bounded[MAX_C_STR_BYTES - 1] = 0x62;
    bounded[MAX_C_STR_BYTES] = 0;
    expect(() => readCString(bounded, 0, decoder)).toThrow(/UNTERMINATED C STRING/);
  });

  it('rejects pointers outside the memory view (negative / past-the-end)', () => {
    const mem = new TextEncoder().encode('x\0');
    expect(() => readCString(mem, -1, decoder)).toThrow(/outside linear memory/);
    expect(() => readCString(mem, mem.length, decoder)).toThrow(/outside linear memory/);
    expect(() => readCString(mem, mem.length + 5, decoder)).toThrow(/outside linear memory/);
    expect(() => readCString(mem, 1.5, decoder)).toThrow(/outside linear memory/);
  });
});

describe('jixoai-ghostty-probe CLI', () => {
  it('emits the frozen pin fragment on stdout', async (ctx) => {
    const bytes = await loadWasmBytes('full');
    if (bytes === undefined) return ctx.skip('wasm unavailable offline');
    const wasmPath = join(tmpRoot, 'ghostty-vt.wasm');
    await writeFile(wasmPath, bytes);

    const out: string[] = [];
    const err: string[] = [];
    const code = await runProbeCli(['--wasm', wasmPath, '--variant', 'full', '--json'], {
      stdout: (l) => out.push(l),
      stderr: (l) => err.push(l),
    });
    expect(code).toBe(0);
    expect(err).toEqual([]);
    const fragment = JSON.parse(out.join('\n')) as Record<string, unknown>;
    expect(Object.keys(fragment).sort()).toEqual(['buildInfo', 'sha256', 'size', 'variant']);
    expect(fragment['variant']).toBe('full');
    expect(fragment['size']).toBe(bytes.byteLength);
    expect(fragment['sha256']).toMatch(/^[0-9a-f]{64}$/);
  });

  it('exits non-zero with a named reason on failure', async () => {
    const badPath = join(tmpRoot, 'bad.wasm');
    await writeFile(badPath, 'garbage');
    const out: string[] = [];
    const err: string[] = [];
    const code = await runProbeCli(['--wasm', badPath, '--variant', 'full'], {
      stdout: (l) => out.push(l),
      stderr: (l) => err.push(l),
    });
    expect(code).toBe(1);
    expect(out).toEqual([]);
    expect(err.join('\n')).toMatch(/INVALID WASM/);
  });

  it('exits 2 on missing or invalid args', async () => {
    const io = { stdout: () => {}, stderr: () => {} };
    await expect(runProbeCli([], io)).resolves.toBe(2);
    await expect(runProbeCli(['--variant', 'full'], io)).resolves.toBe(2);
    await expect(runProbeCli(['--wasm', 'x', '--variant', 'huge'], io)).resolves.toBe(2);
  });
});
