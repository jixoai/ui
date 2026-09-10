/**
 * Press-button contract suite (test/press-button.spec.ts, 2026-08-23).
 *
 * Covers the press law surface contract (variant paint classes + the
 * shared .jx-press law class), the opt-in effect loops (effect-
 * attachments, r4→r5 2026-09-10: the component is a PLAIN host — the
 * builders stay typed exports of the module script, the component-tag
 * <PressButton {@attach pressEffect(…)}> rides the rest lane onto the
 * stamped root and mounts the same host classes / effect layers /
 * ripple ink machinery from press-effect-runtime; r5: shimmer/rainbow
 * are ring-masked — the host's background is never painted — and the
 * ripple ink is css-animated with an animationend settle), and the
 * button/anchor duality. Rendered from the same-source copy the site
 * consumes ($lib/ui); the ripple runs its real gesture surface
 * (pointerdown + Enter/Space keydown) against jsdom (no layout:
 * getBoundingClientRect is all zeros, so coordinates pass through
 * verbatim and the dot size
 * follows max(w,h) = 0).
 *
 * Assertion law: state is read back through the DOM the way a user or
 * assistive tech sees it (roles, attributes, classes) — never through
 * component internals.
 */
import { fireEvent, render, waitFor } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import ZoneHost from './fixtures/press-zone-host.svelte';
import { tick } from 'svelte';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import PressButtonHost from './fixtures/press-button-host.svelte';
import { pressEffect } from '../src/lib/ui/press-button/press-effect-runtime';
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

  it('the engrave duet law: the tier paints BOTH inner walls from the shade/glow ink tokens, and the flat corner tint mixes from the same pair', () => {
    // source-law gate (Owner ruling 2026-09-04): a single-sided inset
    // reads as a smudge — the duet reads as carved; the corner tint
    // must share the inks so the pressed edge stays one light model
    const css = readFileSync(resolve('src/lib/jixoai.css'), 'utf8');
    // the print-kernel scope carries a self-referential passthrough —
    // the duet law binds the DEFINITIONS, not the mapping
    const engraves = (css.match(/--shadow-engrave:[^;]+;/g) ?? []).filter(
      (e) => !e.includes('var(--shadow-engrave)'),
    );
    expect(engraves.length).toBe(2); // light + dark
    for (const e of engraves) {
      expect(e).toContain('inset 1px 1px 0px 0px var(--jx-engrave-shade)');
      expect(e).toContain('inset -1px -1px 0px 0px var(--jx-engrave-glow)');
    }
    // the corner tint ring: keyed on the flat stamp's :active, mixes
    // from the same tokens, masked to the border ring only
    expect(css).toMatch(
      /\.jx-press\[data-jx-press-flat\]:active::before\s*\{[^}]*color-mix\(in oklab,\s*var\(--jx-engrave-shade\)/s,
    );
    expect(css).toMatch(/\.jx-press\[data-jx-press-flat\]:active::before\s*\{[^}]*var\(--jx-engrave-glow\)/s);
    expect(css).toMatch(/\.jx-press\[data-jx-press-flat\]:active::before\s*\{[^}]*mask-composite:\s*exclude/s);
  });

  it('the flat STAMP: present on flat, absent on raised and link — the kernel tint keys on it', () => {
    const flat = render(PressButtonHost, { props: { variant: 'outline', raised: false } });
    expect(flat.container.querySelector('button')!.hasAttribute('data-jx-press-flat')).toBe(true);
    const raised = render(PressButtonHost, { props: { variant: 'outline' } });
    expect(raised.container.querySelector('button')!.hasAttribute('data-jx-press-flat')).toBe(false);
    const link = render(PressButtonHost, { props: { variant: 'link', raised: false } });
    expect(link.container.querySelector('button')!.hasAttribute('data-jx-press-flat')).toBe(false);
  });
});

/* ── THE ZONE TEXTURE (Owner 2026-09-04): a ButtonVariantScope may scope
      the raised DEFAULT to false — the card/dialog foot law. Resolution:
      explicit ?? zone ?? true; the texture rides its OWN context key.
      The joined ButtonGroup is a zone WRITER on that key now (the
      cluster-shadow law, Owner 2026-09-04): its subtree rides FLAT by
      default while the group root carries the one convex shadow. ── */
