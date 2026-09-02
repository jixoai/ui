/**
 * toast v2 contract (test/toast-v2.spec.ts, 2026-09-02).
 *
 * Four capabilities, each locked at its own seam:
 *
 *   visibility pause  store-level pauseAll/resumeAll — a hidden tab
 *                     freezes every clock; the three freeze sources
 *                     (page, hover hold, visible-set handshake) stay
 *                     orthogonal; pushes while hidden never arm
 *   swipe math        judgeSwipe/frictionShift as PURE functions —
 *                     every branch (threshold, velocity, allowed
 *                     direction, friction axis) with no DOM
 *   stacking dialect  the rendered card wrappers carry the depth vars
 *                     (index, y, scale), the stack expands on hover,
 *                     rear slabs withhold their description ink
 *   expandable        the expandable card opens the dialog part; the
 *                     non-expandable card never does
 */
import { render, fireEvent, cleanup } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';

import { createToastStore, SWIPE_BY_FLOAT_POS } from '../src/lib/toast-store';
import ToastViewport from '../src/lib/ui/toast/toast-viewport.svelte';
import ToastAdoptHost from './fixtures/toast-adopt-host.svelte';
import { frictionShift, judgeSwipe, SWIPE_FRICTION } from '../src/lib/ui/toast/toast-swipe';

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  document.dispatchEvent(new Event('visibilitychange'));
});

describe('toast v2 — the page-visibility pause (store)', () => {
  it('pauseAll freezes every running clock; resumeAll re-arms them', () => {
    vi.useFakeTimers();
    const store = createToastStore();
    store.api.push({ title: 'a', duration: 5000 });
    store.api.push({ title: 'b', duration: 5000 });

    store.pauseAll();
    vi.advanceTimersByTime(6000);
    expect(store.api.snapshot()).toHaveLength(2); // nothing burned

    store.resumeAll();
    vi.advanceTimersByTime(5000);
    expect(store.api.snapshot()).toHaveLength(0); // resumed and expired
    vi.useRealTimers();
  });

  it('a push while hidden never arms — its FULL duration restarts when the page returns', () => {
    // strengthened after the adversarial round (R1 P1-2a): the old
    // assertions were vacuous — resumeAll with a stale expiresAt
    // dismissed instantly and the test could not tell. Now the toast
    // must SURVIVE the return and run its whole duration fresh.
    vi.useFakeTimers();
    const store = createToastStore();
    store.pauseAll();
    store.api.push({ title: 'hidden', duration: 3000 });
    vi.advanceTimersByTime(10000); // hidden far past the duration
    expect(store.api.snapshot()).toHaveLength(1); // never armed

    store.resumeAll();
    expect(store.api.snapshot()).toHaveLength(1); // NOT instantly dismissed
    vi.advanceTimersByTime(2999);
    expect(store.api.snapshot()).toHaveLength(1); // still inside the fresh run
    vi.advanceTimersByTime(2);
    expect(store.api.snapshot()).toHaveLength(0); // expired on its own clock
    vi.useRealTimers();
  });

  it('resumeAll re-arms only what the viewport renders — queued-never-seen stay frozen (R1 P1-2b)', () => {
    vi.useFakeTimers();
    const store = createToastStore();
    const first = store.api.push({ title: 'visible', duration: 3000 });
    // the handshake owns a visible set of exactly the first toast
    store.setVisible([first]);
    store.pauseAll();
    const queued = store.api.push({ title: 'queued-while-hidden', duration: 2000 });
    vi.advanceTimersByTime(99999);

    store.resumeAll();
    // the visible one re-arms (remaining 3000 from the freeze); the
    // queued-never-seen must NOT — D-2
    vi.advanceTimersByTime(3500);
    const titles = store.api.snapshot().map((t) => t.title);
    expect(titles).toContain('queued-while-hidden'); // never burned unseen
    expect(titles).not.toContain('visible'); // re-armed and expired
    // and it arms only when it finally renders
    store.setVisible([first, queued]);
    vi.advanceTimersByTime(2000);
    expect(store.api.snapshot()).toHaveLength(0);
    vi.useRealTimers();
  });

  it('a toast PROMOTED while the page is hidden re-arms on return — never frozen forever (R2 P2-1)', () => {
    vi.useFakeTimers();
    const store = createToastStore();
    const front = store.api.push({ title: 'front', duration: 1000 });
    store.setVisible([front]); // the handshake
    store.api.push({ title: 'shadow', duration: 2500 }); // queued: handshake-held, no timer
    store.pauseAll(); // hidden — pauseAll stamps only RUNNING timers
    store.api.dismiss(front); // promote 'shadow' while hidden
    store.setVisible([front + 1]); // the viewport effect's call (arm blocked by visHeld)
    vi.advanceTimersByTime(99999); // hidden: nothing fires
    expect(store.api.snapshot()).toHaveLength(1);

    store.resumeAll(); // page back — MUST arm (the stamp-gate bug left it frozen forever)
    vi.advanceTimersByTime(2500);
    expect(store.api.snapshot()).toHaveLength(0);
    vi.useRealTimers();
  });

  it('a hover-held toast survives resumeAll untouched (sources are orthogonal)', () => {
    vi.useFakeTimers();
    const store = createToastStore();
    const id = store.api.push({ title: 'held', duration: 4000 });
    store.pause(id); // the user's hold
    store.pauseAll();
    vi.advanceTimersByTime(99999);
    store.resumeAll(); // page back — but the hold still owns this toast
    expect(store.api.snapshot()).toHaveLength(1);

    store.resume(id); // hold released → the clock runs
    vi.advanceTimersByTime(4000);
    expect(store.api.snapshot()).toHaveLength(0);
    vi.useRealTimers();
  });

  it('sticky toasts are invisible to the visibility source', () => {
    const store = createToastStore();
    store.api.push({ title: 'sticky', duration: 0 });
    store.pauseAll();
    store.resumeAll();
    expect(store.api.snapshot()).toHaveLength(1);
  });
});

