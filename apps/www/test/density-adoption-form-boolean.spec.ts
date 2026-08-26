/**
 * Packet B density adoption contract (2026-08-26).
 * Locks policy props/stamps, physical wrapper ownership, and the absence of
 * the retired toggle footprint API. Browser geometry is covered by the
 * adoption verifier against the built docs fixture.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import Checkbox from '../src/lib/ui/checkbox/checkbox.svelte';
import Radio from '../src/lib/ui/radio/radio.svelte';
import Toggle from '../src/lib/ui/toggle/toggle.svelte';
import Range from '../src/lib/ui/range/range.svelte';
import ColorPicker from '../src/lib/ui/color-picker/color-picker.svelte';

describe('density adoption packet B', () => {
  it('stamps resolved density on every boolean/control root', () => {
    const { container } = render(Checkbox, { props: { label: 'ready', density: 'xs' } });
    expect(container.querySelector('[data-density]')?.getAttribute('data-density')).toBe('xs');
  });

  it('uses physical activation lanes around visual boolean glyphs', () => {
    const checkbox = render(Checkbox, { props: { label: 'ready' } });
    expect(checkbox.container.querySelector('[data-jx-check]')).not.toBeNull();
    expect(checkbox.container.querySelector('.jx-checkbox')).not.toBeNull();
    const radio = render(Radio, { props: { label: 'ready', name: 'state' } });
    expect(radio.container.querySelector('[data-jx-check]')).not.toBeNull();
    expect(radio.container.querySelector('.jx-radio')).not.toBeNull();
  });

  it('keeps range interaction and color trigger roots present', () => {
    const range = render(Range, { props: { label: 'volume', density: 'sm' } });
    expect(range.container.querySelector('[data-density]')?.getAttribute('data-density')).toBe('sm');
    const color = render(ColorPicker, { props: { label: 'accent', density: 'default' } });
    expect(color.container.querySelector('.jx-color-picker-trigger')).not.toBeNull();
  });

  it('preserves the range keyboard contract while density owns its hit lane', async () => {
    const { container } = render(Range, { props: { label: 'volume', value: 5, min: 0, max: 10, step: 1 } });
    const slider = container.querySelector('[role="slider"]') as HTMLElement;
    expect(slider.getAttribute('aria-valuenow')).toBe('5');
    await fireEvent.keyDown(slider, { key: 'ArrowRight' });
    expect(slider.getAttribute('aria-valuenow')).toBe('6');
    await fireEvent.keyDown(slider, { key: 'End' });
    expect(slider.getAttribute('aria-valuenow')).toBe('10');
  });

  it('does not expose a toggle size/controlSize footprint API', () => {
    const toggleSource = readFileSync(resolve(import.meta.dirname, '../src/lib/ui/toggle/toggle.svelte'), 'utf8');
    expect(toggleSource).not.toContain('controlSize');
    expect(toggleSource).not.toContain('--jx-toggle-w');
    expect(toggleSource).not.toContain('--jx-toggle-h');
  });

});
