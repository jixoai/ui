<!-- kbd blueprint: a keyboard shortcut row. -->
<script lang="ts">
  import Kbd from '$lib/ui/kbd/kbd.svelte';
</script>

<div class="flex h-full w-full flex-col items-start justify-center gap-5 p-10">
  <div class="flex items-center gap-2 text-sm">
    <Kbd density="lg">⌘</Kbd><Kbd density="lg">K</Kbd>
    <span class="text-muted-foreground">open the command surface</span>
  </div>
  <div class="flex items-center gap-2 text-sm">
    <Kbd>⌘</Kbd><Kbd>⇧</Kbd><Kbd>P</Kbd>
    <span class="text-muted-foreground">preview deployment</span>
  </div>
</div>
