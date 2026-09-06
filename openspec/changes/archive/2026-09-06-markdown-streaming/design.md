# Design: markdown-streaming

> r1 (2026-09-06): Codex review verdict NEEDS_CHANGES — 10 blockers.
> This revision closes all of them (dispositions in review-r1.md).
> Ground truth marked 【probe】 was verified against the installed
> stream-markdown-parser@1.2.14 dist (node probes, see review-r1.md).

## 1. Parser ruling — adopt the core, own the renderer

| option | ruling | why |
| --- | --- | --- |
| `markstream-svelte` whole | rejected | Svelte track is beta; ships its own visual identity (index.css, own code-block UI); overrides go through GLOBAL `setCustomComponents` registration (fights the context-plugin philosophy); `table` absent from the documented override keys; container overrides couple to its internals. DOM sovereignty IS design-language sovereignty. |
| `stream-markdown-parser` core | **adopted** | MIT, framework-free, markdown-it-ts under it (CommonMark + GFM). Verified【probe】: streaming token cache with `final` invalidation; unclosed-fence mid-state (`code_block.loading: true` with partial code); `reuseStableTopLevelNodes` identity reuse; factory-installed safe validateLink (`javascript:` link demotes to literal text【probe】); full TS node types; Node-runtime sync parse. |
| micromark + mdast stack | rejected for v1 | 4-package face for the same conformance; no streaming cache; we'd own block-split stability. Revisit on maintenance risk — parse.ts is the swap seam. |
| hand-rolled zero-dep parser | rejected | CommonMark edge-correctness trap; algorithm task; ecosystem solved it. |

**The parser is a library, the renderer is the registry item.**

### 1.1 The pinned-axes contract (r3 N1 — no "EVERY" overclaim)

The factory defaults are `html: true, typographer: true, enableMath:
true, enableContainers: true`【probe, dist factory()】. parse.ts pins
the axes that reach OUR path (parse + AST vocabulary); any axis
outside this table is OUT of the frozen contract — renderer-only
(we never call md.render) or inert for our integration — and the
observable-vocabulary test matrix (tasks 1.4) makes silent drift on a
pinned axis fail loudly:

| axis | pinned value | why |
| --- | --- | --- |
| `markdownItOptions.html` | `false` | raw HTML never tokenized as markup; survives as literal text【probe】. (Renderer maps any html node to escaped text — html:false does not erase the parser's html vocabulary【probe: html_inline exists】, the DOM guarantee is the renderer's.) |
| `markdownItOptions.linkify` | `true` | deliberate: GFM autolinks (bare URLs → link nodes【probe】), each still validateLink-gated |
| `markdownItOptions.typographer` | `false` | text fidelity (no smart-quote rewrites) |
| `markdownItOptions.breaks` | `false` | single-newline = soft break (CommonMark); hard breaks stay explicit `␤␤`/backslash |
| `markdownItOptions.stream` | `true` | the streaming parse path |
| `enableMath` | `false` | `$…$` stays literal text【probe】 |
| `enableContainers` | `false` | `:::` stays literal text【probe】 |
| `enableFixIndentedCodeBlock` | `true` (explicit) | the streaming fix that keeps mid-typed indented code readable — a semantic AST axis, pinned and test-locked |
| `streamTailLocalPostBlockRules` | `true` (explicit) | the factory force-enables it when unset (r4 N2, dist-verified) — it shapes streaming tail reuse/token processing, NOT renderer-only: pinned explicitly and covered by the cache/tail fixtures |
| `markdownItOptions.maxNesting` | `100` (explicit — r5 N1) | the markdown-it-ts dist's runtime default is 100【probe, not 20】; deep nesting changes parse output, so the axis is PINNED at 100 with a deep-nesting fixture bounding the observable behavior |
| `customHtmlTags` | not passed (none) | the seam stays closed in v1 |

**Accounted-but-unpinned axes** (r4 N2 — each with its rationale, none
may silently drift into the semantic path): the parser's internal
perf strategies (chunked-fallback / auto-unbounded thresholds) are
output-neutral by the parser's own contract — the golden digest
fixtures would catch any output change from a bump; every other
markdown-it option is renderer-only (we never call md.render).

**Version policy**: item dependency `stream-markdown-parser@^1.2.14`
(caret, the prismjs precedent); the lockfile pins integrity; ANY bump
re-runs the conformance+security+vocabulary matrix (tasks 1.4/2.5).

