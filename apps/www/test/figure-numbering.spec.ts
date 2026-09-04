/**
 * figure/numbering — batch 0 interface gates (design §1.2 frozen face).
 * Locks the export surface (the batch-1/2/3 consumption contract) and
 * the behavioral laws that live in the module itself: winner/promotion,
 * idempotent disposers, the revision-as-only-ordinal-signal regime.
 */
import { describe, expect, it, vi } from 'vitest';
import {
  FIGURE_LABELS,
  NUMBERING_DOMAIN_KEY,
  DOCUMENT_TARGETS_KEY,
  DOCUMENT_DOMAINS_KEY,
  createTargetRegistry,
  createNumberingDomain,
  createDomainRegistry,
  figureOrdinal,
  sectionNumber,
  type TargetEntry,
} from '../src/lib/ui/figure/numbering.svelte';

describe('figure/numbering export surface (the batch-0 freeze)', () => {
  it('FIGURE_LABELS is the single display-word source (caption/reference pairs)', () => {
    expect(Object.keys(FIGURE_LABELS).sort()).toEqual(['equation', 'figure', 'listing', 'table']);
    expect(FIGURE_LABELS.equation).toEqual({ caption: 'Equation', reference: 'Eq' });
    expect(FIGURE_LABELS.figure).toEqual({ caption: 'Figure', reference: 'Fig' });
  });

  it('the three context keys are distinct Symbol.for identities', () => {
    expect(NUMBERING_DOMAIN_KEY).toBe(Symbol.for('jx-numbering-domain'));
    expect(DOCUMENT_TARGETS_KEY).toBe(Symbol.for('jx-document-targets'));
    expect(DOCUMENT_DOMAINS_KEY).toBe(Symbol.for('jx-document-domains'));
    expect(new Set([NUMBERING_DOMAIN_KEY, DOCUMENT_TARGETS_KEY, DOCUMENT_DOMAINS_KEY]).size).toBe(3);
  });
});

describe('TargetRegistry — winner, promotion, idempotent disposer', () => {
  const fig = (id: string, n: string): TargetEntry => ({
    id,
    kind: 'figure',
    figureKind: 'equation',
    number: () => n,
    title: null,
  });

  it('the first live registration wins; the candidate promotes when the winner disposes', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const reg = createTargetRegistry();
    const a = fig('eq', '1');
    const b = fig('eq', '2');
    const da = reg.registerTarget(a);
    reg.registerTarget(b);
    expect(reg.getTarget('eq')?.number()).toBe('1'); // first live wins
    expect(warn).toHaveBeenCalledTimes(1);
    da(); // winner disposes → earliest still-live promotes
    expect(reg.getTarget('eq')?.number()).toBe('2');
    warn.mockRestore();
  });

  it('a disposers is idempotent; the last disposal empties the slot', () => {
    const reg = createTargetRegistry();
    const dispose = reg.registerTarget(fig('eq', '1'));
    dispose();
    dispose(); // idempotent — no throw, no state damage
    expect(reg.getTarget('eq')).toBeUndefined();
  });

  it('entries are live accessor thunks, never registration-time snapshots', () => {
    const reg = createTargetRegistry();
    let n = '1';
    reg.registerTarget({
      id: 'eq',
      kind: 'figure',
      figureKind: 'equation',
      number: () => n,
      title: null,
    });
    expect(reg.getTarget('eq')?.number()).toBe('1');
    n = '2';
    expect(reg.getTarget('eq')?.number()).toBe('2'); // reads through
  });
});

