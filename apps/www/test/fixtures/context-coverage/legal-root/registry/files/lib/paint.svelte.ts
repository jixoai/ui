// SYNTHETIC GATE FIXTURE — minimal stand-in for the REAL registry/files/
// lib/paint.svelte.ts (task 1.2, parallel batch; slot-values-first task
// 2.4). Signatures only; never imported, never executed. Lives in lib
// (legal defineAxisSlot territory).
import type { DefaultsSlot, OneOf } from './defaults.svelte';

export type PaintVariant = 'fill' | 'tonal' | 'outline' | 'ghost' | 'link';
export type ZonePaintVariant = Exclude<PaintVariant, 'link'>;

export function definePaintSlot<const T extends readonly PaintVariant[]>(
  values: T,
  own: OneOf<T>,
): DefaultsSlot<OneOf<T>> {
  throw new Error('synthetic fixture');
}
