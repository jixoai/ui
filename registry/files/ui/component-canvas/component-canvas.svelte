<!--
  jixoai component canvas (registry/files/ui/component-canvas/component-canvas.svelte).
  The component documentation workbench: one bordered surface holding the
  LIVE demo area (children snippet on a muted stage), an optional
  Playground controls pane (playground snippet — consumer-authored with
  the jxoai form base), and a collapsible code drawer combining tree-view
  with code-card (highlight + copy).

  Redesign (2026-08-25, Codex design round D1–D6):
  - THREE LAYERS: the section is the named layout container
    (@container/jx-canvas-host — the ≥48rem sidebar tier); inside it the
    SCROLL LAYER is the demo's named container (@container/jx-canvas on
    the scrollport itself, so demo container queries see the width the
    scrollbar actually leaves) with a default max-block-size and native
    auto-scroll; the STAGE keeps the tint, padding and posture only.
  - stage: 'fill' (children span the available width) | 'center'
    (intrinsic specimens, shrink+center) | 'start' (intrinsic, left).
    The default is 'center' during the migration window; the fill
    default lands with the consumer sweep.
  - header controls are icon-only with real semantics (Source →
    external-link anchor; playground reset → rotate-ccw button — both
    press-physics, jx-press law); the code bar is a single DISCLOSURE:
    chevron + "Code" + the file count adjacent, copy-usage icon-only
    right; aria-expanded/controls + region + inert kept.
  - `output` (was `echo`): the read-only state projection, deliberately
    NOT a live region — renders as item-rhythm rows under the controls.

  Playground protocol (P1, kept): `onreset`, `output`,
  `resolveFileContent` seams; the snippet itself stays free — layout
  contract classes (.jx-play-fields …) live in the residue sheet until
  the kit migration removes them.

  Schema mode (canvas-schema-pipeline, 2026-08-30): an optional
  `schema` prop (a LOWERED jsonSchema — `toJSONSchema` export from
  $lib/schema, passed by value) makes the canvas a jsonSchema2Form
  consumer: it renders the control rows itself from `controlsFor`
  (below — self-contained, registry law: no $lib/schema import, the
  mirror would break), keeps `bind:values` two-way (initialized from
  schema defaults), and exposes an `onvalue(key, value)` seam so the
  page owns value semantics for non-representable props (e.g. mapping
  effect names to builders). Precedence: `playground` snippet > schema
  rows > plain canvas; reset falls back to schema defaults when
  `onreset` is absent.

  The floor (canvas-floor-lab, 2026-08-30):
  - OUTLINE LAW: the root section carries `data-toc-skip` and the
    header title is a STYLED PARAGRAPH (`p[data-jx-canvas-title]`),
    never a real heading — the page's own outline stays page-owned
    (the h2 leak, audit root cause). The Playground h3 lives inside
    the skipped root, so it never joins the ToC either.
  - STAGE TOGGLES: light/dark + comfortable/compact segmented pairs in
    the header project `bind:theme`/`bind:density` onto the STAGE
    element only — `data-theme` plus the theme sheet's own `dark` /
    `jx-light` token-scope classes, and `data-density` mapped onto the
    sheet's scale (compact → 'sm', comfortable → 'default'). State is
    composition-first: the page owns it through the bindables; the
    canvas only renders controls and scoping attributes. Static under
    reduced motion by construction (no transition rides the re-theme).
  - DRAWER SHAPE: ≤2 files render filename TABS over one CodeCard
    (real tablist: roving tabindex, arrows/Home/End, automatic
    activation); ≥3 files keep the tree pane. Files always arrive as
    data — the page's `?raw` imports own every byte shown.
  - INSTALL BADGE: an optional `install` prop (registry item name)
    renders the copy-command chip (`npx jixoai-ui add <name>`) with a
    clipboard flash. The sourceUrl VALUE is derived page-side from the
    registry path projection ($lib/registry-source) — the canvas just
    anchors it.

  The stage keeps the readonly-code tint (color-mix muted 42%) in BOTH
  themes; the playground pane answers with the lighter muted-12% layer.
