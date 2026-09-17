/**
 * jixoai class-merge utility (registry/files/lib/utils.ts).
 * `cn()` is class-string HYGIENE: clsx joins conditionals, and the
 * CLOSED-SET reducer below replaces earlier intent classes with
 * later ones (the hue-injection replacement law — the one behavior
 * tailwind-merge carried for this repo, now owned in 10 dependency-
 * free lines; tailwindless one-shot W4, 2026-09-18: the engine's
 * class-merger retired with the engine). It is NOT a cascade or
 * specificity mechanism — override behavior comes from the layer
 * law (see the css-architecture spec).
 *
 * The closed sets (the theme sheet's intent layer, a literal list by
 * design): later jx-hue-* replaces earlier jx-hue-*; later jx-pair-*
 * replaces earlier jx-pair-*. Cross-form mixing (jx-hue-error +
 * [--jx-tonal:…]) is NOT dedupable: the rule is one form per slot in
 * a class list.
 */
import { clsx, type ClassValue } from 'clsx';

const HUE = new Set(['jx-hue-primary', 'jx-hue-neutral', 'jx-hue-error', 'jx-hue-success', 'jx-hue-warning', 'jx-hue-info']);
const PAIR = new Set(['jx-pair-destructive']);

function lastWinsClosedSet(classes: string[]): string[] {
  // exact duplicates fold to ONE copy (twMerge's identical-class
  // behavior); closed-set conflicts keep ONLY the last member
  const lastIdx = new Map<string, number>();
  for (let i = 0; i < classes.length; i++) lastIdx.set(classes[i], i);
  const survivors: { c: string; i: number }[] = [];
  for (let i = 0; i < classes.length; i++) {
    if (lastIdx.get(classes[i]) !== i) continue; // an identical later copy exists
    survivors.push({ c: classes[i], i });
  }
  let lastHue: string | undefined;
  let lastPair: string | undefined;
  for (const s of survivors) {
    if (HUE.has(s.c)) lastHue = s.c;
    else if (PAIR.has(s.c)) lastPair = s.c;
  }
  return survivors
    .filter((s) => (lastHue === undefined || !HUE.has(s.c) || s.c === lastHue) && (lastPair === undefined || !PAIR.has(s.c) || s.c === lastPair))
    .map((s) => s.c);
}

export function cn(...inputs: ClassValue[]) {
  const joined = clsx(inputs);
  const classes = joined ? joined.split(/\s+/) : [];
  return lastWinsClosedSet(classes).join(' ');
}
