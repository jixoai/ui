/**
 * The pilot-page schema gates (test/press-button-canvas-schema.spec.ts,
 * canvas-schema-pipeline 2026-08-30).
 *
 * The press-button docs page is the flagship consumer of the
 * meta → toJSONSchema → canvas `schema` + `bind:values` pipeline: no
 * hand-written variant/effect option arrays remain, the playground
 * rows render from the schema, the onvalue seam maps effect names to
 * the attachment factory (r4, 2026-09-10 — the enum row keys `attach`,
 * a name arms <PressButton {@attach pressEffect(builder())}> through
 * the component tag, the driven demo's undefined arm skips the mount),
 * the usage code overlay tracks the live values, and reset returns the
 * schema defaults. The canvas stays home on the component page (the
 * effect-attachments un-fold ruling: press-button KEEPS its component
 * page while sitting in the effects GROUP — its async/zone/anchors/
 * a11y docs are the page's own; /docs/effects.html demos the family,
 * it does not absorb component documentation).
 */
import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import Page from '../src/routes/docs/components/press-button.html/+page.svelte';

describe('pilot page schema playground', () => {
  it('renders schema-driven rows and drives the stage instance', async () => {
    const { container } = render(Page);
    // rows: variant, effect, loading, popovertarget, raised
    // (segmented/segmented/toggle/text/toggle — r13 added popovertarget,
    // the raised physics axis added its toggle, Owner 2026-09-03)
    const rows = container.querySelectorAll('[data-jx-canvas-row]');
    expect(rows.length).toBe(5);
    expect(container.querySelector('[data-jx-canvas-toggle]')).not.toBeNull();
    // no hand-written kit selects remain (the canvas-everywhere sweep,
    // 2026-09-08, mounts the dock chrome on every canvas — each carries
    // the head's density select; the body and the rows pane have none)
    expect(container.querySelector('[data-jx-canvas-dock-scroll] select')).toBeNull();
    const selects = [...container.querySelectorAll('select')];
    expect(selects.length).toBe(3);
    expect(selects.every((s) => s.getAttribute('aria-label') === 'Density')).toBe(true);
    expect(container.querySelector('select')!.getAttribute('aria-label')).toBe('Density');

    // flip variant → the driven instance restamps data-jx-press-button
    const driven = container.querySelector<HTMLButtonElement>('[data-jx-press-button="fill"]');
    expect(driven).not.toBeNull();
    await fireEvent.click(container.querySelector<HTMLButtonElement>('[data-jx-canvas-seg-option="ghost"]')!);
    expect(container.querySelector('[data-jx-press-button="ghost"]')).not.toBeNull();

    // the attach row via the onvalue seam: names → the factory (the
    // DRIVEN ghost instance paints the pulse layer through pressEffect —
    // the static demo row also has one)
    await fireEvent.click(container.querySelector<HTMLButtonElement>('[data-jx-canvas-seg-option="pulse"]')!);
    expect(container.querySelector('[data-jx-press-button="ghost"] .jx-pulse-layer')).not.toBeNull();

    // usage overlay tracks live values (the component-tag form the page
    // teaches) — the schema canvas is the one carrying the rows; its
    // drawer is the one that tracks the driven values
    const pressCanvas = container.querySelector('[data-jx-canvas-row]')!.closest('[data-jx-canvas]')!;
    await fireEvent.click(pressCanvas.querySelector<HTMLButtonElement>('.jx-canvas-code-toggle')!);
    const drawer = pressCanvas.querySelector<HTMLElement>('.jx-canvas-code-drawer')!;
    expect(drawer.textContent).toContain('variant="ghost"');
    expect(drawer.textContent).toContain('{@attach pressEffect(pulse())}');

    // reset → schema defaults (variant outline, attach none)
    await fireEvent.click(container.querySelector<HTMLButtonElement>('[data-jx-canvas-reset]')!);
    expect(container.querySelector('[data-jx-press-button="outline"]')).not.toBeNull();
    expect(container.querySelector('[data-jx-press-button="outline"] .jx-pulse-layer')).toBeNull();
  });
});
