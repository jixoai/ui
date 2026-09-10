/**
 * @jixoai/ui-design (knowledge) — the knowledge-pack builder (T6).
 *
 * Orthogonal intents (2):
 *   1. assemble the componentIndex from the repository registry.json
 *      (titles/descriptions grouped by meta.group — the mechanical
 *      layer) and the four-layer design-agent systemPrompt (three
 *      hand-written law layers + the generated selection layer).
 *   2. write the committed snapshot (snapshot.json, next to this
 *      file) — REPOSITORY BUILD TIME artifact; consumer machines read
 *      the snapshot and never touch registry paths (design-studio
 *      design.md §5, H4).
 *
 * Original need: Owner 2026-09-11. Run: `npm run knowledge:snapshot`
 * (or `node src/knowledge/build.ts`) — the committed snapshot is the
 * product; this script is the regenerator.
 *
 * Hand-written layer sources: design-studio design.md §2 (prototype
 * standard), ~/.agents AGENTS (8-state topology discipline, hit-lane
 * law — the design-side projection), openspec component-authoring
 * (Tier system) — distilled, not duplicated.
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/* ── types (shared with the runtime reader via knowledge.ts) ──────────── */

export interface KnowledgeItem {
  readonly name: string;
  readonly title: string;
  readonly description: string;
}

export interface KnowledgeGroup {
  readonly id: string;
  readonly items: readonly KnowledgeItem[];
}

export interface PromptLayer {
  readonly id: 'selection' | 'variants' | 'state-machine' | 'prototype-standard';
  readonly title: string;
  readonly body: string;
}

export interface KnowledgeSnapshot {
  readonly version: 1;
  readonly generatedAt: string;
  readonly componentIndex: { readonly groups: readonly KnowledgeGroup[] };
  readonly systemPrompt: { readonly layers: readonly PromptLayer[]; readonly full: string };
}

/* ── registry.json → componentIndex ───────────────────────────────────── */

interface RegistryItem {
  name?: unknown;
  title?: unknown;
  description?: unknown;
  meta?: { group?: unknown };
}

/** locate the repository root (the dir holding registry.json) walking up from this file */
function findRepoRoot(): string {
  let dir = dirname(fileURLToPath(import.meta.url));
  for (;;) {
    if (existsSync(join(dir, 'registry.json'))) return dir;
    const parent = dirname(dir);
    if (parent === dir) throw new Error('[design-knowledge] cannot locate registry.json walking up from the package');
    dir = parent;
  }
}

function buildComponentIndex(repoRoot: string): KnowledgeGroup[] {
  const registry = JSON.parse(readFileSync(join(repoRoot, 'registry.json'), 'utf8')) as { items?: RegistryItem[] };
  const items = Array.isArray(registry.items) ? registry.items : [];
  const groups = new Map<string, KnowledgeItem[]>();
  for (const item of items) {
    if (typeof item.name !== 'string') continue;
    const group = typeof item.meta?.group === 'string' ? item.meta.group : 'general';
    const entry: KnowledgeItem = {
      name: item.name,
      title: typeof item.title === 'string' ? item.title : item.name,
      description: typeof item.description === 'string' ? item.description : '',
    };
    const bucket = groups.get(group) ?? [];
    bucket.push(entry);
    groups.set(group, bucket);
  }
  // deterministic order: groups alphabetically, items in registry order
  return [...groups.entries()]
    .sort(([a], [b]) => (a < b ? -1 : 1))
    .map(([id, groupItems]) => ({ id, items: groupItems }));
}

/* ── the hand-written law layers ──────────────────────────────────────── */

const VARIANTS_LAYER = `## Variant & Context law

- Every interactive component carries a VARIANT LADDER, not boolean soup:
  check the component's index barrel for named paint/size exports
  (e.g. press-button ships PressButtonDefaults and PressButtonPaintVariant —
  prefer a named rung over ad-hoc class patching).
- Density, hit-lane and control chrome are CONTEXT-customizable: hosts
  wrap a context provider once and every descendant control follows
  (see the context-plugin item) — do not hand-tune per instance.
- Tier law: Tier-0 jx-pure styles BARE elements; Tier-1 components wrap
  native elements; Tier-2 class vocabulary (.jx-control-lane, .jx-field,
  .jx-label, .jx-error) is a cross-file contract — never restyle a
  Tier-2 class locally, pick the variant or the Context knob instead.`;

