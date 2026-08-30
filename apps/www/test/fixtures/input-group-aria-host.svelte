<!--
  input-group-aria-host — test fixture (input-group.spec.ts).
  The naming law compositions: label shorthand, an explicit rest
  aria-label beating it, and aria-labelledby through the rest props.
-->
<script lang="ts">
  import InputGroup from '$lib/ui/input-group/input-group.svelte';
  import InputGroupInput from '$lib/ui/input-group/input-group-input.svelte';
</script>

<InputGroup label="repository url" data-testid="named-group">
  <InputGroupInput name="a" />
</InputGroup>

<InputGroup label="shorthand" aria-label="explicit" data-testid="explicit-group">
  <InputGroupInput name="b" />
</InputGroup>

<InputGroup aria-labelledby="ext-label" data-testid="labelledby-group">
  <InputGroupInput name="c" />
</InputGroup>