**Global plugin boundary (r2 B10, r3 B10, r4 N3 ruling)**: the
package's module-global plugin registry (`registerMarkdownPlugin`)
applies to every `getMarkdown()` call — ambient PROCESS state. parse.ts
does NOT mutate it (clearing a process-global registry would harm
co-consumers). Ruling: the global registry is a **trusted process
boundary**, the same trust class as the components override. The
suspension is TOTAL, not vocabulary-only: an ambient plugin can
override `md.validateLink` (Codex r4 probe: a plugin returning `true`
lets `javascript:` hrefs reach link nodes) — so with ambient plugins
present, BOTH the vocabulary guarantee AND the parser-level URL
security floor are suspended, and only the renderer's own laws
(escaped text, no `{@html}`, image sanitize) still stand. The
detection warn (below) states exactly this. Apps that need the full
floor must not register markstream plugins in the same process.
Defense is detection-only and side-effect-free: at instance creation,
if the factory-stamped global-plugin count on the instance is non-zero
(best-effort, optional-chained — no contract dependency on the private
field), ONE dev-mode console.warn states that ambient plugins were
applied and the item's vocabulary AND URL-security guarantees are
suspended. Concurrency/re-entrancy: globals apply at creation only
(dist-verified) — existing instances are immune to later
registrations, and instance creation order cannot corrupt an
already-created parser. Negative tests (tasks 1.4): a benign plugin →
warn fires, parse proceeds; a validateLink-override plugin → warn
states the security suspension (asserted by text).

## 2. Streaming model

```
consumer (append-only)          markdown.svelte                 parse.ts adapter
─────────────────────          ─────────────────               ────────────────
source = "…# Hello\nwor"  ───▶  $derived:                      createMarkdownParser()
chunk arrives                   nodes = parser(                 └─ own md instance + state
  source += "ld"                  source, streaming)               machine (§2.1)
                                       │
                                       ▼
                          L1 prefix frozen · L2 tail in place (type-keyed)
                          L3 one finalize remount · L4 final convergence
```

### 2.1 The adapter state machine (r1 B1, r3 N2 — mode semantics frozen)

`streaming` defaults to **false** (a static document is the default
face; streaming is opt-in per instance). Every parse derives its mode
directly: `final = !streaming` — the FIRST parse with `streaming:
false` runs final semantics immediately (a static doc's unclosed
fence renders as final-literal, never a loading state); the first
parse with `streaming: true` runs streaming semantics. The state
machine governs the parser-instance lifecycle keyed on SOURCE
history:

```
        parse(source, streaming=false)  ⇒  final semantics (static path)
fresh ──parse(source, streaming=true)──▶ streaming
  ▲                                       │ non-append detected
  └──────── reset ◀───────────────────────┘ (replace/shorten/rollback/
          (fresh md instance, cache        message switch; ALSO fires on
           dropped, reparse)               non-append after a final parse)
```

- **Append check** on every parse: `next.startsWith(last)` (or
  `last === ''`). Non-append → the adapter RECREATES the md instance
  (fresh stream cache) and re-parses from scratch. Deterministic,
  never throws — a chat view recycling one component across messages
  is the supported recycle path.
- **`streaming: false → true` restart** on a source that still
  extends the accumulated text → a normal streaming parse resumes on
  the same instance (final parses never poison the stream env — the
  parser runs finals through the regular path by design). A
  non-extending switch falls to the reset branch.
- The adapter exposes `{ blocks, mode }`; `mode: 'streaming'|'final'`
  for tests and the cursor. Fixtures (tasks 1.4 + 2.5): initial
  static render, initial streaming render, false→true restart,
  SSR/client parity for each.

### 2.2 The keyed-block laws (r1 B2, r2 B2, r3 B2 refinement)

Block key = `${index}:${type}:${digest}` where **digest =
fnv1a36(stableStringify(node))** — a CANONICAL, VERSIONED
(digest-v1) serialization with a complete, implementation-free
definition:

- `stableStringify(value)`: recursive canonical JSON — object keys
  sorted ascending (code-unit order), `undefined` values dropped,
  arrays in order, strings verbatim, numbers via Number#toString.
  It covers unknown and future node fields BY CONSTRUCTION (no
  per-type field enumeration to maintain, no field can be silently
  missed — any semantic mutation changes the digest). `sourceMap` is
  excluded RECURSIVELY at every level (parse-local metadata, not
  semantics) before serialization.
- `fnv1a36`: FNV-1a **32-bit** (offset basis 2166136261, prime
  16777619) over the UTF-8 byte encoding of the serialized string,
  multiplication and addition computed modulo 2³² with unsigned
  wraparound (`>>> 0`), output rendered as **lowercase base-36**
  (`toString(36)`).
- Public test vectors (tasks 1.4) pin the pair: at minimum the empty
  string, a fixed paragraph node, and a fixed table node with golden
  input/serialization/digest triples — the doc + vectors together are
  the cross-implementation key contract; any change bumps digest-v2
  with a migration note.

