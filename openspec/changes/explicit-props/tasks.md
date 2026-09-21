# Tasks — the explicit props (W0..W6)

## W0 — change alignment (remix round 0)

- [ ] 0.1 change docs written (proposal/design/tasks/spec deltas) — THIS commit
- [x] 0.2 Codex reviews the change docs (herdr, gpt-5.6-terra/xhigh) → blocking
      findings folded back; ≥8/10 with no blockers before W1 starts —
      TEN rounds, 4.5→6.3→7.0→7.3→5.8→7.6→7.7→7.3→7.7→**8.4 GO**
      (codex-explicit-final; the non-blocking notes folded: the @md/
      empty-name rejection rule made explicit; the M3 token tables and
      shape-alias values named as W1 deliverables)
- [x] 0.3 research/tailwind-container-syntax.md — the named-container key
      grammar resolved against Tailwind v4's source (design §9):
      `@sm/card` (size-first, own --container-* scale)
- [x] 0.4 research/migration-census.md — the 115-family batch list + the 16
      native families + the 4 rename families (§13) pinned as the W3 map
- [x] 0.5 Codex r1 blockers folded (NO-GO 4.5/10 → the type table §0, the
      eight-axis supply set §11, the query interface freeze §9.1, the meta
      pipeline freeze §17, alias-as-var-indirection §12, zero-class degrade
      §14, the slot-honesty + context/cascade laws §1, the var() fallback
      law §3) — re-review before W1
- [x] 0.6 Codex r2 blockers folded (6.3/10: units unified to §0.1 across
      docs+specs, the density coefficient carrier frozen with precedence +
      legacy mapping, query keys branded + overload + diagnostics, §17's
      concrete interfaces + inventory/ledger/fixtures, the registry
      artifact chain, the ratchet receipt bound to exact constants, the
      degrade consumption chain, census receipts reproducible)
- [x] 0.7 the canonical `universal-props.inventory.json` (115 families,
      unique+sorted, exemptions EMPTY, the four site-only families marked)
      + the fixtures doc (card's REAL extracted meta + the exempt shape)
      committed at research/ — per §18: the `--check` LOADING is task 4.6

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
- [ ] 1.7 `context-coverage.config.json` synced to the eight-axis supply set
      (design §11 — the coverage gate knows every context key)
- [ ] 1.8 the density coefficient carrier lands: every kernel channel
      splits base/effective per the frozen §4 pattern (the four guardrail
      channels ride their max() forms); precedence + legacy-alias mapping
      (small→sm · medium→default · large→lg) + computed-style probe
      receipts incl. the --jx-hit guardrail case
- [ ] 1.9 the shared artifact lands EARLY (moved from W4 — the W3 batch
      gate and PropsTable both consume it, it cannot arrive after):
      `universal-props.schema.ts` (the §17 interfaces + UNIVERSAL_AXES) +
      the generator's merge step + the inventory promoted beside the schema

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
- [ ] 2.6 the registered exceptions absorbed: press-effect-runtime's inline
      CSS.supports + avatar's component degrade route through the ladder
      vars (or exemption-ledgered with reasons) — design §14
- [ ] 2.7 alias-as-var-indirection receipt: a consumer override of
      `--jx-<axis>-<alias>` remaps a named step with zero resolver code

## W3 — component migration (batched, the 0.4 map; EVERY batch closes on
its own gate — slot-surface lint green for its families + doc pages
rendering the shared section from the 1.9 artifact + svelte-check clean —
before the next batch opens; a batch is the rollback unit)

- [ ] 3.1 batch A — the 16 native families: collision rule (destructured prop
      wins, rest forwards), axis surface, supply set
- [ ] 3.2 batch B — primitives (press-button, icon-button, chip, badge,
      card…): full eight axes + concentric radius receipts
- [ ] 3.3 batch C — overlays/surfaces (dialog, sheet, popover, tooltip,
      system-dialog…): elevation × surface ladder pairing receipts
- [ ] 3.4 batch D — composite/long-tail (the rest of the 115), batched ~15/round
- [ ] 3.5 the 4 rename families (§13: sheet/prose size→width/measure …)
- [ ] 3.6 avatar/icon/spin mapping verified (aliases + number lanes)

## W4 — canvas + docs (the §17 contract; the shared artifact itself landed
## EARLY as 1.9 — W4 wires the consumers)

- [ ] 4.1 ir.ts gains the prescribed additions (ControlHint's three new
      members + ComponentMeta.universal) + schema2form/playground render
      the per-axis controls (axis-enum / axis-number / query-editor)
- [ ] 4.2 schema2form/playground: per-axis control hints (enum select, number
      spinner, query editor); componentCanvas controls adapted
- [ ] 4.3 PropsTable: the universal section rendered from the ONE shared
      source (no per-page duplication)
- [ ] 4.4 110 doc pages: universal props section + per-page example updates
      (batched with W3 batches where possible)
- [ ] 4.5 registry.json `docs` strings + the universal-props concept page
      (route frozen: docs/universal-props.html) + llms mirror regenerated
- [ ] 4.6 the `--check` gate LOADS and asserts both research fixtures
      (card's real extract + the exempt shape) per design §17.4

## W5 — gates

- [ ] 5.1 `verify:explicit-props` (design §16.1: axis surface + carrier law +
      broadcast duty + native forwarding ban)
- [ ] 5.2 existing gates adapted; tailwindless ratchet receipt asserts the
      exact constants (files=2 · identities=7 · occurrences=7 ·
      zones{routes:1, site-libs:0, ui:6} · forms=42)
- [ ] 5.3 full verify-all green in the MAIN dir (Owner ruling: no worktree)
- [ ] 5.4 shadcn-add clean-consumer receipt: named steps resolve + an alias
      override remaps, pure CSS, no resolver runtime (design §12)

## W6 — acceptance (multi-round, release-ready NOT released)

- [ ] 6.1 vision walkthrough rounds (light+dark, pinned phases, the splash-fan
      capture discipline) — dogfood pages: tokens, canvas, dialog/sheet,
      press-button, a native family, density demo
- [ ] 6.2 Codex review loop over the working tree (score + blockers; iterate)
- [ ] 6.3 Owner walkthrough dossier (dev server, the eight axes live)
- [ ] 6.4 RELEASE-READY state: all green, nothing pushed past the branch;
      publish waits for the Owner's word
