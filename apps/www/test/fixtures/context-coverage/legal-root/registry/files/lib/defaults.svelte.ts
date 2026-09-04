// SYNTHETIC GATE FIXTURE (context-defaults-economy task 1.4, 2026-09-03;
// slot-values-first task 2.4, 2026-09-04).
// Minimal stand-in for the REAL registry/files/lib/defaults.svelte.ts
// (task 1.1, parallel batch): signatures only, never imported, never
// executed — verify-context-coverage parses, it does not run. The gate
// fixtures exist to fail (or pass) the gate, never to enter a build.
declare const jxSlot: unique symbol;

export interface DefaultsSlot<T> {
  (explicit: T | undefined): T;
  readonly [jxSlot]: 'defaults-slot';
}

export type OneOf<T extends readonly (string | number | boolean)[]> = T[number];

export function defineLiteralSlot<const T extends readonly (string | number | boolean)[]>(
  values: T,
  defaultValue: OneOf<T>,
): DefaultsSlot<OneOf<T>> {
  throw new Error('synthetic fixture');
}
export function defineOpenSlot<T extends string | number | boolean = never>(
  own: NoInfer<T>,
): DefaultsSlot<T> {
  throw new Error('synthetic fixture');
}
export function absentSlot<T extends {}>(): DefaultsSlot<T | undefined> {
  throw new Error('synthetic fixture');
}
export function defineComponentDefaults<S extends Record<string, (explicit: never) => unknown>>(
  slots: S,
): { resolve(partial: { [K in keyof S]?: Parameters<S[K]>[0] }): { [K in keyof S]: ReturnType<S[K]> }; readonly slots: S } {
  throw new Error('synthetic fixture');
}
/** the lib-only cross-module construction protocol — the gate asserts
 *  this identifier appears ONLY under registry/files/lib/** */
export function defineAxisSlot<T>(
  name: string,
  resolve: (explicit: T | undefined, ambient: () => T | undefined) => T,
): DefaultsSlot<T> {
  throw new Error('synthetic fixture');
}
export function isLifecycleOutsideComponentError(e: unknown): boolean {
  return e instanceof Error && e.message === 'lifecycle_outside_component';
}
