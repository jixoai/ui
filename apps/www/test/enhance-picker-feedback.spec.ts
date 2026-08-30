/**
 * enhance-picker-feedback.spec.ts — the async-feedback + picker-reach
 * contract suite (2026-08-30 change of the same name):
 *
 *  - calendar-math's datetime vocabulary ("YYYY-MM-DDTHH:mm"),
 *  - calendar.svelte's isDisabled predicate (outside-day law + arrow skip),
 *  - date-picker.svelte's presets lane, showTime contract and their
 *    regression surface (showTime={false} keeps the original DOM),
 *  - press-button's loading anchor contract + the flash() success idiom,
 *  - toast-store's api.promise two-step (settle push, error shape).
 *
 * Rendered from the same-source copy the site consumes ($lib/ui). The
 * date-picker rides a controlled host fixture (value + bindable echo);
 * press-button rides the async host fixture (bind:this flash + counters).
 *
 * Assertion law: state is read back through the DOM the way a user or
 * assistive tech sees it (roles, attributes, live text) — never through
 * component internals.
 */
import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import Calendar from '../src/lib/ui/date-picker/calendar.svelte';
import {
  composeDateTime,
  dayTimeLabel,
  parseDateTime,
  todayIso,
  validDateTime,
} from '../src/lib/ui/date-picker/calendar-math';
import DatepickerFeedbackHost from './fixtures/date-picker-feedback-host.svelte';
import AsyncPressHost from './fixtures/async-press-host.svelte';
import { createToastStore, type ToastItem } from '../src/lib/toast-store';

// ---------------------------------------------------------------------------
// calendar-math — the datetime vocabulary
// ---------------------------------------------------------------------------
describe('calendar-math · datetime ("YYYY-MM-DDTHH:mm")', () => {
  it('parseDateTime splits canonical values into validated halves', () => {
    expect(parseDateTime('2026-08-30T14:05')).toEqual({ date: '2026-08-30', time: '14:05' });
    expect(parseDateTime('2026-08-30T00:00')).toEqual({ date: '2026-08-30', time: '00:00' });
    expect(parseDateTime('2028-02-29T23:59')).toEqual({ date: '2028-02-29', time: '23:59' }); // leap day
  });

  it('parseDateTime rejects malformed input without repairing it (trust-but-verify)', () => {
    expect(parseDateTime('2026-08-30T25:00')).toBeNull(); // hour 25
    expect(parseDateTime('2026-08-30T14:60')).toBeNull(); // minute 60
    expect(parseDateTime('2026-08-30T9:05')).toBeNull(); // unpadded hour
    expect(parseDateTime('2026-8-30T09:05')).toBeNull(); // unpadded month
    expect(parseDateTime('2026-02-30T09:05')).toBeNull(); // not a real day
    expect(parseDateTime('2026-08-30')).toBeNull(); // date only
    expect(parseDateTime('2026-08-30T14:05:00')).toBeNull(); // seconds leak in
    expect(parseDateTime('2026-08-30 14:05')).toBeNull(); // space separator
    expect(parseDateTime('')).toBeNull();
    expect(parseDateTime(undefined)).toBeNull();
  });

  it('validDateTime normalizes and validates; composeDateTime defaults midnight', () => {
    expect(validDateTime('2026-08-30T14:05')).toBe('2026-08-30T14:05');
    expect(validDateTime('2026-08-30T25:00')).toBeUndefined();
    expect(composeDateTime('2026-08-30')).toBe('2026-08-30T00:00'); // the wall-clock midnight default
    expect(composeDateTime('2026-08-30', '14:05')).toBe('2026-08-30T14:05');
  });

  it('dayTimeLabel renders through Intl without touching the wall clock', () => {
    // the wall-clock fields format AS UTC — no zone conversion either way
    expect(dayTimeLabel('en-US', '2026-08-30T14:05')).toMatch(/Aug 30, 2026/);
    expect(dayTimeLabel('zh-CN', '2026-08-30T14:05')).toMatch(/2026年8月30日/);
    expect(dayTimeLabel('en-US', '2026-08-30T00:30')).toMatch(/12:30/); // AM hour passes through
    expect(dayTimeLabel('en-US', 'not-a-time')).toBe('not-a-time'); // fallback passthrough
  });
});

