/**
 * jixoai class-merge utility (registry/files/lib/utils.ts).
 * `cn()` is class-string HYGIENE: clsx joins conditionals,
 * tailwind-merge dedupes conflicting utilities inside one string.
 * It is NOT a cascade or specificity mechanism — override behavior
 * comes from the layer law (see the css-architecture spec).
 *
 * hue-injection awareness (2026-08-27, hue-injection-utilities
 * change): the theme's @utility intent layer (jx-hue-* slots,
 * jx-pair-*) is registered as a dedupe group — literal class names,
 * a closed set by design (see the theme sheet) — so later intent
 * classes replace earlier ones exactly like the arbitrary-property
 * form. Cross-form mixing (jx-hue-error + [--jx-tonal:…]) is NOT
 * dedupable: the rule is one form per slot in a class list.
 */
import { clsx, type ClassValue } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

const twMerge = extendTailwindMerge({
  extend: {
    // tailwind-merge v3 types extend.classGroups to the DEFAULT group
    // ids only; adding new ids is legal at runtime (dedupe verified
    // by test/hue-injection.spec.ts) — the cast bridges the typing
    // gap until upstream widens the extension surface.
    classGroups: {
      'jx-hue': [
        'jx-hue-primary',
        'jx-hue-neutral',
        'jx-hue-error',
        'jx-hue-success',
        'jx-hue-warning',
        'jx-hue-info',
      ],
      'jx-pair': ['jx-pair-destructive'],
    } as never,
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