describe('press-button zone texture — the foot-flat context', () => {
  it('a raised={false} zone adopts the flat pose for a bare button with no explicit prop', () => {
    const { container } = render(ZoneHost, { props: { zoneRaised: false } });
    const btn = container.querySelector('button')!;
    expect(btn.className).toContain('[--jx-press-shadow:none]');
    expect(btn.className).toContain('[--jx-press-shadow-active:var(--shadow-engrave)]');
    expect(btn.className).toContain('[--jx-press-move:none]');
  });

  it('an explicit raised=true wins inside a flat zone — explicit ?? zone ?? true', () => {
    const { container } = render(ZoneHost, { props: { zoneRaised: false, raised: true } });
    const btn = container.querySelector('button')!;
    // the zone resolves ghost (its paint scope) — ghost's own none-trio
    // may ride, but NONE of the flat block's seams do: no nulled vector,
    // no engrave inset
    expect(btn.className).not.toContain('--jx-press-move');
    expect(btn.className).not.toContain('engrave');
  });

  it('a group inside a flat zone keeps the flat texture — the group WRITES it itself now (the cluster-shadow law)', () => {
    const { container } = render(ZoneHost, { props: { zoneRaised: false, grouped: true } });
    const btn = container.querySelector('button')!;
    expect(btn.className).toContain('[--jx-press-move:none]');
    // the group's PAINT policy still applied alongside (ghost via the scope)
    expect(btn.getAttribute('data-jx-press-button')).toBe('ghost');
  });

  it('a BARE group flattens its joined buttons by default — the context write, no zone needed', () => {
    const { container } = render(ZoneHost, { props: { bareGrouped: true } });
    const btn = container.querySelector('button')!;
    expect(btn.className).toContain('[--jx-press-shadow:none]');
    expect(btn.className).toContain('[--jx-press-move:none]');
    // no variant anywhere: the own outline rung rides on top of the flat pose
    expect(btn.getAttribute('data-jx-press-button')).toBe('outline');
  });

  it('an explicit raised=true stays convex inside a bare group — the escape hatch', () => {
    const { container } = render(ZoneHost, { props: { bareGrouped: true, raised: true } });
    const btn = container.querySelector('button')!;
    expect(btn.className).not.toContain('--jx-press-move');
    expect(btn.className).not.toContain('engrave');
  });

  it('a paint-only nested scope never un-flattens the zone (inherit-then-provide)', () => {
    const { container } = render(ZoneHost, { props: { zoneRaised: false, nested: true } });
    const btn = container.querySelector('button')!;
    // the inner scope narrowed PAINT to outline but inherited the flat physics
    expect(btn.className).toContain('[--jx-press-move:none]');
    expect(btn.getAttribute('data-jx-press-button')).toBe('outline');
  });

  it('a zone that declares no raised leaves the convex default — the scope alone changes nothing', () => {
    const { container } = render(ZoneHost);
    const btn = container.querySelector('button')!;
    expect(btn.className).not.toContain('--jx-press-move');
    expect(btn.className).not.toContain('engrave');
  });

  it('link stays inert inside a flat zone', () => {
    const { container } = render(ZoneHost, { props: { zoneRaised: false, variant: 'link' } });
    const btn = container.querySelector('button')!;
    expect(btn.className).not.toContain('jx-press');
  });
});