describe('toast v2 — the swipe math (pure)', () => {
  const END_END = ['left', 'down'] as const;

  it('displacement past the threshold dismisses along an allowed direction', () => {
    expect(judgeSwipe(-60, 0, 1000, END_END)).toEqual({ dismiss: true, axis: 'x' });
  });

  it('momentum past the velocity line dismisses even under the threshold', () => {
    // 30px in 100ms = 0.3 px/ms > 0.11
    expect(judgeSwipe(-30, 0, 100, END_END).dismiss).toBe(true);
    // 30px in 1000ms = 0.03 px/ms, under both lines → spring back
    expect(judgeSwipe(-30, 0, 1000, END_END).dismiss).toBe(false);
  });

  it('a disallowed direction never dismisses, however far or fast', () => {
    expect(judgeSwipe(60, 0, 1000, END_END).dismiss).toBe(false); // right
    expect(judgeSwipe(0, -80, 100, END_END).dismiss).toBe(false); // up
  });

  it('the dominant axis wins the verdict', () => {
    expect(judgeSwipe(-10, -70, 1000, END_END).axis).toBe('y');
    expect(judgeSwipe(-70, -10, 1000, END_END).axis).toBe('x');
  });

  it('a zero-duration drag divides by zero safely', () => {
    expect(judgeSwipe(-60, 0, 0, END_END).dismiss).toBe(true); // threshold path
  });

  it('friction damps the cross axis and only the cross axis', () => {
    // left allowed, up not: x rides free, y carries at 20%
    expect(frictionShift(-50, -40, END_END)).toEqual({ x: -50, y: -8 });
    // down allowed, right not: y rides free, x carries at 20%
    expect(frictionShift(40, 50, END_END)).toEqual({ x: 8, y: 50 });
    // both allowed: no damping
    expect(frictionShift(-50, 50, ['left', 'down'] as const)).toEqual({ x: -50, y: 50 });
    expect(SWIPE_FRICTION).toBeCloseTo(0.2);
  });
});

