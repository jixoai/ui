<!--
  PlayRow — the standard playground control row, bridged onto
  ItemField (openspec list-item-systemization task 4): the field owns
  the label/description/error scaffold; leaf controls keep wiring
  through the jx-play-row field context (Codex D3 contract unchanged —
  context.rowId now carries the REAL label node id, so every
  aria-labelledby resolves).
-->
<script lang="ts">
  import { getContext, setContext } from 'svelte';
  import type { Snippet } from 'svelte';
  import { ItemField } from '$lib/ui/list-item';

  let {
    label,
    hint = '',
    children,
  }: {
    /** the control's name — becomes the field's accessible name */
    label: string;
    /** optional one-line muted qualifier under the label */
    hint?: string;
    children: Snippet;
  } = $props();

  let uid = getContext<{ seq: number }>('jx-play-uid');
  const rowId = `jx-play-row-${++uid.seq}`;

  // text mode: naming rides aria-labelledby — the leaf controls
  // self-wire through this context; the getter keeps `label` reactive
  setContext('jx-play-row', {
    rowId: `${rowId}-label`,
    get label() {
      return label;
    },
  });
</script>

<ItemField id={rowId} labelMode="text" {label} description={hint} variant="outline" size="sm" class="jx-play-row">
  {#snippet control()}
    {@render children()}
  {/snippet}
</ItemField>
