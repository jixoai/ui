<!-- terminal-header blueprint: the CRT nav bar in its desktop tier —
     LEFT wing the brand stack (wordmark + domain + subtitle), RIGHT wing
     the nav pill group with the active item plus the switcher slot,
     floating over muted page context. -->
<script lang="ts">
  import TerminalHeader from '$lib/ui/terminal-header/terminal-header.svelte';
  import ThemeToggle from '$lib/ui/theme-toggle/theme-toggle.svelte';
  import Skeleton from '$lib/ui/skeleton/skeleton.svelte';
</script>

<div class="flex h-full w-full flex-col gap-8 p-10">
  <TerminalHeader
    brand="jixoai-ui"
    domain="ui.jixoai.com"
    subtitle="the jixoai design language"
    items={[
      { href: '/', label: 'Overview', active: true },
      { href: '/components', label: 'Components' },
      { href: '/tokens', label: 'Tokens' },
      { href: 'https://github.com/jixoai/ui', label: 'GitHub', external: true },
    ]}
  >
    {#snippet switcher()}
      <ThemeToggle variant="compact" />
    {/snippet}
  </TerminalHeader>
  <div class="flex flex-col gap-3 opacity-60">
    <Skeleton class="h-4 w-2/3"></Skeleton>
    <Skeleton class="h-3 w-1/2"></Skeleton>
    <Skeleton class="h-3 w-3/5"></Skeleton>
  </div>
</div>
