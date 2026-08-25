<!--
  jixoai Item root (registry/files/ui/list-item/item.svelte, 2026-08-25).
  The slot-composition list row (shadcn Item philosophy, Codex D1
  ruling) on GRID with a :has()-driven presence matrix — see item.css.
  ItemContent is the required slot; media/actions/header/footer are
  optional and their presence rewrites the template.

  Root is <a> when href is given, <div> otherwise — NO asChild: Item is
  a layout container, not a generic interactive wrapper; button-like
  behavior belongs in ItemActions.
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import type { Snippet } from 'svelte';
  import { cn } from '$lib/utils';
  import './item.css';

  interface Props {
    /** visual variant (geometry-neutral): default | outline | muted */
    variant?: 'default' | 'outline' | 'muted';
    /** density: default | sm | xs */
    size?: 'default' | 'sm' | 'xs';
    /** renders the root as an anchor (link items carry their own hover law) */
    href?: string;
    class?: string;
    children: Snippet;
  }

  let {
    variant = 'default',
    size = 'default',
    href,
    class: className = '',
    children,
  }: Props = $props();

  // inside an ItemGroup the row IS a listitem (role=list requires
  // listitem children); standalone items stay unroled
  const inGroup = getContext('jx-item-group') === true;
  // $derived, not const: class must stay reactive (the stale-prop
  // warning Codex flagged — a captured initial class silently rots)
  const klass = $derived(cn('jx-item', className));
</script>

{#if href}
  <a data-slot="item" {href} role={inGroup ? 'listitem' : undefined} data-variant={variant} data-size={size} class={klass}>{@render children()}</a>
{:else}
  <div data-slot="item" role={inGroup ? 'listitem' : undefined} data-variant={variant} data-size={size} class={klass}>{@render children()}</div>
{/if}
