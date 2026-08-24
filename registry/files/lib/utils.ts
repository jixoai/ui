/**
 * jixoai class-merge utility (registry/files/lib/utils.ts).
 * `cn()` is class-string HYGIENE: clsx joins conditionals,
 * tailwind-merge dedupes conflicting utilities inside one string.
 * It is NOT a cascade or specificity mechanism — override behavior
 * comes from the layer law (see the css-architecture spec).
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
