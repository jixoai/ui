/**
 * ComponentCanvas schema-mode suite (test/component-canvas-schema.spec.ts,
 * canvas-schema-pipeline 2026-08-30).
 *
 * The jsonSchema2Form consumption gates, read through the DOM: rows
 * render from the lowered schema (snippet/opaque excluded), values are
 * two-way (bind:values initializes from schema defaults), onvalue is
 * the change seam, reset falls back to schema defaults when no onreset
 * is given, and the playground snippet keeps escape-hatch precedence.
 */
import { fireEvent, render } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';

import CanvasSchemaHost from './fixtures/canvas-schema-host.svelte';
import CanvasPrecedenceHost from './fixtures/canvas-schema-precedence-host.svelte';

const stageValues = (container: HTMLElement): unknown =>
  JSON.parse(container.querySelector<HTMLElement>('[data-testid="stage-demo"]')!.textContent!);

// grindstone #17-3: the seg/stepper rows ride ItemSegmented/ItemStepper
// now — the segment's identity is the native radio's VALUE (the old
// data-jx-canvas-seg-option buttons retired), the stepper commits ride
// the NumberInput's own hooks with pointerdown stepping
const segRadio = (container: HTMLElement, option: string): HTMLInputElement =>
  container.querySelector<HTMLInputElement>(`[data-jx-canvas-seg] input[value="${option}"]`)!;

describe('ComponentCanvas schema mode', () => {
  it('renders control rows from the schema; excluded kinds render none', () => {
    const { container } = render(CanvasSchemaHost);
    const rows = container.querySelectorAll('[data-jx-canvas-row]');
    // variant, loading, depth, href — the snippet-kind node is excluded
    expect(rows.length).toBe(4);
    expect(container.querySelectorAll('[data-jx-canvas-seg] input[type="radio"]').length).toBe(3);
    expect(container.querySelector('[data-jx-canvas-toggle]')).not.toBeNull();
    expect(container.querySelector('[data-jx-canvas-stepper]')).not.toBeNull();
    expect(container.querySelector('[data-jx-canvas-text]')).not.toBeNull();
  });

  it('initializes bind:values from schema defaults', () => {
    const { container } = render(CanvasSchemaHost);
    expect(stageValues(container)).toEqual({ variant: 'fill', loading: false, depth: 2 });
  });

  it('segmented radio click writes through bind:values and fires the onvalue seam', async () => {
    const { container } = render(CanvasSchemaHost);
    const tonal = segRadio(container, 'tonal');
    await fireEvent.click(tonal);
    flushSync();
    expect(stageValues(container)).toMatchObject({ variant: 'tonal' });
    expect(tonal.checked).toBe(true); // native exclusivity replaces aria-pressed
  });

  it('toggle click flips the boolean value', async () => {
    const { container } = render(CanvasSchemaHost);
    const toggle = container.querySelector<HTMLInputElement>('[data-jx-canvas-toggle]')!;
    await fireEvent.click(toggle);
    expect(stageValues(container)).toMatchObject({ loading: true });
  });

  it('stepper steps by multipleOf and clamps at the bounds', async () => {
    const { container } = render(CanvasSchemaHost);
    // the NumberInput's own inc hook; stepping fires on pointerdown
    const inc = container.querySelector<HTMLButtonElement>('[data-jx-num-plus]')!;
    const input = container.querySelector<HTMLInputElement>('[data-jx-canvas-stepper]')!;
    // 2 → 4 (step 2), then clamps at maximum 4 — the BIND is the step
    // channel (bind:value writes the schema values on every press)
    await fireEvent.pointerDown(inc);
    await fireEvent.pointerUp(window);
    flushSync();
    expect(input.value).toBe('4');
    await fireEvent.pointerDown(inc);
    await fireEvent.pointerUp(window);
    flushSync();
    expect(input.value).toBe('4');
    expect(stageValues(container)).toMatchObject({ depth: 4 });
  });

  it('text input commits through bind:values', async () => {
    const { container } = render(CanvasSchemaHost);
    const input = container.querySelector<HTMLInputElement>('[data-jx-canvas-text]')!;
    await fireEvent.input(input, { target: { value: '/docs' } });
    expect(stageValues(container)).toMatchObject({ href: '/docs' });
  });

  it('reset (no onreset) restores the schema defaults', async () => {
    const { container } = render(CanvasSchemaHost);
    await fireEvent.click(segRadio(container, 'outline'));
    flushSync();
    expect(stageValues(container)).toMatchObject({ variant: 'outline', depth: 2 });
    await fireEvent.click(container.querySelector<HTMLButtonElement>('[data-jx-canvas-reset]')!);
    expect(stageValues(container)).toEqual({ variant: 'fill', loading: false, depth: 2 });
  });
});

describe('ComponentCanvas escape-hatch precedence', () => {
  it('the playground snippet renders; schema rows are not duplicated', () => {
    const { container } = render(CanvasPrecedenceHost);
    expect(container.querySelector('[data-testid="custom-playground"]')).not.toBeNull();
    expect(container.querySelectorAll('[data-jx-canvas-row]').length).toBe(0);
    expect(container.querySelector('[data-jx-canvas-seg]')).toBeNull();
  });
});
