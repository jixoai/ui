/**
 * date-picker-fragments.spec.ts — the picker family's new fragments
 * (2026-08-29, “为 Input 重写补齐 date-picker 家族片段”):
 *
 *  - calendar-math's ISO week vocabulary (isoWeekOf / mondayOfIsoWeek),
 *  - time-stepper.svelte (the wrap-stepping "HH:MM" popover editor),
 *  - month-grid.svelte (the 4×3 year-grid month picker).
 *
 * The TimeStepper tests render the controlled-loop fixture host
 * (fixtures/time-stepper-host.svelte — value + oncommit echo) because
 * the fragment is controlled by contract: every step must read the
 * echoed prop. The MonthGrid is plain props + callback, so it renders
 * directly (input-picker-bridge pattern).
 */
import { describe, expect, it, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import {
  addDays,
  isoWeekOf,
  mondayOfIsoWeek,
  pad2,
} from '$lib/ui/date-picker/calendar-math';
import TimeStepper from '$lib/ui/date-picker/time-stepper.svelte';
import MonthGrid from '$lib/ui/date-picker/month-grid.svelte';
import TimeStepperHost from './fixtures/time-stepper-host.svelte';

// ---------------------------------------------------------------------------
// calendar-math — ISO 8601 week vocabulary
// ---------------------------------------------------------------------------
describe('calendar-math · ISO weeks', () => {
  it('the contract cases: known week, its Monday, and the year-boundary days', () => {
    expect(isoWeekOf('2026-08-29')).toBe('2026-W35');
    expect(mondayOfIsoWeek('2026-W35')).toBe('2026-08-24');
    // Jan 1 2027 is a Friday → the week's Thursday is in 2026 → ISO year 2026
    expect(isoWeekOf('2027-01-01')).toBe('2026-W53');
    expect(mondayOfIsoWeek('2026-W53')).toBe('2026-12-28');
    // W01 always holds Jan 4 (2027's W01 starts on its own Jan 4 Monday)
    expect(isoWeekOf('2027-01-04')).toBe('2027-W01');
    expect(mondayOfIsoWeek('2027-W01')).toBe('2027-01-04');
    // a W01 Monday can live in the PREVIOUS calendar year
    expect(mondayOfIsoWeek('2026-W01')).toBe('2025-12-29');
    expect(isoWeekOf('2026-01-01')).toBe('2026-W01'); // Jan 1 2026 = Thursday
  });

  it('invalid inputs → undefined (trust-but-verify, throw-free)', () => {
    expect(isoWeekOf('2026-02-30')).toBeUndefined(); // not a real day
    expect(isoWeekOf('2026-13-01')).toBeUndefined();
    expect(isoWeekOf('2026-8-29')).toBeUndefined(); // unpadded
    expect(isoWeekOf('')).toBeUndefined();
    expect(isoWeekOf('2026-08-29T00:00')).toBeUndefined();
    expect(mondayOfIsoWeek('2025-W53')).toBeUndefined(); // 2025 has 52 weeks
    expect(mondayOfIsoWeek('2026-W54')).toBeUndefined();
    expect(mondayOfIsoWeek('2026-W00')).toBeUndefined();
    expect(mondayOfIsoWeek('2026-W1')).toBeUndefined(); // strict 2 digits
    expect(mondayOfIsoWeek('2026W35')).toBeUndefined();
    expect(mondayOfIsoWeek('2026-08-24')).toBeUndefined(); // day, not week
  });

  it('round-trip holds day by day across the 2026/2027 boundary and Mondays chain by exactly 7', () => {
    // every day: its week's Monday is ≤ day ≤ Monday+6
    let iso = '2026-12-21'; // a Monday inside W52
    for (let i = 0; i < 42; i++) {
      const week = isoWeekOf(iso);
      expect(week).toBeDefined();
      const monday = mondayOfIsoWeek(week!)!;
      expect(monday <= iso && iso <= addDays(monday, 6)).toBe(true);
      iso = addDays(iso, 1);
    }
    // consecutive weeks' Mondays step by exactly 7 across the boundary
    let prev = mondayOfIsoWeek('2026-W50')!;
    for (const w of ['51', '52', '53']) {
      const monday = mondayOfIsoWeek(`2026-W${w}`)!;
      expect(monday).toBe(addDays(prev, 7));
      prev = monday;
    }
    // 2026 (53-week year) hands 2027-W01 a Monday exactly one week later
    expect(mondayOfIsoWeek('2027-W01')).toBe(addDays(prev, 7));
  });

  it('every ISO week of 2026 exists (W01–W53) — a long year rejects nothing', () => {
    for (let w = 1; w <= 53; w++) {
      expect(mondayOfIsoWeek(`2026-W${pad2(w)}`)).toBeDefined();
    }
  });
});

// ---------------------------------------------------------------------------
// TimeStepper — the wrap-stepping "HH:MM" editor
// ---------------------------------------------------------------------------
describe('TimeStepper', () => {
  function setup(props: { value?: string; disabled?: boolean } = {}) {
    const commits: string[] = [];
    const rendered = render(TimeStepperHost, {
      props: { ...props, oncommit: (v: string) => commits.push(v) },
    });
    // cells are queried by data attribute: a test may mount two hosts at
    // once and jsdom's selector engine (nwsapi) mis-resolves #id lookups
    // inside a container when the id is duplicated document-wide
    const hour = () =>
      rendered.container.querySelector<HTMLInputElement>('[data-jx-time-hour]')!;
    const minute = () =>
      rendered.container.querySelector<HTMLInputElement>('[data-jx-time-minute]')!;
    const btn = (sel: string) =>
      rendered.container.querySelector<HTMLButtonElement>(sel)!;
    return { ...rendered, commits, hour, minute, btn };
  }

  it('renders the committed value as two 2-digit cells', () => {
    const { hour, minute } = setup({ value: '09:05' });
    expect(hour().value).toBe('09');
    expect(minute().value).toBe('05');
  });

  it('undefined renders EMPTY cells, and the first step starts from 00:00 then steps', async () => {
    const { commits, hour, minute, btn } = setup();
    expect(hour().value).toBe('');
    expect(minute().value).toBe('');

    await fireEvent.pointerDown(btn('[data-jx-time-hour-plus]'));
    await fireEvent.pointerUp(window);
    expect(commits).toEqual(['01:00']); // 00 + 1, not 00:00

    await fireEvent.pointerDown(btn('[data-jx-time-minute-minus]'));
    await fireEvent.pointerUp(window);
    expect(commits).toEqual(['01:00', '01:59']); // 00 − 1 wraps to 59
  });

  it('steps WRAP (23→0, 59→0), unlike number-input clamping', async () => {
    const { commits, hour, minute, btn } = setup({ value: '23:59' });
    await fireEvent.pointerDown(btn('[data-jx-time-hour-plus]'));
    await fireEvent.pointerUp(window);
    expect(commits).toEqual(['00:59']);
    expect(hour().value).toBe('00');

    await fireEvent.pointerDown(btn('[data-jx-time-minute-plus]'));
    await fireEvent.pointerUp(window);
    expect(commits).toEqual(['00:59', '00:00']);
    expect(minute().value).toBe('00');
  });

  it('press-and-hold accelerates (300ms delay → 100ms/step) and unmount clears every timer', async () => {
    vi.useFakeTimers();
    try {
      const { commits, hour, btn, unmount } = setup({ value: '05:00' });
      await fireEvent.pointerDown(btn('[data-jx-time-hour-plus]'));
      expect(commits).toEqual(['06:00']); // immediate step on press

      await vi.advanceTimersByTimeAsync(300 + 3 * 100);
      expect(commits).toEqual(['06:00', '07:00', '08:00', '09:00']); // 3 repeats
      expect(hour().value).toBe('09'); // the echoed prop drives the cell

      unmount();
      expect(vi.getTimerCount()).toBe(0); // teardown cleared delay + interval
      await vi.advanceTimersByTimeAsync(2000);
      expect(commits.length).toBe(4); // no leaked interval keeps stepping
    } finally {
      vi.useRealTimers();
    }
  });

  it('typing commits valid 1–2 digit input on change; invalid or empty reverts to the prior value', async () => {
    const { commits, hour, minute } = setup({ value: '09:30' });

    await fireEvent.input(hour(), { target: { value: '7' } });
    await fireEvent.change(hour(), { target: { value: '7' } });
    expect(commits).toEqual(['07:30']);
    expect(hour().value).toBe('07'); // normalized to 2 digits

    await fireEvent.input(minute(), { target: { value: '99' } });
    await fireEvent.change(minute(), { target: { value: '99' } });
    expect(commits).toEqual(['07:30']); // refused — no commit
    expect(minute().value).toBe('30'); // reverted

    await fireEvent.input(hour(), { target: { value: '' } });
    await fireEvent.blur(hour());
    expect(commits).toEqual(['07:30']); // empty is not an edit
    expect(hour().value).toBe('07'); // reverted
  });

  it('↑/↓ on a cell step it with wrap (keyboard parity with the click path)', async () => {
    const { commits, hour, minute } = setup({ value: '00:00' });
    await fireEvent.keyDown(hour(), { key: 'ArrowUp' });
    expect(commits).toEqual(['01:00']);
    await fireEvent.keyDown(hour(), { key: 'ArrowDown' });
    await fireEvent.keyDown(hour(), { key: 'ArrowDown' });
    expect(commits).toEqual(['01:00', '00:00', '23:00']); // wraps below zero
    await fireEvent.keyDown(minute(), { key: 'ArrowUp' });
    expect(commits.at(-1)).toBe('23:01');
  });

  it('focusFirst() focuses the hour cell (panel-open focus parity)', () => {
    const rendered = render(TimeStepper, { props: { value: '08:15', idPrefix: 'tsf' } });
    rendered.component.focusFirst();
    expect(document.activeElement?.id).toBe('tsf-hour');
  });

  it('disabled locks buttons + cells in lockstep and blocks every commit path', async () => {
    vi.useFakeTimers();
    try {
      const { commits, hour, btn } = setup({ value: '09:30', disabled: true });
      for (const sel of ['[data-jx-time-hour-minus]', '[data-jx-time-hour-plus]']) {
        expect(btn(sel).disabled).toBe(true);
      }
      expect(hour().disabled).toBe(true);

      // pointer paths are guarded even where jsdom dispatches onto
      // disabled buttons anyway (the guard is the safety net)
      await fireEvent.pointerDown(btn('[data-jx-time-hour-plus]'));
      await fireEvent.pointerUp(window);
      await vi.advanceTimersByTimeAsync(300 + 200);
      expect(commits).toEqual([]);
      expect(vi.getTimerCount()).toBe(0); // beginHold never armed

      await fireEvent.keyDown(hour(), { key: 'ArrowUp' }); // keyboard blocked
      await fireEvent.input(hour(), { target: { value: '1' } }); // typing blocked
      await fireEvent.change(hour(), { target: { value: '1' } });
      expect(commits).toEqual([]);
      expect(hour().value).toBe('09'); // reverted to committed
    } finally {
      vi.useRealTimers();
    }
  });

  // ---- the hour-format toggle (24h → AM → PM; Owner request) ----------
  const modeBtn = (c: HTMLElement) =>
    c.querySelector<HTMLButtonElement>('[data-jx-time-mode]')!;

  it('the mode toggle mounts after the MM group; the glyph IS the mode (default 24h)', () => {
    const { container } = setup({ value: '08:00' });
    const mode = modeBtn(container);
    expect(mode.textContent).toBe('24h');
    expect(mode.nextElementSibling).toBeNull(); // the row's last control
  });

  it('24h → AM: hours > 12 drop by twelve; ≤ 12 passes through without a commit', async () => {
    const drop = setup({ value: '14:05' });
    await fireEvent.click(modeBtn(drop.container));
    expect(drop.commits).toEqual(['02:05']);
    expect(drop.hour().value).toBe('02');
    expect(modeBtn(drop.container).textContent).toBe('AM');

    const keep = setup({ value: '09:05' });
    await fireEvent.click(modeBtn(keep.container));
    expect(keep.commits).toEqual([]); // no number change — no commit
    expect(keep.hour().value).toBe('09');
  });

  it('AM → PM flips the meridiem only (the 1–12 scale keeps its number)', async () => {
    const { commits, container } = setup({ value: '14:05' });
    await fireEvent.click(modeBtn(container)); // → AM (02:05)
    await fireEvent.click(modeBtn(container)); // → PM
    expect(commits).toEqual(['02:05']);
    expect(modeBtn(container).textContent).toBe('PM');
  });

  it('PM → 24h climbs back +12; 12 PM stays noon (12 passes every scale silently)', async () => {
    const climb = setup({ value: '02:05' });
    await fireEvent.click(modeBtn(climb.container)); // AM
    await fireEvent.click(modeBtn(climb.container)); // PM
    await fireEvent.click(modeBtn(climb.container)); // 24h
    expect(climb.commits).toEqual(['14:05']);
    expect(climb.hour().value).toBe('14');

    const noon = setup({ value: '12:00' });
    await fireEvent.click(modeBtn(noon.container));
    await fireEvent.click(modeBtn(noon.container));
    await fireEvent.click(modeBtn(noon.container));
    expect(noon.commits).toEqual([]); // 12 AM → 12 PM → 12:00, all no-ops
    expect(noon.hour().value).toBe('12');
  });

  it('AM/PM mode steps the hour on the 1–12 ring (11 → 12 → 1)', async () => {
    const { commits, container, btn } = setup({ value: '23:00' });
    await fireEvent.click(modeBtn(container)); // → AM drops 23 → 11
    await fireEvent.pointerDown(btn('[data-jx-time-hour-plus]'));
    await fireEvent.pointerUp(window); // 11 → 12
    await fireEvent.pointerDown(btn('[data-jx-time-hour-plus]'));
    await fireEvent.pointerUp(window); // 12 → 1 (the meridiem wrap)
    expect(commits).toEqual(['11:00', '12:00', '01:00']);
  });

  it('an EMPTY value mode-flips without committing; disabled locks the toggle', async () => {
    const empty = setup();
    await fireEvent.click(modeBtn(empty.container));
    expect(empty.commits).toEqual([]); // nothing to convert
    expect(modeBtn(empty.container).textContent).toBe('AM');

    const locked = setup({ value: '14:00', disabled: true });
    expect(modeBtn(locked.container).disabled).toBe(true);
    await fireEvent.click(modeBtn(locked.container));
    expect(locked.commits).toEqual([]);
    expect(modeBtn(locked.container).textContent).toBe('24h');
  });
});

// ---------------------------------------------------------------------------
// MonthGrid — the 4×3 year-grid month picker
// ---------------------------------------------------------------------------
describe('MonthGrid', () => {
  const NOW = new Date(2026, 7, 20, 12, 0, 0); // 2026-08-20 local

  function setup(props: Record<string, unknown> = {}) {
    const picked: string[] = [];
    const rendered = render(MonthGrid, {
      props: { onpick: (v: string) => picked.push(v), ...props },
    });
    const grid = () => document.getElementById('mg-grid')!;
    const cell = (ym: string) => document.getElementById(`mg-m-${ym}`)!;
    const yearLabel = () =>
      rendered.container.querySelector('[data-jx-month-year]')!.textContent!;
    const cursor = () => grid().getAttribute('aria-activedescendant');
    return { ...rendered, picked, grid, cell, yearLabel, cursor };
  }

  it('renders a 4×3 grid of MONTHS_SHORT with the anchor painted + selected', () => {
    const { cell, cursor } = setup({ anchor: '2026-08', idPrefix: 'mg' });
    const cells = document.querySelectorAll('#mg-grid [role="gridcell"]');
    expect(cells.length).toBe(12);
    expect(cells[0].textContent).toBe('Jan');
    expect(cells[7].textContent).toBe('Aug');
    const anchor = cell('2026-08');
    expect(anchor.getAttribute('aria-selected')).toBe('true');
    expect(anchor.className).toContain('jx-date-fill');
    expect(cell('2026-07').getAttribute('aria-selected')).toBe('false');
    expect(cursor()).toBe('mg-m-2026-08'); // cursor starts on the anchor
  });

  it('default anchor = the current month, view year = the current year (fresh clock read per mount)', () => {
    vi.useFakeTimers({ now: NOW, toFake: ['Date'] });
    try {
      const { cursor, yearLabel } = setup({ idPrefix: 'mg' });
      expect(cursor()).toBe('mg-m-2026-08');
      expect(yearLabel()).toBe('2026');
    } finally {
      vi.useRealTimers();
    }
  });

  it('clicking an in-bounds month commits "YYYY-MM"', async () => {
    const { picked, cell } = setup({ anchor: '2026-08', idPrefix: 'mg' });
    await fireEvent.click(cell('2026-11'));
    expect(picked).toEqual(['2026-11']);
  });

  it('min/max (tolerating YYYY-MM-DD) disable out-of-range months: aria-disabled, unclickable', async () => {
    const { picked, cell } = setup({
      anchor: '2026-08',
      min: '2026-03-15', // day tolerated → bound is 2026-03
      max: '2026-12',
      idPrefix: 'mg',
    });
    const feb = cell('2026-02');
    expect(feb.getAttribute('aria-disabled')).toBe('true');
    expect(feb.className).toContain('jx-date-off');
    expect(feb.hasAttribute('data-jx-date-out')).toBe(true);

    await fireEvent.click(feb); // refused: no commit
    expect(picked).toEqual([]);

    await fireEvent.click(cell('2026-03')); // the bound itself is inclusive
    expect(picked).toEqual(['2026-03']);
  });

  it('year nav clamps to the years reachable within [min,max]', async () => {
    const { yearLabel, picked } = setup({
      anchor: '2026-08',
      min: '2026-01',
      max: '2027-12',
      idPrefix: 'mg',
    });
    const prev = () =>
      document.querySelector<HTMLButtonElement>('button[aria-label="previous year"]')!;
    const next = () =>
      document.querySelector<HTMLButtonElement>('button[aria-label="next year"]')!;

    expect(prev().disabled).toBe(true); // 2025 unreachable
    expect(next().disabled).toBe(false);
    await fireEvent.click(next());
    expect(yearLabel()).toBe('2027');
    expect(next().disabled).toBe(true); // 2028 unreachable
    expect(prev().disabled).toBe(false);
    await fireEvent.click(prev());
    expect(yearLabel()).toBe('2026');
    expect(picked).toEqual([]); // navigation never picks
  });

  it('arrows walk by cell/row with the view year following the cursor across boundaries', async () => {
    const { grid, cell, cursor, yearLabel } = setup({ anchor: '2026-08', idPrefix: 'mg' });
    await fireEvent.keyDown(grid(), { key: 'ArrowRight' });
    expect(cursor()).toBe('mg-m-2026-09');
    await fireEvent.keyDown(grid(), { key: 'ArrowDown' }); // +3 = one row
    expect(cursor()).toBe('mg-m-2026-12');
    await fireEvent.keyDown(grid(), { key: 'ArrowRight' }); // wraps into next year
    expect(cursor()).toBe('mg-m-2027-01');
    expect(yearLabel()).toBe('2027'); // the view followed
    expect(cell('2027-01')).not.toBeNull(); // staged

    await fireEvent.keyDown(grid(), { key: 'ArrowLeft' }); // back into 2026
    expect(cursor()).toBe('mg-m-2026-12');
    expect(yearLabel()).toBe('2026');
  });

  it('cross-year moves STOP at the bounds; within a reachable year the cursor may sit on a disabled month and Enter refuses it', async () => {
    const { grid, cursor, picked } = setup({
      anchor: '2026-08',
      min: '2026-03',
      idPrefix: 'mg',
    });
    // walk the cursor to January, then try to leave 2026 backwards
    await fireEvent.keyDown(grid(), { key: 'ArrowUp' }); // 08 → 05
    await fireEvent.keyDown(grid(), { key: 'ArrowUp' }); // 05 → 02 (disabled but reachable year)
    await fireEvent.keyDown(grid(), { key: 'ArrowLeft' }); // 02 → 01
    expect(cursor()).toBe('mg-m-2026-01');
    await fireEvent.keyDown(grid(), { key: 'ArrowLeft' }); // 2025 unreachable → stop
    expect(cursor()).toBe('mg-m-2026-01');

    // the cursor may land on a disabled month; Enter must refuse it
    await fireEvent.keyDown(grid(), { key: 'ArrowUp' }); // 01 → 2025-12? no: 1-3 = -2 → wraps to 2025 → blocked → stays
    expect(cursor()).toBe('mg-m-2026-01');

    // walk to an enabled month and Enter commits
    await fireEvent.keyDown(grid(), { key: 'ArrowDown' }); // 01 → 04 (enabled)
    await fireEvent.keyDown(grid(), { key: 'Enter' });
    expect(picked).toEqual(['2026-04']);
  });

  it('Enter on the cursor picks the anchor month; Space works too', async () => {
    const { grid, picked } = setup({ anchor: '2026-08', idPrefix: 'mg' });
    await fireEvent.keyDown(grid(), { key: 'Enter' });
    expect(picked).toEqual(['2026-08']);
    await fireEvent.keyDown(grid(), { key: ' ' });
    expect(picked).toEqual(['2026-08', '2026-08']);
  });

  it('focusGrid() focuses the grid (popover-open focus parity with Calendar)', () => {
    const rendered = render(MonthGrid, { props: { anchor: '2026-08', idPrefix: 'mgf' } });
    rendered.component.focusGrid();
    expect(document.activeElement?.id).toBe('mgf-grid');
  });
});
