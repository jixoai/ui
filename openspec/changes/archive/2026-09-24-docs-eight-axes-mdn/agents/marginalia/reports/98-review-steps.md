# T98 — FIRST REVIEW steps.html (marginalia)

**Verdict: PASS** — **0 MAJOR / 1 MINOR / 1 LOW / 1 NIT**. Tier proposal: **Tier 2**
(a state-machine surface with a nine-word vocabulary: every state needed its own
paint/AT/geometry receipt, the stepper contract needed real clicks in both directions
plus the focus law, and the dispatch's recorded svelte-check ERROR demanded
adjudication against the live fleet run). Independence law kept: findings formed from
my own source reads (the 350-line page, steps.svelte/steps-item/steps-indicator, css)
and two probe passes on port 5244 BEFORE any report reading; no other steps review
exists — no concordance addendum. NO commits, NO pushes. Zero family edits.

## Verified — the claim bank (real clicks, digit receipts)

**The stepper contract — both directions, real clicks.**
- **Go-back click (the C-16 focus law)**: clicking the done step's ✓ button at
  current=1 → states `[current, todo, todo]`, aria-current moves to item 0, the output
  readout flips to "current 0", **the button unmounts** (item 0 becomes current ⇒ span
  form), and **focus rests on the item** (`activeIsItem: true`, the li's tabindex=-1
  slot) — never on body. The a11y table's row reproduces exactly.
- **Segmented drives both directions**: current=2 → `[done, done, current]` — BOTH done
  steps render the button form (two coexisting go-back markers, aria-labels
  "completed: … — go back"), aria-current lands on item 2; current=0 → `[current, todo,
  todo]`. The output readout tracks every move.
- **Future steps inert**: the todo indicator is a `SPAN[aria-hidden]` (probe1: forms
  SPAN), click does nothing — "future steps stay inert spans, never aria-disabled".
- **The no-dead-affordance law**: the Indicator renders BUTTON only when the item is
  done AND carries onclick (probe1: item 0 BUTTON with the aria-label, items 1-2 SPAN).

**The nine-word state vocabulary — every word painted AND spoken.** The gallery rows
carry `data-jx-step` ∈ {done, current, pending, success, error, hint, emphasis,
disabled, todo} ×1 each, all measured:

| state | border | ground | glyph | sr-only text |
|---|---|---|---|---|
| done | solid, primary | primary fill | ✓ | completed |
| current | solid, primary | primary fill | 2 | current step (aria-current=step) |
| pending | solid, primary | hollow | ⋯ (anim `jx-step-breathe 1.4s infinite` — the breathing receipt) | in progress |
| success | solid | success green oklch(0.62 0.19 145) | ✓ | succeeded |
| error | solid | error red oklch(0.6 0.2 25) | ✕ | failed |
| hint | solid | info blue oklch(0.62 0.16 245) | i | information |
| emphasis | solid | hollow + **halo** (double ring box-shadow) | ! | attention |
| disabled | **dashed** | hollow, ink at **oklab(0 0 0 / 0.6)** vs todo's full oklch(0 0 0) — the reduced-contrast digit receipt | 2 | unavailable |
| todo | solid | hollow, full contrast | 3 | not started |

The C-6 ruling verified per item: every li's first span is the sr-only status text
(absolute/1px clip), the vocabulary reaches AT as words; the marker glyphs are
aria-hidden chrome. The V2-6 shape separation is real paint (solid vs hollow vs
dashed vs halo), not glyph-only.

**LAW #18 (the keyed-each habitat).** The page's one each block keys `(step)` over
[0,1,2]; the family itself registers nothing (explicit ordinals ARE the law —
"duplicates paint every match current, gaps paint none" is true by comparison
construction, steps-item :128-130). 24 served items, states exactly as authored.

**Connector lane + separator self-hide.** The separator rides its own tail cell:
item 0's separator rect does NOT intersect its title rect (`overlapsTitle: false`) —
"the connector never strikes the labels" holds; the LAST item's separator measures
`display: none, 0×0` — the css self-hide receipt.

**Geometry.** Indicator 16/20/24px across the explicit xs/default/lg scopes (the
--jx-icon ladder), title voice 11/13/15px; the size axis scales the ordered list
(size 18 → root `ol` font 18px); density="small" stamps sm. StepsTitle is a SPAN —
**no heading-clone pollution in the density demo** (the T97 class does not recur;
noted per the dispatch, not filed).

