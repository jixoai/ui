/**
 * reference — batch 3 gates (design §3, tasks 3.1–3.3): the five-state
 * resolution matrix (equation / numbered section / unnumbered section
 * / missing id / forward reference), the children escape hatch, the
 * edge-emission state split (the pre-settle fallback ANCHOR claims the
 * data-ref-to edge — the exact shape the SSR pass emits, since settled
 * is forever false without onMount; only the settled span drops it),
 * and the settle criterion that keeps "not yet registered" from ever
 * warning as "missing".
 */
import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type {
  FigureKind,
  TargetEntry,
  TargetRegistry,
} from '../src/lib/ui/figure/numbering.svelte';
import Reference from '../src/lib/ui/reference/reference.svelte';
import ReferenceHost from './fixtures/reference-host.svelte';

// the host's ProviderProbe exposes the live registry instance here
const g = globalThis as Record<string, unknown>;
const registry = (): TargetRegistry => g.__probeTargets as TargetRegistry;

// hand-built entries matching the frozen shapes (numbers/titles as
// accessor thunks — the component must read them inside $derived)
const fig = (id: string, figureKind: FigureKind, number: string): TargetEntry => ({
  id,
  kind: 'figure',
  figureKind,
  number: () => number,
  title: null,
});
const sec = (id: string, number: string | null, title: string): TargetEntry => ({
  id,
  kind: 'section',
  number: () => number,
  title: () => title,
});

/** the resolvable matrix minus the scenario ids (nope never; eq-late
 *  only in the forward scenario) — returns disposers by id so tests
 *  can drive eviction */
const registerStatics = () => {
  const r = registry();
  return {
    eq1: r.registerTarget(fig('eq-1', 'equation', '4.5')),
    sec1: r.registerTarget(sec('sec-1', '3.2.1', '方法')),
    secUnnumbered: r.registerTarget(sec('sec-unnumbered', null, '结论')),
    eqStatic: r.registerTarget(fig('eq-static', 'equation', '2')),
  };
};

/** the component's own settle criterion mirrored in test time:
 *  hydration (render) + two rAFs — the exact window after which a
 *  still-absent target is declared missing */
const settle = async () => {
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  await tick();
};

const warnsFor = (warn: ReturnType<typeof vi.spyOn>, id: string) =>
  warn.mock.calls.filter((c) => String(c[0]).includes(id)).length;

afterEach(() => {
  vi.restoreAllMocks();
});

