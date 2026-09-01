<!-- kbd spec host: one glyph, variant switchable — the snippet keeps the
     suite reading the DOM the way a consumer writes it -->
<script lang="ts">
  import Kbd from '$lib/ui/kbd/kbd.svelte';

  let { variant }: { variant?: 'fill' | 'tonal' | 'outline' } = $props();
</script>

<Kbd {variant}>K</Kbd>
