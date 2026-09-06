# Tasks

> r1 (2026-09-06): expanded per Codex review blockers 1–10
> (dispositions in review-r1.md).

## 1. Parse adapter (registry/files/ui/markdown/parse.ts)

- [x] 1.1 `createMarkdownParser()` — own md instance (getMarkdown),
      pinned-axes contract (design §1.1 table: html/linkify/
      typographer/breaks/stream + enableMath/enableContainers/
      enableFixIndentedCodeBlock + no customHtmlTags); global-plugin
      trusted-boundary detection (non-zero stamped count → dev warn
      once, NEVER clearRegisteredMarkdownPlugins)
- [x] 1.2 adapter state machine: final = !streaming per parse
      (streaming defaults false; static first parse = final
      semantics); non-append detection (`next.startsWith(last)`) →
      fresh md instance + full reparse; false→true restart on an
      extending source resumes on the same instance; returns
      `{ blocks, mode }`
- [x] 1.3 `parseBlocks` result shape `{ key, type, digest, node,
      isTail }`; digest = fnv1a36(stableStringify(node)) — key-sorted
      canonical JSON, undefined dropped, sourceMap excluded,
      versioned digest-v1; keying `${index}:${type}:${digest}` /
      streaming tail `${index}:${type}:tail`; NodeOf helper +
      components map type
- [x] 1.4 unit tests: golden digest fixtures; append-stability
      (prefix keys invariant), duplicate-content disambiguation, tail
      type-transition remount (paragraph→heading), fence-close-while-
      tail (NO remount), bounded-remount accounting (≤2 total), final
      convergence, initial-static vs initial-streaming vs false→true
      restart, non-append reset (replace/shorten/message-switch),
      reference-definition doc-level invalidation (children mutate
      while raw unchanged → digest changes → remount), digest public
      vectors (empty string + paragraph + table golden triples),
      global-plugin negative tests (benign plugin → warn fires;
      validateLink-override plugin → warn states the URL-security
      suspension), streamTailLocalPostBlockRules cache/tail fixture,
      unclosed fence mid-state (loading + partial code), indented-code
      fix (pinned axis), maxNesting=100 deep-nesting fixture (pinned
      axis), GFM tables/task lists/fences conformance
- [x] 1.5 dependency-bump guard note: any stream-markdown-parser bump
      re-runs 1.4 + 2.5 matrices

## 2. Renderer (markdown.svelte / markdown-node.svelte / markdown.css)

- [x] 2.1 root: source/streaming/components props, jx-pure scope +
      `$lib/jx-pure.css` import, `data-jx-markdown` +
      `data-jx-markdown-streaming` stamps, cn() class merge, rest
      passthrough, keyed {#each} blocks
- [x] 2.2 markdown-node.svelte: the §3 mapping ladder (block + inline),
      table → div[data-kind=table] > Table + td[data-label] + align,
      code_block → CodeCard, image sanitize policy (bitmap data URLs
      render; SVG/other data schemes → img omitted), footnote
      degradation, definition_list → native dl/dt/dd, BOTH checkbox
      variants → disabled native input, html nodes → escaped literal
      text, unknown-node text-only fallback (no structural recursion)
- [x] 2.3 components override seam (per-node-type Component<{node}>,
      trusted-app-code boundary documented on the docs page),
      MarkdownNode exported for delegation
- [x] 2.4 markdown.css: standard header comment (intents + timestamp),
      cursor law (blink under no-preference only, print-hidden), layer
      prologue + :where discipline
- [x] 2.5 renderer tests: mapping fixtures, security matrix
      (javascript:/vbscript:/data: casings, protocol-relative,
      script block+inline, unclosed tags, comments, srcset/alt/title),
      cursor presence/absence, SSR renderToHtml vs client-mount
      parity (snapshot law), default-map negative tests (no raw html
      ever)
- [x] 2.6 print spot-check: cursor hidden, tables/code survive the
      freeze laws

## 3. Registry + gates

- [x] 3.0 apps/www package.json + lockfile: `stream-markdown-parser`
      dependency committed WITH this change (already installed in the
      worktree — the diff must ride the same commit; clean-checkout
      install asserted by the docs build)
- [x] 3.1 registry.json item: dependencies
      stream-markdown-parser@^1.2.14; registryDependencies exactly the
      direct-import graph (utils/table/code-card/jx-pure/jixoai-theme);
      meta.group data-display + docs
- [x] 3.2 mirror to apps/www/src/lib/ui/markdown (byte-identical) +
      `node scripts/gen-mirror-manifest.mjs` (canonicalMain + files +
      hashes land in apps/www/mirror-manifest.json)
- [x] 3.3 `node scripts/component-metadata-gen.mjs markdown` +
      verify:meta
- [x] 3.4 verify-shadcn-add CASE: clean consumer `shadcn add
      @jixoai/markdown` — whole closure (sibling items + npm dep
      chain) lands and vite builds
- [x] 3.5 verify:deps / verify:context / verify-hook-law (the
      data-jx-markdown-streaming spelling arbitrates here) /
      verify:standards / verify:budgets green
- [x] 3.6 docs-route plumbing: svelte.config.js prerender entry,
      catalog/counts snapshot (auto-derived from meta.group — confirm
      no manual nav edit), verify:docs-structure fixture

## 4. Docs

- [x] 4.1 /docs/components/markdown.html page (full STAGED skeleton:
      Intro/Install/Usage/Examples/API/See Also) — ?raw mirrored
      sources, PropsTable from generated meta
- [x] 4.2 demos: GFM kitchen sink, live streaming simulation (chunked
      typing incl. mid-stream table + open fence), components
      override, override trust-boundary note
- [x] 4.3 vision subagent visual acceptance (canvas/playground laws)

## 5. Search-corpus declared-marker regression (r2 N1 correction)

> The `table` blocks.kind value ALREADY EXISTS in the living spec and
> the harvester already knows KIND_TABLE with a `<table>` tag-shape
> fallback — this change adds NO enum and NO schema edit. What lands
> is the declared-marker precedence for markdown-rendered tables.

- [x] 5.1 fixture: a markdown-rendered table (div[data-kind="table"]
      wrapper) is harvested as kind `table` through the DECLARED
      marker — never via the tag-shape fallback — and the wrapper is
      not double-counted against Table's inner <table> element
- [x] 5.2 marker-precedence assertion added to the existing corpus
      fixtures (schema and baselines untouched unless the fixture
      pages themselves enter the corpus build)

## 6. Review loop

- [x] 6.1 Codex review of change docs — r1 NEEDS_CHANGES, r2 pending
- [x] 6.2 Codex final review + score, fix iterations
- [x] 6.3 verify:all green end-to-end

## Evidence (2026-09-07)

- Unit suites: markdown-parse 30 + markdown-render 12 + markdown-streaming 10 = 52 green
- verify:all GREEN end-to-end (standards/laws/icons/mirror/context/deps/budgets/docs/meta/print/ghostty/byte-mirror + shadcn-add 6 clean-install cases incl. markdown)
- Integration amendments recorded in review-r1.md: face import removal (B-face double-bundle), verify-deps prerequisite set extended per its own documented rule, baseline re-recorded (color-picker debt healed), blueprint scene + SVG, taxonomy counts derived
