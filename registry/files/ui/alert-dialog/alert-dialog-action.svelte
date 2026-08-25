<!--
  jixoai AlertDialogAction
  (registry/files/ui/alert-dialog/alert-dialog-action.svelte, 2026-08-25).
  The confirm half: runs the root's onconfirm seam, then closes through
  Content's shared animated path (native dialog close restores focus
  to the invoker — the platform's restore contract, kept verbatim).
  Destructive paint by default — the loud path is opt-OUT, not opt-in
  (the closed component's confirmTone law, carried onto the part as
  `tone`).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils';
  import { ALERT_DIALOG_KEY, type AlertDialogApi } from './alert-dialog.svelte';

  interface Props extends HTMLButtonAttributes {
    /** confirm paint: destructive (default) | primary */
    tone?: 'destructive' | 'primary';
    children: Snippet;
  }

  let { tone = 'destructive', class: className = '', children, onclick, ...rest }: Props = $props();

  const api = getContext<AlertDialogApi>(ALERT_DIALOG_KEY);
</script>

<button
  type="button"
  data-jx-adlg-action=""
  data-tone={tone}
  class={cn(
    'jx-press appearance-none px-4 py-2 border bg-background text-foreground font-nav text-xs tracking-[0.1em] uppercase cursor-pointer [--jx-press-shadow:var(--shadow-2xs)] [--jx-press-shadow-hover:var(--shadow-xs)] [--jx-press-shadow-active:var(--shadow-xs-press)] focus-visible:outline-1 focus-visible:outline-ring focus-visible:outline-offset-[-1px]',
    tone === 'destructive'
      ? 'border-destructive bg-destructive text-destructive-foreground'
      : 'border-primary text-primary',
    className,
  )}
  onclick={(event) => {
    onclick?.(event);
    api.confirm();
  }}
  {...rest}
>
  {@render children()}
</button>
