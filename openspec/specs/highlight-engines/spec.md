# highlight-engines Specification

## Purpose
TBD - created by archiving change 2026-09-06-highlight-engine-matrix. Update Purpose after archive.

## Requirements

### Requirement: the engine matrix ships one engine per item

The highlight layer (canonical root `registry/files/lib/highlight/`)
SHALL be distributed as a pure-contract core item plus ONE registry item
per engine. The matrix membership is frozen: `highlight-shiki`,
`highlight-prismjs`, `highlight-microlighter`, `highlight-highlightjs`,
`highlight-sugar-high`, `highlight-tree-sitter` — each declaring
`@jixoai/highlight` PLUS every cross-item owner whose files it actually
imports (`highlight-shiki` additionally declares `@jixoai/shiki` for
the facade it wraps), and ONLY its own engine's npm `dependencies`.
The core `highlight` item carries the contract files (`backend.ts`,
`context-key.ts`) and ZERO npm dependencies; `context.svelte.ts` stays
site-only (the standing "no kernel dependency rides the item" law —
the shipped context seam is the zero-dependency `context-key.ts`, and
an app writes its own ~10-line provider over `setContext(HIGHLIGHT_KEY,
…)` per the docs recipe). All engine files keep their canonical
`@lib/highlight/...` targets — item boundaries move, consumer import
paths do not (for consumers who installed the corresponding engine
item).

#### Scenario: adding an engine to a consumer

- **WHEN** a consumer wants prism highlighting in addition to the
  default
- **THEN** `shadcn add @jixoai/highlight-prismjs` installs exactly the
  prismjs factory file plus its npm dependency — no other engine's
  npm dependency arrives, and `$lib/highlight/prismjs` imports work
  unchanged

#### Scenario: an engine item never drags a sibling engine

- **WHEN** any `highlight-*` item is resolved
- **THEN** its npm dependency closure contains its own engine package
  and nothing from the sibling engines (verify:deps enforces the
  declared-edge law; verify:shadcn-add probes real installs, including
  a clean-consumer typecheck of code-card plus each engine item)

#### Scenario: the shipped context seam stays zero-dependency

- **WHEN** a consumer installs any highlight item
- **THEN** the context surface received is `context-key.ts` only
  (`HIGHLIGHT_KEY` + `HighlightContextValue`); kernel-side context
  wiring never rides an item

### Requirement: the default install is a single engine

`code-card` SHALL declare exactly ONE engine in its dependency closure:
`shiki` (npm) via `@jixoai/highlight-shiki` (registry). No other
engine's npm package rides the default install. The backend resolution
chain stays `prop → context default → stock shiki` — unchanged by the
matrix. This is a BREAKING posture (2026-09-06): installing `code-card`
no longer brings prismjs/microlighter, and a pre-split direct
`@jixoai/highlight` install loses the engine factory files it used to
receive; the migration path is one command per extra engine, and no
compatibility glue is written.

#### Scenario: default install shape

- **WHEN** a consumer installs `@jixoai/code-card` fresh
- **THEN** `package.json` gains `shiki` and no other highlighting
  engine; `<CodeCard code>` highlights through the stock shiki backend
  exactly as before

#### Scenario: a pre-split direct highlight installer upgrades

- **WHEN** a consumer that installed `@jixoai/highlight` (old shape:
  all three factory files) upgrades past the split and still calls
  `prismjs()`
- **THEN** the module is absent until they run
  `shadcn add @jixoai/highlight-prismjs` — the docs' migration table
  maps every old import to its engine item, and no compatibility
  re-export is shipped

### Requirement: every engine is lazy

The lazy law governs DOWNLOADABLE / CODE-SPLIT units: the engine
package module, its grammars, styles and queries-as-packages, and wasm
binaries SHALL load via dynamic imports triggered inside
`highlight()` — never at backend-factory module top level, never on
factory construction. A card that never resolves to an engine never downloads
it (the engine-minisearch precedent, extended to the matrix). Source
embedded in item files (query constants, alias tables) is not a
downloadable unit and rides the item file itself.

#### Scenario: constructing a backend loads nothing

- **WHEN** a module imports every backend factory and constructs one
  of each, without painting
- **THEN** zero engine code loads (the prism window.Prism marker
  pattern and module-load counters both assert this)

#### Scenario: an engine that never paints never loads

- **WHEN** a page renders shiki-backed cards only
- **THEN** no chunk or asset of highlight.js / sugar-high /
  tree-sitter / prismjs / microlighter is fetched

### Requirement: syntax support is a per-backend factory option

Engines that support selective syntax SHALL expose it as a factory
option — `shiki({ langs })`, `prismjs({ langs })`,
`highlightJs({ langs })`, `treeSitter({ langs, wasmBase, wasmLoader })`
— where `langs` is a per-instance allowlist held in the backend closure
(the shared registration tables are never mutated; instances compose
freely). Omitting the option yields the engine's FULL curated set
("the engine's whole capability" is the default). A lang outside the
allowlist rejects with a hint naming the engine's supported set; the
card's plain-text fallback law takes over. Engines whose distribution
model has no selective syntax (microlighter — single-file TextMate
set; sugar-high — all-in-one ~10KB set) are EXEMPT and expose no such
option.

#### Scenario: slimming an engine to a language subset

- **WHEN** an app pins `createHighlightContext(highlightJs({ langs:
  ['ts', 'bash', 'json'] }))`
