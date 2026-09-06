/**
 * Icon component own-attribute contract (test/icon-own-attrs.spec.ts,
 * icon-component-pipeline E4-r1 fix 1, 2026-09-07).
 *
 * The component OWNS the svg root's decorative contract: aria-hidden,
 * data-jx-icon, viewBox, the nature-driven fill/stroke pair, the
 * square size and the stroke weight. The rest spread lands BEFORE the
 * owned attributes, so a caller CANNOT strip or override the contract
 * through rest props (the E4-r1 override bypass). State is read back
 * through the DOM only.
 */
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import Icon from '../src/lib/ui/icon/icon.svelte';

describe('Icon — the component owns the root contract', () => {
  it('renders the owned decorative attributes on the sync path', () => {
    const { container } = render(Icon, { name: 'check' });
    const svg = container.querySelector('svg[data-jx-icon]');
    expect(svg).not.toBeNull();
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(svg?.getAttribute('stroke')).toBe('currentColor');
    expect(svg?.getAttribute('fill')).toBe('none');
    expect(svg?.getAttribute('width')).toBe('16');
    expect(svg?.getAttribute('height')).toBe('16');
    expect(svg?.getAttribute('stroke-width')).toBe('2');
  });

  it('a rest-prop override of an owned attribute loses the race', () => {
    // the attack shape from the E4 review: strip the decorative
    // contract / repaint the nature through rest props
    const { container } = render(Icon, {
      name: 'check',
      // @ts-expect-error — deliberately hostile props, not in Props
      'aria-hidden': 'false',
      // @ts-expect-error — same lane
      stroke: 'red',
      // @ts-expect-error — same lane
      'stroke-width': '9',
    });
    const svg = container.querySelector('svg[data-jx-icon]');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(svg?.getAttribute('stroke')).toBe('currentColor');
    expect(svg?.getAttribute('stroke-width')).toBe('2');
  });

  it('rest props the component does not own pass through verbatim', () => {
    const { container } = render(Icon, {
      name: 'check',
      role: 'img',
      id: 'probe-icon',
    });
    const svg = container.querySelector('svg[data-jx-icon]');
    expect(svg?.getAttribute('role')).toBe('img');
    expect(svg?.getAttribute('id')).toBe('probe-icon');
  });

  it('size/strokeWidth props beat the resolved defaults', () => {
    const { container } = render(Icon, {
      name: 'check',
      size: 13,
      strokeWidth: 2.5,
    });
    const svg = container.querySelector('svg[data-jx-icon]');
    expect(svg?.getAttribute('width')).toBe('13');
    expect(svg?.getAttribute('height')).toBe('13');
    expect(svg?.getAttribute('stroke-width')).toBe('2.5');
  });
});
