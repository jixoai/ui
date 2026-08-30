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
import { describe, expect, it } from 'vitest';

import CanvasSchemaHost from './fixtures/canvas-schema-host.svelte';
import CanvasPrecedenceHost from './fixtures/canvas-schema-precedence-host.svelte';

const stageValues = (container: HTMLElement): unknown =>
  JSON.parse(container.querySelector<HTMLElement>('[data-testid="stage-demo"]')!.textContent!);

describe('ComponentCanvas schema mode', () => {
  it('renders control rows from the schema; excluded kinds render none', () => {
    const { container } = render(CanvasSchemaHost);
    const rows = container.querySelectorAll('[data-jx-canvas-row]');
    // variant, loading, depth, href — the snippet-kind node is excluded
    expect(rows.length).toBe(4);
    expect(container.querySelectorAll('[data-jx-canvas-seg-option]').length).toBe(3);
    expect(container.querySelector('[data-jx-canvas-toggle]')).not.toBeNull();
    expect(container.querySelector('[data-jx-canvas-stepper]')).not.toBeNull();
    expect(container.querySelector('[data-jx-canvas-text]')).not.toBeNull();
  });

  it('initializes bind:values from schema defaults', () => {
    const { container } = render(CanvasSchemaHost);
    expect(stageValues(container)).toEqual({ variant: 'fill', loading: false, depth: 2 });
  });

  it('segmented click writes through bind:values and fires the onvalue seam', async () => {
    const { container } = render(CanvasSchemaHost);
    const tonal = container.querySelector<HTMLButtonElement>(
      '[data-jx-canvas-seg-option="tonal"]',
    )!;
    await fireEvent.click(tonal);
    expect(stageValues(container)).toMatchObject({ variant: 'tonal' });
    expect(tonal.getAttribute('aria-pressed')).toBe('true');
  });

  it('toggle click flips the boolean value', async () => {
    const { container } = render(CanvasSchemaHost);
    const toggle = container.querySelector<HTMLInputElement>('[data-jx-canvas-toggle]')!;
    await fireEvent.click(toggle);
    expect(stageValues(container)).toMatchObject({ loading: true });
  });

  it('stepper steps by multipleOf and clamps at the bounds', async () => {
    const { container } = render(CanvasSchemaHost);
    const inc = container.querySelector<HTMLButtonElement>('[data-jx-canvas-step="inc"]')!;
    // 2 → 4 (step 2), then clamps at maximum 4
    await fireEvent.click(inc);
    expect(container.querySelector('[data-jx-canvas-stepper-value]')!.textContent).toBe('4');
    await fireEvent.click(inc);
    expect(container.querySelector('[data-jx-canvas-stepper-value]')!.textContent).toBe('4');
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
    await fireEvent.click(
      container.querySelector<HTMLButtonElement>('[data-jx-canvas-seg-option="outline"]')!,
    );
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
    expect(container.querySelector('[data-jx-canvas-seg-option]')).toBeNull();
  });
});
