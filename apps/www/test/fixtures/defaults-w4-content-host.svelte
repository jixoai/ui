<!--
  The W4 content-and-scene Defaults migration host
  (test/fixtures/defaults-w4-content-host.svelte,
  context-defaults-economy task 3.4, 2026-09-03).

  One render, six regions, the REAL components (state read back
  through the valued hooks — data-jx-inline-code / data-jx-avatar /
  data-jx-chart-bar / data-density / data-item-chrome — never through
  internals):
    bare      — no providers: the frozen own (inline-code tonal) and
                literal owns (avatar md/bevel, chart fill/96) resolve;
                the no-opinion density slots stamp nothing
    zone      — paint zone 'outline' + density 'sm': inline-code (the
                frozen-table row) goes ambient, the LITERAL slots
                (avatar silhouette, language-switcher structure) stay
                own, the explicit props still win
    ghost     — paint zone 'ghost': outside inline-code's family
                values — the unsupported external surface (D3-A
                retired the runtime values guard; nothing asserts
                this region)
    ensemble  — Chart with density="sm": the provider tier reaches
                the glyphs through the r11 eager-capture provider
                form; an explicit glyph density still wins
    list      — ItemGroup with density="sm": the group's stamps, the
                rows' stamps and the adapter rows (checkbox/toggle)
                all land sm; an explicit row density and an explicit
                variant still win; inset/tone ride their literal slots
    ghostty   — the slot-only window: GhosttyTermDefaults resolved
                inside a $derived under a density provider (the wasm
                component itself is pinned by ghostty-term.spec.ts;
                here the FAMILY OWN 'default' is the target)
  The ensemble/list density props are rerenderable: the spec flips
  them to pin the inherit-then-provide reactivity (the
  derived_references_self guard — the r11 provider contract).
-->
<script lang="ts">
  import Statistic from '$lib/ui/statistic/statistic.svelte';
  import InlineCode from '$lib/ui/inline-code/inline-code.svelte';
  import Avatar from '$lib/ui/avatar/avatar.svelte';
  import LanguageSwitcher from '$lib/ui/language-switcher/language-switcher.svelte';
  import Chart from '$lib/ui/chart/chart.svelte';
  import ChartBar from '$lib/ui/chart/chart-bar.svelte';
  import ChartDonut from '$lib/ui/chart/chart-donut.svelte';
  import ChartSparkline from '$lib/ui/chart/chart-sparkline.svelte';
  import Item from '$lib/ui/list-item/item.svelte';
  import ItemGroup from '$lib/ui/list-item/item-group.svelte';
  import ItemContent from '$lib/ui/list-item/item-content.svelte';
  import ItemTitle from '$lib/ui/list-item/item-title.svelte';
  import ItemAfter from '$lib/ui/list-item/item-after.svelte';
  import ItemEnd from '$lib/ui/list-item/item-end.svelte';
  import ItemCheckbox from '$lib/ui/list-item/item-checkbox.svelte';
  import ItemToggle from '$lib/ui/list-item/item-toggle.svelte';
  import ZoneProvider from './paint-axis-zone-provider.svelte';
  import DensityProvider from './density-provider-host.svelte';
  import GhosttySlotProbe from './defaults-w4-ghostty-slot-probe.svelte';

  let {
    ensembleDensity = 'sm',
    groupDensity = 'sm',
  }: { ensembleDensity?: 'sm' | 'default'; groupDensity?: 'sm' | 'default' } = $props();

  const pairLocales = [
    { code: 'en', label: 'EN', href: '/en' },
    { code: 'zh', label: '中文', href: '/zh' },
  ];
</script>

<section data-testid="bare">
  <Statistic title="downloads" value="1.2M" />
  <InlineCode>npm i @jixoai/ui</InlineCode>
  <Avatar name="Ada Lovelace" />
  <ChartBar data={[3, 5, 2]} label="bare bars" />
  <ChartDonut data={[1, 2, 3]} label="bare donut" />
  <LanguageSwitcher locales={pairLocales} current="en" />
  <Item><ItemContent><ItemTitle>standalone row</ItemTitle></ItemContent></Item>
</section>

<section data-testid="zone">
  <ZoneProvider variant="outline">
    <DensityProvider density="sm">
      <InlineCode>zone chip</InlineCode>
      <InlineCode variant="tonal">explicit wins</InlineCode>
      <Avatar name="Grace Hopper" />
      <Statistic title="uptime" value="99.9%" />
      <Statistic title="errors" value="3" density="lg" />
    </DensityProvider>
  </ZoneProvider>
</section>

<section data-testid="ghost">
  <ZoneProvider variant="ghost">
    <InlineCode>ghost zone chip</InlineCode>
  </ZoneProvider>
</section>

<section data-testid="ensemble">
  <Chart density={ensembleDensity}>
    <ChartBar data={[4, 6, 2]} label="ensemble bars" />
    <ChartBar data={[1, 1, 1]} label="explicit tier" density="xs" variant="tonal" />
    <ChartSparkline data={[1, 3, 2, 5]} label="ensemble spark" />
  </Chart>
</section>

<section data-testid="list">
  <ItemGroup density={groupDensity} label="settings">
    <Item>
      <ItemContent><ItemTitle>grouped row</ItemTitle></ItemContent>
      <ItemEnd><ItemAfter>3 min</ItemAfter></ItemEnd>
    </Item>
    <Item density="xs">
      <ItemContent><ItemTitle>explicit row</ItemTitle></ItemContent>
      <ItemEnd><ItemAfter tone="default">just now</ItemAfter></ItemEnd>
    </Item>
    <Item variant="outline">
      <ItemContent><ItemTitle>outline row</ItemTitle></ItemContent>
    </Item>
    <ItemCheckbox label="checkbox row" description="adapter restate" />
    <ItemToggle label="toggle row" />
  </ItemGroup>
  <ItemGroup inset>
    <Item><ItemContent><ItemTitle>inset group</ItemTitle></ItemContent></Item>
  </ItemGroup>
</section>

<section data-testid="ghostty">
  <!-- the provider rides its own subtree: the bare region above stays
       unstamped (fleet law) — the probe is the ONLY consumer here -->
  <DensityProvider density={groupDensity}>
    <GhosttySlotProbe />
  </DensityProvider>
</section>
