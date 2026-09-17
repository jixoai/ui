/**
 * Kbd contract suite (test/kbd.spec.ts, 2026-09-01; header re-worded
 * 2026-09-02, F-8 — the stale "chip geometry … shadow-2xs lift" claim
 * retired with the engrave migration).
 *
 * The native keyboard glyph on the variant ladder (variant-grammar
 * frozen r1): tonal (the 12%/45% tint recipe over --jx-tonal, which
 * aliases primary at :root) is the DEFAULT rung; fill and outline sit
 * beside it. Semantic hue injects from outside via jx-hue-* utilities,
 * never as a variant name. The kbd geometry — 1px border, 2px corner
 * radius (Owner 2026-09-05), the --shadow-engrave inset (a glyph
 * incised into the plane, the elevation grammar's engrave tier —
 * never a lift), mono, secondary text scale — rides every rung
 * unchanged.
 *
 * tailwindless one-shot Wave 1b batch A (2026-09-17): the paint moved
 * from utility strings to the family's stylex atoms (kbd.stylex.ts) —
 * the ladder is asserted through the SAME join the component rides
 * (the cx law), and the recipes (tint mixes, engrave shadow, the 2px
 * corner seam, forced-colors degradation) at the atom SOURCE (the
 * separator suite's css-source law). Utility-shaped expectations are
 * gone with the utilities.
 *
 * Assertion law: state is read back through the DOM the way a user or
 * assistive tech sees it (element, attributes, classes) — never through
 * component internals.
 */
import { render } from '@testing-library/svelte';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import KbdHost from './fixtures/kbd-host.svelte';
import { kbdStyles } from '../src/lib/ui/kbd/kbd.stylex';

// the cx law (the component's own joiner, verbatim): all string
// members except $$css, space-joined
const cx = (
  ...styles: ({ readonly [key: string]: string | object } | undefined | string)[]
): string =>
  styles
    .filter(Boolean)
    .map((style) =>
      typeof style === 'string'
        ? style
        : Object.entries(style).flatMap(([key, value]) =>
            key !== '$$css' && typeof value === 'string' ? [value] : [],
          ).join(' '),
    )
    .join(' ');

describe('kbd variants', () => {
  it('renders a native <kbd> stamped with the valued hook, defaulting to tonal', () => {
    const { container } = render(KbdHost);
    const el = container.querySelector('kbd')!;
    expect(el).toBeTruthy();
    expect(el.getAttribute('data-jx-kbd')).toBe('tonal');
    // no density opinion → no stamp (fleet law: rides ambient css scope)
    expect(el.getAttribute('data-density')).toBeNull();
    // chip geometry rides every rung; the elevation is the ENGRAVE
    // inset (incised into the plane), not a lift; corners carry the
    // 2px radius (Owner 2026-09-05 — a hair of softening, still
    // sharp; no sheet step yet, rides the promotion seam)
    expect(el.className).toContain(cx(kbdStyles.base));
    const atom = readFileSync(resolve(process.cwd(), 'src/lib/ui/kbd/kbd.stylex.ts'), 'utf8');
    expect(atom).toContain("boxShadow: tokens['--jx-shadow-engrave']");
    expect(atom).toContain("borderRadius: 'var(--kbd-radius, 2px)'");
    expect(atom).toContain("borderWidth: tokens['--jx-hairline']");
    expect(atom).toContain("fontFamily: tokens['--jx-font-mono']");
  });

  it('tonal is the 12%/45% tint recipe, text the hue itself', () => {
    const { container } = render(KbdHost);
    const el = container.querySelector('kbd')!;
    expect(el.className).toContain(cx(kbdStyles.base, kbdStyles.tonal));
    const atom = readFileSync(resolve(process.cwd(), 'src/lib/ui/kbd/kbd.stylex.ts'), 'utf8');
    expect(atom).toContain(
      "backgroundColor: 'color-mix(in oklab, var(--jx-tonal) 12%, transparent)'",
    );
    expect(atom).toContain(
      "borderColor: 'color-mix(in oklab, var(--jx-tonal) 45%, transparent)'",
    );
    expect(atom).toContain("color: 'var(--jx-tonal)'");
  });

  it('fill is the solid grammar pair against the global tokens', () => {
    const { container } = render(KbdHost, { props: { variant: 'fill' } });
    const el = container.querySelector('kbd')!;
    expect(el.getAttribute('data-jx-kbd')).toBe('fill');
    expect(el.className).toContain(cx(kbdStyles.base, kbdStyles.fill));
    const atom = readFileSync(resolve(process.cwd(), 'src/lib/ui/kbd/kbd.stylex.ts'), 'utf8');
    expect(atom).toContain("backgroundColor: 'var(--jx-fill)'");
    expect(atom).toContain("borderColor: 'var(--jx-fill)'");
    expect(atom).toContain("color: 'var(--jx-fill-ink)'");
  });

  it('outline is the structural border over a transparent ground', () => {
    const { container } = render(KbdHost, { props: { variant: 'outline' } });
    const el = container.querySelector('kbd')!;
    expect(el.getAttribute('data-jx-kbd')).toBe('outline');
    expect(el.className).toContain(cx(kbdStyles.base, kbdStyles.outline));
    const atom = readFileSync(resolve(process.cwd(), 'src/lib/ui/kbd/kbd.stylex.ts'), 'utf8');
    expect(atom).toContain("backgroundColor: 'transparent'");
    expect(atom).toContain("color: tokens['--jx-foreground']");
    expect(atom).toContain("borderColor: 'var(--jx-outline)'");
  });

  it('forced-colors degrades every rung explicitly (design §6)', () => {
    const atom = readFileSync(resolve(process.cwd(), 'src/lib/ui/kbd/kbd.stylex.ts'), 'utf8');
    expect((atom.match(/@media \(forced-colors: active\)/g) ?? []).length).toBe(3);
    expect(atom).toContain("backgroundColor: 'ButtonFace'");
    expect(atom).toContain("backgroundColor: 'Canvas'");
    expect(atom).toContain("color: 'ButtonText'");
  });
});
