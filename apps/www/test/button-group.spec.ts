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
 *    versa) — context-driven; COMPOSED over Separator (Owner
 *    2026-09-04): the root carries [data-jx-separator] (the ink
 *    engine + the W3C-first hr/div form come with the composition)
 *    while the family css keeps geometry only;
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
 *  - the CLUSTER SHADOW (Owner 2026-09-04): the joined row casts ONE
 *    convex shadow from the root (--shadow-xs, the rest pose alone —
 *    no active effects), the subtree rides FLAT through the group's
 *    texture context write, raised={false} / a flat zone / a nested
 *    position stamp the root flat, and an explicit child raised
 *    still wins;
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

  it('is a COMPOSED Separator (Owner 2026-09-04): the engine stamp rides the divider root, the element form is W3C-first', () => {
    const { container } = render(Host);
    // horizontal group → vertical line → Separator's div branch
    const row = container.querySelector('[data-testid="row-divider"]')!;
    expect(row.hasAttribute('data-jx-separator')).toBe(true);
    expect(row.getAttribute('data-orientation')).toBe('vertical');
    // vertical group → horizontal line → the native <hr> branch
    const col = container.querySelector('[data-testid="col-divider"]')!;
    expect(col.tagName).toBe('HR');
    expect(col.hasAttribute('data-jx-separator')).toBe(true);
    expect(col.getAttribute('data-orientation')).toBe('horizontal');
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

  it('the divider keeps a REAL 1px track — flush junction edges, never a clamped zero-width track (grid-era law, Codex B1)', () => {
    // the flex-era -1px/-1px pair made the divider's margin-box
    // NEGATIVE → grid auto tracks clamped it to 0px (the audit's
    // `72.8px 0px` readout). The junction is flush on both sides
    expect(buttonGroupCss).toMatch(
      /\[data-jx-btngroup='horizontal'\]\)\s*>\s*\[data-jx-btngroup-divider\],\s*\n\s*:where\(\[data-jx-btngroup='horizontal'\]\)\s*>\s*\[data-jx-btngroup-divider\]\s*\+\s\*\s*\{\s*margin-inline-start:\s*0;/,
    );
    expect(buttonGroupCss).toMatch(
      /\[data-jx-btngroup='vertical'\]\)\s*>\s*\[data-jx-btngroup-divider\],\s*\n\s*:where\(\[data-jx-btngroup='vertical'\]\)\s*>\s*\[data-jx-btngroup-divider\]\s*\+\s\*\s*\{\s*margin-block-start:\s*0;/,
    );
    // the line LENGTH rides the family's stretch law (the cross-axis
    // 1px is separator.css's on [data-jx-separator] now — the
    // composed element carries both stamps, asserted in the DOM above)
    expect(buttonGroupCss).toMatch(
      /\[data-jx-btngroup='horizontal'\]\)\s*>\s*\[data-jx-btngroup-divider\]\s*\{\s*align-self:\s*stretch;/,
    );
    // the old overlap geometry is RETIRED
    expect(buttonGroupCss).not.toMatch(/divider[^{]*\{[^}]*margin-inline-end:\s*-1px/s);
  });

  it('the divider rides Separator\'s ink engine — the family css owns GEOMETRY ONLY (composed, Owner 2026-09-04)', () => {
    // no color channel, no flex, no size declarations in any family
    // divider rule: the contrast ghost and the cross-axis 1px live in
    // separator.css on [data-jx-separator]; duplicating them here
    // would put one property under two sheets' order-dependent rule
    const rules = buttonGroupCss.replace(/\/\*[\s\S]*?\*\//g, '');
    const dividerBlocks = rules.match(/\[data-jx-btngroup-divider\][^{]*\{[^}]*\}/g) ?? [];
    expect(dividerBlocks.length).toBeGreaterThan(0);
    for (const block of dividerBlocks) {
      expect(block).not.toContain('background');
      expect(block).not.toContain('flex');
      expect(block).not.toContain('inline-size');
      expect(block).not.toContain('block-size');
    }
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

  it('the LEADING SEAM (r14-13 → the real-DOM era): the intent stamp renders a REAL group-owned element only under an active seam policy', () => {
    const { container } = render(LawsHost);
    expect(
      container.querySelector('[data-testid="lead-group"]')?.hasAttribute('data-jx-leading-seam'),
    ).toBe(true);
    // the stamp records INTENT: it rides even a bordered group — but
    // the element composes with the seam policy (svelte requires BOTH),
    // so a bordered cluster never doubles its opening edge
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
  });

  it('THE REAL-DOM SEAMS (Owner 2026-09-04: "我更希望上真正的 DOM 来做分割线"): the group injects REAL separator elements between its visible children — never a pseudo inside a button', () => {
    const { container } = render(LawsHost);
    const sepsOf = (id: string) =>
      [...(container.querySelector(`[data-testid="${id}"]`)?.children ?? [])].filter((c) =>
        c.hasAttribute('data-jx-btngroup-sep'),
      );
    // ghost default: 3 buttons → 2 seams; the elements are aria-hidden
    // decorative carriers between the children (never inside a button)
    const ghost = sepsOf('ghost-group');
    expect(ghost).toHaveLength(2);
    expect(ghost.every((s) => s.getAttribute('aria-hidden') === 'true')).toBe(true);
    expect(container.querySelector('[data-testid="ghost-group"] button [data-jx-btngroup-sep]')).toBeNull();
    // explicit separator on a bordered group paints the same way
    expect(sepsOf('sep-group')).toHaveLength(1);
    // the leading seam is the group's OWN first child (declarative,
    // Svelte-owned) and the injected ones follow between the buttons
    const lead = sepsOf('lead-group');
    expect(lead).toHaveLength(2); // the declarative leader + one injected
    expect(lead[0]?.hasAttribute('data-jx-injected')).toBe(false);
    expect(lead[1]?.hasAttribute('data-jx-injected')).toBe(true);
    expect(container.querySelector('[data-testid="lead-group"]')?.firstElementChild?.hasAttribute('data-jx-btngroup-sep')).toBe(true);
    // policy off (explicit false, or a bordered group): nothing paints
    expect(sepsOf('nosep-group')).toHaveLength(0);
    expect(sepsOf('plain-group')).toHaveLength(0);
    expect(sepsOf('scope-tonal-group')).toHaveLength(0);
    // the inherited ghost counts for the REAL seams exactly as it did
    // for the policy stamp (r14-10)
    expect(sepsOf('scope-ghost-group')).toHaveLength(1);
  });
});

describe('ButtonGroup · the separator css law (the real-DOM era, source-pinned)', () => {
  it('the seam element paints with the separator ink engine — backdrop contrast ghost, no color', () => {
    // the INK law (separator/separator.css, 2026-09-01): a separator
    // paints no color; the backdrop's own contrast ghost is the ink
    expect(buttonGroupCss).toMatch(
      /:where\(\[data-jx-btngroup-sep\]\)\s*\{[^}]*backdrop-filter:\s*contrast\(0\.5\);/s,
    );
    expect(buttonGroupCss).toMatch(
      /:where\(\[data-jx-btngroup='horizontal'\]\)\s*>\s*\[data-jx-btngroup-sep\]\s*\{[^}]*inline-size:\s*1px;[^}]*align-self:\s*stretch;/s,
    );
    expect(buttonGroupCss).toMatch(
      /:where\(\[data-jx-btngroup='vertical'\]\)\s*>\s*\[data-jx-btngroup-sep\]\s*\{[^}]*block-size:\s*1px;/s,
    );
    // no color channel — ever, only the backdrop engine
    const sepBlock = buttonGroupCss.match(/:where\(\[data-jx-btngroup-sep\]\)\s*\{([^}]*)\}/s)?.[1] ?? '';
    expect(sepBlock).not.toContain('background');
  });

  it('THE PSEUDO ERA IS DEAD: no ::before seam rules anywhere in the sheet (the group never hangs its seams inside a button again)', () => {
    // prose in the law comments may NAME the retired era; the law
    // binds the rules — strip comments before the negative
    const rules = buttonGroupCss.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(rules).not.toMatch(/::before/);
  });

  it('THE JUNCTION COLLAPSE: the follower rides ON the seam track (Owner 2026-09-04 — the seam and the button were a border-width apart)', () => {
    // the seam's own margin stays 0 (a 1px element's negative
    // margin-box clamps to a zero-width grid track), but the
    // FOLLOWING button keeps the generic -1px seam law — its border
    // slot lands on the seam's 1px pixel, one line, flush to the
    // paint (ghost's wash/inset, bordered rungs' collapsed edge)
    expect(buttonGroupCss).toMatch(
      /:where\(\[data-jx-btngroup='horizontal'\]\)\s*>\s*\[data-jx-btngroup-sep\]\s*\{\s*margin-inline-start:\s*0;/,
    );
    expect(buttonGroupCss).toMatch(
      /:where\(\[data-jx-btngroup='vertical'\]\)\s*>\s*\[data-jx-btngroup-sep\]\s*\{\s*margin-block-start:\s*0;/,
    );
    // the generic law the follower falls through to
    expect(buttonGroupCss).toMatch(
      /:where\(\[data-jx-btngroup='horizontal'\]\)\s*>\s*\*\s*\+\s*\*\s*\{\s*margin-inline-start:\s*-1px;/,
    );
    // and NO seam-follower zeroing carve-out remains as a RULE (the
    // :not() exception inside the wrap row-lead reset is the lawful
    // opposite — it PRESERVES the collapse; the divider's heavy
    // border·line·border boundary keeps its own — a cluster boundary
    // should read heavier than the intra-cluster seam)
    const rules = buttonGroupCss.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(rules).not.toMatch(/\[data-jx-btngroup-sep\]\s*\+\s\*\s*\{/);
    expect(rules).toMatch(/\[data-jx-btngroup-divider\]\s*\+\s\*\s*\{\s*margin-inline-start:\s*0;/);
  });

  it('the wrap state swaps the flow to measured rows; a row lead keeps its margin reset (the sync never injects a seam before a lead) — EXCEPT the lead that follows the leading seam (it has an inline-start neighbor now)', () => {
    expect(buttonGroupCss).toMatch(
      /\[data-jx-overflow='wrap'\]\)\s*\{\s*grid-auto-flow:\s*row;\s*grid-auto-columns:\s*max-content;/,
    );
    // the reset owns only leads that break rows behind a BUTTON (a
    // sep never opens a row); row 1's lead follows the LEADING SEAM
    // and keeps the generic -1px collapse onto its track
    expect(buttonGroupCss).toMatch(
      /\[data-jx-overflow='wrap'\]\)\s*>\s*\[data-jx-row-start\]:not\(\[data-jx-btngroup-sep\]\s*\+\s\*\)\s*\{\s*margin-inline-start:\s*0;/,
    );
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

describe('ButtonGroup · the cluster shadow (Owner 2026-09-04)', () => {
  it('a bare group carries NO flat stamp — the root paints the ONE convex shadow (the press law\'s rest pose, source-pinned)', () => {
    const { container } = render(LawsHost);
    expect(
      container.querySelector('[data-testid="plain-group"]')?.hasAttribute('data-jx-btngroup-flat'),
    ).toBe(false);
    // the css law: --shadow-xs behind :where() (zero specificity — a
    // consumer shadow utility still wins), keyed off the flat stamp
    expect(buttonGroupCss).toMatch(
      /:where\(\[data-jx-btngroup\]:not\(\[data-jx-btngroup-flat\]\)\)\s*\{\s*box-shadow:\s*var\(--shadow-xs\);/,
    );
    // NO hover/active shadow pose exists on the root — it never
    // presses ("不用做什么 actived 的效果，只需要去除阴影即可")
    const rules = buttonGroupCss.replace(/\/\*[\s\S]*?\*\//g, '');
    expect(rules).not.toMatch(/\[data-jx-btngroup[^\]]*\]:hover/);
    expect(rules).not.toMatch(/\[data-jx-btngroup[^\]]*\]:active/);
  });

  it('raised={false} removes the root shadow and NOTHING else — the flat stamp', () => {
    const { container } = render(LawsHost);
    expect(
      container.querySelector('[data-testid="flat-group"]')?.hasAttribute('data-jx-btngroup-flat'),
    ).toBe(true);
  });

  it('a flat texture zone carries through to the cluster — no raised island inside a flat zone', () => {
    const { container } = render(LawsHost);
    expect(
      container.querySelector('[data-testid="zone-flat-group"]')?.hasAttribute('data-jx-btngroup-flat'),
    ).toBe(true);
  });

  it('a NESTED group defaults OFF — the outer cluster owns the one shadow', () => {
    const { container } = render(LawsHost);
    expect(
      container.querySelector('[data-testid="nested-outer"]')?.hasAttribute('data-jx-btngroup-flat'),
    ).toBe(false);
    expect(
      container.querySelector('[data-testid="nested-inner"]')?.hasAttribute('data-jx-btngroup-flat'),
    ).toBe(true);
  });

  it('the joined subtree rides FLAT by default (the context write) — an explicit child raised still wins', () => {
    const { container } = render(LawsHost);
    // the zone resolution's context face: the group WRITES the texture
    // default (raised=false) — the buttons adopt it with no prop
    const flat = container.querySelector('[data-testid="plain-group"] [data-jx-press-button]')!;
    expect(flat.className).toContain('[--jx-press-shadow:none]');
    expect(flat.className).toContain('[--jx-press-move:none]');
    // explicit beats the zone — the escape hatch stays open
    const convex = container.querySelector('[data-testid="raised-child-group"] [data-jx-press-button]')!;
    expect(convex.className).not.toContain('--jx-press-move');
    expect(convex.className).not.toContain('engrave');
  });
});
