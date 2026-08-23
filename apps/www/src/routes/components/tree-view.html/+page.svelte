<!--
  tree-view demo page (apps/www/src/routes/components/tree-view.html).

  Original request (2026-08-22): the generic tree must prove its extension
  architecture by reproducing the seven reui.io/components/tree effects
  (registry-source-pulled, not eyeballed) with EQUIVALENT demos — basic
  tree, indented lines, custom indent + prefix icons, plus toggler, file
  explorer with type icons, org chart with avatars, permissions with
  checkboxes — plus one jixoai-only canvas (suffix actions + disabled)
  covering the remaining original asks.

  Intent list:
  - one shared CRM dataset for demos 1–4 (reui demo-1 data);
  - demos 5–7 carry their own meta-typed datasets (file types, org
    people, permissions);
  - prefix icons demo BOTH extension levels: the `prefix` snippet
    (demos 3/4/6) and the onPrefixSlotRender resolver (demo 5);
  - demo 7 uses the shipped tree-view-multiselect extension; demo 8
    exercises onSuffixSlotRender (folders only) + disabled subtrees.
-->
<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import ComponentCanvas, { type TreeFile } from '$lib/ui/component-canvas.svelte';
  import NativeSelect from '$lib/ui/native-select.svelte';
  import SectionCard from '$lib/ui/section-card.svelte';
  import Toc from '$lib/ui/toc.svelte';
  import TreeView, { type TreeItemCtx, type TreeNode } from '$lib/ui/tree-view.svelte';
  import TreeViewMulti from '$lib/ui/tree-view-multiselect.svelte';
  import Avatar from '$lib/ui/avatar.svelte';
  import { icons } from '$lib/icons';
  import { reveal } from '$lib/reveal';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import treeViewSource from '$lib/ui/tree-view.svelte?raw';
  import treeViewMultiSource from '$lib/ui/tree-view-multiselect.svelte?raw';

  // A literal closing-script tag inside a template literal would terminate
  // this component's own script tag during the HTML-level scan — splice it.
  const close = '</' + 'script>';

  const leaf = (name: string): TreeNode => ({ name });

  // ---- shared CRM data (demos 1–4; reui demo-1 dataset) ----------------
  const crm: TreeNode[] = [
    {
      name: 'Leads',
      children: [leaf('New Lead'), leaf('Contacted Lead'), leaf('Qualified Lead')],
    },
    {
      name: 'Accounts',
      children: [
        {
          name: 'Acme Corp',
          children: [leaf('John Smith'), leaf('Jane Doe'), leaf('Website Redesign')],
        },
        {
          name: 'Globex Inc',
          children: [leaf('Alice Johnson'), leaf('Cloud Migration')],
        },
      ],
    },
    {
      name: 'Activities',
      children: [leaf('Calls'), leaf('Meetings'), leaf('Emails')],
    },
    {
      name: 'Support',
      children: [leaf('Open Tickets'), leaf('Closed Tickets')],
    },
  ];
  const crmOpen = ['Leads', 'Accounts', 'Activities'];

  // demo 1 playground: Select ⇄ tree selection, both ways
  let basicSelected = $state('Leads/New Lead');
  const crmLeaves: string[] = [];
  const collectLeaves = (list: TreeNode[], parent: string | null): void => {
    for (const node of list) {
      const path = parent === null ? node.name : `${parent}/${node.name}`;
      if (node.children) collectLeaves(node.children, path);
      else crmLeaves.push(path);
    }
  };
  collectLeaves(crm, null);

  // ---- demo 5: file explorer (meta = file type) ------------------------
  type FileType = 'tsx' | 'ts' | 'css' | 'json' | 'md' | 'config';
  const fleaf = (name: string, type: FileType): TreeNode<FileType> => ({ name, meta: type });
  const fdir = (name: string, children: TreeNode<FileType>[]): TreeNode<FileType> => ({
    name,
    children,
  });
  const fileTree: TreeNode<FileType>[] = [
    fdir('my-project', [
      fdir('src', [
        fdir('app', [fleaf('page.tsx', 'tsx'), fleaf('layout.tsx', 'tsx'), fleaf('loading.tsx', 'tsx')]),
        fdir('components', [fleaf('button.tsx', 'tsx'), fleaf('card.tsx', 'tsx'), fleaf('dialog.tsx', 'tsx')]),
        fdir('lib', [fleaf('utils.ts', 'ts'), fleaf('api.ts', 'ts')]),
        fleaf('globals.css', 'css'),
      ]),
      fdir('public', [fleaf('favicon.ico', 'config')]),
      fleaf('package.json', 'json'),
      fleaf('README.md', 'md'),
      fleaf('tsconfig.json', 'json'),
    ]),
  ];
  const fileOpen = ['my-project', 'my-project/src', 'my-project/src/app', 'my-project/src/components'];

  // ---- demo 6: org chart (meta = person) -------------------------------
  interface OrgMeta {
    role?: string;
    avatar?: string;
  }
  const person = (
    name: string,
    role: string,
    avatar?: string,
    children?: TreeNode<OrgMeta>[],
  ): TreeNode<OrgMeta> => ({ name, meta: { role, avatar }, children });
  const org: TreeNode<OrgMeta>[] = [
    person('Acme Inc.', 'Company', undefined, [
      person('Sarah Chen', 'CEO', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&dpr=2&q=80', [
        person('Alex Johnson', 'CTO', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=96&h=96&dpr=2&q=80', [
          person('Michael Rodriguez', 'Engineering Lead', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=96&h=96&dpr=2&q=80', [
            person('Tom Harris', 'Senior Developer', 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=96&h=96&dpr=2&q=80'),
            person('Nina Patel', 'Developer', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=96&h=96&dpr=2&q=80'),
          ]),
          person('Lisa Park', 'Design Lead', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=96&h=96&dpr=2&q=80'),
        ]),
        person('Emma Wilson', 'COO', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&dpr=2&q=80', [
          person('James Brown', 'Operations Manager', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&dpr=2&q=80'),
          person('Amy Taylor', 'HR Manager', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=96&h=96&dpr=2&q=80'),
        ]),
        person('David Kim', 'CFO', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&h=96&dpr=2&q=80', [
          person('Robert Davis', 'Finance Manager', 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=96&h=96&dpr=2&q=80'),
        ]),
      ]),
    ]),
  ];
  const orgOpen = ['Acme Inc.', 'Acme Inc./Sarah Chen', 'Acme Inc./Sarah Chen/Alex Johnson'];

  // ---- demo 7: permissions (the multiselect extension) -----------------
  const permissions: TreeNode[] = [
    {
      name: 'User Management',
      children: [leaf('View users'), leaf('Create users'), leaf('Edit users'), leaf('Delete users')],
    },
    {
      name: 'Content Management',
      children: [leaf('View content'), leaf('Publish content'), leaf('Delete content')],
    },
    { name: 'Billing', children: [leaf('View invoices'), leaf('Manage subscriptions')] },
    { name: 'API Access', children: [leaf('Read access'), leaf('Write access')] },
  ];
  const permOpen = ['User Management', 'Content Management'];
  const permInitial = [
    'User Management/View users',
    'Content Management/View content',
    'Content Management/Publish content',
    'Billing/View invoices',
    'API Access/Read access',
  ];
  let permChecked = $state([...permInitial]);

  // ---- demo 8: suffix actions + disabled (beyond the reference) --------
  const projectTree: TreeNode[] = [
    {
      name: 'src',
      children: [
        {
          name: 'lib',
          children: [leaf('icons.ts'), leaf('site.ts'), leaf('jixoai.css')],
        },
        {
          name: 'routes',
          children: [leaf('tokens.html'), leaf('recipes.html')],
        },
      ],
    },
    {
      name: 'archive',
      disabled: true,
      children: [leaf('old-site.svelte'), leaf('legacy-theme.css')],
    },
    leaf('package.json'),
  ];
  let lastAction = $state<string | null>(null);

  // ---- usage strings for the code drawers ------------------------------
  const basicUsage = `<script lang="ts">
  import TreeView, { type TreeNode } from '@ui/tree-view.svelte';
${close}

const leaf = (name: string): TreeNode => ({ name });
const crm: TreeNode[] = [
  { name: 'Leads', children: [leaf('New Lead'), leaf('Contacted Lead')] },
  { name: 'Accounts', children: [leaf('Acme Corp'), leaf('Globex Inc')] },
  // …Activities, Support — same shape
];

let selected = $state('Leads/New Lead');
${close}

<TreeView
  nodes={crm}
  defaultExpanded={['Leads', 'Accounts']}
  {selected}
  fileIcons
  onselect={(ctx) => (selected = ctx.id)}
/>`;

  const linesUsage = `<TreeView nodes={crm} defaultExpanded={['Leads', 'Accounts', 'Activities']} lines />`;

  const indentUsage = `{#snippet crmPrefix(ctx)}
  {#if ctx.isFolder}
    <!-- the folder swaps glyphs with expand state; leaves show a file -->
    {@html ctx.expanded ? icons.folderOpen : icons.folder}
  {:else}
    {@html icons.file}
  {/if}
{/snippet}

<TreeView
  nodes={crm}
  defaultExpanded={['Leads', 'Accounts', 'Activities']}
  indent={32}
  lines
  prefix={crmPrefix}
/>`;

  const plusUsage = `<TreeView
  nodes={crm}
  defaultExpanded={['Leads', 'Accounts', 'Activities']}
  indent={32}
  lines
  toggle="plus"
  prefix={crmPrefix}
/>`;

  const fileUsage = `<!-- one snippet per file type; the resolver RETURNS one per node -->
{#snippet folderIcon(ctx)}
  <span class="text-amber-500">{@html ctx.expanded ? icons.folderOpen : icons.folder}</span>
{/snippet}
{#snippet tsIcon(ctx)}<span class="text-blue-500">{@html icons.fileCode}</span>{/snippet}
{#snippet cssIcon(ctx)}<span class="text-purple-500">{@html icons.palette}</span>{/snippet}
{#snippet jsonIcon(ctx)}<span class="text-yellow-500">{@html icons.braces}</span>{/snippet}
{#snippet mdIcon(ctx)}<span class="text-muted-foreground">{@html icons.fileText}</span>{/snippet}
{#snippet genericIcon(ctx)}<span class="text-muted-foreground">{@html icons.file}</span>{/snippet}

<TreeView
  nodes={fileTree}
  defaultExpanded={['my-project', 'my-project/src', 'my-project/src/app']}
  onPrefixSlotRender={(ctx) => {
    if (ctx.isFolder) return folderIcon;
    switch (ctx.node.meta) {
      case 'ts':
      case 'tsx': return tsIcon;
      case 'css': return cssIcon;
      case 'json': return jsonIcon;
      case 'md': return mdIcon;
      default: return genericIcon;
    }
  }}
/>`;

  const orgUsage = `{#snippet orgPrefix(ctx)}
  <Avatar name={ctx.node.name} src={ctx.node.meta?.avatar} size="sm" alt="" />
{/snippet}
{#snippet orgLabel(ctx)}
  <span class="flex flex-col items-start py-0.5 leading-tight">
    <span class="text-foreground text-[12px]">{ctx.node.name}</span>
    {#if ctx.node.meta?.role}
      <span class="text-muted-foreground text-[10px]">{ctx.node.meta.role}</span>
    {/if}
  </span>
{/snippet}

<TreeView
  nodes={org}
  defaultExpanded={['Acme Inc.', 'Acme Inc./Sarah Chen']}
  indent={24}
  prefix={orgPrefix}
  label={orgLabel}
/>`;

  const permUsage = `<script lang="ts">
  import TreeViewMulti from '@ui/tree-view-multiselect.svelte';
${close}

let checked = $state([
  'User Management/View users',
  'Content Management/View content',
  // …
]);
${close}

<TreeViewMulti
  nodes={permissions}
  defaultExpanded={['User Management', 'Content Management']}
  bind:checked
  oncheck={(ids) => console.log(ids)}
/>`;

  const actionsUsage = `{#snippet folderActions(ctx)}
  <button class="jx-demo-act" title="Add" onclick={() => addInside(ctx.id)}>
    {@html icons.plus}
  </button>
  <button class="jx-demo-act" title="More" onclick={() => moreFor(ctx.id)}>
    {@html icons.ellipsis}
  </button>
{/snippet}

<TreeView
  nodes={projectTree}
  defaultExpanded={['src', 'src/lib', 'src/routes']}
  onSuffixSlotRender={(ctx) => (ctx.isFolder ? folderActions : undefined)}
/>`;

  const coreFiles: TreeFile[] = [
    { name: 'registry/files/ui/tree-view.svelte', content: treeViewSource },
    { name: 'src/lib/ui/tree-view-usage.svelte', content: basicUsage, kind: 'usage' },
  ];
  const multiFiles: TreeFile[] = [
    { name: 'registry/files/ui/tree-view-multiselect.svelte', content: treeViewMultiSource },
    { name: 'src/lib/ui/tree-view-multiselect-usage.svelte', content: permUsage, kind: 'usage' },
  ];
  const usageFile = (source: string): TreeFile[] => [
    { name: 'usage.svelte', content: source, kind: 'usage' },
  ];

  // ToC outline: pairs with the region ids below, in page order.
  const tocSections = [
    { id: 'tree-view-effects', label: 'the seven effects' },
    { id: 'tree-view-extensions', label: 'suffix actions & disabled' },
    { id: 'tree-view-law', label: 'the tree keyboard contract' },
  ];
</script>

<svelte:head>
  <title>tree-view · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai tree-view component: a generic ARIA tree with an extension surface — prefix/suffix slots with onPrefixSlotRender/onSuffixSlotRender resolvers, a built-in multiselect extension with tri-state cascade, disabled nodes, and built-in variants (chevron/plus togglers, guide lines, custom indent). Seven demos mirroring the reui.io reference plus suffix-actions and disabled showcases."
  />
</svelte:head>

<!-- shared snippets: demo 5 keeps these at the top level — a resolver must
     RETURN snippet values, so they cannot be inlined like prefix=/label= -->
{#snippet folderIcon(ctx: TreeItemCtx<FileType>)}
  <span class="text-amber-500">{@html ctx.expanded ? icons.folderOpen : icons.folder}</span>
{/snippet}
{#snippet tsIcon(ctx: TreeItemCtx<FileType>)}
  <span class="text-blue-500">{@html icons.fileCode}</span>
{/snippet}
{#snippet cssIcon(ctx: TreeItemCtx<FileType>)}
  <span class="text-purple-500">{@html icons.palette}</span>
{/snippet}
{#snippet jsonIcon(ctx: TreeItemCtx<FileType>)}
  <span class="text-yellow-500">{@html icons.braces}</span>
{/snippet}
{#snippet mdIcon(ctx: TreeItemCtx<FileType>)}
  <span class="text-muted-foreground">{@html icons.fileText}</span>
{/snippet}
{#snippet genericIcon(ctx: TreeItemCtx<FileType>)}
  <span class="text-muted-foreground">{@html icons.file}</span>
{/snippet}

{#snippet folderActions(ctx: TreeItemCtx)}
  <button
    type="button"
    class="jx-demo-act"
    aria-label="add inside {ctx.node.name}"
    onclick={() => (lastAction = `add → ${ctx.id}`)}
  >
    {@html icons.plus}
  </button>
  <button
    type="button"
    class="jx-demo-act"
    aria-label="more actions for {ctx.node.name}"
    onclick={() => (lastAction = `more → ${ctx.id}`)}
  >
    {@html icons.ellipsis}
  </button>
{/snippet}

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>
  <!-- ToC rail: desktop sticky right column, mobile glass row (toc.css) -->
  <aside class="jx-toc-aside" aria-label="On this page">
    <Toc sections={tocSections} title="on this page" scrollRoot=".jx-shell-body" />
  </aside>

  <div class="flex min-w-0 flex-col gap-8">
  <!-- page head -->
  <div data-reveal="" use:reveal>
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · Data display"
      title="tree-view — the extensible ARIA tree"
      summary="A generic native-ARIA tree (nested ul role=tree / group / treeitem, roving tabindex, the full arrow-key contract) with an extension surface instead of baked-in opinions: prefix/suffix slots and onPrefixSlotRender / onSuffixSlotRender resolvers render any icon library or action row from live context, onactivate lets an extension own the Enter/Space behavior (the shipped multiselect extension does exactly that), and the built-in variants stop where they must — toggler glyph, guide lines, indent. The seven demos below mirror the reui.io tree reference one-for-one."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">prefix / suffix slots</span>
        <span class="pill">onXxxSlotRender resolvers</span>
        <span class="pill">multiselect extension</span>
        <span class="pill">disabled · variants</span>
        <span class="pill">roving tabindex</span>
      </div>
    </SectionCard>
  </div>

  <!-- the seven reference effects -->
  <div id="tree-view-effects" data-region="tree-view-effects" data-reveal="" use:reveal>
    <SectionCard
      family="tree-view-effects"
      headerRegion="tree-view-effects"
      eyebrow="reference parity"
      title="The seven effects"
      summary="The reui.io/components/tree reference ships seven effects; each one maps onto this architecture without forking it — plain rows, guide lines, custom indent with a prefix slot, the plus toggler, contextual type icons through the resolver, avatars through prefix + label snippets, and checkboxes through the multiselect extension."
    >
      <div class="mt-6 grid items-start gap-6 min-[1000px]:grid-cols-2">
      <!-- 1 · basic tree -->
      <ComponentCanvas
        title="1 · basic tree"
        description="Single-select CRM tree, chevron toggler, built-in file/folder icons (fileIcons). Folders toggle on click, leaves select — the file-tree lineage."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/tree-view.svelte"
        files={coreFiles}
        stage="start"
        onreset={() => (basicSelected = 'Leads/New Lead')}
        echo={[{ label: 'selected', value: basicSelected }]}
      >
        <div class="jx-tree-pane">
          <TreeView
            nodes={crm}
            defaultExpanded={crmOpen}
            selected={basicSelected}
            fileIcons
            onselect={(ctx) => (basicSelected = ctx.id)}
          />
        </div>
        {#snippet playground()}
          <NativeSelect
            label="selected leaf"
            value={basicSelected}
            onchange={(event) => (basicSelected = event.currentTarget.value)}
          >
            {#each crmLeaves as path (path)}
              <option value={path}>{path}</option>
            {/each}
          </NativeSelect>
          <p class="jx-play-help">
            Tree clicks and the Select share one state. Directory rows toggle collapse; ↑ ↓ ← → walk
            the tree when a row has focus, Home / End jump the ends.
          </p>
        {/snippet}
      </ComponentCanvas>

      <!-- 2 · indented lines -->
      <ComponentCanvas
        title="2 · indented lines"
        description="The built-in lines variant: one 1px guide rail per indent level, drawn only as tall as each group."
        files={usageFile(linesUsage)}
        stage="start"
      >
        <div class="jx-tree-pane">
          <TreeView nodes={crm} defaultExpanded={crmOpen} lines />
        </div>
      </ComponentCanvas>

      <!-- 3 · custom indent + prefix slot -->
      <ComponentCanvas
        title="3 · custom indent · prefix slot"
        description="indent 32 plus the prefix snippet: folder glyphs swap with expand state, leaves get a file glyph — the static extension level."
        files={usageFile(indentUsage)}
        stage="start"
      >
        <div class="jx-tree-pane">
          <TreeView nodes={crm} defaultExpanded={crmOpen} indent={32} lines>
            {#snippet prefix(ctx)}
              {#if ctx.isFolder}
                {@html ctx.expanded ? icons.folderOpen : icons.folder}
              {:else}
                {@html icons.file}
              {/if}
            {/snippet}
          </TreeView>
        </div>
      </ComponentCanvas>

      <!-- 4 · plus toggler -->
      <ComponentCanvas
        title="4 · plus toggler"
        description="The plus toggler variant — expanded folders show −, collapsed show +."
        files={usageFile(plusUsage)}
        stage="start"
      >
        <div class="jx-tree-pane">
          <TreeView nodes={crm} defaultExpanded={crmOpen} indent={32} lines toggle="plus">
            {#snippet prefix(ctx)}
              {#if ctx.isFolder}
                {@html ctx.expanded ? icons.folderOpen : icons.folder}
              {:else}
                {@html icons.file}
              {/if}
            {/snippet}
          </TreeView>
        </div>
      </ComponentCanvas>

      <!-- 5 · file explorer (resolver) -->
      <ComponentCanvas
        title="5 · file explorer · onPrefixSlotRender"
        description="The dynamic extension level: a resolver returns a snippet per node context — amber folders, blue code, purple css, yellow json."
        files={usageFile(fileUsage)}
        stage="start"
      >
        <div class="jx-tree-pane">
          <TreeView
            nodes={fileTree}
            defaultExpanded={fileOpen}
            onPrefixSlotRender={(ctx) => {
              if (ctx.isFolder) return folderIcon;
              switch (ctx.node.meta) {
                case 'ts':
                case 'tsx':
                  return tsIcon;
                case 'css':
                  return cssIcon;
                case 'json':
                  return jsonIcon;
                case 'md':
                  return mdIcon;
                default:
                  return genericIcon;
              }
            }}
          />
        </div>
      </ComponentCanvas>

      <!-- 6 · org chart -->
      <ComponentCanvas
        title="6 · org chart · prefix + label"
        description="Avatars through the prefix snippet and a two-line label snippet — rows grow with their content."
        files={usageFile(orgUsage)}
        stage="start"
      >
        <div class="jx-tree-pane">
          <TreeView nodes={org} defaultExpanded={orgOpen} indent={24}>
            {#snippet prefix(ctx)}
              <Avatar name={ctx.node.name} src={ctx.node.meta?.avatar} size="sm" alt="" />
            {/snippet}
            {#snippet label(ctx)}
              <span class="flex flex-col items-start py-0.5 leading-tight">
                <span class="text-foreground text-[12px]">{ctx.node.name}</span>
                {#if ctx.node.meta?.role}
                  <span class="text-muted-foreground text-[10px]">{ctx.node.meta.role}</span>
                {/if}
              </span>
            {/snippet}
          </TreeView>
        </div>
      </ComponentCanvas>

      <!-- 7 · permissions (multiselect) -->
      <ComponentCanvas
        title="7 · permissions · multiselect"
        description="The shipped tree-view-multiselect extension: tri-state cascade, Space toggles the focused row, arrows keep walking."
        sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/tree-view-multiselect.svelte"
        files={multiFiles}
        stage="start"
        onreset={() => (permChecked = [...permInitial])}
        echo={[{ label: 'checked', value: permChecked }]}
      >
        <div class="jx-tree-pane">
          <TreeViewMulti nodes={permissions} defaultExpanded={permOpen} bind:checked={permChecked} />
        </div>
        {#snippet playground()}
          <p class="jx-play-help">
            Checking a folder cascades over its enabled descendants; a mixed folder shows the dash.
            Row click and Space / Enter flow through the same onactivate seam — the extension never
            forks the core.
          </p>
        {/snippet}
      </ComponentCanvas>
      </div>
    </SectionCard>
  </div>

  <!-- beyond the reference: suffix actions + disabled -->
  <div id="tree-view-extensions" data-region="tree-view-extensions" data-reveal="" use:reveal>
    <ComponentCanvas
      title="tree-view · suffix actions + disabled"
      description="onSuffixSlotRender arms only the folders with Add / More icon buttons (revealed on row hover or focus), and the archive subtree ships disabled: focusable for screen readers, never activatable."
      files={usageFile(actionsUsage)}
      stage="start"
      onreset={() => (lastAction = null)}
      echo={[{ label: 'last action', value: lastAction }]}
    >
      <div class="jx-tree-pane">
        <TreeView
          nodes={projectTree}
          defaultExpanded={['src', 'src/lib', 'src/routes']}
          onSuffixSlotRender={(ctx) => (ctx.isFolder ? folderActions : undefined)}
        />
      </div>
      {#snippet playground()}
        <p class="jx-play-help">
          Hover or Tab into a folder row — the actions appear. Clicks on buttons never toggle the
          row: the core skips interactive descendants. The <code>archive</code> subtree is disabled
          (50% paint, aria-disabled, no toggle).
        </p>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- the tree keyboard contract -->
  <div id="tree-view-law" data-reveal="" use:reveal>
    <SectionCard
      family="tree-view-law"
      headerRegion="tree-view-law"
      eyebrow="law"
      title="The tree keyboard contract"
      summary="The ARIA tree pattern is a keyboard contract before it is a widget: ↑/↓ move focus between visible items, → expands a collapsed directory (or jumps into its first child), ← collapses an expanded one (or returns to the parent), Home / End jump the ends, Enter / Space activates the item. Roving tabindex keeps exactly one tab stop; collapsed extents are inert, so hidden rows are untabbable by construction. Extensions hook the activation through onactivate and ctx.preventDefault() — the multiselect turns Space into a checkbox toggle without touching the walker."
    >
      <CodeBlock code={basicUsage} lang="svelte" meta="usage" />
    </SectionCard>
  </div>
  </div>
</div>

<style>
  /* the demo supplies the chrome tree-view deliberately omits: a bordered,
     scrollable pane so the view reads as a sidebar surface */
  .jx-tree-pane {
    border: 1px solid var(--border);
    background: color-mix(in oklab, var(--muted) 30%, var(--background));
    max-height: 20rem;
    overflow-y: auto;
    padding: 0.5rem 0.4rem;
    width: 100%;
    max-width: 26rem;
  }

  /* suffix action buttons (demo 8): quiet icon buttons that never toggle
     the row — the core skips button targets on row click */
  .jx-tree-pane :global(.jx-demo-act) {
    align-items: center;
    background: var(--background);
    border: 1px solid var(--border);
    color: var(--muted-foreground);
    cursor: pointer;
    display: inline-flex;
    height: 1.15rem;
    justify-content: center;
    transition: color 150ms ease-out, border-color 150ms ease-out;
    width: 1.35rem;
  }
  .jx-tree-pane :global(.jx-demo-act:hover) {
    border-color: var(--primary);
    color: var(--foreground);
  }
  .jx-tree-pane :global(.jx-demo-act:focus-visible) {
    outline: 2px solid var(--ring);
    outline-offset: 1px;
  }
  .jx-tree-pane :global(.jx-demo-act svg) {
    height: 11px;
    width: 11px;
  }
</style>
