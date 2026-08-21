<script lang="ts">
  import SectionCard from '$lib/ui/section-card.svelte';
  import { reveal } from '$lib/reveal';
</script>

<svelte:head>
  <title>steps · jixoai-ui</title>
  <meta name="description" content="The wizard ol: completed steps are clickable, current is aria-current=step, future steps are inert — never aria-disabled." />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <div data-reveal="" use:reveal>
    <SectionCard headingLevel={1} tone="hero" eyebrow="registry:ui · antd ruling" title="steps — completed steps are links back" summary="The wizard ol: completed steps are clickable, current is aria-current=step, future steps are inert — never aria-disabled.">
      <div class="flex flex-wrap gap-3"><span class="pill">antd phase</span></div>
    </SectionCard>
  </div>
</div>
