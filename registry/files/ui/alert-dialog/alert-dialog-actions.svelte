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
  import { cn } from '$lib/utils';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    children: Snippet;
  }

  let { class: className = '', children, ...rest }: Props = $props();
</script>

<div
  data-jx-adlg-actions=""
  class={cn(
    // gap(10px) + mt(8px) = the body's 18px breathing room above the
    // border; -mx/-mb cancel the body padding (full-bleed border row)
    'mt-[8px] -mx-5 -mb-[1.125rem] flex justify-end gap-2.5 px-5 py-3.5 border-t border-border',
    className,
  )}
  {...rest}
>
  {@render children()}
</div>
