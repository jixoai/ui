<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import Empty from '$lib/ui/empty/empty.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import emptySource from '$lib/ui/empty/empty.svelte?raw';

  const close = '</' + 'script>';

  const usage = `<Empty title="no checks yet" description="add the first check">
  {#snippet actions()}<PressButton>add check</PressButton>{/snippet}
</Empty>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/empty.svelte', content: emptySource },
    { name: 'src/lib/ui/empty-usage.svelte', content: usage },
  ];

  // ToC outline: pairs with the section ids below, in page order.
</script>

<svelte:head>
  <title>Empty · jixoai-ui</title>
  <meta name="description" content="The eight-state machine's no-data member (error/loading/404 are alert/result surfaces — ruled separate). Terminal illustration slot, title, description, actions" />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>

  <div class="flex min-w-0 flex-col gap-8">
    <div data-reveal="">
      <SectionCard headingLevel={1} tone="hero" eyebrow="registry:ui · antd 裁决" title="empty — the no-data state, nothing more" summary="The eight-state machine's no-data member (error/loading/404 are alert/result surfaces — ruled separate). Terminal illustration slot, title, description, actions. Zero JS.">
      <div class="flex flex-wrap gap-3">
        <span class="pill">zero JS</span>
        <span class="pill">illustration slot</span>
        <span class="pill">actions snippet owns the fix</span>
      </div>
    </SectionCard>
  </div>

  <div data-reveal="">
    <ComponentCanvas
      title="empty"
      description="empty — the no-data state, nothing more"
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/empty.svelte"
      files={canvasFiles}
    >
      <div class="w-full max-w-md">
        <Empty title="no checks yet" description="Add the first check to start the audit pipeline.">
          {#snippet actions()}
            <PressButton>add check</PressButton>
          {/snippet}
        </Empty>
      </div>
      {#snippet playground()}
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          the illustration slot replaces the terminal default — bring any glyph; it stays decorative (aria-hidden). empty never guesses how to FIX the emptiness: the actions snippet owns that.
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="empty-base" data-reveal="">
    <SectionCard family="empty-base" headerRegion="empty-base" eyebrow="law" title="Usage">
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
  </div>
</div>
