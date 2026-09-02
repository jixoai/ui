<!--
  jixoai dialog-footer (registry/files/ui/dialog/dialog-footer.svelte).

  The foot zone's button economy (r14-9, Owner correction): the slot
  architecture belongs to the footer REGION, carried by a component —
  not to sibling snippets on Dialog. Dialog's footer snippet is the RAW
  full override (use it and you own everything); this component is the
  standard foot you usually reach for:

    children  the action buttons — they auto-join ONE ButtonGroup
              packed at the row's inline end (the Owner's
              inline-end-actions-slot law; the buttons stretch the
              footer open). The ghost default arrives by inheritance
              from Dialog's zone scope — an explicit variant wins.
    end       the RAW inline-end slot (the Owner's footerEnd
              reference): present ⇒ it REPLACES the grouped
              arrangement entirely — the opt-out for non-button
              content or a fully custom cluster.
    label     the ButtonGroup's accessible name.

  Standalone (outside a Dialog foot zone) it still renders the same
  grid — buttons then take their own default variants.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import ButtonGroup from '$lib/ui/button-group/button-group.svelte';
  import './dialog-footer.css';

  interface Props {
    /** Raw inline-end content — replaces the grouped arrangement. */
    end?: Snippet;
    /** The ButtonGroup's accessible name. */
    label?: string;
    /** The action buttons — auto-joined in one end-packed group. */
    children?: Snippet;
  }

  let { end, label = 'Dialog footer', children }: Props = $props();
</script>

<!-- THE FOOT GRID (r14 tuning 2 → r14-9 component face): NO zone
     padding — the grid controls dimensions. Everything hangs at
     INLINE-END (Owner): the group (or the raw end slot) is
     content-sized and stretches the footer open; the narrow-screen
     reversal keeps actions reachable when the panel squeezes -->
<div
  class="jx-dialog-foot-grid @max-[15rem]/jx-dialog:flex-col-reverse @max-[15rem]/jx-dialog:items-stretch"
>
  {#if end}
    {@render end()}
  {:else if children}
    <ButtonGroup {label}>
      {@render children()}
    </ButtonGroup>
  {/if}
</div>
