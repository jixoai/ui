<!--
  density-slot-probe — test fixture (paint-axis.spec.ts, the density
  axis收编 half of task 1.2).

  The SLOT path probe: module-level slots (惰性律 — construction
  captures only own), resolved inside the $derived window. The
  `?? 'none'` stamp names the no-opinion silence; the THREW stamp
  carries axis-internal errors OUT (D3-C error transparency: nothing
  on the slot path swallows them).
-->
<script module lang="ts">
  import { densitySlot } from '$lib/density.svelte';

  export const DensityNoOwn = densitySlot();
  export const DensityOwnSm = densitySlot('sm');
</script>

<script lang="ts">
  let {
    kind = 'no-own',
    explicit,
    testid,
  }: {
    kind?: 'no-own' | 'own-sm';
    explicit?: 'lg' | 'default';
    testid?: string;
  } = $props();

  const chosen = kind === 'own-sm' ? DensityOwnSm : DensityNoOwn;
  const resolved = $derived.by(() => {
    try {
      return chosen(explicit) ?? 'none';
    } catch (error) {
      return `THREW:${(error as Error).message}`;
    }
  });
</script>

<span data-density-slot={resolved} data-testid={testid}></span>
