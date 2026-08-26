<script lang="ts">
  import Carousel from '$lib/ui/carousel/carousel.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import carouselSource from '$lib/ui/carousel/carousel.svelte?raw';

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

  // ToC outline: pairs with the section ids below, in page order.
</script>

<svelte:head>
  <title>Carousel · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai carousel: CSS scroll-snap does the paging, native scrolling does the motion — no cloning, no virtual window. JS only reads the position to keep the dots honest."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>

  <div class="flex min-w-0 flex-col gap-8">
  <div data-reveal="">
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

  <div data-reveal="">
    <ComponentCanvas
      title="carousel"
      description="Drag/scroll the track (or focus it and use arrow keys), page with the dots or arrows — the active dot follows the nearest snap slide."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/carousel.svelte"
      files={canvasFiles}
      stage="fill"
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
        <PlayFields>
          <PlayHelp>
            slideWidth='100%' pages one-at-a-time; '60%' peeks the neighbors. slides are ANY elements
            — figures, cards, sections. The track is the keyboard surface; dots and arrows page
            explicitly.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="carousel-base" data-reveal="">
    <SectionCard family="carousel-base" headerRegion="carousel-base" eyebrow="W3C foundation" title="Usage">
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Carousel variants" summary="slideWidth is the one geometric decision: page one-at-a-time or peek the neighbors; dots are optional.">
    <div class="grid gap-4 md:grid-cols-3">
      <div class="border border-border p-4">
        <p class="font-nav mb-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">one-at-a-time</p>
        <p class="text-[13px] leading-6"><code class="text-accent">slideWidth="100%"</code> (default) — each slide fills the track; snap pages cleanly.</p>
      </div>
      <div class="border border-border p-4">
        <p class="font-nav mb-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">peeking</p>
        <p class="text-[13px] leading-6"><code class="text-accent">slideWidth="60%"</code> / any CSS length — neighbors peek, snap still pages.</p>
      </div>
      <div class="border border-border p-4">
        <p class="font-nav mb-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">dots off</p>
        <p class="text-[13px] leading-6"><code class="text-accent">dots={false}</code> hides the dot row; the prev/next arrows stay.</p>
      </div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Slides are any direct children — figures, cards, sections; the browser is the animator."><CodeBlock code={usage} lang="svelte" meta="Carousel usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The region names itself, the track is the keyboard surface, and every control is a real button."><A11yTable keys={[{ key: '← / →', action: 'Page the track back/forward when it holds focus (mandatory snap eats the native ~40px arrow scroll)' }, { key: 'Tab', action: 'Moves focus through arrows, track, and dots — all real buttons' }, { key: 'Enter / Space', action: 'Activate the focused arrow or dot button' }]} aria={[{ name: 'role', value: 'region + aria-roledescription="carousel"', description: 'On the root; aria-label defaults to the label prop.' }, { name: 'aria-label', value: 'previous slide / next slide / go to slide n', description: 'On the arrows and each dot — they command, they never navigate.' }, { name: 'aria-current', value: "'true'", description: 'On the active dot; the dots follow the nearest snap slide.' }, { name: 'tabindex', value: '0', description: 'On the track — the scroll region is the keyboard surface.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="One geometry token — the slide width; chrome (arrows, dots) is fixed micro geometry."><div class="flex flex-col gap-5"><DensityDemo><Carousel label="density sample"><figure class="jx-demo-slide">01 xs→lg</figure><figure class="jx-demo-slide">02 fixed chrome</figure><figure class="jx-demo-slide">03 native scroll</figure></Carousel></DensityDemo><TokenTable tokens={[{ name: '--jx-slide-w', default: '100% (slideWidth prop)', source: 'component', description: 'Slide width inside the snap track.' }, { name: 'track gap', default: '12px (gap-3)', source: 'structural' }, { name: 'arrow box', default: '32px (size-8)', source: 'structural' }, { name: 'dot', default: '8px (size-2)', source: 'structural' }, { name: '--jx-icon', default: '16 / 18 / 20 / 24px', source: 'density' }, { name: '--jx-hit', default: '44 / 44 / 44 / 48px', source: 'density' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Seven props; JS only reads the scroll position — the dots stay honest."><PropsTable props={[{ name: 'label', type: 'string', default: "'carousel'", description: 'The region’s aria-label.' }, { name: 'slideWidth', type: 'string', default: "'100%'", description: 'Slide width inside the track; any CSS length — <100% peeks neighbors.' }, { name: 'dots', type: 'boolean', default: 'true', description: 'Show the dot row (the arrows stay either way).' }, { name: 'children', type: 'Snippet', default: '—', description: 'The slides — any element each; direct children of the track.' }, { name: 'prevLabel', type: 'string', default: "'‹'", description: 'Prev arrow label.' }, { name: 'nextLabel', type: 'string', default: "'›'", description: 'Next arrow label.' }, { name: 'class', type: 'string', default: "''", description: 'Forwarded to the root.' }]} /></SectionCard></div>
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
