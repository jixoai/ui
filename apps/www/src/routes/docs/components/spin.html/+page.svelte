<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import Spin from '$lib/ui/spin/spin.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import spinSource from '$lib/ui/spin/spin.svelte?raw';

  const close = '</' + 'script>';

  const usage = `<Spin label="loading checks" />
<Spin label="syncing">…content…</Spin>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/spin.svelte', content: spinSource },
    { name: 'src/lib/ui/spin-usage.svelte', content: usage },
  ];

  // ToC outline: pairs with the section ids below, in page order.
</script>

<svelte:head>
  <title>Spin · jixoai-ui</title>
  <meta name="description" content="The bracket cursor cycling frames under role=status. Wrapping posture: an aria-busy container whose scrim OWNS pointer events — never a visual mask over live hit areas." />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>

  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard headingLevel={1} tone="hero" eyebrow="registry:ui · antd 裁决" title="spin — the terminal cursor" summary="The bracket cursor cycling frames under role=status. Wrapping posture: an aria-busy container whose scrim OWNS pointer events — never a visual mask over live hit areas.">
        <div class="flex flex-wrap gap-3">
          <span class="pill">role=status frames</span>
          <span class="pill">aria-busy wrap posture</span>
          <span class="pill">scrim owns pointers</span>
        </div>
      </SectionCard>
    </div>

  <div data-reveal="">
    <ComponentCanvas
      title="spin"
      description="spin — the terminal cursor"
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/spin.svelte"
      files={canvasFiles}
      stage="center"
    >
      <div class="flex flex-col gap-6">
        <Spin label="loading checks" />
        <div class="w-full max-w-md border border-border bg-card p-4">
          <Spin label="syncing registry">
            <dl class="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 text-[13px]">
              <dt class="text-muted-foreground">items</dt><dd class="tabular-nums">69</dd>
              <dt class="text-muted-foreground">runtime deps</dt><dd class="tabular-nums">0</dd>
            </dl>
          </Spin>
        </div>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            bare = the inline glyph; wrapping = aria-busy content with the scrim intercepting
            pointers (loading is not disabled — the state says busy, the interactions stop anyway).
            reduced-motion freezes on the first frame.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="spin-base" data-reveal="">
    <SectionCard family="spin-base" headerRegion="spin-base" eyebrow="law" title="Usage">
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Types" summary="Two postures: the bare inline glyph, and the wrapping container that blocks interaction while busy.">
    <div class="flex flex-wrap items-start gap-6">
      <div class="flex min-w-52 flex-col gap-3 border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">bare · inline glyph</span><Spin label="loading checks" /><span class="text-muted-foreground text-[12.5px]">the bracket cursor cycling frames under role=status</span></div>
      <div class="flex min-w-52 flex-col gap-3 border border-border p-4"><span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">wrapping · container</span><div class="border border-border bg-card p-4"><Spin label="syncing"><p class="text-[13px]">wrapped content — scrim owns pointers</p></Spin></div><span class="text-muted-foreground text-[12.5px]">aria-busy container; loading is not disabled, interactions stop anyway</span></div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Bare for an inline busy glyph; wrap content to declare the whole region busy."><CodeBlock code={usage} lang="svelte" meta="Spin usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="role=status is polite by construction — loading is never an alert; the scrim stops pointers without disabling anything."><A11yTable keys={[]} aria={[{ name: 'role', value: 'status', description: 'Polite live region — announced when the reader is idle, never assertive' }, { name: 'aria-label', value: 'label prop', description: 'Announced to assistive tech ("loading", "loading checks"…)' }, { name: 'aria-busy', value: '"true"', description: 'On the wrapping container posture' }, { name: 'aria-hidden', value: 'true', description: 'On the decorative cursor frames themselves' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Theming" summary="Terminal paint: mono frames in the primary hue; the popover-tinted status pill; reduced motion freezes on the first frame."><div class="flex flex-col gap-6"><DensityDemo><Spin label="loading checks" /></DensityDemo><TokenTable tokens={[{ name: 'frames', default: '/ — \\ | · 800ms steps(1)', source: 'component', description: 'Four glyphs on a stepped timeline; prefers-reduced-motion freezes on the first frame' }, { name: '--primary', default: 'cursor hue', source: 'color' }, { name: 'bg-popover', default: 'status pill fill', source: 'color' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props from the Spin Props interface — a label, an optional children snippet, a class."><PropsTable props={[{ name: 'label', type: 'string', default: "'loading'", description: 'Announced to assistive tech ("loading checks").' }, { name: 'children', type: 'Snippet', default: '—', description: 'Wrapping content = container posture with scrim + aria-busy.' }, { name: 'class', type: 'string', default: "''", description: 'Class passthrough to the root.' }]} /></SectionCard></div>
</div>
