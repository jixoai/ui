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
