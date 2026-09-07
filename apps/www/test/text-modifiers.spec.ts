/**
 * The text modifier matrix lock (inline-code-engine-and-text-
 * modifiers Lane A / design D5, 2026-09-08). The shared kernel
 * (lib/text-style.svelte.ts — resolveTextStyle, the file Text and
 * inline-code share while staying independent components) and its
 * wiring into <Text> + the Raw sugars:
 *   - each modifier prop emits EXACTLY its utility form: leading-[…]
 *     (number ⇒ unitless ratio, string ⇒ verbatim), font-[…]/the
 *     named weight map, italic, tracking-[…]/the named map,
 *     [font-family:…], [font-size:…]
 *   - the absent-ambient law: an absent prop contributes NOTHING —
 *     a bare <Text> emits zero modifier utilities (no family
 *     residue), italic=false NEVER emits not-italic
 *   - explicit beats ambient, order-locked: modifier utilities land
 *     AFTER the form's own (weight='bold' replaces strong's
 *     font-semibold); the consumer class still merges LAST
 *     (not-italic kills em — the design's own interplay example)
 *   - sugar ≡ base: the props ride the {...rest} spread untouched,
 *     never leaking to the DOM as attributes
 */
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import { resolveTextStyle, type TextStyleProps } from '../src/lib/text-style.svelte';
import Text from '../src/lib/ui/text/text.svelte';
import P from '../src/lib/ui/text/p.svelte';
import Strong from '../src/lib/ui/text/strong.svelte';

// =========================================================================
// resolveTextStyle — the kernel, pure
// =========================================================================
describe('resolveTextStyle (the kernel)', () => {
  it('an empty props object resolves the empty string (absent-ambient law)', () => {
    expect(resolveTextStyle({})).toBe('');
  });

  it('every prop at once joins in the interface order', () => {
    expect(
      resolveTextStyle({
        lineHeight: 1.5,
        weight: '550',
        italic: true,
        tracking: '-0.02em',
        family: 'var(--font-mono)',
        fontSize: '12px',
      }),
    ).toBe('leading-[1.5] font-[550] italic tracking-[-0.02em] [font-family:var(--font-mono)] [font-size:12px]');
  });

  it('lineHeight: number ⇒ the unitless ratio; string ⇒ verbatim', () => {
    expect(resolveTextStyle({ lineHeight: 1.5 })).toBe('leading-[1.5]');
    expect(resolveTextStyle({ lineHeight: '2rem' })).toBe('leading-[2rem]');
  });

  it('weight: the named set rides the core utilities; anything else rides arbitrary', () => {
    expect(resolveTextStyle({ weight: 'bold' })).toBe('font-bold');
    expect(resolveTextStyle({ weight: 'medium' })).toBe('font-medium');
    expect(resolveTextStyle({ weight: '450' })).toBe('font-[450]');
  });

  it('italic: true ⇒ italic; false stays ambient — not-italic is NEVER emitted', () => {
    expect(resolveTextStyle({ italic: true })).toBe('italic');
    expect(resolveTextStyle({ italic: false })).toBe('');
  });

  it('tracking: the named words ride the core utilities; lengths ride verbatim', () => {
    expect(resolveTextStyle({ tracking: 'wide' })).toBe('tracking-wide');
    expect(resolveTextStyle({ tracking: '-0.02em' })).toBe('tracking-[-0.02em]');
  });

  it('family: the arbitrary-property form; spaces escape (a raw space splits the class token)', () => {
    expect(resolveTextStyle({ family: 'JetBrains Mono' })).toBe('[font-family:JetBrains_Mono]');
  });

  it('fontSize: the arbitrary-property form — never a text-* size utility', () => {
    expect(resolveTextStyle({ fontSize: '12px' })).toBe('[font-size:12px]');
  });
});

