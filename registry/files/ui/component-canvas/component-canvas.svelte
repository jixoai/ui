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

  The stage keeps the readonly-code tint (color-mix muted 42%) in BOTH
  themes; the playground pane answers with the lighter muted-12% layer.
-->
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

  interface Props {
    /** Component name shown in the header (e.g. "press-button"). */
    title: string;
    /** One-line description under the title. */
    description?: string;
    /** GitHub source link (header right, icon-only external anchor). */
    sourceUrl?: string;
    /** Demo code files; flat list, names may carry paths ("src/lib/x.svelte"). */
    files: TreeFile[];
    /** LIVE demo area — the consumer renders the component instance. */
    children: Snippet;
    /**
     * Stage posture: fill (DEFAULT — children span the width) | center
     * (intrinsic specimens shrink + center) | start (intrinsic, left).
     */
    stage?: 'fill' | 'center' | 'start';
    /** PlayCanvas controls pane — consumer-authored interactive controls. */
    playground?: Snippet;
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
    files,
    children,
    stage = 'fill',
    playground,
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
</script>

<section
  data-jx-canvas
  class={cn('@container/jx-canvas-host bg-background border border-border rounded-none min-w-0', className)}
>
  <header data-jx-canvas-head class="flex flex-wrap items-start justify-between gap-4 px-4 py-[0.8rem] border-b border-border">
    <div class="jx-canvas-head-text min-w-0">
      <h2 data-jx-canvas-title class="m-0 text-foreground font-nav text-[15px] font-normal tracking-[0.01em] leading-[1.3]" id={titleId}>{title}</h2>
      {#if description}
        <p data-jx-canvas-description class="m-0 mt-[0.3rem] text-muted-foreground text-[12.5px] leading-[1.5] max-w-[62ch] text-pretty">{description}</p>
      {/if}
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
        class={cn(
          'jx-canvas-stage flex min-h-[200px] min-w-0 gap-4 p-6 bg-[color-mix(in_oklab,var(--muted)_42%,var(--background))]',
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
    {#if playground}
      <aside
        class="jx-canvas-playground flex flex-col min-w-0 pt-[0.85rem] px-4 pb-4 bg-[color-mix(in_oklab,var(--muted)_12%,var(--background))] border-t border-border"
        aria-label={`Controls for ${title}`}
      >
        <div data-jx-canvas-playground-head class="flex items-center justify-between gap-3">
          <h3 data-jx-canvas-playground-title class="jx-canvas-pane-title m-0 mb-[0.65rem] text-muted-foreground font-nav text-[10px] tracking-[0.24em] uppercase">Playground</h3>
          {#if onreset}
            <!-- icon-only reset (D6): press physics — a state mutation must
                 never be a feedback-free bare glyph -->
            <button
              type="button"
              data-jx-canvas-reset
              class="jx-press jx-canvas-reset mb-[0.45rem] inline-flex size-6 items-center justify-center border border-border bg-background text-muted-foreground hover:text-foreground cursor-pointer [--jx-press-shadow:none] [--jx-press-shadow-hover:none] [--jx-press-shadow-active:none]"
              aria-label="Reset playground"
              title="Reset playground"
              onclick={() => onreset?.()}
            >
              <span class="[&_svg]:h-3 [&_svg]:w-3" aria-hidden="true">{@html icons.rotateCcw}</span>
            </button>
          {/if}
        </div>
        <div class="jx-canvas-playground-body flex flex-col gap-[0.85rem] min-h-0 min-w-0">
          {@render playground()}
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
      <div class="jx-canvas-code-panels flex flex-col max-h-[28rem]">
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
        <div class="jx-canvas-code-view flex flex-1 flex-col min-h-0 min-w-0">
          {#if current}
            <!-- copyable=false: the code bar's inline-end copy button owns
                 copying — a footer bar with one duplicate button is noise
                 (Owner ruling, 2026-08-25) -->
            <CodeCard
              filename={leafName(current.name)}
              lang={current.lang ?? inferTreeLang(current.name)}
              code={currentCode}
              copyable={false}
              fill
              minHeight="16rem"
            />
          {/if}
        </div>
      </div>
    </div>
  </div>
</section>
