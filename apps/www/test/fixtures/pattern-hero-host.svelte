<!--
  Test host for the terminal-patterns hero set (2026-08-30): mounts
  all three variants so the suite can assert each form renders — the
  terminal-window hero (hero-section + prewired terminal-card), the
  ascii-art headline hero, and the badge-marquee hero.
-->
<script lang="ts">
  import PatternHeroSet from '../../src/lib/ui/pattern-hero-set/pattern-hero-set.svelte';
  import PatternHeroAscii from '../../src/lib/ui/pattern-hero-set/pattern-hero-ascii.svelte';
  import PatternHeroMarquee from '../../src/lib/ui/pattern-hero-set/pattern-hero-marquee.svelte';

  let {
    copyCommand = 'npx jixoai-ui init --hue 210',
    items = ['oklch tokens', 'zero-dep atoms', 'svelte 5', 'press law'],
  }: { copyCommand?: string; items?: string[] } = $props();
</script>

<div data-hero-form="terminal">
  <PatternHeroSet
    eyebrow="your-app · v0"
    summary="One command, whole registry. The terminal demo types the same command the CTA copies."
    {copyCommand}
  >
    {#snippet title()}Ship the registry into your repo. <em>Keep the source.</em>{/snippet}
  </PatternHeroSet>
</div>

<div data-hero-form="ascii">
  <PatternHeroAscii
    art={`  _ _ _ ___\n | | | | . |_|\n |_____|___|_|\n GitHub-style banner`}
    eyebrow="$ figlet -f standard jixoai"
    summary="The headline IS the banner — mono scale clamps, wide art scrolls, nothing reflows."
    ctaLabel="get started"
    ctaHref="/docs.html"
  />
</div>

<div data-hero-form="marquee">
  <PatternHeroMarquee {items} ctaLabel="get started" ctaHref="/docs.html">
    {#snippet title()}Every atom, one grammar.{/snippet}
  </PatternHeroMarquee>
</div>
