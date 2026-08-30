/**
 * jixoai paged numbering registry (paged-doc-family, 2026-08-30).
 *
 * The numbering source of truth for the publication family. The
 * prototype proved `getComputedStyle` cannot read CSS counter values
 * (they come back unresolved as `counter(sec)`), so the Svelte side
 * keeps its OWN registry — and the CSS counters render the same
 * order visually. THE ORDER IS DOM ORDER, not initialization order:
 * registration happens synchronously at component init (which IS
 * document order for a fresh tree, SSR included), and PagedDoc keeps
 * the registry resynced to the live DOM (a MutationObserver signal)
 * so keyed reorders and conditional moves renumber exactly like the
 * CSS counters would — both derive from the one DOM order, so they
 * cannot drift; the verify-print probe asserts the agreement on the
 * built page.
 *
 * Sections, figures and margin notes each number within their own
 * counter group, exactly like the three CSS counters on the doc root.
 *
 * WHAT THE NUMBERS ARE: display currency of document order.
 * Inserting a section shifts every later number — stable addressing
 * rides the explicit `id` (the ToC links and PagedRef targets), which
 * is why only id-bearing entries surface to the ToC / cross
 * references.
 */
import { getContext } from 'svelte';

/** The three counter groups the doc root resets. */
export type PagedCounterGroup = 'sec' | 'fig' | 'note';

/** One registration: its counter group, its optional stable id, its label. */
export interface PagedEntry {
  /** internal identity (keyed removal); never a public address */
  readonly uid: number;
  readonly group: PagedCounterGroup;
  /** the stable address — omitted entries number but cannot be referenced */
  readonly id: string | undefined;
  /** display label (section title); asides/figures may omit */
  readonly label: string | undefined;
  /** heading level for sections (2 default) */
  readonly level: number;
  /** the live element — DOM position is the numbering order */
  readonly element: () => Element | undefined;
}

export interface PagedDocContext {
  /** every live registration, in DOM order */
  readonly entries: readonly PagedEntry[];
  /**
   * Register synchronously (component init). `element` returns the
   * registrant's live DOM node — the resync sorts on it. Returns the
   * unregister handle — call on destroy.
   */
  register(request: {
    group: PagedCounterGroup;
    id?: string;
    label?: string;
    level?: number;
    element: () => Element | undefined;
  }): () => void;
  /**
   * Re-sort the registry to the CURRENT DOM order. PagedDoc calls it
   * on every subtree mutation (keyed reorders move nodes without
   * re-running any component init — the registration-order trap).
   */
  resync(): void;
  /**
   * The display number of the id-bearing entry: its 1-based position
   * within its counter group, in DOM order. Undefined when no live
   * entry carries the id.
   */
  numberFor(id: string): number | undefined;
  /** id-bearing sections in DOM order (the ToC listing). */
  readonly tocEntries: readonly PagedEntry[];
  /**
   * The measured/forced width tier driving the aside float-or-sink
   * pose ('wide' = margin-note column available).
   */
  readonly width: 'wide' | 'narrow';
}

export const PAGED_KEY = Symbol('jx-paged-doc');

export function getPagedDoc(): PagedDocContext | undefined {
  return getContext<PagedDocContext | undefined>(PAGED_KEY);
}

/** DOM-position comparator (document order); detached nodes keep relative order. */
function byDocumentOrder(a: PagedEntry, b: PagedEntry): number {
  const ea = a.element();
  const eb = b.element();
  if (!ea || !eb) return 0;
  const rel = ea.compareDocumentPosition(eb);
  // FOLLOWING means ea precedes eb; CONTAINED-BY also implies ea first
  if (rel & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
  if (rel & Node.DOCUMENT_POSITION_PRECEDING) return 1;
  return 0;
}

/** Create the registry (called once by PagedDoc's init). */
export function createPagedDocContext(): PagedDocContext & {
  setWidth(tier: 'wide' | 'narrow'): void;
} {
  // raw state: plain objects, no deep proxies — identity comparisons
  // in the unregister filter stay honest
  let entries = $state.raw<PagedEntry[]>([]);
  let width = $state<'wide' | 'narrow'>('wide');
  let uid = 0;

  return {
    get entries() {
      return entries;
    },
    get tocEntries() {
      return entries.filter((e) => e.group === 'sec' && e.id !== undefined);
    },
    get width() {
      return width;
    },
    setWidth(tier) {
      width = tier;
    },
    register(request) {
      const entry: PagedEntry = {
        uid: ++uid,
        group: request.group,
        id: request.id,
        label: request.label,
        level: request.level ?? 2,
        element: request.element,
      };
      // append preserves document order for a fresh tree (init order
      // == DOM order); resync() re-derives it for a moving one
      entries = [...entries, entry];
      return () => {
        entries = entries.filter((e) => e.uid !== entry.uid);
      };
    },
    resync() {
      const sorted = [...entries].sort(byDocumentOrder);
      // only write when the order actually changed (uid sequence)
      const before = entries.map((e) => e.uid).join(',');
      const after = sorted.map((e) => e.uid).join(',');
      if (before !== after) entries = sorted;
    },
    numberFor(id) {
      const target = entries.find((e) => e.id === id);
      if (target === undefined) return undefined;
      return entries.filter((e) => e.group === target.group).indexOf(target) + 1;
    },
  };
}
