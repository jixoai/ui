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
    // rows: variant, effect, loading, disabled, popovertarget, raised
    // (segmented/segmented/toggle/toggle/text/toggle — r13 added
    // popovertarget, the raised physics axis added its toggle, Owner
    // 2026-09-03; the native inert pose disabled added its toggle,
    // issue #4, 2026-09-13) + the W4 4.1 axis trio: seven axes
    // (theme scoped out page-side — the stage-preview bindable owns
    // re-theming) × {axis-enum, :query} + six :number rows = 20 → 26
    // total
    const rows = container.querySelectorAll('[data-jx-canvas-row]');
    expect(rows.length).toBe(26);
    expect(container.querySelector('[data-jx-canvas-axis-select]')).not.toBeNull();
    expect(container.querySelectorAll('[data-jx-canvas-axis-select]').length).toBe(7);
    // the axis siblings stay HIDDEN until their mode is selected
    expect(container.querySelector('[data-jx-canvas-axis-number]')).toBeNull();
    expect(container.querySelector('[data-jx-canvas-axis-query]')).toBeNull();
    expect(container.querySelector('[data-jx-canvas-toggle]')).not.toBeNull();
    // no hand-written kit selects remain (the canvas-everywhere sweep,
    // 2026-09-08, mounts the dock chrome on every canvas — each carries
    // the head's density select; the body's rows pane carries ONLY
    // schema-lowered selects — the W4 axis enums, never kit ones)
    const rowSelects = [...container.querySelectorAll('[data-jx-canvas-dock-scroll] select')];
    expect(rowSelects.length).toBe(7);
    expect(
      rowSelects.every((s) => s.hasAttribute('data-jx-canvas-axis-select')),
      'dock-body selects are all axis enums',
    ).toBe(true);
    const selects = [...container.querySelectorAll('select')];
    // W3-B (explicit-props): the universal-props demo canvas joined —
    // four canvases, four density selects; W4 4.1 adds the seven axis
    // enum selects inside the schema canvas's dock body
    expect(selects.length).toBe(11);
    expect(
      selects.filter((s) => s.getAttribute('aria-label') === 'Density').length,
      'chrome density selects — one per canvas',
    ).toBe(4);
    expect(container.querySelector('select')!.getAttribute('aria-label')).toBe('Density');

    // flip variant → the driven instance restamps data-jx-press-button
    // (grindstone #17-3: the segmented rows ride ItemSegmented — the
    // segment's identity is the native radio's value)
    const driven = container.querySelector<HTMLButtonElement>('[data-jx-press-button="fill"]');
    expect(driven).not.toBeNull();
    await fireEvent.click(
      container.querySelector<HTMLInputElement>('[data-jx-canvas-seg] input[value="ghost"]')!,
    );
    expect(container.querySelector('[data-jx-press-button="ghost"]')).not.toBeNull();

    // the attach row via the onvalue seam: names → the factory (the
    // DRIVEN ghost instance paints the pulse layer through pressEffect —
    // the static demo row also has one)
    await fireEvent.click(
      container.querySelector<HTMLInputElement>('[data-jx-canvas-seg] input[value="pulse"]')!,
    );
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

  it('flips an axis control → the driven instance re-stamps live (canvas-schema spec scenario)', async () => {
    const { container } = render(Page);
    // the canvas-schema delta's scenario, verbatim: elevation auto →
    // level4 re-renders with the 8dp recipe — asserted as the STAMPED
    // DECLARATION on the driven root's style attr (the D3
    // receipt-authoring law: assert the declaration, never the
    // computed value of an unregistered custom property)
    const drivenRoot = () => {
      const label = [...container.querySelectorAll('span')].find(
        (s) => s.textContent?.trim() === 'driven by the playground',
      );
      return label?.parentElement?.querySelector<HTMLButtonElement>('button') ?? null;
    };
    const elevationSelect = container.querySelector<HTMLSelectElement>(
      '[data-jx-canvas-axis-select]#jx-canvas-press-button-ctl-elevation',
    )!;
    expect(elevationSelect).toBeDefined();
    expect(drivenRoot()?.getAttribute('style')).not.toContain('--jx-elevation-effective');
    await fireEvent.change(elevationSelect, { target: { value: 'level4' } });
    expect(drivenRoot()?.getAttribute('style')).toContain('--jx-elevation-effective: 8');

    // the number spinner: size mode → number row appears → typing the
    // exact value stamps the px carrier (the rest lane lands the
    // data-jx-canvas-axis-number hook ON the native input itself)
    const sizeSelect = container.querySelector<HTMLSelectElement>(
      '[data-jx-canvas-axis-select]#jx-canvas-press-button-ctl-size',
    )!;
    await fireEvent.change(sizeSelect, { target: { value: 'number' } });
    const sizeInput = container.querySelector<HTMLInputElement>('[data-jx-canvas-axis-number]');
    expect(sizeInput).not.toBeNull();
    await fireEvent.input(sizeInput!, { target: { value: '20' } });
    await fireEvent.change(sizeInput!, { target: { value: '20' } });
    expect(drivenRoot()?.getAttribute('style')).toContain('--jx-size-effective: 20px');

    // the query editor: mode query() → the source editor appears; a
    // valid case stamps the media-conditional carrier declaration
    await fireEvent.change(sizeSelect, { target: { value: 'query()' } });
    const queryInput = container.querySelector<HTMLInputElement>('[data-jx-canvas-axis-query]');
    expect(queryInput).not.toBeNull();
    await fireEvent.input(queryInput!, { target: { value: "{ sm: 'large' }" } });
    // jsdom has no live media ticks here — the media case resolves at
    // the ENGINE's matchMedia lane — the honest jsdom assertion is
    // the engine's SSR/base law: nothing matches until the media
    // flips, so the carrier stamps nothing (auto base). The BROWSER
    // probe (scripts/probe-w4-canvas-docs.mjs) owns the live-boundary
    // receipt.
    expect(drivenRoot()?.getAttribute('style')).not.toContain('--jx-size-effective: 20px');
  });
});
