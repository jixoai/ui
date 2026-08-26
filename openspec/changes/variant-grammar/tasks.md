# tasks — variant-grammar

- [x] Phase 0: Codex design review rounds until convergence; freeze design.md
- [x] Variant hue tokens land in jixoai.css (mirror pair) per design.md
- [x] Ripple runtime extraction: press-button/ripple.svelte.ts (mirror pair,
      PressButton zero-behavior refactor)
- [x] component-authoring spec delta (hit-lane alias fix + grammar clause)
- [x] Badge redesign: kbd-law sizing, slotStart/slotEnd, shape axis,
      variant grammar (mirror pair)
- [x] InlineCode component + shiki.ts highlightTokens (mirror pair)
- [x] Chip component (mirror pair): press physics + default ripple +
      hit-lane on the real root
- [x] PressButton variant migration (46 sites) + docs page rework
- [x] Alert tone migration + AlertDialogAction grammar adoption + pages
- [x] Badge tone= migration + badge.html rework
- [x] Shared registry work (ZCode-owned): registry.json (90 items),
      svelte.config routes, docs-structure snapshot, density rows
      (chip→C, inline-code→E), mirror manifest (90/302), blueprint
      scenes + SVGs, payload regen
- [x] New docs pages: inline-code.html, chip.html
- [x] Contract tests + all gates green (vitest 544/544 incl. the two
      variant-grammar source guards, svelte-check 253/19 == pre-wave
      baseline, kernel 61/61, density-adoption 66/66, mirror check
      GREEN, verify-press 12/12 — scroll-aware harness, r3 fix)
- [x] Milestone Codex review loop: r1 design 6/10 → r2 impl 7.5/10
      (7 blockers fixed) → r3 impl 8.5/10 (3 delivery blockers fixed:
      toast source path + guard coverage, scroll-aware verify-press,
      evidence counts)
- [x] Codex r4 confirmation: 9.0/10, zero blockers — the three r3
      delivery fixes verified clean (nested toast path + six-page
      guard, scroll-aware verify-press 12/12, evidence counts); toast
      header-comment hygiene fixed post-r4
- [ ] Owner browser review (the honest gaps, design §7): Badge
      anatomy/height, secondary softening, Alert surface change, Chip
      control-scale silhouette; light/dark semantic contrast probe for
      every shipped injection; independent svelte-check reproduction
