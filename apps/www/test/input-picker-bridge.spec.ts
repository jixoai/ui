/**
 * input-picker-bridge.spec.ts — the custom control bridge (2026-08-28;
 * full coverage 2026-08-29, OpenSpec 2026-08-29-input-native-controls).
 *
 * The Input owns every covered control by default: number gets the
 * −/+ stepper pair (jx-number-shell, spin pseudos hidden), the picker
 * types (date/datetime-local/week/month/time) mount embedded
 * Popover-API panels, color mounts the Swatches editor. Commits ride
 * the $bindable value + onselect; the input stays a real input. The
 * bare `native-controls` attribute opts any covered type back into
 * the PLATFORM control (spinner / UA popup — nothing custom mounts).
 */
import { describe, expect, it } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Input from '$lib/ui/input/input.svelte';
import SnippetHost from './fixtures/input-picker-snippet-host.svelte';
import NumberStepperHost from './fixtures/input-number-stepper-host.svelte';

/** the −/+ buttons of one number shell (hosts render several) */
function steppersOf(container: HTMLElement, inputId: string): { minus: HTMLButtonElement; plus: HTMLButtonElement } {
  const lane = container.querySelector(`#${inputId}`) as HTMLInputElement;
  const shell = lane.closest('.jx-html-control-shell') as HTMLElement;
  return {
    minus: shell.querySelector('[data-jx-step-minus]') as HTMLButtonElement,
    plus: shell.querySelector('[data-jx-step-plus]') as HTMLButtonElement,
  };
}

