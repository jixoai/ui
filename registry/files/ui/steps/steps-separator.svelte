<!--
  jixoai StepsSeparator (registry/files/ui/steps/steps-separator.svelte;
  grid-anatomy rebuild, 2026-09-01).
  The connector between one step's marker and the next — a REAL box now
  (the grid-anatomy fix: the old absolute ::after ran THROUGH the
  labels at marker height). The item's grid gives it the TAIL lane,
  aligned to the marker's center line by the engine:

    - default: the hairline toward the next marker (var(--border));
    - inside a done or success item: repainted (primary / success);
    - inside the LAST item: display:none — the self-hide chrome
      exception (REAL DOM hooks — component names never appear in the
      DOM, per the default-parts law).
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    class?: string;
  }

  let { class: className = '', ...rest }: Props = $props();
</script>

<span
  data-jx-step-separator=""
  class={cn('pointer-events-none', className)}
  {...rest}
  aria-hidden="true"
></span>
