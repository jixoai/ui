<!-- the ghost-scope host (r14-2 → r14-9): a RAW footer button and the
     DialogFooter's grouped buttons render with NO explicit variant —
     the zone's Context default must paint them all ghost. Since
     2026-09-04 the foot zone also scopes the physics default flat
     (raised={false} on the zone's ButtonVariantScope); the explicit
     raised=true button proves the prop still wins -->
<script lang="ts">
  import Dialog from '$lib/ui/dialog/dialog.svelte';
  import DialogFooter from '$lib/ui/dialog/dialog-footer.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
</script>

<Dialog title="ghost scope" open>
  {#snippet footer()}
    <PressButton>raw-foot-button</PressButton>
    <PressButton raised={true}>raised-explicit</PressButton>
    <DialogFooter>
      <PressButton>grouped-ghost</PressButton>
      <PressButton variant="outline">explicit-wins</PressButton>
    </DialogFooter>
  {/snippet}
  body text
</Dialog>
