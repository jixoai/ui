<!--
  Docs page for markdown (openspec 2026-09-06-markdown-streaming).

  Original requirement (2026-09-06, user): "推出 markdown 渲染组件，
  支持流式渲染，AST 映射内部组件" — this page is the streaming face's
  documentation: the AST → registry mapping (Table / CodeCard / jx-pure),
  the keyed-block streaming laws (design §2), and the security floor.

  docs-demo-standard STAGED skeleton: Intro → Install → Usage (the ONE
  h2) → Examples (ability-named canvases: kitchen sink, streaming
  simulation, custom components, static document) → API → See Also.

  Demo laws riding this page:
  - the markdown component RENDERS HEADINGS from source — every demo
    mounts it inside a data-doc-demo-scope="headings-ok" wrapper (the
    lint's sanctioned opt-out for components under test that exist to
    render headings), and demo sources never mint an h1 (the page owns
    exactly one — the hero).
  - the streaming simulation is page-owned state ONLY (interval +
    $state revealed chars) driving the public (source, streaming)
    props — zero component hacks, the recycle/restart laws demo
    themselves through the public seam.
  - doc-link.svelte next to this file is the live components-override
    stand-in (trusted application code, design §3.3 — the react-
    markdown model); everything else keeps the default map.
-->
<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import ComponentCanvas, { type TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { meta as markdownMeta } from '$lib/meta/markdown.meta';
  import Markdown from '$lib/ui/markdown';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import type { PropsDocs } from '$lib/ui/props-table/from-meta';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import DocLink from './doc-link.svelte';
  import { registrySourceUrl } from '$lib/registry-source';
  import { PlayFields, PlayRow, PlayToggle, PlayHelp } from '$lib/playground';

  // Same-source law: the drawer shows the exact registry copies this
  // site runs (`?raw` keeps them byte-identical — embedding component
  // sources in template literals by hand would be an escaping minefield).
  import markdownSource from '$lib/ui/markdown/markdown.svelte?raw';
  import markdownNodeSource from '$lib/ui/markdown/markdown-node.svelte?raw';
  import parseSource from '$lib/ui/markdown/parse.ts?raw';
  import markdownCssSource from '$lib/ui/markdown/markdown.css?raw';
  import docLinkSource from './doc-link.svelte?raw';

  // A literal closing-script tag inside a template literal would
  // terminate this component's own script tag — splice it.
  const close = '</' + 'script>';

  // three-backtick fences, built without escaping games
  const FENCE = '`'.repeat(3);

  // ---- Usage: the minimal surface ----------------------------------------

  const usage = `<script lang="ts">
  import Markdown from '@ui/markdown';
${close}

<!-- static face (the default): source parses FINAL — unclosed fences
     settle, no cursor, nothing loads -->
<Markdown {source} />

<!-- streaming face: append-only source updates re-render only the
     trailing block; the cursor rides the tail while it streams -->
<Markdown {source} streaming />

<!-- per-node-type overrides: TRUSTED application code — the same trust
     level as any component you render by hand; overrides receive
     { node } raw and delegate children through the exported
     MarkdownNode. The default map's security floor (html:false,
     validateLink, image sanitize) covers the DEFAULT renderer. -->
<Markdown {source} components={{ link: DocLink }} />`;

  // ---- kitchen sink: the GFM vocabulary in one pass ----------------------
  // (no h1 — the page owns its single hero h1; the table cell carries
  // an inline-code node so the chip face shows up inside Table too)

  const kitchenSink = [
    '## the GFM vocabulary in one pass',
    '',
    'Plain **bold**, *italic*, ~~struck~~, `inline chips`, and [a titled link](https://example.com "the title") — bare URLs autolink too: https://ui.jixoai.com',
    '',
    '### task lists',
    '',
    '- [x] keyed prefix stays mounted while the tail grows',
    '- [ ] remount without a digest change (nothing does)',
    '',
    '### tables ride the registry Table',
    '',
    '| node | maps to | alignment |',
    '| :--- | :------ | --------: |',
    '| `code_block` | CodeCard | left |',
    '| `table` | Table under data-kind="table" | center |',
    '| prose | the jx-pure native ladder | right |',
    '',
    FENCE + 'ts',
    '// CodeCard repaints through its generation guard:',
    '// drop to plain, re-highlight, no flash.',
    'const fence = { closed: true, loading: false };',
    FENCE,
    '',
    '> blockquotes keep the jx-pure rule —',
    '> recursive blocks render inside.',
    '',
    '---',
    '',
    'Images: bitmap data URLs render; SVG data URLs and unsafe schemes omit the `img` entirely (alt preserved). Footnotes degrade inertly.[^1]',
    '',
    '[^1]: sup text — no section semantics in v1.',
  ].join('\n');

  // ---- streaming simulation: the target document --------------------------
  // the narrative arc: paragraph growth → table rows settling → an open
  // fence highlighting partial code → the closing bold line. No h1.

  const STREAM_DOC = [
    '## streaming session · live trace',
    '',
    'Chunks append to `source` — only the trailing block re-renders; the frozen prefix keeps its keyed DOM.',
    '',
    '### the map while streaming',
    '',
    '| surface | maps to | while streaming |',
    '| :--- | :--- | :--- |',
    '| tables | registry `table` | rows settle as they close |',
    '| code | `code-card` | open fences keep a loading face |',
    '| prose | the `jx-pure` ladder | the cursor rides the tail |',
    '',
    '> non-append sources — replace, shorten, message switch — recycle the parser. Deterministic, never throws.',
    '',
    FENCE + 'ts',
    'const revealed = source.slice(0, index);',
    '// the fence stays open while chunks land —',
    '// highlighting tracks the partial code, then settles',
    FENCE,
    '',
    '**final parse** drops the cursor; every open construct settles.',
  ].join('\n');

  // the simulation state machine — page-owned, public props only
  const TICK_MS = 80; // chunk cadence
  const CHUNK_CHARS = 4; // chars per chunk

  let playing = $state(true); // autoplay: the demo is alive on arrival
  let revealed = $state(0);

  const streamSource = $derived(STREAM_DOC.slice(0, revealed));
  const streamDone = $derived(revealed >= STREAM_DOC.length);

  // streaming follows the FEED: playing → true; pause and completion
  // both drop to the final face (L4 convergence — open fences settle,
  // the cursor leaves); resuming re-enters streaming on the same
  // extending source (the false→true restart law, design §2.1).
  $effect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      if (revealed >= STREAM_DOC.length) {
        playing = false;
        return;
      }
      revealed = Math.min(revealed + CHUNK_CHARS, STREAM_DOC.length);
    }, TICK_MS);
    return () => clearInterval(timer);
  });

  function togglePlay(): void {
    if (streamDone && !playing) revealed = 0; // replay recycles the parser (non-append reset)
    playing = !playing;
  }
  function resetStream(): void {
    playing = false;
    revealed = 0;
  }

  const streamUsage = `<script lang="ts">
  import Markdown from '@ui/markdown';

  const DOC = '## the full target document…';
  const TICK = 80;  // ms per chunk
  const CHUNK = 4;  // chars per chunk

  let playing = $state(true);
  let revealed = $state(0);

  const source = $derived(DOC.slice(0, revealed));
  const done = $derived(revealed >= DOC.length);

  // streaming follows the feed: playing → true; pause AND completion
  // both drop to the final face — the final parse settles open
  // fences; resuming re-enters streaming on the same extending
  // source (the false→true restart law, design §2.1)
  $effect(() => {
    if (!playing) return;
    const timer = setInterval(() => {
      if (revealed >= DOC.length) { playing = false; return; }
      revealed = Math.min(revealed + CHUNK, DOC.length);
    }, TICK);
    return () => clearInterval(timer);
  });
${close}

<Markdown {source} streaming={playing} />`;

  // ---- custom components: the override seam -------------------------------

  const overrideDoc = [
    '## one node type, your component',
    '',
    'Every `link` node routes through the override — [the registry site](https://ui.jixoai.com "jixoai ui") opens externally with a glyph, while [an internal route](/docs/components/table.html "the table page") keeps same-tab default navigation. All other types keep the default map: **bold**, `chips`, and the table below.',
    '',
    '| node | renderer |',
    '| :--- | :--- |',
    '| `link` | the DocLink override (this demo) |',
    '| everything else | the default map, floor intact |',
  ].join('\n');

  const overrideUsage = `<script lang="ts">
  import Markdown from '@ui/markdown';
  import DocLink from './doc-link.svelte';
${close}

<!-- the seam is per node type; overrides receive { node } RAW (trusted
     application code, design §3.3) and delegate children through the
     exported MarkdownNode -->
<Markdown source={doc} components={{ link: DocLink }} />`;

  // ---- static document: the default face ----------------------------------

  const staticDoc = [
    '## release notes — the static face',
    '',
    "`streaming` defaults to **false**: the first parse runs final semantics — nothing flickers, nothing loads, print stays clean.",
    '',
    '### settled constructs',
    '',
    '- an unclosed fence renders settled code, never a loading state (the fence below never closes)',
    '- task lists are static disabled inputs — presentation, not controls',
    '- [x] shipped',
    '- [ ] followups tracked in the change',
    '',
    '| axis | pinned |',
    '| :--- | :--- |',
    '| raw HTML | escaped literal text |',
    '| unsafe URL schemes | demoted to plain text |',
    '',
    FENCE + 'md',
    'The pinned axes (html:false, typographer:false, breaks:false) are',
    'the text-fidelity contract. This fence never closes — final',
    'semantics still render it as settled code.',
  ].join('\n');

  const staticUsage = `<!-- the default face: no streaming prop, no cursor. The SAME
     component renders chat streams and shipping docs. -->
<Markdown {source} />`;

  // ---- the API surface ------------------------------------------------------
  // GENERATED meta is the single source of truth (props-table's from-meta
  // chain); MARKDOWN_DOCS is the curation layer over it — prose, the two
  // required flags, hidden internal rows, and the passthrough/export rows
  // the extractor cannot see (the popover.docs pattern).

  const MARKDOWN_DOCS: PropsDocs = {
    overrides: {
      source: {
        description:
          'Markdown source — a value-domain payload (the code-card precedent). Append-only updates while streaming re-render only the trailing block.',
        required: true,
      },
      streaming: {
        description:
          'Opt-in streaming face: the tail cursor + tail-key semantics. false (the default) parses FINAL on first render — a static document, never a loading state.',
      },
      components: {
        description:
          'Per-node-type renderer overrides — TRUSTED application code (the react-markdown model): overrides receive { node } raw and delegate children through the exported MarkdownNode. The security floor covers the DEFAULT map.',
      },
      class: {
        description: 'Merged onto the jx-pure scoped root through cn().',
      },
      style: {
        type: 'string',
        description: 'Inline style on the root div.',
      },
      children: { hide: true },
      rest: { hide: true },
    },
    extra: [
      {
        name: '…rest',
        type: 'HTMLAttributes<HTMLDivElement>',
        default: '—',
        description: 'Every other prop passes through to the root div untouched.',
      },
      {
        name: 'MarkdownNode (export)',
        type: "Component<{ node, components? }>",
        default: '—',
        description:
          'The override delegation seam — an override renders the node\u2019s children through the exported MarkdownNode (see the custom components demo).',
      },
    ],
  };

  // exported surface beyond props: MarkdownNode (the override delegation
  // seam) + parse.ts's adapter (createMarkdownParser, block keys/digests,
  // node types) ride the barrel — stated as prose under the table.

  const files: TreeFile[] = [
    { name: 'registry/files/ui/markdown/markdown.svelte', content: markdownSource },
    { name: 'registry/files/ui/markdown/markdown-node.svelte', content: markdownNodeSource },
    { name: 'registry/files/ui/markdown/parse.ts', content: parseSource },
    { name: 'registry/files/ui/markdown/markdown.css', content: markdownCssSource },
    { name: 'src/lib/ui/markdown-usage.svelte', content: usage, kind: 'usage' },
  ];
