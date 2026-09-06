/**
 * MathInline suite (test/math-inline.spec.ts, 2026-09-06, the
 * katex-mermaid change — intent (Owner): "引入开箱即用的 KaTeX/Mermaid
 * 渲染组件").
 *
 * The inline surface promises: ONE native span carrying REAL katex
 * markup synchronously (the isomorphic-small SSR lane — no floor, no
 * upgrade, no flash), role="math" on that content-only span with NO
 * aria-label default (katex's hidden MathML is the screen-reader path;
 * a consumer aria rides rest and lands), rest-attributes passthrough
 * with the component's own stamps AFTER the spread (Svelte later-wins:
 * consumer data-testid/title/aria pass through, the component's
 * semantic fields cannot be overridden), and invalid TeX painting in
 * place (katex-error in var(--error)) instead of throwing.
 */
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import MathInline from '../src/lib/ui/math-inline/math-inline.svelte';

describe('MathInline', () => {
  it('renders real katex markup inside the span, in INLINE mode (no katex-display)', () => {
    const { container } = render(MathInline, { props: { tex: 'e^{i\\pi} + 1 = 0' } });
    const span = container.querySelector('span[data-jx-math-inline]')!;
    expect(span).not.toBeNull();
    // the span contains ONLY the formula output — the katex root is its first child
    expect(span.firstElementChild!.classList.contains('katex')).toBe(true);
    expect(span.querySelector('.katex-display')).toBeNull();
    // the hidden MathML screen-reader path is present
    expect(span.querySelector('.katex-mathml math')).not.toBeNull();
  });

  it('role="math" on the content-only span; NO aria-label default (the MathML is the SR path)', () => {
    const { container } = render(MathInline, { props: { tex: 'a^2 + b^2 = c^2' } });
    const span = container.querySelector('span[data-jx-math-inline]')!;
    expect(span.getAttribute('role')).toBe('math');
    // an aria-label here would SHADOW the MathML — the component stamps none
    expect(span.hasAttribute('aria-label')).toBe(false);
  });

  it('a consumer-provided aria rides rest and lands (nothing shadows it)', () => {
    const { container } = render(MathInline, { props: { tex: 'x', 'aria-label': 'identity' } });
    const span = container.querySelector('span[data-jx-math-inline]')!;
    expect(span.getAttribute('aria-label')).toBe('identity');
  });

  it('rest passthrough: data-testid/title land; the component stamp wins its own field; class merges', () => {
    const { container } = render(MathInline, {
      props: {
        tex: 'x',
        'data-testid': 'eq',
        title: 'Euler',
        // the conflict pin: a consumer cannot override the component's
        // semantic stamp (spread order law — Svelte later-wins)
        'data-jx-math-inline': 'x',
        class: 'prose-math',
      },
    });
    const span = container.querySelector('[data-testid="eq"]')!;
    expect(span.tagName).toBe('SPAN');
    expect(span.getAttribute('title')).toBe('Euler');
    expect(span.getAttribute('data-jx-math-inline')).toBe('');
    expect(span.className).toContain('prose-math');
  });

  it('an invalid formula paints IN PLACE (katex-error run in var(--error)) — never throws', () => {
    const { container } = render(MathInline, { props: { tex: '\\notacommand {' } });
    const error = container.querySelector('.katex-error')!;
    expect(error).not.toBeNull();
    expect(error.getAttribute('style')).toContain('var(--error)');
    expect(error.textContent).toContain('\\notacommand');
  });
});
