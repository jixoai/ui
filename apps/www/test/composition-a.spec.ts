/**
 * composition-first Batch A lock (test/composition-a.spec.ts, 2026-08-25).
 * The three redesigned families and their composition contracts:
 *
 *   steps       — explicit ordinals, state = pure step-vs-current
 *                 comparison (duplicates/gaps cannot corrupt), the
 *                 done-marker button law, bind:current, connector css
 *   timeline    — Dice anatomy parts, pending as attribute paint,
 *                 free-children body, spine/connector css
 *   descriptions— term prop → dt, children → dd, em-dash fallback,
 *                 columns/bordered HOW-props via context
 *
 * SSR completeness (context contract clause 6) is locked as a SOURCE
 * GUARD: the vitest pipeline compiles client-side (browser condition
 * in vitest.config), so svelte/server cannot execute the components —
 * instead these suites pin that NO hydration-only lifecycle path
 * exists in the family sources (onMount/onDestroy/$effect/
 * addEventListener) while every semantic attribute is asserted on the
 * rendered DOM. CSS whose selectors jsdom cannot apply (self-hides,
 * attribute paint) is pinned as a source guard, per the list-item.spec
 * convention.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { fireEvent, render } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';

import StepsHost from './fixtures/steps-host.svelte';
import TimelineHost from './fixtures/timeline-host.svelte';
import DescriptionsHost from './fixtures/descriptions-host.svelte';

const specDir = resolve(fileURLToPath(import.meta.url), '..');
const stepsCss = readFileSync(resolve(specDir, '../src/lib/ui/steps/steps.css'), 'utf8');
const timelineCss = readFileSync(resolve(specDir, '../src/lib/ui/timeline/timeline.css'), 'utf8');

/** every .svelte source of a family folder, joined for source guards */
function familySources(folder: string): string {
  return readdirSync(resolve(specDir, `../src/lib/ui/${folder}`))
    .filter((f) => f.endsWith('.svelte'))
    .map((f) => readFileSync(resolve(specDir, `../src/lib/ui/${folder}/${f}`), 'utf8'))
    .join('\n');
}

