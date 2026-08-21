<script lang="ts">
  import CodeCard from '$lib/ui/code-card.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Select from '$lib/ui/select.svelte';
  import TreeView, { inferTreeLang, type TreeFile, type TreeNode } from '$lib/ui/tree-view.svelte';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import treeViewSource from '$lib/ui/tree-view.svelte?raw';

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  const usage = `<script lang="ts">
  import TreeView, { inferTreeLang, type TreeNode } from '@ui/tree-view.svelte';
${close}

// directories carry children; a leaf carrying file is selectable.
// Paths are built recursively: src → lib → ui → tree-view.svelte.
const tree: TreeNode[] = [
  {
    name: 'src',
    children: [
      {
        name: 'lib',
        children: [
          {
            name: 'ui',
            children: [
              { name: 'tree-view.svelte', file: { name: 'src/lib/ui/tree-view.svelte', content } },
            ],
          },
          { name: 'highlight.ts', file: { name: 'src/lib/highlight.ts', content } },
        ],
      },
    ],
  },
  { name: 'package.json', file: { name: 'package.json', content } },
];

let selected = $state('src/lib/ui/tree-view.svelte');
${close}

<TreeView
  {tree}
  {selected}
  onselect={(path) => (selected = path)}
/>`;

  const files = [
    { name: 'registry/files/ui/tree-view.svelte', content: treeViewSource },
    { name: 'src/lib/ui/tree-view-usage.svelte', content: usage },
  ];

  // Hand-built 3-level tree: src → lib → (ui/*.svelte + *.ts) + package.json.
  // The TreeNode.file payload carries the full path so onselect(path, file)
  // matches — the row itself only ever shows the leaf name.
  const leaf = (path: string, content: string): TreeNode => ({
    name: path.split('/').pop() ?? path,
    file: { name: path, content },
  });

  const codeCardSketch = `<figure class="jx-code-card">
  <figcaption class="jx-code-card-head">
    <span class="jx-code-card-file">{filename}</span>
  </figcaption>
  <pre data-lang={lang}><code>{@html highlight(code, lang)}</code></pre>
</figure>`;

  const tableSketch = `<figure class="jx-table">
  <table class:dense={dense}>
    {#if caption}<caption>{caption}</caption>{/if}
    {@render children()}
  </table>
</figure>`;

  const treeSketch = `<ul role="tree" aria-label="files" class="jx-tree-view">
  {#snippet rows(nodes, parentPath, depth)}
    <li role="treeitem" data-path aria-expanded>
      <div class="jx-tree-view-row">▾ {node.name}</div>
    </li>
  {/snippet}
</ul>`;

  const highlightSketch = `// escape-first pass, one alternation regex, first alternative wins —
// deterministic across server prerender and client hydration
export function highlight(code: string, lang: string): string`;

  const revealSketch = `// two patterns total: entrance (opacity + rise) and rule (scaleX draw)
export const reveal = (node: HTMLElement, options?: RevealOptions) => {`;

  const packageSketch = `{
  "name": "@jixoai/www",
  "private": true,
  "type": "module",
  "description": "ui.jixoai.com — same-source gallery"
}`;

  const fileTree: TreeNode[] = [
    {
      name: 'src',
      children: [
        {
          name: 'lib',
          children: [
            {
              name: 'ui',
              children: [
                leaf('src/lib/ui/code-card.svelte', codeCardSketch),
                leaf('src/lib/ui/table.svelte', tableSketch),
                leaf('src/lib/ui/tree-view.svelte', treeSketch),
              ],
            },
            leaf('src/lib/highlight.ts', highlightSketch),
            leaf('src/lib/reveal.ts', revealSketch),
          ],
        },
      ],
    },
    leaf('package.json', packageSketch),
  ];

  // flat leaf list for the Playground Select + the selected-file lookup
  const collect = (nodes: TreeNode[]): TreeFile[] =>
    nodes.flatMap((node) => (node.file ? [node.file] : collect(node.children ?? [])));
  const flatFiles: TreeFile[] = collect(fileTree);

  // Playground: the Select jumps the selection; clicking a tree row feeds
  // back through onselect and moves the Select with it.
  let selectedPath = $state('src/lib/ui/tree-view.svelte');
  const selectedFile = $derived(flatFiles.find((f) => f.name === selectedPath) ?? flatFiles[0]!);
  const selectedLeaf = $derived(selectedFile.name.split('/').pop() ?? selectedFile.name);
</script>

<svelte:head>
  <title>tree-view · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai tree-view component: native ARIA tree semantics with nested ul role=tree / group / treeitem, the tree keyboard contract (arrows move and expand, Enter activates), roving tabindex, and the grid-rows 0fr→1fr collapse grammar with inert collapsed extents."
  />
</svelte:head>

<div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
  <!-- page head -->
  <div data-reveal="" use:reveal>
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · Display"
      title="tree-view — the ARIA file tree"
      summary="Native ARIA tree semantics: nested ul role=tree / ul role=group / li role=treeitem, the tree keyboard contract (arrows move focus, → expands, ← collapses, Enter activates), and roving tabindex. Collapse follows the Combo ToC grammar — grid-template-rows 0fr→1fr with inert on the collapsed extent, so collapsed content is untabbable by construction. No card shell, no hairlines: the view embeds into sidebar surfaces that own the chrome."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">role="tree" · native ARIA</span>
        <span class="pill">↑ ↓ → ← · Enter keyboard</span>
        <span class="pill">roving tabindex</span>
        <span class="pill">0fr→1fr + inert collapse</span>
      </div>
    </SectionCard>
  </div>

  <!-- workbench: tree + reader composition, selection from tree or playground -->
  <div data-reveal="" use:reveal>
    <ComponentCanvas
      title="tree-view"
      description="A 3-level project tree (src → lib → ui) with a code-card reader: click a leaf — or pick one from the Playground Select — and the reader follows the selection."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/tree-view.svelte"
      {files}
    >
      <div class="grid w-full max-w-[46rem] gap-3 min-[760px]:grid-cols-[13rem_1fr]">
        <div class="jx-tree-pane">
          <TreeView
            tree={fileTree}
            selected={selectedPath}
            onselect={(path) => (selectedPath = path)}
          />
        </div>
        <CodeCard
          filename={selectedLeaf}
          lang={inferTreeLang(selectedFile.name)}
          code={selectedFile.content}
          copyable={false}
          class="min-w-0"
        />
      </div>
      {#snippet playground()}
        <Select
          label="selected file"
          value={selectedPath}
          onchange={(event) => {
            selectedPath = event.currentTarget.value;
          }}
        >
          {#each flatFiles as file (file.name)}
            <option value={file.name}>{file.name}</option>
          {/each}
        </Select>
        <p class="text-muted-foreground break-all text-[11px] leading-5">
          selected: {selectedPath}
        </p>
        <p class="text-muted-foreground text-pretty text-[11.5px] leading-5">
          Tree clicks and the Select share one state — selection moves both ways. Directory rows
          toggle collapse; arrow keys walk the tree when a row has focus.
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>
</div>

<style>
  /* the demo supplies the chrome tree-view deliberately omits: a bordered,
     scrollable pane so the view reads as a sidebar surface */
  .jx-tree-pane {
    border: 1px solid var(--border);
    background: color-mix(in oklab, var(--muted) 30%, var(--background));
    max-height: 18rem;
    overflow-y: auto;
    padding: 0.5rem 0.4rem;
  }
</style>
