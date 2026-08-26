<!-- chip blueprint: the ladder as compact activations — the four
     rungs on the control-scale hit lane (fill/tonal/outline/ghost),
     the hue-injection recipes, and the shape axis with the slot
     lanes. Ripple is the default ink; bevel shows the diamond cut. -->
<script lang="ts">
  import Chip from '$lib/ui/chip/chip.svelte';
  import { ripple } from '$lib/ui/press-button/press-button.svelte';
  import { icons } from '$lib/icons';
</script>

<div class="flex h-full w-full flex-col items-start justify-center gap-4 p-10">
  <div class="flex flex-wrap items-center gap-3">
    <Chip>tonal</Chip>
    <Chip variant="fill">fill</Chip>
    <Chip variant="outline">outline</Chip>
    <Chip variant="ghost">ghost</Chip>
  </div>
  <div class="flex flex-wrap items-center gap-3">
    <Chip class="[--jx-tonal:var(--muted-foreground)]">filter: all</Chip>
    <Chip class="[--jx-tonal:var(--success)]">deployed</Chip>
    <Chip class="[--jx-tonal:var(--error)]">failed</Chip>
  </div>
  <div class="flex flex-wrap items-center gap-3">
    <Chip shape="pill" onclick={() => {}}>pill</Chip>
    <Chip shape="pill" effect={ripple({ shape: 'bevel' })} onclick={() => {}}>
      {#snippet slotStart()}{@html icons.check}{/snippet}
      bevel ink
    </Chip>
  </div>
</div>
