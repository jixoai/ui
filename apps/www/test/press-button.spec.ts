/**
 * Press-button contract suite (test/press-button.spec.ts, 2026-08-23).
 *
 * Covers the press law surface contract (variant paint classes + the
 * shared .jx-press law class), the opt-in effect loops (typed builders
 * exported from the component's module script — host classes, effect
 * layers, the ripple ink machinery), and the button/anchor duality.
 * Rendered from the same-source copy the site consumes ($lib/ui); the
 * ripple runs its real click handlers against jsdom (no layout:
 * getBoundingClientRect is all zeros, so coordinates pass through
 * verbatim and the dot size follows max(w,h) = 0).
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

import PressButtonHost from './fixtures/press-button-host.svelte';
import { pulse, rainbow, ripple, shimmer } from '../src/lib/ui/press-button/press-button.svelte';

// ---------------------------------------------------------------------------
// Variant paint — one physics, the five-rung ladder
// ---------------------------------------------------------------------------
describe('press-button variants', () => {
  it('defaults to the outline rung on the shared press law class', () => {
    const { container } = render(PressButtonHost);
    const btn = container.querySelector('button')!;
    expect(btn.className).toContain('jx-press');
    expect(btn.className).toContain('bg-transparent');
    expect(btn.className).toContain('[border-color:var(--jx-outline)]');
    // the valued hook: variant grammar reads back through data-jx-press-button
    expect(btn.getAttribute('data-jx-press-button')).toBe('outline');
    // no effect loop without opting in
    // no effect loop without opting in — migrated hosts are attributes;
    // jx-rainbow-host is css-OWNED and stays a class
    for (const host of ['data-jx-shimmer-host', 'data-jx-pulse-host', 'data-jx-ripple-host']) {
      expect(btn.hasAttribute(host)).toBe(false);
    }
    expect(btn.classList.contains('jx-rainbow-host')).toBe(false);
    expect(btn.className).not.toContain('-host');
  });

  it('ghost keeps the frame but opts its shadow out through all three law poses', () => {
    const { container } = render(PressButtonHost, { props: { variant: 'ghost' } });
    const btn = container.querySelector('button')!;
    expect(btn.className).toContain('jx-press');
    expect(btn.className).toContain('[--jx-press-shadow:none]');
    expect(btn.className).toContain('[--jx-press-shadow-hover:none]');
    expect(btn.className).toContain('[--jx-press-shadow-active:none]');
    // ghost's hover tint derives from --jx-tonal, not a named surface
    expect(btn.className).toContain('hover:bg-[color-mix(in_oklab,var(--jx-tonal)_8%,transparent)]');
    expect(btn.getAttribute('data-jx-press-button')).toBe('ghost');
  });

  it('link is the frame-less surface: no press law, no border', () => {
    const { container } = render(PressButtonHost, { props: { variant: 'link' } });
    const btn = container.querySelector('button')!;
    // no effect loop without opting in — migrated hosts are attributes;
    // jx-rainbow-host is css-OWNED and stays a class
    for (const host of ['data-jx-shimmer-host', 'data-jx-pulse-host', 'data-jx-ripple-host']) {
      expect(btn.hasAttribute(host)).toBe(false);
    }
    expect(btn.classList.contains('jx-rainbow-host')).toBe(false);
    expect(btn.className).not.toContain('border-border');
    expect(btn.className).toContain('hover:underline');
    expect(btn.getAttribute('data-jx-press-button')).toBe('link');
  });

  it('fill paints through the grammar tokens: ground + same-hue border + ink', () => {
    const { container } = render(PressButtonHost, { props: { variant: 'fill' } });
    const btn = container.querySelector('button')!;
    expect(btn.className).toContain('[background:var(--jx-fill)]');
    expect(btn.className).toContain('[border-color:var(--jx-fill)]');
    expect(btn.className).toContain('text-[color:var(--jx-fill-ink)]');
    expect(btn.getAttribute('data-jx-press-button')).toBe('fill');
  });

  it('tonal paints the 12%/45% color-mix pair with the hue itself as ink', () => {
    const { container } = render(PressButtonHost, { props: { variant: 'tonal' } });
    const btn = container.querySelector('button')!;
    expect(btn.className).toContain('bg-[color-mix(in_oklab,var(--jx-tonal)_12%,transparent)]');
    expect(btn.className).toContain('border-[color-mix(in_oklab,var(--jx-tonal)_45%,transparent)]');
    expect(btn.className).toContain('text-[color:var(--jx-tonal)]');
    expect(btn.getAttribute('data-jx-press-button')).toBe('tonal');
  });
});

/* ── THE RAISED PHYSICS AXIS (Owner 2026-09-03): flat = raised={false} —
      no rest/hover shadow, the press pose re-points to the engrave tier
      (an inset — pushed INTO the plane), and the press vector is nulled
      through the kernel's --jx-press-move seam. Paint stays untouched. ── */
