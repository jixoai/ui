# Task 50 — FIRST REVIEW scroll-area (1st of 2) · scribe · 2026-09-23

**Verdict: PASS** — 0 MAJOR · 0 MINOR · 0 LOW · 2 NIT (both
receipt-precision notes, nothing to fix). Every headline claim verified
by my own probes, including the thumb contract re-derived at my own
geometry and the query seat verified LIVE in both resize directions.
Independence law kept: findings formed from my own source reads + probes
BEFORE opening vellum's report 38.

**Reviewed**: `apps/www/src/routes/docs/components/scroll-area.html/`
(+page.svelte 760 lines, +page.ts written fresh — 14 entries; clean vs
HEAD 6a330296 through 344f3fb6) + `apps/www/src/lib/ui/scroll-area/`
(svelte 339 / css 179 / stylex 32 / defaults 63) +
`apps/www/src/lib/scroll-area-kit/` (core / hand-drawn.svelte.ts /
native-capability.css).

## The headline claims — verified by my own probing

### 1. STAMP TOPOLOGY: OWN REGION ROOT — VERIFIED-TRUE (grep + source)

The family resolves `ScrollAreaDefaults.resolve({…})` and stamps
carriers + the thumb-corner literal in ONE joined rootStyle on the
family's own region div (scroll-area.svelte :168-185). Boundary greps,
all clean: **zero axis-lane reads in `scroll-area-kit/`** (the kit's
jx- hits are its own --jx-scroll-* chrome vars and comments); the
hand-drawn adapter is consumed ONLY by scroll-area
(`createHandDrawnScrollbar` import :61); **`resolveThemeScope` is
consumed only by the native sibling** (native-scroll-area.svelte +
native-capability.css + the core definition) — the observer-consumed
posture never touches this family. The sharing law holds: shared core,
disjoint halves.

### 2. The thumb contract — VERIFIED-TRUE (the invariant, at my geometry)

- **Mid-travel: `aria-valuenow="50"`** — scrolled the region to its
  middle, the thumb's valuenow reads exactly 50.
- **The ratio invariant**: thumb height 17.963% of the track ==
  `client/scroll` = 224/1247 = **0.180** at my viewport — digit-exact
  equality between the mounted thumb fraction and the kit's
  client/scroll fraction. (The dispatch's 0.333 was her viewport's
  fraction — the invariant is the claim, and it holds at every
  geometry.)
- **The verdict vocabulary**: `data-verdict-y="start-closed"` +
  `data-verdict-x="none"` + `data-chrome="on"` + `data-width` sit on
  the family root (`.jx-scroll-area`) — the chrome is CLOSED at
  scrollTop 0 (start-closed), which is why naive at-top probes see no
  live attribute. Rest-state thumb: aria-valuenow 0, block-size
  17.963%.
- **The pins timeline** (armed-watcher receipt): `data-thumb-live`
  mounts on the **family holder** at **52ms** after region focus (and
  stays held past 1.3s — the focus pin suspends the fade); after blur
  it drops at **716ms** (the ~700ms idle), then **the TRACK fades to
  opacity 0 while the thumb's own opacity stays 1** — the TRACK fades,
  never the thumb, digit-for-digit. (My appearance mark 52ms vs the
  dispatched ~1.1s: the attribute engages immediately when a pin holds;
  the dispatched 1.1s is an observed-still-on sample — same substance,
  and my holder-location finding names the element her report left
  open.)

### 3. The radius OWNED-NAME collision — VERIFIED-TRUE digit-exact

- The chrome matrix (3 radius modes × 3 width tiers, both axes): resting
  thumb widths **6 / 10 / 14px** (thin/auto/wide = track 8/12/16 − 2,
  exactly the taught resting geometry); radius ladder **0px square-cut**
  ambient, **6px** at radius={6}, **'full' → 3.35544e+07px computed**
  (calc(infinity * 1px), engine-capped to the capsule — the serialized
  form digit-exact).
- The double-stamp: the concentric-anchor specimen's holder style reads
  **`--jx-radius-effective: 20px; --jx-scroll-thumb-radius: 20px`** —
  the px number lane stamps the universal radius anchor AND the family's
  thumb chrome param in one attribute.
- **The anchor's work**: the auto Card inside the radius={20} region
  computes **6px** = max(0px, 20px − 0.875rem) — the concentric
  consumption digit-exact.

### 4. The frozen-ink watch — NEGATIVE confirmed, two-direction

- Bare `.dark` on the family root: thumb bg oklab(0 0 0 / 0.3), ink
  oklch(0 0 0) — **moved nothing** (the class re-declares token values;
  the chrome paints inherited currentColor).
- Stage text re-theme (rgb(136, 19, 55) on the stage): thumb bg →
  **oklab(0.41 0.148 0.027 / 0.3)** (the red-tinted 30%), thumb color →
  **rgb(136, 19, 55)** — the chrome FOLLOWED the text color. Restored
  after. currentColor is inheritance, not a pinned literal — the
  W-next #7 watch stays NEGATIVE on this family, and the positive
  direction is now instrumented too.

