## MODIFIED Requirements

### Requirement: the default install is a single engine

Every highlight SURFACE declares exactly ONE engine in its dependency
closure, and the surface's stock default is its own (2026-09-08,
this change — the law generalizes from code-card to the matrix of
surfaces): `code-card` ships `shiki` (npm) via `@jixoai/highlight-shiki`
with the stock `DEFAULT_SHIKI_BACKEND` resolution; `inline-code`
ships `microlighter` (npm) via `@jixoai/highlight-microlighter` with
the stock `DEFAULT_MICROLIGHTER_BACKEND` resolution (the Owner
ruling: the range engine is the honest default for a chip — 4.5KB,
zero markup, the plain text node IS the final DOM). No surface's
default install brings any other engine's npm package; the backend
resolution chain stays `prop → context default → stock` on both
surfaces, and one `createHighlightContext` provider still switches a
whole subtree across BOTH surfaces at runtime. The BREAKING posture
(2026-09-06) is unchanged in shape: installing a surface no longer
brings the other engines, the migration path is one command per
extra engine, and no compatibility glue is written. The chip's
engine carries the range model's documented costs on its own docs
page: the feature pre-gate (environments without the CSS Custom
Highlight API stay plain text — silently, never a shiki fallback),
print degradation (ranges do not survive the freeze clone), and the
microlighter bundler contract.

#### Scenario: default install shape (code-card)

- **WHEN** a consumer installs `@jixoai/code-card` fresh
- **THEN** `package.json` gains `shiki` and no other highlighting
  engine; `<CodeCard code>` highlights through the stock shiki backend
  exactly as before

#### Scenario: default install shape (inline-code)

- **WHEN** a consumer installs `@jixoai/inline-code` fresh
- **THEN** `package.json` gains `microlighter` and no other
  highlighting engine; `<InlineCode>code</InlineCode>` highlights
  through the stock microlighter backend after hydration, SSR stays
  plain, and an environment without the CSS Custom Highlight API
  keeps the plain chip with no fallback engine

#### Scenario: a pre-split direct highlight installer upgrades

- **WHEN** a consumer that installed `@jixoai/highlight` (old shape:
  all three factory files) upgrades past the split and still calls
  `prismjs()`
- **THEN** the module is absent until they run
  `shadcn add @jixoai/highlight-prismjs` — the docs' migration table
  maps every old import to its engine item, and no compatibility
  re-export is shipped

### Requirement: theme semantics stay per-backend, the jixoai
default stays zero-download

The card's `theme` prop keeps shiki vocabulary; each backend maps it
into its own world (the 2026-09-02 law, unchanged). New engines SHALL
map the `jixoai` default onto the consumer's `--tok-*` palette with
zero additional download: highlight.js via an item-shipped stylesheet
binding `hljs-*` classes to `var(--tok-token-*)`; sugar-high and
tree-sitter via inline `color: var(--tok-token-*)` spans (the span
form's founding precedent was inline-code's shiki path — retired
2026-09-08 when the chip moved to the range engine; sugar-high and
tree-sitter keep the span form as their own law). Non-default theme
names resolve per
engine (hljs styles table; sugar-high/tree-sitter stay on the jixoai
mapping and warn on unknown names).

#### Scenario: engine default parity

- **WHEN** the same sample highlights through shiki and
  highlightJs() with default theme on the same page
- **THEN** both resolve token colors against the same `--tok-*`
  variables — light/dark adaptation is pure CSS for every engine
