/**
 * input-group.spec.ts — the joined field shell (OpenSpec
 * 2026-08-30-expand-form-family F2).
 *
 * Contracts under test:
 *  - the group landmark: role=group + the accessible name (label →
 *    aria-label; an explicit rest aria-label wins; aria-labelledby
 *    flows through the rest props untouched);
 *  - the ONE disabled propagation rule: root disable ⇒ the lane
 *    renders native `disabled` AND every addon renders `inert` (the
 *    platform's containment — descendant controls lose activation and
 *    focus at once); per-part disables stay per-part (a disabled lane
 *    never inerts its addons, a group-disabled input is forced);
 *  - the seam structure: each addon stamps the valued
 *    data-jx-igroup-addon hook and the sheet paints exactly ONE
 *    hairline per addon, on the edge facing the lane; the shell keeps
 *    the input family's :has() state machines (hover lift, inset
 *    focus ring, invalid dash, disabled paint);
 *  - the house value law on InputGroupInput: bound ⇒ controlled
 *    (typing commits through the binding), absent ⇒ uncontrolled,
 *    caller oninput observes alongside the internal law.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { render, fireEvent } from '@testing-library/svelte';
import InputGroupInput from '$lib/ui/input-group/input-group-input.svelte';
import Host from './fixtures/input-group-host.svelte';
import InputHost from './fixtures/input-group-input-host.svelte';
import AriaHost from './fixtures/input-group-aria-host.svelte';

// the css law is read from the mirror (same-source: byte-identical to
// registry/files/ui/input-group/input-group.css); vitest stubs css
// imports, so the raw text comes off disk
const inputGroupCss = readFileSync(
  resolve(process.cwd(), 'src/lib/ui/input-group/input-group.css'),
  'utf8',
);

const isInert = (el: Element | null): boolean =>
  el !== null && ((el as HTMLElement).inert === true || el.hasAttribute('inert'));

describe('InputGroup · the group landmark', () => {
  it('renders role=group named by label (aria-label)', () => {
    const { container } = render(AriaHost);
    const root = container.querySelector('[data-testid="named-group"]');
    expect(root?.getAttribute('role')).toBe('group');
    expect(root?.getAttribute('data-jx-igroup')).not.toBeNull();
    expect(root?.getAttribute('aria-label')).toBe('repository url');
  });

  it('an explicit rest aria-label wins over the label shorthand', () => {
    const { container } = render(AriaHost);
    expect(container.querySelector('[data-testid="explicit-group"]')?.getAttribute('aria-label')).toBe(
      'explicit',
    );
  });

  it('aria-labelledby flows through the rest props (external label owns the name)', () => {
    const { container } = render(AriaHost);
    const root = container.querySelector('[data-testid="labelledby-group"]');
    expect(root?.getAttribute('aria-labelledby')).toBe('ext-label');
    expect(root?.getAttribute('aria-label')).toBeNull();
  });
});

describe('InputGroup · the ONE disabled propagation rule', () => {
  it('enabled by default: the lane stays enabled, addons stay live', () => {
    const { container } = render(Host);
    const input = container.querySelector('[data-testid="site-input"]') as HTMLInputElement;
    const addon = container.querySelector('[data-testid="prefix-addon"]');
    expect(input.disabled).toBe(false);
    expect(isInert(addon)).toBe(false);
  });

  it('group disable ⇒ native disabled on the lane + inert on EVERY addon', () => {
    const { container } = render(Host);
    const input = container.querySelector('[data-testid="locked-input"]') as HTMLInputElement;
    const addon = container.querySelector('[data-testid="locked-addon"]');
    expect(input.disabled).toBe(true);
    expect(isInert(addon)).toBe(true);
  });

  it('group disable forces a lane that carries no own disabled prop', () => {
    const { container } = render(Host);
    const input = container.querySelector('[data-testid="locked-input"]') as HTMLInputElement;
    expect(input.getAttribute('disabled')).not.toBeNull();
    expect(input.disabled).toBe(true);
  });

  it('per-part disable: the lane can disable alone — its addon keeps working (not inert)', () => {
    const { container } = render(InputHost);
    const input = container.querySelector('[data-testid="part-input"]') as HTMLInputElement;
    const addon = container.querySelector('[data-jx-igroup-addon]');
    expect(input.disabled).toBe(true);
    expect(isInert(addon)).toBe(false);
  });
});

describe('InputGroup · the seam structure', () => {
  it('addons stamp the valued hook (lane side); the default align is inline-start', () => {
    const { container } = render(Host);
    const prefix = container.querySelector('[data-testid="prefix-addon"]');
    const suffix = container.querySelector('[data-testid="suffix-addon"]');
    expect(prefix?.getAttribute('data-jx-igroup-addon')).toBe('inline-start');
    expect(suffix?.getAttribute('data-jx-igroup-addon')).toBe('inline-end');
  });

  it('the sheet paints exactly ONE hairline per addon, facing the lane (no double borders)', () => {
    // the seam law lives in @layer components keyed on the valued hook
    expect(inputGroupCss).toMatch(
      /\[data-jx-igroup-addon='inline-start'\]\)\s*\{\s*border-inline-end:\s*1px solid var\(--border\);/,
    );
    expect(inputGroupCss).toMatch(
      /\[data-jx-igroup-addon='inline-end'\]\)\s*\{\s*border-inline-start:\s*1px solid var\(--border\);/,
    );
    // and ONLY there — the addon markup carries no border utilities
    const { container } = render(Host);
    const addon = container.querySelector('[data-testid="prefix-addon"]') as HTMLElement;
    expect(addon.className).not.toMatch(/border-/);
  });

  it('the shell keeps the input family state machines (well inset, hover intensity, inset ring, invalid dash, disabled paint)', () => {
    // the elevation grammar's well tier: inset at rest, hover deepens
    // intensity only, focus tints the border — the shadow's hierarchy
    // never moves
    expect(inputGroupCss).toMatch(
      /\[data-jx-igroup\]\)\s*\{\s*box-shadow:\s*var\(--shadow-well\);/,
    );
    expect(inputGroupCss).toMatch(
      /\[data-jx-igroup\]\):hover:not\(:has\(:focus-visible\)\)\s*\{\s*box-shadow:\s*var\(--shadow-well-hover\);/,
    );
    expect(inputGroupCss).toMatch(
      /\[data-jx-igroup\]\):has\(:focus\)\s*\{\s*border-color:\s*var\(--ring\);/,
    );
    expect(inputGroupCss).toMatch(
      /\[data-jx-igroup\]\):has\(:focus-visible\)\s*\{\s*outline:\s*1px solid var\(--ring\);\s*outline-offset:\s*-1px;/,
    );
    expect(inputGroupCss).toMatch(
      /\[data-jx-igroup\]\):has\(\[aria-invalid='true'\]\)\s*\{\s*border-style:\s*dashed;/,
    );
    expect(inputGroupCss).toMatch(
      /\[data-jx-igroup\]\):has\(:disabled\)\s*\{\s*border-color:\s*var\(--muted\);/,
    );
  });

  it('the lane consumes the Tier-2 control-lane class (chromeless, never redefined)', () => {
    const { container } = render(Host);
    const input = container.querySelector('[data-testid="site-input"]');
    expect(input?.classList.contains('jx-html-control-lane')).toBe(true);
  });
});

describe('InputGroup · the house value law on the lane', () => {
  it('bound ⇒ controlled: typing commits through the binding', async () => {
    const { container } = render(Host);
    const input = container.querySelector('[data-testid="site-input"]') as HTMLInputElement;
    await fireEvent.input(input, { target: { value: 'jixoai' } });
    expect(container.querySelector('[data-testid="site-value"]')?.textContent).toBe('jixoai');
  });

  it('absent ⇒ purely uncontrolled: no value attribute is authored', () => {
    const { container } = render(InputHost);
    const input = container.querySelector('[data-testid="bare-input"]') as HTMLInputElement;
    expect(input.getAttribute('value')).toBeNull();
  });

  it('a caller-supplied oninput observes alongside the internal law', async () => {
    const heard: string[] = [];
    const { container } = render(InputGroupInput, {
      oninput: (e: Event) => heard.push((e.currentTarget as HTMLInputElement).value),
      value: '',
    });
    const input = container.querySelector('input') as HTMLInputElement;
    await fireEvent.input(input, { target: { value: 'typed' } });
    expect(heard).toEqual(['typed']);
  });
});
