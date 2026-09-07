<!--
  Docs page for list (markdown-coverage-components §1.3, Lane D). The
  prose list — deliberately NOT list-item (that item is the antd/F7
  settings-row system); the page states the disambiguation up front and
  points task lists at the markdown face.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DocsInstall from '$lib/docs-install.svelte';
  import DocsSeeAlso from '$lib/docs-see-also.svelte';
  import InlineCode from '$lib/ui/inline-code/inline-code.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import List from '$lib/ui/list/list.svelte';
  import { registrySourceUrl } from '$lib/registry-source';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import listSource from '$lib/ui/list/list.svelte?raw';

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import { List } from '@ui/list';
${close}

<!-- unordered (default): disc markers, muted ink -->
<List>
  <li>prefix keys freeze while the tail grows</li>
  <li>the tail mutates in place</li>
</List>

<!-- ordered: decimal markers, start honored -->
<List ordered start={4}>
  <li>the fourth finding</li>
  <li>the fifth</li>
</List>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/list/list.svelte', content: listSource },
    { name: 'src/lib/ui/list-usage.svelte', content: usage, kind: 'usage' },
  ];
</script>

<svelte:head>
  <title>List · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai list: the prose list as a native ol or ul by the ordered prop — disc or decimal markers, muted marker ink, a 1.5rem inline start pad, start passthrough for ordered lists. It styles the list, never the row: children stay native li elements so element-based rhythm selectors keep matching. Not list-item — that item is the antd/F7 settings-row system."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Data Display"
        title="list — the prose list, the list itself"
        summary="A native <ol|ul> by the ordered prop — the separator's dual-root cast, with start passed explicitly on the ol branch only. What it owns is the reading channel set: list-style disc|decimal, padding-inline-start 1.5rem, muted marker ink. What it refuses: block margins (the rhythm and flush laws own spacing, as with heading) and any opinion about the rows — children stay native <li> elements, so the element-based rhythm selectors, the flush law and the container-inner sibling stack keep matching the native roots (the markdown map composes exactly this way; list_item stays bare). Not to be confused with list-item: that item is the antd/F7 settings-row system — ItemGroup frames, media/end lanes, five control adapters — a different taxonomy entirely."
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">native &lt;ul&gt; | &lt;ol&gt;</span>
          <span class="pill">ordered · start passthrough</span>
          <span class="pill">styles the list, never the row</span>
          <span class="pill">not list-item</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <DocsInstall name="list" />
    </div>

    <div id="usage" data-reveal="">
      <SectionCard
        family="usage"
        headerRegion="usage"
        eyebrow="usage"
        title="Usage"
        summary="One boolean flips the root; write your rows as plain li elements — or component trees that render them. The component owns marker shape, marker ink and the inline pad; everything else is the container's rhythm."
      >
        <CodeBlock code={usage} lang="svelte" meta="List usage" />
      </SectionCard>
    </div>

    <div id="shapes" data-region="list-shapes" data-family="list-shapes" data-reveal="">
      <ComponentCanvas
        title="list"
        description="The unordered default with muted markers, an ordered list continuing from start={4}, and a nested composition — an inner list rides the same channels at one level deeper, no extra classes."
        sourceUrl={registrySourceUrl('list')}
        files={canvasFiles}
        stage="fill"
      >
        <div class="grid w-full max-w-3xl gap-8 min-[760px]:grid-cols-2">
          <List>
            <li>prefix keys freeze while the tail grows</li>
            <li>the tail mutates in place on its <code class="font-mono text-[0.85em]">:tail</code> key</li>
            <li>
              nesting composes:
              <List>
                <li>the inner list rides the same channels</li>
                <li>one level deeper, zero extra classes</li>
              </List>
            </li>
          </List>
          <List ordered start={4}>
            <li>the fourth finding — start shifts the first marker</li>
            <li>the fifth, continuing the decimal run</li>
            <li>marker ink is muted; body ink is not</li>
          </List>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              <code>ordered</code> flips the root element (and the hook:
              <code>data-jx-list="ol" | "ul"</code> — the separator's data-orientation form).
              <code>start</code> is an ol-only passthrough; the native ul carries no such
              attribute, so it is ignored there. Spacing between items is your container's
              rhythm — this component deliberately ships none.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="task-items" data-region="list-task-items" data-family="list-task-items" data-reveal="">
      <SectionCard
        family="task-items"
        headerRegion="task-items"
        eyebrow="law"
        title="Task lists live in the markdown face"
        summary="The GFM task-item rules — marker suppression on li:has(> input), checkbox middle-alignment — are container-level DOM-shape laws, not list paint, and they stay in the markdown sheet where the li shape is known. This component takes no checkbox wiring: render task lists through the markdown component and the jx-pure bare-checkbox face paints the markers."
      >
        <div class="flex flex-col gap-4">
          <p class="m-0 text-[13px] leading-6 text-muted-foreground">
            A task item is a <em>container</em> judgment: the sheet sees the raw
            <InlineCode lang="text">li:has(&gt; input)</InlineCode>
            shape and suppresses the marker. A standalone list component that rendered checkboxes
            would have to re-own those rules — the double-marker bug would return. The markdown
            map keeps task checkboxes as native disabled inputs for exactly this reason.
          </p>
          <p class="m-0 text-[13px] leading-6 text-muted-foreground">
            See the <a class="text-accent underline underline-offset-2" href="/docs/components/markdown.html">markdown page</a>
            for the task-list face — and the
            <a class="text-accent underline underline-offset-2" href="/docs/components/list-item.html">list-item page</a>
            for the settings-row system this component deliberately is not.
          </p>
        </div>
      </SectionCard>
    </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="accessibility" data-reveal="">
    <SectionCard
      family="accessibility"
      headerRegion="accessibility"
      eyebrow="a11y"
      title="Accessibility"
      summary="Native list semantics — the platform announces items-in-group counts for free."
    >
      <A11yTable
        keys={[{ key: '—', action: 'Not focusable — document structure, not a control' }]}
        aria={[
          { name: 'ul / ol', value: 'native elements', description: 'Item-group semantics from the platform; ordered lists announce their length.' },
          { name: 'li', value: 'consumer-owned', description: 'The rows are yours — native li children (or component trees rendering them); this component styles the list, never the item.' },
          { name: 'data-jx-list', value: "'ol' | 'ul'", description: 'Hook attribute naming which native root rendered — the separator\'s data-orientation form.' },
        ]}
      />
    </SectionCard>
  </div>

  <div id="api" data-reveal="">
    <SectionCard
      family="api"
      headerRegion="api"
      eyebrow="api"
      title="API"
      summary="Three props and a verbatim spread; one boolean flips the root element."
    >
      <PropsTable props={[
        { name: 'ordered', type: 'boolean', default: 'false', description: 'false → <ul> (disc markers); true → <ol> (decimal markers). The Props shape is typed on the ul form; the ol branch spreads the same rest through the ol element type.' },
        { name: 'start', type: 'number', default: '—', description: 'The first marker value of an ordered list (ol-only passthrough — the native ul element carries no such attribute, so it is ignored there).' },
        { name: 'children', type: 'Snippet', default: '—', description: 'The list items — native <li> children or component trees that render them.' },
        { name: 'class', type: 'string', default: "''", description: 'Forwarded to the rendered list root; consumer classes land last.' },
        { name: '...rest', type: 'HTMLAttributes<HTMLUListElement>', default: 'spread', description: 'Every other attribute passes through to the native list element untouched.' },
      ]} />
    </SectionCard>
  </div>

  <div data-reveal="">
    <DocsSeeAlso name="list" />
  </div>
</div>
