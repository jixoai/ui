<!-- terminal-header blueprint: the CRT nav bar in its desktop tier —
     LEFT wing the brand stack (wordmark + domain + subtitle), RIGHT wing
     the nav pill group with the active item plus the switcher slot,
     floating over muted page context. Composition-first (2026-08-25):
     the nav is composed from the navigation-menu family — links-only
     entries as bare NavigationMenuLinks with the pill paint.
     (tailwindless BP-B 2026-09-16: utilities → surface atoms — the
     pill map resolves to atoms at module scope, the cn() seam and its
     utility strings are gone; the lg:px-3 step rides a media value
     object at Tailwind's own 64rem threshold.) -->
<script lang="ts">
  import TerminalHeader from '$lib/ui/terminal-header/terminal-header.svelte';
  import NavigationMenu from '$lib/ui/navigation-menu/navigation-menu.svelte';
  import NavigationMenuLink from '$lib/ui/navigation-menu/navigation-menu-link.svelte';
  import ThemeToggle from '$lib/ui/theme-toggle/theme-toggle.svelte';
  import Skeleton from '$lib/ui/skeleton/skeleton.svelte';
  import Icon from '$lib/ui/icon';
  import { bpB } from '../../surface/blueprints-b.stylex';
  import Stack from '$lib/ui/stack';

  const cx = (
    ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
  ): string =>
    styles
      .filter(Boolean)
      .map((style) =>
        typeof style === 'string'
          ? style
          : Object.entries(style).flatMap(([key, value]) =>
              key !== '$$css' && typeof value === 'string' ? [value] : [],
            ).join(' '),
      )
      .join(' ');

  // the bezel's pill paint over the family's base (the same law the
  // site layout authors — atoms joined through cx(), the hover pose a
  // pseudo value object)
  const pill = (current: boolean): string =>
    cx(
      bpB.terminalHeaderPill,
      current ? bpB.terminalHeaderPillCurrent : bpB.terminalHeaderPillDim,
    );
</script>

<Stack direction="column" gap="32" class={cx(bpB.terminalHeaderStage)}>
  <TerminalHeader
    brand="jixoai-ui"
    domain="ui.jixoai.com"
    subtitle="the jixoai design language"
    switcherFrame={false}
  >
    <NavigationMenu label="Primary" class={cx(bpB.terminalHeaderNav)}>
      <NavigationMenuLink href="/" current class={pill(true)}>Overview</NavigationMenuLink>
      <NavigationMenuLink href="/docs/components" class={pill(false)}>Components</NavigationMenuLink>
      <NavigationMenuLink href="/tokens" class={pill(false)}>Tokens</NavigationMenuLink>
      <NavigationMenuLink href="https://github.com/jixoai/ui" class={pill(false)}>
        GitHub
        <span
          data-jx-ext
          class={cx(bpB.terminalHeaderExt)}
          aria-hidden="true"
        ><Icon name="externalLink" size={12} /></span>
      </NavigationMenuLink>
    </NavigationMenu>
    <!-- the compact toggle carries its own bezel frame — the header's
         switcherFrame is opted out above (a framed-in-frame control
         double-borders and breaks the 38px band) -->
    {#snippet switcher()}
      <ThemeToggle variant="compact" />
    {/snippet}
  </TerminalHeader>
  <Stack direction="column" gap="12" class={cx(bpB.terminalHeaderSkel)} }>
    <Skeleton class={cx(bpB.terminalHeaderSkelA)}></Skeleton>
    <Skeleton class={cx(bpB.terminalHeaderSkelB)}></Skeleton>
    <Skeleton class={cx(bpB.terminalHeaderSkelC)}></Skeleton>
  </Stack>
</Stack>
