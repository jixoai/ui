# canvas-schema — spec delta (MODIFIED)

## MODIFIED Requirements

### Requirement: the canvas renders controls from jsonSchema

ComponentCanvas SHALL accept an optional `schema` (lowered
jsonSchema) and bindable `values` initialized from schema defaults.
Controls render INSIDE THE PLAYGROUND DOCK (canvas-playground-dock,
2026-09-08; pose re-ruled to the grid law 2026-09-09): a floating,
collapsible, horizontally draggable panel grid-stacked over the
stage-row's top-right corner — the stage-row is a ONE-CELL GRID
HOST whose scroll layer and dock are `grid-area: 1/1` siblings,
the dock riding z-index above (the css-architecture Owner law
"grid supplies stacking; position is for transient ink"; never
position:* for layout). The dock never scrolls with stage content,
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
