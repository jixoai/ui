/**
 * Chip contract suite (test/chip.spec.ts, 2026-08-26).
 *
 * Covers the variant-grammar §4 Chip row: the four-step ladder as
 * the family's stylex atom groups (tailwindless Wave 1 batch 3,
 * 2026-09-17 — joined through the same cx law the component rides;
 * the tint recipes and forced-colors degradation asserted at the atom
 * source), the badge-twin scale law (Owner ruling, 2026-09-01 — badge
 * geometry verbatim, the activation root the only difference; slot
 * lanes replace their side's padding), the effect-attachments flip
 * (2026-09-09, r4 2026-09-10: the effect prop and its DEFAULT ripple
 * RETIRED — the chip is a PLAIN activation carrying zero effect
 * knowledge; ink, when wanted, rides the component tag through
 * <Chip {@attach pressEffect(ripple())}> onto the stamped root), the
 * button/anchor duality, and the slotStart/slotEnd lanes. Rendered
 * from the same-source copy the site consumes ($lib/ui); the attachment's
 * ripple runs its real gesture surface against jsdom (no layout:
 * getBoundingClientRect is all zeros, so coordinates pass through
 * verbatim and the dot size follows max(w,h) = 0).
 *
 * Assertion law: state is read back through the DOM the way a user or
 * assistive tech sees it (roles, attributes, classes) — never through
 * component internals.
 */
import { fireEvent, render, waitFor } from '@testing-library/svelte';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { tick } from 'svelte';

import ChipHost from './fixtures/chip-host.svelte';
import { pressEffect } from '../src/lib/ui/press-button/press-effect-runtime';
import { ripple, shimmer } from '../src/lib/ui/press-button/press-button.svelte';
import { chipStyles } from '../src/lib/ui/chip/chip.stylex';

// tailwindless-site Wave 1 batch 3 (2026-09-17): the paint moved from
// utility strings to the family's stylex atoms — the ladder is now
// asserted through the SAME join the component rides (the cx law:
// every string member except $$css, space-joined). Utility-shaped
// expectations are gone with the utilities; the LAWS (geometry voice,
// tint recipes, forced-colors degradation, seam nulling) live on as
// atom-membership assertions.
const cx = (
  ...styles: ({ readonly [key: string]: string | object } | undefined)[]
): string =>
  styles
    .filter(Boolean)
    .map((style) =>
      Object.entries(style).flatMap(([key, value]) =>
        key !== '$$css' && typeof value === 'string' ? [value] : [],
      ).join(' '),
    )
    .join(' ');
const silhouette = (shape: string): string =>
  cx(shape === 'pill' ? chipStyles.pill : chipStyles.square);

