/**
 * Chip contract suite (test/chip.spec.ts, 2026-08-26).
 *
 * Covers the variant-grammar §4 Chip row: the four-step ladder as
 * deterministic per-variant utility strings consuming the global
 * tokens, the ROOT hit lane (min-block-size var(--jx-hit) — the
 * physical activation rectangle, control-scale), the default ripple
 * ink (undefined effect resolves to the ripple() defaults; null
 * disables every loop), the button/anchor duality, and the
 * slotStart/slotEnd lanes. Rendered from the same-source copy the
 * site consumes ($lib/ui); the ripple runs its real click handlers
 * against jsdom (no layout: getBoundingClientRect is all zeros, so
 * coordinates pass through verbatim and the dot size follows
 * max(w,h) = 0).
 *
 * Assertion law: state is read back through the DOM the way a user or
 * assistive tech sees it (roles, attributes, classes) — never through
 * component internals.
 */
import { fireEvent, render, waitFor } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { tick } from 'svelte';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import ChipHost from './fixtures/chip-host.svelte';
import { ripple, shimmer } from '../src/lib/ui/press-button/press-button.svelte';

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
    expect(btn.getAttribute('data-density')).toBe('default');
    // geometry + micro-label voice ride the root
    expect(btn.className).toContain('inline-flex');
    expect(btn.className).toContain('font-nav');
    expect(btn.className).toContain('uppercase');
    expect(btn.className).toContain('tracking-[0.14em]');
  });

  it('fill is the solid grammar pair against the global tokens', () => {
    const { container } = render(ChipHost, { props: { variant: 'fill' } });
    const btn = container.querySelector('button')!;
    expect(btn.getAttribute('data-jx-chip')).toBe('fill');
    expect(btn.className).toContain('jx-press');
    expect(btn.className).toContain('border');
    expect(btn.className).toContain('[background:var(--jx-fill)]');
    expect(btn.className).toContain('text-[color:var(--jx-fill-ink)]');
    expect(btn.className).toContain('[border-color:var(--jx-fill)]');
  });

  it('tonal is the 12%/45% tint recipe, text the hue itself', () => {
    const { container } = render(ChipHost, { props: { variant: 'tonal' } });
    const btn = container.querySelector('button')!;
    expect(btn.className).toContain('bg-[color-mix(in_oklab,var(--jx-tonal)_12%,transparent)]');
    expect(btn.className).toContain('border-[color-mix(in_oklab,var(--jx-tonal)_45%,transparent)]');
    expect(btn.className).toContain('text-[color:var(--jx-tonal)]');
  });

  it('outline is the structural border + 8% hover overlay, border unchanged', () => {
    const { container } = render(ChipHost, { props: { variant: 'outline' } });
    const btn = container.querySelector('button')!;
    expect(btn.className).toContain('bg-transparent');
    expect(btn.className).toContain('text-foreground');
    expect(btn.className).toContain('[border-color:var(--jx-outline)]');
    expect(btn.className).toContain('hover:bg-[color-mix(in_oklab,var(--jx-tonal)_8%,transparent)]');
  });

  it('ghost keeps the frame geometry, presses without a shadow, hovers tonal', () => {
    const { container } = render(ChipHost, { props: { variant: 'ghost' } });
    const btn = container.querySelector('button')!;
    expect(btn.className).toContain('jx-press');
    expect(btn.className).toContain('border-transparent');
    expect(btn.className).toContain('[--jx-press-shadow:none]');
    expect(btn.className).toContain('[--jx-press-shadow-hover:none]');
    expect(btn.className).toContain('[--jx-press-shadow-active:none]');
    expect(btn.className).toContain('hover:text-[color:var(--jx-tonal)]');
  });

  it('forced-colors degrades every variant explicitly (design §6)', () => {
    const fill = render(ChipHost, { props: { variant: 'fill' } });
    expect(fill.container.querySelector('button')!.className).toContain(
      'forced-colors:bg-[ButtonFace]',
    );
    expect(fill.container.querySelector('button')!.className).toContain(
      'forced-colors:text-[ButtonText]',
    );
    fill.unmount();

    const tonal = render(ChipHost, { props: { variant: 'tonal' } });
    expect(tonal.container.querySelector('button')!.className).toContain(
      'forced-colors:bg-[Canvas]',
    );
    expect(tonal.container.querySelector('button')!.className).toContain(
      'forced-colors:border-[CanvasText]',
    );
    tonal.unmount();

    const ghost = render(ChipHost, { props: { variant: 'ghost' } });
    const ghostClasses = ghost.container.querySelector('button')!.className;
    expect(ghostClasses).toContain('forced-colors:bg-transparent');
    expect(ghostClasses).toContain('forced-colors:hover:bg-[ButtonFace]');
    expect(ghostClasses).toContain('forced-colors:hover:text-[ButtonText]');
    // the focus ring survives forced colors: 2px Highlight, offset 2
    expect(ghostClasses).toContain('forced-colors:focus-visible:[outline-color:Highlight]');
  });

  it('shape pill rounds fully; square keeps the site radius', () => {
    const pill = render(ChipHost, { props: { shape: 'pill' } });
    expect(pill.container.querySelector('button')!.className).toContain('rounded-full');
    pill.unmount();
    const square = render(ChipHost);
    expect(square.container.querySelector('button')!.className).toContain('rounded-(--radius)');
  });
});

