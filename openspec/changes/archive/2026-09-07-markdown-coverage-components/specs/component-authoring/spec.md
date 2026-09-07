# ADDED Requirement: the blockquote face (quote and admonition)

The `blockquote` item is the reading-content quote surface: a native
`<blockquote>` root carrying a frozen two-rung prominence ladder
(`outline | tonal` — the alert-shaped row: a quote's readability
excludes fill AND ghost; ghost is interactive-chrome vocabulary —
rest-transparent, hover-tonal, border-geometry-preserved — which a
static quote misuses, and the borderless manuscript indent is a
future structural axis, never a paint rung) with hue by injection,
an optional uppercase `label` row (the alert title-row form), an
optional `icon` snippet inline-start of the label, and an optional
`cite` attribution rendered as `<footer><cite>` (the MDN posture).
`outline` (the own) is the classic left-rule quote — transparent
ground, `--jx-outline` rule, muted body; `tonal` is the alert recipe
verbatim (12% ground / 45% border / tonal inks, rounded box). The
availability row joins the frozen-availability chain (the
context-coverage config, the variant-grammar family list, and the
variant-grammar page table — a paint family is frozen before it
ships a paint slot). Every rung carries its forced-colors
degradation; the root carries no font-size (ambient scale flows by
inheritance); the consumer class merges LAST. The root stamps the
valued hook `data-jx-blockquote={variant}`.

#### Scenario: the ladder renders two postures

- WHEN the two variants mount side by side
- THEN outline shows only the left rule with muted body while tonal
  shows the tinted rounded box consuming the ambient (or injected)
  tonal tokens — both read the same body text at the ambient size

#### Scenario: attribution and label compose

- WHEN `label="Note"` and `cite="Edsger W. Dijkstra, 1968"` are set
- THEN the uppercase label row renders above the body in the rung's
  title ink and the attribution renders as a `footer > cite` after
  the body

#### Scenario: hue is injection, never a variant

- WHEN a caller adds `class="jx-hue-warning"` on the tonal rung
- THEN the box's ground, border, and inks re-tint to the warning
  tokens without any variant change — the ladder vocabulary stays
  closed

# ADDED Requirement: the heading face (level as the axis)

The `heading` item renders the native `h1`–`h6` chosen by a `level`
prop (1–6, clamped) with NO paint ladder — the level is the structural
axis (the literal-axis-only precedent). It OWNS the heading channels
the jx-pure face holds for bare headings: bold weight, 1.25 leading,
foreground ink, and the em-based size ladder (`h1` 1.875em → `h5/6`
1em) migrated from the markdown item's sheet so every ambient
font-size (the typography trio, or any host) rescales the hierarchy
proportionally and the component stands alone outside any face. It
carries NO block margins — root-level spacing belongs to the
container's rhythm law and nested headings sit container-tight (the
GitHub posture). The root stamps `data-jx-heading={level}`.

#### Scenario: the ladder scales with ambient size

- WHEN the same `<Heading level={2}>` renders inside containers at
  13px, 14px, and 16px ambient font-size
- THEN the rendered size tracks 1.5em of each ambient — the
  hierarchy ratios hold at every preset

#### Scenario: the element is the level

- WHEN `level={3}` is passed
- THEN the root element is `h3` carrying `data-jx-heading="3"` —
  semantics never move with styling

# ADDED Requirement: the prose list face

The `list` item renders the native `<ol>` or `<ul>` chosen by
`ordered` (with `start` passthrough for ordered lists) and OWNS the
document-flow list channels the face restores for bare lists:
disc/decimal markers, the 1.5rem inline indent, and muted marker ink.
It carries no block margins (rhythm and flush laws own spacing) and
no paint ladder. It is the PROSE list — deliberately distinct from
`list-item` (the antd/F7 row system); the docs pages state the
distinction. The root stamps `data-jx-list={ordered ? 'ol' : 'ul'}`.

#### Scenario: ordered start passthrough

- WHEN `<List ordered start={4}>` renders
- THEN the root is `<ol start="4">` with decimal markers and the
  first item reads 4

# ADDED Requirement: the typographic link face

The `link` item is the text link for prose: a native `<a>` carrying
the face's non-nav link paint as its own utilities (primary ink,
4px underline offset, underline on hover) so it stands alone, plus
automatic external behavior — absolute `http(s)` hrefs get
`target="_blank" rel="noreferrer"` (the fleet convention; modern
browsers imply noopener) while relative hrefs navigate in place (no
origin comparison — `window.location` semantics have no place in an
SSR-safe component). It does NOT escape the face (an inline escape
would descope the face rules of its legitimate descendants — code
chips, marks, images); inside a face scope its utilities coincide
with the face's own values (same property, same token — a
deterministic no-op). The root stamps
`data-jx-link={external ? 'external' : 'internal'}`.

#### Scenario: external opens safely

- WHEN `href="https://example.com"` renders
- THEN the anchor carries `target="_blank" rel="noreferrer"` and
  `data-jx-link="external"`

