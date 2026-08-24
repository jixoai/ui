<!-- transfer blueprint: mid-move — dialog and toast already across to the
     release side, the → / ← movers between the checkbox fieldsets. -->
<script lang="ts">
  import Transfer from '$lib/ui/transfer/transfer.svelte';

  const options = [
    { value: 'press-button', label: 'press-button' },
    { value: 'input', label: 'input' },
    { value: 'select', label: 'select' },
    { value: 'dialog', label: 'dialog' },
    { value: 'toast', label: 'toast' },
    { value: 'table', label: 'table' },
    { value: 'tabs', label: 'tabs' },
  ];

  let release = $state(['dialog', 'toast']);
</script>

<div class="flex h-full w-full items-center justify-center p-10">
  <div class="w-full">
    <Transfer {options} bind:value={release} sourceTitle="library" targetTitle="release" />
  </div>
</div>
