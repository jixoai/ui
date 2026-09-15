<!--
  Docs page for the timeline family (W3 drawn-spine rework,
  Owner 2026-09-15; grid-engine rebuild 2026-09-01).
  Intents:
  1. Hero summary comes from the registry catalog (CATALOG lookup,
     fail-loud on miss — never hand-write registry copy).
  2. One ComponentCanvas: the floor line + spatial dot slots.
  3. Section galleries: directions (ltr/revert/interlaced), the
     horizontal axis, the 9-grid node, the drawn spine presets +
     custom snippet seam, the axis × direction × RTL geometry matrix,
     animations.
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
    TimelineContent,
    TimelineTime,
    TimelineTitle,
  } from '$lib/ui/timeline/index';
  import type { TimelineSpineGeometry } from '$lib/ui/timeline/index';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import timelineSource from '$lib/ui/timeline/timeline.svelte?raw';
  import timelineSpineSource from '$lib/ui/timeline/timeline-spine.svelte.ts?raw';
  import timelineItemSource from '$lib/ui/timeline/timeline-item.svelte?raw';
  import timelineDotSource from '$lib/ui/timeline/timeline-dot.svelte?raw';
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
    <!-- the 9-grid node: blockStart rides the spine as a labeled cutout -->
    <TimelineDot>
      {#snippet blockStart()}<span>07:02</span>{/snippet}
    </TimelineDot>
    <TimelineContent>
      <TimelineTime datetime="2026-08-22T07:02:00Z">07:02</TimelineTime>
      <TimelineTitle>pushed</TimelineTitle>
      <p>12 checks · 0 failed · 8.2s</p><!-- free children = the body -->
    </TimelineContent>
  </TimelineItem>
  <TimelineItem pending><!-- hollow dot + muted title (attribute paint) -->
    <TimelineDot variant="ring" />
    <TimelineContent>
      <TimelineTitle>deploying</TimelineTitle>
    </TimelineContent>
  </TimelineItem>
</Timeline>

<!-- the SPINE SEAM: presets by name, or a custom snippet receiving the
     measured geometry payload (node centers in list-root coordinates,
     flow order · axis/direction/rtl metadata · per-segment path data ·
     the density scale). The retired line(i) per-item seam is gone.
<Timeline spine="dashed"><!-- or "beam" | "plain" (default) -->

<Timeline>
  {#snippet spine(geometry)}
    <path d={geometry.runPath} fill="none" stroke="var(--primary)" stroke-width="1.5" />
  {/snippet}
  …
</Timeline> -->`;

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
    { name: 'registry/files/ui/timeline/timeline-spine.svelte.ts', content: timelineSpineSource },
    { name: 'registry/files/ui/timeline/timeline-item.svelte', content: timelineItemSource },
    { name: 'registry/files/ui/timeline/timeline-dot.svelte', content: timelineDotSource },
    { name: 'registry/files/ui/timeline/timeline-content.svelte', content: timelineContentSource },
    { name: 'registry/files/ui/timeline/timeline-time.svelte', content: timelineTimeSource },
    { name: 'registry/files/ui/timeline/timeline-title.svelte', content: timelineTitleSource },
    { name: 'registry/files/ui/timeline/timeline.css', content: timelineCssSource },
    { name: 'registry/files/ui/timeline/index.ts', content: timelineIndexSource },
    { name: 'src/lib/ui/timeline-usage.svelte', content: usage, kind: 'usage' },
  ];

  // ---- canvas-everywhere sweep (2026-09-08): hand-authored mirrors of
  // the effect-only demo regions below — the same-source resolveRawCode
  // migration of these strings is the recorded follow-up -------------
  const close = '</' + 'script>';

  const timelineImport = `import Timeline, {
  TimelineItem,
  TimelineDot,
  TimelineContent,
  TimelineTitle,
} from '@ui/timeline/index';`;

  // the direction forms (directions section), swept through a canvas
  const timelineDirectionsDemo = `<script lang="ts">
  ${timelineImport}
${close}

  <div class="grid gap-6 min-[1100px]:grid-cols-3">
  <div class="flex flex-col gap-2">
    <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">ltr (default)</span>
    <Timeline direction="ltr">
      <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>build</TimelineTitle></TimelineContent></TimelineItem>
      <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>test</TimelineTitle></TimelineContent></TimelineItem>
    </Timeline>
  </div>
  <div class="flex flex-col gap-2">
    <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">revert</span>
    <Timeline direction="revert">
      <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>build</TimelineTitle></TimelineContent></TimelineItem>
      <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>test</TimelineTitle></TimelineContent></TimelineItem>
    </Timeline>
  </div>
  <div class="flex flex-col gap-2">
    <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">interlaced</span>
    <Timeline direction="interlaced">
      <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>build</TimelineTitle></TimelineContent></TimelineItem>
      <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>test</TimelineTitle></TimelineContent></TimelineItem>
      <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>deploy</TimelineTitle></TimelineContent></TimelineItem>
    </Timeline>
  </div>
</div>`;

  const timelineDirectionsFiles: TreeFile[] = [
    { name: 'timeline-directions-demo.svelte', content: timelineDirectionsDemo, kind: 'usage' },
  ];

  // the horizontal transpose (axis section), swept through a canvas
  const timelineAxisDemo = `<script lang="ts">
  ${timelineImport}
${close}

  <div class="w-full overflow-x-auto border border-border p-6">
  <Timeline axis="horizontal" direction="interlaced" class="min-w-[40rem]">
    <TimelineItem>
      <TimelineDot>
        {#snippet blockStart()}<span>09:41</span>{/snippet}
      </TimelineDot>
      <TimelineContent><TimelineTitle>commit</TimelineTitle></TimelineContent>
    </TimelineItem>
    <TimelineItem>
      <TimelineDot variant="round">
        {#snippet blockStart()}<span>09:43</span>{/snippet}
      </TimelineDot>
      <TimelineContent><TimelineTitle>build</TimelineTitle></TimelineContent>
    </TimelineItem>
    <TimelineItem pending>
      <TimelineDot variant="round">
        {#snippet blockStart()}<span>09:45</span>{/snippet}
      </TimelineDot>
      <TimelineContent><TimelineTitle>deploy</TimelineTitle></TimelineContent>
    </TimelineItem>
  </Timeline>
</div>`;

  const timelineAxisFiles: TreeFile[] = [
    { name: 'timeline-axis-demo.svelte', content: timelineAxisDemo, kind: 'usage' },
  ];

  // the 9-grid node slots (node section), swept through a canvas
  const timelineNodeDemo = `<script lang="ts">
  ${timelineImport}
${close}

  <div class="w-full max-w-md border border-border p-6">
  <Timeline>
    <TimelineItem>
      <TimelineDot>
        {#snippet blockStartInlineStart()}<span class="text-[10px]">bsIs</span>{/snippet}
        {#snippet blockStart()}<span>bs</span>{/snippet}
        {#snippet blockStartInlineEnd()}<span class="text-[10px]">bsIe</span>{/snippet}
        {#snippet inlineStart()}<span>is</span>{/snippet}
        {#snippet inlineEnd()}<span>ie</span>{/snippet}
        {#snippet blockEndInlineStart()}<span class="text-[10px]">beIs</span>{/snippet}
        {#snippet blockEnd()}<span>be</span>{/snippet}
        {#snippet blockEndInlineEnd()}<span class="text-[10px]">beIe</span>{/snippet}
      </TimelineDot>
      <TimelineContent>
        <TimelineTitle>free spatial composition</TimelineTitle>
        <p class="text-[12.5px] text-muted-foreground">all eight slots authored at once — the dot stays the anchor</p>
      </TimelineContent>
    </TimelineItem>
    <TimelineItem>
      <TimelineDot />
      <TimelineContent><TimelineTitle>a bare node</TimelineTitle></TimelineContent>
    </TimelineItem>
  </Timeline>
</div>`;

  const timelineNodeFiles: TreeFile[] = [
    { name: 'timeline-node-demo.svelte', content: timelineNodeDemo, kind: 'usage' },
  ];

  // the spine presets + the custom snippet seam (spine section)
  const timelineSpineDemo = `<script lang="ts">
  import Timeline, {
    TimelineItem,
    TimelineDot,
    TimelineContent,
    TimelineTitle,
  } from '@ui/timeline/index';
${close}

  <div class="grid gap-6 min-[1100px]:grid-cols-2">
  <div class="flex flex-col gap-2">
    <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">plain (default) · one continuous run path</span>
    <Timeline spine="plain">
      <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>plain</TimelineTitle></TimelineContent></TimelineItem>
      <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>plain</TimelineTitle></TimelineContent></TimelineItem>
    </Timeline>
  </div>
  <div class="flex flex-col gap-2">
    <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">dashed · dash STARTS at the node edge</span>
    <Timeline spine="dashed">
      <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>alpha</TimelineTitle></TimelineContent></TimelineItem>
      <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>beta</TimelineTitle></TimelineContent></TimelineItem>
      <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>gamma</TimelineTitle></TimelineContent></TimelineItem>
    </Timeline>
  </div>
  <div class="flex flex-col gap-2">
    <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">beam · a traveling light with real width</span>
    <Timeline spine="beam">
      <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>live channel</TimelineTitle></TimelineContent></TimelineItem>
      <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>live channel</TimelineTitle></TimelineContent></TimelineItem>
    </Timeline>
  </div>
  <div class="flex flex-col gap-2">
    <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">custom snippet · the geometry payload</span>
    <Timeline>
      {#snippet spine(geometry)}
        <path
          d={geometry.runPath}
          fill="none"
          stroke="var(--primary)"
          stroke-width="1.5"
          stroke-dasharray="2 6"
          stroke-linecap="round"
        />
        {#each geometry.nodes as node}
          <circle cx={node.x} cy={node.y} r={geometry.nodeRadius + 3} fill="none" stroke="var(--primary)" stroke-width="1" opacity="0.4" />
        {/each}
      {/snippet}
      <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>authored spine</TimelineTitle></TimelineContent></TimelineItem>
      <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>authored spine</TimelineTitle></TimelineContent></TimelineItem>
    </Timeline>
  </div>
</div>`;

  const timelineSpineFiles: TreeFile[] = [
    { name: 'timeline-spine-demo.svelte', content: timelineSpineDemo, kind: 'usage' },
  ];

  // the animation pair (animation section), swept through a canvas
  const timelineAnimationDemo = `<script lang="ts">
  ${timelineImport}
${close}

  <div class="flex w-full flex-col gap-6">
  <div class="flex flex-col gap-2">
    <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">animation="scroll" · scroll this box</span>
    <div class="max-h-64 overflow-y-auto border border-border p-6">
      <Timeline animation="scroll">
        {#each ['commit', 'build', 'test', 'package', 'deploy', 'verify', 'announce'] as phase (phase)}
          <TimelineItem>
            <TimelineDot>
              {#snippet blockStart()}<span>{phase}</span>{/snippet}
            </TimelineDot>
            <TimelineContent><TimelineTitle>{phase}</TimelineTitle></TimelineContent>
          </TimelineItem>
        {/each}
      </Timeline>
    </div>
  </div>
  <div class="flex flex-col gap-2">
    <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">animation="view"</span>
    <div class="max-h-64 overflow-y-auto border border-border p-6">
      <Timeline animation="view">
        {#each ['alpha', 'beta', 'rc', 'ga'] as phase}
          <TimelineItem>
            <TimelineDot variant="round" />
            <TimelineContent><TimelineTitle>{phase}</TimelineTitle></TimelineContent>
          </TimelineItem>
        {/each}
      </Timeline>
    </div>
  </div>
</div>`;

  const timelineAnimationFiles: TreeFile[] = [
    { name: 'timeline-animation-demo.svelte', content: timelineAnimationDemo, kind: 'usage' },
  ];

  // the anatomy sample (types section), swept through a canvas
  const timelineAnatomyDemo = `<script lang="ts">
  import Timeline, {
    TimelineItem,
    TimelineDot,
    TimelineContent,
    TimelineTime,
    TimelineTitle,
  } from '@ui/timeline/index';
${close}

  <div class="max-w-md">
  <Timeline>
    <TimelineItem>
      <TimelineDot>{#snippet blockStart()}<span>today</span>{/snippet}</TimelineDot>
      <TimelineContent>
        <TimelineTime datetime="2026-09-01">today</TimelineTime>
        <TimelineTitle>released</TimelineTitle>
        <p>Build promoted.</p>
      </TimelineContent>
    </TimelineItem>
  </Timeline>
</div>`;

  const timelineAnatomyFiles: TreeFile[] = [
    { name: 'timeline-anatomy-demo.svelte', content: timelineAnatomyDemo, kind: 'usage' },
  ];

  // the geometry matrix (matrix section): one config drives BOTH the
  // live gallery and the drawer's sample — the probe battery reads
  // these very hooks (data-variant / dir)
  const matrixPhases = ['alpha', 'beta', 'gamma'];
  const matrixVariants: Array<{ id: string; axis: 'vertical' | 'horizontal'; direction: 'ltr' | 'revert' | 'interlaced'; rtl: boolean }> = [
    { id: 'v-ltr', axis: 'vertical', direction: 'ltr', rtl: false },
    { id: 'v-revert', axis: 'vertical', direction: 'revert', rtl: false },
    { id: 'v-interlaced', axis: 'vertical', direction: 'interlaced', rtl: false },
    { id: 'h-ltr', axis: 'horizontal', direction: 'ltr', rtl: false },
    { id: 'h-revert', axis: 'horizontal', direction: 'revert', rtl: false },
    { id: 'h-interlaced', axis: 'horizontal', direction: 'interlaced', rtl: false },
    { id: 'v-ltr-rtl', axis: 'vertical', direction: 'ltr', rtl: true },
    { id: 'v-interlaced-rtl', axis: 'vertical', direction: 'interlaced', rtl: true },
    { id: 'h-ltr-rtl', axis: 'horizontal', direction: 'ltr', rtl: true },
    { id: 'h-revert-rtl', axis: 'horizontal', direction: 'revert', rtl: true },
    { id: 'h-interlaced-rtl', axis: 'horizontal', direction: 'interlaced', rtl: true },
    { id: 'v-revert-rtl', axis: 'vertical', direction: 'revert', rtl: true },
  ];

  // ToC outline: pairs with +page.ts, in page order.
</script>

<svelte:head>
  <title>Timeline · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai timeline, drawn-spine edition: a one-cell grid host stacking the semantic ol over a measured whole-list SVG spine — continuous connectors, real dash patterns anchored to the node edge, a beam with actual width, scroll-progress as a stroke draw, and a no-JS CSS floor that upgrades on hydration. axis/direction/interlacing/RTL resolve in one coordinate space."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Data display"
        title="timeline — the drawn activity spine"
        summary={entry.summary}
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">ol · order is chronology</span>
          <span class="pill">one-cell grid host · measured svg spine</span>
          <span class="pill">9-grid node · 8 logical slots</span>
          <span class="pill">plain · dashed · beam · custom payload</span>
          <span class="pill">no-JS floor · upgrades on hydration</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <ComponentCanvas
        title="timeline"
        stage="fill"
        description="The spine is DRAWN: one whole-list SVG layer, measured from the live item geometry, painted under the dots and content by source order in a one-cell grid host. Before hydration (and without JS forever) every item carries the plain CSS floor line — hydration's measurement swaps it for the measured spine."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/timeline/timeline.svelte"
        files={canvasFiles}
        onreset={resetCanvas}
        output={[{ label: 'last entry pending', value: pending }]}
        resolveFileContent={resolveUsage}
      >
        <div class="w-full max-w-md">
          <Timeline>
            <TimelineItem>
              <TimelineDot>
                {#snippet blockStart()}<span>07:02</span>{/snippet}
              </TimelineDot>
              <TimelineContent>
                <TimelineTime datetime="2026-08-22T07:02:41Z">07:02</TimelineTime>
                <TimelineTitle>pushed</TimelineTitle>
                <p class="text-[12.5px] text-muted-foreground">feat: popover family on CSS anchors · 4f2a1c</p>
              </TimelineContent>
            </TimelineItem>
            <TimelineItem>
              <TimelineDot>
                {#snippet blockStart()}<span>07:03</span>{/snippet}
              </TimelineDot>
              <TimelineContent>
                <TimelineTime datetime="2026-08-22T07:03:19Z">07:03</TimelineTime>
                <TimelineTitle>checks passed</TimelineTitle>
                <p class="text-[12.5px] text-muted-foreground">12 checks · 0 failed · 8.2s</p>
              </TimelineContent>
            </TimelineItem>
            <TimelineItem {pending}>
              <TimelineDot variant="ring">
                {#snippet blockStart()}<span>07:04</span>{/snippet}
              </TimelineDot>
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
              attribute, never part logic. The <code class="text-accent">blockStart</code> slot on
              each dot is the timestamp cutout riding the spine.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="directions" data-reveal="">
      <SectionCard
        family="directions"
        headerRegion="directions"
        eyebrow="layout"
        title="direction — ltr · revert · interlaced"
        summary="Direction picks which zone(s) the content takes: ltr collapses the start zone (the classic reading rail), revert mirrors it, interlaced keeps both zones and alternates item by item — the center-stage chronology. Zones are grid tracks (minmax(0,0fr) collapses a lane), never margins."
      >
        <ComponentCanvas title="timeline · directions" stage="fill" files={timelineDirectionsFiles}>
          <div class="grid gap-6 min-[1100px]:grid-cols-3">
            <div class="flex flex-col gap-2">
              <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">ltr (default)</span>
              <Timeline direction="ltr">
                <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>build</TimelineTitle></TimelineContent></TimelineItem>
                <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>test</TimelineTitle></TimelineContent></TimelineItem>
              </Timeline>
            </div>
            <div class="flex flex-col gap-2">
              <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">revert</span>
              <Timeline direction="revert">
                <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>build</TimelineTitle></TimelineContent></TimelineItem>
                <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>test</TimelineTitle></TimelineContent></TimelineItem>
              </Timeline>
            </div>
            <div class="flex flex-col gap-2">
              <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">interlaced</span>
              <Timeline direction="interlaced">
                <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>build</TimelineTitle></TimelineContent></TimelineItem>
                <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>test</TimelineTitle></TimelineContent></TimelineItem>
                <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>deploy</TimelineTitle></TimelineContent></TimelineItem>
              </Timeline>
            </div>
          </div>
        </ComponentCanvas>
      </SectionCard>
    </div>

    <div id="axis" data-reveal="">
      <SectionCard
        family="axis"
        headerRegion="axis"
        eyebrow="layout"
        title="axis — the horizontal transpose"
        summary="axis='horizontal' transposes the whole engine: the spine runs inline, items flow as columns, the zones stack above/below, and every logical slot name keeps its meaning (block-start stays before the flow). The root scrolls inline when it outgrows its lane."
      >
        <ComponentCanvas title="timeline · horizontal" stage="fill" files={timelineAxisFiles}>
          <div class="w-full overflow-x-auto border border-border p-6">
            <Timeline axis="horizontal" direction="interlaced" class="min-w-[40rem]">
              <TimelineItem>
                <TimelineDot>
                  {#snippet blockStart()}<span>09:41</span>{/snippet}
                </TimelineDot>
                <TimelineContent><TimelineTitle>commit</TimelineTitle></TimelineContent>
              </TimelineItem>
              <TimelineItem>
                <TimelineDot variant="round">
                  {#snippet blockStart()}<span>09:43</span>{/snippet}
                </TimelineDot>
                <TimelineContent><TimelineTitle>build</TimelineTitle></TimelineContent>
              </TimelineItem>
              <TimelineItem pending>
                <TimelineDot variant="round">
                  {#snippet blockStart()}<span>09:45</span>{/snippet}
                </TimelineDot>
                <TimelineContent><TimelineTitle>deploy</TimelineTitle></TimelineContent>
              </TimelineItem>
            </Timeline>
          </div>
        </ComponentCanvas>
      </SectionCard>
    </div>

    <div id="node" data-reveal="">
      <SectionCard
        family="node"
        headerRegion="node"
        eyebrow="composition"
        title="the 9-grid node — eight logical slots around the dot"
        summary="Every dot is the center of a 3×3 grid. blockStart/blockEnd ride the SPINE channel as labeled cutouts (their opaque ground interrupts the drawn spine, by essence); inlineStart/inlineEnd flank the dot; the four corners complete the compass. Logical names never change meaning when the axis flips."
      >
        <ComponentCanvas title="timeline · node slots" stage="fill" files={timelineNodeFiles}>
          <div class="w-full max-w-md border border-border p-6">
            <Timeline>
              <TimelineItem>
                <TimelineDot>
                  {#snippet blockStartInlineStart()}<span class="text-[10px]">bsIs</span>{/snippet}
                  {#snippet blockStart()}<span>bs</span>{/snippet}
                  {#snippet blockStartInlineEnd()}<span class="text-[10px]">bsIe</span>{/snippet}
                  {#snippet inlineStart()}<span>is</span>{/snippet}
                  {#snippet inlineEnd()}<span>ie</span>{/snippet}
                  {#snippet blockEndInlineStart()}<span class="text-[10px]">beIs</span>{/snippet}
                  {#snippet blockEnd()}<span>be</span>{/snippet}
                  {#snippet blockEndInlineEnd()}<span class="text-[10px]">beIe</span>{/snippet}
                </TimelineDot>
                <TimelineContent>
                  <TimelineTitle>free spatial composition</TimelineTitle>
                  <p class="text-[12.5px] text-muted-foreground">all eight slots authored at once — the dot stays the anchor</p>
                </TimelineContent>
              </TimelineItem>
              <TimelineItem>
                <TimelineDot />
                <TimelineContent><TimelineTitle>a bare node</TimelineTitle></TimelineContent>
              </TimelineItem>
            </Timeline>
          </div>
        </ComponentCanvas>
      </SectionCard>
    </div>

    <div id="spine" data-reveal="">
      <SectionCard
        family="spine"
        headerRegion="spine"
        eyebrow="seam"
        title="the spine — drawn, not backgrounded"
        summary="One whole-list SVG layer paints the spine: connectors run item-center to item-center as ONE continuous path per run (no per-item seams, no dead windows at node edges); dashed is a real stroke-dasharray whose phase anchors a dash START at the node's flow-end edge — at every density, because the anchor is measured; beam is a stroked gradient segment with actual width and soft edges, traveling the chronology (frozen to a lit segment under reduced motion). The spine prop takes a preset name or a custom snippet receiving the measured geometry payload."
      >
        <ComponentCanvas title="timeline · spine presets + custom" stage="fill" files={timelineSpineFiles}>
          <div class="grid gap-6 min-[1100px]:grid-cols-2">
            <div class="flex flex-col gap-2">
              <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">plain (default) · one continuous run path</span>
              <Timeline spine="plain">
                <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>plain</TimelineTitle></TimelineContent></TimelineItem>
                <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>plain</TimelineTitle></TimelineContent></TimelineItem>
              </Timeline>
            </div>
            <div class="flex flex-col gap-2">
              <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">dashed · dash STARTS at the node edge</span>
              <Timeline spine="dashed">
                <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>alpha</TimelineTitle></TimelineContent></TimelineItem>
                <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>beta</TimelineTitle></TimelineContent></TimelineItem>
                <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>gamma</TimelineTitle></TimelineContent></TimelineItem>
              </Timeline>
            </div>
            <div class="flex flex-col gap-2">
              <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">beam · a traveling light with real width</span>
              <Timeline spine="beam">
                <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>live channel</TimelineTitle></TimelineContent></TimelineItem>
                <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>live channel</TimelineTitle></TimelineContent></TimelineItem>
              </Timeline>
            </div>
            <div class="flex flex-col gap-2">
              <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">custom snippet · the geometry payload</span>
              <Timeline>
                {#snippet spine(geometry: TimelineSpineGeometry)}
                  <path
                    d={geometry.runPath}
                    fill="none"
                    stroke="var(--primary)"
                    stroke-width="1.5"
                    stroke-dasharray="2 6"
                    stroke-linecap="round"
                  />
                  {#each geometry.nodes as node}
                    <circle cx={node.x} cy={node.y} r={geometry.nodeRadius + 3} fill="none" stroke="var(--primary)" stroke-width="1" opacity="0.4" />
                  {/each}
                {/snippet}
                <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>authored spine</TimelineTitle></TimelineContent></TimelineItem>
                <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>authored spine</TimelineTitle></TimelineContent></TimelineItem>
              </Timeline>
            </div>
          </div>
        </ComponentCanvas>
      </SectionCard>
    </div>

    <div id="matrix" data-reveal="">
      <SectionCard
        family="matrix"
        headerRegion="matrix"
        eyebrow="geometry"
        title="the geometry matrix — axis × direction × RTL in one coordinate space"
        summary="The measurement runtime emits node centers in list-root coordinates in FLOW order, with axis/direction/interlaced/rtl metadata; RTL resolves in the coordinate transform (physical geometry, logical chronology) — a horizontal RTL list draws its run right-to-left because the path starts at the chronologically-first node, with zero mirror branches. Every cell of the matrix carries a data-variant hook for the probe battery."
      >
        <div class="grid gap-6 min-[900px]:grid-cols-2 min-[1300px]:grid-cols-3">
          {#each matrixVariants as variant (variant.id)}
            <div dir={variant.rtl ? 'rtl' : undefined} class="flex flex-col gap-2" data-variant={variant.id}>
              <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">
                {variant.id}{variant.rtl ? ' · dir=rtl' : ''}
              </span>
              {#if variant.axis === 'horizontal'}
                <div class="w-full overflow-x-auto border border-border p-3">
                  <Timeline axis="horizontal" direction={variant.direction} class="min-w-[26rem]">
                    {#each matrixPhases as phase (phase)}
                      <TimelineItem>
                        <TimelineDot variant="round" />
                        <TimelineContent><TimelineTitle>{phase}</TimelineTitle></TimelineContent>
                      </TimelineItem>
                    {/each}
                  </Timeline>
                </div>
              {:else}
                <div class="border border-border p-3">
                  <Timeline direction={variant.direction}>
                    {#each matrixPhases as phase (phase)}
                      <TimelineItem>
                        <TimelineDot variant="round" />
                        <TimelineContent><TimelineTitle>{phase}</TimelineTitle></TimelineContent>
                      </TimelineItem>
                    {/each}
                  </Timeline>
                </div>
              {/if}
            </div>
          {/each}
        </div>
      </SectionCard>
    </div>

    <div id="animation" data-reveal="">
      <SectionCard
        family="animation"
        headerRegion="animation"
        eyebrow="motion"
        title="animation — view-driven entries, scroll-drawn progress"
        summary="animation='view' gives every item a rise entrance as it enters the scrollport; animation='scroll' draws the progress stroke along the measured run path with the nearest scroller — a stroke-dashoffset draw-on that starts at the chronologically-first node (RTL needs no branch). Both are scroll-driven CSS (@supports-gated): engines without the timeline APIs render the final state, and reduced motion removes the decorative motion — entries rest in place, the beam rests as a lit segment, the progress stroke stays hidden."
      >
        <ComponentCanvas title="timeline · animation" stage="fill" files={timelineAnimationFiles}>
          <div class="flex w-full flex-col gap-6">
            <div class="flex flex-col gap-2">
              <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">animation="scroll" · scroll this box</span>
              <div class="max-h-64 overflow-y-auto border border-border p-6">
                <Timeline animation="scroll">
                  {#each ['commit', 'build', 'test', 'package', 'deploy', 'verify', 'announce'] as phase (phase)}
                    <TimelineItem>
                      <TimelineDot>
                        {#snippet blockStart()}<span>{phase}</span>{/snippet}
                      </TimelineDot>
                      <TimelineContent><TimelineTitle>{phase}</TimelineTitle></TimelineContent>
                    </TimelineItem>
                  {/each}
                </Timeline>
              </div>
            </div>
            <div class="flex flex-col gap-2">
              <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">animation="view"</span>
              <div class="max-h-64 overflow-y-auto border border-border p-6">
                <Timeline animation="view">
                  {#each ['alpha', 'beta', 'rc', 'ga'] as phase}
                    <TimelineItem>
                      <TimelineDot variant="round" />
                      <TimelineContent><TimelineTitle>{phase}</TimelineTitle></TimelineContent>
                    </TimelineItem>
                  {/each}
                </Timeline>
              </div>
            </div>
          </div>
        </ComponentCanvas>
      </SectionCard>
    </div>

    <div id="types" data-reveal=""><SectionCard eyebrow="types" title="Timeline anatomy" summary="Timeline is composition-first: item, dot (the 9-grid node), content, time, title and free-form body remain independent parts; the spine is a measured layer, never authored markup."><ComponentCanvas title="timeline · anatomy" stage="start" files={timelineAnatomyFiles}><div class="max-w-md"><Timeline><TimelineItem><TimelineDot>{#snippet blockStart()}<span>today</span>{/snippet}</TimelineDot><TimelineContent><TimelineTime datetime="2026-09-01">today</TimelineTime><TimelineTitle>released</TimelineTitle><p>Build promoted.</p></TimelineContent></TimelineItem></Timeline></div></ComponentCanvas></SectionCard></div>
    <div id="usage" data-reveal=""><SectionCard summary="The composition contract in one sample: import the family from the registry barrel (@ui/timeline/index — per-part targets exist per file), author one TimelineItem per entry with the parts you need. There is no items[] prop and no body snippet — the body is plain children." eyebrow="usage" title="Usage"><CodeBlock code={usage} lang="svelte" meta="usage" /></SectionCard></div>
    <div id="accessibility" data-reveal=""><SectionCard eyebrow="a11y" title="Accessibility"><A11yTable aria={[{ name: 'ol', value: 'timeline list', description: 'Preserves chronological list semantics (role=list survives list-none).' }, { name: 'time', value: 'datetime', description: 'Provides machine-readable event time.' }, { name: 'aria-hidden', value: 'spine svg · dot · floor line', description: 'The drawn spine, the dots and the floor lines are decoration — the svg layer is pointer-transparent too. The cutout SLOTS are readable content — they carry text and are never hidden.' }] } /></SectionCard></div>
    <div id="theming" data-reveal=""><SectionCard eyebrow="theming" title="Density and tokens"><DensityDemo scopes={['xs', 'default', 'lg']}><Timeline><TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>event</TimelineTitle></TimelineContent></TimelineItem></Timeline></DensityDemo><div class="mt-5"><TokenTable tokens={[{ name: '--jx-icon', default: 'density scale', source: 'density' }, { name: '--jx-stack', default: 'density scale', source: 'density' }, { name: '--jx-gap', default: 'density scale', source: 'density' }, { name: '--jx-inset', default: 'density scale', source: 'density' }, { name: '--jx-text', default: 'density scale', source: 'density' }, { name: '--jx-text-secondary', default: 'density scale', source: 'density' }, { name: '--jx-line', default: 'density scale', source: 'density' }, { name: '--jx-line-secondary', default: 'density scale', source: 'density' }]} /></div></SectionCard></div>
    <div id="api" data-reveal=""><SectionCard eyebrow="api" title="Timeline props"><PropsTable props={[{ name: 'axis', type: "'vertical' | 'horizontal'", default: "'vertical'", description: 'The flow axis; the engine transposes, slot names stay logical.' }, { name: 'direction', type: "'ltr' | 'revert' | 'interlaced'", default: "'ltr'", description: 'Which zone(s) content takes; interlaced alternates item by item.' }, { name: 'animation', type: "'none' | 'view' | 'scroll'", default: "'none'", description: 'view = per-item entrance as it enters the scrollport; scroll = the progress stroke draws on with the nearest scroller. Both @supports-gated.' }, { name: 'spine', type: "'plain' | 'dashed' | 'beam' | Snippet<[TimelineSpineGeometry]>", default: "'plain'", description: 'The drawn spine: a preset by name, or a custom snippet receiving the measured geometry payload (node centers in list-root coordinates in flow order · axis/direction/interlaced/rtl metadata · per-segment path data with the dot-edge phase anchor · the density scale). The snippet renders inside the spine svg — author path/circle/… directly. BREAKING successor of the retired line(i) seam.' }, { name: 'density', type: 'Density', default: 'ambient scope', description: 'Explicit override of the ambient density scope; no opinion stamps nothing and the ambient css scope channel flows.' }, { name: 'variant', type: "'square' | 'round' | 'ring'", default: "'square' · Own default, not ambient", description: 'TimelineDot corner grammar. Defaults: literal slot — own ’square’, not ambient (the dot is outside the paint zone’s frozen availability table).' }, { name: 'class', type: 'string', description: 'Adds consumer classes (lands on the grid host — the component root).' }] } /></SectionCard></div>
  </div>
</div>
