<!--
  Rest-lane probe host (test/fixtures/press-button-restprops-host.svelte,
  issues #4 + #5, 2026-09-13). Every prop spreads onto PressButton
  VERBATIM — the exact shape an arbitrary consumer's attributes take —
  so the spec can drive the natural kebab-case attribute forms
  (aria-label, aria-disabled, disabled) beside the typed camel props
  without hand-listing a prop per probe.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import PressButton from '../../src/lib/ui/press-button/press-button.svelte';

  let { children, ...rest }: { children?: Snippet } & Record<string, unknown> = $props();
</script>

<PressButton {...rest}>{@render children?.()}</PressButton>
