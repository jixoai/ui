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
 *    input/change events — the toggle-group law);
 *  - E-13: the stepped result is RE-CLAMPED into [min,max] — rounding
 *    to the nearest step used to overshoot max (100 with step 60
 *    committed 120 into the bindable, the readout and aria-valuetext);
 *  - native passthrough (the input.svelte law): Props extends
 *    HTMLInputAttributes and the rest spread lands on the REAL input —
 *    a label-less slider keeps its accessible name through aria-label.
 *
 * The 2026-09-02 ruler ruling this suite locks:
 *
 *  - RULER-INSET: the ruler rides the thumb's TRAVEL box — a
 *    half-thumb inline inset (the icon token), so the end marks sit
 *    exactly where the thumb center sits at min/max;
 *  - RULER-CLICK: pointerdown snaps to the nearest mark and commits
 *    through the input's OWN channel (input.value + the input/change
 *    pair) — the end tick IS max even when the step does not divide
 *    the span; RTL mirrors the mapping; focus lands on the input;
 *  - RULER-WHEEL: one notch ≈ one step, sub-notch deltas accumulate,
 *    the value clamps into [min,max], ctrlKey pinch is never hijacked,
 *    disabled ignores everything; the event never bubbles past the
 *    slider (2026-09-02 ruling) and Shift+wheel — axis-swapped onto
 *    deltaX by the engines — fine-tunes through the same path.
 *
 * Assertion law: state is read back through the DOM the way a user or
 * a form sees it (input.value, attributes, FormData) — never through
 * component internals.
 */
import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
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

function rulerOf(container: HTMLElement): HTMLElement {
  const ruler = container.querySelector('.jx-slider-ticks') as HTMLElement;
  expect(ruler).not.toBeNull();
  // jsdom has no layout: hand the ruler the box the click math reads
  ruler.getBoundingClientRect = () =>
    ({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 200,
      bottom: 4,
      width: 200,
      height: 4,
      toJSON: () => ({}),
    }) as DOMRect;
  return ruler;
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

describe('Range · the ruler is the thumb-travel surface (2026-09-02)', () => {
  it('the css insets the ruler by half a thumb (the icon token)', () => {
    // the thumb IS the input's height (100cqh = the icon token), so
    // half of it is the exact inset the thumb center never crosses
    expect(rangeCss).toMatch(
      /\.jx-slider-ticks\) \{[^}]*margin-inline: calc\(var\(--jx-icon, 1\.5rem\) \/ 2\);/s,
    );
    expect(rangeCss).toMatch(/\.jx-slider-ticks\) \{[^}]*cursor: pointer;/s);
  });

  it('pointerdown on a mark commits that exact snap through the input channel', async () => {
    const { container } = render(Range, {
      props: { label: 'gain', value: 0, min: 0, max: 100, step: 10, ticks: true },
    });
    const ruler = rulerOf(container);
    const input = sliderOf(container);
    // width 200, tick 3 of 10 → x = 60 → exactly 30
    await fireEvent.pointerDown(ruler, { clientX: 60 });
    expect(input.value).toBe('30');
    expect(input.getAttribute('aria-valuetext')).toBe('30');
    expect(container.querySelector('[data-jx-slider-value]')?.textContent).toBe('30');
    // the platform's own click contract: focus lands on the input so
    // the arrows refine from the snapped value
    expect(document.activeElement).toBe(input);
  });

  it('clicks BETWEEN marks round to the nearest snap', async () => {
    const { container } = render(Range, {
      props: { label: 'gain', value: 0, min: 0, max: 100, step: 10, ticks: true },
    });
    const ruler = rulerOf(container);
    // x = 54 → ratio 0.27 → tick 3 (round(2.7)) → 30, never 25
    await fireEvent.pointerDown(ruler, { clientX: 54 });
    expect(sliderOf(container).value).toBe('30');
  });

  it('the end tick IS max when the step does not divide the span', async () => {
    const { container } = render(Range, {
      props: { label: 'gain', value: 0, min: 0, max: 100, step: 7, ticks: true },
    });
    const ruler = rulerOf(container);
    // tickCount = 14 (snaps …98); the ::after end tick is 100 = max
    await fireEvent.pointerDown(ruler, { clientX: 200 });
    expect(sliderOf(container).value).toBe('100');
    // and a mid click lands on a true snap, not the drift
    await fireEvent.pointerDown(ruler, { clientX: 91 * 2 });
    expect(sliderOf(container).value).toBe('91');
  });

  it('RTL mirrors the click mapping (the end tick is the physical left)', async () => {
    const { container } = render(Range, {
      props: { label: 'gain', value: 0, min: 0, max: 100, step: 10, ticks: true },
    });
    const ruler = rulerOf(container);
    const spy = vi
      .spyOn(window, 'getComputedStyle')
      .mockReturnValue({ direction: 'rtl' } as CSSStyleDeclaration);
    // physical left (x = 20) is the value END under rtl → 90
    await fireEvent.pointerDown(ruler, { clientX: 20 });
    spy.mockRestore();
    expect(sliderOf(container).value).toBe('90');
  });

  it('disabled ignores the ruler entirely', async () => {
    const { container } = render(Range, {
      props: { label: 'gain', value: 40, min: 0, max: 100, step: 10, ticks: true, disabled: true },
    });
    const ruler = rulerOf(container);
    await fireEvent.pointerDown(ruler, { clientX: 100 });
    expect(sliderOf(container).value).toBe('40');
  });
});

