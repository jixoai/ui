<!--
  jixoai AlertDialogAction
  (registry/files/ui/alert-dialog/alert-dialog-action.svelte, 2026-08-25).
  The confirm half: runs the root's onconfirm seam — the state flip
  drives Content's open effect (the family's single animated shut);
  hiding the popover restores focus to the invoker (the platform's
  restore contract, kept verbatim).

  Variant grammar (2026-08-26, variant-grammar change): the old
  tone: destructive | primary prop migrates INTO the grammar — the
  part paints through the ladder + hue injection like every other
  module, on its own markup (press law untouched):
    variant="fill" (default)   --jx-fill ground/border + --jx-fill-ink
    variant="tonal"            12% tinted ground, 45% border, tonal ink
    variant="outline"          transparent ground, --jx-outline border,
                                foreground ink + tonal 8% hover overlay
  The loud path stays opt-OUT, not opt-in (the closed component's
  confirmTone law, carried into the grammar): fill ships with the
  DESTRUCTIVE PAIR as the component's default injection utility
  (jx-pair-destructive — the theme's @Utility intent layer,
  hue-injection-utilities 2026-08-27) — bare <AlertDialogAction>
  reads destructive, exactly as before.
  Positive confirmations flip the injection with the arbitrary pair
  (the escape hatch for hues outside the closed set — and it still
  wins: jx-pair-destructive sorts BEFORE arbitrary-property
  utilities in the TW utilities layer, verified in the
  built sheet on the resolved Tailwind 4.3.3):
    variant="fill" class="[--jx-fill:var(--primary)] [--jx-fill-ink:var(--primary-foreground)]"
    variant="tonal"    (brand tint, no injection needed)
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils';
  import { ALERT_DIALOG_KEY, type AlertDialogApi } from './alert-dialog.svelte';
  import {
    AlertDialogDefaults,
    type AlertDialogActionVariant,
  } from './alert-dialog-defaults.svelte';

  interface Props extends HTMLButtonAttributes {
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

  // design.md §1 recipes; jx-pair-destructive rides fill as the
  // component's local token default — consumer pair injections
  // override it (layer order, see the header).
  // Each rung carries its design §6 forced-colors degradation (r2
  // blocker fix — the destructive/tinted paints do not drop on their
  // own under forced colors)
  const variants = {
    fill: 'bg-[color:var(--jx-fill)] border-[color:var(--jx-fill)] text-[color:var(--jx-fill-ink)] jx-pair-destructive forced-colors:bg-[ButtonFace] forced-colors:border-[ButtonText] forced-colors:text-[ButtonText]',
    tonal:
      'bg-[color-mix(in_oklab,var(--jx-tonal)_12%,transparent)] border-[color-mix(in_oklab,var(--jx-tonal)_45%,transparent)] text-[color:var(--jx-tonal)] forced-colors:bg-[Canvas] forced-colors:border-[CanvasText] forced-colors:text-[CanvasText]',
    outline:
      'bg-transparent [border-color:var(--jx-outline)] text-foreground hover:bg-[color-mix(in_oklab,var(--jx-tonal)_8%,transparent)] forced-colors:bg-[Canvas] forced-colors:border-[CanvasText] forced-colors:text-[CanvasText]',
  } as const;
</script>

<button
  type="button"
  data-jx-adlg-action=""
  data-jx-alert-dialog-action={d.actionVariant}
  class={cn(
    'jx-press appearance-none px-4 py-2 border font-nav text-xs tracking-[0.1em] uppercase cursor-pointer [--jx-press-shadow:var(--shadow-2xs)] [--jx-press-shadow-hover:var(--shadow-xs)] [--jx-press-shadow-active:var(--shadow-xs-press)] focus-visible:outline-1 focus-visible:outline-ring focus-visible:outline-offset-[-1px] forced-colors:outline-2 forced-colors:outline-offset-2 forced-colors:[outline-color:Highlight]',
    variants[d.actionVariant],
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
