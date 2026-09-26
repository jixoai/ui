# TASK 25 — REVIEW descriptions (marginalia, 2026-09-22; 2nd of 2)

- **Reviewer**: marginalia (2nd reviewer; 1st = vellum, PASS with 1 MINOR — `agents/vellum/reports/21-review-descriptions.md`)
- **Target**: scribe's page integrated at `38509fcb` ("docs(descriptions): tier-2 archetype rewrite (scribe task 17)")
- **Scope**: `apps/www/src/routes/docs/components/descriptions.html/+page.svelte` (701 lines) + `+page.ts` + `descriptions.docs.ts` + the 3 PILOTS blocks
- **Method**: source reads (page, item, stylex, css, docs curation, meta), raw-SSR byte parse (1,298,217 bytes), live computed probes (playwright-core + system Chrome, /tmp scripts, real viewport resizes with settle), runtime-stylesheet census, solo PILOTS run
- **VERDICT: NEEDS-WORK** — one MAJOR of mine (the responsive-columns drag rig cannot perform the fold it demonstrates) plus vellum's MINOR co-signed with my own 800px discrimination. Both fixes are one-liners; **closure-ready the moment they land** (see the fast-track at the end) — descriptions becomes #21-closed conditional on exactly these two fixes riding scribe's flow.

## Findings (severity-tagged)

### 1. [MAJOR · page demo mechanism] The drag rig cannot fold — the @container queries the canvas column, never the frame

The demo's headline claim (+page.svelte:406): "Drag the frame across the 640px line: the SAME three-column dl re-lays out into one pair per row — the container query reads the dl's own container". As shipped, dragging does nothing to the paint:

