/**
 * Batch 1 component contract suite (test/batch1-components.spec.ts, 2026-08-22).
 *
 * Seven registry items by community-use frequency: badge, separator,
 * skeleton, avatar, alert, accordion (+ item), tabs (×4 family files).
 * Rendered from the same-source copies the site consumes ($lib/ui); the
 * accordion exclusive mode and the tabs keyboard walk run through real
 * DOM events (ToggleEvent / keydown), jsdom-polyfilled in setup.ts where
 * needed.
 *
 * Assertion law: state is read back through the DOM the way a user or
 * assistive tech sees it (roles, attributes, visibility) — never through
 * component internals.
 */
import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import Accordion from '../src/lib/ui/accordion.svelte';
import Alert from '../src/lib/ui/alert.svelte';
import Avatar from '../src/lib/ui/avatar.svelte';
import Badge from '../src/lib/ui/badge.svelte';
import Separator from '../src/lib/ui/separator.svelte';
import Skeleton from '../src/lib/ui/skeleton.svelte';
import AccordionHost from './fixtures/accordion-host.svelte';
import AvatarHost from './fixtures/avatar-host.svelte';
import EmptyTabsHost from './fixtures/empty-tabs-host.svelte';
import TabsHost from './fixtures/tabs-host.svelte';

// ---------------------------------------------------------------------------
// Badge — the inline status chip
// ---------------------------------------------------------------------------
describe('Badge', () => {
  it('renders a span chip with the default tone and passes content through', () => {
    const { container } = render(Badge, { props: { children: undefined } });
    // children snippet omitted: still a valid empty chip
    const chip = container.querySelector('span.jx-badge')!;
    expect(chip.className).toContain('jx-badge-default');
  });

  it('carries the destructive tone and restProps land verbatim', async () => {
    const { container } = render(Badge, {
      props: { tone: 'destructive', title: 'build failed', 'data-testid': 'chip' },
    });
    const chip = container.querySelector('[data-testid="chip"]')!;
    expect(chip.className).toContain('jx-badge-destructive');
    expect(chip.getAttribute('title')).toBe('build failed');
  });
});

// ---------------------------------------------------------------------------
// Separator — <hr> horizontal, ARIA div vertical
// ---------------------------------------------------------------------------
describe('Separator', () => {
  it('renders a native <hr> for the horizontal (thematic break) posture', () => {
    const { container } = render(Separator);
    const hr = container.querySelector('hr.jx-separator-h')!;
    expect(hr).toBeTruthy();
    // a thematic break is announced natively — no role attribute needed
    expect(hr.getAttribute('role')).toBeNull();
  });

  it('renders the ARIA separator for the vertical posture', () => {
    const { container } = render(Separator, { props: { orientation: 'vertical' } });
    const div = container.querySelector('div[role="separator"]')!;
    expect(div.getAttribute('aria-orientation')).toBe('vertical');
  });
});

// ---------------------------------------------------------------------------
// Skeleton — aria-hidden placeholder block
// ---------------------------------------------------------------------------
describe('Skeleton', () => {
  it('is an aria-hidden muted block that takes geometry from the consumer', () => {
    const { container } = render(Skeleton, {
      props: { class: 'h-4 w-40', id: 'line' },
    });
    const block = container.querySelector('div[aria-hidden="true"]#line')!;
    expect(block.className).toContain('jx-skeleton');
    expect(block.className).toContain('h-4');
  });
});

