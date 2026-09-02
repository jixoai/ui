<!-- entity blueprint: the entity law — border is objecthood, but a
     well's edge is structure (r14-12). Depth 0 owns edge + ground;
     depth 1 keeps the well hairline and dissolves the ground; the
     force-spend restores the ground; the opt-out dissolves fully. -->
<script lang="ts">
  import Input from '$lib/ui/input/input.svelte';
  import { provideEntity } from '$lib/entity.svelte';

  const depth = provideEntity();
</script>

<div class="flex h-full w-full flex-col justify-center gap-4 p-10">
  <div class="font-nav text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
    entity law · border = objecthood · the well edge is structure
  </div>
  <div class="flex flex-wrap items-start gap-6">
    <label class="flex w-52 flex-col gap-1.5 text-[11px]">
      <span class="text-muted-foreground">page level (depth 0)</span>
      <Input type="text" value="owns its edge" />
    </label>
    <div
      class="flex w-[22rem] flex-col gap-3 border border-border bg-popover p-4 text-popover-foreground"
      data-jx-entity={depth}
    >
      <div class="font-nav text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        the entity (depth 1) — one solid object
      </div>
      <label class="flex flex-col gap-1.5 text-[11px]">
        <span class="text-muted-foreground">depth 1 — edge stays, ground dissolves</span>
        <Input type="text" value="hairline + inset, no ground" />
      </label>
      <label class="flex flex-col gap-1.5 text-[11px]">
        <span class="text-muted-foreground">force-spend (data-assert-border)</span>
        <Input type="text" value="ground spent early" data-assert-border />
      </label>
      <label class="flex flex-col gap-1.5 text-[11px]">
        <span class="text-muted-foreground">opt-out (data-dissolve-border)</span>
        <Input type="text" value="the inset alone" data-dissolve-border />
      </label>
    </div>
  </div>
</div>
