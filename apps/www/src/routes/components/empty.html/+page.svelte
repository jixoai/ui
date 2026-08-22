<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import Empty from '$lib/ui/empty.svelte';
  import PressButton from '$lib/ui/press-button.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import type { TreeFile } from '$lib/ui/tree-view.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import emptySource from '$lib/ui/empty.svelte?raw';

  const close = '</' + 'script>';

  const usage = `<Empty title="no checks yet" description="add the first check">
  {#snippet actions()}<PressButton>add check</PressButton>{/snippet}
</Empty>`;

  const canvasFiles: TreeFile[] = [
    { name: 'registry/files/ui/empty.svelte', content: emptySource },
  ];
</script>

<svelte:head>
  <title>Empty · jixoai-ui</title>
  <meta name="description" content="The eight-state machine's no-data member (error/loading/404 are alert/result surfaces — ruled separate). Terminal illustration slot, title, description, actions" />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <div data-reveal="" use:reveal>
    <SectionCard headingLevel={1} tone="hero" eyebrow="registry:ui · antd 裁决" title="empty — the no-data state, nothing more" summary="The eight-state machine's no-data member (error/loading/404 are alert/result surfaces — ruled separate). Terminal illustration slot, title, description, actions. Zero JS.">
      <div class="flex flex-wrap gap-3"><span class="pill">antd phase</span></div>
    </SectionCard>
  </div>

  <div data-reveal="" use:reveal>
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

  <div data-reveal="" use:reveal>
    <SectionCard headerRegion="empty-base" eyebrow="antd 裁决" title="Usage">
      <CodeBlock code={usage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
</div>
