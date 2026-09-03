# Delta: search-corpus — declared markers win over shape guesses (ontology R1)

## ADDED Requirements

### Requirement: line components declare their role and ordering, and the harvest consumes the declaration

The SectionCard host SHALL emit `data-role` (the seven-primitive enum
`section|entry|sequence|float|note|ref|break`, default `section`, always
emitted) and, when the consumer passes it, `data-ordering`
(`linear|alpha|timeline|tree`). When a harvested heading's nearest
`[data-jx-section]` ancestor exists, the harvester SHALL read
`section.role` and `section.ordering` from that host (role defaulting to
`section`) and `section.summary` from the LAST `<p>` inside its
`[data-jx-section-header]` zone — the "parent's first `<p>`" shape guess
SHALL NOT run for that heading.

#### Scenario: a declared section harvests role, ordering and summary from its host

- **WHEN** a page renders `section[data-jx-section][data-role="entry"][data-ordering="alpha"]`
  whose header zone ends with the summary `<p>` and whose heading is an in-outline `h2`
- **THEN** the harvested section carries `role: "entry"`, `ordering: "alpha"`, and the summary text from the header zone's last `<p>`
- **AND** no shape-guess path contributes to those three fields

#### Scenario: an unmarked page keeps today's derivation byte-for-byte

- **WHEN** a page's headings have no `[data-jx-section]` ancestor
- **THEN** its sections derive exactly as before (heading tree, slug-law ids, parent's-first-`<p>` summary, `role: "section"`, `ordering: null`)

### Requirement: point blocks declare their kind through a registry mark

The CodeCard figure root SHALL emit `data-kind="code"` (the first entry
of the open kind registry). The harvester SHALL prefer a present
`data-kind` over tag-shape classification; tag shapes remain the
fallback for unmarked block roots. The kind registry is an open enum —
each future industry block registers one value, never rewriting old
corpora.

#### Scenario: a marked code block harvests by declaration

- **WHEN** a `<figure data-kind="code">` wraps a `pre[data-lang]` and a `figcaption`
- **THEN** the harvested block carries `kind: "code"`, `lang` from `data-lang`, and `label` from the caption — regardless of the figure's internal tag shapes

#### Scenario: schema growth is non-breaking

- **WHEN** the corpus regenerates over pages mixing marked and unmarked sections
- **THEN** previously-published fields are unchanged in name and derivation; `sections[].role`/`sections[].ordering` are additive
