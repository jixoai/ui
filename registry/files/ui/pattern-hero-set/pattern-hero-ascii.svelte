<!--
  jixoai pattern-hero-ascii (registry/files/ui/pattern-hero-set/
  pattern-hero-ascii.svelte, 2026-08-30, terminal-patterns).
  The ascii-art headline hero: the headline IS a figlet banner —
  `art` arrives as payload (value-domain string, whitespace-preserved)
  and renders in a <pre> under the mono scale law (the size clamps
  with the viewport; wide banners scroll their own lane instead of
  wrapping — ascii art must never reflow). CTA row rides PressButton
  with the arrow glyph from the generated icon module.

  Composition-only: no atom is patched; the press law, the icon
  geometry and the hero grammar all belong to the atoms.
-->
<script lang="ts">
  import { icons } from '$lib/icons';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import './pattern-hero-set.css';

  interface Props {
    /** the ascii banner (whitespace-preserved payload — figlet output) */
    art: string;
    /** tracked label above the banner */
    eyebrow?: string;
    /** max-62ch lead paragraph under the banner */
    summary?: string;
    /** the primary CTA (label + href); omitted renders no CTA row */
    ctaLabel?: string;
    ctaHref?: string;
    /** an outline CTA beside the primary */
    secondaryLabel?: string;
    secondaryHref?: string;
    class?: string;
  }

  let {
    art,
    eyebrow = '$ figlet -f standard jixoai',
    summary = '',
    ctaLabel = 'get started',
    ctaHref = '#',
    secondaryLabel = '',
    secondaryHref = '#',
    class: className = '',
  }: Props = $props();
</script>

<section
  data-jx-hero-ascii=""
  class={`mx-auto w-full max-w-[90rem] px-4 pb-10 pt-10 sm:px-6 sm:pt-14 lg:px-8 ${className}`}
>
  <div class="min-w-0">
    <p class="m-0 font-nav text-[11px] uppercase tracking-[0.24em] text-primary">{eyebrow}</p>
    <!-- the mono scale law: size clamps with the viewport, the banner
         scrolls its own lane — ascii never reflows -->
    <pre
      data-jx-hero-ascii-art=""
      class="mt-4 max-w-full overflow-x-auto font-mono text-[clamp(0.5rem,2.4vw,1.125rem)] leading-[1.1] tracking-normal text-foreground [scrollbar-width:thin]"
      aria-label="ascii art headline"
    >{art}</pre>
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
  </div>
</section>
