<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Separator from '$lib/ui/separator.svelte';
  import Skeleton from '$lib/ui/skeleton.svelte';
  import Toc from '$lib/ui/toc.svelte';
  import type { TreeFile } from '$lib/ui/tree-view.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import skeletonSource from '$lib/ui/skeleton.svelte?raw';

  const usage = `<!-- geometry is the consumer's; the block is bare -->
<Skeleton class="h-4 w-2/3" />

<!-- a loading card, the common shape -->
<div class="flex items-center gap-3" aria-busy="true">
  <Skeleton class="size-10" />
  <div class="flex flex-col gap-2">
    <Skeleton class="h-3 w-32" />
    <Skeleton class="h-3 w-20" />
  </div>
</div>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/skeleton.svelte', content: skeletonSource },
    { name: 'src/lib/ui/skeleton-usage.svelte', content: usage },
  ];

  // ToC outline: pairs with the section ids below, in page order.
  const tocSections = [{ id: 'skeleton-base', label: 'the a11y split' }];
</script>

<svelte:head>
  <title>Skeleton · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai skeleton: a loading placeholder block with a terminal brightness pulse — aria-hidden, pure CSS, geometry from the consumer. The loading-region a11y contract belongs to the container."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:grid lg:grid-cols-[minmax(0,1fr)_15rem] lg:items-start lg:gap-10 lg:px-8"
>
  <!-- ToC rail: desktop sticky right column, mobile glass row (toc.css) -->
  <aside class="jx-toc-aside lg:order-2" aria-label="On this page">
    <Toc sections={tocSections} title="on this page" scrollRoot=".jx-shell-body" />
  </aside>

  <div class="flex min-w-0 flex-col gap-8 max-lg:pt-[68px] lg:order-1">
  <div data-reveal="" use:reveal>
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · NativeHTML"
      title="skeleton — the placeholder, nothing more"
      summary="A muted block with a terminal brightness pulse. Pure CSS, zero JS, aria-hidden by design: each placeholder is scenery. The loading contract — aria-busy on the container, or a visually-hidden live region — belongs to the region being loaded, never to each block."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">pure CSS</span>
        <span class="pill">aria-hidden scenery</span>
        <span class="pill">reduced-motion freeze</span>
      </div>
    </SectionCard>
  </div>

  <div data-reveal="" use:reveal>
    <ComponentCanvas
      title="skeleton"
      description="A loading card in the common shape — avatar block, two text lanes. The pulse is a brightness oscillation, not a shimmer sweep."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/skeleton.svelte"
      files={canvasFiles}
    >
      <div class="flex w-full max-w-sm flex-col gap-4" aria-busy="true">
        <div class="flex items-center gap-3">
          <Skeleton class="size-10" />
          <div class="flex flex-col gap-2">
            <Skeleton class="h-3 w-32" />
            <Skeleton class="h-3 w-20" />
          </div>
        </div>
        <Separator />
        <div class="flex flex-col gap-2">
          <Skeleton class="h-3 w-full" />
          <Skeleton class="h-3 w-11/12" />
          <Skeleton class="h-3 w-3/4" />
        </div>
      </div>
      {#snippet playground()}
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          the stage carries <code class="text-accent">aria-busy="true"</code> — that is the
          contract's home. prefers-reduced-motion freezes the pulse into a static block.
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="skeleton-base" data-reveal="" use:reveal>
    <SectionCard
      family="skeleton-base"
      headerRegion="skeleton-base"
      eyebrow="NativeHTML 基座"
      title="The a11y split"
      summary="Placeholder blocks are decoration (aria-hidden); the loading STATE is semantics (aria-busy on the container, announced politely once). Mixing the two — live regions per skeleton — is how placeholder UIs end up spamming screen readers."
    >
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
  </div>
</div>
