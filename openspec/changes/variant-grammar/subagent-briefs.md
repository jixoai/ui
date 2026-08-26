# subagent briefs — variant-grammar batches (template; grammar slots from design.md)

Dispatch protocol (Owner 2026-08-24): batches are file-disjoint;
subagents NEVER touch shared files (registry.json, catalog.ts,
docs-route-model.ts, density-adoption-registry.mjs, manifest/lock) —
they REPORT needed changes instead; no git commit/push (ZCode owns
commits); no dev server / screenshot oracle / herdr. Report must
include: files touched, difficulties + how solved, and any shared-file
changes needed. ZCode cross-checks reports against the real diff.

Common context every brief carries (paste into each prompt):
- Frozen grammar: read openspec/changes/variant-grammar/design.md FIRST
- Migration inventory: openspec/changes/variant-grammar/migration-inventory.md
- Specs: openspec/specs/{component-authoring,css-architecture,design-tokens,mirror-sync}/spec.md
- Mirror law: every registry/files/ui/<x> edit lands byte-identical in
  apps/www/src/lib/ui/<x> (and reverse); lib/theme cross-root files too
- tw4 utility-authored law: component paint rides utilities in markup;
  consumer utilities always win
- Do not touch files outside your batch list; do not modify shared files

## Batch A — Badge
Files: apps/www/src/lib/ui/badge/** + registry/files/ui/badge/**,
lib/blueprints/scenes/{badge,descriptions,shiki,form-field,recipes,
component-canvas,section-card}.svelte,
routes/docs/components/badge.html/** (+verify accordion/tabs/
dropdown-menu/hero-section/badge-indicator/descriptions pages for stray
tone= usages — migrate those lines only).
Work: redesign per design.md (kbd-law sizing, slotStart/slotEnd,
shape axis, variant grammar, data-jx-badge hook values), migrate all
tone= call sites per mapping table, rewrite badge.html variant/slot/
shape demos + tone-law prose. Report registry.json docs/description
deltas needed.

## Batch B — InlineCode
Files: apps/www/src/lib/ui/inline-code/** (new, both trees),
registry/files/lib/shiki.ts + apps/www/src/lib/shiki.ts (the ONE
shared lib edit — highlightTokens export, additive only),
routes/docs/components/inline-code.html/** (new).
Work: component per design.md (default variant from design.md, mono,
lang prop, heuristic auto-detect over INLINE_LANGS, SSR-plain →
effect-highlighted tokens), docs page per house template (hero +
canvas + Types/Usage/A11y/Theming/API with PropsTable/DensityDemo).
Report: registry.json entry fields (draft them), catalog group
placement, density-registry row E suggestion.

## Batch C — Chip
Files: apps/www/src/lib/ui/chip/** (new, both trees),
registry/files/ui/chip/** , routes/docs/components/chip.html/** (new).
Imports allowed: ../press-button/ripple.svelte (createRipple),
../press-button/press-button.css, press-button module builders
(ripple/effect types), $lib/density.svelte, $lib/utils.
Work: composition per design.md (badge geometry+variants × press law +
effects + href/button duality + default ripple + hit-lane ::after
expansion + data-jx-chip), docs page per house template. Report
registry entry draft + density row C suggestion + icon-button-style
pass-through notes.

## Batch D — PressButton migration
Files: lib/ui/press-button/press-button.svelte (variant union + paint
map per design.md; both trees), lib/ui/icon-button/** (prop type
pass-through only if needed), the 14 files in migration-inventory
PressButton section (routes + blueprints; multi-line prop sites by
hand, template-literal usage strings BOTH copies).
Work: apply mapping table to all 45 sites, press-button.html variant
demos reworked to the new grammar. Report: any site where mapping is
ambiguous (flag, don't guess).

## Batch E — Alert family migration
Files: lib/ui/alert/alert.svelte (both trees),
lib/ui/alert-dialog/alert-dialog-action.svelte (both trees),
lib/blueprints/scenes/alert.svelte,
routes/docs/components/{alert,alert-dialog}.html/**.
Work: adopt design.md's Alert ruling (variant grammar or hue-injection
form), migrate ~15 sites, rewrite tone-law prose in both pages. Report:
assertive/tone pairing changes if the ruling altered them.

## Integration (ZCode, after all batches)
registry.json entries + badge update, catalog projections auto-derive
(+ docs-structure counts 73→75), density-adoption-registry rows,
gen-mirror-manifest, all gates (svelte-check delta-vs-baseline,
vitest, verify-density-kernel, verify-density-adoption, build:site),
cross-batch fixes, per-batch commits, milestone Codex review.