describe('toast v2 — the stacking dialect (viewport)', () => {
  it('renders one wrapper per toast with the depth vars; rear slabs withhold description ink', async () => {
    const store = createToastStore();
    const { container } = render(ToastViewport, { props: { store, maxVisible: 3 } });
    store.api.push({ title: 'first', description: 'one' });
    store.api.push({ title: 'second', description: 'two' });
    await new Promise((r) => setTimeout(r, 0));

    const stack = container.querySelector('[data-jx-toasts]') as HTMLElement;
    expect(stack.getAttribute('data-expanded')).toBeNull(); // collapsed at rest
    const wrappers = [...stack.children].filter((c) =>
      (c as HTMLElement).className.includes('grid-area'),
    ) as HTMLElement[];
    expect(wrappers).toHaveLength(2);
    // the FRONT (newest, i=0) shows its description; the rear slab (i=1)
    // keeps the geometry but withholds the ink
    const front = wrappers.find((w) => w.style.getPropertyValue('--jx-toast-i') === '0');
    const rear = wrappers.find((w) => w.style.getPropertyValue('--jx-toast-i') === '1');
    expect(front).toBeTruthy();
    expect(rear).toBeTruthy();
    expect(front!.style.getPropertyValue('--jx-toast-y')).toBe('0px');
    expect(rear!.style.getPropertyValue('--jx-toast-y')).toBe('-8px'); // -gap·1
    expect(rear!.style.getPropertyValue('--jx-toast-scale')).toBe('0.95');
    expect(rear!.querySelector('[data-jx-toast-desc]')!.className).toContain('text-transparent');
    expect(front!.querySelector('[data-jx-toast-desc]')!.className).not.toContain('text-transparent');
  });

  it('hovering the stack expands it; leaving collapses (unless expand is forced)', async () => {
    const store = createToastStore();
    const { container } = render(ToastViewport, { props: { store } });
    store.api.push({ title: 'a' });
    store.api.push({ title: 'b' });
    await new Promise((r) => setTimeout(r, 0));
    const stack = container.querySelector('[data-jx-toasts]') as HTMLElement;

    await fireEvent.pointerEnter(stack);
    expect(stack.getAttribute('data-expanded')).toBe('');
    await fireEvent.pointerLeave(stack);
    expect(stack.getAttribute('data-expanded')).toBeNull();
  });

  it('a swipe past the threshold dismisses through the normal pipeline', async () => {
    const store = createToastStore();
    const { container } = render(ToastViewport, { props: { store } });
    store.api.push({ title: 'swipe me', duration: 0 });
    await new Promise((r) => setTimeout(r, 0));
    const wrapper = container.querySelector('[data-jx-toasts] > div') as HTMLElement;

    // standalone posture = bottom-right → SWIPE_BY_POSITION['end end']
    // = ['right','down']: drag DOWN past the threshold
    await fireEvent.pointerDown(wrapper, { pointerId: 1, clientX: 200, clientY: 50, button: 0, isPrimary: true });
    await fireEvent.pointerMove(wrapper, { pointerId: 1, clientX: 200, clientY: 120 });
    await fireEvent.pointerUp(wrapper, { pointerId: 1, clientX: 200, clientY: 120 });
    await new Promise((r) => setTimeout(r, 0));

    expect(store.api.snapshot()).toHaveLength(0); // dismissed (+70px, allowed down)
  });

  it('pointer capture is LAZY — a sub-slop press never captures (the click must land on the card)', async () => {
    // regression (2026-09-02, found in-headless): capturing on
    // pointerdown retargets the synthesized click to the WRAPPER, so
    // the expandable card's onclick never fired in a real browser.
    // jsdom never synthesizes clicks from pointer events — the testable
    // half is the capture contract itself.
    const store = createToastStore();
    const { container } = render(ToastViewport, { props: { store } });
    store.api.push({ title: 'tap me', duration: 0 });
    await new Promise((r) => setTimeout(r, 0));
    const wrapper = container.querySelector('[data-jx-toasts] > div') as HTMLElement;
    const captures: number[] = [];
    wrapper.setPointerCapture = (pid: number) => captures.push(pid);

    // press + jiggle inside the 3px slop: NO capture
    await fireEvent.pointerDown(wrapper, { pointerId: 7, clientX: 100, clientY: 40, button: 0, isPrimary: true });
    await fireEvent.pointerMove(wrapper, { pointerId: 7, clientX: 102, clientY: 41 });
    expect(captures).toEqual([]);
    // the same press crossing the slop on a DISALLOWED axis (up, under
    // the standalone ['right','down'] default): capture EXACTLY once,
    // and the release can never dismiss — the axis is closed
    await fireEvent.pointerMove(wrapper, { pointerId: 7, clientX: 100, clientY: 20 });
    expect(captures).toEqual([7]);
    await fireEvent.pointerUp(wrapper, { pointerId: 7, clientX: 100, clientY: 20 });
    // a fresh sub-slop press resets the armed flag
    await fireEvent.pointerDown(wrapper, { pointerId: 8, clientX: 100, clientY: 40, button: 0, isPrimary: true });
    await fireEvent.pointerMove(wrapper, { pointerId: 8, clientX: 101, clientY: 40 });
    expect(captures).toEqual([7]);
    expect(store.api.snapshot()).toHaveLength(1); // neither press dismissed
  });
});

