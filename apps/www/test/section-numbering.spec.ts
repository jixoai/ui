/**
 * section-card numbering tree — document-ontology R2, batch 1 gates
 * (design §1/§1.1/§1.1b/§1.1c + tasks 1.1–1.5).
 *
 * Lanes:
 *   - 1.3 the status-quo gate (BASELINE-FIRST): sections outside every
 *     numbering domain stay byte-identical to the pre-change component.
 *     The BASELINE string below was captured from the UNMODIFIED HEAD
 *     component rendering fixtures/section-tree-host.svelte variant
 *     'plain' (two domain-less sections: a full-props h1 lane and a
 *     minimal h2 lane) under this same vitest jsdom environment — dev
 *     anchors and attribute serialization included.
 *   - the §1.1b value tables: single domain 1/1.1/1.1.1/1.2, sibling
 *     roots by document order, the nested-domain local restart.
 *   - the display-currency law: a keyed each reverse() renumbers the
 *     moved instances (registration order never assigns ordinals).
 *   - tasks 1.4: the id wire (SectionTargetEntry live thunks) and the
 *     §1.2 immutable precondition (mount-time structural params).
 *
 * CSR-only stance (design §1.1(d)): this suite mounts in jsdom — the
 * SSR lane's template-order proxy is gated at the pure-function level
 * in figure-numbering.spec.ts (batch 0), and hydration-first-frame
 * parity rides the same proxy law (static DOM order ≡ template order).
 */
import { render } from '@testing-library/svelte';
import { tick } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import Host from './fixtures/section-tree-host.svelte';

/** the settle protocol: Svelte flush + observer microtask + rAF (the
 *  provider-lifecycle precedent — mutation observers deliver per
 *  microtask, the derived recompute needs one flush) */
const settle = async () => {
  await tick();
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  await tick();
};

const g = globalThis as Record<string, unknown>;
const targets = () =>
  g.__probeTargets as {
    getTarget(id: string): { kind: string; number: () => string | null; title: () => string } | undefined;
  };

/** a section's data-number by its id prop (scoped to the container —
 *  tests never run two provider instances concurrently) */
const numberAttr = (container: HTMLElement, id: string) =>
  container.querySelector(`#${id}`)!.getAttribute('data-number');

/** the heading's leading number node: its text and the U+00A0 join */
const headingNumber = (container: HTMLElement, id: string) =>
  container.querySelector(`#${id} [data-jx-number]`) as HTMLElement | null;

// Captured 2026-09-05 from the pristine HEAD section-card.svelte (see
// header): the plain lane — sections outside every numbering domain.
const BASELINE =
  '<!----><!----><section data-jx-section="" class="border border-border bg-card shadow-2xs " data-family="docs" data-region="guide" data-role="entry" data-ordering="tree"><div data-jx-section-header="" class="flex flex-col [gap:calc(var(--jx-stack)_+_var(--jx-unit))] [padding-inline:calc(var(--jx-inset)_+_var(--jx-unit))] [padding-block:calc(var(--jx-stack)_+_var(--jx-unit))]" data-region="head"><p class="font-nav text-primary [font-size:calc(var(--jx-text-secondary)_-_calc(var(--jx-unit)_/_4))] uppercase tracking-[0.24em]">The Eyebrow</p><!----> <div class="flex flex-col [gap:calc(var(--jx-stack)_+_calc(var(--jx-unit)_/_2))]"><h1 class="font-nav text-balance text-[1.05rem] tracking-tight leading-tight sm:text-[1.22rem]">Outside Rich</h1><!----> <p class="max-w-[64ch] text-pretty [font-size:var(--jx-text)] [line-height:var(--jx-line)] text-muted-foreground">The summary line.</p><!----></div></div> <!----><hr data-jx-separator="line" data-orientation="horizontal" class="flex-none m-0 border-0" data-jx-section-sep="true" aria-hidden="true"><!----> <div data-jx-section-body="" class="[padding-inline:calc(var(--jx-inset)_+_var(--jx-unit))] [padding-block:calc(var(--jx-stack)_+_calc(var(--jx-unit)_*_2))]">rich body<!----></div></section><!----> <section data-jx-section="" class="border border-border bg-card shadow-2xs " data-role="section"><div data-jx-section-header="" class="flex flex-col [gap:calc(var(--jx-stack)_+_var(--jx-unit))] [padding-inline:calc(var(--jx-inset)_+_var(--jx-unit))] [padding-block:calc(var(--jx-stack)_+_var(--jx-unit))]"><!----> <div class="flex flex-col [gap:calc(var(--jx-stack)_+_calc(var(--jx-unit)_/_2))]"><h2 class="font-nav text-balance text-[1.05rem] tracking-tight leading-tight sm:text-[1.22rem]">Outside Bare</h2><!----> <!----></div></div> <!----><hr data-jx-separator="line" data-orientation="horizontal" class="flex-none m-0 border-0" data-jx-section-sep="true" aria-hidden="true"><!----> <div data-jx-section-body="" class="[padding-inline:calc(var(--jx-inset)_+_var(--jx-unit))] [padding-block:calc(var(--jx-stack)_+_calc(var(--jx-unit)_*_2))]">bare body<!----></div></section><!---->';

