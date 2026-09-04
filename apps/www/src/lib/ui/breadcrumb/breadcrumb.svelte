<!--
  jixoai Breadcrumb root (registry/files/ui/breadcrumb/breadcrumb.svelte,
  composition-first, 2026-08-25).
  W3C-first: a breadcrumb trail is a nav landmark wrapping an ordered
  list of ordinary links — the entire ARIA story is nav[aria-label] +
  ol + a[aria-current="page"]. No microdata obligations, no roles to
  maintain; the ol's order IS the hierarchy.

  The root owns NOTHING but the landmark (composition-first: the old
  closed `crumbs[]` data prop died). The trail is authored as parts —

    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem><BreadcrumbLink href="/">root</BreadcrumbLink></BreadcrumbItem>
        <BreadcrumbItem><BreadcrumbSeparator /></BreadcrumbItem>
        <BreadcrumbItem><BreadcrumbPage href="/leaf">leaf</BreadcrumbPage></BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

  Long trails opt into the fold by wrapping the middle items in
  <BreadcrumbCollapse> (no width magic here, no collapse prop — the
  nesting IS the decision).
  (props-discipline sweep, 2026-08-25)
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { HTMLAttributes } from 'svelte/elements';
  import { provideDensity, resolveDensity, getDensityContext, type Density } from '$lib/density.svelte';
  import { cn } from '$lib/utils';
  import { BreadcrumbDefaults } from './breadcrumb-defaults.svelte';

  interface Props extends HTMLAttributes<HTMLElement> {
    density?: Density;
    /** nav landmark label (announced before the trail) */
    label?: string;
    class?: string;
    children: Snippet;
  }

  let { label = 'Breadcrumb', density, class: className = '', children, ...rest }: Props = $props();

  // ---- the density lane: inherit-then-provide, boundary-legal ------
  // The CAPTURE is load-bearing and EAGER (r11 first contract,
  // context-defaults-economy 3.3): getDensityContext() rides the
  // $derived.by ARGUMENT subtree, which evaluates at this statement —
  // BEFORE provideDensity writes the key — so it captures the PARENT's
  // context object; a lazily-evaluated read would resolve the key to
  // the trail's OWN write and self-reference through the very getter it
  // feeds (derived_references_self — the pre-3.3 bare capture this
  // replaces). The returned getter reads ONLY the captured object
  const resolvedDensity = $derived.by(
    ((inherited) => () => resolveDensity(density, inherited))(getDensityContext()),
  );
  provideDensity(() => resolvedDensity);

  // THE DEFAULTS READ POINT (context-defaults-economy 3.3), riding ON
  // TOP of the provider lane as the family's single audited read point:
  // the density slot's ambient read resolves the key to the trail's own
  // write, whose getter is the captured-parent resolution above, so the
  // chain TERMINATES (it never re-enters this derived)
  const d = $derived(BreadcrumbDefaults.resolve({ density }));
</script>

<nav data-jx-breadcrumb="" class={cn(className)} {...rest} data-density={d.density} aria-label={label}>
  {@render children()}
</nav>
