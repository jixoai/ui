<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import Image from '$lib/ui/image/image.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import imageSource from '$lib/ui/image/image.svelte?raw';

  const usage = `<!-- width/height are REQUIRED — the no-CLS contract is not optional -->
<Image src="/icon.svg" alt="the jixoai mark" width={96} height={96} />

<!-- alt="" opts into decorative; a failed load swaps to the fallback frame -->
<Image src={maybeBroken} alt="" width={96} height={96} />`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/image.svelte', content: imageSource },
    { name: 'src/lib/ui/image-usage.svelte', content: usage },
  ];

  // ToC outline: pairs with the section ids below, in page order.
</script>

<svelte:head>
  <title>Image · jixoai-ui</title>
  <meta name="description" content="The general-purpose picture: lazy, async-decoded, REQUIRED intrinsic width and height (layout never shifts), alt semantics, failure fallback with src-change recovery. Lightbox is a dialog recipe, not built in." />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>

  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard headingLevel={1} tone="hero" eyebrow="registry:ui · General" title="image — the no-CLS native picture" summary="The general-purpose picture: lazy, async-decoded, REQUIRED intrinsic width and height (layout never shifts), alt semantics, failure fallback with src-change recovery. Lightbox is a dialog recipe, not built in.">
        <div class="flex flex-wrap gap-3">
          <span class="pill">no-CLS width/height</span>
          <span class="pill">lazy + async decode</span>
          <span class="pill">failure fallback · recovery</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
    <ComponentCanvas
      title="image"
      stage="center"
      description="Left: a real load. Right: a broken source exercising the fallback — the dashed frame plus glyph; a later src change re-arms the load."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/image.svelte"
        files={canvasFiles}
      >
        <div class="flex flex-wrap items-start gap-6">
          <Image src="/icon.svg" alt="the jixoai mark" width={96} height={96} />
          <Image src="/definitely-missing.png" alt="broken demo" width={96} height={96} />
        </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            the broken demo exercises the fallback (dashed frame plus glyph). alt empty-string
            opts into decorative; width and height are REQUIRED — the no-CLS contract is not
            optional.
          </PlayHelp>
        </PlayFields>
      {/snippet}
      </ComponentCanvas>
    </div>

    <div id="image-law" data-reveal="">
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

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Image variants" summary="Content or decorative, with the composed or default failure posture.">
    <div class="grid gap-4 sm:grid-cols-2">
      <div class="border border-border p-4">
        <p class="font-nav mb-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">content picture</p>
        <Image src="/icon.svg" alt="the jixoai mark" width={64} height={64} />
      </div>
      <div class="border border-border p-4">
        <p class="font-nav mb-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">decorative — alt=""</p>
        <Image src="/icon.svg" alt="" width={64} height={64} />
      </div>
      <div class="border border-border p-4">
        <p class="font-nav mb-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">default fallback</p>
        <Image src="/definitely-missing.png" alt="broken demo" width={64} height={64} />
      </div>
      <div class="border border-border p-4">
        <p class="font-nav mb-3 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">composed fallback slot</p>
        <Image src="/definitely-missing.png" alt="broken demo" width={64} height={64}>
          {#snippet fallback()}
            <span class="inline-flex items-center justify-center border border-dashed border-border bg-muted text-muted-foreground" style="width: 64px; height: 64px;">retry later</span>
          {/snippet}
        </Image>
      </div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="width and height are REQUIRED — the no-CLS contract is not optional."><CodeBlock code={usage} lang="svelte" meta="Image usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="A native img with real alt semantics; the fallback keeps the name and stays decorative when alt is empty."><A11yTable keys={[{ key: '—', action: 'Not interactive — a picture with alt semantics' }]} aria={[{ name: 'alt', value: 'string (required)', description: 'The picture’s meaning; "" marks it decorative.' }, { name: 'role / aria-label', value: 'img / "image unavailable"', description: 'On the default fallback frame — only when alt is non-empty.' }, { name: 'aria-hidden', value: 'true', description: 'On the fallback when alt="" keeps the picture decorative through failure.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="Utility-authored, zero css residue — the box is your intrinsic dims; density does not rescale it."><div class="flex flex-col gap-5"><DensityDemo><Image src="/icon.svg" alt="density sample" width={48} height={48} /></DensityDemo><TokenTable tokens={[{ name: 'intrinsic box', default: 'width/height (required)', source: 'structural', description: 'The no-CLS contract — the rendered img stays max-w-full h-auto.' }, { name: 'fallback frame', default: 'dashed border, muted fill', source: 'structural' }, { name: 'fallback glyph', default: '32px svg', source: 'structural' }, { name: '--jx-image', default: '32 / 36 / 40 / 48px', source: 'density', description: 'The density media-image alias (consumers may adopt it for boxes).' }, { name: '--jx-icon', default: '16 / 18 / 20 / 24px', source: 'density' }, { name: '--jx-inset', default: '8 / 8 / 12 / 16px', source: 'density' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props extend the native img attributes; alt, width, height are required."><PropsTable props={[{ name: 'alt', type: 'string', default: '—', description: 'The picture’s meaning; "" marks it decorative.', required: true }, { name: 'width', type: 'number | string', default: '—', description: 'REQUIRED intrinsic width — the no-CLS contract.', required: true }, { name: 'height', type: 'number | string', default: '—', description: 'REQUIRED intrinsic height — the no-CLS contract.', required: true }, { name: 'src', type: 'string', default: '—', description: 'Via native img attributes; a changed src re-arms the load after failure.' }, { name: 'fallback', type: 'Snippet', default: 'default frame', description: 'Composed failure state — keep the intrinsic dims in your slot markup.' }, { name: 'class', type: 'string', default: "''", description: 'Rendered width/height classes when different from intrinsic.' }]} /></SectionCard></div>
</div>
