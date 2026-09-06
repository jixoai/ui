# highlight-engines — 增量

## MODIFIED Requirements

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
`lang-detector.ts`, `context-key.ts`) and ZERO npm dependencies;
`context.svelte.ts` stays site-only (the standing "no kernel dependency
rides the item" law — the shipped context seams are the
zero-dependency `context-key.ts` exporting TWO INDEPENDENT surfaces
(`HIGHLIGHT_KEY` + `HighlightContextValue` for the backend default,
`HIGHLIGHT_DETECT_KEY` + `HighlightDetectContextValue` for the
language-detector default — lang-detection change, 2026-09-07: both are
plain Symbol seams over `setContext`, mutually orthogonal, neither
pulls the kernel), and an app writes its own ~10-line provider over
either key per the docs recipe). All engine files keep their canonical
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
- **THEN** the context surface received is `context-key.ts` only —
  carrying BOTH independent seams (`HIGHLIGHT_KEY` +
  `HighlightContextValue`, and `HIGHLIGHT_DETECT_KEY` +
  `HighlightDetectContextValue`); kernel-side context wiring never
  rides an item, and the detect seam's arrival (lang-detection change)
  changes nothing about the backend seam's shape or consumers