describe('press-button raised axis — the flat texture', () => {
  it('the default (raised) carries NO pose customs — every existing button is byte-identical', () => {
    const { container } = render(PressButtonHost);
    const btn = container.querySelector('button')!;
    expect(btn.className).not.toContain('--jx-press-shadow');
    expect(btn.className).not.toContain('--jx-press-move');
  });

  it('flat supplies all four seams: none / none / engrave / no move', () => {
    const { container } = render(PressButtonHost, { props: { variant: 'outline', raised: false } });
    const btn = container.querySelector('button')!;
    expect(btn.className).toContain('[--jx-press-shadow:none]');
    expect(btn.className).toContain('[--jx-press-shadow-hover:none]');
    expect(btn.className).toContain('[--jx-press-shadow-active:var(--shadow-engrave)]');
    expect(btn.className).toContain('[--jx-press-move:none]');
    // the paint rung rides unchanged
    expect(btn.className).toContain('[border-color:var(--jx-outline)]');
    expect(btn.className).toContain('jx-press border');
  });

  it('ghost+flat strips the rung\'s own pose trio first — no same-property collision', () => {
    const { container } = render(PressButtonHost, { props: { variant: 'ghost', raised: false } });
    const btn = container.querySelector('button')!;
    // ghost's none-trio is REPLACED by the flat block, not doubled
    expect(btn.className.match(/\[--jx-press-shadow-active:[^\]]*\]/g)).toEqual([
      '[--jx-press-shadow-active:var(--shadow-engrave)]',
    ]);
    expect(btn.className.match(/\[--jx-press-shadow:[^\]]*\]/g)).toEqual(['[--jx-press-shadow:none]']);
    // the strip takes ghost's block away wholesale — hover pose appears once
    expect(btn.className.match(/\[--jx-press-shadow-hover:[^\]]*\]/g)).toEqual([
      '[--jx-press-shadow-hover:none]',
    ]);
  });

  it('link carries no jx-press — raised is inert there', () => {
    const { container } = render(PressButtonHost, { props: { variant: 'link', raised: false } });
    const btn = container.querySelector('button')!;
    expect(btn.className).not.toContain('jx-press');
    expect(btn.className).not.toContain('--jx-press-move');
  });

  it('the kernel seam law: the active translate rides --jx-press-move with the 1px 1px fallback', () => {
    // source-law gate (jsdom has no cascade): the flat texture's
    // no-movement contract hangs entirely on this seam — a regression
    // to a literal translate: 1px 1px would silently move every flat
    // button again
    const css = readFileSync(resolve('src/lib/jixoai.css'), 'utf8');
    expect(css).toMatch(/\.jx-press:active\s*\{[^}]*translate:\s*var\(--jx-press-move,\s*1px\s+1px\)/s);
    expect(css).not.toMatch(/\.jx-press:active\s*\{[^}]*translate:\s*1px\s+1px\s*;/s);
  });
});