describe('Range · wheel fine-tune (2026-09-02)', () => {
  it('one notch ≈ one step; sub-notch deltas accumulate', async () => {
    const { container } = render(Range, {
      props: { label: 'gain', value: 0, min: 0, max: 100, step: 10, ticks: true },
    });
    const input = sliderOf(container);
    // 60px below the notch: the page keeps scrolling, no step yet
    // (dispatchEvent resolves true = the event was NOT cancelled)
    expect(await fireEvent.wheel(input, { deltaY: -60 })).toBe(true);
    expect(input.value).toBe('0');
    // the accumulated −120 crosses the notch → +1 step (up = raise),
    // and the wheel is captured (preventDefault → dispatch false)
    expect(await fireEvent.wheel(input, { deltaY: -60 })).toBe(false);
    expect(input.value).toBe('10');
    expect(container.querySelector('[data-jx-slider-value]')?.textContent).toBe('10');
  });

  it('the wheel clamps into [min,max] like every other channel', async () => {
    const { container } = render(Range, {
      props: { label: 'gain', value: 90, min: 0, max: 100, step: 10 },
    });
    const input = sliderOf(container);
    await fireEvent.wheel(input, { deltaY: -100 });
    await fireEvent.wheel(input, { deltaY: -100 });
    expect(input.value).toBe('100');
    expect(input.getAttribute('aria-valuetext')).toBe('100');
  });

  it('ctrlKey wheel is the browser pinch-zoom — never hijacked', async () => {
    const { container } = render(Range, {
      props: { label: 'gain', value: 40, min: 0, max: 100, step: 10 },
    });
    expect(await fireEvent.wheel(sliderOf(container), { deltaY: -500, ctrlKey: true })).toBe(true);
    expect(sliderOf(container).value).toBe('40');
  });

  it('disabled ignores the wheel', async () => {
    const { container } = render(Range, {
      props: { label: 'gain', value: 40, min: 0, max: 100, step: 10, disabled: true },
    });
    expect(await fireEvent.wheel(sliderOf(container), { deltaY: -100 })).toBe(true);
    expect(sliderOf(container).value).toBe('40');
  });

  it('the ruler wheel fine-tunes too (it is one surface)', async () => {
    const { container } = render(Range, {
      props: { label: 'gain', value: 20, min: 0, max: 100, step: 10, ticks: true },
    });
    await fireEvent.wheel(rulerOf(container), { deltaY: -100 });
    expect(sliderOf(container).value).toBe('30');
  });

  it('the wheel never bubbles past the slider — notch or sub-notch', async () => {
    const { container } = render(Range, {
      props: { label: 'gain', value: 0, min: 0, max: 100, step: 10, ticks: true },
    });
    const input = sliderOf(container);
    const seen: Event[] = [];
    container.addEventListener('wheel', (event) => seen.push(event));
    // a full notch: captured (preventDefault) AND swallowed
    expect(await fireEvent.wheel(input, { deltaY: -100 })).toBe(false);
    expect(sliderOf(container).value).toBe('10');
    // a sub-notch: not prevented (the page keeps its native scroll)
    // but still swallowed — an ancestor handler never acts on it
    expect(await fireEvent.wheel(input, { deltaY: -60 })).toBe(true);
    expect(sliderOf(container).value).toBe('10');
    expect(seen).toHaveLength(0);
  });

  it('Shift+wheel fine-tunes through the axis-swapped deltaX', async () => {
    const { container } = render(Range, {
      props: { label: 'gain', value: 40, min: 0, max: 100, step: 10 },
    });
    const input = sliderOf(container);
    // engines deliver the shift+wheel gesture on deltaX (deltaY = 0)
    expect(await fireEvent.wheel(input, { deltaY: 0, deltaX: -100, shiftKey: true })).toBe(false);
    expect(input.value).toBe('50');
    expect(await fireEvent.wheel(input, { deltaY: 0, deltaX: 100, shiftKey: true })).toBe(false);
    expect(input.value).toBe('40');
  });
});

