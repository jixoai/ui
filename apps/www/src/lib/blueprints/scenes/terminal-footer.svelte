<!-- terminal-footer blueprint: the ghost wordmark close — the huge
     hollow brand word (text-stroke recipe) over the muted meta link row,
     with faint page content above it. Explicit copyright keeps the
     render deterministic (no wall-clock year in the shot). -->
<script lang="ts">
  import TerminalFooter from '$lib/ui/terminal-footer.svelte';
  import Skeleton from '$lib/ui/skeleton.svelte';
</script>

<div class="flex h-full w-full flex-col justify-between p-8">
  <div class="flex flex-col gap-3 opacity-50">
    <Skeleton class="h-3 w-1/2"></Skeleton>
    <Skeleton class="h-3 w-2/3"></Skeleton>
  </div>
  <TerminalFooter
    ghost="JIXOAI"
    links={[
      { label: 'GitHub', href: 'https://github.com/jixoai/ui' },
      { label: 'Registry JSON', href: '/r/registry.json' },
    ]}
    copyright="© 2026 jixoai · MIT"
  />
</div>
