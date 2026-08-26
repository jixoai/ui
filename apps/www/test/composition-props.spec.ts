/**
 * Props-discipline passthrough lock (props-discipline sweep, 2026-08-25).
 *
 * The standing contract (component-authoring spec, props discipline +
 * design.md family context contract clause 6): every part's root element
 * accepts the standing HTMLAttributes — `class` merges through cn(),
 * `...rest` flows through verbatim so id, data-*, aria-* land on the DOM.
 *
 * Five representative parts, one per redesigned family shape:
 *   steps-item          — plain part (li) whose id rides ...rest
 *   breadcrumb-link     — child({ props }) escape part (anchor)
 *   toggle-group-item   — context-reading label>input part
 *   alert-dialog-title  — derived-id part (id authored by the family)
 *   command-item        — the declared exception: id is load-bearing
 *                         $props.id(); authored id is ordered AFTER the
 *                         spread so a consumer id can never clobber it
 */
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import CompositionPropsHost from './fixtures/composition-props-host.svelte';

describe('props discipline — consumer attributes flow to the part root', () => {
  it('steps-item: id/data-*/class land on the li (id rides ...rest)', () => {
    const { container } = render(CompositionPropsHost);
    const li = container.querySelector('[data-testid="steps-item-probe"]') as HTMLElement;
    expect(li.tagName).toBe('LI');
    expect(li.id).toBe('probe-steps-item');
    expect(li.dataset.probeKind).toBe('steps');
    // class merges through cn(): the part's own utilities survive beside
    // the consumer's
    expect(li.className).toContain('probe-extra');
    expect(li.className).toContain('relative');
  });

  it('breadcrumb-link: id/data-*/class land on the anchor', () => {
    const { container } = render(CompositionPropsHost);
    const a = container.querySelector('[data-testid="breadcrumb-link-probe"]') as HTMLAnchorElement;
    expect(a.tagName).toBe('A');
    expect(a.id).toBe('probe-breadcrumb-link');
    expect(a.getAttribute('href')).toBe('/probe');
    expect(a.dataset.probeKind).toBe('breadcrumb');
    expect(a.className).toContain('probe-extra');
    expect(a.className).toContain('text-muted-foreground');
  });

  it('toggle-group-item: id/data-* land on the input, class on the label root', () => {
    const { container } = render(CompositionPropsHost);
    const input = container.querySelector('[data-testid="toggle-item-probe"]') as HTMLInputElement;
    expect(input.tagName).toBe('INPUT'); // rest lands on the real form control
    expect(input.id).toBe('probe-toggle-item');
    expect(input.dataset.probeKind).toBe('toggle');
    const label = input.closest('label')!;
    expect(label.className).toContain('probe-extra'); // class merges into the part root
    // the family paint rides the shared Part A class on the group
    expect(container.querySelector('[data-jx-tgroup]')!.className).toContain('jx-tgroup');
  });

  it('alert-dialog-title: data-*/class land; the derived id stays the family wire', () => {
    const { container } = render(CompositionPropsHost);
    const h2 = container.querySelector('[data-testid="adlg-title-probe"]') as HTMLHeadingElement;
    expect(h2.tagName).toBe('H2');
    expect(h2.dataset.probeKind).toBe('alert-dialog');
    expect(h2.className).toContain('probe-extra');
    expect(h2.className).toContain('font-nav');
    // the derived id (what Content's aria-labelledby points at) keeps
    // its family shape — consumer attributes never break the wire
    expect(h2.id).toMatch(/-title$/);
  });

  it('command-item: data-*/class land; the load-bearing id cannot be clobbered', () => {
    const { container } = render(CompositionPropsHost);
    const item = container.querySelector('[data-testid="command-item-probe"]') as HTMLElement;
    expect(item.tagName).toBe('DIV');
    expect(item.dataset.probeKind).toBe('command');
    expect(item.className).toContain('probe-extra');
    // the declared exception: authored id is ordered after {...rest}, so
    // a consumer id never replaces the walk/activedescendant target
    expect(item.id).not.toBe('consumer-clobber-attempt');
    expect(item.id).not.toBe('');
    expect(item.getAttribute('role')).toBe('option');
  });
});
