<!--
  Docs page for the separator family (ink-engine ruling, 2026-09-01).
  Intents:
  1. Hero + canvas: the native hr / ARIA-div pair over the contrast
     ghost (the hero summary is hand-written here — this page predates
     the CATALOG binding; the registry description is ZCode's lane).
  2. Ink-engine gallery: fused (the named ghost default) · solid (the
     --border plain-fill escape, the subtraction-ink exception — Owner
     amendment, 2026-09-08) · dashed · dense · dotted · wavy (masks
     over the ghost) + fade (the blend engine), with the auto-adaptive
     proof box over a light→dark→light tonal ramp.
  3. Length-is-layout demo, the W3C foundation, a11y/theming/api.
  (2026-09-02 fix wave: fade peak α 0.9→0.6; the proof-box captions
  ride solid chips so they stay legible across the ramp, and the copy
  no longer over-claims the fade at exact mid-gray — difference's one
  blind spot.)
-->
<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import Separator from '$lib/ui/separator/separator.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';

  // ToC outline: the length demo + the native base, in page order.

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import separatorSource from '$lib/ui/separator/separator.svelte?raw';

  // single usage sample: the drawer file and the body CodeBlock share it
  const usage = `<Separator />                        <!-- hr: the contrast ghost -->
<Separator orientation="vertical" />  <!-- ARIA div: inline peer split -->
<Separator variant="dashed" />        <!-- 6/4 dashes over the ghost -->
<Separator variant="wavy" />          <!-- the SVG sine mask -->
<Separator variant="fade" />          <!-- blend: transparent→dark→transparent -->
<Separator variant="solid" />         <!-- the --border plain-fill escape -->

<!-- length is layout: -->
<Separator class="my-6" />
<div class="h-5"><Separator orientation="vertical" /></div>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/separator.svelte', content: separatorSource },
    { name: 'src/lib/ui/separator-usage.svelte', content: usage },
  ];

  // ---- canvas-everywhere sweep (2026-09-08): hand-authored mirrors of
  // the effect-only demo regions below — the same-source resolveRawCode
  // migration of these strings is the recorded follow-up -------------
  const close = '</' + 'script>';

  // the ink-engine gallery (variants section): the seven-variant ladder
  // plus the auto-adaptive proof box over the tonal ramp
  const separatorInkDemo = `<script lang="ts">
  import Separator from '@ui/separator.svelte';
${close}

<div class="flex w-full max-w-lg flex-col gap-4">
  <div class="flex flex-col gap-1.5">
    <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">fused</span>
    <Separator />
    <span class="text-muted-foreground text-[12px]">the contrast ghost (default)</span>
  </div>
  <div class="flex flex-col gap-1.5">
    <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">solid</span>
    <Separator variant="solid" />
    <span class="text-muted-foreground text-[12px]">the plain-fill escape — var(--border), ghost off</span>
  </div>
  <div class="flex flex-col gap-1.5">
    <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">dashed</span>
    <Separator variant="dashed" />
    <span class="text-muted-foreground text-[12px]">6/4 dashes</span>
  </div>
  <div class="flex flex-col gap-1.5">
    <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">dense</span>
    <Separator variant="dense" />
    <span class="text-muted-foreground text-[12px]">3/3 dense dashes</span>
  </div>
  <div class="flex flex-col gap-1.5">
    <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">dotted</span>
    <Separator variant="dotted" />
    <span class="text-muted-foreground text-[12px]">a chain of dots</span>
  </div>
  <div class="flex flex-col gap-1.5">
    <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">wavy</span>
    <Separator variant="wavy" />
    <span class="text-muted-foreground text-[12px]">the SVG sine mask</span>
  </div>
  <div class="flex flex-col gap-1.5">
    <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">fade</span>
    <Separator variant="fade" />
    <span class="text-muted-foreground text-[12px]">blend: transparent → dark → transparent</span>
  </div>
</div>

<!-- the auto-adaptive proof: the ghost and its masks track the whole
     light→dark→light ramp; no color token anywhere -->
<div
  class="flex w-full max-w-lg flex-col gap-4 border border-border p-4"
  style="background: linear-gradient(90deg, oklch(0.98 0 0), oklch(0.35 0 0), oklch(0.98 0 0))"
>
  <Separator />
  <Separator variant="dashed" />
  <Separator variant="fade" />
</div>`;

  const separatorInkFiles: TreeFile[] = [
    { name: 'separator-ink-demo.svelte', content: separatorInkDemo, kind: 'usage' },
  ];

  // the length-is-layout demo (length-layout section)
  const separatorLengthDemo = `<script lang="ts">
  import Separator from '@ui/separator.svelte';
${close}

<div class="flex w-full max-w-md flex-col gap-5">
  <div class="flex flex-col">
    <span class="text-muted-foreground text-[11px]">full width — the default stretch</span>
    <Separator />
  </div>
  <div class="flex flex-col">
    <span class="text-muted-foreground text-[11px]">class="w-1/2" — any width class</span>
    <Separator class="w-1/2" />
  </div>
  <div class="flex flex-col">
    <span class="text-muted-foreground text-[11px]">class="my-6" — length is also rhythm</span>
    <Separator class="my-6" />
  </div>
  <div class="flex h-8 items-stretch gap-4 text-[13px]">
    <span>h-8 row</span>
    <Separator orientation="vertical" />
    <span>the rule fills the cross axis</span>
  </div>
</div>`;

  const separatorLengthFiles: TreeFile[] = [
    { name: 'separator-length-demo.svelte', content: separatorLengthDemo, kind: 'usage' },
  ];

  // the postures grid (types section): the native hr vs the ARIA div
  const separatorTypesDemo = `<script lang="ts">
  import Separator from '@ui/separator.svelte';
${close}

<div class="flex flex-wrap items-start gap-6">
  <div class="flex min-w-56 flex-col gap-3 border border-border p-4">
    <span class="font-nav text-primary text-[11px] uppercase tracking-[0.24em]">horizontal (default)</span>
    <Separator />
    <span class="text-muted-foreground text-[12.5px]">the native hr — thematic break between blocks</span>
  </div>
  <div class="flex min-w-56 flex-col items-center gap-3 border border-border p-4">
    <span class="font-nav text-primary self-start text-[11px] uppercase tracking-[0.24em]">vertical</span>
    <div class="flex h-10 items-stretch gap-4 text-[13px]">
      <span>first</span>
      <Separator orientation="vertical" />
      <span>second</span>
    </div>
    <span class="text-muted-foreground self-start text-[12.5px]">role=separator div — splits inline peers, stretches the cross axis</span>
  </div>
</div>`;

  const separatorTypesFiles: TreeFile[] = [
    { name: 'separator-types-demo.svelte', content: separatorTypesDemo, kind: 'usage' },
  ];
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
  // ---- the universal props demo (explicit-props W3-B) --------------------
  const universalUsage = `<!-- the eight-axis surface on the ink strip -->
<Separator density="small" />
<Separator size={14} variant="dashed" />`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/separator-universal.svelte', content: universalUsage },
  ];

</script>

<svelte:head>
  <title>Separator · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai separator: W3C-first — the horizontal separator IS the native hr; the vertical takes the ARIA route. The default variant is fused: the backdrop's own contrast ghost (backdrop-filter: contrast(0.5), auto-adaptive over any ground); dashed/dense/dotted/wavy are masks over it, fade rides a mix-blend-mode difference gradient, and solid is the plain-fill --border escape (the subtraction-ink exception) — zero color tokens elsewhere."
  />
</svelte:head>

<div
  class={cx(rt.shell)}
>
  <!-- ToC rail: DOM-first aside — desktop sticky right column, mobile the
       glass bar under the scaffold header (height 0, see toc.css) -->

  <div class={cx(rt.shellCol)}>
    <div data-reveal="">
      <SectionCard
        headingLevel={1}
        tone="hero"
        eyebrow="registry:ui · Layout"
        title="separator — <hr> is the separator"
        summary="The W3C already built this one: <hr> carries thematic-break semantics, announcements, and styling for free. Only the vertical posture — splitting inline peers — has no native element, so it takes the ARIA route: a div with role=separator. The ink paints no color: the default variant, fused, is the backdrop's own contrast ghost, every shaped variant rides the same engine, and solid is the one plain-fill escape."
      >
        <div class={cx(rt.wrap12)}>
          <span class="pill">native &lt;hr&gt;</span>
          <span class="pill">role=separator vertical</span>
          <span class="pill">contrast ghost ink</span>
          <span class="pill">7 variants · ghost + mask + blend</span>
        </div>
      </SectionCard>
    </div>

    <div data-reveal="">
      <ComponentCanvas
        title="separator"
        description="Horizontal renders the native hr; vertical renders the ARIA div and stretches its container's cross axis."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/separator.svelte"
        files={canvasFiles}
        stage="center"
      >
        <div class={cx(rt.col16, rt.wFull, rt.maxWMd)}>
          <p class={cx(rt.body13)}>A paragraph of ordinary copy above the rule.</p>
          <Separator />
          <div class={cx(rt.rowC16, rt.text13)}>
            <span>first</span>
            <Separator orientation="vertical" class={cx(rt.sepH4)} />
            <span>second</span>
            <Separator orientation="vertical" class={cx(rt.sepH4)} />
            <span>third</span>
          </div>
          <p class={cx(rt.body13)}>And copy below it — the thematic break reads natively.</p>
        </div>
        {#snippet playground()}
          <PlayFields>
            <PlayHelp>
              one prop, <code>orientation</code> — everything else is the
              element's own semantics. Width/height come from the class prop or the parent layout;
              the component ships no length API on purpose.
            </PlayHelp>
          </PlayFields>
        {/snippet}
      </ComponentCanvas>
    </div>

    <div id="variants" data-reveal="">
      <SectionCard
        family="variants"
        headerRegion="variants"
        eyebrow="ink engine"
        title="The ink engine — no color, only physics"
        summary="A separator paints no color (Owner ruling, 2026-09-01): border-color is for borders. The default variant is NAMED fused — the backdrop's own CONTRAST GHOST, a backdrop-filter: contrast(0.5) strip that reads as a tonal shift over any ground. Dashed, dense, dotted and wavy are MASKS over that same strip; fade rides the BLEND engine — an alpha-ramped white gradient under mix-blend-mode: difference, inverting the backdrop toward mid exactly as its alpha ramps: transparent → light → dark → light → transparent. The one exception: solid (Owner amendment, 2026-09-08) turns the ghost off and paints plain var(--border) — the escape for grounds where the ghost's exact-mid blind spot or a patterned backdrop defeats subtraction."
      >
        <ComponentCanvas title="separator · ink engine" stage="fill" files={separatorInkFiles}>
          <div class={cx(rt.col24)}>
            <div class={cx(rt.col16, rt.wFull, rt.maxWLg)}>
              {#each [['fused', 'the contrast ghost (default)'], ['solid', 'the plain-fill escape — var(--border), ghost off'], ['dashed', '6/4 dashes'], ['dense', '3/3 dense dashes'], ['dotted', 'a chain of dots'], ['wavy', 'the SVG sine mask'], ['fade', 'blend: transparent → dark → transparent']] as [v, label]}
                <div class={cx(rt.flex, rt.col, rt.gap6)}>
                  <span class={cx(rt.eyebrowPrimary)}>{v}</span>
                  <Separator variant={v} />
                  <span class={cx(rt.inkMuted, rt.text12)}>{label}</span>
                </div>
              {/each}
            </div>
            <div class={cx(rt.col16, rt.wFull, rt.maxWLg, rt.panel)}
              style="background: linear-gradient(90deg, oklch(0.98 0 0), oklch(0.35 0 0), oklch(0.98 0 0))"
            >
              <span class={cx(rt.sepChip11)}>auto-adaptive proof — over a light→dark→light gradient</span>
              <Separator />
              <Separator variant="dashed" />
              <Separator variant="fade" />
              <span class={cx(rt.sepChip12)}>the ghost and its masks track the whole ramp; the fade's blend eases toward exact mid-gray — its one blind spot — and stays a tonal shift everywhere else. No color token anywhere.</span>
            </div>
          </div>
        </ComponentCanvas>
      </SectionCard>
    </div>

    <div id="length-layout" data-reveal="">
      <SectionCard
        family="length-layout"
        headerRegion="length-layout"
        eyebrow="demo"
        title="Length is layout"
        summary="The component draws the line; the consumer decides how long it is. Horizontal rules stretch to their container (or any width class); vertical rules stretch the container's cross axis — put one in a fixed-height flex row and it fills it."
      >
        <ComponentCanvas title="separator · length" stage="fill" files={separatorLengthFiles}>
          <div class={cx(rt.col20, rt.wFull, rt.maxWMd)}>
            <div class={cx(rt.flex, rt.col)}>
              <span class={cx(rt.note11)}>full width — the default stretch</span>
              <Separator />
            </div>
            <div class={cx(rt.flex, rt.col)}>
              <span class={cx(rt.note11)}>class={cx(rt.sepWHalf)} — any width class</span>
              <Separator class={cx(rt.sepWHalf)} />
            </div>
            <div class={cx(rt.flex, rt.col)}>
              <span class={cx(rt.note11)}>class={cx(rt.sepMy24)} — length is also rhythm</span>
              <Separator class={cx(rt.sepMy24)} />
            </div>
            <div class={cx(rt.sepRow8)}>
              <span>h-8 row</span>
              <Separator orientation="vertical" />
              <span>the rule fills the cross axis</span>
            </div>
          </div>
        </ComponentCanvas>
      </SectionCard>
    </div>

    <div id="separator-base" data-reveal="">
      <SectionCard
        family="separator-base"
        headerRegion="separator-base"
        eyebrow="W3C foundation"
        title="What the platform gives"
        summary="No ARIA to maintain on the horizontal path — the browser announces <hr> as a separator to assistive tech. The vertical path is the WAI-ARIA separator pattern, aria-orientation included."
      >
        <CodeBlock code={usage} lang="svelte" meta="usage" />
      </SectionCard>
    </div>
  </div>
</div>

<div class={cx(rt.shellFlush)}>
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Types" summary="Two postures: the native hr for thematic breaks, the ARIA div for inline peer splits.">
    <ComponentCanvas title="separator · types" stage="center" files={separatorTypesFiles}>
      <div class={cx(rt.wrapStart24)}>
        <div class={cx(rt.col12, rt.sepMinW56, rt.panel)}><span class={cx(rt.eyebrowPrimary)}>horizontal (default)</span><Separator /><span class={cx(rt.inkMuted, rt.text125)}>the native hr — thematic break between blocks</span></div>
        <div class={cx(rt.col12, rt.itemsCenter, rt.sepMinW56, rt.panel)}><span class={cx(rt.eyebrowPrimary, rt.sepSelfStart)}>vertical</span><div class={cx(rt.sepRow10)}><span>first</span><Separator orientation="vertical" /><span>second</span></div><span class={cx(rt.inkMuted, rt.sepSelfStart, rt.text125)}>role=separator div — splits inline peers, stretches the cross axis</span></div>
      </div>
    </ComponentCanvas>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="One prop, no length API on purpose — length is your layout's job."><CodeBlock code={usage} lang="svelte" meta="Separator usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="Horizontal needs no ARIA at all — the browser announces hr natively; vertical carries the WAI-ARIA separator pattern."><A11yTable keys={[]} aria={[{ name: 'hr', value: 'native', description: 'Announced as a separator/thematic break by the platform — zero wiring owed' }, { name: 'role', value: 'separator', description: 'On the vertical path only (component-owned, not overridable)' }, { name: 'aria-orientation', value: '"vertical"', description: 'Set with the role on the vertical path' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Theming" summary="No color decision of its own — the ink is physics, not palette: the contrast ghost adapts to whatever ground it crosses, the blend fade inverts it, and the one plain fill (solid) simply reads the --border token. Length comes from layout."><div class={cx(rt.col24)}><DensityDemo><div class={cx(rt.sepRow8)}><span>a</span><Separator orientation="vertical" /><span>b</span></div></DensityDemo><TokenTable tokens={[{ name: 'contrast ghost', default: 'backdrop-filter: contrast(0.5)', source: 'ink engine', description: 'The default ink — the backdrop\'s own tonal shift, over any ground' }, { name: 'blend fade', default: 'mix-blend-mode: difference', source: 'ink engine', description: 'The alpha-ramped gradient inverts the backdrop toward mid: transparent → light → dark → light → transparent' }]} /></div></SectionCard></div>
  <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="Universal props"
      summary="The eight-axis surface (explicit-props): size · shape · radius · density · color · theme · elevation · motion — each axis takes named steps, auto (inherit the ambient context; stamps nothing), an exact number (px · coefficient · dp · hue per axis), or query() for responsive/container-conditional values. A strip consumes little of the paint surface — the supply chain is the point: the resolved lanes flow to sibling content through the broadcast."
    >
      <ComponentCanvas title="Separator · universal props" stage="fill" files={universalFiles}>
        <div class={cx(rt.gridSm2)}>
        <div class={cx(rt.panel)}><Separator density="small" /></div>
        <div class={cx(rt.panel)}><Separator density="large" /></div>
        <div class={cx(rt.panel)}><Separator variant="dashed" /></div>
        <div class={cx(rt.panel)}><Separator orientation="vertical" radius="medium" /></div>
        </div>
      </ComponentCanvas>
    </SectionCard>
  </div>

  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props from the Separator Props interface — everything else rides through as native hr attributes."><PropsTable universal props={[{ name: 'orientation', type: "'horizontal' | 'vertical'", default: "'horizontal'", description: 'horizontal renders the native hr; vertical renders the role=separator div. The mask axis swaps with it.' }, { name: 'variant', type: "'fused' | 'solid' | 'dashed' | 'dense' | 'dotted' | 'wavy' | 'fade'", default: "'fused' · Own default, not ambient", description: 'The ink geometry: fused is the bare contrast ghost (the named default); dashed (6/4), dense (3/3), dotted and wavy are masks over it; fade rides the blend engine; solid is the plain-fill var(--border) escape — the subtraction-ink exception (Owner 2026-09-08). Own default, not ambient (ink geometry is never a paint-zone rung).' }, { name: 'class', type: 'string', default: "''", description: 'Class passthrough — width/height/margin live here, by design.' }, { name: '...rest', type: 'HTMLAttributes<HTMLHRElement>', default: 'spread', description: 'Every other attribute lands on the element (vertical spreads onto the div).' }]} /></SectionCard></div>
</div>
