<!--
  jixoai hero section (registry/files/ui/hero-section.svelte).
  The open Broadside hero (no card chrome): eyebrow + h1 + summary +
  optional chip row + CTA actions, with an optional right-column demo
  (the terminal card, or any snippet). Two columns on lg+, stacked below.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { reveal } from '$lib/reveal';

  interface Props {
    eyebrow: string;
    title: string;
    summary?: string;
    chips?: string[];
    actions?: Snippet;
    demo?: Snippet;
  }

  let { eyebrow, title, summary, chips, actions, demo }: Props = $props();
</script>

<section class="grid items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
  <div class="flex min-w-0 flex-col items-start gap-4" data-reveal="" use:reveal={{}}>
    <p class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">{eyebrow}</p>
    <h1 class="font-nav max-w-[24ch] text-balance text-[clamp(1.9rem,3.4vw,3.1rem)] leading-[1.15] tracking-normal">
      {title}
    </h1>
    {#if summary}
      <p class="max-w-[62ch] text-pretty text-[13px] leading-6 text-foreground/75 sm:text-[14px]">
        {summary}
      </p>
    {/if}
    {#if chips && chips.length > 0}
      <ul class="flex flex-wrap gap-2 pt-1 text-[11px]">
        {#each chips as chip (chip)}
          <li class="border border-terminal-foreground/25 bg-terminal px-2.5 py-1 font-nav text-terminal-foreground">
            {chip}
          </li>
        {/each}
      </ul>
    {/if}
    {#if actions}
      <div class="flex flex-wrap items-center gap-3 pt-2">
        {@render actions()}
      </div>
    {/if}
  </div>
  {#if demo}
    <div class="min-w-0" data-reveal="" use:reveal={{ delay: 90 }}>
      {@render demo()}
    </div>
  {/if}
</section>
