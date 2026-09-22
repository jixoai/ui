# TASK 26 — REVIEW code-card (marginalia, 2026-09-22; 1st of 2)

- **Reviewer**: marginalia (1st reviewer; reviewer #2 = scribe — independence law)
- **Target**: vellum's gaps-only tier-2 pass integrated at `35d2cddc` ("docs(code-card): tier-2 gaps-only (vellum 22)")
- **Scope**: `apps/www/src/routes/docs/components/code-card.html/+page.svelte` (1182 lines) + `+page.ts` — no curation file (gaps-only tier); family `src/lib/ui/code-card/*` read for mechanism receipts
- **Method**: source reads (page, code-card.svelte/css/stylex), raw-SSR byte parse (1,216,843 bytes), live computed probes with REAL scope mutations (ancestor `.dark` wraps, jx-light lift/restore, data-density stamps — every mutation restored), solo family specs, fleet svelte-check grepped to the page
- **VERDICT: PASS** — every claim re-derived TRUE in both source and live probes; findings: 1 LOW (missing #install/#see-also anchor ids) + 2 INFO notes. The two id one-liners can ride scribe's consolidation.

## The claims, re-derived

### 1. The FOURTH theme pattern (dropped-with-own-adaptation) — VERIFIED, in TWO media
- **Source**: `stampCarriersForLanes({ ...d, theme: undefined })` (code-card.svelte:209) + `provideUniversalLanes({ density, size, shape, radius, color, elevation, motion })` (:210, eight-minus-theme) + the §13 comment; the resolved live root style carries **no** `--jx-theme-effective` while size/density carriers sit beside it.
- **Own adaptation**: `:where(.dark .jx-code-card)` (:46) + `:where(.jx-light .jx-code-card)` (:71) — all three blocks (base :22 / dark :46 / re-flip :71) are **zero-specificity `:where()` in the same `@layer components`** → source order arbitrates: base < dark < jx-light.
- **Medium A — the page itself (a jx-light-stamped canvas, verified in the ancestor chain)**: wrapping a card in an ancestor `div.dark` flips the RAW tokens (muted → oklch(0.2178 0 0), foreground → white, primary → dark) and the ground tint flips **oklch light mix → color-mix(oklab, oklch(0.2178 0 0) 42%, oklch(0 0 0))** (oklab L ≈ 0.98 → ≈ 0.091 — vellum's exact numbers) while **the card itself never carries .dark** (`classList.contains('dark') === false` throughout). `--tok-token-keyword` re-derives through `var(--primary)` to **oklch(0.7044 0.1872 calc(327 − 4))** — the dark primary with the one-hue −4° drift arithmetic live in the computed value.
- **Medium B — clean dark scope (jx-light ancestor lifted, then restored)**: the dark block **fully engages** — ground → the **78%** dark formula, comment → **30%**, metaBg **18%**, metaFg **60%**, constant **70%** — every dark-block re-declaration is live CSS, not dead paint. Restore → light values return.
- **Receipt-precision note (INFO)**: on the page's medium the ground flip flows through the base/jx-light **42%** formula with dark raw tokens (0.42 × 0.2178 = the 0.091) — the dark block's 78% ground engages only outside a jx-light scope, because the re-flip block is LAST and the page canvas is jx-light-stamped. That is the css's own documented design (code-card.css:63-70 names "a component-canvas light stage" verbatim). Vellum's flip receipt is real; the formula attribution differs by medium — both media now have pinned receipts.

### 2. Density = the quietest lane — VERIFIED
- Family grep: **zero** density-kernel reads (`--jx-text`/`--jx-hit`/`--jx-inset`/`--jx-gap` absent from code-card.{svelte,css,stylex.ts}); the single typed voice is `fontSize: tokens['--jx-text-label']` (stylex.ts:54) and `--jx-text-label` has **zero** `[data-density]` re-declaration sites in jixoai.css — px-anchored by construction.
- Live: stamping `data-density="large"` directly on a card root moves nothing (pre stays **12.5px**, padding 14px unchanged); the theming DensityDemo card sits under an **xs** stage but measures pre **12.5px** / head label **11px** (the typed label literal). The card hosts no child components — the broadcast reaches no tenant (source: figure/pre/code/button only).
- **No query() seat — the reasoning is sound (reviewer judgment requested, judgment given)**: the deviations paragraph (:1166-1168) states it: "this surface hosts no components, so a responsive lane would re-base nothing — the density row's probe receipt is the demonstration." I checked the OTHER lanes too: size is the §11 echo (nothing follows the stamp), shape/radius/color/elevation are supply-only, theme is dropped — no lane has a consumer a query() could re-target. The no-seat reasoning generalizes beyond density and holds.

### 3. Size: the §11 echo — VERIFIED
Live root style on the `size={18}` universal demo card, verbatim: `--jx-size-effective: 18px; font-size: var(--jx-size-effective, 1rem)` (+ `--jx-density-coefficient: 1`), pre holds **12.5px**, filename-tab head holds **11px** (the typed label step) — a stamp with no em to scale, exactly as the row says.

### 4. shiki vs inline-code — VERIFIED (medium named)
- Live workbench pre: **68 spans total** (56 style-carrying; sample `style="color:var(--tok-token-keyword)"`) — real token markup, LAW #15-gated. Raw SSR bytes carry **0** spans: shiki highlights client-side, so the "served" count is the hydrated DOM (medium named per LAW #16 discipline).
- Kinship receipts in source: both families share `HIGHLIGHT_KEY` (code-card.svelte:222; the overview's seam paragraph) with different stock backends (shiki vs microLighter :18); neither imports the other.

### 5. Supply-only lanes + copied state + rem discipline — VERIFIED
- shape/radius/color/elevation: zero carrier/corner/shadow reads in the family (grep). Motion is honestly NOT claimed supply-only: the page's motion row states the kernel reads (veils on `--motion-150`/`--motion-ease-out`, reduced-motion kills) — correct self-report.
- Copied state: click → `.copied` lands, button repaints `rgba(0,0,0,0) | oklch(0 0 0)` → **oklab(0.62 −0.156 0.109 / 0.12) | oklch(0.62 0.19 145)** — the jx-hue-success tonal seam (css :155-161).
- rem discipline: the page's only rem literals are `minHeight="12rem"` (:577 usage snippet) and `maxHeight="14rem"` (:822 demo prop) + the `var(--jx-size-effective, 1rem)` fallback — **zero viewport-rem boundary claims** anywhere. Nothing to falsify.

### 6. Standard loadout
- **Gaps-only audit (integration-diff form)**: the `35d2cddc` diff touched exactly `+page.svelte` (+80) and `+page.ts` (+1) among product files — adding Overview/Install/See-Also, the measured per-axis table, the deviations paragraph, and the cx/ternary fixes; the canon sections (workbench/scroll-law/Shiki contract/engine matrix/types/usage/a11y/api) were left untouched, as the tier prescribes.
- **Archetype order**: install (data-doc-install at SSR byte 624,423) precedes overview (627,764); toc order == DOM (byte-positions strictly increasing).
- **toc**: the toc source carries **10 entries**; all 10 present in SSR in order; + install + see-also = 12 content sections (the dispatch's "12/12" counts sections, the toc is 10/10 — reconciled). h1 = 1.
- **grep test/ pins**: none claimed on the page (only the migration-census citation, which checks out). Family gates green: **code-card.spec + code-card-backend-highlightjs + print-stylesheet-gate solos = 44/44, exit 0** (matches vellum's 44/44).
- **Diagnostics**: fleet svelte-check — `+page.svelte` for code-card.html carries **ZERO diagnostics** ✓ (the route dir's 2 detector-playground.svelte errors at 42:28 and 231:54 are the pre-existing ones vellum already flagged for quill's flow; fleet now 1604 errors / 1030 warnings).

## Findings (severity-tagged)

1. **[LOW · archetype consistency]** The Install and See-Also wrappers carry **no id anchors** — `<div data-reveal=""><DocsInstall name="code-card" /></div>` (:694) and the see-also wrapper (:1179) vs the fleet pattern (`id="install"` / `id="see-also"`, present on descriptions' SSR). Sections render and are aria-labeled, but `#install`/`#see-also` deep links don't resolve on this page. Fix: two attributes on the existing wrapper divs; rides scribe's consolidation.
2. **[INFO · receipt precision]** The theme mechanism is two-medium (see claim 1): on any jx-light-stamped stage the ancestor-dark flip resolves through the 42% formula with dark raw tokens; the dark block's own formulas (78%/30%/18%/60%/70%) engage only in a clean dark scope. Both verified live; recorded so future probes name the medium before attributing formulas.
3. **[INFO · wording tension]** The theming TokenTable lists a `--jx-text 11/12/13/15px (density)` row on a page whose axes table proves the family reads no density channel. True as ambient-scope documentation, mildly ambiguous beside "MEASURED INERT"; the axes row's explicit "quietest lane" statement carries the truth. No action required; scribe may append "(broadcast only — unread here)" if touching the file anyway.

## Gate receipts

| Gate | Result |
|---|---|
| code-card + backend-highlightjs + print-stylesheet-gate solos | **44/44, exit 0** |
| svelte-check (fleet 2493 files) | **+page.svelte: 0 diagnostics** (route dir: 2 pre-existing detector-playground errors) |
| Raw SSR | 1,216,843 bytes; HTTP 200; toc 10/10 order==DOM; h1 = 1; install/see-also sections render (no id anchors — finding 1) |
| Live probes | theme two-media receipts; density inert (lg stamp + xs stage); size echo verbatim; shiki 68 spans; copied → success tonal |
| grep rem | :577 minHeight / :822 maxHeight lengths only — no viewport boundaries claimed |

## Process evidence

- Port **5244**: `lsof -ti :5244` **EMPTY before** (rc=1); my background wrapper started vite; killed by PID at session end → **EMPTY after** (receipt in the closing log). No other 5244 process at any point.
- **NO commits, NO pushes, zero product-tree edits** (review-only; writes are this report + experience.md).
- Artifacts: probes `/tmp/marginalia-26-probe{1,2,3}.mjs`; SSR `/tmp/marginalia-26-ssr.html`; specs log `/tmp/marginalia-26-specs.log`; svelte-check log `/tmp/marginalia-26-scheck.log`; dev log `/tmp/marginalia-26-dev.log`.
- Probe craft banked: zero-specificity `:where()` token re-declaration stacks arbitrate by source ORDER — a page-level stage class (jx-light) silently re-routes which formula paints; lift/restore the stage to measure the clean scope before attributing formulas.
