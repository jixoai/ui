## MODIFIED Requirements

### Requirement: the variant grammar (prominence ladder + hue injection)

Surface paint variants SHALL come from the one ladder — `fill` /
`tonal` / `outline` / `ghost` — plus PressButton's `link` interaction
exception, plus the `fused` backdrop-fusion rung (2026-09-08, this
change: the separator's ink technique promoted to chip paint — the
quietest rung; paint derives from the ground behind the element, no
own color, no border, reading as the backdrop's own tonal shift,
theme-agnostic by construction). Semantic color is NEVER a variant
name: intent is expressed
by injecting values into the four global hue slots (`--jx-fill`,
`--jx-fill-ink`, `--jx-tonal`, `--jx-outline`; theme-owned,
inheritable). The action/status split is mandatory: destructive
ACTIONS inject `--destructive` (the fill pair), error STATUSES inject
`--error` into the tonal slot. Variant paint rides token utilities in
the markup (tw4 utility-authored law); press physics (`.jx-press`)
never change with paint. Availability is per-component (see the
frozen table in
openspec/changes/archive/2026-08-27-variant-grammar/design.md §4 —
the table itself is authoritative):
Badge fill/tonal/outline (default tonal, brand hue); InlineCode
fused/tonal/outline (default fused — 2026-09-08, this change: the
Owner retired tonal-as-default and minted the fused rung; tonal and
outline stay); Chip all four
(default tonal); PressButton fill/tonal/outline/ghost/link (default
outline); Alert outline/tonal (default outline — no fill/ghost:
banner readability); Blockquote outline/tonal (default outline, the
alert row shape — 2026-09-07, markdown-coverage: quote readability
excludes fill/ghost, ghost is interactive-chrome vocabulary, and the
borderless manuscript indent stays a future structural axis). Valued
`data-jx-*` hooks carry the variant
(`data-jx-badge`, `data-jx-alert`, `data-jx-press-button`,
`data-jx-chip`, `data-jx-blockquote`). The frozen table's per-component rows become the
`definePaintSlot(values, own)` calls in each family's Defaults —
the values array IS the family union's SOURCE (default ∈ values is
compile-locked; the runtime consumes no value-domain guard; the AST
gate asserts the array bidirectionally against the frozen table);
the family's exposed union derives from the slot
(`ReturnType<typeof slot>`); the previously implicit `??` chains
are the paint slot's `explicit ?? ambient(zone) ?? own` resolution.

