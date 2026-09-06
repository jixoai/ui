# registry — delta

## ADDED Requirements

### Requirement: engine items carry their out-of-the-box contract

An item backed by a rendering engine SHALL be installable with ZERO
manual wiring beyond the standard `jixoai-ui add`: the engine npm
packages (`katex`, `mermaid`) are declared in the item's
`dependencies` (shadcn installs them), and every asset the engine
needs rides the package itself — KaTeX's fonts arrive via the
`katex/dist/katex.min.css` import inside the lib file, resolved by the
consumer's bundler; mermaid needs no assets at all. No vite plugin, no
font directory, no manual CSS link is ever a prerequisite for these
items. The theming contract is the registry's own: surfaces bind the
`--tok-*`/semantic tokens and `currentColor` so the one-hue law and
light/dark inversion hold with no per-site diagram/math configuration.

#### Scenario: a consumer installs math with working fonts

- GIVEN a fresh SvelteKit consumer that runs `npx jixoai-ui add math-block`
- THEN `katex` lands in the consumer's package.json, the installed
  files import `$lib/katex`, and the rendered formulas paint in
  KaTeX's fonts with no additional wiring
- AND the verify:all shadcn-add consumer probe exercises exactly this
  path against the built payloads

#### Scenario: the theme follows the consumer's hue

- GIVEN a consumer initialized with `jixoai-ui init --hue 165`
- WHEN math and diagram surfaces render
- THEN error paint, diagram fills and strokes derive from the
  consumer's own token values — no engine-specific theme file exists
  to configure

### Requirement: syntax-standard naming for engine-backed surfaces

A ui item whose content syntax is an open STANDARD (LaTeX math) SHALL
carry a function name (`math-block`, `math-inline`) — the engine is an
implementation detail swappable behind the lib seam (`@jixoai/katex`);
a ui item whose syntax is proprietary to its engine SHALL carry the
engine's name (`mermaid`). The engine integrations themselves live as
lib items named for the engine (`katex`, `mermaid-engine` — the
`toc`/`toc-engine` precedent), so a future engine swap re-points one
lib item while the user-facing surface names survive.

#### Scenario: the naming audit holds

- GIVEN the registry index
- THEN `math-block` and `math-inline` exist as ui items with no engine
  name in the item name, `mermaid` exists as a ui item named exactly
  after its engine, and `katex` / `mermaid-engine` exist as lib items
  that the surfaces depend on via `@jixoai/*` edges