// ---------------------------------------------------------------------------
// Effect loops — typed builders, one opt-in loop per button
// ---------------------------------------------------------------------------
describe('press-button effects', () => {
  it('the builders return discriminated descriptors', () => {
    expect(shimmer()).toEqual({ type: 'shimmer', color: 'currentColor', spread: '90deg', cut: '0.06em', speed: 3000 });
    expect(shimmer({ speed: 4000, color: '#fff' }).speed).toBe(4000);
    // the sonar ring defaults to the brand hue: currentColor would paint
    // white-on-white (invisible) on light primary buttons
    expect(pulse().color).toBe('var(--primary)');
    expect(pulse({ variant: 'ring' }).variant).toBe('ring');
    expect(rainbow().colors).toHaveLength(5);
    expect(ripple({ duration: 300 }).duration).toBe(300);
  });

  it('shimmer / pulse / rainbow tag the host and mount their layers', () => {
    const shimmered = render(PressButtonHost, { props: { effect: shimmer() } });
    const shimmerHost = shimmered.container.querySelector('button[data-jx-shimmer-host]')!;
    // Svelte re-serializes the style attribute ("--var: value; …")
    expect(shimmerHost.getAttribute('style')).toContain('--shimmer-speed: 3000ms');
    expect(shimmerHost.querySelector('.jx-shimmer-spark')).toBeTruthy();
    expect(shimmerHost.querySelector('.jx-shimmer-cover')).toBeTruthy();
    shimmered.unmount();

    const pulsed = render(PressButtonHost, { props: { effect: pulse({ variant: 'ring', duration: 900 }) } });
    const pulseHost = pulsed.container.querySelector('button[data-jx-pulse-host]')!;
    expect(pulseHost.getAttribute('style')).toContain('--pulse-duration: 900ms');
    expect(pulseHost.querySelector('.jx-pulse-layer.jx-pulse-ring')).toBeTruthy();
    pulsed.unmount();

    const rainbowed = render(PressButtonHost, { props: { effect: rainbow({ speed: 4000 }) } });
    const rainbowHost = rainbowed.container.querySelector('button.jx-rainbow-host')!;
    // prime timelines scale with the pace: 4000ms → x 6s · y 10s ·
    // layers 14s / 22s / 26s / 34s
    expect(rainbowHost.getAttribute('style')).toContain('--rainbow-tx: 6000ms');
    expect(rainbowHost.getAttribute('style')).toContain('--rainbow-ty: 10000ms');
    expect(rainbowHost.getAttribute('style')).toContain('--rainbow-t1: 14000ms');
    expect(rainbowHost.getAttribute('style')).toContain('--rainbow-t4: 34000ms');
    expect(rainbowHost.getAttribute('style')).toContain('--c1: hsl(0 100% 63%)');
    rainbowed.unmount();
  });

  it('ripple: a click spawns ink at the point; keyboard clicks center; ink clears after the duration', async () => {
    const { container } = render(PressButtonHost, {
      props: { effect: ripple({ duration: 20 }) },
    });
    const btn = container.querySelector('button')!;
    const layer = container.querySelector('.jx-ripple-layer')!;

    // pointer click (detail > 0): jsdom's zero rect passes clientX/Y through.
    // delegated clicks flush their DOM effects on a microtask — tick first.
    fireEvent.click(btn, { clientX: 30, clientY: 40, detail: 1 });
    await tick();
    let dot = layer.querySelector('.jx-ripple-dot') as HTMLElement;
    expect(dot.style.left).toBe('30px');
    expect(dot.style.top).toBe('40px');
    expect(dot.getAttribute('style')).toContain('--ripple-color: currentColor');

    // ink clears once the duration elapses
    await waitFor(() => expect(layer.querySelectorAll('.jx-ripple-dot')).toHaveLength(0));

    // keyboard click (detail 0): centered on the (zero) rect
    fireEvent.click(btn, { detail: 0 });
    await tick();
    dot = layer.querySelector('.jx-ripple-dot') as HTMLElement;
    expect(dot.style.left).toBe('0px');
    expect(dot.style.top).toBe('0px');
  });

  it('ripple ink is WAAPI-driven: the dot animates by script with the builder duration', async () => {
    const durations: (number | 'auto')[] = [];
    const nativeAnimate = Element.prototype.animate;
    Element.prototype.animate = function (
      this: Element,
      keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
      options?: number | KeyframeAnimationOptions
    ) {
      durations.push(typeof options === 'number' ? options : (options?.duration ?? 'auto'));
      return nativeAnimate.call(this, keyframes, options);
    };
    let container: HTMLElement;
    try {
      ({ container } = render(PressButtonHost, {
        props: { effect: ripple({ duration: 350, shape: 'bevel' }) },
      }));
      const btn = container.querySelector('button')!;
      fireEvent.click(btn, { clientX: 8, clientY: 8, detail: 1 });
      await tick();
      expect(durations).toEqual([350]);
      // the expansion keyframes: scale 0→2 with opacity fading out
      expect(container.querySelector('.jx-ripple-dot')).toBeTruthy();
    } finally {
      Element.prototype.animate = nativeAnimate;
    }
    // ink clears on finished (the setup polyfill resolves after the duration)
    await waitFor(() =>
      expect(container.querySelectorAll('.jx-ripple-dot')).toHaveLength(0)
    );
  });

  it('ripple shape: round is the pinned default; bevel rides the flat fallback where corner-shape is unsupported', async () => {
    // round — data-shape carries the choice, no fallback class
    const round = render(PressButtonHost, { props: { effect: ripple() } });
    fireEvent.click(round.container.querySelector('button')!, { clientX: 3, clientY: 3, detail: 1 });
    await tick();
    let dot = round.container.querySelector('.jx-ripple-dot') as HTMLElement;
    expect(dot.dataset.shape).toBe('round');
    expect(dot.className).not.toContain('jx-ripple-flat');
    round.unmount();

    // bevel — jsdom knows no corner-shape, so the diamond arrives as the
    // 45° flat square; a corner-shape browser keeps the bevel cut instead
    const bevel = render(PressButtonHost, { props: { effect: ripple({ shape: 'bevel' }) } });
    fireEvent.click(bevel.container.querySelector('button')!, { clientX: 3, clientY: 3, detail: 1 });
    await tick();
    dot = bevel.container.querySelector('.jx-ripple-dot') as HTMLElement;
    expect(dot.dataset.shape).toBe('bevel');
    expect(dot.className).toContain('jx-ripple-flat');
  });

  it('effects never paint the host inline — only --custom properties', () => {
    // the r1/r2 bug class (pulse white-on-white ring, rainbow hijacking
    // the fill) was born exactly here: an effect painting the host.
    // Lock the source: effect inline styles may carry ONLY custom
    // properties — backgrounds, colors, and borders belong to variants.
    // (ripple feeds its options to the ink dots, so its HOST carries
    // no inline style at all.)
    for (const fx of [shimmer(), pulse(), rainbow()]) {
      const { container } = render(PressButtonHost, { props: { effect: fx } });
      const style = container.querySelector('button')!.getAttribute('style') ?? '';
      const decls = style
        .split(';')
        .map((d) => d.trim())
        .filter(Boolean);
      expect(decls.length, `${fx.type} should carry its options`).toBeGreaterThan(0);
      for (const d of decls) {
        expect(d.startsWith('--'), `${fx.type} paints the host inline: ${d}`).toBe(true);
      }
    }
    const rippled = render(PressButtonHost, { props: { effect: ripple() } });
    expect(rippled.container.querySelector('button')!.getAttribute('style')).toBeNull();
  });

  it('non-ripple buttons keep the click contract untouched (no ink layers)', () => {
    const { container } = render(PressButtonHost);
    const btn = container.querySelector('button')!;
    expect(btn.querySelector('.jx-ripple-layer')).toBeNull();
    fireEvent.click(btn, { clientX: 10, clientY: 10 });
    expect(btn.querySelector('.jx-ripple-dot')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Button or anchor duality
// ---------------------------------------------------------------------------
describe('press-button anchor mode', () => {
  it('href renders an anchor carrying the same variant + effect classes', () => {
    const { container } = render(PressButtonHost, {
      props: { variant: 'outline', effect: shimmer(), href: 'https://github.com/jixoai/ui' },
    });
    const anchor = container.querySelector('a')!;
    expect(anchor).toBeTruthy();
    expect(anchor.className).toContain('jx-press');
    expect(anchor.hasAttribute('data-jx-shimmer-host')).toBe(true);
    // external hrefs open a new tab with noreferrer
    expect(anchor.getAttribute('target')).toBe('_blank');
    expect(anchor.getAttribute('rel')).toBe('noreferrer');
  });

  it('internal hrefs navigate in place', () => {
    const { container } = render(PressButtonHost, { props: { href: '/docs.html' } });
    const anchor = container.querySelector('a')!;
    expect(anchor.getAttribute('target')).toBeNull();
    expect(anchor.getAttribute('rel')).toBeNull();
  });

  it('renders a submit-typed button when asked', () => {
    const { container } = render(PressButtonHost, { props: { type: 'submit' } });
    const btn = container.querySelector('button')!;
    expect(btn.getAttribute('type')).toBe('submit');
  });

  it('popovertarget wires the native invoker on the button posture (r13: group overflow trigger path)', () => {
    const { container } = render(PressButtonHost, { props: { popovertarget: 'jx-menu-x' } });
    const btn = container.querySelector('button')!;
    expect(btn.getAttribute('popovertarget')).toBe('jx-menu-x');
  });
});
