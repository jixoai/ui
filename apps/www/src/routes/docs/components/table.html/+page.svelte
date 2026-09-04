<!--
  Docs page for table (openspec 2026-08-30-table-grid-toolbar, on top of
  the 2026-08-22 responsive deepening).

  docs-demo-standard skeleton: Intro → Install → live demo (the
  frame-width workbench) → Usage (the ONE h2) → Examples (ability-named
  composition recipes: sortable headers, filter row + facets, pagination
  footer, row selection, row actions + column visibility, sticky header,
  and the composed tasks table) → Accessibility → API → Theming → See
  also.

  Composition law: every recipe is PAGE-OWNED state over public
  component behavior — zero registry edits. The table component owns
  only the frame; sort/filter/selection/toolbar state machines live
  here (the shadcn data-table tutorial's layering, jixoai's laws).
  Missing atoms (a built-in sticky-header law, a sort-state helper) are
  recorded in the change's followups.md — never silently worked around.
-->
<script lang="ts">
  import CodeBlock from '$lib/code-block.svelte';
  import A11yTable from '$lib/ui/a11y-table/a11y-table.svelte';
  import Badge from '$lib/ui/badge/badge.svelte';
  import Checkbox from '$lib/ui/checkbox/checkbox.svelte';
  import ComponentCanvas from '$lib/ui/component-canvas/component-canvas.svelte';
  import DensityDemo from '$lib/ui/density-demo/density-demo.svelte';
  import DropdownMenu from '$lib/ui/dropdown-menu/dropdown-menu.svelte';
  import DropdownMenuItem from '$lib/ui/dropdown-menu/dropdown-menu-item.svelte';
  import Input from '$lib/ui/input/input.svelte';
  import Pagination from '$lib/ui/pagination/pagination.svelte';
  import PaginationContent from '$lib/ui/pagination/pagination-content.svelte';
  import PaginationEllipsis from '$lib/ui/pagination/pagination-ellipsis.svelte';
  import PaginationItem from '$lib/ui/pagination/pagination-item.svelte';
  import PaginationLink from '$lib/ui/pagination/pagination-link.svelte';
  import PaginationNext from '$lib/ui/pagination/pagination-next.svelte';
  import PaginationPrevious from '$lib/ui/pagination/pagination-previous.svelte';
  import { pageRange } from '$lib/ui/pagination/pagination-range';
  import Popover from '$lib/ui/popover/popover.svelte';
  import PressButton from '$lib/ui/press-button/press-button.svelte';
  import PropsTable from '$lib/ui/props-table/props-table.svelte';
  import SectionCard from '$lib/ui/section-card/section-card.svelte';
  import Select from '$lib/ui/select/select.svelte';
  import Table from '$lib/ui/table/table.svelte';
  import TokenTable from '$lib/ui/token-table/token-table.svelte';
  import ToggleGroup from '$lib/ui/toggle-group/toggle-group.svelte';
  import ToggleGroupItem from '$lib/ui/toggle-group/toggle-group-item.svelte';
  import { PlayFields, PlayRow, PlayRange, PlayToggle, PlaySegmented, PlayHelp } from '$lib/playground';

  // Same-source law: the drawer shows the exact registry copy this site runs.
  import tableSource from '$lib/ui/table/table.svelte?raw';
  import tableCssSource from '$lib/ui/table/table.css?raw';

  // No closing-script tags in this sample — String.raw keeps it verbatim.
  const usage = String.raw`<Table caption="registry consumers — frame-width laws">
  <thead>
    <tr>
      <th data-sticky="start" scope="col">Consumer</th>
      <th scope="col">Status</th>
      <th scope="col">Docs</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td data-sticky="start" data-label="Consumer">unipty</td>
      <td data-label="Status">live</td>
      <td data-label="Docs"><a href="…">view</a></td>
    </tr>
    <!-- …rows follow the same law: data-label stacks, data-sticky pins -->
  </tbody>
</Table>

<!-- color freedom: every paint routes through --jx-table-* locals.
     hover follows --brand-hue by default; one var retunes it: -->
<Table style="--jx-table-hover: color-mix(in oklab, var(--secondary) 12%, var(--background))">
  …
</Table>`;

  const files = [
    { name: 'registry/files/ui/table/table.svelte', content: tableSource },
    { name: 'registry/files/ui/table/table.css', content: tableCssSource },
    { name: 'src/lib/ui/table-usage.svelte', content: usage },
  ];

  // ---- the tasks corpus (the shadcn Tasks analog, terminal paint) -------
  type TaskStatus = 'backlog' | 'active' | 'in review' | 'done';
  type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
  type Task = {
    id: string;
    title: string;
    status: TaskStatus;
    priority: TaskPriority;
    assignee: string;
    due: string;
  };
  const STATUSES: TaskStatus[] = ['backlog', 'active', 'in review', 'done'];
  const tasks: Task[] = [
    { id: 'T-101', title: 'harden registry install integrity', status: 'in review', priority: 'high', assignee: '@gaubee', due: '09-02' },
    { id: 'T-102', title: 'mirror manifest re-record', status: 'active', priority: 'medium', assignee: '@kzf', due: '09-04' },
    { id: 'T-103', title: 'container-query card law', status: 'done', priority: 'low', assignee: '@gaubee', due: '08-27' },
    { id: 'T-104', title: 'anchor lease restore', status: 'backlog', priority: 'urgent', assignee: '@oss', due: '09-09' },
    { id: 'T-105', title: 'facet filter row', status: 'in review', priority: 'medium', assignee: '@kzf', due: '09-01' },
    { id: 'T-106', title: 'select-all indeterminate', status: 'active', priority: 'high', assignee: '@gaubee', due: '09-03' },
    { id: 'T-107', title: 'countdown ticks', status: 'backlog', priority: 'low', assignee: '@oss', due: '09-12' },
    { id: 'T-108', title: 'pagination window math', status: 'done', priority: 'medium', assignee: '@kzf', due: '08-30' },
    { id: 'T-109', title: 'column visibility popover', status: 'active', priority: 'low', assignee: '@gaubee', due: '09-05' },
    { id: 'T-110', title: 'sticky scrollport law', status: 'backlog', priority: 'high', assignee: '@oss', due: '09-08' },
    { id: 'T-111', title: 'row actions dropdown', status: 'in review', priority: 'urgent', assignee: '@kzf', due: '08-31' },
    { id: 'T-112', title: 'toolbar composition', status: 'done', priority: 'medium', assignee: '@gaubee', due: '08-29' },
  ];

  // ---- recipe 1: sortable headers (aria-sort + press-button carets) -----
  type SortKey = 'title' | 'status' | 'priority' | 'due';
  type SortDir = 'asc' | 'desc';
  let sortKey = $state<SortKey | null>(null);
  let sortDir = $state<SortDir>('asc');
  function toggleSort(key: SortKey): void {
    if (sortKey !== key) {
      sortKey = key;
      sortDir = 'asc';
      return;
    }
    if (sortDir === 'asc') {
      sortDir = 'desc';
      return;
    }
    sortKey = null; // the third press clears — the column returns to DOM order
  }
  function ariaSort(key: SortKey): 'ascending' | 'descending' | undefined {
    return sortKey === key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined;
  }
  function caret(key: SortKey): string {
    return sortKey === key ? (sortDir === 'asc' ? '▲' : '▼') : '↕';
  }
  function bySort<T extends Record<string, unknown>>(rows: T[], key: SortKey | null, dir: SortDir): T[] {
    if (key === null) return rows;
    const factor = dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => factor * String(a[key]).localeCompare(String(b[key])));
  }

  // ---- recipe 2: filter row (text contains + faceted status) ------------
  let titleFilter = $state('');
  let statusFacets = $state<TaskStatus[]>([]);
  function filterTasks(rows: Task[], needle: string, facets: TaskStatus[]): Task[] {
    return rows.filter(
      (row) =>
        (needle === '' || row.title.toLowerCase().includes(needle.toLowerCase())) &&
        (facets.length === 0 || facets.includes(row.status)),
    );
  }

  // ---- recipe 3: pagination footer ---------------------------------------
  const pageSizeOptions = [5, 8, 12].map((size) => ({ value: String(size), label: `${size} rows` }));
  let pageSize = $state('5');
  const pageSizeNumber = $derived(Number(pageSize));
  function pageCountOf(rowCount: number): number {
    return Math.max(1, Math.ceil(rowCount / pageSizeNumber));
  }

  // ---- recipe 4: row selection -------------------------------------------
  function selectAllState(ids: string[], selected: ReadonlySet<string>): { all: boolean; some: boolean } {
    const all = ids.length > 0 && ids.every((id) => selected.has(id));
    const some = ids.some((id) => selected.has(id)) && !all;
    return { all, some };
  }
  function toggleSelected(selected: Set<string>, id: string): Set<string> {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  }

  // ---- the composed tasks table state (the terminal demo) ----------------
  let tasksFilter = $state('');
  let tasksFacets = $state<TaskStatus[]>([]);
  let tasksVisible = $state<Record<'priority' | 'assignee', boolean>>({ priority: true, assignee: true });
  let tasksSelected = $state<Set<string>>(new Set());
  let tasksPageIndex = $state(0);
  const tasksFiltered = $derived(bySort(filterTasks(tasks, tasksFilter, tasksFacets), sortKey, sortDir));
  const tasksPageCount = $derived(pageCountOf(tasksFiltered.length));
  const tasksPage = $derived(
    tasksFiltered.slice(tasksPageIndex * pageSizeNumber, (tasksPageIndex + 1) * pageSizeNumber),
  );
  const tasksPageIds = $derived(tasksPage.map((row) => row.id));
  const tasksSelectAll = $derived(selectAllState(tasksPageIds, tasksSelected));
  let tasksLog = $state<string[]>([]);
  function taskAction(label: string, id: string): void {
    tasksLog = [...tasksLog.slice(-3), `${label} · ${id}`];
  }
  function toggleTasksAll(): void {
    const next = new Set(tasksSelected);
    if (tasksSelectAll.all) tasksPageIds.forEach((id) => next.delete(id));
    else tasksPageIds.forEach((id) => next.add(id));
    tasksSelected = next;
  }
  function resetTasksTable(): void {
    tasksFilter = '';
    tasksFacets = [];
    tasksVisible = { priority: true, assignee: true };
    tasksSelected = new Set();
    tasksPageIndex = 0;
    tasksLog = [];
  }

  // ---- standalone recipe slices (their own canvases) ---------------------
  // sortable demo: DOM order vs asc/desc over the same 12 rows
  const sortableRows = $derived(bySort(tasks, sortKey, sortDir));

  // filter demo
  const filterRows = $derived(filterTasks(tasks, titleFilter, statusFacets));

  // pagination demo
  let pageIndex = $state(0);
  const pageCount = $derived(pageCountOf(filterRows.length));
  const pageRows = $derived(filterRows.slice(pageIndex * pageSizeNumber, (pageIndex + 1) * pageSizeNumber));

  // selection demo
  let selected = $state<Set<string>>(new Set());
  const selectionRows = $derived(tasks.slice(0, 6));
  const selectionState = $derived(selectAllState(selectionRows.map((row) => row.id), selected));
  function toggleSelectionAll(): void {
    const next = new Set(selected);
    if (selectionState.all) selectionRows.forEach((row) => next.delete(row.id));
    else selectionRows.forEach((row) => next.add(row.id));
    selected = next;
  }

  // row-actions + column-visibility demo
  let actionsVisible = $state<Record<'priority' | 'assignee', boolean>>({ priority: true, assignee: true });
  let actionEcho = $state('—');
  function rowAction(label: string, id: string): void {
    actionEcho = `${label} · ${id}`;
  }

  function resetCanvas(): void {
    frameWidth = canvasInitial.frameWidth;
    dense = canvasInitial.dense;
    stack = canvasInitial.stack;
    hoverTone = canvasInitial.hoverTone;
  }

  // Frame-width playground: the slider drags the demo wrapper across the
  // 30rem container-query line — scroll law (sticky pins + native scroll)
  // on the wide side, the CodePen card law on the narrow side.
  type HoverTone = 'brand' | 'neutral' | 'signal';
  const canvasInitial: { frameWidth: number; dense: boolean; stack: boolean; hoverTone: HoverTone } = {
    frameWidth: 560,
    dense: false,
    stack: true,
    hoverTone: 'brand',
  };
  let frameWidth = $state(canvasInitial.frameWidth);
  let dense = $state(canvasInitial.dense);
  let stack = $state(canvasInitial.stack);
  let hoverTone = $state(canvasInitial.hoverTone);
  const hoverToneOptions: { value: HoverTone; label: string }[] = [
    { value: 'brand', label: 'brand' },
    { value: 'neutral', label: 'neutral' },
    { value: 'signal', label: 'signal' },
  ];

  const hoverMixes: Record<string, string> = {
    brand: 'color-mix(in oklab, var(--primary) 7%, var(--background))',
    neutral: 'color-mix(in oklab, var(--muted) 55%, var(--background))',
    signal: 'color-mix(in oklab, var(--secondary) 12%, var(--background))',
  };
  const frameStyle = $derived(
    `width: min(${frameWidth}px, 100%); --jx-table-hover: ${hoverMixes[hoverTone] ?? hoverMixes.brand};`,
  );

  const consumers = [
    { name: 'unipty', host: 'unipty.jixoai.com', status: 'live', items: 12, coverage: 92, since: '2025-11' },
    { name: 'openspecui', host: 'openspecui.com', status: 'live', items: 9, coverage: 78, since: '2026-01' },
    { name: 'ui.jixoai.com', host: 'this site', status: 'live', items: 24, coverage: 100, since: '2026-08' },
    { name: 'jixoai/www', host: 'internal', status: 'beta', items: 6, coverage: 45, since: '2026-08' },
    { name: 'agent-console', host: 'internal', status: 'wip', items: 3, coverage: 12, since: '2026-07' },
  ] as const;

  // ---- recipe code samples (the drawer's usage files) --------------------
  const close = '</' + 'script>';

  const sortableUsage = String.raw`<script lang="ts">
  // single-column sort state: one key, one direction, three presses
  let sortKey = $state<string | null>(null);
  let sortDir = $state<'asc' | 'desc'>('asc');
  function toggleSort(key) {
    if (sortKey !== key) { sortKey = key; sortDir = 'asc'; return; }
    if (sortDir === 'asc') { sortDir = 'desc'; return; }
    sortKey = null; // third press clears → DOM order
  }
  const rows = $derived(sortKey === null
    ? tasks
    : [...tasks].sort((a, b) => (sortDir === 'asc' ? 1 : -1)
        * String(a[sortKey]).localeCompare(String(b[sortKey]))));
${close}

<Table caption="tasks" stack={false}>
  <thead>
    <tr>
      <th scope="col" aria-sort={sortKey === 'title'
        ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}>
        <PressButton variant="ghost" ariaLabel="sort by title" onclick={() => toggleSort('title')}>
          title <span aria-hidden="true">{sortKey === 'title' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}</span>
        </PressButton>
      </th>
      <!-- …one aria-sort per table, on the sorted column only -->
    </tr>
  </thead>
  <tbody>{#each rows as row (row.id)}<tr><td>{row.title}</td></tr>{/each}</tbody>
</Table>`;

  const filterUsage = String.raw`<script lang="ts">
  let titleFilter = $state('');
  let statusFacets = $state([]); // toggle-group multiple → string[]
  const rows = $derived(tasks.filter((row) =>
    (titleFilter === '' || row.title.toLowerCase().includes(titleFilter.toLowerCase())) &&
    (statusFacets.length === 0 || statusFacets.includes(row.status))));
${close}

<Table caption="tasks" stack={false}>
  <thead>
    <tr><!-- …the label row… --></tr>
    <tr><!-- the FILTER row: a control per filterable column -->
      <th scope="col"><Input type="search" bind:value={titleFilter} aria-label="filter by title" placeholder="contains…" /></th>
      <th scope="col">
        <ToggleGroup name="status-facets" type="multiple" label="filter by status" bind:value={statusFacets}>
          {#each statuses as status (status)}<ToggleGroupItem value={status}>{status}</ToggleGroupItem>{/each}
        </ToggleGroup>
      </th>
    </tr>
  </thead>
  <tbody>{#each rows as row (row.id)}<tr><td>{row.title}</td><td>{row.status}</td></tr>{/each}</tbody>
</Table>`;

  const paginationUsage = String.raw`<script lang="ts">
  import { pageRange } from '@ui/pagination/index';
  let pageIndex = $state(0);            // zero-based
  let pageSize = $state('5');           // the select commits strings
  const pageCount = $derived(Math.max(1, Math.ceil(rows.length / Number(pageSize))));
  const pageRows = $derived(rows.slice(pageIndex * Number(pageSize), (pageIndex + 1) * Number(pageSize)));
${close}

<Table caption="tasks" stack={false}><!-- …pageRows… --></Table>
<div class="flex items-center justify-between gap-3">
  <span class="text-xs text-muted-foreground">{pageRows.length} of {rows.length} tasks</span>
  <div class="flex items-center gap-3">
    <Select options={[5, 8, 12].map((n) => ({ value: String(n), label: n + ' rows' }))}
            bind:value={pageSize} aria-label="rows per page" />
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious onclick={() => (pageIndex = Math.max(0, pageIndex - 1))} />
        </PaginationItem>
        {#each pageRange({ current: pageIndex + 1, total: pageCount }) as item (item)}
          {#if item === 'ellipsis-start' || item === 'ellipsis-end'}
            <PaginationItem><PaginationEllipsis /></PaginationItem>
          {:else}
            <PaginationItem>
              <PaginationLink page={item} isActive={item === pageIndex + 1}
                onclick={() => (pageIndex = item - 1)} />
            </PaginationItem>
          {/if}
        {/each}
        <PaginationItem>
          <PaginationNext onclick={() => (pageIndex = Math.min(pageCount - 1, pageIndex + 1))} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  </div>
</div>`;

  const selectionUsage = String.raw`<script lang="ts">
  let selected = $state(new Set());
  const pageIds = $derived(pageRows.map((row) => row.id));
  const all = $derived(pageIds.length > 0 && pageIds.every((id) => selected.has(id)));
  const some = $derived(pageIds.some((id) => selected.has(id)) && !all);
  function toggleRow(id) {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    selected = next;
  }
  function toggleAll() {
    const next = new Set(selected);
    if (all) pageIds.forEach((id) => next.delete(id));
    else pageIds.forEach((id) => next.add(id));
    selected = next;
  }
${close}

<Table caption="tasks" stack={false}>
  <thead>
    <tr>
      <th scope="col">
        <!-- the law: indeterminate is an IDL property — the Checkbox prop drives it -->
        <Checkbox checked={all} indeterminate={some} aria-label="select all rows on this page"
                  onchange={toggleAll} />
      </th>
      <!-- … -->
    </tr>
  </thead>
  <tbody>
    {#each pageRows as row (row.id)}
      <tr>
        <td><Checkbox checked={selected.has(row.id)} aria-label={'select ' + row.id}
                      onchange={() => toggleRow(row.id)} /></td>
        <!-- … -->
      </tr>
    {/each}
  </tbody>
</Table>
<p aria-live="polite">{selected.size} of {rows.length} selected</p>`;

  const actionsUsage = String.raw`<script lang="ts">
  let visible = $state({ priority: true, assignee: true });
  let echo = $state('—');
${close}

<!-- the toolbar: column visibility behind a popover of checkboxes -->
<Popover id="tasks-columns" triggerLabel="columns">
  <Checkbox label="priority" checked={visible.priority} onchange={() => (visible = { ...visible, priority: !visible.priority })} />
  <Checkbox label="assignee" checked={visible.assignee} onchange={() => (visible = { ...visible, assignee: !visible.assignee })} />
</Popover>

<Table caption="tasks" stack={false}>
  <thead>
    <tr>
      <th scope="col">title</th>
      {#if visible.priority}<th scope="col">priority</th>{/if}
      <th scope="col"><span class="sr-only">actions</span></th>
    </tr>
  </thead>
  <tbody>
    {#each rows as row (row.id)}
      <tr>
        <td>{row.title}</td>
        {#if visible.priority}<td>{row.priority}</td>{/if}
        <td>
          <DropdownMenu id={'task-menu-' + row.id} placement="bottom-end">
            {#snippet trigger()}
              <button type="button" popovertarget={'task-menu-' + row.id}
                      aria-label={'actions for ' + row.id} class="…">⋯</button>
            {/snippet}
            <DropdownMenuItem onclick={() => (echo = 'copy id · ' + row.id)}>Copy id</DropdownMenuItem>
            <DropdownMenuItem onclick={() => (echo = 'duplicate · ' + row.id)}>Duplicate</DropdownMenuItem>
            <hr />
            <DropdownMenuItem destructive onclick={() => (echo = 'delete · ' + row.id)}>Delete</DropdownMenuItem>
          </DropdownMenu>
        </td>
      </tr>
    {/each}
  </tbody>
</Table>`;

  const stickyUsage = String.raw`<!-- the consumer owns the vertical scrollport: clamp the FRAME
     (the figure) and stick the head to it — the cells already paint an
     opaque --jx-table-surface, so pinned heads mask scrolled rows.
     Recorded followup: table ships no built-in sticky-header law yet. -->
<Table class="sticky-scroll" caption="event log" stack={false}>
  <thead><!-- … --></thead>
  <tbody><!-- …enough rows to scroll… --></tbody>
</Table>

<style>
  :global(.sticky-scroll) { max-block-size: 16rem; overflow-y: auto; }
  :global(.sticky-scroll thead th) { position: sticky; top: 0; z-index: 1; }
</style>`;

  const tasksUsage = String.raw`<script lang="ts">
  // ONE state machine feeds every layer: filter → sort → slice → select
  let filter = $state('');                 // toolbar search
  let facets = $state([]);                 // toolbar status facets
  let visible = $state({ priority: true, assignee: true }); // column visibility
  let selected = $state(new Set());        // row selection
  let pageIndex = $state(0);               // pagination
  let pageSize = $state('5');
  let sortKey = $state(null); let sortDir = $state('asc');

  const filtered = $derived(tasks
    .filter((row) => (filter === '' || row.title.includes(filter))
      && (facets.length === 0 || facets.includes(row.status)))
    .toSorted((a, b) => sortKey === null ? 0
      : (sortDir === 'asc' ? 1 : -1) * String(a[sortKey]).localeCompare(String(b[sortKey]))));
  const pageCount = $derived(Math.max(1, Math.ceil(filtered.length / Number(pageSize))));
  const page = $derived(filtered.slice(pageIndex * Number(pageSize), (pageIndex + 1) * Number(pageSize)));
  const pageIds = $derived(page.map((row) => row.id));
  const all = $derived(pageIds.length > 0 && pageIds.every((id) => selected.has(id)));
  const some = $derived(pageIds.some((id) => selected.has(id)) && !all);
${close}

<!-- the toolbar: search + facets + column visibility -->
<div class="flex flex-wrap items-center gap-3">
  <Input type="search" bind:value={filter} aria-label="filter tasks by title" placeholder="filter tasks…" />
  <ToggleGroup name="tasks-status" type="multiple" label="filter by status" bind:value={facets}>
    {#each statuses as status (status)}<ToggleGroupItem value={status}>{status}</ToggleGroupItem>{/each}
  </ToggleGroup>
  <Popover id="tasks-columns" triggerLabel="columns">
    <Checkbox label="priority" checked={visible.priority}
      onchange={() => (visible = { ...visible, priority: !visible.priority })} />
    <Checkbox label="assignee" checked={visible.assignee}
      onchange={() => (visible = { ...visible, assignee: !visible.assignee })} />
  </Popover>
</div>

<Table caption="tasks — the composed surface" stack={false}>
  <thead>
    <tr>
      <th scope="col"><Checkbox checked={all} indeterminate={some}
        aria-label="select all rows on this page" onchange={toggleAll} /></th>
      <th scope="col" aria-sort={sortKey === 'title'
        ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined}>
        <PressButton variant="ghost" ariaLabel="sort by title" onclick={() => toggleSort('title')}>
          title <span aria-hidden="true">{sortKey === 'title' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}</span>
        </PressButton>
      </th>
      <!-- …status / priority (visible.priority) / assignee (visible.assignee)… -->
      <th scope="col"><span class="sr-only">actions</span></th>
    </tr>
  </thead>
  <tbody>
    {#each page as row (row.id)}
      <tr>
        <td><Checkbox checked={selected.has(row.id)} aria-label={'select ' + row.id}
          onchange={() => toggleRow(row.id)} /></td>
        <td>{row.title}</td>
        {#if visible.priority}<td>{row.priority}</td>{/if}
        <td>
          <DropdownMenu id={'tasks-menu-' + row.id} placement="bottom-end">
            {#snippet trigger()}
              <button type="button" popovertarget={'tasks-menu-' + row.id}
                aria-label={'actions for ' + row.id}>⋯</button>
            {/snippet}
            <DropdownMenuItem onclick={() => act('copy id', row.id)}>Copy id</DropdownMenuItem>
            <DropdownMenuItem destructive onclick={() => act('archive', row.id)}>Archive</DropdownMenuItem>
          </DropdownMenu>
        </td>
      </tr>
    {/each}
  </tbody>
</Table>

<!-- the footer: selection readout + page-size + windowed pagination -->
<div class="flex items-center justify-between gap-3">
  <span aria-live="polite">{selected.size} of {tasks.length} selected</span>
  <Select options={[5, 8, 12].map((n) => ({ value: String(n), label: n + ' rows' }))}
    bind:value={pageSize} aria-label="rows per page" />
  <Pagination><!-- …pageRange window, Previous/Next buttons… --></Pagination>
</div>`;
</script>

