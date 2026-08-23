<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import PressButton from '$lib/ui/press-button.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Sheet from '$lib/ui/sheet.svelte';
  import Toc from '$lib/ui/toc.svelte';
  import Toggle from '$lib/ui/toggle.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import sheetSource from '$lib/ui/sheet.svelte?raw';

  const close = '</' + 'script>';

  // playground state (P1): the page owns the snapshot
  const canvasInitial = { side: 'right' as 'left' | 'right' | 'top' | 'bottom' };
  let open = $state(false);
  let side = $state<'left' | 'right' | 'top' | 'bottom'>(canvasInitial.side);
  function resetCanvas(): void {
    side = canvasInitial.side;
  }

  // ToC outline: pairs with the section ids below, in page order.
  const tocSections = [{ id: 'sheet-base', label: 'usage' }];

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
  <!-- ToC rail: desktop sticky right column, mobile glass row (toc.css) -->
  <aside class="jx-toc-aside" aria-label="On this page">
    <Toc sections={tocSections} title="on this page" scrollRoot=".jx-shell-body" />
  </aside>

  <div class="flex min-w-0 flex-col gap-8">
  <div data-reveal="" use:reveal>
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

  <div data-reveal="" use:reveal>
    <ComponentCanvas
      title="sheet"
      description="Pick a side in the playground, then open: the panel slides from that edge. Escape or the × closes through the shared fade."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/sheet.svelte"
      files={canvasFiles}
      onreset={resetCanvas}
      echo={[{ label: 'side', value: side }]}
    >
      <div class="flex flex-wrap items-center gap-4">
        <PressButton onclick={() => (open = true)}>Open sheet</PressButton>
      </div>
      {#snippet playground()}
        <div class="flex flex-col gap-2">
          {#each ['right', 'left', 'top', 'bottom'] as s (s)}
            <Toggle checked={side === s} label={s} onchange={(e) => { side = s; }} />
          {/each}
        </div>
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          size sets the panel's extent along its docked axis (CSS length; 24rem default). Footer
          and header are snippet slots; the body scrolls with overscroll containment.
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>

  <Sheet bind:open title="Filters" {side}>
    <p class="text-muted-foreground text-[13px]">Sheet body — a form, a list, anything. Focus is trapped; Escape and the × close.</p>
    {#snippet footer()}
      <PressButton onclick={() => (open = false)}>Apply</PressButton>
    {/snippet}
  </Sheet>

  <div id="sheet-base" data-reveal="" use:reveal>
    <SectionCard family="sheet-base" headerRegion="sheet-base" eyebrow="NativeHTML 基座" title="Usage">
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
  </div>
</div>