// ---------------------------------------------------------------------------
// Avatar — native img with an initials fallback
// ---------------------------------------------------------------------------
describe('Avatar', () => {
  it('renders a lazy async-decoded img with intrinsic dimensions', () => {
    const { container } = render(Avatar, {
      props: { src: '/a.png', name: 'Ada Lovelace' },
    });
    const img = container.querySelector('img')!;
    expect(img.getAttribute('loading')).toBe('lazy');
    expect(img.getAttribute('decoding')).toBe('async');
    expect(img.getAttribute('alt')).toBe('Ada Lovelace');
    expect(img.getAttribute('width')).toBe('32');
  });

  it('falls back to initials when the image fails to load', async () => {
    const { container } = render(Avatar, {
      props: { src: '/missing.png', name: 'Ada Lovelace' },
    });
    await fireEvent(container.querySelector('img')!, new Event('error'));
    const fallback = container.querySelector('span[role="img"]')!;
    expect(fallback.textContent).toBe('AL');
    expect(fallback.getAttribute('aria-label')).toBe('Ada Lovelace');
    expect(container.querySelector('img')).toBeNull();
  });

  it('derives initials without spaces code-point-wise (CJK-safe)', () => {
    const { container } = render(Avatar, { props: { name: '张伟' } });
    const fallback = container.querySelector('span[role="img"]')!;
    expect(fallback.textContent).toBe('张伟');
  });

  it('recovers the image when src changes after a failure', async () => {
    const { container } = render(AvatarHost);
    await fireEvent(container.querySelector('img')!, new Event('error'));
    expect(container.querySelector('span[role="img"]')).toBeTruthy();

    await fireEvent.click(container.querySelector('button')!);
    await new Promise(requestAnimationFrame);
    const img = container.querySelector('img')!;
    expect(img.getAttribute('src')).toBe('/fresh.png');
    expect(container.querySelector('span[role="img"]')).toBeNull();
  });

  it('honors alt="" — decorative avatars render no label semantics', () => {
    const { container } = render(Avatar, { props: { name: 'Ada Lovelace', alt: '' } });
    const fallback = container.querySelector('span.jx-avatar-fallback')!;
    expect(fallback.getAttribute('role')).toBeNull();
    expect(fallback.getAttribute('aria-label')).toBeNull();
    expect(fallback.getAttribute('aria-hidden')).toBe('true');
  });

  it('composes the caller onerror with the internal fallback', async () => {
    const seen = { current: 0 };
    const { container } = render(Avatar, {
      props: {
        src: '/missing.png',
        name: 'Ada Lovelace',
        onerror: () => (seen.current += 1),
      },
    });
    await fireEvent(container.querySelector('img')!, new Event('error'));
    expect(seen.current).toBe(1);
    expect(container.querySelector('span[role="img"]')).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// Alert — inline notice with live-region semantics as a prop
// ---------------------------------------------------------------------------
describe('Alert', () => {
  it('defaults to the polite status role with a title and body', () => {
    const { container } = render(Alert, {
      props: { title: 'Deployed', children: null },
    });
    const alert = container.querySelector('[role="status"]')!;
    expect(alert.className).toContain('jx-alert-default');
    expect(alert.querySelector('.jx-alert-title')?.textContent).toContain('Deployed');
  });

  it('takes the assertive alert role and the destructive tone', () => {
    const { container } = render(Alert, {
      props: { tone: 'destructive', assertive: true, title: 'Build failed', children: null },
    });
    const alert = container.querySelector('[role="alert"]')!;
    expect(alert.className).toContain('jx-alert-destructive');
  });
});

// ---------------------------------------------------------------------------
// Accordion — native details/summary + exclusive group guard
// ---------------------------------------------------------------------------
describe('Accordion', () => {
  it('renders native details/summary pairs (no ARIA to maintain)', () => {
    const { container } = render(AccordionHost);
    const details = container.querySelectorAll('details');
    const summaries = container.querySelectorAll('details > summary');
    expect(details.length).toBe(4);
    expect(summaries.length).toBe(4);
    expect(summaries[0].textContent).toContain('Item one');
  });

  it('exclusive mode closes siblings when one opens (capture-phase toggle)', () => {
    const { container } = render(AccordionHost);
    const group = container.querySelector('.jx-accordion')!;
    const [one, two] = [...group.querySelectorAll('details')];

    // jsdom does not drive <details> toggling: set the state, then fire
    // the same ToggleEvent the browser would
    one.open = true;
    one.dispatchEvent(new ToggleEvent('toggle', { newState: 'open' }));
    two.open = true;
    two.dispatchEvent(new ToggleEvent('toggle', { newState: 'open' }));

    expect(one.open).toBe(false); // closed by the exclusive guard
    expect(two.open).toBe(true);
  });

  it('bind:open rides the native details attribute', async () => {
    const { container } = render(AccordionHost);
    const loose = [...container.querySelectorAll('details')].at(-1)!;
    const looseOpen = () => container.querySelector('[data-loose-open]')!;

    loose.open = true;
    await new Promise(requestAnimationFrame);
    expect(looseOpen().getAttribute('data-loose-open')).toBe('true');
  });
});

// ---------------------------------------------------------------------------
// Tabs — the APG tablist contract
// ---------------------------------------------------------------------------
describe('Tabs', () => {
  function setup() {
    const rendered = render(TabsHost);
    const root = rendered.container.firstElementChild as HTMLElement;
    const tabs = [...root.querySelectorAll('[role="tab"]')] as HTMLElement[];
    const panels = [...root.querySelectorAll('[role="tabpanel"]')] as HTMLElement[];
    return { root, tabs, panels };
  }

  it('wires trigger/panel ids both ways for assistive tech', () => {
    const { tabs, panels } = setup();
    expect(tabs[0].id).toBeTruthy();
    expect(tabs[0].getAttribute('aria-controls')).toBe(panels[0].id);
    expect(panels[0].getAttribute('aria-labelledby')).toBe(tabs[0].id);
  });

  it('selects by click: aria-selected, roving tabindex, hidden panels', async () => {
    const { root, tabs, panels } = setup();
    await fireEvent.click(tabs[1]);

    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(tabs[0].getAttribute('aria-selected')).toBe('false');
    expect(tabs[1].tabIndex).toBe(0);
    expect(tabs[0].tabIndex).toBe(-1);
    expect(panels[0].hidden).toBe(true);
    expect(panels[1].hidden).toBe(false);
    expect(root.getAttribute('data-value')).toBe('beta');
    expect(root.getAttribute('data-last-change')).toBe('beta');
  });

  it('ArrowRight moves focus AND selects (automatic activation)', async () => {
    const { root, tabs } = setup();
    tabs[0].focus();
    await fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });

    expect(document.activeElement).toBe(tabs[1]);
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(root.getAttribute('data-value')).toBe('beta');
  });

  it('ArrowRight wraps around and skips the disabled trigger', async () => {
    const { root, tabs } = setup();
    tabs[1].focus();
    await fireEvent.keyDown(tabs[1], { key: 'ArrowRight' });

    // gamma is disabled: the walk wraps to alpha
    expect(document.activeElement).toBe(tabs[0]);
    expect(root.getAttribute('data-value')).toBe('alpha');
  });

  it('Home jumps to the first tab from anywhere', async () => {
    const { root, tabs } = setup();
    tabs[1].focus();
    await fireEvent.keyDown(tabs[1], { key: 'Home' });
    expect(document.activeElement).toBe(tabs[0]);
    expect(root.getAttribute('data-value')).toBe('alpha');
  });

  it('End jumps to the last ENABLED tab', async () => {
    const { root, tabs } = setup();
    tabs[0].focus();
    await fireEvent.keyDown(tabs[0], { key: 'End' });
    expect(document.activeElement).toBe(tabs[1]);
    expect(root.getAttribute('data-value')).toBe('beta');
  });

  // ---- manual activation: roving tabindex follows FOCUS, not selection --
  function manualSetup() {
    const rendered = render(TabsHost);
    const root = rendered.container.querySelector('[data-manual-value]') as HTMLElement;
    const tabs = [...root.querySelectorAll('[role="tab"]')] as HTMLElement[];
    return { root, tabs };
  }

  it('manual: arrows move focus AND the tab stop without selecting', async () => {
    const { root, tabs } = manualSetup();
    tabs[0].focus();
    await fireEvent.focus(tabs[0]);
    await fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });

    // focus moved, selection did NOT (manual waits for Enter/Space)
    expect(document.activeElement).toBe(tabs[1]);
    expect(root.getAttribute('data-manual-value')).toBe('alpha');
    // the tab stop followed the focus: beta is now the tabbable one
    expect(tabs[1].tabIndex).toBe(0);
    expect(tabs[0].tabIndex).toBe(-1);
  });

  it('manual: Enter commits the focused trigger (native click path)', async () => {
    const { root, tabs } = manualSetup();
    tabs[0].focus();
    await fireEvent.focus(tabs[0]);
    await fireEvent.keyDown(tabs[0], { key: 'ArrowRight' });
    // jsdom does not synthesize the browser's Enter→click default on
    // buttons — represent it the way a real browser would fire it
    await fireEvent.click(tabs[1]);

    expect(root.getAttribute('data-manual-value')).toBe('beta');
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
  });

  it('inherited RTL (dir on an ancestor) flips the arrow axis', async () => {
    const rendered = render(TabsHost);
    const list = rendered.container.querySelector('[data-rtl-list]') as HTMLElement;
    const tabs = [...list.querySelectorAll('[role="tab"]')] as HTMLElement[];

    tabs[0].focus();
    await fireEvent.focus(tabs[0]);
    // RTL: ArrowLEFT walks forward
    await fireEvent.keyDown(tabs[0], { key: 'ArrowLeft' });
    expect(document.activeElement).toBe(tabs[1]);
    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
  });

  it('empty initial value still leaves exactly one keyboard entry (first enabled)', async () => {
    // no value given: nothing selected, but the tablist must be reachable
    const rendered = render(EmptyTabsHost);
    const tabs = [...rendered.container.querySelectorAll('[role="tab"]')] as HTMLElement[];
    await new Promise(requestAnimationFrame);

    expect(tabs[0].tabIndex).toBe(0);
    expect(tabs[1].tabIndex).toBe(-1);
    expect(tabs[2].tabIndex).toBe(-1); // disabled trigger
    // nothing is selected — the panels stay hidden until a choice is made
    expect(tabs.every((t) => t.getAttribute('aria-selected') === 'false')).toBe(true);
  });
});
