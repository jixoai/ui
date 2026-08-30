<!--
  jixoai PagedRef (paged-doc-family) — a cross reference.

  Renders the REGISTRY number of the target entry (the display
  currency of document order): §N for sections, "Figure N" / "Note N"
  for the other counter groups. The link anchors at the target's
  stable id — web mode scrolls; the PDF anchor is best-effort (not a
  contract clause). An unresolved target renders an honest §? and
  warns once in dev.
-->
<script lang="ts">
  import { getPagedDoc, type PagedCounterGroup } from './registry.svelte';

  interface Props {
    /** the target entry's stable id */
    target: string;
    class?: string;
  }

  let { target, class: className = '' }: Props = $props();

  const doc = getPagedDoc();
  const entry = $derived(doc?.entries.find((e) => e.id === target));
  const number = $derived(doc?.numberFor(target));

  const PREFIX: Record<PagedCounterGroup, string> = {
    sec: '§',
    fig: 'Figure ',
    note: 'Note ',
  };
  const prefix = $derived(entry ? PREFIX[entry.group] : '§');

  $effect(() => {
    if (entry === undefined && import.meta.env.DEV) {
      console.warn(`[PagedRef] target "${target}" is not a registered id — rendering §?`);
    }
  });
</script>

{#if number !== undefined}
  <a data-jx-paged-ref href={`#${target}`} class={className}>{prefix}{number}</a>
{:else}
  <a data-jx-paged-ref data-resolved="false" href={`#${target}`} class={className} title={`unresolved reference: ${target}`}>{prefix}?</a>
{/if}
