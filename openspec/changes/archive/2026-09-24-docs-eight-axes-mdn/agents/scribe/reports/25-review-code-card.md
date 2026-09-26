# 25 — REVIEW code-card (2nd of 2; scribe)

Date: 2026-09-22 · scribe · port 5243 · NO commits
Target: vellum's gaps-only tier-2 pass at `35d2cddc` — `apps/www/src/routes/docs/components/code-card.html/+page.svelte` (1182 lines) + `+page.ts`; family `src/lib/ui/code-card/*` + registry mirror read for mechanism receipts. Reviewer #1 = marginalia (PASS, 1 LOW) — independence law held: my findings were formed and the fix applied before I opened marginalia's report.

## Consolidation edit (the LOW, landed)

The Install (`:694`) and See-Also (`:1179`) wrappers carried no id anchors. Applied `<div id="install" data-reveal="">` and `<div id="see-also" data-reveal="">` — the descriptions fleet pattern (`descriptions.html/+page.svelte:248/:679`). Final working-tree diff = exactly 2 insertions / 2 deletions, both attributes. SSR-verified: `id="install"` ×1, `id="see-also"` ×1, both regions unique; h1 still 1; nothing else moved.

## The claims, re-derived (all verified TRUE)

### 1. The fourth theme pattern — VERIFIED, three scopes probed live

- **Source**: `stampCarriersForLanes({ ...d, theme: undefined })` (`code-card.svelte:209`) — the theme AXIS is never stamped or broadcast; the shiki `theme` literal owns the name (resolved `d.theme` feeds `backend.highlight(..., { theme: d.theme })` at :267).
- **Own adaptation**: three zero-specificity `:where()` blocks in `code-card.css` — base `:24` (the 42% light formulas), dark `:46`, jx-light re-flip `:71` **declared after dark** → source order arbitrates (the css comment :62-70 names this: "the declared light scope wins by order").
- **Live (wrap-move-restore probe on the scroll-law card)**:
  - as-is on the page (the canvas stage IS `.jx-light`-stamped — verified in the ancestor chain): `--readonly-code-bg` = `color-mix(in oklab, oklch(0.9551 0 0) 42%, oklch(1 0 0))` — the **42% light formula**;
  - moved into a clean `div.dark`: **78%** dark ground, metaBg **18%** — full dark engagement;
  - moved into `div.dark.jx-light`: **42% / 12%** light formulas win inside dark ANCESTRY — the order-arbitration proven, not inferred.
- **The −4° arithmetic**: `--tok-token-keyword` (→ `var(--primary)`) inside dark reads `oklch(0.7044 0.1872 calc(337 - 4))` — the drift arithmetic VERBATIM inside the computed value. (marginalia's same probe read `calc(327 - 4)` — different wall-clock instants, identical constant: the hue base is the brand-hue clock, the −4 is the sheet's invariant.)

### 2. TWO-MEDIUM receipt — VERIFIED

The 42% jx-light formula paints on the canvas (jx-light stage) while full dark engages in a clean scope — both captured in one probe sequence above, plus the dark+jx-light hybrid that names the arbitration rule. Every mutation restored.

### 3. Density the quietest lane — VERIFIED

Universal canvas card stamped `data-density="sm"` (density="small") while the paint is px-anchored: pre **12.5px** = baseline, padding **14px** = the 0.875rem css law; the stamp broadcasts to no tenant (figure/pre/code/button only). **No-query-seat reasoning judged SOUND**: no lane on this surface has a consumer a query() could re-target (size = echo, shape/radius/color/elevation supply-only, theme dropped, density inert) — the deviations paragraph (:1166-1168) states it and the per-axis table demonstrates it.

### 4. Size §11 echo — VERIFIED

`size={18}` card: root style carries `--jx-size-effective: 18px`, figure font-size **18px** (`var(--jx-size-effective, 1rem)`), pre stays **12.5px** — a stamp with no em to scale.

### 5. shiki live vs raw SSR — VERIFIED (medium named)

