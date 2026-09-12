/**
 * @jixoai/ui-design (studio) — the selection model (design-studio-r2
 * T4/T5/T6 shared core).
 *
 * One selection state feeds THREE surfaces (spec: "selection is one
 * shared studio state fed by picker and tree"):
 *
 *     {frameId, usageIndex, iterationIndex?, component}
 *       ↑ canvas picker (entries/picker.js — click → nearest stamped
 *         ancestor → window.__jixoaiDesignSelect, same-origin direct
 *         call up the iframe chain)
 *       ↑ ComponentTreeView (the frame stamp tree, DOM-enumerated)
 *       ↓ chat chip + message context prefix (T6)
 *
 * PURE functions only for the model/format/tree logic (node-tested
 * without a DOM); the DOM collectors take STRUCTURAL inputs (objects
 * with children/getAttribute/querySelectorAll) so tests hand-roll
 * tiny fakes instead of a DOM dependency.
 *
 * The instance address is the r2 double axis (design.md §3, B3):
 * usageIndex is STATIC (document order, HMR-stable — the edit target);
 * iterationIndex is RUNTIME (which {#each} iteration was clicked —
 * highlight-only; edits always land on the usage site).
 *
 * Original need: Owner 2026-09-11 (design-studio-r2 T4).
 */

/* ── the model ───────────────────────────────────────────────────────── */

/** the single studio selection (the spec's exact shape + runtime facts) */
export interface DesignSelection {
  /** the kit frame's DOM anchor id (null = picked in a canvas document) */
  readonly frameId: string | null;
  /** the usage site's static document-order index (1-based) */
  readonly usageIndex: number;
  /** which iteration of a shared usage was clicked (null = sole instance) */
  readonly iterationIndex: number | null;
  /** the registry item id (the data-jx-component value) */
  readonly component: string;
  /** how many DOM instances carry this usageIndex in the frame */
  readonly instanceCount: number;
}

/**
 * the lazy tree's walk instrumentation (r3 #20): NON-reactive counters
 * the smoke scripts read to prove an unexpanded frame is never walked
 * (dynamic loading evidence). Lives on the studio window like the
 * other seams; never rendered.
 */
export interface DesignWalkStats {
  canvas: number;
  frames: Record<string, number>;
}

/** the studio-side window seam (picker calls UP; shell installs it) */
export interface DesignStudioSeams {
  __jixoaiDesignSelect?: (selection: DesignSelection | null) => void;
  /** the hover twin (#31): canvas hover reports up; the tree highlights */
  __jixoaiDesignHover?: (selection: DesignSelection | null) => void;
  __jixoaiDesignRefreshTree?: () => void;
  /** walk counters (r3 #20) — see DesignWalkStats */
  __jixoaiDesignWalks?: DesignWalkStats;
}

/** the frame-side window seam (tree selection calls DOWN to highlight) */
export interface DesignFrameSeams {
  __jixoaiDesignHighlight?: (target: DesignHighlightTarget | null) => void;
  /** the hover twin (#31): tree hover highlights down (no scroll) */
  __jixoaiDesignHover?: (target: DesignHighlightTarget | null) => void;
}

export interface DesignHighlightTarget {
  readonly usageIndex: number;
  readonly iterationIndex: number | null;
}

/* ── the T6 chat formats (stable, agent-readable — knowledge-documented) ─ */

/** the message context prefix: `[selected: press-button#2 in hero-desktop-1280-dark]` */
export function selectionChatPrefix(selection: DesignSelection): string {
  const where = selection.frameId ?? 'canvas';
  return `[selected: ${selection.component}#${selection.usageIndex} in ${where}]`;
}

/** the share note appended when a usage renders more than one instance */
export function selectionShareNote(selection: DesignSelection): string | null {
  if (selection.instanceCount <= 1) return null;
  return `${selection.instanceCount} instances share this usage`;
}

/** the chip's one-line label */
export function selectionChipLabel(selection: DesignSelection): string {
  const where = selection.frameId ?? 'canvas';
  const base = `${selection.component} #${selection.usageIndex} · ${where}`;
  const note = selectionShareNote(selection);
  return note === null ? base : `${base} — ${note}`;
}

/** the full outgoing message body: prefix line + share note + the draft */
export function selectionMessageBody(selection: DesignSelection | null, draft: string): string {
  if (selection === null) return draft;
  const note = selectionShareNote(selection);
  const lines = [selectionChatPrefix(selection)];
  if (note !== null) lines.push(`[${note} — edits apply once at the usage site]`);
  lines.push(draft);
  return lines.join('\n');
}

/* ── the stamp tree (T5) ─────────────────────────────────────────────── */

/** one stamped element, flattened (the DOM walker's output) */
export interface StampRecord {
  readonly frameId: string | null;
  readonly component: string;
  readonly usageIndex: number;
  readonly instanceCount: number;
  /** the nearest stamped ANCESTOR's usageIndex (nesting), null = root */
  readonly parentUsageIndex: number | null;
}

/** a tree node: a usage (all its iterations) with nested usages */
export interface SelectionTreeNode {
  readonly frameId: string | null;
  readonly component: string;
  readonly usageIndex: number;
  readonly instanceCount: number;
  readonly children: SelectionTreeNode[];
}

/**
 * Build the ComponentTreeView's data from flat records: nesting by
 * parentUsageIndex, frame roots first (document order preserved — the
 * records arrive in walk order). One node per USAGE: an {#each}
 * rendering three instances is ONE node with instanceCount 3 (the
 * honest sharing label).
 */
