<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import HoverCard from '$lib/ui/hover-card/hover-card.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
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

  <div id="hover-card-base" data-reveal="">
    <SectionCard family="hover-card-base" headerRegion="hover-card-base" eyebrow="NativeHTML 基座" title="Usage">
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
  </div>
</div>
