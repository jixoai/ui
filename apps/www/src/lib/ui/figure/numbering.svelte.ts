/**
 * jixoai figure/numbering — the R2 line-primitive interface module
 * (document-ontology R2, batch 0, frozen per design §1.2).
 *
 * THE CONTRACT this module owns (batch 0 of the change's task graph —
 * the integrator lands it and freezes it; batches 1/2/3 consume it
 * without modification):
 *
 *   1. TargetRegistry — the route-page-scoped document target
 *      registry (Reference resolution walks it; never the paint or
 *      physics keys). One instance per route page, created by the
 *      page-root provider; dies with the page (no prior-page leaks).
 *   2. NumberingDomain / DomainRegistry — the two-phase counter
 *      domains (Owner rulings Q3–Q8 + Codex rounds; setContext runs
 *      BEFORE template DOM exists, so the factory takes no root —
 *      attachRoot(el) lands at bind:this time, and SSR never calls
 *      it: the template-order proxy orders the static tree, which is
 *      identical to compareDocumentPosition until the first DOM
 *      mutation, so hydration's first frame stays SSR-consistent).
 *
 * Laws this module enforces by construction:
 *   - REGISTRATION ORDER NEVER ASSIGNS ORDINALS. Consumers derive
 *     ordinals from the revision signal + compareDocumentPosition
 *     (§1.1(b)); this module exposes the records and the revision,
 *     never an assigned number.
 *   - Numbers/titles register as accessor thunks (read-on-call,
 *     reactive inside $derived) — never registration-time snapshots.
 *   - Disposers are idempotent; duplicate ids warn in dev with the
 *     FIRST live registration the winner; a disposing winner
 *     promotes the earliest still-live candidate in the same settle.
 */
import { getContext } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';

export type FigureKind = 'figure' | 'table' | 'equation' | 'listing';

/** the single-source display words: caption (full) / reference (short) */
export const FIGURE_LABELS: Record<FigureKind, { caption: string; reference: string }> = {
  figure: { caption: 'Figure', reference: 'Fig' },
  table: { caption: 'Table', reference: 'Table' },
  equation: { caption: 'Equation', reference: 'Eq' },
  listing: { caption: 'Listing', reference: 'Listing' },
};

export const NUMBERING_DOMAIN_KEY = Symbol.for('jx-numbering-domain');
export const DOCUMENT_TARGETS_KEY = Symbol.for('jx-document-targets');
export const DOCUMENT_DOMAINS_KEY = Symbol.for('jx-document-domains');

// ── the target registry (Reference resolution) ─────────────────────

export type FigureTargetEntry = {
  id: string;
  kind: 'figure';
  figureKind: FigureKind;
  readonly number: () => string;
  readonly title: null;
};

export type SectionTargetEntry = {
  id: string;
  kind: 'section';
  readonly number: () => string | null;
  readonly title: () => string;
};

export type TargetEntry = FigureTargetEntry | SectionTargetEntry;

export interface TargetRegistry {
  registerTarget(entry: TargetEntry): () => void;
  getTarget(id: string): TargetEntry | undefined;
}

export function createTargetRegistry(): TargetRegistry {
  // same-id candidates in registration order; the winner is the
  // first LIVE entry and promotion on dispose is earliest-still-live
  const entries = new SvelteMap<string, TargetEntry[]>();

  const disposer = (id: string, entry: TargetEntry) => {
    let gone = false;
    return () => {
      if (gone) return; // idempotent
      gone = true;
      const list = entries.get(id);
      if (!list) return;
      const at = list.indexOf(entry);
      if (at >= 0) list.splice(at, 1);
      if (list.length === 0) entries.delete(id);
    };
  };

  return {
    registerTarget(entry) {
      const list = entries.get(entry.id);
      if (list && list.length > 0 && import.meta.env?.DEV !== false) {
        // winner keeps the slot; the candidate stays live for promotion
        console.warn(
          `[jx/numbering] duplicate target id "${entry.id}" — the first live registration wins; this one waits for promotion`,
        );
      }
      if (list) list.push(entry);
      else entries.set(entry.id, [entry]);
      return disposer(entry.id, entry);
    },
    getTarget(id) {
      const list = entries.get(id);
      return list && list.length > 0 ? list[0] : undefined;
    },
  };
}

