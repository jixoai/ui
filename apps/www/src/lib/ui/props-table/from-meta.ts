/**
 * propsFromMeta — the docs projection of a component's GENERATED meta
 * (docs-demo-standard, task 4.1).
 *
 * The SINGLE SOURCE is the two-zone `.meta.ts` file's GENERATED block
 * (component-metadata-gen, drift-gated by `verify:meta`): prop names,
 * kinds/typeText and defaults come from the registry source and NEVER
 * from a page. What stays page-side is the DOCS CURATION LAYER
 * (`PropsDocs`): prose, presentation flags, and honest corrections
 * where the extractor's documented ceiling bites (see the change's
 * design.md §1 for the verdict and the retirement path — JSDoc,
 * $bindable, `?` optionality, alias-to-union merging).
 *
 * Rendering rules match the hand-written tables byte-for-byte so the
 * pilot migration is a zero-content-drift refactoring (pinned by
 * test/props-table-meta-drift.spec.ts):
 *   - enum        → `'a' | 'b' | 'c'` (values in declaration order)
 *   - string/…    → the kind keyword
 *   - snippet/…   → typeText with `import('svelte').` normalized away
 *   - default     → literal rendered (`'…'`, false, 4); absent →
 *                   the override's display default, else the em dash
 *   - required    → ASSERTED via override only (never guessed: the
 *                   extractor does not emit `?` optionality, and
 *                   "no default ⇒ required" is wrong for optional
 *                   props like date-picker's `presets`)
 */
import type { ComponentMeta, PropNode } from '$lib/schema/ir';
import type { PropEntry } from './props-table.svelte';

/** Per-prop docs curation layered over the GENERATED truth. */
export interface PropDocOverride {
  /** prose for the Description column (until JSDoc extraction) */
  description?: string;
  /** type-text correction where extraction degrades (union alias,
   * conditional generic) — the honest ceiling, see design.md */
  type?: string;
  /** display default when the source has none (`inherited`, `auto`) */
  default?: string;
  /** asserted required — never derived */
  required?: boolean;
  /** the `$bindable()` seam, until the extractor emits it */
  bindable?: boolean;
  /** curation: rows the docs table omits (class, spread, internal) */
  hide?: boolean;
}

/** The docs curation for one component's table. */
export interface PropsDocs {
  overrides?: Record<string, PropDocOverride>;
  /** non-prop API rows appended after the meta rows (bind:this) */
  extra?: PropEntry[];
}

/** `import('svelte').Snippet` → `Snippet` — the idiomatic docs spelling. */
const normalizeTypeText = (text: string): string =>
  text.replace(/import\(['"]svelte['"]\)\./g, '');

function typeOf(node: PropNode, override?: PropDocOverride): string {
  if (override?.type !== undefined) return override.type;
  switch (node.kind) {
    case 'enum':
      return node.values.map((v) => `'${v}'`).join(' | ');
    case 'string':
      return 'string';
    case 'boolean':
      return 'boolean';
    case 'number':
      return 'number';
    default:
      return normalizeTypeText(node.typeText);
  }
}

function defaultOf(node: PropNode, override?: PropDocOverride): string {
  if (node.default !== undefined) {
    if (typeof node.default === 'string') return `'${node.default}'`;
    return String(node.default);
  }
  return override?.default ?? '—';
}

/**
 * Project a component meta (+ docs curation) onto the PropsTable row
 * shape, in declaration order — the interface's own order is the docs
 * order now (the hand-written tables' ad-hoc ordering retired).
 *
 * Quoted destructure keys (`'data-density'`) normalize to their bare
 * spelling and collapse onto the interface row when both extract
 * (checkbox extracts the pair; first occurrence wins).
 */
export function propsFromMeta(meta: ComponentMeta, docs: PropsDocs = {}): PropEntry[] {
  const overrides = docs.overrides ?? {};
  const rows: PropEntry[] = [];
  const seen = new Set<string>();
  for (const [rawName, node] of Object.entries(meta.props)) {
    const name = rawName.replace(/^'(.*)'$/, '$1');
    if (seen.has(name)) continue;
    seen.add(name);
    const override = overrides[name];
    if (override?.hide) continue;
    rows.push({
      name,
      type: typeOf(node, override),
      default: defaultOf(node, override),
      description: override?.description ?? '',
      required: override?.required ?? false,
      bindable: override?.bindable ?? false,
    });
  }
  return [...rows, ...(docs.extra ?? [])];
}
