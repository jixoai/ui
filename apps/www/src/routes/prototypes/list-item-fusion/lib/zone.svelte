<!--
  Zone — thin paint-zone wrapper (the production ambient contract):
  the row/group decides the chrome mood; press-family components
  inside already resolve explicit ?? zone ?? own.
-->
<script lang="ts">
  import { providePaintZone, type ZonePaintVariant } from '$lib/paint.svelte';
  let { variant, children }: { variant: ZonePaintVariant; children: Snippet } = $props();
  providePaintZone(() => variant);
</script>

{@render children()}
