# Gate-1 r3 verdict — visual-g1 (Codex, gpt-5.6-terra xhigh), 2026-09-15

**NEEDS-WORK 7.3/10** (worked 20m 30s; r1 5.8 → r2 6.8). All four r2
blockers confirmed closed by independent re-verification (css-arch delta
title + four scenarios verbatim, diff confined to the two exemption
bullets; connector unified across delta/design/tasks; kit three parts +
four isolated pins consistent; mermaid six GWT scenarios preserved with
three backdrop scenarios added). Three new blockers, all API-name
accuracy:

1. **W4 named the wrong prop** — the standing API is
   `scrollbar?: ScrollbarVariant` (`scroll-area.svelte:45,54`), not
   `variant`; the canary would have missed the real API.
2. **W3 named the wrong prop** — the standing API is
   `animation?: 'none' | 'view' | 'scroll'` (`timeline.svelte:64`), not
   `anim`.
3. **5.4 confused the two payload proofs** — bare `shadcn build` does not
   generate the StyleX manifest; the living specs require
   `verify:stylex-payload` (css-architecture) and the separate
   `apps/www/test/registry-payload-parity.spec.ts` vitest for public
   parity.

Non-blocking: antialias-proof connector sampling (line-core + normal
ground patch); DOM snapshot ownership explicitness; the legacy
`inset-area` fallback must share the corrected mapping.

## r4 response (this commit)

- B1: every mention now retires the `scrollbar` prop + `ScrollbarVariant`
  type (delta requirement + renamed scenario "the scrollbar mode prop is
  gone" with a canary that scans BOTH names, asserts NO mode branch of
  any name, and plants a live `scrollbar` prop as its two-directional
  fixture; proposal ×2; task 4.2).
- B2: `animation='scroll'` (the standing prop, explicitly noted
  unchanged) in the delta scenario.
- B3: task 5.4 + proposal Impact name the exact gates per invariant —
  source-to-mirror: `pnpm verify:mirror` + `pnpm verify:deps`;
  source-to-payload: `pnpm build:registry` + `pnpm verify:stylex-payload`
  + `pnpm --filter @jixoai/www exec vitest run
  test/registry-payload-parity.spec.ts` — each with its own receipt.
- Non-blocking adopted: connector sampling is now antialias-proof
  (line-core pixel vs normal-direction ground patch past the edge) in
  design + task 2.2; the corrected mapping feeds BOTH `position-area`
  and the legacy `inset-area` fallback (one table, two emissions) in
  design W5 + task 5.1; the DOM-snapshot ownership (grid host, `<ol
  role="list">`, rest attributes) was already named in task 3.1.
