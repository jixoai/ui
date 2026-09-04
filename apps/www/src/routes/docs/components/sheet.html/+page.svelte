<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import Sheet from '$lib/ui/sheet/sheet.svelte';
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
${close}

<PressButton onclick={() => (open = true)}>Filters</PressButton>
<Sheet bind:open title="Filters" side="right">
  <p>Filter controls — focus stays trapped, Escape closes.</p>
  {#snippet footer()}
    <PressButton onclick={() => (open = false)}>Apply</PressButton>
  {/snippet}
</Sheet>`;

  const canvasUsage = `<Sheet bind:open title="Filters" {side} size="24rem">
  <!-- body -->
</Sheet>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/sheet.svelte', content: sheetSource },
    { name: 'src/lib/ui/sheet-usage.svelte', content: canvasUsage },
  ];
</script>

<svelte:head>
  <title>Sheet · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai sheet: the side drawer as a dialog positioning variant — showModal, Escape, focus trap native; the panel docks to an edge and slides in along its axis. Backdrop click deliberately not wired."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>

  <div class="flex min-w-0 flex-col gap-8">
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · NativeHTML"
      title="sheet — a dialog that arrives from the side"
      summary="A POSITIONING/ANIMATION variant of the native dialog, not a second state machine: showModal() (focus trap, Escape, top layer native), the same generation-token close path, bind:open lifecycle. The panel docks to an edge and slides in along its axis. Backdrop click is deliberately NOT wired — sheet content is often a form; a stray click shouldn't destroy it."
    >
      <div class="flex flex-wrap gap-3">
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
      <div class="flex flex-wrap items-center gap-4">
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
    <p class="text-muted-foreground text-[13px]">Sheet body — a form, a list, anything. Focus is trapped; Escape and the × close.</p>
    {#snippet footer()}
      <PressButton onclick={() => (open = false)}>Apply</PressButton>
    {/snippet}
  </Sheet>

  
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Sheet variants" summary="Four docking sides, a size along the docked axis, and the floating-surface paint.">
    <div class="grid gap-4 md:grid-cols-3">
      <div class="border border-border p-4">
        <p class="font-nav mb-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">side</p>
        <p class="text-[13px] leading-6"><code class="text-accent">left | right (default) | top | bottom</code> — the panel docks full-length and slides in along its axis.</p>
      </div>
      <div class="border border-border p-4">
        <p class="font-nav mb-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">size</p>
        <p class="text-[13px] leading-6">CSS length along the docked axis — 24rem default drawer width; top/bottom panels cap at 85dvh.</p>
      </div>
      <div class="border border-border p-4">
        <p class="font-nav mb-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">variant</p>
        <p class="text-[13px] leading-6"><code class="text-accent">solid | acrylic | auto</code> (default) — the floating-surface paint family, sliding on top of the surface rise.</p>
      </div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Backdrop click is deliberately not wired — sheet content is often a form; close via ×, Escape, or your own footer action."><CodeBlock code={usage} lang="svelte" meta="Sheet usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="The native dialog carries the modal contract; title is REQUIRED — it is the dialog's accessible name."><A11yTable keys={[{ key: 'Tab', action: 'Cycles inside the drawer — the showModal() focus trap; the page behind is inert' }, { key: 'Escape', action: 'Cancel event, intercepted to share the 200ms animated close' }, { key: 'Enter / Space', action: 'Activate the focused control (× button, footer actions)' }]} aria={[{ name: 'aria-label', value: 'title (required)', description: 'On the dialog element — the title is the REQUIRED accessible name.' }, { name: 'role', value: 'dialog (native)', description: 'The platform element; focus trap and top layer are native.' }, { name: 'aria-label', value: '"Close"', description: 'On the × button.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="The drawer extent rides --jx-sheet-size; timing is a declared 200ms exception to the dialog family's 120ms."><div class="flex flex-col gap-5"><DensityDemo><div class="flex flex-col gap-3"><PressButton onclick={() => (open = true)}>open sheet</PressButton><span class="text-[12.5px] text-muted-foreground">the trigger inherits scope; the drawer surface inherits through the DOM tree.</span></div></DensityDemo><TokenTable tokens={[{ name: '--jx-sheet-size', default: '24rem (size prop)', source: 'component', description: 'Panel extent along the docked axis; side panels cap at 92vw.' }, { name: '--jx-scrollbar-thin', default: 'thin lane', source: 'component', description: 'Body scrollbar compensation in the scroll ring.' }, { name: 'slide timing', default: '200ms (declared exception)', source: 'structural' }, { name: 'top/bottom cap', default: '85dvh', source: 'structural' }, { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density' }, { name: '--jx-inset', default: '8 / 8 / 12 / 16px', source: 'density' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Eight props; the same bind:open lifecycle and close path as dialog.svelte."><PropsTable props={[{ name: 'open', type: 'boolean', default: 'false', description: 'Bindable open state — same contract as dialog.svelte.', bindable: true }, { name: 'side', type: "'left' | 'right' | 'top' | 'bottom'", default: "'right'", description: 'The edge the panel docks to; slides along that edge’s axis.' }, { name: 'title', type: 'string', default: '—', description: 'REQUIRED a11y: the dialog’s name (aria-label target).', required: true }, { name: 'children', type: 'Snippet', default: '—', description: 'Panel body.', required: true }, { name: 'header', type: 'Snippet', default: '—', description: 'Optional header row content beyond the title + ×.' }, { name: 'footer', type: 'Snippet', default: '—', description: 'Optional sticky footer action row.' }, { name: 'size', type: 'string', default: "'24rem' · Own default, not ambient", description: 'Drawer extent along the docked axis (CSS length).' }, { name: 'variant', type: "'solid' | 'acrylic' | 'auto'", default: "'auto' · Own default, not ambient", description: 'Floating-surface paint. Defaults: literal slot — own ’auto’, ambient when an axis opens.' }]} /></SectionCard></div>
</div>
