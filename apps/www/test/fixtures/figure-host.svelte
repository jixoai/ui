<!--
  The figure test host (document-ontology R2 batch 2.3) — the rig
  behind test/figure.spec.ts.

  ROOT MODE (no spec prop): wraps everything in the real page provider
  (targets + domains registries + the document-level observer) and
  mounts a bare zone (figures OUTSIDE every domain — the escape case)
  plus a forest of self-recursive domain nodes.

  DOMAIN-NODE MODE (spec present): creates a REAL NumberingDomain at
  init — setContext runs before its children mount, so nesting picks
  the nearest domain — keeps a root SectionRecord (domainOrdinal
  orders top-level domains by that record's element), attaches the
  root at bind:this time, and renders its figures as a KEYED each so
  the order prop reorders with instance identity kept (the
  display-currency rig; an unmount/remount swap is the weak fixture
  the design bans).
-->
<script module lang="ts">
  import type { FigureKind } from '../../src/lib/ui/figure/numbering.svelte';

  export type HostFloatScope = Partial<Record<FigureKind, 'chapter' | 'document'>>;

  export interface HostFigureSpec {
    /** the keyed identity — stable across order rewrites */
    key: string;
    kind: FigureKind;
    id?: string;
    caption?: string;
    citedIn?: string[];
    /** render an EMPTY content slot (the author-error warn case) */
    empty?: boolean;
  }

  export interface HostDomainSpec {
    floatScope?: HostFloatScope;
    figures?: HostFigureSpec[];
    nested?: HostDomainSpec[];
  }
</script>

<!-- spec/parent are read at init on purpose: a domain node IS its
     spec (remount, never mutate) — the fixture side of the same law -->
<!-- svelte-ignore state_referenced_locally -->
<script lang="ts">
  import { setContext } from 'svelte';
  import NumberingProvider from '../../src/lib/ui/figure/numbering-provider.svelte';
  import Figure from '../../src/lib/ui/figure/figure.svelte';
  import Self from './figure-host.svelte';
  import {
    NUMBERING_DOMAIN_KEY,
    createNumberingDomain,
    domainRegistryFromContext,
    targetRegistryFromContext,
    type NumberingDomain,
  } from '../../src/lib/ui/figure/numbering.svelte';

  let {
    /** root mode: the top-level domain forest */
    domains = [],
    /** root mode: figures outside every domain (the bare case) */
    bare = [],
    /** figure-key order — reorders the keyed eaches, identity kept */
    order = [],
    /** node mode: present = this instance IS one domain node */
    spec,
    /** node mode: the enclosing domain (null = a top-level node) */
    parent = null,
  }: {
    domains?: HostDomainSpec[];
    bare?: HostFigureSpec[];
    order?: string[];
    spec?: HostDomainSpec;
    parent?: NumberingDomain | null;
  } = $props();

  const isNode = spec !== undefined;
  const domain = isNode ? createNumberingDomain({ parent, floatScope: spec!.floatScope }) : undefined;
  let rootEl: Element | undefined = $state();

  if (domain) {
    setContext(NUMBERING_DOMAIN_KEY, domain);
    const registry = domainRegistryFromContext();
    const unregisterDomain = registry?.registerDomain(domain);
    // the root SectionRecord: domainOrdinal orders top-level domains
    // by this record's element (the el backfills at bind:this time)
    const rootRec: { el?: Element; parent: null } = { parent: null };
    const unregisterRoot = domain.registerSection(rootRec);

    $effect(() => {
      if (rootEl) {
        rootRec.el = rootEl;
        domain.attachRoot(rootEl);
      }
      return () => {
        unregisterRoot();
        unregisterDomain?.();
        domain.dispose();
      };
    });

    // fixture plumbing (the provider-probe precedent): expose the live
    // target registry for register/thunk assertions — never a
    // component API
    (globalThis as Record<string, unknown>).__figureHostTargets = targetRegistryFromContext();
  }

  const orderedFigures = $derived.by(() => {
    const list = [...(spec?.figures ?? [])];
    if (order.length === 0) return list;
    const at = (key: string) => {
      const i = order.indexOf(key);
      return i === -1 ? Number.POSITIVE_INFINITY : i;
    };
    return list.sort((a, b) => at(a.key) - at(b.key));
  });
</script>

{#if isNode}
  <section bind:this={rootEl} data-domain-root>
    {#each orderedFigures as fig (fig.key)}
      <Figure kind={fig.kind} id={fig.id} caption={fig.caption} citedIn={fig.citedIn}>
        {#if !fig.empty}<div data-content={fig.key}>{fig.key}</div>{/if}
      </Figure>
    {/each}
    {#each spec!.nested ?? [] as child}
      <Self spec={child} parent={domain!} {order} />
    {/each}
  </section>
{:else}
  <NumberingProvider>
    <div data-figure-host>
      {#each domains as d}
        <Self spec={d} parent={null} {order} />
      {/each}
      {#if bare.length > 0}
        <div data-bare-zone>
          {#each bare as fig (fig.key)}
            <Figure kind={fig.kind} id={fig.id} caption={fig.caption} citedIn={fig.citedIn}>
              {#if !fig.empty}<div data-content={fig.key}>{fig.key}</div>{/if}
            </Figure>
          {/each}
        </div>
      {/if}
    </div>
  </NumberingProvider>
{/if}
