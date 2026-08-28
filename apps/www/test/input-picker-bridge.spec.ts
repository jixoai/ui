/**
 * input-picker-bridge.spec.ts — the custom picker bridge (2026-08-28).
 *
 * native-picker={false} (or a picker snippet) must: intercept the
 * native popup's trigger zones, mount the Popover-API panel with the
 * embedded default (Calendar for date/datetime-local, Swatches for
 * color), commit through the $bindable value + onselect, and keep the
 * input a real input. The default (nativePicker) must mount NOTHING;
 * month/week/time without a snippet stay native (no bridge).
 */
import { describe, expect, it } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import Input from '$lib/ui/input/input.svelte';
import SnippetHost from './fixtures/input-picker-snippet-host.svelte';

describe('Input · the picker bridge', () => {
  it('default: no bridge panel is mounted, the native popup stays', () => {
    const { container } = render(Input, { type: 'date', label: 'd' });
    expect(container.querySelector('.jx-picker-panel')).toBeNull();
    expect(container.querySelector('[data-jx-custom-picker]')).toBeNull();
  });

  it('native-picker={false} (date): interception attrs + popover panel + embedded Calendar', () => {
    const { container } = render(Input, {
      type: 'date',
      nativePicker: false,
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
      nativePicker: false,
      id: 'pb-commit',
      value: '',
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

  it('datetime-local commit preserves the typed time part', async () => {
    const { container } = render(Input, {
      type: 'datetime-local',
      nativePicker: false,
      id: 'pb-dtl',
      value: '2026-08-01T14:30',
    });
    const day = container.querySelector('#pb-dtl-pcal-d-2026-08-28');
    await fireEvent.click(day as Element);
    const lane = container.querySelector('#pb-dtl') as HTMLInputElement;
    expect(lane.value).toBe('2026-08-28T14:30');
  });

  it('native-picker={false} (color): the overlay button is the trigger; the swatch retires from the pointer path', () => {
    const { container } = render(Input, {
      type: 'color',
      nativePicker: false,
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

  it('month/week/time without a snippet: native stays (no bridge mounted)', () => {
    const { container } = render(Input, { type: 'month', nativePicker: false, id: 'pb-month' });
    expect(container.querySelector('.jx-picker-panel')).toBeNull();
    expect(container.querySelector('[data-jx-custom-picker]')).toBeNull();
  });
});