// ---------------------------------------------------------------------------
// Hit lane — the ROOT box is the physical target
// ---------------------------------------------------------------------------
describe('chip hit lane', () => {
  it('the root carries min-block-size var(--jx-hit) as a real utility', () => {
    const { container } = render(ChipHost);
    expect(container.querySelector('button')!.className).toContain(
      '[min-block-size:var(--jx-hit)]',
    );
  });

  it('the theme floors --jx-hit at 44px for the default density (11 × the 4px ruler unit)', () => {
    // jsdom does not process Tailwind or resolve var() chains, so the
    // computed probe is asserted at the token SOURCE: --jx-hit aliases
    // the density hit-min, itself max(row-min, unit × 11) with the
    // ruler unit pinned at 0.25rem → 44px at the 16px root.
    // (a ?raw css import comes back EMPTY under vitest's css pipeline —
    // the sheet is read from the config-root-relative source instead)
    const sheet = readFileSync(resolve(process.cwd(), 'src/lib/jixoai.css'), 'utf8');
    expect(sheet).toContain('--jx-unit: 0.25rem');
    expect(sheet).toContain(
      '--jx-density-hit-min-default: max(var(--jx-density-row-min-default), calc(var(--jx-unit) * 11));',
    );
    expect(sheet).toContain('--jx-hit: var(--jx-density-hit-min-default);');
  });
});

