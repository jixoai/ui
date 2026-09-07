# markdown-coverage-components — the reading-content component family (the map goes first-party)

> Original request (user, 2026-09-07): "我们需要新增 blockquote 组件。
> 这是因为我们本身是一种 shadcn 的风格的组件组装模式，如果 Markdown
> 中存在我们没有的组件，那么我们就要将它提取成组件，目的是开发者
> 可以通过修改组件就可以修改 Markdown 中的相关渲染。blockquote 组件
> 需要支持多种变体。按照业内的风格来设计。另外，除了 blockquote，
> 还有什么组件是欠缺的？" — followed by the two Owner rulings that
> shaped scope: (1) the "typography stays on the face, not components"
> split is RETIRED — every markdown construct without a registry part
> gets extracted, uniformly managed; (2) the text family design: a
> `text.svelte` base that implements `<Text mark="…">`, exporting the
> Raw semantic components (`P Strong Em Del Mark Ins Sub Sup`) from the
> same module to cut learning cost, with `<P>` as the paragraph member.

## Why

The markdown face (2026-09-06) mapped exactly two node types onto
registry parts — `code_block` → CodeCard, `table` → Table — and let
the jx-pure face style every other construct as bare native elements.
That was the right v1: zero new surface, the Tier-0 consumption form.
But it leaves the assembly promise half-kept: a consumer who wants to
restyle how markdown renders a **blockquote, heading, list, link,
paragraph, or inline emphasis** has no component to edit — the law
lives in a CSS face shared with every other consumer. The Owner's
ruling names the principle: this is a shadcn-style assembly registry;
if markdown renders it and we have no part for it, extracting the part
IS the product. Editing the component must be how you change the
markdown rendering.

The industry styling references the Owner named for blockquote:
GitHub's bordered quote, the tinted callout/Notion posture, the
borderless manuscript indent — one component, a small variant set,
hue by injection. GitHub's alert syntax (`> [!NOTE]` … `[!CAUTION]`)
is the de-facto standard for admonitions in markdown and the parser
treats it as plain text (probe-verified) — renderer-level detection
routes it onto the same component.

## What Changes

