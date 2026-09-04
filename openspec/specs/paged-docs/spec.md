# paged-docs Specification

## Purpose
TBD - created by archiving change 2026-08-30-paged-doc-family. Update Purpose after archive.

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

Section/figure numbers SHALL come from a Context registry filled in
document order (CSS counters render the same order visually); PagedRef
and PagedToC SHALL read the registry. PDF link anchoring is best-effort,
not a contract clause.

#### Scenario: a cross reference resolves

- GIVEN a PagedRef targeting a section id
- WHEN hydrated
- THEN it renders the registry number of that section in document order

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
