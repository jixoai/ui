# registry spec delta

## ADDED Requirements

### Requirement: the engine matrix owns its dependency shape

The highlight engine items (per the highlight-engines spec) extend the
item file contracts with a matrix-specific dependency law: a UI item
whose capability is engine-backed (`code-card`) SHALL declare exactly its
DEFAULT engine in the closure (npm `shiki` via `@jixoai/highlight-shiki`
+ `@jixoai/highlight` core) — engine breadth is the CONSUMER's opt-in,
one `highlight-*` item per engine, never the item author's bundling
decision. This supersedes the earlier judgment where `code-card`
declared all three engines' npm packages (2026-09-02 → 2026-09-06,
breaking).

#### Scenario: the dependency closure gate

- **WHEN** verify:deps resolves `code-card`
- **THEN** its transitive npm set contains `shiki` and no other
  highlighting engine; the `highlight` core item contributes zero npm
  dependencies

### Requirement: wasm-capable items have two binary channels,
payload excluded

This requirement EXTENDS AND SUPERSEDES the single-channel sentence of
`item file contracts` (the wasm-asset prerequisite paragraph: "the
item documents the `@jixoai/vite-plugin` wiring as an install
prerequisite of equal rank to the tw4 law") — that build-plugin-only
channel becomes channel 1 of exactly two; the archive step SHALL merge
this amendment into the living spec's wording. Items whose runtime
needs a binary asset declare ONE of:

1. **build-plugin channel** (ghostty-term precedent): a pinned
   release artifact documented as `@jixoai/vite-plugin` wiring — for
   assets with no reliable npm distribution;
2. **npm-asset channel** (tree-sitter precedent, 2026-09-06): the
   binary ships inside declared npm packages and reaches the runtime
   through an explicit loader seam (browser: bundler-emitted HTTP
   asset URLs; Node: real bytes) — the lockfile is the supply chain,
   no pin manifest, no registry payload.

In both channels the registry payload itself NEVER carries a binary.

#### Scenario: tree-sitter rides the npm-asset channel

- **WHEN** `highlight-tree-sitter` is installed
- **THEN** its wasm binaries arrive exclusively through the
  `web-tree-sitter` / `tree-sitter-*` npm packages; no pin manifest
  exists for them and no `.wasm` enters the registry payload or git
