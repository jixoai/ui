<script lang="ts">
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import Transfer from '$lib/ui/transfer.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import type { TreeFile } from '$lib/ui/tree-view.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import transferSource from '$lib/ui/transfer.svelte?raw';

let value = $state(['keep']);
  const options = [{ value: 'a', label: 'alpha' }, { value: 'b', label: 'beta' }, { value: 'c', label: 'gamma' }, { value: 'keep', label: 'keeper' }];

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/transfer.svelte', content: transferSource },
  ];
</script>

<svelte:head>
  <title>Transfer · jixoai-ui</title>
  <meta name="description" content="The two-panel selector: real fieldsets of real checkboxes per side, middle buttons batch-move checked rows, per-panel search filters. value is the target list; " />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <div data-reveal="" use:reveal>
    <SectionCard headingLevel={1} tone="hero" eyebrow="registry:ui · antd 裁决" title="transfer — two fieldsets and a batch mover" summary="The two-panel selector: real fieldsets of real checkboxes per side, middle buttons batch-move checked rows, per-panel search filters. value is the target list; selection clears after each move.">
      <div class="flex flex-wrap gap-3"><span class="pill">antd phase · batch 2</span></div>
    </SectionCard>
  </div>

  <div data-reveal="" use:reveal>
    <ComponentCanvas
      title="transfer"
      description="transfer — two fieldsets and a batch mover"
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/transfer.svelte"
      files={canvasFiles}
    >
      <div class="w-full max-w-2xl">
        <Transfer {options} bind:value />
      </div>
      {#snippet playground()}
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          checking rows on either side arms the middle mover; a move crosses EVERY checked row at once and clears the selection. Search filters per panel; disabled rows render but never move.
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>
</div>
