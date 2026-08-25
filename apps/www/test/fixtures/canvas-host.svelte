<!--
  ComponentCanvas protocol test host (test/fixtures/canvas-host.svelte).
  Wires the full P1 playground protocol: playground snippet (contract
  classes), onreset over page-owned state, echo projection, and the
  usage-file content resolver — exactly the seams the form/popover pages
  use. State lives HERE (page ownership law), never inside the canvas.
-->
<script lang="ts">
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import type { TreeFile } from '$lib/ui/component-canvas/component-canvas.svelte';

  const initial = { label: 'Actions', toggled: false };
  let label = $state(initial.label);
  let toggled = $state(initial.toggled);

  function reset(): void {
    label = initial.label;
    toggled = initial.toggled;
  }

  const files: TreeFile[] = [
    { name: 'src/lib/ui/demo-usage.svelte', content: '<p>static</p>' },
  ];

  function resolveContent(file: TreeFile): string {
    return file.name.endsWith('usage.svelte')
      ? `label="${label}" toggled=${toggled}`
      : file.content;
  }
</script>

<ComponentCanvas
  title="host widget"
  description="protocol host"
  id="explicit"
  files={files}
  onreset={reset}
  output={[
    { label: 'label', value: label },
    { label: 'toggled', value: toggled },
    { label: 'unset', value: undefined },
  ]}
  resolveFileContent={resolveContent}
>
  <p data-testid="stage-demo">{label}</p>
  {#snippet playground()}
    <div class="jx-play-fields">
      <div class="jx-play-field">
        <input data-testid="label-input" bind:value={label} />
      </div>
      <p class="jx-play-help">help zone</p>
    </div>
  {/snippet}
</ComponentCanvas>
