/**
 * ComponentCanvas playground-protocol suite (test/component-canvas.spec.ts).
 *
 * The P1 seams: deterministic aria ids derived from the title (hydration
 * law), the page-owned reset callback (canvas never reflects consumer
 * state), the read-only echo footer (terminal dl, no live region), and the
 * code-drawer content resolver (usage files track live state without
 * TreeFile.content becoming a function). State is read back through the
 * DOM the way a user or assistive tech sees it.
 */
import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import CanvasHost from './fixtures/canvas-host.svelte';
import CanvasPlainHost from './fixtures/canvas-plain-host.svelte';

describe('ComponentCanvas semantics', () => {
  it('derives stable aria ids from the title (h2/h3 labelling + drawer controls)', () => {
    const { container } = render(CanvasPlainHost);
    const title = container.querySelector('h2.jx-canvas-title')!;
    expect(title.id).toBe('jx-canvas-host-widget-title');

    // code toggle ↔ drawer wiring
    const toggle = container.querySelector<HTMLButtonElement>('.jx-canvas-code-toggle')!;
    const drawer = container.querySelector<HTMLElement>('.jx-canvas-code-drawer')!;
    expect(toggle.getAttribute('aria-controls')).toBe(drawer.id);
    expect(drawer.id).toBe('jx-canvas-host-widget-drawer');
  });

  it('labels the playground pane with its own h3 via aria-labelledby', () => {
    // no playground snippet → no pane at all
    const { container: plain } = render(CanvasPlainHost);
    expect(plain.querySelector('.jx-canvas-playground')).toBeNull();

    const { container } = render(CanvasHost);
    const pane = container.querySelector<HTMLElement>('.jx-canvas-playground')!;
    const heading = pane.querySelector('h3')!;
    expect(pane.getAttribute('aria-labelledby')).toBe(heading.id);
    expect(heading.textContent?.toLowerCase()).toContain('playground');
  });
});

describe('ComponentCanvas playground protocol', () => {
  it('hides the reset button unless onreset is provided', () => {
    const { container } = render(CanvasPlainHost);
    expect(container.querySelector('.jx-canvas-reset')).toBeNull();
  });

  it('reset restores page-owned state and keeps focus on the button', async () => {
    const { container } = render(CanvasHost);
    const input = container.querySelector<HTMLInputElement>('[data-testid="label-input"]')!;
    await fireEvent.input(input, { target: { value: 'renamed' } });
    expect(container.querySelector('[data-testid="stage-demo"]')!.textContent).toBe('renamed');

    const reset = container.querySelector<HTMLButtonElement>('.jx-canvas-reset')!;
    reset.focus();
    await fireEvent.click(reset);
    expect(container.querySelector('[data-testid="stage-demo"]')!.textContent).toBe('Actions');
    expect(document.activeElement).toBe(reset);
  });

  it('echo renders a read-only dl; undefined falls back to the em dash', () => {
    const { container } = render(CanvasHost);
    const rows = container.querySelectorAll('.jx-canvas-echo-row');
    expect(rows.length).toBe(3);
    expect(rows[0].querySelector('dt')!.textContent).toBe('label');
    expect(rows[0].querySelector('dd')!.textContent).toBe('Actions');
    expect(rows[2].querySelector('dd')!.textContent).toBe('—');
    // deliberately NOT a live region: fast control churn must not announce
    const echo = container.querySelector('.jx-canvas-echo')!;
    expect(echo.getAttribute('aria-live')).toBeNull();
  });

  it('resolveFileContent overrides only the drawer view, not the tree', async () => {
    const { container } = render(CanvasHost);
    const input = container.querySelector<HTMLInputElement>('[data-testid="label-input"]')!;
    await fireEvent.input(input, { target: { value: 'live!' } });

    const toggle = container.querySelector<HTMLButtonElement>('.jx-canvas-code-toggle')!;
    await fireEvent.click(toggle);
    const drawer = container.querySelector<HTMLElement>('.jx-canvas-code-drawer')!;
    expect(drawer.hasAttribute('data-open')).toBe(true);
    expect(drawer.textContent).toContain('label="live!"');
  });
});
