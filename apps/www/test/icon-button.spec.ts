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
    expect(btn.className).toContain('size-10.5'); // the 42px press-button band
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

  it('inherits the paint variants verbatim (primary bg + the press law)', () => {
    const { container } = render(IconButtonHost, { props: { variant: 'primary' } });
    const btn = container.querySelector('button')!;
    expect(btn.className).toContain('bg-primary');
    expect(btn.className).toContain('jx-press');
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
});
