<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import Tooltip from '$lib/ui/tooltip/tooltip.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import tooltipSource from '$lib/ui/tooltip/tooltip.svelte?raw';

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

  // Material3 usage section — the intent-model snippet, verbatim.
  const usageCode = usage;

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
      stage="center"
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
        <PlayFields>
          <PlayHelp>
            the tip is non-interactive by contract — actionable content belongs in a popover,
            where light dismiss and real focus behavior apply. <code>text</code> is plain string;
            hidden popover content is display:none, so the permanent <code>aria-describedby</code>
            pairing only reads while shown.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="tooltip-base" data-reveal="">
    <SectionCard
      family="tooltip-base"
      headerRegion="tooltip-base"
      eyebrow="W3C foundation"
      title="What the platform gives, what intent adds"
      summary="The Popover API gives the top layer, Escape plumbing and manual semantics; CSS Anchor Positioning gives placement with zero JS geometry. The intent model — hover delay, close grace, focus immediacy — is the component's entire reason to exist."
    >
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
  </div>
</div>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Tooltip variants" summary="Six placements across the anchored sides; the arrow opts into a notch cut from the bubble itself.">
    <div class="grid gap-4 sm:grid-cols-3">
      <div class="border border-border p-4"><Tooltip text="The default anchored side"><PressButton variant="outline">top</PressButton></Tooltip></div>
      <div class="border border-border p-4"><Tooltip text="For toolbar bottoms" placement="bottom"><PressButton variant="outline">bottom</PressButton></Tooltip></div>
      <div class="border border-border p-4"><Tooltip text="Corner aim through the notch" arrow placement="top-end"><PressButton variant="outline">arrow · top-end</PressButton></Tooltip></div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="Wrap the trigger; the tip is non-interactive by contract — actionable content belongs in a popover."><CodeBlock code={usageCode} lang="svelte" meta="Tooltip usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="Hover and focus are two intent paths into one tip; the pairing only reads while the panel is shown."><A11yTable keys={[{ key: 'Tab', action: 'Focus opens the tip immediately; focus leaving the trigger closes it' }, { key: 'Escape', action: 'Closes the tip now (manual popovers skip the native Esc path)' }]} aria={[{ name: 'aria-describedby', value: '{id} → panel', description: 'The wrapper points at the tip permanently; hidden popover content is display:none, so it only reads while shown.' }, { name: 'role', value: 'tooltip', description: 'The popover panel carries the tooltip role.' }, { name: 'popover', value: 'manual', description: 'Top-layer panel with no light dismiss — the tip owns its exit.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="The panel rides the jx-surface paint law and the WAAPI motion kernel; anchor geometry and the notch are token-authored."><div class="flex flex-col gap-5"><DensityDemo><Tooltip text="The trigger rhythm follows the scope"><PressButton>scoped</PressButton></Tooltip></DensityDemo><TokenTable tokens={[{ name: '--jx-tip-{id}', default: 'anchor-name', source: 'component', description: 'Per-instance CSS anchor the panel positions against.' }, { name: '--jx-tip-gap', default: '6px', source: 'component', description: 'Anchor gap margin between trigger and panel.' }, { name: '--jx-tip-notch', default: '8px', source: 'component', description: 'Reserved arrow strip depth (arrow variant), both block sides.' }, { name: '--jx-tip-shape', default: 'authored at open', source: 'component', description: 'SVG mask path of bubble + tab, authored by aimPin per open.' }, { name: '--jx-surface-ring / -inner', default: 'mask layers', source: 'component', description: 'The 1px masked border ring, subtract-composited.' }, { name: '--jx-surface-in-x/y · -ox/-oy', default: 'measured vectors', source: 'component', description: 'Slide-in and shadow offsets from the post-flip geometry.' }, { name: '--jx-p', default: 'parked at 1', source: 'component', description: 'Parked inline so the jx-waapi formulas compute the resting materials.' }, { name: '--jx-hit', default: '28 / 32 / 40 / 48px', source: 'density', description: 'Trigger target through the composed control.' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Props extend a plain wrapper span; placements cover the six anchored positions and their corner aims."><PropsTable props={[{ name: 'text', type: 'string', default: '—', description: 'The tip itself — plain text; composed content belongs in a popover.', required: true }, { name: 'placement', type: "'top' | 'bottom' | 'top-start' | 'bottom-start' | 'top-end' | 'bottom-end'", default: "'top'", description: 'Anchored side; the arrow aims at the anchor point the placement names.' }, { name: 'arrow', type: 'boolean', default: 'false', description: 'Opt-in pointer notch cut from the bubble through its mask.' }, { name: 'openDelay', type: 'number', default: '0', description: 'Delay before hover opens (ms); 0 shows immediately — focus opens immediately regardless.' }, { name: 'closeDelay', type: 'number', default: '100', description: 'Grace before closing, so the pointer can cross onto the tip.' }, { name: 'variant', type: "'solid' | 'acrylic' | 'auto'", default: "'auto'", description: 'Floating-surface variant; acrylic unless the environment asks for reduced transparency.' }, { name: 'id', type: 'string', default: 'auto-generated', description: 'Panel id; aria-describedby pairs the trigger wrapper to the tip.' }, { name: 'class', type: 'string', default: "''", description: 'Extra classes on the anchor wrapper.' }, { name: 'children', type: 'Snippet', default: '—', description: 'The trigger content; the wrapper span carries the anchoring.', required: true }]} /></SectionCard></div>
</div>
