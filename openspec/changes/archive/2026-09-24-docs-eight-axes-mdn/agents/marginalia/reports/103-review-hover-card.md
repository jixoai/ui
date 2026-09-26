# T103 — hover-card (docs page) — 1st eight-axes review (marginalia)

**VERDICT: PASS — 0 MAJOR / 2 MINOR / 2 LOW / 1 NIT — Tier 2 proposed**

Legacy class (explicit-props era at 4f1cd484, no CODE report) — first audit, derived
from my own source reads + live probes; quill holds the 2nd. Page:
`apps/www/src/routes/docs/components/hover-card.html/+page.svelte` (173 lines).
Family read in full: `hover-card.svelte` (291), `hover-card.css` (46),
`hover-card.stylex.ts` (44), `hover-card-defaults.svelte.ts` (62), `index.ts` (6).

Process: port 5244 mine (pre-check rc=1, served dev, killed at end — lsof
post_rc=1, no orphans). Probes: /tmp/marginalia-103-probe1.mjs, probe2,
probe2b, probe2c, probe2d, probe3, probe3b, probe4 (log: -p3b.log, -p4.log).
Dist f85cbab1 for the lint gate. No fixes applied; findings only.

---

## 1. The intent contract — every load-bearing claim verified TRUE with clocks

The hero (page :88), canvas description (:101), PlayHelp (:123), types table
(:135-150) and a11y table (:152) claim: hover delay in, cancellable close grace,
focus opens instantly, Escape closes (global), crossings never dismiss, popover=
manual light dismiss OFF, 300ms/200ms paced, no role=tooltip, no
aria-describedby. Live receipts (real mouse/keys, in-page rAF sampler at 8ms +
event.timeStamp listeners):

| Claim | Receipt |
|---|---|
| openDelay=300 | enter→open 311 / 382 / 411ms across 3 runs (16ms-8ms sampling; dev-page main-thread jitter — brackets 300, not 0, not 500) |
| closeDelay=200 grace | panel pointerleave→close 223.4ms (probe2b); 213.7ms in the light-dismiss receipt (probe3) |
| crossing-safe (pointer) | trigger→panel crossing stays open at +450ms; `--jx-dx:0 --jx-dy:1` stamped while tracking (the "measures panel↔anchor live" claim, theming :153) |
| focus opens instantly | real Tab to trigger → open 20.2ms after Tab keydown (vs 300 hover) |
| Escape closes immediately (global) | keydown→panel boundary events at +15ms (event log, probe2c RUN B); window-level listener (source :229) |
| close grace spanned trigger AND panel | panel pointerenter cancels the armed close; focus Tab-out closes at 209ms (probe2d) |
| light dismiss stays OFF (popover=manual) | attr `popover="manual"` on all 7 panels + behavioral: outside click fired at leave+50ms did NOT hasten the close — close landed at leave+213.7ms (an `auto` popover would have closed at the click) |
| no role / no aria-describedby | null on all 7 panels (DOM census) |
| touch boundary | tap on the trigger NAVIGATES (it is a real link) — the card is hover/focus-only by design; docs claim hover/focus only, so no falsehood (recorded as verified boundary, not defect) |

## 2. Anchoring — T93 geometry receipts apply, all true

