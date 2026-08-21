<script lang="ts">
  import SectionCard from '$lib/ui/section-card.svelte';
  import { reveal } from '$lib/reveal';
</script>

<svelte:head>
  <title>spin · jixoai-ui</title>
  <meta name="description" content="The bracket cursor cycling [/ - \ |] under role=status. Wrapping posture: aria-busy container whose scrim owns pointer events." />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <div data-reveal="" use:reveal>
    <SectionCard headingLevel={1} tone="hero" eyebrow="registry:ui · antd ruling" title="spin — the terminal cursor" summary="The bracket cursor cycling [/ - \ |] under role=status. Wrapping posture: aria-busy container whose scrim owns pointer events.">
      <div class="flex flex-wrap gap-3"><span class="pill">antd phase</span></div>
    </SectionCard>
  </div>
</div>
