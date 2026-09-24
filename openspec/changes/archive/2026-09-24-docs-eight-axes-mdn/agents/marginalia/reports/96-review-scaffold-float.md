# T96 — FIRST REVIEW scaffold-float.html (marginalia)

**Verdict: PASS** — **0 MAJOR / 2 MINOR / 1 LOW / 0 NIT**. Tier proposal: **Tier 1**
(the page ships no live instance by design — it is a concept/law page over a 157-line
portal component; the claims are few and mostly structural, receipted by DOM ancestry
+ two-scroll geometry rather than the full eight-axis battery). Independence law kept:
findings formed from my own source reads (the 236-line page, scaffold-float.svelte 157,
defaults, website-scaffold's contract) and three probe passes on port 5244 BEFORE any
report reading; no other scaffold-float review exists — no concordance addendum.
NO commits, NO pushes. Zero family edits.

## Verified — the claim bank

**The float-plane geography at 1440w (the W-next #21 lanes, re-measured + hit-tested).**
- **Sections-nav**: `nav.jx-dsn` "docs sections" at **x0 y74, w256 h826** — the left
  256px lane under the 74px scaffold header, exactly the standing lane.
- **ToC rail**: `div.jx-toc` at **x1200 y74, 240×222**, inner `nav.jx-toc-desktop`
  "Table of contents" at **x1231 y94, 190×196** — x/y/w match the standing lane
  digit-for-digit (1231+190 = 1421; the height is page-length-dependent).
- **Hit-test**: elementFromPoint at the rail's center hits rail content (`hitInside
  true`) — no contest: the rail's lane is not covered by the nav (left) or anything
  else; the two lanes do not overlap (0+256 ≤ 1200).
- **The float slot is EMPTY on this page** (`.jx-float-slot` children ×0) — correct by
  design: the page ships **no live ScaffoldFloat instance** ("No LIVE instance here on
  purpose" — the concept card stands in), and the SSR carries zero
  `data-jx-float-content` nodes.

**"Rides the immersive slide with the header" — RECEIPTED with digits.** The real rail
(`div[data-area=toc].jx-toc`) sits inside `.jx-chrome-slot` inside **`.jx-top-layer`**
(ancestry walked: `div[data-area=toc].jx-toc ← .jx-chrome-slot ← .jx-top-layer ←
.jx-shell`). Scrolling the inner scroller (`.jx-shell-body`) by 400: the scaffold
header slides **0 → −74.7** and the rail rides it **74 → 0** — the whole top layer
moves as one; scroll back restores **0 / 74**. No second scroll listener needed — the
"by construction" claim is structurally true (the ride is one transform on the shared
plane). The canvas PlayHelp's "every component page's Combo ToC rail now rides the top
layer" is TRUE — but note the rail rides the **chrome slot** (`data-area="toc"`), not
`.jx-float-slot`; the two-slots-never-mix law (component header, portal-law list item
3) is exactly what the served DOM shows.

**Move-never-clone (portal-law section) — source-true.** scaffold-float.svelte
:128-139: `api.adopt(content, { area })` on mount, `release()` + `anchorEl?
.appendChild(content)` on teardown (the hidden anchor `[data-jx-float-anchor]` is the
return ticket) — a re-parent, never a serialization; listeners/scroll/focus/hydration
anchors survive by DOM-move semantics. The multi-node plane (adoption order) is the
scaffold's append contract.

**Portal-carrier claim (universal-props) — source-true.** The carriers are resolved in
the component's own context window (`ScaffoldFloatDefaults.resolve` — all eight axes,
ALL no-own) and stamped on the adopted wrapper (`style={rootStyle}` on
`[data-jx-float-content]`, :148-155) — self-carried across the adoption boundary where
authoring-position custom properties cannot reach. The page's summary sentence matches
the mechanism name-for-name.

**Theming "no density footprint and no tokens of its own"** — true: the component
paints nothing (no css file, no stylex surface beyond the sr/head-less wrapper);
TokenTable's two rows are structural (context key + slot). DensityDemo seat: a
stateless tint div cloned ×4 — **0 ids per clone** (the childrenScoped guard is
unnecessary here; receipted), texts identical.

**Structure/battery.** toc == DOM == rail **7/7 in order** (portal-law first — the
page's own "closing law" comment is stale prose, the order is fine); h1 ×1; duplicate
ids 0; zero dangling hashes; SSR strip-style byte-stable; no `{#each}`/`{#key}` on
page or family (LAW #18 empty); **the T94 resting-state audit: no
`:checked`/`:indeterminate`-shaped pairs exist in this family** (no css at all — the
wrapper is placement chrome); the overlay pointer law (wrapper pointer-transparent,
content opts in) is documented at source :17-24 and needs no paint receipt here.

## Findings

1. **[MINOR] The family's contract-type import is broken on the served tree.**
   scaffold-float.svelte:50 — `import type { TopLayerArea, TopLayerApi } from
   './website-scaffold.svelte'` — resolves to `ui/scaffold-float/website-scaffold.svelte`,
   which does not exist; the contract lives at **`ui/website-scaffold/website-scaffold.svelte`**
   (:104-111). svelte-check: `Error: Cannot find module './website-scaffold.svelte'
   (ts)`. It is type-only (erased at runtime — the site builds and runs; the page
   itself never imports the component), but it breaks `tsc` for any consumer who
   type-checks the family, and the byte-mirrored registry copy ships the same wrong
   path. Fix: `import type ... from '../website-scaffold/website-scaffold.svelte'`
   (or re-house the contract types) on both mirror trees. Family seat, found via this
   page's gate sweep; family standing warns (8× `state_referenced_locally` on the
   provideUniversalLanes line) untouched alongside.
2. **[MINOR] Page-scoped svelte-check is red — 1 ERROR on +page.svelte.** :61:28 — the
   cx overload (`Object.entries(style)` vs `{…} | undefined`), now the FOURTH page
   clone (popover :245, radio :112, range :153, scaffold-float :61). Same per-page
   predicate fix; the shared-util consolidation note stands (flagged to you from T95).
3. **[LOW] The api table undercounts the Props interface — `pos` is missing.** The api
   summary says "a children snippet plus one semantic role" and renders children* +
   area + the eight ambient axis rows — but the Props interface (:56-61) also carries
   **`pos`** (the nine-slot position, default 'right-bottom', stamped as
   `data-float-pos` and resolved by website-scaffold.css). A consumer reading the
   served table cannot discover the corner-placement prop. One row + one word ("two
   semantic placement props") fixes it.

**Receipt-only notes (not findings):** the a11y table's "Focus order is unaffected"
is half-true — the moved node keeps listeners/focus/scroll STATE, but its tab-sequence
position follows the new DOM home (the top layer sits after `.jx-shell-body`;
`topLayerAfterMain: true` measured). For floats (toasts, status strips) and the
self-adopting rail the impact is benign — nav-after-content is even preferable — but
the row's wording claims more than the mechanism gives; the orchestrator may want a
one-clause hedge in a later text pass. The portal-law section's "closing law" comment
(page :14-15) describes the toc-order era, not the served order — stale comment,
served order correct.

## Gates

| Gate | Result |
|---|---|
| docs-ambient-vocabulary solo (apps/www, `test/`) | GREEN — 284/284, exit 0 |
| verify:docs-universal | GREEN — 110/110 (110 markers), rc=0 |
| verify:docs (dist @ 28c6ebae) | RED — sole FAILED seat = **toast** (the recorded red); scaffold-float in the legacy backlog only, expected |
| svelte-check page-scoped | **RED — 1 ERROR (:61:28 cx overload)** (Finding 2); family diagnostic per Finding 1 in the fleet debt, now named |

## Process evidence

- Port **5244**: wrapper 99542 started for the session (/tmp/marginalia-96-wrapper.txt,
  -dev.log); after gates killed by PID; `lsof -i :5244` ×0 lines, **rc=1 — port EMPTY
  after**. No orphan probe browsers.
- NO commits, NO pushes. The inner-scroller discovery cost one probe (window.scrollBy
  no-ops — the scaffold scrolls `.jx-shell-body`); the immersive receipts re-ran on
  the real scroller with before/after/restore triads.
- Probe faults owned: my first aside finder grabbed the canvas PLAYGROUND's "Controls"
  aside (x905 y453), not the toc rail — re-located the rail by toc-class/aria + lane
  geometry; the first immersive pass read a page-level `<header>` — re-pointed to
  `.jx-scaffold-header` for the clean 0→−74.7 / 74→0 / restored triad.
- Artifacts: /tmp/marginalia-96-probe{1,2}.mjs, -ambient.log, -docs.log, -sc.log,
  -wrapper.txt, -dev.log.
