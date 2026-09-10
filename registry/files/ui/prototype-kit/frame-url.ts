/**
 * prototype-kit frame URL builder (registry/files/ui/prototype-kit/frame-url.ts).
 *
 * Orthogonal intents:
 * 1. The ONE place the frame-surface URL contract lives (design-studio
 *    design.md §2 对接契约): a frame renders
 *    `/__design__/frame?p=<prototype>&f=<ref minus leading ./>
 *    &theme=<light|dark|auto>&w=<px>&h=<px>[&fill=0|1]` — the design
 *    server's frame surface resolves `f` through its convention glob.
 * 2. Pure and exported so tests assert the contract directly and the
 *    design server can mirror it (server-side) without importing the
 *    svelte components.
 *
 * Original requirement input: Owner 2026-09-11 — the prototype
 * standard as part of `jixoai-ui design`.
 */

import type { PrototypeTheme } from './context';

export interface FrameUrlInput {
  /** prototype folder name (the `p` param) */
  prototype: string;
  /** ref as authored in the canvas file, relative to the prototype
   *  folder — a leading `./` is stripped per the contract */
  ref: string;
  theme: PrototypeTheme;
  /** viewport width in px (the `w` param) */
  width?: number;
  /** viewport height in px (the `h` param; omitted when unknown —
   *  an adaptive component frame with no initial height) */
  height?: number;
  /** component frames only: true = height locked (`fill=1`), false =
   *  adaptive height (`fill=0`). Page frames pass undefined and emit
   *  no fill param (their viewport is always locked). */
  fill?: boolean;
}

/** strip the contract's one normalization: refs are authored relative
 *  (`./pages/hero.svelte`) and travel as folder-relative keys */
export function normalizeRef(ref: string): string {
  return ref.replace(/^\.\//, '');
}

/** build the frame-surface URL — the WHOLE kit↔server contract in
 *  one function. Every value is URL-encoded; `w`/`h` are integers. */
export function buildFrameUrl(input: FrameUrlInput): string {
  const params = new URLSearchParams();
  params.set('p', input.prototype);
  params.set('f', normalizeRef(input.ref));
  params.set('theme', input.theme);
  if (input.width !== undefined) params.set('w', String(Math.round(input.width)));
  if (input.height !== undefined) params.set('h', String(Math.round(input.height)));
  if (input.fill !== undefined) params.set('fill', input.fill ? '1' : '0');
  return `/__design__/frame?${params.toString()}`;
}
