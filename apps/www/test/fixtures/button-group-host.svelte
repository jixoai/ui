<!--
  button-group-host — test fixture (button-group.spec.ts).
  Hosts a horizontal group with a divider, a vertical group, and an
  explicitly-relabeled group: the context-driven divider geometry and
  the role override need a real composition.
-->
<script lang="ts">
  import ButtonGroup from '$lib/ui/button-group/button-group.svelte';
  import ButtonGroupDivider from '$lib/ui/button-group/button-group-divider.svelte';
</script>

<ButtonGroup label="export actions" data-testid="row-group">
  <button type="button" data-testid="row-copy">copy</button>
  <button type="button" data-testid="row-move">move</button>
  <ButtonGroupDivider data-testid="row-divider" />
  <button type="button" data-testid="row-delete">delete</button>
</ButtonGroup>

<ButtonGroup orientation="vertical" label="stack" data-testid="col-group">
  <button type="button">one</button>
  <ButtonGroupDivider data-testid="col-divider" />
  <button type="button">two</button>
</ButtonGroup>

<ButtonGroup role="toolbar" label="editor tools" aria-label="text tools" data-testid="toolbar-group">
  <button type="button">bold</button>
</ButtonGroup>
