# search-corpus Specification

## Purpose
TBD - created by archiving change 2026-09-02-search-corpus. Update Purpose after archive.

## Requirements

### Requirement: the search corpus is structured, not guessed

The site build SHALL emit a search corpus at a top-level declared
path (`/search/corpus.json`) derived from the final rendered HTML
keyed on the semantic markers the document components emit (heading
tree law, SectionCard eyebrow/title/summary shape, figure/figcaption,
data-family/data-region), with heuristic fallback (main → body) for
unstructured pages. The generator SHALL be a single-file zero-dep
registry item (llms-txt distribution precedent, same-source test
law), SHALL reuse the llms-txt exported tokenizer (never a copy),
SHALL honor noindex and the exclude config, and the artifact SHALL
be byte-deterministic (sorted keys/entries; only generatedAt may
move). The corpus schema is the page-semantics model with the
point/line/plane dimensions (block kind+meta open enum, sections,
doc preset reserved).

#### Scenario: a SectionCard page harvests structurally

- GIVEN a page built from SectionCard components with a heading tree
- WHEN the corpus generates
- THEN sections carry heading/id/summary and blocks carry kind
  (prose/code/table) with code blocks carrying their figcaption meta

#### Scenario: a noindex page stays out

- GIVEN a page carrying meta robots noindex (or excluded by config)
- WHEN the corpus generates
- THEN the page is absent from the corpus

### Requirement: section anchors resolve against the live page

The harvest SHALL address a heading by its own id or the NEAREST
id-bearing ancestor (the print ToC's own anchor law — the site's
wrapper divs are the real targets on pages whose web ToC never
stamps heading ids), and when NEITHER exists it SHALL compute the
slug by the SAME law as the runtime outline derivation (ascii slug
+ positional fallback + dedup — convergence locked by spec).

#### Scenario: a wrapper-addressed page

- GIVEN a page whose sections are wrapper divs carrying ids around
  heading-only inners (the pilot shape)
- WHEN the corpus generates and a search hit navigates
- THEN the href's fragment resolves to the wrapper element on the
  live page

#### Scenario: slug convergence on ToC pages

- GIVEN fixture headings with plain, CJK, and duplicate labels
- WHEN harvest-side ids and runtime deriveTocOutline ids both run
- THEN both produce identical ids for headings with no ancestor id

### Requirement: the search engine is pluggable and CJK-capable

The corpus is engine-neutral; search execution SHALL live in
client-side engine adapters (minisearch first), consuming the corpus
lazily. Tokenization for CJK SHALL use Intl.Segmenter (word
granularity, shared by document and query paths). The builder keeps
zero dependencies.

#### Scenario: a Chinese query matches Chinese prose

- GIVEN corpus pages containing Chinese prose
- WHEN the user queries 打印管线
- THEN segmented query terms match segmented document terms and the
  page surfaces with a snippet

### Requirement: one generation point, declared outputs

`/search/` artifacts SHALL have exactly one writer (the build phase
after llms-txt in build-site.mjs); no other step writes there. The
artifact list is declared (corpus.json today); conflicts fail loud.

#### Scenario: a stray write into /search/

- WHEN any other build step writes into public/search/
- THEN the build fails naming the offender

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
