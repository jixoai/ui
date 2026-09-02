/**
 * The pilot-page schema gates (test/press-button-canvas-schema.spec.ts,
 * canvas-schema-pipeline 2026-08-30).
 *
 * The press-button docs page is the flagship consumer of the
 * meta → toJSONSchema → canvas `schema` + `bind:values` pipeline: no
 * hand-written variant/effect option arrays remain, the playground
 * rows render from the schema, the onvalue seam maps effect names to
 * typed builders, the usage code overlay tracks the live values, and
 * reset returns the schema defaults.
 */
import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import Page from '../src/routes/docs/components/press-button.html/+page.svelte';

describe('pilot page schema playground', () => {
  it('renders schema-driven rows and drives the stage instance', async () => {
    const { container } = render(Page);
    // rows: variant, effect, loading, popovertarget
    // (segmented/segmented/toggle/text — r13 added popovertarget)
    const rows = container.querySelectorAll('[data-jx-canvas-row]');
    expect(rows.length).toBe(4);
    expect(container.querySelector('[data-jx-canvas-toggle]')).not.toBeNull();
    // no hand-written kit selects remain
    expect(container.querySelector('select')).toBeNull();

    // flip variant → the driven instance restamps data-jx-press-button
    const driven = container.querySelector<HTMLButtonElement>('[data-jx-press-button="fill"]');
    expect(driven).not.toBeNull();
    await fireEvent.click(container.querySelector<HTMLButtonElement>('[data-jx-canvas-seg-option="ghost"]')!);
    expect(container.querySelector('[data-jx-press-button="ghost"]')).not.toBeNull();

    // effect via the onvalue seam: names → builders (the DRIVEN ghost
    // instance paints the pulse layer — the static demo row also has one)
    await fireEvent.click(container.querySelector<HTMLButtonElement>('[data-jx-canvas-seg-option="pulse"]')!);
    expect(container.querySelector('[data-jx-press-button="ghost"] .jx-pulse-layer')).not.toBeNull();

    // usage overlay tracks live values
    await fireEvent.click(container.querySelector<HTMLButtonElement>('.jx-canvas-code-toggle')!);
    const drawer = container.querySelector<HTMLElement>('.jx-canvas-code-drawer')!;
    expect(drawer.textContent).toContain('variant="ghost"');
    expect(drawer.textContent).toContain('effect={pulse()}');

    // reset → schema defaults (variant outline, effect none)
    await fireEvent.click(container.querySelector<HTMLButtonElement>('[data-jx-canvas-reset]')!);
    expect(container.querySelector('[data-jx-press-button="outline"]')).not.toBeNull();
    expect(container.querySelector('[data-jx-press-button="outline"] .jx-pulse-layer')).toBeNull();
  });
});