<svelte:head>
  <title>Table · jixoai-ui</title>
  <meta
    name="description"
    content="The jixoai table component deepened with the CodePen JjxGgmm container-query law plus the full composition recipe suite: sortable headers (aria-sort + press-button carets), filter row with faceted toggle-group facets, pagination footer with page-size select, row selection with the select-all indeterminate law, row-actions dropdown column, column visibility popover, sticky header, and the composed tasks table."
  />
</svelte:head>

<div
  class="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6 lg:px-8"
>

  <div class="flex min-w-0 flex-col gap-8">
  <!-- page head -->
  <div data-reveal="">
    <SectionCard
      headingLevel={1}
      tone="hero"
      eyebrow="registry:ui · Display"
      title="table — frame-width laws, token paint, composition recipes"
      summary="The figure frame is a named inline-size container, so every responsive decision reads the FRAME's width, never the viewport's. Wide (≥ 30rem): the scroll law — fit-content columns, native overflow-x, consumer cells opt into pinned columns with data-sticky=start|end behind a hairline fold mark. Narrow: the CodePen card law — thead folds away, td[data-label] renders a muted label with the value flushed right. Every color routes through the --jx-table-* locals. On top of the paint sits the RECIPE SUITE: the component owns only the frame, so sorting, filtering, selection, row actions, column visibility and pagination are page-owned state composed from the family — the shadcn data-table tutorial's layering in terminal paint, ending in the tasks table."
    >
      <div class="flex flex-wrap gap-3">
        <span class="pill">container queries on the frame</span>
        <span class="pill">data-sticky pin law</span>
        <span class="pill">data-label card law</span>
        <span class="pill">--jx-table-* color surface</span>
        <span class="pill">sort · filter · select · paginate recipes</span>
      </div>
    </SectionCard>
  </div>

  <!-- install -->
  <div id="install" data-reveal="">
    <SectionCard
      family="install"
      headerRegion="install"
      eyebrow="install"
      title="Install"
      summary="One zero-dependency item. The recipes below add their own families — checkbox, input, toggle-group, select, pagination, dropdown-menu, popover, press-button — each a separate add."
    >
      <CodeBlock code={`npx jixoai-ui add table`} lang="sh" meta="install" />
    </SectionCard>
  </div>

  <!-- workbench: drag the frame across the 30rem line -->
  <div id="table-workbench" data-region="table-workbench" data-family="table-workbench" data-reveal="">
    <ComponentCanvas
      title="table"
      description="A registry-consumer operations table — Consumer and Docs pin to the scrollport while Items/Coverage scroll under them; drag the frame width past 30rem and the same rows re-lay out into label:value cards. The hover tone control retunes --jx-table-hover live."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/table/table.svelte"
      {files}
      stage="start"
      onreset={resetCanvas}
      output={[
        { label: 'frame', value: `${frameWidth}px` },
        { label: 'stack', value: stack ? 'on' : 'off' },
        { label: 'hover', value: hoverTone },
      ]}
    >
      <div class="frame-rig" style={frameStyle}>
        <Table caption="registry consumers — frame-width laws" {dense} {stack}>
          <thead>
            <tr>
              <th data-sticky="start" scope="col">Consumer</th>
              <th scope="col">Status</th>
              <th scope="col" class="text-right">Items</th>
              <th scope="col">Coverage</th>
              <th scope="col">Since</th>
              <th data-sticky="end" scope="col">Docs</th>
            </tr>
          </thead>
          <tbody>
            {#each consumers as consumer (consumer.name)}
              <tr>
                <td data-sticky="start" data-label="Consumer">
                  <div class="who">
                    <span class="who-name">{consumer.name}</span>
                    <span class="who-host">{consumer.host}</span>
                  </div>
                </td>
                <td data-label="Status"><span class="badge" data-tone={consumer.status}>{consumer.status}</span></td>
                <td data-label="Items" class="text-right">{consumer.items}</td>
                <td data-label="Coverage">
                  <span class="meter" role="img" aria-label="{consumer.coverage}% coverage">
                    <span class="meter-fill" style:width="{consumer.coverage}%"></span>
                  </span>
                  <span class="meter-value">{consumer.coverage}%</span>
                </td>
                <td data-label="Since">{consumer.since}</td>
                <td data-sticky="end" data-label="Docs">
                  <a class="doc-link" href={`https://${consumer.host === 'this site' ? 'ui.jixoai.com' : consumer.host}/`} target="_blank" rel="noreferrer">view</a>
                </td>
              </tr>
            {/each}
          </tbody>
          <tfoot>
            <tr><td>Total</td><td>—</td><td class="text-right">54</td><td>—</td><td>—</td><td>—</td></tr>
          </tfoot>
        </Table>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayRow label="frame width">
            <PlayRange bind:value={frameWidth} min={240} max={680} step={8} />
          </PlayRow>
          <PlayRow label="stack" hint="below 30rem">
            <PlayToggle bind:value={stack} />
          </PlayRow>
          <PlayRow label="dense rows">
            <PlayToggle bind:value={dense} />
          </PlayRow>
          <PlayRow label="hover tone" hint="--jx-table-hover">
            <PlaySegmented bind:value={hoverTone} options={hoverToneOptions} />
          </PlayRow>
          <PlayHelp>
            The frame is the container: cross 30rem and the scroll law (data-sticky pins) flips
            into the card law (data-label rows). brand hover follows --brand-hue — the site hue
            runtime recolors it live; consumers override one var per instance.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>
  </div>

  <div class="mx-auto flex w-full max-w-[90rem] flex-col gap-8 px-4 pb-10 sm:px-6 lg:px-8">
  <!-- usage: the ONE h2 -->
  <div id="usage" data-reveal="">
    <SectionCard
      family="usage"
      headerRegion="usage"
      eyebrow="usage"
      title="Usage"
      summary="Author the native semantic set inside the frame — caption, thead/tbody/tfoot stay yours; data-label arms the narrow-frame card law, data-sticky pins columns under the scroll law."
    >
      <CodeBlock code={usage} lang="svelte" meta="table usage" />
    </SectionCard>
  </div>

  <!-- examples: the ability-named recipe suite -->
  <div id="examples" data-reveal="">
    <SectionCard
      family="examples"
      headerRegion="examples"
      eyebrow="examples"
      title="Examples"
      summary="The composition recipes, one ability per demo: sortable headers, filter row + facets, pagination footer, row selection, row actions + column visibility, sticky header — composed into the tasks table at the end."
    >
      <p class="m-0 text-[13px] leading-6 text-muted-foreground">
        The component owns the frame; every interactive layer below is page-owned state over
        public component behavior (composition-first — zero registry edits). Missing atoms are
        recorded in the change's followups, never worked around silently.
      </p>
    </SectionCard>
  </div>

  <!-- recipe: sortable headers -->
  <div id="table-sortable" data-region="table-sortable" data-family="table-sortable" data-reveal="">
    <ComponentCanvas
      title="with sortable headers"
      description="th[aria-sort] carries the tri-state (ascending | descending | absent) and a press-button caret announces the direction; ONE column sorts at a time and the third press returns the table to DOM order."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/table/table.svelte"
      files={[
        { name: 'registry/files/ui/table/table.svelte', content: tableSource },
        { name: 'src/lib/ui/table-sortable-usage.svelte', content: sortableUsage, kind: 'usage' },
      ]}
      stage="fill"
      output={[
        { label: 'sort key', value: sortKey ?? '—' },
        { label: 'direction', value: sortKey === null ? '—' : sortDir },
      ]}
    >
      <div class="w-full max-w-2xl">
        <Table caption="tasks — sortable headers" stack={false}>
          <thead>
            <tr>
              <th scope="col">id</th>
              <th scope="col" aria-sort={ariaSort('title')}>
                <PressButton variant="ghost" ariaLabel="sort by title" onclick={() => toggleSort('title')}>
                  title <span class="caret" aria-hidden="true">{caret('title')}</span>
                </PressButton>
              </th>
              <th scope="col" aria-sort={ariaSort('status')}>
                <PressButton variant="ghost" ariaLabel="sort by status" onclick={() => toggleSort('status')}>
                  status <span class="caret" aria-hidden="true">{caret('status')}</span>
                </PressButton>
              </th>
              <th scope="col" aria-sort={ariaSort('priority')}>
                <PressButton variant="ghost" ariaLabel="sort by priority" onclick={() => toggleSort('priority')}>
                  priority <span class="caret" aria-hidden="true">{caret('priority')}</span>
                </PressButton>
              </th>
              <th scope="col" aria-sort={ariaSort('due')}>
                <PressButton variant="ghost" ariaLabel="sort by due date" onclick={() => toggleSort('due')}>
                  due <span class="caret" aria-hidden="true">{caret('due')}</span>
                </PressButton>
              </th>
            </tr>
          </thead>
          <tbody>
            {#each sortableRows.slice(0, 6) as row (row.id)}
              <tr>
                <td class="font-mono text-[12px] text-muted-foreground">{row.id}</td>
                <td>{row.title}</td>
                <td><Badge variant="outline" class="jx-hue-neutral">{row.status}</Badge></td>
                <td><span class="prio" data-prio={row.priority}>{row.priority}</span></td>
                <td class="font-mono text-[12px]">{row.due}</td>
              </tr>
            {/each}
          </tbody>
        </Table>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            aria-sort is the contract: absent on unsorted columns, ascending/descending on the
            active one — screen readers announce the direction from the header alone. The caret
            glyph is decoration (aria-hidden); the button's accessible name says what sorting
            does. Press cycle: asc → desc → cleared.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- recipe: filter row + faceted filter -->
  <div id="table-filter-row" data-region="table-filter-row" data-family="table-filter-row" data-reveal="">
    <ComponentCanvas
      title="with filter row and faceted filter"
      description="A second thead row mounts a control per filterable column: Input for text-contains, a multiple toggle-group as the status facet picker (checked facets OR together)."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/table/table.svelte"
      files={[
        { name: 'registry/files/ui/table/table.svelte', content: tableSource },
        { name: 'src/lib/ui/table-filter-usage.svelte', content: filterUsage, kind: 'usage' },
      ]}
      stage="fill"
      output={[
        { label: 'contains', value: titleFilter || '—' },
        { label: 'facets', value: statusFacets.length ? statusFacets.join(' | ') : '—' },
        { label: 'rows', value: `${filterRows.length} / ${tasks.length}` },
      ]}
    >
      <div class="w-full max-w-3xl">
        <Table caption="tasks — filter row" stack={false}>
          <thead>
            <tr>
              <th scope="col">id</th>
              <th scope="col">title</th>
              <th scope="col">status</th>
              <th scope="col" class="text-right">due</th>
            </tr>
            <tr data-filter-row>
              <th scope="col"><span class="sr-only">filters</span></th>
              <th scope="col">
                <Input type="search" bind:value={titleFilter} aria-label="filter by title" placeholder="contains…" />
              </th>
              <th scope="col" colspan="2">
                <ToggleGroup name="filter-status" type="multiple" label="filter by status" bind:value={statusFacets}>
                  {#each STATUSES as status (status)}
                    <ToggleGroupItem value={status}>{status}</ToggleGroupItem>
                  {/each}
                </ToggleGroup>
              </th>
            </tr>
          </thead>
          <tbody>
            {#each filterRows.slice(0, 6) as row (row.id)}
              <tr>
                <td class="font-mono text-[12px] text-muted-foreground">{row.id}</td>
                <td>{row.title}</td>
                <td><Badge variant="outline" class="jx-hue-neutral">{row.status}</Badge></td>
                <td class="text-right font-mono text-[12px]">{row.due}</td>
              </tr>
            {:else}
              <tr><td colspan="4" class="text-center text-muted-foreground">no rows match the filters</td></tr>
            {/each}
          </tbody>
        </Table>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            The filter row lives in thead, one th per filterable column — the controls align with
            the data they filter. Facets are a toggle-group in multiple mode: native checkboxes
            under one name, checked values OR together; the empty facet set means "all".
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- recipe: pagination footer -->
  <div id="table-pagination" data-region="table-pagination" data-family="table-pagination" data-reveal="">
    <ComponentCanvas
      title="with pagination footer"
      description="The existing pagination family under the slice: pageRange windows the links, Previous/Next walk the bounds as honest buttons, and a page-size select re-slices everything."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/table/table.svelte"
      files={[
        { name: 'registry/files/ui/table/table.svelte', content: tableSource },
        { name: 'src/lib/ui/table-pagination-usage.svelte', content: paginationUsage, kind: 'usage' },
      ]}
      stage="fill"
      output={[
        { label: 'page', value: `${pageIndex + 1} / ${pageCount}` },
        { label: 'size', value: pageSizeNumber },
        { label: 'rows', value: `${pageRows.length} / ${filterRows.length}` },
      ]}
    >
      <div class="w-full max-w-3xl">
        <Table caption="tasks — pagination footer" stack={false}>
          <thead>
            <tr>
              <th scope="col">id</th>
              <th scope="col">title</th>
              <th scope="col">status</th>
            </tr>
          </thead>
          <tbody>
            {#each pageRows as row (row.id)}
              <tr>
                <td class="font-mono text-[12px] text-muted-foreground">{row.id}</td>
                <td>{row.title}</td>
                <td><Badge variant="outline" class="jx-hue-neutral">{row.status}</Badge></td>
              </tr>
            {/each}
          </tbody>
        </Table>
        <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span class="font-mono text-[11.5px] text-muted-foreground">
            {pageRows.length} of {filterRows.length} tasks
          </span>
          <div class="flex flex-wrap items-center gap-3">
            <div class="w-28">
              <Select options={pageSizeOptions} bind:value={pageSize} aria-label="rows per page" placeholder="rows" />
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious onclick={() => (pageIndex = Math.max(0, pageIndex - 1))} />
                </PaginationItem>
                {#each pageRange({ current: pageIndex + 1, total: pageCount }) as item (item)}
                  {#if item === 'ellipsis-start' || item === 'ellipsis-end'}
                    <PaginationItem><PaginationEllipsis /></PaginationItem>
                  {:else}
                    <PaginationItem>
                      <PaginationLink page={item} isActive={item === pageIndex + 1} onclick={() => (pageIndex = item - 1)} />
                    </PaginationItem>
                  {/if}
                {/each}
                <PaginationItem>
                  <PaginationNext onclick={() => (pageIndex = Math.min(pageCount - 1, pageIndex + 1))} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            Zero-based pageIndex in state, one-based current in pageRange. Shrinking the page
            count below the current index stranding the view is the classic bug — clamp on
            size change (or reset to 0, as here). Edge controls without href render as
            buttons; at the bounds they disable honestly.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- recipe: row selection -->
  <div id="table-selection" data-region="table-selection" data-family="table-selection" data-reveal="">
    <ComponentCanvas
      title="with row selection"
      description="A checkbox column with the select-all law: the header box is indeterminate on partial selection, presses to select-all when partial, clears when full; the count readout is a polite live region."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/table/table.svelte"
      files={[
        { name: 'registry/files/ui/table/table.svelte', content: tableSource },
        { name: 'src/lib/ui/table-selection-usage.svelte', content: selectionUsage, kind: 'usage' },
      ]}
      stage="fill"
      output={[
        { label: 'selected', value: `${selected.size} / ${selectionRows.length}` },
        { label: 'header box', value: selectionState.all ? 'checked' : selectionState.some ? 'indeterminate' : 'unchecked' },
      ]}
    >
      <div class="w-full max-w-2xl">
        <Table caption="tasks — row selection" stack={false}>
          <thead>
            <tr>
              <th scope="col">
                <Checkbox
                  checked={selectionState.all}
                  indeterminate={selectionState.some}
                  aria-label="select all rows"
                  onchange={toggleSelectionAll}
                />
              </th>
              <th scope="col">id</th>
              <th scope="col">title</th>
            </tr>
          </thead>
          <tbody>
            {#each selectionRows as row (row.id)}
              <tr class:row-selected={selected.has(row.id)}>
                <td>
                  <Checkbox
                    checked={selected.has(row.id)}
                    aria-label={`select ${row.id}`}
                    onchange={() => (selected = toggleSelected(selected, row.id))}
                  />
                </td>
                <td class="font-mono text-[12px] text-muted-foreground">{row.id}</td>
                <td>{row.title}</td>
              </tr>
            {/each}
          </tbody>
        </Table>
        <p class="mt-2 font-mono text-[11.5px] text-muted-foreground" aria-live="polite">
          {selected.size} of {selectionRows.length} selected
        </p>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            The indeterminate law is an IDL property, not an attribute — the Checkbox prop
            pushes it onto the input. Press semantics: partial → select all, full → clear.
            The readout is aria-live=polite so switch users hear the count change without
            focus moving.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- recipe: row actions + column visibility -->
  <div id="table-row-actions" data-region="table-row-actions" data-family="table-row-actions" data-reveal="">
    <ComponentCanvas
      title="with row actions and column visibility"
      description="An actions column of dropdown menus (copy id / duplicate / destructive delete) plus the toolbar's column-visibility popover — optional columns leave the DOM entirely, colspans follow."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/table/table.svelte"
      files={[
        { name: 'registry/files/ui/table/table.svelte', content: tableSource },
        { name: 'src/lib/ui/table-actions-usage.svelte', content: actionsUsage, kind: 'usage' },
      ]}
      stage="fill"
      output={[
        { label: 'priority column', value: actionsVisible.priority ? 'visible' : 'hidden' },
        { label: 'assignee column', value: actionsVisible.assignee ? 'visible' : 'hidden' },
        { label: 'last action', value: actionEcho },
      ]}
    >
      <div class="w-full max-w-3xl">
        <div class="mb-3 flex flex-wrap items-center gap-3">
          <Popover id="actions-columns" triggerLabel="columns">
            <div class="flex flex-col gap-2 p-2">
              <Checkbox
                label="priority"
                checked={actionsVisible.priority}
                onchange={() => (actionsVisible = { ...actionsVisible, priority: !actionsVisible.priority })}
              />
              <Checkbox
                label="assignee"
                checked={actionsVisible.assignee}
                onchange={() => (actionsVisible = { ...actionsVisible, assignee: !actionsVisible.assignee })}
              />
            </div>
          </Popover>
          <span class="font-mono text-[11.5px] text-muted-foreground">last action: {actionEcho}</span>
        </div>
        <Table caption="tasks — row actions" stack={false}>
          <thead>
            <tr>
              <th scope="col">id</th>
              <th scope="col">title</th>
              {#if actionsVisible.priority}<th scope="col">priority</th>{/if}
              {#if actionsVisible.assignee}<th scope="col">assignee</th>{/if}
              <th scope="col"><span class="sr-only">actions</span></th>
            </tr>
          </thead>
          <tbody>
            {#each tasks.slice(0, 5) as row (row.id)}
              <tr>
                <td class="font-mono text-[12px] text-muted-foreground">{row.id}</td>
                <td>{row.title}</td>
                {#if actionsVisible.priority}<td><span class="prio" data-prio={row.priority}>{row.priority}</span></td>{/if}
                {#if actionsVisible.assignee}<td class="font-mono text-[12px]">{row.assignee}</td>{/if}
                <td>
                  <DropdownMenu id={`task-actions-${row.id}`} placement="bottom-end">
                    {#snippet trigger()}
                      <button
                        type="button"
                        popovertarget={`task-actions-${row.id}`}
                        aria-label={`actions for ${row.id}`}
                        class="jx-press inline-flex cursor-pointer appearance-none border border-border bg-background px-2 py-0.5 text-[13px] leading-5 shadow-2xs"
                      >
                        ⋯
                      </button>
                    {/snippet}
                    <DropdownMenuItem onclick={() => rowAction('copy id', row.id)}>Copy id</DropdownMenuItem>
                    <DropdownMenuItem onclick={() => rowAction('duplicate', row.id)}>Duplicate</DropdownMenuItem>
                    <hr />
                    <DropdownMenuItem destructive onclick={() => rowAction('delete', row.id)}>Delete</DropdownMenuItem>
                  </DropdownMenu>
                </td>
              </tr>
            {/each}
          </tbody>
        </Table>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            Row menus key their popover ids off the row id — one DropdownMenu per row, opened
            from a ⋯ button whose accessible name names the row. Selection inside the menu
            closes it and restores focus to the ⋯ trigger (the APG contract the family ships).
            Hidden columns leave the DOM — no width:0 ghosts.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- recipe: sticky header -->
  <div id="table-sticky-header" data-region="table-sticky-header" data-family="table-sticky-header" data-reveal="">
    <ComponentCanvas
      title="with sticky header"
      description="A tall event log under a clamped scrollport: the consumer owns the vertical law — max-block-size on the frame, thead th pinned to it. The cells already paint an opaque --jx-table-surface, so the pinned head masks scrolled rows."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/table/table.svelte"
      files={[
        { name: 'registry/files/ui/table/table.svelte', content: tableSource },
        { name: 'src/lib/ui/table-sticky-usage.svelte', content: stickyUsage, kind: 'usage' },
      ]}
      stage="fill"
      output={[{ label: 'scrollport', value: 'frame · 16rem clamp' }, { label: 'rows', value: tasks.length }]}
    >
      <div class="w-full max-w-2xl">
        <Table class="sticky-scroll" caption="event log — the head stays" stack={false}>
          <thead>
            <tr>
              <th scope="col">when</th>
              <th scope="col">event</th>
              <th scope="col">level</th>
            </tr>
          </thead>
          <tbody>
            {#each tasks as row, index (row.id)}
              <tr>
                <td class="font-mono text-[12px] text-muted-foreground">08-{26 + (index % 4)} · {String(10 + index).padStart(2, '0')}:42</td>
                <td>{row.title}</td>
                <td>{index % 3 === 0 ? 'info' : index % 3 === 1 ? 'warn' : 'error'}</td>
              </tr>
            {/each}
          </tbody>
        </Table>
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            Scroll the log — the caption and body scroll, the head pins. The recipe clamps the
            FRAME (the figure) and sticks thead th to it; a built-in sticky-header law is the
            recorded followup (change followups.md), until then this is consumer CSS on public
            structure.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- recipe: the composed tasks table -->
  <div id="table-tasks" data-region="table-tasks" data-family="table-tasks" data-reveal="">
    <ComponentCanvas
      title="the tasks table — everything composed"
      description="The terminal demo: toolbar (search + status facets + column visibility) over sortable headers, row selection with the select-all law, a row-actions column, and the pagination footer — one state machine, every recipe from this page."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/table/table.svelte"
      files={[
        { name: 'registry/files/ui/table/table.svelte', content: tableSource },
        { name: 'registry/files/ui/table/table.css', content: tableCssSource },
        { name: 'src/lib/ui/table-tasks-usage.svelte', content: tasksUsage, kind: 'usage' },
      ]}
      stage="fill"
      onreset={resetTasksTable}
      output={[
        { label: 'rows', value: `${tasksFiltered.length} / ${tasks.length}` },
        { label: 'page', value: `${tasksPageIndex + 1} / ${tasksPageCount}` },
        { label: 'selected', value: `${tasksSelected.size}` },
        { label: 'sort', value: sortKey === null ? '—' : `${sortKey} ${sortDir}` },
      ]}
    >
      <div class="w-full">
        <!-- the toolbar: filter + facets + column visibility -->
        <div class="mb-3 flex flex-wrap items-center gap-3">
          <div class="w-56">
            <Input type="search" bind:value={tasksFilter} aria-label="filter tasks by title" placeholder="filter tasks…" />
          </div>
          <ToggleGroup name="tasks-status" type="multiple" label="filter by status" bind:value={tasksFacets}>
            {#each STATUSES as status (status)}
              <ToggleGroupItem value={status}>{status}</ToggleGroupItem>
            {/each}
          </ToggleGroup>
          <Popover id="tasks-columns" triggerLabel="columns">
            <div class="flex flex-col gap-2 p-2">
              <Checkbox
                label="priority"
                checked={tasksVisible.priority}
                onchange={() => (tasksVisible = { ...tasksVisible, priority: !tasksVisible.priority })}
              />
              <Checkbox
                label="assignee"
                checked={tasksVisible.assignee}
                onchange={() => (tasksVisible = { ...tasksVisible, assignee: !tasksVisible.assignee })}
              />
            </div>
          </Popover>
        </div>

        <Table caption="tasks — the composed surface" stack={false}>
          <thead>
            <tr>
              <th scope="col">
                <Checkbox
                  checked={tasksSelectAll.all}
                  indeterminate={tasksSelectAll.some}
                  aria-label="select all rows on this page"
                  onchange={toggleTasksAll}
                />
              </th>
              <th scope="col">id</th>
              <th scope="col" aria-sort={ariaSort('title')}>
                <PressButton variant="ghost" ariaLabel="sort by title" onclick={() => toggleSort('title')}>
                  title <span class="caret" aria-hidden="true">{caret('title')}</span>
                </PressButton>
              </th>
              <th scope="col" aria-sort={ariaSort('status')}>
                <PressButton variant="ghost" ariaLabel="sort by status" onclick={() => toggleSort('status')}>
                  status <span class="caret" aria-hidden="true">{caret('status')}</span>
                </PressButton>
              </th>
              {#if tasksVisible.priority}
                <th scope="col" aria-sort={ariaSort('priority')}>
                  <PressButton variant="ghost" ariaLabel="sort by priority" onclick={() => toggleSort('priority')}>
                    priority <span class="caret" aria-hidden="true">{caret('priority')}</span>
                  </PressButton>
                </th>
              {/if}
              {#if tasksVisible.assignee}<th scope="col">assignee</th>{/if}
              <th scope="col"><span class="sr-only">actions</span></th>
            </tr>
          </thead>
          <tbody>
            {#each tasksPage as row (row.id)}
              <tr class:row-selected={tasksSelected.has(row.id)}>
                <td>
                  <Checkbox
                    checked={tasksSelected.has(row.id)}
                    aria-label={`select ${row.id}`}
                    onchange={() => (tasksSelected = toggleSelected(tasksSelected, row.id))}
                  />
                </td>
                <td class="font-mono text-[12px] text-muted-foreground">{row.id}</td>
                <td>{row.title}</td>
                <td><Badge variant="outline" class="jx-hue-neutral">{row.status}</Badge></td>
                {#if tasksVisible.priority}<td><span class="prio" data-prio={row.priority}>{row.priority}</span></td>{/if}
                {#if tasksVisible.assignee}<td class="font-mono text-[12px]">{row.assignee}</td>{/if}
                <td>
                  <DropdownMenu id={`tasks-menu-${row.id}`} placement="bottom-end">
                    {#snippet trigger()}
                      <button
                        type="button"
                        popovertarget={`tasks-menu-${row.id}`}
                        aria-label={`actions for ${row.id}`}
                        class="jx-press inline-flex cursor-pointer appearance-none border border-border bg-background px-2 py-0.5 text-[13px] leading-5 shadow-2xs"
                      >
                        ⋯
                      </button>
                    {/snippet}
                    <DropdownMenuItem onclick={() => taskAction('copy id', row.id)}>Copy id</DropdownMenuItem>
                    <DropdownMenuItem onclick={() => taskAction('pin', row.id)}>Pin to top</DropdownMenuItem>
                    <hr />
                    <DropdownMenuItem destructive onclick={() => taskAction('archive', row.id)}>Archive</DropdownMenuItem>
                  </DropdownMenu>
                </td>
              </tr>
            {:else}
              <tr><td colspan="7" class="text-center text-muted-foreground">no tasks match the toolbar</td></tr>
            {/each}
          </tbody>
        </Table>

        <!-- the footer: selection readout + page-size + windowed pagination -->
        <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
          <span class="font-mono text-[11.5px] text-muted-foreground" aria-live="polite">
            {tasksSelected.size} of {tasks.length} selected
          </span>
          <div class="flex flex-wrap items-center gap-3">
            <div class="w-28">
              <Select options={pageSizeOptions} bind:value={pageSize} aria-label="rows per page" placeholder="rows" />
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious onclick={() => (tasksPageIndex = Math.max(0, tasksPageIndex - 1))} />
                </PaginationItem>
                {#each pageRange({ current: tasksPageIndex + 1, total: tasksPageCount }) as item (item)}
                  {#if item === 'ellipsis-start' || item === 'ellipsis-end'}
                    <PaginationItem><PaginationEllipsis /></PaginationItem>
                  {:else}
                    <PaginationItem>
                      <PaginationLink page={item} isActive={item === tasksPageIndex + 1} onclick={() => (tasksPageIndex = item - 1)} />
                    </PaginationItem>
                  {/if}
                {/each}
                <PaginationItem>
                  <PaginationNext onclick={() => (tasksPageIndex = Math.min(tasksPageCount - 1, tasksPageIndex + 1))} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
        {#if tasksLog.length}
          <p class="mt-2 font-mono text-[11.5px] text-muted-foreground">recent: {tasksLog.join(' · ')}</p>
        {/if}
      </div>
      {#snippet playground()}
        <PlayFields>
          <PlayRow label="page size" hint="re-slices everywhere">
            <PlaySegmented bind:value={pageSize} options={pageSizeOptions} />
          </PlayRow>
          <PlayHelp>
            One state machine feeds every layer: filter → sort → slice → select. The select-all
            law reads the PAGE slice (five selected of five shown), the count readout reads the
            whole corpus. Reset restores the toolbar, selection and pager.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <!-- semantic set: the untouched native baseline -->
  <div id="table-semantic-set" data-region="table-semantic-set" data-family="table-semantic-set" data-reveal="">
    <ComponentCanvas
      title="table · semantic set"
      description="The untouched native baseline — caption, thead/tbody/tfoot authored by hand, numeric right-align through consumer classes. The same table now also carries data-label on every cell, so the narrow-frame card law needs zero extra markup."
      sourceUrl="https://github.com/jixoai/ui/blob/main/registry/files/ui/table/table.svelte"
      files={[{ name: 'registry/files/ui/table/table.svelte', content: tableSource }]}
      stage="fill"
    >
      <Table caption="jixoai components — environment support (2026-08)" class="w-full max-w-[40rem]">
        <thead>
          <tr>
            <th>Component</th>
            <th>Svelte 5</th>
            <th>Prerendered SSR</th>
            <th class="text-right">Files</th>
          </tr>
        </thead>
        <tbody>
          <tr><td data-label="Component">press-button</td><td data-label="Svelte 5">yes</td><td data-label="Prerendered SSR">yes</td><td data-label="Files" class="text-right">1</td></tr>
          <tr><td data-label="Component">code-card + highlight</td><td data-label="Svelte 5">yes</td><td data-label="Prerendered SSR">yes</td><td data-label="Files" class="text-right">2</td></tr>
          <tr><td data-label="Component">table</td><td data-label="Svelte 5">yes</td><td data-label="Prerendered SSR">yes</td><td data-label="Files" class="text-right">1</td></tr>
          <tr><td data-label="Component">tree-view</td><td data-label="Svelte 5">yes</td><td data-label="Prerendered SSR">yes</td><td data-label="Files" class="text-right">1</td></tr>
        </tbody>
        <tfoot>
          <tr><td>Total</td><td>—</td><td>—</td><td class="text-right">5</td></tr>
        </tfoot>
      </Table>
      {#snippet playground()}
        <PlayFields>
          <PlayHelp>
            The component never wraps your rows: thead/tbody/tfoot/th/td stay real elements in
            your tree, so every recipe on this page could mount onto plain table markup.
          </PlayHelp>
        </PlayFields>
      {/snippet}
    </ComponentCanvas>
  </div>

  <div id="types" data-reveal="">
    <SectionCard eyebrow="types" title="Responsive modes" summary="Keep the native table markup; dense reduces row height and stack selects the narrow-frame card law.">
      <div class="grid gap-4 md:grid-cols-2"><Table caption="default"><tbody><tr><td>regular rows</td></tr></tbody></Table><Table dense stack={false} caption="dense scroll"><tbody><tr><td>compact, always scrollable</td></tr></tbody></Table></div>
    </SectionCard>
  </div>
  <div id="accessibility" data-reveal=""><SectionCard eyebrow="a11y" title="Accessibility"><A11yTable aria={[{ name: 'caption', value: 'native table caption', description: 'Names the table for assistive technology.' }, { name: 'scope', value: 'col | row', description: 'Associates headers with their cells.' }, { name: 'data-label', value: 'string', description: 'Labels values in the narrow card layout.' }, { name: 'aria-sort', value: 'ascending | descending', description: 'Recipe wiring: lives on the sorted th only; the caret glyph stays aria-hidden.' }, { name: 'aria-live', value: 'polite', description: 'Selection count readout announces changes without stealing focus.' }]} /></SectionCard></div>
  <div id="theming" data-reveal=""><SectionCard eyebrow="theming" title="Density and tokens"><DensityDemo scopes={['xs', 'default', 'lg']}><Table caption="density"><tbody><tr><td>row</td></tr></tbody></Table></DensityDemo><div class="mt-5"><TokenTable tokens={[{ name: '--jx-table-surface', default: 'var(--background)', source: 'component' }, { name: '--jx-table-head', default: 'var(--muted)', source: 'component' }, { name: '--jx-table-hover', default: 'primary 7% mix', source: 'color' }, { name: '--jx-table-hairline', default: 'border 12% mix', source: 'color' }, { name: '--jx-table-rule', default: 'border 18% mix', source: 'color' }, { name: '--jx-table-edge', default: 'border 34% mix', source: 'color' }, { name: '--jx-inset', default: 'density scale', source: 'density' }, { name: '--jx-gap', default: 'density scale', source: 'density' }, { name: '--jx-stack', default: 'density scale', source: 'density' }, { name: '--jx-text', default: 'density scale', source: 'density' }, { name: '--jx-line', default: 'density scale', source: 'density' }, { name: '--jx-text-secondary', default: 'density scale', source: 'density' }, { name: '--jx-line-secondary', default: 'density scale', source: 'density' }]} /></div></SectionCard></div>
  <div id="api" data-reveal=""><SectionCard eyebrow="api" title="Table props"><PropsTable props={[{ name: 'caption', type: 'string', default: "''", description: 'Native table caption.' }, { name: 'dense', type: 'boolean', default: 'false', description: 'Uses compact row padding.' }, { name: 'stack', type: 'boolean', default: 'true', description: 'Enables narrow-frame card rows.' }, { name: 'density', type: 'Density', default: "'sm' · ambient scope", description: 'Explicit override, then the inherited scope, then the family own sm — dense tabular rows are the table’s declared posture (the design-frozen local fallback, now the density slot’s own).' }, { name: 'style', type: 'string', default: "''", description: 'Overrides local table tokens.' }]} /></SectionCard></div>

  <div id="see-also" data-reveal="">
    <SectionCard
      family="see-also"
      headerRegion="see-also"
      eyebrow="see also"
      title="See also"
      summary="The families the recipes compose with."
    >
      <div class="flex flex-wrap gap-3">
        <a class="pill" href="/docs/components/pagination.html">pagination — the footer family</a>
        <a class="pill" href="/docs/components/checkbox.html">checkbox — the selection column</a>
        <a class="pill" href="/docs/components/dropdown-menu.html">dropdown-menu — the row-actions column</a>
        <a class="pill" href="/docs/components/popover.html">popover — the column-visibility toolbar</a>
        <a class="pill" href="/docs/components/toggle-group.html">toggle-group — the facet picker</a>
        <a class="pill" href="/docs/components/select.html">select — the page-size control</a>
      </div>
    </SectionCard>
  </div>
  </div>
</div>

<style>
  /* demo-content paint (consumer side): identity block, status badges,
     coverage meter — all riding theme tokens so the hue runtime flows */
  .frame-rig {
    max-width: 100%;
  }

  .who {
    display: flex;
    flex-direction: column;
    gap: 0.1rem;
    line-height: 1.35;
  }
  .who-name {
    font-weight: 500;
  }
  .who-host {
    color: var(--muted-foreground);
    font-size: 11px;
  }

  .badge {
    border: 1px solid;
    display: inline-flex;
    align-items: center;
    font-size: 10.5px;
    gap: 0.45rem;
    letter-spacing: 0.08em;
    padding: 0.1rem 0.55rem;
    text-transform: uppercase;
    white-space: nowrap;
  }
  .badge::before {
    border-radius: 50%;
    content: '';
    height: 4px;
    width: 4px;
  }
  .badge[data-tone='live'] {
    border-color: color-mix(in oklab, var(--chart-4) 55%, var(--border));
    color: color-mix(in oklab, var(--chart-4) 72%, var(--foreground));
    background: color-mix(in oklab, var(--chart-4) 12%, var(--background));
  }
  .badge[data-tone='live']::before {
    background: var(--chart-4);
  }
  .badge[data-tone='beta'] {
    border-color: color-mix(in oklab, var(--secondary) 55%, var(--border));
    color: color-mix(in oklab, var(--secondary) 60%, var(--foreground));
    background: color-mix(in oklab, var(--secondary) 14%, var(--background));
  }
  .badge[data-tone='beta']::before {
    background: var(--secondary);
  }
  .badge[data-tone='wip'] {
    border-color: color-mix(in oklab, var(--muted-foreground) 45%, var(--border));
    color: var(--muted-foreground);
  }
  .badge[data-tone='wip']::before {
    background: var(--muted-foreground);
  }

  .meter {
    background: color-mix(in oklab, var(--muted-foreground) 18%, transparent);
    block-size: 4px;
    display: inline-block;
    inline-size: 5rem;
    vertical-align: middle;
  }
  .meter-fill {
    background: var(--primary);
    block-size: 100%;
    display: block;
  }
  .meter-value {
    color: var(--muted-foreground);
    font-size: 11px;
    margin-inline-start: 0.5rem;
    vertical-align: middle;
  }

  .doc-link {
    color: var(--primary);
    font-size: 11.5px;
    letter-spacing: 0.06em;
    text-decoration: underline;
    text-underline-offset: 3px;
    white-space: nowrap;
  }
  .doc-link:hover {
    color: color-mix(in oklab, var(--primary) 70%, var(--foreground));
  }

  /* stack law: the meter row keeps its bar+value pair on one line */
  :global(td[data-label='Coverage']) {
    white-space: nowrap;
  }

  /* ---- recipe paint (consumer side) ---------------------------------- */

  /* the sort caret rides beside the label; only the active column's
     caret points — the inactive glyph reads as "sortable, not sorted" */
  .caret {
    color: var(--muted-foreground);
    display: inline-block;
    font-size: 10px;
    margin-inline-start: 0.25rem;
  }
  th[aria-sort] .caret {
    color: var(--primary);
  }

  /* priority glyph: a colored leading dot, hue by urgency */
  .prio {
    align-items: center;
    display: inline-flex;
    gap: 0.4rem;
    white-space: nowrap;
  }
  .prio::before {
    border-radius: 50%;
    content: '';
    height: 5px;
    width: 5px;
  }
  .prio[data-prio='urgent']::before {
    background: var(--destructive);
  }
  .prio[data-prio='high']::before {
    background: var(--primary);
  }
  .prio[data-prio='medium']::before {
    background: var(--secondary);
  }
  .prio[data-prio='low']::before {
    background: var(--muted-foreground);
  }

  /* selected rows lean on the hover surface — state rides the token,
     never a new color */
  :global(.jx-table tbody tr.row-selected td) {
    background: color-mix(in oklab, var(--primary) 9%, var(--jx-table-surface, var(--background)));
  }

  /* sticky header recipe: the consumer owns the vertical scrollport —
     max-block-size clamps the FRAME (the figure), thead th pins to it.
     The cells paint an opaque --jx-table-surface, so the pinned head
     masks scrolled rows. RECORDED FOLLOWUP (change followups.md): the
     table ships no built-in sticky-header law; this is consumer CSS on
     public structure until that lands. */
  :global(.sticky-scroll) {
    max-block-size: 16rem;
    overflow-y: auto;
  }
  :global(.sticky-scroll thead th) {
    position: sticky;
    top: 0;
    z-index: 1;
  }
</style>
