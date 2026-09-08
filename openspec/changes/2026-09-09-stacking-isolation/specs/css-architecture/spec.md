# css-architecture — spec delta (MODIFIED)

## MODIFIED Requirements

### Requirement: grid supplies stacking; position is for transient ink (Owner law, 2026-09-01; isolation clause 2026-09-09)

Overlay and layer stacking SHALL be expressed by grid placement —
one-cell hosts with `grid-area: 1/1` siblings and `z-index` for
order (the tabs host: the run base, the veil layer, the chevron
buttons; the carousel window: track + arrows; the top layer's named
areas) — never by `position: absolute/sticky` for LAYOUT.
`position: absolute` remains legal only for these CATEGORIES (each
USE carries a site comment naming its category — the exemption list
is open by category, closed by un-annotated use):

- TRANSIENT INK — effect pseudos (toast pulse/sweep, timeline beam,
  press-button shimmer/spark) and decorative carriers (the liquid-SVG
  zero-size filter def);
- CONTAINING-BLOCK NEEDS — the indicator span inside the scroll run
  (its containing block is the scroller so it travels with content);
  the timeline scroll-progress spine's absolute channel (geometry
  that must span implicit tracks, 2026-09-02);
- PLATFORM POSITIONING — popover/anchor engines (position-anchor,
  top layer) and visually-hidden skip targets.

A z LADDER (any set of z-index assignments ordering siblings of one
host) is COMPONENT-PRIVATE: the sheet that assigns it SHALL root
the ladder in a stacking context of its own — `isolation: isolate`
on the ladder's common parent (the press-button/chip `relative
z-0` host rooting and `.jx-surface`'s `isolation: isolate` are the
two lawful in-repo proofs) — so component ladders never compare
rungs across components (the scroll-run chips z:2 over the canvas
dock z:1 incident, 2026-09-09: both ladders were lawful, both
leaked into a shared ancestor context and compared raw numbers).
A ladder spanning MULTIPLE parents (timeline's bridging lines)
isolates at its TRUE common parent (the list root), never
per-item — per-item isolation would freeze cross-item order to DOM
order. Same-cell grid siblings ordered by SOURCE ORDER with zero
z (carousel, section-card, tree-view) are the compliant zero-z
dialect — grid stacking does not require z, only permits it.
`container-type` does NOT establish a stacking context (measured,
Chrome — a `@container`-carrying host still leaks); isolation is
one explicit property, never implied by containment. Ladders in
MARKUP UTILITIES (`z-[1]`, `z-0`) follow the same law as sheet
z-index. The ONE sanctioned raw-number comparison is the
page-terminal calibrated plane — {content < toc/top-layer 40 <
fab 80 < toast 90 < skip-link 100} — cross-component by design at
page level; everything below it orders between ATOMIC UNITS at
their shared boundary: content < decorative ink < interactive
chrome < canvas chrome < page chrome.

Overlay planes SHALL be pointer-transparent except on their actual
content: the plane container sets `pointer-events: none` and content
opts back in (`auto`). A plane stretched over the stage with
`pointer-events: auto` is a click shield over the page (the toast
float-plane incident, 2026-09-02). The INVARIANT is "an adopted plane
never becomes a shield or inflates its children" — the mechanism is
free (today: the float wrapper is content-sized at the stage corner
via place-self and the toast stack rides content-end rows); laws pin
invariants, implementations pick mechanisms.

#### Scenario: an overlay is positioned instead of gridded

- GIVEN a component adds a scroll chevron / veil / badge / center
  overlay (donut center, busy scrim, dropdown menu)
- WHEN it is placed with position:absolute instead of a grid area on
  the shared host — or, for menus, the popover platform
- THEN review rejects it — grid + z-index (or the platform) is the law

#### Scenario: a private ladder leaks into a shared context

- GIVEN a component whose sheet assigns z-index to its own parts
  (a veil at 1, chips at 2) embedded in a foreign z-using context
  (a canvas stage whose own chrome rides z 1)
- WHEN its ladder's common parent establishes no stacking context
  (plain grid host, `@container` utility, or consumer markup)
- THEN review rejects it — the owner adds `isolation: isolate` at
  the ladder's common parent; the component becomes one atomic unit
  outside, its internal order untouched

#### Scenario: a canvas guarantees chrome above demo content

- GIVEN a canvas whose stage hosts arbitrary demo content (any
  registry component, any internal z usage)
- WHEN the canvas's own chrome (the playground dock, z 1) shares an
  ancestor stacking context with the demo subtree
- THEN the canvas isolates the demo boundary (the scroll layer) so
  demo content is one atomic unit under the chrome — the canvas
  never trusts demo internals, and demos never paint above canvas
  chrome regardless of their own ladders

#### Scenario: an adopted float plane intercepts the page

- GIVEN a top-layer plane (ScaffoldFloat area) over the stage
