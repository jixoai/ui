<!--
  Test host for the popconfirm contract: outcome surfaced as a data
  attribute; a focusable trigger composed inside the wrapper.
-->
<script lang="ts">
  import Popconfirm from '../../src/lib/ui/popconfirm/popconfirm.svelte';

  let outcome = $state('');
</script>

<div data-outcome={outcome}>
  <Popconfirm
    title="Delete this row?"
    description="The check history goes with it."
    confirmLabel="Delete"
    onconfirm={() => (outcome = 'confirmed')}
    oncancel={() => (outcome = 'cancelled')}
  >
    <button type="button" data-pc-trigger>delete row</button>
  </Popconfirm>
</div>
