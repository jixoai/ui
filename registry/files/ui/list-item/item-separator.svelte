<!--
  jixoai ItemSeparator — a hairline BETWEEN group items. Must be a
  direct child of ItemGroup (the line belongs to the list). Thin
  wrapper over the registry separator, keeping one geometry source.
-->
<script lang="ts">
  import Separator from '$lib/ui/separator/separator.svelte';
</script>

<Separator data-slot="item-separator" class="jx-item-separator" />
