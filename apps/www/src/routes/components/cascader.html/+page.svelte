<script lang="ts">
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import Cascader from '$lib/ui/cascader.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import type { TreeFile } from '$lib/ui/tree-view.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import cascaderSource from '$lib/ui/cascader.svelte?raw';

let value = $state<string[]>([]);
  const options = [{ value: 'asia', label: 'Asia', children: [{ value: 'japan', label: 'Japan' }, { value: 'korea', label: 'Korea' }] }, { value: 'eu', label: 'Europe', children: [{ value: 'fr', label: 'France' }] }];

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/cascader.svelte', content: cascaderSource },
  ];
</script>

<svelte:head>
  <title>Cascader · jixoai-ui</title>
  <meta name="description" content="The cascade selector the ruled way: N plain select elements, each listing the children of the previous pick — native keyboard, native mobile pickers, zero panel" />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <div data-reveal="" use:reveal>
    <SectionCard headingLevel={1} tone="hero" eyebrow="registry:ui · antd 裁决" title="cascader — a chain of selects, natively" summary="The cascade selector the ruled way: N plain select elements, each listing the children of the previous pick — native keyboard, native mobile pickers, zero panels. The joined path submits through the bridge; a partial path submits empty.">
      <div class="flex flex-wrap gap-3"><span class="pill">antd phase · batch 2</span></div>
    </SectionCard>
  </div>

  <div data-reveal="" use:reveal>
    <ComponentCanvas
      title="cascader"
      description="cascader — a chain of selects, natively"
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/cascader.svelte"
      files={canvasFiles}
    >
      <div class="w-full max-w-md">
        <Cascader {options} label="region" bind:value />
      </div>
      {#snippet playground()}
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          picking a parent grows the chain by one select; re-picking an earlier level truncates everything deeper. The complete leaf path is the form value.
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>
</div>
