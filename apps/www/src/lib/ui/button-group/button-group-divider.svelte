<!--
  jixoai button group — the DIVIDER part (registry/files/ui/
  button-group/button-group-divider.svelte, OpenSpec
  2026-08-30-expand-form-family F2).

  The explicit hairline between joined clusters: a 1px
  var(--border) block that REPLACES the collapsed seam (it collapses
  into the neighbors' borders — the total seam stays 1px, see
  button-group.css). Geometry follows the group's orientation through
  the context: a horizontal group's divider is a vertical hairline
  (aria-orientation="vertical"), a vertical group's a horizontal one.

  ARIA: role=separator with the line's orientation — a boundary
  landmark BETWEEN the clusters, announced without stealing focus
  (it is not focusable; the separator role needs no interaction).
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { getContext } from 'svelte';
  import { cn } from '$lib/utils';
  import { BUTTON_GROUP_KEY, type ButtonGroupApi } from './button-group.svelte';

  interface Props extends HTMLAttributes<HTMLDivElement> {
    class?: string;
  }

  let { class: className = '', ...rest }: Props = $props();

  const group = getContext<ButtonGroupApi | undefined>(BUTTON_GROUP_KEY);
  // aria-orientation describes the LINE, not the flow: a horizontal
  // group's divider is a vertical hairline (and vice versa); outside
  // any group it defaults to the horizontal flow
  const lineOrientation = $derived(
    (group?.orientation ?? 'horizontal') === 'horizontal' ? 'vertical' : 'horizontal',
  );
</script>

<div
  {...rest}
  role="separator"
  aria-orientation={lineOrientation}
  data-jx-btngroup-divider
  class={cn(className)}
></div>
