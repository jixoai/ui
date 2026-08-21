<script lang="ts">
  import SectionCard from '$lib/ui/section-card.svelte';
  import { reveal } from '$lib/reveal';
</script>

<svelte:head>
  <title>empty · jixoai-ui</title>
  <meta name="description" content="The eight-state machine's no-data member (error/loading/404 are alert/result surfaces — ruled separate). Terminal illustration slot, title, descriptio" />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <div data-reveal="" use:reveal>
    <SectionCard headingLevel={1} tone="hero" eyebrow="registry:ui · antd ruling" title="empty — the no-data state, nothing more" summary="The eight-state machine's no-data member (error/loading/404 are alert/result surfaces — ruled separate). Terminal illustration slot, title, description, actions.">
      <div class="flex flex-wrap gap-3"><span class="pill">antd phase</span></div>
    </SectionCard>
  </div>
</div>
