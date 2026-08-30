<!--
  Docs page for the timeline family (composition-first-apis, 2026-08-25).
  Intents:
  1. Hero summary comes from the registry catalog (CATALOG lookup,
     fail-loud on miss — never hand-write registry copy).
  2. One ComponentCanvas: the full Dice anatomy authored explicitly —
     Dot, Connector, Content, Time, Title, free-children body.
  3. Playground protocol: the page owns the snapshot + reset; a toggle
     flips the last entry's `pending` flag; the drawer's usage file
     tracks it live.
  4. Usage CodeBlock: the copyable composition sample.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { CATALOG } from '$lib/catalog';
  import { PlayFields, PlayRow, PlayToggle, PlayHelp } from '$lib/playground';
  import Timeline, {
    TimelineItem,
    TimelineDot,
    TimelineConnector,
    TimelineContent,
    TimelineTime,
    TimelineTitle,
  } from '$lib/ui/timeline/index';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import timelineSource from '$lib/ui/timeline/timeline.svelte?raw';
  import timelineItemSource from '$lib/ui/timeline/timeline-item.svelte?raw';
  import timelineDotSource from '$lib/ui/timeline/timeline-dot.svelte?raw';
  import timelineConnectorSource from '$lib/ui/timeline/timeline-connector.svelte?raw';
  import timelineContentSource from '$lib/ui/timeline/timeline-content.svelte?raw';
  import timelineTimeSource from '$lib/ui/timeline/timeline-time.svelte?raw';
  import timelineTitleSource from '$lib/ui/timeline/timeline-title.svelte?raw';
  import timelineCssSource from '$lib/ui/timeline/timeline.css?raw';
  import timelineIndexSource from '$lib/ui/timeline/index.ts?raw';

  // catalog sync-binding: the hero summary IS the registry description;
  // a miss means registry.json meta drifted — fail loud, never patch copy.
  const entry = CATALOG.find((candidate) => candidate.name === 'timeline');
  if (!entry) {
    throw new Error('catalog miss: "timeline" has no registry meta — fix registry.json');
  }

  // single usage sample: the drawer's usage file and the body CodeBlock share it
  const usage = `<Timeline>
  <TimelineItem>
    <TimelineDot />
    <TimelineConnector />
    <TimelineContent>
      <TimelineTime datetime="2026-08-22T07:02:00Z">07:02</TimelineTime>
      <TimelineTitle>pushed</TimelineTitle>
      <p>12 checks · 0 failed · 8.2s</p><!-- free children = the body -->
    </TimelineContent>
  </TimelineItem>
  <TimelineItem pending><!-- hollow dot + muted title (attribute paint) -->
    <TimelineDot />
    <TimelineConnector />
    <TimelineContent>
      <TimelineTitle>deploying</TimelineTitle>
    </TimelineContent>
  </TimelineItem>
</Timeline>`;

  // Playground protocol: the page owns the snapshot + reset; the toggle flips
  // the last entry's pending flag; the drawer's usage file tracks it live.
  const canvasInitial = { pending: true };
  let pending = $state(canvasInitial.pending);
  function resetCanvas(): void {
    pending = canvasInitial.pending;
  }
  const usageLive = $derived(usage.replace('<TimelineItem pending>', `<TimelineItem pending={${pending}}>`));
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/timeline/timeline.svelte', content: timelineSource },
    { name: 'registry/files/ui/timeline/timeline-item.svelte', content: timelineItemSource },
    { name: 'registry/files/ui/timeline/timeline-dot.svelte', content: timelineDotSource },
    { name: 'registry/files/ui/timeline/timeline-connector.svelte', content: timelineConnectorSource },
    { name: 'registry/files/ui/timeline/timeline-content.svelte', content: timelineContentSource },
    { name: 'registry/files/ui/timeline/timeline-time.svelte', content: timelineTimeSource },
    { name: 'registry/files/ui/timeline/timeline-title.svelte', content: timelineTitleSource },
    { name: 'registry/files/ui/timeline/timeline.css', content: timelineCssSource },
    { name: 'registry/files/ui/timeline/index.ts', content: timelineIndexSource },
    { name: 'src/lib/ui/timeline-usage.svelte', content: usage, kind: 'usage' },
  ];

  // ToC outline: pairs with +page.ts, in page order.
</script>

