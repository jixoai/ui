<!--
  jixoai pattern-hero-marquee (registry/files/ui/pattern-hero-set/
  pattern-hero-marquee.svelte, 2026-08-30, terminal-patterns).
  The badge-marquee hero: a lead block (eyebrow / title snippet /
  summary / CTA row) over a token marquee strip — `npm ls --depth 0`
  energy, plain mono tokens (NO chip boxes: the strip is text with
  dot separators, so no atom paint is duplicated). The loop is pure
  CSS: the track carries the readable row plus an aria-hidden
  duplicate and translates -50% seamlessly; under
  prefers-reduced-motion the animation dies, the duplicate folds
  away and the strip becomes a static scrollable row (the
  reduced-motion law — never a frozen half-row).

  Composition-only: PressButton owns the CTA physics; the glyph comes
  from the generated icon module.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { icons } from '$lib/icons';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import './pattern-hero-set.css';

  interface Props {
    /** the marquee tokens (value-domain payload — plain strings) */
    items: readonly string[];
    /** tracked label above the title */
    eyebrow?: string;
    /** the h1 content — <em> inside carries the accent paint */
    title?: Snippet;
    /** max-62ch lead paragraph */
    summary?: string;
    /** the primary CTA (label + href); omitted renders no CTA row */
    ctaLabel?: string;
    ctaHref?: string;
    /** an outline CTA beside the primary */
    secondaryLabel?: string;
    secondaryHref?: string;
    /** one full pass of the strip, in seconds (default 24) */
    duration?: number;
    class?: string;
  }

  let {
    items,
    eyebrow = '$ npm ls --depth 0',
    title,
    summary = '',
    ctaLabel = 'get started',
    ctaHref = '#',
    secondaryLabel = '',
    secondaryHref = '#',
    duration = 24,
    class: className = '',
  }: Props = $props();
</script>

<section
  data-jx-hero-marquee=""
  class={`mx-auto w-full max-w-[90rem] px-4 pb-10 pt-10 sm:px-6 sm:pt-14 lg:px-8 ${className}`}
>
  <div class="min-w-0">
    <p class="m-0 font-nav text-[11px] uppercase tracking-[0.24em] text-primary">{eyebrow}</p>
    {#if title}
      <h2
        data-jx-hero-marquee-title=""
        class="mt-4 max-w-[30ch] text-[clamp(2rem,4.4vw,3.6rem)] font-bold leading-[1.2] tracking-[-0.02em] text-balance"
      >
        {@render title()}
      </h2>
    {/if}
    {#if summary}
      <p class="mt-5 max-w-[62ch] text-pretty text-[15px] leading-6 text-muted-foreground sm:text-base sm:leading-7">
        {summary}
      </p>
    {/if}
    {#if ctaLabel}
      <div class="mt-8 flex flex-wrap gap-3">
        <PressButton variant="fill" href={ctaHref}>
          <span>{ctaLabel}</span>
          <span class="inline-flex [&_svg]:h-4 [&_svg]:w-4" aria-hidden="true">{@html icons.arrowRight}</span>
        </PressButton>
        {#if secondaryLabel}
          <PressButton variant="outline" href={secondaryHref}>{secondaryLabel}</PressButton>
        {/if}
      </div>
    {/if}

    <!-- the strip: readable row + aria-hidden duplicate, -50% loop;
         edge fade is a mask so nothing interactive hides under it -->
    <div
      data-jx-hero-marquee-strip=""
      class="jx-hero-marquee mt-10 overflow-x-auto border-y border-border py-3 [scrollbar-width:thin] [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]"
    >
      <div
        class="jx-hero-marquee-track"
        style={`--jx-hero-marquee-duration: ${Math.max(6, duration)}s`}
      >
        <ul data-jx-hero-marquee-row="" class="jx-hero-marquee-row m-0 list-none p-0">
          {#each items as token (token)}
            <li class="flex items-center gap-[var(--jx-hero-marquee-gap)]">
              <span class="whitespace-nowrap font-nav text-xs tracking-[0.14em] uppercase text-muted-foreground">{token}</span>
              <span aria-hidden="true" class="text-primary text-xs">·</span>
            </li>
          {/each}
        </ul>
        <ul class="jx-hero-marquee-row m-0 list-none p-0" aria-hidden="true">
          {#each items as token (token)}
            <li class="flex items-center gap-[var(--jx-hero-marquee-gap)]">
              <span class="whitespace-nowrap font-nav text-xs tracking-[0.14em] uppercase text-muted-foreground">{token}</span>
              <span aria-hidden="true" class="text-primary text-xs">·</span>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </div>
</section>
