<!--
  input-group-host — test fixture (input-group.spec.ts).
  Hosts a controlled (bind:value) group with two addons and a
  group-disabled group: the bindable value law and the disabled
  propagation need a component host (a plain props object cannot
  cross the $bindable boundary).
-->
<script lang="ts">
  import InputGroup from '$lib/ui/input-group/input-group.svelte';
  import InputGroupAddon from '$lib/ui/input-group/input-group-addon.svelte';
  import InputGroupInput from '$lib/ui/input-group/input-group-input.svelte';

  let site = $state('');
</script>

<InputGroup label="repository url" data-testid="live-group">
  <InputGroupAddon data-testid="prefix-addon">https://</InputGroupAddon>
  <InputGroupInput name="site" data-testid="site-input" bind:value={site} placeholder="jixoai.com" />
  <InputGroupAddon align="inline-end" data-testid="suffix-addon">.dev</InputGroupAddon>
</InputGroup>
<p data-testid="site-value">{site}</p>

<InputGroup label="locked group" disabled data-testid="locked-group">
  <InputGroupAddon data-testid="locked-addon">
    <button type="button" data-testid="locked-addon-button" onclick={() => {}}>go</button>
  </InputGroupAddon>
  <InputGroupInput name="locked" data-testid="locked-input" value="pinned" />
</InputGroup>
