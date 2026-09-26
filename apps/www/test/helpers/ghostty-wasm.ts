/*
 * The shared wasm-bytes acquisition for the live-wasm specs.
 *
 * Intents (2026-09-21, W5-r2): the probe specs (cursor/mouse/osc/
 * scrollbar/selection/title-timing/title-prop) each pinned only the
 * two local tiers — env override + the /tmp research copy — so on any
 * machine without the original research session they died at ENOENT
 * (the standing-set failure this closes). ghostty-vt.spec.ts's
 * three-tier ladder is the established convention; extracted here so
 * every live-wasm spec rides ONE implementation:
 *
 *   1. JIXOAI_GHOSTTY_WASM_PATH env override; an unreadable override
 *      is an error, not a fallback (loud-failure semantics).
 *   2. the research copy at /tmp/ghostty-research/ghostty-vt.wasm
 *      when present.
 *   3. Batch A's pin resolver (packages/vite-plugin/src/resolve.ts)
 *      — downloads once into the shared node_modules/.cache, then
 *      offline forever. readPin/resolveWasmFromPin are the exported
 *      for-tests seams: jsdom's browser condition makes import.meta
 *      an http:// URL, so the resolver's defaultPinPath() cannot be
 *      used from here (cwd-relative pin path instead).
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export const GHOSTTY_RESEARCH_WASM = '/tmp/ghostty-research/ghostty-vt.wasm';

export async function acquireWasmBytes(): Promise<Uint8Array> {
  const envPath = process.env.JIXOAI_GHOSTTY_WASM_PATH;
  if (envPath !== undefined) {
    return new Uint8Array(readFileSync(envPath));
  }
  if (existsSync(GHOSTTY_RESEARCH_WASM)) {
    return new Uint8Array(readFileSync(GHOSTTY_RESEARCH_WASM));
  }
  const { readPin, resolveWasmFromPin } = await import(
    '../../../../packages/vite-plugin/src/resolve'
  );
  const pinPath = join(process.cwd(), '../../packages/vite-plugin/ghostty.pin.json');
  const pin = await readPin(pinPath);
  const resolved = await resolveWasmFromPin(pin, { variant: 'full' });
  return resolved.bytes;
}
