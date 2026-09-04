<!--
  Docs page for the timeline family (grid-engine rebuild, 2026-09-01).
  Intents:
  1. Hero summary comes from the registry catalog (CATALOG lookup,
     fail-loud on miss — never hand-write registry copy).
  2. One ComponentCanvas: the authored-free line + spatial dot slots.
  3. Section galleries: directions (ltr/revert/interlaced), the
     horizontal axis, the 9-grid node, line presets, animations.
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
    TimelineLineDashed,
    TimelineLineBeam,
    TimelineContent,
    TimelineTime,
    TimelineTitle,
  } from '$lib/ui/timeline/index';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import timelineSource from '$lib/ui/timeline/timeline.svelte?raw';
  import timelineItemSource from '$lib/ui/timeline/timeline-item.svelte?raw';
  import timelineDotSource from '$lib/ui/timeline/timeline-dot.svelte?raw';
  import timelineLineDashedSource from '$lib/ui/timeline/timeline-line-dashed.svelte?raw';
  import timelineLineBeamSource from '$lib/ui/timeline/timeline-line-beam.svelte?raw';
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

<!-- the line is AUTHORED-FREE; replace it per-index through the root:
<Timeline {line}>
  {#snippet line(i)}
    {#if i === 0}<TimelineLineBeam />{:else}<TimelineLineDashed />{/if}
  {/snippet}
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
    { name: 'registry/files/ui/timeline/timeline-item.svelte', content: timelineItemSource },
    { name: 'registry/files/ui/timeline/timeline-dot.svelte', content: timelineDotSource },
    { name: 'registry/files/ui/timeline/timeline-line-dashed.svelte', content: timelineLineDashedSource },
    { name: 'registry/files/ui/timeline/timeline-line-beam.svelte', content: timelineLineBeamSource },
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
    content="The jixoai timeline, rebuilt as a grid engine: a 5-lane subgrid spine, direction forms (ltr · revert · interlaced), a horizontal axis, a 9-grid node with 8 logical-direction slots, the authored-free line replaceable by snippet presets (dashed · beam), and view- or scroll-driven animation. Zero lifecycle, SSR-honest."
  />
</svelte:head>

<div class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8">
  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Data display"
        title="timeline — the grid-engine activity spine"
        summary={entry.summary}
      >
        <div class="flex flex-wrap gap-3">
          <span class="pill">ol · order is chronology</span>
          <span class="pill">subgrid spine · authored-free line</span>
          <span class="pill">9-grid node · 8 logical slots</span>
          <span class="pill">ltr · revert · interlaced · horizontal</span>
          <span class="pill">view/scroll-driven animation</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <ComponentCanvas
        title="timeline"
        stage="fill"
        description="The line is AUTHORED-FREE — every item paints it from the grid (its essence: the dot's two block neighbors plus the center, bridged into the next node). The dot is the 9-grid node: blockStart rides the spine as a labeled cutout."
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
        <div class="overflow-x-auto border border-border p-6">
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
      </SectionCard>
    </div>

    <div id="node" data-reveal="">
      <SectionCard
        family="node"
        headerRegion="node"
        eyebrow="composition"
        title="the 9-grid node — eight logical slots around the dot"
        summary="Every dot is the center of a 3×3 grid. blockStart/blockEnd ride the SPINE channel as labeled cutouts (the line's own two cells — content there interrupts it, by essence); inlineStart/inlineEnd flank the dot; the four corners complete the compass. Logical names never change meaning when the axis flips."
      >
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
      </SectionCard>
    </div>

    <div id="line" data-reveal="">
      <SectionCard
        family="line"
        headerRegion="line"
        eyebrow="seam"
        title="the line — authored-free, replaceable per index"
        summary="The line's grid essence: it occupies the dot's two block neighbors plus the center, bridged into the next node — which is why you never author it. Replace it through the root's line snippet, keyed by the item's index (a line(i) snippet block); presets ride the same cells: TimelineLineDashed (a 4/4 dash chain) and TimelineLineBeam (a traveling primary pulse for live channels)."
      >
        <div class="grid gap-6 min-[1100px]:grid-cols-3">
          <div class="flex flex-col gap-2">
            <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">default (authored-free)</span>
            <Timeline>
              <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>plain</TimelineTitle></TimelineContent></TimelineItem>
              <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>plain</TimelineTitle></TimelineContent></TimelineItem>
            </Timeline>
          </div>
          <div class="flex flex-col gap-2">
            <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">TimelineLineDashed</span>
            <Timeline>
              {#snippet line()}<TimelineLineDashed />{/snippet}
              <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>dashed</TimelineTitle></TimelineContent></TimelineItem>
              <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>dashed</TimelineTitle></TimelineContent></TimelineItem>
            </Timeline>
          </div>
          <div class="flex flex-col gap-2">
            <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">TimelineLineBeam</span>
            <Timeline>
              {#snippet line()}<TimelineLineBeam />{/snippet}
              <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>live channel</TimelineTitle></TimelineContent></TimelineItem>
              <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>live channel</TimelineTitle></TimelineContent></TimelineItem>
            </Timeline>
          </div>
        </div>
      </SectionCard>
    </div>

    <div id="animation" data-reveal="">
      <SectionCard
        family="animation"
        headerRegion="animation"
        eyebrow="motion"
        title="animation — view-driven entries, scroll-driven spine"
        summary="animation='view' gives every item a rise entrance as it enters the scrollport; animation='scroll' paints a progress spine over the channel that grows with the nearest scroller. Both are scroll-driven CSS (@supports-gated): engines without the timeline APIs render the final state, and reduced motion removes the decorative motion — entries rest in place, the beam rests at the line head, the progress spine stays hidden."
      >
        <div class="flex flex-col gap-6">
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
      </SectionCard>
    </div>

    <div id="types" data-reveal=""><SectionCard eyebrow="types" title="Timeline anatomy" summary="Timeline is composition-first: item, dot (the 9-grid node), content, time, title and free-form body remain independent parts; the line is authored-free."><div class="max-w-md"><Timeline><TimelineItem><TimelineDot>{#snippet blockStart()}<span>today</span>{/snippet}</TimelineDot><TimelineContent><TimelineTime datetime="2026-09-01">today</TimelineTime><TimelineTitle>released</TimelineTitle><p>Build promoted.</p></TimelineContent></TimelineItem></Timeline></div></SectionCard></div>
    <div id="usage" data-reveal=""><SectionCard summary="The composition contract in one sample: import the family from the registry barrel (@ui/timeline/index — per-part targets exist per file), author one TimelineItem per entry with the parts you need. There is no items[] prop and no body snippet — the body is plain children." eyebrow="usage" title="Usage"><CodeBlock code={usage} lang="svelte" meta="usage" /></SectionCard></div>
    <div id="accessibility" data-reveal=""><SectionCard eyebrow="a11y" title="Accessibility"><A11yTable aria={[{ name: 'ol', value: 'timeline root', description: 'Preserves chronological list semantics.' }, { name: 'time', value: 'datetime', description: 'Provides machine-readable event time.' }, { name: 'aria-hidden', value: 'line · dot', description: 'The pure chrome (the auto-rendered line, the dot) is decoration. The cutout SLOTS are readable content — they carry text and are never hidden.' }]} /></SectionCard></div>
    <div id="theming" data-reveal=""><SectionCard eyebrow="theming" title="Density and tokens"><DensityDemo scopes={['xs', 'default', 'lg']}><Timeline><TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>event</TimelineTitle></TimelineContent></TimelineItem></Timeline></DensityDemo><div class="mt-5"><TokenTable tokens={[{ name: '--jx-icon', default: 'density scale', source: 'density' }, { name: '--jx-stack', default: 'density scale', source: 'density' }, { name: '--jx-gap', default: 'density scale', source: 'density' }, { name: '--jx-inset', default: 'density scale', source: 'density' }, { name: '--jx-text', default: 'density scale', source: 'density' }, { name: '--jx-text-secondary', default: 'density scale', source: 'density' }, { name: '--jx-line', default: 'density scale', source: 'density' }, { name: '--jx-line-secondary', default: 'density scale', source: 'density' }]} /></div></SectionCard></div>
    <div id="api" data-reveal=""><SectionCard eyebrow="api" title="Timeline props"><PropsTable props={[{ name: 'axis', type: "'vertical' | 'horizontal'", default: "'vertical'", description: 'The flow axis; the engine transposes, slot names stay logical.' }, { name: 'direction', type: "'ltr' | 'revert' | 'interlaced'", default: "'ltr'", description: 'Which zone(s) content takes; interlaced alternates item by item.' }, { name: 'animation', type: "'none' | 'view' | 'scroll'", default: "'none'", description: 'view = per-item entrance as it enters the scrollport; scroll = the spine progress grows with the nearest scroller. Both @supports-gated.' }, { name: 'line', type: 'Snippet<[number]>', default: '—', description: 'Replaces the authored-free line at every node, keyed by the item index; presets: TimelineLineDashed, TimelineLineBeam. The index is INSTANTIATION order — author items in stable order while a line snippet is supplied (keyed reorders keep first-mount indices; the default line is unaffected).' }, { name: 'density', type: 'Density', default: 'ambient scope', description: 'Explicit override of the ambient density scope; no opinion stamps nothing and the ambient css scope channel flows.' }, { name: 'variant', type: "'square' | 'round' | 'ring'", default: "'square'", description: 'TimelineDot corner grammar. Defaults: literal slot — own ’square’, not ambient (the dot is outside the paint zone’s frozen availability table).' }, { name: 'class', type: 'string', description: 'Adds consumer classes.' }]} /></SectionCard></div>
  </div>
</div>