// ---------------------------------------------------------------------------
// Root element — the grammar ladder on the hit lane
// ---------------------------------------------------------------------------
describe('chip root and variants', () => {
  it('renders a button stamped with the valued hook, defaulting to tonal', () => {
    const { container } = render(ChipHost);
    const btn = container.querySelector('button')!;
    expect(btn).toBeTruthy();
    expect(container.querySelector('a')).toBeNull();
    expect(btn.getAttribute('data-jx-chip')).toBe('tonal');
    // no density opinion → no stamp (fleet law: rides ambient css scope)
    expect(btn.getAttribute('data-density')).toBeNull();
    // geometry + micro-label voice ride the root as the base atom group
    expect(btn.className).toContain(cx(chipStyles.base));
  });

  it('fill is the solid grammar pair against the global tokens', () => {
    const { container } = render(ChipHost, { props: { variant: 'fill' } });
    const btn = container.querySelector('button')!;
    expect(btn.getAttribute('data-jx-chip')).toBe('fill');
    expect(btn.className).toContain('jx-press');
    expect(btn.className).toContain(cx(chipStyles.base, chipStyles.frame, chipStyles.fill));
  });

  it('tonal is the 12%/45% tint recipe, text the hue itself', () => {
    const { container } = render(ChipHost, { props: { variant: 'tonal' } });
    const btn = container.querySelector('button')!;
    expect(btn.className).toContain(cx(chipStyles.base, chipStyles.frame, chipStyles.tonal));
  });

  it('outline is the structural border + 8% hover overlay, border unchanged', () => {
    const { container } = render(ChipHost, { props: { variant: 'outline' } });
    const btn = container.querySelector('button')!;
    expect(btn.className).toContain(cx(chipStyles.base, chipStyles.frame, chipStyles.outline));
  });

  it('ghost keeps the frame geometry, presses without a shadow, hovers tonal', () => {
    const { container } = render(ChipHost, { props: { variant: 'ghost' } });
    const btn = container.querySelector('button')!;
    expect(btn.className).toContain('jx-press');
    expect(btn.className).toContain(cx(chipStyles.base, chipStyles.ghost));
  });

  it('forced-colors degrades every variant explicitly (design §6)', () => {
    // the degradation compiles into the atoms' @media (forced-colors:
    // active) blocks — asserted at the atom SOURCE (the separator
    // suite's css-source law), the class channel carries them wholesale
    const atom = readFileSync(
      resolve(process.cwd(), 'src/lib/ui/chip/chip.stylex.ts'),
      'utf8',
    );
    expect((atom.match(/@media \(forced-colors: active\)/g) ?? []).length).toBe(5);
    expect(atom).toContain('backgroundColor: \'ButtonFace\'');
    expect(atom).toContain('backgroundColor: \'Canvas\'');
    expect(atom).toContain("color: 'CanvasText'");
    expect(atom).toMatch(/':hover': \{\s*backgroundColor: 'ButtonFace',\s*color: 'ButtonText',/);
    // the focus ring survives forced colors: 2px Highlight, offset 2
    expect(atom).toMatch(
      /':focus-visible': \{\s*outlineWidth: '2px',\s*outlineOffset: '2px',\s*outlineColor: 'Highlight',/,
    );
  });

  it('shape pill rounds fully; square keeps the site radius', () => {
    const pill = render(ChipHost, { props: { shape: 'pill' } });
    expect(pill.container.querySelector('button')!.className).toContain(silhouette('pill'));
    pill.unmount();
    const square = render(ChipHost);
    expect(square.container.querySelector('button')!.className).toContain(silhouette('square'));
  });
});

// ---------------------------------------------------------------------------
// Scale — the badge's activation twin
// ---------------------------------------------------------------------------
describe('chip scale — the badge twin law', () => {
  it('rides badge geometry: height from the secondary line, no hit lane', () => {
    const { container } = render(ChipHost);
    const btn = container.querySelector('button')!;
    // the base atom group IS the geometry contract (line-height/
    // font-size from the secondary channels, inline insets); the hit
    // lane never enters it
    expect(btn.className).toContain(cx(chipStyles.base));
    const atom = readFileSync(
      resolve(process.cwd(), 'src/lib/ui/chip/chip.stylex.ts'),
      'utf8',
    );
    expect(atom).toContain("lineHeight: 'var(--jx-line-secondary)'");
    expect(atom).toContain("fontSize: 'var(--jx-text-secondary)'");
    expect(atom).toContain("paddingInline: 'var(--jx-inset)'");
    expect(atom).not.toContain('--jx-hit');
  });

  it('slot lanes replace their side of the padding (the data-icon law)', () => {
    const { container } = render(ChipHost, { props: { withSlots: true } });
    const btn = container.querySelector('button')!;
    // the halving rides the base atom's :has() poses — verified at the
    // atom source (the valued hooks stay the runtime contract)
    const atom = readFileSync(
      resolve(process.cwd(), 'src/lib/ui/chip/chip.stylex.ts'),
      'utf8',
    );
    expect(atom).toContain("':has([data-icon=\"inline-start\"])'");
    expect(atom).toContain("':has([data-icon=\"inline-end\"])");
    expect(atom).toContain("paddingLeft: 'calc(var(--jx-inset) / 2)'");
    expect(atom).toContain("paddingRight: 'calc(var(--jx-inset) / 2)'");
    expect(btn.querySelector('[data-icon="inline-start"]')).toBeTruthy();
    expect(btn.querySelector('[data-icon="inline-end"]')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Effect loops — the component-tag attachment (the effect prop +
// default ripple retired with effect-attachments, 2026-09-09)
// ---------------------------------------------------------------------------
describe('chip effects', () => {
  it('ZERO effect knowledge by default: no host attrs, no layer, no stacking pose — the plain activation', () => {
    const { container } = render(ChipHost);
    const btn = container.querySelector('button')!;
    expect(btn.hasAttribute('data-jx-ripple-host')).toBe(false);
    expect(btn.hasAttribute('data-jx-shimmer-host')).toBe(false);
    expect(btn.classList.contains('jx-rainbow-host')).toBe(false);
    expect(btn.querySelector('.jx-ripple-layer')).toBeNull();
    expect(btn.className).not.toContain('relative');
    // the 'root' hook is the public contract, armed or not
    expect(btn.getAttribute('data-jx-attach')).toBe('root');
  });

  it('the REST LANE spreads onto the root: an extra prop lands verbatim (the tag mechanism rides it)', () => {
    // proves the rest spread exists (r4's forwarding mechanism — the
    // component-tag attachment reaches the root through this lane)
    const { container } = render(ChipHost, { props: { dataX: 'probe' } });
    expect(container.querySelector('button')!.getAttribute('data-x')).toBe('probe');
  });

  it('onclick routes DIRECTLY now (no runtime seam between): a click fires and spawns nothing', async () => {
    let activations = 0;
    const { container } = render(ChipHost, {
      props: { onclick: () => activations++ },
    });
    const btn = container.querySelector('button')!;
    fireEvent.click(btn, { clientX: 10, clientY: 10, detail: 1 });
    await tick();
    expect(activations).toBe(1);
    expect(btn.querySelector('.jx-ripple-ink')).toBeNull();
  });

  it("the component-tag form mounts press-button loops: ripple ink on the chip's own root", async () => {
    const { container } = render(ChipHost, {
      props: { attach: pressEffect(ripple({ duration: 20 })) },
    });
    const btn = container.querySelector('button')!;
    expect(btn.getAttribute('data-jx-attach')).toBe('root'); // bidirectional: marker ↔ the tag's mount
    expect(btn.hasAttribute('data-jx-ripple-host')).toBe(true);
    const layer = container.querySelector('.jx-ripple-layer')!;

    // the self-listening gesture surface: ink on POINTERDOWN; THE TARGET
    // LAW (r6): client coords minus the seat's rect (stubbed — jsdom
    // computes no layout)
    Object.defineProperty(layer, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ left: 100, top: 50, width: 300, height: 150, right: 400, bottom: 200, x: 100, y: 50, toJSON: () => ({}) }),
    });
    const down = new PointerEvent('pointerdown', { bubbles: true, clientX: 130, clientY: 90 });
    btn.dispatchEvent(down);
    const ink = layer.querySelector('.jx-ripple-ink') as SVGCircleElement;
    expect(ink.tagName).toBe('circle');
    expect(ink.getAttribute('cx')).toBe('30'); // 130 - 100
    expect(ink.getAttribute('cy')).toBe('40'); // 90 - 50
    expect(ink.dataset.shape).toBe('round');
    expect(layer.getAttribute('style')).toContain('--ripple-color: currentColor');

    // the ink settles on the css timeline's OWN event (r5 — no WAAPI
    // left; jsdom runs no css animations, so the spec dispatches the
    // platform's settle event the way a real engine fires it)
    ink.dispatchEvent(new Event('animationend'));
    await waitFor(() => expect(layer.querySelectorAll('.jx-ripple-ink')).toHaveLength(0));
  });

  it('the component tag carries the shimmer loop: stamps + layers on the root', () => {
    const { container } = render(ChipHost, {
      props: { attach: pressEffect(shimmer({ speed: 4000 })) },
    });
    const btn = container.querySelector('button[data-jx-shimmer-host]')!;
    expect(btn.hasAttribute('data-jx-ripple-host')).toBe(false);
    expect(btn.getAttribute('style')).toContain('--shimmer-speed: 4000ms');
    // the r11 host channel: the class + vars ride the root itself —
    // NO child layer anywhere
    expect(btn.classList.contains('jx-shimmer-host')).toBe(true);
    expect(btn.querySelectorAll(':scope > *')).toHaveLength(0);
  });

  it('a bevel ripple rides the component tag (the diamond reaches the path)', async () => {
    const { container } = render(ChipHost, {
      props: { attach: pressEffect(ripple({ duration: 20, shape: 'bevel' })) },
    });
    const btn = container.querySelector('button')!;
    fireEvent.pointerDown(btn, { clientX: 5, clientY: 5 });
    const ink = container.querySelector('.jx-ripple-ink')!;
    expect(ink.tagName).toBe('path');
    expect(ink.dataset.shape).toBe('bevel');
    // jsdom knows no corner-shape: the support marker rides the node (the
    // path draws the diamond directly — the shape law's 50% chamfer)
    expect(ink.getAttribute('class')).toContain('jx-ripple-flat');
    // r5 settle: the css timeline's own event, dispatched like an engine
    ink.dispatchEvent(new Event('animationend'));
    await waitFor(() => expect(container.querySelectorAll('.jx-ripple-ink')).toHaveLength(0));
  });
});

// ---------------------------------------------------------------------------
// Button or anchor duality
// ---------------------------------------------------------------------------
describe('chip anchor mode', () => {
  it('href renders an anchor carrying the same ladder + the root hook', () => {
    const { container } = render(ChipHost, {
      props: { variant: 'outline', href: 'https://github.com/jixoai/ui' },
    });
    const anchor = container.querySelector('a')!;
    expect(container.querySelector('button')).toBeNull();
    expect(anchor.getAttribute('data-jx-chip')).toBe('outline');
    expect(anchor.className).toContain('jx-press');
    expect(anchor.getAttribute('data-jx-attach')).toBe('root');
    // external hrefs open a new tab with noreferrer
    expect(anchor.getAttribute('target')).toBe('_blank');
    expect(anchor.getAttribute('rel')).toBe('noreferrer');
  });

  it('internal hrefs navigate in place', () => {
    const { container } = render(ChipHost, { props: { href: '/docs.html' } });
    const anchor = container.querySelector('a')!;
    expect(anchor.getAttribute('target')).toBeNull();
    expect(anchor.getAttribute('rel')).toBeNull();
  });

  it('renders a submit-typed button when asked; aria-label lands verbatim', () => {
    const { container } = render(ChipHost, {
      props: { type: 'submit', ariaLabel: 'Apply filters' },
    });
    const btn = container.querySelector('button')!;
    expect(btn.getAttribute('type')).toBe('submit');
    expect(btn.getAttribute('aria-label')).toBe('Apply filters');
  });
});

// ---------------------------------------------------------------------------
// Slots — data-icon lanes around the label
// ---------------------------------------------------------------------------
describe('chip slots', () => {
  it('slotStart/slotEnd render as VALUED data-icon spans wrapping the label', () => {
    const { container } = render(ChipHost, { props: { withSlots: true } });
    const btn = container.querySelector('button')!;
    const lanes = btn.querySelectorAll('[data-icon]');
    expect(lanes).toHaveLength(2);
    // the valued attributes are the padding-law hooks (has-[[data-icon=inline-start]])
    expect(lanes[0].getAttribute('data-icon')).toBe('inline-start');
    expect(lanes[1].getAttribute('data-icon')).toBe('inline-end');
    expect(lanes[0].className).toContain(cx(chipStyles.slotStart));
    expect(lanes[1].className).toContain(cx(chipStyles.slotEnd));
    for (const lane of lanes) {
      expect(lane.querySelector('svg')).toBeTruthy();
    }
    // the svg sizing rides chip.css (the descendant boundary atoms
    // cannot express) — the lane law at the css source
    const css = readFileSync(
      resolve(process.cwd(), 'src/lib/ui/chip/chip.css'),
      'utf8',
    );
    expect(css).toContain(":where([data-icon='inline-start'] > svg)");
    expect(css).toContain('width: var(--jx-text-secondary)');
    // lane order: start before the label, end after it
    expect(btn.textContent).toContain('filter');
    expect(lanes[0].compareDocumentPosition(lanes[1]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('without slots no data-icon lane exists', () => {
    const { container } = render(ChipHost);
    expect(container.querySelector('button')!.querySelectorAll('[data-icon]')).toHaveLength(0);
  });
});
