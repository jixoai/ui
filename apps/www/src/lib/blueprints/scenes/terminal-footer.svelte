<!-- terminal-footer blueprint: the ghost wordmark close — the huge
     hollow brand word (text-stroke recipe) over the composed column
     meta row, with faint page content above it. Explicit copyright
     keeps the render deterministic (no wall-clock year in the shot). -->
<script lang="ts">
  import TerminalFooter from '$lib/ui/terminal-footer/terminal-footer.svelte';
  import TerminalFooterColumn from '$lib/ui/terminal-footer/terminal-footer-column.svelte';
  import Skeleton from '$lib/ui/skeleton/skeleton.svelte';
</script>

<div class="flex h-full w-full flex-col justify-between p-8">
  <div class="flex flex-col gap-3 opacity-50">
    <Skeleton class="h-3 w-1/2"></Skeleton>
    <Skeleton class="h-3 w-2/3"></Skeleton>
  </div>
  <TerminalFooter ghost="JIXOAI" copyright="© 2026 jixoai · MIT">
    <TerminalFooterColumn title="project">
      <a href="https://github.com/jixoai/ui" target="_blank" rel="noreferrer">GitHub</a>
      <a href="/r/registry.json">Registry JSON</a>
    </TerminalFooterColumn>
  </TerminalFooter>
</div>