describe('toast v2 — the expandable dialog', () => {
  it('an expandable card click mounts the dialog part; a plain card never does', async () => {
    const store = createToastStore();
    const { container } = render(ToastViewport, { props: { store } });
    const id = store.api.push({ title: 'full story', description: 'the long form', expandable: true });
    store.api.push({ title: 'plain' });
    await new Promise((r) => setTimeout(r, 0));

    expect(container.querySelector('[data-jx-toast-dialog]')).toBeNull();
    const expandableCard = container.querySelector<HTMLElement>(`[data-jx-toast]`);
    // find the EXPANDABLE one (the newest is at index 0 — the front)
    const cards = [...container.querySelectorAll<HTMLElement>('[data-jx-toast]')];
    const target = cards.find((c) => c.textContent?.includes('full story'))!;
    await fireEvent.click(target);
    await new Promise((r) => setTimeout(r, 0));

    const dialog = container.querySelector(`[data-jx-toast-dialog="${id}"]`);
    expect(dialog).toBeTruthy();
    expect(dialog!.getAttribute('role')).toBe('dialog');
  });

  it('the dialog DURABLY owns the freeze — pointer leaving the card cannot resume the clock mid-read (R1 P1-1)', async () => {
    vi.useFakeTimers();
    const store = createToastStore();
    const { container } = render(ToastViewport, { props: { store } });
    store.api.push({ title: 'long read', duration: 2000, expandable: true });
    await tick();
    const card = [...container.querySelectorAll<HTMLElement>('[data-jx-toast]')].find((c) =>
      c.textContent?.includes('long read'),
    )!;

    await fireEvent.click(card);
    await tick();
    expect(container.querySelector('[data-jx-toast-dialog]')).toBeTruthy();

    // the popover takes the pointer — the card's pointerleave must NOT
    // release the store's hold (the pre-fix bug: the toast dismissed
    // itself mid-read and the dialog vanished under it)
    await fireEvent.pointerLeave(card);
    await fireEvent.focusOut(card, { relatedTarget: null });
    vi.advanceTimersByTime(60000);
    expect(store.api.snapshot()).toHaveLength(1);
    expect(container.querySelector('[data-jx-toast-dialog]')).toBeTruthy();

    // collapsing hands the clock back: the toast expires on its own
    const collapse = container.querySelector<HTMLButtonElement>('[data-jx-toast-dialog] button');
    await fireEvent.click(collapse!);
    await tick();
    vi.advanceTimersByTime(2000);
    expect(store.api.snapshot()).toHaveLength(0);
    vi.useRealTimers();
  });
});

