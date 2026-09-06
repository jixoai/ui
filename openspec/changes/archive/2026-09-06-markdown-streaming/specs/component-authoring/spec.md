# ADDED Requirement: the markdown face (streaming AST → registry parts)

The `markdown` item renders a markdown source string (a value-domain
payload — the code-card "code strings" precedent) by mapping parser AST
nodes onto registry parts and native elements. It parses through the
framework-free `stream-markdown-parser` core under a PINNED-AXES
contract (html:false, linkify:true, typographer:false, breaks:false,
stream:true, math/containers off, fixIndentedCodeBlock on, no custom
tags — the axes that reach parse + AST vocabulary; anything else is
out of the frozen contract and the vocabulary test matrix catches
drift on a pinned axis) and owns its renderer outright: every DOM
node, style law, and contract marker is first-party.

**Streaming is the keyed-block contract**, not a re-render. The laws
govern the KEYED ITEM (the generic per-block component), never its
inner subtree (inner elements swap freely as the tail re-parses;
stateful inner parts own their transitions through their guards):

- **L1 prefix freeze** — non-tail blocks key on
  `${index}:${type}:${digest}` where the digest is fnv1a over a
  canonical stable-stringify of the whole node (key-sorted recursive
  canonical JSON, undefined dropped, sourceMap excluded — unknown and
  future fields covered by construction; the serialization is
  versioned with golden fixtures). Append-only source growth keeps
  prefix digests invariant, so keyed-each preserves items and DOM.
  Document-level constructs (link reference definitions) can still
  alter an earlier block's children; its digest then changes and it
  remounts — a prefix item remounts ONLY when its semantic digest
  changes, never on tail growth alone.
- **L2 tail in place** — while `streaming`, the last top-level block
  keys `${index}:${type}:tail` (digest dropped, type kept as the
  transition discriminator): the item persists while its content
  mutates — including when an open fence closes while remaining the
  tail (no remount at fence-close). A tail type transition swaps the
  key — one clean remount, no stale inner state.
- **L3 bounded key transition** — the tail key swaps to its digest
  when the block stops being the tail (a successor appears) OR the
  stream finalizes. A block that also type-transitioned while tail
  may remount twice in total (transition + finalize). The law bounds
  remounts to one per semantic event; it never promises exactly-once
  per block.
- **L4 final convergence** — `streaming → false` re-parses with final
  semantics; the frozen prefix stays mounted.

**The parse adapter is a state machine**: every parse derives
`final = !streaming` (`streaming` defaults false — a static document's
first parse runs final semantics immediately, never a loading state);
the parser-instance lifecycle keys on SOURCE history — non-append
input (replacement, shortening, rollback, message switch) is detected
against the accumulated source and answered with a fresh parser
instance, deterministic reset, never a stale cache; a
`streaming:false → true` restart on an extending source resumes
streaming on the same instance. The package's module-global plugin
registry is a TRUSTED PROCESS BOUNDARY (the components-seam trust
class): the item never mutates it; detection of ambient plugins at
instance creation emits one dev-mode warning stating that the
vocabulary AND parser-level URL-security guarantees are BOTH
suspended (a plugin can override validateLink — probe-verified; only
the renderer's own laws always stand) — globals apply at creation
only, so existing instances stay immune to later registrations. The
component is a pure function of `(source, streaming)`: server render
and client hydrate the same prop snapshot, so hydration is
shape-identical (the snapshot law).

**The default map** (overridable per node type): `code_block` →
CodeCard; `table` → a semantically neutral `div[data-kind="table"]`
harvest carrier wrapping Table with generated thead/tbody,
`td[data-label]` header text (the stack law) and column alignment;
prose (headings, paragraphs, emphasis family, lists + task checkboxes,
blockquote, hr, links, images) → native elements under a `jx-pure`
scoped root (the Tier-0 consumption form: the class mounts on the
root, the sheet imports once from the site css — never a forked copy
of the face laws, never a second component-level import that would
double-bundle it);
`inline_code` → the native code chip (zero async per-span work while
streaming). Every html node renders as escaped literal text — never
markup. Unknown node types fall back to extracted text ONLY (no
structural recursion into unvocabularyed types). Images whose src does
not survive sanitization are omitted entirely.

**The `components` prop is the payload's content escape AND a trust
boundary**: per-node-type components receiving `{ node }`, delegating
children through the exported MarkdownNode. Overrides are trusted
application code — the security floor covers the default map and
parser-level demotions, and the docs state this boundary. The root
stamps `data-jx-markdown` (identity hook) and
`data-jx-markdown-streaming` while streaming — both names frozen at
this spec level, boolean-presence semantics, stable for tests and
consumer selectors.

#### Scenario: streaming an open code fence

- WHEN `streaming` is true and the source ends inside an open fence
- THEN the in-progress code renders through CodeCard with the partial
  code, and the keyed item never remounts across chunk arrivals while
  it stays the tail (L2) — even when the fence CLOSES but the block
  remains last; its key transitions from `:tail` to the digest (one
  bounded remount, L3) when a successor block appears or the stream
  finalizes

#### Scenario: the tail changes type mid-stream

- WHEN a streaming tail paragraph becomes a heading as tokens arrive
- THEN the tail key's type discriminator swaps and the tail item
  remounts clean — inner state never crosses a type boundary

#### Scenario: non-append input resets deterministically

- WHEN `source` is replaced, shortened, or the component is recycled
  for a new message
- THEN the adapter drops its parser instance and stream cache and
  re-parses from scratch — no stale cache, no throw

#### Scenario: raw HTML never executes

- WHEN the source contains `<script>` or inline HTML
- THEN it survives as visible literal text (escaped by interpolation);
  no html node is ever rendered as markup

#### Scenario: a consumer overrides one node type

- WHEN `components={{ link: GlossaryLink }}` is passed
- THEN link nodes render through GlossaryLink with `{ node }` while
  every other node type keeps the default map, and the override can
  delegate children through the exported MarkdownNode

#### Scenario: GFM tables join the responsive laws for free

- WHEN the source contains a GFM table
- THEN it renders through Table with `td[data-label]` carrying the
  header cell text, so the stack law (<30rem card rows) shows labels
  with no consumer opt-in, and column alignment from the delimiter
  row is preserved

#### Scenario: hydration matches the server frame

- WHEN the page prerenders with a given `(source, streaming)`
  snapshot
- THEN the client hydrates the same snapshot to shape-identical DOM —
  parsing is synchronous in both runtimes and keys derive only from
  the snapshot