The laws govern the KEYED ITEM (the generic MarkdownNode block
component), never its inner subtree (inner elements may swap freely as
the tail re-parses; stateful inner parts like CodeCard own their
transitions through their generation guard):

1. **L1 prefix freeze** — non-tail blocks keep semantic content ⇒
   digests invariant ⇒ keyed-each preserves items and DOM: zero
   flicker, stable anchors. Document-level constructs (link reference
   definitions) can still alter an EARLIER block's children; the
   digest then changes ⇒ the block remounts with correct content.
   The precise claim: a prefix item remounts ONLY when its semantic
   digest changes — never on tail growth alone.
2. **L2 tail in place** — while `streaming`, the LAST top-level block
   keys `${index}:${type}:tail` (digest dropped, TYPE kept as the
   discriminator): the item persists while its content mutates —
   INCLUDING when an open fence closes but the block remains the tail
   (no remount at fence-close; CodeCard simply re-renders its final
   content in place). A tail TYPE transition (paragraph→heading
   mid-typing) swaps the key ⇒ one clean remount, no stale inner
   state.
3. **L3 bounded key transition** — the tail key swaps to the digest
   when the block stops being the tail (a successor block appears)
   OR the stream finalizes (`streaming → false`). A block that ALSO
   type-transitioned while tail may remount twice in total
   (transition + finalize). The law bounds remounts to one per
   semantic event; it never promises exactly-once per block.
4. **L4 final convergence** — `streaming → false` re-parses with
   `final: true` (unclosed fences/emphasis settle, trailing markers go
   literal); digest keys keep the frozen prefix mounted.

`reuseStableTopLevelNodes: true` on non-final parses is a parse-cost
optimization ONLY — its identity guarantee lags one block behind【probe:
the previous tail is not identity-reused even after it freezes】— the
keying laws above never depend on node identity. Duplicate-content
siblings disambiguate by the index prefix.

parseBlocks returns per block: `{ key, type, digest, node, isTail }`
(r1 S3, digest per §2.2 — the raw text stays reachable as node.raw)
— the renderer never re-derives tail/type; tests assert on the same
shape.

### 2.3 SSR / hydration — the snapshot law (r1 B3)

The component is a pure function of `(source, streaming)`. The server
renders and the client hydrates the SAME prop snapshot (SvelteKit's
load-prop guarantee — identical props ⇒ identical parse output ⇒
identical keys ⇒ shape-identical hydration). There is no hidden
client-side re-parse on hydration: parsing is synchronous in both
runtimes. `data-streaming` + cursor only appear when `streaming: true`
in that shared snapshot; a stream that begins AFTER hydration is a
normal post-hydration update, not a hydration event. Tests lock this
with a real `renderToHtml` vs client-mount comparison (tasks 2.5).

## 3. AST → component mapping (the vocabulary)

### 3.1 Block level

| ParsedNode | renders | notes |
| --- | --- | --- |
| `code_block` | `<CodeCard code lang />` | partial code + `loading` mid-stream【probe】; generation-guard repaint is CodeCard's own path |
| `table` | `<div data-kind="table">` wrapping `<Table>` + generated thead/tbody | the wrapper is the harvest marker carrier ONLY (§3.4); `td[data-label]` = header cell text, `align` per column【probe: align lives on cells】 |
| `heading` | `h1…h6` (level)【probe】 | jx-pure ladder; ids stay the site stamper's duty |
| `paragraph` / `inline` | `<p>` + children recursion | |
| `list` / `list_item` | native `ul/ol/li` (`ordered`, `start`【probe】) | |
| `blockquote` | native `blockquote` | recursive block rendering |
| `thematic_break` | `<hr>` | |
| `footnote` / `footnote_reference` | children block / `<sup>` inert text | factory-preset plugin; inert degradation, no section semantics |
| `definition_list` / `definition_item` | `<dl>/<dt>/<dd>` | defensive (plugin vocabulary) |
| `html_block` | literal text of `node.content` | escaped by interpolation |
| math/admonition/vmr containers | literal text | cannot occur (plugins off) — defensive |
| **unknown block node** | `extractText(node)` as literal text | r1 S10: NO structural recursion into unknown types — the safe-fallback rule |

### 3.2 Inline level

