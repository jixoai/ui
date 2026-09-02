<!-- dialog blueprint: the modal forced open (open={true} → showModal()),
     floating over muted context content. The serializer re-anchors
     top-layer panels into the stage. -->
<script lang="ts">
  import Dialog from '$lib/ui/dialog/dialog.svelte';
  import DialogFooter from '$lib/ui/dialog/dialog-footer.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import Skeleton from '$lib/ui/skeleton/skeleton.svelte';
</script>

<div class="flex h-full w-full flex-col justify-center gap-4 p-10 opacity-70">
  <Skeleton class="h-4 w-2/3"></Skeleton>
  <Skeleton class="h-3 w-1/2"></Skeleton>
  <Skeleton class="h-3 w-3/5"></Skeleton>
</div>

<Dialog title="Delete workspace?" open={true}>
  <p class="text-muted-foreground text-sm leading-6">
    This removes 3 deployments and their logs. The action cannot be undone.
  </p>
  {#snippet footer()}
    <DialogFooter>
      <PressButton>Cancel</PressButton>
      <PressButton variant="fill">Delete</PressButton>
    </DialogFooter>
  {/snippet}
</Dialog>
