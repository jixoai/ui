# prototype-standard Specification

## ADDED Requirements

### Requirement: the prototype kit ships three declarative frame components

The `prototype-kit` registry item SHALL export
`PrototypeCanvas`, `PrototypePage` and `PrototypeComponent` as
same-source registry components (the ui group), installable via
the existing `jixoai-ui add` flow into any consumer project.

#### Scenario: a consumer installs the kit

- GIVEN a project with the @jixoai namespace initialized
- WHEN `jixoai-ui add prototype-kit` runs
- THEN the three components land under the project's ui alias
  and import cleanly in a svelte 5 module

### Requirement: refs resolve server-side by convention glob

The design server's frame surface SHALL resolve a frame's `ref`
(a workspace-relative file path) through root-relative
`import.meta.glob` literals over
`design/prototypes/*/pages/*.svelte` and
`.../components/*.svelte`, declared in ONE server-owned entry
(a stable virtual id resolving to a real file in the design
package — virtual-module glob transforms proved unverifiable,
the r2 implementation ruling). Frames SHALL be declarative only — no script
block is required in a canvas file. An unresolvable ref fails
LOUD: the frame surface renders an inline error naming the ref
and the registered keys.

#### Scenario: the agent adds a page and refs it

- GIVEN a scaffolded canvas for prototype `welcome`
- WHEN `pages/checkout.svelte` is added and a frame refs
  `./pages/checkout.svelte`
- THEN the frame iframe loads the live component with HMR and
  no canvas or server restart is needed

#### Scenario: a typo'd ref

- GIVEN a frame with `ref="./pages/checkoutt.svelte"`
- THEN the frame renders an inline error naming the ref and the
  registered keys, never a silent blank

### Requirement: frames are real iframes with viewport and theme semantics

`PrototypePage` SHALL render its ref inside an iframe of
`width` × `height` pixels whose document root carries the
theme class (`?theme=dark` → `html.dark`); media and container
queries SHALL respond to the frame viewport. `PrototypeComponent`
SHALL use an adaptive-height frame (height is initial unless
`fill` locks it). `PrototypeCanvas` SHALL be a CSS grid
container (`gridCols`, `gridRows`, `gap`) that nests freely,
nested canvases inheriting the prototype-folder context.

Post-scenario notes (verbatim from r1, retained): a canvas
displays mixed-theme matrices in one view — theme isolation is
per-frame because each frame is its own document; state matrices
are expressed as REAL ref'd files (multiple state files or one
matrix wrapper), never a frame-level props-injection protocol
(v0 boundary); frame components degrade to a visible "requires
the design server" notice outside a design server host.

#### Scenario: the responsive matrix

- GIVEN one page ref'd by three frames at 390/768/1280 widths
  and both themes
- THEN one canvas shows six live renderings, each honoring its
  frame's real viewport, with no duplicate page code

#### Scenario: the state matrix

- GIVEN `components/button-idle.svelte` and
  `components/button-loading.svelte` ref'd by two frames
- THEN the states sit side by side as real code and editing
  either file hot-swaps its frame only

### Requirement: frame ids are DOM anchors

Every frame SHALL carry an `id` unique within its canvas (dev
warning on conflict, first wins). Ids SHALL serve as navigator
deep-link anchors (hash scroll), with no format enforcement
beyond uniqueness.

#### Scenario: navigator deep link

- GIVEN a canvas with frames id'd `hero-desktop-1280-dark` etc
- WHEN the studio navigates to a canvas with a frame anchor
- THEN the frame scrolls into view inside the canvas iframe

### Requirement: prototype folders follow the position-is-semantics convention

The design workspace root SHALL be `design/prototypes/`, where
each prototype folder places `canvas.svelte` (the matrix tree),
`pages/*.svelte` and `components/*.svelte`. Nothing outside
`design/` SHALL be written by studio tooling, and production
code SHALL NOT import from `design/` (isolation law).

#### Scenario: isolation holds

- GIVEN a workspace with prototypes
- WHEN any production module graph is built
- THEN no design/ module participates (no import edge exists)