export function buildSelectionTree(records: readonly StampRecord[]): SelectionTreeNode[] {
  // one node per usage (frameId + usageIndex); iterations collapse
  const nodes = new Map<string, SelectionTreeNode>();
  for (const record of records) {
    const key = `${record.frameId ?? ''}#${record.usageIndex}`;
    if (!nodes.has(key)) {
      nodes.set(key, {
        frameId: record.frameId,
        component: record.component,
        usageIndex: record.usageIndex,
        instanceCount: record.instanceCount,
        children: [],
      });
    } else {
      // iterations of the same usage share the count; keep the max seen
      const existing = nodes.get(key)!;
      if (record.instanceCount > existing.instanceCount) {
        nodes.set(key, { ...existing, instanceCount: record.instanceCount });
      }
    }
  }
  const roots: SelectionTreeNode[] = [];
  for (const record of records) {
    const key = `${record.frameId ?? ''}#${record.usageIndex}`;
    const node = nodes.get(key)!;
    const parentKey = `${record.frameId ?? ''}#${record.parentUsageIndex}`;
    const parent = record.parentUsageIndex === null ? undefined : nodes.get(parentKey);
    // a parent must exist AND share the frame (cross-frame parentUsageIndex
    // indices are different documents' indices — never nest across frames)
    if (parent !== undefined && parent.frameId === record.frameId && parent !== node) {
      if (!parent.children.includes(node)) parent.children.push(node);
    } else if (!roots.includes(node)) {
      roots.push(node);
    }
  }
  return roots;
}

/* ── the DOM-generic collectors (structural inputs, no DOM dep) ─────── */

/** the minimal element surface the walker reads (real DOM satisfies it) */
export interface WalkerElement {
  readonly children: readonly WalkerElement[];
  getAttribute(name: string): string | null;
}

/** the minimal iframe surface the canvas collector reads */
export interface WalkerIframe {
  readonly name: string;
  readonly contentDocument: { readonly body?: WalkerElement | null } | null;
}

/** the frame name the kit renders (frame-view.svelte: jixoai-design-frame-<id>) */
export const FRAME_NAME_PREFIX = 'jixoai-design-frame-';

/** the frame id a kit iframe's name carries, or null */
export function frameIdFromName(name: string): string | null {
  return name.startsWith(FRAME_NAME_PREFIX) && name.length > FRAME_NAME_PREFIX.length
    ? name.slice(FRAME_NAME_PREFIX.length)
    : null;
}

/**
 * Depth-first walk of one document's stamped elements. Nesting =
 * stamped-ancestor chain; instanceCount = same-document elements with
 * the same usageIndex ({#each} renders them as siblings — counting
 * the whole document is the robust variant: a slot/render split also
 * shares one usageIndex).
 */
export function collectStampRecords(
  root: WalkerElement | null | undefined,
  frameId: string | null,
): StampRecord[] {
  if (root === null || root === undefined) return [];
  const counts = new Map<number, number>();
  const countOf = (usageIndex: number): number => counts.get(usageIndex) ?? 1;
  const tally = (element: WalkerElement): void => {
    const value = element.getAttribute('data-jx-instance');
    if (value !== null) {
      const usageIndex = Number(value);
      if (Number.isInteger(usageIndex)) counts.set(usageIndex, (counts.get(usageIndex) ?? 0) + 1);
    }
    for (const child of element.children) tally(child);
  };
  tally(root);

  const records: StampRecord[] = [];
  const walk = (element: WalkerElement, parentUsageIndex: number | null): void => {
    const instance = element.getAttribute('data-jx-instance');
    const component = element.getAttribute('data-jx-component');
    let nextParent = parentUsageIndex;
    if (instance !== null && component !== null) {
      const usageIndex = Number(instance);
      if (Number.isInteger(usageIndex)) {
        records.push({ frameId, component, usageIndex, instanceCount: countOf(usageIndex), parentUsageIndex });
        nextParent = usageIndex;
      }
    }
    for (const child of element.children) walk(child, nextParent);
  };
  walk(root, null);
  return records;
}

/**
 * Collect every frame's records from a canvas document: each kit
 * iframe (by name) contributes its own document's stamp tree with its
 * frame id; the canvas document's OWN stamps (kit usages) carry
 * frameId null and walk first (document order).
 */
export function collectCanvasRecords(
  canvasDocument: { readonly body?: WalkerElement | null },
  iframes: readonly WalkerIframe[],
): StampRecord[] {
  const records = collectStampRecords(canvasDocument.body, null);
  for (const iframe of iframes) {
    const frameId = frameIdFromName(iframe.name);
    const body = iframe.contentDocument?.body ?? null;
    if (body === null) continue;
    records.push(...collectStampRecords(body, frameId));
  }
  return records;
}

/**
 * Collect ONE frame's records by frame id — the unified tree's LAZY
 * collector (r3 #20): finds the kit iframe by its contract name and
 * walks that document only. An unknown or mid-load frame (no body yet)
 * yields [] — the tree re-walks on the next expand/poll, never errors.
 */
export function collectFrameRecords(
  iframes: readonly WalkerIframe[],
  frameId: string,
): StampRecord[] {
  const body =
    iframes.find((iframe) => frameIdFromName(iframe.name) === frameId)?.contentDocument?.body ??
    null;
  if (body === null) return [];
  return collectStampRecords(body, frameId);
}