<svelte:head>
  <title>Timeline · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai timeline family (full Dice UI anatomy): an ol of timestamped entries where order is the chronology and the spine is css decoration. Dot, Connector, Content, Time and Title are authored parts; the body is free children; pending paints the hollow dot and muted title through the item's attribute. Zero JS."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Data display"
        title="timeline — the composed activity spine"
        summary={entry.summary}
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">ol · order is chronology</span>
          <span class="pill">Dot / Connector / Content / Time / Title</span>
          <span class="pill">body = free children</span>
          <span class="pill">pending hollow dot · attribute paint</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <ComponentCanvas
        title="timeline"
        stage="fill"
        description="Every part below is authored: Dot and Connector build the spine (the Connector self-hides inside the last item through family css), Content stacks Time, Title and whatever body you compose as plain children."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/timeline/timeline.svelte"
        files={canvasFiles}
        onreset={resetCanvas}
        output={[{ label: 'last entry pending', value: pending }]}
        resolveFileContent={resolveUsage}
      >
        <div class="w-full max-w-md">
          <Timeline>
            <TimelineItem>
              <TimelineDot />
              <TimelineConnector />
              <TimelineContent>
                <TimelineTime datetime="2026-08-22T07:02:41Z">07:02</TimelineTime>
                <TimelineTitle>pushed</TimelineTitle>
                <p class="text-[12.5px] text-muted-foreground">feat: popover family on CSS anchors · 4f2a1c</p>
              </TimelineContent>
            </TimelineItem>
            <TimelineItem>
              <TimelineDot />
              <TimelineConnector />
              <TimelineContent>
                <TimelineTime datetime="2026-08-22T07:03:19Z">07:03</TimelineTime>
                <TimelineTitle>checks passed</TimelineTitle>
                <p class="text-[12.5px] text-muted-foreground">12 checks · 0 failed · 8.2s</p>
              </TimelineContent>
            </TimelineItem>
            <TimelineItem {pending}>
              <TimelineDot />
              <TimelineConnector />
              <TimelineContent>
                <TimelineTitle>deploying</TimelineTitle>
                <p class="text-[12.5px] text-muted-foreground">edge cache warming — 2 of 7 regions live</p>
              </TimelineContent>
            </TimelineItem>
          </Timeline>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayRow label="last entry pending" hint="in-flight chronology entry">
              <PlayToggle bind:value={pending} />
            </PlayRow>
            <PlayHelp>
              <code class="text-accent">pending</code> is the only state a timeline carries — it
              paints the hollow dot and the muted title off the item's data-jx-tl-pending
              attribute, never part logic. TimelineTime wraps a machine-readable
              <code class="text-accent">datetime</code>; formatting the display is yours.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    
    <div id="types" data-reveal=""><SectionCard eyebrow="types" title="Timeline anatomy" summary="Timeline is composition-first: item, dot, connector, time, title and free-form body remain independent parts."><div class="max-w-md"><Timeline><TimelineItem><TimelineDot /><TimelineConnector /><TimelineContent><TimelineTime datetime="2026-08-26">today</TimelineTime><TimelineTitle>released</TimelineTitle><p>Build promoted.</p></TimelineContent></TimelineItem></Timeline></div></SectionCard></div>
    <div id="usage" data-reveal=""><SectionCard summary="The composition contract in one sample: import the family from the registry barrel (@ui/timeline/index — per-part targets exist per file), author one TimelineItem per entry with the parts you need. There is no items[] prop and no body snippet — the body is plain children." eyebrow="usage" title="Usage"><CodeBlock code={usage} lang="svelte" meta="usage" /></SectionCard></div>
    <div id="accessibility" data-reveal=""><SectionCard eyebrow="a11y" title="Accessibility"><A11yTable aria={[{ name: 'ol', value: 'timeline root', description: 'Preserves chronological list semantics.' }, { name: 'time', value: 'datetime', description: 'Provides machine-readable event time.' }]} /></SectionCard></div>
    <div id="theming" data-reveal=""><SectionCard eyebrow="theming" title="Density and tokens"><DensityDemo scopes={['xs', 'default', 'lg']}><Timeline><TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>event</TimelineTitle></TimelineContent></TimelineItem></Timeline></DensityDemo><div class="mt-5"><TokenTable tokens={[{ name: '--jx-icon', default: 'density scale', source: 'density' }, { name: '--jx-stack', default: 'density scale', source: 'density' }, { name: '--jx-gap', default: 'density scale', source: 'density' }, { name: '--jx-inset', default: 'density scale', source: 'density' }, { name: '--jx-text', default: 'density scale', source: 'density' }, { name: '--jx-text-secondary', default: 'density scale', source: 'density' }, { name: '--jx-line', default: 'density scale', source: 'density' }, { name: '--jx-line-secondary', default: 'density scale', source: 'density' }]} /></div></SectionCard></div>
    <div id="api" data-reveal=""><SectionCard eyebrow="api" title="Timeline props"><PropsTable props={[{ name: 'density', type: 'Density', description: 'Overrides inherited density.' }, { name: 'class', type: 'string', description: 'Adds consumer classes.' }]} /></SectionCard></div>
  </div>
</div>
