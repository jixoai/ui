<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import PressButton from '$lib/ui/press-button.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Tooltip from '$lib/ui/tooltip.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import tooltipSource from '$lib/ui/tooltip.svelte?raw';

  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import Tooltip from '@ui/tooltip.svelte';
  import PressButton from '@ui/press-button.svelte';
${close}

<Tooltip text="Copy install command">
  <PressButton>copy</PressButton>
</Tooltip>

<!-- placement + opt-in hover-intent delay -->
<Tooltip text="Below the trigger" placement="bottom" openDelay={150}>…</Tooltip>

<!-- opt-in pointer pin: aimed at the anchor point the placement names -->
<Tooltip text="Aimed at the anchor's top-center" arrow>…</Tooltip>
<Tooltip text="Aimed at the anchor's bottom-end corner" arrow placement="bottom-end">…</Tooltip>`;

  const canvasUsage = `<Tooltip text="Copy install command">
  <PressButton>copy</PressButton>
</Tooltip>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/tooltip.svelte', content: tooltipSource },
    { name: 'src/lib/ui/tooltip-usage.svelte', content: canvasUsage },
  ];

  // ToC outline: pairs with the section ids below, in page order.
</script>

<svelte:head>
  <title>Tooltip · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai tooltip: a popover=manual panel on the popover laws — CSS Anchor Positioning, zero JS geometry — with the hover/focus intent model CSS alone cannot do. Non-interactive by contract."
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
      title="tooltip — hover intent on the popover laws"
      summary="A popover=manual panel (no light dismiss — the tip owns its exit) anchored through CSS Anchor Positioning like popover.svelte, zero JS geometry. The component exists for the one thing CSS alone cannot do: intent — pointerenter opens after a delay, the close delay lets the pointer cross onto the tip, focus opens immediately, Escape closes."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">popover=manual</span>
        <span class="pill">opens instantly · 100ms close grace</span>
        <span class="pill">focus opens instantly</span>
        <span class="pill">aria-describedby</span>
        <span class="pill">opt-in pointer pin</span>
      </div>
    </SectionCard>
  </div>

  <div data-reveal="">
    <ComponentCanvas
      title="tooltip"
      description="Hover the button — the tip shows immediately (a hover-intent delay is opt-in through openDelay), then focus it with the keyboard — two intent paths, one tip. Escape dismisses; moving the pointer onto the tip keeps it open."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/tooltip.svelte"
      files={canvasFiles}
    >
      <div class="flex flex-wrap items-center gap-4">
        <Tooltip text="Copy the install command to your clipboard">
          <PressButton>copy</PressButton>
        </Tooltip>
        <Tooltip text="Below the trigger, for toolbar bottoms" placement="bottom">
          <PressButton variant="outline">bottom</PressButton>
        </Tooltip>
        <Tooltip text="A pin aimed at the anchor's top-center" arrow>
          <PressButton variant="outline">arrow</PressButton>
        </Tooltip>
        <Tooltip text="Aimed at the anchor's bottom-end corner" arrow placement="bottom-end">
          <PressButton variant="outline">arrow · bottom-end</PressButton>
        </Tooltip>
        <Tooltip text="Clamped toward the anchor's top-start corner" arrow placement="top-start">
          <PressButton variant="outline">arrow · top-start</PressButton>
        </Tooltip>
      </div>
      {#snippet playground()}
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          the tip is non-interactive by contract — actionable content belongs in a popover, where
          light dismiss and real focus behavior apply. <code class="text-accent">text</code> is
          plain string; hidden popover content is display:none, so the permanent
          <code class="text-accent">aria-describedby</code> pairing only reads while shown.
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="tooltip-base" data-reveal="">
    <SectionCard
      family="tooltip-base"
      headerRegion="tooltip-base"
      eyebrow="NativeHTML 基座"
      title="What the platform gives, what intent adds"
      summary="The Popover API gives the top layer, Escape plumbing and manual semantics; CSS Anchor Positioning gives placement with zero JS geometry. The intent model — hover delay, close grace, focus immediacy — is the component's entire reason to exist."
    >
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
  </div>
</div>