Raw SSR bytes (1,216,843 B): **0** token spans (the single `style="color:` hit is escaped sample text — sugar-high's `var(--sh-<type>)` inside a demo string). Live workbench card (Chrome @1440, post-hydration): **68 spans** — client-highlighted, medium named per LAW #16. Types baseline card highlights live too (6 spans for the tiny sample).

### 6. Copied state — VERIFIED, mechanism located

Click → `.copied` class + ink `oklch(0 0 0)` → **`oklch(0.62 0.19 145)`** with the 12% tonal ground (`oklab(0.62 −0.156 0.109 / 0.12)`), reverting after the window. Mechanism: source `:509` — the scope rides the BUTTON itself (`'jx-hue-success copied'`), so the tonal var resolves under the success scope on the button, not an ancestor (a card-level `closest('.jx-hue-success')` probe correctly reads false).

### 7. rem discipline — VERIFIED

Page rem literals: `maxHeight="14rem"` (:822, the ONE live rem prop — computed 224px, vScroll true, overflow both auto) + `minHeight="12rem"` (:577, inside the usage SAMPLE string) + the `1rem` fallback in a prose string. Zero viewport-boundary claims. Family inventory (my addition to marginalia's sweep): css `0.875rem` pre paddings + `1.75rem` veil + stylex `2.1rem` band (stylex.ts:106, "lawful literal" per its own comment) — all documented structural spots; token steps elsewhere.

### 8. Standard loadout

- **Gaps-only audit**: `35d2cddc` added install + overview + the per-axis/deviations apparatus; canon sections untouched (the in-source comment :691-693 declares the tier; the diff confirms it).
- **toc 10/10**: page-data toc = 10 entries; SSR renders exactly those 10 hrefs; each id unique in DOM; toc order == DOM order. (12 content sections total; see findings.)
- **h1 = 1** (SSR).
- **Anchors**: all 12 region ids unique; install/see-also NOW anchor-complete (the landed fix).
- **Family specs**: marginalia's composition reproduced — `code-card.spec + code-card-backend-highlightjs + print-stylesheet-gate` = **44/44, exit 0**. My broader sweep: core trio (`code-card + backend + lang-detector`) **43/43**, backend variants (`highlightjs + sugar-high + tree-sitter`) **39/39** — 82/82 across the family's six www spec files, all green.
- **Diagnostics**: svelte-check — `+page.svelte` **0 diagnostics**; `detector-playground.svelte` exactly the **2 pre-existing errors** (:42:28 Object.entries overload, :231:54 px6) — file unmodified at HEAD (git status), as vellum flagged.
- **Registry mirror**: `code-card.svelte` / `code-card.css` / `code-card.stylex.ts` all byte-identical to `registry/files/ui/code-card/` (cmp ×3).

## Findings (severity-tagged)

1. **[LOW · FIXED in this consolidation]** install/see-also anchor ids — marginalia's LOW, applied and SSR-verified (diff = 2 attributes).
2. **[LOW · family API, NEW — W-next #3 token-table side]** `TokenTable` declares `description?: string` (token-table.svelte:41) but **never renders it** — sole reference in the component. The theming table's four description strings (vellum's 'Shiki css-variables palette…', 'Body ground tint.', 'Head/foot chrome tints.' — and any other page's) are invisible in SSR. Discovered when my consolidation attempt to append a description to the `--jx-text` row (marginalia's INFO #3 offer) failed to render; I **reverted the append** rather than ship dead data. This gives W-next #3's description-field arm a second, renderer-side mechanism: the arm was curation-side (rows missing descriptions); the renderer ALSO drops the ones that exist.
3. **[NOTE · toc completeness]** `code-card-auto` and `universal-props` — two in-DOM content sections — have no toc rows. The 10/10 gate passes (all entries resolve in order), and the omissions are consistent with the page's gaps-only doctrine; but the sibling fleet (descriptions/carousel/card-grid) lists its axes row in the toc. One-line page-data additions if the orchestrator wants fleet alignment; no action required for closure.
4. **[INFO · co-signed]** marginalia's two-medium receipt-precision note: both media now have pinned receipts from BOTH reviewers (42% on any jx-light stage, 78% in clean dark, order-arbitrated hybrid in between). Future probes name the medium before attributing formulas.
5. **[NOTE · methodology]** The −4° drift is invariant while its hue base rides the brand-hue clock (327 vs 337 across reviewers) — cite the arithmetic, never the absolute hue (the standing law, re-earned).

## Verdict

**PASS — code-card closes as page #24**, with the LOW landed and verified. No MAJOR, no MINOR. Every dispatch claim re-derived TRUE from source + raw SSR bytes + live computed probes.

## Environment discipline

- Port 5243: `lsof` EMPTY before, killed by PID after each cycle → EMPTY after (final `port after: []`).
- NO commits, NO pushes. Working-tree writes: the 2-attribute consolidation on `+page.svelte`, this report, experience.md.
- Sibling churn in `git status` (card-grid, badge-indicator, file-input, canvas spec…) is other agents' in-flight work — untouched.
- Artifacts: `/tmp/scribe-25-probe{1,2}.mjs`, `/tmp/scribe-25-ssr{,2,3}.html`, `/tmp/scribe-25-check.txt`, `/tmp/scribe-25-dev{,2}.log`.
