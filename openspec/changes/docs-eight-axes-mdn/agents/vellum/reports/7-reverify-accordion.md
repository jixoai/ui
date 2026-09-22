# Report 7 — accordion RE-VERIFY (marginalia's consolidated fix, 61e3561d)

Reviewer: vellum · 2026-09-22 · page
`apps/www/src/routes/docs/components/accordion.html/+page.svelte` (+page.ts) ·
fix under verification: 61e3561d ("both reviews' 11 findings in one round") ·
method: every finding re-derived against the CURRENT tree, probes re-run live
(not replayed), regression sweep over what measured TRUE in round 1.

## Verdict: PASS (with 2 small follow-ups, neither blocking)

10 of the 11 consolidated findings verified FIXED with live or grep receipts;
the 11th (the cx idiom error) is the documented pre-existing debt, correctly
left at exactly 1. No regression found anywhere the round-1 numbers measured
TRUE. Two new small findings, both wording-precision inside the fixed text —
MINOR + NIT, fixable in one pass whenever the page is next touched.

## Per-finding verdict table

| # | finding (source) | fix claimed | verdict | receipt |
|---|---|---|---|---|
| 1 | Theme row claims full re-theme; white-on-white demo (vellum B1) | THEME-SPLIT rewrite + documented absence | **FIXED, measured** | Row (`:168-173`) names both halves per voice; ONE-evaluate probe: summary ink flips `oklch(0 0 0)`→`oklch(1 0 0)` (raw `--foreground`), card ground/body ink/frame border FROZEN (`--jx-card`/`--jx-muted-foreground`/`--jx-border` identical across frames), seam flips (raw `--border`), resolved-var checks corroborate — 9/9. Demo caption documents the unreadable line as the measured gap; deviations paragraph carries "density only full repainter; theme partial". Source voices match the row exactly (accordion-item.css:24,28; accordion.css:14; accordion.stylex.ts:41,42,76). |
| 2 | toc stale: dead #theming, axes row missing (vellum M1 + scribe 1) | rebuilt to DOM | **FIXED** | +page.ts: 6 rows, DOM order (accordion-base → usage → types "Postures" → api "Props" → universal-props "The eight axes" → accessibility); raw SSR: all 6 ids ×1, `id="theming"` absent, Usage H2 ×1. |
| 3 | Hand-mirrored snippets drifting (vellum M2 ×4 spots + scribe 7) | five mirrors deleted via resolveRawCode | **FIXED structurally** | Five usage drawers now `usageFile(…, resolveRawCode(id))` (`:117,193,208,218,238`); accordion in PILOTS (spec:53) with FIVE inline snapshots — solo run: postures/density/theme/concentric/query ALL ✓. Unified copy verified ("The lg rung — 15px summary text." both surfaces). FAQ drawer stays a hand file with the documented extractor-rejection justification, regenerated from the stage's own copy (3 items + Badge + bind:open — matches stage `:362-378`); the `usage` const is now explicitly the minimal install example, "the two surfaces no longer trade places". |
| 4 | Elevation invents consumption (scribe 2) | supply-only + negative receipt | **FIXED, re-derived** | Clean grep: `var(--jx-elevation-effective` has ZERO reads tree-wide (the sheet's `:root` fallback declares, doesn't read). Row `:174-180` says exactly that + the Card's fixed `--jx-shadow-2xs`. |
| 5 | Size broadcast measured-false + prose garble (scribe 3 + vellum n2) | supply-only rewrite | **FIXED, one wording NIT** | Row `:133-138` matches the mutation-probe truth (inline stamp reaches only unstyled flow; summary/body re-anchor `var(--jx-text)`; Card/PressButton token-anchored). NIT-B below on the receipt's "only other hit" clause. |
| 6 | Motion broadcast has no consumer (scribe 4) | supply-only + negative receipt | **FIXED, re-derived** | Grep: zero readers in lib/ui; the tree's only reader is the component-canvas docs page — exactly the row's claim (`:181-187`). Recipe half matches accordion-item.css:51,68,77 + the reduced-motion kill. |
| 7 | query() single-generic type error + prose teaching it (scribe 5) | two-generic form + corrected note | **FIXED, type-checks** | `:554` `query<{ sm: DensityLane }, DensityLane>({ sm: 'default' }, 'small')`; comment `:230-237` states the §6 law; DensityLane imported `:26`. Scoped svelte-check: the 256:73 error is GONE — page down to exactly 1 error (the cx idiom, `:262:28`). 2→1 confirmed. |
| 8 | Density number-lane non-effect silent gap (scribe 6) | clause added | **FIXED** | Row `:158`: "inert on this family: the scope blocks substitute at their declaring element, so the coefficient alone repaints nothing; only a named rung's attr re-anchors `--jx-text`" — the declaring-element mechanics preserved verbatim in spirit. |
| 9 | Density type union truncated (vellum m1 + scribe 9) | full union | **FIXED** | `:155` carries the full schema union incl. `xs | 2xs | sm | default | lg` (matches universal-props.schema.ts:71). |
| 10 | Gloss/vocabulary: no 吃也供 gloss; "broadcast-only" coinage (vellum m2 + scribe 8) | gloss + supply-only | **FIXED** | Deviations paragraph `:458-459`: "the broadcast protocol (吃也供, supply-and-consume; the universal-props concept page owns the term)" — the §6 gloss form, raw SSR grep confirms. "supply-only" ×5 (case-insensitive). See MINOR-A for the one group that over-extends the term. |
| 11 | cx idiom svelte-check error (scribe 11, delta ledger) | leave as fleet debt | **CONFIRMED UNCHANGED** | Exactly ONE accordion error remains (262:28 `Object.entries` narrowing) — the fleet-wide idiom debt, not this page's to fix. |

