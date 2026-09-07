# docs-site Specification

## Purpose
The site-level quality contract for the component docs site: every docs page follows the lintable skeleton (Intro / Install / one Usage / ability-named Examples / API / See Also, PLAYGROUND for interactive components), demos render honest state (empty values show an em dash, never `undefined`, and demo copy never fakes headings), and internal verification surfaces like `/parity.html` carry `noindex` with self-explanatory context. It serves the contributors and readers of the dogfooded site — dev serves the registry, enterprise data surfaces are demo-complete, and the canvas stage carries theme and density toggles. Core contract: a page either matches the declared skeleton or the lint names it; nothing degrades silently.

## Requirements

### Requirement: docs pages render honest state

Demo prose SHALL NOT render JavaScript `undefined`/`null` literals.
Every interpolation of a possibly-empty `$bindable` value into rendered
text uses an explicit empty-state glyph (em dash).

#### Scenario: a demo value is not picked yet

- GIVEN a demo whose bound value is empty at first render
- WHEN the page renders
- THEN the value slot shows `—`, never `undefined`

### Requirement: the docs page skeleton is lintable

Every `/docs/components/<name>.html` page SHALL have exactly one
`Usage` section, a PLAYGROUND section when the component is
interactive, and a page title. Demo content SHALL NOT emit real
headings: the lint targets consumer-authored content inside the
canvas's `data-doc-demo-content` wrapper only — ComponentCanvas's own
structural chrome (title/Playground headings) is exempt. The lint
(`verify:docs-structure`) enforces this on the built output and rides
`verify:all`, with fixtures proving canvas chrome passes and a
consumer heading inside the wrapper fails.

#### Scenario: a page grows a second Usage section

- WHEN a docs page edit introduces a duplicate `Usage` heading
- THEN `npm run verify:docs-structure` fails naming the page

#### Scenario: demo copy pretends to be a heading

- GIVEN consumer-authored content inside the `data-doc-demo-content`
  wrapper
- WHEN it renders an `h2` for demo copy
- THEN the lint fails naming the page; the same copy as a styled
  non-heading passes

### Requirement: development serves the registry

The dev server SHALL serve `/r/*.json` from the repo-root `public/r/`
(read-only fallback) so registry links are verifiable during
development. `scripts/build-site.mjs` remains the only WRITER of
`public/r/`.

#### Scenario: a contributor opens the registry overview in dev

- GIVEN `pnpm dev` is running
- WHEN the registry-overview table's `registry.json` link is followed
- THEN JSON is served (HTTP 200), not the SPA 404 fallback

### Requirement: internal surfaces are marked internal

Verification-only pages (`/parity.html`, `/blueprints.html`,
`/probe-folder-css`) SHALL carry `noindex` and enough on-page context
(title + one-paragraph purpose) to be self-explanatory when reached
from a search or a stale link.

#### Scenario: a search engine finds the parity page

- WHEN `/parity.html` is crawled
- THEN the page declares `noindex` and states its verification purpose

### Requirement: enterprise data surfaces are demo-complete

The table / transfer / tour / descriptions / statistic docs pages
SHALL each carry ability-named composition recipes covering their
market-standard forms (table: sort, filter, pagination, row
selection, row actions, column visibility, sticky header, and one
composed toolbar example; transfer: oneWay; tour: non-modal +
placement; descriptions: vertical + responsive + extra; statistic:
countdown). A discovered missing atom API SHALL be recorded in the
change's `followups.md` rather than worked around silently.

#### Scenario: composing the tasks-table demo

- WHEN the composed toolbar demo is authored
- THEN it uses only public component behavior and every interactive
  part is keyboard-reachable

### Requirement: the component docs page skeleton

Every `/docs/components/<name>.html` page SHALL present, in order:
Intro (the one-paragraph contract), Install (copy-ready
`npx jixoai-ui add <name>`), Usage (minimal working example), Examples
(ability-named demos, each with collapsible code), API (a props table:
Prop / Type / Default), See Also (related component links).

Adoption is STAGED, not partial-by-omission: the change commits a
machine-readable scope file (pilot routes + the remaining backlog,
each with an owner and a successor change); the lint HARD-FAILS every
in-scope route and WARNS on out-of-scope routes while printing the
backlog. The successor change flips the lint to hard-fail-everywhere
(the staged exit criterion).

#### Scenario: a pilot page misses a section

- GIVEN a route listed in the staged scope file
- WHEN it lacks an Examples section
- THEN `verify:docs-structure` fails naming the page and the missing
  section

#### Scenario: an out-of-scope page

- GIVEN a route NOT in the staged scope file
- WHEN it lacks sections
- THEN the lint warns and increments the printed backlog without
  failing the gate

### Requirement: demos are named by ability

