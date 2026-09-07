<!--
  The reading-content family's zone host (markdown-coverage lane C,
  2026-09-07) — one mount surface for the Defaults-semantics pair the
  spec pins: blockquote's PAINT slot resolves `explicit ?? ambient(zone)
  ?? own 'outline'` while text's mark LITERAL slot never reads the zone
  (the kbd precedent — literal families are own-only until a table
  freeze says otherwise). The zone prop is rerenderable: the spec flips
  it in-place to pin same-frame re-derivation.
-->
<script lang="ts">
  import ZoneProvider from './paint-axis-zone-provider.svelte';
  import Blockquote from '../../src/lib/ui/blockquote/blockquote.svelte';
  import Text from '../../src/lib/ui/text/text.svelte';

  let { zone = 'tonal' }: { zone?: 'fill' | 'tonal' | 'outline' | 'ghost' } = $props();
</script>

<section data-testid="zone">
  <ZoneProvider variant={zone}>
    <Blockquote>zoned quote body</Blockquote>
    <Text>zoned paragraph body</Text>
  </ZoneProvider>
</section>
