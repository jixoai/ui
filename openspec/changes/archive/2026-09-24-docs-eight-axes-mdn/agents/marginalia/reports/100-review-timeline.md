# T100 — FIRST REVIEW timeline.html (marginalia)

**Verdict: PASS** — **0 MAJOR / 1 MINOR / 1 LOW / 1 NIT**. Tier proposal: **Tier 2**
(the campaign's largest page — 1562 lines, 17 sections, 42 timeline hosts, 129 items —
audited at claim density: the value contract and the geometry tour got digit receipts,
the twelve-family gallery got the full arithmetic census plus spot geometry). Independence
law kept: findings formed from my own source reads (the page in four passes, timeline.svelte
422, timeline-item, the spine engine's exports, css) and two probe passes on port 5244
BEFORE any report reading; no other timeline review exists. NO commits, NO pushes. Zero
family edits.

**Triage honesty note (per the dispatch):** full-depth treatment went to the value
contract (every host's completed/pending arithmetic + two stroke-fraction digit reads),
the node 9-grid (all eight slot compass positions), directions (content-x fractions),
the matrix (12 cells + the RTL run direction), the animation seats (computed timelines +
the scroll-draw sampled), and the density ladder. The twelve reui-family galleries got
the arithmetic census + wiring receipts but NOT per-family paint walks (badge variants,
avatar initials render, icon tints are spot-cited from the DOM census only). No other
section was skipped.

## Verified — the claim bank

**The value contract — exact across all 42 hosts.** Every timeline's
completed/pending signature measured against its authored value: basic `1100`/pending
last (defaultValue 2, 4 items), roadmap `11000` with item-3 pending (value 2.5),
order `1100` (2.4 — item 3 not reached), milestones/git `1110`, pipeline `1100` with
the spinner stage pending at position 3, vertical `1100` at sm, leading `1110`,
compact `11000` at sm, directions/matrix `100` (defaultValue 1), value-stepper
`100000` at seed 1. **Decimals first-class**: the canvas at value 2.5 completes
items 1–2 and leaves 3; at 1.5 completes item 1 ONLY (`100`).

**The drawn spine — measured geometry, digit-exact stroke math.** Canvas spine: the
SVG path is `M 30 40 L 30 120.75 L 30 201.5` and the dot rects' centers measure
**[30,40] [30,120.8] [30,201.5]** — the drawn path IS the live geometry. The progress
stroke at value 2.5: dasharray 161.5, dashoffset 40.375 → drawn **121.125px = 75%** =
exactly halfway between nodes 2 and 3 (80.75 + 80.75/2); at value 1.5 the fraction
reads **0.25** — halfway between nodes 1 and 2. The 300ms dashoffset transition
computed (`0.3s`), the dot mask rides (mask attr `jx-tl-dot-mask-…`, per-instance id).

**Node 9-grid — the compass receipt.** All eight authored slots land in their cells
relative to the dot: bsIs (−22,−41) · bs (0,−41) · bsIe (+22,−41) top row; is (−29,−4)
left · ie (+29,−4) right; beIs (−22,+23) · be (0,+35) · beIe (+22,+23) bottom row.

**Direction — rect receipts.** Content-x fraction of the host width: ltr **0.54**,
revert **0.46** (mirrored), interlaced **[0.77, 0.23, 0.77]** (alternating item by
item) — the zones-are-grid-tracks claim measured.

**The geometry matrix — 12 cells, RTL runs right-to-left.** All variants present in
order (v-ltr … v-revert-rtl) with their `data-variant` hooks; the **h-ltr-rtl** cell's
dot lefts measure **[1005, 867, 722]** — descending, i.e. the RTL horizontal run draws
right-to-left with zero mirror branches, exactly the coordinate-transform claim.

**Animation — scroll-driven CSS receipts.** view seat: item animation-name
**`jx-tl-rise`**, animation-timeline **`view()`**, range `entry entry 60%`. scroll
seat: the progress path's **inline dashoffset is ABSENT** (the scroller owns the
stroke channel — the value-driven inline value not painted, the frozen interplay
verbatim) and the computed `animation-timeline: scroll()` draws with the box:
**dashoffset 348px at scrollTop 0 → 0px at the bottom** (the sampled-value clock
receipt, dasharray "348 348").

**Reduced motion — transition dropped, position stays.** `reducedMotion: reduce`:
the progress transition computes **0s** with the dashoffset value intact.

**The floor / no-JS posture.** SSR ships `data-jx-spine="floor"` ×42 and **129 floor
lines** (every item carries `[data-jx-tl-line]`); the SVG layer is present but the
drawn mode only flips on hydration (all 42 hosts measure `data-jx-spine="drawn"` in
the live DOM) — "no-JS CSS floor that upgrades on hydration" receipts end to end.
`data-completed` is absent from SSR attributes (the discrete paint needs the hydrated
position) — the 10 raw-text occurrences are the a11y table's and prose's own words.

**Density.** The explicit xs/default/lg scopes measure dot **16/20/24px**, title
11/13/15px — "the whole ruler steps down" (the vertical demo runs density sm).
TimelineTitle renders a **P** element — no heading-clone class in the density demo
(the T97 lesson noted, clean here).

**LAW #18 — 19 each-blocks censused.** 18 keyed with unique composite-safe keys
(iso ×5, title/label/stop/phase/id ×8, `i` ×2, the geometry snippet's composite
`${node.x}-${node.y}`), ONE unkeyed — the view demo's `['alpha','beta','rc','ga'] as
phase` at :1527, the unkeyed twin of :775's KEYED identical list (NIT 1). The
steps-99 content-key hazard does NOT recur (no list keys by display string that can
repeat — titles/labels are unique per list).

**T94 audit.** The family's state paint is all attribute-keyed
(`data-jx-tl-pending`, `data-completed`, `data-jx-step-*`) + the
`.jx-out`-style reveal pair — no `:checked`/`:indeterminate`-shaped pair.

## Findings

1. **[MINOR] Page-scoped svelte-check is red — 2 ERRORS on +page.svelte.** :80:28 —
   the cx overload (the SEVENTH page clone; popover/radio/range/scaffold-float/
   section-card/steps precede). :1544:403 — a NEW class: the TokenTable row for
   `--jx-tl-stroke-w` passes `source: "stroke-alignment law (r5): …"` but the
   TokenTable types `source` as the closed union `"density" | "color" | "component" |
   "structural"` — the row renders, the type rejects the string. Fix: `"component"` +
   move the law note into the description (or widen the union if the fleet wants
   free-text sources). Family standing warns (timeline.svelte :206 provideUniversalLanes
   trio) pre-existing, untouched.
2. **[LOW] The beam gradient's SHARED def id collides when vertical + horizontal beams
   coexist.** Both axis branches emit `<linearGradient id="jx-tl-beam-grad">`
   (timeline.svelte :369/:375) — the objectBoundingBox-units argument ("one shared def
   id serves every instance identically") holds per axis but the id is not
   axis-keyed: a page rendering one vertical and one horizontal beam carries TWO
   defs with one id, and the horizontal beam references the first (vertical) gradient
   — the traveling light's axis would be wrong. Latent (this page hosts one beam);
   the dot MASK right beside it does it right (`jx-tl-dot-mask-${uid}`, the SMIL
   namespacing law). Fix: axis-suffix the id like the mask.
3. **[NIT] The view demo's each is the unkeyed twin of its own scroll demo.**
   :1527 `['alpha','beta','rc','ga'] as phase` (unkeyed) vs :775's identical list
   keyed `(phase)`. Static literal list — behaviorally identical — but the LAW #18
   hygiene should read the same on both seats of the same page.

**Receipt-only notes (not findings):** the api table (13 rows: defaultValue, value,
onValueChange, step, axis, direction, animation, spine, density, pending, variant,
class) is the campaign's most complete — no omission class this time; the duplicate-
step dev-warn channel (steps must ascend strictly, later item owns the milestone) is
source-receipted (timeline.svelte :227-247) with no served seat exercising it — the
T98 NIT class, noted for the same future-seat list; the a11y claims (ol semantics
surviving list-none, spine pointer-transparent, cutout slots readable) verified at
the DOM level (ol[role=list], svg[aria-hidden], the blockStart texts in the
accessibility tree).

## Gates

| Gate | Result |
|---|---|
| docs-ambient-vocabulary solo (apps/www, `test/`) | GREEN — 284/284, exit 0 |
| verify:docs-universal | GREEN — 110/110 (110 markers), rc=0 |
| verify:docs (dist @ 09f15696) | RED — sole FAILED seat = **toast** (the recorded red); timeline in the legacy backlog only, expected |
| svelte-check page-scoped | **RED — 2 ERRORS (:80:28 cx clone; :1544:403 TokenTable source union)** (Finding 1) |

## Process evidence

- Port **5244**: wrapper 43580 started for the session (/tmp/marginalia-100-wrapper.txt,
  -dev.log); after gates killed by PID; `lsof -i :5244` ×0 lines, **rc=1 — port EMPTY
  after**. No orphan probe browsers.
- NO commits, NO pushes. Stepper state reset after the tween probe; the canvas value
  returned via reset; the scroll box restored to scrollTop 0 in-probe.
- Probe faults owned: my first `[data-variant]` matrix census collected the DOTS'
  variant attributes too (TimelineDot emits its own `data-variant` corner grammar —
  the attribute is shared by two components) — re-read the cells by the wrapper hook;
  the first node-grid finder matched nothing (TimelineDot renders no
  `[data-jx-tl-dot]` hook — the slots are plain spans) — re-pointed at the label texts
  themselves; the SSR `data-completed` needle counted prose text (10 hits) before the
  attribute-form check confirmed the floor posture.
- Artifacts: /tmp/marginalia-100-probe{1,2}.mjs, -ambient.log, -docs.log, -sc.log,
  -wrapper.txt, -dev.log.
