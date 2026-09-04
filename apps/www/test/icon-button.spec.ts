/**
 * icon-button composition contract (2026-08-25, Owner ruling: the
 * button IS a press-button — composition, not a copy). Locks:
 *   - the two-part contract: icon always decorative (aria-hidden wrap),
 *     text single-sourced — visible in the text posture, aria-label +
 *     tooltip in iconOnly
 *   - full press-button inheritance: paint variant, effect host attrs,
 *     href/external anchoring, class passthrough, the square 42px band
 */
import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import IconButtonHost from './fixtures/icon-button-host.svelte';
import IconZoneHost from './fixtures/icon-zone-host.svelte';
import { shimmer } from '../src/lib/ui/press-button/press-button.svelte';

describe('IconButton', () => {
  it('text posture: label renders beside the decorative glyph', () => {
    const { container } = render(IconButtonHost);
    const btn = container.querySelector('button')!;
    expect(btn.textContent).toContain('deploy');
    expect(btn.querySelector('[aria-hidden="true"]')?.querySelector('svg')).toBeTruthy();
    expect(btn.hasAttribute('aria-label')).toBe(false); // visible label wins
    expect(container.querySelector('[role="tooltip"]')).toBeNull(); // no tip needed
  });

  it('iconOnly: text becomes aria-label AND the tooltip; square band', async () => {
    const { container } = render(IconButtonHost, {
      props: { text: 'copy command', iconOnly: true, placement: 'bottom' },
    });
    await tick();
    const btn = container.querySelector('button')!;
    expect(btn.getAttribute('aria-label')).toBe('copy command');
    expect(btn.className).toContain('min-h-[var(--jx-hit)]'); // the 42px press-button band
    expect(btn.textContent).not.toContain('copy command'); // label never doubles
    const tip = container.querySelector('[role="tooltip"]')!;
    expect(tip.textContent).toContain('copy command');
    expect(tip.getAttribute('popover')).toBe('manual');
    // the aimed pointer notch is ON by default (arrow opt-out)
    expect(tip.hasAttribute('data-arrow')).toBe(true);
    expect(tip.hasAttribute('data-border-ring')).toBe(true);
  });

  it('arrow={false} opts the tip back to a plain bubble', async () => {
    const { container } = render(IconButtonHost, {
      props: { text: 'copy command', iconOnly: true, arrow: false },
    });
    await tick();
    const tip = container.querySelector('[role="tooltip"]')!;
    expect(tip.hasAttribute('data-arrow')).toBe(false);
  });

  it('inherits the paint variants verbatim (fill token paint + the press law)', () => {
    const { container } = render(IconButtonHost, { props: { variant: 'fill' } });
    const btn = container.querySelector('button')!;
    expect(btn.className).toContain('[background:var(--jx-fill)]');
    expect(btn.className).toContain('jx-press');
    // the variant rides the valued hook through the composition
    expect(btn.getAttribute('data-jx-press-button')).toBe('fill');
  });

  it('inherits the effect loops (shimmer host attr + spark layer)', async () => {
    const { container } = render(IconButtonHost, {
      props: { iconOnly: true, effect: shimmer({ speed: 4000 }) },
    });
    await tick();
    const btn = container.querySelector('button')!;
    expect(btn.hasAttribute('data-jx-shimmer-host')).toBe(true);
    expect(btn.querySelector('.jx-shimmer-spark')).toBeTruthy();
  });

  it('href renders an anchor; external hrefs gain target/rel, internal do not', () => {
    const external = render(IconButtonHost, {
      props: { text: 'open github', iconOnly: true, href: 'https://github.com/jixoai/ui' },
    });
    const a = external.container.querySelector('a')!;
    expect(a.target).toBe('_blank');
    expect(a.rel).toBe('noreferrer');

    const internal = render(IconButtonHost, {
      props: { text: 'home', iconOnly: true, href: '/' },
    });
    const i = internal.container.querySelector('a')!;
    expect(i.target).toBe('');
  });

  it('class passes through to the press-button root', () => {
    const { container } = render(IconButtonHost, { props: { class: 'extra-class' } });
    expect(container.querySelector('button')!.className).toContain('extra-class');
  });

  it('popovertarget forwards verbatim (the overflow-trigger path)', async () => {
    const { container } = render(IconButtonHost, {
      props: { text: 'more actions', iconOnly: true, popovertarget: 'jx-menu-y' },
    });
    await tick();
    expect(container.querySelector('button')!.getAttribute('popovertarget')).toBe('jx-menu-y');
  });
});

describe('icon-button physics axis — the foot-flat context through the composition', () => {
  // the axis is FORWARDED, not restated: the child press-button reads
  // the same ambient texture key, so the zone lane reaches the square
  // by construction and the prop is the explicit lane
  // (explicit ?? zone ?? true, Owner 2026-09-04)
  it('default: convex — no flat stamp, no flat seams', () => {
    const { container } = render(IconButtonHost);
    const btn = container.querySelector('button')!;
    expect(btn.hasAttribute('data-jx-press-flat')).toBe(false);
    expect(btn.className).not.toContain('--jx-press-move:none');
    expect(btn.className).not.toContain('--jx-press-shadow-active:var(--shadow-engrave)');
  });

  it('raised={false}: the flat pose rides through the composition (stamp + four seams)', () => {
    const { container } = render(IconButtonHost, { props: { raised: false } });
    const btn = container.querySelector('button')!;
    expect(btn.hasAttribute('data-jx-press-flat')).toBe(true);
    expect(btn.className).toContain('[--jx-press-shadow:none]');
    expect(btn.className).toContain('[--jx-press-shadow-hover:none]');
    expect(btn.className).toContain('[--jx-press-shadow-active:var(--shadow-engrave)]');
    expect(btn.className).toContain('[--jx-press-move:none]');
  });

  it('the iconOnly square rides the same axis (flat stamp on the square band)', () => {
    const { container } = render(IconButtonHost, { props: { iconOnly: true, raised: false } });
    expect(container.querySelector('button')!.hasAttribute('data-jx-press-flat')).toBe(true);
  });

  it('a raised={false} zone adopts the flat pose for a bare icon-button with no explicit prop', () => {
    const { container } = render(IconZoneHost, { props: { zoneRaised: false } });
    const btn = container.querySelector('button')!;
    expect(btn.hasAttribute('data-jx-press-flat')).toBe(true);
    expect(btn.className).toContain('[--jx-press-move:none]');
  });

  it('an explicit raised={true} wins inside a flat zone — chrome stays convex', () => {
    const { container } = render(IconZoneHost, { props: { zoneRaised: false, raised: true } });
    expect(container.querySelector('button')!.hasAttribute('data-jx-press-flat')).toBe(false);
  });

  it('physics flows THROUGH a joined ButtonGroup (the ⋯ overflow-trigger path)', () => {
    const { container } = render(IconZoneHost, { props: { zoneRaised: false, grouped: true } });
    expect(container.querySelector('button')!.hasAttribute('data-jx-press-flat')).toBe(true);
  });

  it('the square joined in a group also rides flat (the real overflow shape)', () => {
    const { container } = render(IconZoneHost, {
      props: { zoneRaised: false, grouped: true, iconOnly: true },
    });
    expect(container.querySelector('button')!.hasAttribute('data-jx-press-flat')).toBe(true);
  });
});
