# tasks — design-language-kernel

> Packet-ordered (design §9 — the executable sequence; review r1-4).
> P0 owns every shared file; subagents never commit.

- [ ] 1. **P0 contract** — change docs ACCEPTED (Codex round), packet
  manifest + owned-file globs published, registry item `density` +
  list-item dependency edge applied to registry.json.
  *Gate: openspec validate --strict + review ACCEPT.*
- [ ] 2. **P5a probe scaffolding** — BOTH verify scripts committed
  (verify-density-kernel.mjs + verify-item-ruler.mjs) with their
  design-§8 assertion lists and named fixtures; assertions may run red
  against the unmigrated tree (that is the point).
  *Gate: scripts execute on repo Chromium; failures are assertion-red,
  not crash.*
- [ ] 3. **P2 theme pair** — appendix A verbatim in the canonical sheet
  + byte-identical mirror; nothing else moves.
  *Gate: verify-density-kernel computed-table assertions + mirror
  parity + full suite green.*
- [ ] 4. **P3 context module** — registry:lib item files both trees +
  apps/www/test/density-context.spec.ts (stamps, nested shadowing,
  explicit override, SSR attrs, no-any).
  *Gate: density-context.spec green + svelte-check clean on the module.*
- [ ] 5. **P4 list-item migration (ONE packet, both halves)** — size→
  Density widening, ItemGroup provider + ruler prop + stamp stripping,
  data-size removal, --jx-d-* rewiring, appendix B insertion under the
  existing @layer components block, field-lane css (§5), standalone
  matrix retained as fallback. P4 ALSO owns the existing list-item
  test surface (list-item.spec.ts, list-item-field.spec.ts,
  playground-bridge.spec.ts + the item-group-host / item-field-host /
  item-policy-host fixtures) and updates them for data-density stamps,
  the ruler, and the field lane.
  *Gate: verify-item-ruler ALL GREEN + existing 33/33 matrix gate +
  focused vitest + §7 grep pass.*
- [ ] 6. **P5b final Chromium acceptance** — both verify scripts rerun
  green post-migration (incl. the checkbox-group fixture and the
  no-subgrid 33/33 fallback).
- [ ] 7. **P6 blueprint/docs** — four densities + mixed rulers + the
  two defect scenes; screenshots for the Owner.
  *Gate: build:site self-checks + SSR/wide/narrow walkthrough + OWNER
  VISUAL ACCEPTANCE.*
- [ ] 8. **P0 closeout** — payload/manifest regen, combined suite +
  all scripts, Codex implementation review round(s), residuals fixed,
  archive with review records.
