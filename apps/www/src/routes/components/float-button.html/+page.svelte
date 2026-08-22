<script lang="ts">
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import FloatButton from '$lib/ui/float-button.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import type { TreeFile } from '$lib/ui/tree-view.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import floatbuttonSource from '$lib/ui/float-button.svelte?raw';

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/float-button.svelte', content: floatbuttonSource },
  ];
</script>

<style>
  /* scrollable stage: the back-top action is demonstrable in place;
     no reveal wrapper — a transformed ancestor hijacks position:fixed
     during the transition window (walkthrough-3 note) */
  .jx-fab-stage {
    position: relative;
    max-height: 14rem;
    overflow-y: auto;
    border: 1px dashed var(--border);
    padding: 0.875rem;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
</style>

<svelte:head>
  <title>FloatButton · jixoai-ui</title>
  <meta name="description" content="The floating action button in two idioms: plain (a lone fixed action) and menu (an actions snippet toggling a popover stack above). Corner is a prop — your layo" />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <div data-reveal="" use:reveal>
    <SectionCard headingLevel={1} tone="hero" eyebrow="registry:ui · antd 裁决" title="float-button — the fixed corner action" summary="The floating action button in two idioms: plain (a lone fixed action) and menu (an actions snippet toggling a popover stack above). Corner is a prop — your layout is never touched.">
      <div class="flex flex-wrap gap-3"><span class="pill">antd phase · batch 2</span></div>
    </SectionCard>
  </div>

  <div data-reveal="" use:reveal>
    <ComponentCanvas
      title="float-button"
      description="float-button — the fixed corner action"
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/float-button.svelte"
      files={canvasFiles}
    >
      <div class="jx-fab-stage">
        <p class="text-muted-foreground text-[12.5px] leading-6">
          scroll inside this box, then press the fixed corner button — the page rides back to its
          top.
        </p>
        {#each Array(12) as _, i (i)}
          <p class="text-[12.5px] leading-6 text-muted-foreground/70">filler row {i + 1}</p>
        {/each}
        <FloatButton label="back to top" onclick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <span aria-hidden="true">↑</span>
        </FloatButton>
      </div>
      {#snippet playground()}
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          the button is fixed bottom-right — click it to ride back to the top of this page. label is REQUIRED: an icon-only button must say itself.
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>
</div>
