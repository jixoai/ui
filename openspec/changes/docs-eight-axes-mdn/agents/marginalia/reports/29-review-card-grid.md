# TASK 29 — REVIEW card-grid (marginalia, 2026-09-22; 2nd of 2 — re-verify of vellum's fix at `115f365b`)

- **Reviewer**: marginalia (2nd reviewer; the 1st-review findings — the density claim measured-false on the original Card tenants — were filed in the campaign's NEEDS-WORK round; vellum's fix = TENANT SWAP, report `agents/vellum/reports/25-card-grid-fix-and-file-input.md` Part A, read only AFTER my own derivations per the independence law)
- **Target**: `apps/www/src/routes/docs/components/card-grid.html/+page.svelte` (565 lines) + `card-grid.docs.ts` + the drift pins
- **Method**: fix-state source reads, live computed probes on the served page (all scope mutations restored; hydration mediums named), SSR raw-byte parse, ambient+drift solos, docs-universal, fleet svelte-check grepped to the page
- **VERDICT: PASS — closure conditional on ONE one-line fix** (the theme-bridge canvas's drawer, MEDIUM-below). The three original findings are verified FIXED and re-measured; nothing else regressed. If the orchestrator prefers strict accounting, the same receipt serves a one-line NEEDS-WORK — but the defect is new-code attribution in an addition, not a regression, and it rides consolidation.

## The fix, re-derived

### 1. The density claim now lives on the SectionCard tenant — VERIFIED, all six numbers
Measured on the served page, on `[data-jx-section-header]` inside the theming DensityDemo's rung stages (medium: hydrated live page, 1280 viewport):

| rung | header padding block / inline | channels measured |
|---|---|---|
| xs | **8px / 12px** | --jx-inset ×2, --jx-stack ×1 |
| sm | **8px / 12px** | ×2 / ×1 |
| default | **12px / 16px** | ×3 / ×2 |
| lg | **12px / 20px** | ×4 / ×2 |

The compositions confirm the mechanism: block = stack+1u (4+4, 8+4), inline = inset+1u (8+4, 12+4, 16+4). The INERT half holds too: the grid's own gap measures **20px × 20px at every rung** (the space ladder hangs off the :root-anchored --jx-unit). The claim is now true because the demo makes it true — the tenant swap worked.

### 2. Foot curation + drift-lock pins synced — VERIFIED
`card-grid.docs.ts` foot entry and the `props-table-meta-drift.spec.ts` card-grid row are **byte-identical** ("declares the third shared row — zone-trio cards' FEET align at the bottom; false = head/body only"); the row set (min, foot, children, class) matches the api summary's 12−8=4 arithmetic.

### 3. Theme-bridge canvas — the THREE assertions measured TRUE; one drawer defect
The canvas exists (axes section, "card-grid · theme bridge", `theme="dark"` CardGrid over SectionCard tenants):
- **.dark-lands**: the resolved dark lands `class="dark"` on the grid root (classList-verified) ✓
- **grid-unmoved**: the grid's paint is transparent ground + the 20px structural gap under the bridge — byte-identical to light ✓
- **tenants-own-voices**: the SectionCard tenant holds its light paint under the bridge (padding 12/16 identical to the light twin; ink black) — its typed emission form decides; a raw-var tenant would flip through the same bridge ✓

**[MEDIUM · canvas-id swap law] The drawer shows another specimen's code.** The theme-bridge canvas mounts `files={universalFiles}` — the SAME usage file as the axes canvas (`axesUsage`: the density/size specimen, `density="small"` / `size={14}`). Its stage renders the `theme="dark"` specimen. "Code shown ≠ code running": a developer opening the drawer reads the density specimen while the stage paints the theme bridge. The canvas also carries no `id` prop (unextractable, invisible to the PILOTS lane). Fix (one line-class): give the theme canvas its own usage file (a `themeBridgeUsage` const mirroring its stage) — or an id + `resolveRawCode` per the badge-indicator/link pattern. The three prose assertions themselves are all true; this is an attribution defect in the new addition, not a regression.

### 4. Nothing else regressed — VERIFIED
- **Query()**: bidirectionally reactive with the flip on the exact key — fresh-load@700: **8px/12px** (small base, data-density="sm", mq48 false); fresh-load@1280: **12px/16px** (default, mq48 true); live resize 1280→900→800→**768 = 12/16 → 767 = 8/12** →600, and back up. The md=48rem key is cited correctly (BREAKPOINT DISCIPLINE ✓). Both generics on the string lane ✓.
- Supply-only greps: zero kernel-channel/-effective reads in the family files; the density/size/shape/radius/color/elevation/motion rows' receipts stand as served.
- SSR: toc 8/8 present, positions ordered; h1 = 1; 7 tables / 127 cells / **0 empty**; the theme-bridge specimen renders in raw bytes.
- Page-scoped svelte-check: **card-grid.html/+page.svelte ZERO diagnostics**.

## Gates

| Gate | Result |
|---|---|
| ambient-vocabulary + props-table-meta-drift solos | **318/318, exit 0** (the file-input and navigation-menu rows are green — quill's work landed; nothing left to attribute) |
| verify:docs-universal | exit 0 — GREEN 110/110 |
| svelte-check (fleet) | card-grid page **0 diagnostics** (fleet 1602 errors — the shared tree's pre-existing set) |
| Raw SSR | 1,067,927-byte page snapshot: toc/h1/markers/empty-cells receipts above |
| Live probes | ladder 8/12 · 8/12 · 12/16 · 12/20 (+channel compositions); gap 20px inert ×4 rungs; bridge .dark/grid/tenant tri-receipt; query 768/767 exact-key flip both directions |

## Cross-check vs vellum's fix report (read after my derivations)

Vellum's Part A matches my re-derivations on every number (the ladder, the 20px inert half, the foot sync, the bridge tri-receipt). What vellum's report does NOT record: the theme-bridge canvas's drawer reuses the axes usage file — my MEDIUM. Everything else in the fix is exactly as reported.

## Process evidence

- Port **5244**: lsof **EMPTY before** (rc=1); my wrapper → vite; killed by PID at session end → **EMPTY after** (rc=1); background task exit 143 = my SIGTERM.
- **NO commits, NO pushes**; my writes: this report + experience.md only. Review-only task — zero product-tree edits.
- Artifacts: probes `/tmp/marginalia-29-probe{1,2,3,4,5,6}.mjs` (probe1/2 self- corrected: `await fn` vs `await fn()`, duplicate `sleep` decl, hashed-class locator miss); SSR `/tmp/marginalia-29-ssr.html`; gate logs `/tmp/marginalia-29-{ambient,universal,scheck,dev}.log`.
- Independence: my ladder/bridge/pin derivations and the drawer finding were filed before reading vellum's report; the cross-check found no discrepancies beyond the unrecorded drawer reuse.