// ---------------------------------------------------------------------------
// Effect loops — default ripple, null opt-out, press-button passthrough
// ---------------------------------------------------------------------------
describe('chip effects', () => {
  it('undefined effect resolves to the ripple() defaults: host attr + ink layer + click ink', async () => {
    const { container } = render(ChipHost);
    const btn = container.querySelector('button')!;
    expect(btn.hasAttribute('data-jx-ripple-host')).toBe(true);
    expect(btn.hasAttribute('data-jx-shimmer-host')).toBe(false);
    expect(btn.classList.contains('jx-rainbow-host')).toBe(false);
    // the default duration rides the builder: ink clears after 600ms
    const layer = container.querySelector('.jx-ripple-layer')!;
    expect(layer).toBeTruthy();

    // pointer click (detail > 0): jsdom's zero rect passes clientX/Y through
    fireEvent.click(btn, { clientX: 30, clientY: 40, detail: 1 });
    await tick();
    const dot = layer.querySelector('.jx-ripple-dot') as HTMLElement;
    expect(dot.style.left).toBe('30px');
    expect(dot.style.top).toBe('40px');
    expect(dot.dataset.shape).toBe('round');
    expect(dot.getAttribute('style')).toContain('--ripple-color: currentColor');

    await waitFor(() => expect(layer.querySelectorAll('.jx-ripple-dot')).toHaveLength(0));
  });

  it('effect={null} disables every loop: no host, no layer, no ink — onclick routes directly', async () => {
    let activations = 0;
    const { container } = render(ChipHost, {
      props: { effect: null, onclick: () => activations++ },
    });
    const btn = container.querySelector('button')!;
    expect(btn.hasAttribute('data-jx-ripple-host')).toBe(false);
    expect(btn.hasAttribute('data-jx-shimmer-host')).toBe(false);
    expect(btn.querySelector('.jx-ripple-layer')).toBeNull();
    fireEvent.click(btn, { clientX: 10, clientY: 10, detail: 1 });
    await tick();
    expect(activations).toBe(1);
    expect(btn.querySelector('.jx-ripple-dot')).toBeNull();
  });

  it('the default ripple routes activation through the runtime: onclick fires on click', async () => {
    let activations = 0;
    const { container } = render(ChipHost, {
      props: { onclick: () => activations++ },
    });
    fireEvent.click(container.querySelector('button')!, { clientX: 1, clientY: 1, detail: 1 });
    await tick();
    expect(activations).toBe(1);
  });

  it('press-button builders pass through: shimmer tags the host and mounts its layers', () => {
    const { container } = render(ChipHost, { props: { effect: shimmer({ speed: 4000 }) } });
    const btn = container.querySelector('button[data-jx-shimmer-host]')!;
    expect(btn.hasAttribute('data-jx-ripple-host')).toBe(false);
    expect(btn.getAttribute('style')).toContain('--shimmer-speed: 4000ms');
    expect(btn.querySelector('.jx-shimmer-spark')).toBeTruthy();
    expect(btn.querySelector('.jx-shimmer-cover')).toBeTruthy();
  });

  it('an explicit ripple() overrides the defaults (bevel shape reaches the dot)', async () => {
    const { container } = render(ChipHost, {
      props: { effect: ripple({ duration: 20, shape: 'bevel' }) },
    });
    const btn = container.querySelector('button')!;
    fireEvent.click(btn, { clientX: 5, clientY: 5, detail: 1 });
    await tick();
    const dot = container.querySelector('.jx-ripple-dot') as HTMLElement;
    expect(dot.dataset.shape).toBe('bevel');
    // jsdom knows no corner-shape: the diamond arrives as the 45° flat square
    expect(dot.className).toContain('jx-ripple-flat');
    await waitFor(() => expect(container.querySelectorAll('.jx-ripple-dot')).toHaveLength(0));
  });
});

// ---------------------------------------------------------------------------
// Button or anchor duality
// ---------------------------------------------------------------------------
describe('chip anchor mode', () => {
  it('href renders an anchor carrying the same ladder + default ink', () => {
    const { container } = render(ChipHost, {
      props: { variant: 'outline', href: 'https://github.com/jixoai/ui' },
    });
    const anchor = container.querySelector('a')!;
    expect(container.querySelector('button')).toBeNull();
    expect(anchor.getAttribute('data-jx-chip')).toBe('outline');
    expect(anchor.className).toContain('jx-press');
    expect(anchor.hasAttribute('data-jx-ripple-host')).toBe(true);
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
  it('slotStart/slotEnd render as data-icon spans wrapping the label', () => {
    const { container } = render(ChipHost, { props: { withSlots: true } });
    const btn = container.querySelector('button')!;
    const lanes = btn.querySelectorAll('[data-icon]');
    expect(lanes).toHaveLength(2);
    for (const lane of lanes) {
      expect(lane.className).toContain('[&_svg]:h-[var(--jx-text-secondary)]');
      expect(lane.querySelector('svg')).toBeTruthy();
    }
    // lane order: start before the label, end after it
    expect(btn.textContent).toContain('filter');
    expect(lanes[0].compareDocumentPosition(lanes[1]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('without slots no data-icon lane exists', () => {
    const { container } = render(ChipHost);
    expect(container.querySelector('button')!.querySelectorAll('[data-icon]')).toHaveLength(0);
  });
});
