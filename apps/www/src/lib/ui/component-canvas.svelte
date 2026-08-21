<!--
  jixoai component canvas (registry/files/ui/component-canvas.svelte).
  The component documentation workbench: one bordered surface holding the
  LIVE demo area (children snippet, muted stage, centered), an optional
  PlayCanvas controls pane (playground snippet — sliders/selects/toggles
  authored by the consumer with the jixoai form base), and a collapsible
  code drawer combining tree-view (file tree from a flat `files` list,
  paths split on "/") with code-card (highlight + copy).

  Layout law: header (font-nav title + description + Source press button,
  hairline under) → demo row (stage flex-1, playground 16rem right at ≥md,
  below it otherwise) → code bar (`</> Code` toggle) → code drawer
  (grid-rows 0fr→1fr, the Combo ToC collapse law; inert while closed).
  The stage keeps the readonly-code tint (color-mix muted 42%) in BOTH
  themes — the surface contrast is the point: components must read on a
  differently-tinted ground, not only on pure background.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import PressButton from '$lib/ui/press-button.svelte';
  import CodeCard from '$lib/ui/code-card.svelte';
  import TreeView, { inferTreeLang, type TreeFile, type TreeNode } from '$lib/ui/tree-view.svelte';

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
    /** PlayCanvas controls pane — consumer-authored interactive controls. */
    playground?: Snippet;
    class?: string;
  }

  let {
    title,
    description,
    sourceUrl,
    files,
    children,
    playground,
    class: className = '',
  }: Props = $props();

  // flat files → nested tree: split on "/", intermediate segments are
  // directories; a name without "/" stays a root-level file
  function buildTree(list: TreeFile[]): TreeNode[] {
    const root: TreeNode[] = [];
    for (const file of list) {
      const parts = file.name.split('/').filter(Boolean);
      if (parts.length === 0) continue;
      let level = root;
      let dirPath = '';
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        dirPath = dirPath === '' ? part : `${dirPath}/${part}`;
        if (i === parts.length - 1) {
          level.push({ name: part, file });
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
  let selectedPath = $state('');
  const current = $derived(files.find((f) => f.name === selectedPath) ?? files[0]);
  let codeOpen = $state(false);

  const leafName = (path: string): string => path.split('/').pop() ?? path;
</script>

<section class={`jx-canvas ${className}`}>
  <header class="jx-canvas-head">
    <div class="jx-canvas-head-text">
      <p class="jx-canvas-title">{title}</p>
      {#if description}
        <p class="jx-canvas-description">{description}</p>
      {/if}
    </div>
    {#if sourceUrl}
      <PressButton variant="outline" href={sourceUrl} external ariaLabel={`${title} source on GitHub`}>
        <svg
          class="jx-canvas-source-icon"
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

  <div class="jx-canvas-stage-row">
    <div class="jx-canvas-stage">
      {@render children()}
    </div>
    {#if playground}
      <aside class="jx-canvas-playground" aria-label="playground controls">
        <p class="jx-canvas-playground-title">Playground</p>
        <div class="jx-canvas-playground-body">
          {@render playground()}
        </div>
      </aside>
    {/if}
  </div>

  <div class="jx-canvas-code-bar">
    <button
      type="button"
      class="jx-canvas-code-toggle"
      aria-expanded={codeOpen}
      onclick={() => (codeOpen = !codeOpen)}
    >
      <span aria-hidden="true">{'</>'}</span>
      <span>Code</span>
    </button>
    <span class="jx-canvas-code-count">{files.length} {files.length === 1 ? 'file' : 'files'}</span>
  </div>

  <div class="jx-canvas-code-drawer" data-open={codeOpen || undefined} inert={!codeOpen || undefined}>
    <div class="jx-canvas-code-clip">
      <div class="jx-canvas-code-panels">
        <aside class="jx-canvas-tree" aria-label="demo files">
          <TreeView
            {tree}
            selected={current?.name}
            onselect={(path) => (selectedPath = path)}
          />
        </aside>
        <div class="jx-canvas-code-view">
          {#if current}
            <CodeCard
              filename={leafName(current.name)}
              lang={current.lang ?? inferTreeLang(current.name)}
              code={current.content}
            />
          {/if}
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  /* shell: 1px border, radius 0, background — the stage tint and hairlines
     carry every internal separation */
  .jx-canvas {
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: 0;
    min-width: 0;
  }

  /* header: font-nav title + description left, Source press button right */
  .jx-canvas-head {
    align-items: flex-start;
    border-bottom: 1px solid var(--border);
    display: flex;
    gap: 1rem;
    justify-content: space-between;
    padding: 0.8rem 1rem;
  }
  .jx-canvas-head-text {
    min-width: 0;
  }
  .jx-canvas-title {
    color: var(--foreground);
    font-family: var(--font-nav);
    font-size: 15px;
    font-weight: 400;
    letter-spacing: 0.01em;
    line-height: 1.3;
    margin: 0;
  }
  .jx-canvas-description {
    color: var(--muted-foreground);
    font-size: 12.5px;
    line-height: 1.5;
    margin: 0.3rem 0 0;
    max-width: 62ch;
    text-wrap: pretty;
  }
  .jx-canvas-source-icon {
    height: 13px;
    width: 13px;
  }

  /* demo row: stage flexes; the playground pane sits right at ≥48rem and
     stacks below otherwise (16rem fixed on desktop) */
  .jx-canvas-stage-row {
    display: flex;
    flex-direction: column;
  }
  .jx-canvas-stage {
    align-items: center;
    background: color-mix(in oklab, var(--muted) 42%, var(--background));
    display: flex;
    flex: 1 1 auto;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
    min-height: 200px;
    min-width: 0;
    padding: 1.5rem;
  }
  .jx-canvas-playground {
    border-top: 1px solid var(--border);
    padding: 0.85rem 1rem 1rem;
  }
  .jx-canvas-playground-title {
    color: var(--muted-foreground);
    font-family: var(--font-nav);
    font-size: 10px;
    letter-spacing: 0.24em;
    margin: 0 0 0.65rem;
    text-transform: uppercase;
  }
  .jx-canvas-playground-body {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
  }
  @media (min-width: 48rem) {
    .jx-canvas-stage-row {
      flex-direction: row;
    }
    .jx-canvas-playground {
      border-top: none;
      border-left: 1px solid var(--border);
      flex: none;
      width: 16rem;
    }
  }

  /* code bar: `</> Code` toggle (press physics at card scale) + file count */
  .jx-canvas-code-bar {
    align-items: center;
    border-top: 1px solid var(--border);
    display: flex;
    gap: 0.75rem;
    justify-content: space-between;
    padding: 0.35rem 0.5rem 0.35rem 0.6rem;
  }
  .jx-canvas-code-toggle {
    align-items: center;
    background: var(--background);
    border: 1px solid var(--border);
    box-shadow: var(--shadow-2xs);
    color: var(--foreground);
    cursor: pointer;
    display: inline-flex;
    font-size: 11px;
    font-weight: 500;
    gap: 0.4rem;
    letter-spacing: 0.04em;
    padding: 0.25rem 0.6rem;
    transition:
      transform 150ms ease,
      box-shadow 150ms ease,
      background-color 150ms ease;
    white-space: nowrap;
  }
  .jx-canvas-code-toggle:hover {
    background: var(--muted);
    box-shadow: var(--shadow-xs);
    transform: translate(-1px, -1px);
  }
  .jx-canvas-code-toggle:active {
    box-shadow: none;
    transform: translate(1px, 1px);
  }
  .jx-canvas-code-toggle:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }
  .jx-canvas-code-toggle[aria-expanded='true'] {
    background: var(--muted);
  }
  .jx-canvas-code-count {
    color: var(--muted-foreground);
    font-size: 10.5px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  /* code drawer: grid-rows 0fr→1fr collapse (the ToC viewport law);
     inert while closed keeps the hidden tree/code out of the tab order */
  .jx-canvas-code-drawer {
    border-top: 1px solid var(--border);
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 200ms cubic-bezier(0.22, 1, 0.36, 1);
  }
  .jx-canvas-code-drawer[data-open] {
    grid-template-rows: 1fr;
  }
  .jx-canvas-code-clip {
    min-height: 0;
    overflow: hidden;
  }
  .jx-canvas-code-panels {
    display: flex;
    flex-direction: column;
    max-height: 28rem;
    overflow: auto;
  }
  @media (min-width: 48rem) {
    .jx-canvas-code-panels {
      flex-direction: row;
    }
  }
  .jx-canvas-tree {
    border-bottom: 1px solid var(--border);
    flex: none;
    max-height: 15rem;
    overflow-y: auto;
    padding: 0.5rem 0.4rem;
  }
  @media (min-width: 48rem) {
    .jx-canvas-tree {
      border-bottom: none;
      border-right: 1px solid var(--border);
      max-height: none;
      width: 14rem;
    }
  }
  .jx-canvas-code-view {
    flex: 1 1 auto;
    min-width: 0;
    padding: 0.5rem;
  }
  .jx-canvas-code-view :global(.jx-code-card) {
    height: 100%;
  }

  @media (prefers-reduced-motion: reduce) {
    .jx-canvas-code-drawer,
    .jx-canvas-code-toggle {
      transition: none;
    }
  }
</style>
