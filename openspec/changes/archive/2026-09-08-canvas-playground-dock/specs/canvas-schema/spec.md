## MODIFIED Requirements

### Requirement: the canvas renders controls from jsonSchema

ComponentCanvas SHALL accept an optional `schema` (lowered
jsonSchema) and bindable `values` initialized from schema defaults.
Controls render INSIDE THE PLAYGROUND DOCK (canvas-playground-dock,
2026-09-08): a floating, collapsible, horizontally draggable panel
absolute-positioned over the stage-row's top-right corner (the
scroll layer's sibling — it never scrolls with stage content),
mounting EXPANDED by default (the Owner ruling) and collapsing to a
head chip on toggle. The dock's expanded body composes ONE
`<ItemGroup mode="plain" controlChrome="integrated">` (the declared
`@jixoai/list-item` family; B5 integration — the dock frame is the
sole surface owner and in-row control shells dissolve): toggle/
select/text/slider rows via the ItemToggle/ItemSelect/ItemInput
adapters, segmented/stepper via ItemField's control snippet — the
same ItemField scaffold the site play kit's play-row bridges onto,
so schema docks and snippet docks are one surface. The
consumer-authored `playground` snippet SHALL take precedence when
supplied (rendered inside the same ItemGroup); reset SHALL restore
schema defaults when no `onreset` is given; an `onvalue` seam SHALL
let the page own value semantics for non-representable props; the
read-only `output` lane rides the dock's foot. The retired `pane`
prop is gone — the stage is always full-width (the permanent lane
posture is dead). Drag is decorative and pointer-only: displacement
under 4px is a toggle, at-or-above is a horizontal reposition
clamped to the host; every function stays keyboard-reachable
without position.

#### Scenario: schema-driven dock

- GIVEN the pilot page passes schema + `bind:values`
- THEN variant/size/loading/radius render as segmented/toggle/
  stepper rows in the expanded floating dock, stage updates live
  (full-width, undimmed, interactive under the dock), and reset
  returns defaults

#### Scenario: both routes share one row surface

- GIVEN a schema-mode canvas and a snippet-mode canvas
- THEN both docks render integrated ItemGroup rows in the same
  tight rhythm, and the schema dock's leaf controls carry their own
  focus paint (only the canvas-authored segmented/stepper idioms
  keep rules in the residue sheet)

#### Scenario: collapse and drag

- GIVEN an expanded dock
- THEN the head toggle collapses it to the head chip (aria-expanded
  flips, body goes inert), and a horizontal pointer drag of ≥4px
  repositions the dock within the stage-row bounds without toggling

#### Scenario: escape hatch precedence

- GIVEN a canvas with BOTH `schema` and a `playground` snippet
- THEN the snippet renders inside the dock (the page keeps full
  control) and schema rows are not duplicated