// ---------------------------------------------------------------------------
// calendar.svelte — the isDisabled predicate
// ---------------------------------------------------------------------------
describe('Calendar · isDisabled', () => {
  const SAT_SUN = (iso: string): boolean => {
    const dow = new Date(`${iso}T00:00:00Z`).getUTCDay();
    return dow === 0 || dow === 6;
  };

  function setup(props: Record<string, unknown> = {}) {
    const picked: string[] = [];
    const rendered = render(Calendar, {
      props: { idPrefix: 'cal', onpick: (v: string) => picked.push(v), ...props },
    });
    const grid = () => rendered.container.querySelector('[role="grid"]')!;
    const cursor = () => grid().getAttribute('aria-activedescendant');
    const cell = (iso: string) => rendered.container.querySelector(`#cal-d-${iso}`)!;
    return { ...rendered, picked, grid, cursor, cell };
  }

  it('disabled cells wear the outside-day law: painted not-allowed, aria-disabled, click refused', async () => {
    // 2026-08-15 is a Saturday, 2026-08-16 a Sunday
    const { picked, cell } = setup({ initialView: '2026-08-14', isDisabled: SAT_SUN });
    for (const iso of ['2026-08-15', '2026-08-16']) {
      expect(cell(iso).classList.contains('jx-date-off')).toBe(true);
      expect(cell(iso).getAttribute('aria-disabled')).toBe('true');
    }
    await fireEvent.click(cell('2026-08-16'));
    expect(picked).toEqual([]); // uncommittable
    await fireEvent.click(cell('2026-08-14')); // Friday still commits
    expect(picked).toEqual(['2026-08-14']);
  });

  it('the arrow walk SKIPS disabled days in both directions; Enter refuses a parked disabled day', async () => {
    const { grid, cursor, picked } = setup({ initialView: '2026-08-14', isDisabled: SAT_SUN });
    expect(cursor()).toBe('cal-d-2026-08-14'); // Friday
    await fireEvent.keyDown(grid(), { key: 'ArrowRight' });
    expect(cursor()).toBe('cal-d-2026-08-17'); // Sat+Sun skipped → Monday
    await fireEvent.keyDown(grid(), { key: 'ArrowRight' });
    expect(cursor()).toBe('cal-d-2026-08-18');
    await fireEvent.keyDown(grid(), { key: 'ArrowLeft' });
    expect(cursor()).toBe('cal-d-2026-08-17');
    await fireEvent.keyDown(grid(), { key: 'ArrowLeft' });
    expect(cursor()).toBe('cal-d-2026-08-14'); // the weekend skipped again on the way back
    await fireEvent.keyDown(grid(), { key: 'Enter' });
    expect(picked).toEqual(['2026-08-14']);

    // a cursor parked ON a disabled day (prebound anchor) cannot pick
    const parked = setup({ initialView: '2026-08-15', isDisabled: SAT_SUN });
    await fireEvent.keyDown(parked.grid(), { key: 'Enter' });
    expect(parked.picked).toEqual([]);
  });

  it('min/max bounds join the same walk-skip law (capped sweep, no rest on bound-disabled days)', async () => {
    const { grid, cursor } = setup({ initialView: '2026-08-20', min: '2026-08-20' });
    await fireEvent.keyDown(grid(), { key: 'ArrowLeft' });
    // 08-19 … 08-01 are bound-disabled; the sweep crosses into the
    // OUT-month tail (never landable, Enter refuses) instead of resting
    const landed = cursor()!;
    expect(landed).not.toBe('cal-d-2026-08-19');
    expect(landed.startsWith('cal-d-2026-08-')).toBe(false); // out of the staged month
  });

  it('a range anchor can never START on a disabled day (pick refusal at the source)', async () => {
    const picked: string[] = [];
    const rendered = render(Calendar, {
      props: {
        idPrefix: 'calr',
        initialView: '2026-08-30', // Sunday
        isDisabled: SAT_SUN,
        onpick: (v: string) => picked.push(v),
      },
    });
    const sunday = rendered.container.querySelector('#calr-d-2026-08-30')!;
    expect(sunday.getAttribute('aria-disabled')).toBe('true');
    await fireEvent.click(sunday);
    expect(picked).toEqual([]); // no anchor committed
  });
});

