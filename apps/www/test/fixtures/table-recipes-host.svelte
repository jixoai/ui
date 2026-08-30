<!--
  Test host for the table-grid-toolbar recipes (openspec change
  2026-08-30-table-grid-toolbar): ONE composed surface carrying every
  interactive law the docs page demos —

    sortable headers   th[aria-sort] + a press-button caret; single
                       column sorted at a time; asc → desc → clear
    filter row         thead second row — Input contains-filter +
                       toggle-group multiple facets (status)
    pagination footer  the pagination family over the page slice +
                       a page-size Select
    row selection      checkbox column, header select-all with the
                       indeterminate law, live count readout
    row actions        dropdown-menu column (duplicate / delete)
    column visibility  popover + checkboxes hiding optional columns

  The table component itself owns ONLY the frame (registry law), so
  this fixture pins the COMPOSITION contract: state machines the page
  authors, expressed through public component behavior.
-->
<script lang="ts">
  import Checkbox from '../../src/lib/ui/checkbox/checkbox.svelte';
  import DropdownMenu from '../../src/lib/ui/dropdown-menu/dropdown-menu.svelte';
  import DropdownMenuItem from '../../src/lib/ui/dropdown-menu/dropdown-menu-item.svelte';
  import Input from '../../src/lib/ui/input/input.svelte';
  import Pagination from '../../src/lib/ui/pagination/pagination.svelte';
  import PaginationContent from '../../src/lib/ui/pagination/pagination-content.svelte';
  import PaginationItem from '../../src/lib/ui/pagination/pagination-item.svelte';
  import PaginationLink from '../../src/lib/ui/pagination/pagination-link.svelte';
  import PaginationPrevious from '../../src/lib/ui/pagination/pagination-previous.svelte';
  import PaginationNext from '../../src/lib/ui/pagination/pagination-next.svelte';
  import PaginationEllipsis from '../../src/lib/ui/pagination/pagination-ellipsis.svelte';
  import { pageRange } from '../../src/lib/ui/pagination/pagination-range';
  import Popover from '../../src/lib/ui/popover/popover.svelte';
  import PressButton from '../../src/lib/ui/press-button/press-button.svelte';
  import Select from '../../src/lib/ui/select/select.svelte';
  import Table from '../../src/lib/ui/table/table.svelte';
  import ToggleGroup from '../../src/lib/ui/toggle-group/toggle-group.svelte';
  import ToggleGroupItem from '../../src/lib/ui/toggle-group/toggle-group-item.svelte';

  interface Task {
    id: string;
    title: string;
    status: string;
    priority: string;
  }

  const seed: Task[] = [
    { id: 'T-101', title: 'harden install integrity', status: 'in review', priority: 'high' },
    { id: 'T-102', title: 'mirror manifest re-record', status: 'active', priority: 'medium' },
    { id: 'T-103', title: 'container-query card law', status: 'done', priority: 'low' },
    { id: 'T-104', title: 'anchor lease restore', status: 'backlog', priority: 'urgent' },
    { id: 'T-105', title: 'facet filter row', status: 'in review', priority: 'medium' },
    { id: 'T-106', title: 'select-all indeterminate', status: 'active', priority: 'high' },
    { id: 'T-107', title: 'countdown ticks', status: 'backlog', priority: 'low' },
  ];
  const statuses = ['backlog', 'active', 'in review', 'done'] as const;

  let rows = $state<Task[]>([...seed]);
  let lastAction = $state('');

  // ---- sortable headers: single-column state, asc → desc → clear ------
  type SortDir = 'asc' | 'desc';
  let sortKey = $state<'title' | 'status' | null>(null);
  let sortDir = $state<SortDir>('asc');
  function toggleSort(key: 'title' | 'status'): void {
    if (sortKey !== key) {
      sortKey = key;
      sortDir = 'asc';
      return;
    }
    if (sortDir === 'asc') {
      sortDir = 'desc';
      return;
    }
    sortKey = null; // the third press clears the sort
  }
  function ariaSort(key: 'title' | 'status'): 'ascending' | 'descending' | undefined {
    return sortKey === key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined;
  }

  // ---- filter row: text contains + faceted status (toggle-group) -------
  let titleFilter = $state('');
  let statusFacets = $state<string[]>([]);
  const filtered = $derived.by(() => {
    const matching = rows.filter(
      (row) =>
        (titleFilter === '' || row.title.toLowerCase().includes(titleFilter.toLowerCase())) &&
        (statusFacets.length === 0 || statusFacets.includes(row.status)),
    );
    if (sortKey === null) return matching;
    const factor = sortDir === 'asc' ? 1 : -1;
    return [...matching].sort((a, b) =>
      factor * String(a[sortKey]).localeCompare(String(b[sortKey])),
    );
  });

  // ---- pagination footer: slice + page-size select ---------------------
  const pageSizeOptions = [5, 7].map((size) => ({ value: String(size), label: `${size} rows` }));
  let pageSize = $state('5');
  const pageSizeNumber = $derived(Number(pageSize));
  const pageCount = $derived(Math.max(1, Math.ceil(filtered.length / pageSizeNumber)));
  let pageIndex = $state(0);
  const pageRows = $derived(filtered.slice(pageIndex * pageSizeNumber, (pageIndex + 1) * pageSizeNumber));

  // ---- row selection: checkbox column + the select-all law ------------
  let selected = $state<Set<string>>(new Set());
  const pageIds = $derived(pageRows.map((row) => row.id));
  const allOnPage = $derived(pageIds.length > 0 && pageIds.every((id) => selected.has(id)));
  const someOnPage = $derived(pageIds.some((id) => selected.has(id)) && !allOnPage);
  function toggleRow(id: string): void {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    selected = next;
  }
  function toggleAll(): void {
    const next = new Set(selected);
    if (allOnPage) pageIds.forEach((id) => next.delete(id));
    else pageIds.forEach((id) => next.add(id));
    selected = next;
  }

  // ---- column visibility popover ---------------------------------------
  let priorityVisible = $state(true);

  // ---- row actions: dropdown-menu column --------------------------------
  function duplicate(row: Task): void {
    const index = rows.findIndex((candidate) => candidate.id === row.id);
    const copy: Task = { ...row, id: `${row.id}·2` };
    rows = [...rows.slice(0, index + 1), copy, ...rows.slice(index + 1)];
    lastAction = `duplicate ${row.id}`;
  }
  function remove(row: Task): void {
    rows = rows.filter((candidate) => candidate.id !== row.id);
    const next = new Set(selected);
    next.delete(row.id);
    selected = next;
    lastAction = `delete ${row.id}`;
  }
