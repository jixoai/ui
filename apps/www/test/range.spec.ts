/**
 * Range · native rebase contract (2026-09-02, batch 5).
 *
 * The adversarial-review E-domain fixes this suite locks:
 *
 *  - E-3: the tick ruler's step percentage is the SNAP geometry —
 *    step/(max−min)·100, one mark per i·step — not an even split of
 *    100% across a rounded tick count (non-dividing steps used to
 *    drift the ruler off its own snap points);
 *  - E-12: the ruler covers 0 through 100 inclusive (the css ::after
 *    end tick; a repeating gradient alone ends one segment short);
 *  - E-8: step<=0 / non-finite falls back to the platform default (1)
 *    instead of NaN-poisoning the snap math; decimalsOf reads
 *    exponent notation ('1e-7' → 7);
 *  - E-4: a host form reset re-syncs the $bindable, the readout and
 *    aria-valuetext (the platform restores the input but fires no
 *    input/change events — the toggle-group law).
 *
 * Assertion law: state is read back through the DOM the way a user or
 * a form sees it (input.value, attributes, FormData) — never through
 * component internals.
 */
import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import Range from '../src/lib/ui/range/range.svelte';
import RangeHost from './fixtures/range-host.svelte';

const rangeCss = readFileSync(resolve(process.cwd(), 'src/lib/ui/range/range.css'), 'utf8');

function sliderOf(container: HTMLElement): HTMLInputElement {
  const input = container.querySelector('input[type="range"]') as HTMLInputElement;
  expect(input).not.toBeNull();
  return input;
}

describe('Range · the native base', () => {
  it('renders a REAL input[type=range] with the component hook + native attrs', () => {
    const { container } = render(Range, { props: { label: 'volume', value: 40 } });
    const input = sliderOf(container);
    expect(input.hasAttribute('data-jx-range')).toBe(true);
    expect(input.min).toBe('0');
    expect(input.max).toBe('100');
    expect(input.step).toBe('1');
    // a REAL label binds the labelable input
    expect(container.querySelector(`label[for="${input.id}"]`)).not.toBeNull();
  });

  it('the readout and aria-valuetext track the value at step precision', () => {
    const { container } = render(Range, {
      props: { label: 'tolerance', value: 0.35, min: 0, max: 1, step: 0.05 },
    });
    const input = sliderOf(container);
    expect(input.getAttribute('aria-valuetext')).toBe('0.35');
    expect(container.querySelector('[data-jx-slider-value]')?.textContent).toBe('0.35');
  });
});

describe('Range · the tick ruler (E-3/E-12)', () => {
  it('ticks sit at the SNAP points: --jx-tick-step = step/(max−min)·100', () => {
    const { container } = render(Range, {
      props: { label: 'gain', value: 0, min: 0, max: 100, step: 7, ticks: true },
    });
    const ruler = container.querySelector('.jx-slider-ticks') as HTMLElement;
    expect(ruler).not.toBeNull();
    // 7/100·100 = 7% per mark — marks at 0,7,14…98 (the snap points);
    // the retired math split 100 by a rounded count (100/14 = 7.142857)
    expect(ruler.style.getPropertyValue('--jx-tick-step')).toBe('7%');
  });

  it('non-dividing decimal steps keep the snap geometry', () => {
    const { container } = render(Range, {
      props: { label: 'gain', value: 0, min: 0, max: 10, step: 0.5, ticks: true },
    });
    const ruler = container.querySelector('.jx-slider-ticks') as HTMLElement;
    expect(ruler.style.getPropertyValue('--jx-tick-step')).toBe('5%');
  });

  it('the ruler is aria-hidden (the step semantics live on the input)', () => {
    const { container } = render(Range, { props: { label: 'v', value: 0, ticks: true } });
    expect((container.querySelector('.jx-slider-ticks') as HTMLElement).getAttribute('aria-hidden')).toBe(
      'true',
    );
  });

  it('the css pins the end tick at 100% (E-12: 0..100 inclusive)', () => {
    // the repeating gradient paints marks at segment STARTS only; the
    // ::after end tick pins the final mark at the inline end
    expect(rangeCss).toMatch(/\.jx-slider-ticks\)::after \{[^}]*inset-inline-end: 0;/s);
    // and the gradient itself mirrors under :dir(rtl)
    expect(rangeCss).toContain('.jx-slider-ticks):dir(rtl)');
  });
});

describe('Range · step guard (E-8)', () => {
  it('step=0 falls back to the platform default (1) — no NaN poisoning', () => {
    const { container } = render(Range, {
      props: { label: 'v', value: 5, min: 0, max: 10, step: 0 },
    });
    const input = sliderOf(container);
    expect(input.step).toBe('1');
    // the snap math survives: 5 stays 5 (0/NaN would read as NaN)
    expect(input.value).toBe('5');
    expect(container.querySelector('[data-jx-slider-value]')?.textContent).toBe('5');
  });

  it('negative step falls back to 1 too', () => {
    const { container } = render(Range, {
      props: { label: 'v', value: 3, min: 0, max: 10, step: -2 },
    });
    expect(sliderOf(container).step).toBe('1');
  });

  it('exponent-notation steps format at their true precision', () => {
    const { container } = render(Range, {
      props: { label: 'fine', value: 3e-7, min: 0, max: 1e-6, step: 1e-7 },
    });
    // decimalsOf('1e-7') = 7 — the old dot-index math returned 0
    expect(container.querySelector('[data-jx-slider-value]')?.textContent).toBe(
      '0.0000003',
    );
  });
});

describe('Range · form reset (E-4)', () => {
  it('a host form reset re-syncs the bindable, the readout and aria-valuetext', async () => {
    const { container } = render(RangeHost);
    const form = container.querySelector('form') as HTMLFormElement;
    const input = sliderOf(container);
    // what SSR markup would carry: reset restores the value ATTRIBUTE
    // (client-only renders set the property, so pin the defaultValue
    // the parsed HTML would have had)
    input.defaultValue = '40';
    // drive it away the way a user does (input events commit the bind)
    await fireEvent.input(input, { target: { value: '70' } });
    flushSync();
    expect(container.querySelector('[data-testid="out"]')?.textContent).toBe('70');
    expect(input.getAttribute('aria-valuetext')).toBe('70');
    // the platform restores the input but fires NO input/change events
    form.reset();
    await Promise.resolve(); // let the reset listener's microtask run
    flushSync();
    expect(input.value).toBe('40');
    expect(container.querySelector('[data-testid="out"]')?.textContent).toBe('40');
    expect(input.getAttribute('aria-valuetext')).toBe('40');
    expect(container.querySelector('[data-jx-slider-value]')?.textContent).toBe('40');
  });
});

describe('Range · the generated mount face (E-1)', () => {
  it('range.css carries the component-mount marker slot (no hand copy)', () => {
    expect(rangeCss).toContain('/* @jixoai/css-laws:begin:range-mount');
    expect(rangeCss).toContain('/* @jixoai/css-laws:end:range-mount */');
    // the generated anchor keeps the law's own escape hatch
    expect(rangeCss).toMatch(
      /\[data-jx-range\]:not\(\.no-jx-pure, \.no-jx-pure \*\):dir\(rtl\)::-webkit-slider-thumb/,
    );
  });
});
