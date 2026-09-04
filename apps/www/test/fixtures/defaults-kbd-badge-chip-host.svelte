<!--
  The kbd/badge/chip Defaults migration host
  (test/fixtures/defaults-kbd-badge-chip-host.svelte,
  context-defaults-economy task 2.3, 2026-09-03).

  One render, four regions, the REAL components (state read back
  through the valued hooks — data-jx-kbd / data-jx-badge /
  data-jx-chip / data-density — never through internals):
    bare      — no providers: the frozen owns resolve (tonal), the
                no-opinion density slots stamp nothing
    zone      — paint zone 'outline' + density 'sm': the paint-slot
                families go ambient, kbd's LITERAL slot stays own
                (kbd is not in the frozen availability table), the
                explicit props still win
    ghost     — paint zone 'ghost': Chip (all four rungs) goes ghost;
                under Badge (fill/tonal/outline) it is the
                unsupported external surface — D3-A retired the
                runtime values guard (no clamp, no warn; nothing
                asserts this region)
    external  — the raw legacy-key write (the out-of-repo old-only
                provider shape): both paint families inherit through
                the slot's legacy fallback
  The zone prop is rerenderable: the spec flips it to assert the
  family-level reactivity (one rerender, both families move).
-->
<script lang="ts">
  import Kbd from '$lib/ui/kbd/kbd.svelte';
  import Badge from '$lib/ui/badge/badge.svelte';
  import Chip from '$lib/ui/chip/chip.svelte';
  import ZoneProvider from './paint-axis-zone-provider.svelte';
  import DensityProvider from './density-provider-host.svelte';

  let { zone = 'outline' }: { zone?: 'fill' | 'tonal' | 'outline' | 'ghost' } = $props();
</script>

<section data-testid="bare">
  <Kbd>K</Kbd>
  <Badge>stable</Badge>
  <Badge shape="pill">stable pill</Badge>
  <Chip>filter</Chip>
  <Chip shape="pill">filter pill</Chip>
</section>

<section data-testid="zone">
  <ZoneProvider variant={zone}>
    <DensityProvider density="sm">
      <Kbd>K</Kbd>
      <Badge>stable</Badge>
      <Badge variant="fill">explicit wins</Badge>
      <Chip>filter</Chip>
      <Chip density="lg">explicit density wins</Chip>
    </DensityProvider>
  </ZoneProvider>
</section>

<section data-testid="ghost">
  <ZoneProvider variant="ghost">
    <Badge>stable</Badge>
    <Chip>filter</Chip>
  </ZoneProvider>
</section>
