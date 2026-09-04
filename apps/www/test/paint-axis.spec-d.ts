import { expectTypeOf, test } from 'vitest';
import {
  PAINT_ZONE_KEY,
  definePaintSlot,
  providePaintZone,
  type PaintVariant,
  type ZonePaintVariant,
} from '../src/lib/paint.svelte';
import { densitySlot } from '../src/lib/density.svelte';
import type { DefaultsSlot } from '../src/lib/defaults.svelte';

// The paint axis's TYPE-level lock (context-defaults-economy task
// 1.2, 2026-09-03; slot-values-first D1/D4, 2026-09-04) — fixture per
// design.md 轴槽 / paint 双键兼容矩阵:
//   - the value domain: PaintVariant is the axis's whole ladder;
//     ZonePaintVariant excludes link (link is PressButton's
//     interaction exception, never a zone default — the exclusion
//     closes Badge-under-link by construction). PressButtonVariant's
//     alias re-export is RUNTIME/compile-carried evidence (tsc does
//     not resolve .svelte module exports — the 1.0 carrier boundary;
//     per design X2-9 the type fixture never mixes in the Svelte
//     compile's evidence) — paint-axis.spec.ts carries it.
//   - values-first: definePaintSlot(values, own) — the values tuple
//     is FIRST and is the family union's source (ReturnType recovers
//     it); const T ⊆ PaintVariant and own ∈ OneOf<T> are both
//     compile-locked, so no explicit type argument exists to demand
//   - the negative lanes (each @ts-expect-error below must stay
//     consumed — an unused directive fails the file, the shiki-lib
//     precedent): link into the zone getter's domain, link into a
//     ZonePaintVariant slot, the values tuple outside the axis
//     ladder (the paint 值域越 PaintVariant lane), the own outside
//     the declared values, and a non-Density own into densitySlot

test('the value domain — the axis owns the ladder, the zone excludes link', () => {
  expectTypeOf<PaintVariant>().toEqualTypeOf<'fill' | 'tonal' | 'outline' | 'ghost' | 'link'>();
  expectTypeOf<ZonePaintVariant>().toEqualTypeOf<'fill' | 'tonal' | 'outline' | 'ghost'>();
});

test('the slot products are DefaultsSlots over the family domain', () => {
  const pressButtonVariantSlot = definePaintSlot(
    ['fill', 'tonal', 'outline', 'ghost', 'link'],
    'outline',
  );
  type PressButtonVariant = ReturnType<typeof pressButtonVariantSlot>;
  const wide: PressButtonVariant = 'link';
  expectTypeOf<PressButtonVariant>().toEqualTypeOf<PaintVariant>();
  expectTypeOf(pressButtonVariantSlot).toEqualTypeOf<DefaultsSlot<PaintVariant>>();
  expectTypeOf(densitySlot('sm')).returns.toEqualTypeOf<
    'lg' | 'default' | 'sm' | 'xs' | undefined
  >();
  void wide;
});

test('negative lanes — every probe below is a compile error', () => {
  // @ts-expect-error zone 传 link 编译错: the zone getter's domain is ZonePaintVariant (link excluded)
  providePaintZone(() => 'link');

  // @ts-expect-error the same domain on the type face: 'link' is not a ZonePaintVariant
  const zoneLink: ZonePaintVariant = 'link';

  // @ts-expect-error the values tuple must stay ⊆ PaintVariant — 'duotone' is off the ladder
  definePaintSlot(['fill', 'duotone'], 'fill');

  // @ts-expect-error own outside the declared values — availability is the tuple, not a local choice
  definePaintSlot(['fill', 'tonal'], 'outline');

  // @ts-expect-error densitySlot's own is the closed Density union, not a free string
  densitySlot('compact');

  expectTypeOf(zoneLink).toBeString();
});
