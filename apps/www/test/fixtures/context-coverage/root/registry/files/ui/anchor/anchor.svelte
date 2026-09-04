<!--
  SYNTHETIC GATE FIXTURE — A3 counterexample (the empty call): resolve
  presence is satisfied, but the call sits in a BARE ExpressionStatement
  position — the resolved projection is discarded. The frozen judgment
  syntax (X3-7) rejects exactly this form; assignment/return/spread/
  template sites live in the press-button legal fixture. Designed to
  FAIL verify-context-coverage. Never imported.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { AnchorDefaults } from './anchor-defaults.svelte';

  interface Props {
    variant?: 'tonal' | 'outline';
    children: Snippet;
  }
  let { variant, children }: Props = $props();

  // presence ✓ — but the projection goes nowhere
  AnchorDefaults.resolve({ variant });
</script>

<sup>{@render children()}</sup>