// ---------------------------------------------------------------------------
// date-picker.svelte — presets lane
// ---------------------------------------------------------------------------
describe('DatePicker · presets lane', () => {
  async function openPanel(container: HTMLElement): Promise<void> {
    const trigger = container.querySelector<HTMLButtonElement>('#dp')!;
    await fireEvent.click(trigger); // popovertarget wiring (setup.ts polyfill)
  }

  it('the lane renders validated consumer entries; activation commits exactly like a grid pick and closes', async () => {
    const rendered = render(DatepickerFeedbackHost, {
      props: {
        presets: [
          { label: 'Today', value: todayIso() },
          { label: 'Broken', value: 'not-a-date' }, // dropped, never thrown
        ],
      },
    });
    await openPanel(rendered.container);
    const lane = rendered.container.querySelector('[data-jx-date-presets]')!;
    expect(lane.getAttribute('role')).toBe('group');
    const buttons = lane.querySelectorAll<HTMLButtonElement>('[data-jx-date-preset]');
    expect(buttons).toHaveLength(1); // the malformed entry is gone
    expect(buttons[0].textContent).toContain('Today');

    await fireEvent.click(buttons[0]);
    expect(rendered.container.querySelector('[data-value]')!.textContent).toBe(todayIso());
    expect(rendered.container.querySelector('#dp-grid')).toBeNull(); // panel closed
  });

  it('range presets commit the pair (backwards pairs swap) and close in one activation', async () => {
    const rendered = render(DatepickerFeedbackHost, {
      props: {
        mode: 'range',
        presets: [
          { label: 'Last 7 days', value: { start: '2026-08-24', end: '2026-08-30' } },
          { label: 'Backwards', value: { start: '2026-08-30', end: '2026-08-24' } },
        ],
      },
    });
    await openPanel(rendered.container);
    const buttons = rendered.container.querySelectorAll<HTMLButtonElement>('[data-jx-date-preset]');
    expect(buttons).toHaveLength(2);

    await fireEvent.click(buttons[1]); // the backwards pair
    expect(rendered.container.querySelector('[data-start]')!.textContent).toBe('2026-08-24');
    expect(rendered.container.querySelector('[data-end]')!.textContent).toBe('2026-08-30');
    expect(rendered.container.querySelector('#dp-grid')).toBeNull(); // closed — NOT parked at the anchor
  });

  it('lane buttons are keyboard reachable (real buttons, in tab order)', async () => {
    const rendered = render(DatepickerFeedbackHost, {
      props: { presets: [{ label: 'Today', value: todayIso() }] },
    });
    await openPanel(rendered.container);
    const btn = rendered.container.querySelector<HTMLButtonElement>('[data-jx-date-preset]')!;
    expect(btn.disabled).toBe(false);
    expect(btn.getAttribute('tabindex')).toBeNull(); // native tab order
    btn.focus();
    expect(document.activeElement).toBe(btn);
  });

  it('per-item rich content rides the preset snippet escape (composition-first law)', async () => {
    const rendered = render(DatepickerFeedbackHost, {
      props: {
        rich: true, // the host authors {#snippet preset(entry)}
        presets: [{ label: 'Today', value: todayIso() }],
      },
    });
    await openPanel(rendered.container);
    const btn = rendered.container.querySelector('[data-jx-date-preset]')!;
    expect(btn.querySelector('[data-rich-label]')?.textContent).toBe('Today');
  });
});

