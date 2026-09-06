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
binds a token, so light/dark inversion needs ZERO re-render.
`math-inline` owns no chrome and no controls; `math-block` owns the
wide-equation strip as a full rider of the scroll-run unification (the
`@jixoai/scroll-run` host/run/ScrollChrome — never a family-local
copy of the stamp machine, law sheet, or chrome) and an optional copy
control that SHALL follow the localization-payload law (`labels`,
absent = shipped English verbatim) and the press physics. Errors SHALL
paint in place (`throwOnError: false`, errorColor token) with one
console.warn diagnostic — no error chrome. The accessible path SHALL
be KaTeX's hidden MathML (shipped by the `htmlAndMathml` default); no
`aria-label` may shadow it.

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

#### Scenario: the copy control localizes

- GIVEN `<MathBlock tex="…" labels={{ copy: '复制', copied: '已复制' }} />`
- THEN the control renders 复制 and the copied feedback 已复制, while
  the clipboard payload stays the raw TeX source (the value domain
  never localizes)

### Requirement: the diagram surface keeps the source-first floor (mermaid)

The mermaid surface SHALL follow the code-card progressive-enhancement
contract: prerender paints the escaped diagram source as a readable
plain-text floor (zero JS), and after hydration the lazily-loaded
engine (a code-split singleton — the engine never rides a page's
critical path) swaps the rendered, sanitized SVG into the same box.
Effect discipline SHALL match the code-card generation law: prop
changes drop the previous paint booking, out-of-order resolutions
no-op, and the floor shows the CURRENT source while a render is in
flight. `theme="auto"` (the default) SHALL follow the site theme flip —
re-reading the live computed tokens after the `.dark` class change and
re-rendering with re-derived themeVariables; an explicit
`light|dark` pins the palette. Controls SHALL cover the Owner minimum
(copy source + zoom in/out/reset) under the press physics and the
localization-payload law; zoom is a pure transform on the viewport's
inner wrapper (no engine re-render). The zoom-pan viewport is a
RECORDED scroll-run exemption: a two-axis pan surface for scaled
content is not a linear overflow strip (the unification contract
models one axis per run with linear nudge chips), so the viewport
rides the scrollbar-token law (thin currentColor thumbs, both axes)
instead of the shared chrome. A render failure SHALL paint an
error summary strip and KEEP the source floor standing. The first
render fades in, killed under `prefers-reduced-motion`; the floor box
reserves a min-height while rendering so the swap doesn't collapse the
layout.

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

#### Scenario: a parse error keeps the floor

- GIVEN a diagram whose source fails mermaid's parser
- THEN an error summary strip paints above the standing source floor
  and the surface never blanks

#### Scenario: zoom transforms without re-rendering

- GIVEN a rendered diagram
- WHEN the zoom-in control is pressed
- THEN the inner wrapper scales and the scrollport becomes the pan
  surface, with no engine call and no SVG regeneration
