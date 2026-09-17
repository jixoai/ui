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

  tailwindless one-shot Wave 1 (2026-09-17): the paint rides
  pattern-hero-set.stylex.ts atoms (joined through the payload's own
  cx(); the sm/lg seams ride nested media conditions at Tailwind's
  own thresholds); the banner's 1.1 leading + thin scrollbar ride
  pattern-hero-set.css keyed on the data hook.
-->
<script lang="ts">
  import Icon from '$lib/ui/icon';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import { heroStyles } from './pattern-hero-set.stylex';
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

  // the payload's own join (separator's serialize law): every string
  // declaration except the $$css marker, space-joined — atoms are
  // objects in dev, raw interpolation would render [object Object]
  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<section data-jx-hero-ascii="" class={cx(heroStyles.shell, className)}>
  <div class={cx(heroStyles.inner)}>
    <p class={cx(heroStyles.eyebrow)}>{eyebrow}</p>
    <!-- the mono scale law: size clamps with the viewport, the banner
         scrolls its own lane — ascii never reflows -->
    <pre
      data-jx-hero-ascii-art=""
      class={cx(heroStyles.asciiArt)}
      aria-label="ascii art headline"
    >{art}</pre>
    {#if summary}
      <p class={cx(heroStyles.lead)}>
        {summary}
      </p>
    {/if}
    {#if ctaLabel}
      <div class={cx(heroStyles.ctaRow)}>
        <PressButton variant="fill" href={ctaHref}>
          <span>{ctaLabel}</span>
          <span class={cx(heroStyles.ctaGlyph)} aria-hidden="true"><Icon name="arrowRight" /></span>
        </PressButton>
        {#if secondaryLabel}
          <PressButton variant="outline" href={secondaryHref}>{secondaryLabel}</PressButton>
        {/if}
      </div>
    {/if}
  </div>
</section>
