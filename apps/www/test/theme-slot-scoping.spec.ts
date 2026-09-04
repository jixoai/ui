/**
 * theme-slot-scoping.spec.ts — the source-law gate for var()-bearing
 * custom-property slots that must RE-SUBSTITUTE per theme scope (the
 * canvas theme-bug family, Owner 2026-09-04).
 *
 * jsdom has no cascade, so the gate reads the sheet SOURCE and pins
 * the selector SHAPE: any slot whose value references a theme-flipped
 * base token (--foreground / --background / --primary / --border / …)
 * must be declared under a selector list that includes .jx-light and
 * .dark — custom properties substitute their var() at the DECLARING
 * element, so a :root-only declaration hands every descendant the
 * root's already-substituted value, and a scoped canvas
 * (component-canvas stage, terminal-card, the print pipeline)
 * flipping the base tokens never re-flips the derived slot with it.
 *
 * Family members gated here:
 *  - jixoai.css: the four variant-grammar hue slots (the accepted
 *    f061600 fix, generalized from press-button.spec.ts into the
 *    multi-token family form)
 *  - jx-pure.css: --jx-placeholder — the placeholder ink mixes
 *    --foreground into --background; generated from
 *    packages/css-laws/src/icon-vocab (regen: tsx src/build.ts)
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const jixoai = readFileSync(resolve('src/lib/jixoai.css'), 'utf8');
const jxPure = readFileSync(resolve('src/lib/jx-pure.css'), 'utf8');

/** every declaration of `--slot:` in the sheet (count = declaration points) */
const declCount = (css: string, slot: string): number =>
  [...css.matchAll(new RegExp(`${slot}:`, 'g'))].length;

describe('theme-slot scoping — var()-bearing slots re-substitute per theme scope', () => {
  it('jixoai.css: the four variant-grammar hue slots ride :root, .jx-light, .dark', () => {
    for (const slot of ['--jx-fill', '--jx-fill-ink', '--jx-tonal', '--jx-outline']) {
      expect(jixoai, `${slot} under the theme-scoped selector list`).toMatch(
        new RegExp(`:root,\\s*\\.jx-light,\\s*\\.dark\\s*\\{[^}]*${slot}:`),
      );
    }
  });

  it('jixoai.css: no :root-ONLY re-declaration of a grammar slot survives (utilities may re-point slots on-element, theme blocks may not regress)', () => {
    for (const slot of ['--jx-fill', '--jx-fill-ink', '--jx-tonal', '--jx-outline']) {
      const solo = jixoai.match(new RegExp(`:root\\s*\\{[^}]*${slot}[^}]*\\}`, 'g')) ?? [];
      expect(solo, `${slot} must not survive in a :root-only block`).toHaveLength(0);
    }
  });

  it('jx-pure.css: --jx-placeholder (the placeholder ink) rides :root, .jx-light, .dark', () => {
    expect(jxPure).toMatch(
      /:root,\s*\.jx-light,\s*\.dark\s*\{[^}]*--jx-placeholder:\s*color-mix\(in oklab,\s*var\(--foreground\) 40%,\s*var\(--background\)\);/,
    );
  });

  it('jx-pure.css: --jx-placeholder keeps ONE declaration point (not duplicated into the vocab .dark/.jx-light ink blocks)', () => {
    expect(declCount(jxPure, '--jx-placeholder')).toBe(1);
    const solo = jxPure.match(/:root\s*\{[^}]*--jx-placeholder[^}]*\}/g) ?? [];
    expect(solo, 'the icons’ frozen :root vocab block must not carry the placeholder').toHaveLength(0);
  });
});
