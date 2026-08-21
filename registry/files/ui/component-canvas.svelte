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
  deliberately NOT a live region), and `resolveFileContent` (code-drawer
  content resolver so usage files can track live playground state without
  making TreeFile.content a function). The playground snippet itself stays
  a free Snippet: layout contract classes — .jx-play-fields, .jx-play-field,
  .jx-play-help — are styled through :global() because scoped styles never
  reach snippet children.

  Layout law: header (font-nav h2 title + description + Source press button,
  hairline under — the button folds under the title in the narrow container
  form instead of crushing the description beside it) → demo row (stage
  flexes, playground takes clamp(18rem, 26cqi, 22rem) right at ≥48rem,
  below it otherwise; in the side-by-side form the pane's controls body
  scrolls inside a capped max-block-size so tall control stacks never
  stretch the canvas — on the stacked mobile form containment is dropped
  and the page scrolls naturally) → code bar (`</> Code` toggle +
  aria-controls wiring) → code drawer (grid-rows 0fr→1fr, the Combo ToC
  collapse law; inert while closed). In the narrow form the drawer scrolls
  in layers: the tree pins to the top of the drawer window (sticky) while
  the code view scrolls inside its own capped max-height.
  The stage keeps the readonly-code tint (color-mix muted 42%) in BOTH
  themes — the surface contrast is the point: components must read on a
  differently-tinted ground, not only on pure background. The playground
  pane answers with a much lighter tint (muted 12%) — a layer between
  stage and background, never a second stage.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import PressButton from '$lib/ui/press-button.svelte';
  import CodeCard from '$lib/ui/code-card.svelte';
  import TreeView, { inferTreeLang, type TreeFile, type TreeNode } from '$lib/ui/tree-view.svelte';

  /** Read-only playground state projection; never a live region. */
  export interface PlayEcho {
    label: string;
    value: string | number | boolean | null | undefined;
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
    /** PlayCanvas controls pane — consumer-authored interactive controls. */
    playground?: Snippet;
    /** Page-owned reset: shows the title-row reset button and calls back. */
    onreset?: () => void;
    /** Terminal-style read-only state footer for the playground pane. */
    echo?: readonly PlayEcho[];
    /** Code-drawer content override — lets usage files track live state. */
    resolveFileContent?: (file: TreeFile) => string;
    class?: string;
  }

  let {
    title,
    description,
    sourceUrl,
    files,
    children,
    playground,
    onreset,
    echo,
    resolveFileContent,
    class: className = '',
  }: Props = $props();

  // deterministic aria wiring: derived from the title so server and client
  // agree (Math.random ids would hydrate-mismatch); canvases on one page
  // must use distinct titles — the documented contract
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const titleId = `jx-canvas-${slug}-title`;
  const playgroundId = `jx-canvas-${slug}-playground`;
  const drawerId = `jx-canvas-${slug}-drawer`;

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
  // drawer default: the usage file when the list carries one (what readers
  // of a workbench open the drawer for), else the first file
  const current = $derived(
    files.find((f) => f.name === selectedPath) ??
      files.find((f) => f.name.endsWith('usage.svelte')) ??
      files[0]
  );
  const currentCode = $derived(
    current ? (resolveFileContent?.(current) ?? current.content) : ''
  );
  let codeOpen = $state(false);

  const leafName = (path: string): string => path.split('/').pop() ?? path;
</script>

