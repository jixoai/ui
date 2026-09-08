<!--
  jixoai AlertDialogActions
  (registry/files/ui/alert-dialog/alert-dialog-actions.svelte, 2026-08-25).
  The action row (shadcn Footer, renamed to what it holds): a
  bordered strip escaping the body padding through negative margins so
  the border spans the full surface — byte-parity with the closed
  component's sibling-row layout. Compose AlertDialogCancel +
  AlertDialogAction inside.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import ButtonVariantScope from '$lib/ui/button-group/button-variant-scope.svelte';
  import { cn } from '$lib/utils';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    children: Snippet;
  }

  let { class: className = '', children, ...rest }: Props = $props();
</script>

<!-- THE ACTION-BAND ZONE (floating-flesh-sweep, 2026-09-09): ghost +
     flat over the row — the Cancel renders quiet with zero paint props
     while the Action's explicit fill still wins. The full-bleed strip
     stays the ANCHORED-ALERT form's own craft (negative margins
     escaping the body padding — this popover-sized surface has no
     banded ruler to rent; the ruling lives in the change's design):
     gap(10px) + mt(8px) = the body's 18px breathing room above the
     border; -mx/-mb cancel the body padding -->
<ButtonVariantScope variant="ghost" raised={false}>
  <div
    data-jx-adlg-actions=""
    class={cn(
      'mt-[8px] -mx-5 -mb-[1.125rem] flex justify-end gap-2.5 px-5 py-3.5 border-t border-border',
      className,
    )}
    {...rest}
  >
    {@render children()}
  </div>
</ButtonVariantScope>
