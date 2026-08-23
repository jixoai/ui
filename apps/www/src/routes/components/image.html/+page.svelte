<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import Image from '$lib/ui/image.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Toc from '$lib/ui/toc.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import imageSource from '$lib/ui/image.svelte?raw';

  const usage = `<!-- width/height are REQUIRED — the no-CLS contract is not optional -->
<Image src="/icon.svg" alt="the jixoai mark" width={96} height={96} />

<!-- alt="" opts into decorative; a failed load swaps to the fallback frame -->
<Image src={maybeBroken} alt="" width={96} height={96} />`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/image.svelte', content: imageSource },
    { name: 'src/lib/ui/image-usage.svelte', content: usage },
  ];

  // ToC outline: pairs with the section ids below, in page order.
  const tocSections = [{ id: 'image-law', label: 'the no-CLS contract' }];
</script>

<svelte:head>
  <title>Image · jixoai-ui</title>
  <meta name="description" content="The general-purpose picture: lazy, async-decoded, REQUIRED intrinsic width and height (layout never shifts), alt semantics, failure fallback with src-change recovery. Lightbox is a dialog recipe, not built in." />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>
  <!-- ToC rail: desktop sticky right column, mobile glass row (toc.css) -->
  <aside class="jx-toc-aside" aria-label="On this page">
    <Toc sections={tocSections} title="on this page" scrollRoot=".jx-shell-body" />
  </aside>

  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="" use:reveal>
      <SectionCard headingLevel={1} tone="hero" eyebrow="registry:ui · antd 裁决" title="image — the no-CLS native picture" summary="The general-purpose picture: lazy, async-decoded, REQUIRED intrinsic width and height (layout never shifts), alt semantics, failure fallback with src-change recovery. Lightbox is a dialog recipe, not built in.">
        <div class="flex flex-wrap gap-3">
          <span class="pill">no-CLS width/height</span>
          <span class="pill">lazy + async decode</span>
          <span class="pill">failure fallback · recovery</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="" use:reveal>
      <ComponentCanvas
        title="image"
        description="Left: a real load. Right: a broken source exercising the fallback — the dashed frame plus glyph; a later src change re-arms the load."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/image.svelte"
        files={canvasFiles}
      >
        <div class="flex flex-wrap items-start gap-6">
          <Image src="/icon.svg" alt="the jixoai mark" width={96} height={96} />
          <Image src="/definitely-missing.png" alt="broken demo" width={96} height={96} />
        </div>
        {#snippet playground()}
          <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
            the broken demo exercises the fallback (dashed frame plus glyph). alt empty-string opts into decorative; width and height are REQUIRED — the no-CLS contract is not optional.
          </p>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="image-law" data-reveal="" use:reveal>
      <SectionCard
        family="image-law"
        headerRegion="image-law"
        eyebrow="law"
        title="The no-CLS contract"
        summary="The img element carries loading, decoding and alt semantics; the component's one job is the failure posture — an onerror swap to a fallback frame that recovers when src changes. Intrinsic width/height stay REQUIRED: reserve the box, never shift the layout."
      >
        <CodeBlock code={usage} lang="svelte" meta="usage" />
      </SectionCard>
    </div>
  </div>
</div>
