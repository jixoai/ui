<!-- alert-dismiss spec fixture (grindstone #17-1): one Alert whose
     dismissal axes are host props, so the spec can sweep the
     persistent/manual/auto matrix and read the fired reasons back
     through the onreason callback -->
<script lang="ts">
  import Alert from '$lib/ui/alert/alert.svelte';

  let {
    dismiss,
    dismissAfter,
    dismissLabel,
    assertive = false,
    variant = 'outline',
    withTitle = true,
    onreason,
  }: {
    dismiss?: 'manual' | 'auto';
    dismissAfter?: number;
    dismissLabel?: string;
    assertive?: boolean;
    variant?: 'outline' | 'tonal';
    withTitle?: boolean;
    onreason?: (how: 'button' | 'timer') => void;
  } = $props();
</script>

<Alert
  {variant}
  {assertive}
  title={withTitle ? 'Build failed' : undefined}
  {dismiss}
  {dismissAfter}
  {dismissLabel}
  onDismiss={(how) => onreason?.(how)}
>
  Exit 1 — the bundle exceeded the size budget.
</Alert>
