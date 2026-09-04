# Delta: paged-docs — R2 re-anchors numbering to the DOM currency (CSS counters and PagedRef retire)

## MODIFIED Requirements

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