<section class={`jx-canvas ${className}`}>
  <header class="jx-canvas-head">
    <div class="jx-canvas-head-text">
      <h2 class="jx-canvas-title" id={titleId}>{title}</h2>
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
    <div class="jx-canvas-stage" aria-label={`${title} demo`}>
      {@render children()}
    </div>
    {#if playground}
      <aside class="jx-canvas-playground" aria-labelledby={playgroundId}>
        <div class="jx-canvas-playground-head">
          <h3 class="jx-canvas-playground-title" id={playgroundId}>Playground</h3>
          {#if onreset}
            <button type="button" class="jx-canvas-reset" onclick={() => onreset?.()}>
              reset
            </button>
          {/if}
        </div>
        <div class="jx-canvas-playground-body">
          {@render playground()}
        </div>
        {#if echo?.length}
          <dl class="jx-canvas-echo">
            {#each echo as item (item.label)}
              <div class="jx-canvas-echo-row">
                <dt>{item.label}</dt>
                <dd>{item.value ?? '—'}</dd>
              </div>
            {/each}
          </dl>
        {/if}
      </aside>
    {/if}
  </div>

  <div class="jx-canvas-code-bar">
    <button
      type="button"
      class="jx-canvas-code-toggle"
      aria-expanded={codeOpen}
      aria-controls={drawerId}
      onclick={() => (codeOpen = !codeOpen)}
    >
      <span aria-hidden="true">{'</>'}</span>
      <span>Code</span>
    </button>
    <span class="jx-canvas-code-count">{files.length} {files.length === 1 ? 'file' : 'files'}</span>
  </div>

  <div
    class="jx-canvas-code-drawer"
    id={drawerId}
    data-open={codeOpen || undefined}
    inert={!codeOpen || undefined}
  >
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
              code={currentCode}
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
    container-type: inline-size;
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: 0;
    min-width: 0;
  }

  /* header: font-nav h2 title + description left, Source press button right;
     wraps, and in the narrow container form the text takes the full first
     row so the button folds UNDER the title instead of crushing the
     description into a narrow column beside it */
  .jx-canvas-head {
    align-items: flex-start;
    border-bottom: 1px solid var(--border);
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: space-between;
    padding: 0.8rem 1rem;
  }
  .jx-canvas-head-text {
    min-width: 0;
  }
  @container (max-width: 48rem) {
    .jx-canvas-head-text {
      flex: 1 1 100%;
    }
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

  /* demo row: stage flexes; the playground pane takes a container-relative
     clamp right at ≥48rem and stacks below otherwise. The clamp protects
     the pane at mid widths (18rem floor) while stopping it from eating the
     stage on wide containers (22rem ceiling). */
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
  /* pane layer law: stage owns the strong tint (muted 42%), the playground
     answers with a light one (muted 12%) — a layer between stage and
     background, never a second stage */
  .jx-canvas-playground {
    background: color-mix(in oklab, var(--muted) 12%, var(--background));
    border-top: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    min-inline-size: 0;
    padding: 0.85rem 1rem 1rem;
  }
  .jx-canvas-playground-head {
    align-items: baseline;
    display: flex;
    gap: 0.75rem;
    justify-content: space-between;
  }
  .jx-canvas-playground-title {
    color: var(--muted-foreground);
    font-family: var(--font-nav);
    font-size: 10px;
    letter-spacing: 0.24em;
    margin: 0 0 0.65rem;
    text-transform: uppercase;
  }
  /* reset: page-owned state protocol — the canvas only renders the button
     and keeps focus on it (no focus juggling after the call) */
  .jx-canvas-reset {
    background: none;
    border: none;
    color: var(--muted-foreground);
    cursor: pointer;
    font-family: var(--font-nav);
    font-size: 10px;
    letter-spacing: 0.18em;
    margin-bottom: 0.65rem;
    padding: 0;
    text-decoration: underline;
    text-underline-offset: 3px;
    text-transform: uppercase;
  }
  .jx-canvas-reset:hover {
    color: var(--foreground);
  }
  .jx-canvas-reset:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }
  .jx-canvas-playground-body {
    display: flex;
    flex-direction: column;
    gap: 0.85rem;
    min-height: 0;
    min-inline-size: 0;
  }
  /* snippet layout contract: scoped styles never reach snippet children,
     so the documented classes are styled through :global() pinned under
     this pane — .jx-play-fields (control stack), .jx-play-field (one
     control row), .jx-play-help (separated prose zone that must not carry
     form-field visual weight) */
  .jx-canvas-playground-body :global(.jx-play-fields) {
    display: grid;
    gap: 0.75rem;
    min-inline-size: 0;
  }
  .jx-canvas-playground-body :global(.jx-play-field) {
    min-inline-size: 0;
  }
  .jx-canvas-playground-body :global(.jx-play-help) {
    border-top: 1px solid color-mix(in oklab, var(--border) 70%, transparent);
    color: var(--muted-foreground);
    font-size: 11.5px;
    line-height: 1.55;
    margin: 0.25rem 0 0;
    padding-top: 0.7rem;
    text-wrap: pretty;
  }
  /* echo: terminal status footer. Read-only projection, never a live
     region (Range/input churn would swamp screen readers) */
  .jx-canvas-echo {
    border-top: 1px solid var(--border);
    display: grid;
    gap: 0.3rem;
    margin: 0.85rem 0 0;
    padding-top: 0.7rem;
  }
  .jx-canvas-echo-row {
    align-items: baseline;
    display: grid;
    gap: 0.6rem;
    grid-template-columns: minmax(5.5rem, auto) minmax(0, 1fr);
  }
  .jx-canvas-echo-row dt {
    color: var(--muted-foreground);
    font-family: var(--font-nav);
    font-size: 10px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }
  .jx-canvas-echo-row dd {
    color: var(--accent-foreground, var(--foreground));
    font-family: var(--font-mono, monospace);
    font-size: 11.5px;
    margin: 0;
    min-width: 0;
    overflow-wrap: anywhere;
  }
  @container (min-width: 48rem) {
    .jx-canvas-stage-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) clamp(18rem, 26cqi, 22rem);
    }
    .jx-canvas-playground {
      border-top: none;
      border-left: 1px solid var(--border);
      /* side-by-side containment: the controls body scrolls inside a capped
         block size so tall stacks never stretch the canvas or push the code
         bar away; the title row and echo footer stay pinned */
      max-block-size: min(36rem, 70vh);
    }
    .jx-canvas-playground-body {
      flex: 1 1 auto;
      overflow-y: auto;
      scrollbar-gutter: stable;
    }
    .jx-canvas-echo {
      flex: none;
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
  /* the drawer window: one bounded scroll area. Narrow form scrolls in
     LAYERS — tree pinned sticky at the top of this window, code capped
     into its own scroll beneath — so a multi-thousand-px file never
     becomes one endless shared column */
  .jx-canvas-code-panels {
    display: flex;
    flex-direction: column;
    max-height: 28rem;
    overflow: auto;
  }
  @container (min-width: 48rem) {
    .jx-canvas-code-panels {
      flex-direction: row;
    }
  }
  .jx-canvas-tree {
    background: var(--background);
    border-bottom: 1px solid var(--border);
    flex: none;
    max-height: 15rem;
    overflow-y: auto;
    padding: 0.5rem 0.4rem;
    /* stays visible at the top of the drawer window while the code layer
       scrolls beneath it (narrow form; reset on desktop, where the tree
       is a side column) */
    position: sticky;
    top: 0;
    z-index: 1;
  }
  @container (min-width: 48rem) {
    .jx-canvas-tree {
      border-bottom: none;
      border-right: 1px solid var(--border);
      max-height: none;
      position: static;
      width: 14rem;
      z-index: auto;
    }
  }
  .jx-canvas-code-view {
    flex: 1 1 auto;
    max-height: 24rem;
    min-width: 0;
    overflow-y: auto;
    padding: 0.5rem;
  }
  /* narrow form: the card keeps natural height inside the capped,
     independently scrolling view */
  .jx-canvas-code-view :global(.jx-code-card) {
    height: auto;
  }
  @container (min-width: 48rem) {
    .jx-canvas-code-view {
      max-height: none;
      overflow-y: visible;
    }
    .jx-canvas-code-view :global(.jx-code-card) {
      height: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .jx-canvas-code-drawer,
    .jx-canvas-code-toggle {
      transition: none;
    }
  }
</style>
