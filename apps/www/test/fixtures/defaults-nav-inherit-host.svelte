<!--
  defaults-nav-inherit-host — test fixture
  (defaults-nav-providers.spec.ts, context-defaults-economy task 3.3).

  The derived_references_self pin, navigation-and-layout edition: a
  density provider ABOVE six opinion-less provider roots (tabs, table,
  breadcrumb, menubar, dropdown-menu, navigation-menu) whose tier is a
  rerenderable prop. Each root's own provideDensity write must never
  shadow its eager capture (the r11 first contract) — rendering alone
  proves each chain terminates, and the parent flip proves the
  re-resolution path (the pre-3.3 code's reactivity) survives the
  migration.
-->
<script lang="ts">
  import { provideDensity, type Density } from '../../src/lib/density.svelte';
  import Tabs from '../../src/lib/ui/tabs/tabs.svelte';
  import TabsList from '../../src/lib/ui/tabs/tabs-list.svelte';
  import TabsTrigger from '../../src/lib/ui/tabs/tabs-trigger.svelte';
  import TabsContent from '../../src/lib/ui/tabs/tabs-content.svelte';
  import Table from '../../src/lib/ui/table/table.svelte';
  import Breadcrumb from '../../src/lib/ui/breadcrumb/breadcrumb.svelte';
  import BreadcrumbList from '../../src/lib/ui/breadcrumb/breadcrumb-list.svelte';
  import BreadcrumbItem from '../../src/lib/ui/breadcrumb/breadcrumb-item.svelte';
  import BreadcrumbLink from '../../src/lib/ui/breadcrumb/breadcrumb-link.svelte';
  import Menubar from '../../src/lib/ui/menubar/menubar.svelte';
  import DropdownMenu from '../../src/lib/ui/dropdown-menu/dropdown-menu.svelte';
  import DropdownMenuItem from '../../src/lib/ui/dropdown-menu/dropdown-menu-item.svelte';
  import NavigationMenu from '../../src/lib/ui/navigation-menu/navigation-menu.svelte';

  let { parentDensity = 'lg' }: { parentDensity?: Density } = $props();
  provideDensity(() => parentDensity);
</script>

<div data-testid="inherit-tabs">
  <Tabs>
    <TabsList><TabsTrigger value="a">a</TabsTrigger></TabsList>
    <TabsContent value="a">panel</TabsContent>
  </Tabs>
</div>

<div data-testid="inherit-table">
  <Table caption="items"><tbody><tr><td>row</td></tr></tbody></Table>
</div>

<Breadcrumb data-testid="inherit-breadcrumb">
  <BreadcrumbList>
    <BreadcrumbItem><BreadcrumbLink href="/">root</BreadcrumbLink></BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>

<Menubar label="inherit" data-testid="inherit-menubar"><li>bar</li></Menubar>

<div data-testid="inherit-menu">
  <DropdownMenu id="inherit-menu" triggerLabel="actions">
    <DropdownMenuItem onclick={() => {}}>rename</DropdownMenuItem>
  </DropdownMenu>
</div>

<div data-testid="fixed-menu">
  <DropdownMenu id="fixed-menu" density="sm" triggerLabel="actions">
    <DropdownMenuItem onclick={() => {}}>rename</DropdownMenuItem>
  </DropdownMenu>
</div>

<NavigationMenu label="inherit" data-testid="inherit-navmenu"><a href="/docs">docs</a></NavigationMenu>
