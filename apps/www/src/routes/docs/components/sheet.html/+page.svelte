<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import { rt } from '$lib/surface/routes.stylex';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import Sheet from '$lib/ui/sheet/sheet.svelte';
  import CardFooter from '$lib/ui/card/card-footer.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import { PlayFields, PlayRow, PlaySegmented, PlayHelp } from '$lib/playground';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import sheetSource from '$lib/ui/sheet/sheet.svelte?raw';

  const close = '</' + 'script>';

  // playground state (P1): the page owns the snapshot
  const canvasInitial = { side: 'right' as 'left' | 'right' | 'top' | 'bottom' };
  let open = $state(false);
  let side = $state<'left' | 'right' | 'top' | 'bottom'>(canvasInitial.side);
  // kit option map: the enum control speaks the typed union directly
  const sideOptions: { value: 'left' | 'right' | 'top' | 'bottom'; label: string }[] = [
    { value: 'right', label: 'right' },
    { value: 'left', label: 'left' },
    { value: 'top', label: 'top' },
    { value: 'bottom', label: 'bottom' },
  ];
  function resetCanvas(): void {
    side = canvasInitial.side;
  }

  // ToC outline: pairs with the section ids below, in page order.

  const usage = `<script lang="ts">
  import Sheet from '@ui/sheet.svelte';
  import CardFooter from '@ui/card/card-footer.svelte';
  import PressButton from '@ui/press-button.svelte';
${close}

<PressButton onclick={() => (open = true)}>Filters</PressButton>
<Sheet bind:open title="Filters" side="right">
  <p>Filter controls — focus stays trapped, Escape closes.</p>
  {#snippet footer()}
    <!-- the carved action band: the cluster fills the foot band
         vertically, the rim Separator above is its top edge -->
    <CardFooter>
      <PressButton onclick={() => (open = false)}>Apply</PressButton>
    </CardFooter>
  {/snippet}
</Sheet>`;

  const canvasUsage = `<Sheet bind:open title="Filters" {side} width="24rem">
  <!-- body -->
</Sheet>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/sheet.svelte', content: sheetSource },
    { name: 'src/lib/ui/sheet-usage.svelte', content: canvasUsage },
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
  // ---- the universal props demo (explicit-props W3-C) --------------------
  const universalUsage = `<!-- the §13 rename: a css WIDTH is 'width'; 'size' is the scale axis -->