const STATE_MACHINE_LAYER = `## State-machine law (8-state topology discipline)

- Data surfaces answer EIGHT topologies: empty-data states
  (unloaded / loading / loaded-empty / error) and with-data states
  (loaded / updating / update-error / stale-while-revalidate). Design
  each surface that fetches with all eight explicit — a missing state
  is a design bug, not an edge case.
- Any interactive element that triggers a request binds a Loading lock
  by default (press-button's loading rung) — ghost clicks and double
  submits are forbidden.
- Hit-lane: interactive roots expose a physical activation rectangle at
  min-block-size var(--jx-hit); paint variants never shrink the lane.
- State design = writing real component code: express a component's
  states as separate ref files or a state-matrix wrapper file in the
  prototype workspace, never as props injection magic.`;

const PROTOTYPE_STANDARD_LAYER = `## Prototype standard (the design workspace)

Folder convention — position IS semantics (sveltekit spirit):

    design/prototypes/<name>/
      canvas.svelte        the declarative matrix tree (zero script beyond the kit import)
      pages/*.svelte       full-page prototypes (PrototypePage ref targets)
      components/*.svelte  isolated component prototypes (PrototypeComponent ref targets)

- canvas.svelte imports the kit by the STABLE specifier
  \`#jixoai/prototype-kit\` and is otherwise pure declaration:
  <PrototypeCanvas gridCols gridRows gap> nests freely;
  <PrototypePage|PrototypeComponent id ref width height theme> renders
  a REAL iframe at /__design__/frame — media and container queries
  follow the frame viewport, which is the whole point.
- FRAMES MUST MOUNT INSIDE a <PrototypeCanvas> wrapper — the wrapper
  is what provides the prototype-folder context; a bare frame
  degrades to the loud "no prototype context" notice (observed live:
  an agent-authored canvas omitted the wrapper, 2026-09-11). One
  canvas.svelte = ONE root PrototypeCanvas; nested matrices nest
  canvases inside it.
- ref paths are relative to the prototype folder ("./pages/hero.svelte");
  theme is "light" | "dark" | "auto" (dark = token class on the frame's
  document root; auto leaves it to the host).
- id convention "<name>-<viewport|part>-<w?>-<theme>"
  (e.g. checkout-desktop-1280-dark): ids are DOM anchors the studio
  navigator deep-links to; unique within the canvas.
- Import real components by \`#jixoai/<item>\` (e.g. \`#jixoai/press-button\`)
  — the design server maps the specifier to the host's component
  sources; prototypes stay portable across hosts.`;

/* ── assembly ─────────────────────────────────────────────────────────── */

function selectionLayerBody(groups: readonly KnowledgeGroup[]): string {
  const lines = ['## Component selection (when to use what)'];
  lines.push('');
  lines.push('Import form everywhere: #jixoai/<item> (e.g. #jixoai/press-button).');
  for (const group of groups) {
    lines.push('');
    lines.push(`### ${group.id}`);
    for (const item of group.items) {
      lines.push(`- ${item.name} — ${item.title}: ${item.description}`);
    }
  }
  return lines.join('\n');
}

export function buildKnowledgePack(repoRoot: string): KnowledgeSnapshot {
  const groups = buildComponentIndex(repoRoot);
  const layers: PromptLayer[] = [
    {
      id: 'selection',
      title: 'Component selection',
      body: selectionLayerBody(groups),
    },
    { id: 'variants', title: 'Variants & Context', body: VARIANTS_LAYER },
    { id: 'state-machine', title: 'State-machine discipline', body: STATE_MACHINE_LAYER },
    { id: 'prototype-standard', title: 'Prototype standard', body: PROTOTYPE_STANDARD_LAYER },
  ];
  const full = layers.map((layer) => layer.body).join('\n\n');
  return {
    version: 1,
    generatedAt: new Date().toISOString(),
    componentIndex: { groups },
    systemPrompt: { layers, full },
  };
}

/* ── CLI entry: regenerate the committed snapshot ─────────────────────── */

const SNAPSHOT_PATH = join(dirname(fileURLToPath(import.meta.url)), 'snapshot.json');

if (process.argv[1] && statSync(process.argv[1]).isFile() && process.argv[1].endsWith('build.ts')) {
  const repoRoot = process.argv[2] ?? findRepoRoot();
  const snapshot = buildKnowledgePack(repoRoot);
  const itemCount = snapshot.componentIndex.groups.reduce((sum, group) => sum + group.items.length, 0);
  const groupCount = snapshot.componentIndex.groups.length;
  // stable formatting: 2-space JSON, LF, trailing newline
  writeFileSync(SNAPSHOT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  console.log(`[design-knowledge] ${itemCount} items in ${groupCount} groups → ${SNAPSHOT_PATH}`);
  // sanity echo: the ui dir and registry item dirs must agree on count basis
  const uiDirs = readdirSync(join(repoRoot, 'registry/files/ui'), { withFileTypes: true }).filter((d) => d.isDirectory()).length;
  console.log(`[design-knowledge] registry/files/ui directories: ${uiDirs} (items include non-ui registry types)`);
}