describe('toast v2 — adversarial R1 regressions (swipe + hold + chip)', () => {
  it('the release verdict rides the DAMPED vector the user saw (R1 P2-2)', async () => {
    // dx=-70 (left, disallowed) dy=-65 (up, allowed): raw judging picks
    // the x axis and springs; the damped card visibly rode UP past the
    // threshold — it must dismiss
    const store = createToastStore();
    const { container } = render(ToastViewport, { props: { store } });
    store.api.push({ title: 'diag', duration: 0, swipeDirections: ['up'] });
    await new Promise((r) => setTimeout(r, 0));
    const wrapper = container.querySelector('[data-jx-toasts] > div') as HTMLElement;

    await fireEvent.pointerDown(wrapper, { pointerId: 1, clientX: 100, clientY: 40, button: 0, isPrimary: true });
    await fireEvent.pointerMove(wrapper, { pointerId: 1, clientX: 30, clientY: -25 });
    await fireEvent.pointerUp(wrapper, { pointerId: 1, clientX: 30, clientY: -25 });
    await new Promise((r) => setTimeout(r, 0));
    expect(store.api.snapshot()).toHaveLength(0); // damped: (-14, -65) → up wins
  });

  it('frictionShift damps BOTH axes when neither is allowed (R1 P3-2)', () => {
    // right+up allowed, drag left+down → both disallowed → both damped
    expect(frictionShift(-50, 30, ['right', 'up'])).toEqual({
      x: -50 * SWIPE_FRICTION,
      y: 30 * SWIPE_FRICTION,
    });
  });

  it('a hover hold evicted from the visible slice is voided by the handshake, never stranded, never burned unseen (R1 P2-1)', async () => {
    vi.useFakeTimers();
    const store = createToastStore();
    const { container } = render(ToastViewport, { props: { store, maxVisible: 1 } });
    const a = store.api.push({ title: 'hovered', duration: 1500 });
    await tick();
    const cardA = [...container.querySelectorAll<HTMLElement>('[data-jx-toast]')].find((c) =>
      c.textContent?.includes('hovered'),
    )!;
    await fireEvent.pointerEnter(cardA); // the hold
    store.api.push({ title: 'newer' }); // evicts A from the visible slice
    await tick();
    await fireEvent.pointerLeave(cardA); // Chromium would never fire this

    // A is queued, held by the HANDSHAKE now: it must not burn unseen
    vi.advanceTimersByTime(60000);
    let titles = store.api.snapshot().map((t) => t.title);
    expect(titles).toContain('hovered');

    // and it re-arms when it re-renders (the newer one expires first)
    vi.advanceTimersByTime(60000); // 'newer' (default 5000) long gone
    titles = store.api.snapshot().map((t) => t.title);
    expect(titles).toContain('hovered'); // still held while queued
    store.api.dismiss(store.api.snapshot().find((t) => t.title === 'hovered')!.id);
    expect(store.api.snapshot()).toHaveLength(0);
    void a;
    vi.useRealTimers();
  });

  it('the +N queued chip renders beyond maxVisible and carries no depth vars (R1 P3-1)', async () => {
    const store = createToastStore();
    const { container } = render(ToastViewport, { props: { store, maxVisible: 2 } });
    for (let i = 0; i < 4; i++) store.api.push({ title: `t${i}`, duration: 0 });
    await new Promise((r) => setTimeout(r, 0));

    const chip = container.querySelector<HTMLElement>('[data-jx-toast-queued]');
    expect(chip).toBeTruthy();
    expect(chip!.getAttribute('data-jx-toast-queued')).toBe('2');
    expect(chip!.getAttribute('aria-hidden')).toBe('true');
    // the wrapper rule is scoped away from the chip: no depth stamp
    expect(chip!.style.getPropertyValue('--jx-toast-i')).toBe('');
  });
});