-->
<script module lang="ts">
  // ── jsonSchema control rows (canvas-schema-pipeline, 2026-08-30) ──
  // The canvas's OWN mapping vocabulary, self-contained in the MODULE
  // script so it is statically importable (the press-builder law:
  // module exports are the component's importable surface) and
  // registry-safe (no $lib/schema import — the mirror would break).
  // $lib/schema/schema2form.ts re-exports it as the kernel surface:
  // one implementation, no second copy. The input type below is
  // structurally lower.ts's SchemaObject: same shape, no import.

  /** x-ui annotation block as the canvas reads it (kernel XUI, by shape). */
  export interface CanvasXUI {
    control?: 'segmented' | 'select' | 'toggle' | 'stepper' | 'slider' | 'text' | 'none';
    label?: string;
    description?: string;
    lane?: 'end' | 'block';
    unit?: string;
    sourceType?: string;
  }

  /** One lowered prop node: standard jsonSchema keywords + x-ui passthrough. */
  export interface CanvasSchemaProp {
    type?: 'string' | 'boolean' | 'number';
    enum?: string[];
    minimum?: number;
    maximum?: number;
    multipleOf?: number;
    default?: string | number | boolean;
    'x-ui'?: CanvasXUI;
  }

  /** The lowered schema the canvas consumes (lower.ts SchemaObject, by shape). */
  export interface CanvasSchema {
    type: 'object';
    properties: Record<string, CanvasSchemaProp>;
    required?: string[];
  }

  export type ControlKind = 'segmented' | 'select' | 'toggle' | 'stepper' | 'slider' | 'text';

  /** Typed row descriptor the schema pane renders. */
  export interface ControlRow {
    key: string;
    control: ControlKind;
    label: string;
    description?: string;
    lane: 'end' | 'block';
    unit?: string;
    /** segmented/select options — the labels ARE the values */
    values?: string[];
    minimum?: number;
    maximum?: number;
    /** stepper/slider step: multipleOf when the schema constrains it, else 1 */
    step: number;
    default?: string | number | boolean;
  }

  /** enum length at/below which the segmented control renders */
  const SEGMENTED_MAX = 5;
  /** text rows switch to the block lane when the description runs long */
  const BLOCK_DESCRIPTION_LENGTH = 48;

  function feasibleControl(hint: string, node: CanvasSchemaProp): boolean {
    switch (hint) {
      case 'segmented':
      case 'select':
        return Array.isArray(node.enum);
      case 'toggle':
        return node.type === 'boolean';
      case 'stepper':
        return node.type === 'number';
      case 'slider':
        return (
          node.type === 'number' &&
          typeof node.minimum === 'number' &&
          typeof node.maximum === 'number'
        );
      case 'text':
        return node.type === 'string';
      default:
        return false;
    }
  }

  /**
   * Lowered schema → panel rows. `x-ui.control: 'none'` (the lowering's
   * mark for snippet/opaque nodes) and unrepresentable shapes are
   * excluded; an explicit, feasible x-ui hint wins over inference.
   */
  export function controlsFor(schema: CanvasSchema | undefined | null): ControlRow[] {
    const rows: ControlRow[] = [];
    for (const [key, node] of Object.entries(schema?.properties ?? {})) {
      const hint = node['x-ui']?.control;
      if (hint === 'none') continue;
      let control: ControlKind | undefined;
      if (hint !== undefined && feasibleControl(hint, node)) {
        control = hint;
      } else if (Array.isArray(node.enum)) {
        control = node.enum.length <= SEGMENTED_MAX ? 'segmented' : 'select';
      } else if (node.type === 'boolean') {
        control = 'toggle';
      } else if (node.type === 'number') {
        control = 'stepper';
      } else if (node.type === 'string') {
        control = 'text';
      }
      if (control === undefined) continue;
      const description = node['x-ui']?.description;
      const row: ControlRow = {
        key,
        control,
        label: node['x-ui']?.label ?? key,
        lane:
          node['x-ui']?.lane ??
          (control === 'text' && (description?.length ?? 0) > BLOCK_DESCRIPTION_LENGTH ? 'block' : 'end'),
        step: typeof node.multipleOf === 'number' && node.multipleOf > 0 ? node.multipleOf : 1,
      };
      if (description !== undefined) row.description = description;
      if (node['x-ui']?.unit !== undefined) row.unit = node['x-ui'].unit;
      if (Array.isArray(node.enum)) row.values = [...node.enum];
      if (typeof node.minimum === 'number') row.minimum = node.minimum;
      if (typeof node.maximum === 'number') row.maximum = node.maximum;
      if (node.default !== undefined) row.default = node.default;
      rows.push(row);
    }
    return rows;
  }

  /** The schema-defaults record an unbound `values` initializes to. */
  export function schemaDefaultsOf(schema: CanvasSchema): Record<string, string | number | boolean> {
    const out: Record<string, string | number | boolean> = {};
    for (const [key, node] of Object.entries(schema.properties)) {
      if (node.default !== undefined) out[key] = node.default;
    }
    return out;
  }
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import CodeCard from '$lib/ui/code-card/code-card.svelte';
  import TreeView, { type TreeNode } from '$lib/ui/tree-view/tree-view.svelte';
  import { icons } from '$lib/icons';
  import { cn } from '$lib/utils';
  import './component-canvas.css';

  /** Read-only playground state projection; never a live region. */
  export interface PlayOutput {
    label: string;
    value: string | number | boolean | null | undefined | readonly unknown[];
  }

  /** Demo code file for the code drawer: name may carry a path. */
  export interface TreeFile {
    /** File path as authored (e.g. "src/lib/ui/button.svelte") or bare name. */
    name: string;
    content: string;
    /** Tokenizer hint; inferred from the name extension when omitted. */
    lang?: string;
    /** drawer protocol marker: the copyable usage file */
    kind?: 'usage';
  }

  /** Extension → Shiki language id (aliases resolve in lib/shiki). */
  export function inferTreeLang(name: string): string {
    const ext = name.split('.').pop()?.toLowerCase() ?? '';
    switch (ext) {
      case 'ts':
        return 'ts';
      case 'tsx':
        return 'tsx';
      case 'js':
      case 'mjs':
      case 'cjs':
        return 'js';
      case 'jsx':
        return 'jsx';
      case 'svelte':
        return 'svelte';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'scss':
        return 'scss';
      case 'json':
        return 'json';
      case 'sh':
      case 'bash':
      case 'zsh':
        return 'bash';
      default:
        return ext || 'ts';
    }
  }

  // ── jsonSchema control rows: types + controlsFor live in the MODULE
  // script (statically importable, registry-safe) — see above. The
  // instance consumes them through the shared module scope.

  interface Props {
    /** Component name shown in the header (e.g. "press-button"). */
    title: string;
    /** One-line description under the title. */
    description?: string;
    /**
     * GitHub source link (header right, icon-only external anchor).
     * The VALUE is page-side derived from the registry path
     * ($lib/registry-source) — never hand-written.
     */
    sourceUrl?: string;
    /**
     * Registry item name — renders the header's copy-command badge
     * (`npx jixoai-ui add <install>`) with a clipboard flash. Absent
     * on canvases whose title is not a registry item.
     */
    install?: string;
    /** Demo code files; flat list, names may carry paths ("src/lib/x.svelte"). */
    files: TreeFile[];
    /** LIVE demo area — the consumer renders the component instance. */
    children: Snippet;
    /**
     * Stage posture: fill (DEFAULT — children span the width) | center
     * (intrinsic specimens shrink + center) | start (intrinsic, left).
     */
    stage?: 'fill' | 'center' | 'start';
    /**
     * Stage preview theme — PAGE-OWNED (bindable). Projects
     * `data-theme` + the theme sheet's `dark`/`jx-light` token-scope
     * class onto the STAGE element only; the docs chrome and sibling
     * canvases never re-theme.
     */
    theme?: 'light' | 'dark';
    /**
     * Stage preview density — PAGE-OWNED (bindable). 'compact' maps
     * onto the theme sheet's 'sm' density scope, 'comfortable' onto
     * 'default' — projected as `data-density` on the STAGE element
     * only.
     */
    density?: 'comfortable' | 'compact';
    /** PlayCanvas controls pane — consumer-authored interactive controls. */
    playground?: Snippet;
    /**
     * jsonSchema control mode: a LOWERED schema (`toJSONSchema` export)
     * the pane renders rows from. The `playground` snippet, when both
     * are supplied, still takes precedence (escape-hatch law).
     */
    schema?: CanvasSchema;
    /** Schema-mode panel values — two-way; initialized from schema defaults. */
    values?: Record<string, unknown>;
    /**
     * Schema-mode change seam: the page intercepts and owns value
     * semantics for non-representable props (effect builders, …),
     * writing back through `bind:values`.
     */
    onvalue?: (key: string, value: unknown) => void;
    /** Page-owned reset: shows the pane's reset button and calls back. */
    onreset?: () => void;
    /** Read-only state projection rows under the controls. */
    output?: readonly PlayOutput[];
    /** Code-drawer content override — lets usage files track live state. */
    resolveFileContent?: (file: TreeFile) => string;
    /** Explicit id override when two canvases on one page would slug-collide. */
    id?: string;
    class?: string;
  }

  let {
    title,
    description,
    sourceUrl,
    install,
    files,
    children,
    stage = 'fill',
    theme = $bindable('light'),
    density = $bindable('comfortable'),
    playground,
    schema,
    values = $bindable(),
    onvalue,
    onreset,
    output,
    resolveFileContent,
    id,
    class: className = '',
  }: Props = $props();

  // deterministic aria wiring: derived from the title so server and client
  // agree (Math.random ids would hydrate-mismatch). Distinct titles slug
  // apart; same-title or collision-prone titles (non-ASCII, "A B" vs "A-B")
  // pass an explicit `id` — the documented contract
  const canvasId =
    id ??
    title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  const titleId = `jx-canvas-${canvasId}-title`;
  const drawerId = `jx-canvas-${canvasId}-drawer`;

  // ---- schema mode (canvas-schema-pipeline, 2026-08-30) ----------------
  // Rows come from the one mapping (controlsFor, module scope); values
  // initialize from the schema's defaults when the page binds none (a
  // bound page object always wins — including a bound undefined, the
  // documented way to say "canvas, own my values"). Precedence law:
  // playground snippet > schema rows > plain canvas.
  const rows = $derived(controlsFor(schema));
  const defaults = $derived(schema === undefined ? {} : schemaDefaultsOf(schema));
  // one-shot by design: schema identity is a mount-time contract, not
  // reactive state the pane tracks
  // svelte-ignore state_referenced_locally
  if (values === undefined && schema !== undefined) values = schemaDefaultsOf(schema);

  function setValue(key: string, value: unknown): void {
    values = values === undefined ? { [key]: value } : { ...values, [key]: value };
    onvalue?.(key, value);
  }

  /** The reset fallback: restore schema defaults (onreset replaces this). */
  function resetValues(): void {
    if (!schema) return;
    const previous = values ?? {};
    const next = { ...defaults };
    values = next;
    // the seam stays complete across a reset: the page's onvalue mapping
    // (e.g. effect-name → builder) re-runs for every key it settles
    for (const key of Object.keys(next)) {
      if (previous[key] !== next[key]) onvalue?.(key, next[key]);
    }
  }

  const rowValue = (row: ControlRow): unknown => values?.[row.key] ?? row.default;

  function stepValue(row: ControlRow, direction: 1 | -1): void {
    let next = Number(rowValue(row));
    if (!Number.isFinite(next)) next = row.minimum ?? 0;
    if (row.minimum !== undefined) next = Math.max(row.minimum, next);
    if (row.maximum !== undefined) next = Math.min(row.maximum, next);
    next += row.step * direction;
    if (row.minimum !== undefined) next = Math.max(row.minimum, next);
    if (row.maximum !== undefined) next = Math.min(row.maximum, next);
    setValue(row.key, next);
  }

  const stepText = (row: ControlRow): string => {
    const n = Number(rowValue(row));
    return Number.isFinite(n) ? String(n) : String(row.minimum ?? 0);
  };

  const ctlId = (key: string): string => `jx-canvas-${canvasId}-ctl-${key}`;
  const labelId = (key: string): string => `jx-canvas-${canvasId}-ctl-${key}-label`;
  const descId = (key: string): string => `jx-canvas-${canvasId}-ctl-${key}-desc`;

  // flat files → nested tree: split on "/", intermediate segments are
  // directories; a name without "/" stays a root-level file. The file
  // payload rides TreeNode.meta.
  function buildTree(list: TreeFile[]): TreeNode<TreeFile>[] {
    const root: TreeNode<TreeFile>[] = [];
    for (const file of list) {
      const parts = file.name.split('/').filter(Boolean);
      if (parts.length === 0) continue;
      let level = root;
      let dirPath = '';
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        dirPath = dirPath === '' ? part : `${dirPath}/${part}`;
        if (i === parts.length - 1) {
          level.push({ name: part, meta: file });
        } else {
          let dir = level.find((n) => n.children !== undefined && n.name === part);
          if (!dir) {
            dir = { name: part, children: [] };
            level.push(dir);
          }
          level = dir.children!;
        }
      }
    }
    return root;
  }

  const tree = $derived(buildTree(files));
  // every directory open on drawer mount (the workbench law)
  const openFolders = $derived.by(() => {
    const ids: string[] = [];
    const walk = (list: TreeNode<TreeFile>[], parent: string | null): void => {
      for (const node of list) {
        if (!node.children) continue;
        const path = parent === null ? node.name : `${parent}/${node.name}`;
        ids.push(path);
        walk(node.children, path);
      }
    };
    walk(tree, null);
    return ids;
  });
  let selectedPath = $state('');
  $effect(() => {
    void files;
    selectedPath = '';
  });
  // drawer default: the usage file when the list carries one (what readers
  // of a workbench open the drawer for), else the first file
  const current = $derived(
    files.find((f) => f.name === selectedPath) ??
      files.find((f) => f.name.endsWith('usage.svelte')) ??
      files[0],
  );
  const currentCode = $derived(
    current ? (resolveFileContent?.(current) ?? current.content) : '',
  );
  let codeOpen = $state(false);

  // ---- drawer shape (canvas-floor-lab, 2026-08-30) -----------------------
  // ≤2 files: filename TABS over one CodeCard (the two-file floor —
  // press-button + its usage file is the median docs item); ≥3: the
  // tree pane stays. A real tablist: roving tabindex, arrows/Home/End,
  // automatic activation (selection follows focus).
  const drawerMode = $derived(files.length <= 2 ? 'tabs' : 'tree');
  const currentTabIndex = $derived(
    current ? files.findIndex((f) => f.name === current.name) : -1,
  );
  const tabId = (index: number): string => `jx-canvas-${canvasId}-tab-${index}`;
  const panelId = `jx-canvas-${canvasId}-code-panel`;
  let tabsEl = $state<HTMLDivElement | null>(null);
  function onTabsKeydown(event: KeyboardEvent): void {
    const deltas: Record<string, number | 'home' | 'end'> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      Home: 'home',
      End: 'end',
    };
    const move = deltas[event.key];
    if (move === undefined) return;
    const buttons = tabsEl ? [...tabsEl.querySelectorAll<HTMLButtonElement>('[role="tab"]')] : [];
    if (buttons.length === 0) return;
    event.preventDefault();
    const currentIdx = buttons.findIndex((b) => b.tabIndex === 0);
    const next =
      move === 'home'
        ? 0
        : move === 'end'
          ? buttons.length - 1
          : (currentIdx + move + buttons.length) % buttons.length;
    selectedPath = files[next]?.name ?? '';
    buttons[next]?.focus();
  }

  const leafName = (path: string): string => path.split('/').pop() ?? path;

  const usageFile = $derived(
    files.find((f) => f.kind === 'usage') ?? files.find((f) => f.name.endsWith('usage.svelte')),
  );
  function formatOutput(value: PlayOutput['value']): string {
    if (value === null || value === undefined) return '—';
    if (Array.isArray(value)) {
      const text = value.map(String).join(', ');
      return text.length > 40 ? text.slice(0, 40) + '…' : text || '[]';
    }
    const text = String(value);
    return text.length > 60 ? text.slice(0, 60) + '…' : text || '—';
  }

  let copiedUsage = $state(false);
  function copyUsage(): void {
    const file = usageFile;
    if (!file) return;
    void navigator.clipboard?.writeText(resolveFileContent?.(file) ?? file.content);
    copiedUsage = true;
    setTimeout(() => (copiedUsage = false), 1600);
  }

  // the install badge's clipboard flash (canvas-floor-lab): one command,
  // one click — the page passes the registry item name, the badge owns
  // only the copy feedback
  let copiedInstall = $state(false);
  function copyInstall(): void {
    if (!install) return;
    void navigator.clipboard?.writeText(`npx jixoai-ui add ${install}`);
    copiedInstall = true;
    setTimeout(() => (copiedInstall = false), 1600);
  }
