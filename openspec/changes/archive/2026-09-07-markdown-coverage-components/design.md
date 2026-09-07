# design — the reading-content family and the first-party map

## 0. Context

The markdown face (2026-09-06) established the streaming laws (L1–L4),
the pinned-axes parse contract, the override seam, and the typography
trio (2026-09-07). Its default map sent exactly two node types to
registry parts; prose rode the jx-pure face. This change finishes the
assembly story the Owner named: markdown constructs become registry
parts, uniformly managed. The streaming laws are UNTOUCHED — components
mount inside the keyed item's inner subtree, which L1–L4 explicitly do
not govern.

## 1. The five components

All follow the alert/badge anatomy: header comment (prose law),
`{name}-defaults.svelte.ts` (frozen slots), deterministic utility maps,
valued `data-jx-{name}` hooks, `cn()` with consumer class LAST (the
layer law), forced-colors degradations per rung, NO font-size on roots
(the typography trio flows by inheritance — the `line-height: inherit`
un-short-circuit law keeps working because P never escapes the face).

### 1.1 blockquote — the quote/admonition surface

- Root: native `<blockquote>` (the semantic body; `cite` is an
  attribute-grade concept here, not an element swap).
- Props: `variant?` (`BlockquoteVariant`), `label?` (one-line heading
  rendered in the alert title-row form: `flex items-center gap-2
  font-nav text-[0.8125rem] tracking-[0.08em] uppercase` + the rung's
  title ink), `icon?` (Snippet, inline-start of the label — bring your
  own, the alert precedent), `cite?` (renders `<footer><cite>` — the
  MDN attribution posture), `children`, `class` + blockquote attrs.
- The ladder, availability frozen (`definePaintSlot(['outline',
  'tonal'], 'outline')` — the alert-shaped row: a quote's
  readability excludes fill AND ghost; ghost is interactive-chrome
  vocabulary — rest-transparent, hover-tonal, border geometry
  preserved — which a static quote misuses; the borderless
  manuscript indent is a FUTURE STRUCTURAL AXIS, never a paint rung):
  - `outline` (own) — transparent ground, left rule
    `[border-inline-start]` with `[border-color:var(--jx-outline)]`,
    `padding-inline-start 0.875rem`, body `text-muted-foreground`.
    The classic GitHub/Tailwind quote — visually continuous with the
    face's own blockquote rule it replaces.
  - `tonal` — the alert recipe verbatim: ground `color-mix(in oklab,
    var(--jx-tonal) 12%, transparent)`, border 45% mix (all four
    sides), `rounded px-3.5 py-3`, label/body inks per the alert's
    tonal row. The callout/Notion posture; hue rides injection.
- **The frozen-availability amendment chain** (a paint family must be
  frozen before it ships a paint slot — verify:context hard-fails
  otherwise): the row joins `scripts/context-coverage.config.json`'s
  `frozenAvailability`, the living spec's variant-grammar
  requirement family list, and the variant-grammar docs page's
  availability table (the archived 2026-08-27 table is historical —
  the living mirrors are what amend).
- Per-rung forced-colors degradation (Canvas/CanvasText + the 1px
  rule surviving on outline; the tonal ground drops to Canvas).
- Hook: `data-jx-blockquote={d.variant}`.

### 1.2 heading — the level-laddered heading

- Root: native h1–h6 by `level` (1–6, clamped), via `svelte:element`.
- Props: `level`, `id?`, `class` + heading attrs. NO paint ladder
  (level IS the structural axis — the separator precedent of a
  literal-axis-only component).
- What it OWNS (the face's B1 heading channels, escaped by no-jx-pure
  at mount): `font-bold leading-[1.25] text-foreground` + the em size
  ladder `[font-size:1.875em]` (h1), `1.5em`, `1.25em`, `1.125em`,
  `1em/1em` (h5/6) — MIGRATED from markdown.css §3 into the component
  so the ladder scales with the ambient font-size (the typography
  trio) AND the component works standalone. markdown.css §3 is
  deleted (the rules were `:not(.no-jx-pure)`-guarded — they stop
  matching the moment the component escapes, so keeping them there
  would be dead law).
- NO block margins (preflight zeroes heading margins; the container
  rhythm law owns root spacing, GitHub's container-tight posture owns
  nested). Hook: `data-jx-heading={level}`. NO defaults file (no
  public style prop — the Defaults law covers families with style
  props; `level` is not one).