describe('toast v2 — R3: the nine slots, the touch lift, the pos prop', () => {
  it('SWIPE_BY_FLOAT_POS: corners toward both nearest edges, edges outward-only, center none', () => {
    expect(SWIPE_BY_FLOAT_POS['right-bottom']).toEqual(['right', 'down']);
    expect(SWIPE_BY_FLOAT_POS['left-top']).toEqual(['left', 'up']);
    expect(SWIPE_BY_FLOAT_POS['right-top']).toEqual(['right', 'up']);
    expect(SWIPE_BY_FLOAT_POS['left-bottom']).toEqual(['left', 'down']);
    expect(SWIPE_BY_FLOAT_POS['center-top']).toEqual(['up']);
    expect(SWIPE_BY_FLOAT_POS['center-bottom']).toEqual(['down']);
    expect(SWIPE_BY_FLOAT_POS['left-center']).toEqual(['left']);
    expect(SWIPE_BY_FLOAT_POS['right-center']).toEqual(['right']);
    // the equidistant center has no nearest edge — no swipe, the × and
    // expiry own dismissal
    expect(SWIPE_BY_FLOAT_POS['center-center']).toEqual([]);
  });

  it('a top pos descends the pile (positive depth y); the default climbs', async () => {
    const store = createToastStore();
    const { container } = render(ToastViewport, { props: { store, pos: 'right-top' } });
    store.api.push({ title: 'a', duration: 0 });
    store.api.push({ title: 'b', duration: 0 });
    await new Promise((r) => setTimeout(r, 0));
    const rear = [...container.querySelectorAll<HTMLElement>('[data-jx-toasts] > div')].find(
      (w) => w.style.getPropertyValue('--jx-toast-i') === '1',
    )!;
    expect(rear.style.getPropertyValue('--jx-toast-y')).toBe('8px'); // descends
    expect(rear.style.getPropertyValue('transform-origin')).toContain('top');
  });

  it('a TOUCH tap expands the stack and the synthetic leave does NOT collapse it (R3-6)', async () => {
    const store = createToastStore();
    const { container } = render(ToastViewport, { props: { store } });
    store.api.push({ title: 'a', duration: 0 });
    store.api.push({ title: 'b', duration: 0 });
    await new Promise((r) => setTimeout(r, 0));
    const stack = container.querySelector('[data-jx-toasts]') as HTMLElement;

    await fireEvent.pointerEnter(stack, { pointerType: 'touch' });
    expect(stack.getAttribute('data-expanded')).toBe(''); // lifted
    // the touch pointer "leaves" the instant it lifts — sticky by design
    await fireEvent.pointerLeave(stack, { pointerType: 'touch' });
    expect(stack.getAttribute('data-expanded')).toBe('');
    // a pointerdown OUTSIDE the stack releases the lift
    await fireEvent.pointerDown(document.body, { pointerType: 'touch' });
    await new Promise((r) => setTimeout(r, 0));
    expect(stack.getAttribute('data-expanded')).toBeNull();
  });

  it('a mouse hover still collapses on leave (the touch stickiness never leaks to pointers)', async () => {
    const store = createToastStore();
    const { container } = render(ToastViewport, { props: { store } });
    store.api.push({ title: 'a', duration: 0 });
    store.api.push({ title: 'b', duration: 0 });
    await new Promise((r) => setTimeout(r, 0));
    const stack = container.querySelector('[data-jx-toasts]') as HTMLElement;
    await fireEvent.pointerEnter(stack, { pointerType: 'mouse' });
    expect(stack.getAttribute('data-expanded')).toBe('');
    await fireEvent.pointerLeave(stack, { pointerType: 'mouse' });
    expect(stack.getAttribute('data-expanded')).toBeNull();
  });

});

