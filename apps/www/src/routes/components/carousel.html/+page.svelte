<script lang="ts">
  import Carousel from '$lib/ui/carousel.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import type { TreeFile } from '$lib/ui/tree-view.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import carouselSource from '$lib/ui/carousel.svelte?raw';

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import Carousel from '@ui/carousel.svelte';
${close}

<Carousel slideWidth="100%">
  <figure><!-- slide 1: any content --></figure>
  <figure><!-- slide 2 --></figure>
</Carousel>

<Carousel slideWidth="60%"><!-- peeking carousel --></Carousel>`;

  const canvasUsage = `<Carousel>
  <figure>01</figure>
  <figure>02</figure>
  <figure>03</figure>
</Carousel>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/carousel.svelte', content: carouselSource },
    { name: 'src/lib/ui/carousel-usage.svelte', content: canvasUsage },
  ];
</script>

<svelte:head>
  <title>Carousel · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai carousel: CSS scroll-snap does the paging, native scrolling does the motion — no cloning, no virtual window. JS only reads the position to keep the dots honest."
  />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <div data-reveal="" use:reveal>
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · NativeHTML"
      title="carousel — the browser is the animator"
      summary="A carousel IS a horizontally scrolled region: CSS scroll-snap pages it, native scrolling animates it (momentum, keyboard when focused), and JS only READS the position (rAF-throttled) to keep the dots honest. No slide cloning, no virtual window, no transition emulation — slides are ordinary direct children."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">scroll-snap</span>
        <span class="pill">no cloning</span>
        <span class="pill">dots page, track focuses</span>
      </div>
    </SectionCard>
  </div>

  <div data-reveal="" use:reveal>
    <ComponentCanvas
      title="carousel"
      description="Drag/scroll the track (or focus it and use arrow keys), page with the dots or arrows — the active dot follows the nearest snap slide."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/carousel.svelte"
      files={canvasFiles}
    >
      <div class="w-full max-w-xl">
        <Carousel>
          {#each ['01 deploy', '02 audit', '03 ship'] as label, i (label)}
            <figure class="jx-demo-slide">
              <span class="jx-demo-num">{i + 1}</span>
              {label}
            </figure>
          {/each}
        </Carousel>
      </div>
      {#snippet playground()}
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          slideWidth='100%' pages one-at-a-time; '60%' peeks the neighbors. slides are ANY elements
          — figures, cards, sections. The track is the keyboard surface; dots and arrows page
          explicitly.
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div data-reveal="" use:reveal>
    <SectionCard headerRegion="carousel-base" eyebrow="NativeHTML 基座" title="Usage">
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
</div>

<style>
  .jx-demo-slide {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;
    height: 11rem;
    border: 1px solid var(--border);
    background: var(--card);
    box-shadow: var(--shadow-2xs);
    font-family: var(--font-nav);
    font-size: 0.9375rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted-foreground);
    margin: 0;
  }
  .jx-demo-num {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.75rem;
    height: 1.75rem;
    border: 1px solid var(--primary);
    color: var(--primary);
  }
</style>