<Sheet bind:open title="Filters" side="right" width="24rem">…</Sheet>
<!-- the §7 pair: the drawer's own level4, an explicit lane steps it -->
<Sheet bind:open title="Compact" width="18rem" elevation="level2">…</Sheet>`;
  const universalFiles: TreeFile[] = [
    { name: 'src/lib/ui/sheet-universal.svelte', content: universalUsage },
  ];
  let su = $state(false);
  let su2 = $state(false);
</script>

<svelte:head>
  <title>Sheet · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai sheet: the side drawer as a dialog positioning variant — showModal, Escape, focus trap native; the panel docks to an edge and slides in along its axis. Backdrop click deliberately not wired."
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
      title="sheet — a dialog that arrives from the side"
      summary="A POSITIONING/ANIMATION variant of the native dialog, not a second state machine: showModal() (focus trap, Escape, top layer native), the same generation-token close path, bind:open lifecycle. The panel docks to an edge and slides in along its axis. Backdrop click is deliberately NOT wired — sheet content is often a form; a stray click shouldn't destroy it."
    >
      <div class={cx(rt.wrap12)}>
        <span class="pill">4 sides</span>
        <span class="pill">no backdrop-click close</span>
        <span class="pill">same close path as dialog</span>
      </div>
    </SectionCard>
  </div>

  <div data-reveal="">
    <ComponentCanvas
      title="sheet"
      description="Pick a side in the playground, then open: the panel slides from that edge. Escape or the × closes through the shared fade."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/sheet.svelte"
      files={canvasFiles}
      stage="center"
      onreset={resetCanvas}
    >
      <div class={cx(rt.wrapRow16)}>
        <PressButton onclick={() => (open = true)}>Open sheet</PressButton>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayRow label="side">
            <PlaySegmented bind:value={side} options={sideOptions} />
          </PlayRow>
          <PlayHelp>
            size sets the panel's extent along its docked axis (CSS length; 24rem default). Footer
            and header are snippet slots; the body scrolls with overscroll containment.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <Sheet bind:open title="Filters" {side}>
    <p class={cx(rt.text13, rt.inkMuted)}>Sheet body — a form, a list, anything. Focus is trapped; Escape and the × close.</p>
    {#snippet footer()}
      <CardFooter>
        <PressButton onclick={() => (open = false)}>Apply</PressButton>
      </CardFooter>
    {/snippet}
  </Sheet>


  </div>
</div>

<div class={cx(rt.shellFlush, rt.flex, rt.col, rt.gap32)}>
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Sheet variants" summary="Four docking sides, a size along the docked axis, and the floating-surface paint.">
    <div class={cx(rt.shGrid)}>
      <div class={cx(rt.panel)}>
        <p class={cx(rt.eyebrow, rt.inkMuted, rt.mb8)}>side</p>
        <p class={cx(rt.body13)}><code class={cx(rt.inkAccent)}>left | right (default) | top | bottom</code> — the panel docks full-length and slides in along its axis.</p>
      </div>
      <div class={cx(rt.panel)}>
        <p class={cx(rt.eyebrow, rt.inkMuted, rt.mb8)}>size</p>
        <p class={cx(rt.body13)}>CSS length along the docked axis — 24rem default drawer width; top/bottom panels cap at 85dvh.</p>
      </div>
      <div class={cx(rt.panel)}>
        <p class={cx(rt.eyebrow, rt.inkMuted, rt.mb8)}>variant</p>
        <p class={cx(rt.body13)}><code class={cx(rt.inkAccent)}>solid | acrylic | auto</code> (default) — the floating-surface paint family, sliding on top of the surface rise.</p>
      </div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Backdrop click is deliberately not wired — sheet content is often a form; close via ×, Escape, or your own footer action."><CodeBlock code={usage} lang="svelte" meta="Sheet usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The native dialog carries the modal contract; title is REQUIRED — it is the dialog's accessible name."><A11yTable keys={[{ key: 'Tab', action: 'Cycles inside the drawer — the showModal() focus trap; the page behind is inert' }, { key: 'Escape', action: 'Cancel event, intercepted to share the 200ms animated close' }, { key: 'Enter / Space', action: 'Activate the focused control (× button, footer actions)' }]} aria={[{ name: 'aria-label', value: 'title (required)', description: 'On the dialog element — the title is the REQUIRED accessible name.' }, { name: 'role', value: 'dialog (native)', description: 'The platform element; focus trap and top layer are native.' }, { name: 'aria-label', value: '"Close"', description: 'On the × button.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="The drawer extent rides --jx-sheet-size; timing is a declared 200ms exception to the dialog family's 120ms."><div class={cx(rt.flex, rt.col, rt.gap20)}><DensityDemo><div class={cx(rt.col12)}><PressButton onclick={() => (open = true)}>open sheet</PressButton><span class={cx(rt.text125, rt.inkMuted)}>the trigger inherits scope; the drawer surface inherits through the DOM tree.</span></div></DensityDemo><TokenTable tokens={[{ name: '--jx-sheet-size', default: '24rem (size prop)', source: 'component', description: 'Panel extent along the docked axis; side panels cap at 92vw.' }, { name: '--jx-scrollbar-thin', default: 'thin lane', source: 'component', description: 'Body scrollbar compensation in the scroll ring.' }, { name: 'slide timing', default: '200ms (declared exception)', source: 'structural' }, { name: 'top/bottom cap', default: '85dvh', source: 'structural' }, { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density' }, { name: '--jx-inset', default: '8 / 8 / 12 / 16px', source: 'density' }]} /></div></SectionCard></div>

  <div id="universal-props" data-reveal="">
    <SectionCard
      family="universal-props"
      headerRegion="universal-props"
      eyebrow="axes"
      title="Universal props"
      summary="The eight-axis surface (explicit-props): size · shape · radius · density · color · theme · elevation · motion — each axis takes named steps, auto (inherit the ambient context; stamps nothing), an exact number (px · coefficient · dp · hue per axis), or query() for responsive/container-conditional values. The drawer carries its OWN elevation — level4 (8dp, the dialog rung it docks beside). §13 RENAME (W3-C): the css-width prop is width now — never size; the freed name belongs to the universal size lane (root font-size)."
    >
      <ComponentCanvas title="Sheet · universal props" stage="fill" files={universalFiles}>
<div class={cx(rt.wrap12)}>
          <PressButton onclick={() => (su = true)}>width 24rem · level4 default</PressButton>
          <PressButton onclick={() => (su2 = true)}>width 18rem · level2</PressButton>
        </div>
        <Sheet bind:open={su} title="Filters" side="right"><p class={cx(rt.text13)}>width defaults to the contract own 24rem; the drawer rides its own elevation level4 (8dp).</p></Sheet>
        <Sheet bind:open={su2} title="Compact" side="right" width="18rem" elevation="level2"><p class={cx(rt.text13)}>An explicit width lane and an explicit elevation lane — the §13 rename keeps size free for the scale axis.</p></Sheet>
      </ComponentCanvas>
    </SectionCard>
  </div>

  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Eight props; the same bind:open lifecycle and close path as dialog.svelte."><PropsTable universal props={[{ name: 'open', type: 'boolean', default: 'false', description: 'Bindable open state — same contract as dialog.svelte.', bindable: true }, { name: 'side', type: "'left' | 'right' | 'top' | 'bottom'", default: "'right'", description: 'The edge the panel docks to; slides along that edge’s axis.' }, { name: 'title', type: 'string', default: '—', description: 'REQUIRED a11y: the dialog’s name (aria-label target).', required: true }, { name: 'children', type: 'Snippet', default: '—', description: 'Panel body.', required: true }, { name: 'header', type: 'Snippet', default: '—', description: 'Optional header row content beyond the title + ×.' }, { name: 'footer', type: 'Snippet', default: '—', description: 'Optional sticky footer action row.' }, { name: 'width', type: 'string', default: "'24rem' · Own default, not ambient", description: 'Drawer extent along the docked axis (CSS length). §13 RENAME (W3-C): the prop was `size` — a css width is not the scale axis; the freed name belongs to the universal size lane (root font-size).' }, { name: 'variant', type: "'solid' | 'acrylic' | 'auto'", default: "'auto' · Own default, not ambient", description: 'Floating-surface paint. Defaults: literal slot — own ’auto’, ambient when an axis opens.' }]} /></SectionCard></div>
</div>
