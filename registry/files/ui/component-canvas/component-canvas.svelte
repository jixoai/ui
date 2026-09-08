<!--
  jixoai component canvas (registry/files/ui/component-canvas/component-canvas.svelte).
  The component documentation workbench: one bordered surface holding the
  LIVE demo area (children snippet on a muted stage), the FLOATING
  playground dock (canvas-playground.svelte — collapsible, draggable,
  absolute over the stage-row's top-right corner; consumer `playground`
  snippet or schema-lowered rows inside ONE integrated ItemGroup), and a
  collapsible code drawer combining tree-view with code-card (highlight +
  copy).

  The dock era (canvas-playground-dock, 2026-09-08): the permanent
  Playground aside lane is RETIRED — the stage is always full-width and
  the controls live in the floating dock (the Owner reform ruling). The
  `pane` prop is GONE. The schema kernel (types + controlsFor +
  schemaDefaultsOf + PlayOutput) lives in canvas-schema.svelte.ts,
  re-exported from this file's module script (public surface stable);
  the dock owns the value state machine and the row adapters.

  Redesign (2026-08-25, Codex design round D1–D6):
  - THREE LAYERS: the section is the named layout container
    (@container/jx-canvas-host); inside it the SCROLL LAYER is the
    demo's named container (@container/jx-canvas on the scrollport
    itself, so demo container queries see the width the scrollbar
    actually leaves) with a default max-block-size and native
    auto-scroll; the STAGE keeps the tint, padding and posture only.
  - stage: 'fill' (children span the available width) | 'center'
    (intrinsic specimens, shrink+center) | 'start' (intrinsic, left).
  - header controls are icon-only with real semantics (Source →
    external-link anchor; the dock's reset → rotate-ccw button — both
    press-physics, jx-press law); the code bar is a single DISCLOSURE:
    chevron + "Code" + the file count adjacent, copy-usage icon-only
    right; aria-expanded/controls + region + inert kept.
  - `output` (was `echo`): the read-only state projection, deliberately
    NOT a live region — renders as item-rhythm rows at the dock's foot.

  Playground protocol (P1, kept): `onreset`, `output`,
  `resolveFileContent` seams; the snippet renders inside the dock's
  ItemGroup and stays free-form (the site kit's PlayFields provides the
  same integrated ItemGroup posture on the snippet side).

  Schema mode (canvas-schema-pipeline, 2026-08-30): an optional
  `schema` prop (a LOWERED jsonSchema — `toJSONSchema` export from
  $lib/schema, passed by value) makes the canvas a jsonSchema2Form
  consumer: the DOCK renders the control rows from the kernel's
  `controlsFor`, keeps `bind:values` two-way (initialized from schema
  defaults), and exposes an `onvalue(key, value)` seam so the page owns
  value semantics for non-representable props (e.g. mapping effect
  names to builders). Precedence: `playground` snippet > schema rows >
  plain canvas; reset falls back to schema defaults when `onreset` is
  absent.

  The floor (canvas-floor-lab, 2026-08-30):
  - OUTLINE LAW: the root section carries `data-toc-skip` and the
    header title is a STYLED PARAGRAPH (`p[data-jx-canvas-title]`),
    never a real heading — the page's own outline stays page-owned
    (the h2 leak, audit root cause). No canvas heading joins a ToC.
  - STAGE CHROME (unified-chrome ruling, Owner amendment 2026-09-08):
    the theme/density toggle-groups MOVED from the header into the DOCK
    HEAD — one icon button flips `bind:theme` light↔dark (sun/moon,
    aria-pressed carries state), a compact native select drives
    `bind:density` with the REPO-STANDARD Density vocabulary
    (xs/sm/default/lg) stamped onto the STAGE element DIRECTLY as
    `data-density` (the comfortable/compact mapping is dead), plus
    `data-theme` and the theme sheet's own `dark` / `jx-light`
    token-scope classes — scoped to the STAGE only; the docs chrome
    and sibling canvases never re-theme. State is composition-first:
    the page owns it through the bindables; the dock only renders
    controls and the stage carries the scoping attributes. The stage
    anchors `text-foreground` itself: the scope classes redefine
    TOKENS only, so inherit-based text must re-anchor or it keeps the
    page's resolved color (the white-on-light-stage leak, 2026-09-01).
    Static under reduced motion by construction (no transition rides
    the re-theme).
  - DRAWER SHAPE: the tree pane ALWAYS — one shape for every file count
    (Owner revert 2026-09-01: the two-file tabs floor of canvas-floor-lab
    is gone). Container-query responsive: stacked (tree over code) under
    the host's 48rem tier, side-by-side (tree column left of the code
    view) at ≥48rem. Files always arrive as data — the page's `?raw`
    imports own every byte shown.
  - INSTALL BADGE: an optional `install` prop (registry item name)
    renders the copy-command chip (`npx jixoai-ui add <name>`) with a
    clipboard flash. The sourceUrl VALUE is derived page-side from the
    registry path projection ($lib/registry-source) — the canvas just
    anchors it. The header's ACTIONS ROW is stamped data-jx-chrome: the
    toggle-groups, the source anchor (h/w var(--jx-hit)) and the badge
    (min-h var(--jx-hit)) all ride the chrome band's ONE hit size.

  Stage POSTURE opt-out (adversarial-review batch 6, 2026-09-02):
  - `scroll='grow'` lifts the scroll layer's default block cap — for
    full-composition demos (hero-section) whose own stacking IS the
    presentation: a capped scrollport cuts the composition mid-element
    and shows only the bottom element's top sliver (the V2-4 black-bar
    root cause). The page accepts a longer canvas instead.
  - the old `pane='below'` opt-out is RETIRED: the full-width stage it
    bought is now the permanent posture (the dock floats above it).

  The stage keeps the readonly-code tint (color-mix muted 42%) in BOTH
  themes; the dock answers with the surface-card background.
