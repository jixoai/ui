<!--
  jixoai carousel (registry/files/ui/carousel/carousel.svelte).
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

  tw4 (2026-08-24): utility-authored — track, arrows, dots paint
  (incl. hover/focus-visible and the on-dot state) live in the markup;
  ONLY the slide law (every DIRECT child sized + snapped — a child
  boundary utilities never own) stays in carousel.css (D1-exempt
  residue, static @layer components).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';
  import './carousel.css';

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
    // mandatory snap fights mid-flight smooth scrolling on long jumps
    // (the walk observed snap yanking a smooth scroll back to 0) —
    // adjacent slides stay smooth, longer hops go instant
    const distance = Math.abs(clamped - active);
    const behavior: ScrollBehavior = distance > 1 ? 'instant' : 'smooth';
    if (typeof track.scrollTo === 'function') {
      track.scrollTo({ left: target.offsetLeft, behavior });
    } else {
      track.scrollLeft = target.offsetLeft;
    }
  }

  /** native arrows cannot page a mandatory-snap track (snap snaps the
   *  ~40px native scroll straight back) — the track's own keydown pages */
  function handleTrackKeydown(event: KeyboardEvent): void {
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      step(1);
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault();
      step(-1);
    }
  }

  /** desktop pointer drag pans the native scroller (touch already does;
   *  the mouse has no native lane) — capture only, never hijack clicks */
  let dragging = false;
  let dragStartX = 0;
  let dragStartScroll = 0;
  function handlePointerDown(event: PointerEvent): void {
    if (event.pointerType === 'mouse' && track) {
      dragging = true;
      dragStartX = event.clientX;
      dragStartScroll = track.scrollLeft;
      track.setPointerCapture?.(event.pointerId);
    }
  }
  function handlePointerMove(event: PointerEvent): void {
    if (dragging && track) track.scrollLeft = dragStartScroll - (event.clientX - dragStartX);
  }
  function handlePointerUp(): void {
    dragging = false;
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

<div data-jx-carousel="" class={cn('flex flex-col gap-3', className)} role="region" aria-roledescription="carousel" aria-label={label}>
  <div data-jx-carousel-window="" class="relative">
    <!-- tabindex: the scroll region itself is the keyboard surface
         (native arrow scrolling); buttons page explicitly -->
    <!-- svelte-ignore a11y_no_static_element_interactions, a11y_no_noninteractive_element_interactions -- the
         track is a scroll surface: handlers page the native scroller
         (mandatory snap eats native arrow keys) and pan with the mouse;
         the dots and arrows remain the explicit controls -->
    <div
      class="jx-carousel-track flex gap-3 overflow-x-auto snap-x snap-mandatory overscroll-x-contain pb-1 focus-visible:outline-1 focus-visible:outline-ring focus-visible:outline-offset-[-1px]"
      style="--jx-slide-w: {slideWidth}"
      use:collectSlides
      tabindex="0"
      onscroll={handleScroll}
      onkeydown={handleTrackKeydown}
      onpointerdown={handlePointerDown}
      onpointermove={handlePointerMove}
      onpointerup={handlePointerUp}
      onpointercancel={handlePointerUp}
    >
      {@render children()}
    </div>
    <button
      type="button"
      data-jx-carousel-arrow=""
      data-jx-carousel-prev=""
      class="absolute top-1/2 -translate-y-1/2 -left-4 appearance-none inline-flex items-center justify-center size-8 border border-border bg-popover text-foreground text-lg leading-none cursor-pointer shadow-xs hover:border-primary hover:text-primary focus-visible:outline-1 focus-visible:outline-ring focus-visible:outline-offset-[-1px]"
      aria-label="previous slide"
      onclick={() => step(-1)}
    >{prevLabel}</button>
    <button
      type="button"
      data-jx-carousel-arrow=""
      data-jx-carousel-next=""
      class="absolute top-1/2 -translate-y-1/2 -right-4 appearance-none inline-flex items-center justify-center size-8 border border-border bg-popover text-foreground text-lg leading-none cursor-pointer shadow-xs hover:border-primary hover:text-primary focus-visible:outline-1 focus-visible:outline-ring focus-visible:outline-offset-[-1px]"
      aria-label="next slide"
      onclick={() => step(1)}
    >{nextLabel}</button>
  </div>
  {#if dots && slides.length > 1}
    <div data-jx-carousel-dots="" class="flex justify-center gap-2" role="group" aria-label="slides">
      {#each slides as _, index (index)}
        <button
          type="button"
          data-jx-carousel-dot=""
          data-jx-carousel-dot-on={active === index ? '' : undefined}
          class={cn(
            'appearance-none size-2 border border-border bg-muted cursor-pointer focus-visible:outline-1 focus-visible:outline-ring focus-visible:outline-offset-[2px]',
            active === index && 'bg-primary border-primary',
          )}
          aria-label="go to slide {index + 1}"
          aria-current={active === index ? 'true' : undefined}
          onclick={() => scrollToSlide(index)}
        ></button>
      {/each}
    </div>
  {/if}
</div>
