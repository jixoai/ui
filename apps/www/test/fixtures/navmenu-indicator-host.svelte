<!--
  Test host for the navigation-menu indicator part (2026-09-01): a
  three-entry bar under the default navigation motion, a pure-waapi
  bar, and an exclusion bar whose only current entry lives inside an
  open popover panel (mega links never steal the bar indicator).
  The nested-nav scopes (Codex P2, 2026-09-02): a plain <nav> inside
  an INLINE (non-popover) panel must not leak its aria-current link to
  the outer bar, while a chrome-box bar (no nav — the TerminalHeader
  pill shape) still measures the consumer nav directly inside it.
-->
<script lang="ts">
  import NavigationMenu from '../../src/lib/ui/navigation-menu/navigation-menu.svelte';
  import NavigationMenuItem from '../../src/lib/ui/navigation-menu/navigation-menu-item.svelte';
  import NavigationMenuTrigger from '../../src/lib/ui/navigation-menu/navigation-menu-trigger.svelte';
  import NavigationMenuPanel from '../../src/lib/ui/navigation-menu/navigation-menu-panel.svelte';
  import NavigationMenuLink from '../../src/lib/ui/navigation-menu/navigation-menu-link.svelte';
  import NavigationMenuIndicator from '../../src/lib/ui/navigation-menu/navigation-menu-indicator.svelte';
</script>

<div data-testid="navigation-motion">
  <NavigationMenu label="primary">
    <NavigationMenuIndicator />
    <NavigationMenuLink href="/" current={true}>overview</NavigationMenuLink>
    <NavigationMenuItem id="docs-host">
      <NavigationMenuTrigger current={false}>docs</NavigationMenuTrigger>
      <NavigationMenuPanel>
        <NavigationMenuLink href="/docs">inside panel</NavigationMenuLink>
      </NavigationMenuPanel>
    </NavigationMenuItem>
    <NavigationMenuLink href="/components" current={false}>components</NavigationMenuLink>
  </NavigationMenu>
</div>

<div data-testid="waapi-motion">
  <NavigationMenu label="secondary">
    <NavigationMenuIndicator motion="waapi" name="never-stamped" />
    <NavigationMenuLink href="/a" current={true}>a</NavigationMenuLink>
    <NavigationMenuLink href="/b" current={false}>b</NavigationMenuLink>
  </NavigationMenu>
</div>

<div data-testid="excluded">
  <NavigationMenu label="tertiary">
    <NavigationMenuIndicator />
    <NavigationMenuItem id="mega-host">
      <NavigationMenuTrigger current={false}>sections</NavigationMenuTrigger>
      <NavigationMenuPanel>
        <NavigationMenuLink href="/x" current={true}>current INSIDE the panel</NavigationMenuLink>
      </NavigationMenuPanel>
    </NavigationMenuItem>
  </NavigationMenu>
</div>

<!-- the nested-nav leak (Codex P2, 2026-09-02): an INLINE panel (no
     [popover] attribute — the exclusion the old predicate missed)
     hosting a plain <nav> whose link carries aria-current. The inner
     nav owns that truth; the outer bar has NO current entry of its
     own, so its indicator stands down -->
<div data-testid="nested-nav">
  <NavigationMenu label="leaky">
    <NavigationMenuIndicator />
    <NavigationMenuLink href="/own" current={false}>own entry</NavigationMenuLink>
    <div data-inline-panel>
      <nav aria-label="panel sections">
        <NavigationMenuLink href="/nested" current={true}>current INSIDE the nested nav</NavigationMenuLink>
      </nav>
    </div>
  </NavigationMenu>
</div>

<!-- the chrome-box bar (the TerminalHeader pill shape): the indicator
     composes OUTSIDE any nav, the consumer nav lands directly inside
     the box — the single-nav-layer rule still measures it -->
<div data-testid="chrome-box">
  <div class="pill-box">
    <NavigationMenuIndicator motion="waapi" name="never-stamped" />
    <NavigationMenu label="in-box">
      <NavigationMenuLink href="/c" current={true}>boxed current</NavigationMenuLink>
      <NavigationMenuLink href="/d" current={false}>boxed other</NavigationMenuLink>
    </NavigationMenu>
  </div>
</div>
