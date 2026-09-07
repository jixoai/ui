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
  import { PlayFields, PlayRow, PlaySegmented, PlayToggle, PlayHelp } from '$lib/playground';
  import type { MarkdownTypography } from '$lib/ui/markdown/parse';

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

  // ---- typography presets demo state --------------------------------------

  let typography = $state<MarkdownTypography>('standard');
  const typographyOptions: { value: MarkdownTypography; label: string }[] = [
    { value: 'compact', label: 'compact' },
    { value: 'standard', label: 'standard' },
    { value: 'relaxed', label: 'relaxed' },
  ];

  const rhythmSample = [
    '## The block rhythm, one token',
    '',
    'Every top-level block is one **stack token** apart — the first block never earns a top margin, and headings breathe at 1.75x above (the GitHub / Tailwind Typography calibration).',
    '',
    '- the prose scale is its own axis: 13/1.55 compact, 14/1.7 standard, 16/1.75 relaxed',
    '- [x] checkboxes ride the text middle (the task-item law)',
    '- [ ] wrapped task text flows like any inline content',
    '',
    '> A blockquote keeps the face rule; nested prose inside keeps the face rhythm — only the root level rides the stack.',
    '',
    FENCE + 'ts',
    'const stack = { compact: 8, standard: 14, relaxed: 20 }; // px between blocks',
    FENCE,
    '',
    '| preset | text | leading | stack |',
    '| --- | --- | --- | ---: |',
    '| compact | 13px | 1.55 | 8px |',
    '| standard | 14px | 1.70 | 14px |',
    '| relaxed | 16px | 1.75 | 20px |',
    '',
    'The heading ladder is em-scaled, so every preset keeps its hierarchy — `relaxed` renders the face’s exact numbers.',
  ].join('\n');

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

  // ---- GitHub alerts: the default map's one new behavior -------------------

  const alertsDoc = [
    '> [!NOTE]',
    '> GitHub alert markers on the quote\'s own first line render as tonal',
    '> Blockquotes with the label and status hue wired by the map.',
    '',
    '> [!TIP]',
    '> The five kinds — note, tip, important, warning, caution — map to the',
    '> five status hues; caution is the error hue (statuses, never destructive).',
    '',
    '> [!IMPORTANT]',
    '> A half-typed marker simply does not match: the block renders the plain',
    '> quote and keeps updating in place (the L2 in-place tail law).',
    '',
    '> [!WARNING]',
    '> Markers not on their own first line never trigger (the GitHub rule).',
    '',
    '> [!CAUTION]',
    '> Mixed-case markers trigger — `> [!Note]` is a note, GitHub behavior.',
    '',
    '> And a plain quote keeps the classic outline rule — no label, no hue,',
    '> exactly the reading-content posture.',
  ].join('\n');

  const alertsUsage = `<!-- nothing to wire: the detector is part of the default map -->
<Markdown source={alertsDoc} />`;

  // ---- html equivalence (markdown-coverage §8) -------------------------------

  const equivalenceDoc = [
    'HTML is markdown spelled differently — both spellings land in the same',
    'component: <b>html bold</b> and **markdown bold** are one Strong.',
    '',
    'The frozen tag table: <strong>strong</strong>, <em>em</em>, <i>i</i>,',
    '<del>del</del>, <s>s</s>, <ins>ins</ins>, <u>u</u>, <mark>mark</mark>,',
    'H<sub>2</sub>O, x<sup>2</sup>, <code>a code chip</code>,',
    'press <kbd>⌘K</kbd>, and',
    '<a href="https://example.com">an html anchor</a>.',
    '',
    'Everything outside the table stays escaped literal text:',
    '<span>span is not in the table</span>, and scripts never execute.',
  ].join('\n');

  const equivalenceUsage = `<!-- nothing to wire: equivalence is the default map -->
<Markdown source={equivalenceDoc} />`;

  const accordionDoc = [
    '<details>',
    '<summary>Shipping</summary>',
    'Consecutive top-level <code>&lt;details&gt;</code> runs merge into ONE',
    'accordion group — the frame and seams a pile of bare disclosures lacks.',
    'Bodies parse markdown: **bold**, `chips` and [links](https://example.com).',
    '</details>',
    '<details open>',
    '<summary>Native semantics</summary>',
    '',
    'The accordion IS native `<details>/<summary>` — W3C-first, the same',
    'philosophy as every input in this registry. The `open` attribute carries',
    'through: this item shipped open.',
    '',
    '</details>',
    '<details>',
    '<summary>Unknown tags stay text</summary>',
    'A &lt;div&gt; or &lt;script&gt; never becomes markup — the floor holds.',
    '</details>',
  ].join('\n');

  const accordionUsage = `<!-- nothing to wire: the group merge is part of the default map -->
<Markdown source={accordionDoc} />`;

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
      summary="One component turns a markdown string into jixoai surfaces: fenced code lands in code-card (generation-guard repaint keeps partial code readable mid-stream), tables land in the registry table under a data-kind wrapper, and every prose construct lands on a first-party reading-content part — Blockquote (with GitHub alert detection), Heading, List, the text family, Link, InlineCode, Separator — escaping the jx-pure face exactly where the box-owning blocks need it and composing with it everywhere else. Streaming is keyed-block memoized — the frozen prefix keeps its DOM while append-only chunks re-render only the trailing block — and streaming=false (the default) is a static, final document. The parser core is stream-markdown-parser; the renderer, the mapping vocabulary and the security floor (html:false, validateLink, image sanitize, zero raw-HTML injection) are 100% first-party."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">streaming-first · keyed blocks (L1–L4)</span>
        <span class="pill">AST → blockquote · heading · list · text · link · inline-code · separator · table · code-card</span>
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
      summary="One ability per demo: the GFM vocabulary in one pass, the GitHub alerts matrix, the streaming simulation (a live chunk feed over the public props), the components override seam, and the static document face."
    >
      <p class="m-0 text-[13px] leading-6 text-muted-foreground">
        The markdown component exists to render headings — every demo mounts it inside the
        lint-sanctioned <code class="text-accent">headings-ok</code> scope, and demo sources never
        mint an h1 (this page owns exactly one). The simulation is page-owned state over public
        component behavior — zero registry edits, zero API bypasses.
      </p>
    </SectionCard>
  </div>

  <!-- the component coverage map: node type → registry part (design §3) -->
  <div id="markdown-coverage-map" data-region="markdown-coverage-map" data-family="markdown-coverage-map" data-reveal="">
    <SectionCard
      family="markdown-coverage-map"
      headerRegion="markdown-coverage-map"
      eyebrow="the map"
      title="Component coverage map"
      summary="The default map is first-party end to end (markdown-coverage-components §3): every markdown construct lands on a registry part, uniformly managed. Box-owning block surfaces escape the jx-pure face (no-jx-pure on the root) so it stops double-painting them; face-composing inline members never escape — an inline escape would virally descope the code chips and nested marks a link legitimately contains. The override seam is still consulted first; the map's growth changes nothing about its trust class."
    >
      <div class="table-scroll">
        <table class="data-table">
          <caption class="sr-only">markdown node type to registry part mapping</caption>
          <thead>
            <tr>
              <th>Node type</th>
              <th>Renders</th>
              <th>Escape</th>
            </tr>
          </thead>
          <tbody>
            <tr><td><code>code_block</code></td><td class="dim">CodeCard (unchanged — partial code + loading state mid-fence)</td><td class="dim">carrier div (existing)</td></tr>
            <tr><td><code>table</code></td><td class="dim">Table in <code>div[data-kind="table"]</code> (unchanged)</td><td class="dim">carrier (existing)</td></tr>
            <tr><td><code>blockquote</code></td><td class="dim">Blockquote — GitHub-alert detection first (§ the alerts demo)</td><td class="dim">root <code>no-jx-pure</code></td></tr>
            <tr><td><code>heading</code></td><td class="dim"><code>&lt;Heading level&gt;</code> (the em ladder)</td><td class="dim">root <code>no-jx-pure</code></td></tr>
            <tr><td><code>list</code></td><td class="dim"><code>&lt;List ordered start&gt;</code> (list_item stays native li)</td><td class="dim">root <code>no-jx-pure</code></td></tr>
            <tr><td><code>paragraph</code> / inline</td><td class="dim"><code>&lt;P&gt;</code></td><td class="dim">face-composing</td></tr>
            <tr><td><code>strong / emphasis / strikethrough / highlight / insert / subscript / superscript</code></td><td class="dim"><code>&lt;Strong&gt; &lt;Em&gt; &lt;Del&gt; &lt;Mark&gt; &lt;Ins&gt; &lt;Sub&gt; &lt;Sup&gt;</code></td><td class="dim">face-composing</td></tr>
            <tr><td><code>link</code></td><td class="dim"><code>&lt;Link&gt;</code> (absolute http(s) opens externally)</td><td class="dim">face-composing</td></tr>
            <tr><td><code>inline_code</code></td><td class="dim"><code>&lt;InlineCode&gt;</code> riding the component's <code>lang="auto"</code> default (children recursed inside)</td><td class="dim">root escape</td></tr>
            <tr><td><code>thematic_break</code></td><td class="dim"><code>&lt;Separator /&gt;</code></td><td class="dim">carrier div + root escape</td></tr>
            <tr><td><code>checkbox</code> (task items)</td><td class="dim">native disabled input — the jx-pure bare-checkbox face paints it</td><td class="dim">—</td></tr>
            <tr><td><code>image</code></td><td class="dim">native <code>&lt;img&gt;</code> (unchanged — sanitized; the no-CLS unlock is a recorded followup)</td><td class="dim">—</td></tr>
            <tr><td><code>text / hardbreak / emoji / footnote bits / dl</code></td><td class="dim">native (the pure-text floor)</td><td class="dim">—</td></tr>
          </tbody>
        </table>
      </div>
    </SectionCard>
  </div>

  <!-- demo a: kitchen sink -->
  <div id="markdown-kitchen-sink" data-region="markdown-kitchen-sink" data-family="markdown-kitchen-sink" data-reveal="">
    <ComponentCanvas
      title="kitchen sink"
      description="The default map, one pass: emphasis onto the text family, inline chips onto InlineCode, a task list as disabled native inputs, the GFM table onto the registry table (td[data-label] + per-column align), a fenced card onto code-card, the quote onto Blockquote, headings onto Heading, the rule onto Separator, links and bare-URL autolinks onto Link. Images: bitmap data URLs render; SVG data URLs and unsafe schemes omit the img entirely (alt preserved). Footnotes degrade to inert sup text."
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
            The vocabulary is frozen (design §3 of markdown-coverage): every construct lands on a
            registry part — see the coverage map above for the full table. Unknown node types
            degrade to extracted literal text — structure never recurses into the unknown. The
            drawer carries the same-source registry copies this site runs (markdown.svelte,
            markdown-node.svelte, parse.ts, markdown.css).
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- demo a1: GitHub alerts (the map's one new behavior) -->
  <div id="markdown-alerts" data-region="markdown-alerts" data-family="markdown-alerts" data-reveal="">
    <ComponentCanvas
      title="GitHub alerts"
      description="The default map's one new behavior: a [!NOTE|TIP|IMPORTANT|WARNING|CAUTION] marker on the quote's own first line renders a tonal Blockquote — label and status hue wired by the map (note→info, tip→success, important→primary, warning→warning, caution→error — statuses, never the destructive action hue). A half-typed marker simply does not match: the block renders the plain quote and keeps updating in place (L2 — the tail item never remounts on content mutation)."
      sourceUrl={registrySourceUrl('markdown')}
      files={[
        { name: 'src/lib/ui/markdown-alerts-usage.svelte', content: alertsUsage, kind: 'usage' },
      ]}
      stage="fill"
      scroll="grow"
    >
      <div class="w-full max-w-[46rem]" data-doc-demo-scope="headings-ok">
        <Markdown source={alertsDoc} />
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            Detection rules: the marker must fully match on the paragraph's own first line
            (mid-line markers never trigger — the GitHub rule); mixed case triggers
            (<code>[!Note]</code> is a note); the marker line is stripped from the body and an
            empty remainder paragraph is dropped. The detector is a pure function of the node, so
            streaming stays law-abiding — feed it <code>&gt; [!NO</code> then <code>&gt; [!NOTE]</code>
            and the keyed item identity holds while the rendered face swaps.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- demo a1b: html equivalence (the two spellings, one component) -->
  <div id="markdown-html-equivalence" data-region="markdown-html-equivalence" data-family="markdown-html-equivalence" data-reveal="">
    <ComponentCanvas
      title="html equivalence"
      description="Markdown sources may mix HTML: the frozen tag table routes whitelisted tags onto the SAME components as their markdown spellings — <b>html bold</b> and **markdown bold** are one Strong, an html anchor is the Link, <code> is the InlineCode chip, <kbd> rides Kbd. Everything outside the table (span, div, script…) stays escaped literal text — the security floor lives render-side: zero &#123;@html&#125; anywhere, hrefs re-validate on both syntax paths."
      sourceUrl={registrySourceUrl('markdown')}
      files={[
        {
          name: 'src/lib/ui/markdown-html-equivalence-usage.svelte',
          content: equivalenceUsage,
          kind: 'usage',
        },
      ]}
      stage="fill"
    >
      <div class="w-full max-w-[46rem]" data-doc-demo-scope="headings-ok">
        <Markdown source={equivalenceDoc} />
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            The table is spec-frozen vocabulary (adding a tag is a spec change): b/strong,
            i/em, del/s/strike, ins/u, mark, sub, sup, code, kbd, a, br, img inline;
            details/summary and hr at block position. Nested details keep their AST nesting
            in the contiguous form — CommonMark's html_block rule fragments at blank lines
            (fragments render as separate groups; a documented boundary).
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- demo a1c: details/summary ride the accordion -->
  <div id="markdown-accordion" data-region="markdown-accordion" data-family="markdown-accordion" data-reveal="">
    <ComponentCanvas
      title="details → accordion"
      description="The common <details>/<summary> pair in markdown rides the accordion — the W3C-first item that IS native details/summary (no div simulation, the same philosophy as every input here). Consecutive top-level details runs merge into ONE group (a pure parse-side transform; a growing group remounts once per semantic event, the link-reference-definition precedent); <details open> carries through; bodies parse their markdown; a summary-less details renders the default disclosure label."
      sourceUrl={registrySourceUrl('markdown')}
      files={[
        {
          name: 'src/lib/ui/markdown-accordion-usage.svelte',
          content: accordionUsage,
          kind: 'usage',
        },
      ]}
      stage="fill"
    >
      <div class="w-full max-w-[46rem]" data-doc-demo-scope="headings-ok">
        <Markdown source={accordionDoc} />
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            The accordion's exclusive mode is off in the mapped face (each disclosure opens
            independently — the html semantics). The items are native disclosures: toggle
            with click or keyboard, view-source shows real summary/details elements under
            the accordion's frame.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- demo a2: typography presets (the density trio) -->
  <div id="markdown-typography" data-region="markdown-typography" data-family="markdown-typography" data-reveal="">
    <ComponentCanvas
      title="typography presets"
      description="The prose density trio — one prop, one stack token: compact 13px/1.55 with an 8px block stack for dense chat panes, standard 14px/1.7 at 14px, relaxed 16px/1.75 at 20px (the Tailwind prose-base / GitHub body calibration). The block rhythm is a single --jx-md-stack law: adjacent siblings only, headings breathe at 1.75x, the first block hugs the top; the heading ladder is em-scaled so every preset keeps its hierarchy."
      sourceUrl={registrySourceUrl('markdown')}
      files={[
        {
          name: 'src/lib/ui/markdown-density-usage.svelte',
          content: '<Markdown source={doc} typography={typography} />',
          kind: 'usage',
        },
      ]}
      stage="fill"
    >
      <div class="w-full max-w-[46rem]" data-doc-demo-scope="headings-ok">
        <Markdown source={rhythmSample} {typography} />
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayRow label="typography">
            <PlaySegmented bind:value={typography} options={typographyOptions} />
          </PlayRow>
          <PlayHelp>
            The trio is the PROSE scale — deliberately not the UI-density ladder (2xs…lg governs
            control surfaces). Calibration references: GitHub's renderer and Tailwind Typography;
            relaxed renders the jx-pure face's exact numbers.
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
        <li><a class="pill" href="/docs/components/blockquote.html">blockquote — the quote mapping target (GitHub alerts land here)</a></li>
        <li><a class="pill" href="/docs/components/text.html">text — the paragraph and marks mapping target</a></li>
        <li><a class="pill" href="/docs/components/table.html">table — the GFM table mapping target</a></li>
        <li><a class="pill" href="/docs/components/code-card.html">code-card — the fenced-code mapping target</a></li>
        <li><a class="pill" href="/docs/jx-pure.html">jx-pure — the componentless prose face</a></li>
        <li><a class="pill" href="/docs/components/inline-code.html">inline-code — the chip override</a></li>
      </ul>
    </section>
  </div>
</div>
