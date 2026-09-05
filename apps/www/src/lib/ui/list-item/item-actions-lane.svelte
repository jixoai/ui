<!--
  jxoai ItemActionsLane (registry/files/ui/list-item/item-actions-lane.svelte).
  The semantic end lane for ACTION rows (Owner 2026-09-05 r3, design
  referencing DialogFooter): a thin semantic wrapper of ItemEnd that
  defaults the two things an action cluster wants —
    1. raised={false} physics (the ButtonVariantScope seam): buttons
       ride flat — the engrave-tier inset press — because the row
       frame is already the raised surface; a convex button inside a
       convex row stacks two light sources
    2. a joined ButtonGroup (leadingSeam on): one cluster border, the
       group owns its seams/radius — the lane provides gap/align/wrap
       only and NEVER reaches into the group (the B6 boundary)
  Buttons stay individually focused/labeled; the group's accessible
  name rides `label`. Escape hatches are the underlying pieces — raw
  ItemEnd composes anything else.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import ItemEnd from './item-end.svelte';
  import type { ItemEndInset } from './item-end.svelte';
  import ButtonGroup from '../button-group/button-group.svelte';
  import ButtonVariantScope from '../button-group/button-variant-scope.svelte';

  let {
    /** the cluster's accessible name (rides the ButtonGroup) */
    label,
    /** the trailing-inset contract, forwarded to the end lane verbatim */
    inset = 'auto',
    class: className = '',
    children,
  }: {
    label: string;
    inset?: ItemEndInset;
    class?: string;
    children: Snippet;
  } = $props();
</script>

<ButtonVariantScope raised={false}>
  <ItemEnd wrap="never" {inset} class={className}>
    <ButtonGroup {label} leadingSeam>
      {@render children()}
    </ButtonGroup>
  </ItemEnd>
</ButtonVariantScope>