**Structure/battery.** toc == DOM == rail (7 authored entries; see LOW 1 for the
unlisted 8th section); h1 ×1; duplicate ids 0; SSR strip-style byte-stable (24 items,
8 aria-current, sr texts in raw HTML). **T94 pseudo-class audit**: steps.css keys on
`[data-jx-step='…']` attribute states + `:hover`/`:focus-visible`/`:last-child` — no
`:checked`/`:indeterminate`-shaped pair; `:last-child` (the separator self-hide)
matches only the intended resting node.

## The dispatch's "always-true condition" — ADJUDICATED

The live fleet run carries **no always-true error in the steps family**. The three
"condition will always return true" ERRORs in today's svelte-check belong to
**badge-indicator.svelte:161 and float-button.svelte:257/258** (other families, other
lanes — the record likely predates a consolidation or blurred a lane boundary).
The steps family's ACTUAL current diagnostics, all typing-level and runtime-benign —
and runtime-benign is proven by the state table above (all nine states paint, speak,
and compare correctly):

- steps.svelte:119 + steps-item.svelte:118 — the cx overload (the five-page clone
  class; see MINOR 1).
- steps-item.svelte:128 — `'derived' implicitly has type 'any'` (circularity through
  the $derived initializer; a one-line type annotation closes it).
- steps.svelte:134 — 8× `state_referenced_locally` warns (the provideUniversalLanes
  capture — the known family class, intentional capture).

## Findings

1. **[MINOR] Page-scoped svelte-check is red — 1 ERROR on +page.svelte.** :211:28 —
   the cx overload (`Object.entries(style)` vs `{…} | undefined`), the SIXTH page
   clone (popover :245, radio :112, range :153, scaffold-float :61, section-card
   :121, steps :211). The shared-util consolidation remains the actual fix.
2. **[LOW] The demo section is an orphan ToC extent.** `#steps-demo` carries
   `data-family="steps-demo" data-region="steps-demo"` (fully wired for the
   toc-engine) but is absent from the authored +page.ts toc — the rail starts at
   `states`. Every other audited page leaves its canvas unwired (no id, no
   family/region); this page wired the extent and then didn't list it — the
   toc-engine sees a family extent with no rail entry. Either add the rail entry or
   drop the wiring attributes to match the fleet's canvas convention.
3. **[NIT] The PlayHelp's duplicates/gaps claim has no seat.** "duplicates paint every
   match current, gaps paint none — nothing to corrupt" is the family's best
   self-description and is source-true (pure comparison, steps-item :128), but no
   served seat demonstrates either shape (all seats use 0,1,2). One duplicate-ordinal
   demo row would let the claim carry its own receipt.

**Receipt-only notes (not findings):** the api table (Steps.current bind, StepsItem.step
required, state, label, onclick, class + 8 axes) covers the family surface without a
gap — no T96/97-style omission. The `disabled` state's reduced contrast rides the
border-color alpha (0.6 vs 1.0), not element opacity (li opacity 1 measured) — the
claim's wording ("reduced contrast") matches the mechanism.

## Gates

| Gate | Result |
|---|---|
| docs-ambient-vocabulary solo (apps/www, `test/`) | GREEN — 284/284, exit 0 |
| verify:docs-universal | GREEN — 110/110 (110 markers), rc=0 |
| verify:docs (dist @ b79dc7fe) | RED — sole FAILED seat = **toast** (the recorded red); steps in the legacy backlog only, expected |
| svelte-check page-scoped | **RED — 1 ERROR (:211:28 cx overload)** (Finding 1); family diagnostics per the adjudication above |

## Process evidence

- Port **5244**: wrapper 20352 started for the session (/tmp/marginalia-98-wrapper.txt,
  -dev.log); after gates killed by PID; `lsof -i :5244` ×0 lines, **rc=1 — port EMPTY
  after**. No orphan probe browsers.
- NO commits, NO pushes. Playground state returned to current=1 after the both-
  direction drive; no DOM mutations outlived a probe.
- Probe faults owned: my first sr-only finder used the class name (`span.sr-only`) —
  stylex hashes the atom class, so every sr read came back null until I re-pointed at
  the li's first span child (the T97 zones-carried-padding lesson: read the carrier
  the design names, not the name the prose uses); the first breathing read targeted
  the indicator element — the animation lives on the inner `[data-jx-step-index]` span.
- Artifacts: /tmp/marginalia-98-probe{1,2}.mjs, -ambient.log, -docs.log, -sc.log,
  -wrapper.txt, -dev.log.
