// layer-law.ts — the F9 canonical layer statement (stylex-kernel
// phase 0, P0.2; openspec/changes/2026-09-14-stylex-kernel-phase0
// design §1; Gate-2 P1-1 revision, 2026-09-15).
//
// THE LAW (the general form, measured into place by the Gate-2 dual-
// order fixture): consumer utilities ALWAYS beat kernel atom paint,
// under EITHER import order (kernel css first or the consumer's
// Tailwind entry first). Two mechanics jointly deliver it:
//
//   1. NESTING — the engine's priority layers nest UNDER `components`
//      (`components.stylex.priorityN`, the engine's useCSSLayers
//      prefix), never as top-level names. Cascade-layer registration
//      is append-only by first mention: a TOP-LEVEL stylex layer first
//      mentioned after the consumer's `utilities` registration sorts
//      AFTER it and permanently beats utilities (the Gate-2 finding —
//      measured: consumer-first import + a top-level stylex layer =
//      the atom wins). Nesting under `components` repairs every order:
//      Tailwind's own prelude (`@layer properties, theme, base,
//      components, utilities;`) registers `components` BEFORE
//      `utilities`, so the kernel css arriving later appends INSIDE
//      `components` — still before utilities. Unlayered consumer
//      utilities beat all layers trivially.
//   2. THE STATEMENT — every kernel-emitted CSS opens with the ONE
//      canonical FULL statement at byte zero, listing EVERY priority
//      layer the css carries (priority1..N, N = the highest layer the
//      engine emitted for THIS css — the O1-H measurement of 1..3 was
//      that corpus's special case, not the law) with `utilities`
//      CONSTANTLY LAST. When the kernel css is first (or merged at the
//      top of the consumer's entry — the single-file build), the
//      statement wins the first-mention race outright.
//
// OWNERSHIP: the plugin bakes this statement (dev /virtual:stylex.css
// and build assets); the payload generator stamps it at byte zero of
// every item css. Authors NEVER hand-write it. The `useCSSLayers`
// engine config ({ before: [properties, theme, base, components],
// prefix: 'components.stylex', after: ['utilities'] }) rides the same
// law — keep the two in lockstep (STYLEX_LAYER_* below + the pins in
// vite-plugin.ts / scripts/lib/stylex-payload.mjs).

/** the engine layer prefix — nested under `components` (mechanic 1) */
export const STYLEX_LAYER_PREFIX = 'components.stylex';

/** the layers registered BEFORE the stylex tiers in the canonical statement */
export const STYLEX_LAYERS_BEFORE: readonly string[] = ['properties', 'theme', 'base', 'components'] as const;

/** the layer registered LAST — the law's constant (utilities eternally final) */
export const STYLEX_LAYERS_AFTER: readonly string[] = ['utilities'] as const;

/**
 * The canonical FULL layer statement for a css whose highest stylex
 * priority layer is `maxPriority` (0 = the sheet form: no stylex
 * tiers). The exact bytes are contract surface: pinned by
 * test/stylex/*.test.ts and asserted byte-zero by the phase-0 gates.
 * Listing layers a css does not carry is harmless; MISSING one it
 * carries is the escape the gates plant against.
 */
export function canonicalLayerStatement(maxPriority: number): string {
  const tiers = Array.from({ length: Math.max(0, maxPriority) }, (_, i) => `${STYLEX_LAYER_PREFIX}.priority${i + 1}`);
  return `@layer ${[...STYLEX_LAYERS_BEFORE, ...tiers, ...STYLEX_LAYERS_AFTER].join(', ')};`;
}

/**
 * The highest stylex priority layer mentioned anywhere in a css
 * (statement prelude or block prelude, nested or flat form).
 * 0 when the css mentions none.
 */
export function maxStylexPriority(css: string): number {
  let max = 0;
  for (const m of css.matchAll(/(?:^|[.,\s])stylex\.priority([0-9]+)/g)) {
    const n = Number.parseInt(m[1]!, 10);
    if (n > max) max = n;
  }
  return max;
}

/** the parsed canonical statement (a css's opening line, when lawful) */
export interface CanonicalStatement {
  /** the highest priority tier the statement covers */
  readonly maxPriority: number;
}

/**
 * Parse a css's opening statement as the canonical form. Returns null
 * when the css does not open with `canonicalLayerStatement(N)` for
 * some N ≥ 0 (exact bytes, tiers strictly priority1..priorityN).
 */
export function parseCanonicalStatement(css: string): CanonicalStatement | null {
  const m = /^@layer properties, theme, base, components,(?: components\.stylex\.priority[0-9]+,)* utilities;\n/.exec(css);
  if (!m) return null;
  const tiers = [...m[0].matchAll(/components\.stylex\.priority([0-9]+)/g)].map((t) => Number.parseInt(t[1]!, 10));
  for (let i = 0; i < tiers.length; i++) {
    if (tiers[i] !== i + 1) return null; // must be exactly priority1..priorityN, in order
  }
  return { maxPriority: tiers.length };
}
