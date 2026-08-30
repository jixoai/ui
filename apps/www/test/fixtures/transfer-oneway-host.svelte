<!--
  Test host for the transfer one-way + batch select-all recipes (openspec
  2026-08-30-table-grid-toolbar).

  oneWay (antd parity): the component has no oneWay prop — the recipe
  composes the public value/onchange seam into a forward-only mover: a
  next list SHORTER than the committed list is a removal attempt and is
  rejected (the committed value never shrinks).

  batch select-all: no in-panel header checkbox exists — the recipe
  composes external batch controls over the same value binding
  ("select all → move" commits every enabled option at once).
-->
<script lang="ts">
  import PressButton from '../../src/lib/ui/press-button/press-button.svelte';
  import Transfer from '../../src/lib/ui/transfer/transfer.svelte';

  const options = [
    { value: 'a', label: 'alpha' },
    { value: 'b', label: 'beta' },
    { value: 'c', label: 'gamma' },
    { value: 'd', label: 'delta', disabled: true },
    { value: 'e', label: 'epsilon' },
  ];

  // oneWay law: additions commit, removals bounce
  let committed = $state<string[]>([]);
  let rejected = $state(0);
  function guard(next: string[]): void {
    if (next.length >= committed.length) {
      committed = next;
    } else {
      rejected += 1;
    }
  }

  // batch select-all over the same public seam
  function selectAll(): void {
    committed = options.filter((option) => !option.disabled).map((option) => option.value);
  }
  function clearTarget(): void {
    committed = [];
  }
</script>

<div data-transfer-host data-rejected={rejected} data-committed={committed.join(',')}>
  <Transfer {options} value={committed} onchange={guard} sourceTitle="available" targetTitle="assigned" />
  <div data-batch-controls class="mt-4 flex flex-wrap gap-2">
    <PressButton variant="outline" onclick={selectAll}>select all → move</PressButton>
    <PressButton variant="ghost" onclick={clearTarget}>return all</PressButton>
  </div>
</div>
