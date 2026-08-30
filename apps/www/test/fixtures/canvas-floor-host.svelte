<!--
  ComponentCanvas floor host (test/fixtures/canvas-floor-host.svelte,
  canvas-floor-lab 2026-08-30): TWO canvases sharing a page —
  · canvas A ("floor widget"): 2 files (tabs drawer), bind:theme /
    bind:density page-owned, install badge, playground snippet with a
    playState-driven PlaySelect — the flagship-lab composition in one
    surface;
  · canvas B ("tree widget"): 3 files (tree drawer kept), its own
    unbound toggles — the isolation control.
  The wrapper carries a real page h2 so the ToC probe can prove the
  canvas chrome stays out of the outline while the page section joins.
-->
<script lang="ts">
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';
  import { PlayFields, PlayRow, PlaySelect, playOutputs, playState } from '$lib/playground';

  const twoFiles: TreeFile[] = [
    { name: 'registry/files/ui/floor-widget/floor-widget.svelte', content: '<p>source</p>' },
    { name: 'src/lib/ui/floor-widget-usage.svelte', content: '<p>usage default</p>' },
  ];

  const threeFiles: TreeFile[] = [
    { name: 'src/lib/ui/tree-widget.svelte', content: '<p>one</p>' },
    { name: 'src/lib/ui/tree-widget-usage.svelte', content: '<p>two</p>' },
    { name: 'src/lib/ui/tree-widget.css', content: 'three {}' },
  ];

  // page-owned stage state (the floor law: bindables, never canvas-held)
  let theme = $state<'light' | 'dark'>('light');
  let density = $state<'comfortable' | 'compact'>('comfortable');

  // the lab: ONE typed state object + snippet-function code panel
  type Variant = 'fill' | 'tonal' | 'outline';
  const play = playState({ variant: 'fill' as Variant });
  const variantOptions: { value: Variant; label: string }[] = [
    { value: 'fill', label: 'fill' },
    { value: 'tonal', label: 'tonal' },
    { value: 'outline', label: 'outline' },
  ];
  const usageLive = $derived(`<FloorWidget variant="${play.current.variant}" />`);
  const resolveUsage = (file: TreeFile): string =>
    file.name.endsWith('usage.svelte') ? usageLive : file.content;
</script>

<div data-testid="floor-root">
  <h2>page section</h2>
  <ComponentCanvas
    title="floor widget"
    id="floor"
    files={twoFiles}
    install="press-button"
    bind:theme
    bind:density
    onreset={() => play.reset()}
    output={playOutputs(play.current)}
    resolveFileContent={resolveUsage}
  >
    <p data-testid="stage-demo" data-theme={theme} data-density={density}>demo</p>
    {#snippet playground()}
      <PlayFields>
        <PlayRow label="variant">
          <PlaySelect bind:value={play.current.variant} options={variantOptions} />
        </PlayRow>
      </PlayFields>
    {/snippet}
  </ComponentCanvas>

  <ComponentCanvas title="tree widget" id="tree" files={threeFiles}>
    <p data-testid="tree-stage-demo">tree demo</p>
  </ComponentCanvas>
</div>
