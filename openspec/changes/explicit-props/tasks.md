# Tasks — the explicit props (W0..W6)

## W0 — change alignment (remix round 0)

- [ ] 0.1 change docs written (proposal/design/tasks/spec deltas) — THIS commit
- [ ] 0.2 Codex reviews the change docs (herdr, gpt-5.6-terra/xhigh) → blocking
      findings folded back; ≥8/10 with no blockers before W1 starts
- [ ] 0.3 research/tailwind-container-syntax.md — the named-container key
      grammar resolved against Tailwind v4's source (design §9)
- [ ] 0.4 research/migration-census.md — the 115-family batch list + the 16
      native families + the 4 rename families (§13) pinned as the W3 map

## W1 — token core (theme + slot helpers)

- [ ] 1.1 surface ladder: `surface`, `surface-container-lowest…highest` (+ the
      `-1dp` deepest rung) for light AND dark in `registry/files/theme/jixoai.css`
      (mirror pair byte-identical) — 减色墨律 compliant
- [ ] 1.2 elevation level table: `level-1…level5` ↔ dp (−1/0/1/3/6/8/12) ↔
      (shadow recipe, surface role) per theme profile; NO surface tint
- [ ] 1.3 the eight axes' expression carriers: `--jx-size(-effective)`,
      `--jx-radius(-effective)`, `--jx-inset-effective`, `--jx-shape(-effective)`,
      `--jx-color`, `--jx-elevation`, `--jx-motion` (+theme class bridge reuse)
- [ ] 1.4 `defaults.svelte.ts`: generalized `sizeSlot`/`radiusSlot`/`colorSlot`/
      `shapeSlot`/`elevationSlot`/`motionSlot` beside `densitySlot` (same
      explicit ?? ambient ?? own law); registry mirror pair updated
- [ ] 1.5 density rename lands: docs vocabulary small|medium|large, legacy
      rungs re-exposed as aliases; `density.svelte.ts` mirror pair updated
- [ ] 1.6 fixed micro-typography exemption verified (caption 9px / micro 10px
      stay absolute under em-scaling — probe receipt)

## W2 — plugin layer

- [ ] 2.1 alias schema: per-axis `[$alias]: value` tables; `auto`/number
      reserved-literal enforcement (schema rejects remaps)
- [ ] 2.2 @supports verdicts: corner-shape global stamp + the §2 degrade table
      (incl. the squircle ×2 law + its degrade reversal)
- [ ] 2.3 `query()`: compile-time desugar (media/container custom-prop
      re-assignment) + the JS shim shell (progressive module); named-container
      key grammar per research/0.3; container-supply build warning
- [ ] 2.4 motion map: intensity → surface-motion/press-effect/SMIL presets
- [ ] 2.5 plugin test battery (the vite-plugin suite pattern, 500+ precedent)

## W3 — component migration (batched, the 0.4 map)

- [ ] 3.1 batch A — the 16 native families: collision rule (destructured prop
      wins, rest forwards), axis surface, supply set
- [ ] 3.2 batch B — primitives (press-button, icon-button, chip, badge,
      card…): full eight axes + concentric radius receipts
- [ ] 3.3 batch C — overlays/surfaces (dialog, sheet, popover, tooltip,
      system-dialog…): elevation × surface ladder pairing receipts
- [ ] 3.4 batch D — composite/long-tail (the rest of the 115), batched ~15/round
- [ ] 3.5 the 4 rename families (§13: sheet/prose size→width/measure …)
- [ ] 3.6 avatar/icon/spin mapping verified (aliases + number lanes)

## W4 — canvas + docs

- [ ] 4.1 meta pipeline: shared universal-props IR block injected into every
      family meta (generated zone; --check drift gate extended)
- [ ] 4.2 schema2form/playground: per-axis control hints (enum select, number
      spinner, query editor); componentCanvas controls adapted
- [ ] 4.3 PropsTable: the universal section rendered from the ONE shared
      source (no per-page duplication)
- [ ] 4.4 110 doc pages: universal props section + per-page example updates
      (batched with W3 batches where possible)
- [ ] 4.5 registry.json `docs` strings + the universal-props concept page
      (one doc explaining the grammar once) + llms mirror regenerated

## W5 — gates

- [ ] 5.1 `verify:explicit-props` (design §16.1: axis surface + carrier law +
      broadcast duty + native forwarding ban)
- [ ] 5.2 existing gates adapted; tailwindless ratchet receipt: UNMOVED
- [ ] 5.3 full verify-all green in the MAIN dir (Owner ruling: no worktree)

## W6 — acceptance (multi-round, release-ready NOT released)

- [ ] 6.1 vision walkthrough rounds (light+dark, pinned phases, the splash-fan
      capture discipline) — dogfood pages: tokens, canvas, dialog/sheet,
      press-button, a native family, density demo
- [ ] 6.2 Codex review loop over the working tree (score + blockers; iterate)
- [ ] 6.3 Owner walkthrough dossier (dev server, the eight axes live)
- [ ] 6.4 RELEASE-READY state: all green, nothing pushed past the branch;
      publish waits for the Owner's word