| ParsedNode | renders | notes |
| --- | --- | --- |
| `text` | text | |
| `strong` `emphasis` `strikethrough` `highlight` `insert` `subscript` `superscript` | native `strong em del mark ins sub sup` | |
| `inline_code` | native `<code>` | jx-pure chip; zero async per-span work (InlineCode is the override, not default) |
| `link` | native `<a>` | href already validateLink-passed; unsafe schemes never appear (demoted at parse【probe】) |
| `image` | `<img>` when src survives `sanitizeImageSrc`; else omitted | v1 policy (r2 N2): the library sanitizer's own allowlist — BITMAP data URLs (png/gif/jpeg/webp/avif/bmp) are inert bytes and RENDER; SVG and other data schemes sanitize away ⇒ the img is OMITTED entirely (never a broken/empty src); alt preserved |
| `checkbox_input` / `checkbox` | `<input type=checkbox disabled checked>` | task lists【probe】— BOTH variants map to the same disabled native input |
| `label_open` / `label_close` | nothing | plugin wrapper tokens【probe】 |
| `hardbreak` | `<br>` | |
| `emoji` | literal markup | |
| `html_inline` | literal text of `node.content` | 【probe: exists under html:false】 |
| `reference` | nothing | |
| **unknown inline node** | `extractText(node)` | same safe-fallback rule |

### 3.3 Override seam — the trust boundary (r1 B4)

`components?: { [K in ParsedNodeType]?: Component<{ node: NodeOf<K> }> }`
is **trusted application code** — the same trust level as any component
the app renders by hand (the react-markdown model). The security
guarantee of §4 covers the DEFAULT map and parser-level demotions;
overrides receive `{ node }` (raw fields included — app code may do
what it likes with its own components) and delegate children through
the exported MarkdownNode. The docs page states this boundary in the
Install/Usage section. Negative tests lock the DEFAULT map only.

### 3.4 Root, wrapper, hooks, CSS

- Root: `<div class="jx-pure" data-jx-markdown …rest>` +
  Tier-0 consumption by the face's OWN law — the class mounts on the
  DOM, the sheet is imported ONCE from the site css (app.css on www;
  the documented site-css import for registry consumers). NO
  component-level css import (integration amendment to r6: the
  `import '$lib/jx-pure.css'` form double-bundled the whole face into
  the component chunk on the site build, 243-entry chunk + 232-entry
  duplicate, breaking the B-face budget gate). Never a forked copy of
  the face laws either way. `cn()` merges consumer class (r1 B9).
  Registry parts beat `:where()` by design.
- Streaming stamp: `data-jx-markdown-streaming` while streaming — the
  name and boolean-presence semantics are FROZEN here (r2 N6): a
  value-less state attribute on the root, test- and selector-stable;
  verify-hook-law only confirms legality, it does not choose names.
- Cursor: `<span data-jx-markdown-cursor>` after the last block while
  streaming — markdown.css (D1-exempt residue): blink only under
  `prefers-reduced-motion: no-preference`, static otherwise,
  print-hidden. markdown.css carries the standard header comment
  (orthogonal intents + timestamp — the css-architecture law, r1 B9).
- Table wrapper: a single `<div data-kind="table">` around Table's
  `<figure class="jx-table">` — semantically neutral (div), the harvest
  marker's carrier because Table's figure exposes no data passthrough;
  no layout paint of its own. Nested figure/frame question answered:
  div > figure is valid and unpainted.

## 4. Security model

- `html: false` + renderer law: every html node renders as escaped
  literal text; nothing from the source is ever parsed as markup.
- Zero `{@html}` in the default renderer. CodeCard markup backends
  escape source into inert spans (their contract).
- validateLink (factory default): unsafe schemes demote to plain text
  at PARSE time【probe】 — suspended (with a warning) when ambient
  markstream plugins exist (the trusted process boundary, §1.1);
  image src via `sanitizeImageSrc` (bitmap data URLs render, SVG/
  other data schemes → img omitted, §3.2).
- Overrides are the app's own trust boundary (§3.3).
- Test matrix (r1 S6): `javascript:`/`vbscript:`/`data:` in assorted
  casings/whitespace, protocol-relative URLs, `<script>` block+inline,
  unclosed tags, html comments, image srcset/title/alt.

## 5. Registry shape (r1 B5 — the real import graph)

Direct imports owned by the item (every declared edge = a real import;
transitive needs resolve through the dependency items' own
registryDependencies at `shadcn add` time):

| import in markdown.svelte / markdown-node.svelte | declared edge |
| --- | --- |
| `cn` from `$lib/utils` | `@jixoai/utils` |
| `Table` from `../table/table.svelte` | `@jixoai/table` (itself pulls defaults+density) |
| `CodeCard` from `../code-card/code-card.svelte` | `@jixoai/code-card` (itself pulls highlight+icons) |
| the jx-pure face prerequisite (class mount; sheet = app-level import, dependency-declared) | `@jixoai/jx-pure` (registry:lib — the css-file owner) |
| (spec precondition, every registry:ui item) | `@jixoai/jixoai-theme` |

`dependencies: ['stream-markdown-parser@^1.2.14']`. meta.group
`data-display`. No density slot on the root (Table resolves its own
ambient density) ⇒ no markdown-defaults file; verify:context
arbitrates. The clean-consumer probe (shadcn-add case) proves the
whole closure lands.
