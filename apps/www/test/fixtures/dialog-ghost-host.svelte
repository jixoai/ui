<!-- the ghost-scope host (r14-2): buttons in the footer/actions and
     the header render with NO explicit variant — the zone's Context
     default must paint them ghost -->
<script lang="ts">
  import Dialog from '$lib/ui/dialog/dialog.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
</script>

<Dialog title="ghost scope" open>
  {#snippet footer()}
    <PressButton>legacy-foot-button</PressButton>
  {/snippet}
  {#snippet actions()}
    <PressButton>action-one</PressButton>
    <PressButton variant="outline">explicit-wins</PressButton>
  {/snippet}
  body text
</Dialog>
