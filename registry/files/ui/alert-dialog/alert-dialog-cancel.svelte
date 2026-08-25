<!--
  jixoai AlertDialogCancel
  (registry/files/ui/alert-dialog/alert-dialog-cancel.svelte, 2026-08-25).
  The safe default: closes through Content's shared animated path with
  NO confirm. This is the element Content focuses on open (the APG
  safe-landing law, DOM-delegated through [data-jx-adlg-cancel]).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils';
  import { ALERT_DIALOG_KEY, type AlertDialogApi } from './alert-dialog.svelte';

  interface Props extends HTMLButtonAttributes {
    children: Snippet;
  }

  let { class: className = '', children, onclick, ...rest }: Props = $props();

  const api = getContext<AlertDialogApi>(ALERT_DIALOG_KEY);
</script>

<button
  type="button"
  data-jx-adlg-cancel=""
  class={cn(
    'jx-press appearance-none px-4 py-2 border border-border bg-background text-foreground font-nav text-xs tracking-[0.1em] uppercase cursor-pointer [--jx-press-shadow:var(--shadow-2xs)] [--jx-press-shadow-hover:var(--shadow-xs)] [--jx-press-shadow-active:var(--shadow-xs-press)] focus-visible:outline-1 focus-visible:outline-ring focus-visible:outline-offset-[-1px]',
    className,
  )}
  onclick={(event) => {
    onclick?.(event);
    api.setOpen(false);
  }}
  {...rest}
>
  {@render children()}
</button>
