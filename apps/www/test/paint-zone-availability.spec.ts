/**
 * The paint zone's AVAILABILITY gate (codex r1 B4, 2026-09-05) — the
 * ambient lane of definePaintSlot falls back to the family's own
 * default when the zone carries a value outside the family's frozen
 * availability tuple. The live crash vector: a ghost zone around
 * Badge/Kbd/InlineCode (whose unions stop at fill/tonal/outline)
 * leaked 'ghost' into variantUtilities lookups as undefined paint.
 * Explicit props still win everywhere; the full-union family
 * (press-button) still inherits the zone verbatim.
 */
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import PaintZoneHost from './fixtures/paint-zone-host.svelte';

const mount = (variant: 'fill' | 'tonal' | 'outline' | 'ghost') =>
  render(PaintZoneHost, { variant });

const stampIn = (container: HTMLElement, probe: string, root: string) =>
  container.querySelector(`[data-testid="${probe}"] [${root}]`)!.getAttribute(root)!;

describe('paint zone availability gate (B4)', () => {
  it('ghost zone: narrow families fall back to own, press-button inherits ghost', () => {
    const { container } = mount('ghost');
    expect(stampIn(container, 'probe-badge', 'data-jx-badge')).toBe('tonal');
    // kbd is deliberately zone-inert (a literal slot, never on the paint axis)
    expect(stampIn(container, 'probe-kbd', 'data-jx-kbd')).toBe('tonal');
    expect(stampIn(container, 'probe-code', 'data-jx-inline-code')).toBe('tonal');
    expect(stampIn(container, 'probe-press', 'data-jx-press-button')).toBe('ghost');
  });

  it('outline zone: supported values inherit verbatim; kbd stays zone-inert', () => {
    const { container } = mount('outline');
    expect(stampIn(container, 'probe-badge', 'data-jx-badge')).toBe('outline');
    expect(stampIn(container, 'probe-kbd', 'data-jx-kbd')).toBe('tonal');
    expect(stampIn(container, 'probe-code', 'data-jx-inline-code')).toBe('outline');
    expect(stampIn(container, 'probe-press', 'data-jx-press-button')).toBe('outline');
  });

  it('fill zone: badge inherits; inline-code (tonal/outline only) falls back; explicit wins', () => {
    const { container } = mount('fill');
    expect(stampIn(container, 'probe-badge', 'data-jx-badge')).toBe('fill');
    expect(stampIn(container, 'probe-code', 'data-jx-inline-code')).toBe('tonal');
    expect(stampIn(container, 'probe-press', 'data-jx-press-button')).toBe('fill');
    expect(stampIn(container, 'probe-press-explicit', 'data-jx-press-button')).toBe('tonal');
    expect(stampIn(container, 'probe-badge-explicit', 'data-jx-badge')).toBe('outline');
  });

  it('the fallback keeps the family PAINTED — variant utilities resolve, not undefined', () => {
    const { container } = mount('ghost');
    const badge = container.querySelector('[data-testid="probe-badge"] [data-jx-badge]')!;
    expect(badge.className).toContain('bg-');
    expect(badge.getAttribute('data-jx-badge')).not.toBe('ghost');
  });
});
