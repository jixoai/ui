/**
 * Kbd contract suite (test/kbd.spec.ts, 2026-09-01; header re-worded
 * 2026-09-02, F-8 — the stale "chip geometry … shadow-2xs lift" claim
 * retired with the engrave migration).
 *
 * The native keyboard glyph on the variant ladder (variant-grammar
 * frozen r1): tonal (the 12%/45% tint recipe over --jx-tonal, which
 * aliases primary at :root) is the DEFAULT rung; fill and outline sit
 * beside it. Semantic hue injects from outside via jx-hue-* utilities,
 * never as a variant name. The kbd geometry — 1px border, the
 * --shadow-engrave inset (a glyph incised into the plane, the
 * elevation grammar's engrave tier — never a lift), mono, secondary
 * text scale — rides every rung unchanged.
 *
 * Assertion law: state is read back through the DOM the way a user or
 * assistive tech sees it (element, attributes, classes) — never through
 * component internals.
 */
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import KbdHost from './fixtures/kbd-host.svelte';

describe('kbd variants', () => {
  it('renders a native <kbd> stamped with the valued hook, defaulting to tonal', () => {
    const { container } = render(KbdHost);
    const el = container.querySelector('kbd')!;
    expect(el).toBeTruthy();
    expect(el.getAttribute('data-jx-kbd')).toBe('tonal');
    // no density opinion → no stamp (fleet law: rides ambient css scope)
    expect(el.getAttribute('data-density')).toBeNull();
    // chip geometry rides every rung; the elevation is the ENGRAVE
    // inset (incised into the plane), not a lift
    expect(el.className).toContain('shadow-engrave');
    expect(el.className).toContain('font-mono');
    expect(el.className).toContain('border');
  });

  it('tonal is the 12%/45% tint recipe, text the hue itself', () => {
    const { container } = render(KbdHost);
    const el = container.querySelector('kbd')!;
    expect(el.className).toContain('bg-[color-mix(in_oklab,var(--jx-tonal)_12%,transparent)]');
    expect(el.className).toContain('border-[color-mix(in_oklab,var(--jx-tonal)_45%,transparent)]');
    expect(el.className).toContain('text-[color:var(--jx-tonal)]');
  });

  it('fill is the solid grammar pair against the global tokens', () => {
    const { container } = render(KbdHost, { props: { variant: 'fill' } });
    const el = container.querySelector('kbd')!;
    expect(el.getAttribute('data-jx-kbd')).toBe('fill');
    expect(el.className).toContain('[background:var(--jx-fill)]');
    expect(el.className).toContain('[border-color:var(--jx-fill)]');
    expect(el.className).toContain('text-[color:var(--jx-fill-ink)]');
  });

  it('outline is the structural border over a transparent ground', () => {
    const { container } = render(KbdHost, { props: { variant: 'outline' } });
    const el = container.querySelector('kbd')!;
    expect(el.getAttribute('data-jx-kbd')).toBe('outline');
    expect(el.className).toContain('bg-transparent');
    expect(el.className).toContain('text-foreground');
    expect(el.className).toContain('[border-color:var(--jx-outline)]');
  });
});
