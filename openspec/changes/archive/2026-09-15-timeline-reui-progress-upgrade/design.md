# Design — timeline reui upgrade + scroll-area chrome params + fill basis

Three work streams (W1 fill basis · W2 scroll-area chrome · W3/W4
timeline + docs). The decision record per stream; the verification
math lives with the tasks.

## W1 — the fill auto basis: the scope's canvas token

**The correction.** W1-r1's law resolved auto fill from the *measured*
nearest opaque ancestor background. The Owner's r2 ruling: auto rides
the SAME basis as text/border — the **theme scope** — and a decorative
opaque band (the effects gallery's dark `glass-band`) is not the
fill's context. component-canvas's light/dark switching is by design;
shimmer/rainbow follow the scope, period.

**The resolver.** `contextCanvasCss(host)`:

1. Walk the host's ancestor chain (self included) for the nearest
   theme scope — the same predicate `contextIsDark` uses
   (`[data-theme="light"|"dark"]`, `.dark`, `.jx-light`).
2. Read that scope element's computed `--background` token. ALPHA
   PRE-PASS on the RAW token string: a slash-alpha segment
   (`oklch(… / 0.5)`, `rgb(… / 50%)`, `… / none`) is extracted by
   regex BEFORE any parser sees it — color-utils' `parseColor`
   DISCARDS oklch alpha (registry/files/lib/color-utils.ts:203), so
   opacity is judged on the raw string: alpha absent, `/ 1`, or
   `/ 100%` → proceed; `/ none`, alpha < 1, or an UNPARSABLE alpha
   string → the fallback ladder (conservative).
3. Parse the (alpha-stripped) token to RGB via `@jixoai/color-utils`
   (`parseColor` — hex/rgb()/hsl()/`oklch(…)` — feeding
   `oklchToRgb`): this site's tokens are oklch strings, and the
   runtime's own canvas-fillStyle normalization does NOT convert
   them (Chrome returns oklch verbatim — lab-verified 2026-09-15),
   so the local parser cannot read them; color-utils joins
   press-button's registryDependencies (the established channel).
   Parsed → that is the canvas.
4. Fallback ladder: unparsable token →
   `contextIsDark(host) ? '#000000' : '#ffffff'`. An entirely
   unscoped chain reads the ROOT element's token FIRST (Gate-1 r1
   freeze: on jixoai pages `:root` always carries `--background`
   (jixoai.css:32) — the root token IS the text/border basis, so it
   is the fill's basis too; the OS scheme does NOT enter the color
   path). White/black by `contextIsDark` is the TERMINAL fallback —
   it fires only on non-token pages (no `--background` anywhere),
   where `contextIsDark` itself has fallen to the OS scheme.

`resolveFill(undefined)` switches to it; `solidFill`'s default base
switches to the HOSTLESS form `contextCanvasCss()` — the API stays
`solidFill(color, base?)` with NO host parameter (call-time minting,
often pre-mount: the hostless walk starts at the document root's
token, the same ladder; no document → the white/black fallback by
`contextIsDark`). `contextBaseCss` (the measured walk) RETIRES — its
export deletes if no other consumer survives (ledger-recorded; the
W1 probe is the known consumer and is rewritten).

**The observer is untouched in shape** (class + `data-theme`
attributeFilter, root childList reparent channel): a live scope flip
re-resolves through the same walk — the re-resolve now re-reads the
new scope's token instead of re-measuring backgrounds.

**Why the token and not a measurement.** Text and border read the
scope's tokens; the fill sitting next to them must step with the
theme, not with whatever opaque artwork the page stacks behind the
host. The measurement answered "what is physically behind" — the
wrong question for a themed surface.

## W2 — scroll-area chrome: radius 0, width tiers, flush, edge anchor

**Radius.** `--jx-scroll-thumb-radius` (default `0px`) replaces the
hard `calc(infinity * 1px)`. Prop `radius?: number | 'full'` on the
component (number → px, `'full'` → the capsule), stamped as the CSS
var on the region. Default look changes: square-cut thumb.

**Width tiers.** Prop `width?: 'auto' | 'thin' | 'wide'` (default
`'auto'`), stamped `data-width` on the region; the sheet paints
`--jx-scroll-track-w` per tier: `thin` 8px · `auto` 12px (today) ·
`wide` 16px. The thumb's resting cross size = track − 2×2px (4/8/12)
— BOTH flanks carry the 2px resting inset. `none` stays native-only
(a hand-drawn scrollbar that draws nothing is the platform tier —
not this component's vocabulary); `wide` is a DELIBERATE extension
beyond the native trio (auto | thin | none) — the hand-drawn chrome
owns its paint and a wider drawn tier is in-vocabulary by design.

**Flush track, edge-anchored thumb — the `transform-origin: right
center` law.** The 2px edge standoff retires from the TRACK (an
invisible lane — nothing paints there): the y track pins
`inset-inline-end: 0` (block stretch flush: `inset-block: 0`), the x
track `inset-block-end: 0` + `inset-inline: 0`. The THUMB keeps its
OUTER (edge-side) flank at the resting 2px inset inside the flush
track and grows ONLY into the content:

- y track (inline-end): thumb `inset-inline-end: 2px` — the
  edge-side flank coordinate NEVER moves; the resting
  `inset-inline-start: 2px` narrows to `0` on hover/drag → the thumb
  widens strictly leftward, +2px (in RTL, `inline-end` is the left
  edge — logical properties mirror the anchor for free).
- x track (block-end): `inset-block-end: 2px` pinned; the resting
  `inset-block-start: 2px` narrows to `0`.

Resting widths stay 4/8/12 across tiers; hover/drag widths are
6/10/14 (growth is always exactly +2px inward). The Owner's mental
model is `transform-origin: right center`; we carry it as an INSET
ANCHOR because a literal `scaleX()` transform would scale-distort a
configured radius (a first-class prop this round) and blur the 1px
grid alignment. The invariant the probe pins: under hover, the
thumb's edge-side flank coordinate is UNCHANGED (to the device
pixel) while the cross size grows strictly inward and the region
boundary is never crossed.

