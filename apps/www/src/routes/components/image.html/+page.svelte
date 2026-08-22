<script lang="ts">
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import Image from '$lib/ui/image.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import type { TreeFile } from '$lib/ui/tree-view.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import imageSource from '$lib/ui/image.svelte?raw';

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/image.svelte', content: imageSource },
  ];
</script>

<svelte:head>
  <title>Image · jixoai-ui</title>
  <meta name="description" content="The general-purpose picture: lazy, async-decoded, REQUIRED intrinsic width and height (layout never shifts), alt semantics, failure fallback with src-change rec" />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <div data-reveal="" use:reveal>
    <SectionCard headingLevel={1} tone="hero" eyebrow="registry:ui · antd 裁决" title="image — the no-CLS native picture" summary="The general-purpose picture: lazy, async-decoded, REQUIRED intrinsic width and height (layout never shifts), alt semantics, failure fallback with src-change recovery. Lightbox is a dialog recipe, not built in.">
      <div class="flex flex-wrap gap-3"><span class="pill">antd phase · batch 2</span></div>
    </SectionCard>
  </div>

  <div data-reveal="" use:reveal>
    <ComponentCanvas
      title="image"
      description="image — the no-CLS native picture"
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
</div>
