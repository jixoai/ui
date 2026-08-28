<!--
  jixoai ItemGroup (registry/files/ui/list-item/item-group.svelte).
  The surface owner (design-language-kernel design §2–§3): a
  <section|div> frame around a native <ul>. THE FIRST DENSITY PROVIDER
  — provideDensity (getter-backed) + data-density stamps on frame and
  list; Items resolve their density from here. Owns the explicit RULER
  (content-end default — deliberately media-less; media-content-end
  opts into the shared media track) stamped on the ul, and the divider
  policy (data-dividers lives ONLY on the ul — the adjacency owner).
-->
<script module lang="ts">
  import type { Density, DensityContext } from '$lib/density.svelte';

  export const ITEM_GROUP_KEY = Symbol('jx-item-group');

  export type ItemGroupMode = 'default' | 'muted' | 'plain';
  export type ItemGroupLayout = 'standard' | 'media';
  export type ItemRuler = 'content-end' | 'media-content-end';

  export interface ItemGroupPolicy extends DensityContext {
    readonly layout: ItemGroupLayout;
    readonly ruler: ItemRuler;
  }
</script>

<script lang="ts">
  import { setContext } from 'svelte';
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import { provideDensity, resolveDensity, getDensityContext } from '$lib/density.svelte';
  import './item.css';

  interface Props extends HTMLAttributes<HTMLElement> {
    /** frame posture: default (border+dividers) · muted (slab) · plain (host surface) */
    mode?: ItemGroupMode;
    /** fixed 0.75rem inline margins — boolean only */
    inset?: boolean;
    /** DENSITY opinion: omitted = ambient css scope, then 'default' */
    density?: Density;
    layout?: ItemGroupLayout;
    /** the shared ruler: content-end (media-less, default) | media-content-end */
    ruler?: ItemRuler;
    /** OPTIONAL raw prop — omission stays distinguishable:
        default-mode ?? 'auto', plain ?? 'none', muted forced 'none' */
    dividers?: 'auto' | 'none';
    /** renders the frame as <section aria-labelledby> + visible label */
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
    density,
    layout = 'standard',
    ruler = 'content-end',
    dividers,
    label,
    id,
    class: className = '',
    children,
    // component-owned stamps: the caller cannot forge density or the
    // ul-only divider stamp on the frame
    'data-density': _callerDensity,
    'data-dividers': _callerDividers,
    ...rest
  }: Props = $props();

  const outerDensity = getDensityContext();
  const resolved = $derived(resolveDensity(density, outerDensity));
  provideDensity(() => resolved);

  const labelId = $derived(`${id ?? autoId}-label`);
  const resolvedDividers = $derived(
    mode === 'muted' ? 'none' : (dividers ?? (mode === 'plain' ? 'none' : 'auto')),
  );

  setContext(ITEM_GROUP_KEY, {
    get density() {
      return resolved;
    },
    get layout() {
      return layout;
    },
    get ruler() {
      return ruler;
    },
  } satisfies ItemGroupPolicy);
</script>

<svelte:element
  this={label ? 'section' : 'div'}
  {...rest}
  id={id}
  data-slot="item-group"
  data-density={resolved}
  data-mode={mode}
  data-inset={inset ? 'true' : undefined}
  data-layout={layout}
  class={cn('jx-item-group', className)}
  aria-labelledby={label ? labelId : undefined}
>
  {#if label}
    <div class="jx-item-group-label" id={labelId}>{label}</div>
  {/if}
  <ul
    data-slot="item-list"
    role="list"
    data-density={resolved}
    data-ruler={ruler}
    data-dividers={resolvedDividers}
  >
    {@render children()}
  </ul>
</svelte:element>