The injection seam is TWO-LAYERED (hue-injection-utilities,
2026-08-27): the CANONICAL form for the curated semantic set is the
theme's TW4 `@utility` intent layer — `jx-hue-primary | neutral |
error | success | warning | info` (tonal slot) and
`jx-pair-destructive` (fill + fill-ink together, making the
always-inject-both law structural; there is no `jx-hue-destructive`
— the action/status split holds by construction). The
arbitrary-property class (`[--jx-tonal:var(--error)]`) remains the
escape hatch for values outside the closed set; ONE form per slot in
a class list (cross-form mixing is not dedupable). `cn()` registers
the closed set as tailwind-merge dedupe groups.

THE PHYSICS AXIS (Owner 2026-09-03), orthogonal to the paint ladder:
the ladder stays closed and paint still never touches physics, but
the axis that was implicit is now recorded.

- PressButton gains `raised?: boolean` (default `true`). The paint
  ladder is untouched; `raised` modulates ONLY the press law's poses,
  entirely through the pose-custom mechanism (`--jx-press-shadow`,
  `--jx-press-shadow-hover`, `--jx-press-shadow-active`, and the NEW
  `--jx-press-move` seam on the kernel's `:active` translate —
  `translate: var(--jx-press-move, 1px 1px)` keeps every existing
  button byte-identical).
- `raised={false}` (the FLAT texture): rest and hover carry NO
  shadow; the press pose re-points to the engrave tier (an inset —
  pressed-ness expressed as being pushed INTO the plane) and the
  press vector is nulled (`--jx-press-move: none`) — the body never
  moves, the inset alone creates the illusion of movement. The
  variant's own pose customs are stripped before the flat block is
  applied (no two same-property utilities in one class list —
  ghost's none-trio must not collide). NO rung loses its border in
  flat (Owner ruling 2026-09-04: tonal's 45% outline stays; fill /
  ghost were never visibly bordered; outline's border IS the
  variant).
- The press pose expressing pressed-ness as an inset is a sanctioned
  pose expression (the press pose IS the affordance); it is distinct
  from the well-at-rest law (input-class controls: hover changes
  intensity only, never tier). PressButton keeps the 1px border
  frame — an inset shadow is never the sole affordance (r14-12).
- `raised` is a press-law physics prop, NOT a vocabulary style prop:
  it never enters a family Defaults slot (the Defaults economy
  governs the style vocabulary; the physics lane keeps its own
  resolution below).

THE ZONE RESOLUTION (Owner 2026-09-04): the flat texture's default
is Context-scopable on the same zero-DOM boundary that scopes the
variant.

- `raised` carries NO static default. Resolution is
  `explicit ?? zone ?? true`: an explicit prop always wins, a
  Context-scoped zone default follows, the convex law is the resting
  default.
- The zone default rides its OWN context key (`PRESS_TEXTURE_KEY`,
  owned by press-button) — a physics axis key OUTSIDE the single-key
  paint law: `PAINT_ZONE_KEY` stays the ONE paint lane
  (`BUTTON_GROUP_KEY` carries layout only), and a ButtonGroup
  inherit-then-provides the paint zone (shadows it only when it
  declares a variant of its own) while TAKING the physics axis over
  at its own boundary (the cluster-shadow law, Owner 2026-09-04 —
  below).
- `ButtonVariantScope` (the zero-DOM zone boundary that already
  scopes the variant) carries `raised?: boolean`,
  inherit-then-provide: a paint-only scope (variant set, raised
  absent) passes the enclosing zone's texture through and never
  un-flattens it.
- THE CLUSTER-SHADOW LAW (Owner 2026-09-04): the joined row is ONE
  control, so it casts ONE shadow. A ButtonGroup writes the texture
  key with `raised=false` for its joined subtree (per-button convex
  shadows overlap at the -1px seams — the geometry defect this
  closes; an explicit child prop still wins) and paints the
  cluster's ONE convex shadow on its ROOT: `--shadow-xs` (the press
  law's rest pose), behind `:where()` so consumer shadow utilities
  win, with NO hover growth and NO active pose — the root never
  presses ("不用做什么 actived 的效果，只需要去除阴影即可" — the
  Owner's wording). The group's `raised?: boolean` resolves
  `explicit ?? the enclosing texture zone ?? the top-level convex
  default`, with one carve: a NESTED group defaults OFF (it is one
  member of the OUTER cluster — one control, one shadow).
  `raised={false}` removes the root shadow and NOTHING else; the
  subtree's flat default is unconditional.
- IconButton forwards `raised` verbatim (Owner 2026-09-04): the
  composition needs NO restate — the wrapped press-button reads the
  same ambient texture key in the same window, so the zone's flat
  default reaches the square (and a joined ⋯ overflow trigger) by
  construction; the explicit prop is the chrome escape hatch. The
  dialog head's × sits OUTSIDE the flat zones and keeps the convex
  law with no opt-out.
- The FOOT zones of Dialog and Card declare `raised={false}` on
  their zone scope (Owner 2026-09-04): foot buttons ride the
  engrave-tier inset press by default. Head zones, standalone
  footers, and every bare button keep the convex default — the zone
  scopes a DEFAULT, never a law.

#### Scenario: a failed status chip is authored

- WHEN a badge must read as failed
- THEN it is `<Badge variant="tonal" class="jx-hue-error">` (or the
  arbitrary equivalent) — never `tone="destructive"` and never the
  destructive ACTION hue

#### Scenario: a variant utility set is audited

- GIVEN any component's variant map after this change
- WHEN the source guard scans its markup
- THEN every variant's paint consumes the four global slots and no
  variant name encodes a semantic hue

#### Scenario: the frozen table reads through Defaults

- GIVEN the frozen availability table and a migrated family
- WHEN the family's Defaults is read
- THEN every available variant in the table is addressable through
  the paint slot's values array, the own default matches the table,
  and the array contains no variant outside its table row (link
  never reaches Badge/Chip/Alert)

#### Scenario: a flat button presses inward without moving

- WHEN a PressButton renders `raised={false}` with any framed rung
- THEN it carries the four pose customs (rest none, hover none,
  active engrave, move none), no same-property pose utility appears
  twice in its class list, and the 1px border frame remains
- WHEN it is pressed
- THEN the body does not translate and an inset (engrave-tier)
  shadow appears

#### Scenario: every existing button keeps today's physics byte-for-byte

- WHEN any button renders without `raised={false}`
- THEN the kernel resolves `--jx-press-move` to its `1px 1px`
  fallback and all three shadow poses resolve to the ladder
  defaults — nothing changes for any existing consumer

#### Scenario: a dialog footer button rides flat without any prop

- WHEN a PressButton renders inside a Dialog's footer (raw snippet
  or DialogFooter's grouped cluster) with no `raised` prop
- THEN it adopts the flat texture (the four pose customs; the
  grouped path included — the footer's ButtonGroup writes the flat
  texture itself, and the footer zone's raised={false} removes the
  cluster shadow too)

#### Scenario: an explicit raised beats the zone

- WHEN the same button renders `raised={true}`
- THEN none of the flat block's seams ride (`--jx-press-move`
  absent, no engrave re-point) — a convex ghost keeps its own
  none-trio, which is r13 ghost law, not flat

#### Scenario: the icon-only square rides the zone's physics

- WHEN an IconButton renders inside a flat foot zone — text posture,
  iconOnly square, or joined in the group (the overflow trigger) —
  with no `raised` prop
- THEN the wrapped press-button carries the flat texture (stamp +
  four pose customs) exactly like its text-button siblings
- WHEN it renders `raised={true}`
- THEN the square stays convex — chrome escape inside a flat zone

#### Scenario: the head stays convex and a bare button is unchanged

- WHEN a PressButton renders in a Dialog/Card HEAD zone, or outside
  any zone
- THEN the convex law holds byte-identically (no pose customs, the
  kernel's `1px 1px` fallback)

#### Scenario: a bare joined group casts one cluster shadow

- WHEN a ButtonGroup renders outside any texture zone with no
  `raised` prop
- THEN its root paints the one convex shadow (`--shadow-xs`, behind
  `:where()`) and every joined button without its own `raised` prop
  rides the flat texture (the group's texture write — the per-button
  convex shadows that overlapped at the seams are gone)

#### Scenario: the group's raised=false only removes the root shadow

- WHEN the same group renders `raised={false}`, or inside a zone
  that scopes `raised={false}` (a card/dialog foot)
- THEN the root carries no box-shadow and no hover/active shadow
  pose exists on it (the root never presses), while the joined
  buttons' flat default is unchanged — an explicit `raised={true}`
  on a child still wins

#### Scenario: a nested cluster casts no shadow of its own

- WHEN a ButtonGroup renders inside another ButtonGroup with no
  `raised` prop
- THEN the inner root paints nothing — the OUTER cluster owns the
  one shadow (one control, one shadow); an explicit `raised` on the
  inner group is the consumer's escape hatch


### Requirement: the text family (base + Raw exports)

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

The MODIFIER KERNEL (2026-09-08, this change): every member gains
the common text-modifier props — `lineHeight` (number ⇒ unitless
ratio, string ⇒ verbatim), `weight`, `italic`, `tracking`, `family`,
`fontSize` — resolved through the shared kernel
`lib/text-style.svelte.ts` (`resolveTextStyle`: props → utilities;
`fontSize` rides the arbitrary-property form; bare `size` naming is
banned — the AXIS_PROPS collision). The kernel file ships under the
text item; `inline-code` declares the `@jixoai/text` registry edge
and consumes the same kernel for its own text modifiers (shared
kernel, independent components — the Owner's ruling). THE
AMBIENT-SCALE AMENDMENT rides with it: an ABSENT modifier emits NO
utility and the ambient channels flow untouched (the trio's
inheritance, the prose scope's leading); an EXPLICIT modifier emits
its utility and beats the ambient — including the recorded interplay
ruling that an explicit member `lineHeight` (utilities layer) beats
the prose scope's `--jx-ty-leading` residue (components layer): the
layer law's own posture, now written down for the family.

#### Scenario: the modifier matrix

- WHEN `<Text mark="strong" italic fontSize="12px" lineHeight={1.5}>`
  renders
- THEN the strong member's own utilities (`font-semibold`) and the
  modifier utilities (`italic [font-size:12px] leading-[1.5]`) both
  land, the consumer class still merges LAST, and a `<Text>` with no
  modifiers emits zero modifier utilities — the ambient scale flows

#### Scenario: sugar equals the base

- WHEN `<Strong>x</Strong>` and `<Text mark="strong">x</Text>` render
- THEN both produce a `<strong>` with `data-jx-text="strong"` and the
  same class merge behavior — the exports are pure sugar

#### Scenario: the paragraph member keeps the prose law

- WHEN `<P>` renders inside a jx-pure scope
- THEN the face's paragraph channels (flow margins, the line-height
  un-short-circuit) still apply — the member adds no competing
  declarations



### Requirement: the markdown face (streaming AST → registry parts)

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
Link; `inline_code` → InlineCode (riding the component default
`lang="auto"` — 2026-09-08, this change, the Owner ruling: the
detection capability must reach markdown faces; the zero-work law is
restated as the detect-sync/highlight-async split — detection is the
chip's own zero-download fingerprint heuristic, synchronous and
markup-free, and the highlight is the async in-place upgrade through
the engine seam, SSR plain, zero layout shift, no per-span keyed
work); `thematic_break` → Separator. Task-item
checkboxes mount the BARE Checkbox (2026-09-08, the Owner ruling
用真组件): `<Checkbox bare checked disabled>` — the presentation-only
single input carrying the component paint class, staying the DIRECT
child (or the parser wrapping paragraph) the container-level
DOM-shape laws key on (`li:has(> input)` suppression, the
vertical-align alignment) which the interactive wrapper defeats;
the source text owns the state; the markdown item declares the
`@jixoai/checkbox` edge. The ESCAPE LAW
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

