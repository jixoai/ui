# TASK 20 — REVIEW input-group (2nd of 2, scribe) — consolidated closure

- **Reviewer**: scribe · 2026-09-22 · findings filed BEFORE the cross-read of vellum's 1st review (`agents/vellum/reports/20-review-input-group.md`)
- **Target**: quill's page integrated at `f55f0f5f` — `apps/www/src/routes/docs/components/input-group.html/` + `input-group.docs.ts`
- **VERDICT: PASS — input-group closes as page #19**, with one MEDIUM rider (the token table's empty Source cells — the W-next #3 mapper arm, third instance) and vellum's two NITs co-signed

## Dispatch claims re-derived (all verified TRUE independently)

1. **§1-forwarding ≠ consumption — VERIFIED.** Grep: zero `-effective` var-reads in ui/input-group/ (the sole `effective` hit is the input part's header comment). The prose separates the concepts by NAME: the size/color rows say "the W3-era 'consumes size'/'consumes color' claim was the §1 forwarding rule mistaken for consumption", and the deviations paragraph states the attribute-forwarding rule as its own sentence — the root cause is named, not papered over.
2. **Density consumed + provided, digit-exact — VERIFIED.** Shell min-height **40px → 48px** at the lg stamp; input type **13px → 15px**; addon padding **12px → 16px**; the stamp attribute read live on the root. Provider side pinned by `defaults-form-families.spec` (the r11 eager-capture contract) — **28/28 solo**.
3. **Theme mixed by emission form across one bezel — VERIFIED** (co-resident light/dark): addon seam (RAW `var(--border)`, input-group.css:63/66) **flips oklch(0 0 0) → oklch(1 0 0)**; base bezel (stylex `tokens['--jx-border']` alias) **frozen at oklch(0 0 0)**; well shadow follows the theme recipe (black inset → **white inset**, raw `--shadow-well`). Three emission forms, one bezel, all measured.
4. **The chromeless input part — VERIFIED.** The native input computes **0px padding inline AND block** (the lane's `paddingBlock: 0` is the give-way); `--jx-inset` pads the ADDON lane (12→16px measured); **`--jx-line` is never consumed** (the input's line computes 19.5px = ambient 1.5 inheritance, not the token).
5. **Motion — VERIFIED.** `transitionDuration` computes **0.15s** (var(--motion-150)); `emulateMedia({ reducedMotion: 'reduce' })` → **0s** (the input-group.css kill, measured live).

## Standard loadout

- **Tier 2 audit / archetype order**: overview → the joined-field demo → usage → examples → accessibility → axes → api → see-also; toc **8/8**, 0 dead, order == DOM; exactly **1 h1**.
- **EXTRA arithmetic**: 17 meta entries − 2 quoted-duplicate collapses = 15 unique − 8 axis-named = **7 family rows + the synthesized rest = 8 served** (label, disabled, data-density, role, aria-label, class, children, rest — name-verified from served bytes). **`data-density` is a main family row (the legacy attribute escape hatch), NOT an axis collision** — the density AXIS row lives in the Universal section. The per-part table (InputGroupAddon/InputGroupInput, 5 rows) renders beside it.
- **query() both viewports**: `query<{ md: DensityLane }, DensityLane>({ md: 'small' }, 'large')` — @1280 **sm** (12px/32px) · @600 **lg** (15px/48px) · @1280 **sm**. Both directions, digit-exact.
- **grep test/ pins**: 8 files confirmed (defaults-form-families, input-group, form-family-docs-pages, docs-structure, docs-ambient-vocabulary, language-switcher, entity, separator) — my runs: defaults-form-families + input-group + form-family-docs-pages + entity = **52/52**.
- **PROBE-READINESS**: shells located by the family-only `[data-jx-igroup]` hook (8 on the page).

## Findings (severity-tagged)

1. **[MEDIUM — NEW, beyond vellum's two NITs]** The token table renders **5 of 9 Source cells EMPTY**: the page passes `source: 'structural'` 5× (verified in source) and `sourceLabel` (token-table.svelte:105) maps only density/component/color. The five rows are exactly the LAW-LEVEL voices (--shadow-well/-hover, --ring/--muted, the seam --border, the bezel aliases, --jx-hairline) — the rows that most need a source name. This is the **third live instance** of the W-next #3 mapper disease (inline-code rode the fix; descriptions' old page carried one; here five). Fix: add the `structural` arm to `sourceLabel` (the union already accepts it) — one line that heals all three pages at once.
2. **[MINOR — vellum's (a), re-derived TRUE, co-signed]** The api summary ("Three parts, one context: …") carries no arithmetic sentence (15 − 8 = 7 + synthesized rest, data-density among them). The tables are correct; one sentence matches the card-grid/heading house form. Rides the closure.
3. **[NOTE — vellum's (b), pre-logged, verified]** Exactly 1 fleet-common `state_referenced_locally` warning (the usage capture); zero errors; the cx predicate IS applied at :232-234. Not re-flagged.
4. **[NONE]** No blockers; no divergence from vellum on any measured claim.

## Gate receipts

| Gate | Result |
|---|---|
| defaults-form-families + input-group + form-family-docs-pages + entity solos | 52/52 (exit 0) |
| Live probes | density 40→48/13→15/12→16; theme seam-flip/bezel-frozen/well-white; motion 0.15s→0s; query sm/lg/sm digit-exact |
| verify:tailwindless | GREEN — `receipt: files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound verbatim (explicit-props design §16.2); drift either direction is red` (exit 0) |
| verify:docs-universal | GREEN: 110/110 (exit 0) |
| verify:docs | skeleton lint staged scope green (exit 0) |
| svelte-check | page + curation 0 errors (1 fleet-common warning, pre-logged) |
| Raw SSR | 200; 1 h1; toc 8/8, 0 dead; family 8 + universal 8 + parts 5 rows; **5 empty Source cells (finding 1)** |

## Process evidence

- Port **5243**: lsof empty before; PID `74375` killed → lsof **empty**, no ps residue. **No commits, no pushes.**
- Independence law held: findings completed before the cross-read; the two reviews converged on every measured claim (vellum's numbers reproduced exactly).
- Artifacts: probes `/tmp/scribe-20-probe{1,2,3}.mjs` + logs; SSR `/tmp/scribe-20-ssr.html`; gate logs `/tmp/scribe-20-{solos,scheck,dev}.log`.
