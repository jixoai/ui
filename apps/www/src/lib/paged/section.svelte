<!--
  jixoai PagedSection (paged-doc-family) — one numbered section of the
  publication document.

  Registers itself into the doc's numbering registry SYNCHRONOUSLY at
  initialization (document order = DOM order = CSS counter order);
  unregisters on destroy, so conditional inserts and keyed reorders
  renumber correctly. The visible number is the CSS counter; the
  registry feeds PagedRef / PagedToC.

  break="auto|section|avoid|page" maps the synthesis §2 ladder:
    auto    UA default (heading avoid-after still applies)
    section this section opens a page — except the first child
    avoid   keep the whole section unsplit
    page    unconditional page break before
  The heading-keeper packs the heading + optional lede snippet as one
  unbreakable unit — a section never strands its title at a page foot.
-->
<script lang="ts">
  import type { Snippet } from 'svelte';
  import { onDestroy } from 'svelte';
  import { getPagedDoc } from './registry.svelte';

  interface Props {
    /** the section title (rendered as the heading; the ToC label) */
    title: string;
    /** the stable address — ToC links and PagedRef targets; an
        id-less section still numbers but cannot be referenced */
    id?: string;
    break?: 'auto' | 'section' | 'avoid' | 'page';
    /** heading level (2 default; nested sections may use 3) */
    level?: 2 | 3;
    /** the opening standfirst, kept inside the heading keeper */
    lede?: Snippet;
    class?: string;
    children: Snippet;
  }

  let {
    title,
    id,
    break: breakProp = 'auto',
    level = 2,
    lede,
    class: className = '',
    children,
  }: Props = $props();

  const doc = getPagedDoc();
  let sectionEl = $state<HTMLElement | undefined>(undefined);
  // synchronous registration — SSR-executed, document order; the
  // element getter lets the registry resync to live DOM moves
  // (registration is a mount-time contract by the family-context
  // law — prop identity is deliberately captured once)
  // svelte-ignore state_referenced_locally
  const unregister = doc?.register({
    group: 'sec',
    id,
    label: title,
    level,
    element: () => sectionEl,
  });
  onDestroy(() => unregister?.());

  const headingId = $derived(id ? `${id}-heading` : undefined);
  const headingTag = $derived(level === 3 ? 'h3' : 'h2');
</script>

<section bind:this={sectionEl} data-jx-paged-section data-break={breakProp} id={id} aria-labelledby={headingId} class={className}>
  <div data-jx-paged-keeper>
    <svelte:element this={headingTag} data-jx-paged-heading id={headingId}>{title}</svelte:element>
    {#if lede}
      <p data-jx-paged-lede>{@render lede()}</p>
    {/if}
  </div>
  {@render children()}
</section>
