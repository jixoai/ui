<!--
  Docs page for statistic (openspec 2026-08-30-table-grid-toolbar, on
  top of the 2026-08-25 base).

  docs-demo-standard skeleton: Intro → Install → live demo (the trend
  readouts) → Usage (the ONE h2) → Examples (ability-named recipes:
  the countdown, the affix + precision matrix) → Accessibility →
  Theming → API → See also.

  Composition law: the component renders the VALUE you hand it — the
  countdown is page-owned time state (a 1s interval over remaining ms,
  mm:ss formatting, a finished flag) and precision is the caller's
  Intl.NumberFormat law. A first-class countdown item (antd's
  Statistic.Countdown) is recorded in the change's followups.md.
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import Badge from '$lib/ui/badge/badge.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import Statistic from '$lib/ui/statistic/statistic.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { onDestroy } from 'svelte';
  import { PlayFields, PlayRow, PlaySegmented, PlayHelp } from '$lib/playground';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import statisticSource from '$lib/ui/statistic/statistic.svelte?raw';

  const close = '</' + 'script>';

  const usage = `<Statistic title="deploys / week" value="42" trend="up" />`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/statistic.svelte', content: statisticSource },
    { name: 'src/lib/ui/statistic-usage.svelte', content: usage },
  ];

  // ---- recipe: the countdown ----------------------------------------------
  // Page-owned time state under the readout: a 1s interval over remaining
  // ms, mm:ss formatting, a finished flag. The component renders whatever
  // value it is handed — the tick law is the composition.
  const countdownInitial = { durationMs: 90_000, remainingMs: 90_000, running: false, finished: false };
  let durationMs = $state(countdownInitial.durationMs);
  let remainingMs = $state(countdownInitial.remainingMs);
  let running = $state(countdownInitial.running);
  let finished = $state(countdownInitial.finished);
  let timer: ReturnType<typeof setInterval> | undefined;

  function startCountdown(): void {
    if (running) return;
    running = true;
    timer = setInterval(() => {
      remainingMs = Math.max(0, remainingMs - 1_000);
      if (remainingMs === 0) {
        stopCountdown();
        finished = true;
      }
    }, 1_000);
  }
  function stopCountdown(): void {
    running = false;
    if (timer !== undefined) {
      clearInterval(timer);
      timer = undefined;
    }
  }
  function resetCountdown(): void {
    stopCountdown();
    remainingMs = durationMs;
    finished = false;
  }
  // the interval dies with the page — never a leaked ticker
  onDestroy(stopCountdown);

  const mmss = $derived(
    `${String(Math.floor(remainingMs / 60_000)).padStart(2, '0')}:${String(Math.floor((remainingMs % 60_000) / 1_000)).padStart(2, '0')}`,
  );

  const countdownUsage = `<script lang="ts">
  // the countdown, composed: the component renders the value; the tick
  // law is page state (a first-class countdown item is the recorded
  // followup).
  let durationMs = $state(90_000);
  let remainingMs = $state(durationMs);
  let running = $state(false);
  let finished = $state(false);
  let timer;

  function start() {
    if (running) return;
    running = true;
    timer = setInterval(() => {
      remainingMs = Math.max(0, remainingMs - 1_000);
      if (remainingMs === 0) { stop(); finished = true; }
    }, 1_000);
  }
  function stop() {
    running = false;
    clearInterval(timer);
  }
  const mmss = $derived(
    String(Math.floor(remainingMs / 60_000)).padStart(2, '0')
    + ':' + String(Math.floor((remainingMs % 60_000) / 1_000)).padStart(2, '0'));
${close}

<div class="flex items-end gap-4">
  <Statistic title="deploy window closes in" value={mmss} />
  {#if finished}<Badge variant="fill">window closed</Badge>{/if}
</div>
<div class="flex gap-2">
  <PressButton variant="outline" onclick={start} disabled={running || finished}>start</PressButton>
  <PressButton variant="ghost" onclick={stop} disabled={!running}>pause</PressButton>
  <PressButton variant="ghost" onclick={reset}>reset</PressButton>
</div>
<p class="sr-only" aria-live="polite">{finished ? 'window closed' : ''}</p>`;

  // ---- recipe: the affix + precision matrix --------------------------------
  const raw = 1234.5;
  const precisionOptions = [0, 2, 3].map((digits) => ({ value: String(digits), label: `${digits}` }));
  let digitsOption = $state('2');
  const digits = $derived(Number(digitsOption));
  const precise = $derived(
    new Intl.NumberFormat('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(raw),
  );

  const affixUsage = `<script lang="ts">
  // formatting is the caller's law: Intl.NumberFormat decides the digits,
  // the prefix/suffix snippets decide the glyphs.
  const raw = 1234.5;
  let digits = $state(2);
  const precise = $derived(new Intl.NumberFormat('en-US',
    { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(raw));
${close}

<!-- prefix/suffix are SNIPPETS: any glyph, any paint -->
<Statistic title="revenue / mo" value={precise}>
  {#snippet prefix()}<span class="text-muted-foreground">$</span>{/snippet}
  {#snippet suffix()}<span class="text-muted-foreground">USD</span>{/snippet}
</Statistic>
<Statistic title="cache hit rate" value="97.4">
  {#snippet suffix()}<span class="text-muted-foreground">%</span>{/snippet}
</Statistic>`;
</script>

<svelte:head>
  <title>Statistic · jixoai-ui</title>
  <meta name="description" content="Micro-label over a big tabular-nums value with prefix/suffix snippets and text-glyph trends. The component never guesses what good means for your metric — you compose it. Recipes: the countdown (page-owned tick law) and the affix + precision matrix." />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>

  <div class="flex min-w-0 flex-col gap-8">
  <div data-reveal="">
    <SectionCard headingLevel={1} tone="hero" eyebrow="registry:ui · General" title="statistic — the metric readout" summary="Micro-label over a big tabular-nums value with prefix/suffix snippets and text-glyph trends. The component never guesses what good means for your metric — you compose it.">
        <div class="flex flex-wrap gap-3">
          <span class="pill">tabular-nums value</span>
          <span class="pill">prefix/suffix snippets</span>
          <span class="pill">text-glyph trends</span>
          <span class="pill">countdown · precision recipes</span>
        </div>
      </SectionCard>
    </div>

  <!-- install -->
  <div id="install" data-reveal="">
    <SectionCard
      family="install"
      headerRegion="install"
      eyebrow="install"
      title="Install"
      summary="One zero-dependency item; the recipes below add press-button (controls) and badge (the finished flag)."
    >
      <CodeBlock code={`npx jixoai-ui add statistic`} lang="sh" meta="install" />
    </SectionCard>
  </div>

  <div id="statistic-demo" data-region="statistic-demo" data-family="statistic-demo" data-reveal="">
    <ComponentCanvas
      title="statistic"
      description="statistic — the metric readout: micro-label over a big tabular-nums value, trends as text glyphs."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/statistic.svelte"
      files={canvasFiles}
      stage="fill"
    >
      <div class="grid gap-6 min-[560px]:grid-cols-3">
        <Statistic title="deploys / week" value="42" trend="up" />
        <Statistic title="failed builds" value="3" trend="down" />
        <Statistic title="registry items" value="69" />
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            up paints the up-triangle through the brand voice, down the down-triangle destructive —
            if down is GOOD for your metric (cost, latency), compose your own glyphs through the
            snippets.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <!-- usage: the ONE h2 -->
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="The value is yours — strings or numbers render verbatim; formatting happens before the component."><CodeBlock code={usage} lang="svelte" meta="usage" /></SectionCard></div>

  <!-- examples -->
  <div id="examples" data-reveal="">
    <SectionCard
      family="examples"
      headerRegion="examples"
      eyebrow="examples"
      title="Examples"
      summary="Ability-named recipes: the countdown and the affix + precision matrix."
    >
      <p class="m-0 text-[13px] leading-6 text-muted-foreground">
        Both recipes compose the public value/snippet surface — the component renders what it is
        handed, the tick and the digits are page law (a first-class countdown item is the
        recorded followup).
      </p>
    </SectionCard>
  </div>

  <!-- recipe: the countdown -->
  <div id="statistic-countdown" data-region="statistic-countdown" data-family="statistic-countdown" data-reveal="">
    <ComponentCanvas
      title="with countdown"
      description="A 90-second deploy window ticking in mm:ss — start it, pause it, reset it. The tabular-nums face keeps every frame the same width, so the digits flip in place without a single layout shift."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/statistic.svelte"
      files={[
        { name: 'registry/files/ui/statistic.svelte', content: statisticSource },
        { name: 'src/lib/ui/statistic-countdown-usage.svelte', content: countdownUsage, kind: 'usage' },
      ]}
      stage="fill"
      onreset={resetCountdown}
      output={[
        { label: 'remaining', value: mmss },
        { label: 'state', value: finished ? 'finished' : running ? 'running' : 'idle' },
      ]}
    >
      <div class="flex flex-col gap-4">
        <div class="flex flex-wrap items-end gap-4">
          <Statistic title="deploy window closes in" value={mmss} />
          {#if finished}<Badge variant="fill">window closed</Badge>{/if}
        </div>
        <div class="flex flex-wrap gap-2">
          <PressButton variant="outline" onclick={startCountdown} disabled={running || finished}>start</PressButton>
          <PressButton variant="ghost" onclick={stopCountdown} disabled={!running}>pause</PressButton>
          <PressButton variant="ghost" onclick={resetCountdown}>reset</PressButton>
        </div>
        <p class="m-0 font-mono text-[11.5px] text-muted-foreground">
          {finished ? 'the window closed — reset to re-arm' : running ? 'ticking · 1s interval' : 'idle'}
        </p>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            The component owns the FACE, the page owns TIME: a 1s setInterval over remaining ms,
            Math.max(0, …) clamps the floor, the finished flag fires once at 00:00 and the
            interval clears — never ticking past zero. The sr-only live region announces the
            close, not every tick.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- recipe: the affix + precision matrix -->
  <div id="statistic-affix-precision" data-region="statistic-affix-precision" data-family="statistic-affix-precision" data-reveal="">
    <ComponentCanvas
      title="with prefix, suffix and precision"
      description="One raw number (1234.5) through the affix + precision matrix: the segmented control re-formats the digits live (Intl.NumberFormat), the prefix/suffix snippets carry the glyphs."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/statistic.svelte"
      files={[
        { name: 'registry/files/ui/statistic.svelte', content: statisticSource },
        { name: 'src/lib/ui/statistic-affix-usage.svelte', content: affixUsage, kind: 'usage' },
      ]}
      stage="fill"
      output={[
        { label: 'raw', value: raw },
        { label: 'digits', value: digits },
      ]}
    >
      <div class="grid gap-6 min-[720px]:grid-cols-3">
        <Statistic title="revenue / mo" value={precise}>
          {#snippet prefix()}<span class="text-muted-foreground">$</span>{/snippet}
          {#snippet suffix()}<span class="text-muted-foreground">USD</span>{/snippet}
        </Statistic>
        <Statistic title="cache hit rate" value="97.4">
          {#snippet suffix()}<span class="text-muted-foreground">%</span>{/snippet}
        </Statistic>
        <Statistic title="p95 latency" value={precise}>
          {#snippet suffix()}<span class="text-muted-foreground">ms</span>{/snippet}
        </Statistic>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayRow label="precision" hint="minimumFractionDigits">
            <PlaySegmented bind:value={digitsOption} options={precisionOptions} />
          </PlayRow>
          <PlayHelp>
            Formatting is the caller's law: Intl.NumberFormat decides grouping and digits BEFORE
            the value reaches the component, so the readout stays a string the platform can
            copy. The affixes are snippets — muted by the component's own affix paint, any glyph
            you like.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="types" data-reveal=""><SectionCard eyebrow="types" title="Metric states" summary="The readout supports neutral metrics, directional trends and composed affixes."><div class="grid gap-4 sm:grid-cols-3"><Statistic title="neutral" value="69" /><Statistic title="up" value="42" trend="up" /><Statistic title="down" value="3" trend="down" /></div></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard eyebrow="a11y" title="Accessibility"><A11yTable aria={[{ name: 'title', value: 'visible label', description: 'Names the metric for every reader.' }, { name: 'value', value: 'text content', description: 'Keeps formatted values readable and copyable.' }, { name: 'aria-live (recipe)', value: 'polite, one-shot', description: 'The countdown announces the CLOSE, never every tick — a ticking live region is noise.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard eyebrow="theming" title="Density and tokens"><DensityDemo scopes={['xs', 'default', 'lg']}><Statistic title="deploys" value="42" trend="up" /></DensityDemo><div class="mt-5"><TokenTable tokens={[{ name: '--jx-stack', default: 'density scale', source: 'density' }, { name: '--jx-gap', default: 'density scale', source: 'density' }, { name: '--jx-text', default: 'density scale', source: 'density' }, { name: '--jx-text-secondary', default: 'density scale', source: 'density' }, { name: '--jx-line', default: 'density scale', source: 'density' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard eyebrow="api" title="Statistic props"><PropsTable props={[{ name: 'title', type: 'string', description: 'Metric label.', required: true }, { name: 'value', type: 'string | number', description: 'Displayed metric value (format before it reaches the component).', required: true }, { name: 'trend', type: "'up' | 'down'", description: 'Optional directional glyph.' }, { name: 'prefix', type: 'Snippet', description: 'Content before the value.' }, { name: 'suffix', type: 'Snippet', description: 'Content after the value.' }, { name: 'density', type: 'Density', default: 'ambient scope', description: 'Explicit override of the ambient density scope; no opinion stamps nothing and the ambient css scope channel flows.' }]} /></SectionCard></div>

  <div id="see-also" data-reveal="">
    <SectionCard
      family="see-also"
      headerRegion="see-also"
      eyebrow="see also"
      title="See also"
      summary="The readouts and surfaces statistic composes with."
    >
      <div class="flex flex-wrap gap-3">
        <a class="pill" href="/docs/components/descriptions.html">descriptions — the detail view</a>
        <a class="pill" href="/docs/components/badge.html">badge — the finished flag</a>
        <a class="pill" href="/docs/components/press-button.html">press-button — the countdown controls</a>
        <a class="pill" href="/docs/components/table.html">table — the tasks readouts</a>
      </div>
    </SectionCard>
  </div>
</div>
