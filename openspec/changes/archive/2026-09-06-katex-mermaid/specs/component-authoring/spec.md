# component-authoring — delta

## ADDED Requirements

### Requirement: the math surfaces render server-side synchronously (math-block / math-inline)

The math surfaces SHALL render real KaTeX markup synchronously —
during SSR/prerender AND on every prop change — with no plain-text
floor and no hydration upgrade. This is the recorded lane ruling for
isomorphic-small engines: code-card's floor→upgrade contract answers
heavy, lazily-loaded engines (shiki's late chunks); a math mount that
painted a plain-text floor would flash on every hydration, so the math
lane bakes real markup server-side — strengthening the family-context
law ("SSR output is semantically complete before hydration") and the
native-element-first hydration-cost ceiling. The TeX source SHALL be a
runtime prop (`tex`), never markup-inlined text; `{@html}` carries
only engine-generated markup. Theming SHALL ride inherited color and
tokens — KaTeX output inherits `currentColor` and the error paint
binds a token, so light/dark inversion needs ZERO re-render. Both
surfaces SHALL honor the rest-attributes contract (consumer
`data-testid`/`title`/`aria-*`/handlers land on the root; the
component's own `data-jx-*` and role stamp AFTER rest). `math-inline`
owns no chrome and no controls — its single span carries `role="math"`
(content-only, nothing to flatten). `math-block` keeps NATIVE figure
semantics — `role="math"` lives on the inner wrapper that carries only
the KaTeX output, so the copy control stays a discoverable interactive
node; the wide-equation strip rides the FULL scroll-run trio
(`createScrollStamp` armed in an effect with destroy cleanup, the
shared law sheet, and `ScrollChrome` — the machine owns the
`data-jx-scroll-state` verdict; never a family-local copy). The copy
control SHALL follow the localization-payload law (`labels`, absent =
shipped English verbatim) and the press physics. Errors SHALL paint in
place (`throwOnError: false` default, errorColor token) with one
console.warn diagnostic — no error chrome; a caller-forced throw is
caught by the surface (raw source + warn), never escaping the
component boundary. The accessible path SHALL be KaTeX's hidden MathML
(shipped by the `htmlAndMathml` default); no default `aria-label` may
shadow it.

#### Scenario: a prerendered page bakes real math

- GIVEN a prerendered page with `<MathBlock tex="e^{i\pi} + 1 = 0" />`
- THEN the served HTML contains the rendered `.katex` markup (spans
  and MathML), not a plain-text formula
- AND no hydration-time repaint of the formula occurs

#### Scenario: dark mode inverts with zero re-render

- GIVEN a rendered math surface in light mode
- WHEN the site flips to the dark theme
- THEN the formula's ink inverts through inherited color with no
  engine call and no DOM rewrite of the formula

#### Scenario: broken TeX paints in place

- GIVEN `<MathBlock tex="\frac{" />`
- THEN the erroneous source paints inside the same box in the error
  token color, one console.warn carries the katex diagnostic, and no
  error panel replaces the surface

#### Scenario: the copy control localizes and stays reachable

- GIVEN `<MathBlock tex="…" labels={{ copy: '复制', copied: '已复制' }} />`
- THEN the control renders 复制 and the copied feedback 已复制, the
  clipboard payload stays the raw TeX source (the value domain never
  localizes), and the button remains a discoverable interactive node
  beside the `role="math"` wrapper (the figure keeps native semantics)

#### Scenario: consumer attributes land on the root

- GIVEN `<MathInline tex="a^2" data-testid="eq" title="Pythagoras" />`
- THEN the span carries the testid and title and the katex markup
  renders unchanged

#### Scenario: the scroll verdict comes from the shared machine

- GIVEN a math-block whose formula overflows its run
- WHEN hydration arms the stamp machine
- THEN the run carries `data-jx-scroll-state` from the shared
  `createScrollStamp` (start-closed while scrolled to origin, open in
  transit, end-closed at the end) and the shared ScrollChrome paints
  its veil from that verdict — no family-local scroll chrome exists

### Requirement: the diagram surface keeps the source-first floor (mermaid)

The mermaid surface SHALL follow the code-card progressive-enhancement
contract: prerender paints the escaped diagram source as a readable
plain-text floor (zero JS), and after hydration the lazily-loaded
engine (a code-split singleton — the engine never rides a page's
critical path) swaps the rendered, sanitized SVG into the same box.
Effect discipline SHALL match the code-card generation law: prop
changes drop the previous paint booking, out-of-order resolutions
no-op, and the floor shows the CURRENT source while a render is in
flight; render ids SHALL follow the engine's collision contract (a
per-instance monotonic base + per-render suffix — two instances,
same-named instances, and consecutive re-renders never share a live
id), and the engine's serial queue SHALL order initialize/render
pairs so concurrent instances with different themes never interleave.
The surface SHALL pass its own container as the engine's theme root
(scoped containers — a `.jx-light` stage, a dark panel — resolve THEIR
tokens, never the page's). `theme="auto"` (the default) SHALL follow
the theme flip across the container's ENTIRE effective scope — a
class observer filtered to the container ITSELF plus its current
ancestors catches a scope class flipping on either (the figure
directly, or an ancestor `.jx-light`→`.dark`) even when the document
root never mutates — re-reading the live
computed tokens after the change and re-rendering with re-derived
themeVariables, with every observer disconnected on cleanup; an
unrelated element's class change triggers nothing; an explicit
`light|dark` SHALL pin the palette to the TARGET sheet's values, read
through a temporary local probe wrapper under the same theme root
(never a global class mutation — a light page with `theme="dark"`
renders the dark sheet's colors). The engine's protected fields
(startOnLoad:false,
securityLevel strict, theme base) SHALL survive any consumer config —
user config merges BELOW them, and user themeVariables merge
field-wise over the derived palette. Controls SHALL cover the Owner
minimum (copy source + zoom in/out/reset) under the press physics and
the localization-payload law; zoom is a pure transform on the
viewport's inner wrapper (no engine re-render). The zoom-pan viewport
is a RECORDED scroll-run exemption: a two-axis pan surface for scaled
content is not a linear overflow strip (the unification contract
models one axis per run with linear nudge chips), so the viewport
rides the scrollbar-token law (thin currentColor thumbs, both axes)
and MUST NOT mount the shared chrome (no run, chips, or veils inside).
The floor box reserves `min-height: var(--jx-mermaid-floor-min, 6rem)`
while unrendered — a consumer-tunable token bounding the layout
shift. A render failure SHALL paint an error summary strip and KEEP
the source floor standing. The first render fades in, killed under
`prefers-reduced-motion`. The surface SHALL honor the
rest-attributes contract (rest spreads on the figure before the
component's own stamps); the viewport SHALL carry `role="img"` with a
NON-EMPTY accessible name at ALL times — the trimmed ladder
`name?.trim() || labels?.diagram?.trim() || 'Diagram'` (an empty or
whitespace `name` falls through; a nameless diagram never mounts a
nameless img).

#### Scenario: the floor upgrades after hydration

- GIVEN a prerendered page with a mermaid diagram
- THEN the served HTML shows the diagram source as escaped plain text
- AND after hydration the engine chunk loads and the rendered SVG
  replaces the floor inside the same box (fade-in, reduced-motion
  respected)

#### Scenario: the site theme flip re-renders the palette

- GIVEN a rendered diagram in light mode with `theme="auto"`
- WHEN the root element's `dark` class toggles on
- THEN the diagram re-renders with themeVariables re-derived from the
  dark tokens (the SVG's baked colors change; the source does not)

#### Scenario: concurrent instances never cross wires

- GIVEN two mermaid instances mounted together, one light-pinned and
  one dark-pinned
- WHEN both render
- THEN each SVG comes out in its own theme with distinct ids (the
  engine's serial queue ordered the initialize/render pairs)

#### Scenario: a hostile config cannot break the floor

- GIVEN `config={{ securityLevel: 'loose', startOnLoad: true, theme: 'dark' }}`
- WHEN the engine initializes
- THEN startOnLoad stays false, securityLevel stays strict, and the
  theme stays base with the token-derived palette (protected fields
  survive; the rest of the config merges below)

#### Scenario: a parse error keeps the floor

- GIVEN a diagram whose source fails mermaid's parser
- THEN an error summary strip paints above the standing source floor
  and the surface never blanks

#### Scenario: zoom transforms without re-rendering

- GIVEN a rendered diagram
- WHEN the zoom-in control is pressed
- THEN the inner wrapper scales and the viewport becomes the pan
  surface, with no engine call, no SVG regeneration, and no shared
  scroll chrome inside the viewport
