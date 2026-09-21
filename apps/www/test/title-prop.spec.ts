/*
 * Component-level title propagation (demo bug hunt 2026-08-28): the docs
 * fake-shell showed the title but the real-pty demo did not — this drives
 * the PUBLIC surface (wasmUrl data: URL + handle.write of an OSC-ONLY
 * frame) to see whether onTitleChange fires without a trailing write.
 */
import { describe, expect, it, vi } from 'vitest';
import { mount } from 'svelte';
// the vt-deps seam owns the unresolvable ids (virtual:jixoai-ghostty) —
// same mock shape as ghostty-term.spec.ts, delegating to the REAL binding
vi.mock('../../../registry/files/ui/ghostty-term/vt-deps.ts', async () => {
  const real = await import('../../../registry/files/lib/ghostty-vt');
  return {
    virtualWasmUrl: () => Promise.resolve('mock://ghostty-vt.wasm'),
    loadVt: (opts?: { bytes?: Uint8Array }) =>
      real.loadGhosttyVT({ bytes: opts?.bytes ?? wasmBytes }),
  };
});
import GhosttyTerm from '../../../registry/files/ui/ghostty-term/ghostty-term.svelte';
import { acquireWasmBytes } from './helpers/ghostty-wasm';

// the cached wasm — the shared three-tier acquisition (env override →
// /tmp research copy → Batch A's pin resolver; the helper), awaited at
// module top level so the mock factory above can close over it
const wasmBytes = await acquireWasmBytes();

describe('component title propagation (real wasm)', () => {
  it('fires onTitleChange for an OSC-only write frame', async () => {
    const target = document.createElement('div');
    document.body.appendChild(target);
    const onTitle = vi.fn();
    const comp = mount(GhosttyTerm, {
      target,
      props: { onTitleChange: onTitle },
    }) as unknown as { write(b: Uint8Array): void };
    await new Promise((r) => setTimeout(r, 400));
    comp.write(new TextEncoder().encode('\x1b]0;COMP-TITLE\x07'));
    await new Promise((r) => setTimeout(r, 300));
    expect(onTitle).toHaveBeenCalledWith('COMP-TITLE');
    target.remove();
  });
});
