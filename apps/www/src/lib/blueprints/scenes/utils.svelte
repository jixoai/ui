<!-- utils blueprint: the cn() class-string hygiene law. -->
<script lang="ts">
  import { cn } from '$lib/utils';
</script>

<div class="flex h-full w-full flex-col items-start justify-center gap-5 p-10 font-mono text-sm">
  <div class="text-muted-foreground">// clsx joins · tailwind-merge dedupes</div>
  <div class="rounded-none border border-border bg-muted px-2 py-1 shadow-2xs">
    cn('<span class="text-accent">p-2</span>', '<span class="text-accent">p-4</span>')
  </div>
  <div class="text-primary">→ 'p-4'</div>
  <div class="text-muted-foreground">// never a cascade mechanism — the layer law owns overrides</div>
</div>
