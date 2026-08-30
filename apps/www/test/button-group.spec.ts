/**
 * button-group.spec.ts — the joined action container (OpenSpec
 * 2026-08-30-expand-form-family F2).
 *
 * Contracts under test:
 *  - the ROLE LAW: the root is role=group (an action grouping, never
 *    a toolbar by default); an explicit consumer role override is
 *    honored, and the name resolves label → aria-label with an
 *    explicit rest aria-label winning;
 *  - orientation: the valued data-jx-btngroup hook carries the axis;
 *  - the divider part: role=separator whose aria-orientation
 *    describes the LINE (vertical inside a horizontal flow and vice
 *    versa) — context-driven;
 *  - the seam structure: the sheet collapses adjacent DIRECT children
 *    onto one hairline (-1px margin, child-scoped so nested groups
 *    stay one child) and the divider REPLACES the collapsed seam —
 *    the total seam stays exactly 1px.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import ButtonGroupDivider from '$lib/ui/button-group/button-group-divider.svelte';
import Host from './fixtures/button-group-host.svelte';

// the css law is read from the mirror (same-source: byte-identical to
// registry/files/ui/button-group/button-group.css); vitest stubs css
// imports, so the raw text comes off disk
const buttonGroupCss = readFileSync(
  resolve(process.cwd(), 'src/lib/ui/button-group/button-group.css'),
  'utf8',
);

describe('ButtonGroup · the role law', () => {
  it('renders role=group named by label (aria-label)', () => {
    const { container } = render(Host);
    const root = container.querySelector('[data-testid="row-group"]');
    expect(root?.getAttribute('role')).toBe('group');
    expect(root?.getAttribute('data-jx-btngroup')).not.toBeNull();
    expect(root?.getAttribute('aria-label')).toBe('export actions');
  });

  it('is NEVER a toolbar by default — the toolbar role only appears when the consumer explicitly labels it so', () => {
    const { container } = render(Host);
    const row = container.querySelector('[data-testid="row-group"]');
    const toolbar = container.querySelector('[data-testid="toolbar-group"]');
    expect(row?.getAttribute('role')).toBe('group');
    expect(toolbar?.getAttribute('role')).toBe('toolbar');
    // the explicit rest aria-label wins over the label shorthand too
    expect(toolbar?.getAttribute('aria-label')).toBe('text tools');
  });
});

describe('ButtonGroup · orientation', () => {
  it('horizontal is the default; vertical stamps the valued hook', () => {
    const { container } = render(Host);
    expect(container.querySelector('[data-testid="row-group"]')?.getAttribute('data-jx-btngroup')).toBe(
      'horizontal',
    );
    expect(container.querySelector('[data-testid="col-group"]')?.getAttribute('data-jx-btngroup')).toBe(
      'vertical',
    );
  });
});

describe('ButtonGroup · the divider part', () => {
  it('renders role=separator between the clusters', () => {
    const { container } = render(Host);
    const divider = container.querySelector('[data-testid="row-divider"]');
    expect(divider?.getAttribute('role')).toBe('separator');
  });

  it('aria-orientation describes the LINE: vertical in a horizontal flow, horizontal in a vertical one', () => {
    const { container } = render(Host);
    expect(container.querySelector('[data-testid="row-divider"]')?.getAttribute('aria-orientation')).toBe(
      'vertical',
    );
    expect(container.querySelector('[data-testid="col-divider"]')?.getAttribute('aria-orientation')).toBe(
      'horizontal',
    );
  });

  it('outside any group it defaults to the horizontal flow (a vertical line)', () => {
    const { container } = render(ButtonGroupDivider);
    expect(container.querySelector('[data-jx-btngroup-divider]')?.getAttribute('aria-orientation')).toBe(
      'vertical',
    );
  });
});

describe('ButtonGroup · the seam structure (the css law)', () => {
  it('adjacent DIRECT children collapse onto ONE hairline (child-scoped: nested groups stay one child)', () => {
    expect(buttonGroupCss).toMatch(
      /\[data-jx-btngroup='horizontal'\]\)\s*>\s*\*\s\+\s\*\s*\{\s*margin-inline-start:\s*-1px;/,
    );
    expect(buttonGroupCss).toMatch(
      /\[data-jx-btngroup='vertical'\]\)\s*>\s*\*\s\+\s\*\s*\{\s*margin-block-start:\s*-1px;/,
    );
  });

  it('the divider REPLACES the collapsed seam — 1px paint, collapsed on both edges', () => {
    expect(buttonGroupCss).toMatch(
      /\[data-jx-btngroup='horizontal'\]\)\s*>\s*\[data-jx-btngroup-divider\]\s*\{[^}]*inline-size:\s*1px;[^}]*margin-inline-end:\s*-1px;/s,
    );
    expect(buttonGroupCss).toMatch(
      /\[data-jx-btngroup='vertical'\]\)\s*>\s*\[data-jx-btngroup-divider\]\s*\{[^}]*block-size:\s*1px;[^}]*margin-block-end:\s*-1px;/s,
    );
  });

  it('the divider carries no border of its own (the hairline is paint, not a fifth edge)', () => {
    expect(buttonGroupCss).toMatch(
      /\[data-jx-btngroup-divider\]\)\s*\{\s*flex:\s*none;\s*background:\s*var\(--border\);/,
    );
  });
});