describe('NumberingDomain — revision is the only ordinal signal', () => {
  it('registration/unregistration bump the revision; the records stay order-free', () => {
    const domain = createNumberingDomain({ parent: null });
    const r0 = domain.domainRevision;
    const dispose = domain.registerFigure({ kind: 'equation', id: 'a' });
    expect(domain.domainRevision).toBeGreaterThan(r0);
    expect(domain.figures).toHaveLength(1);
    dispose();
    expect(domain.figures).toHaveLength(0);
    expect(domain.domainRevision).toBeGreaterThan(r0 + 1);
  });

  it('attachRoot is idempotent-per-root and wires the observer (DOM mutation bumps)', async () => {
    const domain = createNumberingDomain({ parent: null, floatScope: { equation: 'document' } });
    const el = document.createElement('section');
    domain.attachRoot(el);
    expect(domain.root).toBe(el);
    const r0 = domain.domainRevision;
    el.appendChild(document.createElement('p')); // observer fires
    await new Promise((r) => requestAnimationFrame(() => r(null)));
    expect(domain.domainRevision).toBeGreaterThan(r0);
    domain.attachRoot(el); // same root: no-op, no re-observe
    expect(domain.floatScope).toEqual({ equation: 'document' });
    domain.dispose();
  });

  it('the parent pointer and empty floatScope defaults hold', () => {
    const parent = createNumberingDomain({ parent: null });
    const child = createNumberingDomain({ parent });
    expect(child.parent).toBe(parent);
    expect(parent.parent).toBeNull();
    expect(child.floatScope).toEqual({});
  });
});

describe('DomainRegistry — provider-owned document revision', () => {
  it('registerDomain and the provider bump inlet drive documentRevision; disposers are idempotent', () => {
    const registry = createDomainRegistry();
    const r0 = registry.documentRevision;
    const domain = createNumberingDomain({ parent: null });
    const dispose = registry.registerDomain(domain);
    expect(registry.documentRevision).toBeGreaterThan(r0);
    expect(registry.domains).toContain(domain);
    registry.notifyDocumentMutation();
    expect(registry.documentRevision).toBeGreaterThan(r0 + 1);
    dispose();
    dispose(); // idempotent
    expect(registry.domains).not.toContain(domain);
  });
});

