<!-- terminal-header blueprint: the CRT nav bar in its desktop tier —
     LEFT wing the brand stack (wordmark + domain + subtitle), RIGHT wing
     the nav pill group with the active item plus the switcher slot,
     floating over muted page context. Composition-first (2026-08-25):
     the nav is composed from the navigation-menu family — links-only
     entries as bare NavigationMenuLinks with the pill paint. -->
<script lang="ts">
  import TerminalHeader from '$lib/ui/terminal-header/terminal-header.svelte';
  import NavigationMenu from '$lib/ui/navigation-menu/navigation-menu.svelte';
  import NavigationMenuLink from '$lib/ui/navigation-menu/navigation-menu-link.svelte';
  import ThemeToggle from '$lib/ui/theme-toggle/theme-toggle.svelte';
  import Skeleton from '$lib/ui/skeleton/skeleton.svelte';
  import { icons } from '$lib/icons';
  import { cn } from '$lib/utils';

  // the bezel's pill paint over the family's base (the same law the
  // site layout authors — padding + color utilities through cn())
  const pill = (current: boolean): string =>
    cn(
      'px-2.5 py-1 lg:px-3',
      current ? 'text-terminal-foreground' : 'text-terminal-foreground/70 hover:text-terminal-foreground',
    );
</script>

<div class="flex h-full w-full flex-col gap-8 p-10">
  <TerminalHeader
    brand="jixoai-ui"
    domain="ui.jixoai.com"
    subtitle="the jixoai design language"
    switcherFrame={false}
  >
    <NavigationMenu label="Primary" class="flex-nowrap items-center gap-0">
      <NavigationMenuLink href="/" current class={pill(true)}>Overview</NavigationMenuLink>
      <NavigationMenuLink href="/docs/components" class={pill(false)}>Components</NavigationMenuLink>
      <NavigationMenuLink href="/tokens" class={pill(false)}>Tokens</NavigationMenuLink>
      <NavigationMenuLink href="https://github.com/jixoai/ui" class={pill(false)}>
        GitHub
        <span
          data-jx-ext
          class="inline-flex flex-none w-3 h-3 ms-1 align-[-0.125em] [&_svg]:w-full [&_svg]:h-full"
          aria-hidden="true"
        >{@html icons.externalLink}</span>
      </NavigationMenuLink>
    </NavigationMenu>
    <!-- the compact toggle carries its own bezel frame — the header's
         switcherFrame is opted out above (a framed-in-frame control
         double-borders and breaks the 38px band) -->
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
