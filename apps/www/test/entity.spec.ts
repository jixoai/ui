/**
 * The entity law suite (test/entity.spec.ts, 2026-09-01; r14-12).
 *
 * Border is objecthood — but a well's edge is STRUCTURE: inside an
 * entity a form control is an engraved WELL of the entity's surface.
 * The GROUND dissolves (the entity's surface is the basin's interior)
 * while the shell's own hairline edge paints through untouched — a
 * boundary must never ride on the shadow alone (Owner, r14-12:
 * "DialogBody 里的 input 完全看不到边框，只看到内阴影"). The old full
 * dissolve (edge transparent too) and the depth-2 55% re-assert are
 * retired; data-assert-border force-spends the GROUND back,
 * data-dissolve-border opts a flush edge-to-edge field fully out. The
 * depth itself is Svelte-context arithmetic — jsdom cannot compute the
 * paint, so the law is pinned at the css SOURCE (the input-group
 * convention) while the accumulation is proven through the fixture
 * chain (outer 1 → inner 2) and the override routing through Input's
 * SHELL forwarding.
 */
import { render } from '@testing-library/svelte';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import EntityHost from './fixtures/entity-host.svelte';
import EntityInner from './fixtures/entity-inner.svelte';
import Input from '../src/lib/ui/input/input.svelte';

const css = readFileSync(resolve(process.cwd(), 'src/lib/entity.css'), 'utf8');

describe('entity context — depth accumulation', () => {
  it('provideEntity() accumulates through nesting: outer 1 → inner 2', () => {
    const { container } = render(EntityHost);
    const outer = container.querySelector('[data-testid="entity-outer"]')!;
    const inner = container.querySelector('[data-testid="entity-inner"]')!;
    expect(outer.getAttribute('data-jx-entity')).toBe('1');
    expect(inner.getAttribute('data-jx-entity')).toBe('2');
    expect(container.querySelector('[data-testid="entity-inner-depth"]')!.textContent).toBe('2');
  });

  it('a lone entity starts at depth 1 (no ambient)', () => {
    const { container } = render(EntityInner);
    expect(container.querySelector('[data-testid="entity-inner"]')!.getAttribute('data-jx-entity')).toBe('1');
  });
});

describe('entity law — the paint projections (css source law, r14-12)', () => {
  it('depth ≥1 dissolves the GROUND only — the well edge is structure and stays', () => {
    expect(css).toMatch(/\[data-jx-entity\] \.jx-html-control-shell[^:{]*\{[^}]*background: transparent/s);
    // the border dissolve is GONE from the default path: no rule may
    // blank the shell's edge except the explicit opt-out below
    const optOut = css.match(/\[data-dissolve-border\]\.jx-html-control-shell[^{]*\{[^}]*\}/s)?.[0] ?? '';
    const withoutOptOut = css.replace(optOut, '');
    expect(withoutOptOut).not.toContain('border-color: transparent');
  });

  it('the retired faces stay retired: no depth-2 re-assert, no unconditional edge restore', () => {
    expect(css).not.toContain("[data-jx-entity='2']");
    expect(css).not.toMatch(/border-color: var\(--border\)/); // the edge never leaves — nothing to restore
  });

  it('the force-spend: data-assert-border restores the GROUND at any depth', () => {
    expect(css).toMatch(/\[data-assert-border\]\.jx-html-control-shell[^{]*\{[^}]*background: var\(--background\)/s);
    expect(css).toMatch(/\[data-assert-border\]\[data-jx-igroup\]/);
  });

  it('the opt-out: data-dissolve-border keeps the full dissolve, focus-exempt', () => {
    expect(css).toMatch(/\[data-dissolve-border\]\.jx-html-control-shell:not\(:has\(:focus\)\)/);
    expect(css).toMatch(/\[data-dissolve-border\]\.jx-html-control-shell[^{]*\{[^}]*border-color: transparent/s);
  });
});

describe('entity overrides — Input routes them to the SHELL (the entity css keys there)', () => {
  it('data-assert-border and data-dissolve-border stamp the shell, not the native input', () => {
    const spent = render(Input, { props: { 'data-assert-border': true } });
    const spentShell = spent.container.querySelector('.jx-html-control-shell')!;
    expect(spentShell.hasAttribute('data-assert-border')).toBe(true);
    expect(spent.container.querySelector('input')?.hasAttribute('data-assert-border')).toBe(false);

    const gone = render(Input, { props: { 'data-dissolve-border': true } });
    const goneShell = gone.container.querySelector('.jx-html-control-shell')!;
    expect(goneShell.hasAttribute('data-dissolve-border')).toBe(true);
    expect(gone.container.querySelector('input')?.hasAttribute('data-dissolve-border')).toBe(false);

    const plain = render(Input, { props: {} });
    const plainShell = plain.container.querySelector('.jx-html-control-shell')!;
    expect(plainShell.hasAttribute('data-assert-border')).toBe(false);
    expect(plainShell.hasAttribute('data-dissolve-border')).toBe(false);
  });
});
