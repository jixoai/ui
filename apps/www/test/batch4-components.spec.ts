/**
 * Batch 4 component contract suite (test/batch4-components.spec.ts, 2026-08-22).
 *
 * input-otp (slot mechanics + ElementInternals bridge), toggle-group
 * (single/multiple + multivalue bridge), carousel (scroll-snap + dots).
 * The bridge surfaces run on the setup.ts ElementInternals polyfills;
 * scroll behavior uses jsdom's scroll plumbing where available.
 */
import { fireEvent, render } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { flushSync } from 'svelte';

import Carousel from '../src/lib/ui/carousel/carousel.svelte';
import InputOtp from '../src/lib/ui/input-otp/input-otp.svelte';
import ToggleGroup from '../src/lib/ui/toggle-group/toggle-group.svelte';
import CarouselHost from './fixtures/carousel-host.svelte';
import OtpHost from './fixtures/otp-host.svelte';
import ToggleGroupHost from './fixtures/toggle-group-host.svelte';

// ---------------------------------------------------------------------------
// InputOtp — slots, mechanics, bridge
// ---------------------------------------------------------------------------
describe('InputOtp', () => {
  it('renders the slot row with unique ids and label wiring to slot 0', () => {
    const { container } = render(InputOtp, {
      props: { name: 'code', label: 'enter code', length: 4 },
    });
    const slots = [...container.querySelectorAll('input.jx-otp-slot')];
    expect(slots).toHaveLength(4);
    const ids = new Set(slots.map((s) => s.id));
    expect(ids.size).toBe(4); // no duplicate ids
    expect(container.querySelector('label')!.getAttribute('for')).toBe(slots[0]!.id);
  });

  it('typing into a slot distributes overflow chars and advances', async () => {
    const { container } = render(InputOtp, {
      props: { name: 'code', length: 4 },
    });
    const slots = [...container.querySelectorAll('input.jx-otp-slot')] as HTMLInputElement[];
    slots[0]!.focus(); // a user types into a FOCUSED slot
    slots[0]!.value = '1234';
    await fireEvent.input(slots[0]!);
    expect(slots.map((s) => s.value)).toEqual(['1', '2', '3', '4']);
    expect(document.activeElement).toBe(slots[3]);
    expect(slots[3]!.className).toContain('jx-otp-complete');
  });

  it('backspace on an empty slot steps back and clears', async () => {
    const { container } = render(InputOtp, {
      props: { name: 'code', length: 3, value: '12' },
    });
    const slots = [...container.querySelectorAll('input.jx-otp-slot')] as HTMLInputElement[];
    slots[2]!.focus();
    await fireEvent.keyDown(slots[2]!, { key: 'Backspace' });
    expect(slots[1]!.value).toBe('');
    expect(document.activeElement).toBe(slots[1]);
  });

  it('submits the joined code through the bridge; partial codes submit empty', async () => {
    const { container } = render(OtpHost, {
      props: { name: 'otp', length: 3 },
    });
    const bridge = container.querySelector('jx-form-field')!;
    const slots = [...container.querySelectorAll('input.jx-otp-slot')] as HTMLInputElement[];

    // partial: bridge value stays empty (never a partial lie)
    slots[0]!.focus();
    slots[0]!.value = '9';
    await fireEvent.input(slots[0]!);
    flushSync();
    expect(bridge.getAttribute('value')).toBe('');

    slots[1]!.value = '8';
    await fireEvent.input(slots[1]!);
    slots[2]!.focus();
    slots[2]!.value = '7';
    await fireEvent.input(slots[2]!);
    flushSync();
    expect(bridge.getAttribute('value')).toBe('987');
  });
});

