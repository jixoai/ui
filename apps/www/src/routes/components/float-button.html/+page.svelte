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
      <div class="min-h-40">
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
