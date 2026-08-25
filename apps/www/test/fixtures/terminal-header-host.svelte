<!--
  composition-f fixture: the decomposed terminal-header — chrome only,
  with the nav composed from NavigationMenu parts (one panel item whose
  trigger is the current section + two bare links) and a drawer
  snippet; the header ref exposes closeAll, and the bound drawer open
  state is mirrored out for the two-way lock.
-->
<script lang="ts">
  import TerminalHeader from '../../src/lib/ui/terminal-header/terminal-header.svelte';
  import NavigationMenu from '../../src/lib/ui/navigation-menu/navigation-menu.svelte';
  import NavigationMenuItem from '../../src/lib/ui/navigation-menu/navigation-menu-item.svelte';
  import NavigationMenuTrigger from '../../src/lib/ui/navigation-menu/navigation-menu-trigger.svelte';
  import NavigationMenuPanel from '../../src/lib/ui/navigation-menu/navigation-menu-panel.svelte';
  import NavigationMenuLink from '../../src/lib/ui/navigation-menu/navigation-menu-link.svelte';

  let header: { closeAll(): void } | null = $state(null);
  let open = $state(false);
</script>

<TerminalHeader brand="f-brand" domain="f.jixoai.com" bind:this={header} bind:open>
  <NavigationMenu label="Primary">
    <NavigationMenuItem id="f-docs">
      <NavigationMenuTrigger current>docs</NavigationMenuTrigger>
      <NavigationMenuPanel class="f-panel">
        <a class="f-panel-link" href="/docs/a">docs link a</a>
        <a class="f-panel-link" href="/docs/b">docs link b</a>
      </NavigationMenuPanel>
    </NavigationMenuItem>
    <NavigationMenuLink href="/">home</NavigationMenuLink>
    <NavigationMenuLink href="/tokens">tokens</NavigationMenuLink>
  </NavigationMenu>
  {#snippet drawer()}
    <nav class="f-drawer" aria-label="Primary">
      <a class="f-drawer-link" href="/">drawer home</a>
      <a class="f-drawer-link" href="/tokens">drawer tokens</a>
    </nav>
  {/snippet}
</TerminalHeader>

<!-- the fixture's observation seams (not part of the component) -->
<button type="button" data-fixture-close onclick={() => header?.closeAll()}>fixture closeAll</button>
<span data-fixture-open={open ? 'true' : 'false'}></span>
