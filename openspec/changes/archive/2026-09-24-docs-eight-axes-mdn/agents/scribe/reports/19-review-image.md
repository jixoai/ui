# TASK 19 — REVIEW image (2nd of 2, scribe) — re-derive-on-fixed-tree

- **Reviewer**: scribe · 2026-09-22 · re-derivation of my own NEEDS-WORK findings on quill's fixed tree (`d45a58ec`, path (a))
- **Target**: `apps/www/src/routes/docs/components/image.html/+page.svelte` post-fix
- **VERDICT: PASS — image closes** (page #18 or #19 per color-picker's race, the orchestrator's ledger decides)

## Per-finding verdict table

| # | My 1st-review finding | Quill's disposition | Post-fix verdict |
|---|---|---|---|
| 1 | **MAJOR** — query demo stamp claim: the fallback snippet suppressed the family's own stamp; the demo could not show what it claimed | Path (a): snippet dropped (live demo + queryUsage string); the DEFAULT frame's broken panel IS the demo surface | **RESOLVED — measured**. LAW #15 probes (scroll into view → await the swap → read): @1280 `data-density="sm"` · @600 `"lg"` · @1280 `"sm"` — quill's exact numbers. Box **640×360 constant** across the rung (no-CLS holds). Bonus receipt: the panel style reads `--jx-density-coefficient: 1; width: 640px; height: 360px;` — the named-rung carrier JOINED with the dimension literals in one attribute |
| 2 | **NIT** — path mismatch between the axes sample and the query demo | Aligned to `/definitely-missing.png` | **RESOLVED** — 10 occurrences aligned (query demo, dark island, the law canvas); the sole remaining `flakyUrl` is inside the fallbackDemo STRING — illustrative code copy, never mounted |
| 3 | **NIT** — hand-file disclosure missing | Axes caption now discloses | **RESOLVED** — the caption's form ("usage mirrors HAND-AUTHORED to match the stage markup; the same-source migration is the recorded follow-up — the component source in each drawer is the registry's own") matches the composition-demo precedent (hand mirrors + recorded follow-up + registry truth), the same form the card/tabs/skeleton/timeline pages carry |
| 4 | **Collateral** — cx predicate | Applied | **RESOLVED** — 0 svelte-check errors on the page (workspace baseline sibling churn only) |
| 5 | **Regression sweep** — my 1st-review verified-TRUEs must survive the fix | — | **ALL HELD** (below) |

## Regression sweep — every 1st-review verified-TRUE re-derived on the fixed tree

- **Frozen-pole purest case**: 5 broken panels after swap-await — **1 distinct face** (border oklch(0 0 0), bg oklch(0.9551 0 0), font 16px on every one, light and dark alike). The dark island: `--muted` = `oklch(0.2178 0 0)` (the raw layer FLIPPED) while `--jx-muted` = `oklch(0.9551 0 0)` (the stylex alias FROZEN at the :root pole) — measured on the same element. The purest case survives the snippet removal byte-for-byte.
- **Size inert**: auto 16px vs stamped **14px** (stamp verbatim `--jx-size-effective: 14px; font-size: var(--jx-size-effective, 1rem)`), both boxes **96×96**, real `/icon.svg` sources (no swap race — read pre-error).
- **Merge law**: carriers + dimension literals joined in ONE style attribute on the broken panel (`--jx-density-coefficient: 1; width: 640px; height: 360px`) — the §10 merge survives failure, visible in the raw bytes.
- **Leaf both directions**: image imports no family components (its own atoms/Icon/kernel only); its consumers are the docs page, meta, and the blueprint scene — no family mounts image, image mounts no family.
- **Carriers hand table + universal marker**: the hand table (9 rows: alt*, width*, height*, src, fallback, onerror, class, style, ...rest) carries the carriers-JOIN description; the universal section renders the 8 axis rows with the `'auto' · ambient scope` marker. 0 empty cells everywhere.

## LAW #15 practice note (for the fleet)

The swap REPLACES the img — a post-swap read of the img goes `undefined` and a pre-swap read of the panel goes `null`; the honest protocol is scroll-into-view → poll for `span[data-jx-image-broken]` (or the img pre-error) → read. Two of my probe rounds failed on exactly this before the third landed; the failures ARE the law's proof.

## Standard loadout

- SSR: 200, **1 h1**, toc 8 anchors 0 dead; universal 8 rows; hand table 9 rows; 0 empty cells across 6 tables.
- **Gates**: docs-ambient-vocabulary + docs-structure + composition-a + table-grid-toolbar-pages solos **352/352** (exit 0); svelte-check page 0 errors.
- Quill's disposition report numbers (sm@1280 / lg@600 / sm@1280, 640×360) reproduce exactly.

## Findings (severity-tagged)

1. **[RESOLVED]** MAJOR — see table row 1; path (a) verified by independent probes (not by trusting the diff).
2. **[RESOLVED]** NIT — path alignment, see row 2.
3. **[RESOLVED]** NIT — disclosure, see row 3; form matches the precedent.
4. **[RESOLVED]** Collateral — cx predicate, 0 diagnostics.
5. **[NONE]** No new findings on the fixed tree. The two probe failures during re-derivation were my own LAW #14/#15 discipline lapses (stale img handle; missing scroll-into-view), not page defects — recorded as the law's proof.

## Process evidence

- Port **5243**: lsof empty before; PID `58974` killed → lsof **empty**, no ps residue, background task exit 143 (my SIGTERM). **No commits, no pushes.**
- Artifacts: probes `/tmp/scribe-19-probe{1..9}.mjs` + logs; SSR `/tmp/scribe-19-ssr.html`; gate logs `/tmp/scribe-19-{solos,scheck}.log`; fix diff via `git diff d45a58ec^ d45a58ec`.
