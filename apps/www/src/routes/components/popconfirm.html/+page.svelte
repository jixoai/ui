<script lang="ts">
  import SectionCard from '$lib/ui/section-card.svelte';
  import { reveal } from '$lib/reveal';
</script>

<svelte:head>
  <title>popconfirm · jixoai-ui</title>
  <meta name="description" content="The LIGHT confirm bubble (ruling: NOT an alertdialog — modal weight stays with alert-dialog). Light dismiss IS the cancel path; focus lands on Cancel;" />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <div data-reveal="" use:reveal>
    <SectionCard headingLevel={1} tone="hero" eyebrow="registry:ui · antd ruling" title="popconfirm — the light sure-bubble" summary="The LIGHT confirm bubble (ruling: NOT an alertdialog — modal weight stays with alert-dialog). Light dismiss IS the cancel path; focus lands on Cancel; confirm paints destructive by default.">
      <div class="flex flex-wrap gap-3"><span class="pill">antd phase</span></div>
    </SectionCard>
  </div>
</div>
