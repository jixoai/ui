<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
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
</script>

<svelte:head>
  <title>Hover card · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai hover card: the rich interactive cousin of tooltip — same intent model, but the panel is content you can hover into and click; crossings between trigger and card never dismiss."
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
      title="hover card — intent with an interactive panel"
      summary="The tooltip's intent model (hover delay in, cancellable close grace, focus opens instantly, Escape closes) on a popover=manual panel — but the card is interactive content: pointer and focus CROSSINGS between trigger and card never dismiss; only a real exit or Escape does. No role=tooltip and no aria-describedby — the card is supplementary rich content, not a description."
    >
      <div class="flex flex-wrap gap-3">
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
      <p class="text-[13.5px] leading-7">
        shipped by
        <HoverCard>
          {#snippet trigger()}
            <a href="/docs/components.html" class="text-primary underline decoration-dotted underline-offset-4">@gaubee</a>
          {/snippet}
          <div class="flex flex-col gap-2">
            <p class="font-nav text-[0.8125rem] uppercase tracking-[0.12em]">Gaubee — systems</p>
            <p class="text-muted-foreground text-[12.5px]">Component grammar, terminal surfaces, the one-brand-hue law.</p>
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

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <div id="types" data-reveal=""><SectionCard family="types" headerRegion="types" eyebrow="types" title="Hover card variants" summary="Placement and surface paint are the knobs; the delays are hover-card paced by default.">
    <div class="grid gap-4 md:grid-cols-3">
      <div class="border border-border p-4">
        <p class="font-nav mb-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">placement</p>
        <p class="text-[13px] leading-6"><code class="text-accent">top | bottom | left | right</code> — bottom (under, like a peek) is the convention.</p>
      </div>
      <div class="border border-border p-4">
        <p class="font-nav mb-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">variant</p>
        <p class="text-[13px] leading-6"><code class="text-accent">solid | acrylic | auto</code> (default) — the floating-surface paint family.</p>
      </div>
      <div class="border border-border p-4">
        <p class="font-nav mb-2 text-[11px] uppercase tracking-[0.24em] text-muted-foreground">delays</p>
        <p class="text-[13px] leading-6"><code class="text-accent">openDelay=300</code>, <code class="text-accent">closeDelay=200</code> — tunable per instance.</p>
      </div>
    </div>
  </SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard family="usage" headerRegion="usage" eyebrow="usage" title="Usage" summary="The trigger snippet is usually a link; the card is free content — headings, links, images."><CodeBlock code={usage} lang="svelte" meta="HoverCard usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard family="accessibility" headerRegion="accessibility" eyebrow="a11y" title="Accessibility" summary="No tooltip role and no aria-describedby — the card is supplementary rich content, not a description."><A11yTable keys={[{ key: 'Tab', action: 'Focus opens the card instantly; focus crossings into the card never dismiss' }, { key: 'Escape', action: 'Closes the card immediately (global)' }]} aria={[{ name: 'role', value: 'none imposed', description: 'Not role=tooltip — compose headings/links inside; the card is content.' }, { name: 'aria-describedby', value: '—', description: 'Deliberately absent: the card is not a description of the trigger.' }, { name: 'popover', value: 'manual', description: 'Light dismiss stays OFF — pointer and focus crossings must not dismiss.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard family="theming" headerRegion="theming" eyebrow="theming" title="Density and tokens" summary="The panel rides the shared surface-motion kernel and the jx-surface paint law."><div class="flex flex-col gap-5"><DensityDemo><HoverCard><p class="text-[12.5px]">hover the trigger — the card measures panel↔anchor live.</p>{#snippet trigger()}<span class="text-primary underline decoration-dotted underline-offset-4">@density</span>{/snippet}</HoverCard></DensityDemo><TokenTable tokens={[{ name: '--jx-hover-{id}', default: 'anchor-name', source: 'component', description: 'Per-instance CSS anchor the panel positions against.' }, { name: '--jx-p', default: '0 → 1 timeline', source: 'component', description: 'The surface-motion kernel driving open/close.' }, { name: 'panel width', default: 'max min(88vw, 20rem)', source: 'structural' }, { name: 'open / close delays', default: '300ms / 200ms', source: 'structural' }, { name: '--jx-text', default: '11 / 12 / 13 / 15px', source: 'density' }, { name: '--jx-inset', default: '8 / 8 / 12 / 16px', source: 'density' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard family="api" headerRegion="api" eyebrow="api" title="API" summary="Eight props; trigger and children are the two required snippets."><PropsTable props={[{ name: 'id', type: 'string', default: 'auto', description: 'Panel id; also derives the CSS anchor name.' }, { name: 'children', type: 'Snippet', default: '—', description: 'The card content — compose freely (headings, links, images).', required: true }, { name: 'trigger', type: 'Snippet', default: '—', description: 'The trigger content; the wrapper span carries the anchoring.', required: true }, { name: 'placement', type: "'top' | 'bottom' | 'left' | 'right'", default: "'bottom'", description: 'Anchored side — bottom (under, like a peek) is the convention.' }, { name: 'openDelay', type: 'number', default: '300', description: 'Hover delay before the card opens (ms).' }, { name: 'closeDelay', type: 'number', default: '200', description: 'Close grace spanned across trigger AND panel (ms).' }, { name: 'variant', type: "'solid' | 'acrylic' | 'auto'", default: "'auto'", description: 'Floating-surface paint. Defaults: literal slot — own \'auto\', ambient when an axis opens.' }, { name: 'class', type: 'string', default: "''", description: 'Forwarded to the trigger wrapper.' }]} /></SectionCard></div>
</div>