-->
<script module lang="ts">
  // ── schema kernel (canvas-playground-dock, 2026-09-08) ──
  // The jsonSchema control vocabulary (types + controlsFor +
  // schemaDefaultsOf + the constants + PlayOutput) lives in
  // canvas-schema.svelte.ts since the dock extraction — the dock and
  // $lib/schema/schema2form.ts import the kernel file directly (no
  // circularity); this star re-export keeps the canvas's PUBLIC
  // surface byte-stable for consumers (the press-builder law: module
  // exports are the component's importable surface).
  export * from './canvas-schema.svelte';
</script>

<script lang="ts">
  import type { Snippet } from 'svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import CodeCard from '$lib/ui/code-card/code-card.svelte';
  import TreeView, { type TreeNode } from '$lib/ui/tree-view/tree-view.svelte';
  import CanvasPlayground from './canvas-playground.svelte';
  import { controlsFor, schemaDefaultsOf } from './canvas-schema.svelte';
  import type { CanvasSchema, PlayOutput } from './canvas-schema.svelte';
  import type { Density } from '$lib/density.svelte';
  import { ComponentCanvasDefaults } from './component-canvas-defaults.svelte';
  import Icon from '$lib/ui/icon';
  import { cn } from '$lib/utils';
  import './component-canvas.css';

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

  // ── jsonSchema control rows: the kernel (types + controlsFor +
  // schemaDefaultsOf) lives in canvas-schema.svelte.ts since the dock
  // extraction; the canvas imports it here only to derive the rows +
  // defaults it hands the dock.

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
     * Stage scroll posture: 'capped' (DEFAULT — the scroll layer bounds
     * at min(32rem, 60vh) with native auto-scroll) | 'grow' (the cap
     * lifts; the canvas grows to fit the demo in full). For
     * full-composition demos whose own stacking is the presentation —
     * a capped scrollport would cut the composition mid-element.
     */
    scroll?: 'capped' | 'grow';
    /**
     * Stage preview theme — PAGE-OWNED (bindable). Projects
     * `data-theme` + the theme sheet's `dark`/`jx-light` token-scope
     * class onto the STAGE element only; the docs chrome and sibling
     * canvases never re-theme. The dock head's icon button flips it
     * (the unified chrome, 2026-09-08).
     */
    theme?: 'light' | 'dark';
    /**
     * Stage density — PAGE-OWNED (bindable), the REPO-STANDARD Density
     * union (xs | sm | default | lg in the dock's select). Stamped as
     * `data-density` on the STAGE element DIRECTLY — the old
     * comfortable/compact mapping died with the header toggle-groups
     * (Owner amendment, 2026-09-08).
     */
    density?: Density;
    /** Playground dock — consumer-authored interactive controls. */
    playground?: Snippet;
    /**
     * jsonSchema control mode: a LOWERED schema (`toJSONSchema` export)
     * the dock renders rows from. The `playground` snippet, when both
     * are supplied, still takes precedence (escape-hatch law).
     */
    schema?: CanvasSchema;
    /** Schema-mode dock values — two-way; initialized from schema defaults. */
    values?: Record<string, unknown>;
    /**
     * Schema-mode change seam: the page intercepts and owns value
     * semantics for non-representable props (effect builders, …),
     * writing back through `bind:values`.
     */
    onvalue?: (key: string, value: unknown) => void;
    /** Page-owned reset: shows the dock's reset button and calls back. */
    onreset?: () => void;
    /** Read-only state projection rows at the dock's foot. */
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
    scroll = 'capped',
    theme = $bindable('light'),
    density = $bindable('default'),
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

  // ---- schema mode (canvas-playground-dock, 2026-09-08) -----------------
  // The canvas only DERIVES: rows + defaults come from the kernel and
  // pass into the dock; the value state machine (init/set/reset/step)
  // lives in the dock beside the rows it drives. Precedence law:
  // playground snippet > schema rows > plain canvas.
  const rows = $derived(controlsFor(schema));
  const defaults = $derived(schema === undefined ? {} : schemaDefaultsOf(schema));

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
  // the tree's id grammar (F-13, 2026-09-02): TreeView builds every id
  // by joining the split path segments — the SAME normalization
  // buildTree applies when it nests the nodes (empty segments dropped).
  // The selected-path lookup must speak that grammar too: an authored
  // name with a stray './' or '//' builds a normalized tree id that
  // never equals the raw name, so the selection would silently fall
  // back to the usage file. Normalize both sides of the comparison.
  const treeIdOf = (name: string): string => name.split('/').filter(Boolean).join('/');
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
    files.find((f) => treeIdOf(f.name) === selectedPath) ??
      files.find((f) => f.name.endsWith('usage.svelte')) ??
      files[0],
  );
  const currentCode = $derived(
    current ? (resolveFileContent?.(current) ?? current.content) : '',
  );
  // the single read point (A3): explicit lane permanently hot via the
