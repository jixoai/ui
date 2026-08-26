# component-authoring — delta

## MODIFIED Requirements

### Requirement: the hit-lane contract

Every interactive control SHALL expose a PHYSICAL activation
rectangle at `min-block-size: var(--jx-hit)` (the canonical alias —
the previous text's `--jx-d-ctl-hit` predated the Tailwind-aligned
token rename and is retired); visual glyph dimensions (icon and
friends) are separate declarations. Probes measure the clickable
rectangle on the actual interactive root, not an ancestor min-height
and not a pseudo-element expansion. Paint variants never alter the
lane: a Chip is control-scale (root ≥ `--jx-hit`) with badge-nature
paint, not a badge-sized control.

#### Scenario: a checkbox lane is clicked at the corner

- GIVEN a checkbox wrapper lane at xs density
- WHEN the probe clicks the wrapper's physical corner
- THEN the input toggles — the lane, not just the 16px square, is the
  target

#### Scenario: a compact-looking chip is probed

- GIVEN a Chip rendering at default density
- WHEN the probe measures the root element's activation rectangle
- THEN the root's min-block-size resolves to `var(--jx-hit)` — the
  tinted micro-label paint does not shrink the physical lane

## ADDED Requirements

### Requirement: the variant grammar (prominence ladder + hue injection)

Surface paint variants SHALL come from the one ladder — `fill` /
`tonal` / `outline` / `ghost` — plus PressButton's `link` interaction
exception. Semantic color is NEVER a variant name: intent is expressed
by injecting values into the four global hue slots (`--jx-fill`,
`--jx-fill-ink`, `--jx-tonal`, `--jx-outline`; theme-owned,
inheritable, canonical seam = arbitrary-property class utilities).
The action/status split is mandatory: destructive ACTIONS inject
`--destructive` (fill pair), error STATUSES inject `--error` into the
tonal slot. Variant paint rides token utilities in the markup (tw4
utility-authored law); press physics (`.jx-press`) never change with
paint. Availability is per-component (see the frozen table in
openspec/changes/variant-grammar/design.md §4): Badge fill/tonal/outline
(default tonal, brand hue); InlineCode tonal/outline (default tonal,
locally neutral); Chip all four (default tonal); PressButton
fill/tonal/outline/ghost/link (default outline); Alert outline/tonal
(default outline — no fill/ghost: banner readability). Valued
`data-jx-*` hooks carry the variant (`data-jx-badge`,
`data-jx-alert`, `data-jx-press-button`, `data-jx-chip`).

#### Scenario: a failed status chip is authored

- WHEN a badge must read as failed
- THEN it is `<Badge variant="tonal" class="[--jx-tonal:var(--error)]">`
  — never `tone="destructive"` and never `--destructive` (that hue is
  reserved for destructive actions)

#### Scenario: a variant utility set is audited

- GIVEN any component's variant map after this change
- WHEN the source guard scans its markup
- THEN every variant's paint consumes the four global slots and no
  variant name encodes a semantic hue
