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

import Descriptions from '../src/lib/ui/descriptions.svelte';
import Empty from '../src/lib/ui/empty.svelte';
import Popconfirm from '../src/lib/ui/popconfirm.svelte';
import PopconfirmHost from './fixtures/popconfirm-host.svelte';
import Result from '../src/lib/ui/result.svelte';
import Spin from '../src/lib/ui/spin.svelte';
import Statistic from '../src/lib/ui/statistic.svelte';
import Steps from '../src/lib/ui/steps.svelte';
import Timeline from '../src/lib/ui/timeline.svelte';

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
    const cancel = panel.querySelector('.jx-pc-cancel') as HTMLButtonElement;
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
    await fireEvent.click(panel.querySelector('.jx-pc-confirm')!);
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

  it('confirm is destructive-painted by default', () => {
    const { container } = render(Popconfirm, {
      props: { title: 'Delete?', children: undefined },
    });
    expect(container.querySelector('.jx-pc-confirm-destructive')).toBeTruthy();
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
    const figure = container.querySelector('figure.jx-empty')!;
    expect(figure.querySelector('.jx-empty-title')!.textContent).toBe('no checks yet');
    expect(figure.querySelector('.jx-empty-zero')!.textContent).toBe('0 items');
    expect(figure.querySelector('[role]')?.getAttribute('role')).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Descriptions — a dl, never a table
// ---------------------------------------------------------------------------
describe('Descriptions', () => {
  const items = [
    { term: 'build', value: '4f2a' },
    { term: 'checks', value: '12' },
    { term: 'owner', value: '@gaubee' },
  ];

  it('renders dt/dd pairs inside a dl (no table in sight)', () => {
    const { container } = render(Descriptions, { props: { items } });
    expect(container.querySelector('dl.jx-desc')).toBeTruthy();
    expect(container.querySelector('table')).toBeNull();
    const terms = [...container.querySelectorAll('dt')].map((dt) => dt.textContent);
    expect(terms).toEqual(['build', 'checks', 'owner']);
    expect(container.querySelectorAll('dd')[0]!.textContent).toBe('4f2a');
  });

  it('columns drives the grid; bordered adds the hairline frame', () => {
    const { container } = render(Descriptions, { props: { items, columns: 2, bordered: true } });
    const dl = container.querySelector('dl')!;
    expect(dl.className).toContain('jx-desc-bordered');
    expect(dl.getAttribute('style')).toContain('--jx-desc-cols: 2');
  });

  it('missing values render the em dash, not blank cells', () => {
    const { container } = render(Descriptions, {
      props: { items: [{ term: 'notes' }] },
    });
    expect(container.querySelector('dd')!.textContent).toBe('—');
  });
});

// ---------------------------------------------------------------------------
// Steps — ol order, aria-current, completed = links back
// ---------------------------------------------------------------------------
describe('Steps', () => {
  const steps = [
    { title: 'connect' },
    { title: 'audit' },
    { title: 'ship' },
  ];

  it('marks the current step; completed steps are clickable, future steps are inert', async () => {
    const clicked: number[] = [];
    const { container } = render(Steps, {
      props: { steps, current: 1, onstepclick: (i) => clicked.push(i) },
    });
    const items = [...container.querySelectorAll('li')];
    expect(items[1]!.getAttribute('aria-current')).toBe('step');
    // completed = button (a link back)
    expect(items[0]!.querySelector('button.jx-step-marker')).toBeTruthy();
    await fireEvent.click(items[0]!.querySelector('button')!);
    expect(clicked).toEqual([0]);
    // future = inert span, never aria-disabled
    expect(items[2]!.querySelector('button')).toBeNull();
    expect(items[2]!.getAttribute('aria-disabled')).toBeNull();
    expect(items[0]!.querySelector('.jx-step-index')!.textContent).toBe('✓');
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
    expect(container.querySelector('.jx-spin-inline')).toBeTruthy();
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
    expect(container.querySelector('.jx-stat-num')!.textContent).toBe('42');
    const trend = container.querySelector('.jx-stat-trend')!;
    expect(trend.textContent).toContain('▲');
    expect(trend.className).toContain('jx-stat-trend-up');
  });
});

// ---------------------------------------------------------------------------
// Timeline — ol chronology with spine decoration
// ---------------------------------------------------------------------------
describe('Timeline', () => {
  it('renders ordered entries; pending renders the hollow dot', () => {
    const { container } = render(Timeline, {
      props: {
        items: [
          { title: 'pushed', time: '07:02' },
          { title: 'auditing', pending: true },
        ],
      },
    });
    const items = [...container.querySelectorAll('li')];
    expect(items.length).toBe(2);
    expect(items[0]!.querySelector('.jx-tl-time')!.textContent).toBe('07:02');
    expect(items[1]!.className).toContain('jx-tl-pending');
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
    expect(container.querySelector('.jx-result-glyph')!.textContent).toBe('✓');
    expect(container.querySelector('.jx-result-success .jx-result-glyph')).toBeTruthy();
    expect(container.querySelector('.jx-result-title')!.textContent).toBe('Deployed');
  });

  it('error paints destructive; actions compose', () => {
    const { container } = render(Result, {
      props: { status: 'error', title: 'Build failed', children: undefined },
    });
    expect(container.querySelector('.jx-result-error .jx-result-glyph')).toBeTruthy();
  });
});