describe('reference — the five-state resolution matrix', () => {
  it('the initial render is the SSR claim form: fallback anchors carrying the edge, zero warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(ReferenceHost);

    // every unresolved ref (this is also the exact SSR shape — settled
    // never flips without onMount) is an ANCHOR claiming its edge
    for (const id of ['eq-1', 'sec-1', 'sec-unnumbered', 'nope']) {
      const a = container.querySelector(`a[data-ref-to="${id}"]`);
      expect(a, `claim anchor for ${id}`).toBeTruthy();
      expect(a!.getAttribute('href')).toBe(`#${id}`);
      expect(a!.textContent).toBe(`??(${id})`);
    }
    // children replace the claim text too — the anchor stays an anchor
    const escaped = container.querySelector('a[data-ref-to="eq-static"]');
    expect(escaped?.textContent).toBe('上式');

    // nothing settled-missing yet, and nothing warned (settle gates it)
    expect([...container.querySelectorAll('span')].filter((s) => s.textContent?.startsWith('??('))).toHaveLength(0);
    expect(warn).not.toHaveBeenCalled();
  });

  it('resolved targets self-describe: Eq (4.5) / § 3.2.1 / bare title — native anchors', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(ReferenceHost);
    registerStatics();
    await tick();

    const eq = container.querySelector('a[data-ref-to="eq-1"]');
    expect(eq?.textContent).toBe('Eq (4.5)');
    expect(eq?.getAttribute('href')).toBe('#eq-1');
    // native anchor: no synthetic tabindex/role
    expect(eq?.hasAttribute('tabindex')).toBe(false);
    expect(eq?.hasAttribute('role')).toBe(false);

    expect(container.querySelector('a[data-ref-to="sec-1"]')?.textContent).toBe('§ 3.2.1');
    // unnumbered: the title alone — no connective word
    expect(container.querySelector('a[data-ref-to="sec-unnumbered"]')?.textContent).toBe('结论');
    expect(warn).not.toHaveBeenCalled();
  });

  it('the children escape hatch swaps the label, never the anchor', async () => {
    const { container } = render(ReferenceHost);
    registerStatics();
    await tick();

    const a = container.querySelector('a[data-ref-to="eq-static"]');
    expect(a?.textContent).toBe('上式');
    expect(a?.getAttribute('href')).toBe('#eq-static');
    expect(a?.hasAttribute('data-ref-to')).toBe(true);
  });

  it('a missing id settles to the loud span: no anchor, no edge, exactly one warn', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(ReferenceHost);
    registerStatics();
    await settle();

    // the state split: settled-missing drops BOTH the anchor and the
    // data-ref-to edge claim (dead anchors are a filed bug class)
    expect([...container.querySelectorAll('span')].some((s) => s.textContent === '??(nope)')).toBe(true);
    expect(container.querySelector('[data-ref-to="nope"]')).toBeNull();

    // once, carrying the id — not dev-gated by design (prod artifacts
    // must surface bad references)
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toContain('nope');
  });

  it('forward reference: ?? claim anchor first, registered pre-settle, resolves with zero warns', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(ReferenceHost, { props: { forward: true } });

    // the forward claim: an anchor with the edge and ?? text
    const late0 = container.querySelector('a[data-ref-to="eq-late"]');
    expect(late0?.getAttribute('href')).toBe('#eq-late');
    expect(late0?.textContent).toBe('??(eq-late)');

    // the target registers AFTER the reference rendered but BEFORE
    // settle — "not yet registered" must never read as "missing"
    registerStatics();
    registry().registerTarget(fig('eq-late', 'equation', '12'));
    await tick();
    expect(container.querySelector('a[data-ref-to="eq-late"]')?.textContent).toBe('Eq (12)');

    await settle();
    const late = container.querySelector('a[data-ref-to="eq-late"]');
    expect(late?.tagName).toBe('A');
    expect(late?.textContent).toBe('Eq (12)'); // followed and stable through settle

    // the ONLY warn belongs to the truly-missing nope — never the forward ref
    expect(warnsFor(warn, 'eq-late')).toBe(0);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toContain('nope');
  });

  it('eviction follows too: disposing the winner degrades to the span and re-warns (fresh episode)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(ReferenceHost);
    const disposers = registerStatics();
    await settle();
    expect(container.querySelector('a[data-ref-to="eq-1"]')?.textContent).toBe('Eq (4.5)');
    expect(warnsFor(warn, 'eq-1')).toBe(0);

    disposers.eq1(); // the winner (and only) entry evicted → missing again
    await tick();

    expect(container.querySelector('a[data-ref-to="eq-1"]')).toBeNull();
    expect([...container.querySelectorAll('span')].some((s) => s.textContent === '??(eq-1)')).toBe(true);
    expect(warnsFor(warn, 'eq-1')).toBe(1); // re-triggered — a fresh episode
  });
});

describe('reference — provider escape degrades whole', () => {
  it('renders the missing state immediately with a single escape warn (no settle warn on top)', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(Reference, { props: { to: 'orphan' } }); // no provider up the tree

    // the escape warn fires once at init, carrying the id
    expect(warn).toHaveBeenCalledTimes(1);
    expect(String(warn.mock.calls[0][0])).toContain('orphan');

    // degraded to the missing-state render: span, no edge, no anchor
    const span = container.querySelector('span');
    expect(span?.textContent).toBe('??(orphan)');
    expect(container.querySelector('[data-ref-to]')).toBeNull();

    await settle(); // the settle warn stays silent — never double-diagnose
    expect(container.querySelector('span')?.textContent).toBe('??(orphan)');
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