describe('press-button theme scoping — the grammar slots', () => {
  it('the four hue slots re-substitute per theme scope (the canvas border bug, Owner 2026-09-04)', () => {
    // source-law gate (jsdom has no cascade): custom properties
    // substitute their var() at the DECLARING element — a :root-only
    // --jx-outline: var(--border) hands every descendant the root's
    // already-substituted value, so a scoped .dark/.jx-light (the
    // component-canvas stage, terminal-card, print) redefining
    // --border never flipped the button border with it: it followed
    // the GLOBAL site theme instead. The selector list must
    // re-declare the slots ON each theme scope, so the substitution
    // re-runs against the scope's own --primary/--border
    const css = readFileSync(resolve('src/lib/jixoai.css'), 'utf8');
    expect(css).toMatch(
      /:root,\s*\.jx-light,\s*\.dark\s*\{[^}]*--jx-fill:\s*var\(--primary\);[^}]*--jx-outline:\s*var\(--border\);/s,
    );
    // and no :root-ONLY re-declaration survives anywhere else
    const soloRootSlots = css.match(/:root\s*\{[^}]*--jx-outline[^}]*\}/g) ?? [];
    expect(soloRootSlots).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Effect loops — typed builders, one opt-in loop per button
// ---------------------------------------------------------------------------
describe('press-button effects', () => {
  it('the builders return discriminated descriptors', () => {
    expect(shimmer()).toEqual({ type: 'shimmer', color: 'currentColor', spread: '90deg', cut: '0.1em', speed: 3000 });
    expect(shimmer({ speed: 4000, color: '#fff' }).speed).toBe(4000);
    // the sonar ring defaults to the brand hue: currentColor would paint
    // white-on-white (invisible) on light primary buttons
    expect(pulse().color).toBe('var(--primary)');
    expect(pulse({ variant: 'ring' }).variant).toBe('ring');
    expect(rainbow().colors).toHaveLength(5);
    expect(ripple({ duration: 300 }).duration).toBe(300);
  });

  it("the 'root' stamp + the component-tag mount: the marker names the mount, the tag rides it (both directions)", () => {
    // marker → mount: data-jx-attach="root" exists exactly where the
    // component-tag attachment mounted (through the rest spread); mount
    // → marker: arming the tag stamps the SAME element the marker names
    const { container } = render(PressButtonHost, {
      props: { attach: pressEffect(shimmer()) },
    });
    const btn = container.querySelector('button')!;
    expect(btn.getAttribute('data-jx-attach')).toBe('root');
    // the attachment mounted on the marked element (the runtime's stamps)
    expect(btn.hasAttribute('data-jx-shimmer-host')).toBe(true);
    // the bare host carries the marker TOO — the hook is the public
    // contract, armed or not (the undefined arm skips, never unpaints)
    const plain = render(PressButtonHost);
    expect(plain.container.querySelector('button')!.getAttribute('data-jx-attach')).toBe('root');
    expect(plain.container.querySelector('button')!.hasAttribute('data-jx-shimmer-host')).toBe(false);
  });

  it('the REST LANE spreads onto BOTH roots: an extra prop lands verbatim on the button and the anchor', () => {
    // proves the rest spread exists (r4's forwarding mechanism — the
    // component-tag attachment rides this exact lane to the root)
    const { container } = render(PressButtonHost, { props: { dataX: 'probe' } });
    expect(container.querySelector('button')!.getAttribute('data-x')).toBe('probe');
    const anchor = render(PressButtonHost, { props: { dataX: 'probe', href: '/docs.html' } });
    expect(anchor.container.querySelector('a')!.getAttribute('data-x')).toBe('probe');
  });

  it('shimmer / pulse / rainbow tag the host and mount their layers (through the component tag)', () => {
    const shimmered = render(PressButtonHost, {
      props: { attach: pressEffect(shimmer()) },
    });
    const shimmerHost = shimmered.container.querySelector('button[data-jx-shimmer-host]')!;
    expect(shimmerHost.getAttribute('style')).toContain('--shimmer-speed: 3000ms');
    // the r8 ring walk: ONE mask-banded span; the host's own look rides
    expect(shimmerHost.querySelector(':scope > .jx-shimmer-ring')).toBeTruthy();
    expect(shimmerHost.querySelectorAll(':scope > span')).toHaveLength(1);
    expect(shimmerHost.className).not.toContain('overflow-hidden');
    shimmered.unmount();

    const pulsed = render(PressButtonHost, {
      props: { attach: pressEffect(pulse({ variant: 'ring', duration: 900 })) },
    });
    const pulseHost = pulsed.container.querySelector('button[data-jx-pulse-host]')!;
    expect(pulseHost.getAttribute('style')).toContain('--pulse-duration: 900ms');
    expect(pulseHost.querySelector('.jx-pulse-layer.jx-pulse-ring')).toBeTruthy();
    pulsed.unmount();

    const rainbowed = render(PressButtonHost, {
      props: { attach: pressEffect(rainbow({ speed: 4000 })) },
    });
    const rainbowHost = rainbowed.container.querySelector('button[data-jx-attach="root"]')!;
    // the r8 ring walk: the ring + glow spans carry the paint; the host
    // carries ONLY vars — no face, no border, no text channel
    expect(rainbowHost.getAttribute('style')).toContain('--rainbow-speed: 4000ms');
    expect(rainbowHost.getAttribute('style')).toContain('--c1: hsl(0 100% 63%)');
    expect(rainbowHost.getAttribute('style')).not.toContain('--jx-rainbow-face');
    expect(rainbowHost.getAttribute('style')).not.toContain('background-clip');
    expect(rainbowHost.getAttribute('style')).not.toContain('border:');
    expect(rainbowHost.querySelector(':scope > .jx-rainbow-ring')).toBeTruthy();
    expect(rainbowHost.querySelector(':scope > .jx-rainbow-glow')).toBeTruthy();
    rainbowed.unmount();
  });

  it('ripple: pointerdown spawns svg ink at the offset point; Enter keydown centers; ink clears after the duration', async () => {
    const { container } = render(PressButtonHost, {
      props: { attach: pressEffect(ripple({ duration: 20 })) },
    });
    const btn = container.querySelector('button')!;
    const layer = container.querySelector('.jx-ripple-layer')!;

    // the attachment's OWN gesture surface (effect-attachments §2b): the
    // ink fires on POINTERDOWN; THE TARGET LAW (r6): client coordinates
    // minus the SEAT's rect — whichever child caught the pointer, the
    // frame is the seat's own (jsdom computes no layout, so the seat's
    // rect is stubbed where the numbers matter)
    Object.defineProperty(layer, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ left: 100, top: 50, width: 300, height: 150, right: 400, bottom: 200, x: 100, y: 50, toJSON: () => ({}) }),
    });
    const down = new PointerEvent('pointerdown', { bubbles: true, clientX: 130, clientY: 90 });
    btn.dispatchEvent(down);
    let ink = layer.querySelector('.jx-ripple-ink') as SVGCircleElement;
    expect(ink.tagName).toBe('circle');
    expect(ink.getAttribute('cx')).toBe('30'); // 130 - seat.left(100)
    expect(ink.getAttribute('cy')).toBe('40'); // 90 - seat.top(50)
    // no top/left inline geometry on the ink — coordinates ARE attributes
    expect(ink.getAttribute('style')).toBeNull();
    expect(layer.getAttribute('style')).toContain('--ripple-color: currentColor');
    expect(layer.getAttribute('style')).toContain('--ripple-duration: 20ms');

    // ink clears when the css timeline settles (r5: the settle engine
    // rides animationend — jsdom runs no css animations, so the spec
    // dispatches the platform's event the way a real engine fires it)
    ink.dispatchEvent(new Event('animationend'));
    await waitFor(() => expect(layer.querySelectorAll('.jx-ripple-ink')).toHaveLength(0));

    // keyboard: Enter keydown spawns CENTERED ink (clientWidth/2 ×
    // clientHeight/2 — the padding-box center; zero box in jsdom)
    fireEvent.keyDown(btn, { key: 'Enter' });
    ink = layer.querySelector('.jx-ripple-ink') as SVGCircleElement;
    expect(ink.getAttribute('cx')).toBe('0');
    expect(ink.getAttribute('cy')).toBe('0');
  });

  it('ripple ink is CSS-driven: the layer carries the duration var; the settle source has ZERO animate() calls', async () => {
    // r5 (Owner ruling 「改成 svg-animation」): the timeline lives in the
    // law sheet — scale + opacity on one keyframe set at the layer's
    // --ripple-duration — and ripple.svelte.ts is the event-driven
    // settle engine alone (source-scanned: not one script-side
    // animation call survives)
    let container: HTMLElement;
    ({ container } = render(PressButtonHost, {
      props: { attach: pressEffect(ripple({ duration: 350, shape: 'bevel' })) },
    }));
    const btn = container.querySelector('button')!;
    fireEvent.pointerDown(btn, { clientX: 8, clientY: 8 });
    expect(
      container.querySelector('.jx-ripple-layer')!.getAttribute('style')
    ).toContain('--ripple-duration: 350ms');
    // the bevel ink is the path diamond; the expansion is scale 0→1
    // with opacity fading on the SAME progress (keyframes pinned in
    // effect-attachments.spec's css source-scan)
    expect(container.querySelector('.jx-ripple-ink')).toBeTruthy();
    const engine = readFileSync(
      resolve('src/lib/ui/press-button/ripple.svelte.ts'),
      'utf8',
    );
    expect(engine).not.toMatch(/\.animate\(/);
    // ink clears on the timeline's own settle event
    container.querySelector('.jx-ripple-ink')!.dispatchEvent(new Event('animationend'));
    await waitFor(() =>
      expect(container.querySelectorAll('.jx-ripple-ink')).toHaveLength(0)
    );
  });

  it('ripple shape: round is the pinned default circle; bevel draws the path diamond', () => {
    // round — data-shape carries the choice, a <circle>, no fallback class
    const round = render(PressButtonHost, { props: { attach: pressEffect(ripple()) } });
    fireEvent.pointerDown(round.container.querySelector('button')!, { clientX: 3, clientY: 3 });
    let ink = round.container.querySelector('.jx-ripple-ink')!;
    expect(ink.tagName).toBe('circle');
    expect(ink.dataset.shape).toBe('round');
    expect(ink.getAttribute('class')).not.toContain('jx-ripple-flat');
    round.unmount();

    // bevel — the shape law's 50% chamfer drawn as the diamond <path>;
    // jsdom knows no corner-shape, so the support marker rides the node
    const bevel = render(PressButtonHost, {
      props: { attach: pressEffect(ripple({ shape: 'bevel' })) },
    });
    fireEvent.pointerDown(bevel.container.querySelector('button')!, { clientX: 3, clientY: 3 });
    ink = bevel.container.querySelector('.jx-ripple-ink')!;
    expect(ink.tagName).toBe('path');
    expect(ink.dataset.shape).toBe('bevel');
    expect(ink.getAttribute('d')).toContain('L'); // the diamond's vertices
    expect(ink.getAttribute('class')).toContain('jx-ripple-flat');
  });

  it('the loading lock no longer suppresses ink — the self-listening price is documented', () => {
    // §2b's ruled behavior delta: the attachment cannot see the host's
    // loading state, so aria-disabled ink suppression is the mounting
    // consumer's job, not the plain mount's (the runtime checks
    // :disabled/[aria-disabled] per event — aria-disabled DOES gate it;
    // the documented delta is the SEAM: pointerdown, not click)
    const { container } = render(PressButtonHost, {
      props: { loading: true, attach: pressEffect(ripple({ duration: 20 })) },
    });
    const btn = container.querySelector('button')!;
    expect(btn.getAttribute('aria-disabled')).toBe('true');
    fireEvent.pointerDown(btn, { clientX: 1, clientY: 1 });
    expect(btn.querySelector('.jx-ripple-ink')).toBeNull(); // gated per event
  });

  it('no kernel ever paints the host inline — paint rides the class channel (the port law)', () => {
    // the r1/r2 bug class (pulse white-on-white ring, rainbow hijacking
    // the fill) was born exactly here: an effect painting the host. The
    // law that survives the r6 ports: INLINE the kernel writes ONLY
    // custom properties; the paints the ports DO own (shimmer's face,
    // rainbow's layered stack) ride the class + var channel — never a
    // declared property in the style attribute.
    // (ripple feeds its options to the svg layer, so its HOST carries
    // no inline style at all.)
    for (const fx of [shimmer(), pulse(), rainbow()]) {
      const { container } = render(PressButtonHost, {
        props: { attach: pressEffect(fx) },
      });
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
    const rainbowed = render(PressButtonHost, {
      props: { attach: pressEffect(rainbow()) },
    });
    expect(rainbowed.container.querySelector('.jx-rainbow-ring')).toBeTruthy();
    rainbowed.unmount();
    // unmount tears the whole stamp down with the host
    const rippled = render(PressButtonHost, { props: { attach: pressEffect(ripple()) } });
    expect(rippled.container.querySelector('button')!.getAttribute('style')).toBeNull();
  });

  it('plain buttons keep the click contract untouched (no ink layers, no stacking pose)', () => {
    const { container } = render(PressButtonHost);
    const btn = container.querySelector('button')!;
    expect(btn.querySelector('.jx-ripple-layer')).toBeNull();
    // the plain host carries NO stacking pose — the runtime stamps
    // relative z-0 itself (HOST_CLASSES), so an un-armed button keeps
    // its exact layout
    expect(btn.className).not.toContain('relative');
    expect(btn.className).not.toContain('z-0');
    fireEvent.click(btn, { clientX: 10, clientY: 10 });
    expect(btn.querySelector('.jx-ripple-ink')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Button or anchor duality
// ---------------------------------------------------------------------------
describe('press-button anchor mode', () => {
  it('href renders an anchor carrying the same variant + the root hook', () => {
    const { container } = render(PressButtonHost, {
      props: {
        variant: 'outline',
        attach: pressEffect(shimmer()),
        href: 'https://github.com/jixoai/ui',
      },
    });
    const anchor = container.querySelector('a')!;
    expect(anchor).toBeTruthy();
    expect(anchor.className).toContain('jx-press');
    expect(anchor.getAttribute('data-jx-attach')).toBe('root');
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
