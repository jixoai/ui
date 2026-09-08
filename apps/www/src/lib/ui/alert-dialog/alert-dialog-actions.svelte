<!--
  jixoai AlertDialogActions
  (registry/files/ui/alert-dialog/alert-dialog-actions.svelte, 2026-08-25).
  The action row (shadcn Footer, renamed to what it holds) — THE
  CARVED ACTION BAND (carved-action-band, 2026-09-09): the strip
  escapes the body padding through negative margins (the anchored
  form's own craft — a popover-sized surface rents no banded ruler)
  and renders CardFooter's STANDALONE MIRROR inside: the composed
  Cancel/Action children auto-join ONE cluster whose buttons FILL
  the strip vertically — the rim border-t is the band's top edge,
  the leadingSeam its carved left edge, the 1px hairline between
  the buttons (never a gap), the block height IS the strip. The
  padded loose row (py floating the buttons in whitespace) retired
  with that law. Compose AlertDialogCancel + AlertDialogAction
  inside.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import ButtonVariantScope from '$lib/ui/button-group/button-variant-scope.svelte';
  import CardFooter from '$lib/ui/card/card-footer.svelte';
  import { cn } from '$lib/utils';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    children: Snippet;
  }

  let { class: className = '', children, ...rest }: Props = $props();
</script>

<!-- THE ACTION-BAND ZONE (floating-flesh-sweep, 2026-09-09): ghost +
     flat over the band — the Cancel renders quiet with zero paint props
     while the Action's explicit fill still wins. The bleed arithmetic
     (the anchored form's own): gap(10px) + mt(8px) = the body's 18px
     breathing room above the rim; -mx/-mb cancel the body padding so
     the rim spans the full surface and the cluster rides the panel's
     end edge flush -->
<ButtonVariantScope variant="ghost" raised={false}>
  <div
    data-jx-adlg-actions=""
    class={cn('mt-[8px] -mx-5 -mb-[1.125rem] border-t border-border', className)}
    {...rest}
  >
    <CardFooter label="Actions">{@render children()}</CardFooter>
  </div>
</ButtonVariantScope>
