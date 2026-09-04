import { expectTypeOf, test } from 'vitest';
import {
  absentSlot,
  defineAxisSlot,
  defineComponentDefaults,
  defineLiteralSlot,
  defineOpenSlot,
  type DefaultsSlot,
  type OneOf,
} from '../src/lib/defaults.svelte';

// The defaults tool's TYPE-level lock (context-defaults-economy 1.1,
// 2026-09-03; slot-values-first D1/D4, 2026-09-04) — fixture per
// design.md r8 / verification.md 工具层:
//   - the resolve input is Partial over the DECLARED slots
//   - the resolve output is the slots' return types (defineLiteralSlot
//     never undefined; absentSlot carries it)
//   - values-first inference: the values tuple IS the type source —
//     no explicit type argument, no separate union declaration;
//     ReturnType<typeof slot> recovers the union exactly (the family's
//     one declaration source), across the scalar three-state domain
//     and the imported-tuple form (toast's lib single-source shape,
//     the svf-import-consumer probe — simulated here with a local
//     as-const tuple); open scalar domains take defineOpenSlot's
//     explicit type argument
//   - the negative lanes (each @ts-expect-error below must stay
//     consumed — an unused directive fails the file, the shiki-lib
//     precedent): excess property, an explicit argument outside the
//     slot's values domain, null into resolve, bare function / bare
//     literal / forged-brand slots, the default outside the values
//     tuple (inline AND imported-tuple forms), and the omitted type
//     argument on defineOpenSlot (= never 真·强制; absentSlot's
//     missing-type-arg face is AST-gate-carried — a zero-argument
//     factory has no parameter for tsc to reject against never)
type GhostState = 'ghosted' | 'live';

const dialogSurfaceSlot = defineLiteralSlot(['solid', 'acrylic', 'auto'], 'auto');
type DialogSurfaceVariant = ReturnType<typeof dialogSurfaceSlot>;

// the imported-tuple form (toast's lib single-source shape — a local
// as-const tuple stands in for the $lib export)
const IMPORTED_VARIANT_VALUES = ['outline', 'tonal'] as const;
const importedVariantSlot = defineLiteralSlot(IMPORTED_VARIANT_VALUES, 'outline');
type ImportedVariant = ReturnType<typeof importedVariantSlot>;
const importedVariant: ImportedVariant = 'tonal';

// the family-file shape (slot-values-first D2): named slot constants
// wired into the contract object by reference — typing is identical
const DialogDefaults = defineComponentDefaults({
  surface: dialogSurfaceSlot,
  ghost: absentSlot<GhostState>(),
});

test('the values tuple is the type source (inference + ReturnType reverse lookup)', () => {
  expectTypeOf<DialogSurfaceVariant>().toEqualTypeOf<'solid' | 'acrylic' | 'auto'>();
  expectTypeOf<OneOf<['solid', 'acrylic', 'auto']>>().toEqualTypeOf<DialogSurfaceVariant>();
  expectTypeOf(dialogSurfaceSlot).toEqualTypeOf<DefaultsSlot<DialogSurfaceVariant>>();
  expectTypeOf(importedVariantSlot).toEqualTypeOf<DefaultsSlot<ImportedVariant>>();
  expectTypeOf<ImportedVariant>().toEqualTypeOf<(typeof IMPORTED_VARIANT_VALUES)[number]>();
});

test('scalar three-state domains infer; open domains take the explicit type argument', () => {
  const bordered = defineLiteralSlot([false, true], false);
  const inset = defineLiteralSlot([0, 1], 0);
  const chartSize = defineOpenSlot<number>(96);
  const sheetSize = defineOpenSlot<string>('24rem');
  expectTypeOf(bordered).toEqualTypeOf<DefaultsSlot<boolean>>();
  expectTypeOf(inset).returns.toEqualTypeOf<0 | 1>();
  expectTypeOf(chartSize).returns.toEqualTypeOf<number>();
  expectTypeOf(sheetSize).returns.toEqualTypeOf<string>();
});

test('the resolve input is Partial over the declared slots', () => {
  expectTypeOf(DialogDefaults.resolve)
    .parameter(0)
    .toEqualTypeOf<{ surface?: DialogSurfaceVariant | undefined; ghost?: GhostState | undefined }>();
  DialogDefaults.resolve({ surface: 'solid' });
  DialogDefaults.resolve({});
});

test('the resolve output is the slots return types', () => {
  expectTypeOf(DialogDefaults.resolve({})).toEqualTypeOf<{
    surface: DialogSurfaceVariant;
    ghost: GhostState | undefined;
  }>();
  expectTypeOf(absentSlot<GhostState>()).toEqualTypeOf<DefaultsSlot<GhostState | undefined>>();
});

test('defineAxisSlot products are DefaultsSlots over the axis domain', () => {
  const axis = defineAxisSlot<DialogSurfaceVariant>(
    'type-probe',
    (explicit, ambient) => explicit ?? ambient() ?? 'auto',
  );
  expectTypeOf(axis).toEqualTypeOf<DefaultsSlot<DialogSurfaceVariant>>();
  expectTypeOf(axis).returns.toEqualTypeOf<DialogSurfaceVariant>();
});

test('negative lanes — every probe below is a compile error', () => {
  // @ts-expect-error excess property: the resolve input covers DECLARED slots only
  DialogDefaults.resolve({ surface: 'solid', unknown: true });

  // @ts-expect-error explicit argument outside the slot's values domain
  DialogDefaults.resolve({ surface: 'glass' });

  // @ts-expect-error null is not a sentinel — the slot param domain rejects it
  DialogDefaults.resolve({ surface: null });

  // @ts-expect-error a bare function carries no brand — slots are factory products only
  defineComponentDefaults({ surface: (v: DialogSurfaceVariant | undefined) => v ?? 'auto' });

  // @ts-expect-error a bare literal is not a callable branded slot
  defineComponentDefaults({ surface: 'auto' });

  // @ts-expect-error a same-description symbol is not the brand — the unique symbol is unnameable outside the module
  defineComponentDefaults({ surface: { [Symbol('jx-defaults-slot')]: 'defaults-slot' } });

  // @ts-expect-error a bare function fails the brand even in slot position
  const bare: DefaultsSlot<DialogSurfaceVariant> = (v) => v ?? 'auto';

  // @ts-expect-error default outside the values tuple — default ∈ values is compile-locked
  defineLiteralSlot(['tonal', 'outline'], 'fill');

  // @ts-expect-error the imported tuple still constrains the default (the toast single-source shape)
  defineLiteralSlot(IMPORTED_VARIANT_VALUES, 'glass');

  // @ts-expect-error no type argument on defineOpenSlot: open domains have no values to infer from (NoInfer + = never, the true enforcement)
  defineOpenSlot('24rem');

  expectTypeOf(bare).toBeFunction();
});