**Adapter**: untouched except stamping `data-width` alongside the
existing region attributes. All look-math stays in the sheet.

## W3 — timeline: the reui contract, then the fractional path

### The value contract (reui parity)

```
Timeline:  defaultValue?: number = 1    // uncontrolled seed
           value?: number              // controlled (overrides)
           onValueChange?: (v: number) => void
TimelineItem: step?: number            // default: DOM order + 1
```

Decimals are first-class (no rounding anywhere). `data-completed`
paints on the item when `step <= current` — attribute paint (the
`pending` precedent): dots fill, titles step to full ink, times step
to muted, per reui's completed grammar. The internal state is one
`$state` number; controlled input wins read-side, every change fires
`onValueChange` (reui's exact semantics, Svelte-shaped).

**Pending × completed precedence** (frozen, Gate-1 r1): `pending`
(the in-flight flag) WINS the paint — a pending item renders its
hollow dot + muted title even when `step <= current`; the states are
orthogonal channels, pending is simply the louder one.

**Step constraints** (frozen; the Gate-2 r1 close extends the
normalization to INVERSIONS): steps must be strictly ascending in
DOM order; the default (`DOM order + 1`) guarantees it for authors
who never mention `step`. VIOLATIONS normalize through the MILESTONE
TABLE: the stops table is built over DEDUPED steps (each mapping to
its OWNING node — the later one on a duplicate), SORTED to ascending
step order, then MONOTONE-CLAMPED — each stop's arc lifts to the
running max, so an authored inversion like [3,1,2] dev-warns (naming
the sequence) and still yields a WEAKLY-MONOTONE, total value→arc
map (the inverted milestone rides the highest arc reached; the r2
un-clamped table retracted mid-range — the exact bug the monotone
sweep test pins); `pathLength` is the
polyline's TRUE cumulative total (the last DOM node's arc — identical
to `stops.at(-1).arc` under the contract), so an inversion keeps the
honest full-run denominator; a value at/above the last step ends the
stroke at the path's true end. This also
answers the first-node duplicate: steps (1, 1, 2) yield stops
[(1, arc(node2)), (2, arc(node3))] — `value = 1` draws to node 2
(the milestone's owner), NOT zero-length (zero-length at the first
step holds on the unique-step ladder, the default); a value below
the first milestone clamps to 0. Probe-pinned on a (1,1,2) fixture.

### The progress stroke (beyond reui — the svg-path-ani)

The whole-list path already runs first-node-center → last through
every node center. The geometry payload gains a STOPS table:

```
stops: { step: number; arc: number }[]   // the DEDUPED milestone table
// arc = the milestone's OWNING node's cumulative polyline length
// (sum of per-segment euclidean lengths — NOT the first→last chord).
// stops[0].arc = 0 on the unique-first-step ladder (the default
// DOM+1 case); it is NON-ZERO only when the first step duplicates
// (the owner is then a later node — see the duplicate protocol).
// pathLength = stops.at(-1).arc.
// len(value): value < stops[0].step → 0; value = stops[0].step →
//   stops[0].arc (the jump is inherent to duplicate-first ladders);
//   between bracketing milestones → the step-space interpolation;
//   value ≥ the last milestone → pathLength.
```

This ALSO fixes the standing chord bug: today's `runLength`
(timeline-spine.svelte.ts:145) is the first↔last chord, wrong for
dasharray math on non-collinear nodes (interlaced, horizontal
curves) — the scroll-progress stroke and the beam dasharray BOTH
switch to the cumulative `pathLength`.

The value maps through STEP SPACE (never array indices):

```
k   = min(value, stops.at(-1).step)        // clamp the TOP only
len = value < stops[0].step
        ? 0                                 // sub-first → nothing drawn
        : k === stops[0].step
            ? stops[0].arc                  // the first milestone's owner
            : a.arc + (k − a.step)/(b.step − a.step) × (b.arc − a.arc)
            // (a, b) = the bracketing stops pair (a.step < k ≤ b.step)
stroke-dasharray = pathLength; stroke-dashoffset = pathLength − len
```

