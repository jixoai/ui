<!--
  SYNTHETIC GATE FIXTURE — A4 counterexample ("a badge tries to reach
  link"): the family union and the values carrier both contain 'link',
  which the frozen availability table reserves for PressButton alone.
  Designed to FAIL the availability-table consistency check (values
  mismatch + union outside the frozen row). Never imported.
-->
<script module lang="ts">
  export type BadgeVariant = 'fill' | 'tonal' | 'outline' | 'link';
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import { BadgeDefaults } from './badge-defaults.svelte';

  interface Props {
    variant?: BadgeVariant;
    children: Snippet;
  }
  let { variant, children }: Props = $props();

  const d = $derived(BadgeDefaults.resolve({ variant }));
</script>

<span data-variant={d.variant}>{@render children()}</span>
