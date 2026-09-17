/**
 * composition-first Batch A lock (test/composition-a.spec.ts, 2026-08-25).
 * The three redesigned families and their composition contracts:
 *
 *   steps       — explicit ordinals, state = pure step-vs-current
 *                 comparison (duplicates/gaps cannot corrupt), the
 *                 done-marker button law, bind:current, connector css
 *   timeline    — Dice anatomy parts, pending as attribute paint,
 *                 free-children body, the W3 drawn spine (one-cell
 *                 grid host + measured svg layer + the css floor)
 *   descriptions— term prop → dt, children → dd, em-dash fallback,
 *                 columns/bordered HOW-props via context
 *
 * SSR completeness (context contract clause 6) is locked as a SOURCE
 * GUARD: the vitest pipeline compiles client-side (browser condition
 * in vitest.config), so svelte/server cannot execute the components —
 * instead these suites pin that NO hydration-only lifecycle path
 * exists in the family sources (timeline's W3 exception: measurement
 * is post-hydration by contract, its floor-pinned replacement lives
 * in the timeline blocks below) while every semantic attribute is
 * asserted on the rendered DOM. CSS whose selectors jsdom cannot
 * apply (self-hides, attribute paint) is pinned as a source guard,
 * per the list-item.spec convention.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { fireEvent, render, waitFor } from '@testing-library/svelte';
import { flushSync } from 'svelte';
import { describe, expect, it } from 'vitest';

import StepsHost from './fixtures/steps-host.svelte';
import TimelineHost from './fixtures/timeline-host.svelte';
import DescriptionsHost from './fixtures/descriptions-host.svelte';
import StepsIndicator from '../src/lib/ui/steps/steps-indicator.svelte';
import StepsTitle from '../src/lib/ui/steps/steps-title.svelte';
import type { StepState } from '../src/lib/ui/steps';

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
    // tailwindless W1: the geometry rides the marker atom (css-source
    // for the channel declarations themselves)
    expect(replaced.className.replace(/\s+/g, '')).toContain('stepsStyles.marker');
    expect(
      readFileSync(resolve(specDir, '../src/lib/ui/steps/steps.stylex.ts'), 'utf8'),
    ).toContain("width: 'var(--jx-icon)'");
    // consumer utilities appended after props.class win the merge
    expect(replaced.className).toContain('ring-1');
  });
});

// ---------------------------------------------------------------------------
// Steps — the 2026-09-02 fix wave: named contract errors (C-3), the
// focus-resting law for unmounting done buttons (C-16), the live glyph
// (C-16), and the clean item interior (no stray template text)
// ---------------------------------------------------------------------------
describe('Steps family — contract errors, focus law, live glyph (2026-09-02)', () => {
  it('StepsIndicator outside a StepsItem throws the NAMED family error, not a bare TypeError (C-3)', () => {
    expect(() => render(StepsIndicator)).toThrowError(
      /StepsIndicator must live inside a StepsItem/,
    );
  });

  it('StepsTitle outside a StepsItem throws the NAMED family error too (C-3)', () => {
    // the cast only satisfies the required-children prop typing — the
    // contract error fires during init, the snippet never renders
    expect(() =>
      render(StepsTitle, { props: { children: (() => {}) as never } }),
    ).toThrowError(/StepsTitle must live inside a StepsItem/);
  });

  it('clicking a done marker parks focus on its item — never body — after the button retires (C-16)', async () => {
    const { container } = render(StepsHost, {
      props: { ordinals: [0, 1, 2], current: 1, interactive: true },
    });
    const items = () => [...container.querySelectorAll('[data-jx-step-item]')];
    const button = container.querySelector('button[data-jx-step-indicator]')! as HTMLButtonElement;
    expect(items()[0]!.getAttribute('tabindex')).toBe('-1'); // the resting slot
    button.focus();
    expect(document.activeElement).toBe(button);
    fireEvent.click(button);
    flushSync(); // the swap lands: done → current ⇒ span form
    expect(container.querySelectorAll('button').length).toBe(0);
    await waitFor(() => expect(document.activeElement).toBe(items()[0]));
  });

  it('the glyph tracks the item ordinal prop — a plain const froze the number at first mount (C-16)', async () => {
    const { container, rerender } = render(StepsHost, { props: { ordinals: [0, 1, 2], current: 1 } });
    const todoGlyph = () =>
      [...container.querySelectorAll('[data-jx-step-item]')].at(-1)!.querySelector('[data-jx-step-index]')!;
    expect(todoGlyph().textContent).toBe('3'); // step 2 → "3"
    await rerender({ ordinals: [0, 1, 4], current: 1 });
    expect(todoGlyph().textContent).toBe('5'); // step 4 → "5", not the stale "3"
  });

  it('the item interior carries no stray template text — only elements and render anchors', () => {
    const { container } = render(StepsHost, {
      props: { ordinals: [0, 1, 2], current: 1, interactive: true },
    });
    for (const li of container.querySelectorAll('[data-jx-step-item]')) {
      const strayText = [...li.childNodes].filter((n) => n.nodeType === Node.TEXT_NODE && n.textContent!.trim());
      expect(strayText, 'template comments must be Svelte comments, never // text').toEqual([]);
    }
    expect(container.innerHTML).not.toContain('// rest');
  });
});

// ---------------------------------------------------------------------------
// Steps — connector css (source guard) + authored separators
// ---------------------------------------------------------------------------
describe('Steps family — the grid anatomy and self-hide (css law)', () => {
  it("steps.css keeps the grid lanes, the real connector box, the state repaints and the last-child self-hide on REAL DOM hooks", () => {
    // the anatomy: marker | body | tail lanes — the connector rides its
    // own lane on the marker's center line, never through the labels
    expect(stepsCss).toContain('[marker] max-content [body] minmax(0, 1fr) [tail]');
    // the connector is a REAL box now (the absolute ::after is retired)
    expect(stepsCss).not.toContain('[data-jx-step-separator])::after');
    expect(stepsCss).toContain('margin-block-start: calc((var(--jx-icon) - 1px) / 2)');
    // the passed states repaint their connector: done (primary), success
    expect(stepsCss).toContain(`:where([data-jx-step='done']) :where([data-jx-step-separator])`);
    expect(stepsCss).toContain(`:where([data-jx-step='success']) :where([data-jx-step-separator])`);
    // the pending middle state breathes (reduced-motion freezes it)
    expect(stepsCss).toContain(`:where([data-jx-step='pending']) :where([data-jx-step-index])`);
    expect(stepsCss).toContain(':where([data-jx-step-item]:last-child) [data-jx-step-separator]');
    // component names never appear in the DOM contract: no .jx-step* class selectors
    expect(stepsCss).not.toMatch(/\.jx-step/);
  });

  it('separators are authored parts — one per item, present in the DOM everywhere', () => {
    const { container } = render(StepsHost, { props: { ordinals: [0, 1, 2], current: 1 } });
    expect(container.querySelectorAll('[data-jx-step-separator]').length).toBe(3);
  });

  // -------------------------------------------------------------------------
  // The state vocabulary — the derived trio's semantic overrides
  // (form in-flight · terminal wins/failures · the NPC marker reading)
  // -------------------------------------------------------------------------
  describe('Steps family — the state vocabulary', () => {
    const last = (container: HTMLElement) =>
      [...container.querySelectorAll('[data-jx-step-item]')].at(-1)!;

    it("the explicit override wins: state='pending' paints the middle state (⋯, breathing)", () => {
      const { container } = render(StepsHost, { props: { lastState: 'pending' } });
      const li = last(container);
      expect(li.getAttribute('data-jx-step')).toBe('pending');
      expect(li.querySelector('[data-jx-step-index]')!.textContent).toBe('⋯');
      // the override is NOT the derived trio's current — no aria-current
      expect(li.getAttribute('aria-current')).toBeNull();
      // the middle state is not a control: never a button
      expect(li.querySelector('button')).toBeNull();
      expect(stepsCss).toContain(`:where([data-jx-step='pending']) :where([data-jx-step-indicator])`);
    });

    it("the terminal states carry their semantic glyphs and pairs: success ✓ / error ✕", () => {
      const win = render(StepsHost, { props: { lastState: 'success' } });
      const winLi = last(win.container);
      expect(winLi.getAttribute('data-jx-step')).toBe('success');
      expect(winLi.querySelector('[data-jx-step-index]')!.textContent).toBe('✓');
      expect(stepsCss).toContain(`:where([data-jx-step='success']) :where([data-jx-step-indicator])`);
      win.unmount();

      const fail = render(StepsHost, { props: { lastState: 'error' } });
      const failLi = last(fail.container);
      expect(failLi.getAttribute('data-jx-step')).toBe('error');
      expect(failLi.querySelector('[data-jx-step-index]')!.textContent).toBe('✕');
      expect(stepsCss).toContain(`:where([data-jx-step='error']) :where([data-jx-step-indicator])`);
    });

    it("hint carries the info pair (i) and emphasis the quest-giver ! (filled)", () => {
      const hint = render(StepsHost, { props: { lastState: 'hint' } });
      const hintLi = last(hint.container);
      expect(hintLi.querySelector('[data-jx-step-index]')!.textContent).toBe('i');
      expect(stepsCss).toContain(`:where([data-jx-step='hint']) :where([data-jx-step-indicator])`);
      hint.unmount();

      const emph = render(StepsHost, { props: { lastState: 'emphasis' } });
      const emphLi = last(emph.container);
      expect(emphLi.querySelector('[data-jx-step-index]')!.textContent).toBe('!');
      // V2-6: emphasis is the hollow + halo ring now (current keeps the
      // fill) — tailwindless W1: the ring rides the css rung (source)
      expect(stepsCss).toContain(`:where([data-jx-step='emphasis']) :where([data-jx-step-indicator])`);
      expect(stepsCss).toContain('box-shadow:');
    });

    it('disabled is a DECLARED out-of-reach — dashed, reduced contrast, SPOKEN — unlike todo (the unreached)', () => {
      const { container } = render(StepsHost, {
        props: { ordinals: [0, 1, 2, 3], current: 1, lastState: 'disabled' },
      });
      const li = last(container);
      expect(li.getAttribute('data-jx-step')).toBe('disabled');
      // the state speaks as TEXT (C-6): aria-disabled on a non-control li
      // is ignored by AT, so disabled rides the sr-only status line
      expect(li.getAttribute('aria-disabled')).toBeNull();
      expect(li.querySelector(':scope > span')!.textContent).toBe('unavailable');
      // V2-6: DISABLED ≠ TODO — dashed ring at reduced contrast (the
      // disabled rung is css-source since tailwindless W1)
      expect(stepsCss).toContain(`:where([data-jx-step='disabled']) :where([data-jx-step-indicator])`);
      expect(stepsCss).toContain('border-style: dashed;');
      // the derived trio's todo NEVER carries the disabled grammar (unreached ≠ disabled)
      const todo = [...container.querySelectorAll('[data-jx-step-item]')].at(-2)!;
      expect(todo.getAttribute('data-jx-step')).toBe('todo');
      expect(todo.getAttribute('aria-disabled')).toBeNull();
      expect(todo.querySelector(':scope > span')!.textContent).toBe('not started');
      expect(stepsCss).not.toContain(`:where([data-jx-step='todo']) :where([data-jx-step-indicator']) {
    border-style: dashed;`);
    });

    it("auto keeps the derived trio byte-identical (the override's default)", () => {
      const { container } = render(StepsHost, { props: { ordinals: [0, 1, 2], current: 1 } });
      const states = [...container.querySelectorAll('[data-jx-step-item]')].map((li) =>
        li.getAttribute('data-jx-step'),
      );
      expect(states).toEqual(['done', 'current', 'todo']);
    });

    it("state='current' carries aria-current=step too (C-2: the effective state decides, not the derivation path)", () => {
      const { container } = render(StepsHost, { props: { lastState: 'current' } });
      const li = last(container);
      expect(li.getAttribute('data-jx-step')).toBe('current');
      expect(li.getAttribute('aria-current')).toBe('step');
      // and it reads as current to AT through the status text as well
      expect(li.querySelector(':scope > span')!.textContent).toBe('current step');
    });

    it('every state is AT-visible as sr-only status text — the words, not the paint (C-6)', () => {
      const words: [StepState, string][] = [
        ['pending', 'in progress'],
        ['success', 'succeeded'],
        ['error', 'failed'],
        ['hint', 'information'],
        ['emphasis', 'attention'],
      ];
      for (const [state, text] of words) {
        const { container } = render(StepsHost, { props: { lastState: state } });
        const li = last(container);
        const status = li.querySelector(':scope > span')!;
        expect(status, state).toBeTruthy();
        expect(status.textContent, state).toBe(text);
        // the status rides FIRST inside the item: state before content
        expect(li.firstElementChild).toBe(status);
      }
      // the trio speaks too
      const trio = render(StepsHost, { props: { ordinals: [0, 1, 2], current: 1 } });
      const texts = [...trio.container.querySelectorAll('[data-jx-step-item] > span:first-child')].map((n) => n.textContent);
      expect(texts).toEqual(['completed', 'current step', 'not started']);
    });

    it('the confusable pairs are shape-separated, not glyph-only (V2-6)', () => {
      const marker = (state: StepState): string => {
        const { container } = render(StepsHost, { props: { lastState: state } });
        return last(container).querySelector('[data-jx-step-indicator]')!.className;
      };
      // PENDING vs DONE: done went SOLID primary; pending stays hollow
      const done = render(StepsHost, {
        props: { ordinals: [0, 1, 2], current: 1, interactive: true },
      }).container.querySelector('button[data-jx-step-indicator]')!;
      expect(stepsCss).toContain(`:where([data-jx-step='done']) :where([data-jx-step-indicator])`);
      expect(stepsCss).toContain(`:where([data-jx-step='pending']) :where([data-jx-step-indicator])`);
      // CURRENT vs EMPHASIS: current keeps the solid fill; emphasis is
      // hollow + halo — the paint rungs are css-source since
      // tailwindless W1 (keyed on the li's data-jx-step state)
      expect(stepsCss).toContain(`:where([data-jx-step='current']) :where([data-jx-step-indicator])`);
      const currentRung = stepsCss.indexOf(`:where([data-jx-step='current']) :where([data-jx-step-indicator])`);
      expect(stepsCss.slice(currentRung)).toContain('background: var(--primary);');
      const emphRung = stepsCss.indexOf(`:where([data-jx-step='emphasis']) :where([data-jx-step-indicator])`);
      expect(stepsCss.slice(emphRung, emphRung + 400)).toContain('background: var(--card);');
      expect(stepsCss.slice(emphRung, emphRung + 400)).toContain('box-shadow:');
      // DISABLED vs TODO: dashed + reduced contrast vs the solid hollow ring
      const disRung = stepsCss.indexOf(`:where([data-jx-step='disabled']) :where([data-jx-step-indicator])`);
      expect(stepsCss.slice(disRung, disRung + 400)).toContain('border-style: dashed;');
      expect(stepsCss.slice(disRung, disRung + 400)).toContain('60%, transparent');
      expect(stepsCss).not.toContain(`:where([data-jx-step='todo']) :where([data-jx-step-indicator]) {
    border-style: dashed;`);
    });
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
  it('ol of items carrying dot, the floor line, content, time and title', () => {
    const { container } = render(TimelineHost);
    const host = container.querySelector('[data-jx-tl-host][data-jx-timeline]')!;
    const ol = host.querySelector(':scope > [data-jx-tl-list]')!;
    expect(ol.tagName).toBe('OL');
    expect(ol.getAttribute('role')).toBe('list');
    const items = [...ol.querySelectorAll(':scope > [data-jx-tl-item]')];
    expect(items.length).toBe(2);
    for (const li of items) {
      expect(li.querySelector('[data-jx-tl-dot]')).toBeTruthy();
      expect(li.querySelector('[data-jx-tl-line]')).toBeTruthy();
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

describe('Timeline family — the drawn-spine engine (W3, 2026-09-15)', () => {
  it('timeline.css carries the subgrid engine, the floor-line essence and the pending pair', () => {
    // the 5-lane list + the item subgrid
    expect(timelineCss).toContain("[data-axis='vertical']");
    expect(timelineCss).toContain('grid-template-columns: subgrid');
    // the floor line: the dot's two block neighbors + the center, bridged
    expect(timelineCss).toContain('grid-row: bs-start / be-end');
    expect(timelineCss).toContain('margin-block-end: calc(-1 * var(--jx-stack))');
    // the 8 logical-direction slot cells
    expect(timelineCss).toContain("[data-dir='bsIs']");
    expect(timelineCss).toContain("[data-dir='beIe']");
    // attribute paint pair
    expect(timelineCss).toContain(':where([data-jx-tl-dot])');
    expect(timelineCss).toContain(`:where([data-jx-tl-pending]) > :where([data-jx-tl-dot])`);
    expect(timelineCss).toContain(':where([data-jx-tl-title])');
    expect(timelineCss).toContain(`:where([data-jx-tl-pending]) :where([data-jx-tl-title])`);
    expect(timelineCss).not.toMatch(/\.jx-tl/);
  });

  it('the one-cell grid host: spine layer and list stack by grid-area, never abspos', () => {
    // the host is a grid; the spine svg and the list share ONE cell
    expect(timelineCss).toMatch(/:where\(\[data-jx-tl-host\]\)\s*\{[^}]*display: grid/);
    expect(timelineCss).toMatch(/grid-area: 1 \/ 1/);
    expect(timelineCss).toContain('[data-jx-tl-spine]');
    expect(timelineCss).toContain('pointer-events: none');
    // the ladder roots at the host AND the list isolates its own
    // (the law's timeline ruling: the TRUE common parent)
    expect(timelineCss).toMatch(/:where\(\[data-jx-tl-host\]\)\s*\{[^}]*isolation: isolate/);
    expect(timelineCss).toMatch(/:where\(\[data-jx-tl-list\]\)\s*\{[^}]*isolation: isolate/);
    // ZERO abspos: the two standing exemptions RETIRED into the svg layer
    expect(timelineCss).not.toMatch(/position:\s*(absolute|relative|sticky)/);
    // the retired machinery is gone: no beam pseudo, no scale-draw
    // keyframes, no progress span channel
    expect(timelineCss).not.toMatch(/jx-tl-beam-v|jx-tl-beam-h|jx-tl-grow-y|jx-tl-grow-x/);
    expect(timelineCss).not.toContain('::after');
  });

  it('the floor line is authored-free on every item — the no-JS paint', () => {
    const { container } = render(TimelineHost);
    expect(container.querySelectorAll('[data-jx-tl-line]').length).toBe(2);
  });

  it('the 9-grid node: spatial slots land as valued data-dir cells', () => {
    const { container } = render(TimelineHost);
    const bs = container.querySelector('[data-jx-tl-slot][data-dir="bs"]');
    expect(bs).toBeTruthy();
    expect(bs!.textContent).toBe('07:02');
  });

  it('the floor/drawn switch retires the per-item line under data-jx-spine=drawn (child-chain scoped)', () => {
    // the css hides floor lines ONLY through the child chain — a nested
    // timeline's floor is its own concern
    expect(timelineCss).toMatch(
      /:where\(\[data-jx-spine='drawn'\] > \[data-jx-tl-list\] > \[data-jx-tl-item\]\) > :where\(\[data-jx-tl-line\]\)/,
    );
  });
});

describe('Timeline family — the floor posture (W3 progressive enhancement)', () => {
  // The W3 rework (2026-09-15) retired the family's zero-lifecycle law
  // for the SPINE only: measurement is post-hydration by contract. The
  // floor law that replaces it: no onMount/onDestroy/addEventListener
  // anywhere, the $effect confined to timeline.svelte's spine mount,
  // and the SSR paint complete (floor lines, anatomy, attributes).
  it("lifecycle is confined to the spine mount + the item's step registration ($effect in the root; the item's ONE registration-only effect, r2)", () => {
    const root = readFileSync(resolve(specDir, '../src/lib/ui/timeline/timeline.svelte'), 'utf8');
    const item = readFileSync(resolve(specDir, '../src/lib/ui/timeline/timeline-item.svelte'), 'utf8');
    for (const pattern of [/onMount\s*\(/, /onDestroy\s*\(/, /addEventListener\s*\(/]) {
      expect(root).not.toMatch(pattern);
      expect(item).not.toMatch(pattern);
    }
    expect(root).toMatch(/\$effect\s*\(/);
    // the value contract (r2) adds the item's step-registration effect —
    // REGISTRATION ONLY: no paint, no geometry, no listener (the floor
    // posture's substance — SSR paints, hydration upgrades — is
    // untouched; the effect count stays exactly one)
    expect((item.match(/\$effect\s*\(/g) ?? []).length).toBe(1);
    expect(item).toMatch(/registerStep/);
    for (const paintPattern of [/getBoundingClientRect/, /\.style\./, /querySelector/]) {
      expect(item).not.toMatch(paintPattern);
    }
  });

  it('the measurement engine degrades to the floor (no ResizeObserver, degenerate boxes)', () => {
    // jsdom: zero boxes + no ResizeObserver — the render must not throw,
    // the floor stays, and the spine never flips to drawn
    const { container } = render(TimelineHost);
    const host = container.querySelector('[data-jx-tl-host]')!;
    expect(host.getAttribute('data-jx-spine')).toBe('floor');
    expect(container.querySelectorAll('[data-jx-tl-line]').length).toBe(2);
    expect(container.querySelector('[data-jx-tl-spine] > path')).toBeNull();
  });

  it('the first render carries the full anatomy + pending attribute', () => {
    const { container } = render(TimelineHost, { props: { pending: true } });
    const host = container.querySelector('[data-jx-tl-host][data-jx-timeline]')!;
    const ol = host.querySelector(':scope > [data-jx-tl-list]')!;
    expect(ol.getAttribute('role')).toBe('list');
    const items = [...ol.querySelectorAll(':scope > [data-jx-tl-item]')];
    expect(items.length).toBe(2);
    expect(items[1]!.hasAttribute('data-jx-tl-pending')).toBe(true);
    expect(items[0]!.querySelector('time')!.getAttribute('datetime')).toBe('2026-08-22T07:02:00Z');
    expect(container.querySelectorAll('[data-jx-tl-line]').length).toBe(2);
    expect(container.querySelector('.tl-body')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Timeline — the drawn-spine laws (W3, 2026-09-15): the stroke-draw
// progress (C-1's abspos channel retired), the of-type end caps (C-4),
// nested-family child-chain scoping (C-15), the dash phase anchor
// (V2-5's SVG successor), the spine seam
// ---------------------------------------------------------------------------
describe('Timeline family — the scroll-progress stroke draw (W3)', () => {
  it("anim='scroll' paints data-anim on the host; the progress stroke is a measured svg path, not the ol's chrome span", () => {
    const { container } = render(TimelineHost, { props: { animation: 'scroll' } });
    const host = container.querySelector('[data-jx-tl-host][data-jx-timeline]')!;
    expect(host.getAttribute('data-anim')).toBe('scroll');
    // the ol carries no chrome span anymore — items only
    const ol = host.querySelector(':scope > [data-jx-tl-list]')!;
    expect([...ol.children].map((li) => li.tagName)).toEqual(['LI', 'LI']);
    // pre-measurement (jsdom degenerate) the progress path never mounts
    expect(container.querySelector('[data-jx-tl-progress]')).toBeNull();
  });

  it('the progress spine is a stroke-dashoffset draw on the measured run path (the abspos/implicit-track machinery retired)', () => {
    // the draw-on keyframes ride the measured run length var
    expect(timelineCss).toMatch(
      /@keyframes jx-tl-progress-draw\s*\{[^@]*stroke-dashoffset: var\(--jx-tl-run\)/s,
    );
    // @supports-gated on the scroll() timeline, axis-keyed
    expect(timelineCss).toMatch(/animation-timeline: scroll\(nearest block\)/);
    expect(timelineCss).toMatch(/animation-timeline: scroll\(nearest inline\)/);
    // the retired channel is gone: no absolute positioning, no long spans
    expect(timelineCss).not.toContain('span 10000');
    expect(timelineCss).not.toMatch(/position:\s*absolute/);
  });

  it('the engine selectors are child-chain scoped through the list (C-15): a nested timeline of another axis cannot be painted by the outer engine', () => {
    // every axis/direction engine selector hops host > list > item
    expect(timelineCss).toMatch(
      /\[data-jx-timeline\]\[data-axis='vertical'\] > \[data-jx-tl-list\] > \[data-jx-tl-item\]/,
    );
    expect(timelineCss).toMatch(
      /\[data-jx-timeline\]\[data-axis='horizontal'\] > \[data-jx-tl-list\] > \[data-jx-tl-item\]/,
    );
    expect(timelineCss).toMatch(
      /\[data-jx-timeline\]\[data-direction='interlaced'\]\[data-axis='vertical'\] > \[data-jx-tl-list\] > \[data-jx-tl-item\]:nth-of-type\(odd\)\) > \[data-jx-tl-content\]/,
    );
    // no bare descendant axis hop survives anywhere in the sheet
    expect(timelineCss).not.toMatch(/\[data-axis='[a-z]+'\] \[data-jx-tl-/);
    expect(timelineCss).not.toMatch(/\[data-direction='[a-z]+'\] \[data-jx-tl-/);
  });

  it('end-caps and interlaced phases count li TYPES, not children (C-4)', () => {
    expect(timelineCss).toMatch(/\[data-jx-tl-item\]:first-of-type\) > \[data-jx-tl-line\]/);
    expect(timelineCss).toMatch(/\[data-jx-tl-item\]:last-of-type\) > \[data-jx-tl-line\]/);
    expect(timelineCss).not.toContain(':first-child');
    expect(timelineCss).not.toContain(':nth-child(');
  });

  it('the dashed preset phase-anchors a dash START at the node flow-end edge (V2-5 SVG successor)', () => {
    // the segments carry stroke-dasharray + the measured edge phase
    const root = readFileSync(resolve(specDir, '../src/lib/ui/timeline/timeline.svelte'), 'utf8');
    expect(root).toContain('stroke-dasharray="4 4"');
    expect(root).toContain('stroke-dashoffset={segment.edgePhase}');
    expect(timelineCss).toMatch(/:where\(\[data-jx-tl-spine\] > \[data-jx-tl-seg\]\)/);
    // the phase math lives in the measurement runtime (measured radius,
    // so density scales anchor for free) — the background-position
    // tiling retired with the per-item backgrounds
    expect(timelineCss).not.toContain('repeating-linear-gradient');
    const runtime = readFileSync(
      resolve(specDir, '../src/lib/ui/timeline/timeline-spine.svelte.ts'),
      'utf8',
    );
    expect(runtime).toMatch(/TIMELINE_DASH_PERIOD - \(nodeRadius % TIMELINE_DASH_PERIOD\)/);
  });
});

describe('Timeline family — the spine seam (W3: presets or a geometry-payload snippet)', () => {
  it("a preset string keeps the floor pre-measurement and names the spine on the host's data attrs", () => {
    const { container } = render(TimelineHost, { props: { spine: 'dashed' } });
    const host = container.querySelector('[data-jx-tl-host]')!;
    expect(host.getAttribute('data-axis')).toBe('vertical');
    expect(host.getAttribute('data-direction')).toBe('ltr');
    // degenerate box: the floor stays the paint
    expect(container.querySelectorAll('[data-jx-tl-line]').length).toBe(2);
    expect(container.querySelector('[data-testid="tl-custom-spine"]')).toBeNull();
  });

  it('the spine prop accepts a custom snippet — the geometry payload is the documented seam (source guard: jsdom never measures)', () => {
    const root = readFileSync(resolve(specDir, '../src/lib/ui/timeline/timeline.svelte'), 'utf8');
    expect(root).toMatch(/spine\?: TimelineSpinePreset \| Snippet<\[TimelineSpineGeometry\]>/);
    expect(root).toContain('{@render spine(geometry)}');
    // the retired line(i) seam is GONE from the family sources
    expect(root).not.toContain('THE line(index) SEAM CONTRACT');
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
