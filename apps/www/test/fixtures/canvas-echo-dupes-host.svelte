<!--
  Echo duplicate-label host (test/fixtures/canvas-echo-dupes-host.svelte):
  the protocol contract must tolerate repeated labels — the composite each
  key keeps Svelte from throwing each_key_duplicate on a read-only list.
  Echo rides the playground pane (documented contract): the snippet is
  present even though these controls are empty.
-->
<script lang="ts">
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import type { TreeFile } from '$lib/ui/tree-view.svelte';

  const files: TreeFile[] = [
    { name: 'src/lib/ui/demo-usage.svelte', content: '<p>static</p>' },
  ];
</script>

<ComponentCanvas
  title="echo dupes"
  files={files}
  echo={[
    { label: 'value', value: 'a' },
    { label: 'value', value: 'b' },
  ]}
>
  <p>demo</p>
  {#snippet playground()}
    <div class="jx-play-fields"></div>
  {/snippet}
</ComponentCanvas>
