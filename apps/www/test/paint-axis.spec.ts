/**
 * The paint axis + density收编 RUNTIME lock (context-defaults-economy
 * task 1.2, 2026-09-03; single-key law, Owner 2026-09-04) — fixture
 * per specs' "zone scopes are axis-level providers":
 *   - the zone matrix: zone-only / group-own / nested-mixed —
 *     provider-side and consumer-side reads agree on ONE key
 *   - orientation / separator (the family layout key) do not regress
 *   - zone reactivity: a parent variant flip re-derives every
 *     consumer in the SAME frame
 *   - link has NO zone lane to keep: ZonePaintVariant excludes it at
 *     the type, the provider writes the narrow domain, there is no
 *     second key and no fallback for it to ride (the inherited-link
 *     narrowing fixtures retired with the lane itself)
 *   - D3-C error transparency: a throwing zone getter and a throwing
 *     plugin propagate out of their lanes — nothing on the path
 *     catches (the window itself is a hard contract, asserted at the
 *     kernel in context-plugin.spec.ts)
 *   - densitySlot's three-state regression (bare / explicit /
 *     provider / nested)
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { render } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import MatrixHost from './fixtures/paint-axis-matrix-host.svelte';
import ReactivityHost from './fixtures/paint-axis-reactivity-host.svelte';
import PaintBoomHost from './fixtures/paint-zone-boom-host.svelte';
import DensityHost from './fixtures/density-slot-host.svelte';
import DensityThrowingHost from './fixtures/density-throwing-plugin-host.svelte';

// ---- query helpers --------------------------------------------------------

const byTestid = (container: HTMLElement, id: string) =>
  container.querySelector(`[data-testid="${id}"]`)!;
const probeOf = (container: HTMLElement, id: string) =>
  byTestid(container, id).getAttribute('data-paint-probe');
const buttonByText = (container: HTMLElement, text: string) =>
  [...container.querySelectorAll('[data-jx-press-button]')].find((b) =>
    b.textContent?.includes(text),
  )!;
const variantOf = (el: Element) => el.getAttribute('data-jx-press-button');

afterEach(() => {
  vi.restoreAllMocks();
});

// =========================================================================
// 1 · the zone matrix — ONE paint key, provider and consumers agree
// =========================================================================
describe('paint 单键 zone matrix — three states', () => {
  it('① zone-only provider: the slot probe and the button both hit the one paint key', () => {
    const { container } = render(MatrixHost);
    expect(probeOf(container, 'new-only-probe')).toBe('ghost');
    expect(variantOf(buttonByText(container, 'new-only consumer'))).toBe('ghost');
  });

  it("② the group's own variant: one effectiveVariant getter, provider-side and consumer-side reads agree", () => {
    const { container } = render(MatrixHost);
    expect(probeOf(container, 'dual-probe')).toBe('tonal');
    expect(variantOf(buttonByText(container, 'group consumer'))).toBe('tonal');
  });

  it('③ nested-mixed: the inner zone nearest-wins through the chain', () => {
    const { container } = render(MatrixHost);
    // inside the scope: the zone sees the scope's ghost
    expect(probeOf(container, 'nested-inner-probe')).toBe('ghost');
    expect(variantOf(buttonByText(container, 'nested consumer'))).toBe('ghost');
    // outside the scope (still in the outer group): tonal holds
    expect(probeOf(container, 'nested-outer-probe')).toBe('tonal');
    expect(variantOf(buttonByText(container, 'after divider'))).toBe('tonal');
  });
});

// =========================================================================
// 2 · the layout half does not regress (orientation / separator)
// =========================================================================
describe("the family layout key — orientation and separator hold", () => {
  it('vertical + ghost: the valued hook and the ghost-default separators survive the zone lane', () => {
    const { container } = render(MatrixHost);
    const group = byTestid(container, 'vertical-ghost-group');
    expect(group.getAttribute('data-jx-btngroup')).toBe('vertical');
    expect(group.hasAttribute('data-jx-separator')).toBe(true); // r14-10: ghost seams
  });

  it('horizontal + no variant: the plain row carries no separators', () => {
    const { container } = render(MatrixHost);
    const group = byTestid(container, 'horizontal-plain-group');
    expect(group.getAttribute('data-jx-btngroup')).toBe('horizontal');
    expect(group.hasAttribute('data-jx-separator')).toBe(false);
  });
});

// =========================================================================
// 3 · zone reactivity — one flip, every consumer, the same frame
// =========================================================================
describe('zone reactivity', () => {
  it('a parent variant flip re-derives every consumer in the SAME frame', async () => {
    const { container, rerender } = render(ReactivityHost, { props: { variant: 'tonal' } });
    expect(probeOf(container, 'reactive-probe')).toBe('tonal');
    expect(variantOf(buttonByText(container, 'reactive consumer'))).toBe('tonal');

    await rerender({ variant: 'ghost' });
    // ONE DOM read after the flush: every stamp already moved — no
    // intermediate frame where part of the subtree lagged
    expect(probeOf(container, 'reactive-probe')).toBe('ghost');
    expect(variantOf(buttonByText(container, 'reactive consumer'))).toBe('ghost');
  });
});

// =========================================================================
// 5 · the shared helper's write discipline (source-pinned)
// =========================================================================
describe('providePaintZone — lib-neutral, new key only', () => {
  it('the axis module writes exactly ONE context key: PAINT_ZONE_KEY (layout keys belong to the layout owners)', () => {
    const source = readFileSync(resolve(process.cwd(), 'src/lib/paint.svelte.ts'), 'utf8');
    // comments may NAME the law; the CODE may not violate it
    const code = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    const writes = code.match(/setContext\(/g) ?? [];
    expect(writes.length).toBe(1);
    expect(code).toContain('setContext(PAINT_ZONE_KEY');
  });
});

// =========================================================================
// 6 · error transparency (D3-C) — nothing on the path catches
// =========================================================================
describe('error transparency — a throwing zone getter propagates out of the slot', () => {
  it('a throwing zone getter PROPAGATES out of the slot (no catch on the ambient lane)', () => {
    const { container } = render(PaintBoomHost);
    expect(byTestid(container, 'paint-boom').getAttribute('data-paint-boom')).toBe(
      'THREW:paint-zone-boom',
    );
  });
});

// =========================================================================
// 7 · densitySlot — the three-state regression
// =========================================================================
describe('densitySlot — explicit ?? ambient ?? own ?? undefined', () => {
  it('no provider: no-opinion resolves undefined; a declared own is a REAL opinion', () => {
    const { container } = render(DensityHost);
    expect(byTestid(container, 'bare-no-own').getAttribute('data-density-slot')).toBe('none');
    expect(byTestid(container, 'bare-own-sm').getAttribute('data-density-slot')).toBe('sm');
    expect(byTestid(container, 'bare-direct').getAttribute('data-density-direct')).toBe('none');
  });

  it('explicit beats the provider; the provider beats own', () => {
    const { container } = render(DensityHost);
    expect(byTestid(container, 'xs-no-own').getAttribute('data-density-slot')).toBe('xs');
    expect(byTestid(container, 'xs-own-sm').getAttribute('data-density-slot')).toBe('xs');
    expect(byTestid(container, 'xs-explicit').getAttribute('data-density-slot')).toBe('lg');
  });

  it('nested providers shadow — nearest wins', () => {
    const { container } = render(DensityHost);
    expect(byTestid(container, 'nested-no-own').getAttribute('data-density-slot')).toBe('xs');
  });
});

describe('the kernel chain — a throwing plugin propagates on BOTH paths', () => {
  it('a definePlugin product whose before throws crosses resolveDensity uncaught (direct call AND slot)', () => {
    const { container } = render(DensityThrowingHost);
    // the v2 kernel catches nothing: the hook's error flies out of
    // resolveDensity on both lanes — the legacy direct call and the
    // densitySlot (error transparency on the REAL registration path;
    // the retired seam-plant fixture could only fake this)
    expect(byTestid(container, 'boom-direct').getAttribute('data-density-direct')).toBe(
      'THREW:plugin-boom',
    );
    expect(byTestid(container, 'boom-slot').getAttribute('data-density-slot')).toBe(
      'THREW:plugin-boom',
    );
  });
});
