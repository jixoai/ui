<!--
  jixoai Item root (registry/files/ui/list-item/item.svelte).
  The GRID row (openspec list-item-systemization design §1–§2).

  Auto-variant law: variant 'auto' (default) resolves chrome from the
  typed group policy — standalone rows carry their own surface
  (data-item-chrome="surface"), grouped rows yield it to the group
  ("none"). Explicit variant always wins. Resolution is a pure
  function of (current item props, current group policy) — reactive
  after mount, deterministic for SSR.

  DOM law: standalone renders its <a>/<div> root directly; inside an
  ItemGroup the row is wrapped in <li data-slot="item-row"> so native
  list semantics and link semantics coexist. NO asChild: Item is a
  layout container; button-like behavior belongs in ItemActions.
-->
<script lang="ts">
  import { getContext } from 'svelte';
  import type { Snippet } from 'svelte';
  import type { HTMLAnchorAttributes } from 'svelte/elements';
  import { cn } from '$lib/utils';
  import { ITEM_GROUP_KEY, type ItemGroupPolicy } from './item-group.svelte';
  import { resolveDensity, getDensityContext, type Density } from '$lib/density.svelte';
  import './item.css';

  type ItemLayout = 'auto' | 'standard' | 'media';

  interface Props extends Omit<HTMLAnchorAttributes, 'class'> {
    /** visual variant (geometry-neutral): auto | default | outline | muted */
    variant?: 'auto' | 'default' | 'outline' | 'muted';
    /** DENSITY override: omitted = nearest provider, then 'default' */
    size?: Density;
    /** row layout: 'auto' inherits the group's, else standard */
    layout?: ItemLayout;
    /** visual selection state ONLY — never emits aria-selected */
    selected?: boolean;
    /** renders the root as an anchor (link rows carry their own hover law) */
    href?: string;
    class?: string;
    children: Snippet;
  }

  let {
    variant = 'auto',
    size,
    'data-density': _callerDensity,
    layout = 'auto',
    selected = false,
    href,
    class: className = '',
    children,
    ...rest
  }: Props = $props();

  const policy = getContext<ItemGroupPolicy | undefined>(ITEM_GROUP_KEY);
  const outerDensity = getDensityContext();

  // explicit 'default' normalizes to chrome 'none' (the transparent
  // escape hatch) — data-item-chrome never leaves its closed union
  const chrome = $derived(
    variant === 'auto' ? (policy ? 'none' : 'surface') : variant === 'default' ? 'none' : variant,
  );
  const resolvedSize: Density = $derived(resolveDensity(size, outerDensity));
  const resolvedLayout = $derived(layout === 'auto' ? (policy?.layout ?? 'standard') : layout);
  const klass = $derived(cn('jx-item', className));
</script>

{#snippet row()}
  <svelte:element
    this={href ? 'a' : 'div'}
    {href}
    {...rest}
    data-slot="item"
    data-variant={variant}
    data-item-chrome={chrome}
    data-density={resolvedSize}
    data-layout={resolvedLayout}
    data-selected={selected ? 'true' : undefined}
    class={klass}
  >
    {@render children()}
  </svelte:element>
{/snippet}

{#if policy}
  <li data-slot="item-row">{@render row()}</li>
{:else}
  {@render row()}
{/if}
