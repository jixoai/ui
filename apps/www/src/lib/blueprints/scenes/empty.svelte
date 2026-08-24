<!-- empty blueprint: the no-data state with a primary action. -->
<script lang="ts">
  import Empty from '$lib/ui/empty/empty.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
</script>

<div class="flex h-full w-full items-center justify-center p-10">
  <Empty title="No components yet" description="Add the first one from the registry.">
    {#snippet actions()}
      <PressButton variant="primary">Add component</PressButton>
    {/snippet}
  </Empty>
</div>
