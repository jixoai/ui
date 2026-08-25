<!--
  jixoai StepsSeparator (registry/files/ui/steps/steps-separator.svelte,
  composition-first-apis, 2026-08-25).
  The connector between one step's marker and the next — an authored,
  zero-footprint overlay (absolute inset-0, pointer-transparent) whose
  ::after line is drawn by steps.css:

    - default: the hairline toward the next marker (var(--border));
    - inside a done item: repainted primary;
    - inside the LAST item: display:none — the self-hide chrome
      exception (REAL DOM hooks — component names never appear in the
      DOM, per the default-parts law).
  (props-discipline sweep, 2026-08-25)
-->
<script lang="ts">
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';

  interface Props extends HTMLAttributes<HTMLSpanElement> {
    class?: string;
  }

  let { class: className = '', ...rest }: Props = $props();
</script>

<span data-jx-step-separator="" class={cn('pointer-events-none absolute inset-0', className)} {...rest} aria-hidden="true"></span>
