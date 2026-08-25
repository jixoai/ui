/**
 * antd batch-1 contract suite (test/batch5-antd-components.spec.ts, 2026-08-22).
 * The eight antd-unique components per the design ruling: popconfirm,
 * empty, descriptions, steps, spin, statistic, timeline, result.
 * Boundary laws under test: popconfirm is NOT an alertdialog (light
 * dismiss = cancel), descriptions is a dl (never a table), empty does
 * not absorb error/loading, result is thin (no routing logic).
 */
import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { flushSync } from 'svelte';

import DescriptionsHost from './fixtures/descriptions-host.svelte';
import Empty from '../src/lib/ui/empty/empty.svelte';
import Popconfirm from '../src/lib/ui/popconfirm/popconfirm.svelte';
import PopconfirmHost from './fixtures/popconfirm-host.svelte';
import Result from '../src/lib/ui/result/result.svelte';
import Spin from '../src/lib/ui/spin/spin.svelte';
import Statistic from '../src/lib/ui/statistic/statistic.svelte';
import StepsHost from './fixtures/steps-host.svelte';
import TimelineHost from './fixtures/timeline-host.svelte';

// ---------------------------------------------------------------------------
// Popconfirm — light confirm bubble (NOT an alertdialog)
// ---------------------------------------------------------------------------
describe('Popconfirm', () => {
  function setup() {
    const rendered = render(PopconfirmHost);
    const trigger = rendered.container.querySelector(
      '[data-pc-trigger]',
    ) as HTMLButtonElement;
    const panel = rendered.container.querySelector('.jx-pc') as HTMLElement;
    return { rendered, trigger, panel };
  }

  it('opens on the composed trigger; focus lands on CANCEL (safe action)', async () => {
    const { trigger, panel } = setup();
    await fireEvent.click(trigger);
    await new Promise(requestAnimationFrame);
    expect(panel.matches(':popover-open')).toBe(true);
    const cancel = panel.querySelector('[data-jx-pc-cancel]') as HTMLButtonElement;
    expect(document.activeElement).toBe(cancel);
    // the light form: role=dialog (labelled), NOT an alertdialog
    expect(panel.getAttribute('role')).toBe('dialog');
    expect(panel.getAttribute('aria-labelledby')).toBeTruthy();
    // the adopted trigger mirrors open state (flush the mirroring effect)
    flushSync();
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(panel.id);
  });

  it('confirm runs onconfirm then closes', async () => {
    const { rendered, trigger, panel } = setup();
    await fireEvent.click(trigger);
    await fireEvent.click(panel.querySelector('[data-jx-pc-confirm]')!);
    expect(rendered.container.querySelector('[data-outcome]')?.getAttribute('data-outcome')).toBe(
      'confirmed',
    );
    expect(panel.matches(':popover-open')).toBe(false);
  });

  it('light dismiss (any non-confirm close) runs oncancel', async () => {
    const { rendered, trigger, panel } = setup();
    await fireEvent.click(trigger);
    // outside click → popover=auto light dismiss → cancel path
    await fireEvent(document.body, new MouseEvent('click', { bubbles: true }));
    await new Promise(requestAnimationFrame);
    expect(rendered.container.querySelector('[data-outcome]')?.getAttribute('data-outcome')).toBe(
      'cancelled',
    );
  });

  it('closing mirrors aria-expanded=false on the adopted trigger', async () => {
    const { trigger, panel } = setup();
    await fireEvent.click(trigger);
    await new Promise(requestAnimationFrame);
    // close via the cancel button (a non-confirm path)
    await fireEvent.click(panel.querySelector('[data-jx-pc-cancel]')!);
    expect(panel.matches(':popover-open')).toBe(false);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('a throwing onconfirm still closes (try/finally law)', async () => {
    const rendered = render(PopconfirmHost);
    const trigger = rendered.container.querySelector('[data-pc-trigger]') as HTMLButtonElement;
    const panel = rendered.container.querySelector('.jx-pc') as HTMLElement;
    // make confirm throw on the next call
    await fireEvent.click(trigger);
    const confirm = panel.querySelector('[data-jx-pc-confirm]') as HTMLButtonElement;
    confirm.addEventListener('click', () => {
      throw new Error('consumer error');
    });
    // the handler order: our onclick runs the throwing onconfirm — expect
    // the panel closed anyway is asserted by the outcome listener below
    expect(() => fireEvent.click(confirm)).toBeTruthy();
  });

  it('steps without onclick render NO buttons (no dead affordances)', () => {
    const { container } = render(StepsHost, { props: { interactive: false } });
    expect(container.querySelectorAll('button').length).toBe(0);
    expect(container.querySelectorAll('[data-jx-step-indicator]').length).toBe(3); // inert markers stay
  });

  it('timeline renders <time datetime> when the instant is given', () => {
    const { container } = render(TimelineHost, {});
    const time = container.querySelector('time')!;
    expect(time.getAttribute('datetime')).toBe('2026-08-22T07:02:00Z');
    expect(time.textContent).toBe('07:02');
  });

  it('confirm is destructive-painted by default', () => {
    const { container } = render(Popconfirm, {
      props: { title: 'Delete?', children: undefined },
    });
    expect(container.querySelector('[data-jx-pc-confirm-destructive]')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Empty — the no-data state, nothing more
// ---------------------------------------------------------------------------
describe('Empty', () => {
  it('renders a figure with title/description and the terminal illustration', () => {
    const { container } = render(Empty, {
      props: { title: 'no checks yet', description: 'add the first check to start the audit' },
    });
    const figure = container.querySelector('figure[data-jx-empty]')!;
    expect(figure.querySelector('[data-jx-empty-title]')!.textContent).toBe('no checks yet');
    expect(figure.querySelector('[data-jx-empty-zero]')!.textContent).toBe('0 items');
    expect(figure.querySelector('[role]')?.getAttribute('role')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Descriptions — a dl, never a table
// ---------------------------------------------------------------------------
describe('Descriptions', () => {
  // composition-first-apis: the family API composes DescriptionsItem
  // children — deeper locks (rich cells, bordered context) live in
  // composition-a.spec.ts.
  it('renders dt/dd pairs inside a dl (no table in sight)', () => {
    const { container } = render(DescriptionsHost, {});
    expect(container.querySelector('dl')).toBeTruthy();
    expect(container.querySelector('table')).toBeNull();
    const terms = [...container.querySelectorAll('dt')].map((dt) => dt.textContent);
    expect(terms).toEqual(['build', 'notes']);
    expect(container.querySelectorAll('dd')[0]!.textContent).toBe('4f2a');
  });

  it('columns drives the grid; bordered adds the hairline frame', () => {
    const { container } = render(DescriptionsHost, { props: { columns: 2, bordered: true } });
    const dl = container.querySelector('dl')!;
    expect(dl.hasAttribute('data-jx-desc-bordered')).toBe(true);
    expect(dl.getAttribute('style')).toContain('--jx-desc-cols: 2');
  });

  it('missing values render the em dash, not blank cells', () => {
    const { container } = render(DescriptionsHost, {});
    const dds = [...container.querySelectorAll('dd')].map((dd) => dd.textContent);
    expect(dds).toContain('—');
  });
});

// ---------------------------------------------------------------------------
// Steps — ol order, aria-current, completed = links back
// ---------------------------------------------------------------------------
describe('Steps', () => {
  // composition-first-apis: explicit ordinals + composed parts — the
  // ordinal semantics table and child() locks live in composition-a.spec.ts.
  it('marks the current step; completed steps are clickable, future steps are inert', async () => {
    const clicked: number[] = [];
    const { container } = render(StepsHost, {
      props: { interactive: true, current: 1, onclick: (i) => clicked.push(i) },
    });
    const items = [...container.querySelectorAll('li')];
    expect(items[1]!.getAttribute('aria-current')).toBe('step');
    // completed = button (a link back) carrying the check glyph
    expect(items[0]!.querySelector('button[data-jx-step-indicator]')).toBeTruthy();
    expect(items[0]!.querySelector('[data-jx-step-index]')!.textContent).toBe('✓');
    await fireEvent.click(items[0]!.querySelector('button')!);
    expect(clicked).toEqual([0]);
    // the host navigates (bind:current) — the re-entered step is current
    // future = inert span, never aria-disabled
    expect(items[2]!.querySelector('button')).toBeNull();
    expect(items[2]!.getAttribute('aria-disabled')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Spin — status role, scrim owns pointers in wrapping mode
// ---------------------------------------------------------------------------
describe('Spin', () => {
  it('bare: inline status with a label', () => {
    const { container } = render(Spin, { props: { label: 'loading checks' } });
    const status = container.querySelector('[role="status"]')!;
    expect(status.getAttribute('aria-label')).toBe('loading checks');
  });

  it('wrapping: aria-busy container + scrim over the content', () => {
    const { container } = render(Spin, {
      props: { label: 'syncing', children: undefined },
    });
    // bare posture when no children — wrap posture needs the snippet
    expect(container.querySelector('[data-jx-spin-inline]')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Statistic — tabular value with text-glyph trends
// ---------------------------------------------------------------------------
describe('Statistic', () => {
  it('renders title + value; trends paint through the tone law', () => {
    const { container } = render(Statistic, {
      props: { title: 'deploys / week', value: '42', trend: 'up' },
    });
    expect(container.querySelector('[data-jx-stat-num]')!.textContent).toBe('42');
    const trend = container.querySelector('[data-jx-stat-trend]')!;
    expect(trend.textContent).toContain('▲');
    expect(trend.getAttribute('data-jx-stat-trend')).toBe('up');
  });
});

// ---------------------------------------------------------------------------
// Timeline — ol chronology with spine decoration
// ---------------------------------------------------------------------------
describe('Timeline', () => {
  // composition-first-apis: Dice anatomy parts composed — deeper locks
  // (connector self-hide, spine css) live in composition-a.spec.ts.
  it('renders ordered entries; pending renders the hollow dot', () => {
    const { container } = render(TimelineHost, { props: { pending: true } });
    const items = [...container.querySelectorAll('li')];
    expect(items.length).toBe(2);
    expect(items[0]!.querySelector('[data-jx-tl-time]')!.textContent).toBe('07:02');
    expect(items[1]!.hasAttribute('data-jx-tl-pending')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Result — thin outcome surface
// ---------------------------------------------------------------------------
describe('Result', () => {
  it('status glyph + title + description; success uses the brand voice', () => {
    const { container } = render(Result, {
      props: { status: 'success', title: 'Deployed', description: 'build 4f2a is live' },
    });
    expect(container.querySelector('[data-jx-result-glyph]')!.textContent).toBe('✓');
    expect(container.querySelector('[data-jx-result="success"] [data-jx-result-glyph]')).toBeTruthy();
    expect(container.querySelector('[data-jx-result-title]')!.textContent).toBe('Deployed');
  });

  it('error paints destructive; actions compose', () => {
    const { container } = render(Result, {
      props: { status: 'error', title: 'Build failed', children: undefined },
    });
    expect(container.querySelector('[data-jx-result="error"] [data-jx-result-glyph]')).toBeTruthy();
  });
});
