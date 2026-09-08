<!--
  PlayRow — the standard playground control row, bridged onto
  ItemField (openspec list-item-systemization task 4): the field owns
  the label/description/error scaffold; leaf controls keep wiring
  through the jx-play-row field context (Codex D3 contract unchanged —
  context.rowId now carries the REAL label node id, so every
  aria-labelledby resolves).

  Kit unification (canvas-playground-dock, 2026-09-08): inside
  PlayFields' integrated ItemGroup the row's Item shell resolves
  variant AUTO and dissolves (chrome none — the group frame is the
  sole surface owner, the B5 posture; the old explicit outline variant
  died with the pane era). The dead `size` passthrough is gone too
  (ItemField never had that prop — density rides the ambient scope).
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

<ItemField id={rowId} labelMode="text" {label} description={hint} class="jx-play-row">
  {#snippet control()}
    {@render children()}
  {/snippet}
</ItemField>
