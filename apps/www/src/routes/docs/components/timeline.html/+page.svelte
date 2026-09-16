<!--
  Docs page for the timeline family (W3 drawn-spine rework +
  W4 reui-family upgrade, Owner 2026-09-15; grid-engine rebuild
  2026-09-01; tailwindless-site P0 pilot 2026-09-17 — every utility
  composition replaced by the surface atom module + the REGISTERED
  lane-2 semantic sheet below, DOM/text/data-attrs untouched).
  Intents:
  1. Hero summary comes from the registry catalog (CATALOG lookup,
     fail-loud on miss — never hand-write registry copy).
  2. One opening ComponentCanvas: the floor line + spatial dot slots
     + the value contract driven from the playground.
  3. THE TWELVE OFFICIAL REUI FAMILIES — one canvas stage each, the
     stage aria-labels pinned to research/reui-family-inventory.md's
     frozen mapping table through ComponentCanvas's stageLabel
     override (a shape the title-derived default cannot compose).
  4. Our four highlights: the 8-directional slots matrix · the spine
     presets · the custom geometry snippet · the decimal-progress
     tween + controlled stepper.
  5. Standing keepers: directions, the geometry matrix, animations.
  6. Usage CodeBlock + the props table carrying the value contract.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import Avatar from '$lib/ui/avatar';
  import Badge from '$lib/ui/badge';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import Icon from '$lib/ui/icon';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import Spin from '$lib/ui/spin';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import type { IconName } from '$lib/icon-set.gen';
  import { CATALOG } from '$lib/catalog';
  import { PlayFields, PlayRow, PlayToggle, PlayNumber, PlayHelp } from '$lib/playground';
  // tailwindless-site P0 (2026-09-17): the page's paint rides the site
  // atom lane — single-concern atoms from the surface module + the
  // REGISTERED lane-2 semantic composites in this file's <style> sheet
  // (registry: the tailwindless gate's semantics[]). No Tailwind
  // utility composes this markup anymore.
  import { cx, tlDocs } from '$lib/surface/timeline-docs.stylex';
  import Timeline, {
    TimelineItem,
    TimelineDot,
    TimelineHeader,
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
  import timelineHeaderSource from '$lib/ui/timeline/timeline-header.svelte?raw';
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
  const usage = `<Timeline defaultValue={2}>
  <TimelineHeader>release train · week 37</TimelineHeader>
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

<!-- THE VALUE CONTRACT (reui parity): defaultValue seeds the current
     step (default 1), value controls it, onValueChange reports every
     setStep change. DECIMALS ARE FIRST-CLASS — 1.5 completes item 1,
     not item 2, and paints the progress stroke halfway to node 2
     (300ms dashoffset transition; reduced motion drops the transition,
     the position stays). Items take step to declare ladder positions
     (default DOM order + 1, strictly ascending). Under
     animation='scroll' the scroller owns the stroke channel; the
     value keeps driving the discrete data-completed paint.
<Timeline value={stepper} onValueChange={(v) => (stepper = v)}>
  <TimelineItem step={1}>…</TimelineItem>
  <TimelineItem step={4}>…</TimelineItem><!-- a declared gap interpolates -->
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

  // Playground protocol: the page owns the snapshot + reset; the toggle
  // flips the last entry's pending flag, the number drives the value
  // contract; the drawer's usage file tracks both live.
  const canvasInitial = { pending: true, value: 2.5 };
  let pending = $state(canvasInitial.pending);
  let canvasValue = $state(canvasInitial.value);
  function resetCanvas(): void {
    pending = canvasInitial.pending;
    canvasValue = canvasInitial.value;
  }
  const usageLive = $derived(
    usage
      .replace('<TimelineItem pending>', `<TimelineItem pending={${pending}}>`)
      .replace('<Timeline defaultValue={2}>', `<Timeline value={${canvasValue}}>`),
  );
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/timeline/timeline.svelte', content: timelineSource },
    { name: 'registry/files/ui/timeline/timeline-spine.svelte.ts', content: timelineSpineSource },
    { name: 'registry/files/ui/timeline/timeline-item.svelte', content: timelineItemSource },
    { name: 'registry/files/ui/timeline/timeline-dot.svelte', content: timelineDotSource },
    { name: 'registry/files/ui/timeline/timeline-header.svelte', content: timelineHeaderSource },
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
  TimelineHeader,
  TimelineContent,
  TimelineTime,
  TimelineTitle,
} from '@ui/timeline/index';`;

  // ── the TWELVE official reui families (W4) — one canvas stage each,
  //    stageLabel pinned to the inventory's frozen mapping table ──

  // 1 · basic timeline — dates + titles + content, value-driven completion
  const basicUsage = `${timelineImport}

<Timeline defaultValue={2}>
  <TimelineItem>
    <TimelineDot />
    <TimelineContent>
      <TimelineTime datetime="2026-08-30T09:00:00Z">Aug 30</TimelineTime>
      <TimelineTitle>spine rework landed</TimelineTitle>
      <p>one measured svg run path under the items</p>
    </TimelineContent>
  </TimelineItem>
  <TimelineItem>
    <TimelineDot />
    <TimelineContent>
      <TimelineTime datetime="2026-09-01T09:00:00Z">Sep 1</TimelineTime>
      <TimelineTitle>grid engine rebuilt</TimelineTitle>
    </TimelineContent>
  </TimelineItem>
  <!-- defaultValue 2: the first two items paint data-completed -->
</Timeline>`;

  const basicFiles: TreeFile[] = [{ name: 'timeline-basic-demo.svelte', content: basicUsage, kind: 'usage' }];

  const basicEvents = [
    { time: 'Aug 30', iso: '2026-08-30T09:00:00Z', title: 'spine rework landed', body: 'one measured svg run path under the items — no per-item seams' },
    { time: 'Sep 1', iso: '2026-09-01T09:00:00Z', title: 'grid engine rebuilt', body: 'the 5-lane grid, subgrid items, eight logical dot slots' },
    { time: 'Sep 8', iso: '2026-09-08T09:00:00Z', title: 'value contract drafted', body: 'defaultValue · value · onValueChange — reui parity' },
    { time: 'Sep 15', iso: '2026-09-15T09:00:00Z', title: 'docs upgrade', body: 'the twelve official families land on this page' },
  ];

  // 2 · roadmap — phases with the current one mid-way (a decimal value)
  const roadmapUsage = `${timelineImport}

<Timeline value={2.5}>
  <TimelineHeader>2026 product roadmap — v3</TimelineHeader>
  <TimelineItem><TimelineDot /><TimelineContent>
    <TimelineTime datetime="2026-01-01">Q1</TimelineTime>
    <TimelineTitle>planning</TimelineTitle>
  </TimelineContent></TimelineItem>
  <!-- value 2.5: planning + design complete, development in flight —
       the progress stroke sits HALFWAY between nodes 2 and 3 -->
  <TimelineItem pending><TimelineDot /><TimelineContent>
    <TimelineTitle>development</TimelineTitle>
  </TimelineContent></TimelineItem>
</Timeline>`;

  const roadmapFiles: TreeFile[] = [{ name: 'timeline-roadmap-demo.svelte', content: roadmapUsage, kind: 'usage' }];

  const roadmapPhases: Array<{ q: string; iso: string; phase: string; note: string; pending?: boolean }> = [
    { q: 'Q1', iso: '2026-01-01', phase: 'planning', note: 'scope frozen · staffing locked' },
    { q: 'Q2', iso: '2026-04-01', phase: 'design', note: 'geometry engine · token audit' },
    { q: 'Q3', iso: '2026-07-01', phase: 'development', note: 'twelve families · value contract', pending: true },
    { q: 'Q4', iso: '2026-10-01', phase: 'testing', note: 'probe battery · a11y pass' },
    { q: 'Q1 27', iso: '2027-01-01', phase: 'launch', note: 'ga · registry sync' },
  ];

  // 3 · order status — dates + status badges + amounts, progress partway
  const orderStatusUsage = `${timelineImport}
  import Badge from '@ui/badge';
${close}

<Timeline value={2.4}>
  <TimelineItem>
    <TimelineDot />
    <TimelineContent>
      <div class="flex items-baseline justify-between gap-3">
        <TimelineTime datetime="2026-01-07T10:12:00Z">Jan 7, 10:12</TimelineTime>
        <Badge variant="outline">placed</Badge>
      </div>
      <TimelineTitle>order #8412</TimelineTitle>
      <p>$248.00 · card ending 4242</p>
    </TimelineContent>
  </TimelineItem>
  <!-- value 2.4: the stroke runs 40% of the way from node 2 to node 3 -->
</Timeline>`;

  const orderStatusFiles: TreeFile[] = [{ name: 'timeline-order-status-demo.svelte', content: orderStatusUsage, kind: 'usage' }];

  const orderSteps = [
    { time: 'Jan 7, 10:12', iso: '2026-01-07T10:12:00Z', title: 'order #8412 placed', body: '$248.00 · card ending 4242', badge: 'placed', variant: 'outline' as const },
    { time: 'Jan 7, 10:14', iso: '2026-01-07T10:14:00Z', title: 'payment confirmed', body: 'authorized · 3-verified', badge: 'paid', variant: 'tonal' as const },
    { time: 'Jan 8, 08:02', iso: '2026-01-08T08:02:00Z', title: 'shipped — 2 boxes', body: 'tracking 1Z·8842·4471·0031', badge: 'in transit', variant: 'fill' as const },
    { time: 'Jan 12', iso: '2026-01-12T00:00:00Z', title: 'delivery expected', body: 'signature on arrival', badge: 'eta', variant: 'outline' as const },
  ];

  // 4 · git activity — dot children as icon badges, one lucide glyph per item
  const gitUsage = `${timelineImport}
  import Icon from '@ui/icon';
${close}

<Timeline value={3}>
  <TimelineItem>
    <!-- the icon pattern: children render INSIDE the node span — the
         node grows around them; tinted constants ride inline styles -->
    <TimelineDot variant="round" style="border-color: var(--info); background: color-mix(in oklab, var(--info) 14%, transparent); color: var(--info)">
      <Icon name="lucide:git-fork" size={11} />
    </TimelineDot>
    <TimelineContent><TimelineTitle>kzf forked ui/spine-rework</TimelineTitle></TimelineContent>
  </TimelineItem>
  <TimelineItem>
    <TimelineDot variant="round" style="border-color: var(--success); background: color-mix(in oklab, var(--success) 14%, transparent); color: var(--success)">
      <Icon name="lucide:git-pull-request" size={11} />
    </TimelineDot>
    <TimelineContent><TimelineTitle>pr #214 — the value contract</TimelineTitle></TimelineContent>
  </TimelineItem>
  <TimelineItem>
    <TimelineDot variant="round" style="border-color: var(--warning); background: color-mix(in oklab, var(--warning) 14%, transparent); color: var(--warning)">
      <Icon name="lucide:git-compare-arrows" size={11} />
    </TimelineDot>
    <TimelineContent><TimelineTitle>compare — 12 commits ahead</TimelineTitle></TimelineContent>
  </TimelineItem>
  <TimelineItem pending>
    <TimelineDot variant="round" style="border-color: var(--primary); background: color-mix(in oklab, var(--primary) 14%, transparent); color: var(--primary)">
      <Icon name="lucide:git-merge" size={11} />
    </TimelineDot>
    <TimelineContent><TimelineTitle>merged into main</TimelineTitle></TimelineContent>
  </TimelineItem>
</Timeline>`;

  const gitFiles: TreeFile[] = [{ name: 'timeline-git-activity-demo.svelte', content: gitUsage, kind: 'usage' }];

  const gitEvents: Array<{ icon: IconName; token: string; title: string; body: string; pending?: boolean }> = [
    { icon: 'lucide:git-fork', token: '--info', title: 'kzf forked ui/spine-rework', body: 'from main @ 4f2a1c' },
    { icon: 'lucide:git-pull-request', token: '--success', title: 'pr #214 — the value contract', body: '9 files · +1,286 −299 · 6 checks green' },
    { icon: 'lucide:git-compare-arrows', token: '--warning', title: 'compare — 12 commits ahead', body: 'spine-rework…value-contract' },
    { icon: 'lucide:git-merge', token: '--primary', title: 'merged into main', body: 'squash · 4f2a1c → 9d3b71', pending: true },
  ];

  // 5 · milestones — funding rounds with dates
  const milestonesUsage = `${timelineImport}

<Timeline defaultValue={3}>
  <TimelineItem>
    <TimelineDot variant="round" />
    <TimelineContent>
      <TimelineTime datetime="2023-11-01">Nov 2023</TimelineTime>
      <TimelineTitle>pre-seed</TimelineTitle>
      <p>$150k · 2 angels</p>
    </TimelineContent>
  </TimelineItem>
  <!-- round dots + dates; defaultValue 3 completes through series a -->
</Timeline>`;

  const milestonesFiles: TreeFile[] = [{ name: 'timeline-milestones-demo.svelte', content: milestonesUsage, kind: 'usage' }];

  const fundingRounds: Array<{ date: string; iso: string; round: string; note: string; pending?: boolean }> = [
    { date: 'Nov 2023', iso: '2023-11-01', round: 'pre-seed', note: '$150k · 2 angels' },
    { date: 'Jun 2024', iso: '2024-06-01', round: 'seed', note: '$2.4M · runway 18mo' },
    { date: 'Mar 2025', iso: '2025-03-01', round: 'series a', note: '$12M · growth' },
    { date: 'Q2 2026', iso: '2026-06-01', round: 'series b', note: 'target $40M', pending: true },
  ];

  // 6 · pipeline steps — CI/CD with the current step in flight (spinner
  //     inside the pending dot's children)
  const pipelineUsage = `${timelineImport}
  import Spin from '@ui/spin';
${close}

<Timeline defaultValue={2}>
  <TimelineItem><TimelineDot variant="round" /><TimelineContent>
    <TimelineTitle>checkout</TimelineTitle><p>4f2a1c · clean</p>
  </TimelineContent></TimelineItem>
  <TimelineItem><TimelineDot variant="round" /><TimelineContent>
    <TimelineTitle>install</TimelineTitle><p>pnpm · 14.2s cached</p>
  </TimelineContent></TimelineItem>
  <!-- pending WINS the dot paint: hollow node, spinner in its children -->
  <TimelineItem pending>
    <TimelineDot variant="round"><Spin spinner="bars-scale" size={9} label="tests running" /></TimelineDot>
    <TimelineContent><TimelineTitle>tests — running</TimelineTitle><p>212 of 240</p></TimelineContent>
  </TimelineItem>
  <TimelineItem><TimelineDot variant="round" /><TimelineContent>
    <TimelineTitle>build</TimelineTitle><p>queued</p>
  </TimelineContent></TimelineItem>
</Timeline>`;

  const pipelineFiles: TreeFile[] = [{ name: 'timeline-pipeline-steps-demo.svelte', content: pipelineUsage, kind: 'usage' }];

  const pipelineStages: Array<{ time: string; iso: string; title: string; body: string; pending?: boolean; live?: boolean }> = [
    { time: '09:02', iso: '2026-09-15T09:02:00Z', title: 'checkout', body: '4f2a1c · clean' },
    { time: '09:03', iso: '2026-09-15T09:03:00Z', title: 'install', body: 'pnpm · 14.2s cached' },
    { time: '09:05', iso: '2026-09-15T09:05:00Z', title: 'tests — running', body: '212 of 240 · 2 shards', pending: true, live: true },
    { time: '09:09', iso: '2026-09-15T09:09:00Z', title: 'build', body: 'queued behind tests' },
  ];

  // 7 · roadmap items — phases with item lists
  const roadmapItemsUsage = `${timelineImport}

<Timeline defaultValue={2} direction="interlaced">
  <TimelineItem>
    <TimelineDot />
    <TimelineContent>
      <TimelineTime datetime="2026-07-01">Q3</TimelineTime>
      <TimelineTitle>foundation</TimelineTitle>
      <ul><li>value contract</li><li>spine rework</li></ul>
    </TimelineContent>
  </TimelineItem>
  <!-- both zones stay live under interlaced; the free body is a list -->
</Timeline>`;

  const roadmapItemsFiles: TreeFile[] = [{ name: 'timeline-roadmap-items-demo.svelte', content: roadmapItemsUsage, kind: 'usage' }];

  const roadmapItemPhases: Array<{ q: string; iso: string; phase: string; items: string[]; pending?: boolean }> = [
    { q: 'Q3', iso: '2026-07-01', phase: 'foundation', items: ['value contract', 'spine rework', 'registry sync'] },
    { q: 'Q4', iso: '2026-10-01', phase: 'families', items: ['twelve reui demos', 'docs upgrade', 'props table'] },
    { q: 'Q1 27', iso: '2027-01-01', phase: 'polish', items: ['a11y pass', 'perf budget'], pending: true },
  ];

  // 8 · vertical — the plain dense form
  const verticalUsage = `${timelineImport}

<Timeline defaultValue={2} density="sm">
  <TimelineItem><TimelineDot /><TimelineContent>
    <TimelineTime datetime="09:02">09:02</TimelineTime>
    <TimelineTitle>standup</TimelineTitle>
  </TimelineContent></TimelineItem>
  <!-- density sm: the whole ruler steps down — dots, gaps, text -->
</Timeline>`;

  const verticalFiles: TreeFile[] = [{ name: 'timeline-vertical-demo.svelte', content: verticalUsage, kind: 'usage' }];

  const verticalEvents: Array<{ time: string; iso: string; title: string; pending?: boolean }> = [
    { time: '09:02', iso: '2026-09-15T09:02:00Z', title: 'standup' },
    { time: '10:15', iso: '2026-09-15T10:15:00Z', title: 'spine review' },
    { time: '13:30', iso: '2026-09-15T13:30:00Z', title: 'probe battery' },
    { time: '16:45', iso: '2026-09-15T16:45:00Z', title: 'docs upgrade', pending: true },
  ];

  // 9 · horizontal with leading labels — labels on the line before each node
  const horizontalLeadingUsage = `${timelineImport}

<div class="w-full overflow-x-auto border border-border p-6">
  <Timeline axis="horizontal" defaultValue={3} class="min-w-[34rem]">
    <TimelineItem>
      <!-- blockStart rides BEFORE the node along the line — the
           leading label; on the horizontal axis it flanks the dot -->
      <TimelineDot variant="round">
        {#snippet blockStart()}<span>2023</span>{/snippet}
      </TimelineDot>
      <TimelineContent><TimelineTitle>launch</TimelineTitle></TimelineContent>
    </TimelineItem>
  </Timeline>
</div>`;

  const horizontalLeadingFiles: TreeFile[] = [{ name: 'timeline-horizontal-leading-demo.svelte', content: horizontalLeadingUsage, kind: 'usage' }];

  const leadingYears = [
    { label: '2023', title: 'launch' },
    { label: '2024', title: 'v2 grid engine' },
    { label: '2025', title: 'registry era' },
    { label: '2026', title: 'drawn spine' },
  ];

  // 10 · deployment log — entries with env badges
  const deployLogUsage = `${timelineImport}
  import Badge from '@ui/badge';
${close}

<Timeline defaultValue={2}>
  <TimelineHeader>deployments · jixoai-ui</TimelineHeader>
  <TimelineItem>
    <TimelineDot variant="round" />
    <TimelineContent>
      <div class="flex items-baseline justify-between gap-3">
        <TimelineTime datetime="2026-09-15T09:41:00Z">09:41</TimelineTime>
        <Badge variant="fill">production</Badge>
      </div>
      <TimelineTitle>v3.4.1</TimelineTitle>
      <p>9d3b71 · edge cache warm</p>
    </TimelineContent>
  </TimelineItem>
</Timeline>`;

  const deployLogFiles: TreeFile[] = [{ name: 'timeline-deployment-log-demo.svelte', content: deployLogUsage, kind: 'usage' }];

  const deployEntries: Array<{ time: string; iso: string; env: string; variant: 'fill' | 'tonal' | 'outline'; title: string; body: string; pending?: boolean }> = [
    { time: '09:41', iso: '2026-09-15T09:41:00Z', env: 'production', variant: 'fill' as const, title: 'v3.4.1', body: '9d3b71 · edge cache warm · 7 regions' },
    { time: '08:15', iso: '2026-09-15T08:15:00Z', env: 'staging', variant: 'tonal' as const, title: 'v3.5.0-rc.2', body: 'probe battery green · soak 40m' },
    { time: '07:52', iso: '2026-09-15T07:52:00Z', env: 'preview', variant: 'outline' as const, title: 'pr-214', body: 'value contract · building', pending: true },
  ];

  // 11 · activity feed — dot children as avatars (the initials fallback)
  const activityFeedUsage = `${timelineImport}
  import Avatar from '@ui/avatar';
${close}

<Timeline value={3}>
  <TimelineItem>
    <!-- avatars as node children: the repo avatar's initials fallback
         needs no image — alt="" marks it decorative beside the name -->
    <TimelineDot variant="round">
      <Avatar name="Ada Lovelace" size="sm" alt="" tooltip={false} />
    </TimelineDot>
    <TimelineContent>
      <TimelineTitle>Ada Lovelace pushed 3 commits</TimelineTitle>
      <p>spine: measured run path · 41m ago</p>
    </TimelineContent>
  </TimelineItem>
</Timeline>`;

  const activityFeedFiles: TreeFile[] = [{ name: 'timeline-activity-feed-demo.svelte', content: activityFeedUsage, kind: 'usage' }];

  const feedEvents: Array<{ name: string; title: string; body: string; pending?: boolean }> = [
    { name: 'Ada Lovelace', title: 'Ada Lovelace pushed 3 commits', body: 'spine: measured run path · 41m ago' },
    { name: 'Alan Turing', title: 'Alan Turing opened pr #88', body: 'density: the sm ruler · 2h ago' },
    { name: 'Grace Hopper', title: 'Grace Hopper merged main', body: 'squash · 6 checks · 3h ago', pending: true },
  ];

  // 12 · compact horizontal milestone — the low-profile axis form
  const compactMilestoneUsage = `${timelineImport}

<div class="w-full overflow-x-auto border border-border p-4">
  <Timeline axis="horizontal" defaultValue={2} density="sm" class="min-w-[30rem]">
    <TimelineItem>
      <TimelineDot variant="round" />
      <TimelineContent><TimelineTitle>alpha</TimelineTitle></TimelineContent>
    </TimelineItem>
    <!-- sm density + bare titles: the compact milestone strip -->
  </Timeline>
</div>`;

  const compactMilestoneFiles: TreeFile[] = [{ name: 'timeline-compact-milestone-demo.svelte', content: compactMilestoneUsage, kind: 'usage' }];

  const compactStops = ['alpha', 'beta', 'rc', 'ga', 'lts'];

  // ── our four highlights ──

  // the 8-directional slots matrix (node section)
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

  // the spine presets (plain · dashed · beam)
  const timelinePresetsDemo = `<script lang="ts">
  import Timeline, {
    TimelineItem,
    TimelineDot,
    TimelineContent,
    TimelineTitle,
  } from '@ui/timeline/index';
${close}

  <div class="grid gap-6 min-[1100px]:grid-cols-3">
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
</div>`;

  const timelinePresetsFiles: TreeFile[] = [
    { name: 'timeline-spine-presets-demo.svelte', content: timelinePresetsDemo, kind: 'usage' },
  ];

  // the custom geometry snippet (the measured payload seam)
  const timelineGeometryDemo = `<script lang="ts">
  import Timeline, {
    TimelineItem,
    TimelineDot,
    TimelineContent,
    TimelineTitle,
  } from '@ui/timeline/index';
${close}

  <div class="w-full max-w-md border border-border p-6">
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
</div>`;

  const timelineGeometryFiles: TreeFile[] = [
    { name: 'timeline-geometry-snippet-demo.svelte', content: timelineGeometryDemo, kind: 'usage' },
  ];

  // the value contract demo (usage file): decimal tween + controlled stepper
  const valueUsage = `<script lang="ts">
  import Timeline, {
    TimelineItem,
    TimelineDot,
    TimelineContent,
    TimelineTitle,
  } from '@ui/timeline/index';
${close}

  <!-- the controlled stepper: ONE state number drives value; decimals
       ride straight through — the stroke tweens, the thresholds flip -->
  let stepper = $state(1);
  const STEPS = 6;
  function stepNext() { stepper = Math.min(STEPS, Math.floor(stepper) + 1); }
  function stepPrev() { stepper = Math.max(1, Math.ceil(stepper) - 1); }
  function stepRandom() { stepper = 1 + Math.random() * (STEPS - 1); }

  <div class="flex flex-wrap items-center gap-2">
    <button onclick={stepPrev}>prev</button>
    <button onclick={stepNext}>next</button>
    <button onclick={() => (stepper = 1)}>reset</button>
    <button onclick={stepRandom}>random</button>
    <span>value = {stepper.toFixed(2)}</span>
  </div>
  <Timeline value={stepper}>
    {#each Array(STEPS) as _, i (i)}
      <TimelineItem>
        <TimelineDot />
        <TimelineContent>
          <TimelineTitle>step {i + 1}</TimelineTitle>
          <p>{i + 1 <= stepper ? 'complete' : 'upcoming'}</p>
        </TimelineContent>
      </TimelineItem>
    {/each}
  </Timeline>`;

  const valueFiles: TreeFile[] = [
    { name: 'timeline-value-stepper-demo.svelte', content: valueUsage, kind: 'usage' },
  ];

  // the LIVE stepper state (the value canvas's engine)
  const STEPS = 6;
  let stepperValue = $state(1);
  let tweenOn = $state(false);
  let tweenFrom = 1;
  let tweenStart = 0;

  function stepNext(): void {
    tweenOn = false;
    stepperValue = Math.min(STEPS, Math.floor(stepperValue) + 1);
  }
  function stepPrev(): void {
    tweenOn = false;
    stepperValue = Math.max(1, Math.ceil(stepperValue) - 1);
  }
  function stepReset(): void {
    tweenOn = false;
    stepperValue = 1;
  }
  function stepRandom(): void {
    tweenOn = false;
    stepperValue = 1 + Math.random() * (STEPS - 1);
  }
  function toggleTween(): void {
    if (tweenOn) {
      tweenOn = false;
      return;
    }
    tweenFrom = stepperValue >= STEPS ? 1 : stepperValue;
    tweenOn = true;
  }

  // the rAF tween: 1 → STEPS through fractional mid-states (smoothstep
  // eased, ~2.4s); pause freezes in place, resume continues
  $effect(() => {
    if (!tweenOn) return;
    const dur = 2400;
    tweenStart = performance.now();
    const tick = (now: number): void => {
      if (!tweenOn) return;
      const p = Math.min(1, (now - tweenStart) / dur);
      const eased = p * p * (3 - 2 * p);
      stepperValue = tweenFrom + (STEPS - tweenFrom) * eased;
      if (p < 1) requestAnimationFrame(tick);
      else tweenOn = false;
    };
    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  });

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
    TimelineHeader,
    TimelineContent,
    TimelineTime,
    TimelineTitle,
  } from '@ui/timeline/index';
