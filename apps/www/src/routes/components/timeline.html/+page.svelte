<script lang="ts">
  import SectionCard from '$lib/ui/section-card.svelte';
  import { reveal } from '$lib/reveal';
</script>

<svelte:head>
  <title>timeline · jixoai-ui</title>
  <meta name="description" content="An ol of timestamped entries with a CSS spine; pending renders the hollow dot. Order is the chronology; the spine is decoration." />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <div data-reveal="" use:reveal>
    <SectionCard headingLevel={1} tone="hero" eyebrow="registry:ui · antd ruling" title="timeline — the activity spine" summary="An ol of timestamped entries with a CSS spine; pending renders the hollow dot. Order is the chronology; the spine is decoration.">
      <div class="flex flex-wrap gap-3"><span class="pill">antd phase</span></div>
    </SectionCard>
  </div>
</div>