// ---------------------------------------------------------------------------
// date-picker.svelte — the showTime contract
// ---------------------------------------------------------------------------
describe('DatePicker · showTime', () => {
  async function openPanel(container: HTMLElement): Promise<void> {
    await fireEvent.click(container.querySelector<HTMLButtonElement>('#dp')!);
  }
  const committed = (rendered: { container: HTMLElement }): string =>
    rendered.container.querySelector('[data-value]')!.textContent ?? '';
  const cursorIso = (rendered: { container: HTMLElement }): string =>
    rendered.container.querySelector('#dp-grid')!.getAttribute('aria-activedescendant')!;
  const hour = (rendered: { container: HTMLElement }): HTMLInputElement =>
    rendered.container.querySelector('[data-jx-time-hour]')!;
  const minute = (rendered: { container: HTMLElement }): HTMLInputElement =>
    rendered.container.querySelector('[data-jx-time-minute]')!;

  it('a prebound datetime restores BOTH halves: the panel opens on its day with its time', async () => {
    const rendered = render(DatepickerFeedbackHost, {
      props: { showTime: true, value: '2026-08-30T14:05' },
    });
    await openPanel(rendered.container);
    expect(cursorIso(rendered)).toBe('dp-d-2026-08-30'); // the day half
    expect(hour(rendered).value).toBe('14'); // the time half
    expect(minute(rendered).value).toBe('05');
    expect(committed(rendered)).toBe('2026-08-30T14:05'); // value untouched by opening
  });

  it('picking a different day PRESERVES the time half and closes (the spec scenario)', async () => {
    const rendered = render(DatepickerFeedbackHost, {
      props: { showTime: true, value: '2026-08-30T14:05' },
    });
    await openPanel(rendered.container);
    await fireEvent.click(rendered.container.querySelector('#dp-d-2026-08-31')!);
    expect(committed(rendered)).toBe('2026-08-31T14:05'); // T14:05 kept
    expect(rendered.container.querySelector('#dp-grid')).toBeNull(); // closed like a grid pick
  });

  it('changing time PRESERVES the day half and the panel stays open (live commit)', async () => {
    const rendered = render(DatepickerFeedbackHost, {
      props: { showTime: true, value: '2026-08-10T09:00' },
    });
    await openPanel(rendered.container);
    await fireEvent.pointerDown(rendered.container.querySelector('[data-jx-time-hour-plus]')!);
    await fireEvent.pointerUp(window);
    expect(committed(rendered)).toBe('2026-08-10T10:00'); // the day kept
    expect(rendered.container.querySelector('#dp-grid')).not.toBeNull(); // still open
  });

  it('an invalid datetime degrades to no-commit: placeholder trigger, today-centered grid, midnight compose', async () => {
    const rendered = render(DatepickerFeedbackHost, {
      props: { showTime: true, value: '2026-08-30T25:00', label: 'deploy' },
    });
    const trigger = rendered.container.querySelector<HTMLButtonElement>('#dp')!;
    expect(trigger.textContent).toContain('Select date...'); // placeholder, never the junk
    await openPanel(rendered.container);
    expect(cursorIso(rendered)).toBe(`dp-d-${todayIso()}`); // centers on today
    await fireEvent.click(rendered.container.querySelector(`#dp-d-${todayIso()}`)!);
    expect(committed(rendered)).toBe(`${todayIso()}T00:00`); // canonical, midnight default
  });

  it('showTime presets may carry their own time half; a plain date composes with the committed time', async () => {
    const rendered = render(DatepickerFeedbackHost, {
      props: {
        showTime: true,
        value: '2026-08-10T09:30',
        presets: [
          { label: 'Noon', value: '2026-08-24T12:00' },
          { label: 'That day', value: '2026-08-20' }, // plain date → time preserved
        ],
      },
    });
    await openPanel(rendered.container);
    const buttons = rendered.container.querySelectorAll<HTMLButtonElement>('[data-jx-date-preset]');
    await fireEvent.click(buttons[0]);
    expect(committed(rendered)).toBe('2026-08-24T12:00'); // the preset's own half won

    await openPanel(rendered.container);
    const buttons2 = rendered.container.querySelectorAll<HTMLButtonElement>('[data-jx-date-preset]');
    await fireEvent.click(buttons2[1]);
    expect(committed(rendered)).toBe('2026-08-20T12:00'); // plain date + preserved time
  });

  it('showTime={false} regression: the original date-only DOM is untouched', async () => {
    const rendered = render(DatepickerFeedbackHost, { props: { value: '2026-08-24' } });
    await openPanel(rendered.container);
    // no time row, no lane; the calendar is a DIRECT child of the surface
    expect(rendered.container.querySelector('[data-jx-date-timerow]')).toBeNull();
    expect(rendered.container.querySelector('[data-jx-date-presets]')).toBeNull();
    expect(rendered.container.querySelector('[data-jx-date-surface]')!.className).toBe(
      'jx-surface-body px-3.5 py-3',
    );
    expect(
      rendered.container.querySelector('[data-jx-date-surface] > [data-jx-calendar]'),
    ).not.toBeNull();

    await fireEvent.click(rendered.container.querySelector('#dp-d-2026-08-30')!);
    expect(committed(rendered)).toBe('2026-08-30'); // pure ISO — no T00:00 leak
  });

  it('showTime is IGNORED in range mode (the type-level rejection runtime echo)', async () => {
    const rendered = render(DatepickerFeedbackHost, {
      props: { mode: 'range', showTime: true, range: { start: '2026-08-10', end: '2026-08-20' } },
    });
    await openPanel(rendered.container);
    expect(rendered.container.querySelector('[data-jx-date-timerow]')).toBeNull();
    // a complete prebound pair + a pick = the third-click RE-ANCHOR law
    await fireEvent.click(rendered.container.querySelector('#dp-d-2026-08-30')!);
    expect(rendered.container.querySelector('[data-start]')!.textContent).toBe('2026-08-30');
    expect(rendered.container.querySelector('[data-end]')!.textContent).toBe(''); // re-anchored
    expect(rendered.container.querySelector('#dp-grid')).not.toBeNull(); // anchor law: panel stays open
    expect(rendered.container.querySelector('[data-value]')!.textContent).toBe(''); // no datetime side-channel
  });
});

