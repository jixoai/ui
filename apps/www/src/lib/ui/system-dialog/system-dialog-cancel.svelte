<!--
  jixoai SystemDialogCancel
  (registry/files/ui/system-dialog/system-dialog-cancel.svelte, 2026-08-25;
  the PressButton era, floating-flesh-sweep 2026-09-09).
  The safe default: closes through Content's shared animated path with
  NO confirm. This is the element Content focuses on open (the APG
  safe-landing law, DOM-delegated through [data-jx-sysdlg-cancel] —
  riding the REST LANE onto the control root since this change).

  The hand-drawn outline button (border/bg utilities + the three
  shadow pose customs) retired into PressButton: no variant passed —
  inside SystemDialogActions' zone it renders the quiet ghost default
  (the action-band law); standalone it falls to PressButton's own
  outline rung, the same visual family as before. density rides
  DEFAULT — the carved strip's height IS the Dialog footer's (the
  Owner parity ruling, 2026-09-09).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { getContext } from 'svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import { SYSTEM_DIALOG_KEY, type SystemDialogApi } from './system-dialog.svelte';

  interface Props extends Omit<HTMLButtonAttributes, 'onclick'> {
    children: Snippet;
  }

  let { class: className = '', children, onclick, ...rest }: Props = $props();

  const api = getContext<SystemDialogApi>(SYSTEM_DIALOG_KEY);
</script>

<PressButton
  {...rest}
  data-jx-sysdlg-cancel=""
  class={className}
  onclick={() => {
    onclick?.();
    api.setOpen(false);
  }}
>
  {@render children()}
</PressButton>