describe('pure ordinal derivation — the §1.1b value tables', () => {
  const el = (parent: Element, tag = 'section') => {
    const node = document.createElement(tag);
    parent.appendChild(node);
    return node;
  };

  it('the decimal tree and multi-root numbering hold (1 → 1.1 → 1.1.1; sibling root 2)', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);
    const registry = createDomainRegistry();
    const outer = createNumberingDomain({ parent: null });
    registry.registerDomain(outer);
    const sibling = createNumberingDomain({ parent: null });
    registry.registerDomain(sibling);

    const r1 = { el: el(root), parent: null };
    const r1a = { el: el(r1.el!), parent: r1 };
    const r1a1 = { el: el(r1a.el!), parent: r1a };
    const r2 = { el: el(root), parent: null };
    outer.registerSection(r1);
    outer.registerSection(r1a);
    outer.registerSection(r1a1);
    sibling.registerSection(r2);

    expect(sectionNumber(r1, outer, registry)).toBe('1');
    expect(sectionNumber(r1a, outer, registry)).toBe('1.1');
    expect(sectionNumber(r1a1, outer, registry)).toBe('1.1.1');
    expect(sectionNumber(r2, sibling, registry)).toBe('2'); // multi-root by document order

    // DOM order, not registration order: r2 appended before r1a would renumber
    const registry2 = createDomainRegistry();
    const a = createNumberingDomain({ parent: null });
    const b = createNumberingDomain({ parent: null });
    registry2.registerDomain(a);
    registry2.registerDomain(b);
    const ea = el(root), eb = el(root);
    root.insertBefore(eb, ea); // b's element BEFORE a's despite later registration
    const ra = { el: ea, parent: null };
    const rb = { el: eb, parent: null };
    a.registerSection(ra);
    b.registerSection(rb);
    expect(sectionNumber(ra, a, registry2)).toBe('2'); // DOM order wins
    expect(sectionNumber(rb, b, registry2)).toBe('1');
    root.remove();
  });

  it('a nested domain restarts locally at 1 and never consumes a sibling ordinal', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);
    const registry = createDomainRegistry();
    const outer = createNumberingDomain({ parent: null });
    registry.registerDomain(outer);
    const nested = createNumberingDomain({ parent: outer });
    registry.registerDomain(nested);
    const after = createNumberingDomain({ parent: null });
    registry.registerDomain(after);

    const outerRoot = { el: el(root), parent: null };
    const nestedRoot = { el: el(outerRoot.el!), parent: null }; // inside outer's subtree…
    outer.registerSection(outerRoot);
    nested.registerSection(nestedRoot); // …but registered in the NESTED domain
    const nestedChild = { el: el(nestedRoot.el!), parent: nestedRoot };
    nested.registerSection(nestedChild);
    const afterRoot = { el: el(root), parent: null };
    after.registerSection(afterRoot);

    expect(sectionNumber(outerRoot, outer, registry)).toBe('1');
    expect(sectionNumber(nestedRoot, nested, registry)).toBe('1'); // local restart
    expect(sectionNumber(nestedChild, nested, registry)).toBe('1.1');
    expect(sectionNumber(afterRoot, after, registry)).toBe('2'); // unconsumed by the nested domain
    root.remove();
  });

  it('figure ordinals: chapter scope counts per domain; document scope orders the union by document position', () => {
    const root = document.createElement('div');
    document.body.appendChild(root);
    const registry = createDomainRegistry();
    const domA = createNumberingDomain({ parent: null });
    const domB = createNumberingDomain({ parent: null, floatScope: { equation: 'document' } });
    registry.registerDomain(domA);
    registry.registerDomain(domB);

    const fA = { el: el(root, 'figure'), kind: 'equation' as const };
    const fB = { el: el(root, 'figure'), kind: 'equation' as const };
    domA.registerFigure(fA);
    domA.registerFigure(fB);
    domA.attachRoot(root);
    const oA = figureOrdinal(fA, domA, registry);
    expect(oA.scope).toBe('chapter');
    expect(oA.ordinal).toBe(1);
    expect(oA.domainOrdinal).toBe(1);
    expect(figureOrdinal(fB, domA, registry).ordinal).toBe(2);

    // document scope: F1 in domA?? — domA does not participate; only domB
    const fB1 = { el: el(root, 'figure'), kind: 'equation' as const };
    const fB2 = { el: el(root, 'figure'), kind: 'equation' as const };
    domB.registerFigure(fB2); // registered FIRST…
    domB.registerFigure(fB1); // …but appended EARLIER in the DOM
    expect(figureOrdinal(fB1, domB, registry).ordinal).toBe(1); // document position wins
    expect(figureOrdinal(fB2, domB, registry).ordinal).toBe(2);

    // the nested+document union: F1 (outer) → F2 (nested) → F3 (outer, after)
    const union = createDomainRegistry();
    const outer = createNumberingDomain({ parent: null, floatScope: { equation: 'document' } });
    const nested = createNumberingDomain({ parent: outer, floatScope: { equation: 'document' } });
    union.registerDomain(outer);
    union.registerDomain(nested);
    const f1 = { el: el(root, 'figure'), kind: 'equation' as const };
    const f2 = { el: el(root, 'figure'), kind: 'equation' as const };
    const f3 = { el: el(root, 'figure'), kind: 'equation' as const };
    outer.registerFigure(f1);
    nested.registerFigure(f2);
    outer.registerFigure(f3);
    expect(figureOrdinal(f1, outer, union).ordinal).toBe(1);
    expect(figureOrdinal(f2, nested, union).ordinal).toBe(2); // NOT domain-list order
    expect(figureOrdinal(f3, outer, union).ordinal).toBe(3);
    root.remove();
  });

  it('the template-order proxy: unattached records fall back to list order (SSR)', () => {
    const registry = createDomainRegistry();
    const domain = createNumberingDomain({ parent: null });
    registry.registerDomain(domain);
    const a = { kind: 'figure' as const };
    const b = { kind: 'figure' as const };
    domain.registerFigure(a);
    domain.registerFigure(b);
    expect(figureOrdinal(a, domain, registry).ordinal).toBe(1); // instantiation order
    expect(figureOrdinal(b, domain, registry).ordinal).toBe(2);
    const r = { parent: null };
    const rc = { parent: r };
    domain.registerSection(r);
    domain.registerSection(rc);
    expect(sectionNumber(r, domain, registry)).toBe('1');
    expect(sectionNumber(rc, domain, registry)).toBe('1.1');
  });
});
