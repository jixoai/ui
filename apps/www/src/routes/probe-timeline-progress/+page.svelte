<script lang="ts">
  import { onMount } from 'svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import Timeline, {
    TimelineItem,
    TimelineDot,
    TimelineContent,
    TimelineTime,
    TimelineTitle,
  } from '$lib/ui/timeline';

  // hydration readiness stamp for timeline-progress-probe.mjs — the
  // gate the stroke measurements wait on (pre-hydration DOM measures
  // stale geometry, the probe-popover-area precedent)
  let hydrated = $state(false);
  onMount(() => {
    hydrated = true;
  });

  // arm B — the decimal tween: value 1 → 3 over ~1.2s (rAF), driving
  // the inline dashoffset through the 1.5-style mid-states
  let tweenValue = $state(1);
  let tweening = false;
  function runTween() {
    if (tweening) return;
    tweening = true;
    const start = performance.now();
    const dur = 1200;
    const from = 1;
    const to = 3;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / dur);
      tweenValue = from + (to - from) * p;
      if (p < 1) requestAnimationFrame(tick);
      else tweening = false;
    };
    requestAnimationFrame(tick);
  }

  // arm C — the duplicate-first ladder (declared steps 1, 1, 2): the
  // LATER node owns the duplicated milestone (value 1 → node 2's arc)
  let dupValue = $state(0.5);

  // the page's local join (the separator serialize law): plain
  // strings pass through whole; stylex objects contribute their
  // string members ($$css dropped).
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<svelte:head>
  <title>Timeline progress probe · jixoai-ui</title>
  <!-- internal verification surface (research/w3/timeline-progress-probe.mjs) — never indexed -->
  <meta name="robots" content="noindex" />
</svelte:head>

<main class={cx(rt.ptpPad)} data-hydrated={hydrated ? '1' : '0'}>
  <h1 class={cx(rt.mb16, rt.textLg, rt.semibold)}>W3 timeline progress probe</h1>

  <!-- arm A — the fractional midpoint: value 1.5 on the default ladder -->
  <section data-arm="a" class={cx(rt.ptpMb40, rt.maxWMd)}>
    <h2 class={cx(rt.mb8, rt.medium)}>A · value=1.5 (default ladder)</h2>
    <Timeline value={1.5}>
      <TimelineItem>
        <TimelineDot />
        <TimelineContent>
          <TimelineTime datetime="2026-09-15T07:02:00Z">07:02</TimelineTime>
          <TimelineTitle>pushed</TimelineTitle>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineDot />
        <TimelineContent>
          <TimelineTime datetime="2026-09-15T08:14:00Z">08:14</TimelineTime>
          <TimelineTitle>audited</TimelineTitle>
        </TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineDot />
        <TimelineContent>
          <TimelineTime datetime="2026-09-15T09:30:00Z">09:30</TimelineTime>
          <TimelineTitle>shipped</TimelineTitle>
        </TimelineContent>
      </TimelineItem>
    </Timeline>
  </section>

  <!-- arm B — the tween: dashoffset animates frame over frame -->
  <section data-arm="b" class={cx(rt.ptpMb40, rt.maxWMd)}>
    <h2 class={cx(rt.mb8, rt.medium)}>B · tween 1 → 3</h2>
    <button data-testid="tween-run" class={cx(rt.mb8, rt.radius0, rt.frame, rt.px8, rt.py4, rt.textSm)} onclick={runTween}>
      run tween
    </button>
    <Timeline value={tweenValue}>
      <TimelineItem>
        <TimelineDot />
        <TimelineContent><TimelineTitle>one</TimelineTitle></TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineDot />
        <TimelineContent><TimelineTitle>two</TimelineTitle></TimelineContent>
      </TimelineItem>
      <TimelineItem>
        <TimelineDot />
        <TimelineContent><TimelineTitle>three</TimelineTitle></TimelineContent>
      </TimelineItem>
    </Timeline>
  </section>

  <!-- arm C — the duplicate-first ladder (steps 1, 1, 2) -->
  <section data-arm="c" class={cx(rt.ptpMb40, rt.maxWMd)}>
    <h2 class={cx(rt.mb8, rt.medium)}>C · duplicate-first (1,1,2)</h2>
    <div class={cx(rt.mb8, rt.row8, rt.textSm)}>
      <button data-testid="dup-set-05" class={cx(rt.radius0, rt.frame, rt.px8, rt.py4)} onclick={() => (dupValue = 0.5)}>
        value 0.5
      </button>
      <button data-testid="dup-set-1" class={cx(rt.radius0, rt.frame, rt.px8, rt.py4)} onclick={() => (dupValue = 1)}>
        value 1
      </button>
    </div>
    <Timeline value={dupValue}>
      <TimelineItem step={1}>
        <TimelineDot />
        <TimelineContent><TimelineTitle>dup-a</TimelineTitle></TimelineContent>
      </TimelineItem>
      <TimelineItem step={1}>
        <TimelineDot />
        <TimelineContent><TimelineTitle>dup-b (owner)</TimelineTitle></TimelineContent>
      </TimelineItem>
      <TimelineItem step={2}>
        <TimelineDot />
        <TimelineContent><TimelineTitle>last</TimelineTitle></TimelineContent>
      </TimelineItem>
    </Timeline>
  </section>

  <!-- arm D — scroll owns the stroke channel: NO value dashoffset inline -->
  <section data-arm="d" class={cx(rt.maxWMd)}>
    <h2 class={cx(rt.mb8, rt.medium)}>D · animation='scroll'</h2>
    <div class={cx(rt.ptpScroll, rt.radius0, rt.frame, rt.p16)} data-scroller>
      <Timeline animation="scroll">
        <TimelineItem>
          <TimelineDot />
          <TimelineContent><TimelineTitle>alpha</TimelineTitle></TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineDot />
          <TimelineContent><TimelineTitle>beta</TimelineTitle></TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineDot />
          <TimelineContent><TimelineTitle>gamma</TimelineTitle></TimelineContent>
        </TimelineItem>
        <TimelineItem>
          <TimelineDot />
          <TimelineContent><TimelineTitle>delta</TimelineTitle></TimelineContent>
        </TimelineItem>
      </Timeline>
    </div>
  </section>
</main>
