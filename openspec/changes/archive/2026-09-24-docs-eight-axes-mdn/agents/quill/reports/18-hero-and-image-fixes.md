# Task 18 — reserved package: hero-section MAJOR disposition + image MAJOR/NIT fixes · quill · 2026-09-22

**Verdict: LANDED (working tree; no commits).**

## Part A — hero-section query() theme demo: NOT REPRODUCED (disposition (iii))

**The demo flips live, both directions, reactive end to end. Measured on the
served page** (playwright, viewport resizes across the md=48rem breakpoint):

| viewport | matchMedia md | query hero `class:dark` | eyebrow ink |
|---|---|---|---|
| 1280px (≥md) | matches | **true** | oklch(0.7044 0.1872 220) — dark accent |
| 600px (<md) | no | **false** | oklch(0.55 0.12 321) — light accent |
| 1280px again | matches | **true** | oklch(0.7044 0.1872 13) — dark accent |

(The hue segment varies with the page's live brand-hue context; the L/C flip
is the accent-voice flip the axis row documents.)

**Why the machinery is sound (source-read)**: `query()` returns the ordered
`$query` record; the family resolves it inside its own `$derived`
(`HeroSectionDefaults.resolve`) → `themeAxisSlot` → `resolveAxisLane` →
`unwrapQueryLane` → `resolveQueryLane` → `evaluateQuery` → `liveMediaMatches`
— which reads `mediaTick`, a module `$state` bumped by the matchMedia
`change` listener (universal-props-query.svelte.ts:156-172, the tracked read
at :170). Resize bumps the tick → the derived re-resolves → `class:dark`
updates. The same machinery was cross-confirmed on input-group's density
query demo the same session (sm@1280 / lg@600 / sm@1280, height 32↔48px).

**Plausible false-negative vector (now documented on the page)**: SSR first
paint is the unconditional BASE (light) by §9.1 — correct-if-unresponsive by
design — and the flip engages only after hydration. A raw-bytes check, a
pre-hydration read, or a below-breakpoint-only check always sees light.
Disposition: **neither a page fix nor a family fix nor a W-next entry**; the
demo caption now states the §9.1 first-paint + hydration engagement
explicitly so the next reviewer measures the live flip.

## Part B — image query demo: marginalia's path (a) applied + verified live

**MAJOR**: dropped the `fallback` snippet from the query demo (the snippet
branch renders consumer markup only — image.svelte:153-154 — nothing stamps
it). The DEFAULT frame's broken panel (image.svelte:165 region) carries the
stamp and is the demo surface. **Measured post-fix, both directions**:

| viewport | query demo broken panel `data-density` | box |
|---|---|---|
| 1280px (md case wins) | **sm** | 640×360 |
| 600px (base) | **lg** | 640×360 |
| 1280px again | **sm** | 640×360 |

The no-CLS box holds across the rung; the caption now states the
purposeful-no-snippet reasoning (the snippet branch renders YOUR markup only
— nothing stamps it) so the demo can't regress into the false claim.

**NIT 1**: axes sample `src="/missing.png"` → `/definitely-missing.png`
(aligned with every stage load).

**NIT 2**: hand-file disclosure added to the axes section caption ("the
demos' usage mirrors above are HAND-AUTHORED to match the stage markup — the
same-source migration is the recorded follow-up; the component source in each
drawer is the registry's own") — the "code shown = code running" claim now
scoped honestly.

## Bonus: cx predicate on both pages

The one-line avatar-template predicate applied to hero-section and image —
**both pages now 0 diagnostics** (fleet 1615→1613).

## Gates

| Gate | Result |
|---|---|
| svelte-check | hero-section **0** · image **0** |
| dev-smoke :5241 | 200 both pages; PID 23947 killed; `lsof :5241` empty before AND after |
| probes | Part A three-state flip measured; Part B sm/lg flip measured (tables above) |
| verify:tailwindless | GREEN — receipt verbatim: `files=2 identities=7 occurrences=7 zones={routes:1, site-libs:0, ui:6} forms=42` |
| verify:docs-universal | GREEN 110/110 |
| verify:docs | staged scope green |
| specs solo | variant-grammar, docs-structure, docs-ambient-vocabulary, props-table-meta-drift, inline-code, hue-injection: GREEN in the 8-file run; form-family **3/3 solo with --testTimeout=30000**; canvas-same-source passed solo |
| build | **1 error — SIBLING-ATTRIBUTED**: prerender `Error: 500 /docs/components/carousel.html`, the in-flight carousel conversion in the tree (`carousel.html/+page.svelte` +376/−116 + new `carousel.docs.ts`, another agent). Zero hero/image errors in the build log; my pages are prose + predicate only |
| machine-load note | load average 28-59 during the spec runs; the 5s-timeout failures (form-family ×2, canvas-same-source blockquote, input-group mounts) are environmental — cleared solo / with --testTimeout=30000 |

No commits made. Report file: `agents/quill/reports/18-hero-and-image-fixes.md`.
