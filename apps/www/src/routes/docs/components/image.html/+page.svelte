<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import { rt } from '$lib/surface/routes.stylex';
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

  // the page's local join (the separator serialize law): plain
  // strings pass through whole; stylex objects contribute their
  // string members ($$css dropped).
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
  // ---- the universal props demo (explicit-props W3-D5) --------------------
  const universalUsage = `<Image src="/icon.svg" alt="the jixoai mark" width={96} height={96} size={18} />`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/universal-props-demo.svelte', content: universalUsage },
  ];

</script>

<svelte:head>
  <title>Image · jixoai-ui</title>
  <meta name="description" content="The general-purpose picture: lazy, async-decoded, REQUIRED intrinsic width and height (layout never shifts), alt semantics, failure fallback with src-change recovery. Lightbox is a dialog recipe, not built in." />
</svelte:head>

<div
  class={cx(rt.shell)}
>

  <div class={cx(rt.shellCol)}>
    <div data-reveal="">
      <SectionCard headingLevel={1} tone="hero" eyebrow="registry:ui · General" title="image — the no-CLS native picture" summary="The general-purpose picture: lazy, async-decoded, REQUIRED intrinsic width and height (layout never shifts), alt semantics, failure fallback with src-change recovery. Lightbox is a dialog recipe, not built in.">
        <div class={cx(rt.wrap12)}>
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
        <div class={cx(rt.wrapStart24)}>
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

<div class={cx(rt.shellFlush)}>
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Image variants" summary="Content or decorative, with the composed or default failure posture.">
    <div class={cx(rt.gridSm2)}>
      <div class={cx(rt.panel)}>
        <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>content picture</p>
        <Image src="/icon.svg" alt="the jixoai mark" width={64} height={64} />
      </div>
      <div class={cx(rt.panel)}>
        <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>decorative — alt=""</p>
        <Image src="/icon.svg" alt="" width={64} height={64} />
      </div>
      <div class={cx(rt.panel)}>
        <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>default fallback</p>
        <Image src="/definitely-missing.png" alt="broken demo" width={64} height={64} />
      </div>
      <div class={cx(rt.panel)}>
        <p class={cx(rt.eyebrow, rt.mb12, rt.inkMuted)}>composed fallback slot</p>
        <Image src="/definitely-missing.png" alt="broken demo" width={64} height={64}>
          {#snippet fallback()}
            <span class={cx(rt.inlineFlex, rt.itemsCenter, rt.justifyCenter, rt.imFallbackFrame, rt.bgMuted, rt.inkMuted)} style="width: 64px; height: 64px;">retry later</span>
          {/snippet}
        </Image>
      </div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="width and height are REQUIRED — the no-CLS contract is not optional."><CodeBlock code={usage} lang="svelte" meta="Image usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="A native img with real alt semantics; the fallback keeps the name and stays decorative when alt is empty."><A11yTable keys={[{ key: '—', action: 'Not interactive — a picture with alt semantics' }]} aria={[{ name: 'alt', value: 'string (required)', description: 'The picture’s meaning; "" marks it decorative.' }, { name: 'role / aria-label', value: 'img / "image unavailable"', description: 'On the default fallback frame — only when alt is non-empty.' }, { name: 'aria-hidden', value: 'true', description: 'On the fallback when alt="" keeps the picture decorative through failure.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="Utility-authored, zero css residue — the box is your intrinsic dims; density does not rescale it."><div class={cx(rt.col20)}><DensityDemo><Image src="/icon.svg" alt="density sample" width={48} height={48} /></DensityDemo><TokenTable tokens={[{ name: 'intrinsic box', default: 'width/height (required)', source: 'structural', description: 'The no-CLS contract — the rendered img stays max-w-full h-auto.' }, { name: 'fallback frame', default: 'dashed border, muted fill', source: 'structural' }, { name: 'fallback glyph', default: '32px svg', source: 'structural' }, { name: '--jx-image', default: '32 / 36 / 40 / 48px', source: 'density', description: 'The density media-image alias (consumers may adopt it for boxes).' }, { name: '--jx-icon', default: '16 / 18 / 20 / 24px', source: 'density' }, { name: '--jx-inset', default: '8 / 8 / 12 / 16px', source: 'density' }]} /></div></SectionCard></div>
  <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="Universal props"
      summary="The eight-axis surface (explicit-props), the native-wrapper rule: the family owns only the axis names it destructures — width/height stay the no-CLS contract own and the rest spread keeps forwarding. The carriers stamp the img root AND join the failure panel dimension literals: the surface survives a broken source. Size scales the fallback copy; radius supplies the concentric anchor."
    >
      <ComponentCanvas title="image · universal props" stage="fill" files={universalFiles}>
<div class={cx(rt.panel)}><Image src="/icon.svg" alt="the jixoai mark" width={96} height={96} size={18} /></div>
      <div class={cx(rt.panel)}><Image src="/icon.svg" alt="named steps" width={96} height={96} size="medium" radius="large" /></div>
      </ComponentCanvas>
    </SectionCard>
  </div>

  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props extend the native img attributes; alt, width, height are required."><PropsTable props={[{ name: 'alt', type: 'string', default: '—', description: 'The picture’s meaning; "" marks it decorative.', required: true }, { name: 'width', type: 'number | string', default: '—', description: 'REQUIRED intrinsic width — the no-CLS contract.', required: true }, { name: 'height', type: 'number | string', default: '—', description: 'REQUIRED intrinsic height — the no-CLS contract.', required: true }, { name: 'src', type: 'string', default: '—', description: 'Via native img attributes; a changed src re-arms the load after failure.' }, { name: 'fallback', type: 'Snippet', default: 'default frame', description: 'Composed failure state — keep the intrinsic dims in your slot markup.' }, { name: 'class', type: 'string', default: "''", description: 'Rendered width/height classes when different from intrinsic.' }]} /></SectionCard></div>
</div>