`value = first step` → the stroke tip sits at the first milestone's
OWNING node — node 1 with zero length on the unique-first-step
ladder (the default; nothing beyond it is completed — reui's
discrete grammar agrees), the later owner node on a duplicated first
step; `1.5` on the
default 1,2,3… ladder → the 1→2 connector half-drawn; a fractional
value inside a DECLARED gap (steps 2 and 5, value 3.5) interpolates
across that gap's arc — the path is the truth, the steps are its
milestones. `value = last step` → the full run. The stroke paints
whenever a value contract exists (default included) — the spine's
third channel (base · preset paint · progress).

**Animation**: `transition: stroke-dashoffset 300ms ease` on the
progress path (reduced motion: none). Tweening `value` (rAF, a CSS
transition on a bound var, or a scroll-linked driver) draws the spine
smoothly — the "方便做动画" the decimals exist for.

**Interplay** (frozen): `animation: 'scroll'` owns the stroke channel
— the value-driven inline dashoffset is NOT PAINTED AT ALL under
scroll mode (no reliance on CSS-animation-over-inline accidents; the
scroller's animation drives the same `pathLength`), while the value
contract still drives discrete completion. `animation: 'view'`
(per-item entrance) composes with either.

### The parts

- `TimelineHeader` (new file): the plain wrapper (reui parity),
  zero paint of its own beyond spacing.
- `TimelineDot` accepts `children` rendered INSIDE the node (the reui
  indicator-icon pattern) — the node grows its box when carrying
  content (CSS: content centers, min size keeps); the 8 directional
  slots and `variant` grammar are untouched (our highlight, kept).
- `TimelineTime` ≈ reui's `TimelineDate` (already a `<time>`); the
  docs note the mapping.
- Keepers kept verbatim: presets + custom `spine` snippet (geometry
  payload grows the stops table — additive), no-JS floor + hydration
  upgrade, RTL (arc math is coordinate-space, unaffected), density,
  `pending`.

### Registry surface

New file `timeline-header.svelte` joins the item; `registry.json`
gains the value-contract + radius/width props on their items; the
mirror syncs both directions; payload parity tests extend.

## W4 — the docs

**timeline.html — the TWELVE official reui families + our four**
(the page's registry data lists exactly twelve free items,
`c-timeline-1..12` — the r1 "two PRO-gated" claim was wrong and is
retracted; inventory frozen in research/reui-family-inventory.md):

The official twelve, ONE docs stage per family (the inventory's
mapping table pins each stage's aria-label; the short names below
are DISPLAY ALIASES — the official full titles are the inventory's
source of truth; the controlled stepper folds into OUR block below
— reui's demos show no stepper; it was an r1 invention):

Basic · roadmap · order status · git activity · milestones ·
pipeline steps · roadmap items · vertical · horizontal with leading
labels · deployment log · activity feed with user avatars · compact
horizontal milestone.

Ours (the highlights): the 8-directional slots matrix · spine
presets · the custom geometry snippet · the decimal-progress tween +
controlled stepper (play/pause tweening `value` 1 → N through
1.5-style mid-states; next/prev/reset/random buttons driving the
value contract).

Every demo lives in the canvas-stage skeleton (docs lint). The props
table carries the new contract.

**scroll-area.html**: a radius/width configuration demo (the tier ×
radius matrix). **effects/press-button**: fill-channel copy updated
to the scope-token basis.

## Verification sketch (the acceptance math)

- **W1 probe (rewritten)**: light stage + dark opaque band + OS dark
  → fill = the stage scope's token (light); dark scope → dark;
  unscoped → root token → OS fallback; live class/attr flip
  re-resolves; rainbow rides the same battery.
- **W2 probe**: computed `border-radius: 0px` default; configured px
  and `'full'` paint; tier widths measure (8/12/16 track; 4/8/12
  thumb resting); track flush (`inset-*-end: 0` computed); hover
  growth — edge flank coordinate unchanged ±0 device px, cross size
  +2px inward; drag pin holds the widened state; idle fade + pins
  re-asserted unchanged.
- **W3 unit**: uncontrolled/controlled/decimal semantics;
  `data-completed` thresholds (1.5 → item 1 on, item 2 off); arc
  math at 1/1.5/last; transition present, reduced-motion none.
- **W3 probe**: at `value={1.5}` the stroke tip lands at the
  node1→node2 midpoint (path-length sampling, ±1px); tween animates
  the dashoffset (two-frame delta > 0); scroll mode still owns the
  stroke under `animation='scroll'`.
- **Docs**: structure lint green on the upgraded pages; payload
  parity; mirror byte-equal; the standing battery (standards, deps,
  stylex payload, registry payload).

## Subagent split

A1 W1 (runtime + probe + copy) · A2 W2 (sheet + prop + probe + docs
demo) · A3 W3 core (family code + unit + probe) · A4 W4 timeline docs
(after A3's API lands) · A5 closure (registry/mirror/payload/tests
integration — the orchestrator). A1 ∥ A2 ∥ A3; A4 after A3; A5 last.