### 1.3 list — the prose list

- Root: native `<ol|ul>` by `ordered`, `start` passthrough for ol.
- Owns (the face's B8 channels): `list-style: disc|decimal`,
  `padding-inline-start: 1.5rem`, marker ink
  (`[&_li]::marker:text-muted-foreground` or a two-line D1-exempt css
  residue — implementer's call by the placement law). NO block
  margins (the rhythm/flush laws own spacing, as with heading).
- Hook: `data-jx-list={ordered ? 'ol' : 'ul'}` (the separator's
  data-orientation form). The task-item rules (marker suppression,
  checkbox alignment) stay in markdown.css — they are container-level
  DOM-shape laws on `li:has(input)`, not list paint. NO defaults
  file (no public style prop).

### 1.4 link — the typographic link

- Root: native `<a>`. Props: `href`, `title`, `children`, `class` +
  anchor attrs.
- External detection (absolute `http(s)://`, the doc-link demo's
  pattern — ANY absolute http(s) href is external; no origin
  comparison, which would drag `window.location` semantics into SSR):
  `target="_blank" rel="noreferrer"` (the fleet convention —
  doc-link and PressButton both ship bare noreferrer; modern
  browsers imply noopener from it). Hook:
  `data-jx-link={external ? 'external' : 'internal'}`.
- Paint: carries the face B2 non-nav lane as its own utilities
  (`text-primary [text-underline-offset:4px] hover:underline`) so it
  stands alone; inside a jx-pure scope these coincide with the face's
  own values — same property, same token, deterministic no-op. It
  does NOT escape (see §2).

### 1.5 text — the family the Owner designed

- Base `text.svelte`: `<Text>` renders `<p>` by default (the Chakra
  `<Text>`-is-a-paragraph precedent); `mark` switches the element and
  paint:
  | mark | element | own utilities |
  |---|---|---|
  | — | `p` | none (face-composing; the p un-short-circuit law keeps applying) |
  | `strong` | `<strong>` | `font-semibold` (600 — GitHub/Tailwind Typography weight; a deliberate settle from the UA's 700) |
  | `em` | `<em>` | `italic` |
  | `del` | `<del>` | `line-through` |
  | `mark` | `<mark>` | highlight ground + the `0.05em 0.25em` padding box (mirrors the face's mark so standalone and in-face agree) — ground recipe: a low-alpha `color-mix` tint over a fixed hue token (implementation picks from the token inventory; forced-colors drops to the Highlight system color); vision review validates |
  | `ins` | `<ins>` | `underline` |
  | `sub`/`sup` | `<sub>`/`<sup>` | none (UA baseline shift is the law) |
- `mark` is a literal slot (`defineLiteralSlot([...], 'p')` — the
  kbd variant precedent: element vocabulary, own default, never
  zone-ambient). ONE vocabulary: the prop value, the sugar name, and
  the HTML element are the same word.
- Raw sugar: `p.svelte`, `strong.svelte`, `em.svelte`, `del.svelte`,
  `mark.svelte`, `ins.svelte`, `sub.svelte`, `sup.svelte` — each a
  ~5-line wrapper that renders `<Text mark={...}>` and forwards
  `class`/children/attrs. `text.svelte` carries a `<script module>`
  re-exporting them (`import Text, { Strong } from './text.svelte'`
  works), and `index.ts` re-exports the full set (the barrel law).
- Hook: `data-jx-text={form}` (form = the mark or `p`).
- FACE-COMPOSING: no member escapes no-jx-pure (§2). Two members
  DELIBERATELY override face channels (recorded settles, not
  accidents): `strong`'s `font-semibold` (600) overrides the face
  B1 `strong → 700` — the GitHub/Tailwind Typography emphasis
  weight; `mark` owns its highlight ground AND its `0.05em 0.25em`
  padding (mirroring the face's mark box) so standalone and in-face
  renderings agree. All other members are additive on channels the
  face does not declare for their elements.

## 2. The escape law, precisely scoped

The face rules are `:where(.jx-pure) element:not(.no-jx-pure,
.no-jx-pure *)` — an escape on an element ALSO descopes its whole
subtree. Two consequences drive the scoping:

1. **Box-owning block surfaces escape**: Blockquote, Heading, List
   mount `class="no-jx-pure"` (passed by the markdown map, the
   CodeCard form). Their roots carry no margin utilities, so the
   rhythm law's root-child rules (`[data-jx-markdown] > *`,
   (0,2,0), components layer) apply unopposed — NO carrier div
   needed, and because the roots ARE native blockquote/h*/ul/ol
   elements, the element-based rhythm selectors (`:is(h1,…,h6)` at
   1.75×) and the flush law (`:is(li, blockquote) > :first-child`)
   keep matching with zero retargeting.
2. **Inline and face-composing members do NOT escape**: P, the marks,
   Link. An inline escape would virally descope descendants a link or
   emphasis legitimately contains (code chips, images, nested marks).
   These components are semantic hooks + extension points over the
   face's own channels; their standalone utility story is Link's
   coinciding-values carve-out (§1.4) and the marks' additive paint
   (channels the face does not declare for these elements).
3. **Separator rides the carrier div** (the CodeCard m-0 precedent):
   its own `m-0` would beat the sibling-stack rule (utilities >
   components), so the map wraps it in a neutral div the rhythm
   lands on. InlineCode escapes directly (a chip's children are text
   — no face-styled descendants to descope).
4. **A block escape descopes container prose — and the sheet
   compensates.** Once Blockquote/List roots escape, the face's
   flow-margin rule stops reaching paragraphs INSIDE them (the
   `:not(.no-jx-pure *)` arm), and P carries no margins —
   multi-paragraph list items and quotes would collapse to
   wall-of-text. The markdown sheet therefore gains the
   container-inner sibling stack (§2c below): the flush law's
   positive counterpart, giving mid-container blocks the stack gap
   the face used to provide. (Edge recorded: native `dl` inside an
   escaped container loses the face's B8 grid — degrades to browser
   dl block flow, readable; the pure-text floor's dl is best-effort
   inside component containers.)
5. **Task-item checkboxes stay native** — the one wiring the map
   does NOT take. The Checkbox item is the interactive control
   (label[for] lanes, error wiring, density chrome) whose
   `div[data-density] > span > input` wrapper breaks BOTH
   container-level task rules: the `li:has(> input)` direct-child
   marker suppression (the double-marker bug would return) and the
   `vertical-align: middle` alignment (inert inside the flex
   lanes). A presentation-only marker is bare DOM the jx-pure
   bare-checkbox face already paints (appearance-none, bevel
   corners, clip-path check) — the face IS the component-equivalent
   for the bare element, which is the Owner's principle applied to
   Tier 0. Unlock recorded: a bare-input render mode on the
   checkbox item, or a container-selector rework.

**§2c · the container-inner sibling stack** (the new markdown.css
law, Lane C): the flush law's positive counterpart —

```css
[data-jx-markdown] :is(li, blockquote) > * + * {
  margin-block-start: var(--jx-md-stack, 0.875rem);
}
```

— at (0,1,1) it is deliberately WEAKER than the flush law's
`:first-child/:last-child` zeroing (0,2,1), so the composition is
order-independent: mid-container blocks stack, container edges stay
flush. It applies at every nesting level (the `:is()` matches
component roots and native containers alike — the roots ARE native
elements) and restores the gap the face's flow margins used to
provide before the block escapes descoped them.

## 3. The markdown map, after

| node | renders | escape |
|---|---|---|
| code_block | CodeCard (unchanged) | carrier div (existing) |
| table | Table in `div[data-kind="table"]` (unchanged) | carrier (existing) |
| blockquote | Blockquote — GitHub-alert detection first (§4) | root `no-jx-pure` |
| heading | `<Heading level>` | root `no-jx-pure` |
| list | `<List ordered start>` (children recurse — `list_item` stays native li) | root `no-jx-pure` |
| paragraph / inline | `<P>` | face-composing |
| strong / emphasis / strikethrough / highlight / insert / subscript / superscript | `<Strong> <Em> <Del> <Mark> <Ins> <Sub> <Sup>` | face-composing |
| link | `<Link>` | face-composing |
| inline_code | `<InlineCode lang="text">` (children recursed inside) | root escape |
| thematic_break | `<Separator />` | carrier div + root escape |
| checkbox_input / checkbox (task items) | native disabled input (the jx-pure bare-checkbox face owns it — §2.5) | — |
| image | native `<img>` (unchanged — see §5) | — |
| text / hardbreak / emoji / footnote bits / dl | native (the pure-text floor) | — |

The override seam is UNCHANGED and still consulted first; the default
map's growth changes nothing about its trust class.

**InlineCode lang**: `lang="text"` — markdown code spans carry no
language and the frozen map keeps the zero-work-per-span streaming
law (no grammar detection per chip; consumers who want detection use
the override seam).

## 4. GitHub alert detection (the default map's one new behavior)

- `detectBlockquoteAlert(node: BlockquoteNode): { kind: AlertKind,
  children: ParsedNode[] } | null` — a pure function in parse.ts
  (unit-tested directly): the node's first child must be a paragraph
  whose first child is a text node whose FIRST LINE fully matches
  `/^\[!(note|tip|important|warning|caution)\]\s*$/i`. On match: the
  marker line is stripped from that text node; if the paragraph is
  then empty it is dropped; the remaining children ship as the alert
  body. (Structural tolerance: if the paragraph's first child is an
  `inline` wrapper, the detector looks one level deeper into it —
  both AST shapes are pinned by tests.)
- Mapping: note→`jx-hue-info`, tip→`jx-hue-success`, important→
  `jx-hue-primary`, warning→`jx-hue-warning`, caution→`jx-hue-error`
  (error, never destructive — alerts are STATUSES; the variant-grammar
  action/status law). Label text: `Note Tip Important Warning Caution`.
- Render: `<Blockquote variant="tonal" class="no-jx-pure
  jx-hue-{hue}" label={label}>` with the stripped children. The hue
  class is a site utility (TW4 `@utility`, always available); it
  injects the tonal/outline tokens the tonal rung consumes.
- **Streaming law interplay**: the detector is a pure function of the
  node, so a half-typed marker (`[!NO`) simply does not match — the
  block renders the plain quote and keeps updating IN PLACE (L2: the
  tail item never remounts on content mutation). The marker
  completing is an inner-subtree swap, not a key change. When the
  block closes and stops being the tail, L3 keys it on its final
  digest — the alert face is already rendered by then; one bounded
  transition, never an extra one for the marker.
- Markers not on their own first line do not trigger (the GitHub
  rule); mixed-case triggers (GitHub behavior).

## 5. image stays native — the recorded unlock

The `image` item's Props make `width`/`height` REQUIRED ("the no-CLS
contract", `Omit<HTMLImgAttributes, 'alt'|'width'|'height'>`) and
markdown syntax carries no dimensions. Faking dims would defeat the
contract's purpose. The default map keeps the sanitized bare `<img>`
(face rules apply). **Unlock condition** (a followup on the image
item, not here): an explicit unknown-dims posture (e.g. a reserved
aspect-ratio lane with opt-in ratio) — then the map adds the edge.

## 6. Registry mechanics (per item, the alert/checklist anatomy)

- `registry.json`: files arrays (svelte + index [+ css]; defaults
  files ONLY for blockquote and text — heading/list/link carry no
  public style prop, and the Defaults law covers families with
  style props), `meta.group` + `meta.href`, `registryDependencies`:
  - blockquote: `@jixoai/utils @jixoai/jixoai-theme @jixoai/defaults
    @jixoai/density @jixoai/paint` (the alert set)
  - text: the same set minus paint if the mark slot stays
    literal-only (verify-deps four-state rules; declare what is
    imported, nothing more)
  - heading/list/link: `@jixoai/utils @jixoai/jixoai-theme`
  - markdown item: `+ @jixoai/blockquote @jixoai/heading @jixoai/list
    @jixoai/link @jixoai/text @jixoai/inline-code @jixoai/separator`
    (+7 — all live imports in markdown-node.svelte; verify-deps
    ratchets both undeclared imports and dead edges).
- Byte mirror → `apps/www/src/lib/ui/<name>/`, manifest regenerated.
- **NO meta files** (the alert/badge precedent): hand-authored
  PropsTable rows on the docs pages, following the ambient-vocabulary
  wording conventions voluntarily — the matrix's page bijection is
  frozen to the archived env-debt batch (an orphaned-row attack by
  design), so new pages ride the zero-increment debt policy and the
  meta-side carrier set stays at its pinned six.
- **The frozen-availability chain** (§1.1): the blockquote row in
  `scripts/context-coverage.config.json`, the living spec's
  variant-grammar family list, and the variant-grammar page table.
- Docs pages ×5 (skeleton: hero with group eyebrow, variant/format
  grids, usage, a11y hook tables, API PropsTable; the markdown page
  gains the coverage-map demo + the alert demo) + prerender entries
  ×5.
- `docs-structure.spec.ts`: the freeze count array (general +2,
  data-display +3) — LIVE totals are recounted before the edit (the
  comment trail has drifted; the new dated comment states the real
  sum) — with the dated comment.
- Blueprints: scenes ×5 + `build:blueprints` svgs.
- Hook-law inventory: the five new `data-jx-*` tokens join
  automatically (the inventory gate); no css-defined selectors may
  shadow them.

## 7. Tests

- Per-component specs (jsdom mount): hook stamps (variant/level/form
  values), Defaults semantics (bare → frozen own; a zone provider
  beats own; explicit beats zone — the kbd/badge spec pattern), label/
  cite/icon composition, level→element mapping, ordered/start, link
  external attributes, the text mark matrix + sugar equivalence
  (Text mark=x ≡ Raw export x: same element, same hook, same class
  merge behavior).
- markdown-render additions: the full map matrix (each node type →
  the expected component root + hook), the escape scoping (blockquote/
  heading/list/inline-code roots carry no-jx-pure; P/marks/
  link do NOT), the container-inner stack (multi-paragraph li/bq
  keeps its gaps; the no-disc task-item rule still holds), the
  alert matrix (five kinds, case-insensitive, mid-line non-trigger,
  multi-line first paragraph, the inline-wrapper AST shape,
  empty-after-strip paragraph dropped), streaming tolerance (feed
  `> [!NO` … `> [!NOTE]` through the adapter; assert the keyed item
  identity held — the component prop swapped, no remount),
  thematic_break → Separator.
- A perf-shaped guard, STRUCTURAL not wall-clock (CI timing flakes
  are a recorded non-goal): stream a mark-dense document (hundreds
  of inline nodes across blocks) and assert prefix-key invariance
  plus the block-count/render-shape outcome — the regression trip
  wire for per-node componentization cost.

## 8. The HTML equivalence lane (the Owner's 2026-09-07 addition)

> Original ask: "markdown 格式里面可能会夹杂 HTML 的格式。这种情况下，
> 我们需要对这些我们能够替换的 HTML 换成我们内部的组件……
> `some <b>text</b>` 与 `some **text**` 二者应该是完全等价的。
> 还有非常常见的 summary、detail 这套 HTML 组合……替换成我们的
> 手风琴组件。前提是手风琴得用 summary/detail 这套 Native-HTML5
> 二次开发，而不是 div 模拟——这是我们项目一贯的风格，正如
> input 一样。" (The precondition holds: accordion IS native
> details/summary — "W3C-first", header line 3 — verified before
> design.)

### 8.1 The discovery that makes it cheap

The parser's STRUCTURE layer parses HTML into typed nodes —
probe-verified under the REAL nested pin: `some <b>text</b>` yields
`html_inline { tag:'b', attrs:[], children:[text] }` beside the
`strong` node from `**md**`; `<details><summary>T</summary>` yields
`html_block { tag:'details', children:[html_block (tag:summary),
paragraph…] }` with markdown INSIDE the body parsed normally;
hostile `<script>` arrives as `html_inline { tag:'script' }` — a
node, never executed. REQUIRING html:true (the §8.5 amendment): a
first probe wave ran flat factory options, silently falling to
markdown-it's html:true default and overpromising what html:false
delivers — under the real pin, html:false structures only the
INLINE_HTML_TAG_NAMES members and never runs the html_block rule.
The floor is render-side either way: there is no {@html} path at
all, and unknown tags degrade to escaped text.

### 8.2 The frozen tag map (spec-level vocabulary)

HTML is the same document language as markdown spelled differently —
the map routes by SEMANTICS, so each pair lands in ONE component:

| html | renders | markdown equivalent |
|---|---|---|
| b, strong (inline) | Strong | `**x**` |
| i, em | Em | `*x*` |
| del, s, strike | Del | `~~x~~` |
| ins, u | Ins | `++x++` |
| mark | Mark | `==x==` |
| sub / sup | Sub / Sup | `H~2~O` / `x^2^` |
| code | InlineCode (`lang="text"`) | `` `x` `` |
| kbd | Kbd | — (html-only vocabulary) |
| a (href) | Link (url re-validated at map time) | `[x](url)` |
| br | native `<br>` | hardbreak |
| img | sanitized native `<img>` | `![alt](src)` |
| details | AccordionItem (consecutive runs merge into one Accordion group) | — |
| hr (block) | Separator behind the carrier | `---` |
| summary | consumed structurally by the details branch; a stray one is escaped text | — |

Everything else — script, style, iframe, div, span, html-spelled
tables/headings, ANY tag outside the map — renders as escaped literal
text (the security floor, unchanged). Attributes: href/src ride the
package's URL safety (`isUnsafeHtmlUrl`/`sanitizeImageSrc` — the html
path does NOT inherit markdown-it's validateLink, so the map
re-validates); event-handler and dangerous attributes never pass
(`DANGEROUS_HTML_ATTR_NAMES`); `class`/`style` on html tags are
dropped (v1: zero style passthrough — documented; consumers style
via the components they override). `<details open>` maps to
AccordionItem `open`.

### 8.3 The accordion group merge

Consecutive top-level details blocks are ONE accordion, not a pile of
framed boxes: parse.ts post-processes the node list (a pure
transform, before keying) replacing each maximal run of
`html_block(tag:details)` with a synthetic `accordion_group` block
carrying `{ summaryChildren, children, open }[]` items. The block
type is declared locally in parse.ts (the parser's union stays
untouched; `MarkdownBlock.node` widens to `ParsedNode |
AccordionGroupNode` — the components-seam lookup simply finds no
override for it, which is correct: app-level grouping decisions ride
the html-node overrides). Digests key on the synthetic node's
stableStringify: append-only growth that adds a second details after
a settled one changes the group's digest — one bounded remount per
semantic event (the link-reference-definition precedent). Streaming:
an unclosed `<details>` arrives auto-closed by the parser; the tail
block updates in place under L2 like any other block.

### 8.4 The equivalence law (tested)

For every pair in the table, the markdown spelling and the html
spelling produce the IDENTICAL component root: same element, same
valued hook, same utility classes. The render matrix pins this
side-by-side; `some <b>text</b> and **md**` renders two Strong
instances, indistinguishable.

### 8.5 Scope guards

- **The pin amendment**: html rides TRUE (markdownItOptions.html) —
  under html:false the structure layer only structures the
  INLINE_HTML_TAG_NAMES members and the html_block rule never runs
  (strike/details/kbd invisible). The security floor moves FULLY
  render-side and holds there: zero {@html} anywhere, the frozen tag
  table routes the whitelist onto components, and every other tag's
  content interpolates as escaped literal text (script/div/span
  arrive as structured nodes the mapper escapes — probe-verified
  under the real nested pin). One REAL gap the amendment exposed and
  closes: the parser's html-anchor pre-conversion bypasses
  markdown-it's validateLink, so the link branch re-validates every
  href (isUnsafeHtmlUrl) — unsafe hrefs render their text with no
  anchor (one defense line covering both syntaxes).
- The whitelist is FROZEN at spec level (adding a tag is a spec
  change, not a patch); `u → Ins` and `kbd → Kbd` are the two
  pragmatic pairings recorded here for review.
- Nested details recurse (a details child of an item's body renders
  its own accordion face) — in the CONTIGUOUS form (no blank lines:
  CommonMark's html_block rule fragments at blank lines, and the
  fragments render as separate groups plus escaped stray closers; a
  documented boundary, not a defect to patch in the parser's lane).
- markdown item's registryDependencies gain `@jixoai/accordion` and
  `@jixoai/kbd` (+2 edges).
- The markdown docs page gains the equivalence demo (side-by-side
  spellings) and an accordion demo (consecutive details blocks,
  `<details open>`, mixed markdown bodies).

## 9. Verification

`pnpm verify:all` end-to-end (the composite gate; new items ride the
existing generic assertions — registry-shape, mirror, context, deps,
budgets, docs, meta, print, shadcn-add probes). Vision round (the
Owner's standing ask for visual work): the five docs pages + the
markdown page at all three typography presets — ladder continuity,
alert hues, rhythm invariants, the html-equivalence render, the
accordion faces, forced-colors spot check.

