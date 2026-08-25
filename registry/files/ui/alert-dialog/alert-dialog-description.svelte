<!--
  jixoai AlertDialogDescription
  (registry/files/ui/alert-dialog/alert-dialog-description.svelte,
  2026-08-25).
  The alertdialog's required body line: a p carrying the deterministic
  id Content's aria-describedby points at.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils';
  import { ALERT_DIALOG_KEY, type AlertDialogApi } from './alert-dialog.svelte';

  interface Props extends HTMLAttributes<HTMLParagraphElement> {
    children: Snippet;
  }

  let { class: className = '', children, ...rest }: Props = $props();

  const api = getContext<AlertDialogApi>(ALERT_DIALOG_KEY);
</script>

<p
  data-jx-adlg-desc=""
  class={cn('text-[0.8125rem] leading-[1.6] text-muted-foreground', className)}
  {...rest}
  id="{api.uid}-desc"
>
  {@render children()}
</p>
