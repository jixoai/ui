<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import Spin from '$lib/ui/spin.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import type { TreeFile } from '$lib/ui/tree-view.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import spinSource from '$lib/ui/spin.svelte?raw';

  const close = '</' + 'script>';

  const usage = `<Spin label="loading checks" />
<Spin label="syncing">…content…</Spin>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/spin.svelte', content: spinSource },
  ];
</script>

<svelte:head>
  <title>Spin · jixoai-ui</title>
  <meta name="description" content="The bracket cursor cycling frames under role=status. Wrapping posture: an aria-busy container whose scrim OWNS pointer events — never a visual mask over live hi" />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <div data-reveal="" use:reveal>
    <SectionCard headingLevel={1} tone="hero" eyebrow="registry:ui · antd 裁决" title="spin — the terminal cursor" summary="The bracket cursor cycling frames under role=status. Wrapping posture: an aria-busy container whose scrim OWNS pointer events — never a visual mask over live hit areas.">
      <div class="flex flex-wrap gap-3"><span class="pill">antd phase</span></div>
    </SectionCard>
  </div>

  <div data-reveal="" use:reveal>
    <ComponentCanvas
      title="spin"
      description="spin — the terminal cursor"
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/spin.svelte"
      files={canvasFiles}
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
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          bare = the inline glyph; wrapping = aria-busy content with the scrim intercepting pointers (loading is not disabled — the state says busy, the interactions stop anyway). reduced-motion freezes on the first frame.
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div data-reveal="" use:reveal>
    <SectionCard headerRegion="spin-base" eyebrow="antd 裁决" title="Usage">
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
</div>
