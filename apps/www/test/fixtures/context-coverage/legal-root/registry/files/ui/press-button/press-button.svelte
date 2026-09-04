<!--
  SYNTHETIC GATE FIXTURE (context-defaults-economy task 1.4, 2026-09-03).
  The LEGAL positive placeholder: exercises every PASSING path of
  verify-context-coverage — vocabulary props covered by slots, branded
  factory calls with explicit type arguments, availability consistency
  against the frozen table, and resolve presence in all FOUR accepted
  call-site forms (assignment / return / spread / template — X3-7).
  NEVER imported by the app or the suite; NOT part of the real registry.
  The real positive integration lands with the pilot batch (tasks 2.x)
  on the REAL registry/files/lib/defaults.svelte.ts (task 1.1) — TODO
  (orchestrator): once the pilot batch ships, the spec gains a real-tree
  `--scope=pilot` GREEN assertion mirroring this fixture's shape.
-->
<script module lang="ts">
  export type PressButtonVariant = 'fill' | 'tonal' | 'outline' | 'ghost' | 'link';
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { PressButtonDefaults } from './press-button-defaults.svelte';

  interface Props {
    variant?: PressButtonVariant;
    density?: 'lg' | 'default' | 'sm' | 'xs';
    children: Snippet;
  }

  let { variant, density, children }: Props = $props();

  // accepted call-site forms — none of these is a bare ExpressionStatement
  const d = $derived(PressButtonDefaults.resolve({ variant, density }));
  function projection() {
    return PressButtonDefaults.resolve({ variant, density });
  }
  const merged = { ...PressButtonDefaults.resolve({ variant }), pinned: true };
  const used = [projection(), merged];
</script>

<button data-variant={PressButtonDefaults.resolve({ variant }).variant} data-density={d.density}>
  {@render children()}
  {used.length}
</button>
