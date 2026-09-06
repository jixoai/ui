# markdown-streaming — the streaming markdown face (AST → jixoai components)

> Original request (user, 2026-09-06): "我们需要推出一个 markdown 渲染
> 组件。它本身需要支持流式渲染。并且将渲染的内容（AST）映射成我们
> 自己内部的组件。比如 table/code 等等"

## Why

The registry has no markdown surface at all (113 items, zero markdown
dependencies — the only mdast/micromark bits in any lockfile are shiki
transitives). Meanwhile every adjacent capability already exists:

- `table` — the responsive native-table face (container-query scroll /
  stack laws, `td[data-label]` opt-in) — the natural mapping target for
  GFM table nodes.
- `code-card` — the code surface whose `code` prop is a runtime string,
  with the generation-guard async repaint (drop-to-plain → re-highlight)
  that streaming needs, emitting `data-kind="code"` for the harvest
  contract for free.
- `jx-pure` (Tier 0) — the componentless face whose Part B element laws
  (heading ladder, paragraph rhythm, blockquote rule, code chips,
  checkboxes) style every bare element the renderer emits.

The document-ontology design already argued the alignment (§2: "Markdown
以 6 个记号覆盖写作用户 80% 的结构表达；体裁差异不进线") — this change
is the point where a markdown document becomes a jixoai "线" consumer:
AST nodes mapping onto first-party parts, prose degrading onto Tier 0.

## What Changes

1. **New registry:ui item `markdown`** — one component, value-domain
   payload (`source: string`, the code-card "code strings" precedent),
   streaming-first: append-only `source` updates re-render only the
   trailing block (keyed digest memoization) — except when a
   document-level construct (a link reference definition) changes an
   earlier block's children, in which case that prefix block's digest
   changes and it remounts with correct content; `streaming` flips
   final-parse semantics and shows the tail cursor.
2. **Parsing layer: `stream-markdown-parser` as item npm dependency**
   (MIT, framework-free, markdown-it/CommonMark + GFM preset, streaming
   token cache with `final` invalidation, `reuseStableTopLevelNodes`
   identity-stable prefix, safe-by-default validateLink). The renderer
   (DOM/component sovereignty) stays 100% first-party — see design.md §1
   for the adopt-vs-compose ruling.
3. **AST → component mapping vocabulary** (design.md §3): `code_block`
   → CodeCard, `table` → Table (+ `td[data-label]`, align), everything
   prose → native elements under a `jx-pure` scoped root; per-node-type
   override seam (`components` prop — the payload's content escape).
4. **Security floor**: `html: false` at the markdown-it level (raw
   HTML degrades to escaped literal text — never parsed, never
   rendered as markup), factory validateLink retained (unsafe URL
   schemes demote to plain text), zero `innerHTML`/`{@html}` in the
   DEFAULT renderer (the `components` override seam is trusted
   application code — a documented boundary). One declared
   suspension: the package's module-global plugin registry is a
   trusted process boundary — ambient markstream plugins suspend the
   vocabulary AND parser-level URL-security guarantees (detected with
   a dev warning; the renderer's own laws always stand).
5. **Harvest contract**: root stamps `data-jx-markdown`; code blocks
   inherit CodeCard's `data-kind="code"`; the table block stamps
   `data-kind="table"` (search-corpus delta).

## Non-goals (v1)

- KaTeX/Mermaid rendering — parser math/containers plugins disabled;
  `$…$` and `:::` stay literal text. Future axis (peer-dependency
  pattern, print verbs ruled then).
- `customHtmlTags` → custom component nodes (parser supports it; the
  seam stays closed while `html: false` is the floor).
- Virtual-window long-document optimization (markstream's
  max-live-nodes idea) — a perf axis, not a contract.
- Scroll container / auto-follow — the consumer's layout duty.

## Impact

- `registry/files/ui/markdown/` — markdown.svelte, markdown-node.svelte,
  parse.ts, markdown.css, index.ts (+ mirror in `apps/www/src/lib/ui/`).
- `registry.json` — new item (dependencies: stream-markdown-parser;
  registryDependencies: jixoai-theme, jx-pure, table, code-card, utils).
- `apps/www/package.json` — stream-markdown-parser dep (installed).
- Specs: component-authoring (mapping + streaming laws), search-corpus
  (the `table` block kind).
- Docs page `/docs/components/markdown.html` (STAGED skeleton; live
  streaming simulation demo), meta, shadcn-add probe case.