describe('Input · the picker bridge', () => {
  it('default: the bridge panel is mounted (date) — the custom picker is the library default', () => {
    const { container } = render(Input, { type: 'date', label: 'd' });
    expect(container.querySelector('.jx-picker-panel')).not.toBeNull();
    expect(container.querySelector('[data-jx-custom-picker]')).not.toBeNull();
  });

  it('the bare native-controls attribute opts back into the platform popup (nothing mounted)', () => {
    const { container } = render(Input, { type: 'date', label: 'd', nativeControls: true });
    expect(container.querySelector('.jx-picker-panel')).toBeNull();
    expect(container.querySelector('[data-jx-custom-picker]')).toBeNull();
  });

  it('(date): interception attrs + popover panel + embedded Calendar', () => {
    const { container } = render(Input, {
      type: 'date',
      id: 'pb-date',
      value: '2026-08-28',
    });
    const shell = container.querySelector('.jx-html-control-shell');
    expect(shell?.hasAttribute('data-jx-custom-picker')).toBe(true);
    const panel = container.querySelector('#pb-date-picker-panel');
    expect(panel?.getAttribute('popover')).toBe('auto');
    // the embedded default panel = the Calendar (its day cells exist)
    expect(panel?.querySelector('[id^="pb-date-pcal"]')).not.toBeNull();
  });

  it('a Calendar day commit routes through value + onselect (input event fires)', async () => {
    let picked = '';
    const { container } = render(Input, {
      type: 'date',
      id: 'pb-commit',
      value: '2026-08-01',
      onselect: (v: string) => (picked = v),
    });
    const lane = container.querySelector('#pb-commit') as HTMLInputElement;
    const heard: string[] = [];
    lane.addEventListener('input', () => heard.push(lane.value));
    // the calendar's day cell (contract: id = `${idPrefix}-d-${iso}`)
    const day = container.querySelector('#pb-commit-pcal-d-2026-08-28');
    expect(day).not.toBeNull();
    await fireEvent.click(day as Element);
    expect(picked).toBe('2026-08-28');
    expect(lane.value).toBe('2026-08-28');
    expect(heard).toContain('2026-08-28');
  });

  it('datetime-local day commit preserves the typed time part and KEEPS THE PANEL OPEN', async () => {
    const { container } = render(Input, {
      type: 'datetime-local',
      id: 'pb-dtl',
      value: '2026-08-01T14:30',
    });
    const lane = container.querySelector('#pb-dtl') as HTMLInputElement;
    const panel = container.querySelector('#pb-dtl-picker-panel') as HTMLElement;
    // open the panel the way a user does (the lane's end-zone click)
    await fireEvent.click(lane, { clientX: 0 });
    expect(panel.hasAttribute('open')).toBe(true);
    const day = container.querySelector('#pb-dtl-pcal-d-2026-08-28');
    await fireEvent.click(day as Element);
    expect(lane.value).toBe('2026-08-28T14:30');
    // the time stepper adjusts next — a day pick must NOT close
    expect(panel.hasAttribute('open')).toBe(true);
    // OpenSpec scenario: step the hour twice — the T part updates, the
    // date part stays, the panel stays open
    const hourPlus = panel.querySelector('[data-jx-time-hour-plus]') as Element;
    await fireEvent.pointerDown(hourPlus);
    await fireEvent.pointerDown(hourPlus);
    expect(lane.value).toBe('2026-08-28T16:30');
    expect(panel.hasAttribute('open')).toBe(true);
  });

  it('datetime-local: the Calendar and the TimeStepper coexist (the time part has a real control)', () => {
    const { container } = render(Input, {
      type: 'datetime-local',
      id: 'pb-dtl2',
      value: '2026-08-28T14:30',
    });
    const panel = container.querySelector('#pb-dtl2-picker-panel') as HTMLElement;
    expect(panel.querySelector('#pb-dtl2-pcal-grid')).not.toBeNull();
    const stepper = panel.querySelector('[id^="pb-dtl2-ptime"]');
    expect(stepper).not.toBeNull();
    // the divider separates the two fragments inside the surface body
    expect(panel.querySelector('.jx-surface-body > .border-t')).not.toBeNull();
  });

  it('datetime-local: a time commit with NO date part defaults the date to today', async () => {
    const { container } = render(Input, { type: 'datetime-local', id: 'pb-dtl3', value: '' });
    const lane = container.querySelector('#pb-dtl3') as HTMLInputElement;
    const panel = container.querySelector('#pb-dtl3-picker-panel') as HTMLElement;
    // undefined time + hour+ → "01:00" riding today's date (todayIso)
    await fireEvent.pointerDown(panel.querySelector('[data-jx-time-hour-plus]') as Element);
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const today = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    expect(lane.value).toBe(`${today}T01:00`);
  });

  it('(color): the overlay button is the trigger; the swatch retires from the pointer path', () => {
    const { container } = render(Input, {
      type: 'color',
      id: 'pb-color',
      value: '#7c7c7c',
    });
    const overlay = container.querySelector('button.jx-picker-overlay');
    expect(overlay?.getAttribute('aria-label')).toBe('choose color');
    const swatch = container.querySelector('#pb-color') as HTMLInputElement;
    expect(swatch.getAttribute('tabindex')).toBe('-1');
    expect(container.querySelector('#pb-color-picker-panel')).not.toBeNull();
  });

  it('a picker snippet replaces the default panel and ctx.commit writes through', async () => {
    const { container } = render(SnippetHost);
    const panel = container.querySelector('#pb-week-host-picker-panel');
    expect(panel).not.toBeNull();
    // the embedded Calendar must NOT be there in snippet mode
    expect(panel?.querySelector('[id*="pcal"]')).toBeNull();
    const btn = container.querySelector('[data-testid="week-pick"]') as HTMLButtonElement;
    await fireEvent.click(btn);
    const lane = container.querySelector('#pb-week-host') as HTMLInputElement;
    expect(lane.value).toBe('2026-W35');
    expect(container.querySelector('[data-testid="picked"]')?.textContent).toBe('2026-W35');
  });
});

