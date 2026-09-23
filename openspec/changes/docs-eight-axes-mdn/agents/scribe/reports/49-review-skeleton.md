# Task 49 — SECOND REVIEW skeleton (2nd of 2) · scribe · 2026-09-23

**Verdict: PASS — the page closes as #41.** 0 MAJOR · 0 MINOR · 0 LOW ·
0 NIT of my own beyond instrument notes — every headline claim verified
by my own probes, and the page carries nothing that needs fixing.
Independence law kept: findings formed from my own source reads + probes
BEFORE opening quill's report 32 or marginalia's report 46.

**Reviewed**: `apps/www/src/routes/docs/components/skeleton.html/`
(+page.svelte 467 lines, +page.ts 9-entry toc; clean vs HEAD 4f047d4d)
+ `apps/www/src/lib/ui/skeleton/` (svelte 127 / css 31 / stylex 35 /
defaults 51).

## The verification surface — my own probes

### 1. The pulse — VERIFIED-TRUE, third instrument converging

My own rAF sampler: **91 samples over 1.5s** (> one full 1.4s cycle) on
the live workbench block — opacity **min 0.450, max 1.000**, oscillating
exactly as the keyframes declare (skeleton.css: 0%/100% → 1, 50% →
0.45). Computed animation: **jx-skeleton-pulse 1.4s ease-in-out
infinite**. The no-shimmer negative holds: **background-image: none** —
there is no gradient to sweep; the entire effect is the opacity
channel. (quill: 120 samples/2s; marginalia: 100 samples/1.65s — three
instruments, one envelope.)

Her NIT (the readout is scroller-scoped, .jx-shell-body): my probe read
the element directly with no scroller interaction needed — the pulse
animates regardless of scroll; concurred as an instrument note, nothing
to fix on the page.

### 2. The RM freeze — VERIFIED pixel-still

Under `prefers-reduced-motion: reduce`: computed **animationName none,
duration 0s**, and the opacity sample set collapses to a single value
**1.000** across the whole 1s watch — a still frame. The kill rides the
unlayered `:where(.jx-skeleton)` carve-out (skeleton.css), beating the
animation declaration.

### 3. The merge law — VERIFIED, one attribute, consumer wins

The stamps specimen's style attribute carries BOTH declarations
verbatim: `--jx-radius-effective: 12px; --jx-density-coefficient: 1;
border-radius: 3px` — and the **computed corner is 3px** (the
consumer's inline wins the painted property while the carrier
co-exists). The row's claim, measured.

### 4. Never-manufactures — VERIFIED to the pixel

`size={18}` on both sk-size specimens: the style attr stamps
`--jx-size-effective: 18px; font-size: var(--jx-size-effective, 1rem)`,
computed font-size **18px** — and the boxes stay **exactly 128×12**
(skBar) and **40×40** (size-10), unchanged. The axis stamps the voice
and never manufactures geometry.

### 5. The re-hosted demos — VERIFIED clean (the honest form)

Live-DOM query over the dead utility selectors (.h-28, .w-full,
.size-10, .h-3, .w-32, .w-20, .w-2\/3, .size-8, .size-6, .h-4):
**zero elements** match any of them, while **40 live `.jx-skeleton`
blocks** render page-wide on the stylex atoms. (The SSR regex hits are
escaped drawer code text — marginalia's method note, confirmed.)

### 6. Theme bridge / rung / ids

The stamps panel's block carries the **dark class** (the bridge lands)
and **data-density="sm"** (the rung). **LAW #19**: post-hydration
**62 ids, ZERO duplicates** — one receipt line, as asked.

## Standard battery

- **SSR/post-settle + warm-reload**: first visit warms, reload measures.
- **EXTRA-lane by name**: api hand rows served = **[class, …rest]** (2 —
  the Props interface adds nothing, as the summary says) + the universal
  8 via the fold.
- **KEYED-EACH + mounted-children**: the shells' keyed eaches
  (`[64,92,78,85] as w (w)`, `[0,1,2] as row (row)`) — defined unique
  keys; **40 skeleton blocks mounted page-wide**, aria-hidden true on
  every block.
- **THEME-SPLIT vocabulary**: the theme row is a BRIDGE (the muted
  ground re-voices through the token); nothing-declares is trivial —
  the family's whole paint is two atoms.
- **Vocabulary-grep**: the motion row's "supplied, not read" is
  source-true (the pulse is a fixed 1.4s keyframe; the carrier lands
  unread); the MISSING --motion-1400/--motion-ease-in-out promotion is
  documented as the holding state.
- **Structure**: h1 ×1 · universal marker ×1 · toc 9/9 == +page.ts ==
  DOM · zero undefined/null literals.

## Findings

**None of my own** — 0 MAJOR / 0 MINOR / 0 LOW / 0 NIT. The page is
clean; both prior reports' items were already resolved or are
ledger-noted (the MISSING motion-literal promotion is the family's own
recorded follow-up; the dead-utility corpus sweep is quill's open
question 1, concurred as a cheap per-page DOM-query follow-up).

## Cross-check against quill's report 32 and marginalia's report 46 (read AFTER findings formed)

FULL three-way concordance: quill's pulse/freeze/merge/never-manufactures
receipts and her LAW #19 zero-twins scan reproduce under my probes;
marginalia's additions (the background-image-none instrumentation, the
24-block shells census, the real-scroller note, the SSR-regex-vs-DOM
method note) all reproduce too — my dead-selector sweep is the same
instrument over a wider selector list, and my block census (40
page-wide vs her 24 shells-canvas) is the superset count. Her NIT is
concurred by my clean direct-element read. No divergences; no additions
beyond the third pulse instrument and the bridge/rung reads.

## Gates (my run, final tree state)

| Gate | Result |
|---|---|
| docs-ambient-vocabulary solo | **284/284**, exit 0 — GREEN clean |
| verify:docs-universal | GREEN 110/110 |
| svelte-check | skeleton.html page: **0 diagnostics**; family diagnostics are the fleet's baseline classes (the cx join + provideUniversalLanes warns) |
| Port 5243 | lsof EMPTY before; dev server killed by PID + wrapper; EMPTY after |

## Closure

skeleton passes review #2 — **the page closes as #41**. Nothing to fix;
both prior reports' receipts reproduce, and the page's honesty (the
scenery contract, the never-manufactures law, the merge law made
visible) is exactly what the measurements show.

No commits made. Report file:
`agents/scribe/reports/49-review-skeleton.md`.
