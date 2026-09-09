<!--
  jixoai AlertDialogAction
  (registry/files/ui/alert-dialog/alert-dialog-action.svelte, 2026-08-25;
  the PressButton era, floating-flesh-sweep 2026-09-09).
  The confirm half: runs the root's onconfirm seam — the state flip
  drives Content's open effect (the family's single animated shut);
  hiding the popover restores focus to the invoker (the platform's
  restore contract, kept verbatim).

  THE RECIPE FORK RETIRED (2026-09-09): this part used to carry a
  verbatim COPY of press-button's variant recipes (fill/tonal/outline
  + forced-colors + the press pose customs) — the variant-grammar
  migration's dual source. It now RENDS PressButton with an explicit
  variant; the one thing it adds on top is the family's default HUE:
  the loud path stays opt-OUT, not opt-in (the closed component's
  confirmTone law) — the fill rung ships with the DESTRUCTIVE PAIR
  injection (jx-pair-destructive — the theme's @Utility intent layer)
  as the local class default, exactly as before. Positive confirmations
  flip the injection with the arbitrary pair (the escape hatch for
  hues outside the closed set — and it still wins: jx-pair-destructive
  sorts BEFORE arbitrary-property utilities in the TW utilities layer):
    variant="fill" class="[--jx-fill:var(--primary)] [--jx-fill-ink:var(--primary-foreground)]"
    variant="tonal"    (brand tint, no injection needed)

  density rides DEFAULT — the carved strip's height IS the
  Dialog footer's (the Owner parity ruling, 2026-09-09). The
  data-jx-alert-dialog-action={variant} stamp rides the REST LANE
  (press-button passes attributes through since this change — no
  wrapper element). The consumer onclick signature narrows to the
  family's () => void (the event object was never used in-tree).
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { getContext } from 'svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import { ALERT_DIALOG_KEY, type AlertDialogApi } from './alert-dialog.svelte';
  import {
    AlertDialogDefaults,
    type AlertDialogActionVariant,
  } from './alert-dialog-defaults.svelte';

  interface Props extends Omit<HTMLButtonAttributes, 'onclick'> {
    /** confirm paint on the ladder: fill (destructive pair by default) |
     *  tonal | outline. Omitted → the contract own 'fill'
     *  (AlertDialogDefaults.actionVariant — a declared own, not ambient) */
    variant?: AlertDialogActionVariant;
    children: Snippet;
  }

  let { variant, class: className = '', children, onclick, ...rest }: Props = $props();

  // the family Defaults is the single read point (context-defaults-
  // economy 3.2): the action's ladder prop rides its OWN slot
  // (actionVariant — the family's second variant vocabulary; own
  // 'fill' auditable in one place)
  const d = $derived(AlertDialogDefaults.resolve({ actionVariant: variant }));

  const api = getContext<AlertDialogApi>(ALERT_DIALOG_KEY);
</script>

<PressButton
  {...rest}
  variant={d.actionVariant}
  data-jx-adlg-action=""
  data-jx-alert-dialog-action={d.actionVariant}
  class={`${d.actionVariant === 'fill' ? 'jx-pair-destructive' : ''}${className ? ` ${className}` : ''}`}
  onclick={() => {
    onclick?.();
    api.confirm();
  }}
>
  {@render children()}
</PressButton>