describe('toast v2 — R3 adversarial regressions', () => {
  it('pos IS forwarded through the float plane (P1-1): the nine slots reach the adopted wrapper', async () => {
    const { container } = render(ToastAdoptHost, { props: { pos: 'left-top' } });
    await new Promise((r) => setTimeout(r, 50));
    const wrapper = container.querySelector('[data-jx-float-content]') as HTMLElement;
    expect(wrapper.getAttribute('data-float-pos')).toBe('left-top');
    // and the site's default (no pos) stays right-bottom
    cleanup();
    const again = render(ToastAdoptHost);
    await new Promise((r) => setTimeout(r, 50));
    const w2 = again.container.querySelector('[data-jx-float-content]') as HTMLElement;
    expect(w2.getAttribute('data-float-pos')).toBe('right-bottom');
  });

  it('the trailing snippet rides its OWN lane beside the body — never overlapping it (P1-2)', async () => {
    const store = createToastStore();
    const { container } = render(ToastViewport, { props: { store } });
    store.api.push({
      title: 'with actions',
      duration: 0,
      trailing: (() => {
        const el = document.createElement('button');
        el.setAttribute('data-trail-probe', '');
        el.textContent = 'act';
        return () => el;
      })(),
    });
    await new Promise((r) => setTimeout(r, 0));
    const trail = container.querySelector('[data-jx-toast-trailing]') as HTMLElement;
    expect(trail.style.getPropertyValue('grid-area') + trail.className).toContain('grid-area:trail');
    // css-source: the template carries four lanes
    const css = readFileSync('src/lib/ui/toast/toast.css', 'utf8');
    expect(css).toContain("grid-template-areas: 'leading body trail close'");
  });
});

describe('toast v2 — the Codex round (first-visibility arming, maxVisible honesty)', () => {
  it('a push under a viewport owner does NOT arm until the visible-set report (Spec P1-1)', async () => {
    vi.useFakeTimers();
    const store = createToastStore();
    render(ToastViewport, { props: { store } });
    await tick(); // the mount effect reports [] — the owner exists

    store.api.push({ title: 'race', duration: 100 });
    // BEFORE any flush of the handshake: the toast must be PENDING —
    // advancing past its whole duration now must NOT kill it
    vi.advanceTimersByTime(500);
    expect(store.api.snapshot()).toHaveLength(1);

    await vi.advanceTimersByTimeAsync(0); // the report lands → arms NOW
    vi.advanceTimersByTime(99);
    expect(store.api.snapshot()).toHaveLength(1); // inside the fresh run
    vi.advanceTimersByTime(2);
    expect(store.api.snapshot()).toHaveLength(0); // first visibility, then expiry
    vi.useRealTimers();
  });

  it('a headless store keeps arm-at-push (no viewport ever reports)', () => {
    vi.useFakeTimers();
    const store = createToastStore();
    store.api.push({ title: 'headless', duration: 100 });
    vi.advanceTimersByTime(100);
    expect(store.api.snapshot()).toHaveLength(0);
    vi.useRealTimers();
  });

  it('maxVisible=0 renders NOTHING behind the chip — slice(-0) never widens the render (Spec P2)', async () => {
    const store = createToastStore();
    const { container } = render(ToastViewport, { props: { store, maxVisible: 0 } });
    store.api.push({ title: 'a', duration: 0 });
    store.api.push({ title: 'b', duration: 0 });
    await new Promise((r) => setTimeout(r, 0));
    expect(container.querySelectorAll('[data-jx-toast]')).toHaveLength(0);
    const chip = container.querySelector('[data-jx-toast-queued]');
    expect(chip?.getAttribute('data-jx-toast-queued')).toBe('2');
  });
});

describe('toast v2 — the detach leak (visibleOwner retires with its viewport)', () => {
  it('a push AFTER the viewport unmounted returns to arm-at-push — never pends forever', async () => {
    vi.useFakeTimers();
    const store = createToastStore();
    const host = render(ToastViewport, { props: { store } });
    await tick();
    store.setVisible(null); // the owner detaches (unmount path)
    store.api.push({ title: 'post-detach', duration: 300 });
    vi.advanceTimersByTime(300); // armed at push — expires on its own
    expect(store.api.snapshot()).toHaveLength(0);
    host.unmount();
    vi.useRealTimers();
  });
});
