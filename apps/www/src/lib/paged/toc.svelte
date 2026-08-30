<!--
  jixoai PagedToC (paged-doc-family) — the publication table of contents.

  Lists the id-bearing sections of the nearest PagedDoc, numbered from
  the registry in document order. Web mode: plain anchor links (the
  page scrolls). Print: the SECTION NUMBERS stand in for page numbers
  — the native engine has no page feedback (synthesis §5); inserting
  a section shifts later numbers, stable addressing rides the ids.

  The DOM-derived AUTO-mode exception applies: the landmark shell
  renders server-side; the entries complete on hydration (later
  sections register after this component's first render — the data
  does not exist at render time).
-->
<script lang="ts">
  import { getPagedDoc } from './registry.svelte';

  interface Props {
    /** the eyebrow label over the list */
    label?: string;
    class?: string;
  }

  let { label = 'contents', class: className = '' }: Props = $props();

  const doc = getPagedDoc();
  const entries = $derived(doc?.tocEntries ?? []);
</script>

<nav data-jx-paged-toc class={className} aria-label={label}>
  <span data-jx-paged-toc-eyebrow>{label}</span>
  {#if entries.length > 0}
    <ul data-jx-paged-toc-list>
      {#each entries as entry (entry.id)}
        <li>
          <a href={`#${entry.id}`}>
            <span data-jx-paged-toc-num>{doc?.numberFor(entry.id ?? '')}</span>
            <span>{entry.label}</span>
          </a>
        </li>
      {/each}
    </ul>
  {:else}
    <!-- hydration completes the listing (the AUTO-mode exception) -->
    <ul data-jx-paged-toc-list aria-hidden="true"></ul>
  {/if}
</nav>
