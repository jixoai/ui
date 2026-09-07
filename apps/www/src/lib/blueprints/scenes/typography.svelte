<!-- typography blueprint: the scope lib — TypoScope's frozen knob bag
     passes through the plugin chain (TYPOGRAPHY_DEF, matched by
     identity) and resolves PURELY into the host's declarations,
     --jx-ty-* vars and data-jx-ty-* presence attrs; nearest setter
     wins down the context pair. -->
<script lang="ts">
  import Badge from '$lib/ui/badge/badge.svelte';
</script>

<div class="flex h-full w-full flex-col justify-center gap-4 p-10">
  <div class="font-nav text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
    TypoScope · the value domain, never a variant axis
  </div>
  <div class="flex items-center justify-center gap-2.5">
    <div class="flex w-[10.5rem] flex-col gap-0.5 rounded-md border border-border bg-card px-3 py-2">
      <span class="font-mono text-[12px]">TypoScope</span>
      <span class="text-[10px] text-muted-foreground">11 absentSlot fields</span>
    </div>
    <div class="flex w-[3rem] flex-col items-center gap-1 text-[10px] text-muted-foreground">
      <span>apply</span>
      <span class="text-[13px]">→</span>
      <span>chain</span>
    </div>
    <div class="flex w-[10.5rem] flex-col gap-0.5 rounded-md border border-border bg-card px-3 py-2">
      <span class="font-mono text-[12px]">TYPOGRAPHY_DEF</span>
      <span class="text-[10px] text-muted-foreground">plugins target by identity</span>
    </div>
    <div class="flex w-[1.25rem] items-center justify-center text-[13px] text-muted-foreground">→</div>
    <div class="flex w-[10.5rem] flex-col gap-0.5 rounded-md border border-border bg-card px-3 py-2">
      <span class="font-mono text-[12px]">resolveTypoStyle</span>
      <span class="text-[10px] text-muted-foreground">pure: vars + presence attrs</span>
    </div>
  </div>
  <div class="flex flex-wrap items-center justify-center gap-2">
    <Badge>absence IS the state</Badge>
    <Badge>nearest setter wins</Badge>
    <Badge>zero hue slots touched</Badge>
  </div>
</div>