${close}

  <div class="max-w-md">
  <Timeline>
    <TimelineHeader>release train</TimelineHeader>
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
    content="The jixoai timeline, drawn-spine + value-contract edition: a one-cell grid host stacking the semantic ol over a measured whole-list SVG spine, with reui's value contract (defaultValue · value · onValueChange, decimals first-class) painting a progress stroke along the measured path — 1.5 sits halfway between nodes — while data-completed fills dots and inks titles. Twelve official reui families, plain/dashed/beam/custom spines, axis/direction/interlacing/RTL in one coordinate space, and a no-JS CSS floor that upgrades on hydration."
  />
</svelte:head>

<div class="tl-shell">
  <div class={cx(tlDocs.flex, tlDocs.minW0, tlDocs.col, tlDocs.gap32)}>
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Data display"
        title="timeline — the drawn activity spine"
        summary={entry.summary}
      >
        <div class={cx(tlDocs.flex, tlDocs.wrap, tlDocs.gap12)}>
          <span class="pill">ol · order is chronology</span>
          <span class="pill">value contract · decimals first-class</span>
          <span class="pill">progress stroke · 300ms dashoffset</span>
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
        description="The spine is DRAWN: one whole-list SVG layer, measured from the live item geometry, painted under the dots and content by source order in a one-cell grid host. The value contract drives it: items whose step ≤ the current value paint data-completed (dot fills primary, title steps to full ink), and the progress stroke draws along the measured path to the value's position — decimals land between nodes. Before hydration (and without JS forever) every item carries the plain CSS floor line."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/timeline/timeline.svelte"
        files={canvasFiles}
        onreset={resetCanvas}
        output={[{ label: 'value', value: canvasValue }, { label: 'last entry pending', value: pending }]}
        resolveFileContent={resolveUsage}
      >
        <div class={cx(tlDocs.wFull, tlDocs.measure28)}>
          <Timeline value={canvasValue}>
            <TimelineItem>
              <TimelineDot>
                {#snippet blockStart()}<span>07:02</span>{/snippet}
              </TimelineDot>
              <TimelineContent>
                <TimelineTime datetime="2026-08-22T07:02:41Z">07:02</TimelineTime>
                <TimelineTitle>pushed</TimelineTitle>
                <p class="tl-body">feat: popover family on CSS anchors · 4f2a1c</p>
              </TimelineContent>
            </TimelineItem>
            <TimelineItem>
              <TimelineDot>
                {#snippet blockStart()}<span>07:03</span>{/snippet}
              </TimelineDot>
              <TimelineContent>
                <TimelineTime datetime="2026-08-22T07:03:19Z">07:03</TimelineTime>
                <TimelineTitle>checks passed</TimelineTitle>
                <p class="tl-body">12 checks · 0 failed · 8.2s</p>
              </TimelineContent>
            </TimelineItem>
            <TimelineItem {pending}>
              <TimelineDot variant="ring">
                {#snippet blockStart()}<span>07:04</span>{/snippet}
              </TimelineDot>
              <TimelineContent>
                <TimelineTitle>deploying</TimelineTitle>
                <p class="tl-body">edge cache warming — 2 of 7 regions live</p>
              </TimelineContent>
            </TimelineItem>
          </Timeline>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayRow label="value" hint="the current step — decimals land between nodes">
              <PlayNumber bind:value={canvasValue} min={1} max={3} step={0.5} />
            </PlayRow>
            <PlayRow label="last entry pending" hint="in-flight chronology entry">
              <PlayToggle bind:value={pending} />
            </PlayRow>
            <PlayHelp>
              <code class={cx(tlDocs.accent)}>value</code> is the contract's read side — 2.5 completes items 1 and 2,
              paints the stroke halfway to node 3, and leaves the third entry's hollow <code class={cx(tlDocs.accent)}>pending</code>
              paint in charge. <code class={cx(tlDocs.accent)}>pending</code> stays the per-item in-flight channel; the
              <code class={cx(tlDocs.accent)}>blockStart</code> slot on each dot is the timestamp cutout riding the spine.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="families-chronology" data-reveal="">
      <SectionCard
        family="families-chronology"
        headerRegion="families-chronology"
        eyebrow="the official twelve · chronology"
        title="the chronology forms — basic · roadmap · roadmap items"
        summary="The twelve official reui timeline families, one canvas each, stage labels pinned to the family inventory. The chronology forms are the reading rail: dates and titles under the value contract, phases with the current one mid-way, phases carrying item lists. Every family is the same engine — only the content and the value change."
      >
        <ComponentCanvas
          title="timeline · basic"
          stageLabel="timeline demo · basic"
          description="Dates, titles, bodies. defaultValue 2 completes the first two entries — the rest stay muted until the value moves."
          files={basicFiles}
        >
          <div class={cx(tlDocs.wFull, tlDocs.measure28)}>
            <Timeline defaultValue={2}>
              {#each basicEvents as ev, i (ev.iso)}
                <TimelineItem pending={i === basicEvents.length - 1}>
                  <TimelineDot />
                  <TimelineContent>
                    <TimelineTime datetime={ev.iso}>{ev.time}</TimelineTime>
                    <TimelineTitle>{ev.title}</TimelineTitle>
                    <p class="tl-body">{ev.body}</p>
                  </TimelineContent>
                </TimelineItem>
              {/each}
            </Timeline>
          </div>
        </ComponentCanvas>
        <ComponentCanvas
          title="timeline · roadmap"
          stageLabel="timeline demo · roadmap"
          class={cx(tlDocs.mt24)}
          description="Roadmap phases with TimelineHeader chrome. value 2.5 — a decimal: planning and design complete, development in flight, the progress stroke halfway between nodes 2 and 3."
          files={roadmapFiles}
        >
          <div class={cx(tlDocs.wFull, tlDocs.measure28)}>
            <Timeline value={2.5}>
              <TimelineHeader class={cx(tlDocs.fontNav, tlDocs.textBase, tlDocs.trackWide, tlDocs.upper)}>2026 product roadmap — v3</TimelineHeader>
              {#each roadmapPhases as phase (phase.iso)}
                <TimelineItem pending={phase.pending}>
                  <TimelineDot variant="round" />
                  <TimelineContent>
                    <TimelineTime datetime={phase.iso}>{phase.q}</TimelineTime>
                    <TimelineTitle>{phase.phase}</TimelineTitle>
                    <p class="tl-body">{phase.note}</p>
                  </TimelineContent>
                </TimelineItem>
              {/each}
            </Timeline>
          </div>
        </ComponentCanvas>
        <ComponentCanvas
          title="timeline · roadmap items"
          stageLabel="timeline demo · roadmap items"
          class={cx(tlDocs.mt24)}
          description="Phases that carry item lists — free body children under interlaced zones; the current phase pending."
          files={roadmapItemsFiles}
        >
          <div class={cx(tlDocs.wFull, tlDocs.maxW42)}>
            <Timeline defaultValue={2} direction="interlaced">
              {#each roadmapItemPhases as phase (phase.iso)}
                <TimelineItem pending={phase.pending}>
                  <TimelineDot />
                  <TimelineContent>
                    <TimelineTime datetime={phase.iso}>{phase.q}</TimelineTime>
                    <TimelineTitle>{phase.phase}</TimelineTitle>
                    <ul class="tl-body {cx(tlDocs.listReset)}">
                      {#each phase.items as item (item)}
                        <li class={cx(tlDocs.flex, tlDocs.itemsCenter, tlDocs.gap6)}><span class={cx(tlDocs.primary)}>·</span>{item}</li>
                      {/each}
                    </ul>
                  </TimelineContent>
                </TimelineItem>
              {/each}
            </Timeline>
          </div>
        </ComponentCanvas>
      </SectionCard>
    </div>

    <div id="families-tracking" data-reveal="">
      <SectionCard
        family="families-tracking"
        headerRegion="families-tracking"
        eyebrow="the official twelve · tracking"
        title="the tracking forms — order status · milestones · pipeline · deployment log"
        summary="Progress-as-value: an order partway through fulfillment, funding rounds behind you, a CI pipeline with the current stage in flight (the pending dot hosts a spinner in its children), and a deployment log stamped with environment badges."
      >
        <ComponentCanvas
          title="timeline · order status"
          stageLabel="timeline demo · order status"
          description="Order tracking with status badges and amounts. value 2.4 — paid and placed complete, the stroke 40% of the way to shipped."
          files={orderStatusFiles}
        >
          <div class={cx(tlDocs.wFull, tlDocs.measure28)}>
            <Timeline value={2.4}>
              {#each orderSteps as step (step.iso)}
                <TimelineItem>
                  <TimelineDot variant="round" />
                  <TimelineContent>
                    <div class={cx(tlDocs.flex, tlDocs.itemsBaseline, tlDocs.between, tlDocs.gap12)}>
                      <TimelineTime datetime={step.iso}>{step.time}</TimelineTime>
                      <Badge variant={step.variant}>{step.badge}</Badge>
                    </div>
                    <TimelineTitle>{step.title}</TimelineTitle>
                    <p class="tl-body">{step.body}</p>
                  </TimelineContent>
                </TimelineItem>
              {/each}
            </Timeline>
          </div>
        </ComponentCanvas>
        <ComponentCanvas
          title="timeline · milestones"
          stageLabel="timeline demo · milestones"
          class={cx(tlDocs.mt24)}
          description="Funding rounds with dates — round dots, defaultValue 3 completes through series a; the upcoming round stays pending."
          files={milestonesFiles}
        >
          <div class={cx(tlDocs.wFull, tlDocs.measure28)}>
            <Timeline defaultValue={3}>
              {#each fundingRounds as round (round.iso)}
                <TimelineItem pending={round.pending}>
                  <TimelineDot variant="round" />
                  <TimelineContent>
                    <TimelineTime datetime={round.iso}>{round.date}</TimelineTime>
                    <TimelineTitle>{round.round}</TimelineTitle>
                    <p class="tl-body">{round.note}</p>
                  </TimelineContent>
                </TimelineItem>
              {/each}
            </Timeline>
          </div>
        </ComponentCanvas>
        <ComponentCanvas
          title="timeline · pipeline steps"
          stageLabel="timeline demo · pipeline steps"
          class={cx(tlDocs.mt24)}
          description="CI/CD pipeline — checkout and install complete; tests in flight: the pending hollow dot carries a spinner in its children."
          files={pipelineFiles}
        >
          <div class={cx(tlDocs.wFull, tlDocs.measure28)}>
            <Timeline defaultValue={2}>
              {#each pipelineStages as stage (stage.title)}
                <TimelineItem pending={stage.pending}>
                  <TimelineDot variant="round">
                    {#if stage.live}<Spin spinner="bars-scale" size={9} label="tests running" />{/if}
                  </TimelineDot>
                  <TimelineContent>
                    <TimelineTime datetime={stage.iso}>{stage.time}</TimelineTime>
                    <TimelineTitle>{stage.title}</TimelineTitle>
                    <p class="tl-body">{stage.body}</p>
                  </TimelineContent>
                </TimelineItem>
              {/each}
            </Timeline>
          </div>
        </ComponentCanvas>
        <ComponentCanvas
          title="timeline · deployment log"
          stageLabel="timeline demo · deployment log"
          class={cx(tlDocs.mt24)}
          description="Deploy log entries with environment badges — fill for production, tonal for staging, outline for preview; the preview build pending."
          files={deployLogFiles}
        >
          <div class={cx(tlDocs.wFull, tlDocs.measure28)}>
            <Timeline defaultValue={2}>
              <TimelineHeader class={cx(tlDocs.fontNav, tlDocs.textBase, tlDocs.trackWide, tlDocs.upper)}>deployments · jixoai-ui</TimelineHeader>
              {#each deployEntries as dep (dep.iso)}
                <TimelineItem pending={dep.pending}>
                  <TimelineDot variant="round" />
                  <TimelineContent>
                    <div class={cx(tlDocs.flex, tlDocs.itemsBaseline, tlDocs.between, tlDocs.gap12)}>
                      <TimelineTime datetime={dep.iso}>{dep.time}</TimelineTime>
                      <Badge variant={dep.variant}>{dep.env}</Badge>
                    </div>
                    <TimelineTitle>{dep.title}</TimelineTitle>
                    <p class="tl-body">{dep.body}</p>
                  </TimelineContent>
                </TimelineItem>
              {/each}
            </Timeline>
          </div>
        </ComponentCanvas>
      </SectionCard>
    </div>

    <div id="families-activity" data-reveal="">
      <SectionCard
        family="families-activity"
        headerRegion="families-activity"
        eyebrow="the official twelve · git + activity"
        title="the git + activity forms — icon badges · avatars"
        summary="The node's children lane carries richer marks than a filled square: lucide git glyphs tinted per event type, and the repo avatar's initials fallback as the face of each feed entry."
      >
        <ComponentCanvas
          title="timeline · git activity"
          stageLabel="timeline demo · git activity"
          description="Git events as icon badges — fork, pull request, compare, merge — one lucide glyph inside each node, a distinct token tint per type."
          files={gitFiles}
        >
          <div class={cx(tlDocs.wFull, tlDocs.measure28)}>
            <Timeline value={3}>
              {#each gitEvents as ev (ev.title)}
                <TimelineItem pending={ev.pending}>
                  <TimelineDot
                    variant="round"
                    style={`border-color: var(${ev.token}); background: color-mix(in oklab, var(${ev.token}) 14%, transparent); color: var(${ev.token})`}
                  >
                    <Icon name={ev.icon} size={11} />
                  </TimelineDot>
                  <TimelineContent>
                    <TimelineTitle>{ev.title}</TimelineTitle>
                    <p class="tl-body">{ev.body}</p>
                  </TimelineContent>
                </TimelineItem>
              {/each}
            </Timeline>
          </div>
        </ComponentCanvas>
        <ComponentCanvas
          title="timeline · activity feed"
          stageLabel="timeline demo · activity feed"
          class={cx(tlDocs.mt24)}
          description="An activity feed with avatars — the repo avatar renders inside each node (initials fallback, no image needed); the merge in flight stays pending."
          files={activityFeedFiles}
        >
          <div class={cx(tlDocs.wFull, tlDocs.measure28)}>
            <Timeline value={2.5}>
              {#each feedEvents as ev (ev.title)}
                <TimelineItem pending={ev.pending}>
                  <TimelineDot variant="round">
                    <Avatar name={ev.name} size="sm" alt="" tooltip={false} />
                  </TimelineDot>
                  <TimelineContent>
                    <TimelineTitle>{ev.title}</TimelineTitle>
                    <p class="tl-body">{ev.body}</p>
                  </TimelineContent>
                </TimelineItem>
              {/each}
            </Timeline>
          </div>
        </ComponentCanvas>
      </SectionCard>
    </div>

    <div id="families-axis" data-reveal="">
      <SectionCard
        family="families-axis"
        headerRegion="families-axis"
        eyebrow="the official twelve · axis forms"
        title="the axis forms — vertical · horizontal leading labels · compact milestone"
        summary="The engine transposes whole: the plain vertical rail (here at sm density), the horizontal axis with labels leading each node on the line, and the compact horizontal milestone strip."
      >
        <ComponentCanvas
          title="timeline · vertical"
          stageLabel="timeline demo · vertical"
          description="The plain vertical form at sm density — the whole ruler steps down: dots, gaps, text."
          files={verticalFiles}
        >
          <div class={cx(tlDocs.wFull, tlDocs.maxW24)}>
            <Timeline defaultValue={2} density="sm">
              {#each verticalEvents as ev (ev.title)}
                <TimelineItem pending={ev.pending}>
                  <TimelineDot />
                  <TimelineContent>
                    <TimelineTime datetime={ev.iso}>{ev.time}</TimelineTime>
                    <TimelineTitle>{ev.title}</TimelineTitle>
                  </TimelineContent>
                </TimelineItem>
              {/each}
            </Timeline>
          </div>
        </ComponentCanvas>
        <ComponentCanvas
          title="timeline · horizontal leading labels"
          stageLabel="timeline demo · horizontal leading labels"
          class={cx(tlDocs.mt24)}
          description="axis horizontal with a label leading each node — the blockStart slot flanks the dot against the flow on the transposed engine."
          files={horizontalLeadingFiles}
        >
          <div class="tl-frame {cx(tlDocs.wFull, tlDocs.oxAuto, tlDocs.p24)}">
            <Timeline axis="horizontal" defaultValue={3} class={cx(tlDocs.minW34)}>
              {#each leadingYears as year (year.label)}
                <TimelineItem>
                  <TimelineDot variant="round">
                    {#snippet blockStart()}<span>{year.label}</span>{/snippet}
                  </TimelineDot>
                  <TimelineContent><TimelineTitle>{year.title}</TimelineTitle></TimelineContent>
                </TimelineItem>
              {/each}
            </Timeline>
          </div>
        </ComponentCanvas>
        <ComponentCanvas
          title="timeline · compact horizontal milestone"
          stageLabel="timeline demo · compact horizontal milestone"
          class={cx(tlDocs.mt24)}
          description="The low-profile strip — horizontal axis, sm density, bare titles; defaultValue 2 lights the first two stops."
          files={compactMilestoneFiles}
        >
          <div class="tl-frame {cx(tlDocs.wFull, tlDocs.oxAuto, tlDocs.p16)}">
            <Timeline axis="horizontal" defaultValue={2} density="sm" class={cx(tlDocs.minW30)}>
              {#each compactStops as stop (stop)}
                <TimelineItem>
                  <TimelineDot variant="round" />
                  <TimelineContent><TimelineTitle>{stop}</TimelineTitle></TimelineContent>
                </TimelineItem>
              {/each}
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
          <div class="tl-frame {cx(tlDocs.wFull, tlDocs.measure28, tlDocs.p24)}">
            <Timeline>
              <TimelineItem>
                <TimelineDot>
                  {#snippet blockStartInlineStart()}<span class={cx(tlDocs.micro)}>bsIs</span>{/snippet}
                  {#snippet blockStart()}<span>bs</span>{/snippet}
                  {#snippet blockStartInlineEnd()}<span class={cx(tlDocs.micro)}>bsIe</span>{/snippet}
                  {#snippet inlineStart()}<span>is</span>{/snippet}
                  {#snippet inlineEnd()}<span>ie</span>{/snippet}
                  {#snippet blockEndInlineStart()}<span class={cx(tlDocs.micro)}>beIs</span>{/snippet}
                  {#snippet blockEnd()}<span>be</span>{/snippet}
                  {#snippet blockEndInlineEnd()}<span class={cx(tlDocs.micro)}>beIe</span>{/snippet}
                </TimelineDot>
                <TimelineContent>
                  <TimelineTitle>free spatial composition</TimelineTitle>
                  <p class="tl-body">all eight slots authored at once — the dot stays the anchor</p>
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
        summary="One whole-list SVG layer paints the spine: connectors run dot-edge to dot-edge as per-gap subpaths of ONE path element (the axis never crosses a dot); dashed is a real stroke-dasharray whose phase anchors a dash START at the node's flow-end edge — at every density, because the anchor is measured; beam is a stroked gradient segment with actual width and soft edges. The spine prop takes a preset name or a custom snippet receiving the measured geometry payload."
      >
        <ComponentCanvas title="timeline · spine presets" stage="fill" files={timelinePresetsFiles}>
          <div class="tl-grid-3">
            <div class="tl-col">
              <span class="tl-eyebrow">plain (default) · one continuous run path</span>
              <Timeline spine="plain">
                <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>plain</TimelineTitle></TimelineContent></TimelineItem>
                <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>plain</TimelineTitle></TimelineContent></TimelineItem>
              </Timeline>
            </div>
            <div class="tl-col">
              <span class="tl-eyebrow">dashed · dash STARTS at the node edge</span>
              <Timeline spine="dashed">
                <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>alpha</TimelineTitle></TimelineContent></TimelineItem>
                <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>beta</TimelineTitle></TimelineContent></TimelineItem>
                <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>gamma</TimelineTitle></TimelineContent></TimelineItem>
              </Timeline>
            </div>
            <div class="tl-col">
              <span class="tl-eyebrow">beam · a traveling light with real width</span>
              <Timeline spine="beam">
                <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>live channel</TimelineTitle></TimelineContent></TimelineItem>
                <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>live channel</TimelineTitle></TimelineContent></TimelineItem>
              </Timeline>
            </div>
          </div>
        </ComponentCanvas>
        <ComponentCanvas
          title="timeline · custom geometry"
          stage="fill"
          class={cx(tlDocs.mt24)}
          description="The custom seam: a snippet receiving the measured TimelineSpineGeometry — node centers in list-root coordinates, per-segment path data, the stops table — rendering authored svg straight into the spine layer."
          files={timelineGeometryFiles}
        >
          <div class="tl-frame {cx(tlDocs.wFull, tlDocs.measure28, tlDocs.p24)}">
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
                {#each geometry.nodes as node (`${node.x}-${node.y}`)}
                  <circle cx={node.x} cy={node.y} r={geometry.nodeRadius + 3} fill="none" stroke="var(--primary)" stroke-width="1" opacity="0.4" />
                {/each}
              {/snippet}
              <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>authored spine</TimelineTitle></TimelineContent></TimelineItem>
              <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>authored spine</TimelineTitle></TimelineContent></TimelineItem>
            </Timeline>
          </div>
        </ComponentCanvas>
      </SectionCard>
    </div>

    <div id="value" data-reveal="">
      <SectionCard
        family="value"
        headerRegion="value"
        eyebrow="the value contract"
        title="the value contract — decimal progress + the controlled stepper"
        summary="One number owns the chronology: defaultValue seeds it, value controls it, onValueChange reports every change. Decimals are first-class — 1.5 completes item 1, not item 2, and paints the progress stroke halfway between nodes 1 and 2 (a 300ms dashoffset transition; reduced motion drops the transition, the position stays). The stepper drives the same number the reui demos do: next/prev step by whole milestones, random lands between them, and play tweens 1 → 6 through the fractional mid-states."
      >
        <ComponentCanvas
          title="timeline · value contract"
          stage="fill"
          files={valueFiles}
          output={[{ label: 'value', value: Number(stepperValue.toFixed(2)) }]}
        >
          <div class={cx(tlDocs.flex, tlDocs.wFull, tlDocs.col, tlDocs.gap16)}>
            <div class={cx(tlDocs.flex, tlDocs.wrap, tlDocs.itemsCenter, tlDocs.gap8)} data-stepper-controls="">
              <button
                type="button"
                data-testid="tl-step-prev"
                class="tl-ctl"
                onclick={stepPrev}>prev</button>
              <button
                type="button"
                data-testid="tl-step-next"
                class="tl-ctl"
                onclick={stepNext}>next</button>
              <button
                type="button"
                data-testid="tl-step-reset"
                class="tl-ctl"
                onclick={stepReset}>reset</button>
              <button
                type="button"
                data-testid="tl-step-random"
                class="tl-ctl"
                onclick={stepRandom}>random</button>
              <button
                type="button"
                data-testid="tl-tween-toggle"
                class="tl-ctl tl-ctl--primary"
                onclick={toggleTween}>{tweenOn ? 'pause' : 'play tween'}</button>
              <span class={cx(tlDocs.ml4, tlDocs.fontMono, tlDocs.textBase, tlDocs.tabular, tlDocs.fg)} data-testid="tl-value-readout">value = {stepperValue.toFixed(2)}</span>
            </div>
            <div class={cx(tlDocs.wFull, tlDocs.measure28)}>
              <Timeline value={stepperValue}>
                {#each Array(STEPS) as _, i (i)}
                  <TimelineItem>
                    <TimelineDot variant={i === Math.min(STEPS - 1, Math.floor(stepperValue) - 1) ? 'round' : undefined} />
                    <TimelineContent>
                      <TimelineTitle>step {i + 1}</TimelineTitle>
                      <p class="tl-body">{i + 1 <= stepperValue ? `≤ ${stepperValue.toFixed(2)} — complete` : `> ${stepperValue.toFixed(2)} — pending`}</p>
                    </TimelineContent>
                  </TimelineItem>
                {/each}
              </Timeline>
            </div>
          </div>
        </ComponentCanvas>
      </SectionCard>
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
          <div class="tl-grid-3">
            <div class="tl-col">
              <span class="tl-eyebrow">ltr (default)</span>
              <Timeline direction="ltr">
                <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>build</TimelineTitle></TimelineContent></TimelineItem>
                <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>test</TimelineTitle></TimelineContent></TimelineItem>
              </Timeline>
            </div>
            <div class="tl-col">
              <span class="tl-eyebrow">revert</span>
              <Timeline direction="revert">
                <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>build</TimelineTitle></TimelineContent></TimelineItem>
                <TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>test</TimelineTitle></TimelineContent></TimelineItem>
              </Timeline>
            </div>
            <div class="tl-col">
              <span class="tl-eyebrow">interlaced</span>
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

    <div id="matrix" data-reveal="">
      <SectionCard
        family="matrix"
        headerRegion="matrix"
        eyebrow="geometry"
        title="the geometry matrix — axis × direction × RTL in one coordinate space"
        summary="The measurement runtime emits node centers in list-root coordinates in FLOW order, with axis/direction/interlaced/rtl metadata; RTL resolves in the coordinate transform (physical geometry, logical chronology) — a horizontal RTL list draws its run right-to-left because the path starts at the chronologically-first node, with zero mirror branches. Every cell of the matrix carries a data-variant hook for the probe battery."
      >
        <div class="tl-grid-matrix">
          {#each matrixVariants as variant (variant.id)}
            <div dir={variant.rtl ? 'rtl' : undefined} class="tl-col" data-variant={variant.id}>
              <span class="tl-eyebrow">
                {variant.id}{variant.rtl ? ' · dir=rtl' : ''}
              </span>
              {#if variant.axis === 'horizontal'}
                <div class="tl-frame {cx(tlDocs.wFull, tlDocs.oxAuto, tlDocs.p12)}">
                  <Timeline axis="horizontal" direction={variant.direction} class={cx(tlDocs.minW26)}>
                    {#each matrixPhases as phase (phase)}
                      <TimelineItem>
                        <TimelineDot variant="round" />
                        <TimelineContent><TimelineTitle>{phase}</TimelineTitle></TimelineContent>
                      </TimelineItem>
                    {/each}
                  </Timeline>
                </div>
              {:else}
                <div class="tl-frame {cx(tlDocs.p12)}">
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
        summary="animation='view' gives every item a rise entrance as it enters the scrollport; animation='scroll' draws the progress stroke along the measured run path with the nearest scroller — a stroke-dashoffset draw-on that starts at the chronologically-first node (RTL needs no branch). Both are scroll-driven CSS (@supports-gated): engines without the timeline APIs render the final state, and reduced motion removes the decorative motion. Under scroll mode the scroller OWNS the stroke channel — the value contract still drives the discrete data-completed paint, but no value dashoffset is painted."
      >
        <ComponentCanvas title="timeline · animation" stage="fill" files={timelineAnimationFiles}>
          <div class={cx(tlDocs.flex, tlDocs.wFull, tlDocs.col, tlDocs.gap24)}>
            <div class="tl-col">
              <span class="tl-eyebrow">animation="scroll" · scroll this box</span>
              <div class="tl-frame {cx(tlDocs.maxH64, tlDocs.oyAuto, tlDocs.p24)}">
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
            <div class="tl-col">
              <span class="tl-eyebrow">animation="view"</span>
              <div class="tl-frame {cx(tlDocs.maxH64, tlDocs.oyAuto, tlDocs.p24)}">
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

    <div id="types" data-reveal=""><SectionCard eyebrow="types" title="Timeline anatomy" summary="Timeline is composition-first: header, item, dot (the 9-grid node), content, time, title and free-form body remain independent parts; the spine is a measured layer, never authored markup. The value contract and the per-item pending flag are ATTRIBUTE paint — the parts stay stateless."><ComponentCanvas title="timeline · anatomy" stage="start" files={timelineAnatomyFiles}><div class={cx(tlDocs.measure28)}><Timeline><TimelineHeader>release train</TimelineHeader><TimelineItem><TimelineDot>{#snippet blockStart()}<span>today</span>{/snippet}</TimelineDot><TimelineContent><TimelineTime datetime="2026-09-01">today</TimelineTime><TimelineTitle>released</TimelineTitle><p>Build promoted.</p></TimelineContent></TimelineItem></Timeline></div></ComponentCanvas></SectionCard></div>
    <div id="usage" data-reveal=""><SectionCard summary="The composition contract in one sample: import the family from the registry barrel (@ui/timeline/index — per-part targets exist per file), author one TimelineItem per entry with the parts you need. There is no items[] prop and no body snippet — the body is plain children. The value contract rides the root: defaultValue seeds, value controls, decimals included." eyebrow="usage" title="Usage"><CodeBlock code={usage} lang="svelte" meta="usage" /></SectionCard></div>
    <div id="accessibility" data-reveal=""><SectionCard eyebrow="a11y" title="Accessibility"><A11yTable aria={[{ name: 'ol', value: 'timeline list', description: 'Preserves chronological list semantics (role=list survives list-none).' }, { name: 'time', value: 'datetime', description: 'Provides machine-readable event time.' }, { name: 'aria-hidden', value: 'spine svg · dot · floor line', description: 'The drawn spine, the dots and the floor lines are decoration — the svg layer is pointer-transparent too. The cutout SLOTS are readable content — they carry text and are never hidden. The progress stroke is the same decorative layer: the value it paints is state, exposed through data-completed semantics on the items, never through the stroke alone.' }, { name: 'data-completed', value: 'step ≤ value', description: 'The value contract\'s discrete paint — a completed milestone is legible with styles off (the attribute is on the li), and the in-flight pending flag stays the louder per-item channel.' }] } /></SectionCard></div>
    <div id="theming" data-reveal=""><SectionCard eyebrow="theming" title="Density and tokens"><DensityDemo scopes={['xs', 'default', 'lg']}><Timeline defaultValue={2}><TimelineItem><TimelineDot /><TimelineContent><TimelineTitle>event</TimelineTitle></TimelineContent></TimelineItem></Timeline></DensityDemo><div class={cx(tlDocs.mt20)}><TokenTable tokens={[{ name: '--jx-tl-stroke-w', default: '1px', source: 'stroke-alignment law (r5): the spine strokes and the dot border share ONE weight' }, { name: '--jx-icon', default: 'density scale', source: 'density' }, { name: '--jx-stack', default: 'density scale', source: 'density' }, { name: '--jx-gap', default: 'density scale', source: 'density' }, { name: '--jx-inset', default: 'density scale', source: 'density' }, { name: '--jx-text', default: 'density scale', source: 'density' }, { name: '--jx-text-secondary', default: 'density scale', source: 'density' }, { name: '--jx-line', default: 'density scale', source: 'density' }, { name: '--jx-line-secondary', default: 'density scale', source: 'density' }] } /></div></SectionCard></div>
    <div id="api" data-reveal=""><SectionCard eyebrow="api" title="Timeline props"><PropsTable props={[{ name: 'defaultValue', type: 'number', default: '1', description: 'THE VALUE CONTRACT — the uncontrolled current step\'s seed (reui parity). Decimals are first-class and never rounded: 1.5 completes item 1, not item 2, and paints the progress stroke halfway between nodes 1 and 2.' }, { name: 'value', type: 'number', default: '—', description: 'The controlled current step — overrides the read side while setStep reports through onValueChange. The value maps onto the measured run through the STOPS milestone table as the progress stroke (300ms stroke-dashoffset transition; reduced motion drops the transition, the position stays). Under animation=\'scroll\' the scroller owns the stroke channel — the value then drives only the discrete data-completed paint.' }, { name: 'onValueChange', type: '(v: number) => void', default: '—', description: 'Fires on every setStep change — same-value repeats included (reui\'s exact semantics; the consumer decides what changed).' }, { name: 'step (TimelineItem)', type: 'number', default: 'DOM order + 1', description: 'The item\'s declared ladder position. Strictly ascending in DOM order — a duplicate is owned by its later item (dev-warned); the milestone table dedupes for the stroke math while both items keep the discrete completed paint. Declared gaps (e.g. 1 then 4) interpolate across the gap\'s arc.' }, { name: 'axis', type: "'vertical' | 'horizontal'", default: "'vertical'", description: 'The flow axis; the engine transposes, slot names stay logical.' }, { name: 'direction', type: "'ltr' | 'revert' | 'interlaced'", default: "'ltr'", description: 'Which zone(s) content takes; interlaced alternates item by item.' }, { name: 'animation', type: "'none' | 'view' | 'scroll'", default: "'none'", description: 'view = per-item entrance as it enters the scrollport; scroll = the progress stroke draws on with the nearest scroller (the scroller then OWNS the stroke; the value keeps the discrete paint). Both @supports-gated.' }, { name: 'spine', type: "'plain' | 'dashed' | 'beam' | Snippet<[TimelineSpineGeometry]>", default: "'plain'", description: 'The drawn spine: a preset by name, or a custom snippet receiving the measured geometry payload (node centers in list-root coordinates in flow order · axis/direction/interlaced/rtl metadata · per-segment path data with the dot-edge phase anchor · the STOPS table + pathLength · the density scale). The snippet renders inside the spine svg — author path/circle/… directly. BREAKING successor of the retired line(i) seam.' }, { name: 'density', type: 'Density', default: 'ambient scope', description: 'Explicit override of the ambient density scope; no opinion stamps nothing and the ambient css scope channel flows.' }, { name: 'pending (TimelineItem)', type: 'boolean', default: 'false', description: 'In-flight entry: hollow dot + muted title (attribute paint — the LOUDER channel, winning over data-completed while both stay legible with styles off).' }, { name: 'variant', type: "'square' | 'round' | 'ring'", default: "'square' · Own default, not ambient", description: 'TimelineDot corner grammar. Defaults: literal slot — own ’square’, not ambient (the dot is outside the paint zone’s frozen availability table). Dot children (the icon/avatar pattern) render INSIDE the node — centered, the node grows around them, the min size keeps.' }, { name: 'class', type: 'string', description: 'Adds consumer classes (lands on the grid host — the component root).' }] } /></SectionCard></div>
  </div>
</div>

<style>
  /*
   * The timeline docs page's lane-2 sheet (tailwindless-site P0 task
   * 3.3, 2026-09-17) — REGISTERED semantic composites, scoped to this
   * route (Svelte scoping IS the sheet's scope: nothing here is
   * consumable outside the page, the blueprints.html bp-stage site
   * precedent; single-concern paint stays in the page's atom module,
   * $lib/surface/timeline-docs.stylex.ts). The registry of record is
   * the tailwindless gate's semantics[] (scripts/
   * verify-tailwindless.mjs SEMANTIC_RULES) — owner + selector family
   * + declaration scope per rule. Theme-able values ride the site
   * voice scale (jixoai.css "The site voice scale" segment); the
   * media-query THRESHOLDS are structural (Tailwind's own px/rem
   * seam values, kept verbatim for breakpoint parity — a viewport-
   * owned seam stays a viewport media rule, not a container query,
   * so the 1099/1100 flip lands exactly where the utility did).
   *
   * Intents (orthogonal count: 4):
   *   1. .tl-shell — the page shell measure + rhythm (sm/lg media
   *      seams re-pin the inline padding step).
   *   2. .tl-eyebrow / .tl-body — the page's two fixed voices
   *      (label, body).
   *   3. .tl-col / .tl-frame / .tl-grid-3 / .tl-grid-matrix — the
   *      demo-stage geometry (label-over-stage column, hairline
   *      frame, responsive grids with their min-1100 / min-900 +
   *      min-1300 media seams).
   *   4. .tl-ctl — the stepper control (hover seams as NATIVE
   *      pseudos; --primary variant).
   */
  .tl-shell {
    margin-inline: auto;
    width: 100%;
    max-width: var(--shell-w);
    padding-inline: var(--space-16);
    padding-block: var(--space-40);
  }
  @media (min-width: 40rem) {
    .tl-shell {
      padding-inline: var(--space-24);
    }
  }
  @media (min-width: 64rem) {
    .tl-shell {
      padding-inline: var(--space-32);
    }
  }

  .tl-eyebrow {
    font-family: var(--font-nav);
    color: var(--primary);
    font-size: var(--text-label);
    text-transform: uppercase;
    letter-spacing: var(--track-label);
  }

  .tl-body {
    font-size: var(--text-small);
    color: var(--muted-foreground);
  }

  .tl-col {
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
  }

  .tl-frame {
    border: var(--hairline) solid var(--border);
  }

  .tl-grid-3,
  .tl-grid-matrix {
    display: grid;
    gap: var(--space-24);
  }
  @media (min-width: 900px) {
    .tl-grid-matrix {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  @media (min-width: 1100px) {
    .tl-grid-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
  @media (min-width: 1300px) {
    .tl-grid-matrix {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  .tl-ctl {
    border-radius: var(--radius);
    border: var(--hairline) solid var(--border);
    background: var(--background);
    padding-inline: var(--space-10);
    padding-block: var(--space-4);
    font-family: var(--font-nav);
    font-size: var(--text-label-lg);
    text-transform: uppercase;
    letter-spacing: var(--track-wide);
    color: var(--foreground);
  }
  .tl-ctl:hover {
    background: var(--muted);
  }
  .tl-ctl--primary {
    border-color: var(--primary);
    background: var(--primary);
    color: var(--primary-foreground);
  }
  .tl-ctl--primary:hover {
    opacity: 0.9;
  }
</style>