Open-panel computed reads (probe1 GEO_BOTTOM, bottom placement mid-viewport):
`position-anchor: --jx-hover-c1` (inline `anchor-name` on the trigger span, the
`--jx-hover-{id}` token claim theming :153), `position-area: bottom`, `position:
fixed`, `margin: 8px` (the `--jx-hover-gap` law), gap trigger-bottom→panel-top =
8px, `max-width: 320px` = min(88vw, 20rem) at 1440w (the panel-width token
claim), width 320, `font-size: 13px` / `line-height: 20.15px` (13 × 1.55 — the
stylex atom table's reading voice), `position-try-fallbacks: flip-block,
flip-inline, flip-block flip-inline`, `position-visibility: anchors-visible`,
`::backdrop` transparent.

**The flip ladder engages on real overflow.** The docs shell does not scroll the
window (`scrollHeight 900 = viewport, maxScrollY 0`; scrollers are inner
`DIV.jx-canvas-scroll` / `DIV.jx-shell-body`), so the trigger is window-fixed at
bottom 786 and can never approach the window edge — the apparent no-flip at
"26px overflow" (probe2d) was unreachable geometry, my probe's fault, not the
component's. Forcing real overflow (viewport 1440×820): positionArea flips
bottom→**top**, panel 648→745, flippedAbove=true, not clipped (probe3b
HC_FLIP_FORCED). Sibling differential: popover at forced overflow flips
geometrically too (panel 582→703 above the trigger, probe4) — same anchor
machinery, different property channel (`positionArea: none` there), and the
try-ladder string is identical to popover's engine default. Tooltip runs the
same machinery with different pacing (source: openDelay 0 / closeDelay 100 vs
hover-card 300/200) — same-mechanism-different-wording, as dispatched.

## 3. Universal-props / theming receipts

- Elevation own level2: default panel inline `--jx-elevation-effective: 3` +
  `--jx-elevation-shadow: var(--jx-elevation-level2-shadow)` +
  `--jx-elevation-surface: var(--jx-elevation-level2-surface)`; explicit
  `elevation="level3"` panel: `6` + level3 pair. The universal-props summary
  (:161) "level2 (3dp) … level3 (6dp)" digit-true, and the rung pairing is
  visible in the paint: body bg oklch(0.96 0 0) vs oklch(0.94 0 0).
- variant auto paints acrylic live: `backdrop-filter: blur(14px) saturate(1)
  brightness(2)` on the body — matches "'auto' (acrylic unless the environment
  asks for reduced transparency)".
- Shadow child rest pose: `oklch(1 0 0 / 0.32)` — exactly the documented
  resting value (jixoai.css :881), translate 0px 8px, `jx-rest` set, box-shadow
  none BY DESIGN (the shadow layer is a translucent wash riding --jx-p, not a
  box-shadow).
- `--jx-p` present on the open panel (0 at rest after kernel parks it); WAAPI
  carrier: all panels carry `jx-waapi` + real `data-jx-hover-shadow` child.
- Delays 300/200 in types table, PlayHelp, theming tokens — all match source
  defaults (:128-129) and the measured clocks.

## 4. Structure census

- ToC: authored +page.ts 6 entries = rail 6 links = 6 DOM sections
  (types, usage, accessibility, theming, universal-props, api), order match, no
  orphan extents (hero + canvas demo deliberately un-idd, consistent with the
  family). Painted walk 6/6 non-zero after full scroll.
- LAW #18: no `{#each}` on the page (static markup).
- LAW #19: DensityDemo quadruples the one authored @density HoverCard into
  live panels c5-c8 — all ids unique ($props.id() auto-ids), no duplicate ids
  document-wide. Auto-id census: c1, c5-c8, c9, c10 = 7 anchors / 7 panels.
- T94 pseudo-pair audit: N/A (no form controls, no :checked/:indeterminate
  surface).

## 5. Findings

**MINOR-1 — The demo's interaction script is half-false: no card on the page
contains a single focusable element.** Canvas description (page :101): "Hover
the handle, then MOVE ONTO the card — it stays. **Click the link inside it.**
Tab to the trigger: the card opens instantly and **stays while focus crosses
into it**." The live demo card (:112-115) is two `<p>` elements — no link, no
button, no focusable. Focusable census across ALL 7 panels (probe1): 0, 0, 0,
0, 0, 0, 0. Measured reality: Tab-to-trigger opens instantly (20ms), the next
Tab lands on the DensityDemo controls — focus never enters the card — and the
card closes at 209ms (probe2d FOCUS_TAB2). The component capability is real
(panel onpointerenter/onfocusin crossing-cancel, source :276-281; the POINTER
crossing works live), and the usage code block (:27-30) shows a link inside the
card — but the page's own live demo contradicts its own instruction, same
class as T93's zero-script headline (smaller scope: demo description, not the
component contract). Fix shape: put the link from the usage snippet into the
canvas demo card (and ideally one focusable into the DensityDemo/universal
cards), or rewrite the description to match what the demo actually does.

**MINOR-2 — API section false count: "Eight props" vs a 16-prop interface.**
PropsTable summary (:172): "Eight props; trigger and children are the two
required snippets" — the table lists id, children, trigger, placement,
openDelay, closeDelay, variant, class. The component's Props interface
(hover-card.svelte :75-119) also declares the eight universal axes (density,
size, shape, radius, color, theme, elevation, motion) — all live (the page's
OWN universal-props section demos `elevation="level3"` at :166, and my probes
drove elevation through the carrier stamps). T96 (api omits pos) / T102 (api
omits onValueChange/required/chrome) class, amplified here by the explicit
count claim being false. Fix shape: add the eight axis props (one-line rows,
type `Lane | QueryResult<Lane>`, default auto/own) and correct the count.

**LOW-1 — cx-overload clone, 10th page instance, now with a component twin.**
Page +page.svelte:48-60, the identical page-local cx helper
(`Object.entries(style)` rejects `{…} | undefined`; `filter(Boolean)` doesn't
narrow) — svelte-check: 1 error at :56:28. NEW: the hover-card COMPONENT
carries the same clone with the same red at hover-card.svelte:69:28 (the
prior nine pages' clones were page-local only). Gate to 0 = transfer's
type-predicate fix in both seats; the shared-util consolidation flag stands
(now 10 pages + at least this component).

**LOW-2 — component focusout handlers pass `EventTarget | null` where
`inside()` takes `Node | null`** (hover-card.svelte :246 and :280,
`e.relatedTarget` vs the `Node | null` signature). svelte-check reports both
as ts Errors. Type-only in practice — the focus-out crossing ran clean live
(209ms close, no exception; focusout relatedTarget is always a Node or null)
— but it is a genuine red in the family's own files and the crossing-detection
seam that MINOR-1's claim rests on. Fix shape: `e.relatedTarget instanceof
Node ? e.relatedTarget : null`, or widen `inside()` to `EventTarget | null`.

**NIT-1 — touch boundary (recorded, not a defect):** tap on the trigger link
navigates immediately (pointerenter arms the 300ms timer, the click follows
the link first); the card has no touch affordance. The docs model hover/focus
only and never claim touch support, so nothing is false — noted because the
dispatch asked for the degeneration arm and this is its measured shape.

## 6. Triage honesty note

173-line page, full battery — no section got a light touch. All 7 live panels
censused; clocks taken on the canvas demo instance (c1); elevation digits on
c9/c10; density instance opened (c5, 13px/320px/bottom). Non-bottom placements
(top/left/right) are prop-real (source :82, area derivation :167-172) but not
demoed on the page — verified at the source level only. The @supports
viewport-center fallback (hover-card.css :33-42) is dead code in this Chrome
(anchor positioning supported) — read, not exercised.

## 7. Probe-fault ownership (my artifacts, not the page's)

- First hover-open clock (514.9ms) used a pre-move node timestamp — replaced
  with event.timeStamp listener marks (311-411ms band).
- Two false "self-close before Escape" reads: my re-hover without leave-first
  (pointer resting on the trigger never re-fires pointerenter → no open) and a
  stale sampler read. The self-close hypothesis (transparent ::backdrop
  stealing hit-tests) was tested and KILLED: 900ms hold-still with pointer on
  trigger stays open; elementFromPoint at the cursor returns the anchor while
  open (probe2c RUN A).
- The no-flip at "viewport-bottom trigger" was my instrument: the docs shell
  scrolls inner containers (window maxScrollY 0), so the trigger cannot reach
  the window edge; forced-overflow via viewport resize is the valid instrument
  and the ladder flips correctly.
- verify:docs rc=1 sole red = `toast: skeleton: Examples renders before
  Usage` — pre-existing, seat-attributed away from hover-card (f85cbab1
  standing record).

## 8. Gate record

- ambient solo: `npx vitest run test/docs-ambient-vocabulary.spec.ts` →
  284/284, rc=0 (known vite-teardown nuisance note).
- `npm run verify:docs-universal` → GREEN 110/110, rc=0.
- page-scoped svelte-check: page 1 error (:56 cx clone); family component 3
  errors (:69 cx twin, :246/:280 relatedTarget) — all reported above, none
  self-fixed.
- `npm run verify:docs` (dist f85cbab1) → rc=1, sole red toast (pre-existing).
- Server killed: lsof :5244 empty (post_rc=1), no orphan processes.