1. **Five new registry:ui items** (the reading-content family):
   - `blockquote` (data-display) — native `<blockquote>` root, the
     alert-shaped two-rung ladder `outline | tonal` (a quote's
     readability excludes fill AND ghost — ghost is interactive-chrome
     vocabulary: rest-transparent, hover-tonal, border-preserved;
     the borderless manuscript indent is recorded as a followup
     structural axis, never a paint rung), optional `label` row (the
     alert title-row form) and `cite` attribution
     (`<footer><cite>`). The ladder row joins the frozen-availability
     chain (context-coverage config + the living spec's
     variant-grammar family list + the variant-grammar page table —
     a paint family must be frozen before it ships a paint slot).
   - `heading` (data-display) — native h1–h6 by `level`, the em-based
     size ladder MIGRATED INTO the component from markdown.css §3 so
     it scales with the typography trio and works standalone.
   - `list` (data-display) — the prose `<ol|ul>` (list-style, indent,
     marker ink); deliberately distinct from `list-item` (the antd/F7
     row system — the docs pages disambiguate).
   - `link` (general) — the typographic text link (the doc-link
     demo's pattern promoted): external http(s) hrefs get
     `target=_blank rel="noreferrer noopener"` automatically.
   - `text` (general) — the family the Owner designed: `<Text>` base
     (bare → `<p>`, the Chakra precedent) with a `mark` literal slot
     (`strong|em|del|mark|ins|sub|sup` — the HTML element vocabulary,
     one word for the prop, the sugar, and the element), plus Raw
     semantic exports `P Strong Em Del Mark Ins Sub Sup` (thin sugar
     wrappers, importable from `text.svelte` via module re-export AND
     from the index barrel).
2. **The markdown default map goes (nearly) all-first-party**:
   `blockquote` → Blockquote, `heading` → Heading, `list` → List,
   `paragraph`/`inline` → P, the emphasis family → the Raw marks,
   `link` → Link, `inline_code` → InlineCode, `thematic_break` →
   Separator. Task-item checkboxes STAY native disabled inputs — the
   Checkbox item is the interactive control (label lanes, error
   wiring, density chrome) whose `div > span > input` wrapper breaks
   the container-level `li:has(> input)` marker suppression AND makes
   `vertical-align` inert inside its flex lanes; a presentation-only
   marker is bare DOM the jx-pure bare-checkbox face already owns
   (the double-marker regression is the recorded reason). What else
   stays native and why (design §2): bare `text`/`hardbreak`/
   footnote bits (no element to own), `image` (the Image component's
   REQUIRED width/height no-CLS contract cannot be satisfied from
   markdown syntax — recorded with its unlock condition), `dl/dt/dd`
   (followup).
3. **GitHub alert detection in the default map**: a pure
   `detectBlockquoteAlert()` on the blockquote node's first paragraph
   first-line (`[!NOTE|TIP|IMPORTANT|WARNING|CAUTION]`, full-line,
   case-insensitive) → Blockquote `tonal` + status-hue injection
   (note→info, tip→success, important→primary, warning→warning,
   caution→error — error is the STATUS hue, per the action/status
   law) + the uppercase label row; marker line stripped from the
   body. Streaming tolerance: a half-typed marker does not match and
   renders the plain quote; the tail block updates in place, so the
   marker completing costs ZERO remounts.
4. **The escape law, precisely scoped** (design §2): box-owning
   surfaces (Blockquote/Heading/List roots, InlineCode chip) mount
   `no-jx-pure` and own their paint channels; `Separator` rides the
   neutral carrier div (its `m-0` would beat the rhythm's sibling
   stack — the CodeCard precedent); P, the inline marks, and Link are
   FACE-COMPOSING (no escape — an inline escape virally descopes its
   descendants' face rules, and a link can contain code chips and
   marks). Because a BLOCK escape also descopes container prose, the
   markdown sheet gains one container-inner sibling-stack law (the
   flush law's positive counterpart) so multi-paragraph list items
   and quotes keep their gaps.
5. **Registry mechanics per new item**: registry.json entry (files,
   meta.group, href), byte mirror + manifest, docs page (hand-
   authored PropsTable rows — the alert precedent; NO meta files, so
   the ambient-vocabulary meta-carrier set stays at its frozen six
   and the new pages ride the zero-increment debt policy) +
   prerender entry, blueprint scene + svg, the docs-structure freeze
   count (general +2, data-display +3; live totals verified before
   the edit — the comment trail has drifted), verify-deps edges from
   the markdown item (+8), hook-law inventory entries
   (`data-jx-blockquote`, `data-jx-heading`, `data-jx-list`,
   `data-jx-link`, `data-jx-text`), and the blockquote
   frozen-availability amendment chain.
6. **Streaming cost guard**: a perf-shaped test that streams a
   mark-dense document and asserts the keyed-block laws hold (the
   per-node component instances are inner-subtree swaps — L1–L4
   govern the keyed item, not its subtree).
7. **HTML equivalence** (the Owner's 2026-09-07 addition): markdown
   sources mixing HTML (`<b>text</b>`, `<details><summary>…`) map
   onto the SAME components as their markdown spellings through a
   FROZEN tag table — the parser's structure layer already delivers
   parsed html nodes (the html axis rides TRUE — the amendment; under
   html:false only a small inline vocabulary structures), and unknown
   tags keep the render-side escaped-text security floor.
   `details/summary` rides the accordion (verified native-details
   W3C-first); consecutive details runs merge into one Accordion
   group (a pure parse-side transform); markdown gains the
   `@jixoai/accordion` + `@jixoai/kbd` edges. Design §8.

## Impact

- `registry.json` (+5 items, markdown's registryDependencies +8 edges),
  `registry/files/ui/{blockquote,heading,list,link,text}/**` (new),
  `registry/files/ui/markdown/{markdown-node.svelte,parse.ts,markdown.css}`
  (the map, the detector, the §3 ladder emigration + the §2c
  container-inner stack), mirrors, docs pages ×5 + the markdown
  page's coverage demos, blueprints ×5, `apps/www/svelte.config.js`
  prerender ×5, `apps/www/test/docs-structure.spec.ts` (freeze
  count), `scripts/context-coverage.config.json` + the living spec's
  variant-grammar family list + `variant-grammar.html` (blockquote's
  availability row), test files (+5 component specs,
  markdown-render additions).
- **Non-goals** (followups recorded): math wiring (enableMath is a
  pinned parse axis; the katex items landed and wait for that axis),
  `:::` containers → alert (enableContainers pinned; GitHub syntax
  covers the need), definition-list extraction, the Image unlock
  (an unknown-dims posture on the Image side), the blockquote indent
  posture (a structural axis, not a paint rung), alert icons inside
  the markdown label row (the `icon` snippet exists for app
  consumers; the default map ships the text label only — no
  @jixoai/icon edge on the markdown item), Checkbox-for-task-items
  (unlocked only by a bare-input render mode on the checkbox item or
  a container-selector rework — recorded with the double-marker
  regression as the reason).
