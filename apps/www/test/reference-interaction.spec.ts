/**
 * reference interaction — batch 4.3 cross gate (design §3 DOM contract
 * / tasks 4.3): the three interaction states over REAL targets —
 *
 *   - click fragment: the resolved native `<a href="#id">` carries a
 *     literal fragment href that resolves against the document base,
 *     and a REAL element click moves location.hash onto the target id
 *     (jsdom implements fragment-only navigation; it lands as a task,
 *     so the assertion waits for it rather than reading synchronously);
 *   - keyboard: focus and ARIA ride the platform anchor — no synthetic
 *     tabindex/role exists, focus() reaches the element, and both
 *     document.activeElement and :focus agree;
 *   - the SSR-hydrate shape: a forward reference starts in the
 *     ??(to) FALLBACK ANCHOR form (the exact shape the static pass
 *     emits — settled is forever false without onMount), its click
 *     still lands the hash, and once the late target mounts the same
 *     reference follows to its resolved label within a tick — the
 *     interaction-view re-proof of the batch-3 forward lane.
 *
 * The registry-lifecycle fixtures (route switch / duplicate-id winner /
 * disposer unmount) already live in numbering-provider.spec.ts,
 * figure-numbering.spec.ts and section-numbering.spec.ts — no
 * duplication here.
 */
import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ReferenceInteractionHost from './fixtures/reference-interaction-host.svelte';
import type { TargetRegistry } from '../src/lib/ui/figure/numbering.svelte';

// the host's ProviderProbe exposes the live registry instance here
const g = globalThis as Record<string, unknown>;
const targets = () => g.__probeTargets as TargetRegistry;

/** the component's settle criterion mirrored in test time: two rAFs */
const settle = async () => {
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  await tick();
};

const anchor = (container: HTMLElement, to: string) =>
  container.querySelector(`a[data-ref-to="${to}"]`) as HTMLAnchorElement;

// location is file-scoped in the jsdom environment — isolate the URL
// line between cases so every hash assertion is exact
afterEach(() => {
  vi.restoreAllMocks();
  location.hash = '';
});

describe('4.3 — click fragment (the native anchor)', () => {
  it('the resolved anchor carries a literal #id href that parses; a real click lands location.hash on the target', async () => {
    // eq-late stays unmounted in this lane — its post-settle degrade
    // warn is the component's designed loud fallback (gated in
    // reference.spec.ts), not this gate's subject; keep stderr clean
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(ReferenceInteractionHost);
    await tick();

    const a = anchor(container, 'eq-ix');
    expect(a.textContent).toBe('Eq (1.1)');
    // the href contract: the literal fragment, plus its parsed form
    // against the document base
    expect(a.getAttribute('href')).toBe('#eq-ix');
    expect(a.hash).toBe('#eq-ix');
    expect(new URL(a.href).hash).toBe('#eq-ix');
    // the fragment names a REAL addressable target in the document
    expect(document.getElementById('eq-ix')).toBeTruthy();

    a.click();
    await vi.waitFor(() => expect(location.hash).toBe('#eq-ix'));
  });
});

describe('4.3 — keyboard focus rides the platform anchor', () => {
  it('no synthetic tabindex/role; focus() reaches it — :focus matches and activeElement lands', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {}); // see the click lane
    const { container } = render(ReferenceInteractionHost);
    await tick();

    const a = anchor(container, 'eq-ix');
    // P1-3: keyboard focus and ARIA ride the native anchor — the
    // component must not have synthesized any of this
    expect(a.hasAttribute('tabindex')).toBe(false);
    expect(a.hasAttribute('role')).toBe(false);
    expect(a.getAttribute('href')).toBe('#eq-ix'); // href IS the focusability source

    a.focus();
    expect(document.activeElement).toBe(a);
    expect(a.matches(':focus')).toBe(true);
  });
});

describe('4.3 — the SSR-hydrate shape (forward reference)', () => {
  it('starts as the ??(to) fallback ANCHOR claiming the edge; its click lands the hash; the late target resolves it; never warns', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container, rerender } = render(ReferenceInteractionHost); // late=false
    await tick();

    // the forward claim: the exact static-pass form — an anchor with
    // the edge and the ?? text ("not yet registered" ≠ "nonexistent")
    const fb = anchor(container, 'eq-late');
    expect(fb.textContent).toBe('??(eq-late)');
    expect(fb.getAttribute('href')).toBe('#eq-late');
    expect(fb.hasAttribute('data-ref-to')).toBe(true);

    // the fallback anchor is already navigable: the click lands the hash
    // (jsdom delivers fragment navigation as a task). Mount the late
    // destination BEFORE awaiting it — registering pre-settle is the
    // forward lane's whole point ("not yet registered" ≠ "missing").
    fb.click();
    await rerender({ late: true });
    await tick();
    const resolved = anchor(container, 'eq-late');
    expect(resolved.textContent).toBe('Eq (1.2)');
    expect(resolved.getAttribute('href')).toBe('#eq-late');
    expect(targets().getTarget('eq-late')).toBeTruthy(); // the live registration
    await vi.waitFor(() => expect(location.hash).toBe('#eq-late'));

    // the resolved anchor stays a real fragment jump: click it again
    location.hash = '';
    resolved.click();
    await vi.waitFor(() => expect(location.hash).toBe('#eq-late'));

    // held through settle — the forward id never read as missing
    await settle();
    expect(anchor(container, 'eq-late').textContent).toBe('Eq (1.2)');
    expect(warn).not.toHaveBeenCalled();
  });
});
