/**
 * numbering-provider — batch 0.3 gates (the route-page root's context
 * and observer lifecycle): contexts present inside / absent outside,
 * the document-level observer wired on mount, disconnected on
 * teardown, and a fresh mount being a fresh document (a prior page's
 * ids are unresolvable — never installed in long-lived layouts).
 */
import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, expect, it } from 'vitest';
import ProviderLifecycleHost from './fixtures/provider-lifecycle-host.svelte';
import ProviderProbe from './fixtures/provider-probe.svelte';

describe('numbering-provider — batch 0.3', () => {
  it('publishes both contexts inside the tree; they are absent outside', () => {
    const outside = render(ProviderProbe); // no provider up the tree
    expect(outside.container.querySelector('[data-has-contexts]')!.getAttribute('data-has-contexts')).toBe('false');

    const inside = render(ProviderLifecycleHost);
    expect(inside.container.querySelector('[data-has-contexts]')!.getAttribute('data-has-contexts')).toBe('true');
  });

  it('the document observer bumps documentRevision on DOM mutation', async () => {
    const g = globalThis as Record<string, unknown>;
    const { container } = render(ProviderLifecycleHost);
    const probe = container.querySelector('[data-rev]')!;
    const before = Number(probe.getAttribute('data-rev'));
    const churn = document.createElement('div');
    document.body.appendChild(churn); // anywhere in the document counts
    await tick();
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    expect(Number(probe.getAttribute('data-rev'))).toBeGreaterThan(before);
    churn.remove();
  });

  it('teardown disconnects the observer — no post-unmount bumps', async () => {
    const g = globalThis as Record<string, unknown>;
    const { unmount } = render(ProviderLifecycleHost);
    const domains = g.__probeDomains as { documentRevision: number };
    const frozen = domains.documentRevision;
    unmount();
    const churn = document.createElement('div');
    document.body.appendChild(churn);
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    expect(domains.documentRevision).toBe(frozen); // observer gone
    churn.remove();
  });

  it('a fresh mount is a fresh document — prior-page ids unresolvable', () => {
    const g = globalThis as Record<string, unknown>;
    const first = render(ProviderLifecycleHost, { props: { register: 'eq-prior' } });
    const priorTargets = g.__probeTargets as { getTarget(id: string): unknown };
    expect(priorTargets.getTarget('eq-prior')).toBeTruthy();
    first.unmount();

    render(ProviderLifecycleHost); // the "next page" — a new provider instance
    const nextTargets = g.__probeTargets as { getTarget(id: string): unknown };
    expect(nextTargets).not.toBe(priorTargets); // a new registry instance
    expect(nextTargets.getTarget('eq-prior')).toBeUndefined(); // prior id gone
  });
});
