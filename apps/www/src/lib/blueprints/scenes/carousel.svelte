<!-- carousel blueprint: the real scroll-snap track with three slides —
     a peeking slideWidth keeps 1+ slides visible at rest; dots and
     prev/next arrows are the component's own honest controls. -->
<script lang="ts">
  import Carousel from '$lib/ui/carousel.svelte';
</script>

<div class="flex h-full w-full flex-col justify-center p-10">
  <Carousel label="registry drops" slideWidth="58%">
    <figure class="border-border bg-card flex h-36 flex-col justify-between border p-4">
      <span class="font-mono text-xs text-muted-foreground">01</span>
      <span class="text-sm font-medium">one-hue theme law</span>
    </figure>
    <figure class="border-border bg-card flex h-36 flex-col justify-between border p-4">
      <span class="font-mono text-xs text-muted-foreground">02</span>
      <span class="text-sm font-medium">press physics buttons</span>
    </figure>
    <figure class="border-border bg-card flex h-36 flex-col justify-between border p-4">
      <span class="font-mono text-xs text-muted-foreground">03</span>
      <span class="text-sm font-medium">native popover panels</span>
    </figure>
  </Carousel>
</div>
