<script lang="ts">
  import SectionCard from '$lib/ui/section-card.svelte';
  import { reveal } from '$lib/reveal';
</script>

<svelte:head>
  <title>statistic · jixoai-ui</title>
  <meta name="description" content="Micro-label over tabular-nums with prefix/suffix snippets and text-glyph trends. The component never guesses what good means — you compose it." />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <div data-reveal="" use:reveal>
    <SectionCard headingLevel={1} tone="hero" eyebrow="registry:ui · antd ruling" title="statistic — the metric readout" summary="Micro-label over tabular-nums with prefix/suffix snippets and text-glyph trends. The component never guesses what good means — you compose it.">
      <div class="flex flex-wrap gap-3"><span class="pill">antd phase</span></div>
    </SectionCard>
  </div>
</div>
