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
  // RE-PINNED (canvas-playground-dock lane, 2026-09-08): commit 90e73c32
  // (R4 chip rework) promoted 'fused' — the separator's backdrop-fusion
  // ink — onto the AXIS ladder (six rungs) while the family tuples stay
  // subsets: press-button keeps its frozen five-value row, inline-code is
  // the fused adopter (['fused','tonal','outline'], own 'fused'). The
  // zone domain derives mechanically: Exclude<PaintVariant, 'link'>.
  expectTypeOf<PaintVariant>().toEqualTypeOf<
    'fill' | 'tonal' | 'outline' | 'ghost' | 'link' | 'fused'
  >();
  expectTypeOf<ZonePaintVariant>().toEqualTypeOf<
    'fill' | 'tonal' | 'outline' | 'ghost' | 'fused'
  >();
});

test('the slot products are DefaultsSlots over the family domain', () => {
  const pressButtonVariantSlot = definePaintSlot(
    ['fill', 'tonal', 'outline', 'ghost', 'link'],
    'outline',
  );
  type PressButtonVariant = ReturnType<typeof pressButtonVariantSlot>;
  const wide: PressButtonVariant = 'link';
  // the family's tuple IS its union (five) — the axis's PaintVariant is
  // the superset (six, since fused); equality retired with the fused rung
  expectTypeOf<PressButtonVariant>().toEqualTypeOf<
    'fill' | 'tonal' | 'outline' | 'ghost' | 'link'
  >();
  expectTypeOf(pressButtonVariantSlot).toEqualTypeOf<
    DefaultsSlot<'fill' | 'tonal' | 'outline' | 'ghost' | 'link'>
  >();
  expectTypeOf(densitySlot('sm')).returns.toEqualTypeOf<
    'lg' | 'default' | 'sm' | 'xs' | '2xs' | undefined
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