</script>

<section
  data-jx-canvas
  data-toc-skip=""
  class={cn('@container/jx-canvas-host bg-background border border-border rounded-none min-w-0', className)}
>
  <header data-jx-canvas-head class="flex flex-wrap items-start justify-between gap-4 px-4 py-[0.8rem] border-b border-border">
    <div class="jx-canvas-head-text min-w-0">
      <!-- OUTLINE LAW (canvas-floor-lab): a STYLED PARAGRAPH, never a real
           heading — the root data-toc-skip plus this demotion keep the
           canvas chrome out of every page ToC (the h2 leak root fix) -->
      <p data-jx-canvas-title class="m-0 text-foreground font-nav text-[15px] font-normal tracking-[0.01em] leading-[1.3]" id={titleId}>{title}</p>
      {#if description}
        <p data-jx-canvas-description class="m-0 mt-[0.3rem] text-muted-foreground text-[12.5px] leading-[1.5] max-w-[62ch] text-pretty">{description}</p>
      {/if}
    </div>
    <div data-jx-canvas-head-actions class="flex flex-none flex-wrap items-center gap-2 pt-[0.1rem]">
      {#if install}
        <!-- copy-command badge (the Terminal-round absorbed output): the
             install argument in mono, clipboard flash on commit -->
        <button
          type="button"
          data-jx-canvas-install
          data-copied={copiedInstall || undefined}
          class="jx-press jx-canvas-install inline-flex items-center gap-[0.45rem] border border-border bg-background px-[0.55rem] text-foreground/80 hover:text-foreground cursor-pointer text-[11px] font-mono whitespace-nowrap [--jx-press-shadow:none] [--jx-press-shadow-hover:none] [--jx-press-shadow-active:none]"
          aria-label={copiedInstall ? 'Install command copied' : `Copy the install command for ${install}`}
          title={copiedInstall ? 'copied' : 'copy install command'}
          onclick={() => copyInstall()}
        >
          <span>npx jixoai-ui add {install}</span>
          <span class="[&_svg]:h-3 [&_svg]:w-3" aria-hidden="true">{@html (copiedInstall ? icons.check : icons.copy)}</span>
        </button>
      {/if}
      <!-- stage toggles (the floor): page-owned bindables projected onto the
           STAGE element only — segmented law, static under reduced motion -->
      <div class="jx-canvas-seg" role="group" aria-label="Stage theme" data-jx-canvas-theme-seg>
        <button
          type="button"
          class="jx-press jx-canvas-seg-btn"
          data-jx-canvas-theme-option="light"
          aria-pressed={theme === 'light'}
          onclick={() => (theme = 'light')}
        >light</button>
        <button
          type="button"
          class="jx-press jx-canvas-seg-btn"
          data-jx-canvas-theme-option="dark"
          aria-pressed={theme === 'dark'}
          onclick={() => (theme = 'dark')}
        >dark</button>
      </div>
      <div class="jx-canvas-seg" role="group" aria-label="Stage density" data-jx-canvas-density-seg>
        <button
          type="button"
          class="jx-press jx-canvas-seg-btn"
          data-jx-canvas-density-option="comfortable"
          aria-pressed={density === 'comfortable'}
          onclick={() => (density = 'comfortable')}
        >comfortable</button>
        <button
          type="button"
          class="jx-press jx-canvas-seg-btn"
          data-jx-canvas-density-option="compact"
          aria-pressed={density === 'compact'}
          onclick={() => (density = 'compact')}
        >compact</button>
      </div>
      {#if sourceUrl}
        <!-- icon-only source anchor: press physics, the label lives in the
             accessible name (D6 — the full button crowded the header) -->
        <a
          data-jx-canvas-source
          class="jx-press inline-flex size-7 flex-none items-center justify-center border border-border bg-background text-foreground/70 hover:text-foreground [--jx-press-shadow:var(--shadow-2xs)] [--jx-press-shadow-hover:var(--shadow-xs)] [--jx-press-shadow-active:var(--shadow-xs-press)]"
          href={sourceUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Open source on GitHub"
          title="Open source on GitHub"
        >
          <span class="[&_svg]:h-[13px] [&_svg]:w-[13px]" aria-hidden="true">{@html icons.externalLink}</span>
        </a>
      {/if}
    </div>
  </header>

  <div class="jx-canvas-stage-row flex flex-col">
    <!-- the scroll layer (D5): default bounded height + native auto-scroll;
         the NAMED demo container sits on the scrollport so demo container
         queries see the width the scrollbar actually leaves -->
    <div
      data-jx-canvas-scroll
      class="jx-canvas-scroll @container/jx-canvas flex-1 min-h-0 min-w-0"
    >
      <div
        data-jx-canvas-stage
        data-stage={stage}
        data-theme={theme}
        data-density={density === 'compact' ? 'sm' : 'default'}
        class={cn(
          'jx-canvas-stage flex min-h-[200px] min-w-0 gap-4 p-6 bg-[color-mix(in_oklab,var(--muted)_42%,var(--background))]',
          // theme sheet vocabulary, scoped to the stage subtree only: .dark
          // flips the token set (and dark: utilities) inside the demo;
          // .jx-light pins light tokens even under a dark docs page
          theme === 'dark' ? 'dark' : 'jx-light',
          stage === 'center' && 'flex-wrap items-center justify-center',
          stage === 'start' && 'flex-wrap items-start justify-start',
          stage === 'fill' && 'flex-wrap items-stretch [justify-content:stretch]',
        )}
        aria-label={`${title} demo`}
      >
        <!-- the demo-content scope (site-polish F10): consumer-authored
             demo markup renders inside this marker so the docs structure
             lint (verify-docs-structure.mjs) can scope its heading rule —
             a real h1-h3 in demo copy pollutes the page outline and fails
             the lint, while this canvas's OWN chrome (title, Playground)
             stays outside the wrapper and exempt. display:contents keeps
             the stage's flex layout on the demo nodes themselves. -->
        <div data-doc-demo-content="" class="contents">
          {@render children()}
        </div>
      </div>
    </div>
    {#if playground || schema}
      <aside
        class="jx-canvas-playground flex flex-col min-w-0 pt-[0.85rem] px-4 pb-4 bg-[color-mix(in_oklab,var(--muted)_12%,var(--background))] border-t border-border"
        aria-label={`Controls for ${title}`}
      >
        <div data-jx-canvas-playground-head class="flex items-center justify-between gap-3">
          <h3 data-jx-canvas-playground-title class="jx-canvas-pane-title m-0 mb-[0.65rem] text-muted-foreground font-nav text-[10px] tracking-[0.24em] uppercase">Playground</h3>
          {#if onreset || (!playground && schema)}
            <!-- icon-only reset (D6): press physics — a state mutation must
                 never be a feedback-free bare glyph. Page-owned onreset
                 wins; schema mode falls back to schema defaults -->
            <button
              type="button"
              data-jx-canvas-reset
              class="jx-press jx-canvas-reset mb-[0.45rem] inline-flex size-6 items-center justify-center border border-border bg-background text-muted-foreground hover:text-foreground cursor-pointer [--jx-press-shadow:none] [--jx-press-shadow-hover:none] [--jx-press-shadow-active:none]"
              aria-label="Reset playground"
              title="Reset playground"
              onclick={() => (onreset ? onreset() : resetValues())}
            >
              <span class="[&_svg]:h-3 [&_svg]:w-3" aria-hidden="true">{@html icons.rotateCcw}</span>
            </button>
          {/if}
        </div>
        <div class="jx-canvas-playground-body flex flex-col gap-[0.85rem] min-h-0 min-w-0">
          {#if playground}
            <!-- escape-hatch precedence: the snippet renders and the schema
                 rows are NOT duplicated beside it -->
            {@render playground()}
          {:else}
            {#each rows as row (row.key)}
              {#if row.control === 'toggle'}
                <!-- the toggle row's ROOT is the label: the physical hit
                     lane spans the whole row (hit-lane law — a corner
                     click toggles), the native checkbox keeps its glyph
                     size inside the lane -->
                <label
                  data-jx-canvas-row
                  data-jx-canvas-control="toggle"
                  data-lane={row.lane}
                  class="jx-canvas-ctl"
                >
                  <span class="jx-canvas-ctl-label" data-jx-canvas-row-label>{row.label}</span>
                  <input
                    type="checkbox"
                    class="jx-canvas-toggle"
                    data-jx-canvas-toggle
                    checked={Boolean(rowValue(row))}
                    aria-describedby={row.description ? descId(row.key) : undefined}
                    onchange={(event) => setValue(row.key, event.currentTarget.checked)}
                  />
                  {#if row.description}
                    <span class="jx-canvas-ctl-desc" id={descId(row.key)}>{row.description}</span>
                  {/if}
                </label>
              {:else}
                <div
                  data-jx-canvas-row
                  data-jx-canvas-control={row.control}
                  data-lane={row.lane}
                  class="jx-canvas-ctl"
                >
                  <label class="jx-canvas-ctl-label" data-jx-canvas-row-label for={ctlId(row.key)} id={labelId(row.key)}>{row.label}</label>
                  <div class="jx-canvas-ctl-control">
                    {#if row.control === 'segmented'}
                      <div class="jx-canvas-seg" role="group" aria-labelledby={labelId(row.key)} data-jx-canvas-seg>
                        {#each row.values ?? [] as option (option)}
                          <button
                            type="button"
                            class="jx-press jx-canvas-seg-btn"
                            data-jx-canvas-seg-option={option}
                            aria-pressed={String(rowValue(row)) === option}
                            onclick={() => setValue(row.key, option)}
                          >{option}</button>
                        {/each}
                      </div>
                    {:else if row.control === 'select'}
                      <select
                        class="jx-canvas-select"
                        id={ctlId(row.key)}
                        data-jx-canvas-select
                        aria-describedby={row.description ? descId(row.key) : undefined}
                        onchange={(event) => setValue(row.key, event.currentTarget.value)}
                      >
                        {#each row.values ?? [] as option (option)}
                          <option value={option} selected={String(rowValue(row)) === option}>{option}</option>
                        {/each}
                      </select>
                    {:else if row.control === 'stepper'}
                      <div class="jx-canvas-stepper" role="group" aria-labelledby={labelId(row.key)} data-jx-canvas-stepper>
                        <button
                          type="button"
                          class="jx-press jx-canvas-step-btn"
                          data-jx-canvas-step="dec"
                          aria-label={`Decrease ${row.label}`}
                          onclick={() => stepValue(row, -1)}
                        >−</button>
                        <span class="jx-canvas-step-value" data-jx-canvas-stepper-value>{stepText(row)}{row.unit ? ` ${row.unit}` : ''}</span>
                        <button
                          type="button"
                          class="jx-press jx-canvas-step-btn"
                          data-jx-canvas-step="inc"
                          aria-label={`Increase ${row.label}`}
                          onclick={() => stepValue(row, 1)}
                        >+</button>
                      </div>
                    {:else if row.control === 'slider'}
                      <input
                        type="range"
                        class="jx-canvas-slider"
                        id={ctlId(row.key)}
                        data-jx-canvas-slider
                        min={row.minimum}
                        max={row.maximum}
                        step={row.step}
                        value={Number(rowValue(row) ?? row.minimum ?? 0)}
                        aria-describedby={row.description ? descId(row.key) : undefined}
                        oninput={(event) => setValue(row.key, Number(event.currentTarget.value))}
                      />
                    {:else}
                      <input
                        type="text"
                        class="jx-canvas-text"
                        id={ctlId(row.key)}
                        data-jx-canvas-text
                        value={String(rowValue(row) ?? '')}
                        aria-describedby={row.description ? descId(row.key) : undefined}
                        oninput={(event) => setValue(row.key, event.currentTarget.value)}
                      />
                    {/if}
                  </div>
                  {#if row.description}
                    <p class="jx-canvas-ctl-desc" id={descId(row.key)}>{row.description}</p>
                  {/if}
                </div>
              {/if}
            {/each}
          {/if}
        </div>
        {#if output?.length}
          <!-- the output projection (D4): read-only rows in the item rhythm;
               dl semantics kept, never a live region -->
          <dl class="jx-canvas-output m-0 mt-[0.85rem] flex flex-col gap-[0.25rem]">
            {#each output as item, index (`${item.label}-${index}`)}
              <div
                data-jx-canvas-output-row
                class="grid items-baseline gap-[0.6rem] grid-cols-[minmax(5.5rem,auto)_minmax(0,1fr)] bg-[color-mix(in_oklab,var(--muted)_30%,transparent)] border border-[color-mix(in_oklab,var(--border)_60%,transparent)] px-[0.5rem] py-[0.28rem]"
              >
                <dt class="text-muted-foreground font-nav text-[10px] tracking-[0.14em] uppercase">{item.label}</dt>
                <dd class="text-[color:var(--accent-foreground,var(--foreground))] font-mono text-[11.5px] m-0 min-w-0 [overflow-wrap:anywhere]">{formatOutput(item.value)}</dd>
              </div>
            {/each}
          </dl>
        {/if}
      </aside>
    {/if}
  </div>

  <div data-jx-canvas-code-bar class="flex items-center justify-between gap-3 border-t border-border pt-[0.35rem] pe-2 pb-[0.35rem] ps-[0.6rem]">
    <!-- one disclosure (D6): chevron + Code + the count adjacent; the
         chevron rotates with aria-expanded -->
    <button
      type="button"
      class={cn(
        'jx-press jx-canvas-code-toggle inline-flex items-center gap-[0.4rem] bg-background border border-border text-foreground hover:bg-muted cursor-pointer text-[11px] font-medium tracking-[0.04em] px-[0.6rem] py-1 whitespace-nowrap',
        '[--jx-press-shadow:var(--shadow-2xs)] [--jx-press-shadow-hover:var(--shadow-xs)] [--jx-press-shadow-active:var(--shadow-xs-press)]',
        codeOpen && 'bg-muted',
      )}
      aria-expanded={codeOpen}
      aria-controls={drawerId}
      onclick={() => (codeOpen = !codeOpen)}
    >
      <span
        class="jx-canvas-chevron inline-flex [&_svg]:h-[13px] [&_svg]:w-[13px] transition-transform duration-150 ease-out"
        class:rotate-180={codeOpen}
        aria-hidden="true"
      >
        {@html icons.chevronDown}
      </span>
      <span>Code</span>
      <span class="text-muted-foreground font-mono text-[10px]">· {files.length}</span>
    </button>
    <div data-jx-canvas-code-actions class="flex items-center gap-3">
      {#if usageFile}
        <button
          type="button"
          class="jx-press jx-canvas-copy-usage inline-flex size-6 items-center justify-center border border-border bg-background text-muted-foreground hover:text-primary cursor-pointer [--jx-press-shadow:none] [--jx-press-shadow-hover:none] [--jx-press-shadow-active:none]"
          aria-label={copiedUsage ? 'Usage copied' : 'Copy the usage snippet'}
          title={copiedUsage ? 'copied' : 'copy usage'}
          onclick={() => copyUsage()}
        >
          <span class="[&_svg]:h-3 [&_svg]:w-3" aria-hidden="true">{@html (copiedUsage ? icons.check : icons.copy)}</span>
        </button>
      {/if}
    </div>
  </div>

  <div
    class={cn(
      'jx-canvas-code-drawer border-t border-border grid grid-rows-[0fr] transition-[grid-template-rows] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
      codeOpen && 'grid-rows-[1fr]',
    )}
    id={drawerId}
    role="region"
    aria-labelledby={titleId}
    data-open={codeOpen || undefined}
    inert={!codeOpen || undefined}
  >
    <div data-jx-canvas-code-clip class="min-h-0 overflow-hidden">
      <div class="jx-canvas-code-panels flex flex-col max-h-[28rem]" data-shape={drawerMode}>
        {#if drawerMode === 'tree'}
          <aside
            class="jx-canvas-tree bg-background border-b border-border flex-none max-h-40 overflow-y-auto"
            aria-label="demo files"
          >
            <TreeView
              nodes={tree}
              defaultExpanded={openFolders}
              selected={current?.name}
              fileIcons
              onselect={(ctx) => (selectedPath = ctx.id)}
            />
          </aside>
        {:else}
          <!-- the two-file floor: filename tabs over ONE CodeCard — no tree
               pane. Real tablist semantics: roving tabindex + automatic
               activation (arrows/Home/End select and focus) -->
          <div
            class="jx-canvas-tabs bg-background border-b border-border flex-none overflow-x-auto"
            role="tablist"
            aria-label="demo files"
            data-jx-canvas-tabs
            bind:this={tabsEl}
            onkeydown={onTabsKeydown}
          >
            {#each files as file, index (file.name)}
              {@const selected = current?.name === file.name}
              <button
                type="button"
                role="tab"
                id={tabId(index)}
                class="jx-press jx-canvas-tab"
                data-jx-canvas-tab={file.name}
                aria-selected={selected}
                tabindex={selected ? 0 : -1}
                title={file.name}
                onclick={() => (selectedPath = file.name)}
              >{leafName(file.name)}</button>
            {/each}
          </div>
        {/if}
        <div class="jx-canvas-code-view flex flex-1 flex-col min-h-0 min-w-0">
          {#if current}
            <!-- copyable=false: the code bar's inline-end copy button owns
                 copying — a footer bar with one duplicate button is noise
                 (Owner ruling, 2026-08-25) -->
            <div
              role="tabpanel"
              id={panelId}
              aria-labelledby={currentTabIndex >= 0 ? tabId(currentTabIndex) : undefined}
              class="contents"
            >
              <CodeCard
                filename={leafName(current.name)}
                lang={current.lang ?? inferTreeLang(current.name)}
                code={currentCode}
                copyable={false}
                fill
                minHeight="16rem"
              />
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</section>
