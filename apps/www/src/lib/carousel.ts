<!--
  jixoai carousel (registry/files/ui/carousel.svelte).
  W3C-first: a carousel IS a horizontally scrolled region — CSS
  scroll-snap does the paging, the platform's native scrolling does the
  motion (momentum, rubber-band, keyboard when focused), and JS only
  READS the scroll position to keep the dots honest. No slide cloning,
  no virtual window, no transition emulation: slides are ordinary
  content (images, cards, sections) and the browser is the animator.

    <Carousel>            <div class="jx-carousel">
      <figure>…</figure>     <div class="jx-carousel-track" tabindex="0">
      <figure>…</figure>       snap-x mandatory children (slides)
    </Carousel>              dots + prev/next (scrollTo smooth)

  The track is keyboard-focusable (arrow-scroll is native scroll
  behavior; the buttons give explicit paging). Dots are buttons, not
  links — they command the scroller, they don't navigate. The active
  dot follows the slide whose snap position is nearest the scroll
  offset (scroll listener, rAF-throttled — the same read-only stance
  as the toc engine).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';

  interface Props {
    /** dot + prev/next labels region (aria-label) */
    label?: string;
    /** slide width inside the track: '100%' = one-at-a-time (default);
     *  '80%' / '24rem' etc. give the peeking carousel */
    slideWidth?: string;
    /** hide the dots (the buttons stay) */
    dots?: boolean;
    class?: string;
    /** the slides — any element each; direct children of the track */
    children: Snippet;
    /** optional prev/next arrow labels */
    prevLabel?: string;
    nextLabel?: string;
  }

  let {
    label = 'carousel',
    slideWidth = '100%',
    dots = true,
    class: className = '',
    children,
    prevLabel = '‹',
    nextLabel = '›',
  }: Props = $props();

  let track = $state<HTMLDivElement | null>(null);
  let slides = $state<HTMLElement[]>([]);
  let active = $state(0);
  let raf = 0;

  /** read-only position sync: nearest snap slide = active dot */
  function syncActive(): void {
    if (!track || slides.length === 0) return;
    const mid = track.scrollLeft;
    let best = 0;
    let bestDistance = Infinity;
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      if (!slide) continue;
      const distance = Math.abs(slide.offsetLeft - mid);
      if (distance < bestDistance) {
        bestDistance = distance;
        best = i;
      }
    }
    active = best;
  }

  function handleScroll(): void {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(syncActive);
  }

  function scrollToSlide(index: number): void {
    if (!track) return;
    const clamped = Math.max(0, Math.min(index, slides.length - 1));
    const target = slides[clamped];
    if (!target) return;
    // scrollTo(options) is a browser method — guard for jsdom and old engines
    if (typeof track.scrollTo === 'function') {
      track.scrollTo({ left: target.offsetLeft, behavior: 'smooth' });
    } else {
      track.scrollLeft = target.offsetLeft;
    }
  }

  function step(direction: 1 | -1): void {
    scrollToSlide(active + direction);
  }

  function collectSlides(node: HTMLDivElement): { destroy: () => void } {
    track = node;
    slides = [...(node.children as HTMLCollectionOf<HTMLElement>)];
    const observer = new MutationObserver(() => {
      slides = [...(node.children as HTMLCollectionOf<HTMLElement>)];
      // a removed slide must leave the dot state pointing at the void
      if (active >= slides.length) active = Math.max(0, slides.length - 1);
    });
    observer.observe(node, { childList: true });
    return {
      destroy() {
        observer.disconnect();
        cancelAnimationFrame(raf);
      },
    };
  }
</script>

<div class="jx-carousel {className}" role="region" aria-roledescription="carousel" aria-label={label}>
  <div class="jx-carousel-window">
    <!-- tabindex: the scroll region itself is the keyboard surface
         (native arrow scrolling); buttons page explicitly -->
    <!-- svelte-ignore a11y_no_static_element_interactions -- the track
         is a scroll surface, not an interactive control; its handlers
         only read the scroll position -->
    <div
      class="jx-carousel-track"
      style="--jx-slide-w: {slideWidth}"
      use:collectSlides
      tabindex="0"
      onscroll={handleScroll}
    >
      {@render children()}
    </div>
    <button
      type="button"
      class="jx-carousel-arrow jx-carousel-prev"
      aria-label="previous slide"
      onclick={() => step(-1)}
    >{prevLabel}</button>
    <button
      type="button"
      class="jx-carousel-arrow jx-carousel-next"
      aria-label="next slide"
      onclick={() => step(1)}
    >{nextLabel}</button>
  </div>
  {#if dots && slides.length > 1}
    <div class="jx-carousel-dots" role="group" aria-label="slides">
      {#each slides as _, index (index)}
        <button
          type="button"
          class="jx-carousel-dot"
          class:jx-carousel-dot-on={active === index}
          aria-label="go to slide {index + 1}"
          aria-current={active === index ? 'true' : undefined}
          onclick={() => scrollToSlide(index)}
        ></button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .jx-carousel {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  .jx-carousel-window {
    position: relative;
  }
  .jx-carousel-track {
    display: flex;
    gap: 0.75rem;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: thin;
    overscroll-behavior-x: contain;
    padding-bottom: 0.25rem;
  }
  /* every DIRECT child is a slide: sized, snapped, shrunk-0 */
  .jx-carousel-track > :global(*) {
    flex: 0 0 var(--jx-slide-w);
    scroll-snap-align: start;
  }
  .jx-carousel-track:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }

  .jx-carousel-arrow {
    position: absolute;
    top: 50%;
    translate: 0 -50%;
    appearance: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 2rem;
    height: 2rem;
    border: 1px solid var(--border);
    background: var(--popover);
    color: var(--foreground);
    font-size: 1.125rem;
    line-height: 1;
    cursor: pointer;
    box-shadow: var(--shadow-2xs);
  }
  .jx-carousel-arrow:hover {
    border-color: var(--primary);
    color: var(--primary);
  }
  .jx-carousel-arrow:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: -1px;
  }
  .jx-carousel-prev {
    left: -1rem;
  }
  .jx-carousel-next {
    right: -1rem;
  }

  .jx-carousel-dots {
    display: flex;
    justify-content: center;
    gap: 0.5rem;
  }
  .jx-carousel-dot {
    appearance: none;
    width: 0.5rem;
    height: 0.5rem;
    padding: 0;
    border: 1px solid var(--border);
    background: var(--muted);
    cursor: pointer;
  }
  .jx-carousel-dot:focus-visible {
    outline: 1px solid var(--ring);
    outline-offset: 2px;
  }
  .jx-carousel-dot-on {
    background: var(--primary);
    border-color: var(--primary);
  }
</style>
