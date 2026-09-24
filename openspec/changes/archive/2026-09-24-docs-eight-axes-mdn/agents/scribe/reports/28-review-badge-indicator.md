# 28 — REVIEW badge-indicator (2nd of 2; scribe)

Date: 2026-09-23 · scribe · port 5243 · NO commits
Target: marginalia's page at `a1d77c2c` — `badge-indicator.html/+page.svelte` (402 lines) + `+page.ts` + the badge-indicator blocks in `canvas-same-source.spec.ts` (:62, :1777, :1798). Reviewer #1 = quill (PASS) — independence law held: findings formed from source + probes BEFORE reading quill's report 23. Medium (LAW #16): Chromium headless, 1440/1280/900 viewports as named per probe.

## Per-claim verdicts (all five verified TRUE)

### 1. POSTURE-SPLIT size echo — VERIFIED (probe receipts on all three postures)

- **Standalone = the root IS the chip**: the `size-echo` chip's inline style reads verbatim **`--jx-size-effective: 18px; font-size: var(--jx-size-effective, 1rem)`** and computes **18px** — the inline mirror beats the class atom (`--jx-text-micro` = 0.625rem/10px, tokens.stylex.ts:147 → jixoai.css:1406); box stays 18 (unit-locked — only the TEXT follows size).
- **Riding = the WRAP carries the stamp**: `wrap-default`/`wrap-lg` chips read style **null** on the chip (the carriers land on `data-jx-bi-wrap` — source :156-166) and hold **10px / 18px** in both.
- **Stamped-chip inert**: `density="lg"` ON the chip — `data-density="lg"` + `--jx-density-coefficient: 1` inline, font **10px**, box **18px** unchanged; `--jx-unit` computes 0.25rem everywhere (never re-based — the whole ruler arithmetic 2.5U=10 / 4.5U=18 / 1.5U=6 hangs off the ONE :root declaration).
- Probe-craft note: one early read returned 16px on the stamped chip — non-reproducing; two fresh scoped dumps (plus the #types chips at 10px) say 10px. Settled truth = the claim.
- **quill's NIT judged: author's-discretion ACCEPTABLE.** The riding-half is source-visible (carriers land on the wrap only) and analog-probed live (the density wraps show the same wrap-carries/chip-holds split). A sixth `size={18}`-over-child panel would re-tell the density story with a different axis name. No action required; ledger note stands.

### 2. The cleanest raw-vs-typed pair — VERIFIED (injected-island, numbers identical end to end)

Injected `.dark` island around a standalone count chip (move-measure-restore):

| read | outside | inside .dark | verdict |
|---|---|---|---|
| raw `--destructive` | `oklch(0 0 0)` | **`oklch(1 0 0)`** | FLIPS |
| typed `--jx-destructive` | `oklch(0 0 0)` | **`oklch(0 0 0)`** | FROZEN |
| typed fg | `oklch(1 0 0)` | `oklch(1 0 0)` | frozen |
| chip paint | black ground / white ink | **black ground / white ink** | the chip paints the TYPED alias |

Emission-form cites verified: `jixoai.css:73` (`--destructive: oklch(0 0 0)`, light) / `:290` (`--destructive: oklch(1 0 0)`, the `.dark` re-declaration); the typed alias declares once at :root (`tokens.stylex.ts:73` — `'--jx-destructive': 'var(--destructive)'`), so the var() substitution happens at the DECLARING element and inheritance carries the computed token down — the mechanism, one shadow token apart.

### 3. Composition — VERIFIED at both viewports (scope-driven, not media-driven)

PressButton under the wrap: **40px** (`density="default"`) → **48px** (`density="lg"`) at **1440, 1280 AND 900** viewports; chip 10px/18px beside both at every width. Explicit rungs are real density scopes — matches the row's no-query()-seat posture.

### 4. EXTRA arithmetic — VERIFIED by enumeration (the corrected form)

- Interface (`badge-indicator.svelte` Props): **15** = 6 family (dot, count, overflow, showZero, children, label) + 8 axis-named + class.
- Served `#api` (SSR-enumerated row names): **exactly 14** — `dot, count, overflow, showZero, children, label` + `size, shape, radius, density, color, theme, elevation, motion`. **No class row; no rest row.** The interface closes at class — the −1 IS class. The page's no-rest note (:329-331) says so; the corrected brief form is the one that reproduces.

### 5. Zero imports from badge/chip — VERIFIED

Shape-agnostic grep over the whole family dir: imports are only svelte types / defaults / stylex / the barrel's own re-exports; zero `badge/` or `chip/` edges. Kinship is vocabulary-level (the micro scale) — as the Overview's paragraph 2 states with the same grep receipt.

## The plus-list — VERIFIED

- **Honest zero**: source gate `visible = dot || (count !== undefined && (count > 0 || showZero))` — count=0 renders nothing; served texts `["", "5", "99+", "0"]` — the cap `99+` live, showZero's `0` live, honest zero as absence.
- **Dot a11y**: `role="img"` + `aria-label="2 unread"` (empty text); counts announce their visible text (aria-label = the count).
- **No aria-live**: source clean; the a11y table carries the ruling (state, not events — the HOST owns the live region).
- **Chrome positive exemplar**: h1 ×1; universal marker ×1; toc 8/8 ids (overview / badge-indicator-demo / badge-indicator-law / types / usage / api / axes / accessibility) == DOM order; **`id="install"` + `id="see-also"` shipped** (the fleet pattern — both anchored, both folded out of the toc).

## Cross-check against quill (read AFTER findings formed)

No divergence. Identical island numbers (0→1 raw / 0 frozen / paint static), identical mirror string, identical 40→48 at both viewports, identical 14-row enumeration, identical grep posture. His NIT disposition (optional polish) — concurred with reasoning above. His brief-claim correction (no rest row served) reproduces under my independent enumeration.

## Gates

| Gate | Result |
|---|---|
| canvas-same-source solo (badge-indicator blocks among the 92) | **92/92 green** |
| docs-ambient-vocabulary solo | **284/284 green** |
| verify:docs-universal | **GREEN 110/110, exit 0** |
| svelte-check (page-scoped) | **badge-indicator.html: 0 diagnostics** (route dir clean) |

## Environment discipline

- Port 5243: `lsof` EMPTY before (rc=1); background-wrapper dev server killed by PID after probes → **EMPTY after** (`port after: []`).
- **NO commits, NO pushes.** Zero product-tree edits (review-only). Vellum's ghostty-term files and quill's popconfirm files in flight — untouched; no sibling-keyed noise encountered.
- Artifacts: `/tmp/scribe-28-probe{1,2,3,4}.mjs`, `/tmp/scribe-28-ssr.html`, `/tmp/scribe-28-check.txt`, `/tmp/scribe-28-dev.log`.

## Verdict

**PASS** — badge-indicator (2nd of 2). Zero MAJOR, zero MINOR; the riding-half NIT judged author's-discretion acceptable (no action required). The page is the batch's positive exemplar for chrome discipline, and its frozen-pole pair is the cleanest raw-vs-typed receipt in the campaign: one injected island, two var reads, the whole declaring-element law visible.