## No-regression sweep (round-1 TRUE numbers, re-measured live today)

- **Density ladder**: ambient 13px · lg 15px · sm 12px · xs (DensityDemo
  wrapper) 11px — all exact; `padding-top` 11px and `padding-left` 14px
  UNMOVED across all four rungs (the ruler-equation claim + the a11y
  density-invariance note both measured-true).
- **Radius census receipt**: frame stamps `--jx-radius-effective: 20px`;
  the nested auto Card (SECTION root) computes exactly **6px**.
- **query() flip**: 3/3 with the engine's live re-resolution — dd
  `default`+13px @1280 → `sm`+12px @500 → `default`+13px back.
- **Markers**: `data-jx-props-table-universal` ×1; install + see-also
  present; zero id collisions.
- Probe-note: cold dev loads read UA fallback (16px everywhere) and show
  pre-hydration attrs — readiness waits (font ≠ 16px; engine-resolved attr)
  are required before measuring; the first query probe's "stuck sm" was this
  race, not the page.

## New findings (introduced or surfaced by the fix)

**MINOR-A — the deviations paragraph over-extends "supply-only" to five lanes; the page's own rows and summary define it as three.**
`+page.svelte:457`: "the five supply-only lanes (size · shape · color ·
elevation · motion)" — but the section summary (`:451`) says "shape and
color supply real nested consumers; size, elevation, and motion are
supply-only with no reader in the tree", and the shape/color rows say the
same. §1: the same thing always called by the same name — on this page
"supply-only" means no-reader-in-tree, so calling shape/color supply-only
contradicts the table it cites. The justification clause ("the family
consumes none of their carriers") is true for all five; the label isn't.
Fix: "the five lanes the family itself doesn't consume (size · shape ·
color · elevation · motion) … size · elevation · motion are the supply-only
three — shape and color land in real nested consumers."

**NIT-B — the size row's grep-receipt clause "the kernel's own stamp emitter is the only other hit" now has a second textual hit.**
`+page.svelte:137` vs `badge.html/+page.svelte:73` (committed at HEAD), which
quotes `var(--jx-size-effective, 1rem)` in its own size-row prose. A docs
quote is not a consumer — the substantive claim (no component reads the
carrier) still holds; the receipt's uniqueness clause is stale. Fix:
"zero component readers (the kernel's stamp emitter and a docs-page prose
quote are the only textual hits)".

## Gates (all re-run this review, log + $? discipline)

| gate | result | tail |
|---|---|---|
| `npm run verify:tailwindless` | exit 0 | `GREEN — 2 class-bearing files against the pin (pinned 2 files · 7 identities · 7 occurrences) … receipt: files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42 — bound verbatim` |
| `verify:docs-universal` | exit 0 | `GREEN: 110/110 component pages render the shared universal section (110 markers)` |
| `canvas-same-source` solo (apps/www, vitest run) | accordion GREEN | `✓ accordion.html :: postures / density / theme / concentric / query` — 57/58 passed; the ONE failure is `checkbox.html :: axes` (stale PLACEHOLDER snapshot) = **scribe's in-flight checkbox CODE task** (BOARD line 5; checkbox page modified in working tree) — not accordion, needs that round's `vitest -u`, flagged for the orchestrator |
| scoped svelte-check | 1 error | accordion page: exactly `262:28` cx `Object.entries` — the pre-existing fleet idiom debt; the query typing error is gone |

## Process

- Port :5242 empty BEFORE work (`lsof` exit 1). Dev server wrapper PID
  **80123** (`npx vite dev --port 5242 --strictPort`, log
  /tmp/vellum-7-acc-vite.log). Killed by PID after probing; `lsof -ti :5242`
  → empty (exit 1); wrapper confirmed dead; no orphan grandchild.
- Probes (all fresh runs): /tmp/vellum-7-acc-reverify2.mjs (theme split 9/9 +
  density amb/xs), -probe3.mjs (density lg/sm + radius census receipt),
  -query2.mjs (query flip 3/3 with readiness waits), -diag.mjs/-diag2.mjs
  (locator diagnosis). Raw SSR: /tmp/vellum-7-acc-ssr.html (1,165,896 bytes).
- Gate logs: /tmp/vellum-7-acc-{tw,univ,canvas,scheck}.log.
- Foreign in-flight work observed and untouched: badge page + badge.docs.ts +
  canvas-same-source.spec.ts modifications and the failing checkbox snapshot
  (scribe's task 8); checkbox/spec working-tree state noted where it touched
  the canvas gate. NO commits, NO push.
