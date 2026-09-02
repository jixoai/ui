/**
 * button-group.spec.ts — the joined action container (OpenSpec
 * 2026-08-30-expand-form-family F2; r13 upgrade: context variant
 * pass-down, separator policy, grid container).
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
 *    the total seam stays exactly 1px;
 *  - r13 GRID: the container is inline-grid (flow row + auto columns
 *    horizontal, flow column + auto rows vertical) — flex is retired,
 *    the seam margins carry into grid unchanged;
 *  - r13 CONTEXT: the group's variant is adopted by child buttons
 *    that pass none (explicit child prop ALWAYS wins; the ladder
 *    itself is untouched);
 *  - r13 SEPARATOR: the ghost default (on when the group variant is
 *    ghost), explicit on/off, and the css law — the seam slot painted
 *    with the separator ink engine (backdrop contrast ghost), the
 *    divider exempt, row leads suppressed in wrap state, and the
 *    unlayered overflow display flips.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/svelte';
import ButtonGroupDivider from '$lib/ui/button-group/button-group-divider.svelte';
import Host from './fixtures/button-group-host.svelte';
import LawsHost from './fixtures/button-group-laws-host.svelte';

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

  it('the divider owns a REAL 1px track — flush junction edges, never a clamped zero-width track (grid-era law, Codex B1)', () => {
    // the flex-era -1px/-1px pair made the divider's margin-box
    // NEGATIVE → grid auto tracks clamped it to 0px (the audit's
    // `72.8px 0px` readout). The junction is now flush on both sides
    expect(buttonGroupCss).toMatch(
      /\[data-jx-btngroup='horizontal'\]\)\s*>\s*\[data-jx-btngroup-divider\],\s*\n\s*:where\(\[data-jx-btngroup='horizontal'\]\)\s*>\s*\[data-jx-btngroup-divider\]\s*\+\s\*\s*\{\s*margin-inline-start:\s*0;/,
    );
    expect(buttonGroupCss).toMatch(
      /\[data-jx-btngroup='vertical'\]\)\s*>\s*\[data-jx-btngroup-divider\],\s*\n\s*:where\(\[data-jx-btngroup='vertical'\]\)\s*>\s*\[data-jx-btngroup-divider\]\s*\+\s\*\s*\{\s*margin-block-start:\s*0;/,
    );
    expect(buttonGroupCss).toMatch(
      /\[data-jx-btngroup='horizontal'\]\)\s*>\s*\[data-jx-btngroup-divider\]\s*\{[^}]*inline-size:\s*1px;/s,
    );
    // the old overlap geometry is RETIRED
    expect(buttonGroupCss).not.toMatch(/divider[^{]*\{[^}]*margin-inline-end:\s*-1px/s);
  });

  it('the divider carries no border of its own (the hairline is paint, not a fifth edge)', () => {
    expect(buttonGroupCss).toMatch(
      /\[data-jx-btngroup-divider\]\)\s*\{\s*flex:\s*none;\s*background:\s*var\(--border\);/,
    );
  });
});

describe('ButtonGroup · the grid container (r13: grid replaces flex)', () => {
  it('is an inline grid flowing COLUMN with auto columns (horizontal — the no-template flow law, pinned on Chromium)', () => {
    const { container } = render(Host);
    const row = container.querySelector('[data-testid="row-group"]')!;
    expect(row.classList.contains('inline-grid')).toBe(true);
    // flow COLUMN grows the one implicit row with columns (the
    // horizontal line); flow ROW would stack every button in one
    // column — the Codex B1 regression
    expect(row.classList.contains('grid-flow-col')).toBe(true);
    expect(row.classList.contains('auto-cols-auto')).toBe(true);
    // flex is retired — the Owner ruling, not a regression
    expect(row.className).not.toContain('inline-flex');
    expect(row.className).not.toContain('flex-row');
  });

  it('vertical groups flow ROW (the default) with auto rows — one column, implicit rows', () => {
    const { container } = render(Host);
    const col = container.querySelector('[data-testid="col-group"]')!;
    expect(col.classList.contains('inline-grid')).toBe(true);
    expect(col.classList.contains('grid-flow-row')).toBe(true);
    expect(col.classList.contains('auto-rows-auto')).toBe(true);
  });

  it('the -1px seam law survives the grid swap verbatim (margins carry into auto tracks)', () => {
    // the seam rules themselves are asserted above; this pins that the
    // grid rewrite never redefined them — the same selectors, the
    // same -1px, still child-scoped
    expect(buttonGroupCss).not.toContain('display: inline-flex');
    expect(buttonGroupCss).not.toContain('flex-direction');
  });
});

describe('ButtonGroup · the group variant context (r13)', () => {
  it('children without an explicit variant ADOPT the group variant', () => {
    const { container } = render(LawsHost);
    const group = container.querySelector('[data-testid="ghost-group"]')!;
    const buttons = [...group.querySelectorAll('[data-jx-press-button]')];
    expect(buttons.map((b) => b.getAttribute('data-jx-press-button'))).toEqual([
      'ghost',
      'ghost',
      'outline', // the explicit rung ALWAYS wins
    ]);
  });

  it('IconButton adopts the group variant through the composition (explicit still wins)', () => {
    const { container } = render(LawsHost);
    const group = container.querySelector('[data-testid="icon-group"]')!;
    const buttons = [...group.querySelectorAll('[data-jx-press-button]')];
    expect(buttons.map((b) => b.getAttribute('data-jx-press-button'))).toEqual(['tonal', 'fill']);
  });

  it('a group without a variant leaves children on their own default rung', () => {
    const { container } = render(LawsHost);
    const plain = container.querySelector('[data-testid="plain-group"]')!;
    expect(plain.querySelector('[data-jx-press-button]')?.getAttribute('data-jx-press-button')).toBe(
      'outline',
    );
  });
});

describe('ButtonGroup · the separator policy (r13: ghost\'s seam)', () => {
  it('ON by default under a ghost group (the borderless row has no other seam)', () => {
    const { container } = render(LawsHost);
    expect(container.querySelector('[data-testid="ghost-group"]')?.hasAttribute('data-jx-separator')).toBe(
      true,
    );
  });

  it('explicit separator={true} turns it on for bordered groups; {false} overrides the ghost default', () => {
    const { container } = render(LawsHost);
    expect(container.querySelector('[data-testid="sep-group"]')?.hasAttribute('data-jx-separator')).toBe(
      true,
    );
    expect(
      container.querySelector('[data-testid="nosep-group"]')?.hasAttribute('data-jx-separator'),
    ).toBe(false);
  });

  it('a bordered group carries no separators unless asked', () => {
    const { container } = render(LawsHost);
    expect(container.querySelector('[data-testid="plain-group"]')?.hasAttribute('data-jx-separator')).toBe(
      false,
    );
  });

  it('an INHERITED ghost counts (r14-10): a scope-wrapped group with no variant of its own seams too', () => {
    const { container } = render(LawsHost);
    // the DialogFooter shape exactly: the group inherits ghost from the
    // zone's variant scope — the seam policy keys the EFFECTIVE variant
    expect(
      container.querySelector('[data-testid="scope-ghost-group"]')?.hasAttribute('data-jx-separator'),
    ).toBe(true);
    // an explicit non-ghost variant shadows the scope and the seam both
    expect(
      container.querySelector('[data-testid="scope-tonal-group"]')?.hasAttribute('data-jx-separator'),
    ).toBe(false);
  });

  it('the LEADING SEAM (r14-13): the intent stamp composes with the seam policy in the css', () => {
    const { container } = render(LawsHost);
    expect(
      container.querySelector('[data-testid="lead-group"]')?.hasAttribute('data-jx-leading-seam'),
    ).toBe(true);
    // the stamp records INTENT: it rides even a bordered group — but
    // the paint composes with the seam policy (css requires BOTH
    // stamps), so a bordered cluster never doubles its opening edge
    expect(
      container.querySelector('[data-testid="lead-plain-group"]')?.hasAttribute('data-jx-leading-seam'),
    ).toBe(true);
    expect(
      container.querySelector('[data-testid="lead-plain-group"]')?.hasAttribute('data-jx-separator'),
    ).toBe(false);
    // the default group does not opt in
    expect(
      container.querySelector('[data-testid="ghost-group"]')?.hasAttribute('data-jx-leading-seam'),
    ).toBe(false);
    // source-pinned: the leading rule requires the seam stamp too
    expect(buttonGroupCss).toMatch(
      /\[data-jx-separator\]\[data-jx-leading-seam\][^{}]*first-child/,
    );
  });
});

describe('ButtonGroup · the separator css law (r13, source-pinned)', () => {
  // the two ::before blocks, extracted for the ink-law assertions
  const sepH = buttonGroupCss.match(
    /\[data-jx-btngroup='horizontal'\]\[data-jx-separator\]\)[^{}]*::before\s*\{([^}]*)\}/s,
  )?.[1] ?? '';
  const sepV = buttonGroupCss.match(
    /\[data-jx-btngroup='vertical'\]\[data-jx-separator\]\)[^{}]*::before\s*\{([^}]*)\}/s,
  )?.[1] ?? '';

  it('the seam slot paints with the separator ink engine — backdrop contrast ghost, no color', () => {
    // the INK law (separator/separator.css, 2026-09-01): a separator
    // paints no color; the backdrop's own contrast ghost is the ink
    expect(sepH).toMatch(/inline-size:\s*1px;/);
    expect(sepH).toMatch(/backdrop-filter:\s*contrast\(0\.5\);/);
    expect(sepV).toMatch(/block-size:\s*1px;/);
    expect(sepV).toMatch(/backdrop-filter:\s*contrast\(0\.5\);/);
    for (const block of [sepH, sepV]) {
      expect(block).not.toContain('background:'); // no color channel — ever
      expect(block.replace('backdrop-filter', '')).not.toMatch(/\bfilter:/); // only the backdrop engine
    }
  });

  it('the seam pseudo is an absolutely-positioned decorative carrier on a relative child', () => {
    expect(buttonGroupCss).toMatch(
      /\[data-jx-btngroup\]\[data-jx-separator\]\)\s*>\s\*\s*\{\s*position:\s*relative;/,
    );
    expect(sepH).toMatch(/position:\s*absolute;/);
    expect(sepH).toMatch(/inset-inline-start:\s*-1px;/); // the collapsed seam slot
  });

  it('the divider is exempt — the explicit line never doubles with the separator seam', () => {
    expect(buttonGroupCss).toMatch(
      /\[data-jx-separator\]\)\s*>\s\*\s\+\s\*:not\(\[data-jx-btngroup-divider\]\)::before/,
    );
  });

  it('the wrap state swaps the flow to measured rows and drops the seam on row leads', () => {
    expect(buttonGroupCss).toMatch(
      /\[data-jx-overflow='wrap'\]\)\s*\{\s*grid-auto-flow:\s*row;\s*grid-auto-columns:\s*max-content;/,
    );
    expect(buttonGroupCss).toMatch(
      /\[data-jx-overflow='wrap'\]\)\s*>\s*\[data-jx-row-start\]\s*\{\s*margin-inline-start:\s*0;/,
    );
    expect(buttonGroupCss).toMatch(/\[data-jx-row-start\]::before\s*\{\s*content:\s*none;/);
  });

  it('the overflow display flips ride UNLAYERED behind :where() with the measuring-state guard', () => {
    // the carve-out (the dropdown caret precedent): a components-layer
    // display rule would always lose to the items' own display
    // utilities — pin that the flips sit AFTER the @layer components
    // block, and that the transient measuring stamp suspends them
    const carveOutAt = buttonGroupCss.indexOf('CASCADE CARVE-OUT');
    expect(carveOutAt).toBeGreaterThan(0);
    const carveOut = buttonGroupCss.slice(carveOutAt);
    // unlayered — no @layer statement (the comment may NAME the layers)
    expect(carveOut).not.toMatch(/^\s*@layer/m);
    expect(carveOut).toMatch(
      /:not\(\[data-jx-measuring\]\):not\(\[data-jx-overflow='collapse'\]\)\)\s*>\s*\[data-jx-btngroup-more\]/,
    );
    expect(carveOut).toMatch(
      /:where\(\[data-jx-btngroup\]:not\(\[data-jx-measuring\]\)\[data-jx-overflow='collapse'\]\)\s*>\s*\[data-jx-overflow-hidden='true'\]/,
    );
    expect(carveOut).toMatch(/display:\s*none;/);
  });
});
