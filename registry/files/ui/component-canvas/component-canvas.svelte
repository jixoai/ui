<!--
  jixoai component canvas (registry/files/ui/component-canvas.svelte).
  The component documentation workbench: one bordered surface holding the
  LIVE demo area (children snippet, muted stage, centered), an optional
  Playground controls pane (playground snippet — consumer-authored with
  the jixoai form base), and a collapsible code drawer combining tree-view
  (file tree from a flat `files` list) with code-card (highlight + copy).

  Playground protocol (P1): the pane offers three optional seams the page
  wires up — `onreset` (title-row reset button; the page owns the state
  snapshot, the canvas never reflects consumer state), `echo` (a read-only
  terminal key/value footer replacing hand-written "bound value" captions;
  deliberately NOT a live region; rides the playground pane, so it needs
  the snippet present), and `resolveFileContent` (code-drawer content
  resolver so usage files can track live playground state without making
  TreeFile.content a function). The playground snippet itself stays
  a free Snippet: layout contract classes — .jx-play-fields, .jx-play-field,
  .jx-play-help — are styled through the residue sheet because in-markup
  utilities never reach snippet children.

  Layout law: header (font-nav h2 title + description + Source press button,
  hairline under — the button folds under the title in the narrow container
  form instead of crushing the description beside it) → demo row (stage
  flexes, playground takes clamp(18rem, 26cqi, 22rem) right at ≥48rem,
  below it otherwise; in the side-by-side form the pane's controls body
  scrolls inside a capped max-block-size so tall control stacks never
  stretch the canvas — on the stacked mobile form containment is dropped
  and the page scrolls naturally) → code bar (`</> Code` toggle +
  aria-controls wiring) → code drawer (grid-rows 0fr→1fr, the Combo ToC
  collapse law; inert while closed). The drawer is a bounded LAYOUT, not
  a scroll area (2026-08-22, user): every panel scrolls inside itself —
  the tree in its own capped window, the code through CodeCard's fill
  mode (head/foot pinned, the <pre> is the single code scrollport).
  The stage keeps the readonly-code tint (color-mix muted 42%) in BOTH
  themes — the surface contrast is the point: components must read on a
  differently-tinted ground, not only on pure background. The playground
  pane answers with a much lighter tint (muted 12%) — a layer between
  stage and background, never a second stage.

  tw4 (2026-08-24): every element this file authors carries its paint as
  token utilities (deterministic branches for stage posture, drawer open
  and toggle pressed states); component-canvas.css keeps ONLY the
  D1-exempt residue — the two 48rem container tiers (cqi clamp math),
  the snippet-children layout contracts, the tree's scrollbar-gutter
  recipe, the code-card frame strip, focus-visible rings and the
  reduced-motion kill. The canvas chrome is every docs page's frame:
  when in doubt, it stays residue.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import CodeCard from '$lib/ui/code-card/code-card.svelte';
  import TreeView, { type TreeNode } from '$lib/ui/tree-view/tree-view.svelte';
  import { cn } from '$lib/utils';
  import './component-canvas.css';

  /** Read-only playground state projection; never a live region. */
  export interface PlayEcho {
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
    /** GitHub source link (header right, outline external press button). */
    sourceUrl?: string;
    /** Demo code files; flat list, names may carry paths ("src/lib/x.svelte"). */
    files: TreeFile[];
    /** LIVE demo area — the consumer renders the component instance. */
    children: Snippet;
    /** Stage layout: center (default) | start (left-align) | stretch (full-width) */
    stage?: 'center' | 'start' | 'stretch';
    /** PlayCanvas controls pane — consumer-authored interactive controls. */
    playground?: Snippet;
    /** Page-owned reset: shows the title-row reset button and calls back. */
    onreset?: () => void;
    /** Terminal-style read-only state footer for the playground pane. */
    echo?: readonly PlayEcho[];
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
    stage = 'center',
    playground,
    onreset,
    echo,
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
  const playgroundId = `jx-canvas-${canvasId}-playground`;
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
  function formatEcho(value: PlayEcho['value']): string {
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

  // stage posture: one deterministic branch per prop value
  const stageUtilities = {
    center: '',
    start: 'jx-stage-start items-start justify-start',
    stretch: 'jx-stage-stretch items-stretch [justify-content:stretch]',
  } as const;
</script>

<section class={cn('jx-canvas @container bg-background border border-border rounded-none min-w-0', className)}>
  <header class="jx-canvas-head flex flex-wrap items-start justify-between gap-4 px-4 py-[0.8rem] border-b border-border">
    <div class="jx-canvas-head-text min-w-0">
      <h2 class="jx-canvas-title m-0 text-foreground font-nav text-[15px] font-normal tracking-[0.01em] leading-[1.3]" id={titleId}>{title}</h2>
      {#if description}
        <p class="jx-canvas-description m-0 mt-[0.3rem] text-muted-foreground text-[12.5px] leading-[1.5] max-w-[62ch] text-pretty">{description}</p>
      {/if}
    </div>
    {#if sourceUrl}
      <PressButton variant="outline" href={sourceUrl} external ariaLabel={`${title} source on GitHub`}>
        <svg
          class="jx-canvas-source-icon h-[13px] w-[13px]"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          aria-hidden="true"
        >
          <path d="M7 17 17 7" />
          <path d="M7 7h10v10" />
        </svg>
        <span>Source</span>
      </PressButton>
    {/if}
  </header>

  <div class="jx-canvas-stage-row flex flex-col">
    <div
      class={cn(
        'jx-canvas-stage flex flex-1 flex-wrap items-center justify-center gap-4 min-h-[200px] min-w-0 p-6 bg-[color-mix(in_oklab,var(--muted)_42%,var(--background))]',
        stageUtilities[stage],
      )}
      aria-label={`${title} demo`}
    >
      {@render children()}
    </div>
    {#if playground}
      <aside class="jx-canvas-playground flex flex-col min-w-0 pt-[0.85rem] px-4 pb-4 bg-[color-mix(in_oklab,var(--muted)_12%,var(--background))] border-t border-border" aria-labelledby={playgroundId}>
        <div class="jx-canvas-playground-head flex items-baseline justify-between gap-3">
          <h3 class="jx-canvas-playground-title m-0 mb-[0.65rem] text-muted-foreground font-nav text-[10px] tracking-[0.24em] uppercase" id={playgroundId}>Playground</h3>
          {#if onreset}
            <button
              type="button"
              class="jx-canvas-reset bg-transparent border-transparent text-muted-foreground hover:text-foreground cursor-pointer font-nav text-[10px] tracking-[0.18em] mb-[0.65rem] p-0 underline [text-underline-offset:3px] uppercase"
              ariaLabel={`Reset ${title} playground`}
              onclick={() => onreset?.()}
            >
              reset
            </button>
          {/if}
        </div>
        <div class="jx-canvas-playground-body flex flex-col gap-[0.85rem] min-h-0 min-w-0">
          {@render playground()}
        </div>
        {#if echo?.length}
          <dl class="jx-canvas-echo grid gap-[0.3rem] m-0 mt-[0.85rem] pt-[0.7rem] border-t border-border">
            {#each echo as item, index (`${item.label}-${index}`)}
              <div class="jx-canvas-echo-row grid items-baseline gap-[0.6rem] grid-cols-[minmax(5.5rem,auto)_minmax(0,1fr)]">
                <dt class="text-muted-foreground font-nav text-[10px] tracking-[0.14em] uppercase">{item.label}</dt>
                <dd class="text-[color:var(--accent-foreground,var(--foreground))] font-mono text-[11.5px] m-0 min-w-0 [overflow-wrap:anywhere]">{formatEcho(item.value)}</dd>
              </div>
            {/each}
          </dl>
        {/if}
      </aside>
    {/if}
  </div>

  <div class="jx-canvas-code-bar flex items-center justify-between gap-3 border-t border-border pt-[0.35rem] pe-2 pb-[0.35rem] ps-[0.6rem]">
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
      <span aria-hidden="true">{'</>'}</span>
      <span>Code</span>
    </button>
    <div class="jx-canvas-code-actions flex items-center gap-3">
      {#if usageFile}
        <button type="button" class="jx-canvas-copy-usage bg-transparent border-transparent text-muted-foreground hover:text-primary cursor-pointer font-nav text-[10px] tracking-[0.14em] p-0 underline [text-underline-offset:3px] uppercase" ariaLabel="copy the usage snippet" onclick={() => copyUsage()}>
          {copiedUsage ? 'copied ✓' : 'copy usage'}
        </button>
      {/if}
      <span class="jx-canvas-code-count text-muted-foreground text-[10.5px] tracking-[0.08em] uppercase">{files.length} {files.length === 1 ? 'file' : 'files'}</span>
    </div>
  </div>

  <div
    class={cn(
      'jx-canvas-code-drawer border-t border-border grid grid-rows-[0fr] transition-[grid-template-rows] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
      codeOpen && 'grid-rows-[1fr]',
    )}
    id={drawerId}
    data-open={codeOpen || undefined}
    inert={!codeOpen || undefined}
  >
    <div class="jx-canvas-code-clip min-h-0 overflow-hidden">
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
            <CodeCard
              filename={leafName(current.name)}
              lang={current.lang ?? inferTreeLang(current.name)}
              code={currentCode}
              fill
              minHeight="16rem"
            />
          {/if}
        </div>
      </div>
    </div>
  </div>
</section>