describe('Range · step overshoot (E-13)', () => {
  it('the exact repro: value=100/min=0/max=100/step=60 — never 120 anywhere', () => {
    const { container } = render(Range, { props: { value: 100, min: 0, max: 100, step: 60 } });
    flushSync();
    const input = sliderOf(container);
    // rounding to the nearest step jumped PAST max — the [min,max]
    // contract outranks the snap (aria-valuetext used to read 120)
    expect(input.getAttribute('aria-valuetext')).toBe('100');
    expect(container.querySelector('[data-jx-slider-value]')?.textContent).toBe('100');
    expect(input.value).toBe('100');
  });

  it('a non-dividing mid value still snaps to the nearest IN-RANGE step', () => {
    const { container } = render(Range, { props: { value: 50, min: 0, max: 100, step: 60 } });
    flushSync();
    // 50 sits between snaps 0 and 60 → rounds UP to 60, still in range
    expect(container.querySelector('[data-jx-slider-value]')?.textContent).toBe('60');
  });

  it('min-offset domains re-clamp the same way (min=10/max=20/step=6/value=20)', () => {
    const { container } = render(Range, { props: { value: 20, min: 10, max: 20, step: 6 } });
    flushSync();
    // snaps run 10, 16, 22 — the 22 overshoots max and clamps to 20
    expect(container.querySelector('[data-jx-slider-value]')?.textContent).toBe('20');
    expect(sliderOf(container).getAttribute('aria-valuetext')).toBe('20');
  });
});

describe('Range · native attribute passthrough', () => {
  it('rest props land on the REAL input — aria-label without a label, title, data-testid', () => {
    const { container } = render(Range, {
      props: { value: 40, 'aria-label': 'volume', title: 'slide me', 'data-testid': 'vol' },
    });
    const input = sliderOf(container);
    expect(input.getAttribute('aria-label')).toBe('volume');
    expect(input.getAttribute('title')).toBe('slide me');
    expect(input.getAttribute('data-testid')).toBe('vol');
    // no label prop → no label[for]; the passthrough IS the naming path
    expect(container.querySelector('label')).toBeNull();
  });

  it('component-owned wiring wins over the spread (input.svelte law)', () => {
    const { container } = render(Range, {
      props: { value: 40, type: 'text', 'aria-valuetext': 'hax', 'aria-invalid': 'false' },
    });
    const input = sliderOf(container);
    // the spread sits BEFORE the wiring: a hostile rest cannot un-range
    // the control or shadow the step-precision readout
    expect(input.type).toBe('range');
    expect(input.getAttribute('aria-valuetext')).toBe('40');
  });

  it('caller aria-describedby survives when the error wiring is absent', () => {
    const { container } = render(Range, {
      props: { value: 40, 'aria-describedby': 'hint-1' },
    });
    expect(sliderOf(container).getAttribute('aria-describedby')).toBe('hint-1');
    // …and the error law outranks it when present
    const errored = render(Range, {
      props: { value: 40, error: 'bad', 'aria-describedby': 'hint-1' },
    });
    const by = errored.container.querySelector('input[type="range"]')?.getAttribute('aria-describedby');
    expect(by).toBeTruthy();
    expect(by).not.toBe('hint-1');
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