describe('Input · week coverage', () => {
  it('a day pick commits the ISO week and closes the panel', async () => {
    let picked = '';
    const { container } = render(Input, {
      type: 'week',
      id: 'pb-week',
      // seed W34 → the Calendar opens on its Monday (2026-08-17, August
      // 2026 on stage); picking 2026-08-28 must commit W35
      value: '2026-W34',
      onselect: (v: string) => (picked = v),
    });
    const lane = container.querySelector('#pb-week') as HTMLInputElement;
    const panel = container.querySelector('#pb-week-picker-panel') as HTMLElement;
    const day = container.querySelector('#pb-week-pcal-d-2026-08-28');
    expect(day).not.toBeNull();
    await fireEvent.click(day as Element);
    expect(lane.value).toBe('2026-W35');
    expect(picked).toBe('2026-W35');
    expect(panel.hasAttribute('open')).toBe(false);
  });

  it('the picked week anchors its Monday and paints the whole week (range tint)', async () => {
    const { container } = render(Input, {
      type: 'week',
      id: 'pb-week2',
      value: '2026-W34',
    });
    const day = container.querySelector('#pb-week2-pcal-d-2026-08-28');
    expect(day).not.toBeNull();
    await fireEvent.click(day as Element);
    // anchors re-derive from "2026-W35" → Monday 2026-08-24 carries the
    // anchor fill (aria-selected); Tue–Sat carry the range tint; Sunday
    // is the rangeEnd EDGE — the Calendar's tint is strictly-inside
    const monday = container.querySelector('#pb-week2-pcal-d-2026-08-24');
    expect(monday?.getAttribute('aria-selected')).toBe('true');
    const midweek = container.querySelector('#pb-week2-pcal-d-2026-08-26');
    expect(midweek?.hasAttribute('data-jx-date-in')).toBe(true);
    const sunday = container.querySelector('#pb-week2-pcal-d-2026-08-30');
    expect(sunday?.hasAttribute('data-jx-date-in')).toBe(false);
  });

  it('the lane end-zone click + Alt+↓ open the week panel (trigger interception covers week)', async () => {
    const { container } = render(Input, { type: 'week', id: 'pb-week3', value: '2026-W35' });
    const lane = container.querySelector('#pb-week3') as HTMLInputElement;
    const panel = container.querySelector('#pb-week3-picker-panel') as HTMLElement;
    await fireEvent.click(lane, { clientX: 0 });
    expect(panel.hasAttribute('open')).toBe(true);
    panel.hidePopover();
    await fireEvent.keyDown(lane, { key: 'ArrowDown', altKey: true });
    expect(panel.hasAttribute('open')).toBe(true);
  });
});

describe('Input · month coverage', () => {
  it('default: the MonthGrid panel mounts (no longer native)', () => {
    const { container } = render(Input, { type: 'month', id: 'pb-month', value: '2026-08' });
    expect(container.querySelector('.jx-picker-panel')).not.toBeNull();
    expect(container.querySelector('[data-jx-custom-picker]')).not.toBeNull();
    expect(container.querySelector('[id^="pb-month-pmonth"]')).not.toBeNull();
  });

  it('a MonthGrid cell pick commits "YYYY-MM" and closes the panel', async () => {
    let picked = '';
    const { container } = render(Input, {
      type: 'month',
      id: 'pb-month2',
      // seed the anchor (view year 2026 on stage — clock-independent)
      value: '2026-01',
      onselect: (v: string) => (picked = v),
    });
    const lane = container.querySelector('#pb-month2') as HTMLInputElement;
    const panel = container.querySelector('#pb-month2-picker-panel') as HTMLElement;
    // the MonthGrid cell (contract: id = `${idPrefix}-m-YYYY-MM`)
    const august = container.querySelector('#pb-month2-pmonth-m-2026-08');
    expect(august).not.toBeNull();
    await fireEvent.click(august as Element);
    expect(lane.value).toBe('2026-08');
    expect(picked).toBe('2026-08');
    expect(panel.hasAttribute('open')).toBe(false);
  });

  it('native-controls opts month back into the platform popup (no panel)', () => {
    const { container } = render(Input, { type: 'month', id: 'pb-month3', nativeControls: true });
    expect(container.querySelector('.jx-picker-panel')).toBeNull();
    expect(container.querySelector('[data-jx-custom-picker]')).toBeNull();
  });
});

describe('Input · time coverage', () => {
  it('default: the TimeStepper panel mounts and live-commits into the value', async () => {
    let picked = '';
    const { container } = render(Input, {
      type: 'time',
      id: 'pb-time',
      value: '08:30',
      onselect: (v: string) => (picked = v),
    });
    const lane = container.querySelector('#pb-time') as HTMLInputElement;
    const panel = container.querySelector('#pb-time-picker-panel') as HTMLElement;
    const stepper = container.querySelector('[data-jx-time]') as Element;
    expect(container.querySelector('.jx-picker-panel')).not.toBeNull();
    expect(container.querySelector('#pb-time-ptime-hour')).not.toBeNull();
    expect(stepper).not.toBeNull();
    // live commits: hour+ → 09:30, minute− → 09:29 (steppers ride
    // pointerdown — number-input's hold law)
    await fireEvent.click(lane, { clientX: 0 });
    expect(panel.hasAttribute('open')).toBe(true);
    await fireEvent.pointerDown(stepper.querySelector('[data-jx-time-hour-plus]') as Element);
    expect(lane.value).toBe('09:30');
    expect(picked).toBe('09:30');
    await fireEvent.pointerDown(stepper.querySelector('[data-jx-time-minute-minus]') as Element);
    expect(lane.value).toBe('09:29');
    // live = commits never close the panel
    expect(panel.hasAttribute('open')).toBe(true);
  });

  it('native-controls opts time back into the platform popup (no panel)', () => {
    const { container } = render(Input, { type: 'time', id: 'pb-time2', nativeControls: true });
    expect(container.querySelector('.jx-picker-panel')).toBeNull();
  });
});

