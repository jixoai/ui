<!--
  jixoai AlertDialogAction
  (registry/files/ui/alert-dialog/alert-dialog-action.svelte, 2026-08-25).
  The confirm half: runs the root's onconfirm seam, then closes through
  Content's shared animated path (native dialog close restores focus
  to the invoker — the platform's restore contract, kept verbatim).

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
  DESTRUCTIVE PAIR as the component's default injection utilities
  ([--jx-fill:var(--destructive)] [--jx-fill-ink:var(--destructive-foreground)])
  — bare <AlertDialogAction> reads destructive, exactly as before.
  Positive confirmations flip the injection (a consumer class wins
  by the cn() dedupe law — arbitrary-property utilities with the
  same property conflict, last one stands):
    variant="fill" class="[--jx-fill:var(--primary)] [--jx-fill-ink:var(--primary-foreground)]"
    variant="tonal"    (brand tint, no injection needed)
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLButtonAttributes } from 'svelte/elements';
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils';
  import { ALERT_DIALOG_KEY, type AlertDialogApi } from './alert-dialog.svelte';

  interface Props extends HTMLButtonAttributes {
    /** confirm paint on the ladder: fill (destructive pair by default) | tonal | outline */
    variant?: 'fill' | 'tonal' | 'outline';
    children: Snippet;
  }

  let { variant = 'fill', class: className = '', children, onclick, ...rest }: Props = $props();

  const api = getContext<AlertDialogApi>(ALERT_DIALOG_KEY);

  // design.md §1 recipes; the destructive pair rides fill as the
  // component's local token default — consumer injections override it
  const variants = {
    fill: 'bg-[color:var(--jx-fill)] border-[color:var(--jx-fill)] text-[color:var(--jx-fill-ink)] [--jx-fill:var(--destructive)] [--jx-fill-ink:var(--destructive-foreground)]',
    tonal:
      'bg-[color-mix(in_oklab,var(--jx-tonal)_12%,transparent)] border-[color-mix(in_oklab,var(--jx-tonal)_45%,transparent)] text-[color:var(--jx-tonal)]',
    outline:
      'bg-transparent [border-color:var(--jx-outline)] text-foreground hover:bg-[color-mix(in_oklab,var(--jx-tonal)_8%,transparent)]',
  } as const;
</script>

<button
  type="button"
  data-jx-adlg-action=""
  data-jx-alert-dialog-action={variant}
  class={cn(
    'jx-press appearance-none px-4 py-2 border font-nav text-xs tracking-[0.1em] uppercase cursor-pointer [--jx-press-shadow:var(--shadow-2xs)] [--jx-press-shadow-hover:var(--shadow-xs)] [--jx-press-shadow-active:var(--shadow-xs-press)] focus-visible:outline-1 focus-visible:outline-ring focus-visible:outline-offset-[-1px]',
    variants[variant],
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
