<!--
  Test host for the transfer contract: bound target value surfaced as a
  data attribute; 'keep' starts on the target side.
-->
<script lang="ts">
  import Transfer from '../../src/lib/ui/transfer/transfer.svelte';

  let value = $state(['keep']);
</script>

<div data-value={value.join(',')}>
  <Transfer
    options={[
      { value: 'a', label: 'alpha' },
      { value: 'b', label: 'beta' },
      { value: 'c', label: 'gamma' },
      { value: 'keep', label: 'keeper' },
    ]}
    name="picked"
    bind:value
  />
</div>
