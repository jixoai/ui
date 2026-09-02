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

  THE OPENING LINE (r14-11, Owner): the actions cluster STARTS with a
  vertical Separator — the foot's own region boundary, spanning the
  zone's height, so the cluster reads as a cut-out actions area (the
  intra-group seams rule the buttons; this line opens the region). It
  rides both faces — before the group, and before the end slot's
  content (end replaces the button-group, not the foot's lines) — and
  never renders when the foot is empty.

  Standalone (outside a Dialog foot zone) it still renders the same
  grid — buttons then take their own default variants.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import ButtonGroup from '$lib/ui/button-group/button-group.svelte';
  import Separator from '$lib/ui/separator/separator.svelte';
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
     INLINE-END (Owner): the opening line and the cluster (the group,
     or the raw end slot) are content-sized and stretch the footer
     open; the narrow-screen reversal keeps actions reachable when the
     panel squeezes -->
<div
  class="jx-dialog-foot-grid @max-[15rem]/jx-dialog:flex-col-reverse @max-[15rem]/jx-dialog:items-stretch"
>
  {#if end}
    <!-- the actions region's opening line (r14-11) — decorative,
         spanning the zone height, self-stretch in the grid -->
    <Separator orientation="vertical" aria-hidden="true" />
    {@render end()}
  {:else if children}
    <Separator orientation="vertical" aria-hidden="true" />
    <ButtonGroup {label}>
      {@render children()}
    </ButtonGroup>
  {/if}
</div>
