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
 *   - ambient     → passed through verbatim from the IR (the family
 *                   Defaults slot facts, written by
 *                   component-metadata-gen; the Default column renders
 *                   the frozen three-state marker — 4.3)
 */
import type { ComponentMeta, PropNode } from '$lib/schema/ir';
import { UNIVERSAL_AXES, type UniversalAxisDoc } from '$lib/universal-props.schema';
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
      ambient: node.ambient,
    });
  }
  return [...rows, ...(docs.extra ?? [])];
}

// ── the universal props section (explicit-props W3-A, pulled-forward
// 4.3 — design §17) ─────────────────────────────────────────────────
//
// ONE shared rendering path: the rows project from the generated
// meta.universal block (the component-metadata-gen merge stamps
// UNIVERSAL_AXES into every family meta), falling back to the shared
// artifact itself for hand-written tables — never per-page hand
// copies. A family EARNS the section by carrying the axis props in
// its meta (the migration's honest signal): an unmigrated family's
// meta.universal exists but its props carry no axis names, so the
// section stays hidden until the family actually resolves them.

/** the eight axis names — the main table omits these rows when the
 *  universal section renders (the section is their one home) */
export const UNIVERSAL_AXIS_NAMES: ReadonlySet<string> = new Set(
  UNIVERSAL_AXES.map((doc) => doc.axis),
);

/** does this meta's family carry the universal surface? A migrated
 *  family's props carry SEVEN+ of the eight axis names — the legacy
 *  fleet carries at most one or two same-named props (density
 *  everywhere, theme on the terminal families), so a majority
 *  threshold is the honest migrated-vs-legacy discriminator */
export function metaHasUniversalSurface(meta: ComponentMeta): boolean {
  const names = Object.keys(meta.props).map((name) => name.replace(/^'(.*)'$/, '$1'));
  const hits = UNIVERSAL_AXIS_NAMES.size === 0
    ? 0
    : [...UNIVERSAL_AXIS_NAMES].filter((axis) => names.includes(axis)).length;
  return hits >= 5;
}

/** the lane type text for one axis doc: named steps · 'auto' · the
 *  number lane (per its unit) · the raw string lane (color only) */
function universalTypeText(doc: UniversalAxisDoc): string {
  const parts = doc.namedSteps.map((step) => `'${step}'`);
  parts.push("'auto'");
  if (doc.numberUnit !== null) parts.push('number');
  if (doc.rawLane) parts.push('string');
  return parts.join(' | ');
}

/**
 * The Universal props section's rows — every axis defaults 'auto' and
 * resolves `explicit ?? ambient ?? 'auto'` (the ambient-scope marker
 * rides the Default column, the same frozen wording the slot-carrying
 * props use).
 */
export function universalRows(meta?: ComponentMeta): PropEntry[] {
  const axes = meta?.universal ?? UNIVERSAL_AXES;
  return axes.map((doc) => ({
    name: doc.axis,
    type: universalTypeText(doc),
    default: "'auto'",
    description: doc.description,
    required: false,
    bindable: false,
    ambient: 'scope' as const,
  }));
}
