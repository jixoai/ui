<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import Result from '$lib/ui/result/result.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import resultSource from '$lib/ui/result/result.svelte?raw';

  const close = '</' + 'script>';

  const usage = `<Result status="success" title="Deployed" description="build 4f2a is live">
  {#snippet actions()}<PressButton href="/">view site</PressButton>{/snippet}
</Result>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/result.svelte', content: resultSource },
    { name: 'src/lib/ui/result-usage.svelte', content: usage },
  ];

  // ToC outline: pairs with the section ids below, in page order.
</script>

<svelte:head>
  <title>Result · jixoai-ui</title>
  <meta name="description" content="Status glyph + title + description + actions — no routing logic, no illustration system. empty is not result: no-data vs operation-outcome stay different components." />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>

  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard headingLevel={1} tone="hero" eyebrow="registry:ui · antd 裁决" title="result — the thin outcome surface" summary="Status glyph + title + description + actions — no routing logic, no illustration system. empty is not result: no-data vs operation-outcome stay different components.">
        <div class="flex flex-wrap gap-3">
          <span class="pill">success · error · warning · info</span>
          <span class="pill">actions snippet</span>
          <span class="pill">empty is not result</span>
        </div>
      </SectionCard>
    </div>

  <div data-reveal="">
    <ComponentCanvas
      title="result"
      description="result — the thin outcome surface"
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/result.svelte"
      files={canvasFiles}
      stage="fill"
    >
      <div class="grid gap-6 min-[720px]:grid-cols-2">
        <div class="border border-border bg-card">
          <Result status="success" title="Deployed" description="Build 4f2a is live — 12 checks green.">
            {#snippet actions()}<PressButton href="/docs/components.html">view components</PressButton>{/snippet}
          </Result>
        </div>
        <div class="border border-border bg-card">
          <Result status="error" title="Build failed" description="The bundle exceeded the size budget by 12 KB.">
            {#snippet actions()}<PressButton variant="outline">view log</PressButton>{/snippet}
          </Result>
        </div>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            success paints through the brand voice (no green in this language); error destructive;
            warning/info stay neutral. empty is the sibling state, not a variant.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="result-base" data-reveal="">
    <SectionCard family="result-base" headerRegion="result-base" eyebrow="law" title="Usage">
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
  <div id="types" data-reveal=""><SectionCard eyebrow="types" title="Outcome states" summary="Result distinguishes success, error, warning and info without taking over routing or recovery logic."><div class="grid gap-4 md:grid-cols-2"><Result status="success" title="Deployed" /><Result status="error" title="Build failed" /></div></SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard eyebrow="usage" title="Usage"><CodeBlock code={usage} lang="svelte" meta="usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard eyebrow="a11y" title="Accessibility"><A11yTable aria={[{ name: 'status', value: 'visible glyph and title', description: 'Status is communicated with text, not color alone.' }, { name: 'actions', value: 'native controls', description: 'Keep recovery actions keyboard reachable.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard eyebrow="theming" title="Density and tokens"><DensityDemo scopes={['xs', 'default', 'lg']}><Result status="info" title="No changes" /></DensityDemo><div class="mt-5"><TokenTable tokens={[{ name: '--jx-gap', default: 'density scale', source: 'density' }, { name: '--jx-stack', default: 'density scale', source: 'density' }, { name: '--jx-inset', default: 'density scale', source: 'density' }, { name: '--jx-icon', default: 'density scale', source: 'density' }, { name: '--jx-text', default: 'density scale', source: 'density' }, { name: '--jx-line', default: 'density scale', source: 'density' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard eyebrow="api" title="Result props"><PropsTable props={[{ name: 'title', type: 'string', description: 'Outcome heading.', required: true }, { name: 'status', type: "'success' | 'error' | 'warning' | 'info'", default: "'info'", description: 'Outcome tone and glyph.' }, { name: 'description', type: 'string', description: 'Optional supporting copy.' }, { name: 'icon', type: 'Snippet', description: 'Replaces the default glyph.' }, { name: 'actions', type: 'Snippet', description: 'Renders next steps.' }, { name: 'density', type: 'Density', description: 'Overrides inherited density.' }]} /></SectionCard></div>
  </div>
</div>