describe('1.3 — the status-quo gate (sections outside every domain)', () => {
  it('byte-identical to the pre-change baseline; no data-number, no number node', () => {
    const { container } = render(Host, { props: { variant: 'plain' } });
    expect(container.innerHTML).toBe(BASELINE);
    expect(container.querySelectorAll('[data-number]')).toHaveLength(0);
    expect(container.querySelectorAll('[data-jx-number]')).toHaveLength(0);
  });
});

describe('§1.1b — the single-domain decimal tree', () => {
  it('declared root 1; undeclared descendants number by structure 1.1 / 1.1.1 / 1.2', () => {
    const { container } = render(Host, { props: { variant: 'single' } });
    expect(numberAttr(container, 'sec-root')).toBe('1');
    expect(numberAttr(container, 'sec-a1')).toBe('1.1');
    expect(numberAttr(container, 'sec-a1a')).toBe('1.1.1');
    // Child A2 carries no id — the whole tree's number nodes in DOM order
    expect([...container.querySelectorAll('[data-jx-number]')].map((n) => n.textContent)).toEqual([
      '1',
      '1.1',
      '1.1.1',
      '1.2',
    ]);
  });

  it('§1.1c: the number leads the heading text joined by U+00A0, never aria-hidden', () => {
    const { container } = render(Host, { props: { variant: 'single' } });
    const node = headingNumber(container, 'sec-a1')!;
    expect(node.tagName).toBe('SPAN');
    expect(node.getAttribute('aria-hidden')).toBeNull();
    expect(node.parentElement!.textContent).toBe('1.1\u00A0Child A1');
    // the double landing: attr on the section root, text in the heading
    expect(numberAttr(container, 'sec-a1')).toBe(node.textContent);
  });
});

describe('tasks 1.5 — sibling roots number by document order', () => {
  it('two parallel declared roots: 1 and 2', () => {
    const { container } = render(Host, { props: { variant: 'siblings' } });
    expect(numberAttr(container, 'sec-s1')).toBe('1');
    expect(numberAttr(container, 'sec-s2')).toBe('2');
  });
});

describe('§1.1b(4) — the nested-domain local restart', () => {
  it('inner root restarts at 1, never consumes the outer child ordinal nor a sibling-root ordinal', () => {
    const { container } = render(Host, { props: { variant: 'nested' } });
    expect(numberAttr(container, 'sec-outer')).toBe('1');
    expect(numberAttr(container, 'sec-nested')).toBe('1'); // local restart, not 1.1
    expect(numberAttr(container, 'sec-nested-child')).toBe('1.1');
    // the nested root is NOT registered as an outer descendant: the
    // outer's own child takes 1.1 (a wrong registration would say 1.2)
    expect(numberAttr(container, 'sec-outer-child')).toBe('1.1');
    expect(numberAttr(container, 'sec-sibling')).toBe('2'); // unconsumed
  });
});