// ---------------------------------------------------------------------------
// press-button — the loading anchor contract + the flash idiom
// ---------------------------------------------------------------------------
describe('PressButton · loading pose', () => {
  const spin = (rendered: { container: HTMLElement }): Element | null =>
    rendered.container.querySelector('[data-jx-press-spin]');
  const presses = (rendered: { container: HTMLElement }): string =>
    rendered.container.querySelector('[data-presses]')!.textContent ?? '';
  const anchorPresses = (rendered: { container: HTMLElement }): string =>
    rendered.container.querySelector('[data-anchor-presses]')!.textContent ?? '';
  const fillBtn = (rendered: { container: HTMLElement }): HTMLButtonElement =>
    rendered.container.querySelector('button[data-jx-press-button="fill"]')!;
  const anchor = (rendered: { container: HTMLElement }): HTMLAnchorElement =>
    rendered.container.querySelector('a[data-jx-press-button="outline"]')!;

  it('loading announces aria-disabled, stays focusable (tab order), and paints the leading spinner', () => {
    const rendered = render(AsyncPressHost, { props: { loading: true } });
    const btn = fillBtn(rendered);
    expect(btn.getAttribute('aria-disabled')).toBe('true');
    expect(btn.hasAttribute('disabled')).toBe(false); // never dropped from the tab order
    expect(btn.getAttribute('tabindex')).toBeNull(); // native tab order untouched
    expect(spin(rendered)).not.toBeNull(); // the leading lane glyph
    // the press law surface is UNCHANGED in the loading pose
    expect(btn.classList.contains('jx-press')).toBe(true);
    expect(btn.getAttribute('data-jx-press-button')).toBe('fill');
    rendered.unmount();

    const rest = render(AsyncPressHost);
    expect(spin(rest)).toBeNull(); // no glyph at rest
    expect(fillBtn(rest).getAttribute('aria-disabled')).toBeNull();
  });

  it('loading suppresses pointer activation (the seam Enter/Space synthesize through)', async () => {
    const rendered = render(AsyncPressHost, { props: { loading: true } });
    await fireEvent.click(fillBtn(rendered));
    expect(presses(rendered)).toBe('0');
    // a keyboard Enter while loading is equally inert (no crash, no commit)
    await fireEvent.keyDown(fillBtn(rendered), { key: 'Enter' });
    expect(presses(rendered)).toBe('0');

    const released = render(AsyncPressHost);
    await fireEvent.click(fillBtn(released));
    expect(presses(released)).toBe('1'); // at rest the activation flows
  });

  it('loading blocks href navigation AND anchor activation', async () => {
    const rendered = render(AsyncPressHost, { props: { loading: true } });
    const a = anchor(rendered);
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    a.dispatchEvent(click);
    expect(click.defaultPrevented).toBe(true); // navigation blocked
    expect(anchorPresses(rendered)).toBe('0');
    rendered.unmount();

    const rest = render(AsyncPressHost);
    const free = new MouseEvent('click', { bubbles: true, cancelable: true });
    anchor(rest).dispatchEvent(free);
    expect(free.defaultPrevented).toBe(false); // at rest the anchor behaves
  });

  it('flash() is the one-shot success idiom: ✓ + data-jx-press-state, then rest', async () => {
    vi.useFakeTimers();
    try {
      const rendered = render(AsyncPressHost);
      const btn = fillBtn(rendered);
      expect(btn.getAttribute('data-jx-press-state')).toBeNull();

      await fireEvent.click(rendered.container.querySelector('[data-flash-trigger]')!);
      expect(btn.getAttribute('data-jx-press-state')).toBe('success');
      expect(rendered.container.querySelector('[data-jx-press-check]')).not.toBeNull();

      await vi.advanceTimersByTimeAsync(120); // the host flashed for 60ms
      expect(btn.getAttribute('data-jx-press-state')).toBeNull(); // rested
      expect(rendered.container.querySelector('[data-jx-press-check]')).toBeNull();
    } finally {
      vi.useRealTimers();
    }
  });
});

