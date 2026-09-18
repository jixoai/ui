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
//      that corpus's special case, not the law). The utilities tier is
//      GONE from the prelude since the engine died (PFINAL): the
//      kernel emits nothing there, and a consumer's own utilities
//      registration appends after our every mention — nesting keeps
//      them winning.
//
// OWNERSHIP: the plugin bakes this statement (dev /virtual:stylex.css
// and build assets); the payload generator stamps it at byte zero of
// every item css. Authors NEVER hand-write it. The `useCSSLayers`
// engine config ({ before: [properties, theme, base, components],
// prefix: 'components.stylex', after: [] }) rides the same law —
// keep the two in lockstep (STYLEX_LAYER_* below + the pins in
// vite-plugin.ts / scripts/lib/stylex-payload.mjs). PFINAL: the
// after-list is EMPTY — no utilities reservation anywhere.

/** the engine layer prefix — nested under `components` (mechanic 1) */
export const STYLEX_LAYER_PREFIX = 'components.stylex';

/** the layers registered BEFORE the stylex tiers in the canonical statement */
export const STYLEX_LAYERS_BEFORE: readonly string[] = ['properties', 'theme', 'base', 'components'] as const;

/**
 * The layer registered LAST — EMPTY since the engine died (PFINAL,
 * tailwindless one-shot W4-r2, 2026-09-19): the kernel emits nothing
 * into a utilities tier, so the prelude no longer reserves one. The
 * nesting mechanic (components.stylex.* inside components) keeps
 * consumer utilities winning under EITHER import order — a consumer's
 * own utilities registration (their TW prelude, or an unlayered rule)
 * appends after everything the kernel mentions, still above our paint.
 */
export const STYLEX_LAYERS_AFTER: readonly string[] = [] as const;

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
 * The canonical statement's exact-bytes pattern for any tier count
 * (N ≥ 0) — exported so the packaging gate asserts the PUBLISHED dist
 * against the ONE source (the bytes cannot drift between the two).
 */
export const CANONICAL_STATEMENT_PATTERN =
  '@layer properties, theme, base, components(?:, components\\.stylex\\.priority[0-9]+)*;';

/**
 * Parse a css's opening statement as the canonical form. Returns null
 * when the css does not open with `canonicalLayerStatement(N)` for
 * some N ≥ 0 (exact bytes, tiers strictly priority1..priorityN).
 */
export function parseCanonicalStatement(css: string): CanonicalStatement | null {
  const m = new RegExp(`^(?:${CANONICAL_STATEMENT_PATTERN})\\n`).exec(css);
  if (!m) return null;
  const tiers = [...m[0].matchAll(/components\.stylex\.priority([0-9]+)/g)].map((t) => Number.parseInt(t[1]!, 10));
  for (let i = 0; i < tiers.length; i++) {
    if (tiers[i] !== i + 1) return null; // must be exactly priority1..priorityN, in order
  }
  return { maxPriority: tiers.length };
}

/**
 * The canonical statement's SEMANTIC pattern — whitespace/minification
 * tolerant (Gate-2 r4: real vite re-serializes an entry sheet's
 * statement as `@layer properties,theme,base,components,utilities;` —
 * semantically identical, byte-different). Layer names, their ORDER,
 * and the trailing utilities stay strict; tier numbers are not
 * required consecutive here (the stripped statement's registrations
 * are always re-covered by the prepended full statement's superset).
 */
const CANONICAL_STATEMENT_TOLERANT =
  '@layer\\s*properties\\s*,\\s*theme\\s*,\\s*base\\s*,\\s*components(?:\\s*,\\s*components\\.stylex\\.priority[0-9]+)*\\s*,\\s*utilities\\s*;';

/**
 * Remove EVERY canonical-form statement from a css (Gate-2 r3 P1: the
 * merged asset carries EXACTLY ONE — bakeF9 strips the incoming ones
 * before prepending the fresh full statement). Matches ALL legal
 * whitespace/minification variants of the canonical form (the exact
 * bytes we EMIT stay pinned by CANONICAL_STATEMENT_PATTERN — this is
 * the semantic matcher for what we STRIP). Re-mentions are
 * semantically inert (registered layers keep their first-mention
 * order), so removal is render-neutral; NON-canonical preludes (the
 * engine's internal `@layer properties, theme, base, components;`) —
 * no trailing utilities, not the canonical form — are left verbatim.
 */
export function stripCanonicalStatements(css: string): string {
  return css.replace(new RegExp(`${CANONICAL_STATEMENT_TOLERANT}\\n?`, 'g'), '');
}

/**
 * Count the canonical-form statements in a css, semantically
 * (whitespace/minification tolerant — the same matcher the strip
 * uses). The uniqueness gates count with THIS, never with an
 * exact-bytes pattern (the Gate-2 r4 finding: an exact-space counter
 * is blind to the minified variants a real vite build produces).
 */
export function countCanonicalStatements(css: string): number {
  return (css.match(new RegExp(CANONICAL_STATEMENT_TOLERANT, 'g')) ?? []).length;
}
