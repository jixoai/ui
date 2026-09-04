# search-corpus Specification

## ADDED Requirements

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
