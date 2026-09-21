/*
 * The compile-lane atom-membership joiner for specs asserting stylex
 * atoms on rendered elements (W5-r2, 2026-09-21).
 *
 * The dev-names contract died at 012335c4 — the stylex engine pins
 * dev:false ("DEV RUNS THE BUILD LANE ... hashed classes everywhere",
 * one naming lane for SSR/client/built) — so className assertions
 * against `family__familyStyles.member` dev names went stale. The
 * honest re-pin (the carved-action-band / progressive-blur precedent,
 * synced through 012335c4's own registry-twin migration): import the
 * SAME styles module the component rides and assert the compiled
 * atom STRING's membership — identity through shared source, zero
 * hard-coded hashes, assertion strength unchanged.
 *
 * cx here joins exactly the way the components' canonical cx joins:
 * string members in declaration order, $$css and non-strings skipped.
 */
export const cx = (
  ...styles: ({ readonly [key: string]: string | object } | undefined)[]
): string =>
  styles
    .filter(Boolean)
    .map((style) =>
      Object.entries(style).flatMap(([key, value]) =>
        key !== '$$css' && typeof value === 'string' ? [value] : [],
      ).join(' '),
    )
    .join(' ');
