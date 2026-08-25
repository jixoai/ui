<!--
  jixoai AlertDialogTitle
  (registry/files/ui/alert-dialog/alert-dialog-title.svelte, 2026-08-25).
  The alertdialog's required name: an h2 carrying the deterministic id
  Content's aria-labelledby points at (derived from the root uid — the
  wire never depends on render order).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils';
  import { ALERT_DIALOG_KEY, type AlertDialogApi } from './alert-dialog.svelte';

  interface Props extends HTMLAttributes<HTMLHeadingElement> {
    children: Snippet;
  }

  let { class: className = '', children, ...rest }: Props = $props();

  const api = getContext<AlertDialogApi>(ALERT_DIALOG_KEY);
</script>

<h2
  id="{api.uid}-title"
  data-jx-adlg-title=""
  class={cn('font-nav text-[0.9375rem] tracking-[0.08em] uppercase text-foreground', className)}
  {...rest}
>
  {@render children()}
</h2>
