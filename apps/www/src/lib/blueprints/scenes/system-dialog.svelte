<!-- system-dialog blueprint: the destructive decision forced open
     (open={true} → showModal()), floating over muted context content.
     The serializer re-anchors top-layer panels into the stage.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms.) -->
<script lang="ts">
  import SystemDialog from '$lib/ui/system-dialog/system-dialog.svelte';
  import Skeleton from '$lib/ui/skeleton/skeleton.svelte';
  import { bpB } from '../../surface/blueprints-b.stylex';
  import Stack from '$lib/ui/stack';

  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');
</script>

<Stack direction="column" justify="center" gap="16" class={cx(bpB.systemDialogStage)} }>
  <Skeleton class={cx(bpB.systemDialogSkelA)}></Skeleton>
  <Skeleton class={cx(bpB.systemDialogSkelB)}></Skeleton>
  <Skeleton class={cx(bpB.systemDialogSkelC)}></Skeleton>
</Stack>

<SystemDialog
  title="Purge deployment logs?"
  description="This permanently removes 1,284 log entries from the last 30 days. The action cannot be undone."
  confirmLabel="Purge logs"
  open={true}
>
  <p>Members holding the auditor role keep read access to the archived snapshot.</p>
</SystemDialog>
