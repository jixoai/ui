/**
 * Popover anchor-gap contract (2026-08-26, Owner ruling): the gap rides
 * MARGIN semantics through --jx-pop-gap — a number becomes N px, a
 * string must survive the 1–4 value CSS margin shorthand grammar, and
 * anything else is dropped (trust boundary, Codex co-review). The
 * rendered geometry (which side carries the gap, flip non-migration)
 * is covered by the browser batteries — jsdom has no layout.
 */
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import PopoverGapHost from './fixtures/popover-gap-host.svelte';

const gapOf = (container: HTMLElement): string =>
  (container.querySelector('.jx-pop') as HTMLElement).style.getPropertyValue('--jx-pop-gap').trim();

describe('Popover gap prop', () => {
  it('absent ⇒ 0px (the r22 flush law stands by default)', () => {
    const { container } = render(PopoverGapHost);
    expect(gapOf(container)).toBe('0px');
  });

  it('number ⇒ N px (the uniform ring)', () => {
    const { container } = render(PopoverGapHost, { props: { gap: 8 } });
    expect(gapOf(container)).toBe('8px');
  });

  it('margin shorthand passes verbatim (1–4 length tokens)', () => {
    const one = render(PopoverGapHost, { props: { gap: '8px 0 0 0' } });
    expect(gapOf(one.container)).toBe('8px 0 0 0');

    const rem = render(PopoverGapHost, { props: { gap: '0 0 0.5rem 0' } });
    expect(gapOf(rem.container)).toBe('0 0 0.5rem 0');
  });

  it('invalid strings are dropped — no declaration smuggling', () => {
    const { container } = render(PopoverGapHost, {
      props: { gap: '8px 0 0 0 } ; color: red' },
    });
    expect(gapOf(container)).toBe('0px');

    const five = render(PopoverGapHost, { props: { gap: '1px 2px 3px 4px 5px' } });
    expect(gapOf(five.container)).toBe('0px');

    const bare = render(PopoverGapHost, { props: { gap: 'big' } });
    expect(gapOf(bare.container)).toBe('0px');
  });

  it('malformed lengths and non-finite numbers are dropped (Codex impl-r1)', () => {
    const dots = render(PopoverGapHost, { props: { gap: '1..2px 0 0 0' } });
    expect(gapOf(dots.container)).toBe('0px');

    const leading = render(PopoverGapHost, { props: { gap: '...px' } });
    expect(gapOf(leading.container)).toBe('0px');

    const nan = render(PopoverGapHost, { props: { gap: Number.NaN } });
    expect(gapOf(nan.container)).toBe('0px');

    const inf = render(PopoverGapHost, { props: { gap: Number.POSITIVE_INFINITY } });
    expect(gapOf(inf.container)).toBe('0px');
  });
});
