<!-- control-chrome blueprint: the frame/bare axis — one control,
     two chrome resolutions, the provider key between them. -->
<script lang="ts">
  const axis = [
    { row: 'frame', note: 'the default — border + surface, a control reads as an object' },
    { row: 'bare', note: 'embedded in chrome — paint dissolves, the slot carries the affordance' },
  ];
</script>

<div class="flex h-full w-full flex-col justify-center gap-4 p-10">
  <div class="font-nav text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
    CONTROL_CHROME_KEY · explicit ?? ambient ?? 'frame'
  </div>
  {#each axis as a (a.row)}
    <div class={`flex max-w-[26rem] items-center justify-between rounded-md px-4 py-2.5 ${a.row === 'frame' ? 'border border-border bg-card' : 'border border-dashed border-border/50'}`}>
      <span class="font-mono text-[13px]">{a.row}</span>
      <span class="text-[11px] text-muted-foreground">{a.note}</span>
    </div>
  {/each}
  <div class="font-mono text-[10px] text-muted-foreground">providers: item-field / item-group · readers: the control families</div>
</div>