- `.desc-frame-rig` (:419, page style :681-683 `max-width: 100%`) carries **no container-type**. The law `@container (max-width: 640px) { :where(.jx-desc) { grid-template-columns: 1fr } }` (descriptions.css:22-26, unlayered carve-out) evaluates against the nearest **ancestor** container — the ComponentCanvas scroll column (`jx-canvas-scroll`, container-type inline-size, **718px fixed at desktop**), not the frame.
- **Measured contradiction**: driving the real PlayRange to 496 updates Svelte state — the rig's style attr becomes `width: min(496px, 100%)` and the demo's own output chip renders **"1 pair / row"** — while the dl keeps painting **3 tracks (219px × 3)**. Chip says folded; paint says three. The rig box itself never shrinks (659px at both 496 and 760 settings): as a flex item its `min-width: auto` floor is the dl's unfired 3-track min-content.
- **The law is real** (and vellum's Claim 4 verified it via an injected clone in a 500px inline-size container — true, and untouched by this finding; the rig itself was not exercised): at a **560px viewport** the canvas column drops to **526px**, crosses the 640 line, and the same dl folds to **one 465px track**. The fold tracks the layout column, never the frame.
- **Fix (one line)**: `container-type: inline-size` on `.desc-frame-rig` in the page style block (or tw4's `@container` class on the div). Inline-size containment both makes the @container fire at frame < 640 **and** releases the min-content floor, so the drag actually shrinks the box. The usage snippet (:169-172, "the consumer only owns the container's width") already teaches exactly this — the rig just never declares it.

### 2. [MINOR · co-signs vellum finding 1] The query() boundary strings say 40rem; the lg key is 64rem

Independently discriminated: at **800px** (≥40rem, <64rem) the query demo computes the small base — **12px value / 8px padding**; the lg case engages at **1100px** (15/16); sweep 1280 → 15/16 ↔ 600 → 12/8 ↔ 1280 → 15/16 (both directions, hydrated probes per LAW #16). Five occurrences in two strings: the CodeBlock comment :200 ("below the 40rem viewport; at ≥40rem…" ×2) and the caption :634/:635/:637 (×3). Fix: 40rem → 64rem in both (or re-key to `md`); rides scribe's flow per the joint-closure precedent.

### 3. [RESOLVED — no finding] The theme row is TRUE; my mid-review "dd edge flip" was a wrong-element probe

Recording the trace so nobody re-chases it: the bordered **bottom edge lives on the cell div**, not the dd — `data-jx-desc-cell` gets `cellBordered` (descriptions-item.svelte:53), served as `.x1g6nami { border-bottom-color: var(--jx-border) }` + `.x15nk5b1 { border-bottom-width: var(--jx-hairline) }`. Measured **oklch(0 0 0) @ 1px under BOTH the light and the dark island** (frozen). The **dd** declares no border (width 0px everywhere); its border-bottom-COLOR computes white under .dark via the universal `* { border-color: var(--border) }` canvas reset — a 0px-width raw read outside the family's voices, invisible. Census (my corrected walk — note: every CSSStyleRule exposes `.cssRules` under CSS Nesting, so a recurse-then-continue walk silently skips scanning the rules themselves): the five chrome aliases the family reads — `--jx-border`/`--jx-card`/`--jx-muted`/`--jx-muted-foreground`/`--jx-foreground` (descriptions.stylex.ts:41/:42/:72/:68/:83, plus border again at :55/:75) — each declared **exactly twice**: `:root, .xbpgcew` (pole) + `.x13ei35y.x13ei35y, .x13ei35y.x13ei35y:root` (the doubled theme class); **no plain `.dark` record redeclares any of them**. Co-resident dark specimen: frame oklch(0 0 0), card ground oklch(1 0 0), term bg oklch(0.9551 0 0), dt ink oklch(0.3211 0 0), dd ink oklch(0 0 0) — all byte-frozen. Mechanism pinned: custom-property `var()` substitution computes at the **declaring** element, so :root-resolved literals inherit frozen; raw reads at the element flip. The row's "five stylex aliases" is exact.

## Vellum's claims re-derived — all TRUE

1. **Ruler ladder digit-exact**: terms **10/11/12/14px**, values **11/12/13/15px**, dd padding **8/8/12/16px** across xs/sm/default/lg (walk-up to the `data-density` ancestor on clones + the real lg panels live at 15px/16px). Number lane **inert in its real state**: a coefficient without a rung attribute leaves 12/13/12 unmoved. (Probe-craft note: my first clone test kept `data-density="default"` on the stamped clone and read 36/39/36 — the artificial named-rung × coefficient combination DOES scale; that is an invalid state, not the claim's subject. Never mutate the control variable.)
2. **Frozen-pole twin**: census above; co-resident probe above. (My census overlapped vellum's on border/muted/muted-foreground and adds foreground; vellum's adds card/background — between the two reviews every alias is counted twice-over.)
3. **Columns**: clamp source-pinned; `--jx-desc-cols: 3` → 3 × 219px tracks; container law real (560px viewport receipt).
4. **Query flip**: 15/16 ↔ 12/8 both directions + the 800px discrimination (finding 2).
5. **EXTRA 14−8−2=4**: meta parse — 14 entries, 8 axis-named, class+rest hidden → family rows columns/bordered/style/children; SSR tables: **5 tables, 110 td, 0 empty cells**.
6. **Restores**: `#install` present (DocsInstall name="descriptions" → SSR renders `npx jixoai-ui add descriptions` + the item URL) and `#see-also` present — BOARD's "#see-both" shorthand = the two-honest-failures restore (vellum's review names #see-also; no literal "see-both" string exists anywhere — no defect).
7. **Tier 2**: old page (`38509fcb~1`) 477 lines with hand `#theming`/DensityDemo sections → new archetype order hero → install → overview → usage → demo → types → vertical → responsive → extra → api → axes → accessibility → see-also; **toc 10/10** (every toc id ∈ SSR ids; toc ⊆ DOM order), **h1 = 1**.

## Gates

| Gate | Result |
|---|---|
| PILOTS solo (`vitest run test/canvas-same-source.spec.ts -t "descriptions"` — blocks at :713/:725/:741) | **exit 0** (green; the post-run "close timed out" is the known vite-server hang after success) |
| Raw SSR | 1,298,217 bytes; toc 10/10; h1 1; 0 empty td of 110; #install/#see-also present |
| Live probes | ladder 10/11/12/14 · 11/12/13/15 · 8/8/12/16; number inert; census 5 × 2 sites; dark specimen frozen; query 15/16 ↔ 12/8 + 800px→12/8 + 1100→15/16; rig@496: chip "1 pair / row" vs 3 tracks; viewport 560: 1 track (container 526) |
| grep test/ pins | no test/ pins claimed on the page; census pins (migration-census.md :507, :572-574) check out as the batch-A reference |
| grep 40rem | :200 (×2), :634, :635, :637 — the finding-2 fix sites |

## Fast-track closure (the fix-cost call)

Both defects are one-liners on scribe's desk:
1. `.desc-frame-rig` → add `container-type: inline-size` (page style block, :681-683 area).
2. 40rem → 64rem at :200 (×2) and :634/:635/:637 (×3).

Re-verify receipts, pinned so no full re-review is needed: after fix 1, drag the real PlayRange to 496 → the dl computes **1 track** and the chip's "1 pair / row" matches the paint; the box shrinks below 659. After fix 2, `grep -c "40rem" +page.svelte` = 0 and the 800px measurement still reads 12/8 (unchanged — the strings were the only defect). With both landed and green, descriptions closes as **#21**.

## Process evidence

- Port **5244**: `lsof -ti :5244` during work = 77332 (my wrapper); killed by PID at session end → receipt below in the closing log; no other 5244 process at any point.
- **No commits, no pushes, zero tree edits** (review-only; the only writes are this report + experience.md).
- Artifacts: probes `/tmp/marginalia-25-probe{6,7,8,9,10,11,12,13}.mjs`; SSR `/tmp/marginalia-25-ssr.html`; PILOTS log `/tmp/marginalia-25-pilots.log`.
- Probe-craft lessons banked to experience.md: the CSS-Nesting walk trap (recurse-AND-scan, not recurse-or-skip), the wrong-element border read (dd vs cell), the control-variable rule for clone stamps.