describe('the display-currency law — keyed each reverse (Section form)', () => {
  it('instances survive, the DOM moves, the numbers re-derive; ids stay', async () => {
    const rendered = render(Host, { props: { variant: 'reorder' } });
    const { container, component } = rendered;
    expect(numberAttr(container, 'sec-r1')).toBe('1.1');
    expect(numberAttr(container, 'sec-r2')).toBe('1.2');
    expect(numberAttr(container, 'sec-r3')).toBe('1.3');
    const r1 = container.querySelector('#sec-r1')!;

    component.reverse();
    await settle();

    // same instance (same element), new ordinal from the new DOM position
    expect(container.querySelector('#sec-r1')).toBe(r1);
    expect(numberAttr(container, 'sec-r1')).toBe('1.3');
    expect(numberAttr(container, 'sec-r2')).toBe('1.2');
    expect(numberAttr(container, 'sec-r3')).toBe('1.1');
    expect(r1.querySelector('[data-jx-number]')!.textContent).toBe('1.3');
    // the registered number is a LIVE thunk: it reads through to the
    // re-derived value (registration order never assigns ordinals)
    expect(targets().getTarget('sec-r1')!.number()).toBe('1.3');
  });
});

describe('tasks 1.4 — the id wire into the TargetRegistry', () => {
  it('id lands on the <section> root; the entry registers with live thunks', () => {
    const { container } = render(Host, { props: { variant: 'single' } });
    const root = container.querySelector('#sec-root')!;
    expect(root.tagName).toBe('SECTION');
    expect(root.getAttribute('data-jx-section')).toBe('');

    const entry = targets().getTarget('sec-root')!;
    expect(entry.kind).toBe('section');
    expect(entry.number()).toBe('1');
    expect(entry.title()).toBe('Root A');
    // the unnumbered lane's contract: number may be null (a section
    // outside every domain registers nothing — no id, no entry)
    expect(targets().getTarget('does-not-exist')).toBeUndefined();
  });

  it('title is a live prop read, never a snapshot', async () => {
    const { rerender } = render(Host, { props: { variant: 'single', childTitle: 'Child A1' } });
    expect(targets().getTarget('sec-a1')!.title()).toBe('Child A1');
    await rerender({ variant: 'single', childTitle: 'Renamed A1' });
    expect(targets().getTarget('sec-a1')!.title()).toBe('Renamed A1');
  });

  it('unmount disposes the entry — the registry holds no dead targets', () => {
    const { unmount } = render(Host, { props: { variant: 'single' } });
    expect(targets().getTarget('sec-root')).toBeTruthy();
    unmount();
    expect(targets().getTarget('sec-root')).toBeUndefined();
  });
});

describe('§1.2 — mount-time structural params (immutable precondition)', () => {
  it('floatScope without numbering is an invalid shape: dev warn, ignored, unnumbered', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { container } = render(Host, {
      props: { variant: 'loose', looseFloatScope: { equation: 'document' } },
    });
    expect(container.querySelector('[data-number]')).toBeNull();
    expect(container.querySelector('[data-jx-number]')).toBeNull();
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('floatScope without numbering');
    warn.mockRestore();
  });

  it('post-mount updates warn once (dev) and are ignored — the frozen snapshot rules', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const props = { variant: 'loose', looseNumbering: 'decimal' as const, looseId: 'sec-loose' };
    const { container, rerender } = render(Host, { props });
    expect(numberAttr(container, 'sec-loose')).toBe('1');

    await rerender({ ...props, looseId: 'sec-loose-2', looseFloatScope: { table: 'document' } });
    await settle();

    // warned exactly once, then ignored…
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain('mount-time structural params');
    // …the number keeps deriving from the mount-time domain
    expect(numberAttr(container, 'sec-loose')).toBe('1');
    expect(container.querySelector('#sec-loose-2')).toBeNull();
    // the registration still points at the mount-time id
    expect(targets().getTarget('sec-loose')!.number()).toBe('1');
    expect(targets().getTarget('sec-loose-2')).toBeUndefined();
    warn.mockRestore();
  });
});
