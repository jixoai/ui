# 27 — REVIEW navigation-menu (1st of 2; scribe)

Date: 2026-09-23 · scribe · port 5243 · NO commits
Target: quill's tier-2 page at `4cfde004` — `navigation-menu.html/+page.svelte` (658 lines) + `+page.ts` + the ambient matrix re-pin. Reviewer #2 = marginalia (independence law held: my findings were formed from source + probes BEFORE reading quill's report 22). Medium (LAW #16): Chromium headless 1440×1000; popover measures taken past WAAPI entry animations (TRANSITION-FRAME law — awaited `getAnimations().finished` + settle).

## Per-claim verdicts (all five verified TRUE)

### 1. Consumption one promotion away — VERIFIED (the load-bearing channel)

- **Source**: the nav root ALWAYS stamps `--jx-radius-consumed` (`navigation-menu.svelte:224-227` — explicit lane `calc(10px * 1)`; auto the §3 concentric form verbatim `calc(max(0px, calc(0px - 0px)) * 1)`, both read live on roots); `.jx-pop` reads exactly that var with the auto form as fallback (`popover.css:44-52`) + `corner-shape: var(--jx-shape-effective, round)` (:42).
- **Measured on real OPEN menus** (click → await animations): ambient panel computed border-radius **0px** → `radius="large"` panel **10px**. The top layer moves the PAINT, never the DOM — the promotion-kept inheritance is the channel, measured.

### 2. Theme split vindicated through the red herring — VERIFIED (clean signal only)

- **Panel flips live**: open-panel surface fill (`[data-jx-navmenu-surface]`) **`oklch(0.96 0 0 / 0.72)`** ambient → **`oklch(0.185 0 0)`** under the `theme="dark"` root's scoped `.dark` (raw `--popover` reads; the promotion keeps DOM inheritance).
- **Bar ink freezes**: idle trigger computed color **`oklch(0.3211 0 0)` in BOTH scopes** (closed-state reads; `darkClass` false vs true on the roots), while the RAW `--muted-foreground` underneath differs **0.3211 → 0.8452** — the typed aliases compute once at :root and inherit frozen. No hue read anywhere in my receipts (quill's self-correction honored: the per-panel hue injection drifts on the wall-clock; the idle neutral token is the signal).

### 3. Density declaration-scope freeze — VERIFIED

- `density={1.5}` (nsm-coef): root `data-density` **absent**, root carrier **`--jx-density-coefficient: 1.5`** stamped, entries hold **40px hit / 13px type / 12px padding** — the kernel lanes are plain `var(--jx-hit/...)` reads (stylex.ts:42-49), computed at their declaring scope; a bare coefficient re-rungs nothing.
- Rung contrast: ambient **40/13/12, no attr anywhere** vs `density="sm"` **32/12/8 with `data-density="sm"` on BOTH root and trigger** (the bar context carries the opinion).
- query() case: `query({ md: 'lg' }, 'sm')` flips **lg @1440 / sm @600** on the nav root (the 48rem key).

### 4. Size supply-only for the entries — VERIFIED

`size={14}` root computed **14px** vs ambient root 16px; the bar link holds **13px / 40px** (the kernel type voice beats inheritance by declaration). The em-relative tracking scales with `--jx-text`, not the stamp.

### 5. Indicator pins — VERIFIED with one LOW (see findings)

- `viewTransitionName` **`jx-nav-indicator`** under motion="navigation" / **none** under waapi (computed, both demos).
- `aria-hidden="true"` ✓; hug-box == entry box: **145px × 40 vs 144.9 × 40** (inset own 0 — the fit writes inline width/height/transform; first read w=0 pre-fit, settled read is the receipt — fonts.ready/RO async).
- **Roving trim (fresh load)**: registry `tabindex="-1"`, components `tabindex="0"` + `aria-current="true"` — the tab stop lands on the current-section trigger.
- **BUT the tabindex claim does not reproduce** — finding 1 below.

## The duplication-contract spine — VERIFIED

Hero pill, Overview paragraph 3 (:345-358), and the Usage summary all state it. Greps: ZERO component-tree imports between the three menu roots (navigation-menu/menubar/dropdown-menu) — only prose mentions ("the menubar glide", "actions belong to dropdown-menu", the stylex menubar carve-out note). The only sharing is fleet-law level (density-adoption-menus' honest-opinion law — its spec is among the greens).

## The hand universal table / 110-gate marker — VERIFIED

Marker `data-jx-props-table-universal` ×1 in SSR (1,146,730 B; h1 ×1). The authored array is **13 rows** (`:606-620` — label, density, variant, inset, size, shape, radius, color, theme, elevation, motion, class/style, children). Served structure (counted precisely): **3 tables / 18 rows** — 5 authored non-universal rows + the 8 axis rows rendered through the SHARED universal table (the `universal` directive routes those names to the fleet's shared section — the 110-gate mechanism itself) + the 5-row parts table. Not drift — but see finding 2 for the counting rule.

## Findings (severity-tagged)

1. **[LOW · doc precision / receipt does not reproduce]** The indicator carries **`aria-hidden` but NO `tabindex` attribute** — source markup (`navigation-menu-indicator.svelte:292-301`) has no tabindex; live `getAttribute('tabindex')` → null. The page's a11y table (`:496`, "aria-hidden + tabindex -1 … probe-asserted") and quill's receipt state an attribute the DOM doesn't carry. The INTENT holds (a bare span is not focusable — no tab stop, no semantics), so zero runtime harm. Fix is one attribute: add `tabindex="-1"` to the span (makes all three records true), or reword the row to "aria-hidden; not focusable (plain span)". This is the measured-must-reproduce class: the receipt as written doesn't reproduce.
2. **[NOTE · counting rule]** The dispatch's "13 authored rows" is the source-array count; served the api section shows 18 rows across 3 tables (5 authored + 8 shared-folded + 5 parts). Future counters: enumerate the ROW NAMES, not `<tr>` bytes, and expect the `universal` directive to lift axis-named rows into the shared table.
3. **[NOTE · probe craft]** Two reads need settle discipline: the indicator's fit is async (fonts.ready + ResizeObserver — an early read reports w=0), and the roving trim should be read on a FRESH load (the empty-state law renders every trigger tabbable until the trim; interaction-adjacent reads can catch the untrimmed posture). Fresh + settled reads reproduce all claims.
4. **[NONE]** otherwise — no MAJOR, no MINOR on the five dispatched claims; the red herring did not bite (no hue reads).

## Gates

| Gate | Result |
|---|---|
| Menu-family solos (6 files: navigation-menu-indicator, density-adoption-menus, defaults-nav-clean, defaults-nav-providers, nav-filter, docs-nav-filter) | **60/60 green** |
| docs-ambient-vocabulary | **284/284** — matches the re-pin's green; the matrix shift (tableIndex 0→1 + the size scope entry) holds under my own run |
| docs-universal | **GREEN 110/110, exit 0** |
| svelte-check (page-scoped) | **navigation-menu.html: 0 diagnostics** (route dir clean — the typed cx predicate landed) |
| SSR | 1,146,730 B; h1 ×1; marker ×1; toc 7/7 ids present (overview/navmenu-demo/usage/indicator/accessibility/axes/api) |

## Environment discipline

- Port 5243: `lsof` EMPTY before (rc=1); background-wrapper dev server killed by PID after each cycle → **EMPTY after** (`port after: []`).
- **NO commits, NO pushes.** Zero product-tree edits (review-only). Vellum's ghostty-term CODE (`ghostty-term.html/+page.svelte` in the working tree) untouched; no ghostty-keyed noise encountered.
- Artifacts: `/tmp/scribe-27-probe{1,2,3}.mjs`, `/tmp/scribe-27-ssr.html`, `/tmp/scribe-27-check.txt`, `/tmp/scribe-27-dev.log`.

## Verdict

**PASS** — navigation-menu (1st of 2), with the one LOW (indicator tabindex wording/attribute) filed for marginalia's cross-read and the closure consolidation. The promotion-away channel is the batch's cleanest consumption story: the top layer moves paint, never DOM, measured 0px → 10px on real open menus.
