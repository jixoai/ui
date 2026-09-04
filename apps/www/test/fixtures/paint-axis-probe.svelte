<!--
  paint-axis-probe — test fixture (paint-axis.spec.ts, task 1.2).

  The MIGRATED consumer face: a family Defaults contract over the
  paint axis, resolved once inside the component's $derived window
  (the real consumer shape the pilot batch adopts in 2.x — this
  fixture is its stand-in). Two families pin both sides of the
  frozen availability table: wide (PressButton's union, link
  included) and narrow (Badge's shape, link excluded — the family's
  static second line of defense).
-->
<script module lang="ts">
  import { defineComponentDefaults } from '$lib/defaults.svelte';
  import { definePaintSlot } from '$lib/paint.svelte';

  // values-first (slot-values-first): the arrays ARE the unions — named
  // slot constants, ReturnType recovery, no separate declarations
  export const wideProbeVariantSlot = definePaintSlot(
    ['fill', 'tonal', 'outline', 'ghost', 'link'],
    'outline',
  );
  export const narrowProbeVariantSlot = definePaintSlot(['fill', 'tonal', 'outline'], 'tonal');
  export type WideProbeVariant = ReturnType<typeof wideProbeVariantSlot>;
  export type NarrowProbeVariant = ReturnType<typeof narrowProbeVariantSlot>;

  export const WideProbeDefaults = defineComponentDefaults({
    variant: wideProbeVariantSlot,
  });
  export const NarrowProbeDefaults = defineComponentDefaults({
    variant: narrowProbeVariantSlot,
  });
</script>

<script lang="ts">
  import type { PressButtonVariant } from '$lib/ui/press-button/press-button.svelte';

  let {
    family = 'wide',
    /** the EXPLICIT lane — the consumer's own prop (beats every
        ambient; the test driver feeds it, hence the cast at the
        narrow seam: a real narrow consumer passing 'link' is a
        compile error at ITS call site) */
    variant,
    testid,
  }: {
    family?: 'wide' | 'narrow';
    variant?: PressButtonVariant;
    testid?: string;
  } = $props();

  // one resolve in the $derived window: the ambient read (the axis's
  // closure getter) lands in THIS component's dependency graph — a
  // parent provider flip re-derives the stamp in the same frame
  const d = $derived.by(() => {
    if (family === 'wide') return WideProbeDefaults.resolve({ variant });
    return NarrowProbeDefaults.resolve({ variant: variant as NarrowProbeVariant | undefined });
  });
</script>

<!-- the probe stamp: the RESOLVED variant (never a snapshot) -->
<span data-paint-probe={d.variant} data-testid={testid}></span>
