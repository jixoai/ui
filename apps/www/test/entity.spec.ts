/**
 * The entity law suite (test/entity.spec.ts, 2026-09-01).
 *
 * Border is objecthood: inside an entity (a dialog panel), form shells
 * DISSOLVE (border + ground transparent — the well inset carries the
 * affordance); accumulated nesting AUTO-TRIGGERS the hairline edge at
 * depth ≥2; [data-assert-border] force-spends the budget at any depth.
 * The depth itself is Svelte-context arithmetic — jsdom cannot compute
 * the paint, so the law is pinned at the css SOURCE (the input-group
 * convention) while the accumulation is proven through the fixture
 * chain (outer 1 → inner 2).
 */
import { render } from '@testing-library/svelte';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import EntityHost from './fixtures/entity-host.svelte';
import EntityInner from './fixtures/entity-inner.svelte';

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

describe('entity law — the paint projections (css source law)', () => {
  it('depth 1 dissolves the form shells: transparent border + ground, focus exempt', () => {
    // the dissolve, guarded so the focus tint always wins the border back
    expect(css).toMatch(/\[data-jx-entity\] \.jx-html-control-shell:not\(:has\(:focus\)\)/);
    expect(css).toContain('border-color: transparent');
    expect(css).toContain('background: transparent');
  });

  it('depth ≥2 auto-triggers the hairline edge (accumulated re-assertion)', () => {
    expect(css).toContain("[data-jx-entity='2'] .jx-html-control-shell");
    expect(css).toContain("[data-jx-entity='3'] .jx-html-control-shell");
    expect(css).toContain('color-mix(in oklab, var(--border) 55%, transparent)');
  });

  it('the force-spend: data-assert-border restores the full edge at any depth', () => {
    expect(css).toContain('[data-jx-entity] [data-assert-border].jx-html-control-shell');
    expect(css).toMatch(/\[data-assert-border\]\[data-jx-igroup\]/);
  });
});