// destructure default — the ambient zone never rides the stage
const dDensity = $derived(ComponentCanvasDefaults.resolve({ density }).density);

let codeOpen = $state(false);

  // ---- drawer shape (Owner revert 2026-09-01) ----------------------------
  // ONE shape: the tree pane, every file count. The two-file tabs floor
  // (canvas-floor-lab) is removed — the tree is the file surface, the
  // container-query tiers below 48rem/≥48rem own its responsive posture.
  const leafName = (path: string): string => path.split('/').pop() ?? path;

  const usageFile = $derived(
    files.find((f) => f.kind === 'usage') ?? files.find((f) => f.name.endsWith('usage.svelte')),
  );

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
    <!-- the actions row is POINTER-MODAL CHROME (chrome-density-tier law):
         data-jx-chrome pins the 32px hit band (U×8) + sm-tier text/inset,
         so the source anchor and the install badge share ONE size law
         (2026-09-01 misalignment). The stage theme/density toggle-groups
         MOVED TO THE DOCK HEAD with the unified-chrome ruling (Owner
         amendment, canvas-playground-dock 2026-09-08) — the header keeps
         title/description/install/source only -->
    <div data-jx-canvas-head-actions data-jx-chrome class="flex flex-none flex-wrap items-center gap-2 pt-[0.1rem]">
      {#if install}
        <!-- copy-command badge (the Terminal-round absorbed output): the
             install argument in mono, clipboard flash on commit -->
        <button
          type="button"
          data-jx-canvas-install
          data-copied={copiedInstall || undefined}
          class="jx-press jx-canvas-install inline-flex min-h-[calc(var(--jx-hit)+2px)] items-center gap-[0.45rem] border border-border bg-background px-[0.55rem] text-foreground/80 hover:text-foreground cursor-pointer text-[11px] font-mono whitespace-nowrap [--jx-press-shadow:none] [--jx-press-shadow-hover:none] [--jx-press-shadow-active:none]"
          aria-label={copiedInstall ? 'Install command copied' : `Copy the install command for ${install}`}
          title={copiedInstall ? 'copied' : 'copy install command'}
          onclick={() => copyInstall()}
        >
          <span>npx jixoai-ui add {install}</span>
          <Icon name={copiedInstall ? 'check' : 'copy'} size={12} />
        </button>
      {/if}
      {#if sourceUrl}
        <!-- icon-only source anchor: press physics, the label lives in the
             accessible name (D6 — the full button crowded the header).
             +2px on the band: the bordered siblings' outer frame (band +
             their 1px group border on both edges) — one flush toolbar line -->
        <a
          data-jx-canvas-source
          class="jx-press inline-flex h-[calc(var(--jx-hit)+2px)] w-[calc(var(--jx-hit)+2px)] flex-none items-center justify-center border border-border bg-background text-foreground/70 hover:text-foreground [--jx-press-shadow:var(--shadow-2xs)] [--jx-press-shadow-hover:var(--shadow-xs)] [--jx-press-shadow-active:var(--shadow-xs-press)]"
          href={sourceUrl}
          target="_blank"
          rel="noreferrer"
          aria-label="Open source on GitHub"
          title="Open source on GitHub"
        >
          <Icon name="externalLink" size={13} />
        </a>
      {/if}
    </div>
  </header>

  <!-- the stage-row is the DOCK's positioning context (relative): the
       floating playground dock mounts as the scroll layer's sibling,
       absolute over the stage's top-right corner — it never scrolls
       with stage content and takes pointer events on its own surface
       only (the stage underneath stays interactive) -->
  <div class="jx-canvas-stage-row relative flex flex-col">
    <!-- the scroll layer (D5): default bounded height + native auto-scroll;
         the NAMED demo container sits on the scrollport so demo container
         queries see the width the scrollbar actually leaves. data-scroll
         is the V2-4 posture seam: 'grow' lifts the block cap for
         full-composition demos (see Props) -->
    <div
      data-jx-canvas-scroll
      data-scroll={scroll}
      class="jx-canvas-scroll @container/jx-canvas flex-1 min-h-0 min-w-0"
    >
      <div
        data-jx-canvas-stage
        data-stage={stage}
        data-theme={theme}
        data-density={dDensity}
        class={cn(
          'jx-canvas-stage flex min-h-[200px] min-w-0 gap-4 p-6 bg-[color-mix(in_oklab,var(--muted)_42%,var(--background))] text-foreground',
          // theme sheet vocabulary, scoped to the stage subtree only: .dark
          // flips the token set (and dark: utilities) inside the demo;
          // .jx-light pins light tokens even under a dark docs page.
          // text-foreground re-anchors inherit-based demo text onto the
          // STAGE's scoped token — the scope classes redefine tokens only,
          // so without it inherited color stays the page's (2026-09-01)
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
    {#if playground || schema || output?.length}
      <CanvasPlayground
        {title}
        bind:theme
        bind:density
        {playground}
        rows={schema ? rows : undefined}
        schemaDefaults={schema ? defaults : undefined}
        bind:values
        {onvalue}
        {onreset}
        {output}
      />
    {:else}
      <!-- chrome-only dock (the unified-chrome ruling, 2026-09-08): the
           head row [grip, theme, size] ships on EVERY canvas — without
           body content there is no chevron and no expansion -->
      <CanvasPlayground {title} bind:theme bind:density />
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
        class="jx-canvas-chevron inline-flex transition-transform duration-150 ease-out"
        class:rotate-180={codeOpen}
        aria-hidden="true"
      >
        <Icon name="chevronDown" size={13} />
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
          <Icon name={copiedUsage ? 'check' : 'copy'} size={12} />
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
            selected={current ? treeIdOf(current.name) : undefined}
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
