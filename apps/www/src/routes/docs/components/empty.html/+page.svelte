<script lang="ts">
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import Empty from '$lib/ui/empty/empty.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayHelp } from '$lib/playground';

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
      <SectionCard headingLevel={1} tone="hero" eyebrow="registry:ui · General" title="empty — the no-data state, nothing more" summary="The eight-state machine's no-data member (error/loading/404 are alert/result surfaces — ruled separate). Terminal illustration slot, title, description, actions. Zero JS.">
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
      stage="center"
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
        <PlayFields>
          <PlayHelp>
            the illustration slot replaces the terminal default — bring any glyph; it stays
            decorative (aria-hidden). empty never guesses how to FIX the emptiness: the actions
            snippet owns that.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  
  <div id="types" data-reveal=""><SectionCard eyebrow="types" title="Empty composition" summary="Empty has one required title and optional description, illustration and actions slots."><div class="grid gap-4 md:grid-cols-2"><Empty title="no artifacts" /><Empty title="no checks" description="Add the first check.">{#snippet actions()}<PressButton>add check</PressButton>{/snippet}</Empty></div></SectionCard></div>
  <div id="usage" data-reveal=""><SectionCard eyebrow="usage" title="Usage"><CodeBlock code={usage} lang="svelte" meta="usage" /></SectionCard></div>
  <div id="accessibility" data-reveal=""><SectionCard eyebrow="a11y" title="Accessibility"><A11yTable aria={[{ name: 'figure', value: 'empty root', description: 'Groups the no-data message.' }, { name: 'figcaption', value: 'title + description', description: 'Keeps the message discoverable.' }, { name: 'aria-hidden', value: 'illustration', description: 'Prevents decorative art from interrupting the message.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard eyebrow="theming" title="Density and tokens"><DensityDemo scopes={['xs', 'default', 'lg']}><Empty title="no results" /></DensityDemo><div class="mt-5"><TokenTable tokens={[{ name: '--jx-stack', default: 'density scale', source: 'density' }, { name: '--jx-inset', default: 'density scale', source: 'density' }, { name: '--jx-text', default: 'density scale', source: 'density' }, { name: '--jx-line', default: 'density scale', source: 'density' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard eyebrow="api" title="Empty props"><PropsTable props={[{ name: 'title', type: 'string', description: 'No-data heading.', required: true }, { name: 'description', type: 'string', description: 'Optional supporting copy.' }, { name: 'illustration', type: 'Snippet', description: 'Replaces the default illustration.' }, { name: 'actions', type: 'Snippet', description: 'Renders recovery actions.' }, { name: 'density', type: 'Density', default: 'ambient scope', description: 'Explicit override of the ambient density scope; no opinion stamps nothing and the ambient css scope channel flows.' }]} /></SectionCard></div>
  </div>
</div>
