<!--
  jixoai ItemGroup (registry/files/ui/list-item/item-group.svelte).
  The surface owner (openspec list-item-systemization design §1–§2):
  a <section|div> frame around a native <ul>. Owns mode/inset/dividers
  paint, density + layout defaults, the optional accessible label,
  and the TYPED POLICY context Items resolve against — stable object
  identity, getter-backed reactive fields, Symbol key (never the old
  boolean).

  DOM law: the frame keeps data-mode/inset/size/layout; data-dividers
  lives ONLY on the <ul> — it owns row adjacency, so the divider
  selectors never reach through the frame.
-->
<script module lang="ts">
  /** the typed policy seam: Items read size/layout defaults from the
      nearest group (nested groups shadow outer ones — context law) */
  export const ITEM_GROUP_KEY = Symbol('jx-item-group');

  export interface ItemGroupPolicy {
    readonly size: ItemSize;
    readonly layout: ItemGroupLayout;
  }

  export type ItemSize = 'default' | 'sm' | 'xs';
  export type ItemGroupMode = 'default' | 'muted' | 'plain';
  export type ItemGroupLayout = 'standard' | 'media';
</script>

<script lang="ts">
  import { setContext } from 'svelte';
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import './item.css';

  interface Props extends HTMLAttributes<HTMLElement> {
    /** frame posture: default (border+dividers) · muted (slab, no
        dividers ever) · plain (host owns the surface) */
    mode?: ItemGroupMode;
    /** fixed 0.75rem inline margins — boolean only, no responsive
        enum (a container cannot query its own width) */
    inset?: boolean;
    /** density default for auto rows + the list rhythm */
    size?: ItemSize;
    layout?: ItemGroupLayout;
    /** OPTIONAL raw prop — omission must stay distinguishable:
        default-mode ?? 'auto', plain ?? 'none', muted forced 'none' */
    dividers?: 'auto' | 'none';
    /** renders the frame as <section aria-labelledby> + visible label
        outside the list */
    label?: string;
    id?: string;
    class?: string;
    children: Snippet;
  }

  // $props.id() must live in its own top-level initializer (compiler law)
  const autoId = $props.id();

  let {
    mode = 'default',
    inset = false,
    size = 'default',
    layout = 'standard',
    dividers,
    label,
    id,
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  const labelId = $derived(`${id ?? autoId}-label`);
  const resolvedDividers = $derived(
    mode === 'muted' ? 'none' : (dividers ?? (mode === 'plain' ? 'none' : 'auto')),
  );

  setContext(ITEM_GROUP_KEY, {
    get size() {
      return size;
    },
    get layout() {
      return layout;
    },
  } satisfies ItemGroupPolicy);
</script>

<svelte:element
  this={label ? 'section' : 'div'}
  {...rest}
  id={id}
  data-slot="item-group"
  data-mode={mode}
  data-inset={inset ? 'true' : undefined}
  data-size={size}
  data-layout={layout}
  class={cn('jx-item-group', className)}
  aria-labelledby={label ? labelId : undefined}
>
  {#if label}
    <div class="jx-item-group-label" id={labelId}>{label}</div>
  {/if}
  <ul data-slot="item-list" role="list" data-dividers={resolvedDividers} data-size={size}>
    {@render children()}
  </ul>
</svelte:element>