// =========================================================================
// the wiring — <Text> + the sugars
// =========================================================================
describe('text family — the modifier matrix', () => {
  it('each modifier prop lands its utility class on the member', () => {
    const CASES: Array<[TextStyleProps, string]> = [
      [{ lineHeight: 1.5 }, 'leading-[1.5]'],
      [{ lineHeight: '2rem' }, 'leading-[2rem]'],
      [{ weight: 'bold' }, 'font-bold'],
      [{ weight: '550' }, 'font-[550]'],
      [{ italic: true }, 'italic'],
      [{ tracking: '-0.02em' }, 'tracking-[-0.02em]'],
      [{ family: 'var(--font-mono)' }, '[font-family:var(--font-mono)]'],
      [{ fontSize: '12px' }, '[font-size:12px]'],
    ];
    for (const [props, expected] of CASES) {
      const { container } = render(Text, { props });
      const root = container.querySelector('p[data-jx-text="p"]')!;
      expect(root.classList.contains(expected), expected).toBe(true);
    }
  });

  it('the absent-ambient law: a bare <Text> emits ZERO modifier utilities', () => {
    const { container } = render(Text, {});
    const root = container.querySelector('p[data-jx-text="p"]')!;
    // no fallback chain, no family residue — the class channel is empty
    expect(root.className).toBe('');
  });

  it('italic=false NEVER emits not-italic — absent/false stays ambient', () => {
    const { container } = render(Text, { props: { italic: false } });
    expect(container.querySelector('p')!.className).toBe('');
  });

  it('the spec scenario: strong + italic + fontSize + lineHeight all land together', () => {
    const { container } = render(Text, {
      props: { mark: 'strong', italic: true, fontSize: '12px', lineHeight: 1.5 },
    });
    const root = container.querySelector('strong[data-jx-text="strong"]')!;
    expect(root.classList.contains('font-semibold')).toBe(true);
    expect(root.classList.contains('italic')).toBe(true);
    expect(root.classList.contains('[font-size:12px]')).toBe(true);
    expect(root.classList.contains('leading-[1.5]')).toBe(true);
  });

  it("a modifier beats its form's own utility (modifiers land AFTER the form)", () => {
    // weight='bold' replaces strong's own font-semibold — one
    // tailwind-merge group, the later class wins
    const { container } = render(Text, { props: { mark: 'strong', weight: 'bold' } });
    const root = container.querySelector('strong')!;
    expect(root.classList.contains('font-bold')).toBe(true);
    expect(root.classList.contains('font-semibold')).toBe(false);
  });

  it('the consumer class still merges LAST (not-italic kills em; font-bold beats a modifier weight)', () => {
    const em = render(Text, { props: { mark: 'em', class: 'not-italic' } });
    const emRoot = em.container.querySelector('em')!;
    expect(emRoot.classList.contains('not-italic')).toBe(true);
    expect(emRoot.classList.contains('italic')).toBe(false);
    const weighted = render(Text, { props: { weight: 'medium', class: 'font-bold' } });
    const wRoot = weighted.container.querySelector('p')!;
    expect(wRoot.classList.contains('font-bold')).toBe(true);
    expect(wRoot.classList.contains('font-medium')).toBe(false);
  });

  it('sugar ≡ base: the modifier props ride the {...rest} spread untouched', () => {
    const strong = render(Strong, { props: { italic: true } });
    const sRoot = strong.container.querySelector('strong[data-jx-text="strong"]')!;
    expect(sRoot.classList.contains('italic')).toBe(true);
    // the modifier props never leak to the DOM as attributes — the
    // base destructures them out before {...rest} lands on the element
    expect(sRoot.hasAttribute('italic')).toBe(false);
    const para = render(P, { props: { lineHeight: 1.5, tracking: '-0.02em' } });
    const pRoot = para.container.querySelector('p[data-jx-text="p"]')!;
    expect(pRoot.classList.contains('leading-[1.5]')).toBe(true);
    expect(pRoot.classList.contains('tracking-[-0.02em]')).toBe(true);
  });
});
