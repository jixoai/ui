<!-- theme-toggle blueprint: all four variants (full / compact / icon /
     text) on the terminal bezel surface — their native habitat, matching
     the docs demo composition. -->
<script lang="ts">
  import ThemeToggle from '$lib/ui/theme-toggle.svelte';
</script>

<div class="flex h-full w-full items-center justify-center p-10">
  <div
    class="border-border bg-terminal text-terminal-foreground flex w-full max-w-[440px] flex-col gap-4 border p-6"
  >
    <div class="flex items-center justify-between gap-4">
      <span class="font-nav text-[10px] uppercase tracking-[0.24em] opacity-60">full</span>
      <ThemeToggle variant="full" />
    </div>
    <div class="border-terminal-foreground/10 flex items-center justify-between gap-4 border-t pt-4">
      <span class="font-nav text-[10px] uppercase tracking-[0.24em] opacity-60">compact</span>
      <ThemeToggle variant="compact" />
    </div>
    <div class="border-terminal-foreground/10 flex items-center justify-between gap-4 border-t pt-4">
      <span class="font-nav text-[10px] uppercase tracking-[0.24em] opacity-60">icon</span>
      <ThemeToggle variant="icon" />
    </div>
    <div class="border-terminal-foreground/10 flex items-center justify-between gap-4 border-t pt-4">
      <span class="font-nav text-[10px] uppercase tracking-[0.24em] opacity-60">text</span>
      <ThemeToggle variant="text" />
    </div>
  </div>
</div>
