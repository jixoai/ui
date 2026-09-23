<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import HoverCard from '$lib/ui/hover-card/hover-card.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import hoverCardSource from '$lib/ui/hover-card/hover-card.svelte?raw';

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import HoverCard from '@ui/hover-card.svelte';
${close}

<HoverCard>
  {#snippet trigger()}
    <a href="/team/gaubee">@gaubee</a>
  {/snippet}
  <div class="flex flex-col gap-2">
    <p><strong>Gaubee</strong> — systems</p>
    <p>component grammar, terminal surfaces</p>
  </div>
</HoverCard>`;

  const canvasUsage = `<HoverCard>
  {#snippet trigger()}<a href="#">@gaubee</a>{/snippet}
  <div>…rich card…</div>
</HoverCard>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/hover-card.svelte', content: hoverCardSource },
    { name: 'src/lib/ui/hover-card-usage.svelte', content: canvasUsage },
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
          : Object.entries(style ?? {}).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
  // ---- the universal props demo (explicit-props W3-C) --------------------
  const universalUsage = `<HoverCard elevation="level3">{#snippet trigger()}…trigger…{/snippet}…card…</HoverCard>`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/hover-card-universal.svelte', content: universalUsage },
  ];

</script>

<svelte:head>
  <title>Hover card · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai hover card: the rich interactive cousin of tooltip — same intent model, but the panel is content you can hover into and click; crossings between trigger and card never dismiss."
  />
</svelte:head>

<div
  class={cx(rt.shell)}
>

  <div class={cx(rt.shellCol)}>
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · NativeHTML"
      title="hover card — intent with an interactive panel"
      summary="The tooltip's intent model (hover delay in, cancellable close grace, focus opens instantly, Escape closes) on a popover=manual panel — but the card is interactive content: pointer and focus CROSSINGS between trigger and card never dismiss; only a real exit or Escape does. No role=tooltip and no aria-describedby — the card is supplementary rich content, not a description."
    >
      <div class={cx(rt.wrap12)}>
        <span class="pill">crossing-safe grace</span>
        <span class="pill">focus opens</span>
        <span class="pill">CSS anchoring</span>
      </div>
    </SectionCard>
  </div>

  <div data-reveal="">
    <ComponentCanvas
      title="hover card"
      description="Hover the handle, then MOVE ONTO the card — it stays. Click the link inside it. Tab to the trigger: the card opens instantly and stays while focus crosses into it."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/hover-card.svelte"
      files={canvasFiles}
      stage="center"
    >
      <p class={cx(rt.hcBody)}>
        shipped by
        <HoverCard>
          {#snippet trigger()}
            <a href="/docs/components.html" class={cx(rt.inkPrimary, rt.underline, rt.dotted, rt.hcOffset4)}>@gaubee</a>
          {/snippet}
          <div class={cx(rt.col8)}>
            <p class={cx(rt.fontNav, rt.text13, rt.upper, rt.track12)}>Gaubee — systems</p>
            <p class={cx(rt.text125, rt.inkMuted)}>Component grammar, terminal surfaces, the one-brand-hue law.</p>
            <p class={cx(rt.text125)}><a href="/docs/components.html" class={cx(rt.inkPrimary, rt.underline, rt.dotted)}>the component index</a> — the card stays while focus crosses onto this link (the focus-crossing grace).</p>
          </div>
        </HoverCard>
        under MIT.
      </p>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            text-only hints are tooltip.svelte's job; this surface is for cards you can read AND
            click. Delays are hover-card paced: 300ms in, 200ms grace.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>


  </div>
</div>

<div class={cx(rt.shellFlush, rt.flex, rt.col, rt.gap32)}>
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Hover card variants" summary="Placement and surface paint are the knobs; the delays are hover-card paced by default.">
    <div class={cx(rt.hcGrid)}>
      <div class={cx(rt.panel)}>
        <p class={cx(rt.eyebrow, rt.inkMuted, rt.mb8)}>placement</p>
        <p class={cx(rt.body13)}><code class={cx(rt.inkAccent)}>top | bottom | left | right</code> — bottom (under, like a peek) is the convention.</p>
      </div>
      <div class={cx(rt.panel)}>
        <p class={cx(rt.eyebrow, rt.inkMuted, rt.mb8)}>variant</p>
        <p class={cx(rt.body13)}><code class={cx(rt.inkAccent)}>solid | acrylic | auto</code> (default) — the floating-surface paint family.</p>
      </div>
      <div class={cx(rt.panel)}>
        <p class={cx(rt.eyebrow, rt.inkMuted, rt.mb8)}>delays</p>
        <p class={cx(rt.body13)}><code class={cx(rt.inkAccent)}>openDelay=300</code>, <code class={cx(rt.inkAccent)}>closeDelay=200</code> — tunable per instance.</p>
      </div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="The trigger snippet is usually a link; the card is free content — headings, links, images."><CodeBlock code={usage} lang="svelte" meta="HoverCard usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="No tooltip role and no aria-describedby — the card is supplementary rich content, not a description."><A11yTable keys={[{ key: 'Tab', action: 'Focus opens the card instantly; focus crossings into the card never dismiss' }, { key: 'Escape', action: 'Closes the card immediately (global)' }]} aria={[{ name: 'role', value: 'none imposed', description: 'Not role=tooltip — compose headings/links inside; the card is content.' }, { name: 'aria-describedby', value: '—', description: 'Deliberately absent: the card is not a description of the trigger.' }, { name: 'popover', value: 'manual', description: 'Light dismiss stays OFF — pointer and focus crossings must not dismiss.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="The panel rides the shared surface-motion kernel and the jx-surface paint law."><div class={cx(rt.flex, rt.col, rt.gap20)}><DensityDemo><HoverCard><p class={cx(rt.text125)}>hover the trigger — the card measures panel↔anchor live.</p>{#snippet trigger()}<span class={cx(rt.inkPrimary, rt.underline, rt.dotted, rt.hcOffset4)}>@density</span>{/snippet}</HoverCard></DensityDemo><TokenTable tokens={[{ name: '--jx-hover-{id}', default: 'anchor-name', source: 'component', description: 'Per-instance CSS anchor the panel positions against.' }, { name: '--jx-p', default: '0 → 1 timeline', source: 'component', description: 'The surface-motion kernel driving open/close.' }, { name: 'panel width', default: 'max min(88vw, 20rem)', source: 'structural' }, { name: 'open / close delays', default: '300ms / 200ms', source: 'structural' }, { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density' }, { name: '--jx-inset', default: '8 / 8 / 12 / 16px', source: 'density' }]} /></div></SectionCard></div>

  <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="Universal props"
      summary="The eight-axis surface (explicit-props): size · shape · radius · density · color · theme · elevation · motion — each axis takes named steps, auto (inherit the ambient context; stamps nothing), an exact number (px · coefficient · dp · hue per axis), or query() for responsive/container-conditional values. The peek card carries its OWN elevation — level2 (3dp, the anchored rung): the theme's level table pairs the shadow recipe with the ladder rung; the carriers stamp the promoted panel root (self-carried across the top layer)."
    >
      <ComponentCanvas title="HoverCard · universal props" stage="fill" files={universalFiles}>
<div class={cx(rt.wrap12)}>
          <HoverCard>{#snippet trigger()}<span class={cx(rt.text13)}>level2 · default</span>{/snippet}<p class={cx(rt.text13)}>3dp + the surface-container-low rung — the peek card's own rung.</p></HoverCard>
          <HoverCard elevation="level3">{#snippet trigger()}<span class={cx(rt.text13)}>level3</span>{/snippet}<p class={cx(rt.text13)}>6dp + the surface-container rung.</p></HoverCard>
        </div>
      </ComponentCanvas>
    </SectionCard>
  </div>

  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Eight named props plus the eight universal axes (sixteen interface members; the axes fold below per the convention); trigger and children are the two required snippets."><PropsTable universal props={[{ name: 'id', type: 'string', default: 'auto', description: 'Panel id; also derives the CSS anchor name.' }, { name: 'children', type: 'Snippet', default: '—', description: 'The card content — compose freely (headings, links, images).', required: true }, { name: 'trigger', type: 'Snippet', default: '—', description: 'The trigger content; the wrapper span carries the anchoring.', required: true }, { name: 'placement', type: "'top' | 'bottom' | 'left' | 'right'", default: "'bottom'", description: 'Anchored side — bottom (under, like a peek) is the convention.' }, { name: 'openDelay', type: 'number', default: '300', description: 'Hover delay before the card opens (ms).' }, { name: 'closeDelay', type: 'number', default: '200', description: 'Close grace spanned across trigger AND panel (ms).' }, { name: 'variant', type: "'solid' | 'acrylic' | 'auto'", default: "'auto' · Own default, not ambient", description: 'Floating-surface paint. Defaults: literal slot — own \'auto\', ambient when an axis opens.' }, { name: 'class', type: 'string', default: "''", description: 'Forwarded to the trigger wrapper.' }]} /></SectionCard></div>
</div>
