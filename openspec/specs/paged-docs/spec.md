# paged-docs Specification

## Purpose
The publication-grade document family: `PagedDoc flow="web"` renders a pageless immersive flow with zero runtime dependencies, where pagination exists only as the print projection of the same tree — numbering derives from a document-order section registry, the medium is a pure screen/sim/print three-state, and the print projection verbs (hide / freeze / static / flatten) stay orthogonal. It serves the docs site's long-form authoring need (the typesetting half of the docs-site problem). Core contract: paged output is a projection of one tree, never a second document.

## Requirements

### Requirement: web mode is a pageless immersive flow

`PagedDoc flow="web"` SHALL render a continuous responsive flow (single
column / margin-note column / wide) with NO page chrome, no header, no
footer; pagination exists only as the print-media projection of the same
tree. The component family SHALL carry zero runtime dependencies and no
pagedjs import in the native engine.

#### Scenario: reading on mobile

- GIVEN a PagedDoc page at narrow viewport
- WHEN rendered
- THEN asides sink inline, no page-box chrome appears, and the ToC
  scrolls by anchor

### Requirement: numbering derives from the section registry

Section/figure numbers SHALL derive from the reactive numbering
registries owned by the R2 line primitives (Section's numbering
domain and the document-level target registry): ordinals are the
display currency of DOM order — `compareDocumentPosition`-derived,
driven by a two-level revision signal (the domain-root observer
bumps `domainRevision` for in-domain members; the document-level
domain registry's observer bumps `documentRevision` for root order
and document-scope participants), landing as DOM text plus
`data-number`. CSS counters SHALL NOT implement any numbering
(print fragmentation rewrites author counter rules and counter
values never reach the DOM for harvest). The Reference family (R2)
SHALL read the document-level target registry and replaces the
retired PagedRef's remaining duty; PagedToC keeps reading the
section registry. PDF link anchoring stays best-effort, not a
contract clause.

#### Scenario: a cross reference resolves

- GIVEN a Reference targeting a section id
- WHEN hydrated
- THEN it renders the registry number of that section in document
  order as a native `<a href="#${to}">` (a forward-positioned
  reference renders the fallback marker in prerender and follows on
  hydration)

#### Scenario: a figure reference resolves in the kind's grammar

- GIVEN a Reference targeting an equation Figure under a declared
  numbering domain
- WHEN hydrated
- THEN it renders `Eq (4.5)` (kind short word + chapter-scoped
  number from the target registry) as a native anchor — the Figure
  path, not only the Section path, replaces PagedRef

#### Scenario: document-scope equations count continuously across participating domains

- GIVEN two sibling root domains both declaring
  `floatScope={{ equation: 'document' }}`, each with one equation
- THEN both render `Eq (1)` and `Eq (2)` in document order while a
  non-participating sibling domain's equations keep chapter-scoped
  numbers

#### Scenario: a nested domain's floats count inside the inner restart

- GIVEN a nested domain declaring `numbering` inside an outer root
- THEN its Figures count from 1 against the inner root's local
  numbering, never the outer chapter prefix

#### Scenario: multiple PagedDocs share one connected document

- GIVEN a route page rendering two PagedDocs (one shared target
  registry and document numbering domain)
- THEN both render into the same route document's ordinary DOM
  (connected roots — `compareDocumentPosition` orders across them),
  portal-split roots are a forbidden shape for numbered docs, and
  the document-order numbering spans both

### Requirement: the medium is a derived three-state

`medium.svelte.ts` SHALL expose `MediumState = 'screen' | 'sim' | 'print'`
derived purely from `realPrint` and the nearest `data-jx-print-sim`
stamp: real print wins over sim, sim wins over screen; `afterprint`
re-evaluates (a surviving sim stamp restores sim). The module SHALL be
SSR-safe. Sim CSS projections SHALL be wrapped in `@media not print` so
real print excludes them.

#### Scenario: previewing then actually printing

- GIVEN a PagedDoc with the sim stamp active
- WHEN the real print dialog opens (realPrint true)
- THEN state is 'print' and sim rules stop matching; after print with
  the stamp still present, state returns to 'sim'

### Requirement: print projection verbs are orthogonal

`data-jx-print` SHALL accept exactly hide (excluded from print),
freeze (same DOM, halted at current state), static (replaced by a
static equivalent node), flatten (structural re-layout). Hue pinning
and virtual-list snapshot|truncated are result contracts elsewhere,
never verbs.

#### Scenario: the canvas under print

- GIVEN a live canvas figure stamped freeze
- WHEN print media applies
- THEN its dock hides and the value readout persists
