<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import Result from '$lib/ui/result/result.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

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
    >
      <div class="grid gap-6 min-[720px]:grid-cols-2">
        <div class="border border-border bg-card">
          <Result status="success" title="Deployed" description="Build 4f2a is live — 12 checks green.">
            {#snippet actions()}<PressButton href="/components.html">view components</PressButton>{/snippet}
          </Result>
        </div>
        <div class="border border-border bg-card">
          <Result status="error" title="Build failed" description="The bundle exceeded the size budget by 12 KB.">
            {#snippet actions()}<PressButton variant="outline">view log</PressButton>{/snippet}
          </Result>
        </div>
      </div>
      {#snippet playground()}
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          success paints through the brand voice (no green in this language); error destructive; warning/info stay neutral. empty is the sibling state, not a variant.
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="result-base" data-reveal="">
    <SectionCard family="result-base" headerRegion="result-base" eyebrow="law" title="Usage">
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
  </div>
</div>
