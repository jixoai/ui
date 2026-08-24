<!-- alert-dialog blueprint: the destructive decision forced open
     (open={true} → showModal()), floating over muted context content.
     The serializer re-anchors top-layer panels into the stage. -->
<script lang="ts">
  import AlertDialog from '$lib/ui/alert-dialog/alert-dialog.svelte';
  import Skeleton from '$lib/ui/skeleton/skeleton.svelte';
</script>

<div class="flex h-full w-full flex-col justify-center gap-4 p-10 opacity-70">
  <Skeleton class="h-4 w-3/5"></Skeleton>
  <Skeleton class="h-3 w-2/3"></Skeleton>
  <Skeleton class="h-3 w-1/2"></Skeleton>
</div>

<AlertDialog
  title="Purge deployment logs?"
  description="This permanently removes 1,284 log entries from the last 30 days. The action cannot be undone."
  confirmLabel="Purge logs"
  open={true}
>
  <p>Members holding the auditor role keep read access to the archived snapshot.</p>
</AlertDialog>