### 5. The query seat — VERIFIED-TRUE, live both directions

The real seat (label="sync"): **fresh load @600 → 13px** (stamp
`--jx-size-effective: 13px`), **live resize →1280 → 18px**, **live
resize back → 13px**. The md 48rem key flips live through the engine's
media tick. Chrome params reject query(): source-true (radius:
number | 'full'; width: the tier union; pad: string — no QueryResult
members; the task-43 fixture pattern is the standing proof method).

### 6. +page.ts written fresh — VERIFIED-TRUE

The file exists (28 lines, 14 toc entries) and the served toc matches
the DOM: all 14 ids present as wrappers, **zero missing**, chrome out.
The scroll-virtual lesson applied.

### 7. LAW #18 / #19 — VERIFIED-TRUE

Mounted children: **60 capsule log lines, 12 vertical items, 16
horizontal cards** — the dispatched 60/12/16, digit-exact. Keyed
eaches carry index/section keys. **LAW #19**: post-hydration **129
ids, ZERO duplicates**.

## Standard battery

- **SSR/post-settle + warm-reload**: first visit warms, reload measures.
- **EXTRA-lane by name**: authored hand array 10 entries → served **9
  rows [orientation, label, pad, width, class, style, onscroll,
  children\*, getViewport()]** — the authored **radius** row is
  axis-named and folds into the universal 8 (served: size, shape,
  radius, density, color, theme, elevation, motion). The dispatch's
  "8 served rows" under-counts by one (the fold arithmetic); the page
  makes no count claim. NIT-level receipt precision.
- **Vocabulary-grep**: zero lane-carrier reads in ui/scroll-area/ +
  scroll-area-kit/; the kit's jx- hits are its own chrome vars.
- **KEYED-EACH**: the chrome matrix keys modes and tiers; the toc-
  metadata sections key by name — all mounted, no LAW #18 exposure.
- **No timing claims** beyond the pins (covered by the armed-watcher
  timeline).

## Findings

1. **[NIT · receipt precision]** The dispatched "8 served rows" is 9 on
   my census (the authored radius row folds; orientation→getViewport()
   all serve). The page claims no count — this line just trues the
   ledger.
2. **[NIT · receipt precision]** The thumb-ratio digits (0.333) are
   viewport-relative; the invariant (thumb fraction == client/scroll,
   digit-exact at any geometry — mine 0.180) is the reproducible form.
   The page teaches the mechanism, not the digits — correct as written.
3. **[INFO · process]** Text-anchored element finders on multi-instance
   pages mis-grab: my first query-seat read anchored on 'line one' —
   the STATIC size={18} axes panel — and measured 18/18 across widths
   before the aria-label-anchored re-probe ('sync') verified the claim.
   Anchor instance probes on aria-label or data-testid, never on
   copy text.

## Cross-check against vellum's report 38 (read AFTER findings formed)

Full concordance: her stamp-topology receipt (one rootStyle, the kit
outside the supply set, resolveThemeScope native-only) reproduces under
my greps; her thumb-contract digits sit inside my denser trace; her pins
timeline matches my armed-watcher numbers (the appearance/hold/gone
structure; the track-fades-never-the-thumb receipt confirmed by the
post-fade opacity pair); her width/radius ladder, the concentric
anchor's 6px, the frozen-ink negative, the query seat both directions,
LAW #18's 60/12/16, and the toc == DOM all reproduce. My additions: the
data-thumb-live LOCATION (the family holder), the verdict attribute dump
(verdict-x, data-chrome, data-width alongside), the live both-direction
resize receipt, and the two receipt-precision NITs. Her attributed
svelte-check noise matches my log (the native page's canvasUsage warn —
the substring that briefly looked like my page's diagnostic).

## Gates (my run, final tree state)

| Gate | Result |
|---|---|
| docs-ambient-vocabulary solo | **284/284**, exit 0 — GREEN clean |
| verify:docs-universal | GREEN 110/110 |
| svelte-check | scroll-area.html page: **0 diagnostics** (the one substring hit is native-scroll-area.html:61 — the sibling's pre-existing canvasUsage warn); family diagnostics are the fleet's baseline classes |
| Port 5243 | lsof EMPTY before; dev server killed by PID + wrapper; EMPTY after |
| Tree | vellum's separator.html and quill's table.html files untouched — neither keyed anything I ran |

## Closure

scroll-area passes review #1 — disposition: no page changes required;
the two NITs are receipt-precision notes for the ledger, and the four
open-question flags (the kit hygiene pass, the demo-h2 question, the
theming row vocabulary, the .dark-edge watch) are concurred as recorded.
Reviewer #2 inherits a clean page with every mechanism receipted at
invariant form.

No commits made. Report file:
`agents/scribe/reports/50-review-scroll-area.md`.
