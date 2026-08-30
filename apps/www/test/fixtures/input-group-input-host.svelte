<!--
  input-group-input-host — test fixture (input-group.spec.ts).
  The per-part disable composition: the lane carries its OWN disabled
  while the group stays enabled — the addon must keep working.
-->
<script lang="ts">
  import InputGroup from '$lib/ui/input-group/input-group.svelte';
  import InputGroupAddon from '$lib/ui/input-group/input-group-addon.svelte';
  import InputGroupInput from '$lib/ui/input-group/input-group-input.svelte';
</script>

<InputGroup label="copy source">
  <InputGroupInput name="src" data-testid="part-input" disabled value="pinned" />
  <InputGroupAddon align="inline-end">
    <button type="button" data-testid="copy-button">copy</button>
  </InputGroupAddon>
</InputGroup>

<InputGroup label="uncontrolled" data-testid="bare-group">
  <InputGroupInput name="bare" data-testid="bare-input" placeholder="type freely" />
</InputGroup>
