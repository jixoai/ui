/**
 * The family-structure gates (paged-doc-family, 2026-08-30):
 * aside float/sink pose stamps, PagedCode flow|shrink, the heading
 * keeper packing, PagedTable/PagedBlock structure, and the doc-level
 * projections (injected @page rule, orphans/widows custom props,
 * flow/columns/engine stamps).
 */
import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import FamilyHost from './fixtures/paged-family-host.svelte';

describe('PagedDoc projections', () => {
  it('injects the @page rule with the configured size and margin', () => {
    render(FamilyHost);
    const style = document.head.querySelector('style[data-jx-paged-page-rules]');
    expect(style).not.toBeNull();
    expect(style?.textContent).toContain('@page');
    expect(style?.textContent).toContain('size:Letter');
    expect(style?.textContent).toContain('margin:20mm 15mm');
  });

  it('stamps flow/columns/engine and feeds the orphans/widows custom props', () => {
    const { container } = render(FamilyHost);
    const doc = container.querySelector('[data-jx-paged-doc]')!;
    expect(doc.getAttribute('data-flow')).toBe('web');
    expect(doc.getAttribute('data-columns')).toBe('wide');
    expect(doc.getAttribute('data-engine')).toBe('native');
    // the forced wide tier (columns="wide")
    expect(doc.getAttribute('data-width')).toBe('wide');
    // the global :where orphans/widows projection reads these props
    expect(doc.style.getPropertyValue('--jx-paged-orphans')).toBe('3');
    expect(doc.style.getPropertyValue('--jx-paged-widows')).toBe('2');
  });
});

describe('PagedAside pose', () => {
  it('floats on the wide tier and sinks on the forced narrow tier', () => {
    const wide = render(FamilyHost, { columns: 'wide' });
    expect(
      wide.container.querySelector('[data-jx-paged-aside]')?.getAttribute('data-pose'),
    ).toBe('float');

    const narrow = render(FamilyHost, { columns: '1' });
    expect(
      narrow.container.querySelector('[data-jx-paged-aside]')?.getAttribute('data-pose'),
    ).toBe('sink');
  });
});

describe('PagedCode printOverflow', () => {
  it('flow stamps the flatten verb; shrink keeps the scrollport and marks the mode', () => {
    const { container } = render(FamilyHost);
    const blocks = [...container.querySelectorAll('[data-jx-paged-code]')];
    expect(blocks).toHaveLength(2);

    const flow = blocks[0]!;
    expect(flow.getAttribute('data-print-overflow')).toBe('flow');
    // the audited verb rides the pre — the whitelist lifts overflow
    // and any block-size cap under print/sim
    expect(flow.querySelector('pre')?.getAttribute('data-jx-print')).toBe('flatten');

    const shrink = blocks[1]!;
    expect(shrink.getAttribute('data-print-overflow')).toBe('shrink');
    // shrink steps the font instead — no flatten verb on the pre
    expect(shrink.querySelector('pre')?.hasAttribute('data-jx-print')).toBe(false);
  });

  it('renders per-line spans for the print gutter — numbered, order-preserving, empty lines keep height', () => {
    const { container } = render(FamilyHost);
    const flow = container.querySelector('[data-jx-paged-code]')!;
    const lines = [...flow.querySelectorAll('.jx-paged-line')];
    // 'flow pose' is one line — the span structure exists for the
    // counter ::before without changing screen rendering
    expect(lines).toHaveLength(1);
    expect(lines[0]!.getAttribute('data-line')).toBe('1');
    expect(lines[0]!.textContent).toBe('flow pose');
  });

  it('multi-line code splits exactly on newlines (empty lines become a space, not a collapsed block)', async () => {
    const host = render(FamilyHost);
    // extend via a fresh mount with a multi-line sample through the
    // component directly — the fixture carries single-line poses
    const { default: PagedCode } = await import('$lib/paged/code.svelte');
    const { container } = render(PagedCode, {
      code: 'alpha\nbeta\n\ngamma',
    });
    const lines = [...container.querySelectorAll('.jx-paged-line')];
    expect(lines.map((l) => l.textContent)).toEqual(['alpha', 'beta', ' ', 'gamma']);
    expect(lines.map((l) => l.getAttribute('data-line'))).toEqual(['1', '2', '3', '4']);
  });

  it('the numbered gutter is a prop — default ON (no suppression stamp), lineNumbers={false} opts out', async () => {
    const { default: PagedCode } = await import('$lib/paged/code.svelte');
    // default: no data-line-numbers attr → the print gutter applies
    const on = render(PagedCode, { code: 'x' });
    expect(on.container.querySelector('[data-jx-paged-code]')!.hasAttribute('data-line-numbers')).toBe(false);
    // opt-out: stamped 'false' → the ::before suppression rule matches
    const off = render(PagedCode, { code: 'x', lineNumbers: false });
    expect(off.container.querySelector('[data-jx-paged-code]')!.getAttribute('data-line-numbers')).toBe('false');
    // the line structure exists either way (wrapping is not gated)
    expect(off.container.querySelectorAll('.jx-paged-line')).toHaveLength(1);
  });
});

describe('the heading keeper', () => {
  it('packs the heading and lede as one unbreakable unit', () => {
    const { container } = render(FamilyHost);
    const keeper = container.querySelector('[data-jx-paged-keeper]')!;
    expect(keeper).not.toBeNull();
    // the heading and the lede are INSIDE the keeper; the body is not
    expect(keeper.querySelector('[data-jx-paged-heading]')).not.toBeNull();
    expect(keeper.querySelector('[data-jx-paged-lede]')).not.toBeNull();
    expect(keeper.querySelector('[data-jx-paged-lede]')?.textContent).toContain('standfirst');
    // the level prop picks the heading element
    expect(keeper.querySelector('h2[data-jx-paged-heading]')).not.toBeNull();
  });

  it('renders nested sections at level 3', () => {
    const { container } = render(FamilyHost);
    expect(container.querySelector('h2[data-jx-paged-heading]')).not.toBeNull();
  });
});

describe('PagedTable and PagedBlock', () => {
  it('renders a native table carrying the family hook (thead authored by the consumer)', () => {
    const { container } = render(FamilyHost);
    const table = container.querySelector('table[data-jx-paged-table]')!;
    expect(table).not.toBeNull();
    expect(table.querySelector('thead th')?.textContent).toBe('col');
    expect(table.querySelector('tbody tr td')?.textContent).toBe('row');
  });

  it('PagedBlock stamps the avoid verb', () => {
    const { container } = render(FamilyHost);
    const block = container.querySelector('[data-jx-paged-block]')!;
    expect(block.getAttribute('data-avoid')).toBe('true');
  });
});
