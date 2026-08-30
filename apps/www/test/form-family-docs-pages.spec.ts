import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import InputGroupPage from '../src/routes/docs/components/input-group.html/+page.svelte';
import ButtonGroupPage from '../src/routes/docs/components/button-group.html/+page.svelte';

describe('docs page smoke render', () => {
  it('input-group page mounts (no invalid_snippet, one Usage h2)', () => {
    const { container } = render(InputGroupPage);
    const headings = [...container.querySelectorAll('h1,h2,h3')].map((h) => h.textContent?.trim().toLowerCase());
    expect(headings.filter((t) => t === 'usage').length).toBe(1);
    expect(container.querySelectorAll('[data-jx-canvas-stage]').length).toBeGreaterThanOrEqual(3);
    expect(container.querySelectorAll('[data-jx-canvas-playground-title]').length).toBeGreaterThanOrEqual(3);
  });
  it('button-group page mounts (no invalid_snippet, one Usage h2)', () => {
    const { container } = render(ButtonGroupPage);
    const headings = [...container.querySelectorAll('h1,h2,h3')].map((h) => h.textContent?.trim().toLowerCase());
    expect(headings.filter((t) => t === 'usage').length).toBe(1);
    expect(container.querySelectorAll('[data-jx-canvas-playground-title]').length).toBeGreaterThanOrEqual(2);
  });
  it('no literal undefined/null text nodes on either page', () => {
    const a = render(InputGroupPage).container;
    const b = render(ButtonGroupPage).container;
    expect(a.innerHTML).not.toMatch(/>undefined</);
    expect(a.innerHTML).not.toMatch(/>null</);
    expect(b.innerHTML).not.toMatch(/>undefined</);
    expect(b.innerHTML).not.toMatch(/>null</);
  });
});
