<!--
  jixoai section card (registry/files/ui/section-card.svelte).
  The content atom of the site grammar: bordered card, header block with
  eyebrow (brand hue, font-nav, tracked 0.24em), font-nav title, text-pretty
  summary, body snippet slot. tone="hero" is for inner-page heads.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    eyebrow?: string;
    title: string;
    summary?: string;
    children: Snippet;
    class?: string;
    headingLevel?: 1 | 2;
    tone?: 'default' | 'hero';
    /** data-family on the section root (toc-engine parent extent). */
    family?: string;
    /** data-region on the section root (toc-engine leaf). */
    region?: string;
    /** data-region on the HEADER block only — the section's own leaf when
     *  its body carries child regions (non-overlapping by construction). */
    headerRegion?: string;
  }

  let {
    eyebrow,
    title,
    summary,
    children,
    class: className = '',
    headingLevel = 2,
    tone = 'default',
    family,
    region,
    headerRegion,
  }: Props = $props();

  const titleClassName = $derived(
    tone === 'hero'
      ? 'font-nav max-w-[24ch] text-balance text-[clamp(1.58rem,2.55vw,2.7rem)] tracking-normal leading-[1.2] sm:max-w-[22ch] lg:max-w-[24ch]'
      : 'font-nav text-balance text-[1.05rem] tracking-tight leading-tight sm:text-[1.22rem]',
  );
  const summaryClassName = $derived(
    tone === 'hero'
      ? 'max-w-[62ch] text-pretty text-[13px] leading-6 text-foreground/78 sm:text-[14px] sm:leading-6'
      : 'max-w-[64ch] text-pretty text-[13px] leading-5 text-muted-foreground sm:text-[14px] sm:leading-6',
  );
</script>

<section class={`border border-border bg-card shadow-xs ${className}`} data-family={family} data-region={region}>
  <div class="flex flex-col gap-3 border-b border-border px-4 py-3 sm:px-5 sm:py-4" data-region={headerRegion}>
    {#if eyebrow}
      <p class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">{eyebrow}</p>
    {/if}
    <div class="flex flex-col gap-2.5">
      {#if headingLevel === 1}
        <h1 class={titleClassName}>{title}</h1>
      {:else}
        <h2 class={titleClassName}>{title}</h2>
      {/if}
      {#if summary}
        <p class={summaryClassName}>{summary}</p>
      {/if}
    </div>
  </div>
  <div class="px-4 py-4 sm:px-5 sm:py-5">
    {@render children()}
  </div>
</section>
