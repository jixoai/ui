<!--
  unit-resolve-host — the generic in-window resolve carrier
  (context-plugin-v2 D3-C, W2 task 3.4).

  The hard window contract retired the outside-window degradation:
  a resolve that reads context (a paint/density ambient lane, the
  plugin scope) must run INSIDE a component window or Svelte's own
  lifecycle_outside_component propagates. This host carries such
  resolves for the migrated spec its: `compute` runs inside a
  $derived (the consumer read point — the same coordinate a family
  component resolves in, rootless: no provider, no plugin root, so
  the ambient lanes stay silent and the scope read takes the
  identity path), and `onvalue` reports the outcome back to the
  spec once computed — the value, or the thrown error (the host
  REPORTS, never degrades; both faces stay assertable).
-->
<script lang="ts" generics="T">
  let {
    compute,
    onvalue,
  }: {
    compute: () => T;
    onvalue?: (value: T | undefined, error: unknown) => void;
  } = $props();

  const outcome = $derived.by(() => {
    try {
      return { value: compute(), error: undefined };
    } catch (error) {
      return { value: undefined as T | undefined, error };
    }
  });

  $effect(() => {
    onvalue?.(outcome.value, outcome.error);
  });
</script>