</script>

<svelte:head>
  <title>Markdown · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai markdown component: a streaming-first renderer that maps the parsed AST onto first-party parts — code fences to code-card, tables to the registry table, prose onto the jx-pure ladder — with keyed-block memoization (frozen prefix, in-place tail, bounded remounts), a final-parse static face, and a security floor of html:false, validateLink and image sanitization with zero raw-HTML injection."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
  <!-- page head -->
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · Data Display"
      title="markdown — the streaming face, AST mapped to first-party parts"
      summary="One component turns a markdown string into jixoai surfaces: fenced code lands in code-card (generation-guard repaint keeps partial code readable mid-stream), tables land in the registry table under a data-kind wrapper, and every prose construct rides the jx-pure element ladder. Streaming is keyed-block memoized — the frozen prefix keeps its DOM while append-only chunks re-render only the trailing block — and streaming=false (the default) is a static, final document. The parser core is stream-markdown-parser; the renderer, the mapping vocabulary and the security floor (html:false, validateLink, image sanitize, zero raw-HTML injection) are 100% first-party."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">streaming-first · keyed blocks (L1–L4)</span>
        <span class="pill">AST → table · code-card · jx-pure</span>
        <span class="pill">html:false security floor</span>
        <span class="pill">components override seam</span>
        <span class="pill">stream-markdown-parser core</span>
      </div>
    </SectionCard>
  </div>

  <!-- install -->
  <div id="install" data-reveal="">
    <DocsInstall name="markdown" />
  </div>

  <!-- usage: the ONE h2 -->
  <div id="usage" data-reveal="">
    <SectionCard
      family="usage"
      headerRegion="usage"
      eyebrow="usage"
      title="Usage"
      summary="Source is a value-domain payload (the code-card precedent) — a runtime string, never inlined markup. streaming opts into the cursor + tail-key face; components overrides are trusted application code (the same trust level as any component you render by hand — the security floor covers the DEFAULT map, overrides own their own rendering)."
    >
      <CodeBlock code={usage} lang="svelte" meta="markdown usage" />
    </SectionCard>
  </div>

  <!-- examples: the ability-named demo suite -->
  <div id="examples" data-reveal="">
    <SectionCard
      family="examples"
      headerRegion="examples"
      eyebrow="examples"
      title="Examples"
      summary="One ability per demo: the GFM vocabulary in one pass, the streaming simulation (a live chunk feed over the public props), the components override seam, and the static document face."
    >
      <p class="m-0 text-[13px] leading-6 text-muted-foreground">
        The markdown component exists to render headings — every demo mounts it inside the
        lint-sanctioned <code class="text-accent">headings-ok</code> scope, and demo sources never
        mint an h1 (this page owns exactly one). The simulation is page-owned state over public
        component behavior — zero registry edits, zero API bypasses.
      </p>
    </SectionCard>
  </div>

  <!-- demo a: kitchen sink -->
  <div id="markdown-kitchen-sink" data-region="markdown-kitchen-sink" data-family="markdown-kitchen-sink" data-reveal="">
    <ComponentCanvas
      title="kitchen sink"
      description="The default map, one pass: emphasis and inline chips onto the jx-pure ladder, a task list as disabled native inputs, the GFM table onto the registry table (td[data-label] + per-column align), a fenced card onto code-card, blockquote, rule, links and bare-URL autolinks. Images: bitmap data URLs render; SVG data URLs and unsafe schemes omit the img entirely (alt preserved). Footnotes degrade to inert sup text."
      sourceUrl={registrySourceUrl('markdown')}
      install="markdown"
      {files}
      stage="fill"
    >
      <div class="w-full max-w-[46rem]" data-doc-demo-scope="headings-ok">
        <Markdown source={kitchenSink} />
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            The vocabulary is frozen (design §3): code_block → CodeCard, table → Table, prose →
            native elements under jx-pure. Unknown node types degrade to extracted literal text —
            structure never recurses into the unknown. The drawer carries the same-source registry
            copies this site runs (markdown.svelte, markdown-node.svelte, parse.ts, markdown.css).
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- demo b: streaming simulation (the core demo) -->
  <div id="markdown-streaming" data-region="markdown-streaming" data-family="markdown-streaming" data-reveal="">
    <ComponentCanvas
      title="streaming simulation"
      description="A live chunk feed: an interval appends a few characters to the source every 80ms — paragraphs grow in place, table rows settle as they close, and an open fence keeps a loading face with progressive highlighting until it closes. streaming follows the feed: pause drops to the final face (open constructs settle, the cursor leaves), resume re-enters streaming on the same extending source, reset recycles the parser (the non-append law). The cursor span is aria-hidden — the blink is decoration."
      sourceUrl={registrySourceUrl('markdown')}
      files={[
        { name: 'src/lib/ui/markdown-stream-usage.svelte', content: streamUsage, kind: 'usage' },
      ]}
      stage="fill"
      onreset={resetStream}
      output={[
        { label: 'chars', value: `${revealed} / ${STREAM_DOC.length}` },
        { label: 'streaming', value: playing ? 'true' : 'false' },
      ]}
    >
      <div class="flex w-full flex-col gap-3">
        <div class="flex flex-wrap items-center gap-2">
          <PressButton onclick={togglePlay}>{playing ? 'pause' : streamDone ? 'replay' : 'play'}</PressButton>
          <PressButton variant="ghost" onclick={resetStream}>reset</PressButton>
          <span class="font-mono text-[11.5px] text-muted-foreground" aria-live="polite">
            {playing ? 'streaming' : streamDone ? 'final' : 'paused · final face'}
          </span>
        </div>
        <div class="w-full max-w-[46rem]" data-doc-demo-scope="headings-ok">
          <Markdown source={streamSource} streaming={playing} />
        </div>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayRow label="playing" hint="streaming = playing">
            <PlayToggle bind:value={playing} />
          </PlayRow>
          <PlayHelp>
            The keyed-block laws: the prefix freezes (digest keys — zero flicker, stable anchors),
            the tail mutates in place on its <code>:tail</code> key, and a type transition mid-typing
            swaps the key once. Pausing finalizes (L4) — the half-typed fence settles; resuming
            re-streams without losing the prefix. Reset is the non-append recycle path: the parser
            recreates its instance and re-parses from scratch.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- demo c: custom components (the override seam) -->
  <div id="markdown-overrides" data-region="markdown-overrides" data-family="markdown-overrides" data-reveal="">
    <ComponentCanvas
      title="custom components"
      description="The components prop maps a node type to YOUR component: here link nodes route through DocLink — absolute http(s) hrefs open in a new tab with a trailing glyph, app routes keep default navigation — and children delegate back through the exported MarkdownNode. Overrides are trusted application code (the react-markdown model): they receive the node raw, and the default map's security floor does not cover what an override chooses to render."
      sourceUrl={registrySourceUrl('markdown')}
      files={[
        { name: 'src/lib/ui/doc-link.svelte', content: docLinkSource },
        { name: 'src/lib/ui/markdown-override-usage.svelte', content: overrideUsage, kind: 'usage' },
      ]}
      stage="fill"
    >
      <div class="w-full max-w-[46rem]" data-doc-demo-scope="headings-ok">
        <Markdown source={overrideDoc} components={{ link: DocLink }} />
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            One trust boundary, stated plainly: the DEFAULT map is the security floor (raw HTML
            degrades to escaped text, unsafe schemes demote at parse, images sanitize); the
            override seam is application code with the same trust as any component you render by
            hand — it owns what it renders.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- demo d: static document -->
  <div id="markdown-static" data-region="markdown-static" data-family="markdown-static" data-reveal="">
    <ComponentCanvas
      title="static document"
      description="The default face: no streaming prop, first parse final — release notes, READMEs, changelogs. An unclosed fence (the one at the end never closes) renders as settled code, never a loading state; task lists are static disabled inputs; the cursor never mounts."
      sourceUrl={registrySourceUrl('markdown')}
      files={[
        { name: 'src/lib/ui/markdown-static-usage.svelte', content: staticUsage, kind: 'usage' },
      ]}
      stage="fill"
    >
      <div class="w-full max-w-[46rem]" data-doc-demo-scope="headings-ok">
        <Markdown source={staticDoc} />
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            The component is a pure function of <code>(source, streaming)</code> — SSR renders and
            the client hydrates the same snapshot (identical props ⇒ identical parse ⇒ identical
            keys). A stream that begins after hydration is a normal update, not a hydration event.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>
    </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <!-- api: the props table + the floor -->
  <div id="api" data-reveal="">
    <SectionCard
      family="api"
      headerRegion="api"
      eyebrow="api"
      title="API"
      summary="Three props of the component's own plus the HTML div passthrough. The barrel also exports MarkdownNode — the override delegation seam — and parse.ts's adapter surface (createMarkdownParser, block keys/digests, the full node-type vocabulary)."
    >
      <PropsTable meta={markdownMeta} docs={MARKDOWN_DOCS} />
      <div class="mt-5 grid gap-4 min-[760px]:grid-cols-2">
        <div class="border border-border bg-muted/40 px-4 py-4">
          <h3 class="font-nav mb-3 text-[13px] tracking-tight">the security floor (default map)</h3>
          <ul class="flex flex-col gap-2 text-[13px] leading-6">
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span><code class="text-accent">html: false</code> — raw HTML from the source degrades to escaped literal text; nothing is ever parsed as markup</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>unsafe URL schemes (<code class="text-accent">javascript:</code> and friends) demote to plain text at parse time — they never reach an href</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>image src survives <code class="text-accent">sanitizeImageSrc</code> or the img is omitted entirely — bitmap data URLs render, SVG and other schemes never leak</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>zero <code class="text-accent">{'{@html}'}</code> in the renderer — code markup lands as inert, escaped spans</span></li>
          </ul>
        </div>
        <div class="border border-border bg-muted/40 px-4 py-4">
          <h3 class="font-nav mb-3 text-[13px] tracking-tight">the trust boundaries</h3>
          <ul class="flex flex-col gap-2 text-[13px] leading-6">
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span><code class="text-accent">components</code> overrides are trusted application code — they own what they render; the floor above covers the DEFAULT map</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>ambient markstream plugins (module-global registration) are a trusted process boundary — one dev warning states that BOTH the vocabulary and URL-security guarantees suspend while they are present</span></li>
            <li class="flex gap-2"><span class="text-primary" aria-hidden="true">&gt;</span>
              <span>the parser is a library dependency (<code class="text-accent">stream-markdown-parser</code>); the renderer and the mapping vocabulary stay 100% first-party</span></li>
          </ul>
        </div>
      </div>
    </SectionCard>
  </div>

  <!-- see also: hand-authored (the docs-route-model reading chain has no
       markdown neighbors until the catalog batch lands) — the bare
       section carries the skeleton lint's data-doc-see-also marker, the
       docs-see-also.svelte structure with this change's own links -->
  <div id="see-also" data-reveal="">
    <section data-doc-see-also="" aria-label="see also">
      <h2 class="font-nav text-balance text-[1.05rem] leading-tight tracking-tight sm:text-[1.22rem]">See Also</h2>
      <p class="mt-2 text-[12.5px] text-muted-foreground">The families the mapping vocabulary composes with.</p>
      <ul class="mt-3 flex flex-wrap gap-2">
        <li><a class="pill" href="/docs/components/table.html">table — the GFM table mapping target</a></li>
        <li><a class="pill" href="/docs/components/code-card.html">code-card — the fenced-code mapping target</a></li>
        <li><a class="pill" href="/docs/jx-pure.html">jx-pure — the componentless prose face</a></li>
        <li><a class="pill" href="/docs/components/inline-code.html">inline-code — the chip override</a></li>
      </ul>
    </section>
  </div>
</div>