- **THEN** only core + those three language modules ever LOAD — the
  allowlist gates registration, so unselected grammars are never
  imported and never fetched at runtime (the zero-build law forbids a
  compile-time selection mechanism: the bundler still emits the full
  curated set as UNDOWNLOADED lazy chunks, exactly like every other
  engine's on-demand posture); highlighting `svelte` code through that
  backend rejects with a hint and the card shows plain text

#### Scenario: two instances with different allowlists coexist

- **WHEN** one subtree provides `prismjs({ langs: ['css'] })` and
  another `prismjs()` (full set)
- **THEN** the second subtree's cards highlight typescript; the
  first's reject on typescript — the shared grammar cache is
  unaffected by either allowlist

### Requirement: theme semantics stay per-backend, the jixoai
default stays zero-download

The card's `theme` prop keeps shiki vocabulary; each backend maps it
into its own world (the 2026-09-02 law, unchanged). New engines SHALL
map the `jixoai` default onto the consumer's `--tok-*` palette with
zero additional download: highlight.js via an item-shipped stylesheet
binding `hljs-*` classes to `var(--tok-token-*)`; sugar-high and
tree-sitter via inline `color: var(--tok-token-*)` spans (the
inline-code painting precedent). Non-default theme names resolve per
engine (hljs styles table; sugar-high/tree-sitter stay on the jixoai
mapping and warn on unknown names).

#### Scenario: engine default parity

- **WHEN** the same sample highlights through shiki and
  highlightJs() with default theme on the same page
- **THEN** both resolve token colors against the same `--tok-*`
  variables — light/dark adaptation is pure CSS for every engine

### Requirement: tree-sitter binaries ride npm, never the
registry payload

The tree-sitter backend's WASM assets (core + grammar) SHALL come from
its declared npm packages (`web-tree-sitter`,
`tree-sitter-typescript`, `tree-sitter-javascript`) resolved through
an explicit loader seam — `wasmLoader(asset) → { url } | { bytes }`,
with `wasmBase` as the string-prefix sugar covering core + grammar
binaries (never the embedded queries) — so the browser consumes real
HTTP asset URLs (bundler `?url` emission) and Node/vitest consumes
real bytes (`createRequire` + `readFile`); both paths perform REAL
wasm initialization, no mocks, and `file://` is never treated as
browser evidence. No binary enters a registry payload, and no
pin-manifest workflow is introduced (the supply chain is the consumer
lockfile). Highlight queries (`.scm` sources, upstream MIT) ship
embedded as item-local TS constants; capture names map to
`--tok-token-*`. The output model is MARKUP (spans with inline palette
colors) so the print-freeze clone survives; range-model exclusivity
stays with microlighter.

#### Scenario: fresh consumer install with tree-sitter

- **WHEN** a consumer adds `@jixoai/highlight-tree-sitter` and builds
- **THEN** the wasm files are emitted from `node_modules` as build
  assets, fetched only when a tree-sitter-backed card first paints,
  and a `wasmBase: '/my-assets/'` option repoints all of them without
  code changes (a missing trailing slash is normalized; the core-init
  singleton and per-grammar caches are PROCESS-level — shared across
  backend instances regardless of their loader customization)

#### Scenario: the loader seam carries bytes under vitest

- **WHEN** the contract suite runs in jsdom (no asset emission)
- **THEN** the test loader resolves the same npm wasm files to real
  bytes and web-tree-sitter initializes against them — the ABI
  compatibility of grammar packages is asserted by execution, not
  mocked

### Requirement: microlighter's grammar loading carries a bundler
contract

The microlighter engine loads grammars through RUNTIME-TEMPLATED
relative imports (`import(\`./grammars/${lang}.js\`)` inside the
package) that no bundler can statically analyze — and the engine
swallows every miss (`.catch(() => null)`), so a misconfigured host
does not error: cards silently stay plain (found live on the docs
playground, 2026-09-07). Host integration SHALL keep those imports
resolving against real package files: a vite dev server MUST
exclude microlighter from the dependency optimizer
(`optimizeDeps.exclude`), and a production build SHALL emit the
package's `dist/grammars/*.js` verbatim (they are zero-import data
modules — grammar dependencies are loader-resolved data, not ES
imports) next to whichever chunk carries the template. The registry
item's docs state both requirements; the site's vite config is the
reference implementation.

#### Scenario: the docs playground on a production build

- **WHEN** the site is built and previewed, and the playground
  switches a card to microlighter
- **THEN** the grammar request resolves to the emitted
  `grammars/*.js` assets (no 404 past the engine's catch), ranges
  register in `CSS.highlights`, and the card paints — same registry
  as the dev server, no silent plain-text degradation

#### Scenario: token colors follow the site's mode, not the OS

- **WHEN** a visitor with a dark OS preference reads the site in
  light mode (the html.dark-class state) and a microlighter card
  paints
- **THEN** `pre[data-syntax-theme]` is pinned to the site's
  color-scheme (host CSS over the theme's own `color-scheme: light
  dark`), so light-dark() token pairs resolve against the SITE mode
  — numbers/strings paint light-mode values on the light background,
  never the dark-mode near-whites (found live 2026-09-07: numbers
  ≈ white on white)

### Requirement: the failure law is uniform across the matrix

Every backend SHALL reject (never throw past the card) on unknown or
unsupported languages with a message naming the engine, its supported
set, and — where another engine covers the gap — the backend to use
instead (e.g. highlight.js on `tsx` → "use the shiki backend"). The
card's plain-text fallback law is the single floor for all engines.

#### Scenario: hljs meets tsx

- **WHEN** `highlightJs()` highlights `lang="tsx"`
- **THEN** the card shows plain text and the console warns that
  highlight.js ships no tsx grammar, naming the shiki backend as the
  covering engine
