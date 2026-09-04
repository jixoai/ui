<!--
  paint-axis-zone-provider — test fixture (paint-axis.spec.ts).

  The BARE zone provider: writes the one paint key via the shared
  helper, no group, no layout — the matrix's zone-only row. Every
  in-repo consumer reads the zone through its paint slot, so this
  shape styles them all.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { providePaintZone, type ZonePaintVariant } from '$lib/paint.svelte';

  let { variant, children }: { variant: ZonePaintVariant | undefined; children: Snippet } = $props();

  providePaintZone(() => variant);
</script>

{@render children()}
