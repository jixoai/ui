<!-- command-match blueprint: the frozen predicate — pure inclusion,
     never reorder; authored tree order is the walk order. -->
<script lang="ts">
  const rows = [
    { label: 'Dialog', visible: true },
    { label: 'Command Palette', visible: true },
    { label: 'z-order helper', visible: false },
    { label: 'Popover', visible: true },
  ];
</script>

<div class="flex h-full w-full flex-col justify-center gap-2.5 p-10">
  <div class="font-nav text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
    match(item, query) → boolean · visible/hidden only
  </div>
  {#each rows as r (r.label)}
    <div
      class="max-w-[22rem] rounded-md border px-4 py-2 {r.visible
        ? 'border-border bg-card'
        : 'border-transparent bg-transparent opacity-40 line-through'}"
    >
      <span class="font-mono text-[13px]">{r.label}</span>
    </div>
  {/each}
</div>