describe('Input · the number stepper (jx-number-shell)', () => {
  it('default: −/+ buttons mount at the outermost slot positions + the shell class', () => {
    const { container } = render(Input, { type: 'number', id: 'ns-1', label: 'n' });
    const shell = container.querySelector('.jx-html-control-shell');
    expect(shell?.classList.contains('jx-number-shell')).toBe(true);
    const minus = container.querySelector('[data-jx-step-minus]');
    const plus = container.querySelector('[data-jx-step-plus]');
    expect(minus?.getAttribute('aria-label')).toBe('decrease');
    expect(plus?.getAttribute('aria-label')).toBe('increase');
    expect(minus?.querySelector('svg')).not.toBeNull();
    expect(plus?.querySelector('svg')).not.toBeNull();
    // outermost positions: [−] first child, [+] last child of the shell
    // (slots and the clear button would land BETWEEN them and the lane)
    expect(shell?.firstElementChild).toBe(minus);
    expect(shell?.lastElementChild).toBe(plus);
  });

  it('native-controls: NO buttons, NO shell class — the platform spinner serves', () => {
    const { container } = render(Input, {
      type: 'number',
      id: 'ns-2',
      label: 'n',
      nativeControls: true,
    });
    expect(container.querySelector('.jx-number-shell')).toBeNull();
    expect(container.querySelector('[data-jx-step-minus]')).toBeNull();
    expect(container.querySelector('[data-jx-step-plus]')).toBeNull();
  });

  it('stepper presses step the bound value through the input plumbing', async () => {
    const { container } = render(NumberStepperHost);
    const plain = container.querySelector('#ns-plain') as HTMLInputElement;
    const { minus, plus } = steppersOf(container as HTMLElement, 'ns-plain');
    // empty lane → base 0: + → 1, − → back to 0
    await fireEvent.pointerDown(plus);
    expect(plain.value).toBe('1');
    expect(container.querySelector('[data-testid="plain-value"]')?.textContent).toBe('1');
    await fireEvent.pointerDown(minus);
    expect(plain.value).toBe('0');
  });

  it('min/max/step are respected (min=0 max=10 step=5, unset starts from min)', async () => {
    const { container } = render(NumberStepperHost);
    const bounded = container.querySelector('#ns-bounded') as HTMLInputElement;
    const { minus, plus } = steppersOf(container as HTMLElement, 'ns-bounded');
    await fireEvent.pointerDown(plus); // '' → min 0 → +5 = 5
    expect(bounded.value).toBe('5');
    await fireEvent.pointerDown(plus); // 5 → 10
    expect(bounded.value).toBe('10');
    await fireEvent.pointerDown(plus); // clamped at max
    expect(bounded.value).toBe('10');
    await fireEvent.pointerDown(minus); // back to 5
    expect(bounded.value).toBe('5');
    await fireEvent.pointerDown(minus); // 0
    await fireEvent.pointerDown(minus); // clamped at min
    expect(bounded.value).toBe('0');
    expect(container.querySelector('[data-testid="bounded-value"]')?.textContent).toBe('0');
  });

  it('disabled: both buttons lock, the lane stays a plain editable input', async () => {
    const { container } = render(NumberStepperHost);
    const locked = container.querySelector('#ns-locked') as HTMLInputElement;
    expect(locked.hasAttribute('disabled')).toBe(true); // rest passthrough, NOT readonly
    expect(locked.hasAttribute('readonly')).toBe(false);
    const { minus, plus } = steppersOf(container as HTMLElement, 'ns-locked');
    expect(minus.disabled).toBe(true);
    expect(plus.disabled).toBe(true);
    // even a synthetic press on the disabled button must not step
    await fireEvent.pointerDown(plus);
    expect(container.querySelector('[data-testid="locked-value"]')?.textContent).toBe('');
  });
});