#### Scenario: relative stays in place

- WHEN `href="/docs"` renders
- THEN no target/rel are added and the hook reads `internal`

# ADDED Requirement: the text family (base + Raw exports)

The `text` item is the Owner-designed prose family. The base `<Text>`
renders `<p>` by default (the Chakra `<Text>` precedent); a `mark`
literal slot switches the element and paint: `strong|em|del|mark|
ins|sub|sup` — ONE vocabulary where the prop value, the Raw export
name, and the HTML element are the same word. The Raw semantic
exports `P Strong Em Del Mark Ins Sub Sup` are thin sugar wrappers
importable from `text.svelte` itself (module re-export) AND the index
barrel — the learning cost is one component or eight, whichever the
consumer reaches for. The family is FACE-COMPOSING (no member mounts
the no-jx-pure escape): the members are semantic hooks and extension
points over the face's prose channels. Two members DELIBERATELY
override face channels (recorded settles): `strong` at 600
(`font-semibold` — the GitHub/Tailwind emphasis weight, settling the
face B1's 700) and `mark` owning its highlight ground AND its
`0.05em 0.25em` padding box (mirroring the face's mark so standalone
and in-face renderings agree). All other members are additive on
channels the face does not declare for their elements (italic;
line-through; underline; UA baseline shift for sub/sup).
Every member stamps `data-jx-text={form}` (form = the mark, or `p`).

#### Scenario: sugar equals the base

- WHEN `<Strong>x</Strong>` and `<Text mark="strong">x</Text>` render
- THEN both produce a `<strong>` with `data-jx-text="strong"` and the
  same class merge behavior — the exports are pure sugar

#### Scenario: the paragraph member keeps the prose law

- WHEN `<P>` renders inside a jx-pure scope
- THEN the face's paragraph channels (flow margins, the line-height
  un-short-circuit) still apply — the member adds no competing
  declarations

# MODIFIED Requirement: the markdown face (streaming AST → registry parts)

