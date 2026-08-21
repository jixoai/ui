<script lang="ts">
  import SectionCard from '$lib/ui/section-card.svelte';
  import { reveal } from '$lib/reveal';
</script>

<svelte:head>
  <title>descriptions · jixoai-ui</title>
  <meta name="description" content="The enterprise detail view, W3C-first: dt/dd pairs in a grid. The bordered look is CSS on the same dl; columns=N pairs per row, container-query respon" />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <div data-reveal="" use:reveal>
    <SectionCard headingLevel={1} tone="hero" eyebrow="registry:ui · antd ruling" title="descriptions — a dl, never a table" summary="The enterprise detail view, W3C-first: dt/dd pairs in a grid. The bordered look is CSS on the same dl; columns=N pairs per row, container-query responsive.">
      <div class="flex flex-wrap gap-3"><span class="pill">antd phase</span></div>
    </SectionCard>
  </div>
</div>
