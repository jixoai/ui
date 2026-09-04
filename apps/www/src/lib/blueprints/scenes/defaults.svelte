<!-- defaults blueprint: the slot resolution ladder — explicit beats
     ambient beats own, one Defaults object per family. -->
<script lang="ts">
  const ladder = [
    { row: 'explicit', note: 'variant="fill"' },
    { row: 'ambient', note: 'zone → ghost' },
    { row: 'own', note: "definePaintSlot(values, 'outline')" },
  ];
</script>

<div class="flex h-full w-full flex-col justify-center gap-4 p-10">
  <div class="font-nav text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
    DefaultsSlot · resolve({ '{'} variant {'}' }) → one line per family
  </div>
  {#each ladder as l (l.row)}
    <div class="flex max-w-[22rem] items-center justify-between rounded-md border border-border bg-card px-4 py-2.5">
      <span class="font-mono text-[13px]">{l.row}</span>
      <span class="text-[11px] text-muted-foreground">{l.note}</span>
    </div>
  {/each}
</div>