The `markdown` item renders a markdown source string (a value-domain
payload — the code-card "code strings" precedent) by mapping parser AST
nodes onto registry parts and native elements. It parses through the
framework-free `stream-markdown-parser` core under a PINNED-AXES
contract (html:true — the equivalence amendment, 2026-09-07: the
html_block/html_inline rules must run for the frozen tag table to
see strike/details/kbd; the security floor lives render-side — zero
{@html}, whitelist→component, everything else escaped; linkify:true,
typographer:false, breaks:false,
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

**The default map is first-party parts** (2026-09-07, the Owner's
assembly ruling — every rendered construct without a registry part
got one; editing the component IS how a consumer changes the markdown
rendering): `code_block` → CodeCard; `table` → a semantically neutral
`div[data-kind="table"]` harvest carrier wrapping Table with generated
thead/tbody, `td[data-label]` header text (the stack law) and column
alignment; `blockquote` → Blockquote; `heading` → Heading; `list` →
List (list_item stays native li by recursion); `paragraph`/`inline`
→ P; the emphasis family → the text family's Raw marks; `link` →
Link; `inline_code` → InlineCode (`lang="text"` — the zero-work
per-span streaming law); `thematic_break` → Separator. Task-item
checkboxes stay native disabled inputs: the Checkbox item is the
interactive control whose `div > span > input` wrapper breaks the
container-level `li:has(> input)` marker suppression and makes the
alignment rules inert in its flex lanes — a presentation-only marker
is bare DOM the jx-pure bare-checkbox face owns (Tier 0 IS the
component-equivalent for the bare element; the unlock — a bare-input
render mode on the checkbox item — is recorded). The ESCAPE LAW
is scoped, not blanket: box-owning block roots (Blockquote, Heading,
List) and subtree-free leaves (the InlineCode chip) mount the face's
`no-jx-pure` reverse scope and own their paint channels; Separator
rides the neutral carrier div (its `m-0` would beat the rhythm's
sibling stack — the CodeCard precedent); the face-composing members
(P, the marks, Link) do NOT escape — an inline escape would descope
the face rules of their legitimate descendants, so they stay semantic
hooks over the face's channels. Because a block escape descopes
container prose (the face's flow margins stop reaching paragraphs
inside an escaped root), the sheet carries the container-inner
sibling stack — the flush law's positive counterpart, weaker by
specificity so container edges stay flush while mid-container blocks
keep their gaps. The rhythm law needs no retargeting: the
components' roots ARE the native blockquote/h*/ul/ol elements its
element-based selectors match. The pure-text floor stays native
(text, hardbreak, emoji, footnote bits, dl) and `image` stays a
sanitized bare `<img>` — the image item's REQUIRED width/height
no-CLS contract cannot be satisfied from markdown syntax (recorded
with its unlock condition: an unknown-dims posture on the image
item). Unknown node types fall back to extracted text ONLY (no
structural recursion into unvocabularyed types). Images whose src
does not survive sanitization are omitted entirely.

**HTML is markdown spelled differently — the equivalence law**
(2026-09-07, the Owner's addition): under the html:true amendment
the parser's structure layer delivers PARSED html nodes
(`html_inline`/`html_block` carrying tag, attrs, and children —
probe-verified), so the map routes by semantics through a FROZEN tag
table and the two spellings land in ONE component: b/strong →
Strong, i/em → Em, del/s/strike → Del, ins/u → Ins, mark → Mark,
sub/sup → Sub/Sup, code → InlineCode, kbd → Kbd, a → Link (href
re-validated at map time — the html path does not inherit
markdown-it's validateLink), br → native br, img → the sanitized
native img, hr → Separator, and details/summary → the accordion
(native-details-built, the W3C-first item) with consecutive
top-level details runs merged into ONE Accordion group by a pure
parse-side transform (a synthetic accordion_group block typed
locally; digests key on its canonical form — a group that grows
remounts once per semantic event, the link-reference-definition
precedent; `<details open>` maps to the item's open). Every tag
outside the table — script, style, iframe, div, span, html-spelled
tables/headings — renders as ESCAPED LITERAL TEXT, never markup;
event-handler and dangerous attributes never pass; class/style on
html tags are dropped. The whitelist is frozen at this spec level:
adding a tag is a spec change, never a patch.

**GitHub alert detection is the default map's one synthetic
behavior**: a pure full-line match of `[!NOTE|TIP|IMPORTANT|WARNING|
CAUTION]` (case-insensitive) on the blockquote's first paragraph's
first text child routes the node onto Blockquote's tonal rung with a
status-hue injection (note→info, tip→success, important→primary,
warning→warning, caution→error — never destructive; the
action/status law) and the uppercase label row, the marker line
stripped from the body. Detection is a pure function of the node: a
half-typed marker does not match (the plain quote renders and keeps
updating in place under L2 — the marker completing is an
inner-subtree swap costing zero remounts), and markers not on their
own first line never trigger.

**The typography trio** (2026-09-07, the Owner's standardization ask):
a `typography` prop — compact 13px/1.55 with an 8px block stack,
standard 14px/1.7 at 14px (the default), relaxed 16px/1.75 at 20px,
calibrated against GitHub's renderer and Tailwind Typography — stamps
`data-jx-typography` and OWNS the prose scale (deliberately not the
UI-density ladder; the `density` word belongs to that axis family).
The block rhythm is a single collapse-immune law: root children are
flow-root with margins zeroed (the double-attribute selector beats
every face element rule), the adjacent-sibling stack drives every
gap, headings breathe at 1.75× (the em ladder itself lives on the
Heading component — ambient-scaled by construction); container
content flushes at the edges (GitHub's `li > p` posture); the face's
element-level `p { line-height: 1.6 }` is un-short-circuited to
inheritance. The preset also maps onto the ambient density slot for
CONTEXT-consuming nested chrome (compact→sm, standard→default,
relaxed→lg — the inherit-then-provide lane; the root never stamps
`data-density`, so the face's CSS density adoption stays untouched).

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

- WHEN the source contains `<script>` or any tag outside the frozen
  html table
- THEN it survives as visible literal text (escaped by interpolation);
  no html node outside the whitelist is ever rendered as markup

#### Scenario: the two spellings are one component

- WHEN `some <b>text</b> and **md**` renders
- THEN both emphases are Strong roots with `data-jx-text="strong"` —
  element, hook, and classes indistinguishable between the html
  spelling and the markdown spelling

#### Scenario: consecutive details blocks are one accordion

- WHEN the source contains two adjacent `<details><summary>` blocks
  (optionally `<details open>`) with markdown bodies
- THEN they render as ONE Accordion group whose items are native
  details/summary AccordionItems — summaries from the summary
  elements, bodies parsing their markdown — and the open attribute
  carries through

#### Scenario: hostile attributes never ride

- WHEN an html anchor carries an unsafe href scheme or an event
  handler attribute
- THEN the href fails re-validation (text, no anchor) and the handler
  attribute is dropped — no html attribute reaches the DOM unsanitized

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

#### Scenario: every construct renders its registry part

- WHEN a kitchen-sink document renders (quote, headings, lists, task
  items, emphasis of every kind, links, inline code, a rule)
- THEN each component-mapped construct's root carries its valued hook
  (`data-jx-blockquote`, `data-jx-heading`, `data-jx-list`,
  `data-jx-link`, `data-jx-text`, …) — editing that component changes
  the construct's rendering; the box-owning roots carry the
  no-jx-pure scope while the face-composing members do not; task
  items keep their native disabled inputs under the bare-checkbox
  face with no disc marker

#### Scenario: a GitHub alert settles mid-stream with zero remounts

- WHEN a streaming blockquote's first line grows from `> [!NO`
  through `> [!NOTE]` into a full body and the block then closes
- THEN the block renders the plain quote until the marker completes,
  swaps to the tonal alert face as an in-place inner-subtree update
  (the keyed item identity holds), and settles on its digest key at
  L3 exactly once — the marker never costs an extra transition