Example/demo names SHALL use the ability grammar ("with clear button",
"async loading", "multiple chips") — one phrase names one capability.
Registry-level variant items (when promoted) take the
`<name>-<ability>` suffix convention.

#### Scenario: naming a new demo

- WHEN an examples section gains a demo
- THEN its name states the ability, not a number or a scene noun

### Requirement: the canvas stage carries theme and density toggles

The component-canvas stage SHALL offer light/dark and density-tier
toggles applied to the demo surface, so every demo is reviewable in
both themes and every density without page-level switches. Toggle
STATE stays composition-first: the canvas renders the controls and
the scoping attributes; the hosting page owns the state.

#### Scenario: reviewing a dialog in light mode

- WHEN the theme toggle on the canvas stage flips to light
- THEN only the demo surface re-themes (the docs chrome stays put)

### Requirement: the icons page documents the component and the library face

The icons documentation page SHALL open the component face with a
BRIDGE card — one live `<Icon>` demo plus the link to
`/docs/components/icon.html`, the component's own page and the API
authority (PropsTable, playground, the type-safety law, the async
paths; icon-docs-consolidation 2026-09-07 — no duplication between
the two pages), render the
named-icon grid from `ICON_NAMES` (dynamic — a new icon appears with
zero page edit, the existing grid law carried over), and document
the plugin library face: override/custom/`lucide:` sources, the
chunk budget (`maxChunkBytes` default 20480 raw), `chunking:
'single'`, `inlineFirstChunk`, `optimize`, and the async semantics
(inline sync core → SSR-safe; lazy overflow → reserved box +
`preloadIcons`). The CSS-slot section (the `--jx-icon-*` vocabulary
table) SHALL remain, re-framed as the slot face's documentation
beside the library face.

#### Scenario: the grid tracks the generated union

- GIVEN a new icon name lands in icon-set.gen.ts
- WHEN the icons page renders
- THEN the grid shows it without any page edit (the coverage test
  asserts grid count === ICON_NAMES length)

#### Scenario: the two faces are distinguishable

- GIVEN a reader on the icons page
- WHEN they scan the sections
- THEN the component/library face (JS consumption) and the slot face
  (CSS custom properties) are presented as separate systems with
  their own sections, not conflated

### Requirement: the canvas same-source law (the extraction machinery)

The docs canvases' shown code IS the canvas's real markup. The
`canvasPlugin()` (a standalone export of `@jixoai/vite-plugin`) maps
the per-page virtual module `virtual:jixoai-canvas/<route>/+page`:
resolveId validates the page (importer-derived, realpath-canonical)
and returns the `\0` virtual id; load() parses the page with
svelte/compiler (AST, never regex) and emits a PURE-DATA module —
`canvasIds` + `resolveRawCode(id)` (the Owner's own name) with
named miss-errors listing the page's real ids. The extractor: static
`id` attrs (missing = skip, zero cost; duplicate = named error), the
children source slice with ONLY direct-child canvas-protocol
snippets stripped (nested snippets are demo content, kept), comments
kept, min-common dedent + outer-blank trim and NOTHING else
(byte-honest; no elide marker — that would be a drift hole), and a
SELF-CONTAINMENT guard (every snippet/render reference in the slice
must resolve within it, else a named build error). Escaping is
STRUCTURALLY eliminated: the map lives in a plain ESM module
(JSON.stringify + U+2028/29) — `</script>` terminates nothing; the
hand-dodge `const close` pattern dies on migrated pages. Pages
compose wrappers via `$lib/canvas-usage.ts` `usageFile(imports,
body, {script?})`. `ComponentCanvas` takes ZERO code changes — its
existing `id` (aria override) becomes the extraction key (fixing
same-title aria collisions in passing). Consumption is PAGE-side
(the registry-mirror law forbids the canvas importing app
machinery). The bridge keeps svelte/compiler out of the entry chunk;
`svelte` is optional-peer + devDep + tsdown-external (the symlink
resolution law — peer-alone never resolves). A drift gate spec pins
every id ↔ every call + inline snapshots of each extracted block
(human-reviewable); markdown.html stays opted out (the stretch
ruling — its state-bearing demos await identifier lifting). The
fleet sweep (33 more pages + the no-hand-usage lint on migrated
pages) is a recorded follow-up.

#### Scenario: edit the demo, the code follows

- WHEN a pilot canvas's child markup changes (dev HMR or build)
- THEN the drawer's usage file, the Usage CodeBlock, and the stage
  flip together — three surfaces, one source, zero staleness

#### Scenario: a broken extraction fails loudly

- WHEN a slice references a page-level snippet or an id misses
- THEN a named build error names the page and its real ids — never a
  silently-wrong copy-paste sample
