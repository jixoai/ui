<!-- carousel blueprint: the real scroll-snap track with three slides —
     a peeking slideWidth keeps 1+ slides visible at rest; dots and
     prev/next arrows are the component's own honest controls. -->
<script lang="ts">
  import Carousel from '$lib/ui/carousel/carousel.svelte';
  import { bpA } from '$lib/surface/blueprints-a.stylex';

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

<div class={cx(bpA.carouselStage)}>
  <Carousel label="registry drops" slideWidth="58%">
    <figure class={cx(bpA.carouselSlide)}>
      <span class={cx(bpA.carouselIndex)}>01</span>
      <span class={cx(bpA.carouselCaption)}>one-hue theme law</span>
    </figure>
    <figure class={cx(bpA.carouselSlide)}>
      <span class={cx(bpA.carouselIndex)}>02</span>
      <span class={cx(bpA.carouselCaption)}>press physics buttons</span>
    </figure>
    <figure class={cx(bpA.carouselSlide)}>
      <span class={cx(bpA.carouselIndex)}>03</span>
      <span class={cx(bpA.carouselCaption)}>native popover panels</span>
    </figure>
  </Carousel>
</div>
