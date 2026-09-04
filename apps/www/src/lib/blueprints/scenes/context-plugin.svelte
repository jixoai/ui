<!-- context-plugin blueprint: the def economy — defs are identity
     objects, a plugin targets one BY REFERENCE, and its hooks wrap
     the raw value as an onion (before outer→inner, after inner→
     outer) exposed as a read-only projection; the medium def is
     read-only — a plugin targeting it is rejected at the type level. -->
<script lang="ts">
  const defs = [
    { name: 'DENSITY_DEF', note: 'Density | undefined', readOnly: false },
    { name: 'HUE_DEF', note: 'number', readOnly: false },
    { name: 'MEDIUM_DEF', note: 'read-only', readOnly: true },
  ];
  const onion = [
    { hook: 'before', note: 'outer → inner' },
    { hook: 'raw', note: 'never written back' },
    { hook: 'after', note: 'inner → outer' },
  ];
</script>

<div class="flex h-full w-full flex-col justify-center gap-4 p-10">
  <div class="font-nav text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
    definePlugin · targets bind defs by identity (not by string)
  </div>
  <div class="flex items-center justify-center gap-2.5">
    <div class="flex flex-col gap-2">
      {#each defs as d (d.name)}
        <div
          class="flex w-[11rem] flex-col gap-0.5 rounded-md border px-3 py-2 {d.readOnly
            ? 'border-dashed border-border bg-transparent'
            : 'border-border bg-card'}"
        >
          <span class="font-mono text-[12px]">{d.name}</span>
          <span class="text-[10px] text-muted-foreground">{d.note}</span>
          {#if d.readOnly}
            <span class="text-[10px] text-muted-foreground">targets type-rejected</span>
          {/if}
        </div>
      {/each}
    </div>
    <div class="flex w-[3rem] flex-col items-center gap-1 text-[10px] text-muted-foreground">
      <span>targets</span>
      <span class="text-[13px]">→</span>
      <span>identity</span>
    </div>
    <div class="flex flex-col gap-2">
      <div class="flex w-[10.5rem] flex-col gap-0.5 rounded-md border border-border bg-card px-3 py-2">
        <span class="font-mono text-[12px]">printDensityPlugin</span>
        <span class="font-mono text-[10px] text-muted-foreground">targets: [DENSITY_DEF]</span>
      </div>
      {#each onion as o (o.hook)}
        <div class="flex w-[10.5rem] items-center justify-between rounded-md border border-border bg-card px-3 py-1.5">
          <span class="font-mono text-[12px]">{o.hook}</span>
          <span class="text-[10px] text-muted-foreground">{o.note}</span>
        </div>
      {/each}
    </div>
    <div class="flex w-[1.25rem] items-center justify-center text-[13px] text-muted-foreground">→</div>
    <div class="flex w-[6.5rem] flex-col gap-0.5 rounded-md border border-border bg-card px-3 py-2">
      <span class="font-mono text-[12px]">exposed</span>
      <span class="text-[10px] text-muted-foreground">the projection</span>
    </div>
  </div>
</div>
