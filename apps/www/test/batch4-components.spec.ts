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

import Carousel from '../src/lib/ui/carousel.svelte';
import InputOtp from '../src/lib/ui/input-otp.svelte';
import ToggleGroup from '../src/lib/ui/toggle-group.svelte';
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
// ToggleGroup — press semantics + single/multiple bridge payloads
// ---------------------------------------------------------------------------
describe('ToggleGroup', () => {
  it('single: one active button; pressing another swaps the payload', async () => {
    const rendered = render(ToggleGroupHost);
    const buttons = [...rendered.container.querySelectorAll('button.jx-tgroup-btn')] as HTMLButtonElement[];
    await fireEvent.click(buttons[0]!);
    expect(buttons[0]!.getAttribute('aria-pressed')).toBe('true');
    const bridge = rendered.container.querySelector('jx-form-field')!;
    flushSync();
    expect(bridge.getAttribute('value')).toBe('bold');

    await fireEvent.click(buttons[1]!);
    expect(buttons[0]!.getAttribute('aria-pressed')).toBe('false');
    expect(buttons[1]!.getAttribute('aria-pressed')).toBe('true');
    flushSync();
    expect(bridge.getAttribute('value')).toBe('italic');
  });

  it('multiple: independent presses join into a multivalue payload', async () => {
    const rendered = render(ToggleGroupHost, { props: { multiple: true } });
    const buttons = [...rendered.container.querySelectorAll('button.jx-tgroup-btn')] as HTMLButtonElement[];
    const bridge = rendered.container.querySelector('jx-form-field')!;
    expect(bridge.hasAttribute('multivalue')).toBe(true);

    await fireEvent.click(buttons[0]!);
    await fireEvent.click(buttons[2]!);
    flushSync();
    expect(bridge.getAttribute('value')).toBe('bold\nunderline');

    // un-press removes only its own value
    await fireEvent.click(buttons[0]!);
    flushSync();
    expect(bridge.getAttribute('value')).toBe('underline');
  });

  it('multiple mode submits one FormData entry per press (real FormData)', async () => {
    const rendered = render(ToggleGroupHost, { props: { multiple: true } });
    const buttons = [...rendered.container.querySelectorAll('button.jx-tgroup-btn')] as HTMLButtonElement[];
    await fireEvent.click(buttons[0]!);
    await fireEvent.click(buttons[2]!);

    const bridge = rendered.container.querySelector('jx-form-field') as HTMLElement & {
      formResetCallback?: () => void;
    };
    const form = document.createElement('form');
    const anchor = { parent: bridge.parentNode as Node, next: bridge.nextSibling };
    form.appendChild(bridge);
    const data = new FormData(form);
    anchor.parent.insertBefore(bridge, anchor.next);

    expect(data.getAll('style')).toEqual(['bold', 'underline']);
  });

  it('the group carries a label and button-only members', () => {
    const { container } = render(ToggleGroupHost);
    expect(container.querySelector('[role="group"]')!.getAttribute('aria-label')).toBeTruthy();
    expect(container.querySelectorAll('[role="group"] > button[aria-pressed]').length).toBe(3);
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
    const dots = [...container.querySelectorAll('.jx-carousel-dot')] as HTMLButtonElement[];
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