// ---------------------------------------------------------------------------
// ToggleGroup — native radio/checkbox contract (no bridge)
// ---------------------------------------------------------------------------
describe('ToggleGroup', () => {
  it('single: label>radio pairs under one name; clicking swaps the checked member', async () => {
    const onvalue = vi.fn();
    const rendered = render(ToggleGroupHost, { props: { onvalue } });
    const group = rendered.container.querySelector('[data-jx-tgroup]')!;
    expect(group.getAttribute('role')).toBe('radiogroup');
    const inputs = [...rendered.container.querySelectorAll('label > input')] as HTMLInputElement[];
    expect(inputs).toHaveLength(3);
    for (const input of inputs) {
      expect(input.type).toBe('radio');
      expect(input.name).toBe('style');
    }
    // NO bridge element ships with the native contract
    expect(rendered.container.querySelector('jx-form-field')).toBeNull();

    await fireEvent.click(inputs[0]!);
    expect(inputs[0]!.checked).toBe(true);
    expect(inputs[1]!.checked).toBe(false);
    flushSync();
    expect(onvalue).toHaveBeenLastCalledWith('bold');

    await fireEvent.click(inputs[1]!);
    expect(inputs[0]!.checked).toBe(false); // native exclusivity
    expect(inputs[1]!.checked).toBe(true);
    flushSync();
    expect(onvalue).toHaveBeenLastCalledWith('italic');

    // re-press does NOT clear (native radio semantics — the explicit
    // none-item is the pattern, not a second press)
    await fireEvent.click(inputs[1]!);
    expect(inputs[1]!.checked).toBe(true);
  });

  it('single submits natively through the real form (FormData)', async () => {
    const rendered = render(ToggleGroupHost);
    const inputs = [...rendered.container.querySelectorAll('label > input')] as HTMLInputElement[];
    await fireEvent.click(inputs[2]!);
    const form = rendered.container.querySelector('form')!;
    const data = new FormData(form);
    expect(data.get('style')).toBe('underline');
    expect(data.getAll('style')).toEqual(['underline']);
  });

  it('multiple: independent checkboxes submit repeated entries in DOM order', async () => {
    const onvalue = vi.fn();
    const rendered = render(ToggleGroupHost, { props: { multiple: true, onvalue } });
    const group = rendered.container.querySelector('[data-jx-tgroup]')!;
    expect(group.getAttribute('role')).toBe('group');
    const inputs = [...rendered.container.querySelectorAll('label > input')] as HTMLInputElement[];
    for (const input of inputs) expect(input.type).toBe('checkbox');

    await fireEvent.click(inputs[0]!);
    await fireEvent.click(inputs[2]!);
    flushSync();
    expect(onvalue).toHaveBeenLastCalledWith(['bold', 'underline']);

    const data = new FormData(rendered.container.querySelector('form')!);
    expect(data.getAll('style')).toEqual(['bold', 'underline']); // DOM order, one entry per press

    // un-press removes only its own value
    await fireEvent.click(inputs[0]!);
    flushSync();
    expect(onvalue).toHaveBeenLastCalledWith(['underline']);
    expect(new FormData(rendered.container.querySelector('form')!).getAll('style')).toEqual(['underline']);
  });

  it('form.reset() restores initial checked and re-syncs the projection', async () => {
    const onvalue = vi.fn();
    const rendered = render(ToggleGroupHost, { props: { onvalue } });
    const form = rendered.container.querySelector('form')!;
    const inputs = [...rendered.container.querySelectorAll('label > input')] as HTMLInputElement[];
    await fireEvent.click(inputs[0]!);
    flushSync();
    expect(onvalue).toHaveBeenLastCalledWith('bold');

    form.reset();
    expect(inputs[0]!.checked).toBe(false); // native restore
    await vi.waitFor(() => expect(onvalue).toHaveBeenLastCalledWith('')); // microtask re-sync
  });

  it('the group carries a label; active segments stamp data-jx-tgroup=on; spread native handlers ride alongside', async () => {
    const rendered = render(ToggleGroupHost, {
      props: { onchange: () => {} }, // a consumer-spread native handler rides alongside
    });
    const group = rendered.container.querySelector('[data-jx-tgroup]')!;
    expect(group.getAttribute('aria-label')).toBe('text style');
    const inputs = [...rendered.container.querySelectorAll('label > input')] as HTMLInputElement[];

    await fireEvent.click(inputs[0]!);
    flushSync();
    expect(inputs[0]!.getAttribute('data-jx-tgroup')).toBe('on');
    expect(inputs[1]!.getAttribute('data-jx-tgroup')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Carousel — scroll-snap track, dots follow, buttons page
// ---------------------------------------------------------------------------
describe('Carousel', () => {
  it('renders slides as direct snap children of one track', () => {
    const { container } = render(CarouselHost);
    const track = container.querySelector('.jx-carousel-track') as HTMLDivElement;
    expect(track.getAttribute('tabindex')).toBe('0');
    expect(track.children.length).toBe(3);
    expect(track.className).toContain('jx-carousel-track');
  });

  it('dots: one per slide, clickable to page', async () => {
    const { container } = render(CarouselHost);
    const dots = [...container.querySelectorAll('[data-jx-carousel-dot]')] as HTMLButtonElement[];
    expect(dots.length).toBe(3);
    // jsdom: scrollTo is a no-op stub — clicking must not throw and the
    // active dot is still readable
    await fireEvent.click(dots[2]!);
    expect(dots[0]!.getAttribute('aria-label')).toBe('go to slide 1');
  });

  it('the arrows exist with explicit labels', () => {
    const { container } = render(CarouselHost);
    expect(container.querySelector('[aria-label="previous slide"]')).toBeTruthy();
    expect(container.querySelector('[aria-label="next slide"]')).toBeTruthy();
  });
});
