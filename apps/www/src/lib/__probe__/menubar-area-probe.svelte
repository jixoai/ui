<!--
  Menubar position-area probe fixture
  (apps/www/src/lib/__probe__/menubar-area-probe.svelte).

  visual-quality-iteration W5.1: the standing anchor-sweep probe
  (scripts/verify-popover-area-align.mjs, popover-area precedent)
  needs the REAL menubar panel rendered at a DRIVABLE anchor pose —
  the docs demos pin the bar at the page top where flip-block never
  engages. This fixture renders the real family (Menubar >
  MenubarItem > MenubarTrigger + MenubarPanel; item id 'probe-mb'
  → panel id 'probe-mb-panel') with the bar's pose chosen by ?at=
  (top = the direct arm — the panel's authored below-and-start
  geometry fits a 1440×900 viewport so no rescue may mask it;
  bottom = the flip-block collision arm — the bar sits near the
  viewport bottom and the panel must flip above while KEEPING the
  spec-grammar start alignment). The fixture root stamps data-at as
  the probe's read-back guard. The probe's swapped-map negative
  control plants the pre-sweep literal ('bottom span-left') inline
  with position-try neutered, so the authored end-alignment renders
  unmasked (browser-side only — this fixture stays dumb).
-->
<script lang="ts">
  import Menubar from '$lib/ui/menubar/menubar.svelte';
  import MenubarItem from '$lib/ui/menubar/menubar-item.svelte';
  import MenubarTrigger from '$lib/ui/menubar/menubar-trigger.svelte';
  import MenubarPanel from '$lib/ui/menubar/menubar-panel.svelte';
  import MenubarMenuItem from '$lib/ui/menubar/menubar-menu-item.svelte';

  type ProbeAt = 'top' | 'bottom';
  let at = $state<ProbeAt>('top');
  // runs browser-side only (effects never run SSR) — reads the param
  // once per load; non-reactive input, so the effect settles
  $effect(() => {
    const a = new URLSearchParams(window.location.search).get('at');
    if (a === 'top' || a === 'bottom') at = a;
  });

  // fixed-position wrapper: geometry independent of page flow, so the
  // probe's viewport math is deterministic across arms
  const pose = $derived(at === 'top' ? 'left-[80px] top-[120px]' : 'left-[80px] bottom-[48px]');
</script>

<div data-probe-menubar-area="" data-at={at} class="fixed {pose}">
  <Menubar label="probe bar">
    <MenubarItem id="probe-mb">
      <MenubarTrigger>Probe</MenubarTrigger>
      <MenubarPanel>
        <MenubarMenuItem onselect={() => {}}>probe entry one</MenubarMenuItem>
        <MenubarMenuItem onselect={() => {}}>probe entry two</MenubarMenuItem>
        <MenubarMenuItem onselect={() => {}}>probe entry three</MenubarMenuItem>
      </MenubarPanel>
    </MenubarItem>
  </Menubar>
</div>