// ---------------------------------------------------------------------------
// toast-store — the promise idiom
// ---------------------------------------------------------------------------
describe('toast-store · api.promise', () => {
  function track(store: ReturnType<typeof createToastStore>): ToastItem[][] {
    const seen: ToastItem[][] = [];
    store.subscribe((items) => seen.push(items));
    return seen;
  }

  it('pending pushes now (sticky) and the resolve REPLACES it with the success message', async () => {
    vi.useFakeTimers();
    try {
      const store = createToastStore();
      track(store);
      store.api.promise(Promise.resolve('sha 4f2a'), { pending: 'Deploying…', success: 'Deployed' });

      let live = store.api.snapshot();
      expect(live).toHaveLength(1);
      expect(live[0].title).toBe('Deploying…');
      expect(live[0].duration).toBe(0); // sticky while in flight

      await vi.advanceTimersByTimeAsync(1);
      live = store.api.snapshot();
      expect(live).toHaveLength(1);
      expect(live[0].title).toBe('Deployed');
      expect(live[0].assertive).toBeUndefined(); // polite
      expect(live[0].duration).toBeUndefined(); // the default 5000 expiry
    } finally {
      vi.useRealTimers();
    }
  });

  it('a rejection lands the error shape: tonal + jx-hue-error, assertive, sticky', async () => {
    vi.useFakeTimers();
    try {
      const store = createToastStore();
      track(store);
      store.api.promise(Promise.reject(new Error('boom')), {
        pending: 'Deploying…',
        success: 'Deployed',
      });

      await vi.advanceTimersByTimeAsync(1);
      const live = store.api.snapshot();
      expect(live).toHaveLength(1);
      expect(live[0].title).toBe('Something failed'); // the default title
      expect(live[0].variant).toBe('tonal');
      expect(live[0].class).toBe('jx-hue-error');
      expect(live[0].assertive).toBe(true);
      expect(live[0].duration).toBe(0); // sticky — a failure must not auto-vanish
    } finally {
      vi.useRealTimers();
    }
  });

  it('message functions receive the settled value/reason; objects override the error defaults', async () => {
    vi.useFakeTimers();
    try {
      const store = createToastStore();
      track(store);

      store.api.promise(Promise.resolve('build 4f2a'), {
        pending: 'Deploying…',
        success: (v) => `Deployed ${v as string}`,
      });
      store.api.promise(Promise.reject(new Error('disk full')), {
        pending: 'Syncing…',
        error: (reason) => ({ title: `Sync failed: ${(reason as Error).message}` }),
      });

      await vi.advanceTimersByTimeAsync(1);
      const [success, failure] = store.api.snapshot();
      expect(success.title).toBe('Deployed build 4f2a');
      expect(failure.title).toBe('Sync failed: disk full');
      expect(failure.assertive).toBe(true); // defaults survive under overrides
      expect(failure.class).toBe('jx-hue-error');
    } finally {
      vi.useRealTimers();
    }
  });

  it('an omitted settle message just dismisses the pending toast', async () => {
    vi.useFakeTimers();
    try {
      const store = createToastStore();
      track(store);
      store.api.promise(Promise.resolve(undefined), { pending: 'Working…' });
      await vi.advanceTimersByTimeAsync(1);
      expect(store.api.snapshot()).toHaveLength(0); // pending dismissed, nothing pushed

      store.api.promise(Promise.reject(new Error('x')), { pending: 'Working…', success: 'nope' });
      await vi.advanceTimersByTimeAsync(1);
      expect(store.api.snapshot()).toHaveLength(1); // the error shape still lands
    } finally {
      vi.useRealTimers();
    }
  });
});
