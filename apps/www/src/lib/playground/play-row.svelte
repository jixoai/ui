<!--
  PlayRow — the standard playground control row: an Item composition
  (ItemContent/ItemTitle carries the label, ItemActions carries the
  control). Provides the FIELD CONTEXT (row id via svelte context) so
  leaf controls wire aria-labelledby without page plumbing (Codex D3).
-->
<script lang="ts">
  import { getContext, setContext } from 'svelte';
  import type { Snippet } from 'svelte';
  import { Item, ItemContent, ItemTitle, ItemDescription, ItemEnd, ItemActions } from '$lib/ui/list-item';

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

  setContext('jx-play-row', { rowId, label });
</script>

<Item variant="outline" size="sm" class="jx-play-row">
  <ItemContent>
    <ItemTitle as="span" class="font-nav text-[11px] uppercase tracking-[0.08em]" id={rowId}>{label}</ItemTitle>
    {#if hint}
      <ItemDescription>{hint}</ItemDescription>
    {/if}
  </ItemContent>
  <ItemEnd>
    <ItemActions>
      {@render children()}
    </ItemActions>
  </ItemEnd>
</Item>