/** the hydration-only lifecycle tokens that would break SSR completeness */
const HYDRATION_ONLY = [/onMount\s*\(/, /onDestroy\s*\(/, /\$effect\s*\(/, /addEventListener\s*\(/];

// ---------------------------------------------------------------------------
// Steps — ordinal semantics: pure comparison, zero registration
// ---------------------------------------------------------------------------
describe('Steps family — ordinal semantics (design fixture table)', () => {
  const table: { label: string; ordinals: number[]; current: number; expected: string[] }[] = [
    {
      label: '[0,1,2] current=1 → done/current/todo',
      ordinals: [0, 1, 2],
      current: 1,
      expected: ['done', 'current', 'todo'],
    },
    {
      label: '[0,2] current=1 → gap: done/inert, nothing paints current',
      ordinals: [0, 2],
      current: 1,
      expected: ['done', 'todo'],
    },
    {
      label: '[1,1] current=1 → duplicate ordinals: both current',
      ordinals: [1, 1],
      current: 1,
      expected: ['current', 'current'],
    },
  ];

  it.each(table)('$label', ({ ordinals, current, expected }) => {
    const { container } = render(StepsHost, { props: { ordinals, current } });
    const items = [...container.querySelectorAll('[data-jx-step-item]')];
    expect(items.map((li) => li.getAttribute('data-jx-step'))).toEqual(expected);
  });

  it('aria-current=step rides the current state only — never aria-disabled anywhere', () => {
    const { container } = render(StepsHost, { props: { ordinals: [0, 1, 2], current: 1 } });
    const items = [...container.querySelectorAll('[data-jx-step-item]')];
    expect(items[1]!.getAttribute('aria-current')).toBe('step');
    expect(items[0]!.getAttribute('aria-current')).toBeNull();
    expect(items[2]!.getAttribute('aria-current')).toBeNull();
    // future steps are inert, not disabled controls
    for (const li of items) expect(li.getAttribute('aria-disabled')).toBeNull();
  });

  it('a gap paints NO current item (nothing equals current)', () => {
    const { container } = render(StepsHost, { props: { ordinals: [0, 2], current: 1 } });
    expect(container.querySelector('[aria-current]')).toBeNull();
  });

  it('duplicate ordinals both paint current (both carry aria-current=step)', () => {
    const { container } = render(StepsHost, { props: { ordinals: [1, 1], current: 1 } });
    const currents = [...container.querySelectorAll('[aria-current]')];
    expect(currents.length).toBe(2);
    for (const li of currents) expect(li.getAttribute('aria-current')).toBe('step');
  });
});

// ---------------------------------------------------------------------------
// Steps — the done-marker button law (no dead affordances)
// ---------------------------------------------------------------------------
describe('Steps family — marker button only when onclick + done', () => {
  it('done item renders the marker as a button with the ✓ glyph and a back label', () => {
    const { container } = render(StepsHost, {
      props: { ordinals: [0, 1, 2], current: 1, interactive: true },
    });
    const items = [...container.querySelectorAll('[data-jx-step-item]')];
    const doneMarker = items[0]!.querySelector('button[data-jx-step-indicator]')!;
    expect(doneMarker).toBeTruthy();
    expect(doneMarker.getAttribute('type')).toBe('button');
    expect(doneMarker.getAttribute('aria-label')).toBe('completed: step 0 — go back');
    expect(doneMarker.querySelector('[data-jx-step-index]')!.textContent).toBe('✓');
    // current and future items: inert spans, no button anywhere inside
    expect(items[1]!.querySelector('button')).toBeNull();
    expect(items[2]!.querySelector('button')).toBeNull();
    expect(items[1]!.querySelector('span[data-jx-step-indicator]')).toBeTruthy();
  });

  it('no handler ⇒ zero buttons (inert markers stay)', () => {
    const { container } = render(StepsHost, { props: { ordinals: [0, 1, 2], current: 1 } });
    expect(container.querySelectorAll('button').length).toBe(0);
    expect(container.querySelectorAll('[data-jx-step-indicator]').length).toBe(3);
  });

  it('clicking the done marker fires ONLY that step and moves current through bind:current', () => {
    const clicked: number[] = [];
    const { container } = render(StepsHost, {
      props: { ordinals: [0, 1, 2], current: 1, interactive: true, onclick: (s) => clicked.push(s) },
    });
    const items = () => [...container.querySelectorAll('[data-jx-step-item]')];
    // the future step has no control to click — only done markers are buttons
    expect(container.querySelectorAll('button').length).toBe(1);
    fireEvent.click(container.querySelector('button[data-jx-step-indicator]')!);
    flushSync();
    expect(clicked).toEqual([0]);
    // bind:current moved: the clicked step is now current, the others todo
    expect(items().map((li) => li.getAttribute('data-jx-step'))).toEqual(['current', 'todo', 'todo']);
    expect(items()[0]!.getAttribute('aria-current')).toBe('step');
    // and its marker is no longer a button (current is not done)
    expect(container.querySelectorAll('button').length).toBe(0);
  });

  it('the indicator offers child({ props }) on the interactive form only (button semantics)', async () => {
    const Host = (await import('./fixtures/steps-child-host.svelte')).default;
    const { container } = render(Host);
    const replaced = container.querySelector('button[data-testid="replaced-marker"]')!;
    expect(replaced).toBeTruthy();
    // the child-built element keeps the part's props: class carried, type kept
    expect(replaced.getAttribute('type')).toBe('button');
    // the indicator's glyph box now derives from the ctl icon alias
    expect(replaced.className).toContain('[width:var(--jx-icon)]');
    // consumer utilities appended after props.class win the merge
    expect(replaced.className).toContain('ring-1');
  });
});

// ---------------------------------------------------------------------------
// Steps — connector css (source guard) + authored separators
// ---------------------------------------------------------------------------
describe('Steps family — the connector build and self-hide (css law)', () => {
  it("steps.css keeps the pseudo build, the done repaint and the last-child self-hide on REAL DOM hooks", () => {
    expect(stepsCss).toContain(':where([data-jx-step-separator])::after');
    expect(stepsCss).toContain(`:where([data-jx-step='done']) :where([data-jx-step-separator])::after`);
    expect(stepsCss).toContain(':where([data-jx-step-item]:last-child) [data-jx-step-separator]');
    // component names never appear in the DOM contract: no .jx-step* class selectors
    expect(stepsCss).not.toMatch(/\.jx-step/);
  });

  it('separators are authored parts — one per item, present in the DOM everywhere', () => {
    const { container } = render(StepsHost, { props: { ordinals: [0, 1, 2], current: 1 } });
    expect(container.querySelectorAll('[data-jx-step-separator]').length).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// Steps — SSR-honest first paint (context contract clause 6)
// ---------------------------------------------------------------------------
describe('Steps family — SSR-honest first paint', () => {
  it('no hydration-only lifecycle path exists in the family sources', () => {
    const sources = familySources('steps');
    for (const pattern of HYDRATION_ONLY) expect(sources).not.toMatch(pattern);
  });

  it('the first render carries every semantic attribute (states, aria-current, markers)', () => {
    const { container } = render(StepsHost, { props: { ordinals: [0, 1, 2], current: 1 } });
    const ol = container.querySelector('ol[data-jx-steps]')!;
    expect(ol.getAttribute('role')).toBe('list');
    const items = [...ol.querySelectorAll(':scope > [data-jx-step-item]')];
    expect(items.length).toBe(3);
    expect(items.map((li) => li.getAttribute('data-jx-step'))).toEqual(['done', 'current', 'todo']);
    expect(items[1]!.getAttribute('aria-current')).toBe('step');
    expect(container.querySelectorAll('[data-jx-step-indicator]').length).toBe(3);
    expect(container.querySelectorAll('[data-jx-step-separator]').length).toBe(3);
    expect(container.querySelectorAll('button').length).toBe(0);
  });

  it('the done-marker button paints on first render when onclick exists', () => {
    const { container } = render(StepsHost, {
      props: { ordinals: [0, 1, 2], current: 1, interactive: true },
    });
    const marker = container.querySelector('button[data-jx-step-indicator]')!;
    expect(marker.getAttribute('aria-label')).toBe('completed: step 0 — go back');
    expect(marker.querySelector('[data-jx-step-index]')!.textContent).toBe('✓');
  });
});

// ---------------------------------------------------------------------------
// Timeline — Dice anatomy, pending attribute paint, free-children body
// ---------------------------------------------------------------------------
describe('Timeline family — composed anatomy', () => {
  it('ol of items carrying dot, connector, content, time and title', () => {
    const { container } = render(TimelineHost);
    const ol = container.querySelector('ol[data-jx-timeline]')!;
    expect(ol.getAttribute('role')).toBe('list');
    const items = [...ol.querySelectorAll(':scope > [data-jx-tl-item]')];
    expect(items.length).toBe(2);
    for (const li of items) {
      expect(li.querySelector('[data-jx-tl-dot]')).toBeTruthy();
      expect(li.querySelector('[data-jx-tl-connector]')).toBeTruthy();
      expect(li.querySelector('[data-jx-tl-content]')).toBeTruthy();
    }
    const time = items[0]!.querySelector('time')!;
    expect(time.getAttribute('datetime')).toBe('2026-08-22T07:02:00Z');
    expect(time.textContent).toBe('07:02');
    expect(items[0]!.querySelector('[data-jx-tl-title]')!.textContent).toBe('pushed');
  });

  it('the body is free children of the content part (no snippet contract)', () => {
    const { container } = render(TimelineHost);
    expect(container.querySelector('[data-jx-tl-content] .tl-body')!.textContent).toBe(
      '12 checks · 0 failed · 8.2s',
    );
  });

  it('pending paints as the item attribute (hollow dot + muted title ride css)', () => {
    const { container } = render(TimelineHost, { props: { pending: true } });
    const items = [...container.querySelectorAll('[data-jx-tl-item]')];
    expect(items[1]!.hasAttribute('data-jx-tl-pending')).toBe(true);
    expect(items[0]!.hasAttribute('data-jx-tl-pending')).toBe(false);
  });

  it('pending absent by default', () => {
    const { container } = render(TimelineHost);
    expect(container.querySelector('[data-jx-tl-pending]')).toBeNull();
  });
});

describe('Timeline family — spine, self-hide and attribute paint (css law)', () => {
  it('timeline.css carries the spine build, the last-child self-hide and the pending pair', () => {
    expect(timelineCss).toContain(':where([data-jx-tl-connector])::before');
    expect(timelineCss).toContain(':where([data-jx-tl-item]:last-child) [data-jx-tl-connector]');
    expect(timelineCss).toContain(':where([data-jx-tl-dot])');
    expect(timelineCss).toContain(`:where([data-jx-tl-pending]) :where([data-jx-tl-dot])`);
    expect(timelineCss).toContain(':where([data-jx-tl-title])');
    expect(timelineCss).toContain(`:where([data-jx-tl-pending]) :where([data-jx-tl-title])`);
    expect(timelineCss).not.toMatch(/\.jx-tl/);
  });

  it('connectors are authored parts — present on every item including the last', () => {
    const { container } = render(TimelineHost);
    expect(container.querySelectorAll('[data-jx-tl-connector]').length).toBe(2);
  });
});

describe('Timeline family — SSR-honest first paint', () => {
  it('no hydration-only lifecycle path exists in the family sources', () => {
    const sources = familySources('timeline');
    for (const pattern of HYDRATION_ONLY) expect(sources).not.toMatch(pattern);
  });

  it('the first render carries the full anatomy + pending attribute', () => {
    const { container } = render(TimelineHost, { props: { pending: true } });
    const ol = container.querySelector('ol[data-jx-timeline]')!;
    expect(ol.getAttribute('role')).toBe('list');
    const items = [...ol.querySelectorAll(':scope > [data-jx-tl-item]')];
    expect(items.length).toBe(2);
    expect(items[1]!.hasAttribute('data-jx-tl-pending')).toBe(true);
    expect(items[0]!.querySelector('time')!.getAttribute('datetime')).toBe('2026-08-22T07:02:00Z');
    expect(container.querySelectorAll('[data-jx-tl-connector]').length).toBe(2);
    expect(container.querySelector('.tl-body')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Descriptions — composed dt/dd pairs
// ---------------------------------------------------------------------------
describe('Descriptions family — term prop + children value', () => {
  it('renders a dl of dt/dd pairs — no table in sight', () => {
    const { container } = render(DescriptionsHost);
    expect(container.querySelector('dl')!.classList.contains('jx-desc')).toBe(true);
    expect(container.querySelector('table')).toBeNull();
    const terms = [...container.querySelectorAll('dt[data-jx-desc-term]')].map(
      (dt) => dt.textContent,
    );
    expect(terms).toEqual(['build', 'notes']);
    expect(container.querySelector('dd[data-jx-desc-value]')!.textContent).toBe('4f2a');
  });

  it('a childless Item renders the em dash, never a blank cell', () => {
    const { container } = render(DescriptionsHost);
    const values = [...container.querySelectorAll('dd[data-jx-desc-value]')];
    expect(values[1]!.textContent).toBe('—');
  });

  it('columns drives the grid custom property; bordered rides context into the cells', () => {
    const plain = render(DescriptionsHost);
    const dl = plain.container.querySelector('dl')!;
    expect(dl.getAttribute('style')).toContain('--jx-desc-cols: 1');
    expect(dl.hasAttribute('data-jx-desc-bordered')).toBe(false);
    expect(plain.container.querySelector('[data-jx-desc-cell]')!.className).not.toContain(
      'border-b',
    );

    const framed = render(DescriptionsHost, { props: { columns: 2, bordered: true } });
    const dl2 = framed.container.querySelector('dl')!;
    expect(dl2.getAttribute('style')).toContain('--jx-desc-cols: 2');
    expect(dl2.hasAttribute('data-jx-desc-bordered')).toBe(true);
    expect(dl2.className).toContain('border');
    expect(framed.container.querySelector('[data-jx-desc-cell]')!.className).toContain('border-b');
    expect(framed.container.querySelector('[data-jx-desc-term]')!.className).toContain('bg-muted');
  });
});

describe('Descriptions family — SSR-honest first paint', () => {
  it('no hydration-only lifecycle path exists in the family sources', () => {
    const sources = familySources('descriptions');
    for (const pattern of HYDRATION_ONLY) expect(sources).not.toMatch(pattern);
  });

  it('the first render carries the dl grid, terms, values and the em dash', () => {
    const { container } = render(DescriptionsHost, { props: { columns: 2, bordered: true } });
    const dl = container.querySelector('dl')!;
    expect(dl.getAttribute('style')).toContain('--jx-desc-cols: 2');
    expect(dl.hasAttribute('data-jx-desc-bordered')).toBe(true);
    expect(container.querySelectorAll('dt[data-jx-desc-term]').length).toBe(2);
    expect(container.querySelectorAll('dd[data-jx-desc-value]').length).toBe(2);
    expect(container.querySelector('[data-jx-desc-term]')!.textContent).toBe('build');
    expect(container.querySelector('[data-jx-desc-value]')!.textContent).toBe('4f2a');
    expect(container.querySelectorAll('dd[data-jx-desc-value]')[1]!.textContent).toBe('—');
  });
});