/** consumers read the route-page instance; the page-root provider sets it */
export function targetRegistryFromContext(): TargetRegistry | undefined {
  return getContext<TargetRegistry>(DOCUMENT_TARGETS_KEY);
}

// ── the numbering domains (Section's counter machinery) ─────────────

export interface SectionRecord {
  el?: Element;
  id?: string;
}

export interface FigureRecord {
  el?: Element;
  kind: FigureKind;
  id?: string;
}

export interface NumberingDomain {
  /** lands the domain root at bind:this time (idempotent; SSR never calls) */
  attachRoot(el: Element): void;
  registerSection(rec: SectionRecord): () => void;
  registerFigure(rec: FigureRecord): () => void;
  /** the in-domain revision signal — bumped only by the root observer */
  readonly domainRevision: number;
  /** undefined until attachRoot — the template-order proxy covers SSR */
  readonly root: Element | undefined;
  readonly parent: NumberingDomain | null;
  readonly floatScope: Partial<Record<FigureKind, 'chapter' | 'document'>>;
  /** the records consumers derive ordinals from (order never assigned) */
  readonly sections: readonly SectionRecord[];
  readonly figures: readonly FigureRecord[];
  /** the owning Section's teardown — disconnects the root observer */
  dispose(): void;
}

export function createNumberingDomain(opts: {
  parent: NumberingDomain | null;
  floatScope?: Partial<Record<FigureKind, 'chapter' | 'document'>>;
}): NumberingDomain {
  const sections: SectionRecord[] = [];
  const figures: FigureRecord[] = [];
  // the revision is the ONLY reactive ordinal signal (§1.1(b)): the
  // root observer bumps it; consumers' $derived read it and re-sort
  // the records by compareDocumentPosition (never by list order)
  let domainRevision = $state(0);
  let root: Element | undefined;
  let observer: MutationObserver | undefined;

  const bump = () => {
    domainRevision++;
  };

  const register = <T>(list: T[], rec: T) => {
    list.push(rec);
    bump(); // membership is part of the in-domain signal surface
    let gone = false;
    return () => {
      if (gone) return;
      gone = true;
      const at = list.indexOf(rec);
      if (at >= 0) list.splice(at, 1);
      bump();
    };
  };

  return {
    attachRoot(el) {
      if (root === el) return; // idempotent for the same root
      if (root !== undefined) return; // one root per domain, by law
      root = el;
      if (typeof MutationObserver !== 'undefined') {
        observer = new MutationObserver(bump);
        observer.observe(el, { childList: true, subtree: true });
      }
    },
    registerSection: (rec) => register(sections, rec),
    registerFigure: (rec) => register(figures, rec),
    get domainRevision() {
      return domainRevision;
    },
    get root() {
      return root;
    },
    parent: opts.parent,
    floatScope: opts.floatScope ?? {},
    sections,
    figures,
    dispose() {
      observer?.disconnect();
      observer = undefined;
    },
  };
}

// ── the document-level domain registry ─────────────────────────────

export interface DomainRegistry {
  registerDomain(domain: NumberingDomain): () => void;
  readonly domains: readonly NumberingDomain[];
  /** bumped only by the route provider's document-level observer */
  readonly documentRevision: number;
  /** provider-only: the observer's bump inlet (SSR stays at 0) */
  notifyDocumentMutation(): void;
}

export function createDomainRegistry(): DomainRegistry {
  const domains: NumberingDomain[] = [];
  let documentRevision = $state(0);
  return {
    registerDomain(domain) {
      domains.push(domain);
      documentRevision++;
      let gone = false;
      return () => {
        if (gone) return;
        gone = true;
        const at = domains.indexOf(domain);
        if (at >= 0) domains.splice(at, 1);
        documentRevision++;
      };
    },
    get domains() {
      return domains;
    },
    get documentRevision() {
      return documentRevision;
    },
    notifyDocumentMutation() {
      documentRevision++;
    },
  };
}

/** consumers read the route-page instance; the page-root provider sets it */
export function domainRegistryFromContext(): DomainRegistry | undefined {
  return getContext<DomainRegistry>(DOCUMENT_DOMAINS_KEY);
}
