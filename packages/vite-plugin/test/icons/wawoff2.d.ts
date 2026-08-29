/**
 * Ambient type declarations for the subset of wawoff2 consumed by the
 * tests (merge-alignment A1, 2026-08-29). wawoff2 is an OPTIONAL
 * dependency and ships no type declarations; an inline `declare module`
 * inside a test file is an invalid augmentation of a module that
 * resolves to a real untyped .js (TS2665), so the surface lives here —
 * mirroring src/icons/providers/opentype.d.ts.
 */

declare module 'wawoff2' {
  export function compress(buffer: Buffer): Promise<Uint8Array>;
  export function decompress(buffer: Buffer): Promise<Uint8Array>;
}
