<!--
  jixoai AlertDialogTrigger
  (registry/files/ui/alert-dialog/alert-dialog-trigger.svelte, 2026-08-25).
  The opener half of the family: a real <button> wired to the root's
  context — aria-haspopup=dialog, aria-expanded mirroring the open
  state. child({ props }) offered (the family context contract): the
  consumer replacement element must stay a button that opens the dialog
  (the props carry the wiring — spread them).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils';
  import { ALERT_DIALOG_KEY, type AlertDialogApi } from './alert-dialog.svelte';

  interface Props extends HTMLButtonAttributes {
    /** replacement-element escape: spread {...props} and append own
     *  classes explicitly (class={cn(props.class, 'own')}) */
    child?: Snippet<[{ props: HTMLButtonAttributes & { class: string } }]>;
    children?: Snippet;
  }

  let { class: className = '', child, children, onclick, ...rest }: Props = $props();

  const api = getContext<AlertDialogApi>(ALERT_DIALOG_KEY);

  const props = $derived({
    ...rest,
    type: 'button' as const,
    'data-jx-adlg-trigger': '',
    'aria-haspopup': 'dialog',
    'aria-expanded': String(api.open),
    // the ANCHOR: the alert panel's position-anchor resolves here (the
    // popover-engine rebuild — the alert rises beside this button)
    style: `anchor-name: --${api.uid};${(rest as Record<string, string>).style ? ` ${(rest as Record<string, string>).style}` : ''}`,
    // the direct-prop path layers the consumer handler UNDER the open
    // call; the child() replacement path is pure spread (the consumer
    // who overrides a handler owns its consequences — merge law)
    onclick: (event: MouseEvent) => {
      onclick?.(event);
      // the invoker registers itself — the anchored alert returns
      // focus here when it hides
      api.setInvoker(event.currentTarget as HTMLButtonElement);
      api.setOpen(true);
    },
    class: cn(className),
  } as HTMLButtonAttributes & { class: string });
</script>

{#if child}
  {@render child({ props })}
{:else}
  <button {...props}>{@render children?.()}</button>
{/if}
