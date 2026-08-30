# component-authoring delta — the canvas is a floor + a lab

## ADDED Requirements

### Requirement: the canvas stays out of the outline

The canvas root SHALL carry `data-toc-skip`; its title and Playground
headings SHALL NOT be real outline headings (styled non-heading
elements or `h3`+skip). DensityDemo's children-quadrupling SHALL be
retired in favor of the stage density toggle.

#### Scenario: a docs page ToC

- GIVEN a docs page with three canvas instances
- WHEN the outline is derived
- THEN no canvas-internal heading appears; the page's own sections only

### Requirement: the floor is affordable for two-file items

A demo page whose item has ≤2 files SHALL render filename TABS over a
single CodeCard (no tree pane); files SHALL come only from `?raw`
imports of the mirrored sources — hand-pasted source in a docs page
is a gate failure. The GitHub source link SHALL be derived from the
item's registry path, never hand-written.

#### Scenario: a two-file floor

- GIVEN press-button (component + usage)
- WHEN the drawer opens
- THEN two filename tabs swap one CodeCard, and the header's source
  link resolves on GitHub (derived, not authored)

### Requirement: the stage carries theme and density as scoped attributes

The canvas stage SHALL expose light/dark and comfortable/compact
toggles that set `data-theme`/`data-density` on the STAGE element
only; toggle state SHALL be page-owned (bindable), never held inside
the canvas.

#### Scenario: previewing a dialog in light compact

- WHEN the toggles flip to light + compact
- THEN only the stage re-themes; the docs chrome and other instances
  are untouched; and the page's bound state reflects the change

### Requirement: the lab's code follows the controls

The flagship lab's code panel SHALL render the page's authored snippet
function over the current control state (single source: the taught
string and the shown string are the same function). A reset control
SHALL restore the documented defaults, and a read-only state
projection SHALL echo the current bound state.

#### Scenario: dragging variant to ghost

- GIVEN the lab with variant control
- WHEN the consumer selects ghost
- THEN the code panel shows the ghost snippet generated from the same
  function the usage section teaches