</script>

<div data-tasks-host data-last-action={lastAction} data-selected-count={selected.size}>
  <Table caption="tasks — the composed surface" stack={false}>
    <thead>
      <tr>
        <th scope="col" data-column="select">
          <Checkbox
            checked={allOnPage}
            indeterminate={someOnPage}
            aria-label="select all rows on this page"
            onchange={toggleAll}
          />
        </th>
        <th scope="col" data-column="title" aria-sort={ariaSort('title')}>
          <PressButton variant="ghost" ariaLabel="sort by title" onclick={() => toggleSort('title')}>
            title
            <span data-sort-caret data-sort-key="title" aria-hidden="true">
              {sortKey === 'title' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
            </span>
          </PressButton>
        </th>
        <th scope="col" data-column="status" aria-sort={ariaSort('status')}>
          <PressButton variant="ghost" ariaLabel="sort by status" onclick={() => toggleSort('status')}>
            status
            <span data-sort-caret data-sort-key="status" aria-hidden="true">
              {sortKey === 'status' ? (sortDir === 'asc' ? '▲' : '▼') : '↕'}
            </span>
          </PressButton>
        </th>
        {#if priorityVisible}
          <th scope="col" data-column="priority">priority</th>
        {/if}
        <th scope="col" data-column="actions"><span class="sr-only">actions</span></th>
      </tr>
      <tr data-filter-row>
        <th scope="col"><span class="sr-only">filters</span></th>
        <th scope="col">
          <Input
            type="search"
            bind:value={titleFilter}
            aria-label="filter by title"
            placeholder="contains…"
          />
        </th>
        <th scope="col">
          <ToggleGroup name="status-facets" type="multiple" label="filter by status" bind:value={statusFacets}>
            {#each statuses as status (status)}
              <ToggleGroupItem value={status}>{status}</ToggleGroupItem>
            {/each}
          </ToggleGroup>
        </th>
        <th scope="col" colspan={priorityVisible ? 2 : 1}><span class="sr-only">no filter</span></th>
      </tr>
    </thead>
    <tbody>
      {#each pageRows as row (row.id)}
        <tr>
          <td data-column="select">
            <Checkbox
              checked={selected.has(row.id)}
              aria-label={`select ${row.id}`}
              onchange={() => toggleRow(row.id)}
            />
          </td>
          <td data-column="title">{row.title}</td>
          <td data-column="status">{row.status}</td>
          {#if priorityVisible}
            <td data-column="priority">{row.priority}</td>
          {/if}
          <td data-column="actions">
            <DropdownMenu id={`row-menu-${row.id}`} placement="bottom-end">
              {#snippet trigger()}
                <button
                  type="button"
                  popovertarget={`row-menu-${row.id}`}
                  aria-label={`actions for ${row.id}`}
                  class="cursor-pointer appearance-none border border-border bg-background px-2 py-1 text-xs"
                >
                  ⋯
                </button>
              {/snippet}
              <DropdownMenuItem onclick={() => duplicate(row)}>Duplicate</DropdownMenuItem>
              <hr />
              <DropdownMenuItem destructive onclick={() => remove(row)}>Delete</DropdownMenuItem>
            </DropdownMenu>
          </td>
        </tr>
      {/each}
    </tbody>
  </Table>

  <p data-selection-readout aria-live="polite">
    {selected.size} of {rows.length} selected
  </p>

  <div data-toolbar>
    <Popover id="tasks-columns" triggerLabel="columns">
      <Checkbox
        label="priority"
        checked={priorityVisible}
        onchange={() => (priorityVisible = !priorityVisible)}
      />
    </Popover>
  </div>

  <div data-pagination-footer>
    <Select options={pageSizeOptions} bind:value={pageSize} aria-label="rows per page" />
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
              <PaginationLink
                page={item}
                isActive={item === pageIndex + 1}
                onclick={() => (pageIndex = item - 1)}
              />
            </PaginationItem>
          {/if}
        {/each}
        <PaginationItem>
          <PaginationNext onclick={() => (pageIndex = Math.min(pageCount - 1, pageIndex + 1))} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
    <span data-page-readout class="text-xs text-muted-foreground">
      page {pageIndex + 1} / {pageCount} · {pageRows.length} rows
    </span>
  </div>
</div>
